import { AddVitalsForm } from "@/components/vitals/AddVitalsForm";
import { ECGVisualization } from "@/components/vitals/ECGVisualization";
import { Activity, History, Heart } from "lucide-react";

import { useTranslations } from "next-intl";

export default function VitalsPage() {
  const t = useTranslations("Vitals");

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">
            {t("title").split(" ").slice(0, 2).join(" ")} <span className="text-primary italic">{t("title").split(" ").slice(2).join(" ")}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t("description")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-muted/50 rounded-xl border border-border flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{t("viewHistory")}</span>
          </div>
          <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary italic">{t("lastSync", { time: "2m" })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <AddVitalsForm />
        </div>
        
        <div className="space-y-8">
          <div className="p-6 bg-secondary text-white rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {t("proTip")}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t("proTipText")}
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">{t("status")}</span>
              <span className="text-xs font-black px-2 py-0.5 bg-success/20 text-success rounded-full">{t("secure")}</span>
            </div>
          </div>

          <div className="p-6 glass rounded-3xl space-y-4">
            <h3 className="font-bold text-lg">{t("instructions")}</h3>
            <ul className="space-y-3">
              {[
                t("instruction1"),
                t("instruction2"),
                t("instruction3"),
                t("instruction4")
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <ECGVisualization />
        </div>
      </div>
    </div>
  );
}
