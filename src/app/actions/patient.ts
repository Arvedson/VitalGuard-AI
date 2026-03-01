"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── Helper ──────────────────────────────────────────────────────────

async function getPatientId() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PATIENT") {
    throw new Error("Unauthorized");
  }
  const patientId = (session.user as any).patientId;
  if (!patientId) throw new Error("Patient profile not found.");
  return { patientId, userId: session.user.id as string };
}

// ── Shared Helper (For both Roles) ──────────────────────────────────
export async function getSessionUserId() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user.id;
}

// ── My Doctor Info ──────────────────────────────────────────────────

export async function getMyDoctorInfo() {
  const { patientId } = await getPatientId();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          specialty: true,
        },
      },
    },
  });

  if (!patient) throw new Error("Patient not found.");

  return {
    doctor: patient.doctor
      ? {
          id: patient.doctor.id,
          name: patient.doctor.name,
          specialty: patient.doctor.specialty,
        }
      : null,
  };
}

// ── My Appointments ─────────────────────────────────────────────────

export async function getMyAppointments() {
  const { patientId } = await getPatientId();

  const appointments = await (prisma as any).appointment.findMany({
    where: { patientId },
    include: {
      doctor: { select: { name: true, specialty: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  return {
    appointments: appointments.map((a: any) => ({
      id: a.id,
      type: a.type,
      status: a.status,
      scheduledAt: a.scheduledAt,
      notes: a.notes,
      doctorName: a.doctor?.name || "Doctor",
      createdAt: a.createdAt,
    })),
  };
}

// ── Request Appointment ─────────────────────────────────────────────

export async function requestAppointment(
  type: string,
  preferredDate: string,
  notes?: string
) {
  const { patientId } = await getPatientId();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { doctor: { include: { user: true } } },
  });

  if (!patient) return { error: "Patient not found." };
  if (!patient.doctor) return { error: "No doctor linked to your profile." };

  try {
    // Create the appointment with SCHEDULED status
    const appointment = await (prisma as any).appointment.create({
      data: {
        patientId,
        doctorId: patient.doctor.id,
        type,
        scheduledAt: new Date(preferredDate),
        notes: notes || null,
      },
    });

    // Notify the doctor
    if (patient.doctor.user) {
      await (prisma as any).notification.create({
        data: {
          userId: patient.doctor.user.id,
          type: "APPOINTMENT_REQUEST",
          title: "Nueva Solicitud de Cita",
          message: `${patient.name} ha solicitado una cita de tipo ${type === "IN_PERSON" ? "presencial" : type === "CALL" ? "llamada" : "videollamada"} para el ${new Date(preferredDate).toLocaleDateString()}.`,
          relatedId: appointment.id,
        },
      });
    }

    return { success: true, appointment };
  } catch (error) {
    return { error: "Failed to request appointment." };
  }
}

// ── Contact Doctor (from Health Insights) ───────────────────────────

export async function contactDoctor(insightId?: string) {
  const { patientId } = await getPatientId();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { doctor: { include: { user: true } } },
  });

  if (!patient) return { error: "Patient not found." };
  if (!patient.doctor) return { error: "No doctor linked to your profile." };

  try {
    // Create a notification for the doctor
    if (patient.doctor.user) {
      await (prisma as any).notification.create({
        data: {
          userId: patient.doctor.user.id,
          type: "CONTACT_REQUEST",
          title: "Solicitud de Contacto",
          message: `${patient.name} solicita contacto con usted${insightId ? " (desde un Health Insight de alerta alta)" : ""}.`,
          relatedId: insightId || null,
        },
      });
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to send contact request." };
  }
}

// ── My Notifications ────────────────────────────────────────────────

export async function getMyNotifications() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const notifications = await (prisma as any).notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    notifications: notifications.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedId: n.relatedId,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
  };
}

// ── Mark Notification Read ──────────────────────────────────────────

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await (prisma as any).notification.updateMany({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark notification as read." };
  }
}

// ── Mark All Notifications Read ─────────────────────────────────────

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await (prisma as any).notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark notifications as read." };
  }
}

// ── Unread Notification Count ───────────────────────────────────────

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user) return { count: 0 };

  const count = await (prisma as any).notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return { count };
}
