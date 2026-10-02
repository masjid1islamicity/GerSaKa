import React, { useState, useEffect } from "react";
import { FamilyMember, SmartGoalReminder } from "../types";
import { 
  Target, 
  Flame, 
  Activity, 
  Droplet, 
  Moon, 
  Watch, 
  Battery, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronRight, 
  Plus, 
  Info,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sliders,
  Check
} from "lucide-react";
import { playCelebrationChime } from "./HealthGoalsNotificationSystem";

interface SmartHealthGoalsWidgetProps {
  patient: FamilyMember;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

interface GoalItem {
  id: string;
  category: "steps" | "calories" | "exercise" | "hydration";
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: React.ReactNode;
}

export const SmartHealthGoalsWidget: React.FC<SmartHealthGoalsWidgetProps> = ({
  patient,
  onSyncWearable,
  isSyncing = false,
  onShowToast,
}) => {
  // Manual interactive offset state (for quick-add buttons: +500 steps, +250ml water, etc.)
  const [manualOffsets, setManualOffsets] = useState<Record<string, number>>({});

  // Simulation state to test the "< 50% near end of day" requirement
  const [isSimulatingLateDayDeficit, setIsSimulatingLateDayDeficit] = useState<boolean>(false);

  // AI Reminder Notification state
  const [reminder, setReminder] = useState<SmartGoalReminder | null>(null);
  const [isLoadingAiReminder, setIsLoadingAiReminder] = useState<boolean>(false);
  const [isReminderDismissed, setIsReminderDismissed] = useState<boolean>(false);
  const [checkedRoutines, setCheckedRoutines] = useState<Record<number, boolean>>({});

  // Active selected goal for deep view
  const [selectedGoalId, setSelectedGoalId] = useState<string>("steps");

  // Targets per patient role
  const targetSteps = patient.role === "Kakek" ? 4500 : patient.role === "Anak Sulung" ? 12000 : 8000;
  const targetCalories = patient.role === "Kakek" ? 300 : patient.role === "Anak Sulung" ? 750 : 500;
  const targetActiveMin = patient.role === "Kakek" ? 25 : patient.role === "Anak Sulung" ? 60 : 40;
  const targetHydration = 2000; // ml

  // Live values from wearable vitals + manual offsets
  const baseSteps = isSimulatingLateDayDeficit 
    ? Math.round(targetSteps * 0.35) 
    : patient.vitals.steps || 6400;

  const baseCalories = isSimulatingLateDayDeficit 
    ? Math.round(targetCalories * 0.32) 
    : patient.vitals.activeCalories || 380;

  const baseActiveMin = isSimulatingLateDayDeficit 
    ? Math.round(targetActiveMin * 0.3) 
    : patient.vitals.activeMinutes || 30;

  const baseHydration = isSimulatingLateDayDeficit 
    ? 750 
    : 1400;

  const currentSteps = baseSteps + (manualOffsets["steps"] || 0);
  const currentCalories = baseCalories + (manualOffsets["calories"] || 0);
  const currentActiveMin = baseActiveMin + (manualOffsets["exercise"] || 0);
  const currentHydration = baseHydration + (manualOffsets["hydration"] || 0);

  // Array of 4 interactive daily goals
  const goals: GoalItem[] = [
    {
      id: "steps",
      category: "steps",
      title: "Langkah Kaki",
      currentValue: currentSteps,
      targetValue: targetSteps,
      unit: "langkah",
      colorClass: "text-amber-500",
      bgClass: "bg-amber-50 dark:bg-amber-950/40",
      borderClass: "border-amber-300 dark:border-amber-800",
      icon: <Flame className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "calories",
      category: "calories",
      title: "Kalori Aktif",
      currentValue: currentCalories,
      targetValue: targetCalories,
      unit: "kkal",
      colorClass: "text-orange-500",
      bgClass: "bg-orange-50 dark:bg-orange-950/40",
      borderClass: "border-orange-300 dark:border-orange-800",
      icon: <Zap className="w-4 h-4 text-orange-500" />,
    },
    {
      id: "exercise",
      category: "exercise",
      title: "Menit Olahraga",
      currentValue: currentActiveMin,
      targetValue: targetActiveMin,
      unit: "menit",
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
      borderClass: "border-emerald-300 dark:border-emerald-800",
      icon: <Activity className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: "hydration",
      category: "hydration",
      title: "Asupan Hidrasi",
      currentValue: currentHydration,
      targetValue: targetHydration,
      unit: "ml",
      colorClass: "text-cyan-500",
      bgClass: "bg-cyan-50 dark:bg-cyan-950/40",
      borderClass: "border-cyan-300 dark:border-cyan-800",
      icon: <Droplet className="w-4 h-4 text-cyan-500" />,
    },
  ];

  // Calculate overall day progress %
  const overallProgressPct = Math.round(
    goals.reduce((acc, g) => acc + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) / goals.length
  );

  // Check if current condition warrants AI End-of-Day rescue reminder (< 50% progress)
  const isUnderFiftyPercent = overallProgressPct < 50;

  // Trigger AI Reminder Notification from backend
  const fetchAiGoalsReminder = async (forcedPct?: number) => {
    setIsLoadingAiReminder(true);
    setIsReminderDismissed(false);
    setCheckedRoutines({});

    const pctToSend = forcedPct ?? overallProgressPct;
    const lagging = goals.filter(g => (g.currentValue / g.targetValue) < 0.5);

    try {
      const response = await fetch("/api/ai/goals-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          overallProgressPct: pctToSend,
          currentHour: 17, // Menjelang sore/akhir hari
          laggingGoals: lagging.map(l => ({
            title: l.title,
            currentValue: l.currentValue,
            targetValue: l.targetValue,
            unit: l.unit,
            pct: Math.round((l.currentValue / l.targetValue) * 100)
          })),
        }),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.reminder) {
        setReminder(resJson.reminder);
        if (onShowToast) {
          onShowToast(`⏰ Pengingat AI Sore: Target harian baru ${pctToSend}% (< 50%). Ada panduan cepat!`, "warning");
        }
      }
    } catch (err) {
      console.error("Gagal mengambil pengingat target AI:", err);
    } finally {
      setIsLoadingAiReminder(false);
    }
  };

  // Auto-trigger reminder when user activates simulation or when naturally under 50%
  useEffect(() => {
    if (isSimulatingLateDayDeficit && !reminder) {
      fetchAiGoalsReminder(35);
    }
  }, [isSimulatingLateDayDeficit]);

  // Quick incremental loggers
  const handleQuickAdd = (goalCategory: string, amount: number) => {
    setManualOffsets(prev => ({
      ...prev,
      [goalCategory]: (prev[goalCategory] || 0) + amount,
    }));
    if (onShowToast) {
      onShowToast(`Berhasil menambah +${amount} pada target harian ${goalCategory}!`, "success");
    }
    playCelebrationChime();
  };

  // Toggle routine checkbox
  const handleToggleRoutine = (index: number) => {
    setCheckedRoutines(prev => {
      const next = { ...prev, [index]: !prev[index] };
      // If checked, give a small bonus to goals
      if (next[index]) {
        if (index === 0) handleQuickAdd("hydration", 250);
        if (index === 1) handleQuickAdd("steps", 500);
        if (index === 2) handleQuickAdd("exercise", 10);
      }
      return next;
    });
  };

  // Active inspected goal
  const activeGoal = goals.find(g => g.id === selectedGoalId) || goals[0];
  const activeGoalPct = Math.round((activeGoal.currentValue / activeGoal.targetValue) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 relative overflow-hidden">
      
      {/* HEADER WITH WEARABLE TELEMETRY STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Smart Health Goals Widget
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Pengingat AI Aktif</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target kebugaran harian <strong className="text-slate-800 dark:text-slate-200">{patient.name}</strong> tersinkronisasi otomatis dengan sensor wearable.
            </p>
          </div>
        </div>

        {/* Wearable Device Live Status & Sync Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Watch className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">{patient.connectedWearable.deviceName}</span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <button
            onClick={onSyncWearable}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Tarik pembaruan data sensor wearable"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Sinkronisasi..." : "Sinkron Sensor"}</span>
          </button>
        </div>
      </div>

      {/* OVERALL DAILY PROGRESS SUMMARY & TEST SIMULATION BAR */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Ring & Completion text */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  overallProgressPct >= 100 
                    ? "text-emerald-500" 
                    : overallProgressPct >= 50 
                    ? "text-teal-500" 
                    : "text-amber-500"
                }`}
                strokeDasharray={`${Math.min(100, overallProgressPct)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-900 dark:text-white">
              {overallProgressPct}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Rata-Rata Capaian Hari Ini
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                overallProgressPct >= 100
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : overallProgressPct >= 50
                  ? "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300/50"
              }`}>
                {overallProgressPct >= 100 
                  ? "Target Tuntas! 🏆" 
                  : overallProgressPct >= 50 
                  ? "On-Track (> 50%) ⚡" 
                  : "Perlu Pengejaran (< 50%) ⚠️"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {overallProgressPct < 50 
                ? "Waktu menjelang sore/malam: Target belum mencapai separuh (50%). Sistem AI siap memandu pengejaran."
                : "Konsistensi yang sangat bagus! Pertahankan ritme aktif untuk kesehatan kardiovaskular keluarga."}
            </p>
          </div>
        </div>

        {/* Right: Simulation Controls (Allows user to immediately test < 50% near end of day) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const nextState = !isSimulatingLateDayDeficit;
              setIsSimulatingLateDayDeficit(nextState);
              if (nextState) {
                setManualOffsets({});
                if (onShowToast) {
                  onShowToast("Mode Simulasi Diaktifkan: Capaian diturunkan ke 35% (< 50%) menjelang sore.", "info");
                }
              } else {
                setReminder(null);
                if (onShowToast) {
                  onShowToast("Kembali ke data sensor wearable asli.", "success");
                }
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
              isSimulatingLateDayDeficit
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            }`}
          >
            <span>{isSimulatingLateDayDeficit ? "⚡ Pulihkan Sensor Asli" : "🧪 Uji Simulasi < 50% Sore Hari"}</span>
          </button>

          {isUnderFiftyPercent && (
            <button
              type="button"
              onClick={() => fetchAiGoalsReminder()}
              disabled={isLoadingAiReminder}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <BrainCircuit className={`w-3.5 h-3.5 ${isLoadingAiReminder ? "animate-spin" : ""}`} />
              <span>{isLoadingAiReminder ? "Menganalisis..." : "Minta Pengingat AI"}</span>
            </button>
          )}
        </div>
      </div>

      {/* SPECIAL FEATURE: AI RESCUE REMINDER NOTIFICATION BANNER (When < 50% target near end of day) */}
      {isUnderFiftyPercent && !isReminderDismissed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50/40 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border-2 border-amber-400/80 dark:border-amber-700 shadow-md space-y-3 relative animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/30 shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3 text-amber-600" />
                  <span>Pengingat Cerdas AI (Menjelang Akhir Hari)</span>
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {reminder?.reminderTitle || `Target Harian Baru ${overallProgressPct}% (< 50%) – Ayo Kejar Sebelum Malam Tiba!`}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setIsReminderDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              title="Tutup pengingat ini"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Motivational AI Coach Message */}
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {reminder?.motivationalMessage || 
              `Halo ${patient.name}! Hari sudah menjelang sore dan Anda baru mencapai ${overallProgressPct}% dari target harian Anda. Jangan menyerah, masih ada jendela waktu yang cukup untuk mengaktifkan sirkulasi tubuh dan mencapai separuh target sebelum istirahat malam.`}
          </p>

          {/* Physiological Impact Box */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Dampak Fisiologis Penting:</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {reminder?.physiologicalImpact || 
                "Mengejar aktivitas ringan sore hari membantu membakar sisa glukosa darah, menurunkan resistensi vaskular arteri, dan merangsang produksi hormon melatonin untuk fase tidur deep sleep malam nanti."}
            </p>
          </div>

          {/* Actionable Micro-Routines with Interactive Checkboxes */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              3 Rutinitas Mikro Cepat (15-20 Menit) yang Disarankan AI:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(reminder?.quickRoutines || [
                "Minum 400ml air mineral bersuhu ruang untuk hidrasi seluler.",
                "Jalan santai 15 menit keliling pekarangan rumah (+500 langkah).",
                "Lakukan peregangan otot leher, bahu, dan betis selama 5 menit."
              ]).map((routine, rIdx) => {
                const isChecked = Boolean(checkedRoutines[rIdx]);
                return (
                  <button
                    key={rIdx}
                    type="button"
                    onClick={() => handleToggleRoutine(rIdx)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2 ${
                      isChecked
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-amber-200 dark:border-amber-800 hover:border-amber-400"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                      isChecked
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-[11px] leading-snug">
                      {routine}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 border-t border-amber-200/60 dark:border-amber-800/60">
            <span>
              💡 <em>{reminder?.encouragementQuote || "Konsistensi kecil setiap sore menjaga kesehatan keluarga."}</em>
            </span>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  handleQuickAdd("steps", 1000);
                  handleQuickAdd("hydration", 300);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
              >
                + Selesaikan Rutinitas Cepat
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4 INTERACTIVE GOAL TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map(goal => {
          const pct = Math.min(125, Math.round((goal.currentValue / goal.targetValue) * 100));
          const isSelected = selectedGoalId === goal.id;
          const isComplete = pct >= 100;
          const isLow = pct < 50;

          return (
            <div
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative group ${
                isSelected
                  ? "ring-2 ring-emerald-500/40 border-emerald-500 shadow-md bg-slate-50 dark:bg-slate-800/80"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {goal.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {goal.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Target: {goal.targetValue.toLocaleString("id-ID")} {goal.unit}
                    </span>
                  </div>
                </div>

                <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                  isComplete
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : isLow
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                }`}>
                  {pct}%
                </span>
              </div>

              {/* Progress Value Numbers */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {goal.currentValue.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{goal.unit}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isComplete ? "Tuntas! 🏆" : `Sisa ${(goal.targetValue - goal.currentValue).toLocaleString("id-ID")}`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isComplete
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : isLow
                      ? "bg-gradient-to-r from-amber-500 to-orange-400"
                      : "bg-gradient-to-r from-teal-500 to-blue-400"
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {/* Quick-Add Pill Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 text-[10px]">
                  {goal.category === "steps" ? "Sensor Aktif" : "Log Harian"}
                </span>

                <div className="flex items-center gap-1">
                  {goal.category === "steps" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd("steps", 500);
                      }}
                      className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      +500
                    </button>
                  )}
                  {goal.category === "calories" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd("calories", 50);
                      }}
                      className="px-2 py-0.5 rounded-md bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 text-orange-800 dark:text-orange-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      +50 kkal
                    </button>
                  )}
                  {goal.category === "exercise" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd("exercise", 10);
                      }}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      +10 mnt
                    </button>
                  )}
                  {goal.category === "hydration" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd("hydration", 250);
                      }}
                      className="px-2 py-0.5 rounded-md bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-950 dark:hover:bg-cyan-900 text-cyan-800 dark:text-cyan-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      +250 ml
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
