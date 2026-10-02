import React, { useState, useMemo } from "react";
import { 
  FamilyMember, 
  VitalComparisonMetric, 
  VitalMetricKey 
} from "../types";
import { 
  computeWeeklyVitalTrendReport 
} from "../utils/weeklyVitalTrends";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Activity, 
  Zap, 
  Droplet, 
  Moon, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Stethoscope,
  Calendar,
  Layers
} from "lucide-react";

interface WeeklyVitalTrendAnalysisProps {
  member: FamilyMember;
  onSyncWearable: () => void;
  isSyncing: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onRunAiPrediction?: () => void;
}

export const WeeklyVitalTrendAnalysis: React.FC<WeeklyVitalTrendAnalysisProps> = ({
  member,
  onSyncWearable,
  isSyncing,
  onShowToast,
  onRunAiPrediction,
}) => {
  // Active view: 'dual-comparison' (all vitals side-by-side) vs 'daily-timeline' (7-day timeline for selected vital)
  const [viewMode, setViewMode] = useState<"dual-comparison" | "daily-timeline">("dual-comparison");
  
  // Active category filter for comparison view
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Selected metric for the daily timeline 7-day bar chart
  const [selectedMetricKey, setSelectedMetricKey] = useState<VitalMetricKey>("heartRate");
  
  // Interactive tooltip state for hover/tap on daily bar
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Compute fresh report dynamically whenever member vitals or member changes
  const report = useMemo(() => {
    return computeWeeklyVitalTrendReport(member);
  }, [member, member.vitals]);

  // Filtered metrics for comparison view
  const filteredMetrics = useMemo(() => {
    if (categoryFilter === "all") return report.metrics;
    return report.metrics.filter(m => m.category === categoryFilter);
  }, [report.metrics, categoryFilter]);

  // Selected metric object for timeline view
  const currentSelectedMetric = useMemo(() => {
    return report.metrics.find(m => m.key === selectedMetricKey) || report.metrics[0];
  }, [report.metrics, selectedMetricKey]);

  // Helper for rendering corresponding metric icons
  const renderMetricIcon = (key: VitalMetricKey, className = "w-4 h-4") => {
    switch (key) {
      case "heartRate":
        return <Heart className={`${className} text-rose-500`} />;
      case "bloodPressureSystolic":
      case "bloodPressureDiastolic":
        return <Activity className={`${className} text-blue-500`} />;
      case "bloodGlucose":
        return <Zap className={`${className} text-amber-500`} />;
      case "spo2":
        return <Droplet className={`${className} text-cyan-500`} />;
      case "sleepHours":
        return <Moon className={`${className} text-indigo-500`} />;
      case "steps":
      case "activeCalories":
        return <Flame className={`${className} text-emerald-500`} />;
      case "stressLevel":
        return <ShieldAlert className={`${className} text-purple-500`} />;
      default:
        return <Activity className={className} />;
    }
  };

  // Helper for trend badge
  const renderTrendBadge = (metric: VitalComparisonMetric) => {
    const isUp = metric.trendDirection === "up";
    const isDown = metric.trendDirection === "down";
    const diffText = `${metric.diffPercentage > 0 ? "+" : ""}${metric.diffPercentage}%`;

    let badgeBg = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    let Icon = Minus;

    if (metric.clinicalStatus === "optimal" || metric.clinicalStatus === "improving") {
      badgeBg = "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80";
      Icon = isUp ? ArrowUpRight : ArrowDownRight;
    } else if (metric.clinicalStatus === "warning") {
      badgeBg = "bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80";
      Icon = isUp ? ArrowUpRight : ArrowDownRight;
    } else {
      badgeBg = "bg-teal-50 text-teal-700 border border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/80";
      Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${badgeBg}`}>
        <Icon className="w-3 h-3 shrink-0" />
        <span>{diffText}</span>
      </span>
    );
  };

  // Min, Max, and Avg for the 7-day timeline of selected metric
  const timelineStats = useMemo(() => {
    const values = currentSelectedMetric.daily7Days.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = currentSelectedMetric.historical7DayAvg;
    return { min, max, avg };
  }, [currentSelectedMetric]);

  // Max value scale for custom bar heights
  const maxBarValue = useMemo(() => {
    const values = currentSelectedMetric.daily7Days.map(d => d.value);
    const max = Math.max(...values, currentSelectedMetric.historical7DayAvg);
    return max * 1.15; // 15% head room
  }, [currentSelectedMetric]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Analisis Tren Kesehatan Mingguan</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  Data Saat Ini vs Rata-Rata 7 Hari
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Membandingkan telemetri biometrik real-time <span className="font-semibold text-slate-800 dark:text-slate-200">{member.name}</span> dengan baseline historis 7 hari terakhir.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Control & Sync Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              onClick={() => setViewMode("dual-comparison")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "dual-comparison"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Komparasi Metrik</span>
            </button>
            <button
              onClick={() => setViewMode("daily-timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "daily-timeline"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Grafik Batang 7 Hari</span>
            </button>
          </div>

          <button
            onClick={onSyncWearable}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all disabled:opacity-50 cursor-pointer"
            title="Sinkronisasi ulang telemetri untuk memperbarui komparasi 7 hari"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-emerald-500" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Menyinkronkan..." : "Perbarui Data"}</span>
          </button>
        </div>
      </div>

      {/* OVERALL WEEKLY STABILITY BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Tile */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${report.overallStabilityScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-slate-900 dark:text-white leading-none">
                {report.overallStabilityScore}
              </span>
              <span className="text-[9px] font-bold text-slate-500">/100</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Indeks Kestabilan Mingguan
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {report.stabilityLabel}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluasi: {report.evaluatedAt}
            </p>
          </div>
        </div>

        {/* Doctor & AI Clinical Summary */}
        <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Kesimpulan Klinis Longitudinal (7 Hari Terakhir)</span>
              </div>
              {onRunAiPrediction && (
                <button
                  onClick={onRunAiPrediction}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Uji Prediksi AI Lanjut</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {report.doctorAnalysisSummary}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>{report.keyStrengths[0]}</span>
            </span>
            {report.attentionPoints.length > 0 && report.attentionPoints[0] !== "Tidak ada anomali fluktuatif kritis terdeteksi dalam jendela evaluasi 7 hari terakhir." && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>{report.attentionPoints[0]}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DUAL COMPARISON (ALL METRICS SIDE-BY-SIDE BARS) */}
      {viewMode === "dual-comparison" && (
        <div className="space-y-4">
          
          {/* Category Filter Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Filter:</span>
              {[
                { id: "all", label: "Semua Metrik" },
                { id: "Kardiovaskular", label: "Kardiovaskular" },
                { id: "Metabolik", label: "Metabolik" },
                { id: "Aktivitas & Tidur", label: "Aktivitas & Tidur" },
                { id: "Stres & Pemulihan", label: "Stres & Relaksasi" },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 shadow-xs" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Saat Ini (Hari Ini)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-300 dark:bg-indigo-600" />
                <span>Rata-Rata 7 Hari</span>
              </div>
            </div>
          </div>

          {/* Grid of Interactive Bar Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMetrics.map(metric => {
              // Max calculation for bar width normalization
              const maxVal = Math.max(metric.currentValue, metric.historical7DayAvg) * 1.15;
              const currentPercent = Math.min(100, Math.max(12, (metric.currentValue / (maxVal || 1)) * 100));
              const avgPercent = Math.min(100, Math.max(12, (metric.historical7DayAvg / (maxVal || 1)) * 100));

              return (
                <div
                  key={metric.key}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3 group"
                >
                  {/* Top Bar: Icon, Label, Status, Delta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-xs">
                        {renderMetricIcon(metric.key)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{metric.label}</span>
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Rentang Acuan: {metric.normalRange}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {renderTrendBadge(metric)}
                    </div>
                  </div>

                  {/* Interactive Dual Horizontal Bar Comparison */}
                  <div className="space-y-2 pt-1">
                    
                    {/* Bar 1: Current (Hari Ini) */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Saat Ini (Hari Ini)</span>
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {metric.key === "steps" ? metric.currentValue.toLocaleString() : metric.currentValue} {metric.unit}
                        </span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md transition-all duration-700 ease-out shadow-xs"
                          style={{ width: `${currentPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Bar 2: Historical 7-Day Average */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Rata-Rata Historis 7 Hari
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {metric.key === "steps" ? metric.historical7DayAvg.toLocaleString() : metric.historical7DayAvg} {metric.unit}
                        </span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-indigo-300 dark:bg-indigo-600/80 rounded-md transition-all duration-700 ease-out"
                          style={{ width: `${avgPercent}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Clinical status & interpretation */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {metric.statusText}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedMetricKey(metric.key);
                        setViewMode("daily-timeline");
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-0.5 shrink-0 cursor-pointer"
                    >
                      <span>Lihat Grafik 7 Hari</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE 7-DAY DAY-BY-DAY BAR CHART TIMELINE */}
      {viewMode === "daily-timeline" && (
        <div className="space-y-5">
          
          {/* Metric Selector Pills for Timeline */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 shrink-0">
              Pilih Metrik:
            </span>
            {report.metrics.map(metric => {
              const isSelected = metric.key === selectedMetricKey;
              return (
                <button
                  key={metric.key}
                  onClick={() => {
                    setSelectedMetricKey(metric.key);
                    setHoveredDayIndex(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {renderMetricIcon(metric.key, "w-3.5 h-3.5")}
                  <span>{metric.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Chart Container */}
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            
            {/* Chart Header with Selected Metric Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-xs">
                  {renderMetricIcon(currentSelectedMetric.key, "w-5 h-5")}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Grafik Batang 7 Hari: {currentSelectedMetric.label}</span>
                    {renderTrendBadge(currentSelectedMetric)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nilai Acuan Ideal: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentSelectedMetric.normalRange}</span>
                  </p>
                </div>
              </div>

              {/* Benchmark Legend */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                  <span>Hari Ini</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-600" />
                  <span>Hari Sebelumnya</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-b-2 border-dashed border-indigo-500 dark:border-indigo-400" />
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Garis Rata-Rata ({currentSelectedMetric.historical7DayAvg} {currentSelectedMetric.unit})</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE VERTICAL BAR CHART AREA */}
            <div className="relative pt-6 pb-2">
              
              {/* Average Reference Line (Horizontal Dashed) */}
              <div 
                className="absolute inset-x-0 border-b-2 border-dashed border-indigo-400 dark:border-indigo-500 z-10 pointer-events-none transition-all duration-500"
                style={{
                  bottom: `${Math.min(92, Math.max(8, (currentSelectedMetric.historical7DayAvg / maxBarValue) * 200))}px`,
                }}
              >
                <div className="absolute right-0 -top-3.5 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                  Avg: {currentSelectedMetric.historical7DayAvg} {currentSelectedMetric.unit}
                </div>
              </div>

              {/* Bar Columns Grid */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 h-52 items-end border-b border-slate-200 dark:border-slate-700 pb-2 relative z-20">
                {currentSelectedMetric.daily7Days.map((item, idx) => {
                  const heightPercent = Math.min(100, Math.max(10, (item.value / maxBarValue) * 100));
                  const isToday = item.isCurrentDay;
                  const isHovered = hoveredDayIndex === idx;
                  const diffFromAvg = Number((item.value - currentSelectedMetric.historical7DayAvg).toFixed(1));

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      onMouseEnter={() => setHoveredDayIndex(idx)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                      onClick={() => setHoveredDayIndex(idx === hoveredDayIndex ? null : idx)}
                    >
                      {/* Interactive Hover Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-16 z-30 bg-slate-950 text-white dark:bg-white dark:text-slate-900 rounded-lg py-1.5 px-2.5 shadow-xl text-center pointer-events-none whitespace-nowrap text-[11px] animate-in fade-in zoom-in-95 duration-150">
                          <p className="font-extrabold">
                            {currentSelectedMetric.key === "steps" ? item.value.toLocaleString() : item.value} {currentSelectedMetric.unit}
                          </p>
                          <p className="text-[9px] opacity-80">
                            {diffFromAvg >= 0 ? `+${diffFromAvg}` : diffFromAvg} vs Rata-Rata
                          </p>
                          <div className="w-2 h-2 bg-slate-950 dark:bg-white rotate-45 mx-auto -mb-2 mt-1" />
                        </div>
                      )}

                      {/* Top value label */}
                      <span className={`text-[10px] font-bold mb-1 transition-all ${
                        isToday
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isHovered
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400"
                      }`}>
                        {currentSelectedMetric.key === "steps" ? `${Math.round(item.value / 1000)}k` : item.value}
                      </span>

                      {/* Bar Fill */}
                      <div className="w-full max-w-[36px] bg-slate-200/60 dark:bg-slate-700/60 rounded-t-lg h-full flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isToday
                              ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/40"
                              : isHovered
                              ? "bg-slate-500 dark:bg-slate-400"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Bottom Day Label */}
                      <div className="mt-2 text-center">
                        <p className={`text-[11px] font-bold truncate max-w-[48px] ${
                          isToday ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"
                        }`}>
                          {isToday ? "Hari Ini" : item.dayLabel.split(" ")[0]}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {item.dateShort}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom 3-Tile Statistical Summary */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-500">Nilai Terendah (7 Hari)</span>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {currentSelectedMetric.key === "steps" ? timelineStats.min.toLocaleString() : timelineStats.min} {currentSelectedMetric.unit}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-center">
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Rata-Rata 7 Hari</span>
                <p className="text-sm font-black text-indigo-900 dark:text-indigo-200 mt-0.5">
                  {currentSelectedMetric.key === "steps" ? timelineStats.avg.toLocaleString() : timelineStats.avg} {currentSelectedMetric.unit}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Saat Ini (Hari Ini)</span>
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {currentSelectedMetric.key === "steps" ? currentSelectedMetric.currentValue.toLocaleString() : currentSelectedMetric.currentValue} {currentSelectedMetric.unit}
                </p>
              </div>
            </div>

            {/* Actionable Clinical Recommendation for Selected Metric */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs">
              <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-slate-900 dark:text-white">Interpretasi Klinis: </span>
                <span className="text-slate-600 dark:text-slate-300">{currentSelectedMetric.clinicalInterpretation} </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Saran: {currentSelectedMetric.actionRecommendation}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sensor Wearable: <strong className="text-slate-700 dark:text-slate-300">{member.connectedWearable.deviceName}</strong> ({member.connectedWearable.brand})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onShowToast) {
                onShowToast(`Laporan tren 7 hari untuk ${member.name} berhasil disiapkan untuk dokter spesialis.`, "success");
              }
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold transition-all cursor-pointer"
          >
            Kirim Ringkasan Tren ke Dokter
          </button>
        </div>
      </div>

    </div>
  );
};
