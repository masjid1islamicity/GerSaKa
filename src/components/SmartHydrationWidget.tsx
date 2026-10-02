import React, { useState, useEffect, useMemo } from "react";
import { FamilyMember, HydrationAiAlert, HydrationLogEntry, SmartHydrationState } from "../types";
import { 
  calculateDynamicHydrationTarget, 
  DEFAULT_BASE_TARGETS, 
  fetchSmartHydrationAiAlert, 
  HYDRATION_STORAGE_KEY, 
  INITIAL_HYDRATION_DATA, 
  playHydrationSoundChime 
} from "../utils/smartHydration";
import { 
  Droplet, 
  Sparkles, 
  Watch, 
  Activity, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  ShieldCheck, 
  Heart, 
  Zap, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Info,
  Check,
  RefreshCw,
  Sliders
} from "lucide-react";

interface SmartHydrationWidgetProps {
  member: FamilyMember;
  allMembers?: FamilyMember[];
  onSelectMember?: (id: string) => void;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const SmartHydrationWidget: React.FC<SmartHydrationWidgetProps> = ({
  member,
  allMembers = [],
  onSelectMember,
  onSyncWearable,
  isSyncing = false,
  onShowToast,
}) => {
  // Store all members' hydration states
  const [hydrationMap, setHydrationMap] = useState<Record<string, SmartHydrationState>>(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(HYDRATION_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load hydration data from storage", e);
      }
    }
    return INITIAL_HYDRATION_DATA;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [customMlInput, setCustomMlInput] = useState<string>("250");
  const [selectedDrinkType, setSelectedDrinkType] = useState<HydrationLogEntry["drinkType"]>("air_mineral");
  const [isLogExpanded, setIsLogExpanded] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Calculate dynamic target from wearable sensors for current member
  const dynamicCalculations = useMemo(() => {
    return calculateDynamicHydrationTarget(member);
  }, [member]);

  // Current active member hydration state
  const currentHydration: SmartHydrationState = useMemo(() => {
    const existing = hydrationMap[member.id];
    if (existing) {
      return {
        ...existing,
        baseTargetMl: dynamicCalculations.baseTargetMl,
        sweatLossAdjustmentMl: dynamicCalculations.sweatLossAdjustmentMl,
        dynamicTargetMl: dynamicCalculations.totalDynamicTargetMl,
      };
    }
    return {
      memberId: member.id,
      baseTargetMl: dynamicCalculations.baseTargetMl,
      sweatLossAdjustmentMl: dynamicCalculations.sweatLossAdjustmentMl,
      dynamicTargetMl: dynamicCalculations.totalDynamicTargetMl,
      consumedMl: 1250,
      lastIntakeTime: "11:00",
      logs: [],
    };
  }, [hydrationMap, member.id, dynamicCalculations]);

  // Persist hydrationMap changes
  useEffect(() => {
    try {
      localStorage.setItem(HYDRATION_STORAGE_KEY, JSON.stringify(hydrationMap));
    } catch (e) {
      // Storage might be full or restricted
    }
  }, [hydrationMap]);

  // Percentage & status calculations
  const consumed = currentHydration.consumedMl;
  const target = currentHydration.dynamicTargetMl || 2500;
  const percentage = Math.min(100, Math.round((consumed / target) * 100));
  const remainingMl = Math.max(0, target - consumed);
  const glassesRemaining = Math.ceil(remainingMl / 250);

  // Status badge config
  const statusInfo = useMemo(() => {
    if (percentage >= 100) {
      return {
        label: "Target Tercapai!",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
        icon: CheckCircle2,
      };
    } else if (percentage >= 70) {
      return {
        label: "Optimal & Terjaga",
        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800",
        icon: Droplet,
      };
    } else if (percentage >= 40) {
      return {
        label: "Perlu Rehidrasi Siang",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800",
        icon: AlertTriangle,
      };
    } else {
      return {
        label: "Peringatan Defisit",
        color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-800 animate-pulse",
        icon: AlertTriangle,
      };
    }
  }, [percentage]);

  // Handle logging intake
  const handleAddIntake = (amount: number, type: HydrationLogEntry["drinkType"] = "air_mineral", note?: string) => {
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const newEntry: HydrationLogEntry = {
      id: "log-" + Date.now().toString(36),
      timestamp,
      amountMl: amount,
      drinkType: type,
      note: note || (type === "air_mineral" ? "Air mineral higienis" : type === "air_hangat_thayyib" ? "Air hangat sunnah" : type),
    };

    setHydrationMap((prev) => {
      const cur = prev[member.id] || currentHydration;
      const nextConsumed = cur.consumedMl + amount;
      return {
        ...prev,
        [member.id]: {
          ...cur,
          consumedMl: nextConsumed,
          lastIntakeTime: timestamp,
          logs: [newEntry, ...(cur.logs || [])],
        },
      };
    });

    if (soundEnabled) {
      playHydrationSoundChime("optimal");
    }

    if (onShowToast) {
      onShowToast(
        `+${amount} ml dicatat untuk ${member.name}! Total: ${(consumed + amount).toLocaleString()} / ${target.toLocaleString()} ml (${Math.min(100, Math.round(((consumed + amount) / target) * 100))}%).`,
        "success"
      );
    }
  };

  // Run AI smart hydration evaluation
  const handleRunAiEvaluation = async () => {
    setIsAiLoading(true);
    try {
      const alert = await fetchSmartHydrationAiAlert(
        member,
        consumed,
        target,
        new Date().getHours(),
        75
      );

      setHydrationMap((prev) => {
        const cur = prev[member.id] || currentHydration;
        return {
          ...prev,
          [member.id]: {
            ...cur,
            aiAlert: alert,
          },
        };
      });

      if (soundEnabled && alert.soundAlertNeeded) {
        playHydrationSoundChime(alert.urgency);
      }

      if (onShowToast) {
        onShowToast(
          alert.urgency === "peringatan_defisit"
            ? `Peringatan Defisit Hidrasi: ${alert.headline}`
            : `Evaluasi AI Hidrasi: ${alert.headline}`,
          alert.urgency === "peringatan_defisit" ? "warning" : "info"
        );
      }
    } catch (err) {
      console.warn("AI evaluation error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Reset today's intake
  const handleResetToday = () => {
    if (window.confirm(`Atur ulang catatan asupan air ${member.name} hari ini menjadi 0 ml?`)) {
      setHydrationMap((prev) => {
        const cur = prev[member.id] || currentHydration;
        return {
          ...prev,
          [member.id]: {
            ...cur,
            consumedMl: 0,
            logs: [],
            aiAlert: undefined,
          },
        };
      });
      if (onShowToast) {
        onShowToast("Catatan hidrasi hari ini berhasil diatur ulang.", "info");
      }
    }
  };

  // Remove single log entry
  const handleDeleteLogEntry = (logId: string) => {
    setHydrationMap((prev) => {
      const cur = prev[member.id] || currentHydration;
      const targetLog = cur.logs?.find((l) => l.id === logId);
      const deduct = targetLog ? targetLog.amountMl : 0;
      return {
        ...prev,
        [member.id]: {
          ...cur,
          consumedMl: Math.max(0, cur.consumedMl - deduct),
          logs: (cur.logs || []).filter((l) => l.id !== logId),
        },
      };
    });
  };

  // Circadian timeline phases
  const circadianPhases = [
    {
      id: "fajar",
      title: "Fajar & Pagi (06:00 - 08:30)",
      targetMl: 600,
      icon: Sunrise,
      description: "Rehidrasi bangun tidur & aktivasi peristaltik usus",
      isPassed: true,
    },
    {
      id: "siang",
      title: "Metabolik Siang (09:00 - 12:30)",
      targetMl: 800,
      icon: Sun,
      description: "Kompensasi aktivitas kerja & daya tahan vaskular",
      isPassed: true,
    },
    {
      id: "sore",
      title: "Pemulihan Ashar (13:00 - 17:30)",
      targetMl: 1000,
      icon: Sunset,
      description: "Penggantian elektrolit & filtrasi ginjal optimal",
      isCurrent: true,
    },
    {
      id: "malam",
      title: "Malam Santai (18:30 - 21:00)",
      targetMl: 450,
      icon: Moon,
      description: "Minum teratur suam kuku, cegah sering terbangun",
      isPassed: false,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
      {/* Decorative ambient water glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative z-10 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-600/20 shrink-0 relative">
              <Droplet className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white/20 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-black text-slate-900">
                AI
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                  Smart Hydration • Sensor Wearable Terintegrasi
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Watch className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {member.connectedWearable.deviceName}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Pelacak Asupan Hidrasi Cerdas</span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  — {member.name} ({member.role})
                </span>
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Menghitung target hidrasi presisi berdasarkan pembakaran kalori aktif, langkah fisik, dan riwayat kesehatan. Memberikan notifikasi cerdas jika cairan tubuh defisit.
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            
            {/* Run AI Hydration Check Button */}
            <button
              type="button"
              onClick={handleRunAiEvaluation}
              disabled={isAiLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-cyan-600/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-yellow-300 ${isAiLoading ? "animate-spin" : ""}`} />
              <span>{isAiLoading ? "Menganalisis..." : "Evaluasi AI Hidrasi"}</span>
            </button>

            {/* Sound Chime Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              title={soundEnabled ? "Suara notifikasi hidrasi aktif" : "Suara notifikasi dibisukan"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Today's Log */}
            <button
              type="button"
              onClick={handleResetToday}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Atur ulang catatan hari ini"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* FAMILY MEMBER QUICK CHIPS (Optional quick selector) */}
        {allMembers && allMembers.length > 1 && onSelectMember && (
          <div className="pt-1 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Pilih Anggota:</span>
            </span>
            {allMembers.map((m) => {
              const isSelected = m.id === member.id;
              const memData = hydrationMap[m.id];
              const memConsumed = memData ? memData.consumedMl : 1200;
              const memTarget = memData ? memData.dynamicTargetMl : DEFAULT_BASE_TARGETS[m.id] || 2500;
              const memPct = Math.min(100, Math.round((memConsumed / memTarget) * 100));

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMember(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-4 h-4 rounded-full object-cover border border-white/50"
                  />
                  <span>{m.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                  }`}>
                    {memPct}%
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* AI NOTIFICATION & PROACTIVE REMINDER BANNER */}
        {currentHydration.aiAlert && (
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden shadow-sm ${
            currentHydration.aiAlert.urgency === "peringatan_defisit"
              ? "bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-rose-500/50 text-white"
              : currentHydration.aiAlert.urgency === "perlu_perhatian"
              ? "bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border-cyan-500/50 text-white"
              : "bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-emerald-500/50 text-white"
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentHydration.aiAlert.urgency === "peringatan_defisit"
                    ? "bg-rose-500 text-white animate-bounce"
                    : currentHydration.aiAlert.urgency === "perlu_perhatian"
                    ? "bg-cyan-500 text-white"
                    : "bg-emerald-500 text-white"
                }`}>
                  <Droplet className="w-4 h-4" />
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {currentHydration.aiAlert.urgency === "peringatan_defisit"
                        ? "Peringatan Defisit AI"
                        : currentHydration.aiAlert.urgency === "perlu_perhatian"
                        ? "Pengingat Hidrasi AI"
                        : "Status AI Optimal"}
                    </span>
                    <span className="text-xs text-slate-300">
                      Evaluasi Pukul {currentHydration.aiAlert.timestamp}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white mt-0.5">
                    {currentHydration.aiAlert.headline}
                  </h4>
                </div>
              </div>

              {/* Action Button: Drink Now */}
              <button
                type="button"
                onClick={() => handleAddIntake(currentHydration.aiAlert?.suggestedIntakeNowMl || 250, "air_mineral", "Tindak lanjut pengingat AI")}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Minum Sekarang (+{currentHydration.aiAlert.suggestedIntakeNowMl} ml)</span>
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
              {currentHydration.aiAlert.clinicalReason}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
              <div className="flex items-start gap-2 text-cyan-200 bg-white/5 p-2 rounded-xl border border-white/10">
                <Watch className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                <span><strong>Sensor Smartwatch:</strong> {currentHydration.aiAlert.wearableContextSummary}</span>
              </div>

              <div className="flex items-start gap-2 text-emerald-200 bg-white/5 p-2 rounded-xl border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                <span><strong>Adab Thayyib:</strong> {currentHydration.aiAlert.thayyibEtiquetteTip}</span>
              </div>
            </div>

          </div>
        )}

        {/* MAIN HYDRATION MONITOR CARD & STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          
          {/* LEFT: VISUAL PROGRESS WAVE & TARGET (5 COLS) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-cyan-50/60 to-blue-50/60 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-3xl p-5 border border-cyan-200/80 dark:border-cyan-800/60 flex flex-col justify-between space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider block">
                  Progres Hidrasi Hari Ini
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Terakhir minum: {currentHydration.lastIntakeTime}
                </span>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${statusInfo.color}`}>
                <statusInfo.icon className="w-3.5 h-3.5" />
                <span>{statusInfo.label}</span>
              </span>
            </div>

            {/* Circular / Volume Indicator */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-8 border-cyan-100 dark:border-cyan-950 flex flex-col items-center justify-center shadow-inner overflow-hidden bg-white dark:bg-slate-900">
                
                {/* Liquid Level Background */}
                <div 
                  style={{ height: `${percentage}%` }}
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-cyan-600 via-cyan-500 to-blue-400 dark:from-cyan-700 dark:via-cyan-600 dark:to-blue-500 opacity-25 transition-all duration-700 ease-out pointer-events-none"
                />

                <Droplet className="w-6 h-6 text-cyan-500 mb-1" />
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {consumed.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  / {target.toLocaleString()} ml
                </span>
                <span className="text-sm font-black text-cyan-600 dark:text-cyan-400 mt-1">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Breakdown of Wearable Dynamic Target */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-cyan-200/60 dark:border-cyan-800/60 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Kebutuhan Fisiologis Dasar:</span>
                </span>
                <span className="font-black">{dynamicCalculations.baseTargetMl.toLocaleString()} ml</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Kompensasi Keringat Smartwatch:</span>
                </span>
                <span className="font-black">+{dynamicCalculations.sweatLossAdjustmentMl} ml</span>
              </div>

              {dynamicCalculations.breakdownReasons.length > 0 && (
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  {dynamicCalculations.breakdownReasons.map((r, i) => (
                    <p key={i}>• {r}</p>
                  ))}
                </div>
              )}

              <div className="pt-1 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-cyan-900 dark:text-cyan-200">
                <span>Target Dinamis Terkini:</span>
                <span className="font-mono text-sm">{target.toLocaleString()} ml</span>
              </div>
            </div>

          </div>

          {/* RIGHT: QUICK-ADD BUTTONS & DRINK SELECTOR (7 COLS) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            
            {/* Quick Add Presets Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cyan-600" />
                  <span>Catat Cepat Asupan Air Sekali Klik</span>
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tersisa: <strong>{remainingMl.toLocaleString()} ml</strong> ({glassesRemaining} gelas)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* 150ml */}
                <button
                  type="button"
                  onClick={() => handleAddIntake(150, selectedDrinkType)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800 dark:hover:bg-cyan-950/60 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 text-left transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-black mb-2 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    150
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">+150 ml</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Cangkir Kecil</span>
                </button>

                {/* 250ml */}
                <button
                  type="button"
                  onClick={() => handleAddIntake(250, selectedDrinkType)}
                  className="p-3.5 rounded-2xl bg-cyan-50/80 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 text-left transition-all active:scale-95 cursor-pointer group shadow-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black mb-2">
                    250
                  </div>
                  <span className="text-xs font-black text-cyan-950 dark:text-cyan-100 block">+250 ml</span>
                  <span className="text-[10px] text-cyan-700 dark:text-cyan-300 block">Gelas Standar</span>
                </button>

                {/* 350ml */}
                <button
                  type="button"
                  onClick={() => handleAddIntake(350, selectedDrinkType)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800 dark:hover:bg-cyan-950/60 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 text-left transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-black mb-2 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    350
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">+350 ml</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Mug / Gelas Besar</span>
                </button>

                {/* 500ml */}
                <button
                  type="button"
                  onClick={() => handleAddIntake(500, selectedDrinkType)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800 dark:hover:bg-cyan-950/60 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 text-left transition-all active:scale-95 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-black mb-2 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    500
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">+500 ml</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Botol Olahraga</span>
                </button>

              </div>
            </div>

            {/* Drink Type Selector & Custom Amount */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Jenis Minuman Thayyib:
                </span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                  Bebas Pemanis Buatan
                </span>
              </div>

              {/* Drink chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "air_mineral", label: "💧 Air Mineral", desc: "Higienis pH 7+" },
                  { id: "air_hangat_thayyib", label: "🍵 Air Hangat Sunnah", desc: "Suam kuku" },
                  { id: "infused_water", label: "🍋 Infused Water", desc: "Lemon & mint" },
                  { id: "air_kelapa_elektrolit", label: "🥥 Kelapa Elektrolit", desc: "Isotonik alami" },
                  { id: "teh_herbal", label: "🌿 Teh Herbal Jahe", desc: "Antioksidan" },
                ].map((dt) => (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setSelectedDrinkType(dt.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDrinkType === dt.id
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {dt.label}
                  </button>
                ))}
              </div>

              {/* Custom ml input */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 shrink-0 font-medium">Atau masukkan jumlah kustom:</span>
                <input
                  type="number"
                  step={50}
                  min={50}
                  max={2000}
                  value={customMlInput}
                  onChange={(e) => setCustomMlInput(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  placeholder="250"
                />
                <span className="text-xs text-slate-500">ml</span>
                <button
                  type="button"
                  onClick={() => {
                    const val = Number(customMlInput);
                    if (val > 0) handleAddIntake(val, selectedDrinkType);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-black transition-all cursor-pointer ml-auto"
                >
                  + Tambahkan
                </button>
              </div>
            </div>

            {/* CIRCADIAN TIMELINE PROGRESS STRIP */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Fase Sirkadian Hari Ini:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {circadianPhases.map((phase) => (
                  <div
                    key={phase.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      phase.isCurrent
                        ? "bg-cyan-50 dark:bg-cyan-950/50 border-cyan-400 text-cyan-950 dark:text-cyan-200 font-bold"
                        : phase.isPassed
                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-90"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <phase.icon className={`w-3.5 h-3.5 ${phase.isCurrent ? "text-cyan-600" : "text-slate-400"}`} />
                      {phase.isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-600 text-white font-bold uppercase">
                          Sekarang
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] block font-bold truncate">{phase.title}</span>
                    <span className="text-[10px] text-slate-400 block">{phase.targetMl} ml</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* LOG HISTORY ACCORDION */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsLogExpanded(!isLogExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>Riwayat Asupan Air {member.name} Hari Ini ({currentHydration.logs?.length || 0} entri)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span>{isLogExpanded ? "Sembunyikan" : "Tampilkan Catatan"}</span>
              {isLogExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isLogExpanded && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
              {currentHydration.logs && currentHydration.logs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {currentHydration.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-black shrink-0">
                          {log.amountMl}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            +{log.amountMl} ml • {log.drinkType.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Pukul {log.timestamp} • {log.note}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLogEntry(log.id)}
                        className="text-slate-400 hover:text-rose-500 text-xs p-1"
                        title="Hapus entri ini"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  Belum ada catatan asupan air hari ini. Klik tombol di atas untuk mencatat.
                </p>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
