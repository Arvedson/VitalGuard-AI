"use client";

import React from "react";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { AIAdvicePanel } from "@/components/dashboard/AIAdvicePanel";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { ECGMonitor } from "@/components/dashboard/ECGMonitor";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  UserPlus, 
  Activity,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PatientSegmentView } from "@/components/dashboard/PatientSegmentView";
import { CompleteProfileForm } from "@/components/dashboard/CompleteProfileForm";

import { useTranslations } from "next-intl";

export default function DashboardUI({ userName, initialData }: { userName: string, initialData: any }) {
  const t = useTranslations("Dashboard");
  const common = useTranslations("Common");

  const titleParts = t("title").split(" ");
  const titleMain = titleParts[0] || "";
  const titleItalic = titleParts.slice(1).join(" ");

  const stats = [
    { label: t("bloodPressure"), value: initialData?.latestVitals?.[0] ? `${initialData.latestVitals[0].systolicBP}/${initialData.latestVitals[0].diastolicBP}` : "N/A", unit: "mmHg", trend: "stable", change: "0%" },
    { label: t("glucose"), value: initialData?.latestVitals?.[0]?.glucose || "N/A", unit: "mg/dL", trend: "stable", change: "0%" },
    { label: t("weight"), value: initialData?.latestVitals?.[0]?.weight || "N/A", unit: "kg", trend: "stable", change: "0%" },
    { label: t("spo2"), value: initialData?.latestVitals?.[0]?.spo2 || "N/A", unit: "%", trend: "stable", change: "0%" },
  ];

  const isProfileComplete = initialData?.patientProfile?.isProfileComplete;
  const currentSegment = initialData?.patientProfile?.segment || "GENERAL";

  return (
    <PatientSegmentView segment={currentSegment}>
      <div className="space-y-10">
        {!isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CompleteProfileForm />
          </motion.div>
        )}
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
              {titleMain} <span className="text-primary italic">{titleItalic}</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {t("welcome", { name: userName })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-border hover:bg-muted font-bold h-12">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {t("scheduleVisit")}
            </Button>
            <Link href="/vitals">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg h-12 px-6 font-bold transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                {t("addVitals")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Left Column - Score & AI */}
          <div className="xl:col-span-4 space-y-10">
            <Card className="glass border-none shadow-2xl relative overflow-hidden group py-10">
               <div className="absolute top-0 right-0 p-6">
                 <Activity className="w-10 h-10 text-primary/10 group-hover:scale-125 transition-transform duration-700" />
               </div>
               <HealthScoreGauge score={initialData?.currentScore || 0} />
            </Card>

            <Card className="glass border-none shadow-2xl p-6">
              <AIAdvicePanel advices={(() => {
                try {
                  const raw = initialData?.aiAdvice ? JSON.parse(initialData.aiAdvice) : [];
                  return Array.isArray(raw) ? raw : [];
                } catch (e) {
                  console.error("Failed to parse AI advice:", e);
                  return [];
                }
              })()} />
            </Card>
          </div>

          {/* Right Column - Stats & Charts */}
          <div className="xl:col-span-8 space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 glass rounded-3xl border-none shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      stat.trend === "up" ? "bg-danger/10 text-danger" : 
                      stat.trend === "down" ? "bg-success/10 text-success" : 
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : 
                       stat.trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : 
                       <Activity className="w-3 h-3" />}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-secondary dark:text-white group-hover:text-primary transition-colors">
                      {stat.value}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{stat.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <ECGMonitor />
            <VitalsChart />

            {/* Recent Activity */}
            <Card className="glass border-none shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("recentInsights")}</CardTitle>
                  <CardDescription>{t("recentInsightsDesc")}</CardDescription>
                </div>
                <Button variant="ghost" className="text-primary font-bold">{t("manageLogs")}</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {initialData?.latestVitals?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                      <div className={cn("p-2 rounded-xl bg-background border border-border h-fit group-hover:bg-primary/5 transition-colors text-primary")}>
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-1 pb-4 border-b border-border/50">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-sm">{t("vitalsLogged")}</h4>
                          <span className="text-[10px] text-muted-foreground font-medium" suppressHydrationWarning>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("bp")}: {item.systolicBP}/{item.diastolicBP}, {t("heartRate")}: {item.heartRate} bpm</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </PatientSegmentView>
  );
}
