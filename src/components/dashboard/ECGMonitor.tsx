"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";


export function ECGMonitor({ heartRate }: { heartRate?: number | null }) {
  const t = useTranslations("ECG");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const bpmRef = useRef<number>(heartRate || 60);

  useEffect(() => {
    if (heartRate) {
      bpmRef.current = heartRate;
    }
  }, [heartRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let x = 0;
    const points: number[] = [];
    const maxPoints = 200;
    const height = canvas.height;
    const width = canvas.width;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Grid
      ctx.strokeStyle = "rgba(16, 185, 129, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // ECG Logic
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();

      // Ajustamos la velocidad de la animación en base a los BPM calculados
      // A 60fps, 60 frames = 1 segundo = 60 BPM
      const framesPerBeat = Math.max(Math.round((60 / bpmRef.current) * 60), 15);
      
      let y = height / 2;
      const tFrame = x % framesPerBeat;
      
      // Dibujamos el complejo PQRST siempre al final de sus respectivos frames fijos (o escalados si se quiere)
      // Mantendremos el inicio del dibujo en los primeros 40 frames del ciclo para que no se deforme la onda
      if (tFrame > 15 && tFrame < 18) y -= 5; // P wave
      if (tFrame === 22) y += 10; // Q wave
      if (tFrame === 24) y -= 40; // R wave
      if (tFrame === 26) y += 15; // S wave
      if (tFrame > 32 && tFrame < 38) y -= 8; // T wave

      points.push(y);
      if (points.length > maxPoints) points.shift();

      points.forEach((p, i) => {
        const posX = (i / maxPoints) * width;
        if (i === 0) ctx.moveTo(posX, p);
        else ctx.lineTo(posX, p);
      });

      ctx.stroke();

      // Glow effect head
      const headX = (points.length / maxPoints) * width;
      const headY = points[points.length - 1];
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(headX, headY, 3, 0, Math.PI * 2);
      ctx.fill();

      x++;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <Card className="glass border-none shadow-2xl relative overflow-hidden group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            {heartRate ? `${heartRate} BPM` : t("liveMonitor", { fallback: "Live ECG Monitor" })}
          </CardTitle>
          <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {t("leadII", { fallback: "Lead II" })}
          </span>
        </div>
        <CardDescription className="text-[10px]">
          {heartRate ? t("patientRecord", { fallback: "Último registro del paciente" }) : t("simRhythm", { fallback: "Ritmo simulado" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={120} 
          className="w-full h-[120px] rounded-lg bg-black/5"
        />
      </CardContent>
    </Card>
  );
}
