import { FamilyMember } from "../types";

export interface DailyExerciseRecord {
  dateStr: string; // "3 Nov", "4 Nov", etc.
  dayShort: string; // "Sel", "Rab", "Kam", "Jum", "Sab", "Min", "Sen"
  dayFull: string; // "Selasa", "Rabu", etc.
  fullDate: string; // "3 November 2026"
  isToday: boolean;
  minutes: number;
  targetMinutes: number;
  caloriesBurned: number;
  avgHeartRateBpm: number;
  workoutType: string;
  category: "kardio" | "kekuatan" | "mobilitas" | "sunnah";
  isTargetMet: boolean;
  cardioMinutes: number;
  mobilityMinutes: number;
  sunnahMinutes: number;
}

export interface MemberExerciseTrendSummary {
  memberId: string;
  memberName: string;
  role: string;
  avatarUrl: string;
  wearableName: string;
  wearableBrand: string;
  colorHex: string;
  dailyTarget: number;
  todayMinutes: number;
  totalWeekMinutes: number;
  avgDailyMinutes: number;
  targetMetDaysCount: number; // e.g. 6 of 7
  targetMetPercent: number; // 0-100%
  peakDay: {
    dayFull: string;
    dateStr: string;
    minutes: number;
    workoutType: string;
  };
  totalCaloriesBurned: number;
  weeklyRecords: DailyExerciseRecord[];
}

export interface FamilyExerciseComparisonPoint {
  dateStr: string;
  dayShort: string;
  dayFull: string;
  isToday: boolean;
  whoStandard: number; // 30 min reference
  // Dynamic member minutes keyed by memberId
  [memberId: string]: string | number | boolean;
}

// Preset historical 6 days prior to today for each member
const BASE_EXERCISE_HISTORY: Record<
  string,
  {
    target: number;
    color: string;
    days: Array<{
      dateStr: string;
      dayShort: string;
      dayFull: string;
      minutes: number;
      calories: number;
      avgHr: number;
      workoutType: string;
      category: "kardio" | "kekuatan" | "mobilitas" | "sunnah";
      cardio: number;
      mobility: number;
      sunnah: number;
    }>;
  }
> = {
  "fam-01": {
    target: 45,
    color: "#10b981", // emerald-500
    days: [
      { dateStr: "3 Nov", dayShort: "Sel", dayFull: "Selasa", minutes: 40, calories: 280, avgHr: 122, workoutType: "Jalan Cepat Treadmill Ergonomis", category: "kardio", cardio: 30, mobility: 10, sunnah: 0 },
      { dateStr: "4 Nov", dayShort: "Rab", dayFull: "Rabu", minutes: 45, calories: 310, avgHr: 125, workoutType: "Jalan Cepat Subuh & Peregangan", category: "sunnah", cardio: 25, mobility: 10, sunnah: 10 },
      { dateStr: "5 Nov", dayShort: "Kam", dayFull: "Kamis", minutes: 50, calories: 340, avgHr: 128, workoutType: "Latihan Kardio Interval Ringan", category: "kardio", cardio: 35, mobility: 15, sunnah: 0 },
      { dateStr: "6 Nov", dayShort: "Jum", dayFull: "Jumat", minutes: 35, calories: 240, avgHr: 118, workoutType: "Jalan Kaki Menuju Masjid", category: "sunnah", cardio: 20, mobility: 5, sunnah: 10 },
      { dateStr: "7 Nov", dayShort: "Sab", dayFull: "Sabtu", minutes: 60, calories: 420, avgHr: 132, workoutType: "Gowes Santai Bersama Keluarga", category: "kardio", cardio: 45, mobility: 15, sunnah: 0 },
      { dateStr: "8 Nov", dayShort: "Min", dayFull: "Minggu", minutes: 48, calories: 330, avgHr: 126, workoutType: "Renang Rekreasional & Mobilitas", category: "sunnah", cardio: 20, mobility: 10, sunnah: 18 },
    ],
  },
  "fam-02": {
    target: 40,
    color: "#14b8a6", // teal-500
    days: [
      { dateStr: "3 Nov", dayShort: "Sel", dayFull: "Selasa", minutes: 35, calories: 180, avgHr: 112, workoutType: "Senam Mobilitas Sendi & Lutut", category: "mobilitas", cardio: 10, mobility: 25, sunnah: 0 },
      { dateStr: "4 Nov", dayShort: "Rab", dayFull: "Rabu", minutes: 42, calories: 220, avgHr: 115, workoutType: "Jalan Sehat Pagi Kompleks", category: "sunnah", cardio: 25, mobility: 10, sunnah: 7 },
      { dateStr: "5 Nov", dayShort: "Kam", dayFull: "Kamis", minutes: 38, calories: 195, avgHr: 114, workoutType: "Pilates Ringan & Pernapasan", category: "mobilitas", cardio: 10, mobility: 28, sunnah: 0 },
      { dateStr: "6 Nov", dayShort: "Jum", dayFull: "Jumat", minutes: 45, calories: 235, avgHr: 118, workoutType: "Jalan Kaki & Peregangan Postur", category: "sunnah", cardio: 25, mobility: 10, sunnah: 10 },
      { dateStr: "7 Nov", dayShort: "Sab", dayFull: "Sabtu", minutes: 50, calories: 260, avgHr: 120, workoutType: "Senam Jantung Sehat Komunitas", category: "kardio", cardio: 30, mobility: 20, sunnah: 0 },
      { dateStr: "8 Nov", dayShort: "Min", dayFull: "Minggu", minutes: 40, calories: 210, avgHr: 116, workoutType: "Renang Terapi Sendi Rendah Beban", category: "sunnah", cardio: 15, mobility: 15, sunnah: 10 },
    ],
  },
  "fam-03": {
    target: 60,
    color: "#f59e0b", // amber-500
    days: [
      { dateStr: "3 Nov", dayShort: "Sel", dayFull: "Selasa", minutes: 75, calories: 620, avgHr: 148, workoutType: "Lari Jarak Menengah 8K", category: "kardio", cardio: 55, mobility: 10, sunnah: 10 },
      { dateStr: "4 Nov", dayShort: "Rab", dayFull: "Rabu", minutes: 60, calories: 480, avgHr: 136, workoutType: "Latihan Beban Fungsional & Core", category: "kekuatan", cardio: 20, mobility: 40, sunnah: 0 },
      { dateStr: "5 Nov", dayShort: "Kam", dayFull: "Kamis", minutes: 80, calories: 680, avgHr: 152, workoutType: "Lari Interval Tempo 10K", category: "kardio", cardio: 65, mobility: 10, sunnah: 5 },
      { dateStr: "6 Nov", dayShort: "Jum", dayFull: "Jumat", minutes: 45, calories: 340, avgHr: 124, workoutType: "Recovery Jogging & Peregangan", category: "mobilitas", cardio: 30, mobility: 15, sunnah: 0 },
      { dateStr: "7 Nov", dayShort: "Sab", dayFull: "Sabtu", minutes: 90, calories: 780, avgHr: 155, workoutType: "Lari Jarak Jauh Akhir Pekan 14K", category: "kardio", cardio: 75, mobility: 15, sunnah: 0 },
      { dateStr: "8 Nov", dayShort: "Min", dayFull: "Minggu", minutes: 70, calories: 550, avgHr: 138, workoutType: "Berenang Kardio Sunnah & Kalistenik", category: "sunnah", cardio: 35, mobility: 15, sunnah: 20 },
    ],
  },
  "fam-04": {
    target: 45,
    color: "#8b5cf6", // purple-500
    days: [
      { dateStr: "3 Nov", dayShort: "Sel", dayFull: "Selasa", minutes: 40, calories: 230, avgHr: 130, workoutType: "Bulutangkis Rekreasional", category: "kardio", cardio: 28, mobility: 12, sunnah: 0 },
      { dateStr: "4 Nov", dayShort: "Rab", dayFull: "Rabu", minutes: 35, calories: 190, avgHr: 122, workoutType: "Senam Peregangan Mata & Postur", category: "mobilitas", cardio: 10, mobility: 25, sunnah: 0 },
      { dateStr: "5 Nov", dayShort: "Kam", dayFull: "Kamis", minutes: 45, calories: 260, avgHr: 134, workoutType: "Lompat Tali & Latihan Kardio Rumah", category: "kardio", cardio: 30, mobility: 15, sunnah: 0 },
      { dateStr: "6 Nov", dayShort: "Jum", dayFull: "Jumat", minutes: 50, calories: 290, avgHr: 128, workoutType: "Jalan Santai Bersama Teman", category: "kardio", cardio: 35, mobility: 15, sunnah: 0 },
      { dateStr: "7 Nov", dayShort: "Sab", dayFull: "Sabtu", minutes: 55, calories: 320, avgHr: 135, workoutType: "Bersepeda Keliling Taman Kota", category: "kardio", cardio: 40, mobility: 15, sunnah: 0 },
      { dateStr: "8 Nov", dayShort: "Min", dayFull: "Minggu", minutes: 45, calories: 250, avgHr: 126, workoutType: "Renang Santai & Senam Air", category: "sunnah", cardio: 20, mobility: 15, sunnah: 10 },
    ],
  },
  "fam-05": {
    target: 30,
    color: "#3b82f6", // blue-500
    days: [
      { dateStr: "3 Nov", dayShort: "Sel", dayFull: "Selasa", minutes: 25, calories: 110, avgHr: 104, workoutType: "Jalan Santai Pagi Jalur Datar", category: "kardio", cardio: 18, mobility: 7, sunnah: 0 },
      { dateStr: "4 Nov", dayShort: "Rab", dayFull: "Rabu", minutes: 30, calories: 130, avgHr: 106, workoutType: "Jalan Sehat Subuh Menuju Masjid", category: "sunnah", cardio: 20, mobility: 5, sunnah: 5 },
      { dateStr: "5 Nov", dayShort: "Kam", dayFull: "Kamis", minutes: 28, calories: 120, avgHr: 105, workoutType: "Senam Tera Lansia & Pernapasan", category: "mobilitas", cardio: 10, mobility: 18, sunnah: 0 },
      { dateStr: "6 Nov", dayShort: "Jum", dayFull: "Jumat", minutes: 35, calories: 145, avgHr: 108, workoutType: "Jalan Santai & Latihan Keseimbangan", category: "mobilitas", cardio: 20, mobility: 15, sunnah: 0 },
      { dateStr: "7 Nov", dayShort: "Sab", dayFull: "Sabtu", minutes: 32, calories: 135, avgHr: 107, workoutType: "Jalan Pagi Taman bersama Cucu", category: "kardio", cardio: 22, mobility: 10, sunnah: 0 },
      { dateStr: "8 Nov", dayShort: "Min", dayFull: "Minggu", minutes: 30, calories: 125, avgHr: 106, workoutType: "Latihan Peregangan Mandiri Kursi", category: "mobilitas", cardio: 8, mobility: 22, sunnah: 0 },
    ],
  },
};

export function computeMemberExerciseSummary(
  member: FamilyMember,
  overrideTodayMinutes?: number,
  overrideDailyTarget?: number
): MemberExerciseTrendSummary {
  const base = BASE_EXERCISE_HISTORY[member.id] || {
    target: 30,
    color: "#06b6d4",
    days: [
      { dateStr: "3 Nov", dayShort: "Sel", dayFull: "Selasa", minutes: 30, calories: 150, avgHr: 110, workoutType: "Latihan Kardio", category: "kardio", cardio: 20, mobility: 10, sunnah: 0 },
      { dateStr: "4 Nov", dayShort: "Rab", dayFull: "Rabu", minutes: 30, calories: 150, avgHr: 110, workoutType: "Latihan Kardio", category: "kardio", cardio: 20, mobility: 10, sunnah: 0 },
      { dateStr: "5 Nov", dayShort: "Kam", dayFull: "Kamis", minutes: 35, calories: 170, avgHr: 112, workoutType: "Jalan Sehat", category: "sunnah", cardio: 20, mobility: 10, sunnah: 5 },
      { dateStr: "6 Nov", dayShort: "Jum", dayFull: "Jumat", minutes: 25, calories: 130, avgHr: 108, workoutType: "Peregangan", category: "mobilitas", cardio: 10, mobility: 15, sunnah: 0 },
      { dateStr: "7 Nov", dayShort: "Sab", dayFull: "Sabtu", minutes: 40, calories: 200, avgHr: 118, workoutType: "Olahraga Santai", category: "kardio", cardio: 25, mobility: 15, sunnah: 0 },
      { dateStr: "8 Nov", dayShort: "Min", dayFull: "Minggu", minutes: 35, calories: 175, avgHr: 114, workoutType: "Jalan Kaki", category: "sunnah", cardio: 20, mobility: 10, sunnah: 5 },
    ],
  };

  const target = overrideDailyTarget !== undefined ? overrideDailyTarget : base.target;
  const todayMinutes = overrideTodayMinutes !== undefined 
    ? overrideTodayMinutes 
    : (member.vitals.exerciseMinutes ?? member.vitals.activeMinutes ?? target);

  // Build today's record (Day 7 / 9 Nov)
  const todayRecord: DailyExerciseRecord = {
    dateStr: "9 Nov",
    dayShort: "Sen",
    dayFull: "Senin",
    fullDate: "Senin, 9 November 2026",
    isToday: true,
    minutes: todayMinutes,
    targetMinutes: target,
    caloriesBurned: Math.round(todayMinutes * (member.role === "Anak Sulung" ? 8.5 : member.role === "Ayah" ? 6.5 : 5.5)),
    avgHeartRateBpm: member.vitals.heartRate > 0 ? Math.round(member.vitals.heartRate * 1.55) : 124,
    workoutType: member.role === "Anak Sulung" 
      ? "Lari Kardio Wearable Real-time" 
      : member.role === "Ayah" 
        ? "Jalan Cepat Treadmill Ergonomis" 
        : member.role === "Ibu"
          ? "Senam Sendi & Jalan Sehat Subuh"
          : member.role === "Kakek"
            ? "Jalan Santai Terukur Lansia"
            : "Lompat Tali & Peregangan Remaja",
    category: member.role === "Ibu" ? "mobilitas" : "kardio",
    isTargetMet: todayMinutes >= target,
    cardioMinutes: Math.round(todayMinutes * 0.65),
    mobilityMinutes: Math.round(todayMinutes * 0.25),
    sunnahMinutes: Math.round(todayMinutes * 0.10),
  };

  const weeklyRecords: DailyExerciseRecord[] = [
    ...base.days.map((d) => ({
      dateStr: d.dateStr,
      dayShort: d.dayShort,
      dayFull: d.dayFull,
      fullDate: `${d.dayFull}, ${d.dateStr} 2026`,
      isToday: false,
      minutes: d.minutes,
      targetMinutes: target,
      caloriesBurned: d.calories,
      avgHeartRateBpm: d.avgHr,
      workoutType: d.workoutType,
      category: d.category,
      isTargetMet: d.minutes >= target,
      cardioMinutes: d.cardio,
      mobilityMinutes: d.mobility,
      sunnahMinutes: d.sunnah,
    })),
    todayRecord,
  ];

  const totalWeekMinutes = weeklyRecords.reduce((acc, r) => acc + r.minutes, 0);
  const avgDailyMinutes = Math.round(totalWeekMinutes / weeklyRecords.length);
  const targetMetDaysCount = weeklyRecords.filter((r) => r.isTargetMet).length;
  const targetMetPercent = Math.round((targetMetDaysCount / weeklyRecords.length) * 100);
  const totalCaloriesBurned = weeklyRecords.reduce((acc, r) => acc + r.caloriesBurned, 0);

  // Peak day
  const peak = weeklyRecords.reduce((max, r) => (r.minutes > max.minutes ? r : max), weeklyRecords[0]);

  return {
    memberId: member.id,
    memberName: member.name,
    role: member.role,
    avatarUrl: member.avatarUrl,
    wearableName: member.connectedWearable.deviceName,
    wearableBrand: member.connectedWearable.brand,
    colorHex: base.color,
    dailyTarget: target,
    todayMinutes,
    totalWeekMinutes,
    avgDailyMinutes,
    targetMetDaysCount,
    targetMetPercent,
    peakDay: {
      dayFull: peak.dayFull,
      dateStr: peak.dateStr,
      minutes: peak.minutes,
      workoutType: peak.workoutType,
    },
    totalCaloriesBurned,
    weeklyRecords,
  };
}

export function buildFamilyComparisonDataset(members: FamilyMember[]): {
  dataPoints: FamilyExerciseComparisonPoint[];
  summaries: MemberExerciseTrendSummary[];
  mvpMember: MemberExerciseTrendSummary;
  familyTotalMinutes: number;
  familyAvgDailyMinutes: number;
  familyComplianceRate: number;
} {
  const summaries = members.map((m) => computeMemberExerciseSummary(m));

  // Dates: 7 days
  const daysMeta = [
    { dateStr: "3 Nov", dayShort: "Sel", dayFull: "Selasa", isToday: false },
    { dateStr: "4 Nov", dayShort: "Rab", dayFull: "Rabu", isToday: false },
    { dateStr: "5 Nov", dayShort: "Kam", dayFull: "Kamis", isToday: false },
    { dateStr: "6 Nov", dayShort: "Jum", dayFull: "Jumat", isToday: false },
    { dateStr: "7 Nov", dayShort: "Sab", dayFull: "Sabtu", isToday: false },
    { dateStr: "8 Nov", dayShort: "Min", dayFull: "Minggu", isToday: false },
    { dateStr: "9 Nov", dayShort: "Sen", dayFull: "Senin", isToday: true },
  ];

  const dataPoints: FamilyExerciseComparisonPoint[] = daysMeta.map((meta, dayIdx) => {
    const point: FamilyExerciseComparisonPoint = {
      dateStr: meta.dateStr,
      dayShort: meta.dayShort,
      dayFull: meta.dayFull,
      isToday: meta.isToday,
      whoStandard: 30, // 30 min minimum WHO / Kemenkes standard
    };

    summaries.forEach((s) => {
      const rec = s.weeklyRecords[dayIdx];
      point[s.memberId] = rec ? rec.minutes : 0;
      point[`${s.memberId}_name`] = s.memberName;
      point[`${s.memberId}_target`] = s.dailyTarget;
      point[`${s.memberId}_met`] = rec ? rec.isTargetMet : false;
      point[`${s.memberId}_cal`] = rec ? rec.caloriesBurned : 0;
      point[`${s.memberId}_type`] = rec ? rec.workoutType : "";
    });

    return point;
  });

  const familyTotalMinutes = summaries.reduce((acc, s) => acc + s.totalWeekMinutes, 0);
  const familyAvgDailyMinutes = Math.round(familyTotalMinutes / (summaries.length * 7));
  const totalTargetDays = summaries.reduce((acc, s) => acc + s.targetMetDaysCount, 0);
  const familyComplianceRate = Math.round((totalTargetDays / (summaries.length * 7)) * 100);

  // MVP member (highest weekly minutes)
  const mvpMember = [...summaries].sort((a, b) => b.totalWeekMinutes - a.totalWeekMinutes)[0] || summaries[0];

  return {
    dataPoints,
    summaries,
    mvpMember,
    familyTotalMinutes,
    familyAvgDailyMinutes,
    familyComplianceRate,
  };
}
