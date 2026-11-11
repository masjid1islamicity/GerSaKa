import React, { useState, useMemo } from "react";
import { FamilyMember } from "../types";
import { 
  buildFamilyComparisonDataset, 
  computeMemberExerciseSummary,
  MemberExerciseTrendSummary,
  DailyExerciseRecord 
} from "../utils/exerciseTrends";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  Flame,
  Trophy,
  Dumbbell,
  Target,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Share2,
  Check,
  Watch,
  Info,
  Heart,
  Zap,
  BarChart3,
  LineChart as LineChartIcon
} from "lucide-react";
import { fireBadgeCelebrationConfetti } from "../utils/confetti";

interface WeeklyExerciseTrendChartProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onNavigateToBerjaga?: () => void;
  onNavigateToGoals?: () => void;
}

export const WeeklyExerciseTrendChart: React.FC<WeeklyExerciseTrendChartProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onSyncWearable,
  isSyncing = false,
  onShowToast,
  onNavigateToBerjaga,
  onNavigateToGoals,
}) => {
  // Mode: 'comparison' (all members) vs 'individual' (single member focus)
  const [viewMode, setViewMode] = useState<"comparison" | "individual">("comparison");

  // Chart type: 'area' | 'bar' | 'line'
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");

  // Multi-member visibility filter (all member IDs initially active)
  const [activeMemberIds, setActiveMemberIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    members.forEach((m) => {
      initial[m.id] = true;
    });
    return initial;
  });

  // Selected day index in individual mode (0 to 6)
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6);

  // Copy status
  const [hasCopiedReport, setHasCopiedReport] = useState(false);

  // Compute dataset
  const dataset = useMemo(() => {
    return buildFamilyComparisonDataset(members);
  }, [members]);

  // Current active member summary
  const activeMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  const activeSummary = useMemo(() => {
    return computeMemberExerciseSummary(activeMember);
  }, [activeMember]);

  // Toggle member in comparison
  const toggleMemberVisibility = (mId: string) => {
    setActiveMemberIds((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      // Prevent hiding all members
      if (prev[mId] && activeCount <= 1) {
        if (onShowToast) onShowToast("Minimal satu anggota keluarga harus tetap aktif ditampilkan.", "warning");
        return prev;
      }
      return { ...prev, [mId]: !prev[mId] };
    });
  };

  // Copy weekly report summary
  const handleCopyReport = () => {
    const lines = [
      `📊 *LAPORAN TREN DURASI OLAHRAGA KELUARGA (7 HARI TERAKHIR)*`,
      `• Total Latihan Keluarga: ${dataset.familyTotalMinutes} menit (~${(dataset.familyTotalMinutes / 60).toFixed(1)} jam)`,
      `• Rata-rata Harian Keluarga: ${dataset.familyAvgDailyMinutes} menit/hari`,
      `• Tingkat Kepatuhan Target: ${dataset.familyComplianceRate}%`,
      `• MVP Kebugaran Minggu Ini: ${dataset.mvpMember.memberName} (${dataset.mvpMember.totalWeekMinutes} menit)`,
      ``,
      `*Rincian Per Anggota Keluarga:*`,
      ...dataset.summaries.map(
        (s) =>
          `• ${s.role} (${s.memberName}): Total ${s.totalWeekMinutes} mnt | Rata-rata ${s.avgDailyMinutes} mnt/hari | Kepatuhan ${s.targetMetDaysCount}/7 hari (${s.targetMetPercent}%) | Wearable: ${s.wearableName}`
      ),
      ``,
      `Dipantau otomatis via GerSaKa Platform & Telemetri Wearable Smart Sensor.`,
    ];

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setHasCopiedReport(true);
      if (onShowToast) onShowToast("Ringkasan tren durasi olahraga keluarga disalin ke papan klip!", "success");
      fireBadgeCelebrationConfetti();
      setTimeout(() => setHasCopiedReport(false), 3000);
    });
  };

  // Custom Tooltip for Multi-Member Comparison
  const CustomComparisonTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0]?.payload;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl min-w-[240px] text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{point?.dayFull}, {point?.dateStr} 2026</span>
          </div>
          {point?.isToday && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
              Hari Ini
            </span>
          )}
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {dataset.summaries
            .filter((s) => activeMemberIds[s.memberId])
            .map((s) => {
              const minutes = (point?.[s.memberId] as number) || 0;
              const isMet = minutes >= s.dailyTarget;
              const cal = (point?.[`${s.memberId}_cal`] as number) || 0;
              const workoutType = (point?.[`${s.memberId}_type`] as string) || "";

              return (
                <div
                  key={s.memberId}
                  className="flex items-center justify-between gap-3 p-1.5 rounded-lg bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.colorHex }}
                    />
                    <img
                      src={s.avatarUrl}
                      alt={s.memberName}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-white text-[11px] truncate">
                        {s.role} ({s.memberName.split(" ")[0]})
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">
                        {workoutType}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="font-extrabold text-white text-xs">
                        {minutes}
                      </span>
                      <span className="text-[10px] text-slate-400">mnt</span>
                      {isMet ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span className="text-[9px] text-amber-400 font-semibold">
                          ({minutes - s.dailyTarget})
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {cal} kkal
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Standar WHO: 30 mnt</span>
          <span className="text-emerald-400">Target Wearable Aktif</span>
        </div>
      </div>
    );
  };

  // Custom Tooltip for Individual Focus
  const CustomIndividualTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const rec = payload[0]?.payload as DailyExerciseRecord;
    if (!rec) return null;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700 shadow-xl min-w-[210px] text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-bold text-slate-200">
            {rec.dayFull}, {rec.dateStr}
          </span>
          {rec.isToday && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950">
              Hari Ini
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Durasi Olahraga:</span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {rec.minutes} menit
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Harian:</span>
            <span className="text-slate-200 font-semibold">{rec.targetMinutes} menit</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status Pencapaian:</span>
            <span
              className={`font-bold ${
                rec.isTargetMet ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {rec.isTargetMet ? "✓ Target Terpenuhi" : "Belum Memenuhi Target"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Kalori Terbakar:</span>
            <span className="text-amber-300 font-semibold">{rec.caloriesBurned} kkal</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Detak Jantung:</span>
            <span className="text-rose-300 font-semibold">{rec.avgHeartRateBpm} BPM</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-300 italic truncate">
          {rec.workoutType}
        </div>
      </div>
    );
  };

  const selectedRecord = activeSummary.weeklyRecords[selectedDayIdx] || activeSummary.weeklyRecords[6];

  return (
    <div id="exercise-duration-trends-section" className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/30 shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                Telemetri Recharts Real-Time
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Pilar Bergerak • 7 Hari Terakhir
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Tren Durasi Olahraga Keluarga</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                7 Hari (Menit)
              </span>
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Pantau kepatuhan latihan fisik seluruh anggota keluarga dari sensor smartwatch vs standar kebugaran WHO (30 mnt/hari) dan target personal keluarga.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {onSyncWearable && (
            <button
              type="button"
              onClick={onSyncWearable}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Sinkronisasi sensor wearable terbaru"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menyinkronkan..." : "Sinkron Wearable"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Salin ringkasan ke papan klip"
          >
            {hasCopiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Laporan</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 2. Family Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Total Exercise Minutes */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Latihan 7 Hari
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {dataset.familyTotalMinutes}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Menit</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            ≈ {(dataset.familyTotalMinutes / 60).toFixed(1)} Jam olahraga gabungan
          </p>
        </div>

        {/* Daily Family Average */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 to-cyan-50/40 dark:from-teal-950/30 dark:to-cyan-950/20 border border-teal-200/80 dark:border-teal-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              Rata-rata Harian
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {dataset.familyAvgDailyMinutes}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mnt/Jiwa/Hari</span>
          </div>
          <p className="mt-1 text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            <span>Melampaui WHO ({dataset.familyAvgDailyMinutes - 30 > 0 ? `+${dataset.familyAvgDailyMinutes - 30}` : 0} mnt)</span>
          </p>
        </div>

        {/* Target Compliance Rate */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-yellow-50/40 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Kepatuhan Target
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {dataset.familyComplianceRate}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tercapai</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
            Konsistensi Kebugaran Tinggi
          </p>
        </div>

        {/* MVP Member */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/40 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
              MVP Kebugaran
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <img
              src={dataset.mvpMember.avatarUrl}
              alt={dataset.mvpMember.memberName}
              className="w-8 h-8 rounded-full object-cover border border-purple-300 dark:border-purple-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                {dataset.mvpMember.memberName}
              </p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                {dataset.mvpMember.totalWeekMinutes} mnt ({dataset.mvpMember.role})
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. View Switcher & Chart Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("comparison")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "comparison"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Bandingkan Seluruh Keluarga
          </button>
          <button
            type="button"
            onClick={() => setViewMode("individual")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "individual"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Fokus Anggota Terpilih
          </button>
        </div>

        {/* Chart Type Toggle & Individual Member Picker */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grafik Area Gradien"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grafik Batang Kolom"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === "line"
                  ? "bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grafik Garis Tren"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Member selector dropdown if in individual mode */}
          {viewMode === "individual" && (
            <select
              value={selectedMemberId}
              onChange={(e) => onSelectMember(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.role}: {m.name}
                </option>
              ))}
            </select>
          )}

        </div>

      </div>

      {/* 4. Filter Chips for Comparison Mode */}
      {viewMode === "comparison" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
            Tampilkan:
          </span>
          {dataset.summaries.map((s) => {
            const isVisible = !!activeMemberIds[s.memberId];
            return (
              <button
                key={s.memberId}
                type="button"
                onClick={() => toggleMemberVisibility(s.memberId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  isVisible
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-xs"
                    : "opacity-40 bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-800 hover:opacity-75"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.colorHex }}
                />
                <img
                  src={s.avatarUrl}
                  alt={s.memberName}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span>{s.role}</span>
                <span className="text-[10px] font-normal text-slate-500">
                  ({s.avgDailyMinutes} mnt/hari)
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 5. Main Recharts Visualization Canvas */}
      <div className="bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
        
        {/* Top Info Bar within Chart */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {viewMode === "comparison"
                ? "Kurva Durasi Olahraga Komparatif (5 Anggota Keluarga)"
                : `Tren Durasi Olahraga: ${activeMember.name} (${activeMember.role})`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
              <span>WHO (30 mnt)</span>
            </span>
            {viewMode === "individual" && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-3 h-0.5 border-t-2 border-emerald-500" />
                <span>Target ({activeSummary.dailyTarget} mnt)</span>
              </span>
            )}
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full h-[320px] sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "comparison" ? (
              // MULTI-MEMBER COMPARISON CHART
              chartType === "area" ? (
                <AreaChart
                  data={dataset.dataPoints}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    {dataset.summaries.map((s) => (
                      <linearGradient
                        key={`grad_${s.memberId}`}
                        id={`grad_${s.memberId}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={s.colorHex} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={s.colorHex} stopOpacity={0.0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="dayShort"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                    unit="m"
                  />
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <ReferenceLine
                    y={30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  {dataset.summaries.map((s) => {
                    if (!activeMemberIds[s.memberId]) return null;
                    return (
                      <Area
                        key={s.memberId}
                        type="monotone"
                        dataKey={s.memberId}
                        name={s.role}
                        stroke={s.colorHex}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill={`url(#grad_${s.memberId})`}
                        activeDot={{ r: 6, stroke: s.colorHex, strokeWidth: 2, fill: "#fff" }}
                      />
                    );
                  })}
                </AreaChart>
              ) : chartType === "bar" ? (
                <BarChart
                  data={dataset.dataPoints}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="dayShort"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                    unit="m"
                  />
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <ReferenceLine
                    y={30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  {dataset.summaries.map((s) => {
                    if (!activeMemberIds[s.memberId]) return null;
                    return (
                      <Bar
                        key={s.memberId}
                        dataKey={s.memberId}
                        name={s.role}
                        fill={s.colorHex}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={22}
                      />
                    );
                  })}
                </BarChart>
              ) : (
                <LineChart
                  data={dataset.dataPoints}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="dayShort"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                    unit="m"
                  />
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <ReferenceLine
                    y={30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  {dataset.summaries.map((s) => {
                    if (!activeMemberIds[s.memberId]) return null;
                    return (
                      <Line
                        key={s.memberId}
                        type="monotone"
                        dataKey={s.memberId}
                        name={s.role}
                        stroke={s.colorHex}
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 1.5, fill: "#fff" }}
                        activeDot={{ r: 7, stroke: s.colorHex, strokeWidth: 2, fill: "#fff" }}
                      />
                    );
                  })}
                </LineChart>
              )
            ) : (
              // SINGLE MEMBER INDIVIDUAL FOCUS CHART
              chartType === "bar" ? (
                <BarChart
                  data={activeSummary.weeklyRecords}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="dayShort"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                    unit="m"
                  />
                  <Tooltip content={<CustomIndividualTooltip />} />
                  <ReferenceLine
                    y={30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: "WHO 30m", position: "insideTopLeft", fill: "#f59e0b", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={activeSummary.dailyTarget}
                    stroke={activeSummary.colorHex}
                    strokeWidth={1.5}
                    label={{ value: `Target ${activeSummary.dailyTarget}m`, position: "insideTopRight", fill: activeSummary.colorHex, fontSize: 10 }}
                  />
                  <Bar
                    dataKey="minutes"
                    name="Durasi Olahraga"
                    fill={activeSummary.colorHex}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={activeSummary.weeklyRecords}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="singleMemberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeSummary.colorHex} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeSummary.colorHex} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="dayShort"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={{ stroke: "#64748b", opacity: 0.2 }}
                    unit="m"
                  />
                  <Tooltip content={<CustomIndividualTooltip />} />
                  <ReferenceLine
                    y={30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <ReferenceLine
                    y={activeSummary.dailyTarget}
                    stroke={activeSummary.colorHex}
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    name="Durasi Olahraga"
                    stroke={activeSummary.colorHex}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#singleMemberGrad)"
                    activeDot={{ r: 7, stroke: activeSummary.colorHex, strokeWidth: 2, fill: "#fff" }}
                  />
                </AreaChart>
              )
            )}
          </ResponsiveContainer>
        </div>

      </div>

      {/* 6. Individual Day Breakdown or Member Performance Cards */}
      {viewMode === "individual" ? (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Rincian Harian 7 Hari ({activeMember.name})
            </h3>
            <span className="text-xs text-slate-500">
              Pilih hari untuk melihat detail latihan
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {activeSummary.weeklyRecords.map((rec, idx) => {
              const isSelected = selectedDayIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {rec.dayShort}
                    </span>
                    {rec.isToday ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    ) : rec.isTargetMet ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {rec.minutes}
                    </span>
                    <span className="text-[10px] text-slate-400">mnt</span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {rec.caloriesBurned} kkal
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Day Drill-down Card */}
          {selectedRecord && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-slate-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {selectedRecord.fullDate}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedRecord.isTargetMet
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {selectedRecord.isTargetMet ? "✓ Target Terpenuhi" : "Di Bawah Target"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Aktivitas: <strong>{selectedRecord.workoutType}</strong>
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Kardio: <strong>{selectedRecord.cardioMinutes} mnt</strong></span>
                  <span>Mobilitas: <strong>{selectedRecord.mobilityMinutes} mnt</strong></span>
                  <span>Sunnah/Jalan: <strong>{selectedRecord.sunnahMinutes} mnt</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Detak Jantung</p>
                  <p className="text-base font-black text-rose-500">{selectedRecord.avgHeartRateBpm} BPM</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Kalori Terbakar</p>
                  <p className="text-base font-black text-amber-500">{selectedRecord.caloriesBurned} kkal</p>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        // Multi-member Performance Summary Table
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Rekapitulasi Kebugaran 7 Hari Per Anggota
            </h3>
            <span className="text-xs text-slate-500">
              Klik anggota untuk melihat analisis spesifik
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {dataset.summaries.map((s) => {
              const isSelected = s.memberId === selectedMemberId;
              return (
                <div
                  key={s.memberId}
                  onClick={() => {
                    onSelectMember(s.memberId);
                    setViewMode("individual");
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                      : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={s.avatarUrl}
                        alt={s.memberName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                          {s.role}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {s.memberName.split(" ")[0]}
                        </p>
                      </div>
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.colorHex }}
                    />
                  </div>

                  <div className="space-y-1 my-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-500">Total 7 Hari</span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {s.totalWeekMinutes} <span className="text-[10px] font-normal text-slate-400">mnt</span>
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="text-slate-500">Rata-rata</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {s.avgDailyMinutes} mnt/hari
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="text-slate-500">Target Harian</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {s.dailyTarget} mnt
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="text-slate-500">Kepatuhan</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {s.targetMetDaysCount}/7 hari ({s.targetMetPercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <Watch className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{s.wearableBrand}</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      Detail <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Bottom Navigation & Syar'i Fitness Rationale */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Thibbun Nabawi & Kedokteran Preventif:</strong> Latihan fisik aerobik teratur menguatkan otot jantung, menstabilkan glukosa darah, dan meregenerasi sel imunitas tubuh.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToGoals && (
            <button
              type="button"
              onClick={onNavigateToGoals}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Ubah Target Health Goals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateToBerjaga && (
            <button
              type="button"
              onClick={onNavigateToBerjaga}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <span>Pilar Bergerak BERJAGA</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
