"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── Helper ──────────────────────────────────────────────────────────

async function getDoctorId() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "DOCTOR") {
    throw new Error("Unauthorized");
  }
  const doctorId = (session.user as any).doctorId;
  if (!doctorId) throw new Error("Doctor profile not found.");
  return doctorId;
}

// ── Dashboard Data ──────────────────────────────────────────────────

export async function getDoctorDashboardData() {
  const doctorId = await getDoctorId();

  const doctor = await (prisma as any).doctor.findUnique({
    where: { id: doctorId },
    include: {
      patients: {
        include: {
          vitals: { orderBy: { timestamp: "desc" }, take: 1 },
          healthScores: { orderBy: { timestamp: "desc" }, take: 1 },
          aiDiagnoses: { orderBy: { timestamp: "desc" }, take: 1 },
          reviews: { orderBy: { createdAt: "desc" }, take: 1 },
          appointments: {
            where: { status: "SCHEDULED" },
            orderBy: { scheduledAt: "asc" },
            take: 1,
          },
        },
      },
      appointments: {
        where: {
          status: "SCHEDULED",
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { scheduledAt: "asc" },
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
    const latestReview = p.reviews[0];
    const nextAppointment = p.appointments[0];

    const currentStatus = latestScoreInfo?.status || latestVitals?.status || "GREEN";
    const aiAlertLevel = latestAI?.alertLevel || null;

    if (currentStatus === "RED" || currentStatus === "YELLOW") criticalPatients++;
    if (aiAlertLevel === "HIGH") aiHighAlerts++;

    // A patient needs review if their latest data is newer than the latest review
    const latestDataTime = Math.max(
      latestVitals?.timestamp?.getTime() || 0,
      latestAI?.timestamp?.getTime() || 0,
      latestScoreInfo?.timestamp?.getTime() || 0
    );
    const latestReviewTime = latestReview?.createdAt?.getTime() || 0;
    const isReviewed = latestReviewTime >= latestDataTime && latestDataTime > 0;

    if (!isReviewed && latestDataTime > 0) pendingReviews++;

    return {
      id: p.id,
      name: p.name,
      segment: p.segment,
      status: currentStatus,
      aiAlertLevel,
      lastUpdate: latestVitals?.timestamp || p.updatedAt,
      lastInsightAt: latestAI?.timestamp || null,
      isReviewed,
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment.id,
            type: nextAppointment.type,
            scheduledAt: nextAppointment.scheduledAt,
            notes: nextAppointment.notes,
          }
        : null,
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
    }),
    todayAppointments: doctor.appointments.map((a: any) => ({
      id: a.id,
      patientId: a.patient.id,
      patientName: a.patient.name,
      type: a.type,
      scheduledAt: a.scheduledAt,
      notes: a.notes,
      status: a.status,
    })),
  };
}

// ── Invite Code ─────────────────────────────────────────────────────

export async function generateInviteCode() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "DOCTOR") {
    return { error: "Unauthorized" };
  }

  const doctorId = (session.user as any).doctorId;
  if (!doctorId) return { error: "Doctor profile not found." };

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

// ── Mark Patient Reviewed ───────────────────────────────────────────

export async function markPatientReviewed(patientId: string, type: string, notes?: string) {
  const doctorId = await getDoctorId();

  // Verify the patient belongs to the doctor
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, doctorId },
  });
  if (!patient) return { error: "Patient not found or not assigned to you." };

  try {
    await (prisma as any).patientReview.create({
      data: {
        patientId,
        doctorId,
        type,
        notes: notes || null,
      },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark as reviewed." };
  }
}

// ── Schedule Appointment ────────────────────────────────────────────

export async function scheduleAppointment(
  patientId: string,
  type: string,
  scheduledAt: string,
  notes?: string
) {
  const doctorId = await getDoctorId();

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, doctorId },
  });
  if (!patient) return { error: "Patient not found or not assigned to you." };

  try {
    const appointment = await (prisma as any).appointment.create({
      data: {
        patientId,
        doctorId,
        type,
        scheduledAt: new Date(scheduledAt),
        notes: notes || null,
      },
    });
    return { success: true, appointment };
  } catch (error) {
    return { error: "Failed to schedule appointment." };
  }
}

// ── Update Appointment Status ───────────────────────────────────────

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const doctorId = await getDoctorId();

  try {
    const appointment = await (prisma as any).appointment.findFirst({
      where: { id: appointmentId, doctorId },
    });
    if (!appointment) return { error: "Appointment not found." };

    await (prisma as any).appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to update appointment." };
  }
}

// ── Patient Details ─────────────────────────────────────────────────

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
