"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updatePatientProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { User, Calendar, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function CompleteProfileForm() {
  const t = useTranslations("Onboarding");
  const tProfile = useTranslations("Profile");
  
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || !birthDate) {
      toast.error(t("errorFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePatientProfile({
        gender: gender.toUpperCase(),
        birthDate: new Date(birthDate),
      });

      if (res.success) {
        toast.success(t("success"));
        window.location.reload(); // Refresh to trigger segment update
      } else {
        toast.error(res.error || "Error");
      }
    } catch (error) {
      toast.error("Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass border-primary/30 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t("completeProfile")}</CardTitle>
            <CardDescription>{t("profileDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">{t("yourGender")}</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">{t("select")}</option>
              <option value="MALE">{tProfile("male")}</option>
              <option value="FEMALE">{tProfile("female")}</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">{t("yourAge")}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          <Button 
            disabled={isSubmitting}
            className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg active:scale-95"
          >
            {isSubmitting ? t("saving") : t("activateMode")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
