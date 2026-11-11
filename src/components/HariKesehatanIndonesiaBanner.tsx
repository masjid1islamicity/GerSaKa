import React, { useState } from "react";
import { 
  Crown, 
  Calendar, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Check, 
  Activity, 
  Award,
  Zap,
  Footprints,
  Flame
} from "lucide-react";
import { FamilyMember } from "../types";
import { fireBadgeCelebrationConfetti } from "../utils/confetti";

interface HariKesehatanIndonesiaBannerProps {
  onOpenModal: () => void;
  activeMember: FamilyMember;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onNavigateToBerjaga?: () => void;
}

export const HariKesehatanIndonesiaBanner: React.FC<HariKesehatanIndonesiaBannerProps> = ({
  onOpenModal,
  activeMember,
  onShowToast,
  onNavigateToBerjaga
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  // Calculate days relative to 12 November
  const now = new Date();
  const currentYear = now.getFullYear();
  const hknDate = new Date(currentYear, 10, 12); // Month is 0-indexed (10 = November)
  const diffTime = hknDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isTodayHKN = now.getMonth() === 10 && now.getDate() === 12;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `👑 *PERINGATAN HARI KESEHATAN INDONESIA - 12 NOVEMBER*\n\n` +
      `*Tema Resmi GerSaKa:* "Fit Mahkota Jihad di Jalan Allah dengan Harta dan Jiwaraga"\n\n` +
      `Kesehatan adalah Mahkota di atas kepala orang sehat yang hanya disaksikan oleh orang sakit. ` +
      `Mari jadikan raga yang fit dan rezeki yang thayyib sebagai sarana ibadah dan jihad tertinggi!\n\n` +
      `_GerSaKa LimoCity Therapy_`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onShowToast) {
      onShowToast("Teks syiar Hari Kesehatan Indonesia berhasil disalin ke clipboard!", "success");
    }
    setTimeout(() => setCopied(false), 2200);
  };

  const handleQuickPledge = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem("gersaka_hkn_pledged_2026", "true");
    } catch {
      // ignore
    }
    fireBadgeCelebrationConfetti(0.5, 0.4);
    if (onShowToast) {
      onShowToast("🤲 Ikrar Kebugaran Jiwaraga diteguhkan! Semoga Allah menganugerahkan afiat lahir batin.", "success");
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/80 dark:border-amber-500/70 shadow-xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white transition-all">
      {/* Top Animated Pulse Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 animate-pulse" />

      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-4 sm:p-6 relative z-10 space-y-4">
        
        {/* Top Header Bar: Badge, Countdown & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>12 November • Hari Kesehatan Indonesia</span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>GerSaKa Nasional 2026</span>
            </span>

            {isTodayHKN ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white animate-bounce shadow-xs">
                🎉 HARI INI 12 NOVEMBER!
              </span>
            ) : diffDays > 0 ? (
              <span className="text-[11px] font-medium text-amber-200/90 font-mono">
                Menuju Peringatan: <strong>H-{diffDays} Hari</strong>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-200 font-mono">
                Bulan Peringatan Kesehatan Nasional
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleShare}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Bagikan syiar ke WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Tersalin" : "Syiar"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
              title={isExpanded ? "Sembunyikan rincian" : "Tampilkan rincian"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Banner Message & Call to Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2 flex-wrap">
              <span>Fit Mahkota Jihad di Jalan Allah dengan Harta & Jiwaraga</span>
            </h2>

            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
              "Kesehatan adalah mahkota tak ternilai. Jadikan raga yang bugar dan harta yang halal sebagai benteng ibadah, jihad penegak kebaikan, dan perlindungan keluarga muslim Indonesia."
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-300 flex-wrap">
              <span className="italic font-serif">"الصحة تاج على رؤوس الأصحاء"</span>
              <span>•</span>
              <span className="font-semibold text-emerald-300">QS. As-Saff: 11 & HR. Muslim</span>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleQuickPledge}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <Heart className="w-4 h-4 fill-amber-400/20 text-amber-400" />
              <span>Ikrar Jiwaraga</span>
            </button>

            <button
              type="button"
              onClick={onOpenModal}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>Buka Maklumat & Piagam</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Expandable Biometric & Jihad Preparedness Summary Strip */}
        {isExpanded && (
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Jiwaraga Fit
                </span>
                <span className="font-mono">{activeMember.overallHealthScore}%</span>
              </div>
              <div className="text-sm font-black text-white font-mono">
                {activeMember.vitals.heartRate} BPM
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {activeMember.name} ({activeMember.role})
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                  Stamina Langkah
                </span>
                <span className="font-mono">{(activeMember.vitals.steps / 1000).toFixed(1)}k</span>
              </div>
              <div className="text-sm font-black text-white font-mono">
                {activeMember.vitals.steps.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px] text-slate-400">
                Aktivitas Fisik Sunnah
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  Jihad Harta
                </span>
                <span className="font-mono">Thayyib</span>
              </div>
              <div className="text-sm font-black text-white">
                Infak Sehat Aktif
              </div>
              <p className="text-[10px] text-slate-400">
                Nutrisi & Proteksi Faskes
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  Ketahanan Afiat
                </span>
                <span className="font-mono">Syar'i</span>
              </div>
              <div className="text-sm font-black text-emerald-400">
                Paripurna
              </div>
              <p className="text-[10px] text-slate-400">
                Keluarga Tangguh 12 Nov
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
