import React, { useState, useMemo } from "react";
import { 
  FamilyMember, 
  DailySleepStageRecord,
  WeeklySleepQualityAnalysis 
} from "../types";
import { 
  computeWeeklySleepQualityAnalysis,
  generateHypnogramData,
  HypnogramBlock 
} from "../utils/weeklySleepTracking";
import { 
  Moon, 
  Sparkles, 
  RefreshCw, 
  Battery, 
  Clock, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  Eye, 
  Layers, 
  Brain,
  Zap,
  ArrowUpRight,
  Stethoscope,
  Sun,
  Flame,
  Sunrise,
  Heart,
  Dumbbell,
  Users,
  Compass,
  AlertTriangle,
  Award
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface WeeklySleepQualityChartProps {
  member: FamilyMember;
  allMembers?: FamilyMember[];
  onSelectMember?: (id: string) => void;
  onSyncWearable: () => void;
  isSyncing: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const WeeklySleepQualityChart: React.FC<WeeklySleepQualityChartProps> = ({
  member,
  allMembers = [],
  onSelectMember,
  onSyncWearable,
  isSyncing,
  onShowToast,
}) => {
  // Chart metric filter
  const [trendView, setTrendView] = useState<"all" | "deep" | "rem" | "total">("all");
  
  // Selected day index (0 = 6 days ago, 6 = today)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6);
  
  // Active hypnogram block hovered
  const [hoveredHypnogram, setHoveredHypnogram] = useState<HypnogramBlock | null>(null);

  // Compute fresh sleep architecture and analysis
  const sleepAnalysis: WeeklySleepQualityAnalysis = useMemo(() => {
    return computeWeeklySleepQualityAnalysis(member);
  }, [member, member.vitals]);

  const activeRecord: DailySleepStageRecord = useMemo(() => {
    if (sleepAnalysis.dailyRecords[selectedDayIndex]) {
      return sleepAnalysis.dailyRecords[selectedDayIndex];
    }
    return sleepAnalysis.dailyRecords[6]; // Today
  }, [selectedDayIndex, sleepAnalysis.dailyRecords]);

  // Generate overnight hypnogram blocks
  const hypnogramBlocks = useMemo(() => {
    return generateHypnogramData(member, activeRecord);
  }, [member, activeRecord]);

  // Transform dailyRecords for Recharts
  const rechartsData = useMemo(() => {
    return sleepAnalysis.dailyRecords.map((rec) => ({
      day: rec.dayLabel,
      date: rec.dateShort,
      deep: rec.deepSleepHours,
      rem: rec.remSleepHours,
      light: rec.lightSleepHours,
      total: rec.totalSleepHours,
      score: rec.sleepScore,
      efficiency: rec.sleepEfficiencyPct,
    }));
  }, [sleepAnalysis.dailyRecords]);

  const readiness = sleepAnalysis.morningReadiness;

  // Custom Tooltip for Recharts
  const CustomSleepTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs space-y-1.5 min-w-44 z-50">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
            <span className="font-bold text-slate-200">{label}</span>
            <span className="text-[10px] text-indigo-400 font-mono">Polisomnografi</span>
          </div>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-black font-mono text-white">
                {entry.value} {entry.name.includes("Skor") || entry.name.includes("Efisiensi") ? "%" : "Jam"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-7 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. HEADER WITH WEARABLE SYNC & FAMILY SELECTOR */}
      {/* ========================================================================= */}
      <div className="relative z-10 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20 shrink-0">
              <Moon className="w-7 h-7 sm:w-8 sm:h-8 fill-white/20 text-white animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Sleep Quality & Morning Readiness Tracker
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  {sleepAnalysis.wearableDevice}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Kualitas Tidur & Skor Kesiapan Pagi</span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  — {member.name} ({member.role})
                </span>
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Sinkronisasi telemetri polisomnografi wearable untuk menganalisis arsitektur tahapan tidur (Deep, REM, Light) serta menghitung skor kesiapan pemulihan tubuh di pagi hari.
              </p>
            </div>
          </div>

          {/* Sync Trigger & Battery Status */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.connectedWearable.brand}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{sleepAnalysis.lastSync}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onSyncWearable();
                if (onShowToast) {
                  onShowToast(`Menyinkronkan data tidur & kesiapan pagi dari ${sleepAnalysis.wearableDevice}...`, "info");
                }
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sinkronisasi..." : "Sinkronkan Wearable"}</span>
            </button>
          </div>

        </div>

        {/* FAMILY MEMBERS QUICK SELECTION STRIP */}
        {allMembers && allMembers.length > 0 && onSelectMember && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Users className="w-3.5 h-3.5" />
              <span>Pilih Anggota:</span>
            </span>

            {allMembers.map((m) => {
              const isSelected = m.id === member.id;
              // Calculate preview readiness
              const mAnalysis = computeWeeklySleepQualityAnalysis(m);
              const mReadiness = mAnalysis.morningReadiness;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMember(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-4 h-4 rounded-full object-cover border border-white/50"
                  />
                  <span>{m.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isSelected 
                      ? "bg-white/20 text-white" 
                      : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  }`}>
                    {mReadiness.score}% {mReadiness.score >= 90 ? "Prima" : mReadiness.score >= 80 ? "Baik" : "Pulih"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. MORNING READINESS SCORE (SKOR KESIAPAN PAGI) HERO CARD */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-indigo-700/50 shadow-xl relative overflow-hidden space-y-5">
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Readiness Score Gauge */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center bg-slate-950/60 shadow-inner">
              <Sunrise className="w-5 h-5 text-amber-400 mb-0.5" />
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                {readiness.score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                / 100 Poin
              </span>
              <span className="text-[9px] text-teal-400 font-bold mt-0.5">
                Kesiapan Pagi
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-teal-300 border border-white/15">
                Evaluasi Fajar Sirkadian
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {readiness.status}
              </h3>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                {readiness.clinicalReadinessSummary}
              </p>
            </div>
          </div>

          {/* 5 Key Contributing Factors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full lg:w-auto">
            
            {/* Factor 1: Sleep Quality */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <Moon className="w-4 h-4 text-indigo-400 mx-auto" />
              <span className="text-[10px] text-slate-400 block font-bold">Kualitas Tidur</span>
              <span className="text-sm font-black text-white font-mono">{readiness.factors.sleepQuality}%</span>
            </div>

            {/* Factor 2: HRV Parasympathetic Recovery */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <Zap className="w-4 h-4 text-teal-400 mx-auto" />
              <span className="text-[10px] text-slate-400 block font-bold">HRV Otonom</span>
              <span className="text-sm font-black text-teal-300 font-mono">{readiness.factors.hrvRecovery}%</span>
            </div>

            {/* Factor 3: Resting HR Dipping */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <Heart className="w-4 h-4 text-rose-400 mx-auto" />
              <span className="text-[10px] text-slate-400 block font-bold">Dipping Nokturnal</span>
              <span className="text-sm font-black text-rose-300 font-mono">{readiness.factors.restingHrDipping}%</span>
            </div>

            {/* Factor 4: Activity Strain vs Recovery */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <Activity className="w-4 h-4 text-amber-400 mx-auto" />
              <span className="text-[10px] text-slate-400 block font-bold">Keseimbangan Beban</span>
              <span className="text-sm font-black text-amber-300 font-mono">{readiness.factors.activityBalance}%</span>
            </div>

            {/* Factor 5: Body Battery Energy */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 col-span-2 sm:col-span-1">
              <Battery className="w-4 h-4 text-emerald-400 mx-auto" />
              <span className="text-[10px] text-slate-400 block font-bold">Body Battery</span>
              <span className="text-sm font-black text-emerald-300 font-mono">{readiness.factors.bodyBattery}%</span>
            </div>

          </div>

        </div>

        {/* Actionable Morning Guidance Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
          
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
            <Dumbbell className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Rekomendasi Beban Olahraga:</span>
              <span className="font-black text-teal-300">{readiness.recommendedWorkoutIntensity}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
            <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Jendela Fokus Kognitif Puncak:</span>
              <span className="font-black text-indigo-300">{readiness.cognitiveFocusWindow}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
            <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Adab & Panduan Sirkadian Fajar:</span>
              <span className="text-slate-200 leading-tight block">{readiness.sunnahMorningAdvice}</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SLEEP STAGES INSIGHTS (REM, DEEP, LIGHT, AWAKE) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Arsitektur & Tahapan Gelombang Tidur ({activeRecord.dayLabel})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total tidur semalam: <strong>{activeRecord.totalSleepHours} Jam</strong> • Jam Tidur: {activeRecord.bedTime} - {activeRecord.wakeTime} • Efisiensi: {activeRecord.sleepEfficiencyPct}%
            </p>
          </div>

          {/* Day Selector Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {sleepAnalysis.dailyRecords.map((rec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDayIndex === idx
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {rec.dayLabel.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Sleep Stage Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Deep Sleep Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Deep Sleep (Nyenyak)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                Target: 15-25%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-indigo-950 dark:text-indigo-100 font-mono">
                {activeRecord.deepSleepHours} Jam
              </span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {Math.round((activeRecord.deepSleepHours / activeRecord.totalSleepHours) * 100)}%
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-indigo-200/60 dark:border-indigo-800/60 pt-2">
              Fase gelombang delta lambat. Memicu sekresi Human Growth Hormone (HGH), perbaikan mikrotulang/sendi, dan regenerasi sistem imunitas seluler.
            </p>
          </div>

          {/* REM Sleep Card */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>REM Sleep (Fase Mimpi)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-300">
                Target: 20-25%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-teal-950 dark:text-teal-100 font-mono">
                {activeRecord.remSleepHours} Jam
              </span>
              <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                {Math.round((activeRecord.remSleepHours / activeRecord.totalSleepHours) * 100)}%
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-teal-200/60 dark:border-teal-800/60 pt-2">
              Aktivitas gelombang otak tinggi. Berperan krusial dalam konsolidasi memori jangka panjang, stabilitas emosi, dan kejernihan pemikiran kognitif.
            </p>
          </div>

          {/* Light Sleep Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Light Sleep (Ringan)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                Target: 50-60%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-950 dark:text-blue-100 font-mono">
                {activeRecord.lightSleepHours} Jam
              </span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                {Math.round((activeRecord.lightSleepHours / activeRecord.totalSleepHours) * 100)}%
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-blue-200/60 dark:border-blue-800/60 pt-2">
              Fase transisi tidur dasar. Mengistirahatkan otot perifer, menurunkan frekuensi napas dan denyut nadi, serta mempersiapkan tubuh masuk fase dalam.
            </p>
          </div>

          {/* Awake & Latency Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Terjaga & Efisiensi</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                Efisiensi &gt;85%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {activeRecord.awakeMinutes} Menit
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {activeRecord.sleepEfficiencyPct}% Efisien
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-2">
              Mikro-arousal normal selama tidur. Skor efisiensi tinggi menandakan pasien tidur nyenyak tanpa insomnia atau episode apnea berbahaya.
            </p>
          </div>

        </div>

        {/* Visual Stacked Composition Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Komposisi Proporsi Tahapan Tidur:
            </span>
            <span className="text-slate-500 text-[11px]">
              Kepatuhan Standar Konsensus Medis
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
            <div 
              style={{ width: `${Math.round((activeRecord.deepSleepHours / activeRecord.totalSleepHours) * 100)}%` }} 
              className="bg-indigo-600 h-full" 
              title={`Deep Sleep: ${activeRecord.deepSleepHours} Jam`} 
            />
            <div 
              style={{ width: `${Math.round((activeRecord.remSleepHours / activeRecord.totalSleepHours) * 100)}%` }} 
              className="bg-teal-500 h-full" 
              title={`REM Sleep: ${activeRecord.remSleepHours} Jam`} 
            />
            <div 
              style={{ width: `${Math.round((activeRecord.lightSleepHours / activeRecord.totalSleepHours) * 100)}%` }} 
              className="bg-blue-400 h-full" 
              title={`Light Sleep: ${activeRecord.lightSleepHours} Jam`} 
            />
            <div 
              style={{ width: `${Math.round((activeRecord.awakeMinutes / 60 / activeRecord.totalSleepHours) * 100)}%` }} 
              className="bg-slate-400 h-full" 
              title={`Terjaga: ${activeRecord.awakeMinutes} Menit`} 
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Deep ({Math.round((activeRecord.deepSleepHours / activeRecord.totalSleepHours) * 100)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> REM ({Math.round((activeRecord.remSleepHours / activeRecord.totalSleepHours) * 100)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Light ({Math.round((activeRecord.lightSleepHours / activeRecord.totalSleepHours) * 100)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Terjaga</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE OVERNIGHT HYPNOGRAM (LINIMASA SIKLUS TIDUR) */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Hipnogram Sirkadian Semalam (Siklus 90 Menit)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arahkan kursor atau klik blok untuk melihat transisi tahapan gelombang otak dan denyut jantung saat tidur.
            </p>
          </div>

          {hoveredHypnogram && (
            <div className="px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 text-xs font-bold border border-indigo-300 dark:border-indigo-800 flex items-center gap-2">
              <span>{hoveredHypnogram.time} • {hoveredHypnogram.stageLabel}</span>
              <span className="text-rose-500 font-mono">❤️ {hoveredHypnogram.heartRate} BPM</span>
            </div>
          )}
        </div>

        {/* Hypnogram Visual Timeline Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5">
          {hypnogramBlocks.map((block, bIdx) => {
            const isDeep = block.stage === "deep";
            const isRem = block.stage === "rem";
            const isLight = block.stage === "light";
            const isAwake = block.stage === "awake";

            return (
              <div
                key={bIdx}
                onMouseEnter={() => setHoveredHypnogram(block)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isDeep
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                    : isRem
                    ? "bg-teal-500 text-white border-teal-600 shadow-xs"
                    : isLight
                    ? "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                }`}
              >
                <span className="text-[10px] block font-mono font-bold">{block.time}</span>
                <span className="text-[9px] block uppercase font-black truncate mt-0.5">
                  {block.stage}
                </span>
                <span className="text-[9px] block font-mono opacity-80 mt-0.5">
                  {block.heartRate} bpm
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
          <span>{activeRecord.bedTime} (Masuk Kasur)</span>
          <span className="text-teal-600 dark:text-teal-400 font-bold">Terjadi 4 Siklus Lengkap 90-110 Menit</span>
          <span>{activeRecord.wakeTime} (Bangun Subuh)</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. 7-DAY LONGITUDINAL SLEEP STAGE TRENDS (RECHARTS) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Tren Kualitas Tidur 7 Hari Terakhir (Longitudinal Recharts)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rata-rata 7 hari: Total {sleepAnalysis.avgTotalSleepHours} Jam • Deep {sleepAnalysis.avgDeepSleepHours} Jam • REM {sleepAnalysis.avgRemSleepHours} Jam • Skor {sleepAnalysis.avgSleepScore}/100
            </p>
          </div>

          {/* Metric View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: "all", label: "Semua Tahap" },
              { id: "deep", label: "Deep Sleep" },
              { id: "rem", label: "REM Sleep" },
              { id: "total", label: "Total Tidur" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTrendView(t.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trendView === t.id
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area / Line Chart */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rechartsData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="remGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, trendView === "total" ? 10 : 3.5]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" Jam" />
              <Tooltip content={<CustomSleepTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

              {(trendView === "all" || trendView === "deep") && (
                <Area 
                  type="monotone" 
                  dataKey="deep" 
                  name="Deep Sleep" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5} 
                  fill="url(#deepGrad)" 
                />
              )}

              {(trendView === "all" || trendView === "rem") && (
                <Area 
                  type="monotone" 
                  dataKey="rem" 
                  name="REM Sleep" 
                  stroke="#0d9488" 
                  strokeWidth={2.5} 
                  fill="url(#remGrad)" 
                />
              )}

              {(trendView === "total") && (
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Tidur" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  fill="url(#totalGrad)" 
                />
              )}

              {trendView === "all" && (
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Jam" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  strokeDasharray="3 3" 
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Clinical Note Footer */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3 text-xs">
          <Stethoscope className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-indigo-950 dark:text-indigo-200">
              Evaluasi Medis & Adaptasi Fisiologis {member.name}:
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {sleepAnalysis.clinicalSleepNotes}
            </p>
            <p className="text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] pt-1 border-t border-indigo-200/60 dark:border-indigo-800/60">
              💡 {sleepAnalysis.wearableSyncTip}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
