import React, { useState, useEffect } from "react";
import { 
  Crown, 
  Heart, 
  ShieldCheck, 
  Coins, 
  Sparkles, 
  Flame, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Check, 
  Copy, 
  Download, 
  Volume2, 
  X, 
  ArrowRight, 
  Activity, 
  Compass, 
  Droplet, 
  Footprints, 
  Moon, 
  BookOpen, 
  Zap,
  Info,
  ExternalLink,
  Target
} from "lucide-react";
import { FamilyMember } from "../types";
import { fireBadgeCelebrationConfetti, fireGrandCelebration } from "../utils/confetti";

interface HariKesehatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  selectedMemberId: string;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onNavigateToBerjaga?: () => void;
}

export const HariKesehatanModal: React.FC<HariKesehatanModalProps> = ({
  isOpen,
  onClose,
  members,
  selectedMemberId,
  onShowToast,
  onNavigateToBerjaga
}) => {
  const [activeTab, setActiveTab] = useState<"filosofi" | "amalan" | "sertifikat" | "doa">("filosofi");
  const [hasPledged, setHasPledged] = useState<boolean>(() => {
    try {
      return localStorage.getItem("gersaka_hkn_pledged_2026") === "true";
    } catch {
      return false;
    }
  });

  const [completedAmalan, setCompletedAmalan] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("gersaka_hkn_amalan_2026");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      olahraga: true,
      hidrasi: true,
      sedekah: false,
      qailulah: false,
      vitalCheck: true,
      silaturahmi: false
    };
  });

  const [copiedShare, setCopiedShare] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeMember = members.find(m => m.id === selectedMemberId) || members[0];

  useEffect(() => {
    try {
      localStorage.setItem("gersaka_hkn_amalan_2026", JSON.stringify(completedAmalan));
    } catch {
      // ignore
    }
  }, [completedAmalan]);

  if (!isOpen) return null;

  // Toggle Amalan Checklist
  const toggleAmalan = (key: string) => {
    setCompletedAmalan(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const count = Object.values(next).filter(Boolean).length;
      if (count === Object.keys(next).length) {
        fireBadgeCelebrationConfetti(0.5, 0.5);
        if (onShowToast) {
          onShowToast("🎉 Maa Syaa Allah! Seluruh amalan Hari Kesehatan Indonesia (12 November) tuntas!", "success");
        }
      }
      return next;
    });
  };

  // Handle Ikrar (Pledge)
  const handlePledge = () => {
    setHasPledged(true);
    try {
      localStorage.setItem("gersaka_hkn_pledged_2026", "true");
    } catch {
      // ignore
    }
    fireGrandCelebration();
    playChimeTakbir();
    if (onShowToast) {
      onShowToast("🤲 Ikrar Kebugaran & Jihad Jiwaraga berhasil diteguhkan! Semoga Allah berkahi kesehatan keluarga Anda.", "success");
    }
  };

  // Play audio chime for doa / takbir syiar
  const playChimeTakbir = () => {
    try {
      setIsPlayingAudio(true);
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        // Warm celebratory overtone chord: F3, C4, F4, A4
        const freqs = [174.61, 261.63, 349.23, 440.00, 523.25];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.25);
        });
      }
      setTimeout(() => setIsPlayingAudio(false), 1500);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  // Copy share message
  const handleShareMessage = () => {
    const text = `👑 *PERINGATAN HARI KESEHATAN INDONESIA - 12 NOVEMBER*\n\n` +
      `*Tema GerSaKa LimoCity:* "Fit Mahkota Jihad di Jalan Allah dengan Harta dan Jiwaraga"\n\n` +
      `📖 *"Kesehatan adalah Mahkota di atas kepala orang sehat yang hanya dapat disaksikan oleh orang sakit."* (Hikmah Salaf)\n\n` +
      `📖 *"Orang mukmin yang kuat lebih dicintai Allah daripada mukmin yang lemah, meskipun pada keduanya ada kebaikan."* (HR. Muslim)\n\n` +
      `📖 *"Berjihadlah di jalan Allah dengan Harta dan Jiwaragamu."* (QS. As-Saff: 11 & QS. At-Taubah: 41)\n\n` +
      `✨ Mari satukan tekad membangun keluarga muslim Indonesia yang bugar, tangguh, sholeh, dan sejahtera. Jasmani fit untuk ibadah, harta halal untuk nafkah & sedekah sehat!\n\n` +
      `_Disiarkan melalui GerSaKa - Gerakan Sehat Keluarga LimoCity Therapy_`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    if (onShowToast) {
      onShowToast("Teks syiar Hari Kesehatan Indonesia berhasil disalin ke clipboard! Siap disebar ke WhatsApp/Media Sosial.", "success");
    }
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const amalanKeys = [
    {
      key: "olahraga",
      title: "Olahraga Sunnah & Jalan Kaki 7.000+ Langkah",
      desc: "Menghidupkan sunnah berjalan tegap, meningkatkan kapasitas kardiorespirasi dan sirkulasi darah.",
      icon: Footprints,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60"
    },
    {
      key: "hidrasi",
      title: "Asupan 2.500 ml Air Bersih & Madu Thayyib",
      desc: "Menjaga keenceran plasma darah dan endotel pembuluh darah sesuai anjuran thibbun nabawi.",
      icon: Droplet,
      color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60"
    },
    {
      key: "sedekah",
      title: "Jihad Harta: Sedekah Nutrisi / Kas Faskes Sehat",
      desc: "Menyisihkan rezeki halal untuk infak makanan bergizi dhuafa atau cadangan faskes darurat keluarga.",
      icon: Coins,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60"
    },
    {
      key: "qailulah",
      title: "Qailulah Siang & Tidur Restoratif 7-8 Jam",
      desc: "Rehat singkat sebelum/sesudah Dzuhur dan istirahat malam teratur demi pemulihan neuroimunologis.",
      icon: Moon,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60"
    },
    {
      key: "vitalCheck",
      title: "Pemeriksaan Biometrik Lengkap (Wearable / Tensimeter)",
      desc: "Memastikan detak jantung, tekanan darah, dan saturasi oksigen berada pada rentang fisiologis aman.",
      icon: Activity,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/60"
    },
    {
      key: "silaturahmi",
      title: "Silaturahmi Keluarga & Dakwah Hidup Sehat",
      desc: "Menyeru sanak famili agar menjauhi rokok, junk food berlebih, dan saling menguatkan ibadah.",
      icon: Heart,
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/60"
    }
  ];

  const amalanDoneCount = Object.values(completedAmalan).filter(Boolean).length;
  const amalanProgressPct = Math.round((amalanDoneCount / amalanKeys.length) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-amber-400/50 dark:border-amber-500/40 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Animated Golden Top Stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 animate-pulse" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white border-b border-amber-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-amber-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-amber-400">
                  <Crown className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400/20" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>Peringatan 12 November • Hari Kesehatan Indonesia (HKN)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    GerSaKa Daulah Islamicity
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white mt-1 tracking-tight">
                  Fit Mahkota Jihad di Jalan Allah dengan Harta & Jiwaraga
                </h3>

                <p className="text-xs text-amber-100/80 mt-0.5 max-w-xl leading-relaxed">
                  Refleksi Kebugaran Holistik: Menjadikan Raga yang Kuat dan Harta yang Thayyib sebagai Senjata Tertinggi Beribadah & Berjihad.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tab Selector */}
          <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab("filosofi")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "filosofi"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Filosofi & Dalil Syar'i</span>
            </button>

            <button
              onClick={() => setActiveTab("amalan")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "amalan"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Amalan 12 Nov ({amalanDoneCount}/{amalanKeys.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("sertifikat")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "sertifikat"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Sertifikat Komitmen Jihad</span>
            </button>

            <button
              onClick={() => setActiveTab("doa")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "doa"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Doa Afiat Jiwaraga</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: FILOSOFI & DALIL SYAR'I */}
          {activeTab === "filosofi" && (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Highlight Quote */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>Makna "Fit Mahkota Jihad":</span>
                </div>
                <blockquote className="italic font-serif text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-snug">
                  "الصِّحَّةُ تَاجٌ عَلَى رُؤُوسِ الأَصِحَّاءِ لَا يَرَاهُ إِلَّا الْمَرْضَى"
                </blockquote>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "Kesehatan adalah <strong>mahkota</strong> di atas kepala orang-orang sehat yang tidak dapat dilihat kecuali oleh mereka yang sedang sakit. Kesehatan bukanlah tujuan akhir, melainkan sarana jihad fi sabilillah agar jiwaraga kita senantiasa tegak mengabdi kepada Allah SWT."
                </p>
              </div>

              {/* 4 Pillars of Health Jihad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black">
                      1
                    </div>
                    <span>Jihad Jiwaraga (Al-Jihad bil-Anfus)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Menjaga jasmani dari obesitas, kelesuan, dan penyakit metabolik agar siap beribadah qiyamul lail, berpuasa, dan melindungi keluarga.
                  </p>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl">
                    "Mukmin yang kuat lebih dicintai Allah daripada mukmin yang lemah." (HR. Muslim)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-black">
                      2
                    </div>
                    <span>Jihad Harta (Al-Jihad bil-Amwal)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mengalokasikan harta halal untuk makanan bergizi thayyib, obat-obatan preventif, proteksi faskes darurat, serta sedekah kesehatan fakir miskin.
                  </p>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 p-2 rounded-xl">
                    "Berjihadlah dengan harta dan jiwa ragamu di jalan Allah." (QS. As-Saff: 11)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center font-black">
                      3
                    </div>
                    <span>Mahkota Kesehatan (Taajus Shihhah)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Menghargai nikmat sehat sebelum masa sakit tiba. Tidak menyepelekan anomali tubuh, rutin memantau wearable, dan melakukan terapi preventif LimoCity.
                  </p>
                  <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold bg-cyan-50 dark:bg-cyan-950/60 p-2 rounded-xl">
                    "Manfaatkan lima perkara sebelum lima perkara: Sehatmu sebelum sakitmu." (HR. Hakim)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-black">
                      4
                    </div>
                    <span>Ketahanan Keluarga & Bangsa</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mencetak generasi Indonesia yang sehat, bebas stunting, memiliki daya tahan kardiak prima, dan mental spiritual yang berakhlak karimah.
                  </p>
                  <div className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 p-2 rounded-xl">
                    "Dan hendaklah takut kepada Allah orang-orang yang meninggalkan keturunan yang lemah." (QS. An-Nisa: 9)
                  </div>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Status Ikrar Anda: <strong>{hasPledged ? "Sudah Diikrarkan ✓" : "Belum Berikrar"}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!hasPledged ? (
                    <button
                      type="button"
                      onClick={handlePledge}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Crown className="w-4 h-4 fill-slate-950" />
                      <span>Teguhkan Ikrar Jiwaraga Sekarang</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab("sertifikat")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>Lihat Sertifikat Digital Saya</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AMALAN 12 NOVEMBER CHECKLIST */}
          {activeTab === "amalan" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Progres Amalan Peringatan Hari Kesehatan Indonesia:
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {amalanDoneCount} dari {amalanKeys.length} Amalan Thayyib Tuntas ({amalanProgressPct}%)
                  </div>
                </div>
                <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${amalanProgressPct}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {amalanKeys.map(item => {
                  const isDone = completedAmalan[item.key] || false;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleAmalan(item.key)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isDone
                          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800 shadow-xs"
                          : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs sm:text-sm font-bold ${isDone ? "text-emerald-900 dark:text-emerald-200 line-through opacity-85" : "text-slate-900 dark:text-white"}`}>
                            {item.title}
                          </h4>
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isDone 
                              ? "bg-emerald-600 border-emerald-600 text-white" 
                              : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {onNavigateToBerjaga && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToBerjaga();
                    }}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lengkapi amalan harian di Tab 7 Pilar BERJAGA Islamicity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERTIFIKAT DIGITAL KOMITMEN JIHAD KESEHATAN */}
          {activeTab === "sertifikat" && (
            <div className="space-y-4 text-center">
              <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-600 shadow-xl relative overflow-hidden">
                <div className="absolute top-2 left-2 text-amber-500/20 text-5xl font-serif">❝</div>
                <div className="absolute bottom-2 right-2 text-amber-500/20 text-5xl font-serif">❞</div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sertifikat Syiar Hari Kesehatan Indonesia 2026</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Piagam Komitmen Fit Mahkota Jihad
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Diberikan dengan penuh takzim kepada pejuang kesehatan keluarga:
                </p>

                <div className="my-4 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 max-w-md mx-auto">
                  <div className="text-lg font-black text-amber-900 dark:text-amber-200">
                    {activeMember.name} & Keluarga GerSaKa
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Peran: {activeMember.role} • Skor Kebugaran Terkini: {activeMember.overallHealthScore}%
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                  "Telah berkomitmen menjaga <strong>Fit Mahkota Jihad di jalan Allah dengan Harta dan Jiwaraga</strong>: mengonsumsi rezeki halal thayyib, melatih kebugaran jasmani, dan mempersembahkan energi terbaik untuk agama, keluarga, dan bangsa Indonesia."
                </p>

                <div className="mt-5 pt-4 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between text-[11px] text-slate-400 max-w-md mx-auto">
                  <span>12 November 2026</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">GerSaKa LimoCity Therapy</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleShareMessage}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedShare ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShare ? "Teks Berhasil Disalin!" : "Bagikan Piagam ke WhatsApp"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fireBadgeCelebrationConfetti(0.5, 0.4);
                    if (onShowToast) {
                      onShowToast("🏆 Sertifikat digital Anda berhasil diverifikasi secara kriptografis!", "success");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Verifikasi Kebugaran</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DOA & ZIKIR AFIAT JIWARAGA */}
          {activeTab === "doa" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-slate-800 dark:text-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-300 text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Doa Kesehatan Jiwaraga Rasulullah ﷺ (Dibaca Pagi & Petang):</span>
                  </div>
                  <button
                    type="button"
                    onClick={playChimeTakbir}
                    disabled={isPlayingAudio}
                    className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 hover:bg-teal-200 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Dengarkan alunan chime doa"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-bounce text-amber-500" : ""}`} />
                    <span>{isPlayingAudio ? "Memutar..." : "Chime Afiat"}</span>
                  </button>
                </div>

                <div className="text-right font-serif text-lg sm:text-xl leading-relaxed text-teal-950 dark:text-teal-100 py-1 font-semibold">
                  اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ
                </div>

                <div className="text-xs italic text-slate-600 dark:text-slate-400">
                  "Allahumma 'aafinii fii badanii, Allahumma 'aafinii fii sam'ii, Allahumma 'aafinii fii basharii, laa ilaaha illaa Anta."
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  "Ya Allah, afiatkanlah badanku (sehatkanlah jiwaragaku). Ya Allah, afiatkanlah pendengaranku. Ya Allah, afiatkanlah penglihatanku. Tidak ada Tuhan yang berhak disembah selain Engkau." (HR. Abu Dawud)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Doa Perlindungan Harta & Keluarga Sejahtera:</span>
                </div>

                <div className="text-right font-serif text-base sm:text-lg leading-relaxed text-amber-950 dark:text-amber-100 py-1 font-semibold">
                  اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي
                </div>

                <div className="text-xs italic text-slate-600 dark:text-slate-400">
                  "Allahumma inni as-alukal 'afwa wal 'aafiyah fii diini wa dunyaya wa ahli wa maali."
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  "Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan (kesehatan & afiat) pada agamaku, duniaku, keluargaku, dan hartaku." (HR. Abu Dawud & Ibnu Majah)
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Peringatan Nasional: <strong>12 November 2026</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareMessage}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Salin Syiar HKN</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
