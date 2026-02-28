"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Bell, Lock, Globe, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
          System <span className="text-primary italic">Settings</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Customize your experience and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-vitals">Email Vitals Reports</Label>
              <Switch id="email-vitals" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emergency-alerts">Emergency SMS Alerts</Label>
              <Switch id="emergency-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your data sharing settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="data-sharing">Share data with research</Label>
              <Switch id="data-sharing" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="doctor-access">Allow doctor direct access</Label>
              <Switch id="doctor-access" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Personalize the dashboard look.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode Primary</Label>
              <Switch id="dark-mode" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
