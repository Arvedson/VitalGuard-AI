"use client";

import React, { useEffect, useState } from "react";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Heart, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { useTranslations } from "next-intl";

export function ECGVisualization({ latestVitals }: { latestVitals?: any }) {
  const [data, setData] = useState<any[]>([]);
  const t = useTranslations("ECG");

  useEffect(() => {
    // Generate a basic ECG-like wave
    const generateECG = () => {
      const points = [];
      for (let i = 0; i < 50; i++) {
        let val = 0;
        const x = i % 10;
        if (x === 4) val = 1.5; // P wave
        else if (x === 6) val = -0.5; // Q
        else if (x === 7) val = 5; // R
        else if (x === 8) val = -1; // S
        else if (x === 10) val = 0.5; // T
        
        points.push({ time: i, val: val + (Math.random() * 0.2) });
      }
      setData(points);
    };

    generateECG();
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const lastTime = prev[prev.length - 1].time;
        const x = (lastTime + 1) % 10;
        let val = 0;
        if (x === 4) val = 1.5;
        else if (x === 6) val = -0.5;
        else if (x === 7) val = 4;
        else if (x === 8) val = -1;
        else if (x === 10) val = 0.5;
        next.push({ time: lastTime + 1, val: val + (Math.random() * 0.1) });
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass border-none shadow-2xl relative overflow-hidden min-h-[300px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.1),transparent)] pointer-events-none" />
      
      <CardHeader className="pb-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
            <CardTitle className="text-lg text-secondary dark:text-white">{t("title")}</CardTitle>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-ping" />
            <span className="text-[10px] uppercase font-black tracking-widest text-primary">{t("monitoring")}</span>
          </div>
        </div>
        <CardDescription className="text-slate-400">
          {latestVitals ? t("patientRecord", { fallback: "Último registro de actividad" }) : t("lead")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="h-[200px] p-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="val" 
              stroke="var(--primary)" 
              strokeWidth={3} 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Grid lines overlay */}
        <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-around px-10">
           <div className="flex flex-col items-center gap-1 opacity-70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t("hr", { fallback: "HR" })}</span>
              <span className="text-xl font-black text-white">
                {latestVitals?.heartRate || "--"} <span className="text-[10px] text-primary">bpm</span>
              </span>
           </div>
           <div className="flex flex-col items-center gap-1 opacity-70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">PA</span>
              <span className="text-xl font-black text-white">
                {latestVitals?.systolicBP ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}` : '--'} <span className="text-[10px] text-primary">mmHg</span>
              </span>
           </div>
           <div className="flex flex-col items-center gap-1 opacity-70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SpO2</span>
              <span className="text-xl font-black text-white">
                {latestVitals?.spo2 || "--"} <span className="text-[10px] text-primary">%</span>
              </span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
