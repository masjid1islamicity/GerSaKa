import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FamilyMember, HealthGoalNotification } from "../types";
import { 
  Bell, 
  Sparkles, 
  X, 
  Check, 
  Watch, 
  Share2, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Award, 
  Trash2, 
  CheckCheck,
  Send,
  Flame,
  Moon,
  Zap,
  Heart,
  TrendingUp,
  Droplet,
  Footprints,
  AlertTriangle,
  Clock,
  RefreshCw,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Info
} from "lucide-react";

// Storage Keys
export const STORAGE_KEY_SETTINGS = "gersaka_health_goals_settings_v1";
export const STORAGE_KEY_PROGRESS = "gersaka_health_goals_progress_v1";
export const STORAGE_KEY_NOTIF_PREFS = "gersaka_health_goals_notif_prefs_v1";
export const STORAGE_KEY_SCHEDULED_NOTIFS = "gersaka_health_goals_reminder_history_v1";
export const STORAGE_KEY_LAST_SCHEDULED_TRIGGER = "gersaka_health_goals_last_slot_trigger_v1";

// Default goal settings if none saved
export const DEFAULT_GOAL_SETTINGS = {
  "fam-01": { waterTargetMl: 2500, stepsTarget: 8000, sleepTargetHours: 7.5 },
  "fam-02": { waterTargetMl: 2200, stepsTarget: 7500, sleepTargetHours: 8.0 },
  "fam-03": { waterTargetMl: 2800, stepsTarget: 10000, sleepTargetHours: 8.0 },
  "fam-04": { waterTargetMl: 2000, stepsTarget: 7000, sleepTargetHours: 8.5 },
  "fam-05": { waterTargetMl: 1900, stepsTarget: 5000, sleepTargetHours: 7.5 },
};

export interface HealthGoalsReminderAlert {
  id: string;
  timeSlot: "10:00" | "20:00" | "manual";
  slotLabel: string; // e.g. "Pengingat Pukul 10:00 Pagi" | "Evaluasi Pukul 20:00 Malam"
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberRole: string;
  overallProgressPct: number;
  waterPct: number;
  stepsPct: number;
  sleepPct: number;
  waterCurrentMl: number;
  waterTargetMl: number;
  stepsCurrent: number;
  stepsTarget: number;
  sleepCurrentHours: number;
  sleepTargetHours: number;
  laggingGoals: Array<{
    key: "water" | "steps" | "sleep";
    label: string;
    pct: number;
    currentStr: string;
    targetStr: string;
    deficitStr: string;
  }>;
  title: string;
  message: string;
  clinicalAdvice: string;
  timestamp: string;
  isRead: boolean;
  isSimulated?: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  notifyAt10AM: boolean;
  notifyAt8PM: boolean;
  thresholdPct: number; // default 50%
}

export const DEFAULT_NOTIF_PREFS: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  notifyAt10AM: true,
  notifyAt8PM: true,
  thresholdPct: 50,
};

// ============================================================================
// AUDIO CHIMES (WEB AUDIO API SYNTHESIZER - NO EXTERNAL ASSETS NEEDED)
// ============================================================================

// Joyful ascending chime for 100% goal achievements
export const playCelebrationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Joyful ascending arpeggio (C5, E5, G5, C6) with warm decay
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + index * 0.09);
      
      gain.gain.setValueAtTime(0, now + index * 0.09);
      gain.gain.linearRampToValueAtTime(0.22, now + index * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.38);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.09);
      osc.stop(now + index * 0.09 + 0.42);
    });
  } catch (e) {
    console.warn("Celebration audio chime skipped:", e);
  }
};

// Warm 2-tone gentle chime for 10 AM / 8 PM progress check reminders
export const playReminderChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Warm chime: F5 (698.46Hz) followed by A5 (880Hz) and soft overtone
    const tones = [
      { freq: 698.46, delay: 0, duration: 0.35, gain: 0.18 },
      { freq: 880.00, delay: 0.14, duration: 0.45, gain: 0.22 },
      { freq: 1046.50, delay: 0.28, duration: 0.55, gain: 0.15 }
    ];

    tones.forEach(({ freq, delay, duration, gain: peakGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(peakGain, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.05);
    });
  } catch (e) {
    console.warn("Reminder chime skipped:", e);
  }
};

// ============================================================================
// NATIVE BROWSER WEB NOTIFICATION HELPER
// ============================================================================

export const dispatchWebNotification = async (title: string, body: string, tag?: string) => {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  try {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: tag || "gersaka-health-goals-reminder",
      });
      return true;
    }
  } catch (e) {
    console.warn("Native web notification failed or restricted by browser:", e);
  }
  return false;
};

export const requestWebNotificationPermission = async (): Promise<NotificationPermission | "unsupported"> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const res = await Notification.requestPermission();
    return res;
  } catch {
    return "denied";
  }
};

// ============================================================================
// HEALTH GOAL PROGRESS EVALUATION ENGINE
// ============================================================================

export interface CalculatedMemberGoals {
  memberId: string;
  name: string;
  role: string;
  avatarUrl: string;
  overallPct: number;
  waterPct: number;
  stepsPct: number;
  sleepPct: number;
  waterCurrentMl: number;
  waterTargetMl: number;
  stepsCurrent: number;
  stepsTarget: number;
  sleepCurrentHours: number;
  sleepTargetHours: number;
  isBelow50: boolean;
  laggingGoals: Array<{
    key: "water" | "steps" | "sleep";
    label: string;
    pct: number;
    currentStr: string;
    targetStr: string;
    deficitStr: string;
  }>;
}

export const evaluateMemberHealthGoalsProgress = (
  memberId: string,
  membersList?: FamilyMember[]
): CalculatedMemberGoals => {
  let settings = DEFAULT_GOAL_SETTINGS[memberId as keyof typeof DEFAULT_GOAL_SETTINGS] || {
    waterTargetMl: 2500,
    stepsTarget: 8000,
    sleepTargetHours: 7.5
  };

  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed[memberId]) settings = parsed[memberId];
    }
  } catch {
    // fallback
  }

  let progress = {
    waterCurrentMl: 1200,
    stepsCurrent: 3500,
    sleepCurrentHours: 6.0,
    lastUpdatedTime: "10:00",
    streakDays: 4
  };

  try {
    const savedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      if (parsed[memberId]) progress = parsed[memberId];
    }
  } catch {
    // fallback
  }

  const memberObj = membersList?.find(m => m.id === memberId);
  const name = memberObj?.name || (memberId === "fam-01" ? "Hendra Wijaya" : "Anggota Keluarga");
  const role = memberObj?.role || "Keluarga";
  const avatarUrl = memberObj?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

  const waterPct = Math.min(100, Math.round((progress.waterCurrentMl / settings.waterTargetMl) * 100));
  const stepsPct = Math.min(100, Math.round((progress.stepsCurrent / settings.stepsTarget) * 100));
  const sleepPct = Math.min(100, Math.round((progress.sleepCurrentHours / settings.sleepTargetHours) * 100));
  const overallPct = Math.round((waterPct + stepsPct + sleepPct) / 3);

  const laggingGoals: Array<{
    key: "water" | "steps" | "sleep";
    label: string;
    pct: number;
    currentStr: string;
    targetStr: string;
    deficitStr: string;
  }> = [];

  if (waterPct < 50) {
    laggingGoals.push({
      key: "water",
      label: "Asupan Air",
      pct: waterPct,
      currentStr: `${progress.waterCurrentMl.toLocaleString("id-ID")} ml`,
      targetStr: `${settings.waterTargetMl.toLocaleString("id-ID")} ml`,
      deficitStr: `Kurang ${(settings.waterTargetMl - progress.waterCurrentMl).toLocaleString("id-ID")} ml`
    });
  }

  if (stepsPct < 50) {
    laggingGoals.push({
      key: "steps",
      label: "Langkah Kaki",
      pct: stepsPct,
      currentStr: `${progress.stepsCurrent.toLocaleString("id-ID")} langkah`,
      targetStr: `${settings.stepsTarget.toLocaleString("id-ID")} langkah`,
      deficitStr: `Kurang ${(settings.stepsTarget - progress.stepsCurrent).toLocaleString("id-ID")} langkah`
    });
  }

  if (sleepPct < 50) {
    laggingGoals.push({
      key: "sleep",
      label: "Tidur Restoratif",
      pct: sleepPct,
      currentStr: `${progress.sleepCurrentHours} jam`,
      targetStr: `${settings.sleepTargetHours} jam`,
      deficitStr: `Kurang ${(settings.sleepTargetHours - progress.sleepCurrentHours).toFixed(1)} jam`
    });
  }

  return {
    memberId,
    name,
    role,
    avatarUrl,
    overallPct,
    waterPct,
    stepsPct,
    sleepPct,
    waterCurrentMl: progress.waterCurrentMl,
    waterTargetMl: settings.waterTargetMl,
    stepsCurrent: progress.stepsCurrent,
    stepsTarget: settings.stepsTarget,
    sleepCurrentHours: progress.sleepCurrentHours,
    sleepTargetHours: settings.sleepTargetHours,
    isBelow50: overallPct < 50,
    laggingGoals
  };
};

// Generates the formal clinical and motivational text for 10 AM or 8 PM reminders
export const buildHealthGoalsReminderPayload = (
  timeSlot: "10:00" | "20:00" | "manual",
  evalData: CalculatedMemberGoals,
  isSimulated = false
): HealthGoalsReminderAlert => {
  const isMorning = timeSlot === "10:00" || (timeSlot === "manual" && new Date().getHours() < 15);
  const slotLabel = isMorning ? "Pengingat Pukul 10:00 Pagi" : "Evaluasi Pukul 20:00 Malam";

  let title = "";
  let message = "";
  let clinicalAdvice = "";

  if (isMorning) {
    title = `⏰ Pengingat Jam 10:00 Pagi: Target Kesehatan ${evalData.name} Baru ${evalData.overallPct}%`;
    message = `Waktu beraktivitas pagi sedang berjalan prima, namun pencapaian target harian (${evalData.name}) masih di bawah 50%. Segera penuhi hidrasi dan langkah aktif Anda!`;
    clinicalAdvice = "Rekomendasi Dokter Rumah Sehat LimoCity: Minum minimal 1-2 gelas air hangat sekarang untuk memperlancar sirkulasi darah dan lakukan peregangan/jalan ringan 500 langkah.";
  } else {
    title = `🌙 Evaluasi Jam 20:00 Malam: Target Kesehatan ${evalData.name} Masih ${evalData.overallPct}%`;
    message = `Menjelang rehat malam, kepatuhan sasaran harian (${evalData.name}) belum mencapai 50%. Penuhi sisa hidrasi tanpa berlebihan dan persiapkan istirahat restoratif sesuai sunnah.`;
    clinicalAdvice = "Rekomendasi Dokter Rumah Sehat LimoCity: Minum segelas air mineral sebelum tidur, redupkan pencahayaan gawai 30 menit sebelum tidur, dan pastikan tidur cukup 7-8 jam untuk perbaikan sel endotel.";
  }

  return {
    id: `notif-goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timeSlot,
    slotLabel,
    memberId: evalData.memberId,
    memberName: evalData.name,
    memberAvatar: evalData.avatarUrl,
    memberRole: evalData.role,
    overallProgressPct: evalData.overallPct,
    waterPct: evalData.waterPct,
    stepsPct: evalData.stepsPct,
    sleepPct: evalData.sleepPct,
    waterCurrentMl: evalData.waterCurrentMl,
    waterTargetMl: evalData.waterTargetMl,
    stepsCurrent: evalData.stepsCurrent,
    stepsTarget: evalData.stepsTarget,
    sleepCurrentHours: evalData.sleepCurrentHours,
    sleepTargetHours: evalData.sleepTargetHours,
    laggingGoals: evalData.laggingGoals,
    title,
    message,
    clinicalAdvice,
    timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    isRead: false,
    isSimulated
  };
};

// ============================================================================
// 1. FLOATING IN-APP PUSH NOTIFICATION BANNER (REMINDER AT 10 AM & 8 PM)
// ============================================================================

interface HealthGoalsReminderBannerProps {
  alert: HealthGoalsReminderAlert | null;
  onDismiss: () => void;
  onNavigateToGoals: (memberId: string) => void;
  onQuickAddWater?: (memberId: string, amountMl: number) => void;
  onOpenCenter?: () => void;
}

export const HealthGoalsReminderBanner: React.FC<HealthGoalsReminderBannerProps> = ({
  alert,
  onDismiss,
  onNavigateToGoals,
  onQuickAddWater,
  onOpenCenter
}) => {
  if (!alert) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="health-goals-reminder-banner"
        initial={{ opacity: 0, y: -45, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -35, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl shadow-2xl rounded-2xl overflow-hidden border border-amber-400/80 dark:border-amber-500/70 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      >
        {/* Animated Top Pulse Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 animate-pulse" />

        <div className="p-4 sm:p-5">
          {/* Top Header Tag: Schedule slot & Close */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{alert.slotLabel} • Progres &lt; 50%</span>
              {alert.isSimulated && (
                <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 px-1.5 rounded-sm ml-1 font-mono">
                  Uji Coba
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                {alert.timestamp} WIB
              </span>
              <button
                id="btn-close-goals-reminder"
                type="button"
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="flex items-start gap-3.5">
            {/* Visual Progress Avatar / Icon */}
            <div className="relative shrink-0">
              <img 
                src={alert.memberAvatar} 
                alt={alert.memberName} 
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-amber-400 dark:ring-amber-500 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                !
              </div>
            </div>

            {/* Notification Text & Breakdown */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                    {alert.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black font-mono bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                    {alert.overallProgressPct}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {alert.message}
                </p>
              </div>

              {/* Mini Goal Deficit Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                <div className={`p-2 rounded-xl border text-[11px] ${
                  alert.waterPct < 50 
                    ? "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200" 
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-cyan-600" />
                      Air
                    </span>
                    <span className="font-mono">{alert.waterPct}%</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5 truncate">
                    {alert.waterCurrentMl} / {alert.waterTargetMl} ml
                  </div>
                </div>

                <div className={`p-2 rounded-xl border text-[11px] ${
                  alert.stepsPct < 50 
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200" 
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-emerald-600" />
                      Langkah
                    </span>
                    <span className="font-mono">{alert.stepsPct}%</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5 truncate">
                    {alert.stepsCurrent} / {alert.stepsTarget}
                  </div>
                </div>

                <div className={`p-2 rounded-xl border text-[11px] ${
                  alert.sleepPct < 50 
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200" 
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-600" />
                      Tidur
                    </span>
                    <span className="font-mono">{alert.sleepPct}%</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5 truncate">
                    {alert.sleepCurrentHours} / {alert.sleepTargetHours} jam
                  </div>
                </div>
              </div>

              {/* Clinical Doctor Advice */}
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">{alert.clinicalAdvice}</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {onQuickAddWater && alert.waterPct < 50 && (
                <button
                  type="button"
                  onClick={() => onQuickAddWater(alert.memberId, 250)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <Droplet className="w-3 h-3 text-cyan-600" />
                  <span>+250 ml Air</span>
                </button>
              )}

              {onOpenCenter && (
                <button
                  type="button"
                  onClick={onOpenCenter}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Pusat Pengingat
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Nanti
              </button>

              <button
                id="btn-action-complete-goals"
                type="button"
                onClick={() => {
                  onNavigateToGoals(alert.memberId);
                  onDismiss();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Cek & Lengkapi Target</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// 2. CELEBRATORY PUSH BANNER (PRESERVED FOR BACKWARD COMPATIBILITY)
// ============================================================================

interface CelebratoryPushBannerProps {
  notification: HealthGoalNotification | null;
  onClose: () => void;
  onOpenCenter?: () => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const CelebratoryPushBanner: React.FC<CelebratoryPushBannerProps> = ({
  notification,
  onClose,
  onOpenCenter,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!notification) return null;

  const handleShare = () => {
    const text = `🎉 *Prestasi Kebugaran GerSaKa LimoCity!*\n` +
      `👤 *Anggota Keluarga:* ${notification.memberName}\n` +
      `🔥 *Capaian:* ${notification.title}\n` +
      `📊 *Progres:* ${notification.percentage}% (${notification.currentValue.toLocaleString("id-ID")} / ${notification.targetValue.toLocaleString("id-ID")} ${notification.unit})\n` +
      `💬 *Pesan:* ${notification.message}\n` +
      `⌚ *Sensor:* ${notification.sourceWearable}\n\n` +
      `_Ayo terus bergerak menuju keluarga bugar dan sehat!_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onShowToast) {
      onShowToast("Pesan ucapan selamat berhasil disalin! Siap dibagikan ke WhatsApp Keluarga.", "success");
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        id="celebratory-push-banner"
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg shadow-2xl rounded-2xl overflow-hidden border border-emerald-400/80 dark:border-emerald-500/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse" />

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              <Watch className="w-3 h-3 text-emerald-600" />
              <span>Notifikasi Push Sensor • {notification.sourceWearable}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">
                {notification.timestamp}
              </span>
              <button
                id="btn-close-push-banner"
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              {notification.celebratoryEmoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {notification.title}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {notification.percentage}%
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {notification.message}
              </p>

              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Progres Terkini</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {notification.currentValue.toLocaleString("id-ID")} / {notification.targetValue.toLocaleString("id-ID")} {notification.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, notification.percentage)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <button
              id="btn-banner-share"
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Kirim Semangat ke WhatsApp"}</span>
            </button>

            <div className="flex items-center gap-2">
              {onOpenCenter && (
                <button
                  id="btn-banner-open-center"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCenter();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                >
                  Pusat Notifikasi
                </button>
              )}
              <button
                id="btn-banner-dismiss"
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// 3. SCHEDULED NOTIFICATION DRAWER / SETTINGS MODAL
// ============================================================================

interface HealthGoalsNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: HealthGoalNotification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onTriggerTestNotification: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  webPushPermission: NotificationPermission | "unsupported";
  onRequestWebPush: () => void;
  
  // Extra props for scheduled reminders
  reminderHistory?: HealthGoalsReminderAlert[];
  onTriggerScheduledSimulation?: (slot: "10:00" | "20:00") => void;
  onClearReminderHistory?: () => void;
  onNavigateToGoals?: (memberId: string) => void;
}

export const HealthGoalsNotificationDrawer: React.FC<HealthGoalsNotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
  onTriggerTestNotification,
  soundEnabled,
  onToggleSound,
  webPushPermission,
  onRequestWebPush,
  reminderHistory = [],
  onTriggerScheduledSimulation,
  onClearReminderHistory,
  onNavigateToGoals
}) => {
  const [activeTab, setActiveTab] = useState<"reminders" | "achievements">("reminders");

  if (!isOpen) return null;

  const unreadRemindersCount = reminderHistory.filter(r => !r.isRead).length;
  const unreadAchievementsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      <div 
        id="modal-notifications-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="modal-health-goals-notifications"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 dark:from-amber-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Pusat Notifikasi Health Goals</span>
                  {(unreadRemindersCount > 0 || unreadAchievementsCount > 0) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                      {unreadRemindersCount + unreadAchievementsCount} Baru
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pengingat otomatis Pukul 10:00 & 20:00 (&lt;50%) serta alarm capaian target
                </p>
              </div>
            </div>

            <button
              id="btn-close-notif-drawer"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Settings & Push Controls Bar */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              type="button"
              onClick={onToggleSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 cursor-pointer text-xs font-semibold transition-all"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>Chime: {soundEnabled ? "Aktif" : "Mati"}</span>
            </button>

            {/* Browser Native Push Permission */}
            <button
              id="btn-enable-web-push"
              type="button"
              onClick={onRequestWebPush}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                webPushPermission === "granted"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500"
              }`}
            >
              <Watch className="w-3.5 h-3.5 text-emerald-600" />
              <span>Push Browser: {webPushPermission === "granted" ? "Diizinkan ✓" : "Minta Izin"}</span>
            </button>

            <span className="text-[11px] text-slate-500 font-medium">
              Jadwal: <strong>10:00</strong> & <strong>20:00</strong> WIB
            </span>
          </div>

          {/* Tab Selector: Reminders vs Achievements */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40 px-4 pt-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("reminders")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reminders"
                  ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pengingat Jadwal Jam 10:00 & 20:00</span>
              {reminderHistory.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {reminderHistory.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("achievements")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === "achievements"
                  ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Capaian 90% & 100% Target</span>
              {notifications.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB CONTENT A: 10 AM / 8 PM REMINDERS (< 50% PROGRESS) */}
          {activeTab === "reminders" && (
            <div className="p-4 space-y-3 max-h-[52vh] overflow-y-auto">
              
              {/* Simulation Testing Buttons Strip */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Uji Coba Langsung Sistem Notifikasi:</span>
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-normal">
                    Ambang &lt; 50%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-simulate-10am-in-drawer"
                    type="button"
                    onClick={() => {
                      if (onTriggerScheduledSimulation) onTriggerScheduledSimulation("10:00");
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black shadow-xs hover:bg-amber-100/50 dark:hover:bg-amber-950/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>☀️ Uji Jam 10:00 Pagi</span>
                  </button>

                  <button
                    id="btn-simulate-8pm-in-drawer"
                    type="button"
                    onClick={() => {
                      if (onTriggerScheduledSimulation) onTriggerScheduledSimulation("20:00");
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black shadow-xs hover:bg-amber-100/50 dark:hover:bg-amber-950/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🌙 Uji Jam 20:00 Malam</span>
                  </button>
                </div>
              </div>

              {/* List of reminder logs */}
              {reminderHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-amber-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Belum ada riwayat pengingat jadwal yang terpicu.
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Sistem otomatis mengecek progres setiap hari pukul <strong>10:00</strong> dan <strong>20:00 WIB</strong>. Jika progres &lt; 50%, banner dan push notification akan muncul otomatis!
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onTriggerScheduledSimulation && onTriggerScheduledSimulation("10:00")}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 inline-flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Coba Uji Jam 10:00 Sekarang
                    </button>
                  </div>
                </div>
              ) : (
                reminderHistory.map(rem => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-800 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img src={rem.memberAvatar} alt={rem.memberName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {rem.title}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {rem.memberName} ({rem.memberRole}) • {rem.slotLabel} • {rem.timestamp}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {rem.overallProgressPct}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rem.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-500 dark:text-slate-400">
                        Air: {rem.waterPct}% | Langkah: {rem.stepsPct}% | Tidur: {rem.sleepPct}%
                      </span>

                      {onNavigateToGoals && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateToGoals(rem.memberId);
                            onClose();
                          }}
                          className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <span>Lengkapi Target</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB CONTENT B: ACHIEVEMENTS (90% & 100%) */}
          {activeTab === "achievements" && (
            <div className="p-4 space-y-3 max-h-[52vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold">Belum ada riwayat capaian 90% atau 100%.</p>
                  <button
                    type="button"
                    onClick={onTriggerTestNotification}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Coba Tes Perayaan 90%
                  </button>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      notif.isRead
                        ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80"
                        : "bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/80 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{notif.celebratoryEmoji}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {notif.title}
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            {notif.memberName} • {notif.sourceWearable} • {notif.timestamp}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {notif.percentage}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {activeTab === "reminders" ? (
              <>
                <button
                  type="button"
                  onClick={onClearReminderHistory}
                  disabled={reminderHistory.length === 0}
                  className="text-xs text-rose-600 hover:text-rose-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Riwayat</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Total {reminderHistory.length} Pengingat
                </span>
              </>
            ) : (
              <>
                <button
                  id="btn-clear-notifications"
                  type="button"
                  onClick={onClearNotifications}
                  disabled={notifications.length === 0}
                  className="text-xs text-rose-600 hover:text-rose-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Riwayat</span>
                </button>

                <button
                  id="btn-mark-all-read"
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tandai Semua Dibaca</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ============================================================================
// 4. REACT HOOK: USE HEALTH GOALS SCHEDULER
// ============================================================================

export interface UseHealthGoalsSchedulerOptions {
  members: FamilyMember[];
  activeMemberId: string;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onNavigateToGoals?: (memberId: string) => void;
}

export const useHealthGoalsScheduler = ({
  members,
  activeMemberId,
  onShowToast,
  onNavigateToGoals
}: UseHealthGoalsSchedulerOptions) => {
  // Current active push banner alert
  const [activeAlert, setActiveAlert] = useState<HealthGoalsReminderAlert | null>(null);

  // Stored reminder history
  const [reminderHistory, setReminderHistory] = useState<HealthGoalsReminderAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULED_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIF_PREFS);
      if (saved) return JSON.parse(saved).soundEnabled ?? true;
    } catch {
      // ignore
    }
    return true;
  });

  // Web Push permission state
  const [webPushPermission, setWebPushPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULED_NOTIFS, JSON.stringify(reminderHistory));
    } catch {
      // ignore
    }
  }, [reminderHistory]);

  // Request native web push
  const handleRequestWebPush = async () => {
    const res = await requestWebNotificationPermission();
    setWebPushPermission(res);
    if (res === "granted") {
      if (onShowToast) {
        onShowToast("Izin Notifikasi Browser berhasil diaktifkan untuk Rumah Sehat GerSaKa!", "success");
      }
      dispatchWebNotification(
        "Rumah Sehat LimoCity GerSaKa",
        "Notifikasi Pengingat Health Goals Pukul 10:00 & 20:00 telah aktif!"
      );
    } else if (res === "denied") {
      if (onShowToast) {
        onShowToast("Izin notifikasi ditolak oleh peramban. Sistem akan menggunakan notifikasi simulasi dalam aplikasi.", "warning");
      }
    }
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIF_PREFS);
      const parsed = saved ? JSON.parse(saved) : DEFAULT_NOTIF_PREFS;
      localStorage.setItem(STORAGE_KEY_NOTIF_PREFS, JSON.stringify({ ...parsed, soundEnabled: nextVal }));
    } catch {
      // ignore
    }
    if (onShowToast) {
      onShowToast(`Suara notifikasi pengingat ${nextVal ? "diaktifkan" : "dimatikan"}.`, "info");
    }
  };

  // Trigger notification payload
  const fireReminder = useCallback((alertPayload: HealthGoalsReminderAlert) => {
    setActiveAlert(alertPayload);
    setReminderHistory(prev => [alertPayload, ...prev.slice(0, 19)]); // keep last 20

    // Play chime if enabled
    if (soundEnabled) {
      playReminderChime();
    }

    // Try native browser push
    dispatchWebNotification(
      alertPayload.title,
      alertPayload.message,
      `gersaka-${alertPayload.timeSlot}`
    );

    if (onShowToast) {
      onShowToast(`📢 ${alertPayload.title}`, "warning");
    }
  }, [soundEnabled, onShowToast]);

  // Public simulator: Allows user to test 10:00 or 20:00 anytime
  const triggerSimulation = useCallback((slot: "10:00" | "20:00", forceMemberId?: string) => {
    const targetId = forceMemberId || activeMemberId;
    let evalData = evaluateMemberHealthGoalsProgress(targetId, members);

    // If progress is currently >= 50%, temporarily construct a sample lagging state so the user can inspect the alert
    if (!evalData.isBelow50) {
      evalData = {
        ...evalData,
        overallPct: 34,
        waterPct: 28,
        stepsPct: 35,
        sleepPct: 40,
        waterCurrentMl: 700,
        stepsCurrent: 2800,
        sleepCurrentHours: 3.0,
        isBelow50: true,
        laggingGoals: [
          {
            key: "water",
            label: "Asupan Air",
            pct: 28,
            currentStr: "700 ml",
            targetStr: `${evalData.waterTargetMl} ml`,
            deficitStr: `Kurang ${(evalData.waterTargetMl - 700)} ml`
          },
          {
            key: "steps",
            label: "Langkah Kaki",
            pct: 35,
            currentStr: "2.800 langkah",
            targetStr: `${evalData.stepsTarget} langkah`,
            deficitStr: `Kurang ${(evalData.stepsTarget - 2800)} langkah`
          }
        ]
      };
    }

    const payload = buildHealthGoalsReminderPayload(slot, evalData, true);
    fireReminder(payload);
  }, [activeMemberId, members, fireReminder]);

  // Automatic real-time clock monitor (checks every 25 seconds for 10:00 or 20:00)
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // We trigger on slot: 10:00 (10 AM) or 20:00 (8 PM)
      // Check if current minute is 0 (or within 0-2 for margin)
      const is10AM = hours === 10 && minutes === 0;
      const is8PM = hours === 20 && minutes === 0;

      if (!is10AM && !is8PM) return;

      const slotKey = is10AM ? "10:00" : "20:00";
      const dateKey = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const triggerToken = `${dateKey}_${slotKey}`;

      // Check if already notified for this slot today
      try {
        const lastTrigger = localStorage.getItem(STORAGE_KEY_LAST_SCHEDULED_TRIGGER);
        if (lastTrigger === triggerToken) {
          return; // already notified for this slot today
        }
      } catch {
        // ignore
      }

      // Check all family members; if active member or any member has overall progress < 50%
      const targetEval = evaluateMemberHealthGoalsProgress(activeMemberId, members);
      if (targetEval.isBelow50) {
        const payload = buildHealthGoalsReminderPayload(slotKey, targetEval, false);
        fireReminder(payload);
        try {
          localStorage.setItem(STORAGE_KEY_LAST_SCHEDULED_TRIGGER, triggerToken);
        } catch {
          // ignore
        }
      }
    };

    // Run initial check and set interval
    checkSchedule();
    const timer = setInterval(checkSchedule, 25000);
    return () => clearInterval(timer);
  }, [activeMemberId, members, fireReminder]);

  // Quick Action: Add Water directly from banner
  const handleQuickAddWater = (memberId: string, amountMl: number) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      const parsed = saved ? JSON.parse(saved) : {};
      const current = parsed[memberId] || { waterCurrentMl: 1200, stepsCurrent: 3500, sleepCurrentHours: 6.0 };
      const updated = {
        ...current,
        waterCurrentMl: current.waterCurrentMl + amountMl,
        lastUpdatedTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      parsed[memberId] = updated;
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(parsed));
      
      if (onShowToast) {
        onShowToast(`💧 Asupan air dicatat +${amountMl} ml! Target terupdate.`, "success");
      }
      setActiveAlert(null);
    } catch {
      // ignore
    }
  };

  const clearReminderHistory = () => {
    setReminderHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_SCHEDULED_NOTIFS);
    } catch {
      // ignore
    }
    if (onShowToast) {
      onShowToast("Riwayat pengingat jadwal berhasil dibersihkan.", "info");
    }
  };

  return {
    activeAlert,
    dismissAlert: () => setActiveAlert(null),
    reminderHistory,
    soundEnabled,
    toggleSound: handleToggleSound,
    webPushPermission,
    requestWebPush: handleRequestWebPush,
    triggerSimulation,
    handleQuickAddWater,
    clearReminderHistory
  };
};
