export type ProactiveSeverity = "early_warning" | "moderate_anomaly" | "stabilizing";

export interface ProactiveHealthAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientRole: string;
  avatarUrl?: string;
  title: string;
  vitalMetric: "Tekanan Darah" | "Detak Jantung & HRV" | "Saturasi O2" | "Glukosa Darah" | "Stres & Pemulihan" | "Suhu & Imunitas";
  currentReading: string;
  baselineReading: string;
  percentageDrift: number;
  severity: ProactiveSeverity;
  severityLabel: string;
  probabilityOfCriticalPct: number;
  estimatedHoursToCritical: number;
  timeframeHorizon: string;
  trendAnalysis: string;
  rootCauseHypothesis: string;
  actionSteps: {
    stepNumber: number;
    title: string;
    description: string;
    estimatedEffect: string;
  }[];
  sunnahHerbalAdvice: string;
  clinicalRationale: string;
  detectedAt: string;
  isRead: boolean;
  isDismissed: boolean;
  isActionTaken: boolean;
  sourceWearable: string;
  sourceModel?: string;
}

export interface ProactiveScanResult {
  patientId: string;
  patientName: string;
  scannedAt: string;
  overallPreCrisisRiskScore: number; // 0-100
  riskLevel: "Rendah Terkendali" | "Perlu Kewaspadaan" | "Peringatan Dini Tinggi";
  activeAnomaliesCount: number;
  alerts: ProactiveHealthAlert[];
  executiveSummary: string;
  preventedCriticalCases: number;
  sourceModel: string;
}
