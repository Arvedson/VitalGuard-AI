"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Scale, 
  Ruler, 
  Heart, 
  Wind,
  Baby,
  Save,
  AlertTriangle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { saveVitals } from "@/app/actions/vitals";
import { getPatientProfile } from "@/app/actions/profile";
import { useTapTempo } from "@/hooks/use-tap-tempo";
import { TapTempoButton } from "@/components/ui/tap-tempo-button";
import { RespiratoryTimerButton } from "@/components/ui/respiratory-timer-button";
import { Spo2Questionnaire } from "@/components/vitals/Spo2Questionnaire";

const vitalsSchema = z.object({
  systolicBP: z.coerce.number().optional(),
  diastolicBP: z.coerce.number().optional(),
  heartRate: z.coerce.number().optional(),
  respiratoryRate: z.coerce.number().optional(),
  temperature: z.coerce.number().optional(),
  spo2: z.coerce.number().optional(),
  glucose: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  fetalHeartRate: z.coerce.number().optional(),
});

type VitalsFormValues = {
  systolicBP?: number | string;
  diastolicBP?: number | string;
  heartRate?: number | string;
  respiratoryRate?: number | string;
  temperature?: number | string;
  spo2?: number | string;
  glucose?: number | string;
  weight?: number | string;
  height?: number | string;
  fetalHeartRate?: number | string;
};

import { useTranslations } from "next-intl";

export function AddVitalsForm() {
  const t = useTranslations("Vitals");
  const [patientGender, setPatientGender] = useState<string | null>(null);
  const [isSpo2ModalOpen, setIsSpo2ModalOpen] = useState(false);

  useEffect(() => {
    async function fetchGender() {
      const res = await getPatientProfile();
      if (res?.data?.gender) {
        setPatientGender(res.data.gender);
      }
    }
    fetchGender();
  }, []);

  const form = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema) as any,
    defaultValues: {
      systolicBP: "",
      diastolicBP: "",
      heartRate: "",
      respiratoryRate: "",
      temperature: "",
      spo2: "",
      glucose: "",
      weight: "",
      height: "",
      fetalHeartRate: "",
    },
  });

  const weight = form.watch("weight");
  const height = form.watch("height");
  const systolic = form.watch("systolicBP");

  const { handleTap: handleHeartRateTap } = useTapTempo((bpm) => {
    form.setValue("heartRate", bpm, { shouldValidate: true, shouldDirty: true });
  });

  const { handleTap: handleFetalHeartRateTap } = useTapTempo((bpm) => {
    form.setValue("fetalHeartRate", bpm, { shouldValidate: true, shouldDirty: true });
  });

  const handleRespRateChange = (bpm: number) => {
    form.setValue("respiratoryRate", bpm, { shouldValidate: true, shouldDirty: true });
  };

  const handleSpo2Apply = (value: number) => {
    form.setValue("spo2", value, { shouldValidate: true, shouldDirty: true });
  };

  const calculateBMI = () => {
    if (weight && height) {
      const w = Number(weight);
      const h = Number(height);
      const heightInMeters = h / 100;
      return (w / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  const onSubmit = async (values: VitalsFormValues) => {
    try {
      const result = await saveVitals(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("saveVitals"));
        form.reset();
      }
    } catch (error) {
      toast.error(t("errorSave"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* General Vitals - Takes more space */}
          <Card className="lg:col-span-8 glass shadow-xl border-t-4 border-t-primary animate-fade-in overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>{t("generalVitals")}</CardTitle>
              </div>
              <CardDescription>{t("generalDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6 pb-8">
              {/* Row 1: BP - Always 2 cols */}
              <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("bloodPressure")}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="systolicBP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase text-muted-foreground">{t("systolic")}</FormLabel>
                        <FormControl>
                          <Input placeholder="120" {...field} className="bg-background/80 h-10 text-base font-medium shadow-sm w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diastolicBP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase text-muted-foreground">{t("diastolic")}</FormLabel>
                        <FormControl>
                          <Input placeholder="80" {...field} className="bg-background/80 h-10 text-base font-medium shadow-sm w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Row 2: Heart Rate & Resp Rate - 2 Columns on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 flex flex-col justify-between">
                  <FormField
                    control={form.control}
                    name="heartRate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel className="text-[10px] font-bold uppercase text-indigo-600 tracking-tight">{t("heartRate")}</FormLabel>
                            <Heart className="w-3 h-3 text-indigo-500" />
                          </div>
                          <FormControl>
                            <Input placeholder="72" {...field} className="bg-background/80 h-10 text-base font-bold text-indigo-600 shadow-sm w-full" />
                          </FormControl>
                        </div>
                        <TapTempoButton onTap={handleHeartRateTap} className="mt-3 w-full" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-teal-500/5 p-4 rounded-2xl border border-teal-500/10 flex flex-col justify-between">
                  <FormField
                    control={form.control}
                    name="respiratoryRate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel className="text-[10px] font-bold uppercase text-teal-500 tracking-tight">{t("respiratory")}</FormLabel>
                            <Wind className="w-3 h-3 text-teal-500" />
                          </div>
                          <FormControl>
                            <Input placeholder="16" {...field} className="bg-background/80 h-10 text-base font-bold text-teal-500 shadow-sm w-full" />
                          </FormControl>
                        </div>
                        <RespiratoryTimerButton onChange={handleRespRateChange} className="mt-3 w-full" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Row 3: SpO2 & Temperature - 2 Columns on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex flex-col justify-between">
                  <FormField
                    control={form.control}
                    name="spo2"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel className="text-[10px] font-bold uppercase text-blue-500 tracking-tight">{t("spo2")}</FormLabel>
                            <Droplets className="w-3 h-3 text-blue-500" />
                          </div>
                          <FormControl>
                            <Input placeholder="98" {...field} className="bg-background/80 h-10 text-base font-bold text-blue-500 shadow-sm w-full" />
                          </FormControl>
                        </div>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="p-0 h-auto text-[10px] text-blue-500 font-bold hover:no-underline mt-3 flex items-center gap-1 w-fit group"
                          onClick={() => setIsSpo2ModalOpen(true)}
                        >
                          <div className="p-1 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                            <Info className="w-3 h-3" />
                          </div>
                          <span className="whitespace-nowrap">{t("noDevice")}</span>
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel className="text-[10px] font-bold uppercase text-orange-500 tracking-tight">{t("temperature")}</FormLabel>
                          <Thermometer className="w-3 h-3 text-orange-500" />
                        </div>
                        <FormControl>
                          <Input placeholder="36.6" {...field} className="bg-background/80 h-10 text-base font-bold text-orange-500 shadow-sm w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Spo2Questionnaire 
            isOpen={isSpo2ModalOpen} 
            onClose={() => setIsSpo2ModalOpen(false)} 
            onApply={handleSpo2Apply}
          />

          {/* Metabolic & Specialized - Sidebar style on desktop */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="glass shadow-xl border-t-4 border-t-accent animate-fade-in [animation-delay:200ms] overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Scale className="w-5 h-5 text-accent" />
                  </div>
                  <CardTitle>{t("metabolic")}</CardTitle>
                </div>
                <CardDescription>{t("metabolicDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>{t("weight")}</FormLabel>
                        <FormControl>
                          <Input placeholder="70" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>{t("height")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="175" {...field} className="pl-10 bg-background/50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {bmi && (
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">{t("calculatedBmi")}</span>
                      <span className="text-2xl font-black text-secondary dark:text-white">{bmi}</span>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      Number(bmi) < 18.5 ? "bg-blue-500/10 text-blue-500" :
                      Number(bmi) < 25 ? "bg-success/10 text-success" :
                      Number(bmi) < 30 ? "bg-orange-500/10 text-orange-500" :
                      "bg-danger/10 text-danger"
                    )}>
                      {Number(bmi) < 18.5 ? t("underweight") :
                       Number(bmi) < 25 ? t("healthy") :
                       Number(bmi) < 30 ? t("overweight") :
                       t("obese")}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="glucose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex min-h-[2.5rem] items-end pb-1">{t("glucose")}</FormLabel>
                      <FormControl>
                        <Input placeholder="90" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {patientGender !== "MALE" && (
                  <FormField
                    control={form.control}
                    name="fetalHeartRate"
                    render={({ field }) => (
                      <FormItem className="pt-2 border-t border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Baby className="w-4 h-4 text-pink-500" />
                          <FormLabel>{t("fetalHeart")}</FormLabel>
                        </div>
                        <FormControl>
                          <Input placeholder="140" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormDescription>{t("fetalDesc")}</FormDescription>
                        <FormMessage />
                        <TapTempoButton onTap={handleFetalHeartRateTap} className="mt-2" />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Emergency UI Trigger */}
            {systolic && Number(systolic) > 180 && (
              <div className="p-4 bg-danger text-white rounded-2xl shadow-xl flex items-start gap-4 animate-bounce">
                <AlertTriangle className="w-8 h-8 shrink-0" />
                <div>
                  <h4 className="font-black text-lg">{t("emergencyTitle")}</h4>
                  <p className="text-sm font-medium opacity-90">{t("emergencyDesc")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="px-10 py-6 text-lg font-bold rounded-2xl transition-all hover:shadow-2xl hover:shadow-primary/30 active:scale-95">
            <Save className="w-5 h-5 mr-2" />
            {t("saveVitals")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
