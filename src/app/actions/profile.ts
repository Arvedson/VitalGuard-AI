"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPatientProfile() {
  const session = await auth();
  if (!session?.user?.id) return { error: "No user found" };

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        createdAt: true,
      }
    });
    
    return { data: patient };
  } catch (error) {
    console.error("Error fetching patient:", error);
    return { error: "Failed to load patient." };
  }
}

export async function updatePatientProfile(data: { gender: string, birthDate: Date }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No user found" };

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!patient) return { error: "Patient profile not found." };
    
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        gender: data.gender,
        birthDate: data.birthDate,
      }
    });
    
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return { error: "Failed to update profile." };
  }
}
