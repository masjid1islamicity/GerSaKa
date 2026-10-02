import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DailyHealthTip, FamilyMember } from "../types";
import { 
  Lightbulb, 
  X, 
  Check, 
  Clock, 
  Heart, 
  Droplet, 
  Activity, 
  Moon, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ArrowRight,
  TrendingDown,
  Gauge
} from "lucide-react";

interface DailyHealthTipsDetailProps {
  isOpen: boolean;
  onClose: () => void;
  tip: DailyHealthTip | null;
  patient: FamilyMember;
  isCompleted?: boolean;
  onToggleComplete?: (tipId: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const DailyHealthTipsDetail: React.FC<DailyHealthTipsDetailProps> = ({
  isOpen,
  onClose,
  tip,
  patient,
  isCompleted = false,
  onToggleComplete,
  onShowToast,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Stop speech if modal closes
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [isOpen, isSpeaking]);

  if (!isOpen || !tip) return null;

  // Category visual helper
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case "Kardiovaskular":
        return {
          icon: Heart,
          badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          iconColor: "text-rose-600 dark:text-rose-400",
          targetBiomarkers: [
            { name: "Tekanan Darah", impact: "Stabilisasi elastisitas vaskular", value: `${patient.vitals.bloodPressure} mmHg` },
            { name: "Variabilitas Denyut (HRV)", impact: "Meningkatkan tonus vagal", value: `${patient.vitals.hrvMs} ms` }
          ]
        };
      case "Nutrisi & Hidrasi":
        return {
          icon: Droplet,
          badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          targetBiomarkers: [
            { name: "Kadar Gula Darah", impact: "Mencegah lonjakan glukosa postprandial", value: `${patient.vitals.bloodGlucose} mg/dL` },
            { name: "Keseimbangan Cairan", impact: "Viskositas darah optimal", value: "Ideal 2.0-2.5L/hari" }
          ]
        };
      case "Aktivitas & Fisioterapi":
        return {
          icon: Activity,
          badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800",
          iconColor: "text-teal-600 dark:text-teal-400",
          targetBiomarkers: [
            { name: "SpO2 Saturasi Oksigen", impact: "Perfusi jaringan perifer", value: `${patient.vitals.spo2}%` },
            { name: "Aktivitas Harian", impact: "Mobilitas sendi & otot postural", value: `${patient.vitals.steps.toLocaleString("id-ID")} langkah` }
          ]
        };
      case "Istirahat & Stres":
        return {
          icon: Moon,
          badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          iconColor: "text-purple-600 dark:text-purple-400",
          targetBiomarkers: [
            { name: "Tingkat Stres", impact: "Reduksi hormon kortisol", value: `${patient.vitals.stressLevel}/100` },
            { name: "Kualitas Tidur", impact: "Siklus Deep & REM restoratif", value: `${patient.vitals.sleepHours} jam (${patient.vitals.sleepScore}/100)` }
          ]
        };
      default:
        return {
          icon: ShieldCheck,
          badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400",
          targetBiomarkers: [
            { name: "Skor Imunitas", impact: "Pencegahan infeksi & kelelahan kronis", value: "Optimal" },
            { name: "Vitalitas Keseluruhan", impact: "Homeostasis multi-organ", value: `${patient.overallHealthScore}%` }
          ]
        };
    }
  };

  const catDetails = getCategoryDetails(tip.category);
  const CategoryIcon = catDetails.icon;

  // In-depth protocol steps synthesis based on tip category & actionableStep
  const getProtocolSteps = () => {
    switch (tip.category) {
      case "Kardiovaskular":
        return [
          {
            phase: "1. Persiapan Awal (1 Menit)",
            desc: "Duduk santai di kursi dengan sandaran tegak. Longgarkan pakaian ketat dan pastikan ruangan memiliki ventilasi udara yang sejuk."
          },
          {
            phase: "2. Pelaksanaan Langkah Nyata",
            desc: `${tip.actionableStep}. Lakukan dengan ritme pernapasan perut 4-7-8 (tarik napas 4 detik lewat hidung, tahan 7 detik, hembuskan perlahan 8 detik lewat mulut).`
          },
          {
            phase: "3. Waktu & Durasi Optimal",
            desc: `Direkomendasikan pada ${tip.bestTime}. Lakukan selama 3-5 menit berturut-turut untuk merangsang reseptor barorefleks arteri karotis.`
          },
          {
            phase: "4. Evaluasi & Tanda Keberhasilan",
            desc: "Bahu terasa rileks, denyut nadi melambat stabil, dan tidak ada pusing. Jika ada rasa melayang, istirahat dan minum segelas air hangat."
          }
        ];
      case "Nutrisi & Hidrasi":
        return [
          {
            phase: "1. Persiapan Awal",
            desc: "Siapkan air bersuhu ruang atau hangat suam-suam kuku. Hindari minuman dengan pemanis buatan atau kafein berlebih sebelum praktik ini."
          },
          {
            phase: "2. Pelaksanaan Langkah Nyata",
            desc: `${tip.actionableStep}. Minum atau konsumsi secara perlahan, hirup aromanya untuk mengaktifkan enzim pencernaan saliva (ptialin).`
          },
          {
            phase: "3. Waktu & Durasi Optimal",
            desc: `Waktu terbaik: ${tip.bestTime}. Memberikan jeda waktu 15-20 menit sebelum makan utama agar penyerapan mikronutrien maksimal.`
          },
          {
            phase: "4. Evaluasi & Manfaat Tubuh",
            desc: "Rongga mulut terasa segar, urin berwarna kuning jernih transparan, dan terhindar dari rasa haus mendadak di siang hari."
          }
        ];
      case "Aktivitas & Fisioterapi":
        return [
          {
            phase: "1. Pemanasan & Pengaturan Postur",
            desc: "Posisikan telapak kaki rata di lantai. Tarik dagu sedikit ke dalam (chin tuck) untuk meregangkan tulang belakang leher dan melepaskan ketegangan pundak."
          },
          {
            phase: "2. Pelaksanaan Gerakan Fisioterapi",
            desc: `${tip.actionableStep}. Jangan menahan napas saat melakukan peregangan; hembuskan napas pada fase gerakan terberat.`
          },
          {
            phase: "3. Frekuensi & Repetisi",
            desc: `Lakukan sekitar ${tip.bestTime}. Ulangi 3 set dengan jeda istirahat 30 detik antar set agar sirkulasi cairan sendi (sinovial) terlumasi sempurna.`
          },
          {
            phase: "4. Indikator Keamanan",
            desc: "Rasa regang ringan adalah normal. Hentikan seketika bila merasakan nyeri tajam menusuk pada persendian."
          }
        ];
      case "Istirahat & Stres":
        return [
          {
            phase: "1. Pengondisian Lingkungan",
            desc: "Redupkan lampu layar gadget atau aktifkan filter cahaya biru (Night Mode). Pasang volume perangkat pada tingkat minimal."
          },
          {
            phase: "2. Pelaksanaan Relaksasi",
            desc: `${tip.actionableStep}. Pejamkan mata, lepaskan ketegangan pada otot rahang, dahi, dan telapak tangan.`
          },
          {
            phase: "3. Ritme & Waktu Pelaksanaan",
            desc: `Direkomendasikan pada ${tip.bestTime}. Cukup luangkan waktu 5 hingga 10 menit tanpa distraksi multi-tasking.`
          },
          {
            phase: "4. Evaluasi Gelombang Otak",
            desc: "Otot terasa lebih lemas, pernapasan melambat ke ritme alfa, dan pikiran menjadi lebih tenang serta fokus."
          }
        ];
      default:
        return [
          {
            phase: "1. Persiapan Diri",
            desc: "Luangkan momen singkat tanpa terburu-buru untuk menyelaraskan kondisi fisik dan mental Anda."
          },
          {
            phase: "2. Langkah Inti",
            desc: tip.actionableStep
          },
          {
            phase: "3. Waktu Rekomendasi",
            desc: `Jadwal ideal: ${tip.bestTime}, disesuaikan dengan aktivitas rutin Anda di rumah.`
          },
          {
            phase: "4. Catatan Klinis",
            desc: "Konsistensi kecil setiap hari berdampak lebih besar daripada tindakan drastis yang sporadis."
          }
        ];
    }
  };

  const steps = getProtocolSteps();

  // TTS read detail
  const handleReadDetail = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onShowToast) onShowToast("Peramban Anda tidak mendukung Text-to-Speech.", "warning");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narrative = `Panduan lengkap untuk ${patient.name}. ${tip.title}. Kategori: ${tip.category}. Rekomendasi waktu: ${tip.bestTime}. ` +
      `Saran praktis: ${tip.shortAdvice}. Langkah aksi: ${tip.actionableStep}. Rasional klinis: ${tip.scientificRationale}.`;

    const utterance = new SpeechSynthesisUtterance(narrative);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Copy shareable detailed summary
  const handleCopyShare = () => {
    const text = `*💡 Panduan Kesehatan Mendalam - GerSaKa LimoCity*\n` +
      `👤 *Pasien:* ${patient.name} (${patient.role}, ${patient.age} thn)\n` +
      `📌 *Topik:* ${tip.title} [${tip.category}]\n` +
      `⏰ *Waktu Terbaik:* ${tip.bestTime} (Prioritas ${tip.importance})\n\n` +
      `📝 *Saran Singkat:* ${tip.shortAdvice}\n\n` +
      `🎯 *Langkah Nyata:* ${tip.actionableStep}\n\n` +
      `🔬 *Rasional Klinis & Biomarker:* ${tip.scientificRationale}\n\n` +
      `📋 *Protokol Pelaksanaan:*\n` +
      steps.map(s => `• *${s.phase}:* ${s.desc}`).join("\n") +
      `\n\n_Dianalisis secara presisi oleh GerSaKa LimoCity AI Healthcare._`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onShowToast) {
      onShowToast("Panduan mendalam berhasil disalin! Siap dibagikan ke WhatsApp Keluarga.", "success");
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div 
        id="modal-daily-health-tips-detail-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="modal-daily-health-tips-detail"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/30 dark:via-emerald-950/20 dark:to-teal-950/30 border-b border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40 shrink-0 mt-0.5">
                <Lightbulb className="w-6 h-6 text-amber-50 fill-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${catDetails.badgeColor}`}>
                    <CategoryIcon className={`w-3.5 h-3.5 ${catDetails.iconColor}`} />
                    <span>{tip.category}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{tip.bestTime}</span>
                  </span>

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

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {tip.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Rekomendasi Presisi untuk <strong className="text-slate-700 dark:text-slate-200">{patient.name}</strong> ({patient.role}, {patient.age} tahun)
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              id="btn-close-tips-detail"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup dialog (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
            
            {/* Core Advice Highlight Box */}
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Intisari Rekomendasi Harian</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                "{tip.shortAdvice}"
              </p>
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs text-amber-900/80 dark:text-amber-300/80">
                <span className="font-semibold">Fokus Terapi Terkait: {patient.therapyProgram}</span>
                <span className="text-[11px]">Skor Vitalitas: {patient.overallHealthScore}%</span>
              </div>
            </div>

            {/* In-depth Scientific & Biological Mechanism */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Penjelasan Klinis & Mekanisme Homeostasis</span>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2.5">
                <p>
                  {tip.scientificRationale}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Saran ini dirancang mengikuti panduan Fisioterapi Keluarga GerSaKa LimoCity, memperhitungkan interaksi antara ritme neuromuskular, vasodilatasi pembuluh darah, dan regulasi aksis hipotalamus-pituitari-adrenal (HPA).
                </p>
              </div>
            </div>

            {/* Target Biomarkers Impact Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Gauge className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Dampak Langsung pada Biomarker Pasien</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catDetails.targetBiomarkers.map((bm, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{bm.name}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px]">
                        {bm.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {bm.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Protocol: Step-by-Step Practical Plan */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span>Panduan Langkah Aksi Spesifik (Protokol Praktik)</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {steps.length} Tahapan Ringkas
                </span>
              </div>

              <div className="space-y-2.5">
                {steps.map((st, i) => (
                  <div 
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {st.phase}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Precautions & Note */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-blue-900 dark:text-blue-300 block">
                  Petunjuk Keamanan Klinis
                </span>
                <p className="text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                  Lakukan dengan tenang tanpa memaksakan kapasitas fisik. Apabila timbul ketidaknyamanan, keluhan pusing, atau sesak, segera istirahat dan laporkan ke perawat atau dokter pendamping keluarga.
                </p>
              </div>
            </div>

          </div>

          {/* Fixed Footer with Action Buttons */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Left Actions: TTS & Share */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-detail-tts"
                onClick={handleReadDetail}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isSpeaking
                    ? "bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 animate-pulse"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400"
                }`}
                title="Dengarkan pembacaan panduan lengkap"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Hentikan Suara" : "Dengarkan"}</span>
              </button>

              <button
                id="btn-detail-share"
                onClick={handleCopyShare}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Salin ringkasan panduan untuk WhatsApp"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Tersalin!" : "Bagikan"}</span>
              </button>
            </div>

            {/* Right Actions: Mark Completed Toggle & Close Button */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {onToggleComplete && (
                <button
                  id="btn-detail-toggle-complete"
                  onClick={() => onToggleComplete(tip.id)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                    isCompleted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-200 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950/80 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isCompleted ? "stroke-[3]" : ""}`} />
                  <span>{isCompleted ? "Selesai Dipraktikkan" : "Tandai Selesai"}</span>
                </button>
              )}

              <button
                id="btn-detail-close"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Tutup
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
