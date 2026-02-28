"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  HeartPulse,
  Activity,
  Thermometer,
  Droplets,
  Weight,
  Brain,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  FlaskConical,
  ShieldAlert,
  Microscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

export default function PatientDetailUI({ patient, insights = [] }: { patient: any, insights?: any[] }) {
  const t = useTranslations("PatientDetail");
  const getStatusColor = (status: string) => {
    switch (status) {
      case "RED": return "text-destructive bg-destructive/10 border-destructive/20";
      case "YELLOW": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-success bg-success/10 border-success/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RED": return <AlertCircle className="w-4 h-4" />;
      case "YELLOW": return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const renderAIAdvice = (adviceJson: string) => {
    try {
      const advices = JSON.parse(adviceJson);
      if (!Array.isArray(advices)) return adviceJson;

      return (
        <div className="space-y-2 mt-2">
          {advices.map((adv: any, idx: number) => (
            <div key={adv.id || idx} className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
              <div className="mt-0.5">
                {adv.type === "insight" ? <Lightbulb className="w-4 h-4 text-primary" /> : 
                 adv.type === "prediction" ? <TrendingUp className="w-4 h-4 text-blue-500" /> : 
                 <ShieldAlert className="w-4 h-4 text-orange-500" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                  {adv.type}
                </p>
                <p className="text-xs text-secondary dark:text-white leading-relaxed">
                  {adv.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return adviceJson;
    }
  };

  const latestVital = patient.vitals?.[0];
  const latestScore = patient.healthScores?.[0];

  return (
    <div className="space-y-8">
      {/* Back Button + Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="w-14 h-14 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
              {patient.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-secondary dark:text-white">
              {patient.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary dark:text-white">
                {patient.segment.replace("_", " ")}
              </span>
              <span className="text-sm text-muted-foreground">{patient.gender}</span>
              <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                DOB: {new Date(patient.birthDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {latestScore && (
          <div className={cn("inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black tracking-widest border", getStatusColor(latestScore.status))}>
            {getStatusIcon(latestScore.status)}
            {t("score")}: {latestScore.score.toFixed(0)}
          </div>
        )}
      </div>

      {/* Quick Vitals Summary */}
      {latestVital && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> {t("latestVitals")}
                <span className="text-xs text-muted-foreground font-medium ml-auto" suppressHydrationWarning>
                  {new Date(latestVital.timestamp).toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "BP", value: latestVital.systolicBP && latestVital.diastolicBP ? `${latestVital.systolicBP}/${latestVital.diastolicBP}` : "N/A", unit: "mmHg", icon: HeartPulse },
                  { label: "Heart Rate", value: latestVital.heartRate ?? "N/A", unit: "bpm", icon: Activity },
                  { label: "Temperature", value: latestVital.temperature ?? "N/A", unit: "°C", icon: Thermometer },
                  { label: "SpO2", value: latestVital.spo2 ?? "N/A", unit: "%", icon: Droplets },
                  { label: "Glucose", value: latestVital.glucose ?? "N/A", unit: "mg/dL", icon: Droplets },
                  { label: "BMI", value: latestVital.bmi ?? "N/A", unit: "", icon: Weight },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 bg-muted/30 rounded-xl">
                    <item.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{item.label}</p>
                    <p className="text-lg font-black text-secondary dark:text-white">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* {t("vitalsHistory")} */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass border-none shadow-xl h-full">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-primary" /> {t("vitalsHistory")}
                <span className="text-xs text-muted-foreground font-medium ml-auto">{patient.vitals.length === 1 ? t("recordSingle", { count: 1 }) : t("records", { count: patient.vitals.length })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {patient.vitals.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {patient.vitals.map((v: any, i: number) => (
                    <div key={v.id} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium" suppressHydrationWarning>
                            {new Date(v.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border", getStatusColor(v.status))}>
                          {getStatusIcon(v.status)} {v.status}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <span><strong className="text-primary">BP:</strong> {v.systolicBP}/{v.diastolicBP}</span>
                        <span><strong className="text-primary">HR:</strong> {v.heartRate} bpm</span>
                        <span><strong className="text-primary">Temp:</strong> {v.temperature}°C</span>
                        <span><strong className="text-primary">SpO2:</strong> {v.spo2}%</span>
                        <span><strong className="text-primary">Glucose:</strong> {v.glucose} mg/dL</span>
                        <span><strong className="text-primary">RR:</strong> {v.respiratoryRate}/min</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Activity className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm font-bold">{t("noVitals")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* {t("healthScores")} History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass border-none shadow-xl h-full">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> {t("healthScores")}
                <span className="text-xs text-muted-foreground font-medium ml-auto">{patient.healthScores.length === 1 ? t("recordSingle", { count: 1 }) : t("records", { count: patient.healthScores.length })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {patient.healthScores.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {patient.healthScores.map((h: any) => (
                    <div key={h.id} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium" suppressHydrationWarning>
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border", getStatusColor(h.status))}>
                          Score: {h.score.toFixed(0)}
                        </div>
                      </div>
                      {h.aiAdvice && (
                        <div className="mt-2">
                          <span className="font-bold text-primary text-xs">{t("aiAdvice")}:</span> 
                          {renderAIAdvice(h.aiAdvice)}
                        </div>
                      )}
                      {h.trend && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-bold">{t("trend")}:</span> {h.trend}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Brain className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm font-bold">{t("noScores")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Symptoms History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass border-none shadow-xl h-full">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" /> {t("symptomLogs")}
                <span className="text-xs text-muted-foreground font-medium ml-auto">{patient.symptoms.length === 1 ? t("recordSingle", { count: 1 }) : t("records", { count: patient.symptoms.length })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {patient.symptoms.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {patient.symptoms.map((s: any) => (
                    <div key={s.id} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-secondary dark:text-white">{s.location}</span>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border",
                            s.intensity >= 7 ? "text-destructive bg-destructive/10 border-destructive/20" :
                            s.intensity >= 4 ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                            "text-success bg-success/10 border-success/20"
                          )}>
                            {t("intensity")}: {s.intensity}/10
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(s.timestamp).toLocaleString()}
                      </p>
                      {s.irradiation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>{t("irradiation")}:</strong> {s.irradiation}
                        </p>
                      )}
                      {s.description && (
                        <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Stethoscope className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm font-bold">{t("noSymptoms")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* {t("medicalIntake")} */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass border-none shadow-xl h-full">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> {t("medicalIntake")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {patient.intake ? (
                <>
                  {patient.intake.familyHistory && (
                    <div className="p-4 bg-muted/20 rounded-xl">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{t("familyHistory")}</p>
                      <p className="text-sm text-secondary dark:text-white">{patient.intake.familyHistory}</p>
                    </div>
                  )}
                  {patient.intake.personalHabits && (
                    <div className="p-4 bg-muted/20 rounded-xl">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{t("personalHabits")}</p>
                      <p className="text-sm text-secondary dark:text-white">{patient.intake.personalHabits}</p>
                    </div>
                  )}
                  {patient.intake.initialVisual && (
                    <div className="p-4 bg-muted/20 rounded-xl">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">{t("habitusExterior")}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(patient.intake.initialVisual)
                          .filter(([key]) => ["gait", "color", "breathing"].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-border/50">
                              <span className="text-xs font-medium">{t(key as any)}</span>
                              {value ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  {patient.intake.immunizationRecord && (
                    <div className="p-4 bg-muted/20 rounded-xl">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">{t("immunizations")}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(patient.intake.immunizationRecord).map(([key, value]) => (
                          value ? (
                            <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-primary/10 text-primary border border-primary/20">
                              <CheckCircle2 className="w-3 h-3" /> {key.replace("_", " ")}
                            </span>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                    {t("lastUpdated")}: {new Date(patient.intake.lastUpdated).toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <FileText className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm font-bold">{t("noIntake")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Wellness Insights — patient-facing content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="xl:col-span-2">
          <Card className="glass border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" /> {t("aiWellnessAnalysis")}
                </CardTitle>
                <span className="text-xs text-muted-foreground font-medium">{insights.length === 1 ? t("recordSingle", { count: 1 }) : t("records", { count: insights.length })}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[700px] overflow-y-auto divide-y divide-border/50">
              {insights.length > 0 ? insights.map((insight: any) => (
                <div key={insight.id} className="p-5 space-y-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1" suppressHydrationWarning>
                      <Clock className="w-3 h-3" /> {new Date(insight.timestamp).toLocaleString()}
                    </span>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest border",
                      insight.alertLevel === "HIGH" ? "text-destructive bg-destructive/10 border-destructive/20" :
                      insight.alertLevel === "MODERATE" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                      "text-success bg-success/10 border-success/20"
                    )}>
                      {insight.alertLevel === "HIGH" ? <AlertCircle className="w-3 h-3" /> : insight.alertLevel === "MODERATE" ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {insight.alertLevel}
                    </div>
                  </div>

                  {/* Wellness summary */}
                  <p className="text-sm text-secondary dark:text-white leading-relaxed">{insight.healthSummary}</p>

                  {/* Predictions + Suggestions grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3 text-primary" /> {t("trends")}
                      </p>
                      {insight.predictions?.map((p: any, i: number) => (
                        <div key={i} className="p-2.5 bg-muted/15 rounded-xl text-xs flex items-start gap-2 border border-border/20">
                          {p.trend === "improving" ? <TrendingUp className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" /> : p.trend === "worsening" ? <TrendingDown className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" /> : <Minus className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                          <span><strong className="text-secondary dark:text-white">{p.title}:</strong> {p.detail}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-primary" /> {t("wellnessTips")}
                      </p>
                      {insight.habitImprovements?.map((h: any, i: number) => (
                        <div key={i} className={cn("p-2.5 bg-muted/15 rounded-xl text-xs border-l-4", h.priority === "high" ? "border-l-destructive" : h.priority === "medium" ? "border-l-yellow-500" : "border-l-success")}>
                          <strong className="text-primary text-[10px] uppercase tracking-widest">{h.category}</strong>
                          <p className="text-muted-foreground mt-0.5">{h.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor brief note */}
                  {insight.doctorNote && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs">
                      <span className="font-bold text-blue-500 flex items-center gap-1 mb-1"><Stethoscope className="w-3 h-3" /> {t("clinicalNote")}</span>
                      <p className="text-secondary dark:text-white">{insight.doctorNote}</p>
                    </div>
                  )}

                  {/* ─── PHYSICIAN-ONLY CLINICAL SECTION ─── */}
                  {(insight.clinicalSummary || (insight.differentialNotes?.length > 0) || (insight.clinicalFlags?.length > 0)) && (
                    <div className="mt-4 rounded-2xl border border-blue-500/30 overflow-hidden">
                      <div className="bg-blue-500/10 px-4 py-2 flex items-center gap-2">
                        <Microscope className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-blue-500">{t("physicianAssessment")}</span>
                        <span className="ml-auto text-[10px] text-blue-400 italic">{t("physicianOnly")}</span>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Clinical Summary */}
                        {insight.clinicalSummary && (
                          <div className="p-3 bg-blue-500/5 rounded-xl">
                            <p className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-widest">{t("clinicalAssessment")}</p>
                            <p className="text-xs text-secondary dark:text-white leading-relaxed">{insight.clinicalSummary}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Differential Notes */}
                          {insight.differentialNotes?.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1">
                                <FlaskConical className="w-3 h-3" /> {t("differentialConsiderations")}
                              </p>
                              {insight.differentialNotes.map((d: any, i: number) => (
                                <div key={i} className={cn(
                                  "p-2.5 rounded-xl text-xs border-l-4",
                                  d.priority === "high" ? "border-l-destructive bg-destructive/5" :
                                  d.priority === "moderate" ? "border-l-yellow-500 bg-yellow-500/5" :
                                  "border-l-blue-400 bg-blue-500/5"
                                )}>
                                  <p className="font-bold text-secondary dark:text-white">{d.consideration}</p>
                                  <p className="text-muted-foreground mt-0.5">{d.rationale}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Clinical Flags */}
                          {insight.clinicalFlags?.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> {t("flaggedMetrics")}
                              </p>
                              {insight.clinicalFlags.map((f: any, i: number) => (
                                <div key={i} className="p-2.5 bg-destructive/5 border border-destructive/20 rounded-xl text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-destructive">{f.metric}</span>
                                    <span className="font-mono text-secondary dark:text-white bg-muted/30 px-1.5 py-0.5 rounded-md">{f.value}</span>
                                  </div>
                                  <p className="text-muted-foreground">{f.interpretation}</p>
                                  <p className="text-blue-500 mt-1 font-medium">→ {f.action}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Brain className="w-10 h-10 opacity-20 mb-3" />
                  <p className="text-sm font-bold">{t("noInsights")}</p>
                  <p className="text-xs mt-1">{t("noInsightsDesc")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* {t("patientBackground")} Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="xl:col-span-2">
          <Card className="glass border-none shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> {t("patientBackground")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/20 rounded-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{t("heredityFamily")}</p>
                  <p className="text-sm text-secondary dark:text-white">{patient.heredity || t("notProvided")}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{t("habits")}</p>
                  <p className="text-sm text-secondary dark:text-white">{patient.habits || t("notProvided")}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{t("environment")}</p>
                  <p className="text-sm text-secondary dark:text-white">{patient.environment || t("notProvided")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
