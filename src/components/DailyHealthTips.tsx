import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FamilyMember, DailyHealthTip, DailyHealthTipsResponse } from "../types";
import { INITIAL_DAILY_HEALTH_TIPS } from "../data/mockData";
import { 
  Lightbulb, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Heart, 
  Droplet, 
  Activity, 
  Moon, 
  ShieldCheck, 
  Share2, 
  Check, 
  Info,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { DailyHealthTipsDetail } from "./DailyHealthTipsDetail";

interface DailyHealthTipsProps {
  patient: FamilyMember;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const DailyHealthTips: React.FC<DailyHealthTipsProps> = ({
  patient,
  onShowToast
}) => {
  const [loading, setLoading] = useState(false);
  const [refreshIteration, setRefreshIteration] = useState(0);
  const [selectedTipForDetail, setSelectedTipForDetail] = useState<DailyHealthTip | null>(null);
  const [tipsData, setTipsData] = useState<DailyHealthTipsResponse>(() => {
    const fallback = INITIAL_DAILY_HEALTH_TIPS[patient.id] || INITIAL_DAILY_HEALTH_TIPS["fam-01"];
    return {
      memberId: patient.id,
      memberName: patient.name,
      date: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      dailyFocusHeadline: fallback.dailyFocusHeadline,
      overallReadinessScore: fallback.overallReadinessScore,
      tips: fallback.tips.map(t => ({ ...t, isCompleted: false })),
      source: "LimoCity Clinical Heuristics"
    };
  });

  const [completedTips, setCompletedTips] = useState<Record<string, boolean>>({});
  const [expandedRationale, setExpandedRationale] = useState<Record<string, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  
  // Track last fetched patient ID to prevent redundant rapid loops
  const lastFetchedIdRef = useRef<string>("");

  // Fetch AI-generated dynamic tips from server on-demand without page reload
  const handleFetchAiTips = async (isManualClick: boolean = true) => {
    setLoading(true);
    if (isManualClick && onShowToast) {
      onShowToast(`Menghubungi Gemini AI Medis untuk saran harian baru ${patient.name}...`, "info");
    }

    try {
      const response = await fetch("/api/ai/daily-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          patient,
          timestamp: Date.now()
        }),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const rawTips: DailyHealthTip[] = (resJson.data.tips || []).map((t: any, idx: number) => ({
          id: t.id || `ai-tip-${patient.id}-${Date.now()}-${idx}`,
          category: t.category || "Aktivitas & Fisioterapi",
          title: t.title || "Saran Kebugaran Harian",
          shortAdvice: t.shortAdvice || "Pertahankan gaya hidup sehat seimbang.",
          actionableStep: t.actionableStep || "Lakukan peregangan ringan.",
          bestTime: t.bestTime || "Pagi 07:00",
          importance: t.importance || "Penting",
          scientificRationale: t.scientificRationale || "Mendukung homeostasis vitalitas tubuh.",
          isCompleted: false
        }));

        setTipsData({
          memberId: patient.id,
          memberName: patient.name,
          date: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
          dailyFocusHeadline: resJson.data.dailyFocusHeadline || `Optimalisasi Vitalitas ${patient.role}`,
          overallReadinessScore: resJson.data.overallReadinessScore || patient.overallHealthScore,
          tips: rawTips,
          source: resJson.source === "gemini-3.8-flash" ? "Gemini 3.8 Flash AI Medis" : (resJson.source || "LimoCity Clinical AI")
        });

        // Trigger fadeIn animation for new tips
        setRefreshIteration(prev => prev + 1);

        if (isManualClick && onShowToast) {
          onShowToast(`Saran kesehatan baru untuk ${patient.name} berhasil diperbarui oleh AI!`, "success");
        }
      }
    } catch (err) {
      console.error("Failed to generate AI daily health tips:", err);
      if (isManualClick && onShowToast) {
        onShowToast("Gagal memperbarui saran AI, memuat rekomendasi klinis cadangan.", "warning");
      }
    } finally {
      setLoading(false);
    }
  };

  // Automatically load fresh AI tips every time the app opens, is refreshed, or patient changes
  useEffect(() => {
    const defaultData = INITIAL_DAILY_HEALTH_TIPS[patient.id] || INITIAL_DAILY_HEALTH_TIPS["fam-01"];
    // Set initial baseline immediately so UI is immediately visible without flicker
    setTipsData(prev => ({
      memberId: patient.id,
      memberName: patient.name,
      date: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      dailyFocusHeadline: defaultData.dailyFocusHeadline,
      overallReadinessScore: defaultData.overallReadinessScore,
      tips: defaultData.tips.map(t => ({ ...t, isCompleted: Boolean(completedTips[t.id]) })),
      source: prev.source || "LimoCity Clinical AI"
    }));

    // Trigger AI loading every time application is opened or refreshed
    handleFetchAiTips(false);
    lastFetchedIdRef.current = patient.id;
  }, [patient.id]);

  // Toggle completion of a tip
  const toggleTipComplete = (tipId: string) => {
    setCompletedTips(prev => {
      const nextVal = !prev[tipId];
      const updated = { ...prev, [tipId]: nextVal };
      if (onShowToast) {
        if (nextVal) {
          onShowToast("Bagus! Saran kesehatan telah ditandai selesai dipraktikkan.", "success");
        }
      }
      return updated;
    });
  };

  const toggleRationale = (tipId: string) => {
    setExpandedRationale(prev => ({
      ...prev,
      [tipId]: !prev[tipId]
    }));
  };

  // Text-to-Speech simulation or Web Speech API
  const handleReadTips = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onShowToast) onShowToast("Peramban tidak mendukung text-to-speech.", "warning");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `Saran kesehatan harian untuk ${patient.name}. Fokus hari ini: ${tipsData.dailyFocusHeadline}. ` +
      tipsData.tips.map((t, idx) => `Saran ke-${idx + 1}, ${t.title}: ${t.shortAdvice}. Tindakan yang disarankan: ${t.actionableStep}.`).join(" ");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Share to Family WhatsApp format
  const handleShareToFamily = () => {
    const shareText = `*💡 GerSaKa LimoCity - Daily Health Tips AI*\n` +
      `👤 *Untuk:* ${patient.name} (${patient.role})\n` +
      `📅 *Tanggal:* ${tipsData.date}\n` +
      `🎯 *Fokus Hari Ini:* ${tipsData.dailyFocusHeadline}\n` +
      `📊 *Skor Kesiapan Fisik:* ${tipsData.overallReadinessScore}%\n\n` +
      tipsData.tips.map((t, i) => `${i + 1}. *[${t.category} - ${t.bestTime}]* ${t.title}\n💡 ${t.shortAdvice}\n✅ *Langkah:* ${t.actionableStep}\n`).join("\n") +
      `\n_Dianalisis secara klinis oleh GerSaKa LimoCity Health System berbasis AI._`;

    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    if (onShowToast) {
      onShowToast("Ringkasan saran harian disalin ke clipboard! Siap dibagikan ke WhatsApp Keluarga.", "success");
    }
    setTimeout(() => setCopiedShare(false), 3000);
  };

  // Calculate completed count
  const completedCount = tipsData.tips.filter(t => completedTips[t.id]).length;
  const progressPercent = Math.round((completedCount / (tipsData.tips.length || 1)) * 100);

  // Category styling helper
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Kardiovaskular":
        return {
          icon: Heart,
          className: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          iconColor: "text-rose-600 dark:text-rose-400"
        };
      case "Nutrisi & Hidrasi":
        return {
          icon: Droplet,
          className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          iconColor: "text-emerald-600 dark:text-emerald-400"
        };
      case "Aktivitas & Fisioterapi":
        return {
          icon: Activity,
          className: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
          iconColor: "text-teal-600 dark:text-teal-400"
        };
      case "Istirahat & Stres":
        return {
          icon: Moon,
          className: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          iconColor: "text-purple-600 dark:text-purple-400"
        };
      default:
        return {
          icon: ShieldCheck,
          className: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400"
        };
    }
  };

  return (
    <motion.div 
      id="daily-health-tips-module"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors"
    >
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            {/* Lampu Bohlam (Lightbulb) Main Icon with Warm Glow */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40">
              <Lightbulb className="w-5 h-5 text-amber-50 fill-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daily Health Tips</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/40 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span>Saran AI Harian</span>
                </span>
                {loading && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>Sinkron AI...</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Saran kesehatan harian yang dipersonalisasi berbasis AI untuk <strong className="text-slate-700 dark:text-slate-200">{patient.name}</strong> ({patient.role})
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Refresh AI, TTS, Share */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          
          <button
            id="btn-daily-tips-tts"
            onClick={handleReadTips}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? "bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 animate-pulse"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400"
            }`}
            title="Dengarkan pembacaan saran suara"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isSpeaking ? "Hentikan Suara" : "Dengarkan"}</span>
          </button>

          <button
            id="btn-daily-tips-share"
            onClick={handleShareToFamily}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Bagikan ke WhatsApp Keluarga"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden md:inline">{copiedShare ? "Tersalin!" : "Bagikan"}</span>
          </button>

          {/* Dedicated Refresh Button with on-demand AI fetch */}
          <button
            id="btn-daily-tips-refresh"
            onClick={() => handleFetchAiTips(true)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 active:scale-98 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Dapatkan saran kesehatan baru dari AI tanpa perlu reload halaman"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Memuat AI..." : "Refresh Saran AI"}</span>
          </button>
        </div>
      </div>

      {/* Loading notification banner if AI is currently fetching on app open / refresh */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200 animate-pulse"
        >
          <div className="flex items-center gap-2 font-medium">
            <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-400 animate-bounce" />
            <span>Memuat saran kesehatan AI terbaru yang disesuaikan dengan biomarker hari ini...</span>
          </div>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
        </motion.div>
      )}

      {/* Daily Focus Banner & Readiness Score */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/60 via-emerald-50/40 to-teal-50/50 dark:from-amber-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>{tipsData.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Lightbulb className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>Sumber: {tipsData.source}</span>
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            <span>Fokus Hari Ini: {tipsData.dailyFocusHeadline}</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Disesuaikan dengan telemetri vital: BP {patient.vitals.bloodPressure} mmHg, HRV {patient.vitals.hrvMs} ms, SpO2 {patient.vitals.spo2}%, & program {patient.therapyProgram}.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/50 shrink-0 self-start sm:self-center shadow-xs">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kesiapan Vitalitas</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
              {tipsData.overallReadinessScore}%
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
            <Lightbulb className="w-5 h-5 fill-amber-400/40" />
          </div>
        </div>
      </div>

      {/* Habit Practice Progress Bar & Quick Refresh Row */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Kepatuhan Praktik Sehat Hari Ini ({completedCount}/{tipsData.tips.length})</span>
          </span>
          
          {/* Quick On-demand Refresh Link */}
          <div className="flex items-center gap-3">
            <button
              id="btn-quick-refresh-tips"
              onClick={() => handleFetchAiTips(true)}
              disabled={loading}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Ambil saran AI baru tanpa reload"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Menghasilkan tips..." : "Dapatkan Saran Baru (Refresh)"}</span>
            </button>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">
              {progressPercent}%
            </span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tips Cards Grid with AnimatePresence & fadeIn Entrance */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`tips-grid-${patient.id}-${refreshIteration}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
        >
          {tipsData.tips.map((tip, index) => {
            const isDone = Boolean(completedTips[tip.id]);
            const isExpanded = Boolean(expandedRationale[tip.id]);
            const catInfo = getCategoryBadge(tip.category);
            const IconComp = catInfo.icon;

            return (
              <motion.div
                key={tip.id || `tip-${refreshIteration}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
                className={`p-4 rounded-xl border transition-all ${
                  isDone 
                    ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80" 
                    : "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-sm"
                }`}
              >
                {/* Card Top Row: Category Pill, Time, & Importance */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${catInfo.className}`}>
                      <IconComp className={`w-3 h-3 ${catInfo.iconColor}`} />
                      <span>{tip.category}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{tip.bestTime}</span>
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tip.importance === "Tinggi"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : tip.importance === "Penting"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}>
                    Prioritas {tip.importance}
                  </span>
                </div>

                {/* Title & Short Advice */}
                <h5 
                  onClick={() => setSelectedTipForDetail(tip)}
                  className={`text-sm font-bold text-slate-900 dark:text-white flex items-start gap-1.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors ${isDone ? "line-through text-slate-500 dark:text-slate-400" : ""}`}
                  title="Klik untuk membuka penjelasan mendalam dan langkah aksi spesifik"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                  <span>{tip.title}</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {tip.shortAdvice}
                </p>

                {/* Actionable Step Box */}
                <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[10px] uppercase tracking-wide">
                      <Lightbulb className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>Langkah Nyata:</span>
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {tip.actionableStep}
                    </span>
                  </div>

                  {/* Mark Done Toggle Button */}
                  <button
                    onClick={() => toggleTipComplete(tip.id)}
                    className={`shrink-0 p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-600 dark:text-slate-300"
                    }`}
                    title={isDone ? "Batalkan tanda selesai" : "Tandai sudah dipraktikkan"}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDone ? "text-white stroke-[3]" : "text-slate-400"}`} />
                    <span className="text-[11px] font-bold">
                      {isDone ? "Selesai" : "Praktikkan"}
                    </span>
                  </button>
                </div>

                {/* Card Action Row: Detail Modal Trigger & Quick Biomarker Rationale */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                  <button
                    id={`btn-open-tip-detail-${tip.id}`}
                    onClick={() => setSelectedTipForDetail(tip)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer group"
                    title="Buka penjelasan mendalam dan langkah aksi spesifik"
                  >
                    <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Detail & Langkah Aksi</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {tip.scientificRationale && (
                    <button
                      onClick={() => toggleRationale(tip.id)}
                      className="text-[11px] font-medium text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Lihat dasar ilmiah ringkas"
                    >
                      <Info className="w-3 h-3" />
                      <span>{isExpanded ? "Tutup" : "Rasional"}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Collapsible Scientific Rationale */}
                {isExpanded && tip.scientificRationale && (
                  <p className="mt-2 p-2.5 rounded-lg bg-slate-100/90 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 leading-normal text-[11px] border border-slate-200/60 dark:border-slate-800">
                    {tip.scientificRationale}
                  </p>
                )}

              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Daily Health Tips In-Depth Detail Modal */}
      <DailyHealthTipsDetail
        isOpen={Boolean(selectedTipForDetail)}
        onClose={() => setSelectedTipForDetail(null)}
        tip={selectedTipForDetail}
        patient={patient}
        isCompleted={selectedTipForDetail ? Boolean(completedTips[selectedTipForDetail.id]) : false}
        onToggleComplete={toggleTipComplete}
        onShowToast={onShowToast}
      />

    </motion.div>
  );
};

