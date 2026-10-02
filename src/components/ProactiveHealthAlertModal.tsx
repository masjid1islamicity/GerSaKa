import React, { useState } from "react";
import { ProactiveHealthAlert, ProactiveSeverity } from "../types/proactiveAlerts";
import { 
  Bell, 
  Sparkles, 
  X, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Play, 
  Activity, 
  Stethoscope, 
  RefreshCw, 
  Heart, 
  TrendingUp, 
  Filter, 
  Eye, 
  ChevronRight,
  Flame,
  CheckCheck
} from "lucide-react";
import { playProactiveAlertChime } from "../utils/proactiveAlertEngine";
import { fireBadgeCelebrationConfetti } from "../utils/confetti";

interface ProactiveHealthAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: ProactiveHealthAlert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onTakeAction: (alertId: string) => void;
  onRunScan: () => void;
  isScanning: boolean;
  onOpenTeleconsult?: () => void;
  onOpenDoctorAnalytics?: () => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onSimulateScenario?: (type: "bp_surge" | "hrv_drop" | "spo2_dip") => void;
}

export const ProactiveHealthAlertModal: React.FC<ProactiveHealthAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onTakeAction,
  onRunScan,
  isScanning,
  onOpenTeleconsult,
  onOpenDoctorAnalytics,
  onShowToast,
  onSimulateScenario,
}) => {
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeAlertDetail, setActiveAlertDetail] = useState<ProactiveHealthAlert | null>(null);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverityFilter === "all") return true;
    if (selectedSeverityFilter === "unread") return !a.isRead;
    if (selectedSeverityFilter === "action_needed") return !a.isActionTaken && a.severity !== "stabilizing";
    return a.severity === selectedSeverityFilter;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalPreventedCount = alerts.filter(a => a.isActionTaken).length;

  const handleAction = (alertId: string, title: string) => {
    onTakeAction(alertId);
    if (soundEnabled) {
      playProactiveAlertChime("stabilizing");
    }
    fireBadgeCelebrationConfetti(0.5, 0.6);
    if (onShowToast) {
      onShowToast(`🛡️ Tindakan pencegahan berhasil dijalankan! Anomali '${title}' berhasil distabilkan sebelum mencapai tahap kritis.`, "success");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-500 flex items-center justify-center font-black shadow-lg shadow-teal-500/20 shrink-0">
              <Bell className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Pusat Notifikasi & Peringatan Dini AI</span>
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                Proactive Health Alerts • Deteksi Anomali Tren Tanda Vital Sebelum Tahap Kritis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs flex items-center"
              title={soundEnabled ? "Nonaktifkan Nada Dering" : "Aktifkan Nada Dering"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Filter Bar */}
        <div className="p-3 sm:px-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "Semua Alert", count: alerts.length },
              { id: "unread", label: "Belum Dibaca", count: unreadCount },
              { id: "action_needed", label: "Perlu Tindakan", count: alerts.filter(a => !a.isActionTaken && a.severity !== "stabilizing").length },
              { id: "moderate_anomaly", label: "Moderat", count: alerts.filter(a => a.severity === "moderate_anomaly").length },
              { id: "early_warning", label: "Dini", count: alerts.filter(a => a.severity === "early_warning").length },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedSeverityFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  selectedSeverityFilter === f.id
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRunScan}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Memindai..." : "Pindai AI"}</span>
            </button>
          </div>

        </div>

        {/* Alerts List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Tidak Ada Peringatan Anomali Pada Filter Ini
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Semua tanda vital terpantau stabil dalam batas aman. AI terus memantau telemetri wearable secara berkelanjutan di latar belakang.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isModerate = alert.severity === "moderate_anomaly";
              const isEarly = alert.severity === "early_warning";
              const isStabilized = alert.severity === "stabilizing" || alert.isActionTaken;

              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    if (!alert.isRead) onMarkAsRead(alert.id);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3.5 relative overflow-hidden ${
                    isStabilized
                      ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-90"
                      : isModerate
                      ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80 shadow-xs"
                      : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs"
                  }`}
                >
                  {/* Status Indicator Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                        isStabilized 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                          : isModerate
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                      }`}>
                        {isStabilized ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{alert.severityLabel}</span>
                      </span>

                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {alert.patientName} ({alert.patientRole})
                      </span>

                      <span className="text-[11px] text-slate-500 font-mono">
                        • {alert.detectedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!alert.isActionTaken && alert.severity !== "stabilizing" && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-bold">
                          <Clock className="w-3 h-3 text-red-500" />
                          <span>Peluang Kritis: {alert.probabilityOfCriticalPct}% (~{alert.estimatedHoursToCritical} jam lagi)</span>
                        </div>
                      )}

                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Belum dibaca" />
                      )}
                    </div>

                  </div>

                  {/* Title and Vital Comparison */}
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                      {alert.title}
                    </h4>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-slate-500 text-[11px]">Nilai Sensor Saat Ini:</span>
                        <strong className="text-sm font-black font-mono text-slate-900 dark:text-white">
                          {alert.currentReading}
                        </strong>
                      </div>
                      <div className="flex items-baseline gap-1.5 text-slate-500 text-[11px]">
                        <span>Baseline Normal:</span>
                        <span className="font-mono">{alert.baselineReading}</span>
                      </div>
                      <div className="flex items-baseline gap-1 text-[11px] font-bold">
                        <span>Deviasi:</span>
                        <span className={alert.percentageDrift > 0 ? "text-rose-600" : "text-amber-600"}>
                          {alert.percentageDrift > 0 ? `+${alert.percentageDrift}%` : `${alert.percentageDrift}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trend Analysis & Root Cause */}
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>Analisis Tren AI:</strong> {alert.trendAnalysis}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      <strong>Dugaan Faktor Pemicu:</strong> {alert.rootCauseHypothesis}
                    </p>
                  </div>

                  {/* Recommended Preventive Actions (1-2-3) */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rencana Tindakan Pencegahan Dini (Mencegah Krisis Rumah Sakit):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {alert.actionSteps.map(step => (
                        <div 
                          key={step.stepNumber}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] space-y-1"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-black">
                              {step.stepNumber}
                            </span>
                            <span>{step.title}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                            {step.description}
                          </p>
                          <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Target: {step.estimatedEffect}
                          </div>
                        </div>
                      ))}
                    </div>

                    {alert.sunnahHerbalAdvice && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                        🌿 <strong>Sunnah Thibbun Nabawi:</strong> {alert.sunnahHerbalAdvice}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Sensor: {alert.sourceWearable} • {alert.sourceModel || "GerSaKa AI"}
                    </span>

                    <div className="flex items-center gap-2">
                      {onOpenTeleconsult && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTeleconsult();
                          }}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>Konsultasi Dokter</span>
                        </button>
                      )}

                      {!alert.isActionTaken && alert.severity !== "stabilizing" ? (
                        <button
                          type="button"
                          onClick={() => handleAction(alert.id, alert.title)}
                          className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tandai Tindakan Sudah Dijalankan</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Tindakan Pencegahan Aktif</span>
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* Simulation Strip at Bottom for Easy Testing */}
        {onSimulateScenario && (
          <div className="p-3 sm:px-6 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs">
            <span className="text-[11px] font-bold text-slate-500">
              Uji Coba Deteksi Dini (Simulasi AI):
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onSimulateScenario("bp_surge")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:border-red-400 border border-slate-300 dark:border-slate-600 text-[10px] font-bold transition-all cursor-pointer"
              >
                + Simulasikan Lonjakan Tensi
              </button>
              <button
                type="button"
                onClick={() => onSimulateScenario("hrv_drop")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400 border border-slate-300 dark:border-slate-600 text-[10px] font-bold transition-all cursor-pointer"
              >
                + Simulasikan Penurunan HRV
              </button>
              <button
                type="button"
                onClick={() => onSimulateScenario("spo2_dip")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 border border-slate-300 dark:border-slate-600 text-[10px] font-bold transition-all cursor-pointer"
              >
                + Simulasikan Penurunan Oksigen
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
