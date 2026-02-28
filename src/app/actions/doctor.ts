"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDoctorDashboardData() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "DOCTOR") {
    throw new Error("Unauthorized");
  }

  const doctorId = (session.user as any).doctorId;
  if (!doctorId) {
    throw new Error("Doctor profile not found.");
  }

  // Fetch doctor details and their patients
  const doctor = await (prisma as any).doctor.findUnique({
    where: { id: doctorId },
    include: {
      patients: {
        include: {
          vitals: { orderBy: { timestamp: "desc" }, take: 1 },
          healthScores: { orderBy: { timestamp: "desc" }, take: 1 },
          aiDiagnoses: { orderBy: { timestamp: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!doctor) throw new Error("Doctor not found");

  const totalPatients = doctor.patients.length;
  let criticalPatients = 0;
  let pendingReviews = 0;
  let aiHighAlerts = 0;

  const patientsList = doctor.patients.map((p: any) => {
    const latestScoreInfo = p.healthScores[0];
    const latestVitals = p.vitals[0];
    const latestAI = p.aiDiagnoses[0];

    const currentStatus = latestScoreInfo?.status || latestVitals?.status || "GREEN";
    const aiAlertLevel = latestAI?.alertLevel || null;

    if (currentStatus === "RED" || currentStatus === "YELLOW") criticalPatients++;
    if (aiAlertLevel === "HIGH") aiHighAlerts++;

    return {
      id: p.id,
      name: p.name,
      segment: p.segment,
      status: currentStatus,
      aiAlertLevel,
      lastUpdate: latestVitals?.timestamp || p.updatedAt,
      lastInsightAt: latestAI?.timestamp || null,
    };
  });

  return {
    doctorName: doctor.name,
    inviteCode: doctor.inviteCode,
    metrics: {
      totalPatients,
      criticalPatients,
      pendingReviews,
      aiHighAlerts,
    },
    patients: patientsList.sort((a: any, b: any) => {
      const aiWeight = { HIGH: 0, MODERATE: 1, LOW: 2 };
      const statusWeight = { RED: 0, YELLOW: 1, GREEN: 2 };
      const aScore = ((aiWeight as any)[a.aiAlertLevel ?? "LOW"] ?? 2) + ((statusWeight as any)[a.status] ?? 2);
      const bScore = ((aiWeight as any)[b.aiAlertLevel ?? "LOW"] ?? 2) + ((statusWeight as any)[b.status] ?? 2);
      return aScore - bScore;
    })
  };
}

export async function generateInviteCode() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "DOCTOR") {
    return { error: "Unauthorized" };
  }

  const doctorId = (session.user as any).doctorId;
  if (!doctorId) return { error: "Doctor profile not found." };

  // Generate a random 6-character alphanumeric code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { inviteCode: code },
    });
    return { success: true, code: updatedDoctor.inviteCode };
  } catch (error) {
    return { error: "Failed to generate invite code" };
  }
}

export async function getPatientDetails(patientId: string) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "DOCTOR") {
    throw new Error("Unauthorized");
  }

  const doctorId = (session.user as any).doctorId;
  if (!doctorId) throw new Error("Doctor profile not found.");

  const patient = await prisma.patient.findUnique({
    where: { id: patientId, doctorId },
    include: {
      vitals: {
        orderBy: { timestamp: "desc" },
      },
      symptoms: {
        orderBy: { timestamp: "desc" },
      },
      healthScores: {
        orderBy: { timestamp: "desc" },
      },
      intake: true,
    },
  });

  if (!patient) throw new Error("Patient not found or not assigned to you.");

  return {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    birthDate: patient.birthDate,
    gender: patient.gender,
    segment: patient.segment,
    heredity: patient.heredity,
    habits: patient.habits,
    environment: patient.environment,
    immunizations: patient.immunizations,
    vitals: patient.vitals.map(v => ({
      id: v.id,
      timestamp: v.timestamp,
      systolicBP: v.systolicBP,
      diastolicBP: v.diastolicBP,
      heartRate: v.heartRate,
      respiratoryRate: v.respiratoryRate,
      temperature: v.temperature,
      spo2: v.spo2,
      glucose: v.glucose,
      weight: v.weight,
      height: v.height,
      bmi: v.bmi,
      status: v.status,
    })),
    symptoms: patient.symptoms.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      location: s.location,
      irradiation: s.irradiation,
      intensity: s.intensity,
      description: s.description,
    })),
    healthScores: patient.healthScores.map(h => ({
      id: h.id,
      timestamp: h.timestamp,
      score: h.score,
      status: h.status,
      aiAdvice: h.aiAdvice,
      trend: h.trend,
    })),
    intake: patient.intake ? {
      initialVisual: patient.intake.initialVisual,
      familyHistory: patient.intake.familyHistory,
      personalHabits: patient.intake.personalHabits,
      immunizationRecord: patient.intake.immunizationRecord,
      lastUpdated: patient.intake.lastUpdated,
    } : null,
  };
}
