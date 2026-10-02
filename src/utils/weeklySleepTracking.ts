import { FamilyMember, DailySleepStageRecord, WeeklySleepQualityAnalysis } from "../types";
import { getDayLabels } from "./weeklyVitalTrends";

// 6 historical prior days for sleep stages per family member
const HISTORICAL_SLEEP_DATA: Record<
  string,
  {
    deepSleep: number[]; // hours
    remSleep: number[]; // hours
    lightSleep: number[]; // hours
    totalSleep: number[]; // hours
    awakeMinutes: number[];
    sleepScore: number[];
    sleepEfficiency: number[];
    bedTimes: string[];
    wakeTimes: string[];
  }
> = {
  "fam-01": { // Hendra Kusuma (Ayah - 52 thn)
    deepSleep: [1.5, 1.7, 1.4, 1.8, 1.6, 1.5],
    remSleep: [1.6, 1.8, 1.5, 1.7, 1.8, 1.6],
    lightSleep: [3.4, 3.2, 3.3, 3.4, 3.6, 3.5],
    totalSleep: [6.8, 7.0, 6.5, 7.1, 7.3, 6.9],
    awakeMinutes: [22, 18, 25, 16, 19, 20],
    sleepScore: [80, 83, 78, 86, 85, 82],
    sleepEfficiency: [87, 89, 85, 91, 90, 88],
    bedTimes: ["22:45", "22:30", "23:00", "22:15", "22:20", "22:40"],
    wakeTimes: ["05:15", "05:10", "05:15", "05:05", "05:15", "05:10"],
  },
  "fam-02": { // Siti Rahmawati (Ibu - 49 thn)
    deepSleep: [1.9, 2.1, 1.8, 2.0, 2.2, 1.9],
    remSleep: [2.0, 2.2, 1.9, 2.1, 2.2, 2.0],
    lightSleep: [3.3, 3.0, 3.4, 3.3, 3.3, 3.4],
    totalSleep: [7.5, 7.6, 7.4, 7.7, 8.0, 7.6],
    awakeMinutes: [16, 14, 18, 15, 12, 16],
    sleepScore: [88, 92, 87, 90, 93, 89],
    sleepEfficiency: [91, 94, 90, 92, 95, 91],
    bedTimes: ["22:15", "22:00", "22:20", "22:10", "21:50", "22:15"],
    wakeTimes: ["05:00", "04:55", "05:05", "05:00", "04:55", "05:00"],
  },
  "fam-03": { // Dimas Pratama (Anak Sulung - 24 thn Atlet)
    deepSleep: [2.2, 2.4, 2.1, 2.5, 2.4, 2.2],
    remSleep: [2.1, 2.3, 2.0, 2.2, 2.3, 2.1],
    lightSleep: [3.4, 3.0, 3.8, 3.1, 3.3, 3.3],
    totalSleep: [8.0, 7.8, 8.2, 8.0, 8.3, 7.9],
    awakeMinutes: [14, 12, 16, 10, 11, 13],
    sleepScore: [93, 91, 94, 96, 97, 92],
    sleepEfficiency: [94, 93, 95, 97, 98, 94],
    bedTimes: ["22:00", "22:15", "21:45", "22:00", "21:50", "22:10"],
    wakeTimes: ["05:15", "05:15", "05:10", "05:15", "05:20", "05:15"],
  },
  "fam-04": { // Nadia Anindita (Anak Bungsu - 16 thn Pelajar)
    deepSleep: [1.7, 1.9, 1.6, 1.8, 2.0, 1.7],
    remSleep: [1.8, 2.0, 1.7, 1.9, 2.0, 1.8],
    lightSleep: [3.4, 3.2, 3.4, 3.6, 3.5, 3.5],
    totalSleep: [7.2, 7.4, 7.0, 7.6, 7.8, 7.3],
    awakeMinutes: [20, 18, 22, 17, 15, 19],
    sleepScore: [85, 87, 82, 89, 90, 86],
    sleepEfficiency: [88, 90, 86, 91, 92, 89],
    bedTimes: ["22:30", "22:15", "22:45", "22:10", "22:00", "22:30"],
    wakeTimes: ["05:10", "05:05", "05:15", "05:05", "05:00", "05:10"],
  },
  "fam-05": { // H. Subroto (Kakek - 76 thn Geriatri)
    deepSleep: [1.1, 1.3, 1.0, 1.3, 1.4, 1.2],
    remSleep: [1.2, 1.4, 1.1, 1.3, 1.3, 1.2],
    lightSleep: [3.8, 3.6, 3.9, 3.9, 3.8, 3.8],
    totalSleep: [6.5, 6.7, 6.4, 6.9, 7.0, 6.6],
    awakeMinutes: [32, 28, 35, 27, 26, 30],
    sleepScore: [76, 78, 74, 80, 81, 77],
    sleepEfficiency: [80, 83, 78, 84, 85, 81],
    bedTimes: ["21:30", "21:45", "21:30", "21:15", "21:30", "21:45"],
    wakeTimes: ["04:45", "04:50", "04:40", "04:45", "04:50", "04:45"],
  },
};

export const computeWeeklySleepQualityAnalysis = (member: FamilyMember): WeeklySleepQualityAnalysis => {
  const base = HISTORICAL_SLEEP_DATA[member.id] || HISTORICAL_SLEEP_DATA["fam-01"];
  const dayLabels = getDayLabels();

  // Current day (Day 7) values derived from member.vitals with fallback
  const curTotal = member.vitals.sleepHours || 7.2;
  const curScore = member.vitals.sleepScore || 85;
  
  // Realistic estimation of Deep & REM sleep if not explicitly set
  // Deep sleep is typically ~22-26% of total sleep for healthy adults
  // REM sleep is typically ~23-28% of total sleep
  const curDeep = member.vitals.deepSleepHours ?? Number((curTotal * (member.age < 30 ? 0.27 : member.age < 60 ? 0.23 : 0.18)).toFixed(1));
  const curRem = member.vitals.remSleepHours ?? Number((curTotal * (member.age < 30 ? 0.26 : member.age < 60 ? 0.24 : 0.19)).toFixed(1));
  const curAwakeMins = member.vitals.awakeMinutes ?? (member.age > 70 ? 28 : member.age > 50 ? 18 : 12);
  const curLight = member.vitals.lightSleepHours ?? Number((curTotal - curDeep - curRem).toFixed(1));
  const curEfficiency = member.vitals.sleepEfficiencyPct ?? Math.min(98, Math.max(75, Math.round(curScore * 1.05)));

  // Combine 6 historical days + 1 today
  const deepDays = [...base.deepSleep, curDeep];
  const remDays = [...base.remSleep, curRem];
  const lightDays = [...base.lightSleep, curLight];
  const totalDays = [...base.totalSleep, curTotal];
  const awakeDays = [...base.awakeMinutes, curAwakeMins];
  const scoreDays = [...base.sleepScore, curScore];
  const efficiencyDays = [...base.sleepEfficiency, curEfficiency];
  const bedTimes = [...base.bedTimes, "22:20"];
  const wakeTimes = [...base.wakeTimes, "05:10"];

  const dailyRecords: DailySleepStageRecord[] = dayLabels.map((lbl, idx) => ({
    dayLabel: lbl.label,
    dateShort: lbl.dateShort,
    totalSleepHours: totalDays[idx],
    deepSleepHours: deepDays[idx],
    remSleepHours: remDays[idx],
    lightSleepHours: lightDays[idx],
    awakeMinutes: awakeDays[idx],
    sleepScore: scoreDays[idx],
    sleepEfficiencyPct: efficiencyDays[idx],
    bedTime: bedTimes[idx],
    wakeTime: wakeTimes[idx],
    isCurrentDay: idx === 6,
  }));

  // Calculate 7-day rolling averages
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const avgTotal = Number((sum(totalDays) / 7).toFixed(1));
  const avgDeep = Number((sum(deepDays) / 7).toFixed(1));
  const avgRem = Number((sum(remDays) / 7).toFixed(1));
  const avgLight = Number((sum(lightDays) / 7).toFixed(1));
  const avgScore = Math.round(sum(scoreDays) / 7);
  const avgEfficiency = Math.round(sum(efficiencyDays) / 7);

  // Architecture percentages
  const deepSleepPct = Math.round((avgDeep / (avgTotal || 1)) * 100);
  const remSleepPct = Math.round((avgRem / (avgTotal || 1)) * 100);
  const lightSleepPct = Math.max(0, 100 - deepSleepPct - remSleepPct);

  // Clinical evaluations
  let circadianAlignment: WeeklySleepQualityAnalysis["circadianAlignment"] = "Optimal (Sesuai Sunnah & Sirkadian Alami)";
  let deepSleepStatus: WeeklySleepQualityAnalysis["deepSleepStatus"] = "Optimal (Pemulihan Sel & Imun Maksimal)";
  let remSleepStatus: WeeklySleepQualityAnalysis["remSleepStatus"] = "Optimal (Konsolidasi Memori & Mental Prima)";
  let clinicalSleepNotes = "";
  let wearableSyncTip = "";

  if (deepSleepPct >= 20) {
    deepSleepStatus = "Optimal (Pemulihan Sel & Imun Maksimal)";
  } else if (deepSleepPct >= 15) {
    deepSleepStatus = "Cukup Baik";
  } else {
    deepSleepStatus = "Suboptimal";
  }

  if (remSleepPct >= 20) {
    remSleepStatus = "Optimal (Konsolidasi Memori & Mental Prima)";
  } else if (remSleepPct >= 16) {
    remSleepStatus = "Cukup Baik";
  } else {
    remSleepStatus = "Suboptimal";
  }

  if (member.role === "Ayah") {
    circadianAlignment = "Optimal (Sesuai Sunnah & Sirkadian Alami)";
    clinicalSleepNotes = `Durasi Deep Sleep Ayah (${avgDeep} jam / ${deepSleepPct}%) dan REM Sleep (${avgRem} jam / ${remSleepPct}%) menunjukkan pola tidur restoratif yang sangat mendukung pemulihan relaksasi vaskular darah dan penurunan beban kardiovaskular nokturnal.`;
    wearableSyncTip = "Sensor fotopletismografi (PPG) Apple Watch Ultra mendeteksi ritme denyut istirahat yang turun secara stabil pada fase gelombang lambat (Slow Wave Sleep).";
  } else if (member.role === "Ibu") {
    circadianAlignment = "Optimal (Sesuai Sunnah & Sirkadian Alami)";
    clinicalSleepNotes = `Ibu memiliki arsitektur tidur seimbang dengan ${deepSleepPct}% Deep Sleep (${avgDeep} jam) dan ${remSleepPct}% REM Sleep (${avgRem} jam). Tahap tidur dalam ini memicu sintesis kolagen dan perbaikan kartilago sendi lutut secara alami.`;
    wearableSyncTip = "Garmin Venu 3S mencatat kestabilan SpO2 nokturnal di atas 98% selama siklus REM.";
  } else if (member.role === "Anak Sulung") {
    circadianAlignment = "Optimal (Sesuai Sunnah & Sirkadian Alami)";
    clinicalSleepNotes = `Deep Sleep Dimas mencapai ${avgDeep} jam (${deepSleepPct}%), sangat tinggi dan ideal bagi atlet. Tahap slow-wave sleep ini memicu sekresi Human Growth Hormone (HGH) untuk regenerasi serat otot pasca latihan fisik.`;
    wearableSyncTip = "Sensor Garmin Forerunner 965 mencatat skor pemulihan tubuh (Body Battery) mencapai 96% di pagi hari.";
  } else if (member.role === "Anak Bungsu") {
    circadianAlignment = "Cukup Baik";
    clinicalSleepNotes = `Nadia memperoleh ${avgRem} jam (${remSleepPct}%) REM Sleep dan ${avgDeep} jam Deep Sleep. Siklus REM yang cukup sangat krusial untuk pemulihan ketajaman penglihatan dari paparan layar dan konsolidasi materi pelajaran sekolah.`;
    wearableSyncTip = "Samsung Galaxy Watch6 mencatat penurunan waktu terjaga setelah menjauhkan gawai 45 menit sebelum tidur.";
  } else if (member.role === "Kakek") {
    circadianAlignment = "Optimal (Sesuai Sunnah & Sirkadian Alami)";
    clinicalSleepNotes = `Pada usia 76 tahun, durasi Deep Sleep Kakek (${avgDeep} jam / ${deepSleepPct}%) dan REM Sleep (${avgRem} jam / ${remSleepPct}%) tergolong sangat baik untuk lansia pasca-PCI stent, dengan efisiensi tidur ${avgEfficiency}%.`;
    wearableSyncTip = "Fitbit Sense 2 mengonfirmasi ketiadaan episode desaturasi oksigen nokturnal berisiko tinggi.";
  }

  // Calculate Morning Readiness Score based on multi-factor wearable telemetry
  const sleepFactor = Math.min(100, Math.round(curScore * 0.95 + (curTotal >= 7 ? 5 : -5)));
  const hrvVal = member.vitals.hrvMs || 55;
  const hrvFactor = Math.min(100, Math.max(50, Math.round((hrvVal / 75) * 90 + 10)));
  const restingHrDipFactor = Math.min(100, Math.max(60, Math.round(100 - (member.vitals.heartRate > 80 ? 25 : member.vitals.heartRate > 70 ? 12 : 5))));
  const stressVal = member.vitals.stressLevel || 25;
  const activityBalance = Math.min(100, Math.max(55, Math.round(100 - stressVal * 0.8)));
  const bodyBattery = Math.min(100, Math.max(60, Math.round((sleepFactor * 0.4) + (hrvFactor * 0.3) + (activityBalance * 0.3))));

  const readinessScore = Math.round(
    sleepFactor * 0.35 +
    hrvFactor * 0.25 +
    restingHrDipFactor * 0.20 +
    activityBalance * 0.20
  );

  let readinessStatus: WeeklySleepQualityAnalysis["morningReadiness"]["status"] = "Prima (Optimal Recovery)";
  let badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
  let workoutIntensity: WeeklySleepQualityAnalysis["morningReadiness"]["recommendedWorkoutIntensity"] = "Tinggi (Latihan Beban/Lari Cepat)";
  let focusWindow = "08:30 - 11:45 WIB";
  let sunnahAdvice = "Mulailah hari dengan dzikir pagi, teguk air hangat suam kuku, dan sambut paparan sinar fajar untuk aktivasi ritme sirkadian.";
  let clinicalReadinessSummary = "Kesiapan kardiovaskular dan pemulihan sistem saraf parasimpatis berada pada kondisi puncak.";

  if (readinessScore >= 90) {
    readinessStatus = "Prima (Optimal Recovery)";
    badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
    workoutIntensity = member.role === "Anak Sulung" ? "Tinggi (Latihan Beban/Lari Cepat)" : "Moderat (Jalan Cepat/Sepeda Santai)";
    focusWindow = "08:30 - 12:00 WIB";
    clinicalReadinessSummary = `Pemulihan saraf otonom (HRV ${hrvVal} ms) dan durasi gelombang lambat (${curDeep} jam Deep Sleep) sangat memadai. Tubuh siap menghadapi beban fisik maupun fokus kognitif tinggi.`;
  } else if (readinessScore >= 80) {
    readinessStatus = "Kondisi Baik (Ready for Action)";
    badgeColor = "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300";
    workoutIntensity = "Moderat (Jalan Cepat/Sepeda Santai)";
    focusWindow = "09:00 - 11:30 WIB";
    clinicalReadinessSummary = `Pemulihan stabil dengan skor tidur ${curScore}. Beban kardiovaskular terkontrol dengan baik, disarankan latihan aerobik intensitas sedang 30-45 menit.`;
  } else if (readinessScore >= 70) {
    readinessStatus = "Perlu Pemulihan Ringan";
    badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
    workoutIntensity = "Ringan (Peregangan/Jalan Santai)";
    focusWindow = "09:30 - 11:00 WIB";
    clinicalReadinessSummary = `Terdeteksi sedikit kelelahan akumulatif (Body Battery ${bodyBattery}%). Disarankan membatasi latihan fisik berat dan fokus pada mobilitas sendi ringan serta rehidrasi air kelapa/mineral.`;
  } else {
    readinessStatus = "Rest Day / Kelelahan";
    badgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
    workoutIntensity = "Istirahat Total (Rest Day)";
    focusWindow = "10:00 - 11:30 WIB (Porsi Ringan)";
    clinicalReadinessSummary = "Tingkat pemulihan di bawah batas optimal. Disarankan istirahat penuh dan tidur siang Qailullah (15-20 menit) untuk restorasi energi seluler.";
  }

  if (member.role === "Ayah") {
    sunnahAdvice = "Lakukan jalan santai pagi 30 menit sembari dzikir. Paparan sinar matahari pagi membantu pembentukan Nitric Oxide alami penurun tekanan darah.";
  } else if (member.role === "Ibu") {
    sunnahAdvice = "Lakukan peregangan sendi sujud dan jalan santai di halaman untuk menutrisi kartilago lutut sebelum memulai aktivitas rumah tangga.";
  } else if (member.role === "Anak Sulung") {
    sunnahAdvice = "Tingkat pemulihan sangat prima! Boleh melakukan sesi latihan interval atau lari jarak jauh, tetap jaga asupan elektrolit thayyib.";
  } else if (member.role === "Anak Bungsu") {
    sunnahAdvice = "Manfaatkan jendela fokus pagi (08:30 - 11:30) untuk belajar materi analitis, dan sempatkan mengistirahatkan mata tiap 20 menit.";
  } else if (member.role === "Kakek") {
    sunnahAdvice = "Awali hari dengan air hangat madu, latihan pernapasan dalam, dan senam lansia ringan di bawah sinar matahari pagi.";
  }

  const morningReadiness: WeeklySleepQualityAnalysis["morningReadiness"] = {
    score: readinessScore,
    status: readinessStatus,
    badgeColor,
    factors: {
      sleepQuality: sleepFactor,
      hrvRecovery: hrvFactor,
      restingHrDipping: restingHrDipFactor,
      activityBalance,
      bodyBattery,
    },
    recommendedWorkoutIntensity: workoutIntensity,
    cognitiveFocusWindow: focusWindow,
    sunnahMorningAdvice: sunnahAdvice,
    clinicalReadinessSummary,
  };

  return {
    memberId: member.id,
    memberName: member.name,
    memberRole: member.role,
    wearableDevice: member.connectedWearable.deviceName,
    wearableBrand: member.connectedWearable.brand,
    lastSync: member.connectedWearable.lastSync,
    isLive: member.connectedWearable.isLive,
    avgTotalSleepHours: avgTotal,
    avgDeepSleepHours: avgDeep,
    avgRemSleepHours: avgRem,
    avgLightSleepHours: avgLight,
    avgSleepScore: avgScore,
    avgSleepEfficiency: avgEfficiency,
    deepSleepPct,
    remSleepPct,
    lightSleepPct,
    dailyRecords,
    circadianAlignment,
    deepSleepStatus,
    remSleepStatus,
    clinicalSleepNotes,
    wearableSyncTip,
    morningReadiness,
  };
};

export interface HypnogramBlock {
  time: string;
  stage: "awake" | "rem" | "light" | "deep";
  stageLabel: string;
  heartRate: number;
}

export const generateHypnogramData = (member: FamilyMember, record: DailySleepStageRecord): HypnogramBlock[] => {
  const baseHr = member.vitals.heartRate || 72;
  const isAthlete = member.id === "fam-03";
  const nocturnalBaseHr = isAthlete ? 48 : baseHr - 12;

  // 16 points representing 7-8 hours overnight timeline
  return [
    { time: "22:15", stage: "awake", stageLabel: "Terjaga (Transisi)", heartRate: nocturnalBaseHr + 14 },
    { time: "22:35", stage: "light", stageLabel: "Light Sleep", heartRate: nocturnalBaseHr + 8 },
    { time: "23:05", stage: "deep", stageLabel: "Deep Sleep (Gelombang Lambat)", heartRate: nocturnalBaseHr - 3 },
    { time: "23:50", stage: "deep", stageLabel: "Deep Sleep (Siklus 1)", heartRate: nocturnalBaseHr - 5 },
    { time: "00:30", stage: "light", stageLabel: "Light Sleep", heartRate: nocturnalBaseHr + 3 },
    { time: "01:00", stage: "rem", stageLabel: "REM Sleep (Fase Mimpi 1)", heartRate: nocturnalBaseHr + 6 },
    { time: "01:40", stage: "deep", stageLabel: "Deep Sleep (Siklus 2)", heartRate: nocturnalBaseHr - 4 },
    { time: "02:25", stage: "light", stageLabel: "Light Sleep", heartRate: nocturnalBaseHr + 2 },
    { time: "02:50", stage: "rem", stageLabel: "REM Sleep (Fase Mimpi 2)", heartRate: nocturnalBaseHr + 7 },
    { time: "03:30", stage: "light", stageLabel: "Light Sleep", heartRate: nocturnalBaseHr + 1 },
    { time: "03:55", stage: "awake", stageLabel: "Terjaga Singkat (Mikro-Arousal)", heartRate: nocturnalBaseHr + 12 },
    { time: "04:05", stage: "deep", stageLabel: "Deep Sleep (Siklus 3)", heartRate: nocturnalBaseHr - 2 },
    { time: "04:35", stage: "rem", stageLabel: "REM Sleep (Konsolidasi Otak)", heartRate: nocturnalBaseHr + 8 },
    { time: "05:00", stage: "light", stageLabel: "Light Sleep (Menjelang Subuh)", heartRate: nocturnalBaseHr + 4 },
    { time: "05:15", stage: "awake", stageLabel: "Terbangun Fajar (Optimal)", heartRate: nocturnalBaseHr + 16 },
  ];
};
