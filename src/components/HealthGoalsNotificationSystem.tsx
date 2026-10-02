import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HealthGoalNotification } from "../types";
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
  ExternalLink
} from "lucide-react";

// Web Audio API synthesized celebratory chime (no external audio assets required)
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
    // Gracefully ignore if audio context is blocked by browser policy
    console.warn("Audio chime skipped:", e);
  }
};

// Web Push Notification Helper (Browser Native)
export const dispatchWebNotification = async (title: string, body: string) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  try {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  } catch (e) {
    console.warn("Web notification skipped:", e);
  }
};

// 1. Floating Celebratory Push Banner Component
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
        {/* Top Gradient Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse" />

        <div className="p-4 sm:p-5">
          {/* Header Row: Wearable Tag, Time & Close */}
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
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Body */}
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

              {/* Progress Mini Bar */}
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

          {/* Action Footer */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <button
              id="btn-banner-share"
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

// 2. Notification Center Drawer & Settings Modal
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
  onRequestWebPush
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Pusat Notifikasi Health Goals</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                      {unreadCount} Baru
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Alarm pencapaian target 90% & 100% dari data sensor wearable
                </p>
              </div>
            </div>

            <button
              id="btn-close-notif-drawer"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Settings Bar: Push Permission, Sound & Test Trigger */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
            
            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
              title="Aktifkan atau matikan audio perayaan"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>Chime: {soundEnabled ? "Aktif" : "Mati"}</span>
            </button>

            {/* Web Push Permission Toggle */}
            <button
              id="btn-enable-web-push"
              onClick={onRequestWebPush}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                webPushPermission === "granted"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500"
              }`}
              title="Izin notifikasi push peramban"
            >
              <Watch className="w-3.5 h-3.5 text-emerald-600" />
              <span>Push Browser: {webPushPermission === "granted" ? "Diizinkan" : "Aktifkan"}</span>
            </button>

            {/* Test 90% Push Alert Button */}
            <button
              id="btn-test-goal-notification"
              onClick={onTriggerTestNotification}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:brightness-105 shadow-xs cursor-pointer"
              title="Simulasikan capaian 90% target langkah untuk melihat push alert"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Tes Notifikasi 90%</span>
            </button>

          </div>

          {/* Notification List */}
          <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold">Belum ada riwayat notifikasi baru.</p>
                <p className="text-[11px] text-slate-400">
                  Notifikasi perayaan akan muncul otomatis saat Anda mencapai ambang 90% atau 100% target!
                </p>
                <button
                  onClick={onTriggerTestNotification}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Coba Tes Notifikasi Sekarang
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

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {notif.currentValue.toLocaleString("id-ID")} / {notif.targetValue.toLocaleString("id-ID")} {notif.unit}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {notif.percentage >= 100 ? "Target Selesai" : "Mendekati Selesai"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                id="btn-clear-notifications"
                onClick={onClearNotifications}
                className="text-xs text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>

              <button
                id="btn-mark-all-read"
                onClick={onMarkAllAsRead}
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tandai Semua Dibaca</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
