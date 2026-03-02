"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { 
  Upload, X, FileText, Loader2, Image as ImageIcon, Calendar,
  CheckCircle2, Activity, Heart, Wind, Droplets, Thermometer, Scale
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { uploadHistoryAction, saveExtractedRecordsAction } from "@/app/actions/upload-history";

export function UploadHistoryModal() {
  const t = useTranslations("Vitals");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // States for handling missing dates and feedback
  const [requiresDate, setRequiresDate] = useState(false);
  const [extractedRecords, setExtractedRecords] = useState<any[]>([]);
  const [manualDate, setManualDate] = useState<string>("");
  const [savedCount, setSavedCount] = useState<number>(0);
  const [showSuccessSummary, setShowSuccessSummary] = useState(false);

  const resetState = () => {
    setFile(null);
    setRequiresDate(false);
    setExtractedRecords([]);
    setManualDate("");
    setSavedCount(0);
    setShowSuccessSummary(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetState();
    setOpen(newOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadHistoryAction(formData);

      if ("error" in result && result.error) {
        toast.error(result.error || t("uploadError"));
      } else if ("requiresDate" in result && result.requiresDate) {
        setExtractedRecords(result.records || []);
        setRequiresDate(true);
      } else if ("success" in result && result.success) {
        toast.success(t("uploadSuccess"));
        setSavedCount(result.count || 1);
        setExtractedRecords(result.records || []); 
        setShowSuccessSummary(true);
        router.refresh();
      }
    } catch (error) {
      toast.error(t("uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualDateSave = async () => {
    if (!manualDate) return;
    setIsUploading(true);
    try {
      const dateObj = new Date(manualDate);
      const result = await saveExtractedRecordsAction(extractedRecords, dateObj);
      
      if ("error" in result && result.error) {
        toast.error(result.error || t("uploadError"));
      } else if ("success" in result && result.success) {
        toast.success(t("uploadSuccess"));
        // Update the records with the new manual date so we can display them correctly
        const updatedRecords = extractedRecords.map(r => ({ ...r, date: dateObj.toISOString() }));
        setExtractedRecords(updatedRecords);
        setSavedCount(result.count || 1);
        setRequiresDate(false);
        setShowSuccessSummary(true);
        router.refresh();
      }
    } catch (error) {
      toast.error(t("uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2 cursor-pointer hover:bg-primary/20 transition-colors">
          <Upload className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{t("uploadHistory")}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!showSuccessSummary ? (
              <>
                <Upload className="w-5 h-5 text-primary" />
                {t("uploadHistory")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 text-success" />
                {t("extractionSuccess", { fallback: "Extraction Successful" })}
              </>
            )}
          </DialogTitle>
          {!requiresDate && !showSuccessSummary && (
            <DialogDescription>
              {t("uploadDesc")}
            </DialogDescription>
          )}
        </DialogHeader>

        {showSuccessSummary ? (
          <div className="flex flex-col gap-6 py-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold">{savedCount} {t("recordsSaved", { fallback: "records saved to your history." })}</h3>
              <p className="text-muted-foreground text-sm">{t("reviewRecordsBelow", { fallback: "Here's what our AI extracted from your document:" })}</p>
            </div>

            <div className="space-y-4">
              {extractedRecords.map((record, i) => (
                <div key={i} className="p-4 bg-muted/30 border border-border rounded-xl">
                  <div className="pb-2 mb-3 border-b border-border/50 font-bold text-sm text-primary">
                    {record.date ? format(new Date(record.date), "MMM dd, yyyy") : "Unknown Date"}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {record.systolicBP && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">BP</span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-primary" /> {record.systolicBP}/{record.diastolicBP}
                        </span>
                      </div>
                    )}
                    {record.heartRate && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">HR</span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" /> {record.heartRate} <span className="text-[10px] opacity-70">bpm</span>
                        </span>
                      </div>
                    )}
                    {record.respiratoryRate && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Resp</span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Wind className="w-3 h-3 text-teal-500" /> {record.respiratoryRate} <span className="text-[10px] opacity-70">rpm</span>
                        </span>
                      </div>
                    )}
                    {record.spo2 && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">SpO2</span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-500" /> {record.spo2} <span className="text-[10px] opacity-70">%</span>
                        </span>
                      </div>
                    )}
                    {record.temperature && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Temp</span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-orange-500" /> {record.temperature} <span className="text-[10px] opacity-70">°C</span>
                        </span>
                      </div>
                    )}
                    {record.glucose && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Glucose</span>
                        <span className="text-sm font-semibold">
                          {record.glucose} <span className="text-[10px] opacity-70">mg/dL</span>
                        </span>
                      </div>
                    )}
                    {record.weight && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Weight</span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Scale className="w-3 h-3 text-fuchsia-500" /> {record.weight} <span className="text-[10px] opacity-70">kg</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => setOpen(false)} className="w-full mt-4">
              {t("close", { fallback: "Close" })}
            </Button>
          </div>
        ) : requiresDate ? (
          <div className="flex flex-col gap-5 py-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
              <Calendar className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-orange-600 dark:text-orange-400">{t("missingDateTitle", { fallback: "Date Not Found" })}</h4>
                <p className="text-sm text-orange-600/90 dark:text-orange-400/90 mt-1 leading-relaxed">
                  {t("missingDateDesc", { fallback: "We couldn't detect a date in the document. Please provide the date for these records." })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-secondary dark:text-white">
                {t("selectDate", { fallback: "Select Date" })}
              </label>
              <input 
                type="date" 
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex justify-end gap-3 w-full mt-2">
              <Button 
                variant="ghost" 
                onClick={() => handleOpenChange(false)}
                disabled={isUploading}
              >
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleManualDateSave} 
                disabled={!manualDate || isUploading}
                className="min-w-[140px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("uploading")}
                  </>
                ) : (
                  t("confirmDate", { fallback: "Confirm & Save" })
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              {!file ? (
                <label className="border-2 border-dashed border-primary/20 hover:border-primary/50 bg-primary/5 transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group">
                  <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Click to upload document</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf,image/jpeg,image/png" 
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="p-4 bg-muted/50 border border-border rounded-xl flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-background rounded-lg shrink-0 shadow-sm">
                      {file.type.includes('image') ? (
                        <ImageIcon className="w-5 h-5 text-fuchsia-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                    className="shrink-0 text-muted-foreground hover:text-danger hover:bg-danger/10 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 w-full border-t border-border pt-4">
              <Button 
                variant="ghost" 
                onClick={() => handleOpenChange(false)}
                disabled={isUploading}
              >
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("uploading")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
