import { MedicalIntakeForm } from "@/components/intake/MedicalIntakeForm";
import { HabitusExterior } from "@/components/intake/HabitusExterior";
import { ClipboardList, ShieldAlert, History } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { getTranslations } from "next-intl/server";

export default async function IntakePage() {
  const t = await getTranslations("Intake");
  const session = await auth();
  const patientId = (session?.user as any)?.patientId;
  
  let initialVisual = null;
  if (patientId) {
    const intake = await prisma.medicalIntake.findUnique({
      where: { patientId },
      select: { initialVisual: true }
    });
    initialVisual = intake?.initialVisual;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
            {t("title").split(" ")[0]} <span className="text-primary italic">{t("title").split(" ")[1]}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t("description")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-muted/50 rounded-xl border border-border flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{t("previousIntake")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <MedicalIntakeForm />
        </div>
        
        <div className="lg:col-span-4 space-y-10">
          <HabitusExterior initialData={initialVisual as any} />
          
          <div className="p-6 bg-danger/10 border border-danger/20 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-danger">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-xs">{t("emergencyAlert")}</h3>
            </div>
            <p className="text-sm text-danger/80 leading-relaxed font-medium">
              {t("emergencyText")}
            </p>
          </div>

          <div className="p-6 glass rounded-3xl space-y-4">
            <h3 className="font-bold text-lg">{t("privacyData")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("privacyText")}
            </p>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-success">{t("encrypted")}</span>
              <div className="w-2 h-2 bg-success rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
