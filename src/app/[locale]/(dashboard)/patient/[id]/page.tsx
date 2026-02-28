import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPatientDetails } from "@/app/actions/doctor";
import { getPatientInsightsForDoctor } from "@/app/actions/insights";
import PatientDetailUI from "./PatientDetailUI";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "DOCTOR") {
    redirect("/login");
  }

  const { id } = await params;

  try {
    const [patient, insightsResult] = await Promise.all([
      getPatientDetails(id),
      getPatientInsightsForDoctor(id),
    ]);
    const insights = insightsResult?.insights || [];
    return <PatientDetailUI patient={patient} insights={insights} />;
  } catch (e: any) {
    redirect("/");
  }
}
