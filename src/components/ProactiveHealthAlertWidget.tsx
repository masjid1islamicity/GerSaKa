import React, { useState, useEffect } from "react";
import { FamilyMember } from "../types";
import { ProactiveHealthAlert, ProactiveScanResult } from "../types/proactiveAlerts";
import { 
  fetchProactiveHealthAlerts, 
  generateHeuristicProactiveAlerts,
  playProactiveAlertChime
} from "../utils/proactiveAlertEngine";
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Stethoscope, 
  Flame, 
  Activity, 
  Droplet, 
  Heart, 
  TrendingUp, 
  Wind,
  Info,
  ExternalLink,
  Sliders
} from "lucide-react";
import { fireBadgeCelebrationConfetti } from "../utils/confetti";

interface ProactiveHealthAlertWidgetProps {
  member: FamilyMember;
  allMembers?: FamilyMember[];
  onSelectMember?: (id: string) => void;
  onOpenAlertModal?: () => void;
  onOpenTeleconsult?: () => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const ProactiveHealthAlertWidget: React.FC<ProactiveHealthAlertWidgetProps> = ({
  member,
  allMembers,
  onSelectMember,
  onOpenAlertModal,
  onOpenTeleconsult,
  onShowToast,
}) => {
  const [scanResult, setScanResult] = useState<ProactiveScanResult>(() => {
    return generateHeuristicProactiveAlerts(member);
  });
  const [isScanning, setIsScanning] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<ProactiveHealthAlert[]>(() => {
    return generateHeuristicProactiveAlerts(member).alerts;
  });

  // Re-run scan when member changes
  useEffect(() => {
    const fresh = generateHeuristicProactiveAlerts(member);
    setScanResult(fresh);
    setActiveAlerts(fresh.alerts);
  }, [member.id, member.vitals.bloodPressure, member.vitals.heartRate, member.vitals.spo2]);

  const handleRunAiScan = async () => {
    setIsScanning(true);
    if (onShowToast) {
      onShowToast(`🔍 Menjalankan pemindaian AI proaktif terhadap tren tanda vital ${member.name}...`, "info");
    }

    try {
      const freshResult = await fetchProactiveHealthAlerts(member);
      setScanResult(freshResult);
      setActiveAlerts(freshResult.alerts);

      const hasEarlyAnomaly = freshResult.alerts.some(a => a.severity !== "stabilizing");
      if (hasEarlyAnomaly) {
        playProactiveAlertChime("early_warning");
        if (onShowToast) {
          onShowToast(`⚠️ Terdeteksi ${freshResult.activeAnomaliesCount} anomali pra-kritis! Tindakan pencegahan dini diaktifkan.`, "warning");
        }
      } else {
        if (onShowToast) {
          onShowToast(`✅ Seluruh parameter tanda vital ${member.name} berada dalam koridor aman.`, "success");
        }
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleTakePreventiveAction = (alertId: string, actionTitle: string) => {
    setActiveAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          isActionTaken: true,
          severity: "stabilizing",
          severityLabel: "Stabil Terkendali",
        };
      }
      return a;
    }));

    fireBadgeCelebrationConfetti(0.5, 0.6);
    playProactiveAlertChime("stabilizing");
    if (onShowToast) {
      onShowToast(`🛡️ Tindakan pencegahan '${actionTitle}' berhasil dijalankan! Anomali berhasil diredam sebelum mencapai tahap kritis.`, "success");
    }
  };

  // Simulation triggers
  const handleSimulateSurge = () => {
    const simulatedAlert: ProactiveHealthAlert = {
      id: `alert-sim-surge-${Date.now()}`,
      patientId: member.id,
      patientName: member.name,
      patientRole: member.role,
      avatarUrl: member.avatarUrl,
      title: "Simulasi Lonjakan Tensi Mendadak (Pre-Crisis Hypertensive Surge)",
      vitalMetric: "Tekanan Darah",
      currentReading: "148/92 mmHg",
      baselineReading: "120/80 mmHg",
      percentageDrift: 23,
      severity: "moderate_anomaly",
      severityLabel: "Peringatan Anomali Moderat",
      probabilityOfCriticalPct: 82,
      estimatedHoursToCritical: 8,
      timeframeHorizon: "Prognosis 8 Jam",
      trendAnalysis: "Simulasi mendeteksi lonjakan resistensi vaskular tajam (+28 mmHg) dalam 6 jam terakhir.",
      rootCauseHypothesis: "Vasokonstriksi akut akibat stres, kurang tidur, dan asupan garam tinggi.",
      actionSteps: [
        {
          stepNumber: 1,
          title: "Minum Air Putih Hangat 500 ml Segera",
          description: "Membantu hemodilusi plasma dan meringankan kontraksi pembuluh darah.",
          estimatedEffect: "Penurunan tensi 4-6 mmHg"
        },
        {
          stepNumber: 2,
          title: "Istirahat Berbaring & Relaksasi Vagal",
          description: "Tidur telentang dengan kaki sedikit diangkat selama 15 menit.",
          estimatedEffect: "Menormalkan respons sistem saraf otonom"
        }
      ],
      sunnahHerbalAdvice: "Minum minyak zaitun extra virgin dan jadwalkan bekam sunnah titik Al-Kahil.",
      clinicalRationale: "Mencegah krisis ensefalopati hipertensi atau serangan jantung akut.",
      detectedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
      isDismissed: false,
      isActionTaken: false,
      sourceWearable: member.connectedWearable.deviceName,
      sourceModel: "GerSaKa Anomaly Simulator"
    };

    setActiveAlerts(prev => [simulatedAlert, ...prev]);
    playProactiveAlertChime("moderate_anomaly");
    if (onShowToast) {
      onShowToast("🚨 Simulasi anomali pra-kritis berhasil dipicu! Perhatikan peringatan dini dan tindakan pencegahan.", "warning");
    }
  };

  const unaddressedCount = activeAlerts.filter(a => !a.isActionTaken && a.severity !== "stabilizing").length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                AI Proactive Health Alert System
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Deteksi Dini Pra-Kritis Berkelanjutan
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Sistem Peringatan Dini Kesehatan Proaktif</span>
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Menganalisis tren tanda vital longitudinal secara cerdas menggunakan AI untuk mendeteksi deviasi anomali tersembunyi <strong>sebelum mencapai tahap kritis/darurat</strong> rumah sakit pada <strong>{member.name}</strong> ({member.role}).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateSurge}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
            title="Uji coba sistem dengan menyimulasikan kenaikan tensi pra-kritis"
          >
            ⚡ Simulasikan Anomali
          </button>

          <button
            type="button"
            onClick={handleRunAiScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Menganalisis Tren..." : "Pindai Tren dengan AI"}</span>
          </button>
        </div>

      </div>

      {/* Top Metric Strip: Risk Score & Countdown Horizon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Pre-Crisis Risk Index */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-300 font-bold">
            <span>Indeks Risiko Pra-Kritis</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              scanResult.overallPreCrisisRiskScore >= 65 ? "bg-red-500/30 text-red-300 border border-red-500/40" : "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
            }`}>
              {scanResult.riskLevel}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {scanResult.overallPreCrisisRiskScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              style={{ width: `${scanResult.overallPreCrisisRiskScore}%` }}
              className={`h-full rounded-full transition-all duration-700 ${
                scanResult.overallPreCrisisRiskScore >= 65 ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-gradient-to-r from-teal-500 to-emerald-400"
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {scanResult.overallPreCrisisRiskScore >= 65 
              ? "Terdapat sinyal deviasi vaskular yang memerlukan intervensi segera." 
              : "Tren tanda vital stabil dalam rentang aman."}
          </p>
        </div>

        {/* Card 2: Anomaly Status */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            Anomali Dini Terdeteksi
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {unaddressedCount}
            </span>
            <span className="text-xs text-slate-500">Peringatan Aktif</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {unaddressedCount > 0 
              ? `${unaddressedCount} kondisi memerlukan tindakan pencegahan sebelum timbul komplikasi akut.`
              : "Semua potensi anomali telah tertangani dan terstabilkan."}
          </p>
        </div>

        {/* Card 3: Prevention Success Counter */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
            <span>Krisis IGD Dicegah</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300">
              {scanResult.preventedCriticalCases + (activeAlerts.filter(a => a.isActionTaken).length)}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">Kasus Darurat Diredam</span>
          </div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
            Pencegahan dini berhasil menghindarkan rujukan darurat 119 dan rawat inap intensif.
          </p>
        </div>

      </div>

      {/* Active Alerts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Sinyal Peringatan Dini & Rencana Pencegahan ({member.name}):</span>
          </h3>

          {onOpenAlertModal && (
            <button
              type="button"
              onClick={onOpenAlertModal}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Pusat Notifikasi Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {activeAlerts.map(alert => {
            const isResolved = alert.isActionTaken || alert.severity === "stabilizing";
            const isModerate = alert.severity === "moderate_anomaly";

            return (
              <div 
                key={alert.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3 ${
                  isResolved
                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-90"
                    : isModerate
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                    : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isResolved
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                        : isModerate
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                    }`}>
                      {alert.severityLabel}
                    </span>

                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Metrik: {alert.vitalMetric} ({alert.currentReading})
                    </span>

                    <span className="text-[10px] text-slate-500 font-mono">
                      • {alert.timeframeHorizon}
                    </span>
                  </div>

                  {!isResolved && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Estimasi Waktu Menuju Kritis: ~{alert.estimatedHoursToCritical} Jam</span>
                    </div>
                  )}
                </div>

                {/* Alert content */}
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {alert.trendAnalysis}
                  </p>
                </div>

                {/* 1-2-3 Action Protocol */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Protokol Tindakan Pencegahan Dini:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {alert.actionSteps.map(step => (
                      <div key={step.stepNumber} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {step.stepNumber}
                        </span>
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200 text-[11px] block">{step.title}</strong>
                          <span className="text-slate-500 text-[10px] leading-tight block">{step.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {alert.sunnahHerbalAdvice && (
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[10px] text-emerald-700 dark:text-emerald-300">
                      🌿 <strong>Terapi Thibbun Nabawi:</strong> {alert.sunnahHerbalAdvice}
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Sensor: {alert.sourceWearable}
                  </span>

                  {!isResolved ? (
                    <button
                      type="button"
                      onClick={() => handleTakePreventiveAction(alert.id, alert.title)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Jalankan Tindakan Pencegahan</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Anomali Terkendali & Stabil</span>
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
