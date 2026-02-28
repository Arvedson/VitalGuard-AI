"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateInviteCode } from "@/app/actions/doctor";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function DoctorDashboardUI({ userName, initialData }: { userName: string, initialData: any }) {
  const format = useFormatter();
  const t = useTranslations("DoctorDashboard");
  const [inviteCode, setInviteCode] = useState(initialData?.inviteCode);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = initialData?.metrics || { totalPatients: 0, criticalPatients: 0, pendingReviews: 0 };
  const patients = initialData?.patients || [];

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
          <Card className="glass border-none shadow-lg hover:shadow-xl transition-all h-full group">
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
          <Card className="glass border-none shadow-lg hover:shadow-xl transition-all h-full group">
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

      {/* Patient List */}
      <Card className="glass border-none shadow-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> {t("myPatients")}
          </CardTitle>
          <CardDescription>{t("overviewPatients")}</CardDescription>
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
                  {patients.length > 0 ? (
                    patients.map((patient: any, index: number) => (
                      <motion.tr 
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/10 transition-colors group"
                      >
                        <td className="px-6 py-5 font-bold text-secondary dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                              {patient.name[0]?.toUpperCase()}
                            </div>
                            {patient.name}
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
                               year: 'numeric',
                               month: '2-digit',
                               day: '2-digit'
                             }) : "..."}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link href={`/patient/${patient.id}`}>
                            <Button variant="ghost" size="sm" className="font-bold hover:text-primary transition-colors">
                              {t("viewDetails")}
                            </Button>
                          </Link>
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

    </div>
  );
}
