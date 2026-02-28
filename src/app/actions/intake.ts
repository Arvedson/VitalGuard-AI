"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveMedicalIntake(data: any) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const patientId = (session.user as any).patientId;
  if (!patientId) return { error: "No patient profile found" };

  try {
    // 1. Update/Create MedicalIntake
    await prisma.medicalIntake.upsert({
      where: { patientId },
      update: {
        familyHistory: data.familyHistory,
        personalHabits: data.personalHabits,
      },
      create: {
        patientId,
        familyHistory: data.familyHistory,
        personalHabits: data.personalHabits,
      },
    });

    // 2. Create SymptomLog
    await prisma.symptomLog.create({
      data: {
        patientId,
        location: data.painLocation,
        intensity: data.painIntensity,
        irradiation: data.painIrradiation,
        description: data.symptomDescription,
      },
    });

    // 3. Update Patient record with heredity/habits/environment
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        heredity: data.familyHistory,
        habits: data.personalHabits,
        environment: data.environment,
      }
    });

    revalidatePath("/intake");
    return { success: true };
  } catch (error) {
    console.error("Error saving medical intake:", error);
    return { error: "Failed to save medical intake." };
  }
}

export async function saveHabitusExterior(data: any) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const patientId = (session.user as any).patientId;
  if (!patientId) return { error: "No patient profile found" };

  try {
    // We cast to any to avoid TS issues, but Prisma should handle the object if the schema is correct.
    // In case of persistent type mismatch in the generated client, we use the model as Json.
    await prisma.medicalIntake.upsert({
      where: { patientId },
      update: {
        initialVisual: data as any,
      },
      create: {
        patientId,
        initialVisual: data as any,
      },
    });

    revalidatePath("/intake");
    return { success: true };
  } catch (error) {
    console.error("Error saving habitus exterior:", error);
    return { error: "Failed to save habitus exterior." };
  }
}
