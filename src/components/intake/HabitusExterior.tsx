"use client";

import React, { useState } from "react";
import { 
  Eye, 
  BadgeInfo,
  Save,
  Loader2,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { saveHabitusExterior } from "@/app/actions/intake";
import { cn } from "@/lib/utils";

interface HabitusExteriorProps {
  initialData?: Record<string, boolean> | null;
}

export function HabitusExterior({ initialData }: HabitusExteriorProps) {
  const t = useTranslations("Intake");
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const observations = [
    { id: "alignment", label: t("alignment"), desc: t("alignmentDesc") },
    { id: "consciousness", label: t("consciousness"), desc: t("consciousnessDesc") },
    { id: "color", label: t("color"), desc: t("colorDesc") },
    { id: "breathing", label: t("breathing"), desc: t("breathingDesc") },
    { id: "gait", label: t("gait"), desc: t("gaitDesc") },
  ];

  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    if (initialData && typeof initialData === 'object' && !Array.isArray(initialData)) {
      return initialData as Record<string, boolean>;
    }
    return {};
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (id: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveHabitusExterior(selected);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t("saveIntake") || "Saved successfully");
      }
    } catch (error) {
      toast.error("Error saving data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="glass border-none shadow-2xl animate-fade-in [animation-delay:400ms] flex flex-col">
      <CardHeader className="bg-primary/5 pb-4">
        <Badge className="w-fit mb-2 bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[9px] font-black">
          {t("clinicalModule")}
        </Badge>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          {t("habitusTitle")}
        </CardTitle>
        <CardDescription>{t("habitusDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4 flex-1">
        <div className="space-y-2">
          {observations.map((item) => (
            <div key={item.id} className="group flex flex-col p-2 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/50">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id={item.id} 
                  className="h-5 w-5 border-2 rounded-md" 
                  checked={selected[item.id] || false}
                  onCheckedChange={(checked) => handleToggle(item.id, checked === true)}
                />
                <Label htmlFor={item.id} className="text-sm font-bold cursor-pointer flex-1">
                  {item.label}
                </Label>
                <button 
                  type="button"
                  onClick={() => setActiveInfo(activeInfo === item.id ? null : item.id)}
                  className={cn(
                    "p-1 rounded-full transition-colors",
                    activeInfo === item.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              
              {activeInfo === item.id && (
                <div className="mt-2 ml-8 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground border-l-2 border-primary animate-in fade-in slide-in-from-top-1 duration-200">
                  {item.desc}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <BadgeInfo className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-tighter">{t("clinicalNote")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("clinicalNoteDesc")}
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{t("generalInspection")}</Badge>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{t("motorResponse")}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full rounded-xl h-12 font-bold shadow-lg"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {t("saveIntake") || "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
