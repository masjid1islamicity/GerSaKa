export type FamilyRole = "Ayah" | "Ibu" | "Anak Sulung" | "Anak Bungsu" | "Kakek" | "Nenek";

export type RiskLevel = "Rendah" | "Sedang" | "Tinggi" | "Kritis";

export interface VitalsData {
  heartRate: number; // BPM
  bloodPressure: string; // e.g. "120/80"
  spo2: number; // %
  bloodGlucose: number; // mg/dL
  bodyTemperature: number; // °C
  sleepHours: number; // hrs
  sleepScore: number; // 0-100
  deepSleepHours?: number; // hrs (Tahap N3 Slow Wave Sleep)
  remSleepHours?: number; // hrs (Rapid Eye Movement Sleep)
  lightSleepHours?: number; // hrs (Tahap N1/N2 Light Sleep)
  awakeMinutes?: number; // menit bangun semalam
  sleepEfficiencyPct?: number; // % efisiensi tidur
  steps: number;
  activeCalories: number;
  activeMinutes?: number;
  hrvMs: number; // Heart Rate Variability
  stressLevel: number; // 0-100
  timestamp: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  age: number;
  gender: "Laki-laki" | "Perempuan";
  bloodType: string;
  avatarUrl: string;
  medicalHistory: string;
  currentSymptoms?: string;
  allergies: string[];
  vitals: VitalsData;
  connectedWearable: {
    deviceName: string;
    brand: "Apple" | "Garmin" | "Fitbit" | "Samsung" | "Oura" | "Google";
    batteryLevel: number;
    lastSync: string;
    isLive: boolean;
  };
  overallHealthScore: number;
  therapyProgram: string;
}

export interface DiseasePrediction {
  condition: string;
  riskLevel: RiskLevel;
  probabilityScore: number;
  earlyWarningSigns: string[];
  recommendedClinicalActions: string[];
  ltcTherapyAdvice: string;
}

export interface PredictionResult {
  overallHealthScore: number;
  urgentAlert: boolean;
  summaryAnalysis: string;
  predictedConditions: DiseasePrediction[];
  vitalAnomalies: string[];
  weeklyForecast: string;
  source?: string;
  generatedAt?: string;
}

export interface NutritionPlan {
  dailyCalorieTarget: number;
  macroSplit: {
    carbsPercent: number;
    proteinPercent: number;
    fatPercent: number;
    fiberGrams: number;
    waterLiters: number;
  };
  keyNutritionalFocus: string;
  meals: Array<{
    time: string;
    type: string;
    menu: string;
    calories: number;
    tips: string;
  }>;
  smartPushAlerts: Array<{
    time: string;
    message: string;
  }>;
  avoidFoods: string[];
  superfoods: string[];
}

export interface DoctorSpecialist {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  sipNumber: string;
  experienceYears: number;
  rating: number;
  consultationFee: number;
  availableNow: boolean;
  avatarUrl: string;
  focusArea: string;
}

export interface MedicationItem {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "2x sehari sesudah makan"
  times: string[]; // ["07:00", "19:00"]
  instructions: string;
  prescribedBy: string;
  pharmacyName: string;
  rxNumber: string;
  stockRemaining: number;
  takenToday: Record<string, boolean>; // e.g. {"07:00": true, "19:00": false}
  startDate: string;
  endDate: string;
}

export interface HospitalInvoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  serviceDescription: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "Lunas" | "Menunggu Pembayaran" | "Diproses Asuransi";
  paymentMethod?: string;
  coverageType: "Mandiri / BPJS Bridging" | "Asuransi Swasta" | "Pribadi";
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: "Rumah Sakit Rujukan" | "Puskesmas 24 Jam" | "Klinik Darurat";
  distanceKm: number;
  etaMinutes: number;
  phone: string;
  address: string;
  hasICU: boolean;
  ambulanceAvailable: boolean;
}

export interface EmergencyDispatch {
  dispatchId: string;
  patientName: string;
  timestamp: string;
  status: "DISPATCHED_CRITICAL" | "EN_ROUTE" | "ON_SITE" | "RESOLVED";
  targetHospital: EmergencyFacility;
  ambulanceCode: string;
  team: string[];
  etaMinutes: number;
  vitalsSnapshot: VitalsData;
  encryptedHash: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: "AUTH_BIOMETRIC" | "2FA_VERIFIED" | "E2EE_KEY_ROTATION" | "CLOUD_BACKUP" | "DATA_EXPORT" | "EMERGENCY_TRIGGER";
  user: string;
  ipAddress: string;
  device: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
  details: string;
}

export interface DailyReminderSetting {
  id: string;
  title: string;
  time: string;
  category: "Hidrasi" | "Obat" | "Peregangan" | "Tensi" | "Jalan Kaki" | "Tidur";
  enabled: boolean;
  soundAlert: boolean;
}

export interface DailyHealthTip {
  id: string;
  category: "Kardiovaskular" | "Nutrisi & Hidrasi" | "Aktivitas & Fisioterapi" | "Istirahat & Stres" | "Pencegahan Klinis";
  title: string;
  shortAdvice: string;
  actionableStep: string;
  bestTime: string; // e.g. "Pagi 07:00", "Siang 12:30", "Sore 16:00", "Malam 21:00"
  importance: "Tinggi" | "Penting" | "Rekomendasi";
  scientificRationale: string;
  isCompleted?: boolean;
}

export interface DailyHealthTipsResponse {
  memberId: string;
  memberName: string;
  date: string;
  dailyFocusHeadline: string;
  overallReadinessScore: number;
  tips: DailyHealthTip[];
  source?: string;
}

export interface WeeklyHealthGoal {
  id: string;
  category: "steps" | "sleep" | "calories" | "therapy" | "hydration";
  title: string;
  unit: string;
  currentWeeklyValue: number;
  targetWeeklyValue: number;
  dailyHistory: {
    day: string; // "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
    value: number;
    achieved: boolean;
  }[];
  wearableMetricKey: "steps" | "sleepHours" | "activeCalories" | "therapySessions";
  recommendedByDoctor: string;
  clinicalNote: string;
}

export interface HealthGoalNotification {
  id: string;
  memberId: string;
  memberName: string;
  goalId: string;
  goalTitle: string;
  type: "approaching_goal" | "goal_achieved" | "daily_milestone";
  percentage: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  title: string;
  message: string;
  celebratoryEmoji: string;
  timestamp: string;
  isRead: boolean;
  sourceWearable: string;
}

export type SmartGoalCategory = "steps" | "calories" | "exercise" | "hydration" | "sleep";

export interface SmartDailyGoal {
  id: string;
  category: SmartGoalCategory;
  title: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  wearableSourceKey: "steps" | "activeCalories" | "activeMinutes" | "sleepHours";
  iconName: string;
  colorTheme: string;
  milestonesTriggered: {
    half: boolean; // 50%
    near: boolean; // 80-90%
    completed: boolean; // 100%
    streakBonus: boolean; // > 110%
  };
  recommendedPreset: string;
  clinicalRationale: string;
}

export interface SmartGoalAiNotification {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  goalCategory: SmartGoalCategory;
  goalTitle: string;
  percentage: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  title: string;
  message: string;
  aiCoachTone: "Empowering" | "Celebratory" | "Encouraging" | "Clinical Advisory";
  physiologicalImpact: string;
  actionableStep: string;
  celebratoryEmoji: string;
  sourceWearable: string;
  timestamp: string;
  isRead: boolean;
  sourceAiModel?: string;
}

export type LeaderboardMetric = "overall" | "steps" | "activeMinutes" | "goals" | "sleep";
export type LeaderboardTimeframe = "weekly" | "today";

export interface StreakBadge {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  title: string;
  subtitle: string;
  category: "streak_7" | "streak_14" | "streak_special";
  icon: string;
  colorGradient: string;
  borderColor: string;
  requiredDays: number;
  unlockedAt: string;
  doctorEndorsement: string;
  healthBenefit: string;
  isUnlocked: boolean;
  criteria: string;
}

export interface FamilyLeaderboardEntry {
  member: FamilyMember;
  rank: number;
  steps: number;
  targetSteps: number;
  activeMinutes: number;
  activeCalories: number;
  goalCompletionRate: number;
  sleepHours: number;
  sleepScore: number;
  wellnessScore: number; // 0 - 100
  badgeTitle: string;
  badgeIcon: string;
  streakDays: number;
  cheerCount: number;
  streakBadges: StreakBadge[];
  hasUnlocked7DayStreak: boolean;
  totalPoints?: number;
  pointsTier?: string;
}

export interface WeeklyChallengePointRule {
  description: string;
  pointsPerUnit?: number;
  bonusThreshold?: number;
  bonusPoints?: number;
  firstPlaceBonus: number;
  secondPlaceBonus: number;
  thirdPlaceBonus: number;
}

export interface ChallengeParticipantScore {
  memberId: string;
  memberName: string;
  memberRole: string;
  avatarUrl: string;
  rank: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
  pointsEarned: number;
  isLeader: boolean;
  hasReachedTarget: boolean;
  breakdown: Array<{
    label: string;
    points: number;
  }>;
}

export interface WeeklyChallenge {
  id: "most-steps" | "consistency-champion" | "calorie-crusher" | "sleep-recovery";
  title: string;
  subtitle: string;
  category: "steps" | "consistency" | "calories" | "sleep";
  icon: string;
  badgeReward: string;
  badgeRewardIcon: string;
  badgeRewardDescription: string;
  prizePoolPoints: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  targetGoalDescription: string;
  clinicalNote: string;
  status: "active" | "completed" | "upcoming";
  pointRules: WeeklyChallengePointRule;
  participants: ChallengeParticipantScore[];
}

export interface MemberPointHistoryItem {
  id: string;
  timestamp: string;
  source: string;
  points: number;
  icon: string;
  category: "steps" | "streak" | "challenge" | "wearable" | "cheer";
}

export interface MemberAutomatedPoints {
  memberId: string;
  memberName: string;
  memberRole: string;
  avatarUrl: string;
  totalPoints: number;
  weeklyPoints: number;
  baseActivityPoints: number;
  challengeBonusPoints: number;
  streakBonusPoints: number;
  tier: "Diamond Elite" | "Platinum Stride" | "Gold Champion" | "Silver Active";
  tierColor: string;
  tierBadge: string;
  rank: number;
  history: MemberPointHistoryItem[];
}

// -------------------------------------------------------------
// FITCity Key Performance Index (KPI) Wilayah Daulah Islamicity
// -------------------------------------------------------------

export interface FitCityKPIPillars {
  physicalVitality: number; // 0 - 100 (Aktivitas fisik & langkah warga)
  chronicCareAdherence: number; // 0 - 100 (Kepatuhan terapi & kestabilan tanda vital)
  halalThayyibNutrition: number; // 0 - 100 (Kualitas pangan thayyib & hidrasi)
  circadianRest: number; // 0 - 100 (Kualitas istirahat & sirkadian)
  socialEmpowerment: number; // 0 - 100 (Solidaritas, kesiagaan darurat, infaq kesehatan)
}

export interface FitCityCommunityVitals {
  avgDailySteps: number;
  avgRestingHR: number;
  normalBloodPressurePct: number;
  avgSleepHours: number;
  hydrationTargetAchievedPct: number;
  emergencyResponseMinutes: number;
  wearableSyncRatePct: number;
}

export interface FitCityFlagshipProgram {
  id: string;
  title: string;
  category: "Kebugaran Subuh" | "Deteksi Dini" | "Nutrisi Thayyib" | "Solidaritas Sehat" | "Lansia Tangguh";
  impactDescription: string;
  activeBeneficiaries: number;
  status: "Berjalan Efektif" | "Ekspansi Wilayah" | "Percontohan";
  leaderInCharge: string;
}

export interface FitCitySmartAdvisory {
  keyStrength: string;
  focusPriority: string;
  recommendedAction: string;
  impactPotential: string;
}

export interface FitCityRegion {
  id: string;
  code: string;
  name: string;
  arabicName: string;
  zone: "Pusat Daulah" | "Barat Daulah" | "Timur Daulah" | "Selatan Daulah" | "Pesisir Daulah";
  governor: string;
  hospitalHub: string;
  population: number;
  familiesRegistered: number;
  activeWearablesCount: number;
  kpiScore: number; // 0 - 100
  previousKpiScore: number;
  trend: "up" | "stable" | "down";
  rank: number;
  statusLevel: "Mumtaz (Teladan Terbaik)" | "Jayyid Jiddan (Sangat Berdaya)" | "Jayyid (Berdaya Aktif)" | "Maqbûl (Akselerasi)";
  awardTitle: string;
  pillars: FitCityKPIPillars;
  communityVitals: FitCityCommunityVitals;
  flagshipPrograms: FitCityFlagshipProgram[];
  smartAdvisory: FitCitySmartAdvisory;
  emergencyFundBalance: number; // IDR
}

// -------------------------------------------------------------
// Weekly Health Trend & Vital Comparison (7-Day Average vs Current)
// -------------------------------------------------------------

export type VitalMetricKey = 
  | "heartRate"
  | "bloodPressureSystolic"
  | "bloodPressureDiastolic"
  | "spo2"
  | "bloodGlucose"
  | "sleepHours"
  | "steps"
  | "activeCalories"
  | "stressLevel";

export interface VitalComparisonMetric {
  key: VitalMetricKey;
  label: string;
  shortLabel: string;
  category: "Kardiovaskular" | "Metabolik" | "Aktivitas & Tidur" | "Stres & Pemulihan";
  unit: string;
  currentValue: number;
  historical7DayAvg: number;
  diffValue: number;
  diffPercentage: number;
  trendDirection: "up" | "down" | "neutral";
  clinicalStatus: "optimal" | "improving" | "stable" | "warning";
  statusText: string;
  normalRange: string;
  iconName: string;
  colorTheme: string;
  daily7Days: Array<{
    dayLabel: string; // e.g. "H-6 (Kam)", "H-5 (Jum)", ..., "Hari Ini"
    dateShort: string;
    value: number;
    isCurrentDay: boolean;
  }>;
  clinicalInterpretation: string;
  actionRecommendation: string;
}

export interface WeeklyVitalTrendReport {
  memberId: string;
  memberName: string;
  memberRole: string;
  evaluatedAt: string;
  overallStabilityScore: number; // 0 - 100
  stabilityLabel: "Sangat Stabil & Optimal" | "Stabil Terkendali" | "Perlu Observasi Ringan" | "Fluktuatif Kritis";
  metrics: VitalComparisonMetric[];
  doctorAnalysisSummary: string;
  keyStrengths: string[];
  attentionPoints: string[];
}

// -------------------------------------------------------------
// Weekly Sleep Quality & Wearable Architecture (REM & Deep Sleep)
// -------------------------------------------------------------

export interface DailySleepStageRecord {
  dayLabel: string; // e.g. "H-6 (Kam)", ..., "Hari Ini"
  dateShort: string; // "18/9"
  totalSleepHours: number; // total jam tidur
  deepSleepHours: number; // durasi deep sleep (jam)
  remSleepHours: number; // durasi REM sleep (jam)
  lightSleepHours: number; // durasi light sleep (jam)
  awakeMinutes: number; // durasi terjaga (menit)
  sleepScore: number; // 0 - 100
  sleepEfficiencyPct: number; // %
  bedTime: string; // "22:15"
  wakeTime: string; // "05:30"
  isCurrentDay: boolean;
}

export interface WeeklySleepQualityAnalysis {
  memberId: string;
  memberName: string;
  memberRole: string;
  wearableDevice: string;
  wearableBrand: string;
  lastSync: string;
  isLive: boolean;
  
  // Rata-rata 7 hari
  avgTotalSleepHours: number;
  avgDeepSleepHours: number;
  avgRemSleepHours: number;
  avgLightSleepHours: number;
  avgSleepScore: number;
  avgSleepEfficiency: number;
  
  // Persentase arsitektur tidur (% dari total tidur)
  deepSleepPct: number; // Rekomendasi klinis: 15-25%
  remSleepPct: number; // Rekomendasi klinis: 20-25%
  lightSleepPct: number; // Rekomendasi klinis: 50-60%
  
  // Riwayat harian 7 hari
  dailyRecords: DailySleepStageRecord[];
  
  // Evaluasi Klinis & Sirkadian
  circadianAlignment: "Optimal (Sesuai Sunnah & Sirkadian Alami)" | "Cukup Baik" | "Perlu Penyesuaian Jam Tidur";
  deepSleepStatus: "Optimal (Pemulihan Sel & Imun Maksimal)" | "Cukup Baik" | "Suboptimal";
  remSleepStatus: "Optimal (Konsolidasi Memori & Mental Prima)" | "Cukup Baik" | "Suboptimal";
  clinicalSleepNotes: string;
  wearableSyncTip: string;

  // Morning Readiness Score & Biomarkers
  morningReadiness: MorningReadinessScore;
}

export interface MorningReadinessScore {
  score: number; // 0 - 100
  status: "Prima (Optimal Recovery)" | "Kondisi Baik (Ready for Action)" | "Perlu Pemulihan Ringan" | "Rest Day / Kelelahan";
  badgeColor: string;
  factors: {
    sleepQuality: number; // 0 - 100
    hrvRecovery: number; // 0 - 100 (from overnight HRV ms)
    restingHrDipping: number; // 0 - 100 (nocturnal HR dip)
    activityBalance: number; // 0 - 100 (prior day strain vs recovery)
    bodyBattery: number; // 0 - 100
  };
  recommendedWorkoutIntensity: "Tinggi (Latihan Beban/Lari Cepat)" | "Moderat (Jalan Cepat/Sepeda Santai)" | "Ringan (Peregangan/Jalan Santai)" | "Istirahat Total (Rest Day)";
  cognitiveFocusWindow: string; // e.g. "08:30 - 11:30 WIB"
  sunnahMorningAdvice: string;
  clinicalReadinessSummary: string;
}

export interface HypnogramPoint {
  time: string;
  stage: "deep" | "light" | "rem" | "awake";
  stageLabel: string;
  heartRate: number;
}

// -------------------------------------------------------------
// Daily Health Journal (Jurnal Kesehatan Harian)
// -------------------------------------------------------------

export type MoodType = 
  | "Gembira & Berenergi" 
  | "Tenang & Rileks" 
  | "Biasa / Netral" 
  | "Lelah / Mengantuk" 
  | "Cemas / Stres" 
  | "Kurang Nyaman / Pegal";

export interface DietLogItem {
  mealType: "Sarapan" | "Makan Siang" | "Makan Malam" | "Kudapan / Camilan" | "Puasa Sunnah";
  description: string;
  nutritionTag: string;
  waterIntakeLiters?: number;
}

export interface DailyHealthJournalEntry {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  date: string;
  timestamp: string;
  mood: MoodType;
  moodEmoji: string;
  energyLevel: number; // 1 - 5
  symptoms: string[];
  symptomSeverity?: "Nihil" | "Ringan" | "Sedang" | "Perlu Observasi";
  diet: DietLogItem;
  notes: string;
  vitalsSnapshot: {
    heartRate: number;
    bloodPressure: string;
    bloodGlucose: number;
    spo2: number;
    stressLevel: number;
    sleepHours: number;
    steps: number;
    wearableDevice: string;
  };
  aiCorrelationInsight?: string;
}

// -------------------------------------------------------------
// AI Medical Second Opinion (Teleconsultation Pre-Call Analysis)
// -------------------------------------------------------------

export interface MedicalSecondOpinion {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  generatedAt: string;
  confidenceScore: number; // 0 - 100
  urgencyLevel: "Rutin" | "Observasi Ketat" | "Perlu Penanganan Cepat";
  primaryAssessment: string;
  clinicalSummary: string;
  differentialDiagnoses: string[];
  contraindicationsAndAlerts: string[];
  recommendedQuestionsForDoctor: string[];
  suggestedDiagnosticTests: string[];
  holisticLimoCityPlan: string;
  sourceModel?: string;
}

// -------------------------------------------------------------
// AI Emergency First Aid Guidance (Pertolongan Pertama Real-Time)
// -------------------------------------------------------------

export interface FirstAidStep {
  stepNumber: number;
  title: string;
  action: string;
  rational: string;
  iconName?: string;
  timerSeconds?: number;
  isCompleted?: boolean;
}

export interface EmergencyFirstAidGuidance {
  id: string;
  conditionKey: string;
  conditionTitle: string;
  severityLevel: "Kritis / Mengancam Nyawa" | "Tinggi / Sangat Mendesak" | "Sedang / Waspada";
  immediateWarning: string;
  patientStatus: string;
  steps: FirstAidStep[];
  doList: string[];
  dontList: string[];
  ambulancePreparation: string[];
  cprMetronomeRecommended: boolean;
  generatedAt: string;
  sourceModel?: string;
}

// -------------------------------------------------------------
// AI Smart Health Goals Widget & Lagging Goal Reminder
// -------------------------------------------------------------

export interface SmartGoalReminder {
  id: string;
  memberId: string;
  memberName: string;
  timestamp: string;
  overallProgressPct: number;
  reminderTitle: string;
  motivationalMessage: string;
  recommendedAction: string;
  physiologicalImpact: string;
  quickRoutines: string[];
  encouragementQuote: string;
  sourceModel?: string;
  isDismissed?: boolean;
}

// -------------------------------------------------------------
// AI Symptom Checker & Health Urgency Recommendation System
// -------------------------------------------------------------

export type SymptomCategory = 
  | "Kepala & Saraf"
  | "Dada & Kardiovaskular"
  | "Pernapasan"
  | "Pencernaan & Perut"
  | "Muskuloskeletal & Sendi"
  | "Sistemik & Umum";

export interface PhysicalSymptom {
  id: string;
  name: string;
  category: SymptomCategory;
  severityLevel: "ringan" | "sedang" | "kritis";
  isRedFlag: boolean;
  description: string;
  relatedEmergencyKey?: "chest_pain" | "stroke" | "dyspnea" | "unconscious" | "general";
  iconName?: string;
}

export type UrgencyLevel = 
  | "DARURAT_KRITIS"
  | "TINGGI_MENDESAK"
  | "SEDANG_OBSERVASI"
  | "RENDAH_MANDIRI";

export interface SymptomCheckResult {
  id: string;
  patientId: string;
  patientName: string;
  checkedAt: string;
  selectedSymptoms: string[];
  painScale: number; // 1 - 10
  duration: string;
  urgencyLevel: UrgencyLevel;
  urgencyScore: number; // 0 - 100
  triageColor: "red" | "orange" | "yellow" | "green";
  headline: string;
  primarySuspect: string;
  differentialDiagnoses: string[];
  clinicalAnalysis: string;
  redFlags: string[];
  immediateActions: string[];
  recommendedSpecialist: string;
  limoCityTherapyAdvice: string;
  recommendedEmergencyConditionKey: "chest_pain" | "stroke" | "dyspnea" | "unconscious" | "general";
  recommendedEmergencyConditionTitle: string;
  requiresAmbulance: boolean;
  sourceModel?: string;
}

// -------------------------------------------------------------
// Mental Wellness Tracker & Emotional Wellbeing Types
// -------------------------------------------------------------

export interface MentalWellnessEntry {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  date: string; // "YYYY-MM-DD"
  timestamp: string;
  moodScore: number; // 1 - 10
  moodLabel: string;
  moodEmoji: string;
  secondaryEmotions: string[];
  journalTitle: string;
  journalEntry: string;
  gratitudeNote: string;
  mindfulnessMinutes?: number;
  triggersOrFactors: string[];
  vitalsCorrelation?: {
    heartRate: number;
    stressLevel: number;
    hrvMs: number;
    sleepScore: number;
    steps?: number;
  };
  aiReflection?: {
    emotionalSummary: string;
    affirmationOrWisdom: string;
    actionableTip: string;
    wellnessScore: number;
  };
}

export interface MentalWellnessMonthlyStats {
  monthYear: string; // "YYYY-MM"
  averageMoodScore: number;
  totalEntries: number;
  currentStreakDays: number;
  moodDistribution: {
    positivePct: number; // 8-10
    stablePct: number;   // 6-7
    neutralPct: number;  // 5
    challengingPct: number; // 1-4
  };
  dominantEmotion: string;
  topTriggers: Array<{ name: string; count: number; impact: "positif" | "negatif" | "netral" }>;
  vitalsSynergySummary: string;
  aiMonthlyReflection: string;
}

// -------------------------------------------------------------
// AI Health Insights & Lifestyle Optimization Types
// -------------------------------------------------------------

export interface LifestyleRecommendation {
  id: string;
  category: "Tidur & Sirkadian" | "Aktivitas & Kebugaran" | "Manajemen Stres & Mental" | "Nutrisi & Hidrasi" | "Pemulihan Jantung";
  priority: "Tinggi" | "Sedang" | "Optimalisasi";
  title: string;
  actionText: string;
  targetMetric: string;
  wearableTrigger: string;
  clinicalRationale: string;
  implementationSteps: string[];
  impactScorePct: number;
}

export interface WeeklyTrendSignal {
  metricName: string;
  currentAverage: string;
  previousAverage: string;
  percentageChange: number;
  status: "membaik" | "stabil" | "perlu_perhatian";
  interpretation: string;
  wearableSource: string;
}

export interface AiHealthInsightsData {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  generatedAt: string;
  weeklyVitalityScore: number; // 0 - 100
  trendDirection: "Meningkat Positif" | "Stabil Terkendali" | "Perlu Penyesuaian";
  executiveSummary: string;
  weeklySignals: WeeklyTrendSignal[];
  lifestyleRecommendations: LifestyleRecommendation[];
  recoveryStatus: {
    physicalRecoveryPct: number;
    cardiovascularStrainPct: number;
    circadianEfficiencyPct: number;
    stressResiliencePct: number;
  };
  keyPositiveHabits: string[];
  limoCityTherapyTip: string;
  sourceModel?: string;
}

// -------------------------------------------------------------
// AI Health Coach & Proactive Wearable Nudges Types
// -------------------------------------------------------------

export type CoachNudgeType = 
  | "hydration" 
  | "stretch" 
  | "posture_breath" 
  | "step_burst" 
  | "eye_rest" 
  | "cardio_recovery";

export interface HealthCoachNudge {
  id: string;
  type: CoachNudgeType;
  priority: "prioritas_tinggi" | "sedang" | "ringan";
  title: string;
  message: string;
  actionablePrompt: string;
  targetMetricGoal: string;
  wearableTriggerContext: string;
  timestamp: string;
  timerDurationSeconds?: number;
  routineSteps?: string[];
  hydrationAmountMl?: number;
  isCompleted?: boolean;
  completedAt?: string;
  sourceModel?: string;
}

export interface HealthCoachSettings {
  autoCoachCadenceMinutes: number;
  smartWearableTriggerEnabled: boolean;
  proactiveHydrationEnabled: boolean;
  proactiveStretchEnabled: boolean;
  stressAlertEnabled: boolean;
  audioChimeEnabled: boolean;
  dailyWaterGoalMl: number;
}

// -------------------------------------------------------------
// Smart Hydration Widget & Wearable Sensor Integration Types
// -------------------------------------------------------------

export interface HydrationLogEntry {
  id: string;
  timestamp: string;
  amountMl: number;
  drinkType: "air_mineral" | "air_hangat_thayyib" | "infused_water" | "air_kelapa_elektrolit" | "teh_herbal";
  note?: string;
}

export interface HydrationAiAlert {
  id: string;
  timestamp: string;
  urgency: "optimal" | "perlu_perhatian" | "peringatan_defisit";
  headline: string;
  clinicalReason: string;
  recommendation: string;
  suggestedIntakeNowMl: number;
  thayyibEtiquetteTip: string;
  wearableContextSummary: string;
  soundAlertNeeded?: boolean;
  sourceModel?: string;
}

export interface SmartHydrationState {
  memberId: string;
  baseTargetMl: number;
  sweatLossAdjustmentMl: number;
  dynamicTargetMl: number;
  consumedMl: number;
  logs: HydrationLogEntry[];
  lastIntakeTime: string;
  aiAlert?: HydrationAiAlert;
  isAiChecking?: boolean;
}
