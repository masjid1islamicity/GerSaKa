import { FamilyMember, HydrationAiAlert, HydrationLogEntry, SmartHydrationState } from "../types";

export const HYDRATION_STORAGE_KEY = "gersaka_smart_hydration_data_v2";

export const DEFAULT_BASE_TARGETS: Record<string, number> = {
  "fam-01": 2500, // H. Hendra Kusuma (52 thn, Hipertensi terkontrol, butuh hidrasi vaskular)
  "fam-02": 2200, // Hj. Siti Rahmawati (48 thn, Osteopenia ringan)
  "fam-03": 2700, // Zikri Ramadhan (19 thn, Remaja aktif, atletis)
  "fam-04": 2000, // Zahra Aulia (15 thn, Pelajar)
  "fam-05": 1900, // H. Mansyur (76 thn, Lansia, pantau bertahap)
};

export function calculateDynamicHydrationTarget(member: FamilyMember): {
  baseTargetMl: number;
  sweatLossAdjustmentMl: number;
  totalDynamicTargetMl: number;
  breakdownReasons: string[];
} {
  const base = DEFAULT_BASE_TARGETS[member.id] || 2300;
  let sweatLoss = 0;
  const reasons: string[] = [];

  // Wearable active calories adjustment (+200 ml per 250 kkal)
  const calories = member.vitals.activeCalories || 0;
  if (calories > 250) {
    const calAdj = Math.min(800, Math.round((calories / 250) * 150));
    sweatLoss += calAdj;
    reasons.push(`+${calAdj} ml kompensasi pembakaran ${calories} kkal aktif`);
  }

  // Steps adjustment (+100 ml per 3000 steps)
  const steps = member.vitals.steps || 0;
  if (steps > 4000) {
    const stepAdj = Math.min(500, Math.round((steps / 4000) * 120));
    sweatLoss += stepAdj;
    reasons.push(`+${stepAdj} ml kompensasi pergerakan ${steps.toLocaleString()} langkah`);
  }

  // Temperature / Fever check
  if (member.vitals.bodyTemperature && member.vitals.bodyTemperature > 37.0) {
    sweatLoss += 250;
    reasons.push("+250 ml hidrasi termoregulasi suhu tubuh");
  }

  return {
    baseTargetMl: base,
    sweatLossAdjustmentMl: sweatLoss,
    totalDynamicTargetMl: base + sweatLoss,
    breakdownReasons: reasons,
  };
}

export const INITIAL_HYDRATION_DATA: Record<string, SmartHydrationState> = {
  "fam-01": {
    memberId: "fam-01",
    baseTargetMl: 2500,
    sweatLossAdjustmentMl: 350,
    dynamicTargetMl: 2850,
    consumedMl: 1450,
    lastIntakeTime: "11:20",
    logs: [
      { id: "log-1", timestamp: "06:15", amountMl: 300, drinkType: "air_hangat_thayyib", note: "Bangun tidur & shalat shubuh" },
      { id: "log-2", timestamp: "08:30", amountMl: 350, drinkType: "air_mineral", note: "Pasca sarapan & obat rutin" },
      { id: "log-3", timestamp: "10:15", amountMl: 250, drinkType: "infused_water", note: "Infused lemon mentimun" },
      { id: "log-4", timestamp: "11:20", amountMl: 300, drinkType: "air_mineral", note: "Rehat kerja pagi" },
      { id: "log-5", timestamp: "13:40", amountMl: 250, drinkType: "air_mineral", note: "Ba'da shalat dzuhur" },
    ],
    aiAlert: {
      id: "HYDRO-INIT-01",
      timestamp: "13:45",
      urgency: "perlu_perhatian",
      headline: "Waktunya Rehidrasi Siang: Cegah Kenaikan Tensi",
      clinicalReason: "Sensor Apple Watch mencatat 8.450 langkah dan 480 kkal aktif. Mempertahankan viskositas darah encer sangat krusial untuk kestabilan tensi 128/82 mmHg.",
      recommendation: "Minum 1 gelas air putih (250 ml) dalam posisi duduk tenang sebelum memulai aktivitas sore.",
      suggestedIntakeNowMl: 250,
      thayyibEtiquetteTip: "Duduklah dengan tenang, baca basmalah, dan teguk air dalam 3 tarikan nafas terpisah.",
      wearableContextSummary: "Apple Watch Ultra 2: 480 kkal aktif • 8.450 langkah • Jeda minum ~90 menit.",
      soundAlertNeeded: false,
      sourceModel: "Gemini 3.8 Flash (Smart Hydration Engine)",
    },
  },
  "fam-02": {
    memberId: "fam-02",
    baseTargetMl: 2200,
    sweatLossAdjustmentMl: 200,
    dynamicTargetMl: 2400,
    consumedMl: 1650,
    lastIntakeTime: "13:10",
    logs: [
      { id: "log-1", timestamp: "06:00", amountMl: 350, drinkType: "air_hangat_thayyib", note: "Air hangat jahe madu" },
      { id: "log-2", timestamp: "08:45", amountMl: 300, drinkType: "air_mineral", note: "Pasca senam lansia ringan" },
      { id: "log-3", timestamp: "11:00", amountMl: 300, drinkType: "infused_water", note: "Infused kurma nabeez" },
      { id: "log-4", timestamp: "13:10", amountMl: 350, drinkType: "air_mineral", note: "Ba'da makan siang" },
      { id: "log-5", timestamp: "15:00", amountMl: 350, drinkType: "teh_herbal", note: "Teh serai daun kelor" },
    ],
  },
  "fam-03": {
    memberId: "fam-03",
    baseTargetMl: 2700,
    sweatLossAdjustmentMl: 550,
    dynamicTargetMl: 3250,
    consumedMl: 1950,
    lastIntakeTime: "12:50",
    logs: [
      { id: "log-1", timestamp: "05:45", amountMl: 500, drinkType: "air_mineral", note: "Hidrasi bangun tidur" },
      { id: "log-2", timestamp: "07:30", amountMl: 400, drinkType: "air_kelapa_elektrolit", note: "Pasca lari pagi 5 km" },
      { id: "log-3", timestamp: "10:30", amountMl: 350, drinkType: "air_mineral", note: "Kuliah sesi 1" },
      { id: "log-4", timestamp: "12:50", amountMl: 400, drinkType: "air_mineral", note: "Makan siang di kampus" },
      { id: "log-5", timestamp: "14:30", amountMl: 300, drinkType: "air_mineral", note: "Persiapan latihan basket" },
    ],
  },
  "fam-04": {
    memberId: "fam-04",
    baseTargetMl: 2000,
    sweatLossAdjustmentMl: 200,
    dynamicTargetMl: 2200,
    consumedMl: 1200,
    lastIntakeTime: "12:15",
    logs: [
      { id: "log-1", timestamp: "06:20", amountMl: 250, drinkType: "air_mineral", note: "Sebelum berangkat sekolah" },
      { id: "log-2", timestamp: "09:30", amountMl: 350, drinkType: "air_mineral", note: "Istirahat pertama sekolah" },
      { id: "log-3", timestamp: "12:15", amountMl: 350, drinkType: "air_mineral", note: "Istirahat dzuhur" },
      { id: "log-4", timestamp: "14:15", amountMl: 250, drinkType: "infused_water", note: "Infused stroberi mint" },
    ],
  },
  "fam-05": {
    memberId: "fam-05",
    baseTargetMl: 1900,
    sweatLossAdjustmentMl: 100,
    dynamicTargetMl: 2000,
    consumedMl: 1300,
    lastIntakeTime: "13:30",
    logs: [
      { id: "log-1", timestamp: "05:30", amountMl: 250, drinkType: "air_hangat_thayyib", note: "Air hangat suam kuku" },
      { id: "log-2", timestamp: "08:00", amountMl: 250, drinkType: "air_mineral", note: "Pasca sarapan bubur" },
      { id: "log-3", timestamp: "10:30", amountMl: 250, drinkType: "air_hangat_thayyib", note: "Minum air rebusan jahe" },
      { id: "log-4", timestamp: "13:30", amountMl: 250, drinkType: "air_mineral", note: "Ba'da dzuhur & istirahat" },
      { id: "log-5", timestamp: "15:20", amountMl: 300, drinkType: "air_hangat_thayyib", note: "Menjelang ashar" },
    ],
  },
};

export async function fetchSmartHydrationAiAlert(
  patient: FamilyMember,
  consumedMl: number,
  dynamicTargetMl: number,
  currentHour: number = new Date().getHours(),
  lastIntakeMinutesAgo: number = 75
): Promise<HydrationAiAlert> {
  try {
    const res = await fetch("/api/ai/smart-hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient,
        consumedMl,
        dynamicTargetMl,
        currentHour,
        lastIntakeMinutesAgo,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.headline && data.clinicalReason) {
        return data as HydrationAiAlert;
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote AI hydration alert, using fallback:", err);
  }

  // Heuristic Fallback
  const pct = Math.round((consumedMl / dynamicTargetMl) * 100);
  const isDeficit = pct < 50;

  return {
    id: "HYDRO-LOC-" + Date.now().toString(36).toUpperCase(),
    timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    urgency: isDeficit ? "peringatan_defisit" : "perlu_perhatian",
    headline: isDeficit ? "Defisit Hidrasi: Segera Minum Segelas Air" : "Pertahankan Keseimbangan Hidrasi Seluler",
    clinicalReason: `Wearable ${patient.connectedWearable.deviceName} mencatat ${patient.vitals.activeCalories} kkal terbakar. Asupan saat ini ${consumedMl}/${dynamicTargetMl} ml (${pct}%). Rehidrasi teratur menjaga perfusi organ dan kelancaran aliran darah.`,
    recommendation: "Minum 1 gelas air putih (250 ml) sekarang secara perlahan untuk menyegarkan kembali daya konsentrasi Anda.",
    suggestedIntakeNowMl: 250,
    thayyibEtiquetteTip: "Duduklah dengan tenang, minum dalam 3 tegukan teratur, dan rasakan kesegaran yang mengalir ke seluruh sel tubuh.",
    wearableContextSummary: `${patient.connectedWearable.deviceName}: ${patient.vitals.activeCalories} kkal • ${patient.vitals.steps.toLocaleString()} langkah.`,
    soundAlertNeeded: isDeficit,
    sourceModel: "GerSaKa Heuristic Hydration Engine",
  };
}

export function playHydrationSoundChime(urgency: "optimal" | "perlu_perhatian" | "peringatan_defisit") {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (urgency === "peringatan_defisit") {
      // Two-tone alert (water drop chime)
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } else {
      // Pleasant water ripple sound
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.25); // G5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    }
  } catch {
    // Audio context may be restricted by browser
  }
}
