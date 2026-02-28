"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getPatientProfile, updatePatientProfile } from "@/app/actions/profile";
import { useTranslations } from "next-intl";

const profileSchema = z.object({
  gender: z.string().min(1, "Please select a gender"),
  birthDate: z.string().min(1, "Please select a birth date"),
});

export function ProfileForm() {
  const t = useTranslations("Profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: "",
      birthDate: "",
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      const res = await getPatientProfile();
      if (res?.data) {
        form.reset({
          gender: res.data.gender || "",
          birthDate: res.data.birthDate ? new Date(res.data.birthDate).toISOString().split('T')[0] : "",
        });
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsSaving(true);
    const result = await updatePatientProfile({
      gender: values.gender,
      birthDate: new Date(values.birthDate),
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("profileUpdated"));
    }
    setIsSaving(false);
  }

  if (isLoading) return <div className="animate-pulse h-64 bg-muted/50 rounded-xl" />;

  return (
    <Card className="glass border-none shadow-2xl mt-8">
      <CardHeader>
        <CardTitle>{t("personalInfo")}</CardTitle>
        <CardDescription>{t("personalInfoDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("gender")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder={t("selectGender")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">{t("male")}</SelectItem>
                        <SelectItem value="FEMALE">{t("female")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("birthDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="font-bold">
                {isSaving ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
