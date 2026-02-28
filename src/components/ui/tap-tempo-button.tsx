import React from "react";
import { Button } from "@/components/ui/button";
import { HeartPulse } from "lucide-react";
import { useTranslations } from "next-intl";

interface TapTempoButtonProps {
  onTap: (e?: React.MouseEvent) => void;
  className?: string;
  text?: string;
}

export function TapTempoButton({ onTap, className = "", text = "Tap con cada latido" }: TapTempoButtonProps) {
  return (
    <Button 
      type="button"
      onClick={onTap} 
      className={`w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 border-2 border-dashed border-indigo-500/40 transition-all active:scale-95 whitespace-normal h-12 rounded-xl py-1 px-2 text-[10px] leading-none flex items-center gap-1.5 group ${className}`}
      variant="outline"
      size="sm"
    >
      <HeartPulse className="w-4 h-4 shrink-0 animate-pulse group-hover:scale-110 transition-transform" />
      <span className="text-left font-black uppercase tracking-tighter leading-[1.1]">{text}</span>
    </Button>
  );
}
