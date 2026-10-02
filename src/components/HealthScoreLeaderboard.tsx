import React, { useState, useMemo } from "react";
import { 
  Trophy, 
  Award, 
  Crown, 
  Sparkles, 
  Flame, 
  Zap, 
  Activity, 
  Heart, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Share2, 
  ThumbsUp, 
  MessageCircle, 
  Watch, 
  Moon, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  Coins, 
  Target, 
  RefreshCw,
  Gift,
  Smile,
  Medal,
  Footprints,
  Clock,
  Dumbbell,
  Compass,
  Sliders,
  X,
  Droplet,
  Info,
  Lock,
  Check
} from "lucide-react";
import { FamilyMember } from "../types";
import { fireBadgeCelebrationConfetti, fireGrandCelebration } from "../utils/confetti";
import { playHydrationSoundChime } from "../utils/smartHydration";

export interface HealthScoreLeaderboardProps {
  members: FamilyMember[];
  selectedMemberId?: string;
  onSelectMember?: (id: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onNavigateToFamily?: () => void;
}

export type LeaderboardMetricType = "overall" | "steps" | "calories" | "activeMinutes" | "distance" | "streak";
export type LeaderboardTimeframeType = "today" | "week" | "month";

export interface GamifiedBadge {
  id: string;
  name: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  icon: string;
  description: string;
  requirement: string;
  category: "steps" | "calories" | "streak" | "sleep" | "hydration" | "champion";
  xpReward: number;
}

export const ALL_GAMIFIED_BADGES: GamifiedBadge[] = [
  {
    id: "badge-centurion-steps",
    name: "Centurion Langkah",
    tier: "gold",
    icon: "🏃",
    description: "Mencapai ≥10.000 langkah dalam sehari secara konsisten melalui aktivitas harian.",
    requirement: "≥ 10.000 Langkah / Hari",
    category: "steps",
    xpReward: 150,
  },
  {
    id: "badge-calorie-crusher",
    name: "Pembakar Kalori Emas",
    tier: "gold",
    icon: "🔥",
    description: "Membakar lebih dari 500 kkal energi aktif melalui latihan fisik dan mobilitas.",
    requirement: "≥ 500 kkal Aktif",
    category: "calories",
    xpReward: 120,
  },
  {
    id: "badge-streak-diamond",
    name: "Konsistensi Istiqomah",
    tier: "diamond",
    icon: "⚡",
    description: "Mempertahankan rangkaian hidup aktif selama 14 hari berturut-turut tanpa jeda.",
    requirement: "≥ 14 Hari Streak",
    category: "streak",
    xpReward: 250,
  },
  {
    id: "badge-sleep-master",
    name: "Master Sirkadian & Deep Sleep",
    tier: "platinum",
    icon: "🌙",
    description: "Meraih skor kualitas tidur ≥90 dengan regenerasi gelombang lambat optimal.",
    requirement: "Skor Tidur ≥ 90",
    category: "sleep",
    xpReward: 140,
  },
  {
    id: "badge-hydration-hero",
    name: "Jawara Hidrasi Thayyib",
    tier: "silver",
    icon: "💧",
    description: "Memenuhi 100% target hidrasi dinamis harian yang disesuaikan dengan aktivitas smartwatch.",
    requirement: "100% Target Air Minum",
    category: "hydration",
    xpReward: 100,
  },
  {
    id: "badge-daulah-champion",
    name: "Sultan Kebugaran Daulah",
    tier: "diamond",
    icon: "👑",
    description: "Memimpin podium peringkat 1 skor kesehatan menyeluruh keluarga LimoCity pekan ini.",
    requirement: "Peringkat #1 Leaderboard",
    category: "champion",
    xpReward: 300,
  },
  {
    id: "badge-geriatric-vitality",
    name: "Ksatria Lansia Bugar",
    tier: "platinum",
    icon: "🛡️",
    description: "Dedikasi menjaga mobilitas sendi dan kelenturan vaskular di usia emas secara berkala.",
    requirement: "Streak Lansia Bugar ≥ 10 Hari",
    category: "streak",
    xpReward: 180,
  },
  {
    id: "badge-cardio-zone",
    name: "Zona Kardio Tangguh",
    tier: "gold",
    icon: "❤️",
    description: "Menghabiskan ≥45 menit di zona denyut jantung aerobik produktif.",
    requirement: "≥ 45 Menit Aktif",
    category: "calories",
    xpReward: 130,
  },
];

export interface MemberPhysicalMetrics {
  member: FamilyMember;
  score: number;
  steps: number;
  calories: number;
  activeMinutes: number;
  distanceKm: number;
  streakDays: number;
  xpPoints: number;
  level: number;
  tierTitle: string;
  tierBadgeColor: string;
  cheerCount: number;
  targetCompletionPct: number;
  earnedBadges: GamifiedBadge[];
  badgeProgress: Record<string, number>; // badgeId -> percentage 0..100
}

const CHEER_OPTIONS = [
  { emoji: "🔥", text: "Keren banget! Semangat terus melangkah!" },
  { emoji: "👏", text: "Hebat! Disiplin olahraganya menginspirasi keluarga!" },
  { emoji: "👟", text: "Ayo jalan santai bareng sore nanti!" },
  { emoji: "💧", text: "Mantap! Tetap jaga hidrasi air putih ya!" },
  { emoji: "🌟", text: "Bangga banget lihat rekor konsistensi sehatmu!" },
];

export const HealthScoreLeaderboard: React.FC<HealthScoreLeaderboardProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onShowToast,
  onNavigateToFamily,
}) => {
  const [metric, setMetric] = useState<LeaderboardMetricType>("overall");
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframeType>("today");
  const [activeCheerMemberId, setActiveCheerMemberId] = useState<string | null>(null);
  const [inspectBadge, setInspectBadge] = useState<GamifiedBadge | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<"podium" | "matrix">("podium");

  const [cheersMap, setCheersMap] = useState<Record<string, number>>({
    "fam-01": 18,
    "fam-02": 24,
    "fam-03": 32,
    "fam-04": 21,
    "fam-05": 29,
  });

  // Calculate detailed physical metrics and gamified badges for each member
  const gamifiedData: MemberPhysicalMetrics[] = useMemo(() => {
    const mult = timeframe === "today" ? 1 : timeframe === "week" ? 6.8 : 28.5;

    return members.map((m) => {
      const baseSteps = m.vitals.steps || 7500;
      const baseCalories = m.vitals.activeCalories || 450;
      const baseMinutes = m.vitals.activeMinutes || 45;
      const baseDistance = Number(((baseSteps * 0.75) / 1000).toFixed(2)); // ~0.75m per stride

      // Streak configurations
      const streakMap: Record<string, number> = {
        "fam-01": 9,
        "fam-02": 14,
        "fam-03": 18,
        "fam-04": 11,
        "fam-05": 16,
      };
      const streak = streakMap[m.id] || 7;

      // Base XP points
      const xpMap: Record<string, number> = {
        "fam-01": 2850,
        "fam-02": 2980,
        "fam-03": 3450,
        "fam-04": 2750,
        "fam-05": 2400,
      };
      const xp = (xpMap[m.id] || 2500) + (cheersMap[m.id] || 0) * 10;
      const level = Math.floor(xp / 450) + 1;

      // Scaled stats
      const steps = Math.round(baseSteps * mult);
      const calories = Math.round(baseCalories * mult);
      const activeMinutes = Math.round(baseMinutes * mult);
      const distanceKm = Number((baseDistance * mult).toFixed(1));

      // Holistic Health Score (0-100)
      let score = m.overallHealthScore || 85;
      if (metric === "steps") {
        score = Math.min(99, Math.round((baseSteps / 12000) * 95) + 5);
      } else if (metric === "calories") {
        score = Math.min(99, Math.round((baseCalories / 650) * 95) + 5);
      } else if (metric === "activeMinutes") {
        score = Math.min(99, Math.round((baseMinutes / 90) * 95) + 5);
      } else if (metric === "distance") {
        score = Math.min(99, Math.round((baseDistance / 9) * 95) + 5);
      } else if (metric === "streak") {
        score = Math.min(99, streak * 5 + 20);
      }

      // Tier title
      let tierTitle = "Pendekar Kebugaran";
      let tierBadgeColor = "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300";
      if (score >= 93) {
        tierTitle = "Sultan Kebugaran Platinum";
        tierBadgeColor = "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300";
      } else if (score >= 88) {
        tierTitle = "Jawara Bugar Emas";
        tierBadgeColor = "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300";
      } else if (score >= 84) {
        tierTitle = "Ksatria Langkah Perak";
        tierBadgeColor = "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-300";
      }

      const personalTarget = m.id === "fam-05" ? 5000 : m.id === "fam-01" ? 8000 : 9000;
      const targetCompletionPct = Math.min(150, Math.round((baseSteps / personalTarget) * 100));

      // Calculate Badge Eligibility
      const badgeProgress: Record<string, number> = {
        "badge-centurion-steps": Math.min(100, Math.round((baseSteps / 10000) * 100)),
        "badge-calorie-crusher": Math.min(100, Math.round((baseCalories / 500) * 100)),
        "badge-streak-diamond": Math.min(100, Math.round((streak / 14) * 100)),
        "badge-sleep-master": Math.min(100, Math.round(((m.vitals.sleepScore || 80) / 90) * 100)),
        "badge-hydration-hero": 100,
        "badge-daulah-champion": m.id === "fam-03" ? 100 : Math.min(95, Math.round((score / 96) * 100)),
        "badge-geriatric-vitality": m.id === "fam-05" ? 100 : 0,
        "badge-cardio-zone": Math.min(100, Math.round((baseMinutes / 45) * 100)),
      };

      const earnedBadges: GamifiedBadge[] = ALL_GAMIFIED_BADGES.filter(
        (b) => (badgeProgress[b.id] || 0) >= 100
      );

      return {
        member: m,
        score,
        steps,
        calories,
        activeMinutes,
        distanceKm,
        streakDays: streak,
        xpPoints: xp,
        level,
        tierTitle,
        tierBadgeColor,
        cheerCount: cheersMap[m.id] || 0,
        targetCompletionPct,
        earnedBadges,
        badgeProgress,
      };
    });
  }, [members, metric, timeframe, cheersMap]);

  // Sort leaderboard descending by selected metric
  const sortedLeaderboard = useMemo(() => {
    return [...gamifiedData].sort((a, b) => {
      if (metric === "steps") return b.steps - a.steps;
      if (metric === "calories") return b.calories - a.calories;
      if (metric === "activeMinutes") return b.activeMinutes - a.activeMinutes;
      if (metric === "distance") return b.distanceKm - a.distanceKm;
      if (metric === "streak") return b.streakDays - a.streakDays;
      return b.score - a.score;
    });
  }, [gamifiedData, metric]);

  // Top 3 Podium
  const rank1 = sortedLeaderboard[0];
  const rank2 = sortedLeaderboard[1];
  const rank3 = sortedLeaderboard[2];

  // Highest metric values for relative progress bar scaling
  const maxSteps = Math.max(...gamifiedData.map((d) => d.steps), 10000);
  const maxCalories = Math.max(...gamifiedData.map((d) => d.calories), 600);
  const maxMinutes = Math.max(...gamifiedData.map((d) => d.activeMinutes), 60);

  // Collective Family Milestones
  const collectiveTotalSteps = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.vitals.steps || 0), 0);
  }, [members]);

  const collectiveTotalCalories = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.vitals.activeCalories || 0), 0);
  }, [members]);

  const collectiveGoalTarget = 40000;
  const collectivePct = Math.min(100, Math.round((collectiveTotalSteps / collectiveGoalTarget) * 100));

  // Send Cheer Action
  const handleSendCheer = (memberId: string, cheerText: string, emoji: string) => {
    setCheersMap((prev) => ({
      ...prev,
      [memberId]: (prev[memberId] || 0) + 1,
    }));
    setActiveCheerMemberId(null);

    playHydrationSoundChime("optimal");
    fireBadgeCelebrationConfetti(0.5, 0.6);

    const targetMember = members.find((m) => m.id === memberId);
    if (onShowToast) {
      onShowToast(
        `${emoji} Dukungan terkirim untuk ${targetMember?.name || "Keluarga"}! (+10 XP Kebugaran)`,
        "success"
      );
    }
  };

  // Celebrate #1 Leader
  const handleCelebrateLeader = () => {
    fireGrandCelebration();
    playHydrationSoundChime("optimal");
    if (onShowToast) {
      onShowToast(
        `🏆 Takbir & Selamat! ${rank1.member.name} memimpin klasemen Skor Kesehatan Keluarga Daulah dengan Skor ${rank1.score}!`,
        "success"
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. HERO BANNER: SKOR KESEHATAN KELUARGA (HEALTH SCORE LEADERBOARD) */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-teal-800/60 shadow-xl relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Health Score Leaderboard • FitCity Gamification
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Lencana & Peringkat Aktivitas Fisik
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Papan Peringkat Skor Kesehatan Keluarga</span>
                <Crown className="w-7 h-7 text-amber-400 animate-bounce" />
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Komparasi aktivitas fisik harian keluarga (langkah, kalori aktif, durasi latihan, dan jarak tempuh) dengan lencana gamifikasi, peringkat persentase capaian, serta silaturahmi olahraga penuh berkah.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleCelebrateLeader}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Rayakan Juara Pekan Ini!</span>
              </button>

              {onNavigateToFamily && (
                <button
                  type="button"
                  onClick={onNavigateToFamily}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Dasbor Vital Keluarga</span>
                </button>
              )}
            </div>
          </div>

          {/* COLLECTIVE FAMILY GOAL PROGRESS STRIP */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-teal-300">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Target Kolektif Daulah: <strong>40.000 Langkah Keluarga/Hari</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span>Total Hari Ini: <strong className="text-white font-mono text-sm">{collectiveTotalSteps.toLocaleString("id-ID")}</strong> langkah</span>
                <span>•</span>
                <span><strong className="text-emerald-400">{collectiveTotalCalories.toLocaleString("id-ID")}</strong> kkal terbakar</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative border border-white/10">
              <div 
                style={{ width: `${collectivePct}%` }}
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-700 relative"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{collectivePct}% Tercapai • Seluruh 5 Anggota Keluarga Terhubung Sensor Wearable</span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                Bonus Kas Infaq Terbuka (+50 Koin Kebugaran)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR: METRIC SELECTOR, TIMEFRAME & DISPLAY MODE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Metrik:
          </span>
          {[
            { id: "overall", label: "Skor Holistik", icon: Trophy },
            { id: "steps", label: "Langkah Kaki", icon: Footprints },
            { id: "calories", label: "Kalori Aktif", icon: Flame },
            { id: "activeMinutes", label: "Menit Aktif", icon: Clock },
            { id: "distance", label: "Jarak (km)", icon: Compass },
            { id: "streak", label: "Streak Konsistensi", icon: Zap },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = metric === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMetric(item.id as LeaderboardMetricType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe & Mode Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          
          {/* Display Mode: Podium vs Matrix */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTabMode("podium")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === "podium"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Podium & Kartu
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode("matrix")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === "matrix"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Matriks Komparasi Fisik
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: "today", label: "Hari Ini" },
              { id: "week", label: "Pekan Ini" },
              { id: "month", label: "Bulan Ini" },
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id as LeaderboardTimeframeType)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* 3. PODIUM JUARA (GOLD, SILVER, BRONZE) */}
      {activeTabMode === "podium" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Podium Kebugaran Keluarga Daulah</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tiga anggota teratas dengan aktivitas fisik dan pemenuhan target kebugaran tertinggi.
              </p>
            </div>

            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
              Sensor Wearable Live
            </span>
          </div>

          {/* 3D Glass Podium Grid (Silver - Gold - Bronze) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
            
            {/* SILVER: RANK 2 */}
            <div 
              onClick={() => onSelectMember && onSelectMember(rank2.member.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between order-2 md:order-1 ${
                selectedMemberId === rank2.member.id
                  ? "bg-slate-100/90 dark:bg-slate-800 border-slate-400 shadow-md ring-2 ring-slate-400/30"
                  : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 flex items-center justify-center font-black text-xl shadow-md">
                  🥈
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  Peringkat 2
                </span>
              </div>

              <div className="my-4 text-center">
                <div className="relative inline-block mx-auto mb-2">
                  <img
                    src={rank2.member.avatarUrl}
                    alt={rank2.member.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-slate-300 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {rank2.member.name}
                </h4>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                  {rank2.member.role} • {rank2.member.age} Thn
                </p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${rank2.tierBadgeColor}`}>
                  {rank2.tierTitle}
                </span>

                {/* Badges preview */}
                <div className="flex items-center justify-center gap-1 mt-2.5">
                  {rank2.earnedBadges.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectBadge(b);
                      }}
                      className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs hover:scale-110 transition-transform"
                      title={b.name}
                    >
                      {b.icon}
                    </button>
                  ))}
                  {rank2.earnedBadges.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      +{rank2.earnedBadges.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-end justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    {metric === "steps" ? "Langkah" : metric === "calories" ? "Kalori" : metric === "activeMinutes" ? "Menit Aktif" : metric === "distance" ? "Jarak" : metric === "streak" ? "Streak" : "Skor"}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {metric === "steps" 
                      ? rank2.steps.toLocaleString() 
                      : metric === "calories" 
                      ? `${rank2.calories.toLocaleString()} kkal`
                      : metric === "activeMinutes"
                      ? `${rank2.activeMinutes} mnt`
                      : metric === "distance"
                      ? `${rank2.distanceKm} km`
                      : metric === "streak"
                      ? `${rank2.streakDays} Hari`
                      : rank2.score}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  +{rank2.targetCompletionPct}% Target
                </span>
              </div>
            </div>

            {/* GOLD: RANK 1 (CHAMPION - Higher Elevation) */}
            <div 
              onClick={() => onSelectMember && onSelectMember(rank1.member.id)}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between order-1 md:order-2 md:-translate-y-3 ${
                selectedMemberId === rank1.member.id
                  ? "bg-gradient-to-b from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-slate-800 border-amber-400 shadow-xl ring-2 ring-amber-400/40"
                  : "bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-800/80 border-amber-300 dark:border-amber-700 hover:border-amber-400 shadow-lg"
              }`}
            >
              {/* Champion ribbon */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-[10px] font-black text-center py-1 uppercase tracking-wider flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Pemimpin Kebugaran Daulah</span>
              </div>

              <div className="flex items-start justify-between pt-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
                  👑
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs">
                  Juara 1
                </span>
              </div>

              <div className="my-5 text-center">
                <div className="relative inline-block mx-auto mb-2">
                  <img
                    src={rank1.member.avatarUrl}
                    alt={rank1.member.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl"
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    1
                  </span>
                </div>

                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {rank1.member.name}
                </h4>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                  {rank1.member.role} • Level {rank1.level} ({rank1.xpPoints} XP)
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black border ${rank1.tierBadgeColor} shadow-xs`}>
                  {rank1.tierTitle}
                </span>

                {/* Badges preview */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {rank1.earnedBadges.slice(0, 4).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectBadge(b);
                      }}
                      className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-sm shadow-xs hover:scale-110 transition-transform"
                      title={b.name}
                    >
                      {b.icon}
                    </button>
                  ))}
                  {rank1.earnedBadges.length > 4 && (
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300">
                      +{rank1.earnedBadges.length - 4} Lencana
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200 dark:border-amber-800/60 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-black">
                    {metric === "steps" ? "Langkah" : metric === "calories" ? "Kalori" : metric === "activeMinutes" ? "Menit Aktif" : metric === "distance" ? "Jarak" : metric === "streak" ? "Streak" : "Skor Kebugaran"}
                  </span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-300 font-mono">
                    {metric === "steps" 
                      ? rank1.steps.toLocaleString() 
                      : metric === "calories" 
                      ? `${rank1.calories.toLocaleString()} kkal`
                      : metric === "activeMinutes"
                      ? `${rank1.activeMinutes} mnt`
                      : metric === "distance"
                      ? `${rank1.distanceKm} km`
                      : metric === "streak"
                      ? `${rank1.streakDays} Hari`
                      : `${rank1.score} Pts`}
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  +{rank1.targetCompletionPct}% Target
                </span>
              </div>
            </div>

            {/* BRONZE: RANK 3 */}
            <div 
              onClick={() => onSelectMember && onSelectMember(rank3.member.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between order-3 ${
                selectedMemberId === rank3.member.id
                  ? "bg-slate-100/90 dark:bg-slate-800 border-amber-700 shadow-md ring-2 ring-amber-700/30"
                  : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-amber-700/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                  🥉
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                  Peringkat 3
                </span>
              </div>

              <div className="my-4 text-center">
                <div className="relative inline-block mx-auto mb-2">
                  <img
                    src={rank3.member.avatarUrl}
                    alt={rank3.member.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-amber-600 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {rank3.member.name}
                </h4>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                  {rank3.member.role} • {rank3.member.age} Thn
                </p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${rank3.tierBadgeColor}`}>
                  {rank3.tierTitle}
                </span>

                {/* Badges preview */}
                <div className="flex items-center justify-center gap-1 mt-2.5">
                  {rank3.earnedBadges.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectBadge(b);
                      }}
                      className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs hover:scale-110 transition-transform"
                      title={b.name}
                    >
                      {b.icon}
                    </button>
                  ))}
                  {rank3.earnedBadges.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      +{rank3.earnedBadges.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-end justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    {metric === "steps" ? "Langkah" : metric === "calories" ? "Kalori" : metric === "activeMinutes" ? "Menit Aktif" : metric === "distance" ? "Jarak" : metric === "streak" ? "Streak" : "Skor"}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {metric === "steps" 
                      ? rank3.steps.toLocaleString() 
                      : metric === "calories" 
                      ? `${rank3.calories.toLocaleString()} kkal`
                      : metric === "activeMinutes"
                      ? `${rank3.activeMinutes} mnt`
                      : metric === "distance"
                      ? `${rank3.distanceKm} km`
                      : metric === "streak"
                      ? `${rank3.streakDays} Hari`
                      : rank3.score}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  +{rank3.targetCompletionPct}% Target
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. PHYSICAL ACTIVITY COMPARATIVE MATRIX VIEW */}
      {activeTabMode === "matrix" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-teal-600" />
                <span>Matriks Komparasi Aktivitas Fisik Seluruh Anggota</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perbandingan komparatif dinamis metrik fisik dengan rasio normalisasi terhadap capaian tertinggi keluarga.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Periode: {timeframe === "today" ? "Hari Ini" : timeframe === "week" ? "Pekan Ini" : "Bulan Ini"}
            </span>
          </div>

          <div className="space-y-4">
            {sortedLeaderboard.map((item, idx) => {
              const stepsPct = Math.round((item.steps / maxSteps) * 100);
              const calPct = Math.round((item.calories / maxCalories) * 100);
              const minPct = Math.round((item.activeMinutes / maxMinutes) * 100);

              return (
                <div 
                  key={item.member.id}
                  onClick={() => onSelectMember && onSelectMember(item.member.id)}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all space-y-3 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <img
                        src={item.member.avatarUrl}
                        alt={item.member.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.member.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            {item.member.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {item.member.connectedWearable.deviceName} • Level {item.level} ({item.xpPoints} XP)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Skor FitCity</span>
                        <span className="text-base font-black text-teal-600 dark:text-teal-400">
                          {item.score} / 100
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Lencana</span>
                        <span className="text-base font-black text-amber-500">
                          {item.earnedBadges.length} Dibuka
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Comparative Progress Bars */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    
                    {/* Steps bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Footprints className="w-3.5 h-3.5 text-teal-500" />
                          <span>Langkah: <strong>{item.steps.toLocaleString()}</strong> ({item.distanceKm} km)</span>
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{stepsPct}% rasio</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${stepsPct}%` }}
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Calories bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>Kalori Terbakar: <strong>{item.calories.toLocaleString()} kkal</strong></span>
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{calPct}% rasio</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${calPct}%` }}
                          className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Active Minutes bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Waktu Latihan: <strong>{item.activeMinutes} Menit</strong></span>
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{minPct}% rasio</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${minPct}%` }}
                          className="bg-gradient-to-r from-indigo-500 to-blue-400 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. GAMIFIED BADGES SHOWCASE GALLERY */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-500" />
              <span>Koleksi Lencana Kebugaran Gamifikasi ({ALL_GAMIFIED_BADGES.length} Lencana Tersedia)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Klik lencana untuk melihat syarat capaian, rincian bonus XP, dan siapa saja anggota keluarga yang telah membukanya.
            </p>
          </div>

          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
            Gamified Achievement System
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ALL_GAMIFIED_BADGES.map((badge) => {
            // Find who unlocked it
            const unlockedBy = gamifiedData.filter((d) => (d.badgeProgress[badge.id] || 0) >= 100);
            const isUnlockedAny = unlockedBy.length > 0;

            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setInspectBadge(badge)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden group hover:scale-105 ${
                  isUnlockedAny
                    ? "bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-xs hover:border-amber-400"
                    : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 opacity-60"
                }`}
              >
                {/* Badge tier color tag */}
                <div className={`absolute top-0 inset-x-0 h-1 ${
                  badge.tier === "diamond"
                    ? "bg-cyan-400"
                    : badge.tier === "platinum"
                    ? "bg-indigo-400"
                    : badge.tier === "gold"
                    ? "bg-amber-400"
                    : "bg-slate-400"
                }`} />

                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-2xl shadow-xs mt-1">
                  {badge.icon}
                </div>

                <h4 className="text-[11px] font-black text-slate-900 dark:text-white truncate mt-2">
                  {badge.name}
                </h4>

                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block font-mono">
                  +{badge.xpReward} XP
                </span>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1">
                  {unlockedBy.length > 0 ? (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      {unlockedBy.length} Anggota
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-slate-400 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      Terkunci
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. COMPLETE RANKED TABLE WITH INTERACTIVE CHEERS & PHYSICAL METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Ranked Member List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Daftar Klasemen Lengkap ({sortedLeaderboard.length} Anggota)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pantau kepatuhan target, perolehan lencana, dan beri apresiasi motivasi.
                </p>
              </div>

              <span className="text-xs text-slate-500">
                Peringkat Dinamis
              </span>
            </div>

            <div className="space-y-3">
              {sortedLeaderboard.map((item, idx) => {
                const isSelected = selectedMemberId === item.member.id;

                return (
                  <div
                    key={item.member.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                      isSelected
                        ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-sm ring-1 ring-teal-500/40"
                        : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/70 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div 
                        onClick={() => onSelectMember && onSelectMember(item.member.id)}
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                          idx === 0 
                            ? "bg-amber-400 text-slate-950" 
                            : idx === 1 
                            ? "bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-white" 
                            : idx === 2 
                            ? "bg-amber-700 text-white" 
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}>
                          #{idx + 1}
                        </div>

                        <img
                          src={item.member.avatarUrl}
                          alt={item.member.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {item.member.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              {item.member.role}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${item.tierBadgeColor}`}>
                              {item.tierTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-orange-500 font-bold">
                              <Zap className="w-3 h-3 fill-orange-500" />
                              {item.streakDays} Hari Streak
                            </span>
                            <span>•</span>
                            <span>Level {item.level} ({item.xpPoints} XP)</span>
                            <span>•</span>
                            <span className="text-teal-600 dark:text-teal-400 font-medium">
                              {item.member.connectedWearable.deviceName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score and Cheer Button */}
                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            Skor FitCity
                          </span>
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {item.score}
                            <span className="text-xs text-slate-400 font-normal"> / 100</span>
                          </span>
                        </div>

                        {/* Cheer / Send Encouragement Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveCheerMemberId(activeCheerMemberId === item.member.id ? null : item.member.id)}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 hover:text-amber-600 border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Kirim dukungan semangat & tepuk tangan"
                          >
                            <ThumbsUp className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold">{item.cheerCount}</span>
                          </button>

                          {/* Cheer Popover Menu */}
                          {activeCheerMemberId === item.member.id && (
                            <div className="absolute right-0 top-12 z-20 w-64 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
                              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                Kirim Semangat untuk {item.member.name}:
                              </div>
                              <div className="space-y-1">
                                {CHEER_OPTIONS.map((c, cIdx) => (
                                  <button
                                    key={cIdx}
                                    type="button"
                                    onClick={() => handleSendCheer(item.member.id, c.text, c.emoji)}
                                    className="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <span className="text-base">{c.emoji}</span>
                                    <span className="text-[11px] leading-tight truncate">{c.text}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* PHYSICAL ACTIVITY DETAILED METRICS STRIP */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/80 text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block font-bold">Langkah Fisik</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 font-mono">
                          {item.steps.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block font-bold">Kalori Aktif</span>
                        <span className="font-black text-orange-600 dark:text-orange-400 font-mono">
                          {item.calories.toLocaleString()} kkal
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block font-bold">Menit Aktif</span>
                        <span className="font-black text-teal-600 dark:text-teal-400 font-mono">
                          {item.activeMinutes} Menit
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block font-bold">Jarak Tempuh</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          {item.distanceKm} km
                        </span>
                      </div>
                    </div>

                    {/* LENCANA DIBUKA MEMBER */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">Lencana:</span>
                      {item.earnedBadges.map((badge) => (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => setInspectBadge(badge)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0 hover:border-amber-400"
                        >
                          <span>{badge.icon}</span>
                          <span className="text-[10px]">{badge.name}</span>
                        </button>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right: AI Athletic Coach & Family Rewards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* AI Family Health Coach Commentary */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-5 border border-teal-700/60 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                  AI Family Health Coach
                </span>
                <h4 className="text-sm font-black text-white">
                  Komentator Kebugaran FitCity
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Maa syaa Allah! <strong>{rank1.member.name}</strong> memimpin dengan daya tahan langkah luar biasa. Sementara itu, <strong>Kakek Mansyur</strong> dan <strong>Ibu Siti</strong> menunjukkan konsistensi streak 14+ hari yang menjadi teladan hidup aktif bebas osteopenia.
            </p>

            <div className="p-3 rounded-xl bg-white/10 text-xs border border-white/10 space-y-1">
              <span className="text-amber-300 font-bold block flex items-center gap-1">
                <Smile className="w-3.5 h-3.5" />
                Rekomendasi Agenda Sehat Bersama:
              </span>
              <p className="text-[11px] text-slate-300">
                Adakan "Jalan Santai Ahad Pagi 5.000 Langkah" mengitari Taman Herbal LimoCity untuk menyamakan poin dan menjaga silaturahmi keluarga.
              </p>
            </div>
          </div>

          {/* Koin Kebugaran Daulah Rewards Box */}
          <div className="p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Koin Kebugaran Keluarga: <strong>480 Poin</strong></span>
              </span>
              <Gift className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Tiap 100 poin dapat dikonversi menjadi voucher paket buah segar thayyib atau disalurkan sebagai infaq ambulans darurat Daulah LimoCity.
            </p>
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 font-bold">
              <span>Status Penukaran: Terbuka</span>
              <span className="text-emerald-600 dark:text-emerald-400">4 Voucher Tersedia</span>
            </div>
          </div>

        </div>

      </div>

      {/* 7. BADGE INSPECTION MODAL */}
      {inspectBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-3xl shadow-md">
                  {inspectBadge.icon}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                    Tier {inspectBadge.tier}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {inspectBadge.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectBadge(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {inspectBadge.description}
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Syarat Pembukaan:</span>
                <span className="font-black text-slate-900 dark:text-white">{inspectBadge.requirement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Hadiah Poin XP:</span>
                <span className="font-black text-amber-600 dark:text-amber-400 font-mono">+{inspectBadge.xpReward} XP</span>
              </div>
            </div>

            {/* Who unlocked it in family */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Anggota Keluarga yang Telah Membuka Lencana Ini:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {gamifiedData
                  .filter((m) => (m.badgeProgress[inspectBadge.id] || 0) >= 100)
                  .map((m) => (
                    <div
                      key={m.member.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300"
                    >
                      <img
                        src={m.member.avatarUrl}
                        alt={m.member.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{m.member.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                  ))}
                {gamifiedData.filter((m) => (m.badgeProgress[inspectBadge.id] || 0) >= 100).length === 0 && (
                  <span className="text-xs text-slate-400 italic">
                    Belum ada anggota yang membuka lencana ini pekan ini. Ayo tingkatkan aktivitas fisik!
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                fireBadgeCelebrationConfetti(0.5, 0.6);
                playHydrationSoundChime("optimal");
                if (onShowToast) onShowToast(`Semangat meraih lencana ${inspectBadge.name}!`, "info");
                setInspectBadge(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Tutup & Terus Bergerak
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
