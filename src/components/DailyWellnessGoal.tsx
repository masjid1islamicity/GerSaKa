import React, { useState, useEffect, useMemo } from "react";
import { 
  FamilyMember 
} from "../types";
import { 
  Target, 
  Droplet, 
  Footprints, 
  Wind, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sliders, 
  Award, 
  Flame, 
  Clock, 
  Sun, 
  Moon, 
  Smile, 
  Heart, 
  Zap, 
  Activity, 
  Play, 
  Pause, 
  X, 
  Check, 
  ChevronRight,
  TrendingUp,
  Volume2
} from "lucide-react";
import { fireBadgeCelebrationConfetti, fireGrandCelebration } from "../utils/confetti";
import { playHydrationSoundChime } from "../utils/smartHydration";

export interface WellnessHabit {
  id: string;
  title: string;
  category: "water" | "steps" | "breathing" | "stretching" | "sunlight" | "sleep" | "custom";
  iconName: string;
  current: number;
  target: number;
  unit: string;
  stepIncrement: number;
  colorScheme: "cyan" | "orange" | "indigo" | "teal" | "amber" | "emerald";
  description: string;
  streakDays: number;
  isCompleted?: boolean;
}

export interface DailyWellnessGoalProps {
  member: FamilyMember;
  allMembers?: FamilyMember[];
  onSelectMember?: (id: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onSyncWearable?: () => void;
}

export const DailyWellnessGoal: React.FC<DailyWellnessGoalProps> = ({
  member,
  allMembers,
  onSelectMember,
  onShowToast,
  onSyncWearable,
}) => {
  // Storage key based on member ID and date
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const storageKey = `gersaka_wellness_goals_${member.id}_${todayStr}`;

  // Default initial habits generated per member profile
  const defaultHabits: WellnessHabit[] = useMemo(() => {
    const isGeriatric = member.age >= 65;
    const isAthlete = member.id === "fam-03";
    const baseStepsTarget = isGeriatric ? 5000 : isAthlete ? 10000 : 8000;
    const memberSteps = member.vitals.steps || (isGeriatric ? 4200 : isAthlete ? 9200 : 6850);

    return [
      {
        id: "habit-water",
        title: "Asupan Air Thayyib",
        category: "water",
        iconName: "droplet",
        current: Math.min(2500, Math.max(1000, Math.round((member.vitals.activeCalories || 400) * 4.2))),
        target: isAthlete ? 3000 : isGeriatric ? 2000 : 2500,
        unit: "ml",
        stepIncrement: 250,
        colorScheme: "cyan",
        description: "Menjaga viskositas darah, fungsi ginjal, dan daya tahan seluler.",
        streakDays: 8,
      },
      {
        id: "habit-steps",
        title: "Langkah Kaki Aktif",
        category: "steps",
        iconName: "footprints",
        current: memberSteps,
        target: baseStepsTarget,
        unit: "langkah",
        stepIncrement: 500,
        colorScheme: "orange",
        description: "Aktivitas fisik teratur penurun tensi dan stimulator metabolisme.",
        streakDays: 14,
      },
      {
        id: "habit-breathing",
        title: "Latihan Pernapasan Relaksasi",
        category: "breathing",
        iconName: "wind",
        current: 2,
        target: 3,
        unit: "sesi",
        stepIncrement: 1,
        colorScheme: "indigo",
        description: "Teknik Box Breathing 4-4-4-4 penurun kortisol dan perangsang saraf vagus.",
        streakDays: 6,
      },
      {
        id: "habit-stretching",
        title: "Peregangan Sendi & Otot",
        category: "stretching",
        iconName: "activity",
        current: isGeriatric ? 15 : 10,
        target: isGeriatric ? 20 : 15,
        unit: "menit",
        stepIncrement: 5,
        colorScheme: "teal",
        description: "Kelenturan sendi lutut, peregangan pasca shalat, dan pencegah osteopenia.",
        streakDays: 9,
      },
      {
        id: "habit-sunlight",
        title: "Sinar Fajar & Dzikir Pagi",
        category: "sunlight",
        iconName: "sun",
        current: 15,
        target: 15,
        unit: "menit",
        stepIncrement: 5,
        colorScheme: "amber",
        description: "Sinkronisasi jam sirkadian alami, aktivasi vitamin D, dan ketenangan jiwa.",
        streakDays: 12,
      },
    ];
  }, [member.id, member.age, member.vitals.steps, member.vitals.activeCalories]);

  // State: Habits list
  const [habits, setHabits] = useState<WellnessHabit[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return defaultHabits;
  });

  // Re-sync when member or defaultHabits change if not stored
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHabits(JSON.parse(saved));
      } else {
        setHabits(defaultHabits);
      }
    } catch {
      setHabits(defaultHabits);
    }
  }, [storageKey, defaultHabits]);

  // Persist habits on change
  const saveHabits = (updated: WellnessHabit[]) => {
    setHabits(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Modal: Goal Customization
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabits, setEditingHabits] = useState<WellnessHabit[]>([]);

  // Modal: Interactive Breathing Guide Exercise
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "holdEmpty">("inhale");
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4);
  const [breathingTotalSeconds, setBreathingTotalSeconds] = useState(60); // 1 minute session
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // New Habit creation form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState(10);
  const [newUnit, setNewUnit] = useState("menit");
  const [newStep, setNewStep] = useState(5);
  const [newCategory, setNewCategory] = useState<WellnessHabit["category"]>("stretching");

  // Summary stats
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.current >= h.target).length;
  const overallPercentage = totalHabits > 0 
    ? Math.round(habits.reduce((acc, h) => acc + Math.min(100, (h.current / h.target) * 100), 0) / totalHabits)
    : 0;

  // Check if all completed
  const isAllCompleted = totalHabits > 0 && completedHabits === totalHabits;

  // Handle Increment
  const handleIncrement = (habitId: string, customAmount?: number) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const inc = customAmount !== undefined ? customAmount : h.stepIncrement;
        const newCurrent = h.current + inc;
        const reachedTarget = h.current < h.target && newCurrent >= h.target;

        if (reachedTarget) {
          playHydrationSoundChime("optimal");
          fireBadgeCelebrationConfetti(0.5, 0.6);
          if (onShowToast) {
            onShowToast(`🎯 Alhamdulillah! Target '${h.title}' tercapai (${newCurrent} ${h.unit})!`, "success");
          }
        } else {
          playHydrationSoundChime("perlu_perhatian");
        }

        return {
          ...h,
          current: newCurrent,
        };
      }
      return h;
    });

    saveHabits(updated);

    // If this caused all habits to complete
    const nowCompleted = updated.filter((h) => h.current >= h.target).length;
    if (nowCompleted === updated.length && !isAllCompleted) {
      setTimeout(() => {
        fireGrandCelebration();
        if (onShowToast) {
          onShowToast(`🌟 Barakallah! Seluruh ${updated.length} Target Kesehatan Harian ${member.name} telah 100% Selesai!`, "success");
        }
      }, 500);
    }
  };

  // Handle Decrement
  const handleDecrement = (habitId: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          current: Math.max(0, h.current - h.stepIncrement),
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  // Toggle habit directly to complete
  const handleToggleComplete = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    if (habit.current >= habit.target) {
      // Reset to 0
      const updated = habits.map((h) => (h.id === habitId ? { ...h, current: 0 } : h));
      saveHabits(updated);
    } else {
      // Mark as complete
      handleIncrement(habitId, habit.target - habit.current);
    }
  };

  // Reset all habits for today
  const handleResetAll = () => {
    const updated = habits.map((h) => ({ ...h, current: 0 }));
    saveHabits(updated);
    if (onShowToast) {
      onShowToast("Seluruh capaian kebiasaan harian telah direset.", "info");
    }
  };

  // Open Edit Goals Modal
  const openEditModal = () => {
    setEditingHabits(JSON.parse(JSON.stringify(habits)));
    setIsEditModalOpen(true);
  };

  // Save customized goals
  const handleSaveEditedGoals = () => {
    saveHabits(editingHabits);
    setIsEditModalOpen(false);
    if (onShowToast) {
      onShowToast("Target kebiasaan harian berhasil diperbarui!", "success");
    }
  };

  // Add new habit
  const handleAddNewHabit = () => {
    if (!newTitle.trim()) return;

    const newHabit: WellnessHabit = {
      id: `habit-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      iconName: newCategory === "water" ? "droplet" : newCategory === "steps" ? "footprints" : newCategory === "breathing" ? "wind" : newCategory === "sunlight" ? "sun" : "activity",
      current: 0,
      target: Number(newTarget) || 1,
      unit: newUnit.trim() || "sesi",
      stepIncrement: Number(newStep) || 1,
      colorScheme: newCategory === "water" ? "cyan" : newCategory === "steps" ? "orange" : newCategory === "breathing" ? "indigo" : "emerald",
      description: "Target kebiasaan harian personal.",
      streakDays: 1,
    };

    const updated = [...habits, newHabit];
    saveHabits(updated);
    setShowAddForm(false);
    setNewTitle("");
    if (onShowToast) {
      onShowToast(`Kebiasaan baru '${newHabit.title}' berhasil ditambahkan!`, "success");
    }
  };

  // Delete habit
  const handleDeleteHabit = (id: string) => {
    const updated = editingHabits.filter((h) => h.id !== id);
    setEditingHabits(updated);
  };

  // Interactive Breathing Exercise Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isBreathingModalOpen && isBreathingActive && breathingTotalSeconds > 0) {
      interval = setInterval(() => {
        setBreathingSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> HoldEmpty (4s)
            setBreathingPhase((cur) => {
              if (cur === "inhale") return "hold";
              if (cur === "hold") return "exhale";
              if (cur === "exhale") return "holdEmpty";
              return "inhale";
            });
            return 4;
          }
          return prev - 1;
        });

        setBreathingTotalSeconds((prev) => {
          if (prev <= 1) {
            // Exercise completed!
            setIsBreathingActive(false);
            // Increment breathing habit!
            handleIncrement("habit-breathing", 1);
            playHydrationSoundChime("optimal");
            fireBadgeCelebrationConfetti(0.5, 0.5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingModalOpen, isBreathingActive, breathingTotalSeconds]);

  // Helper for rendering icons
  const renderHabitIcon = (category: string) => {
    switch (category) {
      case "water":
        return <Droplet className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />;
      case "steps":
        return <Footprints className="w-5 h-5 text-orange-500" />;
      case "breathing":
        return <Wind className="w-5 h-5 text-indigo-500" />;
      case "stretching":
        return <Activity className="w-5 h-5 text-teal-500" />;
      case "sunlight":
        return <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
      default:
        return <Target className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Color mappings
  const getColorClasses = (color: string, isDone: boolean) => {
    if (isDone) {
      return {
        bg: "bg-emerald-50/70 dark:bg-emerald-950/30",
        border: "border-emerald-300 dark:border-emerald-800",
        bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
        text: "text-emerald-700 dark:text-emerald-300",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300",
      };
    }
    switch (color) {
      case "cyan":
        return {
          bg: "bg-cyan-50/50 dark:bg-cyan-950/20",
          border: "border-cyan-200 dark:border-cyan-900/60",
          bar: "bg-gradient-to-r from-cyan-500 to-blue-500",
          text: "text-cyan-700 dark:text-cyan-300",
          badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300",
        };
      case "orange":
        return {
          bg: "bg-orange-50/50 dark:bg-orange-950/20",
          border: "border-orange-200 dark:border-orange-900/60",
          bar: "bg-gradient-to-r from-orange-500 to-amber-500",
          text: "text-orange-700 dark:text-orange-300",
          badge: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300",
        };
      case "indigo":
        return {
          bg: "bg-indigo-50/50 dark:bg-indigo-950/20",
          border: "border-indigo-200 dark:border-indigo-900/60",
          bar: "bg-gradient-to-r from-indigo-500 to-purple-500",
          text: "text-indigo-700 dark:text-indigo-300",
          badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
        };
      case "teal":
        return {
          bg: "bg-teal-50/50 dark:bg-teal-950/20",
          border: "border-teal-200 dark:border-teal-900/60",
          bar: "bg-gradient-to-r from-teal-500 to-emerald-400",
          text: "text-teal-700 dark:text-teal-300",
          badge: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
        };
      case "amber":
        return {
          bg: "bg-amber-50/50 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-900/60",
          bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
          text: "text-amber-700 dark:text-amber-300",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-800/40",
          border: "border-slate-200 dark:border-slate-700",
          bar: "bg-gradient-to-r from-teal-500 to-emerald-400",
          text: "text-slate-700 dark:text-slate-300",
          badge: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. HEADER WITH OVERALL PROGRESS BAR & CONTROLS */}
      {/* ========================================================================= */}
      <div className="relative z-10 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-600/20 shrink-0">
              <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Daily Wellness Habit Tracker
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Target Kesehatan Harian (Daily Wellness Goal)</span>
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Kelola dan pantau kebiasaan sehat harian sederhana (asupan air thayyib, langkah aktif, latihan pernapasan, peregangan) dengan bilah progres personal untuk <strong>{member.name}</strong> ({member.role}).
              </p>
            </div>
          </div>

          {/* Action buttons: Edit Goals, Reset, Breathing */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setIsBreathingModalOpen(true);
                setBreathingTotalSeconds(60);
                setBreathingSecondsLeft(4);
                setBreathingPhase("inhale");
                setIsBreathingActive(false);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Buka panduan interaktif latihan napas Box Breathing"
            >
              <Wind className="w-3.5 h-3.5 text-indigo-500" />
              <span>Latihan Napas</span>
            </button>

            <button
              type="button"
              onClick={openEditModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Atur Target</span>
            </button>

            <button
              type="button"
              onClick={handleResetAll}
              className="p-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Reset capaian hari ini"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* OVERALL DAILY PROGRESS SUMMARY STRIP */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 shadow-md space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-teal-200">
                Capaian Keseluruhan Hari Ini: <strong>{completedHabits} dari {totalHabits} Kebiasaan Terpenuhi</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-300">
                Status: <strong className={isAllCompleted ? "text-emerald-400 font-black" : "text-amber-300 font-bold"}>
                  {isAllCompleted ? "Target Sempurna Selesai! (100%)" : `${overallPercentage}% Tercapai`}
                </strong>
              </span>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden relative border border-white/10">
            <div 
              style={{ width: `${overallPercentage}%` }}
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-700 relative shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>
              {isAllCompleted 
                ? "🌟 Maa syaa Allah! Seluruh kebiasaan sehat hari ini telah tercapai dengan istiqomah." 
                : "Ayo selesaikan target harian untuk menjaga vitalitas dan membuka bonus Koin Kebugaran."}
            </span>
            <span className="font-mono text-teal-300 font-bold">
              {overallPercentage}%
            </span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. HABIT CARDS GRID WITH PROGRESS BARS & INCREMENT BUTTONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => {
          const isDone = habit.current >= habit.target;
          const percentage = Math.min(100, Math.round((habit.current / habit.target) * 100));
          const colorStyles = getColorClasses(habit.colorScheme, isDone);

          return (
            <div
              key={habit.id}
              className={`p-5 rounded-2xl border-2 transition-all space-y-4 relative overflow-hidden flex flex-col justify-between ${
                isDone 
                  ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700/80 shadow-xs" 
                  : `${colorStyles.bg} ${colorStyles.border} hover:border-teal-400`
              }`}
            >
              {/* Top Row: Icon, Title, and Complete Checkmark */}
              <div className="space-y-2">
                
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                      {renderHabitIcon(habit.category)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                        {habit.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-orange-500" />
                          {habit.streakDays} Hari Streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleComplete(habit.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-emerald-500 border border-slate-200 dark:border-slate-700"
                    }`}
                    title={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {habit.description}
                </p>
              </div>

              {/* Middle Row: Progress Bar & Numeric Ratio */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                
                <div className="flex items-baseline justify-between">
                  <div className="text-xs">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {habit.current.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      / {habit.target.toLocaleString()} {habit.unit}
                    </span>
                  </div>

                  <span className={`text-xs font-black font-mono ${
                    isDone ? "text-emerald-600 dark:text-emerald-400" : colorStyles.text
                  }`}>
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${colorStyles.bar}`}
                  />
                </div>

              </div>

              {/* Bottom Row: Quick Increment & Decrement Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                
                {habit.category === "breathing" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsBreathingModalOpen(true);
                      setBreathingTotalSeconds(60);
                      setBreathingSecondsLeft(4);
                      setBreathingPhase("inhale");
                      setIsBreathingActive(true);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Mulai Napas 1 Mnt</span>
                  </button>
                ) : habit.category === "steps" && onSyncWearable ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => handleIncrement(habit.id, 500)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      +500
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrement(habit.id, 1000)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      +1.000
                    </button>
                    <button
                      type="button"
                      onClick={onSyncWearable}
                      className="py-1.5 px-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all cursor-pointer"
                      title="Sinkronkan dari sensor jam tangan"
                    >
                      Sync
                    </button>
                  </div>
                ) : habit.category === "water" ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => handleIncrement(habit.id, 250)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-cyan-700 dark:text-cyan-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      +250 ml (1 Gelas)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrement(habit.id, 500)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-cyan-700 dark:text-cyan-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      +500 ml (Botol)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => handleIncrement(habit.id)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+{habit.stepIncrement} {habit.unit}</span>
                    </button>
                  </div>
                )}

                {/* Decrement Button */}
                <button
                  type="button"
                  onClick={() => handleDecrement(habit.id)}
                  disabled={habit.current <= 0}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-30 text-slate-500 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  title="Kurangi"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: SET & EDIT WELLNESS GOALS */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Atur Target Kebiasaan Sehat ({member.name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sesuaikan besaran target harian agar pas dengan kapasitas fisik, rekomendasi dokter, dan rutinitas keluarga.
            </p>

            {/* List of Habits for Editing */}
            <div className="space-y-3">
              {editingHabits.map((h, idx) => (
                <div key={h.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                      {h.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Saat ini: {h.current} {h.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-xs font-bold text-slate-500">Target:</label>
                    <input
                      type="number"
                      value={h.target}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        setEditingHabits((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, target: val } : item))
                        );
                      }}
                      className="w-20 px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-right"
                    />
                    <span className="text-xs font-bold text-slate-500 w-12 truncate">{h.unit}</span>

                    <button
                      type="button"
                      onClick={() => handleDeleteHabit(h.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      title="Hapus kebiasaan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Custom Habit Accordion */}
            {showAddForm ? (
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-3">
                <span className="text-xs font-black text-teal-900 dark:text-teal-200 block">
                  Tambah Kebiasaan Baru
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Nama Kebiasaan:</label>
                    <input
                      type="text"
                      placeholder="e.g. Minum Seduhan Jahe"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Kategori:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="water">Hidrasi Air</option>
                      <option value="steps">Langkah & Jalan</option>
                      <option value="breathing">Latihan Pernapasan</option>
                      <option value="stretching">Peregangan Fisik</option>
                      <option value="sunlight">Paparan Sinar Matahari</option>
                      <option value="custom">Kebiasaan Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Target Harian:</label>
                    <input
                      type="number"
                      value={newTarget}
                      onChange={(e) => setNewTarget(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Satuan:</label>
                    <input
                      type="text"
                      placeholder="e.g. cangkir, menit, sesi"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewHabit}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                  >
                    Simpan Kebiasaan
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 text-slate-600 dark:text-slate-400 hover:text-teal-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kebiasaan Sehat Baru</span>
              </button>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditedGoals}
                className="px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md cursor-pointer"
              >
                Terapkan Target
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: INTERACTIVE BOX BREATHING EXERCISE GUIDE */}
      {/* ========================================================================= */}
      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-indigo-700/60 shadow-2xl text-white space-y-6 text-center relative overflow-hidden">
            
            <button
              type="button"
              onClick={() => {
                setIsBreathingModalOpen(false);
                setIsBreathingActive(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Pernapasan Sirkadian & Saraf Vagus
              </span>
              <h3 className="text-xl font-black text-white">
                Box Breathing 4-4-4-4
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Tarik napas, tahan, hembuskan, dan tahan kosong masing-masing selama 4 detik untuk menurunkan denyut jantung dan meredakan stres.
              </p>
            </div>

            {/* Animated Pulsing Breathing Visualizer */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-6">
              
              {/* Outer pulse wave */}
              <div className={`absolute inset-0 rounded-full border-4 border-indigo-400/30 transition-all duration-1000 ${
                breathingPhase === "inhale" ? "scale-110 border-indigo-400/60" : breathingPhase === "exhale" ? "scale-90 opacity-40" : "scale-100"
              }`} />

              {/* Core pulsing circle */}
              <div className={`w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-500 flex flex-col items-center justify-center shadow-xl transition-all duration-1000 ${
                breathingPhase === "inhale" 
                  ? "scale-110 shadow-indigo-500/50" 
                  : breathingPhase === "exhale" 
                  ? "scale-90 shadow-teal-500/30" 
                  : "scale-100"
              }`}>
                <span className="text-3xl font-black font-mono text-white">
                  {breathingSecondsLeft}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 mt-1">
                  {breathingPhase === "inhale"
                    ? "Tarik Napas"
                    : breathingPhase === "hold"
                    ? "Tahan Napas"
                    : breathingPhase === "exhale"
                    ? "Hembuskan"
                    : "Tahan Kosong"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">
                Sisa Waktu Sesi: <strong className="text-white font-mono">{breathingTotalSeconds} detik</strong>
              </span>
              <div className="w-48 mx-auto h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  style={{ width: `${((60 - breathingTotalSeconds) / 60) * 100}%` }}
                  className="bg-indigo-400 h-full rounded-full transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className="px-6 py-2.5 rounded-xl font-black text-xs bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isBreathingActive ? "Jeda Latihan" : "Mulai Latihan"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBreathingTotalSeconds(60);
                  setBreathingSecondsLeft(4);
                  setBreathingPhase("inhale");
                  setIsBreathingActive(false);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
