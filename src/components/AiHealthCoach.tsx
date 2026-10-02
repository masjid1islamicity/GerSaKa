import React, { useState, useEffect, useRef } from "react";
import { FamilyMember, HealthCoachNudge, HealthCoachSettings } from "../types";
import { 
  DEFAULT_COACH_SETTINGS, 
  INITIAL_PROACTIVE_NUDGES, 
  fetchProactiveCoachNudge 
} from "../utils/aiHealthCoach";
import { 
  Sparkles, 
  Droplet, 
  Activity, 
  Watch, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Flame, 
  Heart, 
  Volume2, 
  VolumeX, 
  Settings, 
  ChevronRight, 
  Check, 
  Compass, 
  ShieldCheck, 
  Calendar,
  X,
  Zap,
  TrendingUp,
  UserCheck
} from "lucide-react";

interface AiHealthCoachProps {
  member: FamilyMember;
  onSyncWearable?: () => void;
  isSyncing?: boolean;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const AiHealthCoach: React.FC<AiHealthCoachProps> = ({
  member,
  onSyncWearable,
  isSyncing = false,
  onShowToast,
}) => {
  // Settings
  const [settings, setSettings] = useState<HealthCoachSettings>(DEFAULT_COACH_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Proactive Nudges Feed
  const [nudges, setNudges] = useState<HealthCoachNudge[]>(() => {
    return INITIAL_PROACTIVE_NUDGES[member.id] || INITIAL_PROACTIVE_NUDGES["fam-01"] || [];
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Hydration state (ml)
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(1250);

  // Sedentary counter (simulated minutes of inactivity)
  const [sedentaryMinutes, setSedentaryMinutes] = useState<number>(48);

  // Periodic proactive countdown timer (seconds until next proactive nudge)
  const [countdownSeconds, setCountdownSeconds] = useState<number>(
    settings.autoCoachCadenceMinutes * 60
  );

  // Active guided routine timer (for stretch/breathing)
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerInitialTotal, setTimerInitialTotal] = useState<number>(60);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter state for nudge feed
  const [filterType, setFilterType] = useState<string>("all");

  // Cadence countdown tick
  useEffect(() => {
    const cadenceInterval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          // Trigger periodic proactive nudge
          triggerProactiveNudge("auto", true);
          return settings.autoCoachCadenceMinutes * 60;
        }
        return prev - 1;
      });

      // Gradually increase sedentary minutes unless steps occur
      setSedentaryMinutes((prev) => Math.min(120, prev + 1));
    }, 1000);

    return () => clearInterval(cadenceInterval);
  }, [settings.autoCoachCadenceMinutes, member.id]);

  // Guided timer tick
  useEffect(() => {
    if (isTimerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setActiveTimerSeconds((s) => {
          if (s === null || s <= 1) {
            setIsTimerRunning(false);
            if (onShowToast) {
              onShowToast("Alhamdulillah! Sesi peregangan/relaksasi berhasil diselesaikan!", "success");
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeTimerSeconds]);

  // Trigger new proactive nudge
  const triggerProactiveNudge = async (type: string = "auto", isAutomated: boolean = false) => {
    setIsGenerating(true);
    try {
      const freshNudge = await fetchProactiveCoachNudge(
        member,
        type,
        waterIntakeMl,
        sedentaryMinutes
      );

      setNudges((prev) => [freshNudge, ...prev]);

      // If audio chime enabled
      if (settings.audioChimeEnabled && typeof window !== "undefined") {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
          // Audio context might be restricted
        }
      }

      if (onShowToast) {
        onShowToast(
          isAutomated
            ? `AI Health Coach: ${freshNudge.title}`
            : `Saran proaktif baru diterima dari ${member.connectedWearable.deviceName}!`,
          "info"
        );
      }

      // Reset countdown
      setCountdownSeconds(settings.autoCoachCadenceMinutes * 60);
    } catch (err) {
      console.warn("Error fetching coach nudge:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add hydration log
  const handleLogHydration = (amount: number = 250) => {
    setWaterIntakeMl((prev) => {
      const next = prev + amount;
      if (onShowToast) {
        onShowToast(
          `+${amount} ml air putih dicatat! Total hari ini: ${next.toLocaleString()} / ${settings.dailyWaterGoalMl.toLocaleString()} ml.`,
          "success"
        );
      }
      return next;
    });

    // Mark active hydration nudge as completed if present
    setNudges((prev) =>
      prev.map((n) =>
        n.type === "hydration" && !n.isCompleted
          ? { ...n, isCompleted: true, completedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }
          : n
      )
    );
  };

  // Start guided stretch / breathing timer
  const handleStartRoutineTimer = (durationSeconds: number = 60, nudgeId: string) => {
    setActiveTimerSeconds(durationSeconds);
    setTimerInitialTotal(durationSeconds);
    setIsTimerRunning(true);

    if (onShowToast) {
      onShowToast(`Timer panduan peregangan aktif (${durationSeconds} detik). Ikuti langkah relaksasi.`, "info");
    }
  };

  // Mark nudge completed
  const handleCompleteNudge = (nudgeId: string) => {
    setNudges((prev) =>
      prev.map((n) => {
        if (n.id === nudgeId) {
          if (n.type === "stretch") {
            setSedentaryMinutes(5); // Reset sedentary timer
          }
          return {
            ...n,
            isCompleted: true,
            completedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          };
        }
        return n;
      })
    );

    setIsTimerRunning(false);
    setActiveTimerSeconds(null);

    if (onShowToast) {
      onShowToast("Saran pola hidup berhasil ditandai selesai!", "success");
    }
  };

  // Reset sedentary timer (e.g. user stood up)
  const handleResetSedentary = () => {
    setSedentaryMinutes(0);
    if (onShowToast) {
      onShowToast("Timer duduk statis diatur ulang (0 menit). Bagus untuk sirkulasi kaki!", "success");
    }
  };

  // Most recent uncompleted nudge (or top nudge)
  const activeNudge = nudges.find((n) => !n.isCompleted) || nudges[0];

  // Filtered nudges
  const filteredNudges = nudges.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "completed") return n.isCompleted;
    if (filterType === "pending") return !n.isCompleted;
    return n.type === filterType;
  });

  const minutesRemaining = Math.floor(countdownSeconds / 60);
  const secondsRemaining = countdownSeconds % 60;
  const hydrationPct = Math.min(100, Math.round((waterIntakeMl / settings.dailyWaterGoalMl) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
      {/* Ambient background blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative z-10 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-600/20 shrink-0">
              <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                  AI Health Coach • Pendamping Proaktif Real-Time
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Watch className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  {member.connectedWearable.deviceName}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                AI Health Coach Proaktif
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Mengirimkan saran proaktif berkala tentang hidrasi teratur, peregangan ringan, dan jeda relaksasi berdasarkan sensor aktivitas real-time smartwatch <strong>{member.name} ({member.role})</strong>.
              </p>
            </div>
          </div>

          {/* Quick Actions & Countdown Badge */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            
            {/* Countdown Badge */}
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold leading-none">Nudge Proaktif Berikutnya:</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-200">
                  {String(minutesRemaining).padStart(2, "0")}:{String(secondsRemaining).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Instant Coach Prompt Button */}
            <button
              type="button"
              onClick={() => triggerProactiveNudge("auto")}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-black text-xs shadow-md shadow-cyan-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-yellow-300 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Menganalisis..." : "Kirim Saran Sekarang"}</span>
            </button>

            {/* Settings Toggle */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Pengaturan Cadence Pelatih"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* SETTINGS DRAWER / COLLAPSIBLE PANEL */}
        {isSettingsOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                  Konfigurasi Frekuensi & Sensor Pelatih Proaktif
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              {/* Cadence selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Interval Pengingat Otomatis:
                </label>
                <select
                  value={settings.autoCoachCadenceMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSettings((s) => ({ ...s, autoCoachCadenceMinutes: val }));
                    setCountdownSeconds(val * 60);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value={15}>Setiap 15 Menit (Intensif)</option>
                  <option value={30}>Setiap 30 Menit (Optimal)</option>
                  <option value={45}>Setiap 45 Menit (Moderat)</option>
                  <option value={60}>Setiap 60 Menit (Santai)</option>
                </select>
              </div>

              {/* Daily water goal */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Target Hidrasi Harian (ml):
                </label>
                <input
                  type="number"
                  step={250}
                  min={1000}
                  max={5000}
                  value={settings.dailyWaterGoalMl}
                  onChange={(e) => setSettings((s) => ({ ...s, dailyWaterGoalMl: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* Sound chime toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  {settings.audioChimeEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>Suara Lonceng Nudge</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.audioChimeEnabled}
                  onChange={(e) => setSettings((s) => ({ ...s, audioChimeEnabled: e.target.checked }))}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </div>

            </div>
          </div>
        )}

        {/* 3 REAL-TIME SENSOR METRIC BARS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          
          {/* Tile 1: Hydration Meter */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40 border border-cyan-200/80 dark:border-cyan-800/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-cyan-600" />
                <span>Pelacak Hidrasi Cerdas</span>
              </span>
              <span className="text-xs font-black text-cyan-900 dark:text-cyan-200">
                {hydrationPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-cyan-950 dark:text-cyan-100">
                {waterIntakeMl.toLocaleString()}
              </span>
              <span className="text-xs text-cyan-700 dark:text-cyan-300 font-bold">
                / {settings.dailyWaterGoalMl.toLocaleString()} ml
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-cyan-200 dark:bg-cyan-900/60 overflow-hidden">
              <div 
                style={{ width: `${hydrationPct}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-medium">
                {waterIntakeMl >= settings.dailyWaterGoalMl ? "Target Tercapai! 🌟" : "Perlu 3-4 gelas lagi"}
              </span>
              <button
                type="button"
                onClick={() => handleLogHydration(250)}
                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+250 ml Air</span>
              </button>
            </div>
          </div>

          {/* Tile 2: Inactivity / Sedentary Monitor */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-orange-500" />
                <span>Sensor Duduk Statis</span>
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                sedentaryMinutes >= 45 
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 animate-pulse"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
              }`}>
                {sedentaryMinutes >= 45 ? "Waktunya Peregangan!" : "Aman"}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-950 dark:text-amber-100">
                {sedentaryMinutes}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-bold">
                Menit Tanpa Langkah
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-900/60 overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, (sedentaryMinutes / 60) * 100)}%` }}
                className={`h-full rounded-full transition-all ${
                  sedentaryMinutes >= 45 ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                Ambang batas lelah: 45 menit
              </span>
              <button
                type="button"
                onClick={handleResetSedentary}
                className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 text-[11px] font-black transition-all cursor-pointer flex items-center gap-1"
                title="Atur ulang waktu duduk setelah berdiri atau berjalan"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Duduk</span>
              </button>
            </div>
          </div>

          {/* Tile 3: Real-Time Wearable Stress & Heart Strain */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Beban Otonom & Stres</span>
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                Live Sinkron
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                {member.vitals.stressLevel}%
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                RHR {member.vitals.heartRate} BPM • HRV {member.vitals.hrvMs}ms
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-emerald-200 dark:bg-emerald-900/60 overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, member.vitals.stressLevel)}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
              <span>{member.vitals.steps.toLocaleString()} Langkah • {member.vitals.activeCalories} kkal</span>
              <span className="font-bold">Status: Sakinah</span>
            </div>
          </div>

        </div>

        {/* ACTIVE FEATURED NUDGE CARD */}
        {activeNudge && (
          <div className={`rounded-3xl p-5 sm:p-6 border transition-all space-y-4 relative overflow-hidden shadow-md ${
            activeNudge.isCompleted
              ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
              : activeNudge.type === "hydration"
              ? "bg-gradient-to-br from-cyan-900 via-slate-900 to-blue-950 text-white border-cyan-500/50"
              : activeNudge.type === "stretch"
              ? "bg-gradient-to-br from-amber-900 via-slate-900 to-orange-950 text-white border-amber-500/50"
              : "bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white border-teal-500/50"
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                  activeNudge.type === "hydration"
                    ? "bg-cyan-500"
                    : activeNudge.type === "stretch"
                    ? "bg-amber-500"
                    : "bg-teal-500"
                }`}>
                  {activeNudge.type === "hydration" ? (
                    <Droplet className="w-4 h-4" />
                  ) : activeNudge.type === "stretch" ? (
                    <Activity className="w-4 h-4" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                </span>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {activeNudge.type === "hydration" ? "Pengingat Hidrasi" : activeNudge.type === "stretch" ? "Peregangan Ringan" : "Relaksasi Otonom"}
                    </span>
                    <span className="text-xs text-white/70">
                      Dipicu pukul {activeNudge.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                {activeNudge.isCompleted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai ({activeNudge.completedAt})</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 animate-pulse">
                    Saran Aktif Membutuhkan Tindakan
                  </span>
                )}
              </div>
            </div>

            {/* Nudge Body */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {activeNudge.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
                {activeNudge.message}
              </p>

              {/* Wearable context callout */}
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2 text-xs text-slate-200">
                <Watch className="w-4 h-4 text-cyan-300 shrink-0" />
                <span><strong>Data Sensor Wearable:</strong> {activeNudge.wearableTriggerContext}</span>
              </div>
            </div>

            {/* Routine Steps Checklist */}
            {activeNudge.routineSteps && activeNudge.routineSteps.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                  Panduan Langkah Praktis (1-2-3):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activeNudge.routineSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar & Guided Timer */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              
              {/* Left: Guided Timer (if stretch/breathing) */}
              {activeNudge.timerDurationSeconds && activeNudge.timerDurationSeconds > 0 ? (
                <div className="flex items-center gap-3">
                  {activeTimerSeconds !== null && activeTimerSeconds > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border-2 border-amber-400">
                        <span className="font-mono font-black text-sm text-amber-300">
                          {activeTimerSeconds}s
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1"
                        >
                          {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isTimerRunning ? "Jeda" : "Lanjutkan"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTimerSeconds(timerInitialTotal);
                            setIsTimerRunning(true);
                          }}
                          className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs"
                          title="Ulangi timer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartRoutineTimer(activeNudge.timerDurationSeconds, activeNudge.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Mulai Panduan Peregangan ({activeNudge.timerDurationSeconds} Detik)</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80 font-medium">
                    🎯 Sasaran: <strong>{activeNudge.targetMetricGoal}</strong>
                  </span>
                </div>
              )}

              {/* Right: Quick Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeNudge.type === "hydration" && !activeNudge.isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleLogHydration(250)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Droplet className="w-4 h-4" />
                    <span>Minum Segelas Air (+250 ml)</span>
                  </button>
                )}

                {!activeNudge.isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleCompleteNudge(activeNudge.id)}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tandai Selesai</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

        {/* PROACTIVE QUICK NUDGE GENERATOR CHIPS */}
        <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Zap className="w-4 h-4 text-cyan-600" />
            <span>Minta Saran Proaktif Khusus:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => triggerProactiveNudge("hydration")}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Droplet className="w-3.5 h-3.5 text-cyan-600" />
              <span>Cek Hidrasi</span>
            </button>

            <button
              type="button"
              onClick={() => triggerProactiveNudge("stretch")}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Panduan Peregangan</span>
            </button>

            <button
              type="button"
              onClick={() => triggerProactiveNudge("posture_breath")}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Heart className="w-3.5 h-3.5 text-teal-600" />
              <span>Nafas Relaksasi (4-7-8)</span>
            </button>

            <button
              type="button"
              onClick={() => triggerProactiveNudge("step_burst")}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              <span>Target Langkah Cepat</span>
            </button>
          </div>
        </div>

        {/* FEED / TIMELINE OF PROACTIVE COACHING NUDGES */}
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <span>Riwayat & Jadwal Saran Proaktif Hari Ini</span>
            </h4>

            {/* Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  filterType === "all" ? "bg-slate-900 text-white dark:bg-slate-700" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Semua ({nudges.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("hydration")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  filterType === "hydration" ? "bg-cyan-600 text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Hidrasi
              </button>
              <button
                type="button"
                onClick={() => setFilterType("stretch")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  filterType === "stretch" ? "bg-amber-600 text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Peregangan
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredNudges.map((nudge) => (
              <div
                key={nudge.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  nudge.isCompleted
                    ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    nudge.type === "hydration"
                      ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
                      : nudge.type === "stretch"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                  }`}>
                    {nudge.type === "hydration" ? (
                      <Droplet className="w-4 h-4" />
                    ) : nudge.type === "stretch" ? (
                      <Activity className="w-4 h-4" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {nudge.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {nudge.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {nudge.actionablePrompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {nudge.isCompleted ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai ({nudge.completedAt})</span>
                    </span>
                  ) : (
                    <>
                      {nudge.type === "hydration" && (
                        <button
                          type="button"
                          onClick={() => handleLogHydration(250)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+250 ml</span>
                        </button>
                      )}

                      {nudge.timerDurationSeconds ? (
                        <button
                          type="button"
                          onClick={() => handleStartRoutineTimer(nudge.timerDurationSeconds, nudge.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-slate-950" />
                          <span>Timer {nudge.timerDurationSeconds}s</span>
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleCompleteNudge(nudge.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Selesai
                      </button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
