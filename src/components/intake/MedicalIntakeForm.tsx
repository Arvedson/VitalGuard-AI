"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ClipboardList, 
  MapPin, 
  Activity, 
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { saveMedicalIntake } from "@/app/actions/intake";

const getIntakeSchema = (t: any) => z.object({
  // Historical Data
  familyHistory: z.string().min(1, t("errorFamily")),
  personalHabits: z.string().min(1, t("errorHabits")),
  environment: z.string().optional(),
  
  // Symptom Logger
  painLocation: z.string().min(1, t("errorPainLoc")),
  painIntensity: z.number().min(0).max(10),
  painIrradiation: z.string().optional(),
  symptomDescription: z.string().min(1, t("errorSymptoms")),
  
  // Habitus Exterior
  initialVisual: z.string().optional(),
});

type IntakeFormValues = z.infer<ReturnType<typeof getIntakeSchema>>;

import { useTranslations } from "next-intl";

export function MedicalIntakeForm() {
  const [step, setStep] = useState(1);
  const t = useTranslations("Intake");

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(getIntakeSchema(t)),
    defaultValues: {
      familyHistory: "",
      personalHabits: "",
      environment: "",
      painLocation: "",
      painIntensity: 5,
      painIrradiation: "",
      symptomDescription: "",
      initialVisual: "",
    },
  });

  const onSubmit = async (data: IntakeFormValues) => {
    try {
      const result = await saveMedicalIntake(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("saveIntake"), {
          description: t("intakeSuccessDesc"),
        });
        setStep(3); // Show success state
      }
    } catch (error) {
      toast.error(t("errorSave"));
    }
  };

  const nextStep = async () => {
    const fields = step === 1 
      ? ["familyHistory", "personalHabits"] 
      : ["painLocation", "symptomDescription"];
    
    const isValid = await form.trigger(fields as any);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              step === s ? "bg-primary text-white scale-110 shadow-lg" : 
              step > s ? "bg-success text-white" : "bg-muted text-muted-foreground"
            )}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={cn("w-12 h-0.5 bg-muted", step > s && "bg-success")} />}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="glass border-none shadow-2xl overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      {t("clinicalHistory")}
                    </CardTitle>
                    <CardDescription>{t("clinicalDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="familyHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("familyHeredity")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("familyPlaceholder")} 
                              className="bg-background/50 min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalHabits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("personalHabits")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("habitsPlaceholder")} 
                              className="bg-background/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="environment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("environmentalFactors")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t("envPlaceholder")}
                              className="bg-background/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>{t("envDescription")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep} className="rounded-xl px-8 h-12 font-bold">
                    {t("nextStep")} <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="glass border-none shadow-2xl overflow-hidden">
                  <CardHeader className="bg-orange-500/5 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      {t("symptomLogger")}
                    </CardTitle>
                    <CardDescription>{t("symptomDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="painLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-orange-500" />
                              {t("painLocation")}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={t("painPlaceholder")} {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="painIrradiation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {t("irradiation")}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder={t("irradiationPlaceholder")} {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="painIntensity"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-4">
                            <FormLabel>{t("painIntensity")}</FormLabel>
                            <span className={cn(
                              "text-sm font-black px-2 py-0.5 rounded-full",
                              field.value < 4 ? "bg-success/10 text-success" :
                              field.value < 7 ? "bg-accent/10 text-accent" :
                              "bg-danger/10 text-danger"
                            )}>
                              {field.value} / 10
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                            <span>{t("none")}</span>
                            <span>{t("moderate")}</span>
                            <span>{t("severe")}</span>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="symptomDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("detailedDescription")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("detailPlaceholder")} 
                              className="bg-background/50 min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={prevStep} className="rounded-xl px-8 h-12 font-bold hover:bg-muted">
                    <ChevronLeft className="mr-2 w-4 h-4" /> {t("back")}
                  </Button>
                  <Button type="submit" className="rounded-xl px-10 h-12 font-black shadow-xl">
                    <Save className="mr-2 w-5 h-5" /> {t("saveIntake")}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-card/50 backdrop-blur-xl rounded-[40px] border border-border shadow-2xl"
              >
                <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-secondary dark:text-white mb-4">{t("intakeComplete")}</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
                  {t("intakeSuccessDesc")}
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/">
                    <Button variant="outline" className="rounded-xl h-12 px-8 font-bold border-border">
                      {t("goDashboard")}
                    </Button>
                  </Link>
                  <Button className="rounded-xl h-12 px-8 font-black bg-primary text-white" onClick={() => setStep(1)}>
                    {t("newEntry")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}
