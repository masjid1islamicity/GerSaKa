import React, { useState, useEffect, useMemo } from "react";
import { FamilyMember } from "../types";
import { 
  BerjagaPillarId, 
  SUNNAH_BEKAM_POINTS, 
  DAILY_HADITH_COLLECTION, 
  HALAL_THAYYIB_AUDIT_ITEMS, 
  getEstimatedHijriDate, 
  calculateBerjagaHolisticScore,
  BekamPoint,
  DailyHadithCard,
  HalalAuditItem
} from "../utils/berjagaData";
import { 
  Sparkles, 
  Activity, 
  Briefcase, 
  HeartHandshake, 
  Share2, 
  Scale, 
  Users, 
  Coins, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Check, 
  AlertCircle, 
  Flame, 
  ShieldCheck, 
  Compass, 
  Footprints, 
  Heart, 
  Droplet, 
  Clock, 
  Sun, 
  Moon, 
  Copy, 
  ExternalLink, 
  Download, 
  Printer, 
  Sliders, 
  Search, 
  Plus, 
  Volume2, 
  Stethoscope,
  Info,
  ChevronRight,
  Eye,
  Smile,
  Zap,
  Target
} from "lucide-react";
import { fireBadgeCelebrationConfetti, fireGrandCelebration } from "../utils/confetti";
import { playHydrationSoundChime } from "../utils/smartHydration";

interface IslamicityBerjagaViewProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onNavigateToFamily?: () => void;
  onNavigateToDoctor?: () => void;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
}

export const IslamicityBerjagaView: React.FC<IslamicityBerjagaViewProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onShowToast,
  onNavigateToFamily,
  onNavigateToDoctor,
  onSyncWearable,
  isSyncing = false,
}) => {
  const activeMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  // Active pillar tab
  const [activePillar, setActivePillar] = useState<BerjagaPillarId>("bergerak");

  // Hijri Date and Sunnah Bekam calculation
  const hijriInfo = useMemo(() => {
    return getEstimatedHijriDate(new Date());
  }, []);

  // Storage key for daily completed checklist
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const storageKey = `islamicity_berjaga_actions_${activeMember.id}_${todayDateStr}`;

  // Default checklist for all 7 pillars
  const defaultActionState: Record<string, boolean> = {
    // Bergerak
    "act-bergerak-1": true,  // Jalan pagi bada Subuh
    "act-bergerak-2": false, // Olahraga Sunnah 30 menit
    "act-bergerak-3": true,  // Peregangan sendi rukuk-sujud
    // Bekerja
    "act-bekerja-1": true,   // Niat ibadah & doa kasb halal
    "act-bekerja-2": false,  // Istirahat mata 20-20-20 teratur
    "act-bekerja-3": true,   // Batas jam kerja sehat tanpa burnout
    // Berbekam
    "act-bekekam-1": true,   // Cek tensi sebelum hijamah
    "act-bekekam-2": false,  // Booking jadwal tanggal sunnah 17, 19, 21
    "act-bekekam-3": true,   // Minum air madu hangat paska terapi
    // Berdakwah
    "act-dakwah-1": true,    // Baca mutiara hadits kesehatan harian
    "act-dakwah-2": false,   // Bagikan inspirasi sehat ke grup keluarga
    "act-dakwah-3": true,    // Ajak keluarga konsumsi air putih thayyib
    // Bersyariah
    "act-syariah-1": true,   // Pastikan obat & suplemen halal bersertifikat
    "act-syariah-2": true,   // Kurangi garam & gula rafinasi berlebih
    "act-syariah-3": false,  // Evaluasi 5 Maqashid Syariah keluarga
    // Berjamaah
    "act-jamaah-1": true,    // Shalat fardhu berjamaah di masjid
    "act-jamaah-2": false,   // Olahraga santai bareng warga Ahad pagi
    "act-jamaah-3": true,    // Doakan kerabat atau tetangga yang sakit
    // Bermuamalah
    "act-muamalah-1": true,  // Sedekah Subuh / infaq sehat harian
    "act-muamalah-2": false, // Alokasi tabungan darurat thayyib keluarga
    "act-muamalah-3": true,  // Belanja produk herbal jujur tanpa riba
  };

  const [actionsCompleted, setActionsCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultActionState;
  });

  // Re-sync storage on member change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setActionsCompleted(JSON.parse(saved));
      } else {
        setActionsCompleted(defaultActionState);
      }
    } catch {
      setActionsCompleted(defaultActionState);
    }
  }, [storageKey]);

  const toggleAction = (actionId: string, title: string) => {
    const nextState = !actionsCompleted[actionId];
    const updated = {
      ...actionsCompleted,
      [actionId]: nextState,
    };
    setActionsCompleted(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (nextState) {
      playHydrationSoundChime("optimal");
      fireBadgeCelebrationConfetti(0.5, 0.6);
      if (onShowToast) {
        onShowToast(`🌟 Alhamdulillah! Amalan '${title}' telah dituntaskan.`, "success");
      }
    } else {
      if (onShowToast) {
        onShowToast(`Status amalan '${title}' direset.`, "info");
      }
    }
  };

  // Holistic score calculation
  const totalActionCount = Object.keys(actionsCompleted).length;
  const completedActionCount = Object.values(actionsCompleted).filter(Boolean).length;

  const holisticScore = useMemo(() => {
    return calculateBerjagaHolisticScore(activeMember, completedActionCount, totalActionCount);
  }, [activeMember, completedActionCount, totalActionCount]);

  // Modal / Tab States for specific pillars
  // 1. Bergerak state
  const [sportsCategory, setSportsCategory] = useState<"jalan" | "renang" | "panahan" | "bersepeda">("jalan");
  const [sportsDurationMin, setSportsDurationMin] = useState(30);

  // 2. Bekerja ergonomis timer
  const [workTimerActive, setWorkTimerActive] = useState(false);
  const [workTimerSeconds, setWorkTimerSeconds] = useState(20 * 60); // 20 mins for 20-20-20 rule

  useEffect(() => {
    let interval: any = null;
    if (workTimerActive && workTimerSeconds > 0) {
      interval = setInterval(() => {
        setWorkTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (workTimerSeconds === 0) {
      setWorkTimerActive(false);
      setWorkTimerSeconds(20 * 60);
      playHydrationSoundChime("optimal");
      if (onShowToast) {
        onShowToast("⏰ Aturan 20-20-20: Istirahatkan mata Anda, pandang objek 6 meter selama 20 detik!", "warning");
      }
    }
    return () => clearInterval(interval);
  }, [workTimerActive, workTimerSeconds]);

  // 3. Berbekam Booking State
  const [selectedBekamPoint, setSelectedBekamPoint] = useState<BekamPoint>(SUNNAH_BEKAM_POINTS[0]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("2026-10-03"); // Next sunnah date
  const [therapistPreference, setTherapistPreference] = useState("Ust. Ahmad Subhan (Terapis PBI Senior)");

  // 4. Berdakwah Hadith Selection
  const [selectedHadith, setSelectedHadith] = useState<DailyHadithCard>(DAILY_HADITH_COLLECTION[0]);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyHadith = (hadith: DailyHadithCard) => {
    navigator.clipboard.writeText(hadith.sharableText);
    setCopySuccess(true);
    if (onShowToast) {
      onShowToast("Teks Mutiara Hadits disalin ke clipboard! Siap dibagikan ke WhatsApp.", "success");
    }
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // 5. Bersyariah Halal Filter
  const [halalSearch, setHalalSearch] = useState("");
  const filteredHalalItems = useMemo(() => {
    return HALAL_THAYYIB_AUDIT_ITEMS.filter(item => 
      item.productName.toLowerCase().includes(halalSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(halalSearch.toLowerCase()) ||
      item.brandOrSource.toLowerCase().includes(halalSearch.toLowerCase())
    );
  }, [halalSearch]);

  // 6. Berjamaah Masjid & Prayer Times
  const prayerTimes = useMemo(() => ({
    subuh: "04:35",
    syuruq: "05:48",
    dzuhur: "11:54",
    ashar: "15:08",
    maghrib: "17:58",
    isya: "19:07",
    nextPrayer: "Ashar",
    countdownMinutes: 42
  }), []);

  // 7. Bermuamalah Ta'awun simulation
  const [donationAmount, setDonationAmount] = useState(50000);
  const [isDonationSuccess, setIsDonationSuccess] = useState(false);

  const handleSimulateTaawun = () => {
    setIsDonationSuccess(true);
    fireGrandCelebration();
    if (onShowToast) {
      onShowToast(`Barakallah! Sedekah Sehat Rp ${donationAmount.toLocaleString("id-ID")} disalurkan ke Kas Ta'awun Dhuafa LimoCity.`, "success");
    }
    setTimeout(() => setIsDonationSuccess(false), 3000);
  };

  // 8. Bahagia Sejahtera Certificate Modal
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // Pillars Definition
  const pillars = [
    {
      id: "bergerak" as BerjagaPillarId,
      letter: "B",
      name: "Bergerak",
      sub: "Aktivitas Fisik & Olahraga Sunnah",
      icon: Footprints,
      color: "emerald",
      badge: "Kebugaran Fisik",
    },
    {
      id: "bekerja" as BerjagaPillarId,
      letter: "B",
      name: "Bekerja",
      sub: "Etos Kerja Halal & Produktif",
      icon: Briefcase,
      color: "teal",
      badge: "Kasb Halal",
    },
    {
      id: "berbekam" as BerjagaPillarId,
      letter: "B",
      name: "Berbekam",
      sub: "Thibbun Nabawi Al-Hijamah",
      icon: Droplet,
      color: "red",
      badge: "Detoks Sunnah",
    },
    {
      id: "berdakwah" as BerjagaPillarId,
      letter: "B",
      name: "Berdakwah",
      sub: "Siar Kebaikan & Edukasi Sehat",
      icon: Share2,
      color: "cyan",
      badge: "Nasihat Thayyib",
    },
    {
      id: "bersyariah" as BerjagaPillarId,
      letter: "B",
      name: "Bersyariah",
      sub: "Halalan Thayyiban & Maqashid",
      icon: Scale,
      color: "indigo",
      badge: "Hifzh An-Nafs",
    },
    {
      id: "berjamaah" as BerjagaPillarId,
      letter: "B",
      name: "Berjamaah",
      sub: "Shalat & Solidaritas Keluarga",
      icon: Users,
      color: "purple",
      badge: "Ukhuwah Sehat",
    },
    {
      id: "bermuamalah" as BerjagaPillarId,
      letter: "B",
      name: "Bermuamalah",
      sub: "Ta'awun, Infaq & Tabungan Halal",
      icon: Coins,
      color: "amber",
      badge: "Sedekah Berkah",
    },
    {
      id: "bahagia_sejahtera" as BerjagaPillarId,
      letter: "★",
      name: "Bahagia Sejahtera",
      sub: "Puncak Falah Dunia-Akhirat",
      icon: Award,
      color: "yellow",
      badge: "Sakinah Mawaddah",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER: ISLAMICITY BERJAGA PHILOSOPHY & FAMILY SCORE */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-800/60 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        
        {/* Islamic Geometric Motif Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Bar: Hijri Date Indicator & Wearable Live Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs">
            
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span>{hijriInfo.day} {hijriInfo.monthName} {hijriInfo.year} H</span>
              </span>

              {hijriInfo.isSunnahBekamDay ? (
                <span className="px-3 py-1 rounded-full bg-red-900/80 text-red-200 border border-red-500/50 font-bold flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Hari Sunnah Bekam (Tgl {hijriInfo.day} Hijriah)!</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-teal-400" />
                  <span>{hijriInfo.daysUntilNextSunnahBekam} Hari Menuju Sunnah Bekam (Tgl {hijriInfo.nextSunnahBekamHijriDay} H)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Anggota Aktif: <strong className="text-white">{activeMember.name} ({activeMember.role})</strong>
              </span>

              {onSyncWearable && (
                <button
                  type="button"
                  onClick={onSyncWearable}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-teal-800/60 hover:bg-teal-700 text-teal-200 border border-teal-600/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-300" : "text-teal-300"}`} />
                  <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Sensor"}</span>
                </button>
              )}
            </div>

          </div>

          {/* Center Brand & Philosophy */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gerakan Hidup Berkah & Sehat Keluarga Daulah</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Islamicity <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">BERJAGA</span>
              </h1>

              <p className="text-sm sm:text-base text-teal-100/90 font-medium leading-relaxed max-w-3xl">
                <strong>B</strong>ergerak, <strong>B</strong>ekerja, <strong>B</strong>erbekam, <strong>B</strong>erdakwah, <strong>B</strong>ersyariah, <strong>B</strong>erjamaah, <strong>B</strong>ermuamalah — <span className="text-amber-300 font-bold underline decoration-amber-400/50">Sampai Bahagia Sejahtera</span>.
              </p>

              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Sinergi komprehensif antara sains kedokteran preventif modern, telemetri wearable cerdas, dan sunnah Thibbun Nabawi untuk membangun keluarga yang tangguh fisiknya, tenang hatinya, dan barakah kehidupannya.
              </p>
            </div>

            {/* Right Card: Holistic Score Ring */}
            <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-teal-200 font-bold uppercase tracking-wider">
                  Skor Holistik Berjaga
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {holisticScore.statusBadge}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {holisticScore.overallScore}
                </div>
                <div className="text-xs text-slate-300">
                  <p className="font-bold text-teal-300">/ 100 Indeks Falah</p>
                  <p className="text-[11px] text-slate-400 font-medium">{holisticScore.tierName}</p>
                </div>
              </div>

              {/* Maqashid Syariah Mini Compliance Bar */}
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>Kepatuhan 5 Maqashid Syariah:</span>
                  <span className="font-bold text-emerald-300">Tinggi (98%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    style={{ width: `${holisticScore.overallScore}%` }} 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCertificateOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Lihat Piagam Keluarga Berjaga</span>
              </button>
            </div>

          </div>

          {/* Member Switcher Strip */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 shrink-0 font-medium mr-1">Pilih Anggota:</span>
            {members.map(m => {
              const isSelected = m.id === activeMember.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMember(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected 
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-400/40"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                  }`}
                >
                  <img src={m.avatarUrl} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{m.name.split(" ")[0]}</span>
                  <span className="text-[10px] opacity-75 font-normal">({m.role})</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. PILLAR NAVIGATION TABS (THE 7 PILLARS + 1 BAHAGIA SEJAHTERA) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {pillars.map((p) => {
            const isActive = activePillar === p.id;
            const Icon = p.icon;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePillar(p.id)}
                className={`p-2.5 sm:p-3 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer relative ${
                  isActive
                    ? "bg-gradient-to-b from-teal-50 to-emerald-50/80 dark:from-teal-950/60 dark:to-emerald-950/40 text-teal-800 dark:text-teal-200 border-2 border-teal-500 dark:border-teal-400 shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-transparent"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                  isActive 
                    ? "bg-teal-600 text-white shadow-xs" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="w-full">
                  <div className="font-black text-xs leading-tight truncate">
                    {p.name}
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                    {p.badge}
                  </div>
                </div>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 absolute top-1.5 right-1.5 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC CONTENT PER PILLAR */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 1: BERGERAK (AKTIVITAS FISIK & OLAHRAGA SUNNAH) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "bergerak" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    Pilar 1: Bergerak (Al-Harakah)
                  </span>
                  <span className="text-xs text-slate-500">
                    Kebugaran Fisik Sunnah Rasulullah ﷺ
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Bergerak: Kebugaran Kardiovaskular & Olahraga Sunnah
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Menjaga tubuh tetap aktif dan kuat. Rasulullah ﷺ bersabda bahwa mukmin yang kuat lebih dicintai Allah daripada mukmin yang lemah (HR. Muslim).
                </p>
              </div>

              {/* Wearable Live Telemetry Mini-Strip */}
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                <div className="text-center px-2">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Langkah Hari Ini</div>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    {activeMember.vitals.steps.toLocaleString()}
                  </div>
                </div>
                <div className="w-px h-8 bg-emerald-200 dark:bg-emerald-800" />
                <div className="text-center px-2">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Kalori Aktif</div>
                  <div className="text-lg font-black text-orange-600 dark:text-orange-400 font-mono">
                    {activeMember.vitals.activeCalories} kkal
                  </div>
                </div>
                <div className="w-px h-8 bg-emerald-200 dark:bg-emerald-800" />
                <div className="text-center px-2">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Denyut Nadi</div>
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                    {activeMember.vitals.heartRate} BPM
                  </div>
                </div>
              </div>
            </div>

            {/* Sunnah Sports Selection & Logger */}
            <div className="space-y-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Pilih & Catat Aktivitas Olahraga Sunnah Hari Ini:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: "jalan",
                    title: "Jalan Cepat & Tegap",
                    arabic: "المشي السريع",
                    benefits: "Melancarkan sirkulasi pembuluh darah & menstabilkan tensi vaskular.",
                    icon: Footprints,
                    estCal: "140 kkal / 30 mnt"
                  },
                  {
                    id: "renang",
                    title: "Berenang (As-Sibahah)",
                    arabic: "السباحة",
                    benefits: "Dekrompresi sendi tulang belakang, ekspansi paru, dan daya tahan jantung.",
                    icon: Droplet,
                    estCal: "220 kkal / 30 mnt"
                  },
                  {
                    id: "panahan",
                    title: "Memanah (Ar-Ramy)",
                    arabic: "الرمي",
                    benefits: "Fokus konsentrasi tinggi, postur tulang belikat, dan stabilitas saraf motorik.",
                    icon: Target,
                    estCal: "120 kkal / 30 mnt"
                  },
                  {
                    id: "bersepeda",
                    title: "Berkuda / Bersepeda",
                    arabic: "ركوب الخيل",
                    benefits: "Keseimbangan otot panggul (pelvic core) dan fleksibilitas lutut.",
                    icon: Zap,
                    estCal: "190 kkal / 30 mnt"
                  },
                ].map((sport) => {
                  const isSelected = sportsCategory === sport.id;
                  const Icon = sport.icon;
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => setSportsCategory(sport.id as any)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-arabic text-sm text-slate-400 font-bold">{sport.arabic}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{sport.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{sport.benefits}</p>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-700">
                        {sport.estCal}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Logger Control */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Durasi Sesi: <strong>{sportsDurationMin} Menit</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    {[15, 30, 45, 60].map(min => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setSportsDurationMin(min)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          sportsDurationMin === min 
                            ? "bg-emerald-600 text-white shadow-xs" 
                            : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playHydrationSoundChime("optimal");
                    fireBadgeCelebrationConfetti(0.5, 0.6);
                    if (onShowToast) {
                      onShowToast(`💪 Alhamdulillah! Sesi olahraga sunnah ${sportsDurationMin} menit berhasil dicatat untuk ${activeMember.name}!`, "success");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Sesi Olahraga Sunnah</span>
                </button>
              </div>

            </div>

            {/* Checklist Bergerak */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Amalan Harian Pilar Bergerak:
              </h3>
              <div className="space-y-2">
                {[
                  { id: "act-bergerak-1", title: "Jalan santai/tegap 20-30 menit bada Subuh", desc: "Menghirup udara kaya ozon alami fajar untuk aktivasi endotel vaskular." },
                  { id: "act-bergerak-2", title: "Latihan olahraga sunnah teratur (renang / panahan / sepeda)", desc: "Menjaga massa otot rangka dan daya tahan kardiovaskular." },
                  { id: "act-bergerak-3", title: "Peregangan sendi rukuk dan sujud sempurna", desc: "Mencegah osteopenia lutut dan dekompresi tulang belakang lumbal." },
                ].map(act => (
                  <div 
                    key={act.id}
                    onClick={() => toggleAction(act.id, act.title)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 flex items-start gap-3 cursor-pointer transition-all"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      actionsCompleted[act.id] ? "bg-emerald-600 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}>
                      {actionsCompleted[act.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${actionsCompleted[act.id] ? "text-emerald-700 dark:text-emerald-300 line-through" : "text-slate-800 dark:text-white"}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 2: BEKERJA (ETOS KERJA HALAL & PRODUKTIF) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "bekerja" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300">
                    Pilar 2: Bekerja (Kasb Halal)
                  </span>
                  <span className="text-xs text-slate-500">
                    Nafkah Thayyib & Ergonomi Sehat Bebas Burnout
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Bekerja: Etos Kerja Halal, Ergonomi & Stamina Thayyib
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Mencari nafkah halal adalah jihad fi sabilillah. Namun tubuh memiliki hak untuk beristirahat: postur ergonomis terjaga, mata terlindungi, dan waktu bersama keluarga terpelihara.
                </p>
              </div>

              {/* Doa Mulai Bekerja Card */}
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 max-w-sm">
                <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-300 tracking-wider">
                  Doa Memohon Rezeki Halal & Berkah:
                </span>
                <p className="font-arabic text-sm text-slate-800 dark:text-slate-100 mt-1 leading-relaxed text-right">
                  اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang thayyib (halal lagi baik), dan amal yang diterima." (HR. Ibnu Majah)
                </p>
              </div>
            </div>

            {/* Ergonomic Pomodoro & 20-20-20 Rule Timer */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-sm text-teal-200">
                    Pengingat Relaksasi Mata & Postur Layar (Aturan 20-20-20)
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-md">
                  Setiap 20 menit bekerja di depan komputer/ponsel, pandanglah objek sejauh 20 kaki (6 meter) selama 20 detik untuk mencegah ketegangan otot siliaris mata dan sindrom leher kaku.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-black font-mono text-teal-300 tracking-wider">
                    {String(Math.floor(workTimerSeconds / 60)).padStart(2, "0")}:{String(workTimerSeconds % 60).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-slate-400">Timer Istirahat Mata</div>
                </div>

                <button
                  type="button"
                  onClick={() => setWorkTimerActive(!workTimerActive)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    workTimerActive 
                      ? "bg-rose-600 hover:bg-rose-700 text-white" 
                      : "bg-teal-500 hover:bg-teal-600 text-slate-950"
                  }`}
                >
                  {workTimerActive ? "Hentikan Timer" : "Mulai Timer Bekerja"}
                </button>
              </div>
            </div>

            {/* Checklist Bekerja */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Amalan Harian Pilar Bekerja:
              </h3>
              <div className="space-y-2">
                {[
                  { id: "act-bekerja-1", title: "Awali pekerjaan dengan niat ibadah & doa kasb halal", desc: "Mencari rezeki halal untuk menafkahi keluarga demi keridhaan Allah Ta'ala." },
                  { id: "act-bekerja-2", title: "Terapkan aturan 20-20-20 dan peregangan leher saat duduk", desc: "Mencegah cervical syndrome dan kelelahan visual akibat paparan layar." },
                  { id: "act-bekerja-3", title: "Jaga batas jam kerja sehat tanpa burnout (Work-Life Balance)", desc: "Menunaikan hak tubuh untuk istirahat dan hak keluarga untuk bercengkerama." },
                ].map(act => (
                  <div 
                    key={act.id}
                    onClick={() => toggleAction(act.id, act.title)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-teal-400 flex items-start gap-3 cursor-pointer transition-all"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      actionsCompleted[act.id] ? "bg-teal-600 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}>
                      {actionsCompleted[act.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${actionsCompleted[act.id] ? "text-teal-700 dark:text-teal-300 line-through" : "text-slate-800 dark:text-white"}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 3: BERBEKAM (AL-HIJAMAH - THIBBUN NABAWI MEDIS) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "berbekam" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300">
                    Pilar 3: Berbekam (Al-Hijamah)
                  </span>
                  <span className="text-xs text-slate-500">
                    Thibbun Nabawi Terstandar Medis & Kalender Hijriah
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Berbekam: Terapi Sunnah Thibbun Nabawi & Titik Medis
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Rasulullah ﷺ bersabda: <em>"Sebaik-baik pengobatan yang kalian gunakan adalah berbekam..."</em> (HR. Bukhari & Muslim). Mengeluarkan sel darah merah rusak dan meringankan beban pembuluh darah.
                </p>
              </div>

              {/* Vitals Safety Screening Widget for Cupping */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Skrining Klinis Sebelum Bekam ({activeMember.name}):
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Tensi Saat Ini:</span>
                  <strong className="text-emerald-600 font-mono">{activeMember.vitals.bloodPressure} mmHg</strong>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-500">
                  Status: <strong>Aman untuk Bekam Sunnah</strong> (Tidak ada hipotensi & gula darah terkendali).
                </div>
              </div>
            </div>

            {/* Sunnah Calendar Alert Strip */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 text-white border border-red-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-xs text-red-200 uppercase tracking-wider">
                    Jadwal Sunnah Berbekam Bulan {hijriInfo.monthName} 1448 H:
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Tanggal Sunnah Utama: <strong>17, 19, dan 21 {hijriInfo.monthName}</strong>. 
                  {hijriInfo.isSunnahBekamDay ? " Hari ini adalah salah satu tanggal sunnah utama!" : ` Tersisa ${hijriInfo.daysUntilNextSunnahBekam} hari lagi menuju tanggal ${hijriInfo.nextSunnahBekamHijriDay} Hijriah.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Reservasi Sesi Bekam PBI</span>
              </button>
            </div>

            {/* Interactive Sunnah Bekam Points Explorer */}
            <div className="space-y-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-500" />
                <span>Eksplorasi Titik-Titik Bekam Sunnah & Anatomi Medis:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {SUNNAH_BEKAM_POINTS.map(point => {
                  const isSelected = selectedBekamPoint.id === point.id;
                  return (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => setSelectedBekamPoint(point)}
                      className={`p-3.5 rounded-2xl border text-left transition-all space-y-1.5 cursor-pointer ${
                        isSelected 
                          ? "bg-red-50 dark:bg-red-950/40 border-red-500 shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-red-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-arabic text-sm text-red-700 dark:text-red-400 font-bold">{point.nameArabic}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{point.anatomicalCode}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{point.nameLatin}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{point.location}</p>
                    </button>
                  );
                })}
              </div>

              {/* Point Detail Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        Titik {selectedBekamPoint.nameLatin} ({selectedBekamPoint.nameArabic})
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300">
                        {selectedBekamPoint.anatomicalCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Lokasi: {selectedBekamPoint.location}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedBekamPoint.recommendedSesi}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-700">
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Manfaat Klinis & Vaskular:</span>
                    </h5>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                      {selectedBekamPoint.clinicalBenefits.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Perhatian & Kontraindikasi:</span>
                    </h5>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                      {selectedBekamPoint.contraindications.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Checklist Berbekam */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Amalan Harian Pilar Berbekam:
              </h3>
              <div className="space-y-2">
                {[
                  { id: "act-bekekam-1", title: "Cek tekanan darah dan kondisi fisik terkini", desc: "Memastikan pasien dalam kondisi prima dan tidak mengalami kelelahan berat." },
                  { id: "act-bekekam-2", title: "Agendakan bekam rutin pada tanggal sunnah 17, 19, atau 21 Hijriah", desc: "Menyesuaikan gaya gravitasi bulan untuk efisiensi pembersihan darah kotor." },
                  { id: "act-bekekam-3", title: "Minum air madu hangat dan istirahat pasca bekam", desc: "Membantu rehidrasi seluler dan mempercepat pemulihan sirkulasi darah." },
                ].map(act => (
                  <div 
                    key={act.id}
                    onClick={() => toggleAction(act.id, act.title)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-red-400 flex items-start gap-3 cursor-pointer transition-all"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      actionsCompleted[act.id] ? "bg-red-600 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}>
                      {actionsCompleted[act.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${actionsCompleted[act.id] ? "text-red-700 dark:text-red-300 line-through" : "text-slate-800 dark:text-white"}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 4: BERDAKWAH (SIAR KEBAIKAN & EDUKASI SEHAT ISLAMI) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "berdakwah" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300">
                    Pilar 4: Berdakwah (Ad-Da'wah)
                  </span>
                  <span className="text-xs text-slate-500">
                    Tawashau bil Haq wa Tawashau bis Shabr
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Berdakwah: Siar Hidup Sehat & Mutiara Hadits Nabawi
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Saling menasihati dalam kebaikan dan kesehatan keluarga. Mengajak orang-orang tercinta menjauhi kebiasaan merusak tubuh dan istiqomah dalam pola hidup thayyib.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-800 dark:text-cyan-300 font-medium">
                💬 <strong>Siar Kebaikan:</strong> Bagikan nasihat sehat hari ini ke WhatsApp grup keluarga!
              </div>
            </div>

            {/* Daily Hadith Carousel / Card Showcase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-600" />
                  <span>Koleksi Mutiara Hadits Kesehatan Thibbun Nabawi:</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  {DAILY_HADITH_COLLECTION.map((h, idx) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedHadith(h)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedHadith.id === h.id 
                          ? "bg-cyan-600 text-white shadow-xs" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hadith Detailed Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white border border-cyan-800/60 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    Tema: {selectedHadith.theme}
                  </span>
                  <span className="text-[11px] text-slate-400">{selectedHadith.narrator}</span>
                </div>

                <div className="space-y-3">
                  <p className="font-arabic text-lg sm:text-xl text-right leading-loose text-cyan-100 font-medium">
                    {selectedHadith.arabic}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                    "{selectedHadith.translation}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hikmah Biologis & Medis:</span>
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {selectedHadith.healthWisdom}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tindakan Praktis Hari Ini:</span>
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {selectedHadith.actionAdvice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Yuk siarkan kebaikan ini untuk keselamatan dan kesehatan sesama.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHadith(selectedHadith)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccess ? "Tersalin!" : "Salin Teks Hadits"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Checklist Berdakwah */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Amalan Harian Pilar Berdakwah:
              </h3>
              <div className="space-y-2">
                {[
                  { id: "act-dakwah-1", title: "Membaca dan merenungi mutiara hadits kesehatan nabawi", desc: "Memperkaya wawasan kesehatan yang selaras dengan sunnah dan adab islami." },
                  { id: "act-dakwah-2", title: "Bagikan kutipan hadits / nasihat sehat ke grup WhatsApp keluarga", desc: "Menjadi pelopor dakwah hidup sehat dan saling mendoakan keselamatan." },
                  { id: "act-dakwah-3", title: "Ingatkan anak dan pasangan untuk cukup minum air putih thayyib", desc: "Membiasakan keluarga disiplin menjaga hidrasi seluler setiap hari." },
                ].map(act => (
                  <div 
                    key={act.id}
                    onClick={() => toggleAction(act.id, act.title)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 flex items-start gap-3 cursor-pointer transition-all"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      actionsCompleted[act.id] ? "bg-cyan-600 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}>
                      {actionsCompleted[act.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${actionsCompleted[act.id] ? "text-cyan-700 dark:text-cyan-300 line-through" : "text-slate-800 dark:text-white"}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 5: BERSYARIAH (HALALAN THAYYIBAN & MAQASHID SYARIAH) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "bersyariah" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300">
                    Pilar 5: Bersyariah (Asy-Syari'ah)
                  </span>
                  <span className="text-xs text-slate-500">
                    Konsumsi Halalan Thayyiban & 5 Maqashid Syariah
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Bersyariah: Integritas Halal-Thayyib & Maqashid Jiwa
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Menjaga setiap asupan makanan, obat, dan suplemen bebas dari unsur haram/syubhat. Menerapkan <em>Hifzh An-Nafs</em> (menjaga jiwa) dan <em>Hifzh Al-Aql</em> (menjaga akal).
                </p>
              </div>

              {/* 5 Maqashid Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["Hifzh An-Nafs (Jiwa)", "Hifzh Al-Aql (Akal)", "Hifzh Al-Mal (Harta)", "Hifzh An-Nasl (Keturunan)", "Hifzh Ad-Din (Agama)"].map((m, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Halal & Thayyib Directory & Audit */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Katalog Audit Halalan Thayyiban (Obat, Herbal & Suplemen):</span>
                </h3>
                
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari obat, herbal, no halal..."
                    value={halalSearch}
                    onChange={(e) => setHalalSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredHalalItems.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                          {item.productName}
                        </h4>
                        <p className="text-[10px] text-slate-500">{item.brandOrSource}</p>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 shrink-0">
                        {item.halalCertStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.clinicalNotes}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[10px] text-slate-500 font-mono">
                      <span>No. Sertifikat: {item.halalRegNo}</span>
                      <span className="text-emerald-600 font-bold">Skor Thayyib: {item.thayyibScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist Bersyariah */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Amalan Harian Pilar Bersyariah:
              </h3>
              <div className="space-y-2">
                {[
                  { id: "act-syariah-1", title: "Audit kehalalan seluruh obat farmasi, herbal & kapsul keluarga", desc: "Memastikan cangkang kapsul terbuat dari gelatin sapi halal bersertifikat." },
                  { id: "act-syariah-2", title: "Prinsip Thayyib: Batasi garam berlebih dan makanan berpengawet sintetis", desc: "Menjaga kesehatan vaskular dan tidak merusak tubuh dengan racun makanan." },
                  { id: "act-syariah-3", title: "Evaluasi 5 Maqashid Syariah dalam pengeluaran biaya kesehatan", desc: "Memprioritaskan pencegahan penyakit daripada biaya pengobatan darurat." },
                ].map(act => (
                  <div 
                    key={act.id}
                    onClick={() => toggleAction(act.id, act.title)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 flex items-start gap-3 cursor-pointer transition-all"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      actionsCompleted[act.id] ? "bg-indigo-600 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}>
                      {actionsCompleted[act.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${actionsCompleted[act.id] ? "text-indigo-700 dark:text-indigo-300 line-through" : "text-slate-800 dark:text-white"}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 6: BERJAMAAH (SHALAT, SILATURAHMI & KOMUNITAS) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "berjamaah" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                    Pilar 6: Berjamaah (Al-Jama'ah)
                  </span>
                  <span className="text-xs text-slate-500">
                    Shalat Fardhu di Masjid, Silaturahmi & Ukhuwah
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Berjamaah: Shalat di Masjid, Langkah Berkah & Silaturahmi
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Setiap langkah kaki menuju masjid menggugurkan satu dosa dan mengangkat satu derajat. Berjamaah menguatkan tali persaudaraan dan kesehatan mental keluarga.
                </p>
              </div>

              {/* Next Prayer Countdown Widget */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 shrink-0 text-center">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Shalat Berikutnya: {prayerTimes.nextPrayer}
                </div>
                <div className="text-xl font-black text-purple-900 dark:text-purple-100 font-mono mt-0.5">
                  {prayerTimes.ashar} WIB
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Tersisa ±{prayerTimes.countdownMinutes} menit lagi
                </div>
              </div>
            </div>

            {/* Prayer Times Grid */}
            <div className="space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Jadwal Waktu Shalat Fardhu Masjid LimoCity:</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { name: "Subuh", time: prayerTimes.subuh, note: "Pahala fajar & ozon" },
                  { name: "Syuruq", time: prayerTimes.syuruq, note: "Dzikir & jalan pagi" },
                  { name: "Dzuhur", time: prayerTimes.dzuhur, note: "Rehat qailulah" },
                  { name: "Ashar", time: prayerTimes.ashar, note: "Shalat Wustha" },
                  { name: "Maghrib", time: prayerTimes.maghrib, note: "Keluarga kumpul" },
                  { name: "Isya", time: prayerTimes.isya, note: "Tidur sirkadian awal" },
                ].map((pr, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{pr.name}</span>
                    <div className="text-base font-black text-slate-900 dark:text-white font-mono">{pr.time}</div>
                    <span className="text-[9px] text-purple-600 dark:text-purple-400">{pr.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Iyadatul Maridh (Doa Menjenguk Orang Sakit) */}
            <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-2">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 font-bold text-xs">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                <span>Sunnah Iyadatul Maridh (Mendoakan yang Sakit):</span>
              </div>
              <p className="font-arabic text-base text-right text-slate-900 dark:text-white leading-loose">
                أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                "Aku memohon kepada Allah Yang Maha Agung, Tuhan pemilik Arsy yang agung, agar menyembuhkanmu." (HR. Abu Dawud & At-Tirmidzi, dibaca 7x)
              </p>
            </div>

            {/* Checklist Berjamaah */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Amalan Harian Pilar Berjamaah:
              </h3>
              <div className="space-y-2">
                {[
                  { id: "act-jamaah-1", title: "Berjalan kaki menuju shalat fardhu berjamaah di masjid", desc: "Melipatgandakan pahala langkah dan menjaga kesehatan sendi serta kardiovaskular." },
                  { id: "act-jamaah-2", title: "Ikuti agenda Ahad Sehat Berjamaah / Senam Lansia LimoCity", desc: "Menjalin ukhuwah islamiyah dan silaturahmi dengan sesama warga." },
                  { id: "act-jamaah-3", title: "Menjenguk atau mendoakan kerabat/tetangga yang sedang sakit", desc: "Menebarkan empati dan kasih sayang yang mendatangkan rahmat Allah." },
                ].map(act => (
                  <div 
                    key={act.id}
                    onClick={() => toggleAction(act.id, act.title)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-purple-400 flex items-start gap-3 cursor-pointer transition-all"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      actionsCompleted[act.id] ? "bg-purple-600 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}>
                      {actionsCompleted[act.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${actionsCompleted[act.id] ? "text-purple-700 dark:text-purple-300 line-through" : "text-slate-800 dark:text-white"}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 7: BERMUAMALAH (TA'AWUN, INFAQ & TABUNGAN SEHAT) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "bermuamalah" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300">
                    Pilar 7: Bermuamalah (Al-Mu'amalah)
                  </span>
                  <span className="text-xs text-slate-500">
                    Ta'awun Kesehatan, Infaq Thayyib & Bebas Riba
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Bermuamalah: Ta'awun Medis, Sedekah Sehat & Finansial Syar'i
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Rasulullah ﷺ bersabda: <em>"Obatilah orang-orang yang sakit di antara kalian dengan sedekah"</em> (HR. Al-Baihaqi). Bermuamalah dengan kejujuran, tolong-menolong, dan tabungan darurat thayyib.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shrink-0 text-center">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Dana Ta'awun Kesehatan Terkumpul:
                </div>
                <div className="text-xl font-black text-amber-800 dark:text-amber-200 font-mono mt-0.5">
                  Rp 14.850.000
                </div>
                <span className="text-[10px] text-slate-500">Bantu 12 Pasien Dhuafa LimoCity</span>
              </div>
            </div>

            {/* Interactive Sedekah Sehat / Ta'awun Form */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Salurkan Sedekah Sehat & Infaq Darurat Medis:</span>
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">100% Akad Tabarru' Murni</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[20000, 50000, 100000, 250000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      donationAmount === amt 
                        ? "bg-amber-500 text-slate-950 font-black shadow-sm" 
                        : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    Rp {amt.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700">
                <span className="text-xs text-slate-500">
                  Penyaluran untuk: Pengadaan kursi roda lansia & insulin bersubsidi.
                </span>

                <button
                  type="button"
                  onClick={handleSimulateTaawun}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Tunaikan Infaq Sehat Sekarang</span>
                </button>
              </div>
            </div>

            {/* Checklist Bermuamalah */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Amalan Harian Pilar Bermuamalah:
              </h3>
              <div className="space-y-2">
                {[
                  { id: "act-muamalah-1", title: "Sedekah Subuh / infaq sehat untuk obat kaum dhuafa", desc: "Menolak bala penyakit dan mendatangkan keberkahan harta keluarga." },
                  { id: "act-muamalah-2", title: "Alokasikan tabungan darurat keluarga berbasis syariah tanpa riba", desc: "Mempersiapkan dana cadangan medis secara mandiri dan bermartabat." },
                  { id: "act-muamalah-3", title: "Bermuamalah jujur saat membeli produk kesehatan & herbal", desc: "Mendukung UMKM thibbun nabawi yang amanah dan transparan timbangannya." },
                ].map(act => (
                  <div 
                    key={act.id}
                    onClick={() => toggleAction(act.id, act.title)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 flex items-start gap-3 cursor-pointer transition-all"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      actionsCompleted[act.id] ? "bg-amber-500 text-slate-950" : "border-2 border-slate-300 dark:border-slate-600"
                    }`}>
                      {actionsCompleted[act.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${actionsCompleted[act.id] ? "text-amber-800 dark:text-amber-300 line-through" : "text-slate-800 dark:text-white"}`}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* PILLAR 8: SAMPAI BAHAGIA SEJAHTERA (PUNCAK FALAH & SAKINAH) */}
      {/* ------------------------------------------------------------------------- */}
      {activePillar === "bahagia_sejahtera" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                    Puncak Tujuan: Bahagia Sejahtera (Al-Falah)
                  </span>
                  <span className="text-xs text-slate-500">
                    Keluarga Sakinah Mawaddah wa Rahmah
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Sampai Bahagia Sejahtera: Puncak Falah Dunia & Akhirat
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Muara dari seluruh 7 pilar BERJAGA: tubuh yang sehat menjadi sarana mengabdi kepada Allah, rezeki yang halal melahirkan ketenangan jiwa, dan silaturahmi yang kokoh membuahkan surga dunia dan akhirat.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCertificateOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Unduh / Cetak Piagam Keluarga Sejahtera</span>
              </button>
            </div>

            {/* Doa Sapu Jagat & Ketenangan Jiwa */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 text-center space-y-3 shadow-md">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                Doa Kebahagiaan & Kesejahteraan Paripurna (Sapu Jagat):
              </span>
              <p className="font-arabic text-xl sm:text-2xl text-teal-100 leading-loose">
                رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
              </p>
              <p className="text-xs sm:text-sm text-slate-300 italic max-w-xl mx-auto">
                "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka." (QS. Al-Baqarah: 201)
              </p>
            </div>

            {/* Comprehensive Matrix of the 7 Pillars */}
            <div className="space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Rangkuman Evaluasi 7 Pilar BERJAGA ({activeMember.name}):</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: "Bergerak", score: 94, status: "Aktif Sunnah", icon: Footprints, color: "emerald" },
                  { name: "Bekerja", score: 90, status: "Halal & Berkah", icon: Briefcase, color: "teal" },
                  { name: "Berbekam", score: 88, status: "Terkontrol Medis", icon: Droplet, color: "red" },
                  { name: "Berdakwah", score: 92, status: "Siar Kebaikan", icon: Share2, color: "cyan" },
                  { name: "Bersyariah", score: 96, status: "Halalan Thayyiban", icon: Scale, color: "indigo" },
                  { name: "Berjamaah", score: 95, status: "Ukhuwah Kokoh", icon: Users, color: "purple" },
                  { name: "Bermuamalah", score: 91, status: "Ta'awun Berkah", icon: Coins, color: "amber" },
                  { name: "Bahagia Sejahtera", score: holisticScore.overallScore, status: "Sakinah Teladan", icon: Award, color: "yellow" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                          {item.score}%
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h4>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{item.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gratitude Journal Shortcut */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-teal-600" />
                <span className="text-teal-900 dark:text-teal-200 font-semibold">
                  Mencatat nikmat syukur harian (*Tahadduts bin Ni'mah*) meningkatkan neurotransmiter serotonin & imunitas seluler.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToFamily) onNavigateToFamily();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                Buka Jurnal Sakinah Keluarga →
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: RESERVASI BEKAM SUNNAH PBI */}
      {/* ========================================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Reservasi Bekam Sunnah Bersertifikat PBI
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pasien: <strong>{activeMember.name} ({activeMember.role})</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Tanggal Sesi Bekam (Disarankan Tanggal Sunnah 17, 19, 21 Hijriah):
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Pilihan Terapis Thibbun Nabawi (PBI LimoCity):
                </label>
                <select
                  value={therapistPreference}
                  onChange={(e) => setTherapistPreference(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="Ust. Ahmad Subhan (Terapis PBI Senior)">Ust. Ahmad Subhan (Terapis PBI Senior - Khusus Pria)</option>
                  <option value="Ustdzh. Nur Khadijah (Terapis Herbalis PBI)">Ustdzh. Nur Khadijah (Terapis Herbalis PBI - Khusus Wanita)</option>
                  <option value="dr. Muhammad Razi, Sp.Ak (Dokter Akupunktur & Bekam)">dr. Muhammad Razi, Sp.Ak (Dokter Spesialis Akupunktur & Bekam)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Titik Bekam Fokus Keluhan:
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Titik {selectedBekamPoint.nameLatin} ({selectedBekamPoint.nameArabic})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedBekamPoint.location} • {selectedBekamPoint.recommendedSesi}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Protokol Keamanan Sterilisasi:</span>
                </div>
                <p>
                  Menggunakan jarum/lanset sekali pakai (disposable), kop disterilisasi autoklaf medis, minyak habbatussauda murni grade farmasi, dan kasa steril antibakteri.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBookingModalOpen(false);
                  playHydrationSoundChime("optimal");
                  fireGrandCelebration();
                  if (onShowToast) {
                    onShowToast(`🩸 Barakallah! Sesi bekam sunnah untuk ${activeMember.name} pada ${bookingDate} berhasil dijadwalkan!`, "success");
                  }
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Konfirmasi Jadwal Bekam
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: PIAGAM KELUARGA BERJAGA BAHAGIA SEJAHTERA */}
      {/* ========================================================================= */}
      {isCertificateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border-2 border-amber-400/60 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 relative">
            
            {/* Elegant Certificate Border / Gold Seal */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Cetak Piagam"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsCertificateOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Certificate Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <Award className="w-8 h-8" />
              </div>

              <div className="font-arabic text-lg text-amber-700 dark:text-amber-400 font-bold">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Piagam Penghargaan Keluarga Sehat Berjaga
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Diberikan oleh Komite Kesehatan Daulah Islamicity LimoCity Therapy kepada:
              </p>
            </div>

            {/* Certificate Recipient */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                Keluarga {activeMember.name}
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">
                Peringkat: {holisticScore.tierName} • Skor {holisticScore.overallScore}/100
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
              Telah konsisten dan istiqomah dalam menjalankan 7 Pilar <strong>Islamicity BERJAGA</strong> (Bergerak, Bekerja, Berbekam, Berdakwah, Bersyariah, Berjamaah, Bermuamalah) dengan kepatuhan tinggi terhadap Maqashid Syariah demi terwujudnya kebahagiaan dan kesejahteraan keluarga yang sakinah, mawaddah, wa rahmah.
            </p>

            {/* Signatures & Stamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase">Ketua Komite Medis Islamicity</p>
                <div className="font-serif font-black text-slate-800 dark:text-white text-sm pt-2">
                  dr. H. Hendra Kusuma, Sp.PD
                </div>
                <p className="text-[10px] text-slate-500">NIP. 19741012 200112 1 002</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase">Dewan Syariah & Thibbun Nabawi</p>
                <div className="font-serif font-black text-slate-800 dark:text-white text-sm pt-2">
                  Ust. H. Mansyur Al-Makky
                </div>
                <p className="text-[10px] text-slate-500">Pembina LimoCity Daulah</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400 font-mono">
                No. Registrasi: ISL-BRJ-{Date.now().toString(36).toUpperCase()}
              </span>

              <button
                type="button"
                onClick={() => {
                  fireGrandCelebration();
                  if (onShowToast) {
                    onShowToast("Piagam penghargaan berhasil disimpan dan dicatat!", "success");
                  }
                  setIsCertificateOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Tutup & Simpan Piagam
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
