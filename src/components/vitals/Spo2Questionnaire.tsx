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
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Spo2QuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
}

export function Spo2Questionnaire({ isOpen, onClose, onApply }: Spo2QuestionnaireProps) {
  const t = useTranslations("Vitals");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const questions = [
    { id: "q1", label: t("q1") },
    { id: "q2", label: t("q2") },
    { id: "q3", label: t("q3") },
    { id: "q4", label: t("q4") },
    { id: "q5", label: t("q5") },
    { id: "q6", label: t("q6") },
    { id: "q7", label: t("q7") },
    { id: "q8", label: t("q8") },
    { id: "q9", label: t("q9") },
    { id: "q10", label: t("q10") },
  ];

  const yesCount = Object.values(answers).filter(Boolean).length;

  const calculateEstimate = () => {
    if (yesCount >= 5 || answers.q5 || answers.q6) return 90;
    if (yesCount >= 2) return 94;
    return 98;
  };

  const estimate = calculateEstimate();

  const handleToggle = (id: string) => {
    setAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRiskLevel = () => {
    if (estimate <= 90) return { label: t("riskHigh"), color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle };
    if (estimate <= 94) return { label: t("riskModerate"), color: "text-orange-500", bg: "bg-orange-500/10", icon: Info };
    return { label: t("riskLow"), color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
  };

  const risk = getRiskLevel();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            {t("estimationTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("estimationDesc")}
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
              <span className="text-2xl font-black">{estimate}% SpO2</span>
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
