"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import {
  buildPatientPrompt,
  buildDoctorPrompt,
  generateSimulatedInsight,
  generateSimulatedClinical,
  InsightInput,
  InsightOutput,
  ClinicalOutput,
} from "@/lib/ai-prompt";
import { callGemini } from "@/lib/gemini";

async function callGeminiSafe<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const raw = await callGemini(prompt);
    if (!raw) return fallback;
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as T;
    return parsed;
  } catch (err) {
    console.error("Gemini call failed, using fallback:", err);
    return fallback;
  }
}

/**
 * Generate a new AI Health Insight for the current patient.
 * Calls two prompts in parallel: patient-facing + doctor-clinical.
 */
export async function generateAIInsight() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const patientId = (session.user as any).patientId;
  if (!patientId) return { error: "Patient profile not found." };

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      vitals: { orderBy: { timestamp: "desc" }, take: 1 },
      symptoms: { orderBy: { timestamp: "desc" }, take: 5 },
      healthScores: { orderBy: { timestamp: "desc" }, take: 1 },
      aiDiagnoses: { orderBy: { timestamp: "desc" }, take: 1 },
    },
  });

  if (!patient) return { error: "Patient not found." };

  const age = Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const latestVitals = (patient as any).vitals[0] || null;
  const latestSymptom = (patient as any).symptoms[0] || null;
  const latestScore = (patient as any).healthScores[0] || null;
  const prevDiagnosis = (patient as any).aiDiagnoses[0] || null;

  // Caching: use prevDiagnosis if it is < 10 mins old AND newer than latest vitals/symptoms
  if (prevDiagnosis) {
    const diagTime = new Date(prevDiagnosis.timestamp).getTime();
    const vitalsTime = latestVitals ? new Date(latestVitals.timestamp).getTime() : 0;
    const symptomTime = latestSymptom ? new Date(latestSymptom.timestamp).getTime() : 0;
    
    if (Date.now() - diagTime < 10 * 60 * 1000 && diagTime >= vitalsTime && diagTime >= symptomTime) {
      console.log("Using cached insight (generated < 10 mins ago with no new data) to save quota.");
      return { success: true, diagnosisId: prevDiagnosis.id };
    }
  }

  const insightInput: InsightInput = {
    patient: {
      name: patient.name,
      age,
      gender: patient.gender,
      segment: patient.segment,
      heredity: patient.heredity,
      habits: patient.habits,
      environment: patient.environment,
    },
    latestVitals: latestVitals ? {
      systolicBP: latestVitals.systolicBP,
      diastolicBP: latestVitals.diastolicBP,
      heartRate: latestVitals.heartRate,
      respiratoryRate: latestVitals.respiratoryRate,
      temperature: latestVitals.temperature,
      spo2: latestVitals.spo2,
      glucose: latestVitals.glucose,
      weight: latestVitals.weight,
      height: latestVitals.height,
      bmi: latestVitals.bmi,
    } : null,
    recentSymptoms: (patient as any).symptoms.map((s: any) => ({
      location: s.location,
      intensity: s.intensity,
      description: s.description,
    })),
    currentHealthScore: latestScore ? { score: latestScore.score, status: latestScore.status } : null,
    previousDiagnosis: prevDiagnosis ? {
      healthSummary: prevDiagnosis.healthSummary,
      predictions: prevDiagnosis.predictions,
      alertLevel: prevDiagnosis.alertLevel,
      timestamp: prevDiagnosis.timestamp,
    } : null,
  };

  // Run both AI calls sequentially to avoid concurrent rate limits on the free tier
  const patientResult = await callGeminiSafe<InsightOutput>(buildPatientPrompt(insightInput), generateSimulatedInsight(insightInput));
  const clinicalResult = await callGeminiSafe<ClinicalOutput>(buildDoctorPrompt(insightInput), generateSimulatedClinical(insightInput));

  // Validate patient result
  const result: InsightOutput = (patientResult?.healthSummary && patientResult?.predictions && patientResult?.alertLevel)
    ? patientResult
    : generateSimulatedInsight(insightInput);

  const clinical: ClinicalOutput = (clinicalResult?.clinicalSummary && clinicalResult?.differentialNotes)
    ? clinicalResult
    : generateSimulatedClinical(insightInput);

  const t = await getTranslations("HealthInsights");

  // Save to database
  const diagnosis = await (prisma as any).aIDiagnosis.create({
    data: {
      patientId: patient.id,
      inputData: insightInput as any,
      healthSummary: result.healthSummary,
      predictions: result.predictions as any,
      habitImprovements: result.habitImprovements as any,
      alertLevel: result.alertLevel,
      doctorNote: result.doctorNote,
      clinicalSummary: clinical.clinicalSummary,
      differentialNotes: clinical.differentialNotes as any,
      clinicalFlags: clinical.clinicalFlags as any,
      disclaimer: t("disclaimer"),
      previousDiagnosisId: prevDiagnosis?.id || null,
    },
  });

  return { success: true, diagnosisId: diagnosis.id };
}

/**
 * Get all AI insights for the current patient (patient view — no clinical data).
 */
export async function getPatientInsights() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const patientId = (session.user as any).patientId;
  if (!patientId) return { error: "Patient profile not found." };

  const insights = await (prisma as any).aIDiagnosis.findMany({
    where: { patientId },
    orderBy: { timestamp: "desc" },
  });

  return {
    insights: insights.map((i: any) => ({
      id: i.id,
      timestamp: i.timestamp,
      healthSummary: i.healthSummary,
      predictions: i.predictions as any[],
      habitImprovements: i.habitImprovements as any[],
      alertLevel: i.alertLevel,
      disclaimer: i.disclaimer,
    })),
  };
}

/**
 * Get AI insights for a specific patient (doctor view — includes clinical data).
 */
export async function getPatientInsightsForDoctor(patientId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "DOCTOR") {
    return { error: "Unauthorized" };
  }

  const insights = await (prisma as any).aIDiagnosis.findMany({
    where: { patientId },
    orderBy: { timestamp: "desc" },
  });

  return {
    insights: insights.map((i: any) => ({
      id: i.id,
      timestamp: i.timestamp,
      healthSummary: i.healthSummary,
      predictions: i.predictions as any[],
      habitImprovements: i.habitImprovements as any[],
      alertLevel: i.alertLevel,
      doctorNote: i.doctorNote,
      // Clinical physician-only data
      clinicalSummary: i.clinicalSummary,
      differentialNotes: i.differentialNotes as any[],
      clinicalFlags: i.clinicalFlags as any[],
      disclaimer: i.disclaimer,
    })),
  };
}
