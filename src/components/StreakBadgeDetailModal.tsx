import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StreakBadge } from "../types";
import {
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Share2,
  X,
  Heart,
  Watch,
  Smile,
  ShieldCheck,
  Calendar,
  ExternalLink,
  PartyPopper
} from "lucide-react";
import { playCelebrationChime } from "./HealthGoalsNotificationSystem";
import { fireBadgeCelebrationConfetti } from "../utils/confetti";

interface StreakBadgeDetailModalProps {
  badge: StreakBadge | null;
  onClose: () => void;
  onSendCheer?: (memberId: string, memberName: string, emoji: string, message: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const StreakBadgeDetailModal: React.FC<StreakBadgeDetailModalProps> = ({
  badge,
  onClose,
  onSendCheer,
  onShowToast
}) => {
  if (!badge) return null;

  // Auto-fire confetti burst on open
  useEffect(() => {
    fireBadgeCelebrationConfetti(0.5, 0.45);
  }, [badge.id]);

  const handleLaunchConfetti = () => {
    fireBadgeCelebrationConfetti(0.5, 0.4);
    playCelebrationChime();
    if (onShowToast) {
      onShowToast(`🎉 Perayaan lencana ${badge.title} untuk ${badge.memberName}!`, "success");
    }
  };

  const handleShareToWhatsApp = () => {
    const text = `🎉 *LENCANA KONSISTENSI 7-HARI TERBUKA!* 🌟\n\n` +
      `Keluarga GerSaKa mengucapkan selamat kepada *${badge.memberName}* (${badge.memberRole}) atas pencapaian lencana prestisius:\n\n` +
      `🏅 *${badge.title}*\n` +
      `"${badge.subtitle}"\n\n` +
      `🔥 *Rekor Konsistensi:* ${badge.requiredDays}+ Hari Beruntun Tanpa Jeda!\n` +
      `🩺 *Manfaat Kesehatan:* ${badge.healthBenefit}\n` +
      `👨‍⚕️ *Pengesahan Dokter:* ${badge.doctorEndorsement}\n\n` +
      `_Terus semangat menjaga kebugaran bersama ekosistem keluarga GerSaKa LimoCity!_`;

    navigator.clipboard.writeText(text);
    if (onShowToast) {
      onShowToast("Pesan perayaan lencana berhasil disalin! Siap dikirim ke grup WhatsApp Keluarga.", "success");
    }
  };

  const handleCheerClick = () => {
    fireBadgeCelebrationConfetti(0.5, 0.5);
    if (onSendCheer) {
      onSendCheer(badge.memberId, badge.memberName, "🎉", `Selamat atas lencana ${badge.title}!`);
    } else {
      playCelebrationChime();
      if (onShowToast) {
        onShowToast(`🎉 Semangat dan selamat terkirim untuk ${badge.memberName}!`, "success");
      }
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="modal-streak-badge-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="modal-streak-badge-detail"
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-300 dark:border-amber-700/80 overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Confetti Launch Action */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={handleLaunchConfetti}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30 transition-all cursor-pointer active:scale-95 animate-bounce"
              title="Luncurkan hujan confetti perayaan!"
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Confetti 🎉</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ambient Glowing Header Background */}
          <div className="relative p-6 sm:p-7 bg-gradient-to-b from-amber-500/25 via-orange-500/10 to-transparent dark:from-amber-950/50 dark:via-slate-900 dark:to-slate-900 text-center overflow-hidden">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />

            {/* Radiant Badge Medal Display with Pulsing Expanding Rings */}
            <div className="relative inline-block my-3">
              
              {/* Concentric Pulse Rings */}
              <motion.div
                animate={{
                  scale: [1, 1.35, 1.6],
                  opacity: [0.7, 0.3, 0]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-3xl bg-amber-400/50 blur-xs pointer-events-none -m-1"
              />

              <motion.div
                animate={{
                  scale: [1, 1.2, 1.4],
                  opacity: [0.6, 0.25, 0]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.7
                }}
                className="absolute inset-0 rounded-3xl bg-orange-400/40 blur-xs pointer-events-none -m-1"
              />

              {/* Main Badge Medal Box */}
              <motion.div
                initial={{ rotate: -12, scale: 0.75 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-400 p-1 shadow-2xl shadow-amber-500/40 flex items-center justify-center mx-auto ring-4 ring-amber-300/40"
              >
                <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-4xl sm:text-5xl select-none filter drop-shadow-sm">
                    {badge.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1">
                    {badge.requiredDays} HARI STREAK
                  </span>
                </div>
              </motion.div>

              {/* Sparkling unlock badge pill */}
              <div className="relative z-20 -mt-2 inline-flex items-center gap-1 px-3.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40 border border-amber-300">
                <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
                <span>RESMI DIBUKA & DIVERIFIKASI</span>
              </div>
            </div>

            {/* Badge Title & Subtitle */}
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/90 px-3 py-0.5 rounded-full border border-amber-300/50">
                <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Rekor Konsistensi {badge.requiredDays}+ Hari Beruntun</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                {badge.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto mt-0.5">
                {badge.subtitle}
              </p>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            
            {/* Earner Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full ring-2 ring-amber-400 p-0.5 bg-white dark:bg-slate-900 shrink-0 shadow-xs">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-200 to-yellow-100 dark:from-amber-950 dark:to-slate-800 flex items-center justify-center font-black text-sm text-amber-800 dark:text-amber-300">
                    {badge.memberName.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {badge.memberName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Peran: <strong className="text-slate-700 dark:text-slate-300">{badge.memberRole}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 justify-end">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Streak Aktif</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {badge.unlockedAt}
                </p>
              </div>
            </div>

            {/* Streak Criteria Card */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Kriteria Pembukaan Lencana</span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                {badge.criteria}
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                <span>Status Verifikasi:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900 text-[10px] font-extrabold text-amber-900 dark:text-amber-200">
                  Tervalidasi Otomatis Sensor Wearable
                </span>
              </div>
            </div>

            {/* Clinical Health Benefit Explained */}
            <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-300">
                <Heart className="w-4 h-4 text-teal-600" />
                <span>Dampak Fisiologis & Manfaat Klinis</span>
              </div>
              <p className="text-xs text-teal-800/90 dark:text-teal-200/90 leading-relaxed">
                {badge.healthBenefit}
              </p>
            </div>

            {/* Doctor Endorsement Quote */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <span className="text-xl">🩺</span>
              <div>
                <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">
                  Pengesahan Tim Medis GerSaKa:
                </strong>
                <p className="italic text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  "{badge.doctorEndorsement}"
                </p>
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleCheerClick}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Smile className="w-4 h-4" />
              <span>Beri Semangat 🎉</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLaunchConfetti}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
                title="Luncurkan animasi confetti lagi"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Rayakan Lagi</span>
              </button>

              <button
                onClick={handleShareToWhatsApp}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan ke WA</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
