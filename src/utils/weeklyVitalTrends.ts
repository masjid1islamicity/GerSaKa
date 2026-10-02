import { FamilyMember, VitalComparisonMetric, WeeklyVitalTrendReport } from "../types";

// Base historical 6 prior days for each family member
const HISTORICAL_BASE_DATA: Record<
  string,
  {
    heartRate: number[];
    bloodPressureSystolic: number[];
    bloodPressureDiastolic: number[];
    spo2: number[];
    bloodGlucose: number[];
    sleepHours: number[];
    steps: number[];
    activeCalories: number[];
    stressLevel: number[];
  }
> = {
  "fam-01": { // Hendra Kusuma (Ayah)
    heartRate: [75, 73, 74, 76, 71, 70],
    bloodPressureSystolic: [134, 132, 135, 130, 129, 131],
    bloodPressureDiastolic: [86, 84, 85, 83, 84, 83],
    spo2: [97, 98, 98, 97, 98, 98],
    bloodGlucose: [118, 122, 115, 120, 114, 116],
    sleepHours: [6.8, 7.0, 6.5, 7.1, 7.3, 6.9],
    steps: [7800, 8100, 7600, 8900, 8200, 7950],
    activeCalories: [450, 470, 440, 510, 490, 460],
    stressLevel: [36, 34, 40, 32, 30, 31],
  },
  "fam-02": { // Siti Rahmawati (Ibu)
    heartRate: [78, 75, 77, 74, 76, 75],
    bloodPressureSystolic: [122, 120, 121, 119, 118, 120],
    bloodPressureDiastolic: [80, 79, 81, 78, 79, 80],
    spo2: [98, 99, 98, 99, 99, 98],
    bloodGlucose: [102, 100, 99, 104, 97, 101],
    sleepHours: [7.5, 7.6, 7.4, 7.7, 8.0, 7.6],
    steps: [5800, 6100, 5500, 6400, 6000, 6300],
    activeCalories: [320, 335, 310, 350, 330, 345],
    stressLevel: [26, 25, 29, 24, 25, 23],
  },
  "fam-03": { // Dimas Pratama (Anak Sulung - Atlet)
    heartRate: [56, 59, 57, 58, 60, 57],
    bloodPressureSystolic: [116, 114, 117, 115, 113, 116],
    bloodPressureDiastolic: [74, 72, 73, 71, 70, 73],
    spo2: [99, 99, 98, 99, 99, 99],
    bloodGlucose: [92, 88, 91, 93, 89, 91],
    sleepHours: [8.0, 7.8, 8.2, 8.0, 8.3, 7.9],
    steps: [11800, 12200, 10900, 13100, 12600, 11900],
    activeCalories: [720, 750, 690, 810, 780, 740],
    stressLevel: [18, 15, 20, 17, 14, 16],
  },
  "fam-04": { // Nadia Anindita (Anak Bungsu - Pelajar)
    heartRate: [72, 75, 73, 76, 74, 73],
    bloodPressureSystolic: [112, 110, 114, 109, 111, 110],
    bloodPressureDiastolic: [72, 70, 71, 69, 70, 70],
    spo2: [99, 99, 98, 99, 98, 99],
    bloodGlucose: [96, 92, 95, 98, 93, 95],
    sleepHours: [7.2, 7.4, 7.0, 7.6, 7.8, 7.3],
    steps: [6800, 7200, 6500, 7400, 6900, 7050],
    activeCalories: [360, 390, 350, 400, 370, 385],
    stressLevel: [28, 26, 32, 27, 24, 26],
  },
  "fam-05": { // H. Subroto (Kakek - Geriatri Post-Stent)
    heartRate: [70, 69, 71, 68, 72, 69],
    bloodPressureSystolic: [138, 136, 140, 135, 137, 136],
    bloodPressureDiastolic: [86, 85, 88, 84, 86, 85],
    spo2: [96, 95, 96, 97, 96, 96],
    bloodGlucose: [132, 128, 130, 134, 125, 129],
    sleepHours: [6.5, 6.7, 6.4, 6.9, 7.0, 6.6],
    steps: [4100, 4400, 3900, 4500, 4200, 4250],
    activeCalories: [240, 270, 230, 280, 250, 265],
    stressLevel: [35, 33, 38, 34, 31, 33],
  },
};

// Generate labels for the 7 days ending today
export const getDayLabels = (): { label: string; dateShort: string }[] => {
  const daysShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const result: { label: string; dateShort: string }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dayName = daysShort[d.getDay()];
    const dateNum = d.getDate();
    const monthNum = d.getMonth() + 1;
    const dateShort = `${dateNum}/${monthNum}`;
    const label = i === 0 ? "Hari Ini" : `H-${i} (${dayName})`;
    result.push({ label, dateShort });
  }

  return result;
};

export const computeWeeklyVitalTrendReport = (member: FamilyMember): WeeklyVitalTrendReport => {
  const base = HISTORICAL_BASE_DATA[member.id] || HISTORICAL_BASE_DATA["fam-01"];
  const dayLabels = getDayLabels();

  // Parse blood pressure "128/82"
  const [systolic, diastolic] = member.vitals.bloodPressure.split("/").map(Number);
  const curSystolic = isNaN(systolic) ? 120 : systolic;
  const curDiastolic = isNaN(diastolic) ? 80 : diastolic;

  const buildMetric = (
    key: VitalComparisonMetric["key"],
    label: string,
    shortLabel: string,
    category: VitalComparisonMetric["category"],
    unit: string,
    currentVal: number,
    hist6Days: number[],
    normalRange: string,
    iconName: string,
    colorTheme: string,
    lowerIsBetter: boolean | "in_range"
  ): VitalComparisonMetric => {
    // 7 days array = 6 historical days + 1 today value
    const all7Days = [...hist6Days, currentVal];
    const sum = all7Days.reduce((acc, val) => acc + val, 0);
    const avg = Number((sum / 7).toFixed(1));
    const diff = Number((currentVal - avg).toFixed(1));
    const diffPct = Number((((currentVal - avg) / (avg || 1)) * 100).toFixed(1));

    let trendDirection: "up" | "down" | "neutral" = "neutral";
    if (diffPct > 0.8) trendDirection = "up";
    else if (diffPct < -0.8) trendDirection = "down";

    // Clinical status determination
    let clinicalStatus: "optimal" | "improving" | "stable" | "warning" = "stable";
    let statusText = "Stabil Seimbang";

    if (lowerIsBetter === true) {
      if (diffPct <= -2.5) {
        clinicalStatus = "improving";
        statusText = "Mengalami Penurunan Positif";
      } else if (diffPct >= 5.0) {
        clinicalStatus = "warning";
        statusText = "Meningkat di Atas Rata-rata";
      } else {
        clinicalStatus = "stable";
        statusText = "Stabil Terkendali";
      }
    } else if (lowerIsBetter === false) {
      // Higher is better (steps, sleep, spo2)
      if (diffPct >= 3.0) {
        clinicalStatus = "optimal";
        statusText = "Meningkat Melampaui Rata-rata";
      } else if (diffPct <= -6.0) {
        clinicalStatus = "warning";
        statusText = "Di Bawah Baseline Mingguan";
      } else {
        clinicalStatus = "stable";
        statusText = "Stabil Mendekati Target";
      }
    } else {
      // "in_range" (heart rate)
      if (Math.abs(diffPct) <= 4.0) {
        clinicalStatus = "optimal";
        statusText = "Homeostasis Optimal";
      } else if (currentVal > 95 || currentVal < 55) {
        clinicalStatus = "warning";
        statusText = "Perlu Pemantauan";
      } else {
        clinicalStatus = "stable";
        statusText = "Fluktuasi Fisiologis Ringan";
      }
    }

    const daily7Days = all7Days.map((val, idx) => ({
      dayLabel: dayLabels[idx].label,
      dateShort: dayLabels[idx].dateShort,
      value: val,
      isCurrentDay: idx === 6,
    }));

    // Domain clinical interpretations
    let clinicalInterpretation = "";
    let actionRecommendation = "";

    switch (key) {
      case "heartRate":
        clinicalInterpretation = `Denyut jantung ${currentVal} BPM berada dalam rentang ${normalRange}, dibandingkan rata-rata 7 hari sebesar ${avg} BPM (${diffPct >= 0 ? "+" : ""}${diffPct}%).`;
        actionRecommendation = "Pertahankan istirahat sirkadian teratur dan latihan kardio ringan terukur.";
        break;
      case "bloodPressureSystolic":
        clinicalInterpretation = `Tekanan sistolik hari ini ${currentVal} mmHg vs rata-rata 7 hari ${avg} mmHg (${diffPct >= 0 ? "+" : ""}${diffPct}%).`;
        actionRecommendation = curSystolic > 130 ? "Batasi asupan natrium tinggi garam dan lakukan teknik pernapasan lambat 10 menit." : "Tekanan darah prima, lanjutkan kepatuhan gaya hidup sehat.";
        break;
      case "bloodPressureDiastolic":
        clinicalInterpretation = `Tekanan diastolik ${currentVal} mmHg vs baseline 7 hari ${avg} mmHg (${diffPct >= 0 ? "+" : ""}${diffPct}%). Vaskular rileks.`;
        actionRecommendation = "Pertahankan hidrasi air putih minimal 2 liter/hari.";
        break;
      case "spo2":
        clinicalInterpretation = `Saturasi O2 saat ini ${currentVal}% vs rata-rata mingguan ${avg}%. Oksigenasi paru & jaringan prima.`;
        actionRecommendation = "Lanjutkan jalan santai pagi menghirup udara segar setelah salat subuh.";
        break;
      case "bloodGlucose":
        clinicalInterpretation = `Kadar glukosa puasa/acak saat ini ${currentVal} mg/dL vs rata-rata 7 hari ${avg} mg/dL (${diffPct >= 0 ? "+" : ""}${diffPct}%).`;
        actionRecommendation = currentVal > 125 ? "Prioritaskan serat sayuran hijau sebelum asupan karbohidrat kompleks." : "Metabolisme glukosa terkontrol dengan sangat baik.";
        break;
      case "sleepHours":
        clinicalInterpretation = `Durasi tidur semalam ${currentVal} jam vs rata-rata 7 hari ${avg} jam (${diffPct >= 0 ? "+" : ""}${diffPct}%).`;
        actionRecommendation = "Jaga jadwal tidur konsisten sebelum pukul 22:30 untuk pemulihan hormon.";
        break;
      case "steps":
        clinicalInterpretation = `Aktivitas langkah ${currentVal.toLocaleString()} vs rata-rata 7 hari ${avg.toLocaleString()} langkah (${diffPct >= 0 ? "+" : ""}${diffPct}%).`;
        actionRecommendation = currentVal >= avg ? "Hebat! Pertahankan capaian konsistensi langkah harian." : "Tambah 1.500 langkah ringan di sore hari untuk mencapai target.";
        break;
      case "activeCalories":
        clinicalInterpretation = `Pembakaran kalori aktif ${currentVal} kkal vs baseline 7 hari ${avg} kkal (${diffPct >= 0 ? "+" : ""}${diffPct}%).`;
        actionRecommendation = "Seimbangkan pembakaran energi dengan hidrasi elektrolit alami.";
        break;
      case "stressLevel":
        clinicalInterpretation = `Skor stres biometrik ${currentVal}/100 vs rata-rata 7 hari ${avg}/100 (${diffPct >= 0 ? "+" : ""}${diffPct}%).`;
        actionRecommendation = currentVal <= 30 ? "Kondisi sistem saraf parasimpatis dominan dan tenang." : "Ambil jeda istirahat peregangan leher dan zikir relaksasi.";
        break;
    }

    return {
      key,
      label,
      shortLabel,
      category,
      unit,
      currentValue: currentVal,
      historical7DayAvg: avg,
      diffValue: diff,
      diffPercentage: diffPct,
      trendDirection,
      clinicalStatus,
      statusText,
      normalRange,
      iconName,
      colorTheme,
      daily7Days,
      clinicalInterpretation,
      actionRecommendation,
    };
  };

  const metrics: VitalComparisonMetric[] = [
    buildMetric(
      "heartRate",
      "Denyut Jantung Istirahat",
      "Heart Rate",
      "Kardiovaskular",
      "BPM",
      member.vitals.heartRate,
      base.heartRate,
      "60 - 90 BPM",
      "Heart",
      "rose",
      "in_range"
    ),
    buildMetric(
      "bloodPressureSystolic",
      "Tekanan Darah Sistolik",
      "Tensi Sistolik",
      "Kardiovaskular",
      "mmHg",
      curSystolic,
      base.bloodPressureSystolic,
      "< 130 mmHg",
      "Activity",
      "blue",
      true
    ),
    buildMetric(
      "bloodPressureDiastolic",
      "Tekanan Darah Diastolik",
      "Tensi Diastolik",
      "Kardiovaskular",
      "mmHg",
      curDiastolic,
      base.bloodPressureDiastolic,
      "< 85 mmHg",
      "Activity",
      "sky",
      true
    ),
    buildMetric(
      "bloodGlucose",
      "Kadar Gula Darah",
      "Glukosa Darah",
      "Metabolik",
      "mg/dL",
      member.vitals.bloodGlucose,
      base.bloodGlucose,
      "70 - 130 mg/dL",
      "Zap",
      "amber",
      true
    ),
    buildMetric(
      "spo2",
      "Saturasi Oksigen",
      "SpO2 Darah",
      "Kardiovaskular",
      "%",
      member.vitals.spo2,
      base.spo2,
      "95 - 100%",
      "Droplet",
      "cyan",
      false
    ),
    buildMetric(
      "sleepHours",
      "Durasi Tidur Restoratif",
      "Tidur",
      "Aktivitas & Tidur",
      "Jam",
      member.vitals.sleepHours,
      base.sleepHours,
      "7.0 - 8.5 Jam",
      "Moon",
      "indigo",
      false
    ),
    buildMetric(
      "steps",
      "Aktivitas Langkah Harian",
      "Langkah",
      "Aktivitas & Tidur",
      "Langkah",
      member.vitals.steps,
      base.steps,
      "> 7.500 Langkah",
      "Flame",
      "emerald",
      false
    ),
    buildMetric(
      "stressLevel",
      "Indeks Stres & Beban Vagal",
      "Indeks Stres",
      "Stres & Pemulihan",
      "/100",
      member.vitals.stressLevel,
      base.stressLevel,
      "< 40 / 100",
      "ShieldAlert",
      "purple",
      true
    ),
  ];

  // Overall weekly stability score
  const optimalCount = metrics.filter(m => m.clinicalStatus === "optimal" || m.clinicalStatus === "improving").length;
  const stableCount = metrics.filter(m => m.clinicalStatus === "stable").length;
  const warningCount = metrics.filter(m => m.clinicalStatus === "warning").length;

  let stabilityScore = Math.round(((optimalCount * 100 + stableCount * 85 + warningCount * 50) / metrics.length));
  if (stabilityScore > 98) stabilityScore = 98;

  let stabilityLabel: WeeklyVitalTrendReport["stabilityLabel"] = "Stabil Terkendali";
  if (stabilityScore >= 90) stabilityLabel = "Sangat Stabil & Optimal";
  else if (stabilityScore >= 78) stabilityLabel = "Stabil Terkendali";
  else if (stabilityScore >= 65) stabilityLabel = "Perlu Observasi Ringan";
  else stabilityLabel = "Fluktuatif Kritis";

  const keyStrengths: string[] = [];
  const attentionPoints: string[] = [];

  metrics.forEach(m => {
    if (m.clinicalStatus === "improving" || m.clinicalStatus === "optimal") {
      keyStrengths.push(`${m.label} berada pada performa prima (${m.diffPercentage > 0 ? "+" : ""}${m.diffPercentage}% vs 7-hari).`);
    } else if (m.clinicalStatus === "warning") {
      attentionPoints.push(`${m.label} menunjukkan deviasi (${m.diffPercentage > 0 ? "+" : ""}${m.diffPercentage}% dari rata-rata ${m.historical7DayAvg} ${m.unit}).`);
    }
  });

  if (keyStrengths.length === 0) {
    keyStrengths.push("Semua biomarker menunjukkan kestabilan konsisten mendekati baseline rata-rata 7 hari.");
  }
  if (attentionPoints.length === 0) {
    attentionPoints.push("Tidak ada anomali fluktuatif kritis terdeteksi dalam jendela evaluasi 7 hari terakhir.");
  }

  let doctorAnalysisSummary = `Evaluasi tren mingguan menunjukkan respons homeostasis fisiologis yang baik pada ${member.name}. Rasio rata-rata 7 hari membuktikan kepatuhan terhadap jadwal hidrasi dan aktivitas teratur.`;
  if (member.role === "Ayah") {
    doctorAnalysisSummary = "Evaluasi kardiometabolik Ayah menunjukkan kontrol tensi sistolik yang membaik secara signifikan dibandingkan rata-rata 7 hari terakhir pasca kepatuhan terapi relaksasi vaskular LimoCity.";
  } else if (member.role === "Kakek") {
    doctorAnalysisSummary = "Evaluasi geriatri Kakek menunjukkan stabilitas denyut istirahat yang sangat aman untuk pemulihan post-stent, dengan profil saturasi oksigen terjaga optimal sepanjang pekan.";
  } else if (member.role === "Ibu") {
    doctorAnalysisSummary = "Biomarker Ibu menunjukkan metabolisme glukosa dan kualitas tidur yang sangat stabil, mendukung pemulihan sendi lutut tanpa tanda inflamasi sistemik.";
  } else if (member.role === "Anak Sulung") {
    doctorAnalysisSummary = "Kapasitas kardiovaskular atletik Dimas prima. Pemulihan detak istirahat 58 BPM sangat cepat berkat kualitas tidur dan regenerasi otot yang terjaga.";
  }

  return {
    memberId: member.id,
    memberName: member.name,
    memberRole: member.role,
    evaluatedAt: new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    overallStabilityScore: stabilityScore,
    stabilityLabel,
    metrics,
    doctorAnalysisSummary,
    keyStrengths,
    attentionPoints,
  };
};
