"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Shield, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { registerUser } from "@/app/actions/auth";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PATIENT", "DOCTOR"]),
});

import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Auth");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "PATIENT",
    },
  });

  const searchParams = useSearchParams();
  const formRole = searchParams.get("role") === "doctor" ? "DOCTOR" : "PATIENT";
  const isDoctorRegistration = formRole === "DOCTOR";

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await registerUser({ ...values, role: formRole });
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("accountCreated"));
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.1),transparent)] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-secondary dark:text-white">
            Vital<span className="text-primary italic">Guard AI</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium italic">{t("slogan")}</p>
        </div>

        <Card className="glass border-none shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-xl font-bold">
              {isDoctorRegistration ? "Doctor Registration" : t("signUp")}
            </CardTitle>
            <CardDescription>
              {isDoctorRegistration ? "Create an account to manage your patients and practice." : t("signUpDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> {t("name")}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="bg-background/50 h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" /> {t("email")}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" className="bg-background/50 h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" /> {t("password")}
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="bg-background/50 h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>{t("signUpButton")} <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="p-8 pt-0 flex justify-center border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              {t("haveAccount")}{" "}
              <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">
                {t("signInButton")}
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* AI Trust Factor */}
        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/60">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">{t("aiDriven")}</span>
        </div>
      </motion.div>
    </div>
  );
}
