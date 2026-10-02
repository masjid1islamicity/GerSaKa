import React, { useState, useEffect, useRef } from "react";
import { FamilyMember } from "../types";
import { HealthGoalsTracker } from "./HealthGoalsTracker";
import { FamilyLeaderboard } from "./FamilyLeaderboard";
import { DailyHealthTips } from "./DailyHealthTips";
import { WeeklyVitalTrendAnalysis } from "./WeeklyVitalTrendAnalysis";
import { WeeklySleepQualityChart } from "./WeeklySleepQualityChart";
import { SmartHealthGoals } from "./SmartHealthGoals";
import { DailyHealthJournal } from "./DailyHealthJournal";
import { MentalWellnessTracker } from "./MentalWellnessTracker";
import { AiHealthInsights } from "./AiHealthInsights";
import { AiHealthCoach } from "./AiHealthCoach";
import { SmartHydrationWidget } from "./SmartHydrationWidget";
import { DailyWellnessGoal } from "./DailyWellnessGoal";
import { ProactiveHealthAlertBanner } from "./ProactiveHealthAlertBanner";
import { ProactiveHealthAlertWidget } from "./ProactiveHealthAlertWidget";
import { ProactiveHealthAlert } from "../types/proactiveAlerts";
import { 
  Heart, 
  Activity, 
  Droplet, 
  Moon, 
  Flame, 
  Thermometer, 
  Sparkles, 
  Utensils, 
  Video, 
  Pill, 
  RefreshCw, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Battery,
  ShieldAlert,
  Zap,
  Clock,
  Landmark,
  Trophy,
  ChevronRight,
  Stethoscope,
  Siren,
  Smile,
  Compass,
  Database,
  WifiOff,
  Target,
  Bell
} from "lucide-react";

interface FamilyOverviewProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onRunAiPrediction: () => void;
  onOpenNutrition: () => void;
  onOpenTeleconsult: () => void;
  onOpenMedication: () => void;
  onOpenPayment: () => void;
  onSyncWearable: () => void;
  isSyncing: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  lastSyncTimestamp?: number;
  onNavigateToFitCity?: () => void;
  onNavigateToBerjaga?: () => void;
  onOpenSymptomChecker?: () => void;
  onTriggerEmergency?: (conditionTitle: string, conditionKey?: string) => void;
  onOpenOfflineVault?: () => void;
  proactiveAlerts?: ProactiveHealthAlert[];
  onOpenProactiveModal?: () => void;
}

export const FamilyOverview: React.FC<FamilyOverviewProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onRunAiPrediction,
  onOpenNutrition,
  onOpenTeleconsult,
  onOpenMedication,
  onOpenPayment,
  onSyncWearable,
  isSyncing,
  onShowToast,
  lastSyncTimestamp,
  onNavigateToFitCity,
  onNavigateToBerjaga,
  onOpenSymptomChecker,
  onTriggerEmergency,
  onOpenOfflineVault,
  proactiveAlerts,
  onOpenProactiveModal,
}) => {

  const activeMember = members.find(m => m.id === selectedMemberId) || members[0];
  const vitals = activeMember.vitals;

  // Subtle heart-pulsing CSS animation state on new sync data point
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [showSyncBadge, setShowSyncBadge] = useState(false);
  
  const prevSyncRef = useRef<{
    heartRate: number;
    lastSync: string;
    isSyncing: boolean;
    timestamp?: number;
  }>({
    heartRate: vitals.heartRate,
    lastSync: activeMember.connectedWearable.lastSync,
    isSyncing,
    timestamp: lastSyncTimestamp,
  });

  useEffect(() => {
    const prev = prevSyncRef.current;
    const hasHRChanged = prev.heartRate !== vitals.heartRate;
    const hasLastSyncChanged = prev.lastSync !== activeMember.connectedWearable.lastSync;
    const justFinishedSyncing = prev.isSyncing && !isSyncing;
    const hasTimestampChanged = Boolean(
      lastSyncTimestamp && prev.timestamp && lastSyncTimestamp !== prev.timestamp
    );

    // Trigger subtle pulsing animation whenever a new sync data point is received
    if (hasHRChanged || hasLastSyncChanged || justFinishedSyncing || hasTimestampChanged) {
      setIsPulsing(true);
      setShowSyncBadge(true);
      setPulseKey(k => k + 1);

      const pulseTimer = setTimeout(() => {
        setIsPulsing(false);
      }, 1400);

      const badgeTimer = setTimeout(() => {
        setShowSyncBadge(false);
      }, 2600);

      prevSyncRef.current = {
        heartRate: vitals.heartRate,
        lastSync: activeMember.connectedWearable.lastSync,
        isSyncing,
        timestamp: lastSyncTimestamp,
      };

      return () => {
        clearTimeout(pulseTimer);
        clearTimeout(badgeTimer);
      };
    }

    prevSyncRef.current = {
      heartRate: vitals.heartRate,
      lastSync: activeMember.connectedWearable.lastSync,
      isSyncing,
      timestamp: lastSyncTimestamp,
    };
  }, [vitals.heartRate, activeMember.connectedWearable.lastSync, isSyncing, lastSyncTimestamp]);

  // Evaluate clinical anomaly flags
  const [systolic, diastolic] = vitals.bloodPressure.split("/").map(Number);
  const isHighBP = systolic >= 135 || diastolic >= 85;
  const isLowSpo2 = vitals.spo2 < 95;
  const isHighGlucose = vitals.bloodGlucose > 130;
  const hasAnomaly = isHighBP || isLowSpo2 || isHighGlucose;

  return (
    <div className="space-y-6">
      
      {/* Family Member Horizontal Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Anggota Keluarga Terdaftar
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-semibold">
              {members.length} Jiwa
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetri Real-Time Aktif</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {members.map(member => {
            const isSelected = member.id === activeMember.id;
            return (
              <button
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-slate-50/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700"
                }`}
              >
                <div className="relative">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                    member.overallHealthScore >= 85 ? "bg-emerald-500" : "bg-amber-500"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {member.role}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {member.overallHealthScore}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {member.age} thn • Gol. {member.bloodType}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Proactive Health Alert Early Warning Banner */}
      <ProactiveHealthAlertBanner
        alerts={proactiveAlerts || []}
        onOpenModal={onOpenProactiveModal || (() => {})}
      />

      {/* Active Member Focus Dashboard */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Header with Avatar, Details & Quick Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={activeMember.avatarUrl}
              alt={activeMember.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeMember.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  {activeMember.role} ({activeMember.age} Tahun)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Gol. Darah: {activeMember.bloodType}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Program Terapi:</span> {activeMember.therapyProgram}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold">Riwayat Medis:</span> {activeMember.medicalHistory}
              </p>
            </div>
          </div>

          {/* Wearable Connection Pill & Quick Sync */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>{activeMember.connectedWearable.deviceName}</span>
                  <span className="flex items-center gap-0.5 text-slate-500">
                    <Battery className="w-3 h-3 text-emerald-500" />
                    {activeMember.connectedWearable.batteryLevel}%
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Sinkron: {activeMember.connectedWearable.lastSync}
                </p>
              </div>
            </div>

            <button
              onClick={onSyncWearable}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              title="Perbarui telemetri dari sensor wearable"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sinkronisasi..." : "Tarik Data Sensor"}</span>
            </button>
          </div>
        </div>

        {/* Anomaly / Clinical Alert Strip if applicable */}
        {hasAnomaly ? (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Peringatan Klinis Real-Time:</span> Terdeteksi deviasi biomarker pada {activeMember.name} (
              {isHighBP && `Tekanan Darah: ${vitals.bloodPressure} mmHg; `}
              {isLowSpo2 && `SpO2 Suboptimal: ${vitals.spo2}%; `}
              {isHighGlucose && `Glukosa: ${vitals.bloodGlucose} mg/dL; `}
              ). Direkomendasikan menjalankan analisis prediksi AI atau membuka konsultasi video dokter spesialis LimoCity.
            </div>
            <button
              onClick={onRunAiPrediction}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shrink-0"
            >
              Evaluasi AI
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Status Biometrik Prima:</span> Seluruh parameter vital keluarga berada dalam rentang homeostasis sehat LimoCity Therapy.
            </div>
          </div>
        )}

        {/* Real-Time Vitals Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Heart Rate Tile with Subtle Heart-Pulsing Animation on New Sync Data */}
          <div 
            key={`hr-pulse-${pulseKey}`}
            className={`p-4 rounded-xl relative overflow-hidden transition-all duration-300 border ${
              isPulsing
                ? "animate-subtle-heart-pulse bg-rose-50/75 dark:bg-rose-950/45 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/30 shadow-lg shadow-rose-500/15"
                : "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            {/* Subtle Sync Ripple Wave */}
            {isPulsing && (
              <span 
                className="absolute inset-0 pointer-events-none rounded-xl animate-sync-ripple bg-rose-400/10 dark:bg-rose-400/15"
                aria-hidden="true"
              />
            )}

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Detak Jantung
                </span>
                {showSyncBadge && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-in fade-in zoom-in-95 duration-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    Sync
                  </span>
                )}
              </div>
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isPulsing
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/40 scale-105 animate-heart-beat-sync"
                    : "bg-rose-100 dark:bg-rose-950 text-rose-600"
                }`}
              >
                <Heart className={`w-4 h-4 ${isPulsing ? "fill-white animate-heart-beat-sync" : "animate-pulse fill-rose-600"}`} />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5 relative z-10">
              <span className={`text-2xl font-extrabold transition-colors duration-300 ${
                isPulsing ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
              }`}>
                {vitals.heartRate}
              </span>
              <span className="text-xs text-slate-500">BPM</span>
              
              {isPulsing && (
                <span className="ml-auto text-[10px] font-bold text-rose-600 dark:text-rose-400 animate-pulse flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Live Sync
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] relative z-10">
              <span className="text-slate-500">HRV: {vitals.hrvMs} ms</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Irama Sinus
              </span>
            </div>
          </div>

          {/* Blood Pressure Tile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tekanan Darah
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {vitals.bloodPressure}
              </span>
              <span className="text-xs text-slate-500">mmHg</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Vaskular</span>
              <span className={`font-semibold ${isHighBP ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {isHighBP ? "Elevated" : "Optimal"}
              </span>
            </div>
          </div>

          {/* SpO2 Saturation Tile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Saturasi Oksigen
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {vitals.spo2}
              </span>
              <span className="text-xs text-slate-500">% SpO2</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Oksigenasi Jaringan</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Kadar Normal</span>
            </div>
          </div>

          {/* Blood Glucose Tile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Gula Darah Acak
              </span>
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {vitals.bloodGlucose}
              </span>
              <span className="text-xs text-slate-500">mg/dL</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Profil Glukosa</span>
              <span className={`font-semibold ${isHighGlucose ? "text-amber-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                {isHighGlucose ? "Pantau" : "Terkontrol"}
              </span>
            </div>
          </div>

          {/* Sleep Quality Tile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Kualitas Tidur
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <Moon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {vitals.sleepHours}
              </span>
              <span className="text-xs text-slate-500">Jam (Skor {vitals.sleepScore}/100)</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Fase REM & Deep</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Restoratif</span>
            </div>
          </div>

          {/* Daily Steps & Activity Tile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Aktivitas & Langkah
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {vitals.steps.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">Langkah</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Kalori Aktif</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{vitals.activeCalories} kkal</span>
            </div>
          </div>

          {/* Body Temperature Tile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Suhu Tubuh
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {vitals.bodyTemperature}
              </span>
              <span className="text-xs text-slate-500">°C</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Termoregulasi</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Afebris (Normal)</span>
            </div>
          </div>

          {/* Stress & Recovery Index Tile */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Indeks Stres & Relaksasi
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {vitals.stressLevel}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Beban Mental</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Rendah / Tenang</span>
            </div>
          </div>

        </div>

        {/* Primary Functional Action Suite */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Layanan Terpadu GerSaKa LimoCity
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            
            {/* Smart Hydration Widget Shortcut */}
            <button
              onClick={() => {
                const el = document.getElementById("smart-hydration-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all active:scale-98 cursor-pointer relative"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Droplet className="w-4 h-4 text-white fill-white/30" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-bold leading-tight">Smart Hydration</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                </div>
                <p className="text-[10px] text-cyan-100 font-normal">Sensor Wearable & Notif AI</p>
              </div>
            </button>

            {/* Sleep Quality & Morning Readiness Shortcut */}
            <button
              onClick={() => {
                const el = document.getElementById("sleep-quality-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-700 hover:from-indigo-800 hover:to-teal-800 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-98 cursor-pointer relative"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 text-white fill-white/30" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-bold leading-tight">Kualitas Tidur</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                </div>
                <p className="text-[10px] text-indigo-100 font-normal">REM, Deep & Kesiapan</p>
              </div>
            </button>

            {/* Islamicity BERJAGA Shortcut */}
            {onNavigateToBerjaga && (
              <button
                onClick={onNavigateToBerjaga}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer relative"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <p className="font-bold leading-tight">Islamicity BERJAGA</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-teal-100 font-normal">7 Pilar Sunnah & Bahagia</p>
                </div>
              </button>
            )}

            {/* Proactive Health Alert Shortcut */}
            {onOpenProactiveModal && (
              <button
                onClick={onOpenProactiveModal}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all active:scale-98 cursor-pointer relative"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <p className="font-bold leading-tight">Peringatan Dini AI</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
                  </div>
                  <p className="text-[10px] text-amber-100 font-normal">Deteksi Pra-Kritis AI</p>
                </div>
              </button>
            )}

            {/* Daily Wellness Goal Shortcut (Air, Langkah, Napas) */}
            <button
              onClick={() => {
                const el = document.getElementById("daily-wellness-goals-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all active:scale-98 cursor-pointer relative"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-bold leading-tight">Daily Wellness</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                </div>
                <p className="text-[10px] text-teal-100 font-normal">Target Air, Langkah & Napas</p>
              </div>
            </button>

            {/* Offline Health & Emergency Vault Shortcut */}
            {onOpenOfflineVault && (
              <button
                onClick={onOpenOfflineVault}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-900 text-white font-semibold text-xs shadow-md shadow-teal-700/20 transition-all active:scale-98 cursor-pointer relative"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <p className="font-bold leading-tight">Offline Vault</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] text-teal-200 font-normal">Data & Obat 100% Offline</p>
                </div>
              </button>
            )}

            {/* Symptom Checker AI Button (Integrated with EmergencyModal) */}
            <button
              onClick={onOpenSymptomChecker}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-bold leading-tight">Pemeriksa Gejala</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
                </div>
                <p className="text-[10px] text-red-100 font-normal">Triase Urgensi & 119</p>
              </div>
            </button>

            {/* AI Health Coach Proaktif Shortcut */}
            <button
              onClick={() => {
                const el = document.getElementById("ai-health-coach-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">AI Health Coach</p>
                <p className="text-[10px] text-cyan-100 font-normal">Hidrasi & Peregangan</p>
              </div>
            </button>

            {/* AI Health Insights Shortcut */}
            <button
              onClick={() => {
                const el = document.getElementById("ai-health-insights-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">AI Health Insights</p>
                <p className="text-[10px] text-emerald-100 font-normal">Tren & Gaya Hidup</p>
              </div>
            </button>

            {/* Mental Wellness & Mood Tracker Shortcut */}
            <button
              onClick={() => {
                const el = document.getElementById("mental-wellness-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Smile className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">Mental Wellness</p>
                <p className="text-[10px] text-teal-100 font-normal">Mood & Jurnal Sakinah</p>
              </div>
            </button>

            {/* AI Disease Prediction Button */}
            <button
              onClick={onRunAiPrediction}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">Analisis Prediksi AI</p>
                <p className="text-[10px] text-emerald-100 font-normal">Deteksi Dini Penyakit</p>
              </div>
            </button>

            {/* Personalized Nutrition Plan */}
            <button
              onClick={onOpenNutrition}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-white font-semibold text-xs transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">Rencana Gizi Personal</p>
                <p className="text-[10px] text-slate-500 font-normal">Menu Sehat & Peringatan</p>
              </div>
            </button>

            {/* Teleconsultation Video Call */}
            <button
              onClick={onOpenTeleconsult}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-800 dark:text-white font-semibold text-xs transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">Konsultasi Video</p>
                <p className="text-[10px] text-slate-500 font-normal">Dokter Spesialis LimoCity</p>
              </div>
            </button>

            {/* Smart Medication Schedule */}
            <button
              onClick={onOpenMedication}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-white font-semibold text-xs transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">Pengingat Obat</p>
                <p className="text-[10px] text-slate-500 font-normal">Resep Elektronik & Apotek</p>
              </div>
            </button>

            {/* Hospital Payment System */}
            <button
              onClick={onOpenPayment}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-white font-semibold text-xs transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold leading-tight">Administrasi RS</p>
                <p className="text-[10px] text-slate-500 font-normal">Tagihan, VA & QRIS</p>
              </div>
            </button>

          </div>
        </div>

      </div>

      {/* FITUR ISLAMICITY BERJAGA SHOWCASE CARD */}
      {onNavigateToBerjaga && (
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 border border-teal-800/60 shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 flex items-center justify-center font-black shadow-lg shadow-teal-600/30 shrink-0">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  7 Pilar Hidup Berkah
                </span>
                <span className="text-xs text-teal-200">
                  Bergerak • Bekerja • Berbekam • Berdakwah • Bersyariah • Berjamaah • Bermuamalah
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                Islamicity BERJAGA — Sampai Bahagia Sejahtera
              </h3>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Sinergi thibbun nabawi medis, jadwal sunnah bekam (17, 19, 21 Hijriah), etos kerja halal, dan kepatuhan maqashid syariah untuk keluarga {activeMember.name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              type="button"
              onClick={onNavigateToBerjaga}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Buka Modul BERJAGA</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      )}

      {/* FITUR SISTEM PERINGATAN DINI KESEHATAN PROAKTIF (AI PROACTIVE HEALTH ALERT SYSTEM) */}
      <div id="proactive-health-alerts-section">
        <ProactiveHealthAlertWidget
          member={activeMember}
          allMembers={members}
          onSelectMember={onSelectMember}
          onOpenAlertModal={onOpenProactiveModal}
          onOpenTeleconsult={onOpenTeleconsult}
          onShowToast={onShowToast}
        />
      </div>

      {/* FITUR DAILY WELLNESS GOAL (TARGET KEBIASAAN SEHAT HARIAN: AIR, LANGKAH, NAPAS RELAKSASI, PROGRESS BARS) */}
      <div id="daily-wellness-goals-section">
        <DailyWellnessGoal
          member={activeMember}
          allMembers={members}
          onSelectMember={onSelectMember}
          onSyncWearable={onSyncWearable}
          onShowToast={onShowToast}
        />
      </div>

      {/* FITUR SMART HYDRATION WIDGET (PELACAK ASUPAN AIR HARIAN DENGAN SENSOR WEARABLE & PENGINGAT NOTIFIKASI AI) */}
      <div id="smart-hydration-section">
        <SmartHydrationWidget
          member={activeMember}
          allMembers={members}
          onSelectMember={onSelectMember}
          onSyncWearable={onSyncWearable}
          isSyncing={isSyncing}
          onShowToast={onShowToast}
        />
      </div>

      {/* FITUR AI HEALTH COACH (PENDAMPING POLA HIDUP PROAKTIF: PENGINGAT HIDRASI & PEREGANGAN REAL-TIME WEARABLE) */}
      <div id="ai-health-coach-section">
        <AiHealthCoach
          member={activeMember}
          onSyncWearable={onSyncWearable}
          isSyncing={isSyncing}
          onShowToast={onShowToast}
        />
      </div>

      {/* FITUR AI HEALTH INSIGHTS (ANALISIS TREN KESEHATAN MINGGUAN OTOMATIS & SARAN GAYA HIDUP WEARABLE) */}
      <div id="ai-health-insights-section">
        <AiHealthInsights
          member={activeMember}
          onSyncWearable={onSyncWearable}
          isSyncing={isSyncing}
          onShowToast={onShowToast}
          onRunAiPrediction={onRunAiPrediction}
        />
      </div>

      {/* FITUR ANALISIS TREN KESEHATAN MINGGUAN (KOMPARASI VITAL SAAT INI VS RATA-RATA 7 HARI) */}
      <WeeklyVitalTrendAnalysis
        member={activeMember}
        onSyncWearable={onSyncWearable}
        isSyncing={isSyncing}
        onShowToast={onShowToast}
        onRunAiPrediction={onRunAiPrediction}
      />

      {/* FITUR PEMANTAUAN KUALITAS TIDUR & SKOR KESIAPAN PAGI (SLEEP QUALITY & MORNING READINESS WEARABLE) */}
      <div id="sleep-quality-section">
        <WeeklySleepQualityChart
          member={activeMember}
          allMembers={members}
          onSelectMember={onSelectMember}
          onSyncWearable={onSyncWearable}
          isSyncing={isSyncing}
          onShowToast={onShowToast}
        />
      </div>

      {/* FITUR JURNAL KESEHATAN HARIAN (SUASANA HATI, GEJALA FISIK, DIET TERINTEGRASI VITALS) */}
      <DailyHealthJournal
        patient={activeMember}
        onShowToast={onShowToast}
        onRunAiPrediction={onRunAiPrediction}
      />

      {/* FITUR PELACAK KESEJAHTERAAN MENTAL (MENTAL WELLNESS TRACKER) DENGAN TAMPILAN KALENDER & LOG MOOD KELUARGA */}
      <div id="mental-wellness-section">
        <MentalWellnessTracker
          members={members}
          activeMemberId={selectedMemberId}
          onSelectMember={onSelectMember}
          onShowToast={onShowToast}
        />
      </div>

      {/* FITUR PEMERIKSA GEJALA FISIK (SYMPTOM CHECKER) & TRIASE URGENSI KESEHATAN AI TERINTEGRASI EMERGENCYMODAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/30 shrink-0">
              <Stethoscope className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  Triase Medis AI Terpadu 119
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Pasien Aktif: <strong className="text-slate-800 dark:text-slate-200">{activeMember.name} ({activeMember.role})</strong>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Pemeriksa Gejala Fisik & Rekomendasi Urgensi Kesehatan AI
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Pilih gejala fisik yang dialami anggota keluarga Anda untuk mendapatkan rekomendasi tingkat urgensi kesehatan (Kode Merah, Kuning, atau Hijau) berbasis AI klinis. Terintegrasi langsung dengan <strong>EmergencyModal</strong> untuk panduan pertolongan pertama real-time dan dispatch ambulans 119.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onOpenSymptomChecker}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Buka Symptom Checker</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </button>

            {onTriggerEmergency && (
              <button
                type="button"
                onClick={() => onTriggerEmergency("Kondisi Darurat Akut / Suspek Kardiak", "chest_pain")}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Siren className="w-4 h-4 animate-bounce" />
                <span>Langsung Respon Darurat (119)</span>
              </button>
            )}
          </div>

        </div>

        {/* Quick Symptom Chips Preview */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap text-xs relative z-10">
          <span className="text-slate-400 text-[11px] font-semibold">Gejala Fisik Umum:</span>
          {["Nyeri Dada Menekan", "Sesak Napas", "Bicara Pelo / FAST", "Pusing Berputar", "Muntah Berulang", "Demam Tinggi"].map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={onOpenSymptomChecker}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300 border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium transition-colors cursor-pointer"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* BANNER INDEKS KINERJA FITCITY WILAYAH DAULAH ISLAMICITY */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-emerald-700/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                FITCity Daulah Islamicity #1
              </span>
              <span className="text-xs text-amber-300 font-bold">
                Skor 94.8 • Mumtaz (Teladan Terbaik)
              </span>
            </div>
            <h4 className="text-base font-black text-white mt-1">
              Wilayah Daulah Madinah Barat (LimoCity Hub)
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Keluarga Anda berkontribusi pada pencapaian tertinggi 5 pilar kebugaran fisik, kestabilan tanda vital, dan solidaritas infaq darurat se-Daulah Islamicity.
            </p>
          </div>
        </div>

        {onNavigateToFitCity && (
          <button
            onClick={onNavigateToFitCity}
            className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Landmark className="w-4 h-4" />
            <span>Lihat Seluruh Wilayah Daulah</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* PAPAN PERINGKAT KEBUGARAN KELUARGA (FAMILY LEADERBOARD & FRIENDLY COMPETITION) */}
      <FamilyLeaderboard
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={onSelectMember}
        onShowToast={onShowToast}
        onSyncWearable={onSyncWearable}
        isSyncing={isSyncing}
      />

      {/* FITUR SMART HEALTH GOALS DENGAN SISTEM NOTIFIKASI PENCAPAIAN BERBASIS AI */}
      <SmartHealthGoals
        patient={activeMember}
        onSyncWearable={onSyncWearable}
        isSyncing={isSyncing}
        onShowToast={onShowToast}
      />

      {/* FITUR PELACAKAN HEALTH GOALS MINGGUAN TERINTEGRASI WEARABLE */}
      <HealthGoalsTracker
        patient={activeMember}
        onSyncWearable={onSyncWearable}
        isSyncing={isSyncing}
        onShowToast={onShowToast}
      />

      {/* MODUL DAILY HEALTH TIPS BERBASIS AI (PERSONALISASI HARIAN ANGGOTA KELUARGA) */}
      <DailyHealthTips 
        patient={activeMember} 
        onShowToast={onShowToast} 
      />

    </div>
  );
};

