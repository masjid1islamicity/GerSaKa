import React, { useState, useMemo } from "react";
import { FamilyMember, MentalWellnessEntry, MentalWellnessMonthlyStats } from "../types";
import { 
  INITIAL_MENTAL_ENTRIES, 
  MOOD_SCALE_DEFINITIONS, 
  EMOTION_TAGS, 
  TRIGGER_FACTORS, 
  getMoodDefinition, 
  calculateMonthlyStats, 
  generateLocalAiReflection 
} from "../data/mentalWellnessData";
import { 
  Calendar as CalendarIcon, 
  Smile, 
  Heart, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Zap, 
  Moon, 
  Flame, 
  Award, 
  Info, 
  X, 
  Edit3, 
  Trash2,
  Users,
  Compass,
  Check
} from "lucide-react";

interface MentalWellnessTrackerProps {
  members: FamilyMember[];
  activeMemberId: string;
  onSelectMember?: (id: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const MentalWellnessTracker: React.FC<MentalWellnessTrackerProps> = ({
  members,
  activeMemberId,
  onSelectMember,
  onShowToast,
}) => {
  // Master state for all family members' entries
  const [entriesMap, setEntriesMap] = useState<Record<string, MentalWellnessEntry[]>>(INITIAL_MENTAL_ENTRIES);

  // Active view tab: 'calendar' | 'trends' | 'analytics'
  const [activeTab, setActiveTab] = useState<"calendar" | "trends" | "analytics">("calendar");

  // Calendar month/year navigation (Default: September 2026 as per applet timeframe)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 1-indexed (9 = September)

  // Selected date for day inspection (Default to "2026-09-25" - today)
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-25");

  // Log / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form Fields
  const [formDate, setFormDate] = useState<string>("2026-09-25");
  const [formMoodScore, setFormMoodScore] = useState<number>(8);
  const [formSecondaryEmotions, setFormSecondaryEmotions] = useState<string[]>(["Penuh Syukur 🤲"]);
  const [formTriggers, setFormTriggers] = useState<string[]>(["Ibadah & Dzikir Rutin", "Keluarga Berkumpul"]);
  const [formJournalTitle, setFormJournalTitle] = useState<string>("");
  const [formJournalEntry, setFormJournalEntry] = useState<string>("");
  const [formGratitudeNote, setFormGratitudeNote] = useState<string>("");
  const [formMindfulnessMinutes, setFormMindfulnessMinutes] = useState<number>(20);
  const [includeVitalsSnapshot, setIncludeVitalsSnapshot] = useState<boolean>(true);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Get active member
  const currentMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0] || {
      id: "1",
      name: "Ahmad Dahlan",
      role: "Ayah",
      vitals: {
        heartRate: 72,
        stressLevel: 22,
        hrvMs: 65,
        sleepScore: 85,
        steps: 7500,
        bloodPressure: "120/80",
        spo2: 98,
        bloodGlucose: 105,
        bodyTemperature: 36.6,
        sleepHours: 7.5,
        activeCalories: 450,
        timestamp: new Date().toISOString(),
      },
    };
  }, [members, activeMemberId]);

  // Current member's entries
  const currentEntries = useMemo(() => {
    return entriesMap[currentMember.id] || [];
  }, [entriesMap, currentMember.id]);

  // Monthly statistics
  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(currentEntries, currentYear, currentMonth);
  }, [currentEntries, currentYear, currentMonth]);

  // Map of entries by date for fast lookup in calendar
  const entriesByDate = useMemo(() => {
    const map = new Map<string, MentalWellnessEntry>();
    currentEntries.forEach((e) => {
      map.set(e.date, e);
    });
    return map;
  }, [currentEntries]);

  // Selected day entry (if exists)
  const selectedDayEntry = useMemo(() => {
    return entriesByDate.get(selectedDate);
  }, [entriesByDate, selectedDate]);

  // Calendar calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    const totalDays = lastDayOfMonth.getDate();
    
    // Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // We want Monday as index 0, ..., Sunday as index 6
    let startingDayIndex = firstDayOfMonth.getDay() - 1;
    if (startingDayIndex === -1) startingDayIndex = 6; // Sunday is 6th index

    const days: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      entry?: MentalWellnessEntry;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      days.push({
        dayNumber: dNum,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === "2026-09-25",
        isSelected: dateStr === selectedDate,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: true,
        entry: entriesByDate.get(dateStr),
        isToday: dateStr === "2026-09-25",
        isSelected: dateStr === selectedDate,
      });
    }

    // Next month padding to fill a 6-row grid (42 cells) or 5-row grid (35 cells)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === "2026-09-25",
        isSelected: dateStr === selectedDate,
      });
    }

    return days;
  }, [currentYear, currentMonth, entriesByDate, selectedDate]);

  // Calendar month names in Indonesian
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setCurrentYear(2026);
    setCurrentMonth(9);
    setSelectedDate("2026-09-25");
  };

  // Open modal to log a new entry or edit
  const handleOpenLogModal = (dateToLog?: string, existing?: MentalWellnessEntry) => {
    const targetDate = dateToLog || selectedDate || "2026-09-25";
    setFormDate(targetDate);

    if (existing) {
      setEditingEntryId(existing.id);
      setFormMoodScore(existing.moodScore);
      setFormSecondaryEmotions(existing.secondaryEmotions || []);
      setFormTriggers(existing.triggersOrFactors || []);
      setFormJournalTitle(existing.journalTitle || "");
      setFormJournalEntry(existing.journalEntry || "");
      setFormGratitudeNote(existing.gratitudeNote || "");
      setFormMindfulnessMinutes(existing.mindfulnessMinutes || 15);
      setIncludeVitalsSnapshot(Boolean(existing.vitalsCorrelation));
    } else {
      setEditingEntryId(null);
      setFormMoodScore(8);
      setFormSecondaryEmotions(["Penuh Syukur 🤲"]);
      setFormTriggers(["Ibadah & Dzikir Rutin", "Kumpul Keluarga & Ngobrol"]);
      setFormJournalTitle("");
      setFormJournalEntry("");
      setFormGratitudeNote("");
      setFormMindfulnessMinutes(20);
      setIncludeVitalsSnapshot(true);
    }

    setIsModalOpen(true);
  };

  // Toggle emotion chip
  const toggleEmotion = (emo: string) => {
    setFormSecondaryEmotions(prev => {
      if (prev.includes(emo)) {
        return prev.length === 1 ? prev : prev.filter(e => e !== emo);
      } else {
        if (prev.length >= 3) {
          // Allow max 3 tags
          return [...prev.slice(1), emo];
        }
        return [...prev, emo];
      }
    });
  };

  // Toggle trigger chip
  const toggleTrigger = (trig: string) => {
    setFormTriggers(prev => {
      if (prev.includes(trig)) {
        return prev.filter(t => t !== trig);
      } else {
        return [...prev, trig];
      }
    });
  };

  // Submit Mood & Journal entry
  const handleSaveEntry = async () => {
    setIsAiLoading(true);

    const moodDef = getMoodDefinition(formMoodScore);
    const vitalsSnapshot = includeVitalsSnapshot ? {
      heartRate: currentMember.vitals.heartRate,
      stressLevel: currentMember.vitals.stressLevel,
      hrvMs: currentMember.vitals.hrvMs,
      sleepScore: currentMember.vitals.sleepScore,
      steps: currentMember.vitals.steps,
    } : undefined;

    let aiReflection = generateLocalAiReflection(
      {
        moodScore: formMoodScore,
        secondaryEmotions: formSecondaryEmotions,
        triggersOrFactors: formTriggers,
      },
      currentMember.role
    );

    // Call server endpoint for enhanced reflection if available
    try {
      const response = await fetch("/api/ai/mental-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: currentMember,
          moodScore: formMoodScore,
          moodLabel: moodDef.label,
          secondaryEmotions: formSecondaryEmotions,
          journalTitle: formJournalTitle || "Catatan Harian",
          journalEntry: formJournalEntry || "Menjalani hari dengan penuh syukur.",
          gratitudeNote: formGratitudeNote,
          mindfulnessMinutes: formMindfulnessMinutes,
          triggersOrFactors: formTriggers,
          vitals: vitalsSnapshot,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.emotionalSummary) {
          aiReflection = {
            emotionalSummary: data.emotionalSummary,
            affirmationOrWisdom: data.affirmationOrWisdom,
            actionableTip: data.actionableTip,
            wellnessScore: data.wellnessScore || (formMoodScore * 10),
          };
        }
      }
    } catch (e) {
      console.warn("Could not fetch remote AI reflection, using local generator:", e);
    } finally {
      setIsAiLoading(false);
    }

    const newEntry: MentalWellnessEntry = {
      id: editingEntryId || `MW-${currentMember.id}-${Date.now().toString(36)}`,
      memberId: currentMember.id,
      memberName: currentMember.name,
      memberRole: currentMember.role,
      date: formDate,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      moodScore: formMoodScore,
      moodLabel: moodDef.label,
      moodEmoji: moodDef.emoji,
      secondaryEmotions: formSecondaryEmotions,
      journalTitle: formJournalTitle.trim() || `Refleksi Harian (${formDate})`,
      journalEntry: formJournalEntry.trim() || "Menjalani hari dengan syukur dan doa agar senantiasa dalam limpahan ketenangan.",
      gratitudeNote: formGratitudeNote.trim() || "Kesehatan dan kasih sayang keluarga.",
      mindfulnessMinutes: formMindfulnessMinutes,
      triggersOrFactors: formTriggers,
      vitalsCorrelation: vitalsSnapshot,
      aiReflection,
    };

    setEntriesMap(prev => {
      const memberList = prev[currentMember.id] || [];
      const filtered = memberList.filter(e => e.date !== formDate);
      return {
        ...prev,
        [currentMember.id]: [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date)),
      };
    });

    setSelectedDate(formDate);
    setIsModalOpen(false);

    if (onShowToast) {
      onShowToast(
        `Jurnal & Mood ${currentMember.name} tanggal ${formDate} berhasil disimpan! (${moodDef.emoji} Skor ${formMoodScore}/10)`,
        "success"
      );
    }
  };

  // Delete entry
  const handleDeleteEntry = (entryId: string) => {
    setEntriesMap(prev => {
      const list = prev[currentMember.id] || [];
      return {
        ...prev,
        [currentMember.id]: list.filter(e => e.id !== entryId),
      };
    });

    if (onShowToast) {
      onShowToast("Entri jurnal suasana hati telah dihapus.", "info");
    }
  };

  const selectedMoodDefinition = getMoodDefinition(formMoodScore);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-600/20 shrink-0">
              <Smile className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Kesehatan Mental & Sakinah Keluarga
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Sinkronisasi Wearable & Log Harian
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Mental Wellness & Mood Tracker
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Catat skor suasana hati, jurnal refleksi syukur, dan amati tren kesejahteraan emosional keluarga dalam kalender interaktif yang terhubung langsung dengan sinyal biometrik wearable.
              </p>
            </div>
          </div>

          {/* Quick Action Button to Log Today */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => handleOpenLogModal("2026-09-25")}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-extrabold text-xs shadow-md shadow-teal-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Mood & Jurnal Hari Ini</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </button>
          </div>

        </div>

        {/* FAMILY MEMBER SELECTOR BAR */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Pilih Anggota Keluarga:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {members.map((member) => {
              const isSelected = member.id === currentMember.id;
              const memberEntries = entriesMap[member.id] || [];
              const stats = calculateMonthlyStats(memberEntries, currentYear, currentMonth);

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onSelectMember && onSelectMember(member.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-[1.02]"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                  <span>{member.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                  }`}>
                    {stats.averageMoodScore > 0 ? `${stats.averageMoodScore}★` : "Baru"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MONTHLY KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          
          {/* Card 1: Average Mood Score */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                Rata-rata Mood
              </span>
              <span className="text-xl">
                {monthlyStats.averageMoodScore >= 8 ? "😊" : monthlyStats.averageMoodScore >= 6 ? "🙂" : "😐"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-teal-900 dark:text-teal-100">
                {monthlyStats.averageMoodScore > 0 ? monthlyStats.averageMoodScore : "-"}
              </span>
              <span className="text-xs text-teal-700 dark:text-teal-400 font-bold">/ 10</span>
            </div>
            <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium truncate">
              {monthlyStats.averageMoodScore >= 8 
                ? "Sangat Positif & Sakinah" 
                : monthlyStats.averageMoodScore >= 6 
                ? "Stabil Terkendali" 
                : "Perlu Pendampingan"}
            </p>
          </div>

          {/* Card 2: Logging Streak */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Konsistensi Jurnal
              </span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
                {monthlyStats.currentStreakDays}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">Hari Rutin</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium truncate">
              {monthlyStats.totalEntries} Total Entri Bulan Ini
            </p>
          </div>

          {/* Card 3: Dominant Emotion */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                Emosi Dominan
              </span>
              <Heart className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            </div>
            <div className="text-base sm:text-lg font-black text-indigo-900 dark:text-indigo-100 truncate">
              {monthlyStats.dominantEmotion}
            </div>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium truncate">
              {monthlyStats.moodDistribution.positivePct}% Suasana Hati Positif
            </p>
          </div>

          {/* Card 4: Biometric Stress & HRV Synergy */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Sinergi Wearable
              </span>
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <span>HRV {currentMember.vitals.hrvMs}ms</span>
              <span className="text-slate-400">•</span>
              <span>Stres {currentMember.vitals.stressLevel}%</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium truncate">
              Tidur {currentMember.vitals.sleepScore}/100 • Status Optimal
            </p>
          </div>

        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "calendar"
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Kalender Mood & Jurnal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trends")}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "trends"
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Grafik Tren Emosional & Biometrik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Distribusi & Refleksi Sakinah AI</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: CALENDAR VIEW & DAY INSPECTOR */}
      {activeTab === "calendar" && (
        <div className="pt-5 space-y-6">
          
          {/* Calendar Controls & Month Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white px-2">
                {monthNames[currentMonth - 1]} {currentYear}
              </h3>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {(currentMonth !== 9 || currentYear !== 2026) && (
                <button
                  type="button"
                  onClick={handleResetToCurrentMonth}
                  className="ml-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Kembali ke September 2026
                </button>
              )}
            </div>

            {/* Legend / Color Explanation */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-400 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Positif (8-10)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span>Stabil (6-7)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Netral (5)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Lelah/Cemas (1-4)</span>
              </div>
            </div>

          </div>

          {/* CALENDAR GRID */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 text-xs font-black text-slate-700 dark:text-slate-300">
              <span>Senin</span>
              <span>Selasa</span>
              <span>Rabu</span>
              <span>Kamis</span>
              <span>Jumat</span>
              <span className="text-teal-600 dark:text-teal-400">Sabtu</span>
              <span className="text-rose-600 dark:text-rose-400">Ahad</span>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
              {calendarDays.map((day, idx) => {
                const hasEntry = Boolean(day.entry);
                const entry = day.entry;
                const moodDef = entry ? getMoodDefinition(entry.moodScore) : null;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`min-h-[85px] sm:min-h-[105px] p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      !day.isCurrentMonth
                        ? "bg-slate-50/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-600"
                        : day.isSelected
                        ? "bg-teal-50/80 dark:bg-teal-950/40 ring-2 ring-teal-500 ring-inset"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          day.isToday
                            ? "bg-teal-600 text-white shadow-sm"
                            : day.isSelected
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {/* Entry Indicator Dot */}
                      {hasEntry && (
                        <span className="text-base leading-none">
                          {entry?.moodEmoji}
                        </span>
                      )}
                    </div>

                    {/* Middle: Mood Score Badge or Empty Prompt */}
                    <div className="my-1">
                      {hasEntry && entry ? (
                        <div className="space-y-1">
                          <div
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-black truncate border ${
                              moodDef?.badgeClass
                            } ${moodDef?.borderClass}`}
                          >
                            {entry.moodScore}/10 • {entry.moodLabel.split(" ")[0]}
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                            {entry.journalTitle}
                          </p>
                        </div>
                      ) : day.isCurrentMonth ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLogModal(day.dateString);
                          }}
                          className="w-full text-center py-1 opacity-0 group-hover:opacity-100 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 rounded-lg transition-opacity flex items-center justify-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Catat</span>
                        </button>
                      ) : null}
                    </div>

                    {/* Bottom: Vitals or Gratitude Indicator */}
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      {entry?.vitalsCorrelation ? (
                        <span className="flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Activity className="w-2.5 h-2.5" />
                          {entry.vitalsCorrelation.hrvMs}ms
                        </span>
                      ) : (
                        <span />
                      )}

                      {entry?.gratitudeNote && (
                        <span title="Disertai Catatan Syukur">🤲</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* DAY INSPECTION PANEL (Shows details for selected date) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Detail Kesejahteraan Emosional Tanggal: {selectedDate}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Anggota: <strong>{currentMember.name} ({currentMember.role})</strong>
                  </p>
                </div>
              </div>

              {/* Action buttons for this day */}
              <div className="flex items-center gap-2">
                {selectedDayEntry ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenLogModal(selectedDate, selectedDayEntry)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Entri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(selectedDayEntry.id)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Hapus Entri"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenLogModal(selectedDate)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tulis Jurnal untuk Tanggal Ini</span>
                  </button>
                )}
              </div>
            </div>

            {/* Entry Content If Exists */}
            {selectedDayEntry ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Left 2 Cols: Journal & Gratitude */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Mood banner for the day */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    getMoodDefinition(selectedDayEntry.moodScore).bgClass
                  } ${getMoodDefinition(selectedDayEntry.moodScore).borderClass}`}>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {selectedDayEntry.moodEmoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                            getMoodDefinition(selectedDayEntry.moodScore).badgeClass
                          }`}>
                            Skor {selectedDayEntry.moodScore} / 10
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Dicatat pukul {selectedDayEntry.timestamp}
                          </span>
                        </div>
                        <h5 className={`text-base font-black mt-0.5 ${
                          getMoodDefinition(selectedDayEntry.moodScore).textClass
                        }`}>
                          {selectedDayEntry.moodLabel}
                        </h5>
                      </div>
                    </div>

                    {/* Secondary emotion tags */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {selectedDayEntry.secondaryEmotions.map((emo, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {emo}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Journal Title & Body */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                      <BookOpen className="w-4 h-4" />
                      <span>Catatan Jurnal Refleksi</span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedDayEntry.journalTitle}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedDayEntry.journalEntry}
                    </p>
                  </div>

                  {/* Gratitude & Triggers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Gratitude note */}
                    <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <span>🤲 Hal yang Paling Disyukuri:</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 italic font-medium">
                        "{selectedDayEntry.gratitudeNote}"
                      </p>
                    </div>

                    {/* Triggers / Factors */}
                    <div className="bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Faktor & Pemicu Suasana Hati:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedDayEntry.triggersOrFactors.map((trig, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-600"
                          >
                            ✓ {trig}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Right Col: AI Psychological Reflection & Biometric Snapshot */}
                <div className="space-y-4">
                  
                  {/* AI Reflection Card */}
                  {selectedDayEntry.aiReflection && (
                    <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-teal-700/50 shadow-md space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Refleksi Psikologis AI
                        </span>
                        <span className="text-xs text-amber-300 font-bold">
                          Skor Jiwa: {selectedDayEntry.aiReflection.wellnessScore}/100
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-slate-200 leading-relaxed font-medium">
                          {selectedDayEntry.aiReflection.emotionalSummary}
                        </p>

                        <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                            Hikmah & Afirmasi Sakinah:
                          </span>
                          <p className="text-xs text-slate-100 italic">
                            "{selectedDayEntry.aiReflection.affirmationOrWisdom}"
                          </p>
                        </div>

                        <div className="text-[11px] text-teal-200 flex items-start gap-1.5 pt-1">
                          <Compass className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-400" />
                          <span>
                            <strong>Rekomendasi Praktis:</strong> {selectedDayEntry.aiReflection.actionableTip}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Biometric Snapshot Card */}
                  {selectedDayEntry.vitalsCorrelation && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          Sinyal Biometrik Wearable
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          Tersinkronisasi
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Detak Jantung</span>
                          <span className="font-black text-slate-800 dark:text-slate-200 text-sm">
                            {selectedDayEntry.vitalsCorrelation.heartRate} BPM
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Indeks Stres</span>
                          <span className="font-black text-teal-600 dark:text-teal-400 text-sm">
                            {selectedDayEntry.vitalsCorrelation.stressLevel}% (Rendah)
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Variabilitas (HRV)</span>
                          <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                            {selectedDayEntry.vitalsCorrelation.hrvMs} ms
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Skor Tidur</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {selectedDayEntry.vitalsCorrelation.sleepScore}/100
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        HRV stabil menunjukkan aktivasi saraf parasimpatis yang harmonis saat kondisi pikiran rileks dan bersyukur.
                      </p>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Belum Ada Catatan Emosi Pada Tanggal Ini
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Catat suasana hati dan refleksi jurnal harian {currentMember.name} untuk memetakan kesehatan mental keluarga.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenLogModal(selectedDate)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Jurnal & Mood Tanggal {selectedDate}</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: EMOTIONAL TRENDS & BIOMETRICS CHART */}
      {activeTab === "trends" && (
        <div className="pt-5 space-y-6">
          
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                  Visualisasi Tren 30 Hari
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                  Korelasi Dinamika Mood vs Indeks Stres Wearable ({monthNames[currentMonth - 1]} {currentYear})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Membandingkan skor suasana hati harian (1-10) dengan indeks beban stres fisik yang terekam dari smartwatch {currentMember.name}.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                  <span className="w-3 h-3 rounded-full bg-teal-500" />
                  <span>Skor Mood (1-10)</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Indeks Stres (%)</span>
                </div>
              </div>
            </div>

            {/* VISUAL BAR / LINE TIMELINE CHART */}
            <div className="h-64 sm:h-72 w-full pt-4 flex flex-col justify-end">
              
              {/* Chart Bars Grid */}
              <div className="h-full flex items-end justify-between gap-1 sm:gap-2 border-b border-slate-300 dark:border-slate-700 pb-2 relative">
                
                {/* Horizontal reference line for Mood = 8 (Positive threshold) */}
                <div className="absolute left-0 right-0 bottom-[80%] border-t border-dashed border-emerald-400/40 pointer-events-none flex items-center justify-end pr-2">
                  <span className="text-[9px] font-bold text-emerald-500 bg-white/80 dark:bg-slate-900/80 px-1 rounded">
                    Batas Sakinah & Bahagia (Skor 8)
                  </span>
                </div>

                {/* Horizontal reference line for Mood = 5 (Neutral threshold) */}
                <div className="absolute left-0 right-0 bottom-[50%] border-t border-dashed border-slate-300 dark:border-slate-700 pointer-events-none flex items-center justify-end pr-2">
                  <span className="text-[9px] font-bold text-slate-400 bg-white/80 dark:bg-slate-900/80 px-1 rounded">
                    Netral (Skor 5)
                  </span>
                </div>

                {/* Days 1 through 25 render */}
                {Array.from({ length: 25 }, (_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const entry = entriesByDate.get(dateStr);
                  const moodScore = entry ? entry.moodScore : 0;
                  const stressVal = entry?.vitalsCorrelation ? entry.vitalsCorrelation.stressLevel : 25;

                  return (
                    <div
                      key={dayNum}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setActiveTab("calendar");
                      }}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      title={entry ? `Tgl ${dayNum}: Mood ${moodScore}/10, Stres ${stressVal}%` : `Tgl ${dayNum}: Belum ada entri`}
                    >
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                        <span>Tgl {dayNum}: {entry ? `${entry.moodEmoji} Mood ${moodScore}/10` : "Tidak ada log"}</span>
                        {entry && <span className="text-teal-300">Stres: {stressVal}%</span>}
                      </div>

                      {/* Bar comparison */}
                      <div className="w-full max-w-[16px] flex items-end justify-center gap-0.5 h-full">
                        {/* Mood bar */}
                        {moodScore > 0 ? (
                          <div
                            style={{ height: `${moodScore * 10}%` }}
                            className={`w-full rounded-t-sm transition-all ${
                              moodScore >= 8
                                ? "bg-teal-500 hover:bg-teal-400"
                                : moodScore >= 6
                                ? "bg-emerald-500 hover:bg-emerald-400"
                                : moodScore === 5
                                ? "bg-slate-400"
                                : "bg-amber-500"
                            }`}
                          />
                        ) : (
                          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-t-sm" />
                        )}
                      </div>

                      {/* Date label at bottom */}
                      <span className="text-[9px] text-slate-400 font-bold mt-1 group-hover:text-teal-600">
                        {dayNum}
                      </span>
                    </div>
                  );
                })}

              </div>

              {/* X-axis label */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-semibold">
                <span>1 September 2026</span>
                <span>Pertengahan Bulan</span>
                <span>Hari Ini (25 September 2026)</span>
              </div>

            </div>

            {/* CLINICAL CORRELATION INSIGHT BANNER */}
            <div className="bg-teal-900 text-white rounded-2xl p-4 sm:p-5 border border-teal-700/60 shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-sm font-black text-teal-200">
                  Temuan Analisis Tren Emosi vs Biometrik ({currentMember.name})
                </h4>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {monthlyStats.vitalsSynergySummary}
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-teal-300 font-bold flex-wrap">
                <span>✓ Puncak Emosi: Hari Jumat & Akhir Pekan (Rata-rata 8.8/10)</span>
                <span>✓ Faktor Terkuat: Dzikir/Ibadah & Berkumpul Bersama Keluarga</span>
                <span>✓ Kestabilan HRV: 65 - 75 ms (Zona Relaksasi Sangat Baik)</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 3: DISTRIBUTION & AI MONTHLY SAKINAH REFLECTION */}
      {activeTab === "analytics" && (
        <div className="pt-5 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Mood Distribution & Top Triggers */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Mood Breakdown Progress Bars */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  <span>Distribusi Spektrum Suasana Hati Bulan Ini</span>
                </h4>

                <div className="space-y-3">
                  
                  {/* Positive */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Smile className="w-4 h-4" />
                        <span>Sangat Positif & Bahagia (Skor 8-10)</span>
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {monthlyStats.moodDistribution.positivePct}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${monthlyStats.moodDistribution.positivePct}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Stable */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        <span>Tenang & Rileks (Skor 6-7)</span>
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {monthlyStats.moodDistribution.stablePct}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${monthlyStats.moodDistribution.stablePct}%` }}
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Neutral */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">
                        Netral & Biasa Saja (Skor 5)
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {monthlyStats.moodDistribution.neutralPct}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${monthlyStats.moodDistribution.neutralPct}%` }}
                        className="h-full bg-slate-400 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Challenging */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-rose-600 dark:text-rose-400">
                        Lelah Mental / Tertekan (Skor 1-4)
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {monthlyStats.moodDistribution.challengingPct}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${monthlyStats.moodDistribution.challengingPct}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Frequent Triggers and Boosters */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Pemicu Terbesar Peningkatan & Penurunan Emosi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {monthlyStats.topTriggers.map((trig, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        trig.impact === "positif"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                          : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                      }`}
                    >
                      <span className="text-xs font-bold">{trig.name}</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs">
                        {trig.count}x Muncul
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: AI Monthly Synthesis */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 border border-indigo-700/50 shadow-lg space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                      Sintesis Sakinah AI
                    </span>
                    <h4 className="text-sm font-black text-white">
                      Kesehatan Jiwa Keluarga
                    </h4>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {monthlyStats.aiMonthlyReflection}
                </p>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Pilar Ketahanan Emosional
                  </span>
                  <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                    <li>Rutin bersyukur memprogram ulang respon otak terhadap stres.</li>
                    <li>Waktu berkualitas bersama anak dan pasangan mempercepat pemulihan HRV.</li>
                    <li>Tidur cukup 7.5 jam menjaga neuroplastisitas emosional tetap seimbang.</li>
                  </ul>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenLogModal("2026-09-25")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-black shadow-md transition-all cursor-pointer"
                  >
                    Tambah Refleksi Hari Ini
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL TO LOG DAILY MOOD & JOURNAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {editingEntryId ? "Perbarui Log Suasana Hati" : "Catat Suasana Hati & Jurnal Emosional"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Untuk: <strong>{currentMember.name} ({currentMember.role})</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="space-y-4">
              
              {/* Date Input */}
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="w-full sm:w-1/2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tanggal Catatan:
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="w-full sm:w-1/2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Durasi Dzikir / Mindfulness:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={180}
                      value={formMindfulnessMinutes}
                      onChange={(e) => setFormMindfulnessMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <span className="text-xs text-slate-500 font-bold shrink-0">Menit</span>
                  </div>
                </div>
              </div>

              {/* Interactive Mood Score 1-10 Slider / Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Skala Suasana Hati Hari Ini (1 - 10):
                  </label>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${selectedMoodDefinition.badgeClass} ${selectedMoodDefinition.borderClass}`}>
                    {selectedMoodDefinition.emoji} Skor {formMoodScore}/10 : {selectedMoodDefinition.label}
                  </span>
                </div>

                {/* Score Selector Buttons (1 to 10) */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                  {MOOD_SCALE_DEFINITIONS.map((def) => {
                    const isSelected = formMoodScore === def.score;
                    return (
                      <button
                        key={def.score}
                        type="button"
                        onClick={() => setFormMoodScore(def.score)}
                        className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-600 text-white shadow-md scale-105 ring-2 ring-teal-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span className="text-lg leading-none">{def.emoji}</span>
                        <span className="text-[11px] font-black mt-1">{def.score}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  {selectedMoodDefinition.description}
                </p>
              </div>

              {/* Secondary Emotion Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Emosi Spesifik yang Dirasakan (Pilih 1 - 3):
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOTION_TAGS.map((emo, idx) => {
                    const isSelected = formSecondaryEmotions.includes(emo);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleEmotion(emo)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {emo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Factors Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Faktor / Pemicu Utama:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TRIGGER_FACTORS.map((trig, idx) => {
                    const isSelected = formTriggers.includes(trig);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleTrigger(trig)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {trig}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Journal Title & Body */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Judul Entri Jurnal:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bersyukur atas kelancaran tugas hari ini..."
                    value={formJournalTitle}
                    onChange={(e) => setFormJournalTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Refleksi & Isi Jurnal Harian:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ceritakan momen penting, perasaan yang dialami, atau apa yang sedang dipikirkan..."
                    value={formJournalEntry}
                    onChange={(e) => setFormJournalEntry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Gratitude Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <span>🤲 Apa 1 - 3 hal yang paling Anda syukuri hari ini?</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kesehatan orang tua, senyuman anak, rezeki berkah..."
                  value={formGratitudeNote}
                  onChange={(e) => setFormGratitudeNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Include Vitals Checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Sematkan Snapshot Sinyal Wearable
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    HR: {currentMember.vitals.heartRate} BPM • Stres: {currentMember.vitals.stressLevel}% • HRV: {currentMember.vitals.hrvMs}ms • Tidur: {currentMember.vitals.sleepScore}/100
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={includeVitalsSnapshot}
                  onChange={(e) => setIncludeVitalsSnapshot(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveEntry}
                disabled={isAiLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs shadow-md shadow-teal-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menganalisis Refleksi AI...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Jurnal & Mood</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
