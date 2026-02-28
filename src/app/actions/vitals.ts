"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { calculateHealthScore, getRealAIAdvice } from "@/lib/scoring";

export async function saveVitals(data: any) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const patientId = (session.user as any).patientId;
  if (!patientId) return { error: "No patient profile found" };

  try {
    // 1. Get patient for segment context
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { segment: true, gender: true, birthDate: true }
    });

    if (!patient) return { error: "Patient not found" };

    // 2. Create vital record
    const vital = await prisma.vitalSign.create({
      data: {
        patientId,
        systolicBP: data.systolicBP,
        diastolicBP: data.diastolicBP,
        heartRate: data.heartRate,
        respiratoryRate: data.respiratoryRate,
        temperature: data.temperature,
        spo2: data.spo2,
        glucose: data.glucose,
        weight: data.weight,
        height: data.height,
        bmi: data.bmi,
        fetalHeartRate: data.fetalHeartRate,
        status: data.status || "GREEN",
      },
    });

    // 3. Calculate Health Score and AI Advice
    const profileData = { gender: patient.gender, birthDate: patient.birthDate };
    const scoreResult = calculateHealthScore(data, (patient.segment as any) || "GENERAL", profileData);
    const adviceResult = await getRealAIAdvice(data, scoreResult.score, scoreResult.status, (patient.segment as any) || "GENERAL", profileData);

    // 4. Save HealthScore record
    await prisma.healthScore.create({
      data: {
        patientId,
        score: scoreResult.score,
        status: scoreResult.status as any,
        aiAdvice: JSON.stringify(adviceResult),
        trend: "Stable", // Simple trend for now
      }
    });
    
    revalidatePath("/");
    return { success: true, id: vital.id };
  } catch (error) {
    console.error("Error saving vitals:", error);
    return { error: "Failed to save vitals data." };
  }
}
