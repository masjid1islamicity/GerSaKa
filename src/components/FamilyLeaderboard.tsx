import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FamilyMember, LeaderboardMetric, LeaderboardTimeframe, FamilyLeaderboardEntry, StreakBadge } from "../types";
import { INITIAL_WEEKLY_HEALTH_GOALS } from "../data/mockData";
import { playCelebrationChime } from "./HealthGoalsNotificationSystem";
import { StreakBadgeDetailModal } from "./StreakBadgeDetailModal";
import {
  Trophy,
  Medal,
  Crown,
  Award,
  Sparkles,
  Flame,
  Zap,
  Moon,
  Activity,
  Heart,
  Share2,
  Check,
  Watch,
  Users,
  Target,
  TrendingUp,
  Smile,
  ThumbsUp,
  X,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  PartyPopper,
  Coins
} from "lucide-react";
import { fireBadgeCelebrationConfetti, fireGrandCelebration } from "../utils/confetti";
import { calculateMemberAutomatedPoints, generateWeeklyChallenges } from "../utils/challengesAndPoints";
import { WeeklyChallengesHub } from "./WeeklyChallengesHub";

interface FamilyLeaderboardProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
}

// Preset motivational cheers
const CHEER_PRESETS = [
  { emoji: "🔥", text: "Luar biasa! Semangat terus melangkah!" },
  { emoji: "👏", text: "Keren banget disiplin olahraganya!" },
  { emoji: "👟", text: "Ayo jalan sore bareng keliling komplek!" },
  { emoji: "💧", text: "Hebat! Jangan lupa penuhi hidrasi air putih ya!" },
  { emoji: "🌟", text: "Bangga banget lihat rekor streak sehatmu!" },
  { emoji: "🥗", text: "Pertahankan nutrisi seimbang & istirahat cukup!" }
];

// Helper to construct rich 7-day streak badges for each family member
const generateMemberStreakBadges = (member: FamilyMember, streakDays: number): StreakBadge[] => {
  const isUnlocked7 = streakDays >= 7;
  const isUnlocked14 = streakDays >= 14;

  const badges: StreakBadge[] = [
    {
      id: `badge-7day-universal-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role,
      title: "Master Konsistensi 7-Hari",
      subtitle: "7 Hari Berturut-turut Penuhi Target Kesehatan",
      category: "streak_7",
      icon: "🌟",
      colorGradient: "from-amber-400 via-orange-500 to-yellow-500",
      borderColor: "border-amber-400",
      requiredDays: 7,
      unlockedAt: member.id === "fam-04" ? "Baru Terbuka Hari Ini! 🎉" : "Pekan Ini",
      doctorEndorsement: "dr. Farhan Alamsyah, Sp.JP(K) • Dokter Spesialis Jantung LimoCity",
      healthBenefit: "Konsistensi 7 hari berturut-turut menstimulasi neuroplastisitas pembentukan kebiasaan gerak otomatis dan menstabilkan profil tekanan darah dasar.",
      isUnlocked: isUnlocked7,
      criteria: "Menyelesaikan minimal 1 sasaran target mingguan selama 7 hari berturut-turut tanpa jeda."
    }
  ];

  // Specific clinical badges
  if (member.id === "fam-01") {
    badges.push({
      id: `badge-cardio-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role,
      title: "Perisai Kardiovaskular 7-Hari",
      subtitle: "7 Hari Tensi Terkendali & Langkah Teratur",
      category: "streak_7",
      icon: "🛡️",
      colorGradient: "from-emerald-500 via-teal-500 to-cyan-600",
      borderColor: "border-emerald-400",
      requiredDays: 7,
      unlockedAt: "4 hari lalu",
      doctorEndorsement: "dr. Farhan Alamsyah, Sp.JP(K) • Spesialis Jantung & Pembuluh Darah",
      healthBenefit: "Mengurangi variabilitas tekanan darah arterial dan menjaga kelenturan dinding endotel vaskular secara signifikan.",
      isUnlocked: isUnlocked7,
      criteria: "Rata-rata 8.000 langkah/hari dan tekanan darah dalam rentang aman selama 7 hari."
    });
  } else if (member.id === "fam-02") {
    badges.push({
      id: `badge-joint-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role,
      title: "Bintang Mobilitas Sendi 7-Hari",
      subtitle: "7 Hari Latihan Kuadrisep & Langkah Santai",
      category: "streak_7",
      icon: "🌸",
      colorGradient: "from-rose-400 via-pink-500 to-amber-500",
      borderColor: "border-rose-400",
      requiredDays: 7,
      unlockedAt: "2 hari lalu",
      doctorEndorsement: "Ns. Yoga Pratama, S.Ft, Ftr • Spesialis Fisioterapi GerSaKa",
      healthBenefit: "Melumasi sendi lutut melalui sirkulasi cairan sinovial alami serta memperkuat otot paha depan tanpa nyeri kompresi.",
      isUnlocked: isUnlocked7,
      criteria: "Menuntaskan seluruh sesi mobilitas lutut dan konsisten 6.000+ langkah santai 7 hari."
    });
  } else if (member.id === "fam-03") {
    badges.push({
      id: `badge-titan-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role,
      title: "Ksatria Disiplin 14-Hari (Elite)",
      subtitle: "14 Hari Beruntun Target Lari & VO2 Max",
      category: "streak_14",
      icon: "🔥",
      colorGradient: "from-orange-500 via-red-500 to-amber-500",
      borderColor: "border-orange-500",
      requiredDays: 14,
      unlockedAt: "Hari Ini (Pencapaian Spesial 2 Pekan!)",
      doctorEndorsement: "LimoCity Sports Physiology Team",
      healthBenefit: "Peningkatan efisiensi denyut jantung istirahat (resting HR 58 bpm) dan akselerasi daur asam laktat atletik.",
      isUnlocked: isUnlocked14,
      criteria: "14 hari berturut-turut melampaui 12.000 langkah dan 750 kkal aktif per hari."
    });
  } else if (member.id === "fam-04") {
    badges.push({
      id: `badge-youth-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role,
      title: "Pionir Aktif Remaja 7-Hari",
      subtitle: "7 Hari Bebas Sedentari & Tidur Sehat",
      category: "streak_7",
      icon: "🎯",
      colorGradient: "from-cyan-400 via-blue-500 to-indigo-500",
      borderColor: "border-cyan-400",
      requiredDays: 7,
      unlockedAt: "Baru Saja Terbuka Hari Ini! 🚀",
      doctorEndorsement: "dr. Citra Sp.A • Spesialis Kesehatan Anak & Remaja",
      healthBenefit: "Mematahkan siklus sedentari saat belajar daring, melatih kelurusan postur spinalis, serta memulihkan kelelahan akomodasi mata.",
      isUnlocked: isUnlocked7,
      criteria: "7 hari berturut-turut mencapai 7.000 langkah dan istirahat layar cukup."
    });
  } else if (member.id === "fam-05") {
    badges.push({
      id: `badge-senior-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role,
      title: "Legenda Vitalitas Senior 7-Hari",
      subtitle: "7 Hari Jalan Pagi Geriatrik Terarah",
      category: "streak_7",
      icon: "👑",
      colorGradient: "from-amber-500 via-yellow-500 to-emerald-600",
      borderColor: "border-amber-400",
      requiredDays: 7,
      unlockedAt: "5 hari lalu",
      doctorEndorsement: "dr. Hendra Sp.PD-KGer • Konsultan Geriatri",
      healthBenefit: "Menjaga saturasi oksigen perifer di atas 96%, melatih tonus muskuloskeletal untuk pencegahan risiko jatuh (fall prevention).",
      isUnlocked: isUnlocked7,
      criteria: "7 hari beruntun jalan pagi santai 4.000+ langkah dan istirahat siang teratur."
    });
  }

  return badges;
};

export const FamilyLeaderboard: React.FC<FamilyLeaderboardProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onShowToast,
  onSyncWearable,
  isSyncing = false
}) => {
  const [metric, setMetric] = useState<LeaderboardMetric>("overall");
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("weekly");
  const [cheerMap, setCheerMap] = useState<Record<string, number>>({
    "fam-01": 18,
    "fam-02": 24,
    "fam-03": 31,
    "fam-04": 22,
    "fam-05": 36
  });
  
  // Interactive cheer popover state
  const [cheeringMemberId, setCheeringMemberId] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; memberId: string }>>([]);

  // State for Streak Badge Detail Modal
  const [selectedStreakBadge, setSelectedStreakBadge] = useState<StreakBadge | null>(null);

  // Aggregate health goal progress and wearable telemetry for all family members
  const leaderboardEntries = useMemo<FamilyLeaderboardEntry[]>(() => {
    return members.map(member => {
      const goals = INITIAL_WEEKLY_HEALTH_GOALS[member.id] || [];
      const vitals = member.vitals;

      // Find specific goals
      const stepsGoal = goals.find(g => g.category === "steps");
      const sleepGoal = goals.find(g => g.category === "sleep");
      const caloriesGoal = goals.find(g => g.category === "calories");

      // Weekly accumulated values
      const weeklySteps = stepsGoal 
        ? stepsGoal.currentWeeklyValue + (vitals.steps > 0 ? Math.round(vitals.steps * 0.1) : 0)
        : vitals.steps * 6;
      const targetWeeklySteps = stepsGoal ? stepsGoal.targetWeeklyValue : 50000;

      const weeklyActiveCalories = caloriesGoal 
        ? caloriesGoal.currentWeeklyValue 
        : vitals.activeCalories * 6;

      const weeklyActiveMinutes = Math.round(weeklyActiveCalories / 7.2);
      const todayActiveMinutes = vitals.activeMinutes ?? Math.round(vitals.activeCalories / 8);

      // Goal completion calculation
      const goalCompletionRates = goals.map(g => (g.currentWeeklyValue / g.targetWeeklyValue) * 100);
      const avgGoalCompletion = goalCompletionRates.length > 0 
        ? Math.round(goalCompletionRates.reduce((a, b) => a + b, 0) / goalCompletionRates.length)
        : 75;

      const weeklySleepHours = sleepGoal ? sleepGoal.currentWeeklyValue : vitals.sleepHours * 5.2;

      // Determine values according to active timeframe
      const isWeekly = timeframe === "weekly";
      const displaySteps = isWeekly ? weeklySteps : vitals.steps;
      const displayTargetSteps = isWeekly ? targetWeeklySteps : Math.round(targetWeeklySteps / 7);
      const displayActiveMinutes = isWeekly ? weeklyActiveMinutes : todayActiveMinutes;
      const displayActiveCalories = isWeekly ? weeklyActiveCalories : vitals.activeCalories;
      const displaySleepHours = isWeekly ? weeklySleepHours : vitals.sleepHours;
      const displaySleepScore = vitals.sleepScore;

      // Weighted Composite Wellness Score (0 - 100)
      const stepsRatio = Math.min(1.2, displaySteps / (displayTargetSteps || 1));
      const activeMinTarget = isWeekly ? 250 : 45;
      const activeRatio = Math.min(1.2, displayActiveMinutes / activeMinTarget);
      const sleepRatio = Math.min(1.0, (displaySleepScore || 80) / 100);
      const goalRatio = Math.min(1.0, avgGoalCompletion / 100);

      const wellnessScore = Math.min(
        100,
        Math.round((stepsRatio * 35) + (activeRatio * 25) + (sleepRatio * 20) + (goalRatio * 20))
      );

      // Member streak days
      const streakDays = member.id === "fam-03" ? 14 : member.id === "fam-01" ? 11 : member.id === "fam-02" ? 9 : member.id === "fam-04" ? 7 : 12;
      const streakBadges = generateMemberStreakBadges(member, streakDays);
      const hasUnlocked7DayStreak = streakDays >= 7;

      // Personalized friendly title
      let badgeTitle = "Pahlawan Bugar";
      let badgeIcon = "🌟";
      if (member.role === "Anak Sulung") {
        badgeTitle = "Kampiun Langkah & VO2 Max";
        badgeIcon = "🏃‍♂️";
      } else if (member.role === "Ayah") {
        badgeTitle = "Disiplin Kardiovaskular";
        badgeIcon = "🛡️";
      } else if (member.role === "Ibu") {
        badgeTitle = "Mobilitas Sendi & Hidrasi";
        badgeIcon = "🌸";
      } else if (member.role === "Anak Bungsu") {
        badgeTitle = "Juara Konsistensi Remaja";
        badgeIcon = "🎯";
      } else if (member.role === "Kakek") {
        badgeTitle = "Inspirasi Vitalitas Senior";
        badgeIcon = "👑";
      }

      return {
        member,
        rank: 1, // calculated after sorting
        steps: displaySteps,
        targetSteps: displayTargetSteps,
        activeMinutes: displayActiveMinutes,
        activeCalories: displayActiveCalories,
        goalCompletionRate: avgGoalCompletion,
        sleepHours: displaySleepHours,
        sleepScore: displaySleepScore,
        wellnessScore,
        badgeTitle,
        badgeIcon,
        streakDays,
        cheerCount: cheerMap[member.id] || 0,
        streakBadges,
        hasUnlocked7DayStreak
      };
    });
  }, [members, timeframe, cheerMap]);

  // Sort leaderboard entries based on selected metric
  const sortedEntries = useMemo(() => {
    const list = [...leaderboardEntries];
    list.sort((a, b) => {
      switch (metric) {
        case "steps":
          return b.steps - a.steps;
        case "activeMinutes":
          return b.activeMinutes - a.activeMinutes;
        case "goals":
          return b.goalCompletionRate - a.goalCompletionRate;
        case "sleep":
          return b.sleepScore - a.sleepScore;
        case "overall":
        default:
          return b.wellnessScore - a.wellnessScore;
      }
    });

    return list.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [leaderboardEntries, metric]);

  // Family Collective Goal Summary
  const collectiveStats = useMemo(() => {
    const totalSteps = sortedEntries.reduce((acc, curr) => acc + curr.steps, 0);
    const targetSteps = timeframe === "weekly" ? 250000 : 38000;
    const progressPercent = Math.min(100, Math.round((totalSteps / targetSteps) * 100));
    const totalActiveMin = sortedEntries.reduce((acc, curr) => acc + curr.activeMinutes, 0);
    const totalCalories = sortedEntries.reduce((acc, curr) => acc + curr.activeCalories, 0);
    const avgWellness = Math.round(sortedEntries.reduce((acc, curr) => acc + curr.wellnessScore, 0) / sortedEntries.length);
    const totalStreakBadgesUnlocked = sortedEntries.reduce((acc, curr) => acc + curr.streakBadges.length, 0);

    return {
      totalSteps,
      targetSteps,
      progressPercent,
      totalActiveMin,
      totalCalories,
      avgWellness,
      totalStreakBadgesUnlocked
    };
  }, [sortedEntries, timeframe]);

  // Top 3 Podium Winners
  const firstPlace = sortedEntries.find(e => e.rank === 1);
  const secondPlace = sortedEntries.find(e => e.rank === 2);
  const thirdPlace = sortedEntries.find(e => e.rank === 3);

  // Identify member with newly unlocked badge today (Nadia Anindita - fam-04)
  const freshUnlockEntry = sortedEntries.find(e => e.member.id === "fam-04");
  const freshBadge = freshUnlockEntry?.streakBadges[freshUnlockEntry.streakBadges.length - 1] || freshUnlockEntry?.streakBadges[0];

  // Active Leaderboard Section: "leaderboard" (Klasemen & Lencana) vs "challenges" (Tantangan & Poin)
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"leaderboard" | "challenges">("leaderboard");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("most-steps");
  const [isSyncingPoints, setIsSyncingPoints] = useState<boolean>(false);

  // Automated Points Calculation & Live Challenges Engine
  const memberPoints = useMemo(() => {
    return calculateMemberAutomatedPoints(sortedEntries);
  }, [sortedEntries]);

  const weeklyChallenges = useMemo(() => {
    return generateWeeklyChallenges(sortedEntries);
  }, [sortedEntries]);

  // Points dictionary by memberId for quick lookup
  const pointMap = useMemo(() => {
    const map: Record<string, typeof memberPoints[0]> = {};
    memberPoints.forEach(mp => {
      map[mp.memberId] = mp;
    });
    return map;
  }, [memberPoints]);

  // Total family points
  const totalFamilyPoints = useMemo(() => {
    return memberPoints.reduce((acc, curr) => acc + curr.totalPoints, 0);
  }, [memberPoints]);

  // Trigger real-time point sync
  const handleSyncWearablePoints = () => {
    setIsSyncingPoints(true);
    if (onSyncWearable) {
      onSyncWearable();
    }
    setTimeout(() => {
      setIsSyncingPoints(false);
      playCelebrationChime();
      fireBadgeCelebrationConfetti(0.5, 0.3);
      if (onShowToast) {
        onShowToast("⚡ Poin kesehatan otomatis berhasil disinkronkan dengan data wearable terbaru!", "success");
      }
    }, 1200);
  };

  // Send Cheer reaction
  const handleSendCheer = (memberId: string, memberName: string, emoji: string, messageText: string) => {
    setCheerMap(prev => ({
      ...prev,
      [memberId]: (prev[memberId] || 0) + 1
    }));

    const newId = Date.now();
    setFloatingEmojis(prev => [...prev, { id: newId, emoji, memberId }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== newId));
    }, 1800);

    playCelebrationChime();
    setCheeringMemberId(null);

    if (onShowToast) {
      onShowToast(`🎉 Semangat terkirim untuk ${memberName}: "${emoji} ${messageText}"`, "success");
    }
  };

  // Open Streak Badge Detail Modal with confetti burst and audio chime
  const handleOpenBadgeDetail = (badge: StreakBadge, event?: React.MouseEvent) => {
    let originX = 0.5;
    let originY = 0.45;
    if (event) {
      originX = Math.max(0.1, Math.min(0.9, event.clientX / window.innerWidth));
      originY = Math.max(0.1, Math.min(0.9, event.clientY / window.innerHeight));
    }
    fireBadgeCelebrationConfetti(originX, originY);
    playCelebrationChime();
    setSelectedStreakBadge(badge);
  };

  // Dedicated celebration trigger with confetti and sound for newly unlocked badge
  const handleCelebrateFreshBadge = (badge: StreakBadge, event?: React.MouseEvent) => {
    let originX = 0.5;
    let originY = 0.45;
    if (event) {
      originX = Math.max(0.1, Math.min(0.9, event.clientX / window.innerWidth));
      originY = Math.max(0.1, Math.min(0.9, event.clientY / window.innerHeight));
    }
    fireBadgeCelebrationConfetti(originX, originY);
    playCelebrationChime();
    setSelectedStreakBadge(badge);

    if (onShowToast) {
      onShowToast(`🎉 Selamat untuk ${badge.memberName} atas pencapaian lencana baru: "${badge.title}"!`, "success");
    }
  };

  // Quick Celebration for 7-Day Streak milestone (cannons of confetti)
  const handleCelebrateFamilyStreak = () => {
    fireGrandCelebration();
    playCelebrationChime();
    if (onShowToast) {
      onShowToast("🏆 Luar biasa! Seluruh 5 anggota keluarga sukses mencapai dan mempertahankan 7+ Hari Streak Kebugaran!", "success");
    }
    // Floating emojis across board
    const newId = Date.now();
    setFloatingEmojis(prev => [
      ...prev,
      { id: newId, emoji: "🎉", memberId: "fam-01" },
      { id: newId + 1, emoji: "🌟", memberId: "fam-02" },
      { id: newId + 2, emoji: "🔥", memberId: "fam-03" },
      { id: newId + 3, emoji: "👑", memberId: "fam-04" },
      { id: newId + 4, emoji: "❤️", memberId: "fam-05" }
    ]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id < newId));
    }, 2000);
  };

  // Share Family Standings + 7-Day Badges to WhatsApp
  const handleShareToWhatsApp = () => {
    const header = `🏆 *PAPAN PERINGKAT & LENCANA STREAK 7-HARI KELUARGA GERSAKA* 🏃‍♂️\n` +
      `📅 Periode: ${timeframe === "weekly" ? "Minggu Ini (Akumulasi 7 Hari)" : "Hari Ini (Live Sensor)"}\n` +
      `🌟 *Status Streak:* 5/5 Anggota Keluarga Resmi Membuka Lencana Streak 7+ Hari!\n\n`;

    const rankingLines = sortedEntries.map(e => {
      const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `${e.rank}.`;
      const badgesText = e.streakBadges.map(b => `${b.icon} ${b.title}`).join(", ");
      return `${medal} *${e.member.name}* (${e.member.role})\n` +
        `   • Skor Kebugaran: ${e.wellnessScore}/100\n` +
        `   • Langkah: ${e.steps.toLocaleString("id-ID")} langkah\n` +
        `   • Streak Konsistensi: 🔥 ${e.streakDays} Hari Beruntun\n` +
        `   • Lencana Terbuka: ${badgesText}`;
    }).join("\n\n");

    const collective = `\n\n🔥 *TANTANGAN KOLEKTIF KELUARGA:*\n` +
      `Total Langkah Bersama: ${collectiveStats.totalSteps.toLocaleString("id-ID")} / ${collectiveStats.targetSteps.toLocaleString("id-ID")} langkah (${collectiveStats.progressPercent}%)\n` +
      `Total Waktu Olahraga: ${collectiveStats.totalActiveMin.toLocaleString("id-ID")} menit\n` +
      `Total Lencana Streak Terbuka: ${collectiveStats.totalStreakBadgesUnlocked} Lencana\n\n` +
      `_Ayo terus jaga konsistensi dan hidup bugar bersama GerSaKa LimoCity!_`;

    const fullText = header + rankingLines + collective;

    navigator.clipboard.writeText(fullText);
    if (onShowToast) {
      onShowToast("Ringkasan klasemen dan lencana streak keluarga berhasil disalin ke clipboard!", "success");
    }
  };

  // Get primary metric display for podium & cards
  const getMetricDisplay = (entry: FamilyLeaderboardEntry) => {
    switch (metric) {
      case "steps":
        return {
          primary: `${entry.steps.toLocaleString("id-ID")}`,
          unit: "langkah",
          sub: `${Math.round((entry.steps / entry.targetSteps) * 100)}% dari target`
        };
      case "activeMinutes":
        return {
          primary: `${entry.activeMinutes}`,
          unit: "menit",
          sub: `${entry.activeCalories.toLocaleString("id-ID")} kkal terbakar`
        };
      case "goals":
        return {
          primary: `${entry.goalCompletionRate}%`,
          unit: "tercapai",
          sub: "seluruh target aktif"
        };
      case "sleep":
        return {
          primary: `${entry.sleepScore}`,
          unit: "skor tidur",
          sub: `${entry.sleepHours.toFixed(1)} jam istirahat`
        };
      case "overall":
      default:
        return {
          primary: `${entry.wellnessScore}`,
          unit: "poin kebugaran",
          sub: `${entry.steps.toLocaleString("id-ID")} langkah • ${entry.activeMinutes} mnt`
        };
    }
  };

  return (
    <div id="family-leaderboard-module" className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* Decorative subtle ambient backdrop glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/15 via-orange-400/10 to-teal-400/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

      {/* 1. Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0 mt-0.5">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Family Wellness Leaderboard</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Sistem Lencana Streak 7-Hari Aktif
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Agregasi target langkah, menit aktif & lencana konsistensi 7 hari berturut-turut untuk seluruh anggota keluarga
            </p>
          </div>
        </div>

        {/* Timeframe Filter & WhatsApp Share Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Timeframe Toggle (Weekly vs Today) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              id="btn-timeframe-weekly"
              onClick={() => setTimeframe("weekly")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === "weekly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Minggu Ini
            </button>
            <button
              id="btn-timeframe-today"
              onClick={() => setTimeframe("today")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === "today"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Hari Ini (Live)
            </button>
          </div>

          {/* Share to WhatsApp Button */}
          <button
            id="btn-share-leaderboard-wa"
            onClick={handleShareToWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer active:scale-98"
            title="Bagikan klasemen dan lencana streak keluarga ke grup WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan ke WA</span>
          </button>
        </div>
      </div>

      {/* 2. Top Segmented Navigation: Klasemen & Lencana vs Tantangan Mingguan & Poin Otomatis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            id="tab-btn-leaderboard-standings"
            onClick={() => setActiveLeaderboardTab("leaderboard")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeLeaderboardTab === "leaderboard"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Papan Klasemen & Lencana</span>
          </button>

          <button
            type="button"
            id="tab-btn-leaderboard-challenges"
            onClick={() => setActiveLeaderboardTab("challenges")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeLeaderboardTab === "challenges"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Target className="w-4 h-4 text-orange-500" />
            <span>Tantangan Mingguan & Poin</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
              {weeklyChallenges.length} Aktif
            </span>
          </button>
        </div>

        {/* Quick Family Points Summary Pill */}
        <div 
          onClick={() => setActiveLeaderboardTab(activeLeaderboardTab === "challenges" ? "leaderboard" : "challenges")}
          className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300/70 dark:border-amber-700/70 text-xs font-bold text-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors shrink-0"
          title="Klik untuk membuka tantangan mingguan dan sistem pelacakan poin otomatis"
        >
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Pool Poin: <strong>{totalFamilyPoints.toLocaleString("id-ID")}</strong> Pts</span>
          </div>
          <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5">
            {activeLeaderboardTab === "challenges" ? "Lihat Klasemen" : "Buka Tantangan"}
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {activeLeaderboardTab === "challenges" ? (
        <WeeklyChallengesHub
          challenges={weeklyChallenges}
          memberPoints={memberPoints}
          selectedChallengeId={selectedChallengeId}
          onSelectChallenge={setSelectedChallengeId}
          onSelectMember={onSelectMember}
          onShowToast={onShowToast}
          onSyncWearablePoints={handleSyncWearablePoints}
          isSyncingPoints={isSyncingPoints}
        />
      ) : (
        <>
      {/* 2. PROMINENT NEW UNLOCK CELEBRATION BANNER (PEMBERITAHUAN PRESTASI BARU HARI INI) */}
      {freshBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-rose-500/20 dark:from-amber-950/70 dark:via-orange-950/50 dark:to-rose-950/60 border-2 border-amber-400 dark:border-amber-600 shadow-lg shadow-amber-500/15 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative z-10">
            <div className="flex items-start sm:items-center gap-3">
              {/* Animated Glowing Trophy / Popping Emoji */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{
                    scale: [1, 1.22, 1],
                    rotate: [0, 8, -8, 0]
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/30"
                >
                  🎉
                </motion.div>
                {/* Concentric Pulse Ring */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1.8], opacity: [0.8, 0.3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-2xl border-2 border-amber-400 pointer-events-none"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs animate-bounce">
                    BARU SAJA TERBUKA HARI INI! 🌟
                  </span>
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300">
                    7 Hari Streak Konsistensi Penuh
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Selamat untuk <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-400/50 underline-offset-2">Nadia Anindita (Anak Bungsu)</span>!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Resmi membuka lencana: <strong className="text-amber-700 dark:text-amber-300 font-black">{freshBadge.icon} {freshBadge.title}</strong> — "{freshBadge.subtitle}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <button
                id="btn-launch-fresh-badge-confetti"
                onClick={(e) => handleCelebrateFreshBadge(freshBadge, e)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-95 animate-pulse"
                title="Luncurkan animasi confetti perayaan"
              >
                <PartyPopper className="w-4 h-4 animate-spin" />
                <span>Rayakan dengan Confetti 🎉</span>
              </button>

              <button
                onClick={(e) => handleOpenBadgeDetail(freshBadge, e)}
                className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border-2 border-amber-400/80 dark:border-amber-600 text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Detail Medali 🏆</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. PROMINENT 7-DAY STREAK BADGE SHOWCASE (ETALASE LENCANA KONSISTENSI KELUARGA) */}
      <div 
        id="streak-badges-showcase-section"
        className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 rounded-2xl p-4 sm:p-5 border-2 border-amber-300/80 dark:border-amber-700/80 shadow-sm relative overflow-hidden"
      >
        {/* Top Header inside showcase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/70 dark:border-amber-800/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Etalase Lencana Streak 7-Hari</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                    Prestisius
                  </span>
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Terbuka otomatis saat anggota keluarga konsisten mencapai target kesehatan 7 hari berturut-turut
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950 px-2.5 py-1 rounded-xl border border-amber-300/60 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>5/5 Anggota Telah Membuka Lencana!</span>
            </span>

            <button
              onClick={handleCelebrateFamilyStreak}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer active:scale-95"
              title="Rayakan pencapaian streak seluruh keluarga dengan hujan confetti"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rayakan Semua 🎉</span>
            </button>
          </div>
        </div>

        {/* Cards Grid: 5 Family Members with their Unlocked 7-Day Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3.5">
          {sortedEntries.map((entry) => {
            const primaryBadge = entry.streakBadges[entry.streakBadges.length - 1] || entry.streakBadges[0];
            const isFreshUnlock = entry.member.id === "fam-04";

            return (
              <motion.div
                key={entry.member.id}
                whileHover={{ y: -3 }}
                onClick={(e) => isFreshUnlock ? handleCelebrateFreshBadge(primaryBadge, e) : handleOpenBadgeDetail(primaryBadge, e)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative bg-white dark:bg-slate-800/90 shadow-xs hover:shadow-md ${
                  isFreshUnlock
                    ? "border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    : "border-amber-200/90 dark:border-slate-700 hover:border-amber-400"
                }`}
              >
                {/* Continuous Breathing Glow Aura for Newly Unlocked Badge */}
                {isFreshUnlock && (
                  <motion.div
                    animate={{
                      scale: [1, 1.03, 1],
                      opacity: [0.35, 0.75, 0.35]
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-2xl border-2 border-amber-400 dark:border-amber-400 pointer-events-none"
                  />
                )}

                {/* Fresh Unlock Ribbon */}
                {isFreshUnlock && (
                  <span className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md animate-bounce z-10">
                    BARU TERBUKA! 🎉
                  </span>
                )}

                {/* Top: Avatar with Golden Flame Aura & Concentric Pulse for Fresh Unlock */}
                <div className="flex items-center gap-2.5 mb-2 relative">
                  <div className="relative">
                    {isFreshUnlock && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1.7], opacity: [0.7, 0.25, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 rounded-xl bg-amber-400/40 pointer-events-none -m-1"
                      />
                    )}
                    <img
                      src={entry.member.avatarUrl}
                      alt={entry.member.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400 shadow-xs relative z-10"
                    />
                    <span className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-xs z-20">
                      {primaryBadge.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {entry.member.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {entry.member.role}
                    </p>
                  </div>
                </div>

                {/* Streak Counter Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                    <span>{entry.streakDays} Hari Streak</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Terbuka
                  </span>
                </div>

                {/* Badge Title Card with Radial Glow on Fresh Unlock */}
                <div className={`p-2 rounded-xl text-center relative overflow-hidden ${
                  isFreshUnlock
                    ? "bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 dark:from-amber-950/60 dark:via-orange-950/50 dark:to-rose-950/50 border-2 border-amber-400 dark:border-amber-600 shadow-xs"
                    : "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60"
                }`}>
                  <div className="text-lg filter drop-shadow-xs mb-0.5">
                    {primaryBadge.icon}
                  </div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate">
                    {primaryBadge.title}
                  </div>
                  <p className="text-[9px] text-amber-700 dark:text-amber-400 truncate mt-0.5">
                    {primaryBadge.subtitle}
                  </p>
                </div>

                {/* 7-Day Consistency Dot Matrix */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400">7-Hari:</span>
                  <div className="flex items-center gap-1">
                    {["S", "S", "R", "K", "J", "S", "M"].map((day, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center shadow-2xs"
                        title={`Hari ke-${idx + 1} Target Tercapai`}
                      >
                        ✓
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button: Confetti Blast for Fresh Unlock or Detail Inspection */}
                {isFreshUnlock ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCelebrateFreshBadge(primaryBadge, e);
                    }}
                    className="mt-2 w-full py-1.5 px-2 rounded-xl text-[10px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-amber-500/30 flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-pulse"
                  >
                    <PartyPopper className="w-3.5 h-3.5" />
                    <span>Rayakan Confetti 🎉</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBadgeDetail(primaryBadge, e);
                    }}
                    className="mt-2 w-full py-1 px-2 rounded-xl text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-800 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Lihat Medali</span>
                  </button>
                )}

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Metric Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 text-xs no-scrollbar">
        <button
          id="tab-metric-overall"
          onClick={() => setMetric("overall")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
            metric === "overall"
              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
              : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Skor Terpadu</span>
        </button>

        <button
          id="tab-metric-steps"
          onClick={() => setMetric("steps")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
            metric === "steps"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Langkah Kaki</span>
        </button>

        <button
          id="tab-metric-active-minutes"
          onClick={() => setMetric("activeMinutes")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
            metric === "activeMinutes"
              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
              : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Menit Aktif & Kalori</span>
        </button>

        <button
          id="tab-metric-goals"
          onClick={() => setMetric("goals")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
            metric === "goals"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
              : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Pencapaian Target</span>
        </button>

        <button
          id="tab-metric-sleep"
          onClick={() => setMetric("sleep")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
            metric === "sleep"
              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
              : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-500"
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Tidur & Pemulihan</span>
        </button>
      </div>

      {/* 4. Weekly Challenge Teaser Banner */}
      <div 
        onClick={() => setActiveLeaderboardTab("challenges")}
        className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-teal-500/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-teal-950/30 border-2 border-amber-300/80 dark:border-amber-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all group shadow-xs"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/25 shrink-0 group-hover:scale-105 transition-transform">
            🎯
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Tantangan Mingguan Aktif: "Most Steps Taken" & "Consistency Champion"
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
                {weeklyChallenges.length} Tantangan
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
              Reihan memimpin 68.200 langkah • Nadia klaim bonus 7-Hari Streak • <strong>{totalFamilyPoints.toLocaleString("id-ID")} Pts</strong> terakumulasi otomatis!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0 self-end sm:self-center">
          <span>Buka Papan Tantangan & Poin</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 5. Collective Family Milestone Challenge Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-amber-950/30 rounded-2xl p-4 sm:p-5 border border-emerald-300/60 dark:border-emerald-800/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-600 text-white text-xs">
                <Users className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Tantangan Kolektif Keluarga GerSaKa
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                {collectiveStats.progressPercent}% Tercapai
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Target Bersama: {collectiveStats.targetSteps.toLocaleString("id-ID")} Langkah {timeframe === "weekly" ? "Mingguan" : "Hari Ini"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Total capaian keluarga saat ini: <strong className="text-emerald-700 dark:text-emerald-300">{collectiveStats.totalSteps.toLocaleString("id-ID")} langkah</strong> • <strong className="text-teal-700 dark:text-teal-300">{collectiveStats.totalActiveMin} menit aktif</strong> • Rata-rata Skor: <strong>{collectiveStats.avgWellness}/100</strong>
            </p>
          </div>

          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Sinergi Sehat Keluarga</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {collectiveStats.totalSteps.toLocaleString("id-ID")} / {collectiveStats.targetSteps.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${collectiveStats.progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top 3 Podium Display with Prominent 7-Day Badges */}
      <div className="pt-2">
        <div className="text-center mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Podium Kampiun Kebugaran Keluarga
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-4">
          
          {/* 2nd Place Podium (Left) */}
          {secondPlace && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              onClick={() => onSelectMember(secondPlace.member.id)}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                selectedMemberId === secondPlace.member.id
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-400 ring-2 ring-slate-400/30"
                  : "bg-slate-50/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400"
              }`}
            >
              {/* Medal Badge */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm flex items-center justify-center mx-auto mb-2 shadow-sm border-2 border-white dark:border-slate-800">
                🥈
              </div>

              {/* Avatar */}
              <div className="relative inline-block mb-1.5">
                <img
                  src={secondPlace.member.avatarUrl}
                  alt={secondPlace.member.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600 shadow-sm mx-auto"
                />
                <span className="absolute -bottom-1 -right-1 text-xs">
                  {secondPlace.badgeIcon}
                </span>
              </div>

              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {secondPlace.member.name}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {secondPlace.member.role}
              </p>

              {/* Prominent Streak Badge Pill on Podium */}
              {secondPlace.hasUnlocked7DayStreak && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBadgeDetail(secondPlace.streakBadges[0], e);
                  }}
                  className="my-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60 hover:bg-amber-200 transition-colors cursor-pointer"
                  title="Klik untuk melihat detail lencana streak 7 hari"
                >
                  <Flame className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                  <span>Streak {secondPlace.streakDays}H • {secondPlace.streakBadges[0].title.split(" ")[0]}</span>
                </div>
              )}

              {/* Automated Points Pill */}
              {pointMap[secondPlace.member.id] && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLeaderboardTab("challenges");
                  }}
                  className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                  title="Klik untuk melihat rincian poin otomatis anggota keluarga ini di Tantangan Mingguan"
                >
                  <Coins className="w-2.5 h-2.5 text-amber-500" />
                  <span>{pointMap[secondPlace.member.id].totalPoints.toLocaleString("id-ID")} Pts</span>
                </div>
              )}

              {/* Metric Value */}
              <div className="mt-1 pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {getMetricDisplay(secondPlace).primary}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {getMetricDisplay(secondPlace).unit}
                </div>
              </div>

              {/* Podium Step Block */}
              <div className="mt-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                Juara 2
              </div>
            </motion.div>
          )}

          {/* 1st Place Podium (Center - Tallest) */}
          {firstPlace && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              onClick={() => onSelectMember(firstPlace.member.id)}
              className={`p-3.5 sm:p-5 rounded-2xl border text-center transition-all cursor-pointer relative -mt-4 shadow-md group ${
                selectedMemberId === firstPlace.member.id
                  ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40"
                  : "bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-slate-900 border-amber-300 dark:border-amber-700/80 hover:border-amber-400"
              }`}
            >
              {/* Crown & Medal */}
              <div className="relative mb-1">
                <Crown className="w-6 h-6 text-amber-500 mx-auto animate-bounce" />
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md border-2 border-white dark:border-slate-800">
                  🥇
                </div>
              </div>

              {/* Avatar */}
              <div className="relative inline-block mb-1.5">
                <img
                  src={firstPlace.member.avatarUrl}
                  alt={firstPlace.member.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-amber-400 shadow-md mx-auto ring-4 ring-amber-400/20"
                />
                <span className="absolute -bottom-1 -right-1 text-sm bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-xs">
                  {firstPlace.badgeIcon}
                </span>
              </div>

              <h5 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {firstPlace.member.name}
              </h5>
              <p className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 truncate">
                {firstPlace.member.role} • {firstPlace.badgeTitle}
              </p>

              {/* Prominent Streak Badge Pill on Podium */}
              {firstPlace.hasUnlocked7DayStreak && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBadgeDetail(firstPlace.streakBadges[0], e);
                  }}
                  className="my-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs hover:opacity-95 transition-all cursor-pointer ring-2 ring-amber-300/60"
                  title="Klik untuk melihat lencana streak prestisius"
                >
                  <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
                  <span>🔥 Streak {firstPlace.streakDays}H: {firstPlace.streakBadges[firstPlace.streakBadges.length - 1].title}</span>
                </div>
              )}

              {/* Automated Points Pill */}
              {pointMap[firstPlace.member.id] && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLeaderboardTab("challenges");
                  }}
                  className="mb-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/80 cursor-pointer transition-colors shadow-2xs"
                  title="Klik untuk membuka rincian poin otomatis di papan tantangan"
                >
                  <Coins className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{pointMap[firstPlace.member.id].totalPoints.toLocaleString("id-ID")} Pts</span>
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300">({pointMap[firstPlace.member.id].tierBadge} {pointMap[firstPlace.member.id].tier.split(" ")[0]})</span>
                </div>
              )}

              {/* Metric Value */}
              <div className="mt-1 pt-1.5 border-t border-amber-200 dark:border-amber-800/60">
                <div className="text-base sm:text-xl font-black text-amber-600 dark:text-amber-400">
                  {getMetricDisplay(firstPlace).primary}
                </div>
                <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80 uppercase font-bold">
                  {getMetricDisplay(firstPlace).unit}
                </div>
              </div>

              {/* Podium Step Block */}
              <div className="mt-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-[10px] sm:text-xs font-extrabold text-amber-950 shadow-xs">
                Kampiun #1
              </div>
            </motion.div>
          )}

          {/* 3rd Place Podium (Right) */}
          {thirdPlace && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={() => onSelectMember(thirdPlace.member.id)}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                selectedMemberId === thirdPlace.member.id
                  ? "bg-amber-100/60 dark:bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/20"
                  : "bg-slate-50/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-600/50"
              }`}
            >
              {/* Medal Badge */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-700/80 text-amber-100 font-extrabold text-xs sm:text-sm flex items-center justify-center mx-auto mb-2 shadow-sm border-2 border-white dark:border-slate-800">
                🥉
              </div>

              {/* Avatar */}
              <div className="relative inline-block mb-1.5">
                <img
                  src={thirdPlace.member.avatarUrl}
                  alt={thirdPlace.member.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-600/50 shadow-sm mx-auto"
                />
                <span className="absolute -bottom-1 -right-1 text-xs">
                  {thirdPlace.badgeIcon}
                </span>
              </div>

              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {thirdPlace.member.name}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {thirdPlace.member.role}
              </p>

              {/* Prominent Streak Badge Pill on Podium */}
              {thirdPlace.hasUnlocked7DayStreak && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBadgeDetail(thirdPlace.streakBadges[0], e);
                  }}
                  className="my-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60 hover:bg-amber-200 transition-colors cursor-pointer"
                  title="Klik untuk melihat detail lencana streak 7 hari"
                >
                  <Flame className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                  <span>Streak {thirdPlace.streakDays}H • {thirdPlace.streakBadges[0].title.split(" ")[0]}</span>
                </div>
              )}

              {/* Automated Points Pill */}
              {pointMap[thirdPlace.member.id] && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLeaderboardTab("challenges");
                  }}
                  className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                  title="Klik untuk membuka rincian poin otomatis di papan tantangan"
                >
                  <Coins className="w-2.5 h-2.5 text-amber-500" />
                  <span>{pointMap[thirdPlace.member.id].totalPoints.toLocaleString("id-ID")} Pts</span>
                </div>
              )}

              {/* Metric Value */}
              <div className="mt-1 pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {getMetricDisplay(thirdPlace).primary}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {getMetricDisplay(thirdPlace).unit}
                </div>
              </div>

              {/* Podium Step Block */}
              <div className="mt-2.5 py-1 rounded-lg bg-amber-800/20 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                Juara 3
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* 6. Complete Rankings List (#1 to #5) with Prominent Badges & Streak Dots */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          <span>Klasemen Seluruh Anggota Keluarga ({sortedEntries.length} Jiwa)</span>
          <span>Klik lencana atau anggota untuk inspeksi</span>
        </div>

        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const isSelected = selectedMemberId === entry.member.id;
            const metricInfo = getMetricDisplay(entry);
            const rankMedal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;
            const primaryBadge = entry.streakBadges[entry.streakBadges.length - 1] || entry.streakBadges[0];

            return (
              <div
                key={entry.member.id}
                className={`p-4 rounded-2xl border transition-all relative ${
                  isSelected
                    ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Rank, Avatar, Name & Device */}
                  <div 
                    onClick={() => onSelectMember(entry.member.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    {/* Rank pill */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                      entry.rank === 1
                        ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                        : entry.rank === 2
                        ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                        : entry.rank === 3
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
                    }`}>
                      {rankMedal}
                    </div>

                    {/* Avatar with Wearable Brand Badge */}
                    <div className="relative shrink-0">
                      <img
                        src={entry.member.avatarUrl}
                        alt={entry.member.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300/80 dark:border-slate-700"
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs">
                        {primaryBadge.icon}
                      </span>
                    </div>

                    {/* Member Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {entry.member.name}
                        </h4>
                        <span className="px-2 py-0.2 rounded-md text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {entry.member.role}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white">
                            Aktif Dipilih
                          </span>
                        )}
                      </div>

                      {/* Prominent Streak Badge Bar */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Clickable Badge Tag */}
                        {entry.member.id === "fam-04" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCelebrateFreshBadge(primaryBadge, e);
                            }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-3 py-0.5 rounded-lg shadow-sm border border-amber-300 hover:brightness-110 transition-all cursor-pointer animate-pulse"
                            title="Lencana baru terbuka hari ini! Klik untuk meluncurkan confetti & suara perayaan"
                          >
                            <PartyPopper className="w-3.5 h-3.5" />
                            <span>BARU: {primaryBadge.title} 🎉</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBadgeDetail(primaryBadge, e);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-300/70 hover:bg-amber-200 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>{primaryBadge.title}</span>
                          </button>
                        )}

                        <span className="text-[10px] text-slate-400">•</span>

                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <Watch className="w-3 h-3 text-emerald-500" />
                          {entry.member.connectedWearable.deviceName.split(" ")[0]}
                        </span>

                        <span className="text-[10px] text-slate-400">•</span>

                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          <Flame className="w-3 h-3 animate-pulse" />
                          {entry.streakDays} hari konsisten
                        </span>

                        {pointMap[entry.member.id] && (
                          <>
                            <span className="text-[10px] text-slate-400">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveLeaderboardTab("challenges");
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-md hover:bg-amber-200 transition-colors cursor-pointer border border-amber-300/50 shadow-2xs"
                              title="Klik untuk melihat posisi dan rincian poin otomatis di Tantangan Mingguan"
                            >
                              <Coins className="w-2.5 h-2.5 text-amber-600" />
                              <span>{pointMap[entry.member.id].totalPoints.toLocaleString("id-ID")} Pts</span>
                              <span className="text-[9px] text-slate-500 font-semibold">({pointMap[entry.member.id].tierBadge})</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics Progress, Values & Cheer Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60">
                    
                    {/* Metric Score & Subtitle */}
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline gap-1 sm:justify-end">
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {metricInfo.primary}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {metricInfo.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {metricInfo.sub}
                      </p>
                    </div>

                    {/* View Badge Detail Button */}
                    <button
                      onClick={(e) => entry.member.id === "fam-04" ? handleCelebrateFreshBadge(primaryBadge, e) : handleOpenBadgeDetail(primaryBadge, e)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        entry.member.id === "fam-04"
                          ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs animate-bounce"
                          : "bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
                      }`}
                      title={entry.member.id === "fam-04" ? "Rayakan lencana baru dengan confetti!" : "Lihat sertifikasi lencana 7 hari"}
                    >
                      {entry.member.id === "fam-04" ? (
                        <>
                          <PartyPopper className="w-3.5 h-3.5" />
                          <span>Rayakan 🎉</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span className="hidden sm:inline">Lencana</span>
                        </>
                      )}
                    </button>

                    {/* Interactive Cheer Button */}
                    <div className="relative">
                      <button
                        id={`btn-cheer-${entry.member.id}`}
                        onClick={() => setCheeringMemberId(cheeringMemberId === entry.member.id ? null : entry.member.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                          cheeringMemberId === entry.member.id
                            ? "bg-amber-500 text-white"
                            : "bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-amber-400"
                        }`}
                        title="Kirim dukungan semangat & reaksi ke anggota keluarga ini"
                      >
                        <Smile className="w-3.5 h-3.5 text-amber-500" />
                        <span>Dukung</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold">
                          {entry.cheerCount}
                        </span>
                      </button>

                      {/* Floating Cheer Emojis animation */}
                      {floatingEmojis.filter(e => e.memberId === entry.member.id).map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 1, y: 0, scale: 0.8 }}
                          animate={{ opacity: 0, y: -45, scale: 1.4 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none text-xl z-30"
                        >
                          {item.emoji}
                        </motion.div>
                      ))}

                      {/* Quick Cheer Popover Picker */}
                      <AnimatePresence>
                        {cheeringMemberId === entry.member.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 bottom-full mb-2 z-40 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3"
                          >
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white">
                              <span>Kirim Semangat ke {entry.member.name.split(" ")[0]}!</span>
                              <button
                                onClick={() => setCheeringMemberId(null)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              {CHEER_PRESETS.map((p, pIdx) => (
                                <button
                                  key={pIdx}
                                  onClick={() => handleSendCheer(entry.member.id, entry.member.name, p.emoji, p.text)}
                                  className="flex items-center gap-1.5 p-2 rounded-xl text-left text-[11px] font-semibold bg-slate-50 dark:bg-slate-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-slate-200 dark:border-slate-600 hover:border-amber-400 transition-colors cursor-pointer"
                                >
                                  <span className="text-base">{p.emoji}</span>
                                  <span className="truncate">{p.text.split(" ")[0]} {p.text.split(" ")[1]}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                </div>

                {/* Bottom Row: 7-Day Consistency Dot Timeline & Progress Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  
                  {/* Left: 7-day visual dot timeline */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3 text-emerald-500" />
                      <span>Rekor 7 Hari Penuh:</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60 flex items-center gap-0.5"
                          title={`${d}: Target Tercapai`}
                        >
                          <span>{d}</span>
                          <span className="text-amber-600">✓</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Score Progress Bar */}
                  <div className="flex items-center gap-2.5 flex-1 max-w-xs sm:justify-end">
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${
                            metric === "steps"
                              ? Math.min(100, Math.round((entry.steps / entry.targetSteps) * 100))
                              : metric === "activeMinutes"
                              ? Math.min(100, Math.round((entry.activeMinutes / (timeframe === "weekly" ? 280 : 50)) * 100))
                              : metric === "goals"
                              ? entry.goalCompletionRate
                              : metric === "sleep"
                              ? entry.sleepScore
                              : entry.wellnessScore
                          }%` 
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          entry.rank === 1
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                            : entry.rank === 2
                            ? "bg-gradient-to-r from-slate-400 to-slate-500"
                            : entry.rank === 3
                            ? "bg-gradient-to-r from-amber-600 to-orange-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                      {entry.wellnessScore}%
                    </span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>
      </>
      )}

      {/* 7. Footer Educational & Motivational Note */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            Sistem lencana streak 7 hari divalidasi dokter spesialis untuk membentuk kebiasaan gerak permanen tanpa cedera atau kelelahan berlebih.
          </span>
        </div>

        <button
          onClick={handleShareToWhatsApp}
          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Kirim Rekap Klasemen & Lencana</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 8. Interactive Streak Badge Detail Modal */}
      <StreakBadgeDetailModal
        badge={selectedStreakBadge}
        onClose={() => setSelectedStreakBadge(null)}
        onSendCheer={handleSendCheer}
        onShowToast={onShowToast}
      />

    </div>
  );
};
