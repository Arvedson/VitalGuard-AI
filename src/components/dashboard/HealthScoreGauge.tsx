"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Activity, ShieldCheck, AlertCircle, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface HealthScoreGaugeProps {
  score: number; // 0-100
  label?: string;
}

export function HealthScoreGauge({ score, label }: HealthScoreGaugeProps) {
  const t = useTranslations("HealthScore");
  
  // Map score to color and status
  const getStatus = (s: number) => {
    if (s >= 75) return { color: "var(--success)", bg: "rgba(34, 197, 94, 0.1)", text: t("optimal"), icon: ShieldCheck };
    if (s >= 50) return { color: "var(--accent)", bg: "rgba(245, 158, 11, 0.1)", text: t("monitor"), icon: Zap };
    return { color: "var(--danger)", bg: "rgba(239, 68, 68, 0.1)", text: t("actionRequired"), icon: AlertCircle };
  };

  const status = getStatus(score);
  const StatusIcon = status.icon;

  // SVG Circle parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Shadow/Glow effect */}
        <div 
          className="absolute inset-4 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: status.color }}
        />
        
        {/* SVG Gauge */}
        <svg className="w-full h-full -rotate-90">
          {/* Background Track */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted/30"
          />
          {/* Progress Bar */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke={status.color}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-black tracking-tighter text-secondary dark:text-white"
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-[-4px]">
            {t("points")}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-col items-center"
      >
        <div 
          className="px-6 py-2 rounded-2xl flex items-center gap-2 border shadow-sm transition-all duration-500"
          style={{ backgroundColor: status.bg, borderColor: `${status.color}33`, color: status.color }}
        >
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-black uppercase tracking-wider">{status.text}</span>
        </div>
        
        <p className="mt-3 text-xs text-muted-foreground font-medium text-center max-w-[200px]">
          {score >= 75 
            ? t("optimalDesc") 
            : score >= 50 
            ? t("monitorDesc") 
            : t("actionRequiredDesc")}
        </p>
      </motion.div>
    </div>
  );
}
