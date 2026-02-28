"use client";

import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const data = [
  { time: "08:00", heartRate: 72, bp: 120 },
  { time: "10:00", heartRate: 75, bp: 122 },
  { time: "12:00", heartRate: 82, bp: 128 },
  { time: "14:00", heartRate: 78, bp: 125 },
  { time: "16:00", heartRate: 74, bp: 121 },
  { time: "18:00", heartRate: 70, bp: 118 },
  { time: "20:00", heartRate: 68, bp: 115 },
];

export function VitalsChart() {
  const t = useTranslations("Dashboard");

  return (
    <Card className="glass shadow-xl overflow-hidden border-none h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{t("healthTrends")}</CardTitle>
        <CardDescription>{t("healthTrendsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="h-full pb-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--card)", 
                borderColor: "var(--border)", 
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="heartRate" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorHr)" 
              animationDuration={2000}
            />
            <Line 
              type="monotone" 
              dataKey="bp" 
              stroke="var(--accent)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "var(--accent)" }}
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
