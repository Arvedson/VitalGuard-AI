"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Shield, Mail, Lock, ArrowRight, Loader2, Key } from "lucide-react";
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
import { loginUser } from "@/app/actions/login";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Auth");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await loginUser(values);
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(t("welcomeBack"));
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.1),transparent)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-secondary dark:text-white flex items-center justify-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Vital<span className="text-primary italic">Guard AI</span>
          </div>
          <p className="text-muted-foreground mt-2 font-medium">{t("signInSubtitle")}</p>
        </div>

        <Card className="glass border-none shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> {t("login")}
            </CardTitle>
            <CardDescription>{t("loginDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <>{t("signInButton")} <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="p-8 pt-0 flex flex-col gap-4 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground text-center mt-6">
              {t("noAccount")}{" "}
              <Link href="/register" className="text-primary font-black hover:underline underline-offset-4">
                {t("signUpButton")}
              </Link>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Are you a medical professional?{" "}
              <Link href="/register?role=doctor" className="text-primary font-black hover:underline underline-offset-4">
                Register as Doctor
              </Link>
            </p>

          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
