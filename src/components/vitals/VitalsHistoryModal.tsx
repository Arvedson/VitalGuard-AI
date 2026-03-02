"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { History, Activity, Heart, Thermometer, Droplets, Scale, Ruler, Wind, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPatientVitalsHistory } from "@/app/actions/vitals";

export function VitalsHistoryModal({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Vitals");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getPatientVitalsHistory();
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <History className="w-5 h-5" />
            {t("viewHistory", { fallback: "View History" })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No vital records found.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6">
              {history.map((record, i) => (
                <div key={record.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                  
                  <div className="p-4 bg-muted/30 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                      <p className="font-bold text-sm text-primary">
                        {format(new Date(record.timestamp), "MMM dd, yyyy - HH:mm")}
                      </p>
                      {record.status && (
                        <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          record.status === 'RED' ? 'bg-danger/20 text-danger' :
                          record.status === 'YELLOW' ? 'bg-orange-500/20 text-orange-500' :
                          'bg-success/20 text-success'
                        }`}>
                          {record.status}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {record.systolicBP && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">BP</span>
                          <span className="font-semibold text-sm flex items-center gap-1">
                            <Activity className="w-3 h-3 text-primary" />
                            {record.systolicBP}/{record.diastolicBP}
                          </span>
                        </div>
                      )}
                      {record.heartRate && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">HR</span>
                          <span className="font-semibold text-sm flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500" />
                            {record.heartRate} <span className="text-[10px] text-muted-foreground">bpm</span>
                          </span>
                        </div>
                      )}
                      {record.respiratoryRate && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Resp</span>
                          <span className="font-semibold text-sm flex items-center gap-1">
                            <Wind className="w-3 h-3 text-teal-500" />
                            {record.respiratoryRate} <span className="text-[10px] text-muted-foreground">rpm</span>
                          </span>
                        </div>
                      )}
                      {record.spo2 && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">SpO2</span>
                          <span className="font-semibold text-sm flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-500" />
                            {record.spo2} <span className="text-[10px] text-muted-foreground">%</span>
                          </span>
                        </div>
                      )}
                      {record.temperature && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Temp</span>
                          <span className="font-semibold text-sm flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-orange-500" />
                            {record.temperature} <span className="text-[10px] text-muted-foreground">°C</span>
                          </span>
                        </div>
                      )}
                      {record.glucose && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Glucose</span>
                          <span className="font-semibold text-sm">
                            {record.glucose} <span className="text-[10px] text-muted-foreground">mg/dL</span>
                          </span>
                        </div>
                      )}
                      {record.weight && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Weight</span>
                          <span className="font-semibold text-sm flex items-center gap-1">
                            <Scale className="w-3 h-3 text-fuchsia-500" />
                            {record.weight} <span className="text-[10px] text-muted-foreground">kg</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
