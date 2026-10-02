import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FamilyMember, 
  SmartDailyGoal, 
  SmartGoalCategory, 
  SmartGoalAiNotification 
} from "../types";
import { 
  Target, 
  Flame, 
  Activity, 
  Moon, 
  Droplet, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Settings2, 
  Bell, 
  RefreshCw, 
  X, 
  Check, 
  Share2, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ArrowUpRight, 
  Award,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { 
  playCelebrationChime, 
  dispatchWebNotification 
} from "./HealthGoalsNotificationSystem";

interface SmartHealthGoalsProps {
  patient: FamilyMember;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

// Initial smart daily goals configuration per member
const DEFAULT_DAILY_GOALS_BY_ROLE: Record<string, SmartDailyGoal[]> = {
  "fam-01": [ // Hendra Kusuma (Ayah - 52 thn, Hipertensi terkontrol)
    {
      id: "goal-steps-01",
      category: "steps",
      title: "Langkah Kaki Harian",
      unit: "langkah",
      currentValue: 8450,
      targetValue: 8000,
      wearableSourceKey: "steps",
      iconName: "Flame",
      colorTheme: "amber",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: false },
      recommendedPreset: "Standar Kardiovaskular Sehat",
      clinicalRationale: "Mendukung penurunan resistensi perifer dan elastisitas arteri.",
    },
    {
      id: "goal-calories-01",
      category: "calories",
      title: "Kalori Terbakar Aktif",
      unit: "kkal",
      currentValue: 480,
      targetValue: 500,
      wearableSourceKey: "activeCalories",
      iconName: "Zap",
      colorTheme: "orange",
      milestonesTriggered: { half: true, near: true, completed: false, streakBonus: false },
      recommendedPreset: "Kontrol Dislipidemia",
      clinicalRationale: "Mengoptimalkan pembakaran trigliserida pasca makan.",
    },
    {
      id: "goal-exercise-01",
      category: "exercise",
      title: "Durasi Olahraga & Jalan Cepat",
      unit: "menit",
      currentValue: 52,
      targetValue: 45,
      wearableSourceKey: "activeMinutes",
      iconName: "Activity",
      colorTheme: "emerald",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: true },
      recommendedPreset: "Aerobik Ringan-Sedang",
      clinicalRationale: "Latihan ritmis 30-45 menit memicu pelepasan nitrik oksida alami.",
    },
    {
      id: "goal-sleep-01",
      category: "sleep",
      title: "Istirahat Restoratif",
      unit: "jam",
      currentValue: 7.2,
      targetValue: 7.0,
      wearableSourceKey: "sleepHours",
      iconName: "Moon",
      colorTheme: "indigo",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: false },
      recommendedPreset: "Sirkadian Sunnah",
      clinicalRationale: "Tidur sebelum jam 22:30 merelaksasikan tekanan darah malam hari.",
    },
  ],
  "fam-02": [ // Siti Rahmawati (Ibu - 49 thn)
    {
      id: "goal-steps-02",
      category: "steps",
      title: "Langkah Kaki Harian",
      unit: "langkah",
      currentValue: 6200,
      targetValue: 7000,
      wearableSourceKey: "steps",
      iconName: "Flame",
      colorTheme: "amber",
      milestonesTriggered: { half: true, near: true, completed: false, streakBonus: false },
      recommendedPreset: "Ramah Sendi Lutut",
      clinicalRationale: "Mempertahankan mobilitas kartilago tanpa beban berlebih.",
    },
    {
      id: "goal-calories-02",
      category: "calories",
      title: "Kalori Terbakar Aktif",
      unit: "kkal",
      currentValue: 340,
      targetValue: 400,
      wearableSourceKey: "activeCalories",
      iconName: "Zap",
      colorTheme: "orange",
      milestonesTriggered: { half: true, near: false, completed: false, streakBonus: false },
      recommendedPreset: "Metabolisme Seimbang",
      clinicalRationale: "Menjaga sensitivitas insulin dan profil glukosa.",
    },
    {
      id: "goal-exercise-02",
      category: "exercise",
      title: "Durasi Olahraga & Fisioterapi",
      unit: "menit",
      currentValue: 42,
      targetValue: 35,
      wearableSourceKey: "activeMinutes",
      iconName: "Activity",
      colorTheme: "emerald",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: true },
      recommendedPreset: "Latihan Penguatan Quadriceps",
      clinicalRationale: "Memperkuat penopang sendi lutut kiri.",
    },
    {
      id: "goal-sleep-02",
      category: "sleep",
      title: "Istirahat Restoratif",
      unit: "jam",
      currentValue: 7.8,
      targetValue: 7.5,
      wearableSourceKey: "sleepHours",
      iconName: "Moon",
      colorTheme: "indigo",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: false },
      recommendedPreset: "Pemulihan Jaringan",
      clinicalRationale: "Maksimalisasi sintesis kolagen saat deep sleep.",
    },
  ],
  "fam-03": [ // Dimas Pratama (Anak Sulung - 24 thn Atlet)
    {
      id: "goal-steps-03",
      category: "steps",
      title: "Langkah Kaki Harian",
      unit: "langkah",
      currentValue: 12400,
      targetValue: 12000,
      wearableSourceKey: "steps",
      iconName: "Flame",
      colorTheme: "amber",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: true },
      recommendedPreset: "Performa Atletik",
      clinicalRationale: "Volume latihan kardiovaskular tinggi dan pembakaran asam laktat.",
    },
    {
      id: "goal-calories-03",
      category: "calories",
      title: "Kalori Terbakar Aktif",
      unit: "kkal",
      currentValue: 760,
      targetValue: 700,
      wearableSourceKey: "activeCalories",
      iconName: "Zap",
      colorTheme: "orange",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: true },
      recommendedPreset: "Bakar Lemak & Otot",
      clinicalRationale: "Mendukung metabolisme VO2 max tinggi.",
    },
    {
      id: "goal-exercise-03",
      category: "exercise",
      title: "Durasi Olahraga & Lari",
      unit: "menit",
      currentValue: 85,
      targetValue: 60,
      wearableSourceKey: "activeMinutes",
      iconName: "Activity",
      colorTheme: "emerald",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: true },
      recommendedPreset: "High Endurance",
      clinicalRationale: "Adaptasi miokardium ventrikel kiri atlet.",
    },
    {
      id: "goal-sleep-03",
      category: "sleep",
      title: "Istirahat Restoratif",
      unit: "jam",
      currentValue: 8.1,
      targetValue: 8.0,
      wearableSourceKey: "sleepHours",
      iconName: "Moon",
      colorTheme: "indigo",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: false },
      recommendedPreset: "Super-Recovery",
      clinicalRationale: "Sekresi HGH optimal untuk regenerasi myofibril.",
    },
  ],
  "fam-04": [ // Nadia Anindita (Anak Bungsu - 16 thn Pelajar)
    {
      id: "goal-steps-04",
      category: "steps",
      title: "Langkah Kaki Harian",
      unit: "langkah",
      currentValue: 7100,
      targetValue: 7500,
      wearableSourceKey: "steps",
      iconName: "Flame",
      colorTheme: "amber",
      milestonesTriggered: { half: true, near: true, completed: false, streakBonus: false },
      recommendedPreset: "Remaja Aktif",
      clinicalRationale: "Mencegah gaya hidup sedenter akibat jam belajar panjang.",
    },
    {
      id: "goal-calories-04",
      category: "calories",
      title: "Kalori Terbakar Aktif",
      unit: "kkal",
      currentValue: 380,
      targetValue: 450,
      wearableSourceKey: "activeCalories",
      iconName: "Zap",
      colorTheme: "orange",
      milestonesTriggered: { half: true, near: false, completed: false, streakBonus: false },
      recommendedPreset: "Pertumbuhan Optimal",
      clinicalRationale: "Menjaga keseimbangan energi dan imunitas.",
    },
    {
      id: "goal-exercise-04",
      category: "exercise",
      title: "Durasi Olahraga & Peregangan",
      unit: "menit",
      currentValue: 48,
      targetValue: 40,
      wearableSourceKey: "activeMinutes",
      iconName: "Activity",
      colorTheme: "emerald",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: true },
      recommendedPreset: "Postur & Relaksasi Mata",
      clinicalRationale: "Mengurangi ketegangan servikal dan mata lelah.",
    },
    {
      id: "goal-sleep-04",
      category: "sleep",
      title: "Istirahat Restoratif",
      unit: "jam",
      currentValue: 7.5,
      targetValue: 7.5,
      wearableSourceKey: "sleepHours",
      iconName: "Moon",
      colorTheme: "indigo",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: false },
      recommendedPreset: "Konsolidasi Memori Belajar",
      clinicalRationale: "Siklus REM penting untuk daya ingat pelajaran.",
    },
  ],
  "fam-05": [ // Bpk. H. Subroto (Kakek - 76 thn Geriatri)
    {
      id: "goal-steps-05",
      category: "steps",
      title: "Langkah Kaki Harian",
      unit: "langkah",
      currentValue: 4300,
      targetValue: 4500,
      wearableSourceKey: "steps",
      iconName: "Flame",
      colorTheme: "amber",
      milestonesTriggered: { half: true, near: true, completed: false, streakBonus: false },
      recommendedPreset: "Lansia Tangguh Post-Stent",
      clinicalRationale: "Menjaga perfusi jantung tanpa membebani pompa kardiak.",
    },
    {
      id: "goal-calories-05",
      category: "calories",
      title: "Kalori Terbakar Aktif",
      unit: "kkal",
      currentValue: 260,
      targetValue: 280,
      wearableSourceKey: "activeCalories",
      iconName: "Zap",
      colorTheme: "orange",
      milestonesTriggered: { half: true, near: true, completed: false, streakBonus: false },
      recommendedPreset: "Geriatri Aman",
      clinicalRationale: "Metabolisme basah terjaga secara lembut.",
    },
    {
      id: "goal-exercise-05",
      category: "exercise",
      title: "Durasi Olahraga & Jalan Santai",
      unit: "menit",
      currentValue: 32,
      targetValue: 30,
      wearableSourceKey: "activeMinutes",
      iconName: "Activity",
      colorTheme: "emerald",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: false },
      recommendedPreset: "Kardiopulmonal Rumatan",
      clinicalRationale: "Latihan pernapasan dan keseimbangan pencegah jatuh.",
    },
    {
      id: "goal-sleep-05",
      category: "sleep",
      title: "Istirahat Restoratif",
      unit: "jam",
      currentValue: 6.8,
      targetValue: 6.5,
      wearableSourceKey: "sleepHours",
      iconName: "Moon",
      colorTheme: "indigo",
      milestonesTriggered: { half: true, near: true, completed: true, streakBonus: false },
      recommendedPreset: "Geriatri Terjadwal",
      clinicalRationale: "Membantu ritme tidur-bangun teratur dan kestabilan tensi.",
    },
  ],
};

export const SmartHealthGoals: React.FC<SmartHealthGoalsProps> = ({
  patient,
  onSyncWearable,
  isSyncing = false,
  onShowToast,
}) => {
  // Goals store mapped by memberId
  const [goalsMap, setGoalsMap] = useState<Record<string, SmartDailyGoal[]>>(() => {
    return DEFAULT_DAILY_GOALS_BY_ROLE;
  });

  // Target Settings Modal
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [editingGoals, setEditingGoals] = useState<SmartDailyGoal[]>([]);

  // AI Notifications & Coach states
  const [notifications, setNotifications] = useState<SmartGoalAiNotification[]>([
    {
      id: `ai-init-${patient.id}`,
      memberId: patient.id,
      memberName: patient.name,
      memberRole: patient.role,
      goalCategory: "steps",
      goalTitle: "Langkah Kaki Harian",
      percentage: 105,
      currentValue: 8450,
      targetValue: 8000,
      unit: "langkah",
      title: "🏆 Target Langkah Harian Tuntas 105%!",
      message: `Luar biasa, ${patient.name}! Anda telah menuntaskan target 8.000 langkah sebelum sore hari. Kerja sama sensor ${patient.connectedWearable.deviceName} mendeteksi efisiensi kardiometabolik yang sangat prima hari ini.`,
      aiCoachTone: "Celebratory",
      physiologicalImpact: "Meningkatkan sirkulasi mikrovaskular perifer dan menurunkan tekanan darah sistolik rata-rata 4-6 mmHg.",
      actionableStep: "Lakukan peregangan pendinginan betis selama 3 menit dan nikmati 1 gelas air kelapa atau air mineral hangat.",
      celebratoryEmoji: "🏆",
      sourceWearable: `${patient.connectedWearable.brand} ${patient.connectedWearable.deviceName}`,
      timestamp: "10 menit lalu",
      isRead: false,
      sourceAiModel: "Gemini 3.8 Flash Clinical Coach",
    }
  ]);

  const [activeFloatingBanner, setActiveFloatingBanner] = useState<SmartGoalAiNotification | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isGeneratingAiNotification, setIsGeneratingAiNotification] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active goals for current patient
  const currentGoals = goalsMap[patient.id] || DEFAULT_DAILY_GOALS_BY_ROLE["fam-01"] || [];

  // Synchronize goals with live vitals
  const synchronizedGoals = currentGoals.map(goal => {
    let liveVal = goal.currentValue;
    if (goal.category === "steps" && patient.vitals.steps) {
      liveVal = patient.vitals.steps;
    } else if (goal.category === "calories" && patient.vitals.activeCalories) {
      liveVal = patient.vitals.activeCalories;
    } else if (goal.category === "exercise" && patient.vitals.activeMinutes) {
      liveVal = patient.vitals.activeMinutes;
    } else if (goal.category === "sleep" && patient.vitals.sleepHours) {
      liveVal = patient.vitals.sleepHours;
    }
    return {
      ...goal,
      currentValue: liveVal,
    };
  });

  // Calculate overall day progress %
  const overallProgressPct = Math.round(
    synchronizedGoals.reduce((acc, g) => {
      const pct = Math.min(100, (g.currentValue / (g.targetValue || 1)) * 100);
      return acc + pct;
    }, 0) / synchronizedGoals.length
  );

  // Trigger AI Achievement Notification Generator
  const generateAiAchievementNotification = async (
    goal: SmartDailyGoal,
    simulatedPercent?: number,
    simulatedValue?: number
  ) => {
    setIsGeneratingAiNotification(true);
    const targetVal = goal.targetValue;
    const curVal = simulatedValue ?? goal.currentValue;
    const pct = simulatedPercent ?? Math.round((curVal / (targetVal || 1)) * 100);

    try {
      const response = await fetch("/api/ai/smart-goals-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          goal,
          milestonePercent: pct,
          currentValue: curVal,
          targetValue: targetVal,
          unit: goal.unit,
        }),
      });

      const resJson = await response.json();
      const aiData = resJson.data || {};

      const newNotif: SmartGoalAiNotification = {
        id: `ai-notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        memberId: patient.id,
        memberName: patient.name,
        memberRole: patient.role,
        goalCategory: goal.category,
        goalTitle: goal.title,
        percentage: pct,
        currentValue: curVal,
        targetValue: targetVal,
        unit: goal.unit,
        title: aiData.title || `${pct}% Target ${goal.title} Tercapai! 🎉`,
        message: aiData.message || `Selamat ${patient.name}! Anda telah mencapai ${pct}% dari sasaran harian ${goal.title}. Pertahankan ritme kebugaran ini!`,
        aiCoachTone: aiData.aiCoachTone || (pct >= 100 ? "Celebratory" : "Empowering"),
        physiologicalImpact: aiData.physiologicalImpact || "Mempercepat pembersihan laktat, menjaga tonus otot, dan meningkatkan energi harian.",
        actionableStep: aiData.actionableStep || "Hidrasi yang cukup dan lakukan pernapasan diafragma 2 menit.",
        celebratoryEmoji: aiData.celebratoryEmoji || (pct >= 100 ? "🏆" : "🔥"),
        sourceWearable: `${patient.connectedWearable.brand} ${patient.connectedWearable.deviceName}`,
        timestamp: "Baru saja",
        isRead: false,
        sourceAiModel: resJson.source || "Gemini 3.8 Flash Coach",
      };

      setNotifications(prev => [newNotif, ...prev]);
      setActiveFloatingBanner(newNotif);

      if (soundEnabled) {
        playCelebrationChime();
      }

      dispatchWebNotification(newNotif.title, newNotif.message);

      if (onShowToast) {
        onShowToast(`🤖 Notifikasi AI: ${newNotif.title}`, "success");
      }
    } catch (err) {
      console.warn("AI generation failed, applying local coach response:", err);
      // Fallback
      const fallbackNotif: SmartGoalAiNotification = {
        id: `ai-notif-fallback-${Date.now()}`,
        memberId: patient.id,
        memberName: patient.name,
        memberRole: patient.role,
        goalCategory: goal.category,
        goalTitle: goal.title,
        percentage: pct,
        currentValue: curVal,
        targetValue: targetVal,
        unit: goal.unit,
        title: pct >= 100 ? `🏆 Target ${goal.title} Tuntas 100%!` : `🔥 ${pct}% Capaian Target ${goal.title}!`,
        message: `Bagus sekali, ${patient.name}! Konsistensi Anda pada target harian ${goal.title} (${curVal} / ${targetVal} ${goal.unit}) memberikan fondasi kebugaran yang kokoh bagi seluruh keluarga.`,
        aiCoachTone: pct >= 100 ? "Celebratory" : "Empowering",
        physiologicalImpact: "Meningkatkan sensitivitas insulin dan memicu pelepasan endorfin restoratif.",
        actionableStep: "Minum segelas air putih dan lanjutkan dengan peregangan otot ringan.",
        celebratoryEmoji: pct >= 100 ? "🏆" : "⚡",
        sourceWearable: `${patient.connectedWearable.brand} ${patient.connectedWearable.deviceName}`,
        timestamp: "Baru saja",
        isRead: false,
        sourceAiModel: "GerSaKa Clinical Heuristics",
      };
      setNotifications(prev => [fallbackNotif, ...prev]);
      setActiveFloatingBanner(fallbackNotif);
      if (soundEnabled) playCelebrationChime();
    } finally {
      setIsGeneratingAiNotification(false);
    }
  };

  // Open Target Setting Modal
  const handleOpenSettings = () => {
    setEditingGoals(JSON.parse(JSON.stringify(synchronizedGoals)));
    setIsSettingModalOpen(true);
  };

  // Save Configured Targets
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalsMap(prev => ({
      ...prev,
      [patient.id]: editingGoals,
    }));
    setIsSettingModalOpen(false);
    if (onShowToast) {
      onShowToast(`Target harian Smart Health Goals untuk ${patient.name} berhasil diperbarui!`, "success");
    }
  };

  // Update target value in editor
  const handleUpdateTargetValue = (goalId: string, newTarget: number) => {
    setEditingGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, targetValue: Math.max(1, newTarget) } : g))
    );
  };

  // Apply Presets to editor
  const applyPreset = (presetType: "recovery" | "standard" | "performance" | "teen") => {
    setEditingGoals(prev =>
      prev.map(g => {
        if (presetType === "recovery") {
          // Lansia / Pemulihan
          if (g.category === "steps") return { ...g, targetValue: 5000, recommendedPreset: "Pemulihan Lembut" };
          if (g.category === "calories") return { ...g, targetValue: 300, recommendedPreset: "Metabolik Ringan" };
          if (g.category === "exercise") return { ...g, targetValue: 20, recommendedPreset: "Fisioterapi Sendi" };
          if (g.category === "sleep") return { ...g, targetValue: 7.5, recommendedPreset: "Sirkadian Teratur" };
        } else if (presetType === "standard") {
          // Standar Keluarga Sehat
          if (g.category === "steps") return { ...g, targetValue: 8500, recommendedPreset: "Standar Keluarga" };
          if (g.category === "calories") return { ...g, targetValue: 480, recommendedPreset: "Bakar Kalori Sehat" };
          if (g.category === "exercise") return { ...g, targetValue: 35, recommendedPreset: "Aerobik Harian" };
          if (g.category === "sleep") return { ...g, targetValue: 7.5, recommendedPreset: "Istirahat Restoratif" };
        } else if (presetType === "performance") {
          // Atletik / Performa
          if (g.category === "steps") return { ...g, targetValue: 12000, recommendedPreset: "Performa Atletik" };
          if (g.category === "calories") return { ...g, targetValue: 700, recommendedPreset: "Intensif Kardio" };
          if (g.category === "exercise") return { ...g, targetValue: 60, recommendedPreset: "Endurance Tinggi" };
          if (g.category === "sleep") return { ...g, targetValue: 8.0, recommendedPreset: "Deep Recovery" };
        } else if (presetType === "teen") {
          // Remaja / Pelajar
          if (g.category === "steps") return { ...g, targetValue: 7500, recommendedPreset: "Remaja Aktif" };
          if (g.category === "calories") return { ...g, targetValue: 400, recommendedPreset: "Tumbuh Kembang" };
          if (g.category === "exercise") return { ...g, targetValue: 40, recommendedPreset: "Relaksasi Postur" };
          if (g.category === "sleep") return { ...g, targetValue: 8.0, recommendedPreset: "Fokus Belajar" };
        }
        return g;
      })
    );
    if (onShowToast) {
      onShowToast(`Preset target cerdas berhasil dimuat ke dalam formulir!`, "info");
    }
  };

  // Helper icons
  const getGoalIcon = (category: SmartGoalCategory) => {
    switch (category) {
      case "steps":
        return <Flame className="w-4 h-4 text-amber-500" />;
      case "calories":
        return <Zap className="w-4 h-4 text-orange-500" />;
      case "exercise":
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case "sleep":
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case "hydration":
        return <Droplet className="w-4 h-4 text-cyan-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* HEADER WITH AI NOTIFICATION BADGE & SETTINGS TRIGGER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Smart Health Goals</span>
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3 text-emerald-600" />
                  <span>Notifikasi AI Berdaya</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target harian presisi <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.name}</span> dengan evaluasi biomekanik dan dorongan cerdas AI.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Notification Center Button */}
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            title="Buka Pusat Notifikasi Pencapaian AI"
          >
            <Bell className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Notifikasi AI</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (onShowToast) {
                onShowToast(!soundEnabled ? "Audio perayaan AI diaktifkan." : "Audio perayaan dinonaktifkan.", "info");
              }
            }}
            className="p-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title={soundEnabled ? "Matikan audio chime perayaan" : "Nyalakan audio chime perayaan"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Set Goals Modal Trigger */}
          <button
            onClick={handleOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Atur Target Harian</span>
          </button>

        </div>
      </div>

      {/* OVERALL DAILY PROGRESS SUMMARY STRIP */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Circular Progress Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${overallProgressPct}, 100`}
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
                Rangkuman Capaian Target Hari Ini
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {overallProgressPct >= 100 ? "Target Tuntas! 🏆" : overallProgressPct >= 80 ? "Mendekati Finish 🔥" : "Dalam Progres ⚡"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Terkoneksi sensor <strong className="text-slate-800 dark:text-slate-200">{patient.connectedWearable.deviceName}</strong> ({patient.connectedWearable.brand}).
            </p>
          </div>
        </div>

        {/* Quick AI Coaching Trigger Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const primaryGoal = synchronizedGoals[0];
              generateAiAchievementNotification(primaryGoal);
            }}
            disabled={isGeneratingAiNotification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isGeneratingAiNotification ? "animate-spin" : ""}`} />
            <span>{isGeneratingAiNotification ? "Menganalisis AI..." : "Minta Evaluasi AI Coach"}</span>
          </button>
        </div>
      </div>

      {/* 4 SMART GOALS INTERACTIVE PROGRESS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {synchronizedGoals.map(goal => {
          const percent = Math.min(130, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
          const isComplete = percent >= 100;
          const isNear = percent >= 80 && percent < 100;
          const remaining = Math.max(0, goal.targetValue - goal.currentValue);

          return (
            <div
              key={goal.id}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3 relative group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-xs">
                    {getGoalIcon(goal.category)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {goal.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Target: {goal.targetValue.toLocaleString("id-ID")} {goal.unit}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                    isComplete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : isNear
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {percent}%
                </span>
              </div>

              {/* Progress Value Numbers */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {goal.category === "sleep" ? goal.currentValue : goal.currentValue.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{goal.unit}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {isComplete ? "Melampaui target!" : `Sisa ${remaining.toLocaleString("id-ID")} ${goal.unit}`}
                </span>
              </div>

              {/* Progress Bar with Milestone Animation */}
              <div className="w-full h-3 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${
                    isComplete
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : isNear
                      ? "bg-gradient-to-r from-amber-500 to-orange-400"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>

              {/* Milestone & AI Trigger Footer */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate max-w-[140px]">
                  {goal.recommendedPreset}
                </span>

                <button
                  onClick={() => generateAiAchievementNotification(goal)}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  title="Generate notifikasi AI untuk capaian target ini"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Notifikasi AI</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* INTERACTIVE MILESTONE SIMULATION TESTING BAR (Allows testing the notification system immediately) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300">
            <strong>Uji Sistem Notifikasi AI:</strong> Simulasikan lonjakan data wearable untuk melihat respon perayaan AI secara langsung:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const g = synchronizedGoals.find(x => x.category === "steps") || synchronizedGoals[0];
              const simulatedVal = Math.round(g.targetValue * 0.85);
              generateAiAchievementNotification(g, 85, simulatedVal);
            }}
            disabled={isGeneratingAiNotification}
            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold text-[11px] transition-all cursor-pointer"
          >
            🔥 Capai 85%
          </button>

          <button
            onClick={() => {
              const g = synchronizedGoals.find(x => x.category === "steps") || synchronizedGoals[0];
              const simulatedVal = Math.round(g.targetValue * 1.05);
              generateAiAchievementNotification(g, 105, simulatedVal);
            }}
            disabled={isGeneratingAiNotification}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer"
          >
            🏆 Capai 100% Selesai!
          </button>
        </div>
      </div>

      {/* FLOATING CELEBRATORY AI ACHIEVEMENT BANNER */}
      <AnimatePresence>
        {activeFloatingBanner && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-6 right-6 max-w-md w-[calc(100vw-3rem)] z-50 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl border border-emerald-500/40 space-y-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeFloatingBanner.celebratoryEmoji}</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Notifikasi AI Pencapaian Target
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {activeFloatingBanner.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setActiveFloatingBanner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {activeFloatingBanner.message}
            </p>

            {/* Physiological impact box */}
            <div className="p-2.5 rounded-lg bg-white/10 text-[11px] space-y-1">
              <p className="text-emerald-300 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Dampak Fisiologis: {activeFloatingBanner.physiologicalImpact}</span>
              </p>
              <p className="text-slate-300">
                👉 <strong>Saran Lanjutan:</strong> {activeFloatingBanner.actionableStep}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Sensor: {activeFloatingBanner.sourceWearable}</span>
              <button
                onClick={() => {
                  setIsNotificationCenterOpen(true);
                  setActiveFloatingBanner(null);
                }}
                className="text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Riwayat AI</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: ATUR TARGET HARIAN (SET DAILY HEALTH GOALS) */}
      <AnimatePresence>
        {isSettingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Pengaturan Target Harian (Smart Health Goals)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Konfigurasi sasaran harian personal untuk <strong className="text-slate-800 dark:text-slate-200">{patient.name}</strong> ({patient.role}).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSettingModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveSettings} className="p-5 sm:p-6 space-y-6 overflow-y-auto">
                
                {/* Preset Cerdas Selector */}
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Pilih Preset Cerdas Rekomendasi Dokter LimoCity:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("recovery")}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/60"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-white">🌿 Pemulihan</p>
                      <p className="text-[10px] text-slate-500">Lansia / Ramah Sendi</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("standard")}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/60"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-white">⚡ Standar Sehat</p>
                      <p className="text-[10px] text-slate-500">Keluarga Bugar</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("performance")}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/60"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-white">🔥 Atletik</p>
                      <p className="text-[10px] text-slate-500">Performa Tinggi</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("teen")}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/60"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-white">🎯 Pelajar</p>
                      <p className="text-[10px] text-slate-500">Postur & Fokus</p>
                    </button>
                  </div>
                </div>

                {/* Individual Goal Inputs */}
                <div className="space-y-4">
                  {editingGoals.map(goal => {
                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getGoalIcon(goal.category)}
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {goal.title}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {goal.targetValue.toLocaleString("id-ID")} {goal.unit}
                          </span>
                        </div>

                        {/* Slider / Range */}
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={goal.category === "sleep" ? 4 : goal.category === "steps" ? 2000 : 10}
                            max={goal.category === "sleep" ? 10 : goal.category === "steps" ? 25000 : goal.category === "calories" ? 1500 : 120}
                            step={goal.category === "sleep" ? 0.5 : goal.category === "steps" ? 500 : 25}
                            value={goal.targetValue}
                            onChange={e => handleUpdateTargetValue(goal.id, Number(e.target.value))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                          <input
                            type="number"
                            value={goal.targetValue}
                            onChange={e => handleUpdateTargetValue(goal.id, Number(e.target.value))}
                            className="w-24 px-2 py-1 text-xs text-right font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {goal.clinicalRationale}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Simpan Target Harian
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: RIWAYAT NOTIFIKASI PENCAPAIAN AI (NOTIFICATION CENTER) */}
      <AnimatePresence>
        {isNotificationCenterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pusat Notifikasi Pencapaian AI
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {notifications.length} notifikasi tercatat untuk {patient.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNotificationCenterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Belum ada notifikasi pencapaian target. Capai target harian Anda untuk memicu perayaan AI!
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{notif.celebratoryEmoji}</span>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">
                              {notif.title}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              {notif.timestamp} • {notif.sourceAiModel || "AI Coach"}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {notif.percentage}%
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 text-[11px] text-emerald-800 dark:text-emerald-300">
                        <strong>Dampak Tubuh:</strong> {notif.physiologicalImpact}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        👉 <strong>Aksi Lanjutan:</strong> {notif.actionableStep}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    if (onShowToast) onShowToast("Semua notifikasi ditandai dibaca.", "info");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Tandai Semua Dibaca
                </button>

                <button
                  onClick={() => setIsNotificationCenterOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
