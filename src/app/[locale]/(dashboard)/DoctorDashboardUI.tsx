"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  Activity,
  AlertTriangle,
  Plus,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
  Brain,
  Minus,
  Calendar,
  Phone,
  Video,
  MoreVertical,
  Filter,
  CalendarClock,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateInviteCode, markPatientReviewed, scheduleAppointment, updateAppointmentStatus } from "@/app/actions/doctor";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type FilterType = "all" | "needsReview" | "critical" | "scheduled";

interface Metrics {
  totalPatients: number;
  criticalPatients: number;
  pendingReviews: number;
  aiHighAlerts: number;
}

export default function DoctorDashboardUI({ userName, initialData }: { userName: string; initialData: any }) {
  const format = useFormatter();
  const t = useTranslations("DoctorDashboard");
  const [inviteCode, setInviteCode] = useState(initialData?.inviteCode);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Local state that mirrors server data ──
  const [metrics, setMetrics] = useState<Metrics>(initialData?.metrics || { totalPatients: 0, criticalPatients: 0, pendingReviews: 0, aiHighAlerts: 0 });
  const [patients, setPatients] = useState<any[]>(initialData?.patients || []);
  const [todayAppointments, setTodayAppointments] = useState<any[]>(initialData?.todayAppointments || []);

  // ── UI state ──
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [schedulePatient, setSchedulePatient] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState("IN_PERSON");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Handlers ──

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    const result = await generateInviteCode();
    setIsGeneratingCode(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.code) {
      setInviteCode(result.code);
      toast.success(t("codeSuccess"));
    }
  };

  const handleMarkReviewed = async (patientId: string) => {
    startTransition(async () => {
      const result = await markPatientReviewed(patientId, "GENERAL_REVIEW");
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t("patientReviewed"));
        // Optimistic update
        setPatients(prev =>
          prev.map(p => (p.id === patientId ? { ...p, isReviewed: true } : p))
        );
        setMetrics(prev => ({
          ...prev,
          pendingReviews: Math.max(0, prev.pendingReviews - 1),
        }));
      }
    });
  };

  const openScheduleDialog = (patient: any, type: string) => {
    setSchedulePatient(patient);
    setScheduleType(type);
    setScheduleDate("");
    setScheduleNotes("");
    setScheduleDialogOpen(true);
  };

  const handleScheduleAppointment = async () => {
    if (!schedulePatient || !scheduleDate) return;
    startTransition(async () => {
      const result = await scheduleAppointment(schedulePatient.id, scheduleType, scheduleDate, scheduleNotes);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t("appointmentScheduled"));
        // Add to today's appointments if it's today
        const apptDate = new Date(scheduleDate);
        const today = new Date();
        if (apptDate.toDateString() === today.toDateString()) {
          setTodayAppointments(prev => [
            ...prev,
            {
              id: result.appointment?.id || Date.now().toString(),
              patientId: schedulePatient.id,
              patientName: schedulePatient.name,
              type: scheduleType,
              scheduledAt: scheduleDate,
              notes: scheduleNotes,
              status: "SCHEDULED",
            },
          ].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
        }
        // Update patient's nextAppointment
        setPatients(prev =>
          prev.map(p =>
            p.id === schedulePatient.id
              ? {
                  ...p,
                  nextAppointment: {
                    id: result.appointment?.id,
                    type: scheduleType,
                    scheduledAt: scheduleDate,
                    notes: scheduleNotes,
                  },
                }
              : p
          )
        );
        setScheduleDialogOpen(false);
      }
    });
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, "COMPLETED");
      if (result?.error) {
        toast.error(result.error);
      } else {
        setTodayAppointments(prev =>
          prev.map(a => (a.id === appointmentId ? { ...a, status: "COMPLETED" } : a))
        );
        toast.success(t("completed"));
      }
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, "CANCELLED");
      if (result?.error) {
        toast.error(result.error);
      } else {
        setTodayAppointments(prev =>
          prev.map(a => (a.id === appointmentId ? { ...a, status: "CANCELLED" } : a))
        );
        toast.success(t("cancelled"));
      }
    });
  };

  // ── Helpers ──

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

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case "CALL": return <Phone className="w-4 h-4" />;
      case "VIDEO_CALL": return <Video className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getAppointmentLabel = (type: string) => {
    switch (type) {
      case "CALL": return t("call");
      case "VIDEO_CALL": return t("videoCall");
      default: return t("inPerson");
    }
  };

  // ── Filtered Patients ──

  const filteredPatients = patients.filter((p: any) => {
    switch (activeFilter) {
      case "needsReview": return !p.isReviewed;
      case "critical": return p.status === "RED" || p.status === "YELLOW" || p.aiAlertLevel === "HIGH";
      case "scheduled": return p.nextAppointment != null;
      default: return true;
    }
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
            {t("title").split(" ")[0]} <span className="text-primary italic">{t("title").split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t("welcome", { name: userName })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg h-12 px-6 font-bold transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                {t("invitePatient")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle>{t("invitePatient")}</DialogTitle>
                <DialogDescription>
                  {t("inviteDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center space-x-2 py-6">
                {inviteCode ? (
                  <div className="text-4xl font-black tracking-widest text-primary border-2 border-primary/20 bg-primary/5 rounded-2xl px-8 py-4 w-full text-center">
                    {inviteCode}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">{t("noCode")}</p>
                )}
              </div>
              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="outline" className="rounded-xl font-bold bg-background/50 h-12 flex-1 border-border">
                  {t("close")}
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  className="rounded-xl font-bold bg-secondary hover:bg-secondary/90 text-white h-12 flex-1 shadow-lg"
                >
                  {isGeneratingCode ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                  {inviteCode ? t("generateNewCode") : t("generateCode")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Grid — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-none shadow-lg hover:shadow-xl transition-all h-full group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("totalPatients")}</CardTitle>
              <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-secondary dark:text-white">{metrics.totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3 text-success" /> {t("activeRoster")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass border-none shadow-lg hover:shadow-xl transition-all h-full group cursor-pointer" onClick={() => setActiveFilter(activeFilter === "critical" ? "all" : "critical")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("criticalVitals")}</CardTitle>
              <div className="p-2 rounded-xl bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-secondary dark:text-white">{metrics.criticalPatients}</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium text-destructive">
                {t("abnormalVitals")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass border-none shadow-lg hover:shadow-xl transition-all h-full group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("aiHighAlerts")}</CardTitle>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <Brain className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-secondary dark:text-white">{metrics.aiHighAlerts ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium text-orange-500">
                {t("aiFlaggedHigh")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass border-none shadow-lg hover:shadow-xl transition-all h-full group cursor-pointer" onClick={() => setActiveFilter(activeFilter === "needsReview" ? "all" : "needsReview")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("pendingReviews")}</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-secondary dark:text-white">{metrics.pendingReviews}</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium text-blue-500">
                {t("newIntakeForms")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Agenda */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-b border-border/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" /> {t("todayAgenda")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appt: any) => (
                  <div
                    key={appt.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      appt.status === "COMPLETED"
                        ? "bg-success/5 border-success/20 opacity-60"
                        : appt.status === "CANCELLED"
                        ? "bg-muted/20 border-border/30 opacity-40 line-through"
                        : "bg-primary/5 border-primary/10 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        appt.status === "COMPLETED" ? "bg-success/10 text-success" :
                        appt.status === "CANCELLED" ? "bg-muted/20 text-muted-foreground" :
                        "bg-primary/10 text-primary"
                      )}>
                        {getAppointmentIcon(appt.type)}
                      </div>
                      <div>
                        <p className="font-bold text-secondary dark:text-white text-sm">
                          {getAppointmentLabel(appt.type)} {t("appointmentWith")} {appt.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {mounted ? format.dateTime(new Date(appt.scheduledAt), {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "..."}
                          {appt.notes && <span className="ml-2 italic">— {appt.notes}</span>}
                        </p>
                      </div>
                    </div>
                    {appt.status === "SCHEDULED" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success hover:bg-success/10 h-8 px-3 font-bold text-xs"
                          onClick={() => handleCompleteAppointment(appt.id)}
                          disabled={isPending}
                        >
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          {t("completeAppointment")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 h-8 px-3 font-bold text-xs"
                          onClick={() => handleCancelAppointment(appt.id)}
                          disabled={isPending}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          {t("cancelAppointment")}
                        </Button>
                      </div>
                    )}
                    {appt.status === "COMPLETED" && (
                      <Badge variant="outline" className="border-success/30 text-success bg-success/5 font-bold text-xs">
                        {t("completed")}
                      </Badge>
                    )}
                    {appt.status === "CANCELLED" && (
                      <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/5 font-bold text-xs">
                        {t("cancelled")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Calendar className="w-5 h-5 mr-2 opacity-40" />
                <span className="text-sm font-medium">{t("noAppointments")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Patient List */}
      <Card className="glass border-none shadow-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> {t("myPatients")}
              </CardTitle>
              <CardDescription>{t("overviewPatients")}</CardDescription>
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl">
              {(["all", "needsReview", "critical", "scheduled"] as FilterType[]).map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={activeFilter === filter ? "default" : "ghost"}
                  className={cn(
                    "h-8 px-3 text-xs font-bold rounded-lg transition-all",
                    activeFilter === filter
                      ? "bg-primary text-white shadow-md"
                      : "text-muted-foreground hover:text-secondary"
                  )}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === "all" && t("allPatients")}
                  {filter === "needsReview" && t("needsReview")}
                  {filter === "critical" && t("critical")}
                  {filter === "scheduled" && t("scheduledToday")}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/30 text-muted-foreground font-black tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">{t("tablePatient")}</th>
                  <th scope="col" className="px-6 py-4">{t("tableSegment")}</th>
                  <th scope="col" className="px-6 py-4">{t("tableStatus")}</th>
                  <th scope="col" className="px-6 py-4">{t("tableAlert")}</th>
                  <th scope="col" className="px-6 py-4">{t("tableUpdate")}</th>
                  <th scope="col" className="px-6 py-4 text-right">{t("tableAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <AnimatePresence>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient: any, index: number) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/10 transition-colors group"
                      >
                        <td className="px-6 py-5 font-bold text-secondary dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                                {patient.name[0]?.toUpperCase()}
                              </div>
                              {/* Review indicator */}
                              {patient.isReviewed ? (
                                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success flex items-center justify-center">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                </div>
                              ) : (
                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 animate-pulse" />
                              )}
                            </div>
                            <div>
                              {patient.name}
                              {patient.nextAppointment && (
                                <p className="text-[10px] text-primary font-medium flex items-center gap-1 mt-0.5">
                                  {getAppointmentIcon(patient.nextAppointment.type)}
                                  {mounted ? format.dateTime(new Date(patient.nextAppointment.scheduledAt), {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }) : "..."}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary dark:text-white">
                            {patient.segment.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest border", getStatusColor(patient.status))}>
                            {getStatusIcon(patient.status)}
                            {patient.status}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {patient.aiAlertLevel ? (
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest border",
                              patient.aiAlertLevel === "HIGH" ? "text-orange-500 bg-orange-500/10 border-orange-500/20" :
                              patient.aiAlertLevel === "MODERATE" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                              "text-success bg-success/10 border-success/20"
                            )}>
                              {patient.aiAlertLevel === "HIGH" ? <AlertCircle className="w-3 h-3" /> : patient.aiAlertLevel === "MODERATE" ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              {patient.aiAlertLevel}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted/30 border border-border/30">
                              <Minus className="w-3 h-3" /> {t("noAnalysis")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-muted-foreground font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 opacity-50" />
                            {mounted ? format.dateTime(new Date(patient.lastUpdate), {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }) : "..."}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/patient/${patient.id}`}>
                              <Button variant="ghost" size="sm" className="font-bold hover:text-primary transition-colors h-8 px-3 text-xs">
                                {t("viewDetails")}
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                {!patient.isReviewed && (
                                  <DropdownMenuItem
                                    className="font-semibold cursor-pointer"
                                    onClick={() => handleMarkReviewed(patient.id)}
                                    disabled={isPending}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                                    {t("markReviewed")}
                                  </DropdownMenuItem>
                                )}
                                {patient.isReviewed && (
                                  <DropdownMenuItem disabled className="font-semibold text-success">
                                    <CheckCheck className="w-4 h-4 mr-2" />
                                    {t("reviewed")}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="font-semibold cursor-pointer"
                                  onClick={() => openScheduleDialog(patient, "IN_PERSON")}
                                >
                                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                                  {t("scheduleAppointment")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="font-semibold cursor-pointer"
                                  onClick={() => openScheduleDialog(patient, "CALL")}
                                >
                                  <Phone className="w-4 h-4 mr-2 text-blue-500" />
                                  {t("scheduleCall")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="font-semibold cursor-pointer"
                                  onClick={() => openScheduleDialog(patient, "VIDEO_CALL")}
                                >
                                  <Video className="w-4 h-4 mr-2 text-violet-500" />
                                  {t("videoCall")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Users className="w-10 h-10 text-muted-foreground/30" />
                          <p className="font-bold">{t("noPatients")}</p>
                          <p className="text-xs">{t("clickInvite")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Appointment Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md glass border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getAppointmentIcon(scheduleType)}
              {scheduleType === "CALL" ? t("scheduleCall") : scheduleType === "VIDEO_CALL" ? t("videoCall") : t("scheduleAppointment")}
            </DialogTitle>
            <DialogDescription>
              {schedulePatient?.name && (
                <span className="font-semibold text-secondary dark:text-white">{schedulePatient.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-bold text-secondary dark:text-white mb-2 block">
                {t("appointmentDate")}
              </label>
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="rounded-xl h-12 font-medium"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-secondary dark:text-white mb-2 block">
                {t("appointmentNotes")}
              </label>
              <Textarea
                placeholder={t("notesPlaceholder")}
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                className="rounded-xl min-h-[80px] font-medium"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
              className="rounded-xl font-bold bg-background/50 h-12 flex-1 border-border"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleScheduleAppointment}
              disabled={!scheduleDate || isPending}
              className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white h-12 flex-1 shadow-lg"
            >
              {isPending ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
