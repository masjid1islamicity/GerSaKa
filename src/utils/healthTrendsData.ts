import { FamilyMember } from "../types";

export interface VitalTrendPoint {
  date: string;
  shortDate: string;
  fullDate: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  hrv: number;
  stressLevel: number;
  notes?: string;
}

export interface VitalStatsSummary {
  avgHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  avgSystolic: number;
  avgDiastolic: number;
  minSystolic: number;
  maxSystolic: number;
  avgSpo2: number;
  minSpo2: number;
  maxSpo2: number;
  statusBp: "optimal" | "normal" | "prehipertensi" | "hipertensi";
  statusHr: "optimal" | "normal" | "takikardia" | "bradikardia";
  statusSpo2: "optimal" | "cukup" | "hipoksemia_ringan";
  improvementRateBp: number; // percentage decrease/improvement in systolic
}

// Deterministic seed-based pseudorandom generator for smooth medical curves
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateLongTermVitalTrends(
  member: FamilyMember,
  timeRange: "7d" | "30d" | "90d"
): { data: VitalTrendPoint[]; summary: VitalStatsSummary } {
  const numDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const data: VitalTrendPoint[] = [];

  // Parse baseline current vitals
  const currentHr = member.vitals.heartRate || 72;
  const currentSpo2 = member.vitals.spo2 || 98;
  const bpParts = (member.vitals.bloodPressure || "120/80").split("/");
  const currentSys = parseInt(bpParts[0], 10) || 120;
  const currentDia = parseInt(bpParts[1], 10) || 80;

  // Historical delta at start of time horizon
  // For hypertensive patients, older readings were higher; therapy brought it down
  const isHypertensiveHistory = member.id === "fam-01" || member.medicalHistory?.toLowerCase().includes("hipertensi");
  const isGeriatric = member.age >= 65;

  const startingSysDelta = isHypertensiveHistory ? (timeRange === "90d" ? 14 : timeRange === "30d" ? 8 : 4) : 2;
  const startingDiaDelta = isHypertensiveHistory ? (timeRange === "90d" ? 8 : timeRange === "30d" ? 5 : 2) : 1;
  const startingHrDelta = isHypertensiveHistory ? 4 : 1;

  const today = new Date(2026, 8, 27); // 27 Sep 2026

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const progress = (numDays - 1 - i) / Math.max(1, numDays - 1); // 0 at start, 1 at end
    const seed = (member.id.charCodeAt(member.id.length - 1) * 31) + i * 17;
    const noise = (seededRandom(seed) - 0.5) * 2; // -1 to 1

    // Gradual clinical therapeutic improvement curve
    const sys = Math.round(
      currentSys + (startingSysDelta * (1 - progress)) + (noise * 2.5)
    );
    const dia = Math.round(
      currentDia + (startingDiaDelta * (1 - progress)) + (noise * 1.8)
    );
    const hr = Math.round(
      currentHr + (startingHrDelta * (1 - progress)) + (noise * 2.2)
    );

    // SPO2 is typically very stable (96-99%), occasionally dropping 1% with high activity or tiredness
    let spo2 = Math.min(
      100,
      Math.max(
        isGeriatric ? 94 : 96,
        Math.round(currentSpo2 + (noise * 0.7))
      )
    );

    // HRV (ms) inversely correlated with stress
    const hrv = Math.round((member.vitals.hrvMs || 55) + (noise * 5) + (progress * 4));
    const stress = Math.max(10, Math.min(90, Math.round((member.vitals.stressLevel || 25) - (progress * 8) - (noise * 4))));

    const shortDate = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const fullDate = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

    data.push({
      date: shortDate,
      shortDate,
      fullDate,
      heartRate: hr,
      systolic: sys,
      diastolic: dia,
      spo2,
      hrv,
      stressLevel: stress,
      notes: i === numDays - 1 ? "Pemeriksaan biomarker terkini" : undefined,
    });
  }

  // Calculate stats summary
  const hrValues = data.map((d) => d.heartRate);
  const sysValues = data.map((d) => d.systolic);
  const diaValues = data.map((d) => d.diastolic);
  const spo2Values = data.map((d) => d.spo2);

  const avgHeartRate = Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length);
  const minHeartRate = Math.min(...hrValues);
  const maxHeartRate = Math.max(...hrValues);

  const avgSystolic = Math.round(sysValues.reduce((a, b) => a + b, 0) / sysValues.length);
  const avgDiastolic = Math.round(diaValues.reduce((a, b) => a + b, 0) / diaValues.length);
  const minSystolic = Math.min(...sysValues);
  const maxSystolic = Math.max(...sysValues);

  const avgSpo2 = Number((spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length).toFixed(1));
  const minSpo2 = Math.min(...spo2Values);
  const maxSpo2 = Math.max(...spo2Values);

  const firstSys = data[0].systolic;
  const lastSys = data[data.length - 1].systolic;
  const improvementRateBp = Number((((firstSys - lastSys) / firstSys) * 100).toFixed(1));

  let statusBp: VitalStatsSummary["statusBp"] = "optimal";
  if (avgSystolic >= 140 || avgDiastolic >= 90) statusBp = "hipertensi";
  else if (avgSystolic >= 130 || avgDiastolic >= 85) statusBp = "prehipertensi";
  else if (avgSystolic >= 120 || avgDiastolic >= 80) statusBp = "normal";

  let statusHr: VitalStatsSummary["statusHr"] = "optimal";
  if (avgHeartRate > 100) statusHr = "takikardia";
  else if (avgHeartRate < 55 && member.id !== "fam-03") statusHr = "bradikardia";

  let statusSpo2: VitalStatsSummary["statusSpo2"] = "optimal";
  if (minSpo2 < 94) statusSpo2 = "hipoksemia_ringan";
  else if (avgSpo2 < 96) statusSpo2 = "cukup";

  return {
    data,
    summary: {
      avgHeartRate,
      minHeartRate,
      maxHeartRate,
      avgSystolic,
      avgDiastolic,
      minSystolic,
      maxSystolic,
      avgSpo2,
      minSpo2,
      maxSpo2,
      statusBp,
      statusHr,
      statusSpo2,
      improvementRateBp,
    },
  };
}
