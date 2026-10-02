import React, { useState, useEffect, useMemo } from "react";
import { FamilyMember, AiHealthInsightsData, LifestyleRecommendation } from "../types";
import { getDefaultHealthInsights, fetchAiHealthInsights } from "../utils/aiHealthInsights";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Activity, 
  Moon, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Compass, 
  Award, 
  ChevronRight, 
  Check, 
  Copy, 
  Share2, 
  Watch, 
  Target, 
  Layers, 
  Filter,
  Info,
  Droplet
} from "lucide-react";

interface AiHealthInsightsProps {
  member: FamilyMember;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onRunAiPrediction?: () => void;
}

export const AiHealthInsights: React.FC<AiHealthInsightsProps> = ({
  member,
  onSyncWearable,
  isSyncing = false,
  onShowToast,
  onRunAiPrediction,
}) => {
  // Insights state for current member
  const [insights, setInsights] = useState<AiHealthInsightsData>(() => getDefaultHealthInsights(member));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [appliedRecommendations, setAppliedRecommendations] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Automatically update insights when member changes or on mount
  useEffect(() => {
    let isMounted = true;

    const runAutomatedAnalysis = async () => {
      setIsLoading(true);
      try {
        const freshData = await fetchAiHealthInsights(member);
        if (isMounted) {
          setInsights(freshData);
        }
      } catch (err) {
        console.warn("Error running automated AI health insights:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    runAutomatedAnalysis();

    return () => {
      isMounted = false;
    };
  }, [member.id]);

  // Manual trigger to re-run AI insights
  const handleRefreshInsights = async () => {
    setIsLoading(true);
    try {
      const freshData = await fetchAiHealthInsights(member);
      setInsights(freshData);
      if (onShowToast) {
        onShowToast(
          `Wawasan AI Tren Mingguan untuk ${member.name} berhasil diperbarui berdasarkan data wearable terkini.`,
          "success"
        );
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast("Gagal memperbarui analisis AI. Menggunakan estimasi klinis cadangan.", "warning");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle apply recommendation as weekly goal
  const handleApplyRecommendation = (rec: LifestyleRecommendation) => {
    setAppliedRecommendations(prev => ({
      ...prev,
      [rec.id]: !prev[rec.id],
    }));

    const isNowApplied = !appliedRecommendations[rec.id];
    if (onShowToast) {
      if (isNowApplied) {
        onShowToast(
          `Saran "${rec.title}" berhasil dijadikan Target Perubahan Gaya Hidup Mingguan! (${rec.targetMetric})`,
          "success"
        );
      } else {
        onShowToast(`Target "${rec.title}" dibatalkan dari daftar aktif.`, "info");
      }
    }
  };

  // Copy recommendation to clipboard
  const handleCopyRecommendation = (rec: LifestyleRecommendation) => {
    const textToCopy = `[AI Health Insights - GerSaKa LimoCity]\nSaran Gaya Hidup: ${rec.title}\nTindakan: ${rec.actionText}\nTarget Metrik: ${rec.targetMetric}\nPemicu Wearable: ${rec.wearableTrigger}\nLangkah:\n${rec.implementationSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onShowToast) {
      onShowToast("Rekomendasi disalin ke papan klip.", "info");
    }
  };

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === "all") return insights.lifestyleRecommendations;
    return insights.lifestyleRecommendations.filter(r => r.category === selectedCategory);
  }, [insights.lifestyleRecommendations, selectedCategory]);

  const categories = [
    { key: "all", label: "Semua Kategori" },
    { key: "Tidur & Sirkadian", label: "Tidur & Sirkadian" },
    { key: "Aktivitas & Kebugaran", label: "Aktivitas & Kebugaran" },
    { key: "Manajemen Stres & Mental", label: "Manajemen Stres" },
    { key: "Nutrisi & Hidrasi", label: "Nutrisi & Hidrasi" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative z-10 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/20 shrink-0">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  AI Health Insights • Analisis Tren Mingguan Otomatis
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Watch className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  {member.connectedWearable.deviceName} ({member.connectedWearable.brand})
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                AI Health Insights & Rekomendasi Gaya Hidup
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Menganalisis tren kesehatan 7 hari terakhir dari wearable <strong>{member.name} ({member.role})</strong> secara otomatis. Menyajikan evaluasi beban adaptasi biologis dan saran perubahan gaya hidup terarah untuk optimalisasi kebugaran keluarga.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleRefreshInsights}
              disabled={isLoading}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Menganalisis Wearable..." : "Perbarui Analisis AI"}</span>
            </button>
          </div>

        </div>

        {/* EXECUTIVE SUMMARY & WEEKLY VITALITY GAUGES BANNER */}
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white rounded-3xl p-5 sm:p-7 border border-teal-800/50 shadow-lg relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            
            {/* Vitality Score Block */}
            <div className="flex items-center gap-5 shrink-0">
              <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-emerald-400/40 p-2 shadow-inner">
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight block">
                    {insights.weeklyVitalityScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    Skor Vitalitas
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    Tren: {insights.trendDirection}
                  </span>
                  <span className="text-xs text-slate-400">
                    Model: {insights.sourceModel || "Gemini 3.8 Flash"}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white">
                  Kondisi Fisiologis Adaptif & Terkendali
                </h3>

                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  {insights.executiveSummary}
                </p>
              </div>
            </div>

            {/* 4 Recovery Status Mini-Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              
              {/* Metric 1 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                  <span>Pemulihan Fisik</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-black text-emerald-300">
                  {insights.recoveryStatus.physicalRecoveryPct}%
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    style={{ width: `${insights.recoveryStatus.physicalRecoveryPct}%` }}
                    className="h-full bg-emerald-500 rounded-full" 
                  />
                </div>
                <span className="text-[9px] text-slate-400 block">Regenerasi Seluler</span>
              </div>

              {/* Metric 2 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                  <span>Beban Kardio</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-lg font-black text-teal-300">
                  {insights.recoveryStatus.cardiovascularStrainPct}%
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    style={{ width: `${insights.recoveryStatus.cardiovascularStrainPct}%` }}
                    className="h-full bg-cyan-500 rounded-full" 
                  />
                </div>
                <span className="text-[9px] text-slate-400 block">Afterload Rendah</span>
              </div>

              {/* Metric 3 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                  <span>Sirkadian Tidur</span>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg font-black text-indigo-300">
                  {insights.recoveryStatus.circadianEfficiencyPct}%
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    style={{ width: `${insights.recoveryStatus.circadianEfficiencyPct}%` }}
                    className="h-full bg-indigo-500 rounded-full" 
                  />
                </div>
                <span className="text-[9px] text-slate-400 block">Slow-Wave Seimbang</span>
              </div>

              {/* Metric 4 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                  <span>Ketahanan Stres</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-black text-amber-300">
                  {insights.recoveryStatus.stressResiliencePct}%
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    style={{ width: `${insights.recoveryStatus.stressResiliencePct}%` }}
                    className="h-full bg-amber-500 rounded-full" 
                  />
                </div>
                <span className="text-[9px] text-slate-400 block">Kortisol Adaptif</span>
              </div>

            </div>

          </div>

          {/* LimoCity Holistic Tip */}
          {insights.limoCityTherapyTip && (
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-3 text-xs">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 font-black">Rekomendasi Terapi Sirkadian & Herbal LimoCity: </strong>
                <span className="text-slate-200">{insights.limoCityTherapyTip}</span>
              </div>
            </div>
          )}

        </div>

        {/* 7-DAY WEARABLE TREND SIGNALS */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Sinyal Tren Kesehatan Mingguan (Wearable 7 Hari)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Komparasi rerata biometrik minggu ini versus baseline minggu sebelumnya.
              </p>
            </div>
            
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Sensor Terverifikasi: <strong>{member.connectedWearable.deviceName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {insights.weeklySignals.map((signal, idx) => {
              const isPositiveChange = signal.percentageChange > 0;
              const isGood = signal.status === "membaik";

              return (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                      {signal.metricName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5 ${
                      isGood 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      {isPositiveChange ? "+" : ""}{signal.percentageChange}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {signal.currentAverage}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sebelumnya: {signal.previousAverage}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                    {signal.interpretation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* LIFESTYLE RECOMMENDATIONS SECTION */}
        <div className="space-y-4 pt-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Saran Perubahan Gaya Hidup Berdasarkan Data Wearable
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rekomendasi presisi klinis yang disesuaikan secara dinamis dengan anomali dan pola sirkadian {member.name}.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.key
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* RECOMMENDATIONS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecommendations.map((rec) => {
              const isApplied = Boolean(appliedRecommendations[rec.id]);
              const isHighPriority = rec.priority === "Tinggi";

              return (
                <div
                  key={rec.id}
                  className={`rounded-3xl p-5 sm:p-6 border transition-all space-y-4 flex flex-col justify-between ${
                    isApplied
                      ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20 shadow-md"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400/60"
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Top Row: Category, Priority, Impact Score */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isHighPriority
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                            : "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                        }`}>
                          Prioritas: {rec.priority}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {rec.category}
                        </span>
                      </div>

                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Dampak Efektivitas {rec.impactScorePct}%
                      </span>
                    </div>

                    {/* Recommendation Title */}
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-1 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 shrink-0" />
                        <span>{rec.actionText}</span>
                      </p>
                    </div>

                    {/* Wearable Trigger & Target Metric Pill */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        <Watch className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span><strong>Pemicu Wearable:</strong> {rec.wearableTrigger}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs pt-0.5">
                        <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{rec.targetMetric}</span>
                      </div>
                    </div>

                    {/* Clinical Rationale */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rasional Klinis & Fisiologis:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                        {rec.clinicalRationale}
                      </p>
                    </div>

                    {/* Implementation Steps Checklist */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Langkah Penerapan Praktis:
                      </span>
                      <ul className="space-y-1 text-xs">
                        {rec.implementationSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="leading-snug">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2">
                    
                    <button
                      type="button"
                      onClick={() => handleCopyRecommendation(rec)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Salin Rincian Saran"
                    >
                      {copiedId === rec.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyRecommendation(rec)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                        isApplied
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aktif Sebagai Target Mingguan</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 text-emerald-400" />
                          <span>Jadikan Target Mingguan</span>
                        </>
                      )}
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
