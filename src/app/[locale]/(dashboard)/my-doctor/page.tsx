"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Stethoscope,
  Calendar,
  Clock,
  Bell,
  Plus,
  Phone,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Check,
  ChevronRight,
  CalendarPlus,
  BellRing,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  getMyDoctorInfo,
  getMyAppointments,
  requestAppointment,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/patient";

export default function MyDoctorPage() {
  const t = useTranslations("MyDoctor");

  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"appointments" | "notifications" | "request">("appointments");

  // Request form
  const [reqType, setReqType] = useState("IN_PERSON");
  const [reqDate, setReqDate] = useState("");
  const [reqNotes, setReqNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      try {
        const [docRes, appRes, notifRes] = await Promise.all([
          getMyDoctorInfo(),
          getMyAppointments(),
          getMyNotifications(),
        ]);
        if (docRes?.doctor) setDoctor(docRes.doctor);
        if (appRes?.appointments) setAppointments(appRes.appointments);
        if (notifRes?.notifications) setNotifications(notifRes.notifications);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleRequestAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDate) {
      toast.error(t("dateRequired"));
      return;
    }
    setIsSubmitting(true);
    const result = await requestAppointment(reqType, reqDate, reqNotes);
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(t("requestSuccess"));
      setReqType("IN_PERSON");
      setReqDate("");
      setReqNotes("");
      setActiveTab("appointments");
      // Refresh
      const appRes = await getMyAppointments();
      if (appRes?.appointments) setAppointments(appRes.appointments);
    }
  };

  const handleMarkRead = async (id: string) => {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    });
  };

  const handleMarkAllRead = async () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case "IN_PERSON": return <MapPin className="w-4 h-4" />;
      case "CALL": return <Phone className="w-4 h-4" />;
      case "VIDEO_CALL": return <Video className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getAppointmentLabel = (type: string) => {
    switch (type) {
      case "IN_PERSON": return t("inPerson");
      case "CALL": return t("call");
      case "VIDEO_CALL": return t("videoCall");
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <Clock className="w-3 h-3" /> {t("scheduled")}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
            <CheckCircle2 className="w-3 h-3" /> {t("completed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3 h-3" /> {t("cancelled")}
          </span>
        );
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT_SCHEDULED": return <Calendar className="w-5 h-5 text-primary" />;
      case "APPOINTMENT_COMPLETED": return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "APPOINTMENT_CANCELLED": return <XCircle className="w-5 h-5 text-destructive" />;
      default: return <Bell className="w-5 h-5 text-yellow-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No doctor linked
  if (!doctor) {
    return (
      <div className="max-w-2xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
            {t("title")} <span className="text-primary italic">{t("subtitle")}</span>
          </h1>
        </div>
        <Card className="glass border-none shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Stethoscope className="w-16 h-16 text-muted-foreground/20" />
            <h2 className="text-xl font-bold text-secondary dark:text-white">{t("noDoctor")}</h2>
            <p className="text-muted-foreground text-center max-w-md">{t("noDoctorDesc")}</p>
            <Link href="/link-doctor">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg h-12 px-6 font-bold mt-4">
                <Plus className="w-5 h-5 mr-2" /> {t("linkDoctor")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
          {t("title")} <span className="text-primary italic">{t("subtitle")}</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">{t("description")}</p>
      </div>

      {/* Doctor Info Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass border-none shadow-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-secondary dark:text-white">Dr. {doctor.name}</h2>
                <p className="text-sm text-muted-foreground">{doctor.specialty || t("generalPractice")}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-black tracking-widest border border-success/20">
                <CheckCircle2 className="w-3 h-3" /> {t("linked")}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "appointments" ? "default" : "outline"}
          onClick={() => setActiveTab("appointments")}
          className={cn(
            "rounded-xl font-bold transition-all",
            activeTab === "appointments"
              ? "bg-primary text-white shadow-lg"
              : "hover:bg-muted"
          )}
        >
          <Calendar className="w-4 h-4 mr-2" /> {t("myAppointments")}
        </Button>
        <Button
          variant={activeTab === "request" ? "default" : "outline"}
          onClick={() => setActiveTab("request")}
          className={cn(
            "rounded-xl font-bold transition-all",
            activeTab === "request"
              ? "bg-primary text-white shadow-lg"
              : "hover:bg-muted"
          )}
        >
          <CalendarPlus className="w-4 h-4 mr-2" /> {t("requestAppointment")}
        </Button>
        <Button
          variant={activeTab === "notifications" ? "default" : "outline"}
          onClick={() => setActiveTab("notifications")}
          className={cn(
            "rounded-xl font-bold transition-all relative",
            activeTab === "notifications"
              ? "bg-primary text-white shadow-lg"
              : "hover:bg-muted"
          )}
        >
          <BellRing className="w-4 h-4 mr-2" /> {t("notifications")}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ── Appointments Tab ────────────────────────────── */}
        {activeTab === "appointments" && (
          <motion.div
            key="appointments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {appointments.length === 0 ? (
              <Card className="glass border-none shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                  <Calendar className="w-12 h-12 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-bold">{t("noAppointments")}</p>
                  <Button
                    variant="outline"
                    className="rounded-xl font-bold mt-2"
                    onClick={() => setActiveTab("request")}
                  >
                    <Plus className="w-4 h-4 mr-2" /> {t("requestFirst")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              appointments.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-3 rounded-xl",
                            app.status === "SCHEDULED" ? "bg-primary/10 text-primary" :
                            app.status === "COMPLETED" ? "bg-success/10 text-success" :
                            "bg-destructive/10 text-destructive"
                          )}>
                            {getAppointmentIcon(app.type)}
                          </div>
                          <div>
                            <h3 className="font-bold text-secondary dark:text-white">
                              {getAppointmentLabel(app.type)}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span suppressHydrationWarning>{new Date(app.scheduledAt).toLocaleString()}</span>
                            </p>
                            {app.notes && (
                              <p className="text-xs text-muted-foreground mt-2 bg-muted/30 px-3 py-1.5 rounded-lg">
                                {app.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* ── Request Appointment Tab ─────────────────────── */}
        {activeTab === "request" && (
          <motion.div
            key="request"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="glass border-none shadow-2xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-primary" /> {t("requestAppointment")}
                </CardTitle>
                <CardDescription>{t("requestDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleRequestAppointment} className="space-y-6">
                  {/* Type Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary dark:text-white">
                      {t("appointmentType")}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "IN_PERSON", icon: MapPin, label: t("inPerson") },
                        { value: "CALL", icon: Phone, label: t("call") },
                        { value: "VIDEO_CALL", icon: Video, label: t("videoCall") },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setReqType(opt.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                            reqType === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 text-muted-foreground hover:text-primary"
                          )}
                        >
                          <opt.icon className="w-6 h-6" />
                          <span className="text-xs font-bold">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date/Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary dark:text-white">
                      {t("preferredDate")}
                    </label>
                    <Input
                      type="datetime-local"
                      value={reqDate}
                      onChange={(e) => setReqDate(e.target.value)}
                      className="bg-background/50 h-12 rounded-xl"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary dark:text-white">
                      {t("notes")}
                    </label>
                    <Textarea
                      value={reqNotes}
                      onChange={(e) => setReqNotes(e.target.value)}
                      placeholder={t("notesPlaceholder")}
                      className="bg-background/50 rounded-xl resize-none"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !reqDate}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CalendarPlus className="w-5 h-5 mr-2" /> {t("submitRequest")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Notifications Tab ──────────────────────────── */}
        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {unreadCount > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-primary font-bold text-sm"
                >
                  <Check className="w-4 h-4 mr-1" /> {t("markAllRead")}
                </Button>
              </div>
            )}

            {notifications.length === 0 ? (
              <Card className="glass border-none shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                  <Bell className="w-12 h-12 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-bold">{t("noNotifications")}</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={cn(
                      "glass border-none shadow-lg transition-all cursor-pointer hover:shadow-xl",
                      !notif.isRead && "border-l-4 border-l-primary bg-primary/[0.02]"
                    )}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-muted/30">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              "text-sm",
                              notif.isRead ? "font-medium text-muted-foreground" : "font-bold text-secondary dark:text-white"
                            )}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2" suppressHydrationWarning>
                              {new Date(notif.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
