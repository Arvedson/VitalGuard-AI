"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Wind, Timer } from "lucide-react";
import { useRespiratoryTimer } from "@/hooks/use-respiratory-timer";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RespiratoryTimerButtonProps {
  onChange: (bpm: number) => void;
  className?: string;
}

export function RespiratoryTimerButton({ onChange, className }: RespiratoryTimerButtonProps) {
  const t = useTranslations("Vitals");
  const { handleStartHold, handleEndHold, isHolding } = useRespiratoryTimer(onChange);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        onMouseDown={handleStartHold}
        onMouseUp={handleEndHold}
        onMouseLeave={handleEndHold}
        onTouchStart={handleStartHold}
        onTouchEnd={handleEndHold}
        className={cn(
          "w-full h-12 rounded-xl font-bold transition-all duration-300 relative overflow-hidden select-none",
          isHolding 
            ? "bg-teal-500 text-white hover:bg-teal-600 scale-[0.98] shadow-inner" 
            : "bg-teal-500/20 text-teal-600 hover:bg-teal-500/30 border-2 border-dashed border-teal-500/40"
        )}
      >
        <div className="flex items-center gap-1.5 z-10 px-1 drop-shadow-sm">
          {isHolding ? (
            <Wind className="w-4 h-4 animate-pulse" />
          ) : (
            <Timer className="w-4 h-4" />
          )}
          <div className="flex flex-col items-start leading-[1.1]">
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {isHolding ? t("respTimerHold") : t("respTimer")}
            </span>
            <span className="text-[8px] opacity-80 font-bold uppercase tracking-tight mt-0.5">
              {isHolding ? t("respCounting") : t("respTimerRelease")}
            </span>
          </div>
        </div>
        
        {isHolding && (
          <div className="absolute inset-0 bg-white/10 animate-ping opacity-20" />
        )}
      </Button>
    </div>
  );
}
