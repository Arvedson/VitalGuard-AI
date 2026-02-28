"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Clock,
  ShieldAlert,
  Lightbulb,
  Activity,
  Stethoscope
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateAIInsight, getPatientInsights } from "@/app/actions/insights";

export default function HealthInsightsPage() {
  const t = useTranslations("HealthInsights");
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetch() {
      const result = await getPatientInsights();
      if (result?.insights) setInsights(result.insights);
      setIsLoading(false);
    }
    fetch();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateAIInsight();
    setIsGenerating(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(t("successMessage"));
      // Refresh 
      const updated = await getPatientInsights();
      if (updated?.insights) setInsights(updated.insights);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-success" />;
      case "worsening": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
      case "HIGH":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest border text-destructive bg-destructive/10 border-destructive/20">
            <AlertCircle className="w-3 h-3" /> {t("highAlert")}
          </div>
        );
      case "MODERATE":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest border text-yellow-500 bg-yellow-500/10 border-yellow-500/20">
            <AlertTriangle className="w-3 h-3" /> {t("moderateAlert")}
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest border text-success bg-success/10 border-success/20">
            <CheckCircle2 className="w-3 h-3" /> {t("lowAlert")}
          </div>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-destructive";
      case "medium": return "border-l-yellow-500";
      default: return "border-l-success";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
            {t("title")} <span className="text-primary italic">{t("subtitle")}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t("description")}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg h-12 px-6 font-bold transition-all active:scale-95"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          {isGenerating ? t("generating") : t("generateButton")}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : insights.length === 0 ? (
        <Card className="glass border-none shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Brain className="w-16 h-16 text-muted-foreground/20" />
            <h2 className="text-xl font-bold text-secondary dark:text-white">{t("noInsights")}</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {t("noInsightsDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass border-none shadow-2xl overflow-hidden">
                  {/* Insight Header */}
                  <CardHeader className="bg-primary/5 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        {t("wellnessAnalysis")}
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        {getAlertBadge(insight.alertLevel)}
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1" suppressHydrationWarning>
                          <Clock className="w-3 h-3" />
                          {new Date(insight.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Health Summary */}
                    <div className="p-4 bg-muted/20 rounded-xl">
                      <p className="text-sm text-secondary dark:text-white leading-relaxed">
                        {insight.healthSummary}
                      </p>
                    </div>

                    {/* Alert Banner */}
                    {insight.alertLevel === "HIGH" && (
                      <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                        <ShieldAlert className="w-6 h-6 text-destructive flex-shrink-0" />
                        <div>
                          <p className="font-bold text-destructive text-sm">{t("consultationRecommended")}</p>
                          <p className="text-xs text-muted-foreground">{t("consultationDesc")}</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto text-destructive border-destructive/30 hover:bg-destructive/10 font-bold rounded-xl flex-shrink-0">
                          <Stethoscope className="w-4 h-4 mr-1" /> {t("contactDoctor")}
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Predictions */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" /> {t("predictions")}
                        </h3>
                        <div className="space-y-2">
                          {insight.predictions.map((pred: any, i: number) => (
                            <div key={i} className="p-3 bg-muted/15 rounded-xl border border-border/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-secondary dark:text-white">{pred.title}</span>
                                {getTrendIcon(pred.trend)}
                              </div>
                              <p className="text-xs text-muted-foreground">{pred.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Habit Improvements */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" /> {t("habitImprovements")}
                        </h3>
                        <div className="space-y-2">
                          {insight.habitImprovements.map((habit: any, i: number) => (
                            <div key={i} className={cn("p-3 bg-muted/15 rounded-xl border-l-4", getPriorityColor(habit.priority))}>
                              <span className="font-bold text-xs uppercase tracking-widest text-primary">{habit.category}</span>
                              <p className="text-xs text-muted-foreground mt-1">{habit.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[10px] text-muted-foreground/60 italic text-center pt-4 border-t border-border/30">
                      {insight.disclaimer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
