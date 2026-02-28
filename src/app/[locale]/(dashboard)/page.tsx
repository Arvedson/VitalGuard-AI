import React from "react";
import { auth } from "@/auth";
import { getDashboardData } from "@/app/actions/dashboard";
import DashboardUI from "./DashboardUI";
import DoctorDashboardUI from "./DoctorDashboardUI";
import { redirect } from "next/navigation";
import { getDoctorDashboardData } from "@/app/actions/doctor";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role === "DOCTOR") {
    try {
      const doctorData = await getDoctorDashboardData();
      return (
        <DoctorDashboardUI 
          userName={(session.user as any).name || "Doctor"} 
          initialData={doctorData} 
        />
      );
    } catch (e: any) {
      if (e.message === "Doctor not found" || e.message === "Doctor profile not found.") {
        redirect("/api/auth/signout");
      }
      throw e;
    }
  }

  try {
    const data = await getDashboardData();
    return (
      <DashboardUI 
        userName={(session.user as any).name || "User"} 
        initialData={data} 
      />
    );
  } catch (e: any) {
    if (e.message === "Patient not found") {
      redirect("/api/auth/signout");
    }
    throw e;
  }
}
