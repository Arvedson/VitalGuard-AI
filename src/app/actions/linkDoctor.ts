"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getLinkedDoctor() {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const patientId = (session.user as any).patientId;
  if (!patientId) {
    return { error: "Patient profile not found." };
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      doctor: true,
    },
  });

  if (!patient?.doctor) {
    return { doctor: null };
  }

  return {
    doctor: {
      id: patient.doctor.id,
      name: patient.doctor.name,
      specialty: patient.doctor.specialty,
    },
  };
}

export async function linkDoctorByCode(code: string) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const patientId = (session.user as any).patientId;
  if (!patientId) {
    return { error: "Patient profile not found." };
  }

  // Find the doctor with that invite code
  const doctor = await prisma.doctor.findUnique({
    where: { inviteCode: code.toUpperCase() },
  });

  if (!doctor) {
    return { error: "Invalid invite code. Please check and try again." };
  }

  // Check if already linked
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (patient?.doctorId === doctor.id) {
    return { error: "You are already linked to this doctor." };
  }

  // Link the patient to the doctor
  await prisma.patient.update({
    where: { id: patientId },
    data: { doctorId: doctor.id },
  });

  return { success: true, doctorName: doctor.name };
}
