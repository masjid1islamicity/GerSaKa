import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FamilyMember, WeeklyHealthGoal, HealthGoalNotification } from "../types";
import { INITIAL_WEEKLY_HEALTH_GOALS } from "../data/mockData";
import { 
  Target, 
  Flame, 
  Moon, 
  Activity, 
  Zap, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Settings2, 
  RefreshCw, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  X, 
  Check, 
  AlertCircle,
  Watch,
  Battery,
  Bell,
  Sparkles,
  Share2
} from "lucide-react";
import { 
  CelebratoryPushBanner, 
  HealthGoalsNotificationDrawer, 
  playCelebrationChime, 
  dispatchWebNotification 
} from "./HealthGoalsNotificationSystem";

interface HealthGoalsTrackerProps {
  patient: FamilyMember;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const HealthGoalsTracker: React.FC<HealthGoalsTrackerProps> = ({
  patient,
  onSyncWearable,
  isSyncing = false,
  onShowToast
}) => {
  // Store goals by patient ID
  const [goalsMap, setGoalsMap] = useState<Record<string, WeeklyHealthGoal[]>>(() => {
    return INITIAL_WEEKLY_HEALTH_GOALS;
  });

  // Modal for editing goals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoals, setEditingGoals] = useState<WeeklyHealthGoal[]>([]);

  // Notification System States
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [activePushNotification, setActivePushNotification] = useState<HealthGoalNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [webPushPermission, setWebPushPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  // Initial celebratory notification entries
  const [notifications, setNotifications] = useState<HealthGoalNotification[]>([
    {
      id: "notif-init-01",
      memberId: "fam-01",
      memberName: "H. Hendra Kusuma",
      goalId: "goal-01-steps",
      goalTitle: "Langkah Kaki Mingguan",
      type: "approaching_goal",
      percentage: 90,
      currentValue: 50400,
      targetValue: 56000,
      unit: "langkah",
      title: "90% Target Langkah Kaki Tercapai!",
      message: "Sedikit lagi! Hendra telah mencapai 90% sasaran langkah mingguan. Hanya kurang 5.600 langkah lagi untuk rekor baru kebugaran!",
      celebratoryEmoji: "🔥",
      timestamp: "5 menit lalu",
      isRead: false,
      sourceWearable: "Apple Watch Ultra 2"
    }
  ]);

  // Keep track of alerted milestones in current session to prevent repetitive spam
  const alertedMilestonesRef = useRef<Set<string>>(new Set());

  // Current active goals for this patient
  const currentGoals = goalsMap[patient.id] || INITIAL_WEEKLY_HEALTH_GOALS["fam-01"] || [];

  // Recalculate or integrate with today's live wearable metrics when patient vitals change
  const synchronizedGoals = currentGoals.map(goal => {
    let updatedWeeklyValue = goal.currentWeeklyValue;

    if (goal.wearableMetricKey === "steps" && patient.vitals.steps) {
      const pastDaysSum = goal.dailyHistory.slice(0, 5).reduce((acc, d) => acc + d.value, 0);
      updatedWeeklyValue = pastDaysSum + patient.vitals.steps;
    } else if (goal.wearableMetricKey === "sleepHours" && patient.vitals.sleepHours) {
      const pastDaysSum = goal.dailyHistory.slice(0, 5).reduce((acc, d) => acc + d.value, 0);
      updatedWeeklyValue = Number((pastDaysSum + patient.vitals.sleepHours).toFixed(1));
    } else if (goal.wearableMetricKey === "activeCalories" && patient.vitals.activeCalories) {
      const pastDaysSum = goal.dailyHistory.slice(0, 5).reduce((acc, d) => acc + d.value, 0);
      updatedWeeklyValue = pastDaysSum + patient.vitals.activeCalories;
    }

    return {
      ...goal,
      currentWeeklyValue: updatedWeeklyValue
    };
  });

  // Core trigger for celebratory push alert
  const triggerCelebration = (goal: WeeklyHealthGoal, percentOverride?: number) => {
    const percent = percentOverride ?? Math.min(100, Math.round((goal.currentWeeklyValue / goal.targetWeeklyValue) * 100));
    const isComplete = percent >= 100;
    const isApproaching = percent >= 90 && percent < 100;

    let emoji = "🎉";
    let title = `${percent}% Target ${goal.title} Tercapai!`;
    let message = "";

    if (isComplete) {
      emoji = "🏆";
      title = `Target ${goal.title} Selesai 100%!`;
      message = `Selamat! ${patient.name} berhasil menyelesaikan 100% target mingguan ${goal.title} (${goal.currentWeeklyValue.toLocaleString("id-ID")} ${goal.unit}). Disiplin dan kesehatan Anda berada di level prima!`;
    } else if (isApproaching) {
      emoji = "🔥";
      title = `90% Target ${goal.title} Tercapai!`;
      const remaining = Math.max(0, goal.targetWeeklyValue - goal.currentWeeklyValue);
      message = `Sedikit lagi! ${patient.name} telah mencapai ${percent}% dari sasaran ${goal.title} (${goal.currentWeeklyValue.toLocaleString("id-ID")} / ${goal.targetWeeklyValue.toLocaleString("id-ID")} ${goal.unit}). Hanya kurang ${remaining.toLocaleString("id-ID")} ${goal.unit} lagi untuk rekor mingguan baru!`;
    } else {
      emoji = "✨";
      title = `Pencapaian Target ${goal.title} (${percent}%)`;
      message = `${patient.name} kini telah mencapai ${goal.currentWeeklyValue.toLocaleString("id-ID")} dari target ${goal.targetWeeklyValue.toLocaleString("id-ID")} ${goal.unit}. Terus pertahankan ritme sehat ini!`;
    }

    const newNotif: HealthGoalNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      memberId: patient.id,
      memberName: patient.name,
      goalId: goal.id,
      goalTitle: goal.title,
      type: isComplete ? "goal_achieved" : "approaching_goal",
      percentage: percent,
      currentValue: goal.currentWeeklyValue,
      targetValue: goal.targetWeeklyValue,
      unit: goal.unit,
      title,
      message,
      celebratoryEmoji: emoji,
      timestamp: "Baru saja",
      isRead: false,
      sourceWearable: `${patient.connectedWearable.brand} ${patient.connectedWearable.deviceName}`
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActivePushNotification(newNotif);

    if (soundEnabled) {
      playCelebrationChime();
    }

    dispatchWebNotification(title, message);

    if (onShowToast) {
      onShowToast(`🎉 Notifikasi Target: ${title}`, "success");
    }
  };

  // Test notification trigger (e.g. 90% steps goal simulation)
  const handleTriggerTestNotification = () => {
    const stepsGoal = synchronizedGoals.find(g => g.category === "steps") || synchronizedGoals[0];
    if (stepsGoal) {
      const simulatedCurrent = Math.round(stepsGoal.targetWeeklyValue * 0.90);
      const testGoal: WeeklyHealthGoal = {
        ...stepsGoal,
        currentWeeklyValue: simulatedCurrent
      };
      triggerCelebration(testGoal, 90);
    }
  };

  // Request native web push notification permission
  const handleRequestWebPush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      if (onShowToast) onShowToast("Peramban ini tidak mendukung Web Push Notifications.", "warning");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setWebPushPermission(permission);
      if (permission === "granted") {
        if (onShowToast) onShowToast("Notifikasi Push peramban diaktifkan! Anda akan menerima alert saat target 90% tercapai.", "success");
        dispatchWebNotification("GerSaKa Health Alert", "Notifikasi push target kesehatan aktif! Kami akan mengingatkan saat Anda mendekati target 90%.");
      } else {
        if (onShowToast) onShowToast("Izin notifikasi peramban ditolak.", "warning");
      }
    } catch (err) {
      console.warn("Permission error:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (onShowToast) onShowToast("Semua notifikasi target ditandai sudah dibaca.", "info");
  };

  // Clear all notifications
  const handleClearNotifications = () => {
    setNotifications([]);
    if (onShowToast) onShowToast("Riwayat notifikasi target dibersihkan.", "info");
  };

  // Open modal with clone of current goals
  const handleOpenEditModal = () => {
    setEditingGoals(JSON.parse(JSON.stringify(synchronizedGoals)));
    setIsEditModalOpen(true);
  };

  // Save updated goals
  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalsMap(prev => ({
      ...prev,
      [patient.id]: editingGoals
    }));
    setIsEditModalOpen(false);
    if (onShowToast) {
      onShowToast(`Target mingguan untuk ${patient.name} berhasil diperbarui dan diselaraskan dengan sensor wearable!`, "success");
    }
  };

  // Update specific target value in editor
  const handleUpdateTargetValue = (goalId: string, newValue: number) => {
    setEditingGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, targetWeeklyValue: Math.max(1, newValue) };
      }
      return g;
    }));
  };

  // Category Icon & styling helper
  const getGoalStyle = (category: WeeklyHealthGoal["category"]) => {
    switch (category) {
      case "steps":
        return {
          icon: Flame,
          gradient: "from-amber-500 to-orange-500",
          barColor: "bg-gradient-to-r from-amber-500 to-orange-500",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          textColor: "text-amber-600 dark:text-amber-400",
          borderColor: "border-amber-200 dark:border-amber-800"
        };
      case "sleep":
        return {
          icon: Moon,
          gradient: "from-indigo-500 to-purple-500",
          barColor: "bg-gradient-to-r from-indigo-500 to-purple-500",
          bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
          textColor: "text-indigo-600 dark:text-indigo-400",
          borderColor: "border-indigo-200 dark:border-indigo-800"
        };
      case "calories":
        return {
          icon: Zap,
          gradient: "from-rose-500 to-red-500",
          barColor: "bg-gradient-to-r from-rose-500 to-red-500",
          bgColor: "bg-rose-50 dark:bg-rose-950/30",
          textColor: "text-rose-600 dark:text-rose-400",
          borderColor: "border-rose-200 dark:border-rose-800"
        };
      case "therapy":
        return {
          icon: Heart,
          gradient: "from-teal-500 to-emerald-500",
          barColor: "bg-gradient-to-r from-teal-500 to-emerald-500",
          bgColor: "bg-teal-50 dark:bg-teal-950/30",
          textColor: "text-teal-600 dark:text-teal-400",
          borderColor: "border-teal-200 dark:border-teal-800"
        };
      default:
        return {
          icon: Activity,
          gradient: "from-blue-500 to-cyan-500",
          barColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
          textColor: "text-blue-600 dark:text-blue-400",
          borderColor: "border-blue-200 dark:border-blue-800"
        };
    }
  };

  // Overall weekly goals summary calculation
  const totalGoals = synchronizedGoals.length;
  const onTrackGoals = synchronizedGoals.filter(g => (g.currentWeeklyValue / g.targetWeeklyValue) >= 0.7).length;
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div id="health-goals-tracker-module" className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative">
      
      {/* 1. Celebratory Floating Push Notification Banner */}
      <CelebratoryPushBanner
        notification={activePushNotification}
        onClose={() => setActivePushNotification(null)}
        onOpenCenter={() => setIsNotificationDrawerOpen(true)}
        onShowToast={onShowToast}
      />

      {/* Module Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0 mt-0.5">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pelacakan Health Goals Mingguan</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  {onTrackGoals} dari {totalGoals} Target Sesuai Jadwal
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Target personal</span>
              <strong className="text-slate-700 dark:text-slate-200">{patient.name}</strong>
              <span>• Notifikasi otomatis saat capaian 90% & 100%</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                <Watch className="w-3 h-3 text-emerald-500" />
                {patient.connectedWearable.deviceName}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls: Notification Center, Edit Goals & Sync Wearable */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Notification Center Trigger */}
          <button
            id="btn-goal-notifications"
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Pusat Notifikasi & Alarm Pencapaian Target"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Notifikasi</span>
            {unreadNotifCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Quick 90% Push Test Button */}
          <button
            id="btn-quick-test-notif"
            onClick={handleTriggerTestNotification}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
            title="Uji coba pengiriman push message perayaan 90%"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Uji Notif 90%</span>
          </button>

          {/* Edit Goals Trigger */}
          <button
            id="btn-edit-health-goals"
            onClick={handleOpenEditModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Ubah target langkah, tidur, atau kalori mingguan"
          >
            <Settings2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Atur Target</span>
          </button>

          {/* Wearable Sync Button */}
          {onSyncWearable && (
            <button
              id="btn-sync-goals-wearable"
              onClick={onSyncWearable}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              title="Perbarui data telemetri wearable secara langsung"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menyelaraskan..." : "Sinkron Wearable"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Health Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {synchronizedGoals.map((goal, idx) => {
          const style = getGoalStyle(goal.category);
          const IconComp = style.icon;
          const percent = Math.min(100, Math.round((goal.currentWeeklyValue / goal.targetWeeklyValue) * 100));
          const isAchieved = goal.currentWeeklyValue >= goal.targetWeeklyValue;
          const isApproaching90 = percent >= 90 && !isAchieved;
          const remaining = Math.max(0, goal.targetWeeklyValue - goal.currentWeeklyValue);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all relative ${
                isAchieved
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs"
                  : isApproaching90
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-xs"
                  : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
              }`}
            >
              {/* Card Top: Icon, Title & Percentage Pill */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${style.bgColor} ${style.borderColor} border flex items-center justify-center ${style.textColor} shrink-0`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span>{goal.title}</span>
                      {isAchieved ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded-full border border-emerald-300/60">
                          <Check className="w-3 h-3" />
                          100% Tercapai
                        </span>
                      ) : isApproaching90 ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.2 rounded-full border border-amber-300/60 animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          90% Tercapai!
                        </span>
                      ) : null}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Target: {goal.targetWeeklyValue.toLocaleString("id-ID")} {goal.unit} / minggu
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-base font-extrabold ${
                    isAchieved 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : isApproaching90 
                      ? "text-amber-600 dark:text-amber-400" 
                      : "text-slate-900 dark:text-white"
                  }`}>
                    {percent}%
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {isAchieved ? "Goal Selesai" : `Sisa ${remaining.toLocaleString("id-ID")} ${goal.unit}`}
                  </p>
                </div>
              </div>

              {/* Numerical Achievement & Live Sensor Source */}
              <div className="flex items-baseline justify-between mb-2 text-xs">
                <div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {goal.currentWeeklyValue.toLocaleString("id-ID")}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">
                    / {goal.targetWeeklyValue.toLocaleString("id-ID")} {goal.unit}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerCelebration(goal, isApproaching90 ? 90 : isAchieved ? 100 : percent)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:underline cursor-pointer"
                    title="Kirim atau lihat push alert perayaan untuk sasaran ini"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isApproaching90 ? "Push Alert 90%" : isAchieved ? "Push Alert 100%" : "Kirim Alert"}</span>
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Watch className="w-3 h-3 text-emerald-500" />
                    <span>{patient.connectedWearable.brand}</span>
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar with Glow if >= 90% */}
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isAchieved 
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 shadow-sm shadow-emerald-500/50" 
                      : isApproaching90 
                      ? "bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 shadow-sm shadow-amber-500/50" 
                      : style.barColor
                  }`}
                />
              </div>

              {/* Celebratory Milestone Alert Ribbon if >= 90% */}
              {isApproaching90 && (
                <div className="mt-2.5 p-2 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🔥</span>
                    <span><strong>Hebat! 90% Tercapai:</strong> Hanya kurang {remaining.toLocaleString("id-ID")} {goal.unit} lagi!</span>
                  </div>
                  <button
                    onClick={() => triggerCelebration(goal, 90)}
                    className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Buka Notifikasi
                  </button>
                </div>
              )}

              {/* 7-Day Weekly Breakdown Sparks */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Progres Harian (Sen - Min)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {goal.dailyHistory.filter(d => d.achieved).length}/7 Hari Target Terpenuhi
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {goal.dailyHistory.map((d, dIdx) => (
                    <div 
                      key={dIdx}
                      className={`text-center py-1.5 px-1 rounded-lg border text-[10px] font-semibold transition-all ${
                        d.achieved
                          ? "bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                          : d.value > 0
                          ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          : "bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}
                      title={`${d.day}: ${d.value.toLocaleString("id-ID")} ${goal.unit} (${d.achieved ? "Tercapai" : "Belum"})`}
                    >
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {d.day}
                      </span>
                      <span className="block mt-0.5 truncate">
                        {d.value > 0 ? (d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value) : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Doctor Recommendation Footer */}
              <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 leading-normal flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">{goal.recommendedByDoctor}:</strong>{" "}
                  <span>{goal.clinicalNote}</span>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* 2. Target Setting / Editing Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div 
            id="modal-edit-health-goals-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              id="modal-edit-health-goals"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Tetapkan Target Mingguan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sesuaikan ambang batas mingguan untuk {patient.name} ({patient.role})
                    </p>
                  </div>
                </div>

                <button
                  id="btn-close-edit-goals-modal"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveGoals} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  Target ini disinkronkan otomatis dengan sensor wearable (<strong>{patient.connectedWearable.deviceName}</strong>). Sistem notifikasi akan membunyikan alarm dan mengirim push alert saat capaian mencapai 90% atau 100%.
                </p>

                <div className="space-y-4">
                  {editingGoals.map((g) => {
                    const style = getGoalStyle(g.category);
                    const IconComp = style.icon;

                    return (
                      <div 
                        key={g.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg ${style.bgColor} flex items-center justify-center ${style.textColor}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {g.title}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {g.targetWeeklyValue.toLocaleString("id-ID")} {g.unit} / minggu
                          </span>
                        </div>

                        {/* Input & Quick Presets */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={g.targetWeeklyValue}
                            onChange={(e) => handleUpdateTargetValue(g.id, Number(e.target.value))}
                            step={g.category === "sleep" ? "0.5" : g.category === "therapy" ? "1" : "500"}
                            min={g.category === "therapy" ? "1" : "10"}
                            className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                          />
                          <span className="text-xs text-slate-400 shrink-0 font-medium">{g.unit}</span>
                        </div>

                        {/* Quick Presets for Steps or Sleep */}
                        {g.category === "steps" && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-400 font-semibold">Preset Cepat:</span>
                            {[35000, 42000, 56000, 70000, 84000].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleUpdateTargetValue(g.id, val)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                  g.targetWeeklyValue === val
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                }`}
                              >
                                {(val / 1000)}k/mgg
                              </button>
                            ))}
                          </div>
                        )}

                        {g.category === "sleep" && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-400 font-semibold">Preset Cepat:</span>
                            {[42.0, 49.0, 52.5, 56.0].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleUpdateTargetValue(g.id, val)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                  g.targetWeeklyValue === val
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                }`}
                              >
                                {val} jam ({(val / 7).toFixed(1)}j/hari)
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-save-health-goals"
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan & Sinkronkan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Notification Center Drawer / Modal */}
      <HealthGoalsNotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearNotifications={handleClearNotifications}
        onTriggerTestNotification={handleTriggerTestNotification}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled(prev => !prev);
          if (onShowToast) {
            onShowToast(`Suara chime perayaan ${!soundEnabled ? "diaktifkan" : "dimatikan"}.`, "info");
          }
        }}
        webPushPermission={webPushPermission}
        onRequestWebPush={handleRequestWebPush}
      />

    </div>
  );
};
