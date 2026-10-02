import { FamilyMember, HealthCoachNudge, HealthCoachSettings } from "../types";

export const DEFAULT_COACH_SETTINGS: HealthCoachSettings = {
  autoCoachCadenceMinutes: 30,
  smartWearableTriggerEnabled: true,
  proactiveHydrationEnabled: true,
  proactiveStretchEnabled: true,
  stressAlertEnabled: true,
  audioChimeEnabled: true,
  dailyWaterGoalMl: 2500,
};

export const INITIAL_PROACTIVE_NUDGES: Record<string, HealthCoachNudge[]> = {
  "fam-01": [
    {
      id: "NUDGE-01",
      type: "stretch",
      priority: "prioritas_tinggi",
      title: "Peregangan Tengkuk & Bahu (Duduk >50 Menit)",
      message: "Sensor akselerometer Apple Watch mendeteksi Anda telah duduk selama 54 menit di depan meja kerja. Relaksasikan otot trapezius Anda sekarang.",
      actionablePrompt: "Lakukan rotasi bahu 5 kali dan miringkan leher ke kanan dan kiri.",
      targetMetricGoal: "Peregangan 60 Detik & Sirkulasi Vaskular",
      wearableTriggerContext: "Tidak ada langkah terdeteksi sejak 54 menit lalu • RHR 72 BPM",
      timestamp: "09:45",
      timerDurationSeconds: 60,
      routineSteps: [
        "Tegakkan punggung, turunkan kedua bahu menjauhi telinga.",
        "Putar bahu ke belakang perlahan 5 putaran penuh.",
        "Miringkan kepala ke kanan, tahan 10 detik, lalu ganti ke kiri.",
        "Dorong kedua tangan ke depan sambil melengkungkan punggung atas."
      ],
      hydrationAmountMl: 0,
      isCompleted: false,
      sourceModel: "Gemini 3.8 Flash (Proactive AI Health Coach)",
    },
    {
      id: "NUDGE-02",
      type: "hydration",
      priority: "sedang",
      title: "Hidrasi Seluler Pasca-Jalan Pagi",
      message: "Aktivitas pagi telah membakar 480 kkal aktif. Minum segelas air putih hangat untuk mendukung filtrasi ginjal.",
      actionablePrompt: "Minum 1 gelas air putih (250 ml) perlahan.",
      targetMetricGoal: "+250 ml Air Putih Thayyib (Progress: 1.250 / 2.500 ml)",
      wearableTriggerContext: "Pembakaran 480 kkal & interval minum terakhir >75 menit",
      timestamp: "08:15",
      timerDurationSeconds: 0,
      routineSteps: [
        "Gunakan air bersuhu ruang atau hangat.",
        "Duduk tenang dan minum dalam 3 tegukan teratur.",
        "Niatkan untuk menjaga kebugaran amanah tubuh."
      ],
      hydrationAmountMl: 250,
      isCompleted: true,
      completedAt: "08:18",
      sourceModel: "GerSaKa Proactive Coach",
    },
    {
      id: "NUDGE-03",
      type: "posture_breath",
      priority: "sedang",
      title: "Mikro-Jeda Nafas Koheren 4-7-8",
      message: "Indeks stres wearable sempat menyentuh 34% saat meninjau berkas. Rehat sejenak untuk menstimulasi saraf vagus.",
      actionablePrompt: "Tutup mata dan lakukan 5 siklus pernapasan dalam.",
      targetMetricGoal: "Stabilisasi Stres <25% & HRV >55ms",
      wearableTriggerContext: "Indeks stres 34% terdeteksi pukul 10:15",
      timestamp: "07:30",
      timerDurationSeconds: 90,
      routineSteps: [
        "Tarik napas dalam 4 hitungan lewat hidung.",
        "Tahan 7 hitungan dengan tenang.",
        "Hembuskan perlahan 8 hitungan melalui mulut disertai dzikir tasbih."
      ],
      hydrationAmountMl: 0,
      isCompleted: true,
      completedAt: "07:32",
      sourceModel: "GerSaKa Proactive Coach",
    },
  ],
};

export async function fetchProactiveCoachNudge(
  patient: FamilyMember,
  nudgeType: string = "auto",
  currentHydrationMl: number = 1250,
  sedentaryMinutes: number = 48
): Promise<HealthCoachNudge> {
  try {
    const response = await fetch("/api/ai/health-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient,
        nudgeType,
        currentHydrationMl,
        sedentaryMinutes,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.title && data.message) {
        return data as HealthCoachNudge;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote AI coach nudge, using fallback:", err);
  }

  // Local fallback generator
  const isHydration = nudgeType === "hydration" || currentHydrationMl < 1500;
  if (isHydration) {
    return {
      id: "NUDGE-" + Date.now().toString(36).toUpperCase(),
      type: "hydration",
      priority: "prioritas_tinggi",
      title: "Pengingat Hidrasi Cerdas Proaktif",
      message: `Data wearable ${patient.connectedWearable.deviceName} mendeteksi pengeluaran ${patient.vitals.activeCalories} kkal aktif. Waktunya mengisi kembali cairan tubuh agar terhindar dari dehidrasi mikro.`,
      actionablePrompt: "Minum 1 gelas air putih (250 ml) sekarang.",
      targetMetricGoal: "+250 ml Air Putih Sejuk",
      wearableTriggerContext: `Aktif ${patient.vitals.steps.toLocaleString()} langkah & kalori aktif ${patient.vitals.activeCalories} kkal`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      timerDurationSeconds: 0,
      routineSteps: [
        "Siapkan air putih higienis suhu ruangan.",
        "Minum perlahan sambil duduk untuk penyerapan optimal.",
        "Lanjutkan aktivitas dengan fokus yang kembali tajam."
      ],
      hydrationAmountMl: 250,
      isCompleted: false,
      sourceModel: "GerSaKa Local Coach Engine",
    };
  }

  return {
    id: "NUDGE-" + Date.now().toString(36).toUpperCase(),
    type: "stretch",
    priority: "sedang",
    title: "Peregangan Ringan Dinamis (Duduk >45 Menit)",
    message: `Akselerometer mendeteksi jeda duduk statis selama ${sedentaryMinutes} menit. Luangkan 60 detik untuk memperlancar sirkulasi darah ke otak dan ekstremitas.`,
    actionablePrompt: "Lakukan peregangan leher, punggung, dan pergelangan tangan.",
    targetMetricGoal: "Peregangan 60 Detik & Reaktivasi Sirkulasi",
    wearableTriggerContext: `Terdeteksi ${sedentaryMinutes} menit waktu sedentari berkelanjutan`,
    timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    timerDurationSeconds: 60,
    routineSteps: [
      "Rentangkan kedua tangan ke atas setinggi mungkin selama 10 detik.",
      "Tautkan tangan di belakang punggung dan dorong dada ke depan 10 detik.",
      "Putar pergelangan tangan dan regangkan jari-jari tangan 10 detik."
    ],
    hydrationAmountMl: 0,
    isCompleted: false,
    sourceModel: "GerSaKa Local Coach Engine",
  };
}
