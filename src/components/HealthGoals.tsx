import React, { useState, useEffect, useMemo } from "react";
import { FamilyMember } from "../types";
import { 
  Target, 
  Droplet, 
  Footprints, 
  Moon, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Plus, 
  Minus, 
  RotateCcw, 
  Settings, 
  Users, 
  Watch, 
  Check, 
  ChevronRight, 
  Sliders, 
  Trophy, 
  Zap, 
  ArrowUpRight,
  TrendingUp,
  Bed,
  Smile,
  ShieldCheck,
  RefreshCw,
  X,
  Bell,
  Clock,
  Dumbbell,
  Activity
} from "lucide-react";
import { fireBadgeCelebrationConfetti, fireGrandCelebration } from "../utils/confetti";
import { playCelebrationChime } from "./HealthGoalsNotificationSystem";
import { WeeklyHealthGoalsTrends } from "./WeeklyHealthGoalsTrends";

export interface MemberGoalSettings {
  waterTargetMl: number;
  stepsTarget: number;
  sleepTargetHours: number;
  exerciseTargetMinutes: number; // Durasi Olahraga (menit)
}

export interface MemberGoalProgress {
  waterCurrentMl: number;
  stepsCurrent: number;
  sleepCurrentHours: number;
  exerciseCurrentMinutes: number; // Realisasi Durasi Olahraga (menit)
  lastUpdatedTime: string;
  streakDays: number;
}

interface HealthGoalsProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  onSelectMember: (id: string) => void;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onTriggerReminderSimulation?: (slot: "10:00" | "20:00") => void;
  onOpenNotificationCenter?: () => void;
}

const STORAGE_KEY_SETTINGS = "gersaka_health_goals_settings_v1";
const STORAGE_KEY_PROGRESS = "gersaka_health_goals_progress_v1";

const DEFAULT_GOAL_SETTINGS: Record<string, MemberGoalSettings> = {
  "fam-01": { waterTargetMl: 2500, stepsTarget: 8000, sleepTargetHours: 7.5, exerciseTargetMinutes: 45 }, // Ayah Hendra (Hipertensi, butuh kardio & mobilitas sedang)
  "fam-02": { waterTargetMl: 2200, stepsTarget: 7500, sleepTargetHours: 8.0, exerciseTargetMinutes: 30 }, // Ibu Siti (Osteoarthritis, senam sendi & jalan terarah)
  "fam-03": { waterTargetMl: 2800, stepsTarget: 10000, sleepTargetHours: 8.0, exerciseTargetMinutes: 60 }, // Dimas (Pemuda/atlet, lari & latihan beban)
  "fam-04": { waterTargetMl: 2000, stepsTarget: 7000, sleepTargetHours: 8.5, exerciseTargetMinutes: 40 }, // Nadia (Pelajar, senam postur tubuh & aerobik ringan)
  "fam-05": { waterTargetMl: 1900, stepsTarget: 5000, sleepTargetHours: 7.5, exerciseTargetMinutes: 25 }, // Kakek Subroto (Lansia, senam tera & peregangan)
};

export const HealthGoals: React.FC<HealthGoalsProps> = ({
  member,
  allMembers,
  onSelectMember,
  onSyncWearable,
  isSyncing = false,
  onShowToast,
  onTriggerReminderSimulation,
  onOpenNotificationCenter,
}) => {
  // Mode: "focus" (fokus target hari ini) vs "trends" (tren 7 hari / weekly trends line chart) vs "all" (grid komparasi seluruh keluarga)
  const [viewMode, setViewMode] = useState<"focus" | "trends" | "all">("focus");

  // Settings per member
  const [goalSettings, setGoalSettings] = useState<Record<string, MemberGoalSettings>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_GOAL_SETTINGS;
  });

  // Today progress per member
  const [goalProgress, setGoalProgress] = useState<Record<string, MemberGoalProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    
    // Default initial progress based on member vitals
    const initial: Record<string, MemberGoalProgress> = {};
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    allMembers.forEach(m => {
      initial[m.id] = {
        waterCurrentMl: m.id === "fam-01" ? 1750 : m.id === "fam-03" ? 2200 : 1500,
        stepsCurrent: m.vitals.steps || 7200,
        sleepCurrentHours: m.vitals.sleepHours || 7.2,
        exerciseCurrentMinutes: m.vitals.exerciseMinutes || m.vitals.activeMinutes || (m.id === "fam-01" ? 52 : m.id === "fam-03" ? 85 : 35),
        lastUpdatedTime: nowTime,
        streakDays: m.id === "fam-01" ? 6 : m.id === "fam-03" ? 8 : 4,
      };
    });
    return initial;
  });

  // Modal to customize targets
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(member.id);
  const [tempWaterTarget, setTempWaterTarget] = useState(2500);
  const [tempStepsTarget, setTempStepsTarget] = useState(8000);
  const [tempSleepTarget, setTempSleepTarget] = useState(7.5);
  const [tempExerciseTarget, setTempExerciseTarget] = useState(45);

  // Sync vitals from wearable into step count, sleep hours, and exercise duration when wearable data changes
  useEffect(() => {
    setGoalProgress(prev => {
      const current = prev[member.id] || {
        waterCurrentMl: 1500,
        stepsCurrent: member.vitals.steps,
        sleepCurrentHours: member.vitals.sleepHours,
        exerciseCurrentMinutes: member.vitals.exerciseMinutes ?? member.vitals.activeMinutes ?? 45,
        lastUpdatedTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        streakDays: 5,
      };

      // Update steps, sleep, and exercise duration if wearable has fresh numbers
      const freshExercise = member.vitals.exerciseMinutes ?? member.vitals.activeMinutes ?? current.exerciseCurrentMinutes;
      return {
        ...prev,
        [member.id]: {
          ...current,
          stepsCurrent: member.vitals.steps,
          sleepCurrentHours: member.vitals.sleepHours,
          exerciseCurrentMinutes: freshExercise,
        }
      };
    });
  }, [member.id, member.vitals.steps, member.vitals.sleepHours, member.vitals.activeMinutes, member.vitals.exerciseMinutes]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(goalSettings));
    } catch {
      // ignore
    }
  }, [goalSettings]);

  // Persist progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(goalProgress));
    } catch {
      // ignore
    }
  }, [goalProgress]);

  // Active member target settings & progress
  const activeSettings = goalSettings[member.id] || DEFAULT_GOAL_SETTINGS[member.id] || {
    waterTargetMl: 2500,
    stepsTarget: 8000,
    sleepTargetHours: 8.0,
    exerciseTargetMinutes: 45
  };

  const activeProgress = goalProgress[member.id] || {
    waterCurrentMl: 1750,
    stepsCurrent: member.vitals.steps || 7200,
    sleepCurrentHours: member.vitals.sleepHours || 7.2,
    exerciseCurrentMinutes: member.vitals.exerciseMinutes || member.vitals.activeMinutes || 45,
    lastUpdatedTime: "11:30",
    streakDays: 5,
  };

  // Calculations for all 4 Core Metrics
  const waterPct = Math.min(100, Math.round((activeProgress.waterCurrentMl / activeSettings.waterTargetMl) * 100));
  const stepsPct = Math.min(100, Math.round((activeProgress.stepsCurrent / activeSettings.stepsTarget) * 100));
  const sleepPct = Math.min(100, Math.round((activeProgress.sleepCurrentHours / activeSettings.sleepTargetHours) * 100));
  const exercisePct = Math.min(100, Math.round((activeProgress.exerciseCurrentMinutes / (activeSettings.exerciseTargetMinutes || 45)) * 100));

  const goalsCompletedCount = (waterPct >= 100 ? 1 : 0) + (stepsPct >= 100 ? 1 : 0) + (sleepPct >= 100 ? 1 : 0) + (exercisePct >= 100 ? 1 : 0);
  const overallPct = Math.round((waterPct + stepsPct + sleepPct + exercisePct) / 4);

  // Quick Action Handlers
  const handleAddWater = (amountMl: number) => {
    const updatedVal = Math.max(0, activeProgress.waterCurrentMl + amountMl);
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    setGoalProgress(prev => ({
      ...prev,
      [member.id]: {
        ...prev[member.id],
        waterCurrentMl: updatedVal,
        lastUpdatedTime: nowTime,
      }
    }));

    if (updatedVal >= activeSettings.waterTargetMl && activeProgress.waterCurrentMl < activeSettings.waterTargetMl) {
      playCelebrationChime();
      fireBadgeCelebrationConfetti(0.5, 0.6);
      if (onShowToast) {
        onShowToast(`🎉 Target Asupan Air ${member.name} (${activeSettings.waterTargetMl.toLocaleString("id-ID")} ml) telah tercapai 100%!`, "success");
      }
    } else {
      if (onShowToast) {
        onShowToast(`💧 Asupan air ${member.name} dicatat +${amountMl} ml (Total: ${updatedVal.toLocaleString("id-ID")} ml).`, "info");
      }
    }
  };

  const handleAddSteps = (amountSteps: number) => {
    const updatedVal = Math.max(0, activeProgress.stepsCurrent + amountSteps);
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    setGoalProgress(prev => ({
      ...prev,
      [member.id]: {
        ...prev[member.id],
        stepsCurrent: updatedVal,
        lastUpdatedTime: nowTime,
      }
    }));

    if (updatedVal >= activeSettings.stepsTarget && activeProgress.stepsCurrent < activeSettings.stepsTarget) {
      playCelebrationChime();
      fireBadgeCelebrationConfetti(0.5, 0.6);
      if (onShowToast) {
        onShowToast(`🏆 Target Langkah Kaki ${member.name} (${activeSettings.stepsTarget.toLocaleString("id-ID")} langkah) telah tercapai!`, "success");
      }
    } else {
      if (onShowToast) {
        onShowToast(`👟 Langkah kaki ${member.name} ditambah +${amountSteps.toLocaleString("id-ID")} langkah.`, "info");
      }
    }
  };

  const handleAddSleep = (hoursToAdd: number) => {
    const updatedVal = Number((Math.max(0, activeProgress.sleepCurrentHours + hoursToAdd)).toFixed(1));
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    setGoalProgress(prev => ({
      ...prev,
      [member.id]: {
        ...prev[member.id],
        sleepCurrentHours: updatedVal,
        lastUpdatedTime: nowTime,
      }
    }));

    if (updatedVal >= activeSettings.sleepTargetHours && activeProgress.sleepCurrentHours < activeSettings.sleepTargetHours) {
      playCelebrationChime();
      fireBadgeCelebrationConfetti(0.5, 0.6);
      if (onShowToast) {
        onShowToast(`🌙 Target Tidur Restoratif ${member.name} (${activeSettings.sleepTargetHours} jam) tercapai 100%!`, "success");
      }
    } else {
      if (onShowToast) {
        onShowToast(`🛏️ Catatan tidur ${member.name} diperbarui: ${updatedVal} jam (Qailulah/tidur tambahan).`, "info");
      }
    }
  };

  const handleAddExercise = (amountMinutes: number) => {
    const updatedVal = Math.max(0, activeProgress.exerciseCurrentMinutes + amountMinutes);
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const targetExercise = activeSettings.exerciseTargetMinutes || 45;

    setGoalProgress(prev => ({
      ...prev,
      [member.id]: {
        ...prev[member.id],
        exerciseCurrentMinutes: updatedVal,
        lastUpdatedTime: nowTime,
      }
    }));

    if (updatedVal >= targetExercise && activeProgress.exerciseCurrentMinutes < targetExercise) {
      playCelebrationChime();
      fireBadgeCelebrationConfetti(0.5, 0.6);
      if (onShowToast) {
        onShowToast(`🔥 Target Durasi Olahraga ${member.name} (${targetExercise} menit) tercapai 100%!`, "success");
      }
      if (waterPct >= 100 && stepsPct >= 100 && sleepPct >= 100) {
        setTimeout(() => fireGrandCelebration(), 400);
      }
    } else {
      if (onShowToast) {
        onShowToast(`💪 Catatan olahraga ${member.name} ditambah +${amountMinutes} menit (Total: ${updatedVal} menit).`, "info");
      }
    }
  };

  // Open settings modal for member
  const openSettings = (targetMemberId: string) => {
    const st = goalSettings[targetMemberId] || DEFAULT_GOAL_SETTINGS[targetMemberId] || {
      waterTargetMl: 2500,
      stepsTarget: 8000,
      sleepTargetHours: 7.5,
      exerciseTargetMinutes: 45
    };
    setEditingMemberId(targetMemberId);
    setTempWaterTarget(st.waterTargetMl);
    setTempStepsTarget(st.stepsTarget);
    setTempSleepTarget(st.sleepTargetHours);
    setTempExerciseTarget(st.exerciseTargetMinutes || 45);
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = () => {
    setGoalSettings(prev => ({
      ...prev,
      [editingMemberId]: {
        waterTargetMl: tempWaterTarget,
        stepsTarget: tempStepsTarget,
        sleepTargetHours: tempSleepTarget,
        exerciseTargetMinutes: tempExerciseTarget,
      }
    }));
    setIsSettingsModalOpen(false);
    if (onShowToast) {
      const mName = allMembers.find(m => m.id === editingMemberId)?.name || "Anggota";
      onShowToast(`Target kesehatan harian (termasuk durasi olahraga ${tempExerciseTarget} mnt) untuk ${mName} berhasil disesuaikan!`, "success");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* Decorative ambient light */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & MEMBER SWITCHER */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-600/20 shrink-0">
            <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Target Harian Keluarga
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Daily Health Goals Tracking
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Health Goals: Air, Langkah & Tidur
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Pantau kepatuhan target hidrasi tubuh, langkah kaki aktif, dan tidur restoratif harian untuk setiap anggota keluarga dengan progres visual real-time.
            </p>
          </div>
        </div>

        {/* View Mode & Settings Toggle */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "focus"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Target Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setViewMode("trends")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "trends"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Tren 7 Hari</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "all"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Semua ({allMembers.length})</span>
            </button>
          </div>

          <button
            id="btn-goals-notification-center"
            type="button"
            onClick={onOpenNotificationCenter}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer relative"
            title="Pusat Pengingat & Notifikasi Jam 10:00 / 20:00"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => openSettings(member.id)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Kustomisasi Target Kesehatan Anggota"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 10 AM & 8 PM Scheduled Notification Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-slate-800 dark:text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Clock className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
                Sistem Push Notification Jam 10:00 & 20:00:
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Aktif (Ambang &lt; 50%)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Otomatis mengingatkan pengguna via push notification browser &amp; banner in-app setiap pukul <strong>10:00 Pagi</strong> &amp; <strong>20:00 Malam</strong> jika capaian target &lt; 50%.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            id="btn-simulate-10am"
            type="button"
            onClick={() => {
              if (onTriggerReminderSimulation) {
                onTriggerReminderSimulation("10:00");
              } else if (onShowToast) {
                onShowToast("Simulasi notifikasi 10:00 Pagi dipicu!", "info");
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-100/60 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Simulasikan notifikasi push pukul 10:00 pagi saat progres < 50%"
          >
            <span>☀️ Uji Jam 10:00</span>
          </button>

          <button
            id="btn-simulate-8pm"
            type="button"
            onClick={() => {
              if (onTriggerReminderSimulation) {
                onTriggerReminderSimulation("20:00");
              } else if (onShowToast) {
                onShowToast("Simulasi notifikasi 20:00 Malam dipicu!", "info");
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-100/60 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Simulasikan notifikasi push pukul 20:00 malam saat progres < 50%"
          >
            <span>🌙 Uji Jam 20:00</span>
          </button>

          {onOpenNotificationCenter && (
            <button
              id="btn-open-notif-settings"
              type="button"
              onClick={onOpenNotificationCenter}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              title="Buka Pusat Pengingat & Pengaturan Notifikasi"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Pusat Notifikasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Member Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
        <span className="text-xs text-slate-400 shrink-0 font-medium mr-1">Pilih Anggota:</span>
        {allMembers.map(m => {
          const isSelected = m.id === member.id;
          const mProgress = goalProgress[m.id];
          const mSettings = goalSettings[m.id] || DEFAULT_GOAL_SETTINGS[m.id] || {
            waterTargetMl: 2500,
            stepsTarget: 8000,
            sleepTargetHours: 8.0,
            exerciseTargetMinutes: 45
          };
          const mWaterPct = mProgress ? Math.min(100, Math.round((mProgress.waterCurrentMl / mSettings.waterTargetMl) * 100)) : 70;
          const mStepsPct = mProgress ? Math.min(100, Math.round((mProgress.stepsCurrent / mSettings.stepsTarget) * 100)) : 80;
          const mSleepPct = mProgress ? Math.min(100, Math.round((mProgress.sleepCurrentHours / mSettings.sleepTargetHours) * 100)) : 85;
          const mExercisePct = mProgress ? Math.min(100, Math.round((mProgress.exerciseCurrentMinutes / (mSettings.exerciseTargetMinutes || 45)) * 100)) : 75;
          const mMetCount = (mWaterPct >= 100 ? 1 : 0) + (mStepsPct >= 100 ? 1 : 0) + (mSleepPct >= 100 ? 1 : 0) + (mExercisePct >= 100 ? 1 : 0);

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMember(m.id)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                isSelected
                  ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-300"
              }`}
            >
              <img src={m.avatarUrl} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="truncate">{m.name.split(" ")[0]}</span>
                  <span className="text-[10px] font-normal opacity-75">({m.role})</span>
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-medium">
                  {mMetCount}/4 Sasaran
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 2. MODE A: FOCUS VIEW FOR CURRENT MEMBER */}
      {/* ========================================================================= */}
      {viewMode === "focus" && (
        <div className="space-y-6">
          
          {/* Overall Completion Ring & Summary Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden shadow-md">
            
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Konsistensi Harian: {activeProgress.streakDays} Hari Beruntun 🔥
                </span>
                <span className="text-xs text-teal-200 font-medium">
                  Status: <strong>{goalsCompletedCount === 4 ? "Paripurna (100% Tercapai!)" : goalsCompletedCount >= 2 ? "Sangat Baik Berprogres" : "Perlu Dorongan"}</strong>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Pencapaian Sasaran {member.name}: {goalsCompletedCount} dari 4 Target ({overallPct}%)
              </h3>

              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {goalsCompletedCount === 4
                  ? "Maa syaa Allah! Seluruh target hidrasi, langkah kaki, tidur, dan durasi olahraga terpenuhi hari ini. Pertahankan kebiasaan thayyib ini!"
                  : `Tersisa ${4 - goalsCompletedCount} sasaran lagi untuk mencapai kesempurnaan 100% target kesehatan harian keluarga.`}
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("trends")}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-teal-300" />
                  <span>Lihat Grafik Tren 7 Hari (Weekly Trends) →</span>
                </button>
              </div>
            </div>

            {/* Circular Progress & Quick Status */}
            <div className="flex items-center gap-4 shrink-0 relative z-10">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {overallPct}%
                </div>
                <div className="text-[11px] text-teal-300 font-medium">Rata-rata 4 Sasaran</div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-amber-400 text-xl shadow-inner">
                {goalsCompletedCount === 4 ? "🏆" : "🎯"}
              </div>
            </div>

          </div>

          {/* THE 4 CORE GOAL PROGRESS CARDS (AIR, LANGKAH, TIDUR, DURASI OLAHRAGA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            
            {/* ------------------------------------------------------------------- */}
            {/* GOAL 1: WATER INTAKE (ASUPAN AIR HARIAN) */}
            {/* ------------------------------------------------------------------- */}
            <div className={`p-5 rounded-3xl border-2 transition-all space-y-4 flex flex-col justify-between ${
              waterPct >= 100
                ? "bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-500 shadow-sm"
                : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-cyan-400"
            }`}>
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                        Asupan Air Harian
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target: {activeSettings.waterTargetMl.toLocaleString("id-ID")} ml
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                    waterPct >= 100
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                  }`}>
                    {waterPct}%
                  </span>
                </div>

                {/* Progress Numbers */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black font-mono text-cyan-700 dark:text-cyan-300">
                      {activeProgress.waterCurrentMl.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / {activeSettings.waterTargetMl.toLocaleString("id-ID")} ml</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {waterPct >= 100 ? "Target Terpenuhi!" : `Kurang ${(activeSettings.waterTargetMl - activeProgress.waterCurrentMl).toLocaleString("id-ID")} ml`}
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
                    <div 
                      style={{ width: `${waterPct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 ml</span>
                    <span>50%</span>
                    <span>{activeSettings.waterTargetMl.toLocaleString("id-ID")} ml</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Menjaga elastisitas endotel pembuluh darah dan mencegah lonjakan viskositas plasma.
                </p>
              </div>

              {/* Quick Log Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Catat Cepat Asupan:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddWater(250)}
                    className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+250 ml</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">1 Gelas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddWater(500)}
                    className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+500 ml</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">1 Botol</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddWater(1000)}
                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center shadow-xs"
                  >
                    <span>+1.000 ml</span>
                    <span className="text-[9px] font-normal text-cyan-100">Tumbler</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------------- */}
            {/* GOAL 2: STEP COUNT (JUMLAH LANGKAH KAKI) */}
            {/* ------------------------------------------------------------------- */}
            <div className={`p-5 rounded-3xl border-2 transition-all space-y-4 flex flex-col justify-between ${
              stepsPct >= 100
                ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 shadow-sm"
                : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
            }`}>
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Footprints className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                        Jumlah Langkah Kaki
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target: {activeSettings.stepsTarget.toLocaleString("id-ID")} langkah
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                    stepsPct >= 100
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    {stepsPct}%
                  </span>
                </div>

                {/* Progress Numbers */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                      {activeProgress.stepsCurrent.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / {activeSettings.stepsTarget.toLocaleString("id-ID")}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {stepsPct >= 100 ? "Target Tercapai!" : `Kurang ${(activeSettings.stepsTarget - activeProgress.stepsCurrent).toLocaleString("id-ID")} langkah`}
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
                    <div 
                      style={{ width: `${stepsPct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-700"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0</span>
                    <span>50%</span>
                    <span>{activeSettings.stepsTarget.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Watch className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sinkron Sensor {member.connectedWearable.deviceName} ({member.vitals.activeCalories} kkal)</span>
                </div>
              </div>

              {/* Quick Log Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Catat Langkah Olahraga:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSteps(500)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+500</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">Jalan Cepat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSteps(1000)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+1.000</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">Masjid/Taman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSteps(2000)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center shadow-xs"
                  >
                    <span>+2.000</span>
                    <span className="text-[9px] font-normal text-emerald-100">Olahraga</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------------- */}
            {/* GOAL 3: SLEEP HOURS (DURASI TIDUR RESTORATIF) */}
            {/* ------------------------------------------------------------------- */}
            <div className={`p-5 rounded-3xl border-2 transition-all space-y-4 flex flex-col justify-between ${
              sleepPct >= 100
                ? "bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-500 shadow-sm"
                : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
            }`}>
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                        Durasi Tidur Restoratif
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target: {activeSettings.sleepTargetHours} jam
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                    sleepPct >= 100
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  }`}>
                    {sleepPct}%
                  </span>
                </div>

                {/* Progress Numbers */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">
                      {activeProgress.sleepCurrentHours}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / {activeSettings.sleepTargetHours} jam</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {sleepPct >= 100 ? "Tidur Optimal!" : `Kurang ${(activeSettings.sleepTargetHours - activeProgress.sleepCurrentHours).toFixed(1)} jam`}
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
                    <div 
                      style={{ width: `${sleepPct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 jam</span>
                    <span>50%</span>
                    <span>{activeSettings.sleepTargetHours} jam</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kualitas Tidur Wearable: <strong>{member.vitals.sleepScore}/100</strong></span>
                </div>
              </div>

              {/* Quick Log Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tambah Tidur / Qailulah:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSleep(0.5)}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+0.5 Jam</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">Qailulah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSleep(1.0)}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+1.0 Jam</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">Rehat Siang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSleep(-0.5)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>-0.5 Jam</span>
                    <span className="text-[9px] font-normal text-slate-500">Koreksi</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------------- */}
            {/* GOAL 4: EXERCISE DURATION (DURASI OLAHRAGA HARIAN DALAM MENIT) */}
            {/* ------------------------------------------------------------------- */}
            <div className={`p-5 rounded-3xl border-2 transition-all space-y-4 flex flex-col justify-between ${
              exercisePct >= 100
                ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 shadow-sm"
                : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400"
            }`}>
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                        Durasi Olahraga
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target: {activeSettings.exerciseTargetMinutes || 45} menit
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                    exercisePct >= 100
                      ? "bg-amber-500 text-slate-950 shadow-xs font-black"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  }`}>
                    {exercisePct}%
                  </span>
                </div>

                {/* Progress Numbers */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
                      {activeProgress.exerciseCurrentMinutes}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / {activeSettings.exerciseTargetMinutes || 45} mnt</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {exercisePct >= 100 
                      ? "Target Terlampaui! 🔥" 
                      : `Kurang ${(activeSettings.exerciseTargetMinutes || 45) - activeProgress.exerciseCurrentMinutes} menit`}
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
                    <div 
                      style={{ width: `${exercisePct}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-700"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 mnt</span>
                    <span>50%</span>
                    <span>{activeSettings.exerciseTargetMinutes || 45} mnt</span>
                  </div>
                </div>

                {/* Wearable Live Telemetry Strip */}
                <div className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Watch className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                        <span>{member.connectedWearable.deviceName}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {member.vitals.activeCalories} kkal • Sinkron: {member.connectedWearable.lastSync}
                      </div>
                    </div>
                  </div>

                  {onSyncWearable && (
                    <button
                      type="button"
                      onClick={onSyncWearable}
                      disabled={isSyncing}
                      className="p-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                      title="Tarik data olahraga terbaru dari sensor wearable"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-600" : ""}`} />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Menstimulasi biogenesis mitokondria, metabolisme lipid, dan meningkatkan kepekaan reseptor insulin.
                </p>
              </div>

              {/* Quick Log Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Catat Cepat Durasi:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddExercise(15)}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+15 mnt</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">Jalan Cepat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddExercise(30)}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center"
                  >
                    <span>+30 mnt</span>
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">Senam/Kardio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddExercise(45)}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all active:scale-95 cursor-pointer flex flex-col items-center shadow-xs"
                  >
                    <span>+45 mnt</span>
                    <span className="text-[9px] font-normal text-amber-950">Latihan Inti</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2B. MODE B: WEEKLY TRENDS VIEW (LINE CHART OVER LAST 7 DAYS FOR WATER, STEPS, SLEEP) */}
      {/* ========================================================================= */}
      {viewMode === "trends" && (
        <WeeklyHealthGoalsTrends
          member={member}
          goalSettings={activeSettings}
          todayProgress={activeProgress}
          allMembers={allMembers}
          onSelectMember={onSelectMember}
          onOpenSettings={() => openSettings(member.id)}
          onSwitchToToday={() => setViewMode("focus")}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. MODE C: ALL MEMBERS COMPARISON GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === "all" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Komparasi Progres Target Seluruh Anggota Keluarga ({allMembers.length} Jiwa):</span>
            </h3>
            <span className="text-xs text-slate-500">
              Klik anggota untuk melihat detail atau menyesuaikan target.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allMembers.map(m => {
              const isSelected = m.id === member.id;
              const mSettings = goalSettings[m.id] || DEFAULT_GOAL_SETTINGS[m.id] || {
                waterTargetMl: 2500,
                stepsTarget: 8000,
                sleepTargetHours: 8.0,
                exerciseTargetMinutes: 45
              };
              const mProgress = goalProgress[m.id] || {
                waterCurrentMl: 1500,
                stepsCurrent: m.vitals.steps,
                sleepCurrentHours: m.vitals.sleepHours,
                exerciseCurrentMinutes: m.vitals.exerciseMinutes || m.vitals.activeMinutes || 45,
                lastUpdatedTime: "12:00",
                streakDays: 4,
              };

              const wPct = Math.min(100, Math.round((mProgress.waterCurrentMl / mSettings.waterTargetMl) * 100));
              const sPct = Math.min(100, Math.round((mProgress.stepsCurrent / mSettings.stepsTarget) * 100));
              const lPct = Math.min(100, Math.round((mProgress.sleepCurrentHours / mSettings.sleepTargetHours) * 100));
              const ePct = Math.min(100, Math.round((mProgress.exerciseCurrentMinutes / (mSettings.exerciseTargetMinutes || 45)) * 100));
              const metCount = (wPct >= 100 ? 1 : 0) + (sPct >= 100 ? 1 : 0) + (lPct >= 100 ? 1 : 0) + (ePct >= 100 ? 1 : 0);

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-3xl border-2 transition-all space-y-3 relative ${
                    isSelected
                      ? "bg-teal-50/60 dark:bg-teal-950/30 border-teal-500 shadow-sm"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  {/* Member info */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectMember(m.id)}
                      className="flex items-center gap-2.5 text-left cursor-pointer"
                    >
                      <img src={m.avatarUrl} alt={m.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.role} • {m.age} thn</div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        metCount === 4 ? "bg-amber-400 text-slate-950 font-black" : "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                      }`}>
                        {metCount}/4 Gol
                      </span>
                      <button
                        type="button"
                        onClick={() => openSettings(m.id)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Progress Bars */}
                  <div className="space-y-2.5 pt-1 text-xs">
                    {/* Water */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Droplet className="w-3 h-3 text-cyan-600" />
                          <span>Air</span>
                        </span>
                        <span className="font-mono font-bold text-cyan-600">
                          {mProgress.waterCurrentMl} / {mSettings.waterTargetMl} ml ({wPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div style={{ width: `${wPct}%` }} className="h-full rounded-full bg-cyan-500 transition-all duration-500" />
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Footprints className="w-3 h-3 text-emerald-600" />
                          <span>Langkah</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-600">
                          {mProgress.stepsCurrent.toLocaleString("id-ID")} / {mSettings.stepsTarget.toLocaleString("id-ID")} ({sPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div style={{ width: `${sPct}%` }} className="h-full rounded-full bg-emerald-500 transition-all duration-500" />
                      </div>
                    </div>

                    {/* Sleep */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Moon className="w-3 h-3 text-indigo-600" />
                          <span>Tidur</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-600">
                          {mProgress.sleepCurrentHours} / {mSettings.sleepTargetHours} jam ({lPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div style={{ width: `${lPct}%` }} className="h-full rounded-full bg-indigo-500 transition-all duration-500" />
                      </div>
                    </div>

                    {/* Exercise Duration */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Dumbbell className="w-3 h-3 text-amber-600" />
                          <span>Olahraga</span>
                        </span>
                        <span className="font-mono font-bold text-amber-600">
                          {mProgress.exerciseCurrentMinutes || 0} / {mSettings.exerciseTargetMinutes || 45} mnt ({ePct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div style={{ width: `${ePct}%` }} className="h-full rounded-full bg-amber-500 transition-all duration-500" />
                      </div>
                    </div>
                  </div>

                  {/* Select button */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMember(m.id);
                      setViewMode("focus");
                    }}
                    className="w-full py-1.5 rounded-xl text-center text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50/50 hover:bg-teal-100 dark:bg-teal-950/40 transition-colors cursor-pointer block"
                  >
                    Fokuskan & Tambah Progres →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SETTINGS MODAL: CUSTOMIZE TARGETS PER MEMBER */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Sesuaikan Target Sasaran Harian
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Anggota: <strong>{allMembers.find(m => m.id === editingMemberId)?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Air */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Target Asupan Air Harian (ml):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    max="5000"
                    value={tempWaterTarget}
                    onChange={(e) => setTempWaterTarget(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                  />
                  <span className="text-slate-500 font-medium">ml</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[2000, 2200, 2500, 2800].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTempWaterTarget(val)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 text-[10px] font-medium"
                    >
                      {val} ml
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Langkah */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target Langkah Kaki Harian:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="500"
                    min="2000"
                    max="25000"
                    value={tempStepsTarget}
                    onChange={(e) => setTempStepsTarget(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                  />
                  <span className="text-slate-500 font-medium">langkah</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[5000, 7500, 8000, 10000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTempStepsTarget(val)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-[10px] font-medium"
                    >
                      {val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Tidur */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Target Durasi Tidur (Jam):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="12"
                    value={tempSleepTarget}
                    onChange={(e) => setTempSleepTarget(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                  />
                  <span className="text-slate-500 font-medium">jam</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[7.0, 7.5, 8.0, 8.5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTempSleepTarget(val)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-[10px] font-medium"
                    >
                      {val} jam
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Durasi Olahraga */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-amber-600" />
                  <span>Target Durasi Olahraga Harian (Menit):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="10"
                    max="180"
                    value={tempExerciseTarget}
                    onChange={(e) => setTempExerciseTarget(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                  />
                  <span className="text-slate-500 font-medium">menit</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[20, 30, 45, 60].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTempExerciseTarget(val)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-[10px] font-medium"
                    >
                      {val} mnt
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Simpan Target
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
