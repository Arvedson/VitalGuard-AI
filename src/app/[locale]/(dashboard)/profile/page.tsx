"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
          Patient <span className="text-primary italic">Profile</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your personal information and health preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 glass border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarFallback className="text-3xl bg-primary/10 text-primary uppercase">
                  {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{session?.user?.name || "User"}</CardTitle>
            <CardDescription className="uppercase tracking-tighter font-black text-primary">
              {(session?.user as any)?.role || "PATIENT"}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="md:col-span-2 glass border-none shadow-2xl">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Email Address</p>
                <p className="font-semibold">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">User Role</p>
                <p className="font-semibold">{(session?.user as any)?.role || "Patient Access"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Account Created</p>
                <p className="font-semibold">February 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfileForm />
    </div>
  );
}
