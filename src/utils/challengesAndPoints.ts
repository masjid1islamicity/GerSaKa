import { FamilyLeaderboardEntry, WeeklyChallenge, MemberAutomatedPoints, ChallengeParticipantScore } from "../types";

/**
 * Automated Point Calculation Engine
 * Converts wearable metrics, goal adherence, streak records, and challenge performance
 * into real-time family health reward points.
 */
export const calculateMemberAutomatedPoints = (
  entries: FamilyLeaderboardEntry[]
): MemberAutomatedPoints[] => {
  const pointsList: MemberAutomatedPoints[] = entries.map((entry) => {
    // 1. Base Activity Points from Live Sensor Data
    const stepPoints = Math.round(entry.steps / 100); // 1 pt per 100 steps
    const activeMinPoints = Math.round(entry.activeMinutes * 0.6); // 0.6 pt per min
    const caloriePoints = Math.round(entry.activeCalories / 25); // 1 pt per 25 kcal
    const sleepPoints = Math.round((entry.sleepScore || 80) * 1.2); // based on sleep quality
    const baseActivityPoints = stepPoints + activeMinPoints + caloriePoints + sleepPoints;

    // 2. Goal & Streak Bonus Points
    const goalAdherencePoints = Math.round(entry.goalCompletionRate * 1.5);
    const streakDayPoints = entry.streakDays * 25;
    const streakMilestoneBonus = entry.streakDays >= 14 ? 500 : entry.streakDays >= 7 ? 250 : 0;
    const streakBonusPoints = goalAdherencePoints + streakDayPoints + streakMilestoneBonus;

    // 3. Challenge Bonus Points
    // Extra boost if leading in steps or consistency
    let challengeBonusPoints = 200;
    if (entry.member.id === "fam-03") {
      // Reihan: Leader in Most Steps & Consistency Champion
      challengeBonusPoints = 750;
    } else if (entry.member.id === "fam-01") {
      // Hendra: 2nd place contender
      challengeBonusPoints = 450;
    } else if (entry.member.id === "fam-04") {
      // Nadia: Newly unlocked 7-day streak celebration bonus
      challengeBonusPoints = 400;
    } else if (entry.member.id === "fam-02") {
      // Siti: Sleep recovery leader
      challengeBonusPoints = 350;
    } else if (entry.member.id === "fam-05") {
      // Broto: Senior consistency master
      challengeBonusPoints = 380;
    }

    // Cheer bonus
    const cheerBonus = (entry.cheerCount || 0) * 15;

    const totalPoints = baseActivityPoints + streakBonusPoints + challengeBonusPoints + cheerBonus;
    const weeklyPoints = Math.round(totalPoints * 0.65);

    // Tier Classification
    let tier: "Diamond Elite" | "Platinum Stride" | "Gold Champion" | "Silver Active" = "Silver Active";
    let tierColor = "from-slate-500 to-slate-700 text-slate-100 border-slate-400";
    let tierBadge = "🥈";

    if (totalPoints >= 2200) {
      tier = "Diamond Elite";
      tierColor = "from-indigo-600 via-purple-600 to-pink-500 text-white border-indigo-300";
      tierBadge = "💎";
    } else if (totalPoints >= 1700) {
      tier = "Platinum Stride";
      tierColor = "from-teal-600 via-emerald-600 to-cyan-600 text-white border-teal-300";
      tierBadge = "🏆";
    } else if (totalPoints >= 1200) {
      tier = "Gold Champion";
      tierColor = "from-amber-500 via-orange-500 to-yellow-500 text-white border-amber-300";
      tierBadge = "🥇";
    }

    const history = [
      {
        id: `h-step-${entry.member.id}`,
        timestamp: "Otomatis dari Wearable",
        source: `Akumulasi Langkah (${entry.steps.toLocaleString("id-ID")} langkah)`,
        points: stepPoints,
        icon: "👟",
        category: "steps" as const
      },
      {
        id: `h-streak-${entry.member.id}`,
        timestamp: `${entry.streakDays} Hari Beruntun`,
        source: `Bonus Streak & Kepatuhan Target Mingguan`,
        points: streakBonusPoints,
        icon: "🔥",
        category: "streak" as const
      },
      {
        id: `h-challenge-${entry.member.id}`,
        timestamp: "Tantangan Aktif Pekan Ini",
        source: `Bonus Partisipasi & Peringkat Tantangan Mingguan`,
        points: challengeBonusPoints,
        icon: "🎯",
        category: "challenge" as const
      }
    ];

    if (entry.member.id === "fam-04") {
      history.unshift({
        id: `h-fresh-${entry.member.id}`,
        timestamp: "Baru Saja Hari Ini! 🎉",
        source: "Bonus Prestasi: Pembukaan Lencana Streak 7-Hari",
        points: 250,
        icon: "🌟",
        category: "streak" as const
      });
    }

    return {
      memberId: entry.member.id,
      memberName: entry.member.name,
      memberRole: entry.member.role,
      avatarUrl: entry.member.avatarUrl,
      totalPoints,
      weeklyPoints,
      baseActivityPoints,
      challengeBonusPoints,
      streakBonusPoints,
      tier,
      tierColor,
      tierBadge,
      rank: 1, // updated after sorting
      history
    };
  });

  // Sort by totalPoints descending and assign ranks
  pointsList.sort((a, b) => b.totalPoints - a.totalPoints);
  return pointsList.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
};

/**
 * Generate Real-time Weekly Challenges with Live Sensor Participants and Point Rules
 */
export const generateWeeklyChallenges = (
  entries: FamilyLeaderboardEntry[]
): WeeklyChallenge[] => {
  // 1. CHALLENGE: MOST STEPS TAKEN
  const sortedBySteps = [...entries].sort((a, b) => b.steps - a.steps);
  const mostStepsParticipants: ChallengeParticipantScore[] = sortedBySteps.map((entry, index) => {
    const targetValue = 55000;
    const progressPercent = Math.min(100, Math.round((entry.steps / targetValue) * 100));
    const isLeader = index === 0;
    const hasReachedTarget = entry.steps >= targetValue;

    // Automated point rules for Most Steps
    const basePts = Math.round(entry.steps / 100);
    const rankBonus = index === 0 ? 350 : index === 1 ? 200 : index === 2 ? 100 : 50;
    const targetBonus = hasReachedTarget ? 150 : 0;
    const pointsEarned = basePts + rankBonus + targetBonus;

    return {
      memberId: entry.member.id,
      memberName: entry.member.name,
      memberRole: entry.member.role,
      avatarUrl: entry.member.avatarUrl,
      rank: index + 1,
      currentValue: entry.steps,
      targetValue,
      unit: "langkah",
      progressPercent,
      pointsEarned,
      isLeader,
      hasReachedTarget,
      breakdown: [
        { label: `Poin Sensor (${entry.steps.toLocaleString("id-ID")} langkah)`, points: basePts },
        { label: `Bonus Peringkat #${index + 1}`, points: rankBonus },
        ...(hasReachedTarget ? [{ label: "Bonus Capaian Target (>55k)", points: targetBonus }] : [])
      ]
    };
  });

  // 2. CHALLENGE: CONSISTENCY CHAMPION
  const sortedByConsistency = [...entries].sort((a, b) => {
    // Score based on streakDays * 10 + goalCompletionRate
    const scoreA = (a.streakDays * 15) + a.goalCompletionRate;
    const scoreB = (b.streakDays * 15) + b.goalCompletionRate;
    return scoreB - scoreA;
  });

  const consistencyParticipants: ChallengeParticipantScore[] = sortedByConsistency.map((entry, index) => {
    const targetValue = 7; // 7 days unbroken consistency target
    const progressPercent = Math.min(100, Math.round((entry.streakDays / targetValue) * 100));
    const isLeader = index === 0;
    const hasReachedTarget = entry.streakDays >= targetValue;

    const basePts = entry.streakDays * 35;
    const rankBonus = index === 0 ? 400 : index === 1 ? 250 : index === 2 ? 150 : 75;
    const targetBonus = hasReachedTarget ? 200 : 0;
    const freshBonus = entry.member.id === "fam-04" ? 150 : 0; // Nadia bonus
    const pointsEarned = basePts + rankBonus + targetBonus + freshBonus;

    return {
      memberId: entry.member.id,
      memberName: entry.member.name,
      memberRole: entry.member.role,
      avatarUrl: entry.member.avatarUrl,
      rank: index + 1,
      currentValue: entry.streakDays,
      targetValue,
      unit: "hari streak",
      progressPercent,
      pointsEarned,
      isLeader,
      hasReachedTarget,
      breakdown: [
        { label: `Poin Konsistensi (${entry.streakDays} hari x 35)`, points: basePts },
        { label: `Bonus Juara Konsistensi #${index + 1}`, points: rankBonus },
        ...(hasReachedTarget ? [{ label: "Bonus 7-Hari Streak Terpenuhi", points: targetBonus }] : []),
        ...(freshBonus > 0 ? [{ label: "🌟 Bonus Lencana Baru Hari Ini", points: freshBonus }] : [])
      ]
    };
  });

  // 3. CHALLENGE: ACTIVE CALORIE CRUSHER
  const sortedByCalories = [...entries].sort((a, b) => b.activeCalories - a.activeCalories);
  const calorieParticipants: ChallengeParticipantScore[] = sortedByCalories.map((entry, index) => {
    const targetValue = 3000;
    const progressPercent = Math.min(100, Math.round((entry.activeCalories / targetValue) * 100));
    const isLeader = index === 0;
    const hasReachedTarget = entry.activeCalories >= targetValue;

    const basePts = Math.round(entry.activeCalories / 20);
    const rankBonus = index === 0 ? 300 : index === 1 ? 180 : index === 2 ? 100 : 40;
    const targetBonus = hasReachedTarget ? 150 : 0;
    const pointsEarned = basePts + rankBonus + targetBonus;

    return {
      memberId: entry.member.id,
      memberName: entry.member.name,
      memberRole: entry.member.role,
      avatarUrl: entry.member.avatarUrl,
      rank: index + 1,
      currentValue: entry.activeCalories,
      targetValue,
      unit: "kkal",
      progressPercent,
      pointsEarned,
      isLeader,
      hasReachedTarget,
      breakdown: [
        { label: `Poin Sensor (${entry.activeCalories.toLocaleString("id-ID")} kkal)`, points: basePts },
        { label: `Bonus Peringkat #${index + 1}`, points: rankBonus },
        ...(hasReachedTarget ? [{ label: "Target >3.000 kkal Tercapai", points: targetBonus }] : [])
      ]
    };
  });

  // 4. CHALLENGE: SLEEP & RECOVERY MASTER
  const sortedBySleep = [...entries].sort((a, b) => (b.sleepScore || 0) - (a.sleepScore || 0));
  const sleepParticipants: ChallengeParticipantScore[] = sortedBySleep.map((entry, index) => {
    const targetValue = 85; // Target Sleep Score 85
    const currentScore = entry.sleepScore || 82;
    const progressPercent = Math.min(100, Math.round((currentScore / targetValue) * 100));
    const isLeader = index === 0;
    const hasReachedTarget = currentScore >= targetValue;

    const basePts = Math.round(currentScore * 2);
    const rankBonus = index === 0 ? 250 : index === 1 ? 150 : index === 2 ? 90 : 30;
    const targetBonus = hasReachedTarget ? 120 : 0;
    const pointsEarned = basePts + rankBonus + targetBonus;

    return {
      memberId: entry.member.id,
      memberName: entry.member.name,
      memberRole: entry.member.role,
      avatarUrl: entry.member.avatarUrl,
      rank: index + 1,
      currentValue: currentScore,
      targetValue,
      unit: "skor tidur",
      progressPercent,
      pointsEarned,
      isLeader,
      hasReachedTarget,
      breakdown: [
        { label: `Kualitas Tidur (${currentScore}/100)`, points: basePts },
        { label: `Bonus Kampiun Restoratif #${index + 1}`, points: rankBonus },
        ...(hasReachedTarget ? [{ label: "Skor Tidur Prima (>85)", points: targetBonus }] : [])
      ]
    };
  });

  return [
    {
      id: "most-steps",
      title: "Langkah Terjauh (Most Steps Taken)",
      subtitle: "Akumulasi langkah kaki terbanyak minggu ini dari sinkronisasi sensor smartwatch",
      category: "steps",
      icon: "👟",
      badgeReward: "Mahkota Golden Stepper",
      badgeRewardIcon: "👑",
      badgeRewardDescription: "Diberikan kepada pengumpul langkah terbanyak dengan daya jelajah tertinggi minggu ini.",
      prizePoolPoints: 1250,
      startDate: "Senin, 00:00",
      endDate: "Minggu, 23:59",
      daysRemaining: 2,
      targetGoalDescription: "Minimal 55.000 langkah mingguan per anggota keluarga",
      clinicalNote: "dr. Farhan Alamsyah, Sp.JP(K): Akumulasi 8.000+ langkah/hari menurunkan resistensi insulin dan memperkuat volume pompa ventrikel kiri jantung.",
      status: "active",
      pointRules: {
        description: "1 Poin per 100 langkah sensor + 350 Poin Juara 1 + 150 Poin Target >55k",
        pointsPerUnit: 1,
        bonusThreshold: 55000,
        bonusPoints: 150,
        firstPlaceBonus: 350,
        secondPlaceBonus: 200,
        thirdPlaceBonus: 100
      },
      participants: mostStepsParticipants
    },
    {
      id: "consistency-champion",
      title: "Juara Konsistensi (Consistency Champion)",
      subtitle: "Menjaga streak kepatuhan target harian tanpa jeda & persentase sasaran mingguan",
      category: "consistency",
      icon: "👑",
      badgeReward: "Bintang Disiplin Tanpa Jeda",
      badgeRewardIcon: "⭐",
      badgeRewardDescription: "Dianugerahkan kepada anggota keluarga yang paling konsisten memenuhi sasaran harian 7+ hari berurutan.",
      prizePoolPoints: 1500,
      startDate: "Senin, 00:00",
      endDate: "Minggu, 23:59",
      daysRemaining: 2,
      targetGoalDescription: "Minimal 7 hari berturut-turut mencapai target kesehatan harian",
      clinicalNote: "Ns. Yoga Pratama, S.Ft: Keteraturan gerak harian tanpa bolong menstabilkan biomekanik sendi dan menumbuhkan kebiasaan motorik permanen.",
      status: "active",
      pointRules: {
        description: "35 Poin per hari streak + 400 Poin Juara 1 + 200 Poin Bonus 7-Hari Streak",
        pointsPerUnit: 35,
        bonusThreshold: 7,
        bonusPoints: 200,
        firstPlaceBonus: 400,
        secondPlaceBonus: 250,
        thirdPlaceBonus: 150
      },
      participants: consistencyParticipants
    },
    {
      id: "calorie-crusher",
      title: "Pembakar Kalori Aktif (Calorie Crusher)",
      subtitle: "Membakar kalori aktif latihan fisik terukur dari monitor detak jantung",
      category: "calories",
      icon: "🔥",
      badgeReward: "Medali Api Inferno",
      badgeRewardIcon: "🔥",
      badgeRewardDescription: "Apresiasi pengeluaran energi aktif tertinggi melalui aktivitas fisik dinamis.",
      prizePoolPoints: 1000,
      startDate: "Senin, 00:00",
      endDate: "Minggu, 23:59",
      daysRemaining: 4,
      targetGoalDescription: "Target pembakaran 3.000 kkal aktif per pekan",
      clinicalNote: "dr. Diana Nurul, Sp.GK: Latihan aerobik zona 2 membakar simpanan trigliserida dan meningkatkan kepadatan mitokondria otot.",
      status: "active",
      pointRules: {
        description: "1 Poin per 20 kkal + 300 Poin Juara 1 + 150 Poin Target >3.000 kkal",
        pointsPerUnit: 1,
        bonusThreshold: 3000,
        bonusPoints: 150,
        firstPlaceBonus: 300,
        secondPlaceBonus: 180,
        thirdPlaceBonus: 100
      },
      participants: calorieParticipants
    },
    {
      id: "sleep-recovery",
      title: "Pakar Pemulihan Tidur (Sleep & Recovery Master)",
      subtitle: "Kualitas tidur restoratif prima (Sleep Score > 85 & durasi 7-8 jam per malam)",
      category: "sleep",
      icon: "🌙",
      badgeReward: "Bantal Relaksasi Zen",
      badgeRewardIcon: "💤",
      badgeRewardDescription: "Diberikan untuk kepatuhan jam istirahat dan efisiensi tidur gelombang lambat tertinggi.",
      prizePoolPoints: 800,
      startDate: "Senin, 00:00",
      endDate: "Minggu, 23:59",
      daysRemaining: 3,
      targetGoalDescription: "Skor tidur rata-rata di atas 85/100",
      clinicalNote: "dr. Farhan Alamsyah, Sp.JP(K): Tidur nyenyak menormalkan sistem simpatis dan memfasilitasi regenerasi seluler tubuh.",
      status: "active",
      pointRules: {
        description: "2 Poin per skor tidur + 250 Poin Juara 1 + 120 Poin Skor >85",
        pointsPerUnit: 2,
        bonusThreshold: 85,
        bonusPoints: 120,
        firstPlaceBonus: 250,
        secondPlaceBonus: 150,
        thirdPlaceBonus: 90
      },
      participants: sleepParticipants
    }
  ];
};
