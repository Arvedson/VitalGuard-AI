"use client";

import React from "react";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ChevronRight,
  Lightbulb,
  Stethoscope
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdviceItem {
  id: string;
  type: "prediction" | "insight" | "prevention";
  content: string;
  trend?: "up" | "down" | "stable";
}

interface AIAdvicePanelProps {
  advices: AdviceItem[];
}

import { useTranslations } from "next-intl";

export function AIAdvicePanel({ advices }: AIAdvicePanelProps) {
  const t = useTranslations("AIAdvice");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-bold">{t("title").split(" ")[0]} <span className="text-primary italic">{t("title").split(" ")[1]}</span></h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5">
          {t("viewDetail")} <ChevronRight className="ml-1 w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-4 flex-1">
        {advices.map((advice, index) => (
          <motion.div
            key={advice.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/5 transition-colors group cursor-default"
          >
            <div className="flex gap-4">
              <div className={cn(
                "p-2 rounded-xl h-fit",
                advice.type === "prediction" ? "bg-purple-500/10 text-purple-500" :
                advice.type === "insight" ? "bg-blue-500/10 text-blue-500" :
                "bg-success/10 text-success"
              )}>
                {advice.type === "prediction" ? <TrendingUp className="w-4 h-4" /> :
                 advice.type === "insight" ? <Lightbulb className="w-4 h-4" /> :
                 <ShieldCheck className="w-4 h-4" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {t(advice.type)}
                  </span>
                  {advice.trend && (
                    <span className={cn(
                      "text-[10px] font-bold flex items-center gap-1",
                      advice.trend === "up" ? "text-danger" : "text-success"
                    )}>
                      {advice.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {t(advice.trend === "up" ? "trendUp" : "trendDown")}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium leading-relaxed group-hover:text-secondary dark:group-hover:text-white transition-colors">
                  {advice.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-8 p-4 rounded-2xl bg-muted/30 border border-border/50 flex gap-3">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{t("disclaimer")}</p>
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">
            {t("disclaimerText")} 
            <span className="font-bold text-secondary dark:text-white ml-1">{t("consultDoctor")}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
