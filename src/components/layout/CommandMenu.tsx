"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  LayoutDashboard,
  Activity,
  History,
  Settings,
  User,
  HeartPulse,
  Brain,
  Stethoscope,
  Plus,
  RefreshCw,
  LogOut,
  Calendar,
  Users,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

interface Patient {
  id: string;
  name: string;
  status: string;
  aiAlertLevel: string | null;
}

interface CommandMenuProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: "DOCTOR" | "PATIENT";
  doctorData?: {
    patients: Patient[];
  };
}

export const CommandMenu = ({ open, setOpen, userRole, doctorData }: CommandMenuProps) => {
  const router = useRouter();
  const t = useTranslations("CommandMenu");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useMemo(() => {
    const isDoctor = userRole === "DOCTOR";
    
    const baseNav = [
      { id: "dashboard", label: t("shortcuts.dashboard"), icon: LayoutDashboard, href: "/" },
      { id: "profile", label: t("shortcuts.profile"), icon: User, href: "/profile" },
      { id: "settings", label: t("shortcuts.settings"), icon: Settings, href: "/settings" },
    ];

    const patientNav = [
      { id: "vitals", label: t("shortcuts.vitals"), icon: Activity, href: "/vitals" },
      { id: "intake", label: t("shortcuts.intake"), icon: History, href: "/intake" },
      { id: "insights", label: t("shortcuts.insights"), icon: Brain, href: "/insights" },
      { id: "myDoctor", label: t("shortcuts.myDoctor"), icon: Stethoscope, href: "/my-doctor" },
    ];

    const doctorNav = [
      { id: "doctorPanel", label: t("shortcuts.doctorPanel"), icon: ShieldAlert, href: "/profile" },
    ];

    const navItems = isDoctor 
      ? [...baseNav.slice(0, 1), ...doctorNav, ...baseNav.slice(1)]
      : [...baseNav.slice(0, 1), ...patientNav, ...baseNav.slice(1)];

    const actionItems = isDoctor 
      ? [
          { id: "invite", label: t("shortcuts.inviteCode"), icon: Plus, action: async () => {
            const { generateInviteCode } = await import("@/app/actions/doctor");
            const res = await generateInviteCode();
            if (res.success) {
              alert(`Código de invitación: ${res.code}`);
            }
          }},
          { id: "agenda", label: t("shortcuts.todayAgenda"), icon: Calendar, href: "/" },
          { id: "logout", label: t("shortcuts.logout"), icon: LogOut, action: () => signOut({ callbackUrl: "/login" }) },
        ]
      : [
          { id: "upload", label: t("shortcuts.upload"), icon: Plus, action: () => router.push("/vitals?action=upload") },
          { id: "sync", label: t("shortcuts.sync"), icon: RefreshCw, action: () => typeof window !== 'undefined' && window.location.reload() },
          { id: "logout", label: t("shortcuts.logout"), icon: LogOut, action: () => signOut({ callbackUrl: "/login" }) },
        ];

    const patientList = isDoctor && doctorData?.patients 
      ? [
          {
            group: t("patients"),
            items: doctorData.patients.map(p => ({
              id: `patient-${p.id}`,
              label: p.name,
              icon: User,
              href: `/patient/${p.id}`,
              status: p.status,
              alert: p.aiAlertLevel
            }))
          }
        ]
      : [];

    return [
      { group: t("navigation"), items: navItems },
      ...patientList,
      { group: t("actions"), items: actionItems },
    ];
  }, [t, router, userRole, doctorData]);

  const filteredItems = useMemo(() => items.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.items.length > 0), [items, search]);

  const handleSelect = useCallback((item: any) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
    setOpen(false);
    setSearch("");
  }, [router, setOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-2xl">
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-4 border-b border-border/50">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md border border-border shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Esc</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">{t("noResults")} <span className="text-foreground font-semibold">"{search}"</span></p>
              </div>
            ) : (
              filteredItems.map((group) => (
                <div key={group.group} className="mb-4 last:mb-0">
                  <h3 className="px-3 mb-2 text-xs font-bold text-primary/50 uppercase tracking-widest">
                    {group.group}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item: any) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/10 transition-all group text-left"
                        >
                          <div className="p-2 bg-muted group-hover:bg-primary/20 rounded-lg transition-colors relative">
                            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            {item.alert === "HIGH" && (
                              <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full border border-card" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {item.label}
                            </span>
                            {item.status && (
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                item.status === "RED" ? "text-destructive" : 
                                item.status === "YELLOW" ? "text-warning" : "text-success"
                              )}>
                                {item.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-primary" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <span className="px-1.5 py-0.5 bg-background border border-border rounded shadow-sm">Enter</span>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <span className="px-1.5 py-0.5 bg-background border border-border rounded shadow-sm">↑↓</span>
                <span>Navigate</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary tracking-tighter uppercase">VitalGuard AI</span>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
