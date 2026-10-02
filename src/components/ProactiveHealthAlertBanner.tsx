import React from "react";
import { ProactiveHealthAlert } from "../types/proactiveAlerts";
import { 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  X, 
  Clock, 
  ChevronRight,
  Stethoscope,
  CheckCircle2
} from "lucide-react";

interface ProactiveHealthAlertBannerProps {
  alerts: ProactiveHealthAlert[];
  onOpenModal: () => void;
  onDismissAlert?: (id: string) => void;
}

export const ProactiveHealthAlertBanner: React.FC<ProactiveHealthAlertBannerProps> = ({
  alerts,
  onOpenModal,
  onDismissAlert,
}) => {
  // Filter for unhandled early warnings
  const activeUnaddressed = alerts.filter(a => !a.isActionTaken && a.severity !== "stabilizing");

  if (activeUnaddressed.length === 0) return null;

  const topAlert = activeUnaddressed[0];
  const isModerate = topAlert.severity === "moderate_anomaly";

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border-2 transition-all shadow-md relative overflow-hidden ${
      isModerate
        ? "bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 border-rose-500/80 text-white"
        : "bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-amber-500/80 text-white"
    }`}>
      {/* Background Pulse Glow */}
      <div className="absolute right-0 top-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg shrink-0 ${
            isModerate 
              ? "bg-rose-600 text-white shadow-rose-600/30 animate-pulse" 
              : "bg-amber-500 text-slate-950 shadow-amber-500/30"
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isModerate 
                  ? "bg-rose-900/80 text-rose-200 border-rose-400" 
                  : "bg-amber-900/80 text-amber-200 border-amber-400"
              }`}>
                Pencegahan Dini AI • Anomali Pra-Kritis
              </span>

              <span className="text-xs font-bold text-slate-200">
                Pasien: {topAlert.patientName} ({topAlert.patientRole})
              </span>

              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Prakiraan Krisis ~{topAlert.estimatedHoursToCritical} Jam Jika Dibiarkan</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white leading-tight">
              {topAlert.title} ({topAlert.currentReading})
            </h3>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {topAlert.trendAnalysis} <strong>Tindakan pencegahan segera disarankan</strong> untuk menstabilkan kondisi sebelum memerlukan IGD rumah sakit.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenModal}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              isModerate
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-600/30"
                : "bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/30"
            }`}
          >
            <span>Tinjau & Ambil Tindakan ({activeUnaddressed.length} Alert)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
