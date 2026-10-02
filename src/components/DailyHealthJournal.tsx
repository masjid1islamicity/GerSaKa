import React, { useState } from "react";
import { 
  FamilyMember, 
  DailyHealthJournalEntry, 
  MoodType, 
  DietLogItem 
} from "../types";
import { 
  INITIAL_JOURNAL_ENTRIES, 
  COMMON_SYMPTOMS_LIST, 
  MOOD_DEFINITIONS,
  generateVitalsCorrelationInsight
} from "../data/journalData";
import { 
  BookOpen, 
  Plus, 
  Heart, 
  Activity, 
  Zap, 
  Droplet, 
  Utensils, 
  Smile, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Watch, 
  Coffee, 
  Flame, 
  Moon,
  ChevronRight,
  Filter,
  CheckCircle2
} from "lucide-react";

interface DailyHealthJournalProps {
  patient: FamilyMember;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onRunAiPrediction?: () => void;
}

export const DailyHealthJournal: React.FC<DailyHealthJournalProps> = ({
  patient,
  onShowToast,
  onRunAiPrediction,
}) => {
  // Store all journal entries per member
  const [entriesMap, setEntriesMap] = useState<Record<string, DailyHealthJournalEntry[]>>(INITIAL_JOURNAL_ENTRIES);

  // Form / Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter state: 'all' | 'mood' | 'symptoms' | 'diet'
  const [filterType, setFilterType] = useState<"all" | "mood" | "symptoms" | "diet">("all");

  // Form Input States
  const [selectedMood, setSelectedMood] = useState<MoodType>("Tenang & Rileks");
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Tidak Ada Keluhan"]);
  const [symptomSeverity, setSymptomSeverity] = useState<"Nihil" | "Ringan" | "Sedang" | "Perlu Observasi">("Nihil");
  const [mealType, setMealType] = useState<DietLogItem["mealType"]>("Sarapan");
  const [dietDescription, setDietDescription] = useState<string>("");
  const [nutritionTag, setNutritionTag] = useState<string>("Halal & Thayyib Alami");
  const [waterIntake, setWaterIntake] = useState<number>(1.5);
  const [personalNotes, setPersonalNotes] = useState<string>("");

  // Get active member's journal entries
  const currentEntries = entriesMap[patient.id] || [];

  // Filter entries
  const filteredEntries = currentEntries.filter(entry => {
    if (filterType === "all") return true;
    if (filterType === "mood") return true; // all have mood
    if (filterType === "symptoms") {
      return entry.symptoms.length > 0 && !entry.symptoms.includes("Tidak Ada Keluhan");
    }
    if (filterType === "diet") {
      return Boolean(entry.diet?.description);
    }
    return true;
  });

  // Toggle symptom selection
  const handleToggleSymptom = (sym: string) => {
    if (sym === "Tidak Ada Keluhan") {
      setSelectedSymptoms(["Tidak Ada Keluhan"]);
      setSymptomSeverity("Nihil");
      return;
    }

    setSelectedSymptoms(prev => {
      const filtered = prev.filter(s => s !== "Tidak Ada Keluhan");
      if (filtered.includes(sym)) {
        const next = filtered.filter(s => s !== sym);
        return next.length === 0 ? ["Tidak Ada Keluhan"] : next;
      } else {
        return [...filtered, sym];
      }
    });

    if (symptomSeverity === "Nihil") {
      setSymptomSeverity("Ringan");
    }
  };

  // Submit new journal entry
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const moodDef = MOOD_DEFINITIONS.find(m => m.type === selectedMood) || MOOD_DEFINITIONS[1];

    // Compute automatic AI correlation insight with live vitals
    const correlationInsight = generateVitalsCorrelationInsight(
      patient,
      selectedMood,
      selectedSymptoms,
      dietDescription
    );

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeFormatted = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    const newEntry: DailyHealthJournalEntry = {
      id: `journal-${Date.now()}`,
      memberId: patient.id,
      memberName: patient.name,
      memberRole: patient.role,
      date: dateFormatted,
      timestamp: timeFormatted,
      mood: selectedMood,
      moodEmoji: moodDef.emoji,
      energyLevel,
      symptoms: selectedSymptoms,
      symptomSeverity: selectedSymptoms.includes("Tidak Ada Keluhan") ? "Nihil" : symptomSeverity,
      diet: {
        mealType,
        description: dietDescription || "Pola makan seimbang bernutrisi halal thayyib.",
        nutritionTag: nutritionTag || "Halal Thayyib",
        waterIntakeLiters: waterIntake,
      },
      notes: personalNotes || "Kondisi tubuh dan aktivitas harian berjalan lancar.",
      vitalsSnapshot: {
        heartRate: patient.vitals.heartRate,
        bloodPressure: patient.vitals.bloodPressure,
        bloodGlucose: patient.vitals.bloodGlucose,
        spo2: patient.vitals.spo2,
        stressLevel: patient.vitals.stressLevel,
        sleepHours: patient.vitals.sleepHours,
        steps: patient.vitals.steps,
        wearableDevice: patient.connectedWearable.deviceName,
      },
      aiCorrelationInsight: correlationInsight,
    };

    setEntriesMap(prev => ({
      ...prev,
      [patient.id]: [newEntry, ...(prev[patient.id] || [])],
    }));

    setIsFormOpen(false);
    // Reset form
    setDietDescription("");
    setPersonalNotes("");
    setSelectedSymptoms(["Tidak Ada Keluhan"]);
    setSymptomSeverity("Nihil");

    if (onShowToast) {
      onShowToast(`Catatan jurnal harian untuk ${patient.name} berhasil disimpan bersama snapshot vitals!`, "success");
    }
  };

  // Delete an entry
  const handleDeleteEntry = (entryId: string) => {
    setEntriesMap(prev => ({
      ...prev,
      [patient.id]: (prev[patient.id] || []).filter(e => e.id !== entryId),
    }));
    if (onShowToast) {
      onShowToast("Catatan jurnal berhasil dihapus.", "info");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* HEADER WITH NEW ENTRY BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Jurnal Kesehatan Harian
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300/40">
                Terintegrasi Vitals Wearable
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Catatan suasana hati, keluhan fisik, dan nutrisi diet harian <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.name}</span> yang tersinkronisasi dengan tanda vital.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Jurnal Baru</span>
        </button>
      </div>

      {/* LIVE TELEMETRY SNAPSHOT INFO STRIP */}
      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-200">Biomarker Saat Ini ({patient.name}):</span>
          <span className="text-slate-500 dark:text-slate-400">
            Detak: <strong>{patient.vitals.heartRate} BPM</strong> · Tensi: <strong>{patient.vitals.bloodPressure} mmHg</strong> · Glukosa: <strong>{patient.vitals.bloodGlucose} mg/dL</strong> · SpO2: <strong>{patient.vitals.spo2}%</strong> · Stres: <strong>{patient.vitals.stressLevel}/100</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
          <Watch className="w-3.5 h-3.5 text-teal-500" />
          <span>Sensor: {patient.connectedWearable.deviceName}</span>
        </div>
      </div>

      {/* FILTER BUTTONS & ENTRY COUNTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </span>
          {[
            { id: "all", label: "Semua Catatan" },
            { id: "mood", label: "Suasana Hati & Energi" },
            { id: "symptoms", label: "Keluhan & Gejala Fisik" },
            { id: "diet", label: "Catatan Diet & Nutrisi" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === f.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Menampilkan <strong>{filteredEntries.length}</strong> catatan jurnal
        </span>
      </div>

      {/* JOURNAL ENTRIES FEED */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs">Belum ada catatan jurnal pada kategori ini untuk {patient.name}.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Mulai Tulis Jurnal Hari Ini
            </button>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const moodObj = MOOD_DEFINITIONS.find(m => m.type === entry.mood) || MOOD_DEFINITIONS[1];

            return (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition-all space-y-4 shadow-xs"
              >
                {/* Entry Header: Date, Timestamp, Mood Badge, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{entry.date}</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{entry.timestamp}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mood Chip */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${moodObj.bgClass} ${moodObj.borderClass} ${moodObj.textClass}`}>
                      <span>{entry.moodEmoji}</span>
                      <span>{entry.mood}</span>
                      <span className="opacity-70 font-normal">({entry.energyLevel}/5 Energi)</span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Hapus catatan ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Content Grid: Symptoms, Diet, Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left Column: Physical Symptoms & Personal Notes */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                        Keluhan & Gejala Fisik
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {entry.symptoms.map((sym, sIdx) => {
                          const isNone = sym === "Tidak Ada Keluhan";
                          return (
                            <span
                              key={sIdx}
                              className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                                isNone
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                              }`}
                            >
                              {sym}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Personal Notes */}
                    {entry.notes && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Catatan & Refleksi Harian
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                          "{entry.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Diet & Nutrition Log */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>Pola Makan & Nutrisi</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {entry.diet.mealType}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1.5">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {entry.diet.description}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                          <span className="text-teal-600 dark:text-teal-400 font-medium">
                            {entry.diet.nutritionTag}
                          </span>
                          {entry.diet.waterIntakeLiters && (
                            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                              <Droplet className="w-3 h-3" />
                              <span>{entry.diet.waterIntakeLiters} L Air</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* INTEGRATED VITALS SNAPSHOT STRIP (Stamps real sensor data directly to journal) */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 text-white shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Snapshot Vitals Terintegrasi ({entry.vitalsSnapshot.wearableDevice})</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">Terekam Otomatis Saat Jurnal Disimpan</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-white/10">
                      <span className="text-[10px] text-slate-400 block">Detak Nadi</span>
                      <span className="font-bold text-white flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>{entry.vitalsSnapshot.heartRate} BPM</span>
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-white/10">
                      <span className="text-[10px] text-slate-400 block">Tekanan Darah</span>
                      <span className="font-bold text-white flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3 text-blue-400" />
                        <span>{entry.vitalsSnapshot.bloodPressure} mmHg</span>
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-white/10">
                      <span className="text-[10px] text-slate-400 block">Gula Darah</span>
                      <span className="font-bold text-white flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>{entry.vitalsSnapshot.bloodGlucose} mg/dL</span>
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-white/10">
                      <span className="text-[10px] text-slate-400 block">Saturasi SpO2</span>
                      <span className="font-bold text-white flex items-center justify-center gap-1">
                        <Droplet className="w-3 h-3 text-cyan-400" />
                        <span>{entry.vitalsSnapshot.spo2}%</span>
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-white/10 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block">Indeks Stres</span>
                      <span className="font-bold text-white flex items-center justify-center gap-1">
                        <Smile className="w-3 h-3 text-purple-400" />
                        <span>{entry.vitalsSnapshot.stressLevel}/100</span>
                      </span>
                    </div>
                  </div>

                  {/* AI Cross-Analysis Correlation Insight */}
                  {entry.aiCorrelationInsight && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Analisis Korelasi AI: </strong>
                        <span className="text-slate-300">{entry.aiCorrelationInsight}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODAL: TULIS JURNAL BARU */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tulis Jurnal Kesehatan Harian
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Untuk <strong className="text-slate-800 dark:text-slate-200">{patient.name}</strong> ({patient.role}) · Sinkronisasi Otomatis Vitals
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitEntry} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              
              {/* 1. SUASANA HATI (MOOD) & ENERGY */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  1. Bagaimana Suasana Hati & Tingkat Energi Hari Ini?
                </label>
                
                {/* Mood Select Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MOOD_DEFINITIONS.map(mood => {
                    const isSelected = selectedMood === mood.type;
                    return (
                      <button
                        key={mood.type}
                        type="button"
                        onClick={() => setSelectedMood(mood.type)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${mood.bgClass} ${mood.borderClass} ${mood.textClass} ring-2 ring-teal-500/30 font-bold shadow-xs`
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{mood.emoji}</span>
                        <span className="text-xs leading-tight">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Energy Slider */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Tingkat Energi Fisik: <strong className="text-teal-600 font-bold">{energyLevel} / 5</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEnergyLevel(lvl)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          energyLevel >= lvl
                            ? "bg-amber-400 text-slate-950 shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        ⚡
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. KELUHAN & GEJALA FISIK */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    2. Gejala Fisik atau Keluhan yang Dirasakan
                  </label>
                  <span className="text-[11px] text-slate-500">Pilih satu atau lebih</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {COMMON_SYMPTOMS_LIST.map(sym => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleToggleSymptom(sym)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? sym === "Tidak Ada Keluhan"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. CATATAN DIET & NUTRISI */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  3. Catatan Pola Makan & Diet Harian
                </label>

                {/* Meal Type Segmented */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["Sarapan", "Makan Siang", "Makan Malam", "Kudapan / Camilan", "Puasa Sunnah"] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMealType(m)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        mealType === m
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Diet description textarea */}
                <textarea
                  rows={2}
                  value={dietDescription}
                  onChange={e => setDietDescription(e.target.value)}
                  placeholder="Contoh: Oatmeal pisang madu, telur rebus, air kelapa muda hangat..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Tag Nutrisi / Fokus:</span>
                    <input
                      type="text"
                      value={nutritionTag}
                      onChange={e => setNutritionTag(e.target.value)}
                      placeholder="e.g. Tinggi Serat, Rendah Garam, Thayyib"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Asupan Air Bersih (Liter):</span>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={10}
                      value={waterIntake}
                      onChange={e => setWaterIntake(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. CATATAN & REFLEKSI BEBAS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  4. Catatan Tambahan / Refleksi Kesehatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={personalNotes}
                  onChange={e => setPersonalNotes(e.target.value)}
                  placeholder="Bagaimana perasaan tubuh Anda secara keseluruhan? Apakah ada pemicu lelah atau hal positif hari ini?"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* 5. PREVIEW VITALS YANG AKAN DI-STAMP */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                  <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Snapshot Telemetri Vitals yang Akan Disimpan Otomatis:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{patient.connectedWearable.deviceName}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Denyut: <strong>{patient.vitals.heartRate} BPM</strong> · Tensi: <strong>{patient.vitals.bloodPressure} mmHg</strong> · Glukosa: <strong>{patient.vitals.bloodGlucose} mg/dL</strong> · SpO2: <strong>{patient.vitals.spo2}%</strong> · Stres: <strong>{patient.vitals.stressLevel}/100</strong>
                </p>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
                >
                  Simpan Catatan Jurnal
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
