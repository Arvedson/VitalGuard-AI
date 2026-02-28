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

  const [vitals, healthScores] = await Promise.all([
    prisma.vitalSign.findMany({
      where: { patientId },
      orderBy: { timestamp: "desc" },
      take: 5,
    }),
    prisma.healthScore.findFirst({
      where: { patientId },
      orderBy: { timestamp: "desc" },
    }),
  ]);

  const birthDate = user.patient.birthDate;
  const gender = user.patient.gender;
  
  // Calculate age
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  // Profile is complete if gender is not OTHER and birthDate is not today (default when registered recently)
  // or more accurately if it has been updated from defaults.
  // Actually, let's just check if gender is not "OTHER" as a proxy if "OTHER" is the default.
  const isProfileComplete = gender !== "OTHER" && gender !== "Seleccionar" && age > 0;

  let calculatedSegment = user.patient.segment;
  if (calculatedSegment === "GENERAL" && isProfileComplete) {
    if (age < 12) calculatedSegment = "CHILD";
    else if (age > 65) calculatedSegment = "ELDERLY";
    else calculatedSegment = "ADULT";
  }

  return {
    latestVitals: vitals,
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
