"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HeartPulse, 
  Activity, 
  History, 
  Settings, 
  User, 
  Menu, 
  Bell,
  Search,
  LayoutDashboard,
  Stethoscope,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, active }: SidebarItemProps) => (
  <Link href={href}>
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}>
      <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:text-primary")} />
      <span className="font-medium">{label}</span>
    </div>
  </Link>
);

import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const userRole = (session?.user as any)?.role;

  const navigation = [
    { name: t("dashboard"), href: "/", icon: LayoutDashboard },
    ...(userRole !== "DOCTOR" ? [
      { name: t("vitals"), href: "/vitals", icon: Activity },
      { name: t("intake"), href: "/intake", icon: History },
      { name: "Health Insights", href: "/insights", icon: Brain },
      { name: "Link Doctor", href: "/link-doctor", icon: Stethoscope },
    ] : []),
    { name: t("profile"), href: "/profile", icon: User },
    { name: t("settings"), href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-md border-r border-border transition-transform duration-300 transform lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-2 px-2 mb-10">
            <div className="p-2 bg-primary rounded-xl">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-secondary dark:text-white">
              VitalGuard <span className="text-primary font-black ml-0.5">AI</span>
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {navigation.map((item) => (
              <SidebarItem 
                key={item.name}
                href={item.href}
                icon={item.icon}
                label={item.name}
                active={pathname === item.href}
              />
            ))}
          </nav>

          <div className="mt-auto p-4 bg-muted/50 rounded-2xl glass">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary uppercase">
                  {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate leading-none">
                  {session?.user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate uppercase tracking-tighter font-black">
                  {(session?.user as any)?.role || "PATIENT"}
                </span>
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all active:scale-95">
              {t("healthReport")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={t("searchPlaceholder")} 
                className="pl-10 bg-muted/50 border-none rounded-xl focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20 animate-pulse">
              {t("systemLive")}
            </div>
            
            <LanguageSwitcher />

            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-background" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border border-border overflow-hidden">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass">
                <DropdownMenuLabel className="font-bold">{session?.user?.name || "Settings"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t("profile")}</DropdownMenuItem>
                <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-danger font-bold cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className={cn(
          "flex-1 p-6 md:p-10 animate-fade-in",
          pathname.includes("/vitals") && "xl:px-20 2xl:px-32"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
