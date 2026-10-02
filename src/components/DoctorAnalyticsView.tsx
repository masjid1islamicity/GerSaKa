import React, { useState, useMemo } from "react";
import { FamilyMember } from "../types";
import { 
  Stethoscope, 
  TrendingUp, 
  Activity, 
  Heart, 
  Moon, 
  Flame, 
  Calendar, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Clock,
  ShieldCheck,
  Droplet,
  Eye,
  Sliders,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { generateLongTermVitalTrends, VitalTrendPoint, VitalStatsSummary } from "../utils/healthTrendsData";

interface DoctorAnalyticsViewProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onOpenExport: () => void;
  onOpenTeleconsult: () => void;
}

type TrendMetricTab = "all" | "bp" | "hr" | "spo2";

export const DoctorAnalyticsView: React.FC<DoctorAnalyticsViewProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onOpenExport,
  onOpenTeleconsult,
}) => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [activeMetricTab, setActiveMetricTab] = useState<TrendMetricTab>("all");
  const [showClinicalThresholds, setShowClinicalThresholds] = useState<boolean>(true);
  const [clinicalNote, setClinicalNote] = useState(
    "Pasien menunjukkan adaptasi fisiologis yang positif terhadap terapi relaksasi vaskular LimoCity. Tekanan darah rata-rata sistolik mengalami penurunan stabil selama masa observasi. Saturasi oksigen (SPO2) konsisten di atas 97%. Disarankan meneruskan dosis rumatan dan olahraga aerobik ringan 30 menit."
  );
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  const activeMember = members.find(m => m.id === selectedMemberId) || members[0];

  // Generate deterministic long-term health trends for the selected member and timeframe
  const { data: trendData, summary: trendSummary } = useMemo(() => {
    return generateLongTermVitalTrends(activeMember, timeRange);
  }, [activeMember, timeRange]);

  const handleSaveNote = () => {
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2500);
  };

  // Custom Recharts Tooltip for Medical Data
  const CustomMedicalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as VitalTrendPoint;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 min-w-52 z-50">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold text-slate-200">{dataPoint.fullDate || label}</span>
            <span className="text-[10px] text-teal-400 font-mono">Telemetri Wearable</span>
          </div>

          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const name = entry.name;
              const value = entry.value;
              const color = entry.color;

              let unit = "";
              let statusText = "";

              if (name.includes("Sistolik")) {
                unit = "mmHg";
                statusText = value < 120 ? "Optimal" : value < 130 ? "Normal" : value < 140 ? "Pre-HT" : "Tinggi";
              } else if (name.includes("Diastolik")) {
                unit = "mmHg";
                statusText = value < 80 ? "Optimal" : value < 85 ? "Normal" : "Tinggi";
              } else if (name.includes("Jantung")) {
                unit = "BPM";
                statusText = value < 60 ? "Bradikardia" : value <= 100 ? "Normal Sinus" : "Takikardia";
              } else if (name.includes("SPO2")) {
                unit = "%";
                statusText = value >= 96 ? "Optimal" : value >= 94 ? "Cukup" : "Perhatian";
              }

              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-slate-300">{name}:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black font-mono text-white">
                      {value} {unit}
                    </span>
                    {statusText && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {statusText}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {dataPoint.notes && (
            <div className="pt-1 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{dataPoint.notes}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden border border-teal-600/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-teal-200 border border-white/20 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              Rekam Medis Longitudinal • Recharts Visualization
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Analitik Tren Fisiologis LimoCity
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Dasbor Analitik Klinis & Tren Biomarker</span>
          </h2>
          <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
            Visualisasi grafik interaktif tren jangka panjang denyut jantung (HR), dinamika kurva tekanan darah (BP), dan saturasi oksigen darah (SPO2) untuk evaluasi medis spesialis dan pencegahan risiko kardiovaskular.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10 flex-wrap">
          <button
            onClick={onOpenTeleconsult}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-slate-950" />
            <span>Mulai Telekonsultasi</span>
          </button>
          <button
            onClick={onOpenExport}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor PDF Medis</span>
          </button>
        </div>
      </div>

      {/* Cohort Selector & Time Horizon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">Pasien:</span>
          {members.map(member => (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                member.id === activeMember.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span>{member.name}</span>
              <span className="text-[10px] opacity-75">({member.role})</span>
            </button>
          ))}
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <span className="text-[11px] font-bold text-slate-400 px-2 hidden md:inline">Rentang Waktu:</span>
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === "7d" ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === "30d" ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === "90d" ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            90 Hari (Kuartal)
          </button>
        </div>
      </div>

      {/* STATISTICAL BIOMARKER SUMMARY CARDS (LONG-TERM STATS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Blood Pressure Summary */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Tekanan Darah (Rata-rata)</span>
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
              trendSummary.statusBp === "optimal"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : trendSummary.statusBp === "normal"
                ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              {trendSummary.statusBp}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {trendSummary.avgSystolic}/{trendSummary.avgDiastolic}
              <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
            </div>
            {trendSummary.improvementRateBp > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-{trendSummary.improvementRateBp}%</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Rentang: {trendSummary.minSystolic}-{trendSummary.maxSystolic} mmHg</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">Target: &lt;130/80</span>
          </div>
        </div>

        {/* Heart Rate Summary */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Denyut Jantung (HR)</span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Normal Sinus
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {trendSummary.avgHeartRate}
              <span className="text-xs font-normal text-slate-400 ml-1">BPM</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Min {trendSummary.minHeartRate} • Max {trendSummary.maxHeartRate}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Stabilitas Irama: 98.6%</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">Zona Istirahat</span>
          </div>
        </div>

        {/* Blood Oxygen Saturation (SPO2) Summary */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-cyan-500" />
              <span>Saturasi Oksigen (SPO2)</span>
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
              trendSummary.statusSpo2 === "optimal"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
            }`}>
              {trendSummary.statusSpo2}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {trendSummary.avgSpo2}
              <span className="text-xs font-normal text-slate-400 ml-1">%</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Optimal &gt;95%
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Titik Terendah: {trendSummary.minSpo2}%</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">Perfusi Normal</span>
          </div>
        </div>

        {/* Wearable Sync & Clinical Readiness */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Kepatuhan Terapi & Wearable</span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Aktif
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {trendData.length}
              <span className="text-xs font-normal text-slate-400 ml-1">Hari Tercatat</span>
            </div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
              100% Kontinu
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="truncate">{activeMember.connectedWearable.deviceName}</span>
            <span className="text-emerald-600 font-bold shrink-0">Live</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* PRIMARY 'HEALTH TRENDS' RECHARTS COMPONENT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        
        {/* Chart Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Grafik Tren Kesehatan (Health Trends)</span>
                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    — {activeMember.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visualisasi Recharts tren jangka panjang tanda vital ({trendData.length} titik observasi longitudinal)
                </p>
              </div>
            </div>
          </div>

          {/* Metric Filter Tabs & Clinical Threshold Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[
                { id: "all", label: "Semua Metrik", icon: Activity },
                { id: "bp", label: "Tekanan Darah (BP)", icon: Activity },
                { id: "hr", label: "Denyut Jantung (HR)", icon: Heart },
                { id: "spo2", label: "Oksigen (SPO2)", icon: Droplet },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeMetricTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMetricTab(tab.id as TrendMetricTab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Clinical Threshold Lines Toggle */}
            <button
              onClick={() => setShowClinicalThresholds(!showClinicalThresholds)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showClinicalThresholds
                  ? "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              title="Tampilkan / sembunyikan garis batas klinis normal"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Garis Target Klinis</span>
            </button>

          </div>
        </div>

        {/* 1. COMPREHENSIVE MULTI-METRIC OR SPECIFIC METRIC RECHARTS VISUALIZATION */}
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetricTab === "all" ? (
              // Multi-Metric Synchronized Trend Chart (Dual Y-Axis: Left for BP/HR in mmHg/BPM, Right for SPO2 in %)
              <LineChart data={trendData} margin={{ top: 15, right: 25, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="sysGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "#94a3b8" }} 
                  tickLine={{ stroke: "#94a3b8" }}
                  interval={timeRange === "90d" ? 12 : timeRange === "30d" ? 4 : 0}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[50, 160]} 
                  tick={{ fontSize: 11, fill: "#94a3b8" }} 
                  tickLine={{ stroke: "#94a3b8" }}
                  unit=" "
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[90, 100]} 
                  tick={{ fontSize: 11, fill: "#06b6d4" }} 
                  tickLine={{ stroke: "#06b6d4" }}
                  unit="%"
                />
                <Tooltip content={<CustomMedicalTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  iconType="circle"
                />

                {showClinicalThresholds && (
                  <>
                    <ReferenceLine yAxisId="left" y={130} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Target Sistolik <130", fill: "#f59e0b", fontSize: 10, position: "insideTopLeft" }} />
                    <ReferenceLine yAxisId="right" y={95} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: "Batas Normal SPO2 95%", fill: "#06b6d4", fontSize: 10, position: "insideBottomRight" }} />
                  </>
                )}

                {/* Blood Pressure: Systolic Line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="systolic"
                  name="Tekanan Darah Sistolik"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={timeRange === "7d" ? { r: 4, fill: "#2563eb", strokeWidth: 1.5, stroke: "#fff" } : false}
                  activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                />

                {/* Blood Pressure: Diastolic Line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="diastolic"
                  name="Tekanan Darah Diastolik"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={timeRange === "7d" ? { r: 3, fill: "#3b82f6" } : false}
                  activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff" }}
                />

                {/* Heart Rate Line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="heartRate"
                  name="Denyut Jantung (HR)"
                  stroke="#f43f5e"
                  strokeWidth={2.2}
                  dot={timeRange === "7d" ? { r: 3, fill: "#f43f5e" } : false}
                  activeDot={{ r: 5, fill: "#f43f5e", stroke: "#fff" }}
                />

                {/* Oxygen Saturation Line */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="spo2"
                  name="Saturasi Oksigen (SPO2)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={timeRange === "7d" ? { r: 3, fill: "#06b6d4" } : false}
                  activeDot={{ r: 5, fill: "#06b6d4", stroke: "#fff" }}
                />
              </LineChart>
            ) : activeMetricTab === "bp" ? (
              // Dedicated Blood Pressure Area & Line Chart
              <AreaChart data={trendData} margin={{ top: 15, right: 25, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="bpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={timeRange === "90d" ? 12 : timeRange === "30d" ? 4 : 0} />
                <YAxis domain={[60, 160]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" mmHg" />
                <Tooltip content={<CustomMedicalTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

                {showClinicalThresholds && (
                  <>
                    <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Target Optimal (120 mmHg)", fill: "#10b981", fontSize: 10, position: "insideBottomLeft" }} />
                    <ReferenceLine y={130} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Batas Pre-Hipertensi (130 mmHg)", fill: "#f59e0b", fontSize: 10, position: "insideBottomLeft" }} />
                    <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Hipertensi Derajat 1 (140 mmHg)", fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
                  </>
                )}

                <Area type="monotone" dataKey="systolic" name="Tekanan Darah Sistolik" stroke="#2563eb" fill="url(#bpAreaGrad)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="diastolic" name="Tekanan Darah Diastolik" stroke="#60a5fa" strokeWidth={2} strokeDasharray="3 3" />
              </AreaChart>
            ) : activeMetricTab === "hr" ? (
              // Dedicated Heart Rate & Rhythm Stability Chart
              <AreaChart data={trendData} margin={{ top: 15, right: 25, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="hrAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={timeRange === "90d" ? 12 : timeRange === "30d" ? 4 : 0} />
                <YAxis domain={[50, 110]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit=" BPM" />
                <Tooltip content={<CustomMedicalTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

                {showClinicalThresholds && (
                  <>
                    <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Batas Bawah Normal (60 BPM)", fill: "#10b981", fontSize: 10, position: "insideBottomLeft" }} />
                    <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Batas Takikardia (100 BPM)", fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
                  </>
                )}

                <Area type="monotone" dataKey="heartRate" name="Denyut Jantung (BPM)" stroke="#f43f5e" fill="url(#hrAreaGrad)" strokeWidth={2.5} />
              </AreaChart>
            ) : (
              // Dedicated SPO2 Oxygen Saturation Chart
              <AreaChart data={trendData} margin={{ top: 15, right: 25, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="spo2AreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={timeRange === "90d" ? 12 : timeRange === "30d" ? 4 : 0} />
                <YAxis domain={[92, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                <Tooltip content={<CustomMedicalTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

                {showClinicalThresholds && (
                  <>
                    <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Ambang Batas Sehat (95%)", fill: "#10b981", fontSize: 10, position: "insideBottomLeft" }} />
                    <ReferenceLine y={94} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Peringatan Hipoksemia Ringan (<94%)", fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
                  </>
                )}

                <Area type="monotone" dataKey="spo2" name="Saturasi Oksigen SPO2 (%)" stroke="#06b6d4" fill="url(#spo2AreaGrad)" strokeWidth={2.5} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Clinical Interpretation & Legend Note Footer */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-white">Interpretasi Dokter Spesialis: </span>
              <span>
                Kurva biomarker pasien menunjukkan kestabilan hemodinamik yang konsisten. 
                {trendSummary.improvementRateBp > 0 
                  ? ` Terjadi penurunan tekanan sistolik sebesar ${trendSummary.improvementRateBp}% seiring kepatuhan jadwal obat dan terapi sirkadian LimoCity.` 
                  : " Tanda vital berada dalam rentang toleransi fisiologis normal."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] font-bold">
            <span className="text-blue-600 dark:text-blue-400">● Sistolik & Diastolik</span>
            <span className="text-rose-500">● HR (BPM)</span>
            <span className="text-cyan-600 dark:text-cyan-400">● SPO2 (%)</span>
          </div>
        </div>

      </div>

      {/* Sleep Architecture & Biomarker Radar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sleep Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Arsitektur Siklus Tidur
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400">Deep Sleep (Tidur Nyenyak)</span>
                <span className="font-bold text-slate-900 dark:text-white">1 Jam 50 Mnt (26%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[26%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400">REM Sleep (Fase Mimpi)</span>
                <span className="font-bold text-slate-900 dark:text-white">1 Jam 35 Mnt (22%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[22%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400">Light Sleep (Tidur Ringan)</span>
                <span className="font-bold text-slate-900 dark:text-white">3 Jam 40 Mnt (48%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full w-[48%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Physical Activity & Steps Compliance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Kebugaran & Volume Langkah
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-600 dark:text-slate-400">Rata-rata Harian:</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeMember.vitals.steps.toLocaleString()} Langkah
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-slate-600 dark:text-slate-400">Pencapaian Target:</span>
              <span className="font-bold text-emerald-600">105% Tercapai</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              Aktivitas fisik teratur mendukung perbaikan elastisitas vaskular dan kelenturan sendi pasien.
            </p>
          </div>
        </div>

        {/* Doctor Clinical Notes Editor */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Catatan Dokter & Rekomendasi Terapi
              </h4>
            </div>
            {isNoteSaved && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Tersimpan
              </span>
            )}
          </div>
          <textarea
            value={clinicalNote}
            onChange={e => setClinicalNote(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 leading-relaxed"
          />
          <button
            onClick={handleSaveNote}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Simpan ke Rekam Medis Pasien
          </button>
        </div>

      </div>

    </div>
  );
};
