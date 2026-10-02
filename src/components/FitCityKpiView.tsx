import React, { useState, useMemo } from "react";
import { 
  Trophy, 
  Award, 
  ShieldCheck, 
  HeartHandshake, 
  Utensils, 
  Moon, 
  Activity, 
  MapPin, 
  Building2, 
  Users, 
  Watch, 
  Clock, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Filter, 
  Search, 
  FileText, 
  ArrowUpRight,
  Landmark,
  Share2,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FitCityRegion, FamilyMember } from "../types";
import { INITIAL_FITCITY_REGIONS, FITCITY_PILLAR_DEFINITIONS } from "../data/fitCityData";
import { INITIAL_FAMILY_MEMBERS } from "../data/mockData";
import { fireGrandCelebration, fireBadgeCelebrationConfetti } from "../utils/confetti";
import { HealthScoreLeaderboard } from "./HealthScoreLeaderboard";

interface FitCityKpiViewProps {
  members?: FamilyMember[];
  selectedMemberId?: string;
  onSelectMember?: (id: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onNavigateToFamily?: () => void;
  onNavigateToDoctor?: () => void;
}

export const FitCityKpiView: React.FC<FitCityKpiViewProps> = ({
  members = INITIAL_FAMILY_MEMBERS,
  selectedMemberId,
  onSelectMember,
  onShowToast,
  onNavigateToFamily,
  onNavigateToDoctor,
}) => {
  const [moduleView, setModuleView] = useState<"family_leaderboard" | "regional_kpi">("family_leaderboard");
  const [regions, setRegions] = useState<FitCityRegion[]>(INITIAL_FITCITY_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("fitcity-01");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [evaluationPeriod, setEvaluationPeriod] = useState<"month" | "quarter" | "ytd">("month");
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"ranking" | "pillars" | "programs">("ranking");

  // Sorted regions by KPI score descending
  const sortedRegions = useMemo(() => {
    return [...regions].sort((a, b) => b.kpiScore - a.kpiScore);
  }, [regions]);

  // Filtered regions
  const filteredRegions = useMemo(() => {
    return sortedRegions.filter(r => {
      const matchZone = selectedZone === "all" || r.zone === selectedZone;
      const matchSearch = searchQuery === "" || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.governor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.arabicName.includes(searchQuery);
      return matchZone && matchSearch;
    });
  }, [sortedRegions, selectedZone, searchQuery]);

  // Currently selected region
  const selectedRegion = useMemo(() => {
    return regions.find(r => r.id === selectedRegionId) || sortedRegions[0];
  }, [regions, selectedRegionId, sortedRegions]);

  // Aggregate statistics
  const totalPopulation = useMemo(() => regions.reduce((acc, r) => acc + r.population, 0), [regions]);
  const totalWearables = useMemo(() => regions.reduce((acc, r) => acc + r.activeWearablesCount, 0), [regions]);
  const avgKpiScore = useMemo(() => {
    const sum = regions.reduce((acc, r) => acc + r.kpiScore, 0);
    return (sum / regions.length).toFixed(1);
  }, [regions]);
  const totalEmergencyFund = useMemo(() => regions.reduce((acc, r) => acc + r.emergencyFundBalance, 0), [regions]);

  // Top 3 Podium
  const rank1 = sortedRegions[0];
  const rank2 = sortedRegions[1];
  const rank3 = sortedRegions[2];

  // Real-time Telemetry Synchronization
  const handleSyncTelemetry = () => {
    setIsSyncingTelemetry(true);
    setTimeout(() => {
      // Slightly improve scores or add live fluctuations
      setRegions(prev => prev.map(reg => {
        const delta = Number((Math.random() * 0.4 - 0.1).toFixed(1));
        const newScore = Math.min(99.5, Math.max(75, Number((reg.kpiScore + delta).toFixed(1))));
        return {
          ...reg,
          previousKpiScore: reg.kpiScore,
          kpiScore: newScore,
          trend: delta >= 0 ? "up" : "down",
          communityVitals: {
            ...reg.communityVitals,
            avgDailySteps: reg.communityVitals.avgDailySteps + Math.floor(Math.random() * 80 - 20),
            wearableSyncRatePct: Math.min(99.8, Number((reg.communityVitals.wearableSyncRatePct + 0.2).toFixed(1))),
          }
        };
      }));
      setIsSyncingTelemetry(false);
      fireBadgeCelebrationConfetti(0.5, 0.4);
      if (onShowToast) {
        onShowToast("⚡ Telemetri komunal seluruh Wilayah Daulah Islamicity berhasil disinkronkan langsung dari sensor smart wearable!", "success");
      }
    }, 1200);
  };

  // Celebrate top city
  const handleCelebrateTopCity = () => {
    fireGrandCelebration();
    if (onShowToast) {
      onShowToast(`🎉 Mubarak! ${rank1.name} dinobatkan sebagai Wilayah Daulah Berdaya Terbaik dengan skor KPI ${rank1.kpiScore}!`, "success");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* MASTER FITCITY MODULE NAVIGATION (GAMIFIKASI KELUARGA & WILAYAH DAULAH) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setModuleView("family_leaderboard")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              moduleView === "family_leaderboard"
                ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>Skor Kesehatan Keluarga (Leaderboard Gamifikasi)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </button>

          <button
            type="button"
            onClick={() => setModuleView("regional_kpi")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              moduleView === "regional_kpi"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Indeks KPI Wilayah Daulah ({regions.length} Kota)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2 shrink-0">
          <Watch className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Sensor Wearable: <strong className="text-emerald-600 dark:text-emerald-400">Live Telemetri Aktif</strong></span>
        </div>
      </div>

      {/* RENDER FAMILY HEALTH SCORE LEADERBOARD GAMIFICATION */}
      {moduleView === "family_leaderboard" && (
        <HealthScoreLeaderboard
          members={members}
          selectedMemberId={selectedMemberId}
          onSelectMember={onSelectMember}
          onShowToast={onShowToast}
          onNavigateToFamily={onNavigateToFamily}
        />
      )}

      {/* RENDER REGIONAL DAULAH KPI VIEW */}
      {moduleView === "regional_kpi" && (
        <>
          {/* 1. Header Banner & Title */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/40">
        {/* Background Islamic Geometric Motifs & Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                FITCity Index v2.4 • Wilayah Daulah Islamicity
              </span>
              <span className="text-xs text-emerald-200/80 font-mono">
                مؤشر الأداء الصحي الذكي للولايات
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              FITCity Key Performance Index Cerdas Berdaya
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Tolok ukur kesehatan cerdas, kemandirian terapi keluarga, dan solidaritas sosial terpadu di setiap Wilayah Daulah Islamicity. Menggabungkan telemetri <strong className="text-emerald-300">{totalWearables.toLocaleString("id-ID")} perangkat wearable</strong>, kepatuhan klinis, nutrisi thayyib, dan dana kesiapsiagaan darurat warga.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSyncTelemetry}
              disabled={isSyncingTelemetry}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isSyncingTelemetry 
                  ? "bg-emerald-800/80 text-emerald-300 cursor-wait" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold active:scale-95"
              }`}
              title="Sinkronkan agregasi metrik telemetri wearable secara real-time"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingTelemetry ? "animate-spin" : ""}`} />
              <span>{isSyncingTelemetry ? "Menyinkronkan..." : "Sinkronkan Telemetri Wilayah"}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              title="Cetak & Unduh Laporan Resmi Evaluasi FITCity Wilayah"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Kartu Skor Wilayah</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-800/50 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-medium text-emerald-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Total Populasi Terdata</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white mt-1">
              {totalPopulation.toLocaleString("id-ID")} <span className="text-xs text-slate-400 font-normal">warga</span>
            </div>
            <div className="text-[10px] text-emerald-400/90 mt-0.5 font-medium">
              100% Tercakup E2EE Rekam Medis
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-medium text-teal-300 flex items-center gap-1.5">
              <Watch className="w-3.5 h-3.5" />
              <span>Wearable Aktif Terhubung</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white mt-1">
              {totalWearables.toLocaleString("id-ID")} <span className="text-xs text-slate-400 font-normal">unit</span>
            </div>
            <div className="text-[10px] text-teal-400/90 mt-0.5 font-medium">
              Tingkat Sinkronisasi Rata-rata 88.6%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-medium text-amber-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Rata-rata Skor FITCity Daulah</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white mt-1 flex items-baseline gap-1.5">
              <span>{avgKpiScore}</span>
              <span className="text-xs text-amber-300 font-semibold">/ 100 Pts</span>
            </div>
            <div className="text-[10px] text-amber-300/90 mt-0.5 font-medium">
              Kategori: Jayyid Jiddan (Sangat Berdaya)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-medium text-rose-300 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Kas Infaq Darurat Daulah</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white mt-1">
              Rp {(totalEmergencyFund / 1000000).toFixed(0)} <span className="text-xs text-slate-400 font-normal">Juta</span>
            </div>
            <div className="text-[10px] text-rose-300/90 mt-0.5 font-medium">
              Siaga Ambulans & Penjaminan Mandiri
            </div>
          </div>
        </div>
      </div>

      {/* 2. Podium 3 Wilayah Daulah Berdaya Terbaik (Gold, Silver, Bronze) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Podium Wilayah Daulah Cerdas Berdaya Terbaik
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                Peringkat Utama 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Wilayah percontohan dengan skor gabungan tertinggi pada 5 pilar kebugaran, kepatuhan terapi, dan solidaritas sosial.
            </p>
          </div>

          <button
            onClick={handleCelebrateTopCity}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Apresiasi Juara Umum</span>
          </button>
        </div>

        {/* Podium Layout: Silver (Left), Gold (Center, Higher), Bronze (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Silver Rank 2 */}
          <div 
            onClick={() => setSelectedRegionId(rank2.id)}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all group flex flex-col justify-between relative overflow-hidden ${
              selectedRegionId === rank2.id
                ? "bg-slate-50 dark:bg-slate-800/90 border-slate-400 dark:border-slate-500 shadow-md ring-2 ring-slate-400/30"
                : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 flex items-center justify-center font-black text-lg shadow-sm">
                🥈
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                Peringkat 2
              </span>
            </div>

            <div className="my-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{rank2.zone}</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                {rank2.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-arabic mt-0.5" dir="rtl">{rank2.arabicName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                {rank2.awardTitle}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-500">Skor FITCity</span>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {rank2.kpiScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                Buka Rincian <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>

          {/* Gold Rank 1 (Tallest & Most Prominent) */}
          <div 
            onClick={() => setSelectedRegionId(rank1.id)}
            className={`cursor-pointer rounded-2xl p-5 sm:p-6 border-2 transition-all group flex flex-col justify-between relative overflow-hidden md:-mt-2 ${
              selectedRegionId === rank1.id
                ? "bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-950/40 border-amber-400 dark:border-amber-500 shadow-xl ring-2 ring-amber-400/40"
                : "bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-950/20 border-amber-300/80 dark:border-amber-700/80 hover:border-amber-400"
            }`}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-amber-500/30">
                👑
              </div>
              <div className="flex flex-col items-end">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-xs">
                  🏆 JUARA 1 TELADAN
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 mt-1">
                  Mumtaz (Teladan Utama)
                </span>
              </div>
            </div>

            <div className="my-4 relative z-10">
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider">{rank1.zone}</span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                {rank1.name}
              </h4>
              <p className="text-xs text-slate-500 font-arabic mt-0.5" dir="rtl">{rank1.arabicName}</p>
              <div className="mt-2.5 p-2 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{rank1.awardTitle}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-200 dark:border-amber-800 flex items-end justify-between relative z-10">
              <div>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Skor Indeks Tertinggi</span>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  {rank1.kpiScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-0.5 group-hover:underline">
                Lihat Kartu Skor <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>

          {/* Bronze Rank 3 */}
          <div 
            onClick={() => setSelectedRegionId(rank3.id)}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all group flex flex-col justify-between relative overflow-hidden ${
              selectedRegionId === rank3.id
                ? "bg-slate-50 dark:bg-slate-800/90 border-amber-600/60 dark:border-amber-700 shadow-md ring-2 ring-amber-600/30"
                : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                🥉
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                Peringkat 3
              </span>
            </div>

            <div className="my-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{rank3.zone}</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                {rank3.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-arabic mt-0.5" dir="rtl">{rank3.arabicName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                {rank3.awardTitle}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-500">Skor FITCity</span>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                  {rank3.kpiScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                Buka Rincian <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Filter & Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama wilayah, kode daulah, atau nama gubernur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
          {[
            { id: "all", label: "Semua Zona" },
            { id: "Pusat Daulah", label: "Pusat" },
            { id: "Barat Daulah", label: "Barat" },
            { id: "Timur Daulah", label: "Timur" },
            { id: "Selatan Daulah", label: "Selatan" },
            { id: "Pesisir Daulah", label: "Pesisir" },
          ].map(z => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedZone === z.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setEvaluationPeriod("month")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              evaluationPeriod === "month"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setEvaluationPeriod("quarter")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              evaluationPeriod === "quarter"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Kuartal III
          </button>
          <button
            onClick={() => setEvaluationPeriod("ytd")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              evaluationPeriod === "ytd"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            YTD 2026
          </button>
        </div>
      </div>

      {/* 4. Main Two-Column Layout: Regional Table (Left) + Detailed Deep-Dive Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: All Regions Table & Ranking (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Klasemen Seluruh Wilayah Daulah ({filteredRegions.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Pilih untuk Analisis Detail
              </span>
            </div>

            <div className="space-y-2">
              {filteredRegions.map((region, idx) => {
                const isSelected = region.id === selectedRegion.id;
                return (
                  <div
                    key={region.id}
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0 
                          ? "bg-amber-500 text-slate-950 shadow-xs" 
                          : idx === 1 
                          ? "bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white" 
                          : idx === 2 
                          ? "bg-amber-700 text-white" 
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}>
                        #{region.rank}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {region.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{region.code}</span>
                          <span>•</span>
                          <span>{region.zone}</span>
                          <span>•</span>
                          <span>{(region.population / 1000).toFixed(1)}k Jiwa</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        {region.kpiScore}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{Number((region.kpiScore - region.previousKpiScore).toFixed(1))}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Explanatory Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Metodologi Standar FITCity Daulah</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Setiap skor dihitung otomatis menggunakan algoritma pembobotan objektif: <strong>25% Aktivitas Fisik</strong> + <strong>25% Kepatuhan Medis</strong> + <strong>20% Nutrisi Thayyib</strong> + <strong>15% Istirahat Sirkadian</strong> + <strong>15% Solidaritas Sosial & Kas Darurat</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Deep Dive of Selected Region (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Top Region Identity Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
                    {selectedRegion.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedRegion.zone}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {selectedRegion.statusLevel}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-1">
                  {selectedRegion.name}
                </h3>
                <p className="text-sm text-slate-500 font-arabic" dir="rtl">
                  {selectedRegion.arabicName}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                  <span>Gubernur: <strong>{selectedRegion.governor}</strong></span>
                  <span>•</span>
                  <span>Hub RS: <strong>{selectedRegion.hospitalHub}</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-300/80 dark:border-emerald-700/80 text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skor KPI FITCity</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedRegion.kpiScore}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  Peringkat #{selectedRegion.rank} dari {regions.length} Wilayah
                </div>
              </div>
            </div>

            {/* Sub-tabs: 5 Pilar KPI vs Program Unggulan */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("ranking")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ranking"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                📊 5 Pilar Kinerja & Telemetri
              </button>
              <button
                onClick={() => setActiveTab("programs")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "programs"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🚀 Program Inisiatif Unggulan ({selectedRegion.flagshipPrograms.length})
              </button>
            </div>

            {/* Tab 1: 5 Pillars Detailed Breakdown & Real-Time Community Vitals */}
            {activeTab === "ranking" && (
              <div className="space-y-6">
                
                {/* 5 Pillars Progress Bars */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-500">
                      Rincian Evaluasi 5 Pilar Kesehatan Daulah
                    </h4>
                    <span className="text-[11px] text-slate-400">Skala 0 - 100</span>
                  </div>

                  {FITCITY_PILLAR_DEFINITIONS.map(pillar => {
                    const score = selectedRegion.pillars[pillar.key];
                    return (
                      <div key={pillar.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {pillar.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 font-mono">
                              ({pillar.weight})
                            </span>
                          </div>
                          <span className={`text-sm font-black ${pillar.textColor}`}>
                            {score} / 100
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${pillar.color} transition-all duration-500`}
                            style={{ width: `${score}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>{pillar.description}</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono">{pillar.benchmark}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real-time Community Telemetry Vitals */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Telemetri Vitalitas Agregat Komunitas ({selectedRegion.name})</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 font-semibold">Rata-rata Langkah/Hari</span>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {selectedRegion.communityVitals.avgDailySteps.toLocaleString("id-ID")}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Target Daulah: 8.500</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 font-semibold">Tensi Darah Terkontrol</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {selectedRegion.communityVitals.normalBloodPressurePct}%
                      </div>
                      <span className="text-[10px] text-slate-500">Kepatuhan Terapi Obat</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 font-semibold">Waktu Respon Darurat</span>
                      <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 flex items-baseline gap-1">
                        <span>{selectedRegion.communityVitals.emergencyResponseMinutes}</span>
                        <span className="text-xs font-normal">menit</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Ambulans 119 Siaga</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 font-semibold">Rata-rata Tidur Sehat</span>
                      <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {selectedRegion.communityVitals.avgSleepHours} Jam
                      </div>
                      <span className="text-[10px] text-slate-500">Sirkadian & Qailulah</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 font-semibold">Target Hidrasi Tercapai</span>
                      <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                        {selectedRegion.communityVitals.hydrationTargetAchievedPct}%
                      </div>
                      <span className="text-[10px] text-slate-500">≥ 2L Air Bersih/Hari</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 font-semibold">Adopsi Wearable Warga</span>
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                        {selectedRegion.communityVitals.wearableSyncRatePct}%
                      </div>
                      <span className="text-[10px] text-slate-500">{selectedRegion.activeWearablesCount.toLocaleString("id-ID")} Unit Aktif</span>
                    </div>
                  </div>
                </div>

                {/* Smart AI Advisory Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-300/80 dark:border-emerald-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                        Rekomendasi Cerdas AI untuk Akselerasi KPI Wilayah
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                      Algoritma Daulah Sehat v2.4
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Kekuatan Utama:</strong> {selectedRegion.smartAdvisory.keyStrength}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Fokus Prioritas:</strong> {selectedRegion.smartAdvisory.focusPriority}
                    </p>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 font-medium">
                      💡 <strong>Rekomendasi Kebijakan:</strong> {selectedRegion.smartAdvisory.recommendedAction}
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                      🎯 {selectedRegion.smartAdvisory.impactPotential}
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Flagship Initiatives & Emergency Fund */}
            {activeTab === "programs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-500">
                    Inisiatif Kesehatan Komunal Cerdas Berdaya
                  </h4>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Kas Infaq Siaga: Rp {(selectedRegion.emergencyFundBalance / 1000000).toLocaleString("id-ID")} Juta
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedRegion.flagshipPrograms.map(prog => (
                    <div
                      key={prog.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {prog.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {prog.status}
                            </span>
                          </div>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                            {prog.title}
                          </h5>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500">Penerima Manfaat</span>
                          <div className="text-sm font-black text-slate-900 dark:text-white">
                            {prog.activeBeneficiaries.toLocaleString("id-ID")} Warga
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {prog.impactDescription}
                      </p>

                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Penanggung Jawab: <strong>{prog.leaderInCharge}</strong></span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Daulah
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kas Infaq & Gotong Royong Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 border border-rose-300/60 dark:border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4" />
                      Kas Infaq & Wakaf Darurat Sehat Wilayah
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Dana terhimpun: <strong>Rp {selectedRegion.emergencyFundBalance.toLocaleString("id-ID")}</strong> untuk perlindungan 100% biaya darurat ambulans, obat dhuafa, dan terapi gratis.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (onShowToast) {
                        onShowToast(`Laporan audit kas infaq darurat ${selectedRegion.name} terverifikasi E2EE dan transparan.`, "info");
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    Tinjau Audit Kas
                  </button>
                </div>
              </div>
            )}

            {/* Action Footer for Selected Region */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToFamily && (
                  <button
                    onClick={onNavigateToFamily}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Buka Dasbor Keluarga
                  </button>
                )}
                {onNavigateToDoctor && (
                  <button
                    onClick={onNavigateToDoctor}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-300/80 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Analitik Dokter
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
        </>
      )}

      {/* 5. Official Regional Scorecard Export Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Kartu Laporan Resmi FITCity Daulah Islamicity
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dokumen Verifikasi Akreditasi Wilayah Cerdas Berdaya
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Printable Scorecard Preview */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 font-mono text-xs">
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    LEMBAR EVALUASI KINERJA KESEHATAN KOTA & WILAYAH
                  </div>
                  <div className="text-[11px] text-slate-500">
                    DEWAN KESEHATAN TERPADU DAULAH ISLAMICITY — TAHUN 2026
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Wilayah: <strong>{selectedRegion.name}</strong></div>
                  <div>Kode Daulah: <strong>{selectedRegion.code}</strong></div>
                  <div>Gubernur: <strong>{selectedRegion.governor}</strong></div>
                  <div>Zona: <strong>{selectedRegion.zone}</strong></div>
                  <div>Populasi: <strong>{selectedRegion.population.toLocaleString("id-ID")} Jiwa</strong></div>
                  <div>Wearable Aktif: <strong>{selectedRegion.activeWearablesCount.toLocaleString("id-ID")} Unit</strong></div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500">TOTAL SKOR FITCITY:</span>
                    <div className="text-2xl font-black text-emerald-600">{selectedRegion.kpiScore} / 100</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">PREDIKAT WILAYAH:</span>
                    <div className="font-black text-slate-900 dark:text-white">{selectedRegion.statusLevel}</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Skor Pilar Utama:</div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>1. Vitalitas Fisik & Langkah Warga</span>
                    <span><strong>{selectedRegion.pillars.physicalVitality}</strong> / 100</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>2. Kontrol Medis & Kepatuhan Terapi</span>
                    <span><strong>{selectedRegion.pillars.chronicCareAdherence}</strong> / 100</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>3. Nutrisi Halal-Thayyib & Hidrasi</span>
                    <span><strong>{selectedRegion.pillars.halalThayyibNutrition}</strong> / 100</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>4. Istirahat Sirkadian & Pemulihan</span>
                    <span><strong>{selectedRegion.pillars.circadianRest}</strong> / 100</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>5. Solidaritas Sosial & Kas Darurat</span>
                    <span><strong>{selectedRegion.pillars.socialEmpowerment}</strong> / 100</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 flex justify-between">
                  <span>Enkripsi Hash: SHA-256 Verified #DF-99824</span>
                  <span>Otoritas: Dewan Medis Daulah</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setIsExportModalOpen(false);
                    if (onShowToast) {
                      onShowToast(`Dokumen resmi kartu skor FITCity ${selectedRegion.name} berhasil diunduh (PDF Berstempel Digital).`, "success");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen PDF Resmi</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
