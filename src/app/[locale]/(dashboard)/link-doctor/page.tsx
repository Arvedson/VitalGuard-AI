"use client";

import React, { useState, useEffect } from "react";
import { Stethoscope, ArrowRight, Loader2, CheckCircle2, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { linkDoctorByCode, getLinkedDoctor } from "@/app/actions/linkDoctor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LinkDoctorPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkedDoctor, setLinkedDoctor] = useState<{ id: string; name: string; specialty: string | null } | null>(null);
  const [justLinked, setJustLinked] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  useEffect(() => {
    async function fetchDoctor() {
      const result = await getLinkedDoctor();
      if (result?.doctor) {
        setLinkedDoctor(result.doctor);
      }
      setLoadingDoctor(false);
    }
    fetchDoctor();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter your doctor's invite code.");
      return;
    }

    setIsLoading(true);
    const result = await linkDoctorByCode(code.trim());
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      setJustLinked(true);
      setLinkedDoctor({ id: "", name: result.doctorName || "Doctor", specialty: null });
      toast.success(`Successfully linked to Dr. ${result.doctorName}!`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
          Link <span className="text-primary italic">Doctor</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Enter the invite code provided by your doctor to connect with their practice.
        </p>
      </div>

      {/* Current Doctor Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass border-none shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Your Assigned Doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDoctor ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : linkedDoctor ? (
              <div className="flex items-center gap-4 p-4 bg-success/5 border border-success/20 rounded-2xl">
                <Avatar className="w-12 h-12 border-2 border-success/50">
                  <AvatarFallback className="bg-success/10 text-success font-black text-lg">
                    {linkedDoctor.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-secondary dark:text-white text-lg">Dr. {linkedDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {linkedDoctor.specialty || "General Practice"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-black tracking-widest border border-success/20">
                  <CheckCircle2 className="w-3 h-3" /> LINKED
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Stethoscope className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="font-bold">No doctor assigned yet.</p>
                <p className="text-xs">Enter an invite code below to link with your doctor.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Just-linked Success Message */}
      {justLinked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass border-none border-success/20 shadow-lg overflow-hidden bg-success/5">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="p-3 bg-success/10 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-bold text-secondary dark:text-white">Successfully Linked!</p>
                <p className="text-sm text-muted-foreground">
                  Your doctor can now monitor your vitals and health data.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Input Code Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass border-none shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              {linkedDoctor ? "Change Doctor" : "Enter Invite Code"}
            </CardTitle>
            <CardDescription>
              {linkedDoctor
                ? "Enter a new code to switch to a different doctor."
                : "Your doctor will provide you with a unique code. Enter it below to link your account."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-secondary dark:text-white">
                  <UserPlus className="w-4 h-4 text-primary" /> Doctor's Invite Code
                </label>
                <Input
                  placeholder="E.g. A3B9X2"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="bg-background/50 h-14 rounded-xl text-center text-2xl font-black tracking-[0.5em] uppercase"
                  maxLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Link to Doctor <ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
