"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user) return null;

  const patientId = (session.user as any).patientId;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    include: { patient: true }
  });

  if (!user?.patient) return null;

  const [vitals, healthScores, lastGlucose, lastWeight, lastBP, lastHR, lastSpo2] = await Promise.all([
    prisma.vitalSign.findMany({
      where: { patientId },
      orderBy: { timestamp: "desc" },
      take: 5,
    }),
    prisma.healthScore.findFirst({
      where: { patientId },
      orderBy: { timestamp: "desc" },
    }),
    prisma.vitalSign.findFirst({
      where: { patientId, glucose: { not: null } },
      orderBy: { timestamp: "desc" },
      select: { glucose: true, timestamp: true }
    }),
    prisma.vitalSign.findFirst({
      where: { patientId, weight: { not: null } },
      orderBy: { timestamp: "desc" },
      select: { weight: true, timestamp: true }
    }),
    prisma.vitalSign.findFirst({
      where: { patientId, systolicBP: { not: null }, diastolicBP: { not: null } },
      orderBy: { timestamp: "desc" },
      select: { systolicBP: true, diastolicBP: true, timestamp: true }
    }),
    prisma.vitalSign.findFirst({
      where: { patientId, heartRate: { not: null } },
      orderBy: { timestamp: "desc" },
      select: { heartRate: true, timestamp: true }
    }),
    prisma.vitalSign.findFirst({
      where: { patientId, spo2: { not: null } },
      orderBy: { timestamp: "desc" },
      select: { spo2: true, timestamp: true }
    }),
  ]);

  const birthDate = user.patient.birthDate;
  const gender = user.patient.gender;
  
  // Calculate age
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  const isProfileComplete = gender !== "OTHER" && gender !== "Seleccionar" && age > 0;

  let calculatedSegment = user.patient.segment;
  if (calculatedSegment === "GENERAL" && isProfileComplete) {
    if (age < 12) calculatedSegment = "CHILD";
    else if (age > 65) calculatedSegment = "ELDERLY";
    else calculatedSegment = "ADULT";
  }

  return {
    latestVitals: vitals,
    lastKnownVitals: {
      glucose: lastGlucose,
      weight: lastWeight,
      bp: lastBP,
      heartRate: lastHR,
      spo2: lastSpo2,
    },
    currentScore: healthScores?.score || 0,
    status: healthScores?.status || "GREEN",
    aiAdvice: healthScores?.aiAdvice,
    patientProfile: {
      isProfileComplete,
      age,
      gender,
      segment: calculatedSegment,
    }
  };
}
