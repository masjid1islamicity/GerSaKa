import React, { useState, useEffect, useMemo } from "react";
import { FamilyMember, NutritionPlan, HealthGoalFoodSuggestion, HealthGoalFoodItem } from "../types";
import { 
  X, 
  Utensils, 
  Droplet, 
  Flame, 
  Bell, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Clock, 
  RefreshCw,
  Award,
  Apple,
  Footprints,
  Moon,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  HeartPulse,
  Copy,
  ChevronRight,
  Zap,
  Info
} from "lucide-react";

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
  allMembers?: FamilyMember[];
}

const STORAGE_KEY_SETTINGS = "gersaka_health_goals_settings_v1";
const STORAGE_KEY_PROGRESS = "gersaka_health_goals_progress_v1";

const DEFAULT_GOAL_SETTINGS: Record<string, { waterTargetMl: number; stepsTarget: number; sleepTargetHours: number }> = {
  "fam-01": { waterTargetMl: 2500, stepsTarget: 8000, sleepTargetHours: 7.5 },
  "fam-02": { waterTargetMl: 2200, stepsTarget: 7500, sleepTargetHours: 8.0 },
  "fam-03": { waterTargetMl: 2800, stepsTarget: 10000, sleepTargetHours: 8.0 },
  "fam-04": { waterTargetMl: 2000, stepsTarget: 7000, sleepTargetHours: 8.5 },
  "fam-05": { waterTargetMl: 1900, stepsTarget: 5000, sleepTargetHours: 7.5 },
};

export const NutritionModal: React.FC<NutritionModalProps> = ({
  isOpen,
  onClose,
  patient,
  allMembers = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [scheduledAlerts, setScheduledAlerts] = useState<Record<number, boolean>>({});
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<"all" | "water" | "steps" | "sleep" | "family">("all");
  const [copiedMenu, setCopiedMenu] = useState(false);

  // Load current Health Goals settings & progress for patient and family
  const { currentSettings, currentProgress, familySummary } = useMemo(() => {
    let settingsMap: Record<string, any> = DEFAULT_GOAL_SETTINGS;
    let progressMap: Record<string, any> = {};

    try {
      const s = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (s) settingsMap = { ...DEFAULT_GOAL_SETTINGS, ...JSON.parse(s) };
    } catch (e) {
      // fallback
    }

    try {
      const p = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (p) progressMap = JSON.parse(p);
    } catch (e) {
      // fallback
    }

    const patientSettings = settingsMap[patient.id] || DEFAULT_GOAL_SETTINGS[patient.id] || {
      waterTargetMl: 2500,
      stepsTarget: 8000,
      sleepTargetHours: 7.5,
    };

    const patientProgress = progressMap[patient.id] || {
      waterCurrentMl: patient.id === "fam-01" ? 1750 : patient.id === "fam-03" ? 2800 : 1600,
      stepsCurrent: patient.vitals?.steps || 7200,
      sleepCurrentHours: patient.vitals?.sleepHours || 7.2,
      streakDays: 6,
    };

    // Calculate family collective achievements
    const familyMembersList = allMembers.length > 0 ? allMembers : [patient];
    let totalWaterAchieved = 0;
    let totalStepsAchieved = 0;
    let totalSleepAchieved = 0;

    familyMembersList.forEach(m => {
      const mSettings = settingsMap[m.id] || DEFAULT_GOAL_SETTINGS[m.id] || { waterTargetMl: 2200, stepsTarget: 7000, sleepTargetHours: 7.5 };
      const mProgress = progressMap[m.id] || {
        waterCurrentMl: m.id === "fam-01" ? 1750 : 2000,
        stepsCurrent: m.vitals?.steps || 6800,
        sleepCurrentHours: m.vitals?.sleepHours || 7.0,
      };

      if (mProgress.waterCurrentMl >= mSettings.waterTargetMl) totalWaterAchieved++;
      if (mProgress.stepsCurrent >= mSettings.stepsTarget) totalStepsAchieved++;
      if (mProgress.sleepCurrentHours >= mSettings.sleepTargetHours) totalSleepAchieved++;
    });

    return {
      currentSettings: patientSettings,
      currentProgress: patientProgress,
      familySummary: {
        totalMembers: familyMembersList.length,
        waterAchievedCount: totalWaterAchieved,
        stepsAchievedCount: totalStepsAchieved,
        sleepAchievedCount: totalSleepAchieved,
      }
    };
  }, [patient.id, patient.vitals, allMembers, isOpen]);

  const fetchNutritionPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/nutrition-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          goal: `Manajemen pencegahan klinis & terapi ${patient.therapyProgram}`,
          healthGoalsContext: {
            waterCurrentMl: currentProgress.waterCurrentMl,
            waterTargetMl: currentSettings.waterTargetMl,
            stepsCurrent: currentProgress.stepsCurrent,
            stepsTarget: currentSettings.stepsTarget,
            sleepCurrentHours: currentProgress.sleepCurrentHours,
            sleepTargetHours: currentSettings.sleepTargetHours,
          },
          familyGoalsSummary: familySummary,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setPlan(data.data);
      }
    } catch (err) {
      console.error("Gizi AI error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNutritionPlan();
    }
  }, [isOpen, patient.id]);

  const toggleAlert = (idx: number) => {
    setScheduledAlerts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const copyNutritionSummary = () => {
    if (!plan) return;
    const items = [
      `🥗 Rencana Gizi & Saran Health Goals: ${patient.name}`,
      `Target Kalori: ${plan.dailyCalorieTarget} kkal/hari | Kebutuhan Air: ${plan.macroSplit.waterLiters}L`,
      `Fokus Nutrisi: ${plan.keyNutritionalFocus}`,
      "",
      "--- SARAN MAKANAN BERDASARKAN HEALTH GOALS ---",
      ...(plan.goalBasedFoodSuggestions || []).map(g => 
        `• [${g.goalTitle}] (${g.isAchieved ? "TERCAPAI" : "PROSES"}): ${g.suggestedFoods.map(f => f.name).join(", ")}`
      ),
      "",
      plan.familySharedMealSuggestion ? `Menu Keluarga: ${plan.familySharedMealSuggestion.title}` : "",
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(items).then(() => {
      setCopiedMenu(true);
      setTimeout(() => setCopiedMenu(false), 2500);
    });
  };

  if (!isOpen) return null;

  // Filtered goal-based food suggestions
  const goalSuggestions = plan?.goalBasedFoodSuggestions || [];
  const filteredGoalSuggestions = selectedGoalFilter === "all"
    ? goalSuggestions
    : goalSuggestions.filter(g => g.goalCategory === selectedGoalFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">Rencana & Saran Gizi Personal</h3>
                <span className="text-[10px] bg-white/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Rumah Sehat LimoCity
                </span>
                <span className="text-[10px] bg-teal-400/30 text-teal-100 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-teal-200/40">
                  <Sparkles className="w-3 h-3 text-teal-200" />
                  Health Goals Terhubung
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Rekomendasi Dietetik Berbasis Capaian Target Kesehatan: <span className="font-bold text-white">{patient.name}</span> ({patient.role}, {patient.age} thn)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 animate-spin shadow-md">
                <RefreshCw className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Menganalisis Capaian Health Goals & Meracik Saran Gizi...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Menyesuaikan asupan makronutrien, elektrolit hidrasi, dan protein pemulihan aktivitas {patient.name}
                </p>
              </div>
            </div>
          ) : plan ? (
            <>
              {/* Daily Calorie & Macro Target Strip */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-800/80 dark:to-teal-950/20 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Target Kalori Harian</span>
                      <p className="text-xl font-black text-slate-900 dark:text-white">
                        {plan.dailyCalorieTarget} <span className="text-xs font-semibold text-slate-500">kkal / hari</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300">
                      <Droplet className="w-4 h-4 text-cyan-500" />
                      <span className="font-bold">Air: {plan.macroSplit.waterLiters} Liter/Hari</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Serat: {plan.macroSplit.fiberGrams}g</span>
                    </div>
                  </div>
                </div>

                {/* Macro Split Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                      Karbohidrat: {plan.macroSplit.carbsPercent}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      Protein: {plan.macroSplit.proteinPercent}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                      Lemak Sehat: {plan.macroSplit.fatPercent}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 shadow-inner">
                    <div style={{ width: `${plan.macroSplit.carbsPercent}%` }} className="bg-amber-500" title="Karbohidrat" />
                    <div style={{ width: `${plan.macroSplit.proteinPercent}%` }} className="bg-emerald-500" title="Protein" />
                    <div style={{ width: `${plan.macroSplit.fatPercent}%` }} className="bg-blue-500" title="Lemak Sehat" />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-bold">Fokus Gizi Utama:</strong> {plan.keyNutritionalFocus}
                  </p>
                </div>
              </div>

              {/* SECTION: Saran Makanan Berdasarkan Capaian Health Goals */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-teal-50/50 via-emerald-50/20 to-transparent dark:from-teal-950/20 dark:via-emerald-950/10 dark:to-transparent border-2 border-teal-200 dark:border-teal-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Saran Makanan Berdasarkan Capaian Health Goals</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold">
                            Live Sync
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Rekomendasi menu & camilan pemulihan yang disesuaikan secara real-time dengan target harian yang telah diraih
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchNutritionPlan}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Perbarui rekomendasi dengan data terkini"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sinkron Ulang</span>
                    </button>
                    <button
                      onClick={copyNutritionSummary}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Salin saran menu ke papan klip"
                    >
                      {copiedMenu ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedMenu ? "Tersalin!" : "Salin Menu"}</span>
                    </button>
                  </div>
                </div>

                {/* Filter Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => setSelectedGoalFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedGoalFilter === "all"
                        ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Semua Capaian ({goalSuggestions.length})
                  </button>
                  <button
                    onClick={() => setSelectedGoalFilter("steps")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGoalFilter === "steps"
                        ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Langkah ({Math.round(((currentProgress.stepsCurrent || 7200) / (currentSettings.stepsTarget || 8000)) * 100)}%)</span>
                  </button>
                  <button
                    onClick={() => setSelectedGoalFilter("water")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGoalFilter === "water"
                        ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Droplet className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Hidrasi ({Math.round(((currentProgress.waterCurrentMl || 1750) / (currentSettings.waterTargetMl || 2500)) * 100)}%)</span>
                  </button>
                  <button
                    onClick={() => setSelectedGoalFilter("sleep")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGoalFilter === "sleep"
                        ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tidur ({Math.round(((currentProgress.sleepCurrentHours || 7.2) / (currentSettings.sleepTargetHours || 7.5)) * 100)}%)</span>
                  </button>
                  {plan.familySharedMealSuggestion && (
                    <button
                      onClick={() => setSelectedGoalFilter("family")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedGoalFilter === "family"
                          ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      <span>Menu Keluarga Bersama</span>
                    </button>
                  )}
                </div>

                {/* Goal Cards List */}
                {selectedGoalFilter !== "family" && (
                  <div className="space-y-4">
                    {filteredGoalSuggestions.map((goalSugg, gIdx) => {
                      const isSteps = goalSugg.goalCategory === "steps";
                      const isWater = goalSugg.goalCategory === "water";
                      const isSleep = goalSugg.goalCategory === "sleep";

                      const categoryIcon = isSteps ? (
                        <Footprints className="w-5 h-5 text-emerald-500" />
                      ) : isWater ? (
                        <Droplet className="w-5 h-5 text-cyan-500" />
                      ) : (
                        <Moon className="w-5 h-5 text-indigo-500" />
                      );

                      const accentBg = isSteps 
                        ? "from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/30 dark:to-teal-950/10" 
                        : isWater 
                        ? "from-cyan-500/10 to-blue-500/5 dark:from-cyan-950/30 dark:to-blue-950/10"
                        : "from-indigo-500/10 to-purple-500/5 dark:from-indigo-950/30 dark:to-purple-950/10";

                      const accentBorder = isSteps 
                        ? "border-emerald-200 dark:border-emerald-800" 
                        : isWater 
                        ? "border-cyan-200 dark:border-cyan-800" 
                        : "border-indigo-200 dark:border-indigo-800";

                      return (
                        <div
                          key={gIdx}
                          className={`p-4 rounded-xl bg-gradient-to-br ${accentBg} border ${accentBorder} shadow-sm space-y-3.5`}
                        >
                          {/* Goal Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                                {categoryIcon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    {goalSugg.goalTitle}
                                  </h5>
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                      goalSugg.isAchieved
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                                    }`}
                                  >
                                    {goalSugg.isAchieved ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {goalSugg.statusBadge}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                  <span>
                                    Capaian: <strong className="text-slate-900 dark:text-white">{goalSugg.currentValue.toLocaleString()}</strong> / {goalSugg.targetValue.toLocaleString()} {goalSugg.unit}
                                  </span>
                                  <span>•</span>
                                  <span className="font-bold text-teal-700 dark:text-teal-300">
                                    {goalSugg.progressPercent}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="w-full sm:w-44 space-y-1">
                              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    goalSugg.isAchieved 
                                      ? "bg-emerald-500" 
                                      : "bg-teal-500"
                                  }`}
                                  style={{ width: `${Math.min(100, goalSugg.progressPercent)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Clinical Rationale Box */}
                          <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              <strong className="text-slate-900 dark:text-white font-semibold">Alasan Gizi Rumah Sehat: </strong>
                              {goalSugg.clinicalRationale}
                            </p>
                          </div>

                          {/* Suggested Foods Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {goalSugg.suggestedFoods.map((food, fIdx) => (
                              <div
                                key={fIdx}
                                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-xs hover:border-teal-400 dark:hover:border-teal-600 transition-colors"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                      {food.category}
                                    </span>
                                    {food.isSuperfood && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        Superfood
                                      </span>
                                    )}
                                  </div>

                                  <h6 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                                    {food.name}
                                  </h6>

                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                                    {food.nutritionalRole}
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                    {food.highlightNutrient}
                                  </span>
                                  <span className="text-slate-500 font-semibold">
                                    {food.calories} kkal
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Family Shared Meal Card (Either under filter or as prominent card) */}
                {(selectedGoalFilter === "all" || selectedGoalFilter === "family") && plan.familySharedMealSuggestion && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-emerald-500/10 dark:from-amber-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 border-2 border-amber-300 dark:border-amber-800/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {plan.familySharedMealSuggestion.title}
                            </h5>
                            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                              Menu Keluarga Bersama
                            </span>
                          </div>
                          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 font-medium">
                            {plan.familySharedMealSuggestion.collectiveStatsSummary}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200">
                        {plan.familySharedMealSuggestion.caloriesPerServing} kkal / porsi
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-amber-200 dark:border-amber-800/80 space-y-2">
                      <div className="flex items-start gap-2">
                        <Utensils className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Komposisi Menu Nusantara:</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                            {plan.familySharedMealSuggestion.menu}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-start gap-2">
                        <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Harmoni Klinis Keluarga:</span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {plan.familySharedMealSuggestion.rationale}
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300">
                        <span className="font-bold">Tips Penyesuaian Anggota: </span>
                        {plan.familySharedMealSuggestion.familyFitNote}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5-Meal Schedule */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Jadwal Menu Gizi Harian (Kuliner Sehat Nusantara)</span>
                </h4>

                <div className="space-y-2.5">
                  {plan.meals.map((meal, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs shrink-0 border border-teal-200 dark:border-teal-800">
                          {meal.time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {meal.type}
                            </span>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              • {meal.calories} kkal
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                            {meal.menu}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            💡 {meal.tips}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Push Notifications List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notifikasi Gizi & Hidrasi Terjadwal</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {plan.smartPushAlerts.map((alert, idx) => {
                    const isScheduled = Boolean(scheduledAlerts[idx]);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {alert.time}
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                            {alert.message}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleAlert(idx)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                            isScheduled
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                          }`}
                          title={isScheduled ? "Pengingat Aktif" : "Aktifkan Notifikasi"}
                        >
                          {isScheduled ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Superfoods vs Avoid Foods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    <span>Superfood Dianjurkan (Lokal):</span>
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {plan.superfoods.map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Pantangan / Batasi Konsumsi:</span>
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {plan.avoidFoods.map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Divalidasi oleh Tim Nutrisi Klinis Rumah Sehat LimoCity Therapy
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
