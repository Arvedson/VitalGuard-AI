"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: any) => {
    // With next-intl navigation, router.replace/push will automatically handle the locale
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass border-border shadow-xl rounded-2xl p-2 min-w-[120px]">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("es")}
          className={`rounded-xl cursor-pointer font-bold ${locale === "es" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
        >
          Español
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("en")}
          className={`rounded-xl cursor-pointer font-bold ${locale === "en" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
