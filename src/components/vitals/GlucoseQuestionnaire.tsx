"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Info, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlucoseQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
}

export function GlucoseQuestionnaire({ isOpen, onClose, onApply }: GlucoseQuestionnaireProps) {
  const t = useTranslations("Vitals");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const questions = [
    { id: "gq1", label: t("gq1") },
    { id: "gq2", label: t("gq2") },
    { id: "gq3", label: t("gq3") },
    { id: "gq4", label: t("gq4") },
    { id: "gq5", label: t("gq5") },
    { id: "gq6", label: t("gq6") },
    { id: "gq7", label: t("gq7") },
    { id: "gq8", label: t("gq8") },
    { id: "gq9", label: t("gq9") },
    { id: "gq10", label: t("gq10") },
  ];

  const yesCount = Object.values(answers).filter(Boolean).length;

  const calculateEstimate = () => {
    if (yesCount >= 6) return 180;
    if (yesCount >= 3) return 140;
    return 100;
  };

  const estimate = calculateEstimate();

  const handleToggle = (id: string) => {
    setAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRiskLevel = () => {
    if (estimate >= 180) return { label: t("riskHigh"), color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle };
    if (estimate >= 140) return { label: t("riskModerate"), color: "text-orange-500", bg: "bg-orange-500/10", icon: Info };
    return { label: t("riskLow"), color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
  };

  const risk = getRiskLevel();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            {t("glucoseEstimationTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("glucoseEstimationDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-3">
            {questions.map((q) => (
              <div 
                key={q.id} 
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl transition-colors cursor-pointer",
                  answers[q.id] ? "bg-primary/10 border border-primary/20" : "bg-muted/30 border border-transparent hover:bg-muted/50"
                )}
                onClick={() => handleToggle(q.id)}
              >
                <Checkbox 
                  id={q.id} 
                  checked={answers[q.id] || false}
                  onCheckedChange={() => handleToggle(q.id)}
                  className="rounded-md"
                />
                <Label 
                  htmlFor={q.id} 
                  className="text-sm font-medium leading-tight cursor-pointer flex-1"
                >
                  {q.label}
                </Label>
              </div>
            ))}
          </div>

          <div className={cn("p-4 rounded-2xl flex flex-col gap-2 mt-4 transition-all duration-500", risk.bg)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                <risk.icon className={cn("w-4 h-4", risk.color)} />
                <span className={risk.color}>{risk.label}</span>
              </div>
              <span className="text-2xl font-black">{estimate} mg/dL</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              {t("back")}
            </Button>
            <Button 
              onClick={() => {
                onApply(estimate);
                onClose();
              }} 
              className="flex-1 rounded-xl font-bold bg-primary hover:bg-primary/90"
            >
              {t("applyEstimate")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
