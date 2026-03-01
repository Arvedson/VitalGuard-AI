"use client";

import React, { useState, useEffect } from "react";
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
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";

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
import { useTranslations, useLocale } from "next-intl";
import { 
  getUnreadNotificationCount, 
  getMyNotifications, 
  markNotificationRead,
  markAllNotificationsRead 
} from "@/app/actions/patient";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navigation");
  const locale = useLocale();

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    async function fetchData() {
      try {
        const [countRes, notifsRes] = await Promise.all([
          getUnreadNotificationCount(),
          getMyNotifications()
        ]);
        if (countRes?.count !== undefined) setUnreadCount(countRes.count);
        if (notifsRes?.notifications) setNotifications(notifsRes.notifications);
      } catch (e) {
        // Ignore errors (e.g. if not logged in)
      }
    }
    fetchData();
  }, [pathname]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const navigation = [
    { name: t("dashboard"), href: "/", icon: LayoutDashboard },
    ...(userRole !== "DOCTOR" ? [
      { name: t("vitals"), href: "/vitals", icon: Activity },
      { name: t("intake"), href: "/intake", icon: History },
      { name: "Health Insights", href: "/insights", icon: Brain },
      { name: t("myDoctor"), href: "/my-doctor", icon: Stethoscope },
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 glass p-0 border-border/50 overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
                  <span className="font-bold text-sm">{t("notifications")}</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleMarkAllRead}
                      className="h-auto p-0 text-xs text-primary hover:text-primary hover:bg-transparent font-medium"
                    >
                      Marcar leídas
                    </Button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No tienes notificaciones
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div 
                        key={notif.id}
                        className={cn(
                          "p-3 text-sm border-b border-border/30 last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                          !notif.isRead && "bg-primary/[0.03] border-l-2 border-l-primary"
                        )}
                        onClick={() => {
                          if (!notif.isRead) handleMarkRead(notif.id);
                          if (userRole === "PATIENT") router.push("/my-doctor");
                        }}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className={cn("font-semibold line-clamp-1", !notif.isRead && "text-primary")}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notif.createdAt), { 
                              addSuffix: true,
                              locale: locale === "es" ? es : enUS
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {userRole === "PATIENT" && notifications.length > 5 && (
                  <div className="p-2 border-t border-border/50 bg-muted/30">
                    <Button 
                      variant="ghost" 
                      className="w-full h-8 text-xs font-semibold"
                      onClick={() => router.push("/my-doctor")}
                    >
                      Ver todas
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
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
