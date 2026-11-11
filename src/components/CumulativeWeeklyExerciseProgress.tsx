import React, { useState, useEffect, useRef, useMemo } from "react";
import { FamilyMember } from "../types";
import { MemberGoalSettings, MemberGoalProgress } from "./HealthGoals";
import { computeMemberExerciseSummary } from "../utils/exerciseTrends";
import {
  Flame,
  Trophy,
  Dumbbell,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  Watch,
  TrendingUp,
  Plus,
  Minus,
  Settings,
  ChevronRight,
  Info,
  Clock,
  Activity,
  Award,
  Zap,
  Check
} from "lucide-react";

interface CumulativeWeeklyExerciseProgressProps {
  member: FamilyMember;
  allMembers?: FamilyMember[];
  goalSettings: MemberGoalSettings;
  goalProgress: MemberGoalProgress;
  onSelectMember?: (id: string) => void;
  onAddExerciseMinutes?: (minutes: number) => void;
  onOpenSettings?: () => void;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
}

export const CumulativeWeeklyExerciseProgress: React.FC<CumulativeWeeklyExerciseProgressProps> = ({
  member,
  allMembers = [],
  goalSettings,
  goalProgress,
  onSelectMember,
  onAddExerciseMinutes,
  onOpenSettings,
  onSyncWearable,
  isSyncing = false,
}) => {
  // Current daily target & today's progress
  const dailyTarget = goalSettings.exerciseTargetMinutes || 45;
  const todayMinutes = goalProgress.exerciseCurrentMinutes;

  // Weekly Cumulative Target: configured in settings or defaults to 7 * dailyTarget
  const weeklyTarget = goalSettings.weeklyCumulativeExerciseTargetMinutes || (dailyTarget * 7);

  // Compute 7-day records and total cumulative minutes
  const exerciseSummary = useMemo(() => {
    return computeMemberExerciseSummary(member, todayMinutes, dailyTarget);
  }, [member, todayMinutes, dailyTarget]);

  const totalWeeklyMinutes = exerciseSummary.totalWeekMinutes;
  const avgDailyMinutes = exerciseSummary.avgDailyMinutes;

  // Percentage calculations
  const weeklyPct = Math.round((totalWeeklyMinutes / (weeklyTarget || 1)) * 100);
  const dailyPct = Math.round((todayMinutes / (dailyTarget || 1)) * 100);

  // Status evaluations
  const isWeeklyMet = totalWeeklyMinutes >= weeklyTarget;
  const isDailyMet = todayMinutes >= dailyTarget;
  const weeklyDelta = totalWeeklyMinutes - weeklyTarget;
  const dailyDelta = todayMinutes - dailyTarget;

  // ---------------------------------------------------------------------------
  // Smooth-In Animation State (Dynamic count-up & SVG gauge sweep-in)
  // ---------------------------------------------------------------------------
  const [displayWeeklyPct, setDisplayWeeklyPct] = useState(0);
  const [displayDailyPct, setDisplayDailyPct] = useState(0);
  const [displayWeeklyMinutes, setDisplayWeeklyMinutes] = useState(0);
  const [displayTodayMinutes, setDisplayTodayMinutes] = useState(0);
  const [isJustSynced, setIsJustSynced] = useState(false);
  const [syncPulseTrigger, setSyncPulseTrigger] = useState(0);

  // Detect when wearable sync finishes to trigger celebratory smooth-in pulse
  const prevSyncingRef = useRef(isSyncing);
  useEffect(() => {
    if (prevSyncingRef.current && !isSyncing) {
      setIsJustSynced(true);
      setSyncPulseTrigger((prev) => prev + 1);
      const timer = setTimeout(() => setIsJustSynced(false), 3800);
      return () => clearTimeout(timer);
    }
    prevSyncingRef.current = isSyncing;
  }, [isSyncing]);

  // Easing curve (easeOutCubic) for dynamic smooth-in transition on mount, member change, data sync, or progress update
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = isSyncing ? 800 : 1200; // 1.2s smooth-in transition
    const startWeeklyPct = 0;
    const targetWeeklyPct = weeklyPct;
    const startDailyPct = 0;
    const targetDailyPct = dailyPct;
    const startWeeklyMin = 0;
    const targetWeeklyMin = totalWeeklyMinutes;
    const startTodayMin = 0;
    const targetTodayMin = todayMinutes;

    let animFrameId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      setDisplayWeeklyPct(Math.round(startWeeklyPct + (targetWeeklyPct - startWeeklyPct) * eased));
      setDisplayDailyPct(Math.round(startDailyPct + (targetDailyPct - startDailyPct) * eased));
      setDisplayWeeklyMinutes(Math.round(startWeeklyMin + (targetWeeklyMin - startWeeklyMin) * eased));
      setDisplayTodayMinutes(Math.round(startTodayMin + (targetTodayMin - startTodayMin) * eased));

      if (progress < 1) {
        animFrameId = requestAnimationFrame(step);
      }
    };

    animFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [member.id, weeklyPct, dailyPct, totalWeeklyMinutes, todayMinutes, isSyncing, syncPulseTrigger]);

  // SVG Dual Circular Rings Configuration (Driven by smooth-in display percentages)
  // Center: 120, 120 (viewBox: 0 0 240 240)
  // Outer Ring (Weekly Cumulative): r = 88, circ = 2 * PI * 88 ≈ 552.92
  const outerRadius = 88;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerClampedPct = Math.min(100, displayWeeklyPct);
  const outerStrokeDashoffset = outerCircumference - (outerClampedPct / 100) * outerCircumference;

  // Inner Ring (Daily Real-time): r = 68, circ = 2 * PI * 68 ≈ 427.26
  const innerRadius = 68;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerClampedPct = Math.min(100, displayDailyPct);
  const innerStrokeDashoffset = innerCircumference - (innerClampedPct / 100) * innerCircumference;

  return (
    <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 border border-teal-800/60 text-white shadow-xl relative overflow-hidden space-y-6">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & ACTIVE MEMBER BADGE */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
        
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0">
            <Dumbbell className="w-6 h-6 text-slate-950" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-slate-950" />
                Target Mingguan Kumulatif
              </span>
              <span className="text-xs text-teal-300 font-semibold">
                7 Hari Akumulatif
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Progres Durasi Olahraga 7 Hari</span>
              <span className="text-xs font-normal text-slate-400">
                ({member.name} • {member.role})
              </span>
            </h3>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Sesuaikan Target Mingguan & Harian"
            >
              <Settings className="w-3.5 h-3.5 text-amber-300" />
              <span>Atur Target</span>
            </button>
          )}

          {onSyncWearable && (
            <button
              type="button"
              onClick={onSyncWearable}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-teal-800/60 hover:bg-teal-700/80 border border-teal-500/40 text-xs font-bold text-teal-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Sinkron data sensor wearable"
            >
              <Activity className={`w-3.5 h-3.5 text-amber-300 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sinkron..." : "Sinkron Sensor"}</span>
            </button>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. FAMILY MEMBER SELECTOR PILLS */}
      {/* ========================================================================= */}
      {allMembers.length > 1 && onSelectMember && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 relative z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Anggota:
          </span>
          {allMembers.map((m) => {
            const isSelected = m.id === member.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMember(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span>{m.role}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  ({m.name.split(" ")[0]})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CORE DISPLAY: CONCENTRIC CIRCULAR GAUGE + COMPARATIVE PROGRESS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left: Concentric Circular Progress Indicator (SVG) with Smooth-In Dynamic Animation */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl border backdrop-blur-md relative transition-all duration-700 ${
          isSyncing
            ? "bg-emerald-950/40 border-emerald-500/70 ring-4 ring-emerald-500/20 shadow-2xl shadow-emerald-500/30"
            : isJustSynced
              ? "bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-400/30 shadow-xl shadow-amber-500/20"
              : "bg-white/5 border-white/10"
        }`}>
          
          {/* Shimmer dashed border when syncing */}
          {isSyncing && (
            <div 
              className="absolute inset-0 rounded-3xl border-2 border-dashed border-emerald-400/40 pointer-events-none animate-spin"
              style={{ animationDuration: "10s" }}
            />
          )}

          {/* Sync Status Floating Live Badge */}
          {isSyncing ? (
            <div className="mb-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 animate-pulse shadow-sm">
              <Activity className="w-3 h-3 text-amber-300 animate-spin" />
              <span>Sinkronisasi {member.connectedWearable.deviceName}...</span>
            </div>
          ) : isJustSynced ? (
            <div className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 animate-bounce">
              <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
              <span>Telemetri Wearable Berhasil Disinkronkan!</span>
            </div>
          ) : (
            <div className="mb-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-medium flex items-center gap-1.5">
              <Watch className="w-3 h-3 text-teal-400" />
              <span>Sensor: {member.connectedWearable.brand} • {member.connectedWearable.lastSync}</span>
            </div>
          )}

          <div className="relative w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] transition-transform duration-700 ease-out hover:scale-[1.02]">
            <svg
              className="w-full h-full transform -rotate-90 filter drop-shadow-md"
              viewBox="0 0 240 240"
            >
              <defs>
                {/* Gradient for Outer Ring (Weekly Cumulative) */}
                <linearGradient id="weeklyRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="60%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Gradient for Inner Ring (Daily Real-time) */}
                <linearGradient id="dailyRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="60%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Subtle soft glow filter */}
                <filter id="ringSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Outer Ring Background Track */}
              <circle
                cx="120"
                cy="120"
                r={outerRadius}
                fill="none"
                stroke="currentColor"
                className="text-slate-800/80"
                strokeWidth="14"
              />

              {/* Outer Ring Progress (Weekly Cumulative) with Smooth-In transition */}
              <circle
                cx="120"
                cy="120"
                r={outerRadius}
                fill="none"
                stroke="url(#weeklyRingGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={outerCircumference}
                strokeDashoffset={outerStrokeDashoffset}
                style={{
                  transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: isWeeklyMet ? "drop-shadow(0 0 5px rgba(245, 158, 11, 0.5))" : "none"
                }}
              />

              {/* Inner Ring Background Track */}
              <circle
                cx="120"
                cy="120"
                r={innerRadius}
                fill="none"
                stroke="currentColor"
                className="text-slate-800/80"
                strokeWidth="11"
              />

              {/* Inner Ring Progress (Daily Real-time) with Smooth-In transition */}
              <circle
                cx="120"
                cy="120"
                r={innerRadius}
                fill="none"
                stroke="url(#dailyRingGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={innerCircumference}
                strokeDashoffset={innerStrokeDashoffset}
                style={{
                  transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: isDailyMet ? "drop-shadow(0 0 5px rgba(20, 184, 166, 0.5))" : "none"
                }}
              />
            </svg>

            {/* Center Content Hub inside Circular Gauge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Total 7 Hari
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight transition-all duration-300">
                  {displayWeeklyMinutes}
                </span>
                <span className="text-xs text-slate-300 font-bold">mnt</span>
              </div>
              <div className="mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                  isWeeklyMet
                    ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-xs"
                    : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                }`}>
                  {isWeeklyMet ? `Tercapai ${displayWeeklyPct}%` : `${displayWeeklyPct}% Mingguan`}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">
                Hari ini: <strong className="text-teal-300">{displayTodayMinutes} mnt</strong> ({displayDailyPct}%)
              </p>
            </div>
          </div>

          {/* Ring Legend & Indicators */}
          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-xs" />
              <span className="text-amber-200">Mingguan ({displayWeeklyPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-xs" />
              <span className="text-teal-200">Harian ({displayDailyPct}%)</span>
            </div>
          </div>

        </div>

        {/* Right: Comparative Indicator Cards (Weekly vs Daily) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* COMPARATIVE CARDS: SIDE BY SIDE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Card 1: Target Mingguan Kumulatif */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isWeeklyMet
                ? "bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-900/20"
                : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white">Target Mingguan</h4>
                    <p className="text-[10px] text-amber-300/80">Akumulasi 7 Hari</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                  isWeeklyMet
                    ? "bg-amber-400 text-slate-950"
                    : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                }`}>
                  {displayWeeklyPct}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-300">Realisasi / Target:</span>
                  <span className="font-mono font-bold text-white">
                    <strong className="text-base text-amber-300">{displayWeeklyMinutes}</strong> / {weeklyTarget} mnt
                  </span>
                </div>

                {/* Progress bar with smooth width transition */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5">
                  <div
                    style={{ 
                      width: `${Math.min(100, displayWeeklyPct)}%`,
                      transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Rata-rata: <strong className="text-white">{avgDailyMinutes} mnt/hari</strong></span>
                  <span className={isWeeklyMet ? "text-emerald-400 font-bold" : "text-amber-300"}>
                    {isWeeklyMet ? `+${weeklyDelta} mnt surplus` : `Kurang ${Math.abs(weeklyDelta)} mnt`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Target Harian Hari Ini */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isDailyMet
                ? "bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-900/20"
                : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white">Target Harian</h4>
                    <p className="text-[10px] text-teal-300/80">Hari Ini (Senin)</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                  isDailyMet
                    ? "bg-teal-400 text-slate-950"
                    : "bg-teal-400/20 text-teal-300 border border-teal-400/30"
                }`}>
                  {displayDailyPct}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-300">Realisasi / Target:</span>
                  <span className="font-mono font-bold text-white">
                    <strong className="text-base text-teal-300">{displayTodayMinutes}</strong> / {dailyTarget} mnt
                  </span>
                </div>

                {/* Progress bar with smooth width transition */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5">
                  <div
                    style={{ 
                      width: `${Math.min(100, displayDailyPct)}%`,
                      transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Wearable: <strong className="text-white">{member.connectedWearable.brand}</strong></span>
                  <span className={isDailyMet ? "text-emerald-400 font-bold" : "text-amber-300"}>
                    {isDailyMet ? `+${dailyDelta} mnt optimal` : `Kurang ${Math.abs(dailyDelta)} mnt`}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* VISUAL RATIO COMPARISON BAR (PERSENTASE PENCAPAIAN TARGET MINGGUAN VS HARIAN) */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Rasio Komparasi: Mingguan vs Harian</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {displayWeeklyPct >= displayDailyPct 
                  ? `Mingguan lebih unggul +${displayWeeklyPct - displayDailyPct}%` 
                  : `Harian lebih unggul +${displayDailyPct - displayWeeklyPct}%`}
              </span>
            </div>

            {/* Dual stacked visual comparator */}
            <div className="space-y-1.5 text-[10px]">
              {/* Weekly bar */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-amber-300 truncate">Mingguan</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    style={{ 
                      width: `${Math.min(100, displayWeeklyPct)}%`,
                      transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/20" title="100% Target" />
                </div>
                <span className="w-10 font-mono font-bold text-right text-amber-300">{displayWeeklyPct}%</span>
              </div>

              {/* Daily bar */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-semibold text-teal-300 truncate">Harian</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    style={{ 
                      width: `${Math.min(100, displayDailyPct)}%`,
                      transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full"
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/20" title="100% Target" />
                </div>
                <span className="w-10 font-mono font-bold text-right text-teal-300">{displayDailyPct}%</span>
              </div>
            </div>
          </div>

          {/* QUICK LOG ACTION BUTTONS (Mempengaruhi durasi hari ini & otomatis menambah total kumulatif mingguan) */}
          {onAddExerciseMinutes && (
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">
                Log Latihan Cepat:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onAddExerciseMinutes(15)}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+15 mnt</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddExerciseMinutes(30)}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+30 mnt</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddExerciseMinutes(-15)}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                  <span>-15</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. 7-DAY MINI CONTRIBUTION STRIP */}
      {/* ========================================================================= */}
      <div className="pt-2 border-t border-white/10 relative z-10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Kontribusi 7 Hari Terakhir Menuju Target Mingguan:</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {exerciseSummary.targetMetDaysCount}/7 Hari Memenuhi Target Harian
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {exerciseSummary.weeklyRecords.map((rec, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-center transition-all ${
                rec.isToday
                  ? "bg-amber-400/20 border-amber-400 text-white shadow-xs"
                  : rec.isTargetMet
                    ? "bg-white/5 border-emerald-500/40 text-slate-200"
                    : "bg-white/5 border-white/5 text-slate-400"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                {rec.dayShort}
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-white">
                {rec.minutes}m
              </div>
              <div className="mt-1 flex items-center justify-center">
                {rec.isTargetMet ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
