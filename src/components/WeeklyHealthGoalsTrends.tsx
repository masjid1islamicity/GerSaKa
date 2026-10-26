import React, { useState, useMemo } from "react";
import { FamilyMember } from "../types";
import { MemberGoalSettings, MemberGoalProgress } from "./HealthGoals";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine 
} from "recharts";
import {
  TrendingUp,
  Droplet,
  Footprints,
  Moon,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sliders,
  Award,
  Zap,
  Activity,
  ChevronRight,
  Info,
  Dumbbell
} from "lucide-react";

export interface DailyGoalRecord {
  dayKey: string;
  dayShort: string;
  dayFull: string;
  dateStr: string;
  isToday: boolean;
  
  // Water
  waterMl: number;
  waterTargetMl: number;
  waterPct: number;
  waterMet: boolean;
  
  // Steps
  steps: number;
  stepsTarget: number;
  stepsPct: number;
  stepsMet: boolean;
  
  // Sleep
  sleepHours: number;
  sleepTargetHours: number;
  sleepPct: number;
  sleepMet: boolean;

  // Exercise
  exerciseMinutes: number;
  exerciseTargetMinutes: number;
  exercisePct: number;
  exerciseMet: boolean;
  
  // Aggregated
  metCount: number; // 0..4
  avgPct: number;
}

interface WeeklyHealthGoalsTrendsProps {
  member: FamilyMember;
  goalSettings: MemberGoalSettings;
  todayProgress: MemberGoalProgress;
  allMembers: FamilyMember[];
  onSelectMember: (id: string) => void;
  onOpenSettings?: () => void;
  onSwitchToToday?: () => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

// Deterministic historical 6 days base ratios for each member
const MEMBER_HISTORICAL_RATIOS: Record<
  string,
  {
    waterRatios: number[];
    stepsRatios: number[];
    sleepRatios: number[];
    exerciseRatios: number[];
  }
> = {
  "fam-01": { // Hendra Kusuma (Ayah)
    waterRatios: [0.94, 1.02, 0.90, 1.04, 1.08, 0.96], // relative to target
    stepsRatios: [0.98, 1.02, 0.95, 1.12, 1.03, 0.99],
    sleepRatios: [0.91, 0.93, 0.87, 0.95, 0.97, 0.92],
    exerciseRatios: [0.95, 1.05, 0.90, 1.10, 1.15, 0.98],
  },
  "fam-02": { // Siti Rahmawati (Ibu)
    waterRatios: [0.95, 1.02, 0.91, 1.05, 1.00, 1.09],
    stepsRatios: [0.96, 1.01, 0.95, 1.04, 1.00, 1.03],
    sleepRatios: [0.94, 0.95, 0.93, 0.96, 1.00, 0.95],
    exerciseRatios: [0.90, 1.00, 0.95, 1.05, 1.10, 0.96],
  },
  "fam-03": { // Dimas / Zikri (Atlet / Pemuda)
    waterRatios: [1.04, 1.02, 0.96, 1.11, 1.07, 1.00],
    stepsRatios: [1.05, 1.12, 0.98, 1.20, 1.08, 1.02],
    sleepRatios: [1.00, 0.98, 1.03, 1.00, 1.04, 0.99],
    exerciseRatios: [1.10, 1.05, 1.20, 1.15, 1.00, 1.25],
  },
  "fam-04": { // Zahra (Remaja)
    waterRatios: [0.98, 1.03, 0.93, 1.05, 1.00, 1.10],
    stepsRatios: [0.97, 1.03, 0.93, 1.06, 0.99, 1.01],
    sleepRatios: [0.96, 1.00, 0.92, 0.99, 1.01, 0.98],
    exerciseRatios: [0.95, 1.00, 0.90, 1.10, 1.05, 0.98],
  },
  "fam-05": { // Kakek Mansyur / Subroto (Lansia)
    waterRatios: [0.95, 1.03, 0.92, 1.00, 1.05, 0.97],
    stepsRatios: [0.96, 1.04, 0.92, 1.02, 0.98, 1.01],
    sleepRatios: [0.96, 0.99, 0.93, 1.00, 1.01, 0.97],
    exerciseRatios: [0.92, 1.04, 0.96, 1.00, 1.08, 0.95],
  },
};

type MetricChartFilter = "all" | "water" | "steps" | "sleep" | "exercise";

export const WeeklyHealthGoalsTrends: React.FC<WeeklyHealthGoalsTrendsProps> = ({
  member,
  goalSettings,
  todayProgress,
  allMembers,
  onSelectMember,
  onOpenSettings,
  onSwitchToToday,
  onShowToast,
}) => {
  const [metricFilter, setMetricFilter] = useState<MetricChartFilter>("all");
  const [selectedDayDetailIndex, setSelectedDayDetailIndex] = useState<number | null>(6); // Default select today

  // Build 7-day data (6 historical days + today)
  const weeklyData: DailyGoalRecord[] = useMemo(() => {
    const records: DailyGoalRecord[] = [];
    const ratios = MEMBER_HISTORICAL_RATIOS[member.id] || {
      waterRatios: [0.92, 0.98, 0.95, 1.02, 1.05, 0.96],
      stepsRatios: [0.94, 1.00, 0.96, 1.08, 1.02, 0.98],
      sleepRatios: [0.93, 0.96, 0.90, 0.98, 1.01, 0.95],
      exerciseRatios: [0.95, 1.05, 0.92, 1.08, 1.12, 0.98],
    };

    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const fullDayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    
    const now = new Date();
    const exTarget = goalSettings.exerciseTargetMinutes || 45;

    // 6 prior days
    for (let i = 6; i >= 1; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ratioIdx = 6 - i;

      const wRatio = ratios.waterRatios[ratioIdx] ?? 1.0;
      const sRatio = ratios.stepsRatios[ratioIdx] ?? 1.0;
      const lRatio = ratios.sleepRatios[ratioIdx] ?? 1.0;
      const eRatio = ratios.exerciseRatios?.[ratioIdx] ?? 1.0;

      const waterVal = Math.round((goalSettings.waterTargetMl * wRatio) / 50) * 50;
      const stepsVal = Math.round((goalSettings.stepsTarget * sRatio) / 50) * 50;
      const sleepVal = Number((goalSettings.sleepTargetHours * lRatio).toFixed(1));
      const exerciseVal = Math.round((exTarget * eRatio) / 5) * 5;

      const wPct = Math.round((waterVal / goalSettings.waterTargetMl) * 100);
      const sPct = Math.round((stepsVal / goalSettings.stepsTarget) * 100);
      const lPct = Math.round((sleepVal / goalSettings.sleepTargetHours) * 100);
      const ePct = Math.round((exerciseVal / exTarget) * 100);

      const metCount = (wPct >= 100 ? 1 : 0) + (sPct >= 100 ? 1 : 0) + (lPct >= 100 ? 1 : 0) + (ePct >= 100 ? 1 : 0);
      const avgPct = Math.round((wPct + sPct + lPct + ePct) / 4);

      records.push({
        dayKey: `H-${i}`,
        dayShort: dayNames[d.getDay()],
        dayFull: fullDayNames[d.getDay()],
        dateStr: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        isToday: false,
        waterMl: waterVal,
        waterTargetMl: goalSettings.waterTargetMl,
        waterPct: wPct,
        waterMet: wPct >= 100,
        steps: stepsVal,
        stepsTarget: goalSettings.stepsTarget,
        stepsPct: sPct,
        stepsMet: sPct >= 100,
        sleepHours: sleepVal,
        sleepTargetHours: goalSettings.sleepTargetHours,
        sleepPct: lPct,
        sleepMet: lPct >= 100,
        exerciseMinutes: exerciseVal,
        exerciseTargetMinutes: exTarget,
        exercisePct: ePct,
        exerciseMet: ePct >= 100,
        metCount,
        avgPct,
      });
    }

    // 7th day: Today (uses live progress from props)
    const todayWater = todayProgress.waterCurrentMl;
    const todaySteps = todayProgress.stepsCurrent;
    const todaySleep = todayProgress.sleepCurrentHours;
    const todayExercise = todayProgress.exerciseCurrentMinutes || 45;

    const todayWPct = Math.round((todayWater / goalSettings.waterTargetMl) * 100);
    const todaySPct = Math.round((todaySteps / goalSettings.stepsTarget) * 100);
    const todayLPct = Math.round((todaySleep / goalSettings.sleepTargetHours) * 100);
    const todayEPct = Math.round((todayExercise / exTarget) * 100);

    const todayMetCount = (todayWPct >= 100 ? 1 : 0) + (todaySPct >= 100 ? 1 : 0) + (todayLPct >= 100 ? 1 : 0) + (todayEPct >= 100 ? 1 : 0);
    const todayAvgPct = Math.round((todayWPct + todaySPct + todayLPct + todayEPct) / 4);

    records.push({
      dayKey: "Hari Ini",
      dayShort: "Hari Ini",
      dayFull: fullDayNames[now.getDay()] + " (Hari Ini)",
      dateStr: `${now.getDate()} ${monthNames[now.getMonth()]}`,
      isToday: true,
      waterMl: todayWater,
      waterTargetMl: goalSettings.waterTargetMl,
      waterPct: todayWPct,
      waterMet: todayWPct >= 100,
      steps: todaySteps,
      stepsTarget: goalSettings.stepsTarget,
      stepsPct: todaySPct,
      stepsMet: todaySPct >= 100,
      sleepHours: todaySleep,
      sleepTargetHours: goalSettings.sleepTargetHours,
      sleepPct: todayLPct,
      sleepMet: todayLPct >= 100,
      exerciseMinutes: todayExercise,
      exerciseTargetMinutes: exTarget,
      exercisePct: todayEPct,
      exerciseMet: todayEPct >= 100,
      metCount: todayMetCount,
      avgPct: todayAvgPct,
    });

    return records;
  }, [member.id, goalSettings, todayProgress]);

  // Aggregate weekly metrics
  const stats = useMemo(() => {
    const totalDays = weeklyData.length;
    const exTarget = goalSettings.exerciseTargetMinutes || 45;
    
    // Water
    const avgWater = Math.round(weeklyData.reduce((acc, d) => acc + d.waterMl, 0) / totalDays);
    const waterMetDays = weeklyData.filter(d => d.waterMet).length;
    const avgWaterPct = Math.round((avgWater / goalSettings.waterTargetMl) * 100);

    // Steps
    const avgSteps = Math.round(weeklyData.reduce((acc, d) => acc + d.steps, 0) / totalDays);
    const stepsMetDays = weeklyData.filter(d => d.stepsMet).length;
    const avgStepsPct = Math.round((avgSteps / goalSettings.stepsTarget) * 100);
    const totalWeeklySteps = weeklyData.reduce((acc, d) => acc + d.steps, 0);

    // Sleep
    const avgSleep = Number((weeklyData.reduce((acc, d) => acc + d.sleepHours, 0) / totalDays).toFixed(1));
    const sleepMetDays = weeklyData.filter(d => d.sleepMet).length;
    const avgSleepPct = Math.round((avgSleep / goalSettings.sleepTargetHours) * 100);

    // Exercise
    const avgExercise = Math.round(weeklyData.reduce((acc, d) => acc + d.exerciseMinutes, 0) / totalDays);
    const exerciseMetDays = weeklyData.filter(d => d.exerciseMet).length;
    const avgExercisePct = Math.round((avgExercise / exTarget) * 100);
    const totalWeeklyExercise = weeklyData.reduce((acc, d) => acc + d.exerciseMinutes, 0);

    // Perfect days (all 4 goals met)
    const perfectDays = weeklyData.filter(d => d.metCount === 4).length;
    const overallCompliancePct = Math.round(
      ((waterMetDays + stepsMetDays + sleepMetDays + exerciseMetDays) / (totalDays * 4)) * 100
    );

    return {
      avgWater,
      waterMetDays,
      avgWaterPct,
      avgSteps,
      stepsMetDays,
      avgStepsPct,
      totalWeeklySteps,
      avgSleep,
      sleepMetDays,
      avgSleepPct,
      avgExercise,
      exerciseMetDays,
      avgExercisePct,
      totalWeeklyExercise,
      perfectDays,
      overallCompliancePct,
    };
  }, [weeklyData, goalSettings]);

  // Prepare chart data format for Recharts
  const chartData = useMemo(() => {
    return weeklyData.map(d => ({
      name: d.isToday ? "Hari Ini" : d.dayShort,
      fullDate: `${d.dayFull}, ${d.dateStr}`,
      isToday: d.isToday,
      
      // Normalized %
      waterPct: d.waterPct,
      stepsPct: d.stepsPct,
      sleepPct: d.sleepPct,
      exercisePct: d.exercisePct,
      
      // Raw values
      waterMl: d.waterMl,
      waterTargetMl: d.waterTargetMl,
      steps: d.steps,
      stepsTarget: d.stepsTarget,
      sleepHours: d.sleepHours,
      sleepTargetHours: d.sleepTargetHours,
      exerciseMinutes: d.exerciseMinutes,
      exerciseTargetMinutes: d.exerciseTargetMinutes,
      
      // Aggregates
      metCount: d.metCount,
      avgPct: d.avgPct,
    }));
  }, [weeklyData]);

  // Active selected day detail record
  const selectedDay = selectedDayDetailIndex !== null ? weeklyData[selectedDayDetailIndex] : weeklyData[6];

  // Custom Recharts Tooltip
  const CustomTrendsTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0].payload;

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs min-w-[220px] space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <div className="font-black text-sm text-white flex items-center gap-1.5">
              <span>{dataPoint.fullDate}</span>
              {dataPoint.isToday && (
                <span className="text-[10px] bg-teal-500 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                  LIVE
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Pencapaian: {dataPoint.metCount}/3 Target ({dataPoint.avgPct}%)
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {/* Water */}
          {(metricFilter === "all" || metricFilter === "water") && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                <span>Asupan Air:</span>
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-white">
                  {dataPoint.waterMl.toLocaleString("id-ID")} ml
                </span>
                <span className="text-[10px] text-cyan-300 ml-1 font-mono">
                  ({dataPoint.waterPct}%)
                </span>
              </div>
            </div>
          )}

          {/* Steps */}
          {(metricFilter === "all" || metricFilter === "steps") && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>Langkah:</span>
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-white">
                  {dataPoint.steps.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-emerald-300 ml-1 font-mono">
                  ({dataPoint.stepsPct}%)
                </span>
              </div>
            </div>
          )}

          {/* Sleep */}
          {(metricFilter === "all" || metricFilter === "sleep") && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tidur:</span>
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-white">
                  {dataPoint.sleepHours} jam
                </span>
                <span className="text-[10px] text-indigo-300 ml-1 font-mono">
                  ({dataPoint.sleepPct}%)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Status Target Harian</span>
          <span className={`font-bold ${dataPoint.metCount === 3 ? "text-emerald-400" : dataPoint.metCount >= 1 ? "text-amber-400" : "text-rose-400"}`}>
            {dataPoint.metCount === 3 ? "✓ Semua Terpenuhi" : `${dataPoint.metCount} dari 3 Sasaran`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. WEEKLY PERFORMANCE HERO SUMMARY CARDS */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-teal-400" />
                Tren 7 Hari Terakhir
              </span>
              <span className="text-xs text-slate-300">
                Data Longitudinal Wearable & Log Harian
              </span>
              <span className="text-xs text-teal-300/80">
                · {member.name} ({member.role})
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ringkasan Kepatuhan Sasaran: {stats.overallCompliancePct}% Kepatuhan Mingguan
            </h3>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {stats.overallCompliancePct >= 85
                ? `Maa syaa Allah! ${member.name} mempertahankan kedisiplinan hidup sehat yang sangat prima. ${stats.perfectDays} dari 7 hari berhasil mencapai 100% dari ketiga pilar sasaran (air, langkah, dan tidur).`
                : `Konsistensi kesehatan ${member.name} terjaga pada ${stats.overallCompliancePct}%. Tinjau grafik tren di bawah untuk melihat pola hari yang memerlukan dorongan hidrasi atau pemulihan tidur.`}
            </p>
          </div>

          {/* Quick Snapshot Badges */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[100px]">
              <div className="text-xl font-black font-mono text-cyan-300">
                {stats.waterMetDays}/7 Hari
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Droplet className="w-2.5 h-2.5 text-cyan-400" />
                <span>Air Terpenuhi</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[100px]">
              <div className="text-xl font-black font-mono text-emerald-300">
                {stats.stepsMetDays}/7 Hari
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Footprints className="w-2.5 h-2.5 text-emerald-400" />
                <span>Langkah Terpenuhi</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[100px]">
              <div className="text-xl font-black font-mono text-indigo-300">
                {stats.sleepMetDays}/7 Hari
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Moon className="w-2.5 h-2.5 text-indigo-400" />
                <span>Tidur Cukup</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. THREE CORE METRIC 7-DAY SUMMARY TILES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Water 7-Day Avg */}
        <div 
          onClick={() => setMetricFilter("water")}
          className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
            metricFilter === "water"
              ? "bg-cyan-50/90 dark:bg-cyan-950/40 border-cyan-500 shadow-md ring-2 ring-cyan-500/20"
              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-cyan-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Rata-rata Air 7 Hari
                </span>
                <span className="text-[10px] text-slate-500">
                  Target: {goalSettings.waterTargetMl.toLocaleString("id-ID")} ml/hari
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              stats.avgWaterPct >= 100
                ? "bg-cyan-600 text-white"
                : "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
            }`}>
              {stats.avgWaterPct}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-cyan-700 dark:text-cyan-300">
                {stats.avgWater.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-slate-500 ml-1 font-medium">ml / hari</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.waterMetDays}/7 hari tercapai
            </span>
          </div>

          <div className="mt-2 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, stats.avgWaterPct)}%` }}
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
            />
          </div>
          <div className="mt-2 text-[10px] text-cyan-700 dark:text-cyan-300 flex items-center gap-1 font-medium">
            <span>Klik untuk isolasi grafik air →</span>
          </div>
        </div>

        {/* Metric 2: Steps 7-Day Avg */}
        <div 
          onClick={() => setMetricFilter("steps")}
          className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
            metricFilter === "steps"
              ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Rata-rata Langkah 7 Hari
                </span>
                <span className="text-[10px] text-slate-500">
                  Target: {goalSettings.stepsTarget.toLocaleString("id-ID")} langkah/hari
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              stats.avgStepsPct >= 100
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}>
              {stats.avgStepsPct}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                {stats.avgSteps.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-slate-500 ml-1 font-medium">langkah / hari</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.stepsMetDays}/7 hari tercapai
            </span>
          </div>

          <div className="mt-2 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, stats.avgStepsPct)}%` }}
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            />
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium">
            <span>Klik untuk isolasi grafik langkah →</span>
          </div>
        </div>

        {/* Metric 3: Sleep 7-Day Avg */}
        <div 
          onClick={() => setMetricFilter("sleep")}
          className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
            metricFilter === "sleep"
              ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Rata-rata Tidur 7 Hari
                </span>
                <span className="text-[10px] text-slate-500">
                  Target: {goalSettings.sleepTargetHours} jam/hari
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              stats.avgSleepPct >= 100
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
            }`}>
              {stats.avgSleepPct}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">
                {stats.avgSleep}
              </span>
              <span className="text-xs text-slate-500 ml-1 font-medium">jam / malam</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.sleepMetDays}/7 hari tercapai
            </span>
          </div>

          <div className="mt-2 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, stats.avgSleepPct)}%` }}
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            />
          </div>
          <div className="mt-2 text-[10px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1 font-medium">
            <span>Klik untuk isolasi grafik tidur →</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. RECHARTS LINE CHART: 7-DAY PROGRESS OVER TIME */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>
                {metricFilter === "all" && "Visualisasi Garis Tren 7 Hari (% Pencapaian Target Sasaran)"}
                {metricFilter === "water" && "Visualisasi Garis Tren 7 Hari: Asupan Air (Mililiter)"}
                {metricFilter === "steps" && "Visualisasi Garis Tren 7 Hari: Jumlah Langkah Kaki"}
                {metricFilter === "sleep" && "Visualisasi Garis Tren 7 Hari: Durasi Tidur Restoratif (Jam)"}
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {metricFilter === "all"
                ? "Garis target 100% (garis putus-putus) menandakan ambang batas sasaran harian tercapai untuk setiap parameter."
                : `Target ${member.name}: ${
                    metricFilter === "water"
                      ? `${goalSettings.waterTargetMl.toLocaleString("id-ID")} ml`
                      : metricFilter === "steps"
                      ? `${goalSettings.stepsTarget.toLocaleString("id-ID")} langkah`
                      : `${goalSettings.sleepTargetHours} jam`
                  } per hari.`}
            </p>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setMetricFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                metricFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Semua (% Sasaran)
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter("water")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                metricFilter === "water"
                  ? "bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-cyan-600"
              }`}
            >
              <Droplet className="w-3 h-3 text-cyan-500" />
              <span>Air (ml)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter("steps")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                metricFilter === "steps"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
              }`}
            >
              <Footprints className="w-3 h-3 text-emerald-500" />
              <span>Langkah</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter("sleep")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                metricFilter === "sleep"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-500" />
              <span>Tidur (Jam)</span>
            </button>
          </div>
        </div>

        {/* The Recharts Line Chart */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
              />
              
              {metricFilter === "all" ? (
                <YAxis 
                  domain={[0, (dataMax: number) => Math.max(120, Math.ceil(dataMax / 10) * 10)]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  unit="%"
                  tickLine={false}
                />
              ) : metricFilter === "water" ? (
                <YAxis 
                  domain={[0, (dataMax: number) => Math.max(goalSettings.waterTargetMl + 500, Math.ceil(dataMax / 500) * 500)]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  unit="ml"
                  tickLine={false}
                />
              ) : metricFilter === "steps" ? (
                <YAxis 
                  domain={[0, (dataMax: number) => Math.max(goalSettings.stepsTarget + 2000, Math.ceil(dataMax / 1000) * 1000)]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                />
              ) : (
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  unit="j"
                  tickLine={false}
                />
              )}

              <Tooltip content={<CustomTrendsTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

              {/* Reference line for 100% or absolute target */}
              {metricFilter === "all" && (
                <ReferenceLine 
                  y={100} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: "Target 100%", fill: "#059669", fontSize: 11, position: "insideTopRight" }} 
                />
              )}

              {metricFilter === "water" && (
                <ReferenceLine 
                  y={goalSettings.waterTargetMl} 
                  stroke="#0284c7" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: `Target: ${goalSettings.waterTargetMl} ml`, fill: "#0284c7", fontSize: 11, position: "insideTopRight" }} 
                />
              )}

              {metricFilter === "steps" && (
                <ReferenceLine 
                  y={goalSettings.stepsTarget} 
                  stroke="#059669" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: `Target: ${goalSettings.stepsTarget.toLocaleString()} langkah`, fill: "#059669", fontSize: 11, position: "insideTopRight" }} 
                />
              )}

              {metricFilter === "sleep" && (
                <ReferenceLine 
                  y={goalSettings.sleepTargetHours} 
                  stroke="#6366f1" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: `Target: ${goalSettings.sleepTargetHours} jam`, fill: "#6366f1", fontSize: 11, position: "insideTopRight" }} 
                />
              )}

              {/* Lines rendering based on filter */}
              {(metricFilter === "all" || metricFilter === "water") && (
                <Line
                  type="monotone"
                  dataKey={metricFilter === "all" ? "waterPct" : "waterMl"}
                  name={metricFilter === "all" ? "Air (% Target)" : "Air Minum (ml)"}
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, stroke: "#0284c7", strokeWidth: 2, fill: "#38bdf8" }}
                />
              )}

              {(metricFilter === "all" || metricFilter === "steps") && (
                <Line
                  type="monotone"
                  dataKey={metricFilter === "all" ? "stepsPct" : "steps"}
                  name={metricFilter === "all" ? "Langkah (% Target)" : "Langkah Kaki"}
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2, fill: "#34d399" }}
                />
              )}

              {(metricFilter === "all" || metricFilter === "sleep") && (
                <Line
                  type="monotone"
                  dataKey={metricFilter === "all" ? "sleepPct" : "sleepHours"}
                  name={metricFilter === "all" ? "Tidur (% Target)" : "Tidur (Jam)"}
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2, fill: "#a5b4fc" }}
                />
              )}

            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Guide Note */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
              <span>Air: Hidrasi & Viskositas Darah</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Langkah: Kardio & Pembakaran Kalori</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>Tidur: Regenerasi Sel & Kognitif</span>
            </span>
          </div>

          <div className="text-slate-400">
            Titik terakhir = Progres hari ini (diperbarui real-time saat Anda mencatat data).
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. 7-DAY DAILY BREAKDOWN GRID / MATRIX */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Matriks Rincian Harian 7 Hari Terakhir:</span>
          </h4>
          <span className="text-xs text-slate-500">
            Klik hari untuk menginspeksi pencapaian
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {weeklyData.map((day, idx) => {
            const isSelected = selectedDayDetailIndex === idx;
            return (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => setSelectedDayDetailIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-2 relative ${
                  isSelected
                    ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-sm"
                    : day.isToday
                    ? "bg-slate-50/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-teal-300"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${day.isToday ? "text-teal-700 dark:text-teal-300" : "text-slate-800 dark:text-slate-200"}`}>
                    {day.dayShort}
                  </span>
                  {day.isToday ? (
                    <span className="text-[9px] font-bold bg-teal-600 text-white px-1.5 py-0.2 rounded-md">
                      HARI INI
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {day.dateStr}
                    </span>
                  )}
                </div>

                {/* Score & Met Count */}
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className={`text-sm font-black font-mono ${
                    day.metCount === 3 ? "text-emerald-600 dark:text-emerald-400" : day.metCount >= 1 ? "text-teal-600 dark:text-teal-400" : "text-rose-500"
                  }`}>
                    {day.metCount}/3 Target
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {day.avgPct}%
                  </span>
                </div>

                {/* 3 Metric Mini Indicators */}
                <div className="space-y-1.5 pt-1 text-[10px]">
                  {/* Water */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Droplet className="w-2.5 h-2.5 text-cyan-500" />
                      <span>Air</span>
                    </span>
                    <span className={`font-mono font-bold ${day.waterMet ? "text-cyan-700 dark:text-cyan-300" : "text-slate-600 dark:text-slate-400"}`}>
                      {day.waterMl >= 1000 ? `${(day.waterMl / 1000).toFixed(1)}L` : `${day.waterMl}ml`}
                    </span>
                  </div>

                  {/* Steps */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Footprints className="w-2.5 h-2.5 text-emerald-500" />
                      <span>Langkah</span>
                    </span>
                    <span className={`font-mono font-bold ${day.stepsMet ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400"}`}>
                      {(day.steps / 1000).toFixed(1)}k
                    </span>
                  </div>

                  {/* Sleep */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Moon className="w-2.5 h-2.5 text-indigo-500" />
                      <span>Tidur</span>
                    </span>
                    <span className={`font-mono font-bold ${day.sleepMet ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>
                      {day.sleepHours}j
                    </span>
                  </div>
                </div>

                {/* Status indicator bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
                  <div 
                    style={{ width: `${day.waterMet ? 33.3 : 0}%` }} 
                    className="h-full bg-cyan-500" 
                  />
                  <div 
                    style={{ width: `${day.stepsMet ? 33.3 : 0}%` }} 
                    className="h-full bg-emerald-500" 
                  />
                  <div 
                    style={{ width: `${day.sleepMet ? 33.4 : 0}%` }} 
                    className="h-full bg-indigo-500" 
                  />
                </div>

              </button>
            );
          })}
        </div>

        {/* Selected Day Expanded Detail Card */}
        {selectedDay && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  Rincian Detail: {selectedDay.dayFull}, {selectedDay.dateStr}
                </span>
                {selectedDay.isToday && (
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px]">
                    Hari Berjalan
                  </span>
                )}
              </div>
              <p className="text-slate-500">
                Pencapaian gabungan: <strong>{selectedDay.metCount} dari 3 target terpenuhi ({selectedDay.avgPct}%)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                <span>Air: <strong>{selectedDay.waterMl.toLocaleString("id-ID")} ml</strong> ({selectedDay.waterPct}%)</span>
                {selectedDay.waterMet ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-slate-400">Kurang</span>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                <span>Langkah: <strong>{selectedDay.steps.toLocaleString("id-ID")}</strong> ({selectedDay.stepsPct}%)</span>
                {selectedDay.stepsMet ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-slate-400">Kurang</span>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tidur: <strong>{selectedDay.sleepHours} Jam</strong> ({selectedDay.sleepPct}%)</span>
                {selectedDay.sleepMet ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-slate-400">Kurang</span>
                )}
              </div>

              {selectedDay.isToday && onSwitchToToday && (
                <button
                  type="button"
                  onClick={onSwitchToToday}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Catat Progres Hari Ini</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. CLINICAL & LIFESTYLE AI RECOMMENDATION BANNER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/70 via-slate-50 to-emerald-50/70 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-teal-950/30 border border-teal-200 dark:border-teal-800/60 flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white">
              Insight Klinis Berdasarkan Tren 7 Hari {member.name}
            </span>
            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full">
              Analisis Otomatis Wearable
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {member.id === "fam-01"
              ? "Kepatuhan hidrasi Ayah Hendra stabil di kisaran 2.450 ml, sangat protektif terhadap tekanan darah sistolik dan viskositas plasma. Disarankan menjaga waktu tidur minimal 7,5 jam terutama di hari kerja agar denyut jantung istirahat tetap berada di rentang optimal 70-73 BPM."
              : member.id === "fam-02"
              ? "Target langkah Ibu Siti konsisten di atas 7.000 langkah, memberikan stimulus beban aksial yang sangat baik untuk densitas mineral tulang dan sendi. Pertahankan hidrasi 2.200 ml menjelang sore."
              : member.id === "fam-03"
              ? "Aktivitas kardio dan jumlah langkah harian melampaui 10.000 langkah dengan kualitas pemulihan tidur 8 jam. Pasokan hidrasi 2.800 ml wajib dipertahankan setelah sesi latihan intensif."
              : member.id === "fam-04"
              ? "Durasi tidur restoratif Zahra sangat mencukupi (8,3 jam/malam). Konsistensi hidrasi air putih pada jam sekolah perlu ditingkatkan agar mencapai 2.000 ml penuh."
              : "Mobilitas Kakek Mansyur terukur aman di kisaran 4.800-5.200 langkah tanpa fluktuasi kelelahan drastis. Disarankan minum teratur sedikit-sedikit setiap 1,5 jam di siang hari."}
          </p>
        </div>
      </div>

    </div>
  );
};
