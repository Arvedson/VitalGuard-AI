"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Baby, 
  Activity, 
  User, 
  Settings,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export type PatientSegment = "GENERAL" | "CHILD" | "ADULT" | "ELDERLY" | "CHRONIC_HYPERTENSION" | "CHRONIC_DIABETES" | "CHRONIC_OBESITY" | "PREGNANCY";

interface PatientSegmentViewProps {
  segment: PatientSegment;
  children: React.ReactNode;
}

export function PatientSegmentView({ segment, children }: PatientSegmentViewProps) {
  const t = useTranslations("Segments");
  // 1. Accessibility Features (Elderly)
  const isElderly = segment === "ELDERLY";
  const isPregnancy = segment === "PREGNANCY";
  const isChild = segment === "CHILD";
  const isAdult = segment === "ADULT";
  const isChronic = segment.startsWith("CHRONIC_");

  return (
    <div className={cn(
      "space-y-6 transition-all duration-500",
      isElderly ? "text-lg md:text-xl" : "text-base"
    )}>
      {/* Segment Indicator Badge Header */}
      <div className="flex items-center gap-3">
        <Badge className={cn(
          "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm animate-fade-in",
          isElderly ? "bg-blue-500/20 text-blue-600 border-blue-500/30" :
          isPregnancy ? "bg-pink-500/20 text-pink-600 border-pink-500/30" :
          isChild ? "bg-cyan-500/20 text-cyan-600 border-cyan-500/30" :
          isAdult ? "bg-primary/20 text-primary border-primary/30" :
          isChronic ? "bg-orange-500/20 text-orange-600 border-orange-500/30" :
          "bg-primary/20 text-primary border-primary/30"
        )}>
          {t("mode", { segment: t(segment) })}
        </Badge>
        <span className="text-xs font-bold text-muted-foreground italic">
          {t("optimized")}
        </span>
      </div>

      {/* Segment Specific Alert Box */}
      {isElderly && (
        <Card className="bg-blue-50/50 border-blue-200 shadow-xl overflow-hidden glass animate-fade-in">
          <CardContent className="p-6 flex items-start gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0">
               <User className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h4 className="text-xl font-black text-blue-900 mb-1">{t("highAccessibility")}</h4>
              <p className="text-blue-700/80 font-medium">{t("highAccessibilityDesc")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPregnancy && (
        <Card className="bg-pink-50/50 border-pink-200 shadow-xl glass animate-fade-in">
          <CardContent className="p-6 flex items-start gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0">
               <Baby className="w-8 h-8 text-pink-500" />
            </div>
            <div>
              <h4 className="text-xl font-black text-pink-900 mb-1">{t("maternalHealth")}</h4>
              <p className="text-pink-700/80 font-medium">{t("maternalHealthDesc")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Wrap */}
      <div className={cn(
        "grid grid-cols-1 gap-10",
        isElderly ? "elderly-theme" : ""
      )}>
        {children}
      </div>

      {/* Segment Summary Footer */}
      <div className="pt-10 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("trackingPriority")}</span>
            <span className="font-bold text-secondary dark:text-white">
               {isPregnancy ? t("fetalMaternalSync") : isChronic ? t("timeSeriesAnomaly") : t("geriatricWellness")}
            </span>
         </div>
         <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("escalationChannel")}</span>
            <span className="font-bold text-success">{t("verifiedClinician")}</span>
         </div>
         <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("dataRetention")}</span>
            <span className="font-bold text-secondary dark:text-white underline decoration-primary underline-offset-4">{t("lifetimeHistory")}</span>
         </div>
      </div>
    </div>
  );
}
