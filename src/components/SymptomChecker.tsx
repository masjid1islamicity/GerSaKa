import React, { useState, useId } from "react";
import { FamilyMember, PhysicalSymptom, SymptomCheckResult, SymptomCategory, UrgencyLevel } from "../types";
import { PHYSICAL_SYMPTOMS_LIST } from "../data/symptomsData";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Flame, 
  Heart, 
  HeartPulse, 
  HelpCircle, 
  Info, 
  Loader2, 
  PhoneCall, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Siren, 
  Sparkles, 
  Stethoscope, 
  Thermometer, 
  UserCheck, 
  X, 
  Zap 
} from "lucide-react";

interface SymptomCheckerProps {
  patient: FamilyMember;
  isOpen?: boolean;
  onClose?: () => void;
  onTriggerEmergency: (conditionTitle: string, conditionKey?: string) => void;
  onOpenTeleconsult?: () => void;
  isEmbedded?: boolean;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  patient,
  isOpen = true,
  onClose,
  onTriggerEmergency,
  onOpenTeleconsult,
  isEmbedded = false,
}) => {
  // Input states
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painScale, setPainScale] = useState<number>(5);
  const [duration, setDuration] = useState<string>("1-6 jam terakhir");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [patientConscious, setPatientConscious] = useState<boolean>(true);

  // AI Analysis state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<SymptomCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form input accessible IDs
  const searchInputId = useId();
  const painSliderId = useId();
  const notesTextareaId = useId();

  const categories: ("Semua" | SymptomCategory)[] = [
    "Semua",
    "Dada & Kardiovaskular",
    "Kepala & Saraf",
    "Pernapasan",
    "Pencernaan & Perut",
    "Muskuloskeletal & Sendi",
    "Sistemik & Umum",
  ];

  // Filter symptoms
  const filteredSymptoms = PHYSICAL_SYMPTOMS_LIST.filter(sym => {
    const matchCategory = selectedCategory === "Semua" || sym.category === selectedCategory;
    const matchSearch = sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sym.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleRunAnalysis = async () => {
    if (selectedSymptoms.length === 0) {
      setErrorMsg("Pilih minimal 1 gejala fisik untuk memulai analisis triase klinis.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          selectedSymptoms,
          painScale,
          duration,
          additionalNotes,
          patientConscious,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      } else {
        throw new Error(data.error || "Gagal mendapatkan respon analisis gejala.");
      }
    } catch (err: any) {
      console.error("Symptom Check Error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan jaringan saat memproses triase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setPainScale(5);
    setDuration("1-6 jam terakhir");
    setAdditionalNotes("");
    setPatientConscious(true);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  // Helper for pain scale color and description
  const getPainDescriptor = (scale: number) => {
    if (scale <= 3) return { text: "Ringan (Dapat Ditoleransi)", color: "text-emerald-600 dark:text-emerald-400" };
    if (scale <= 6) return { text: "Sedang (Mengganggu Aktivitas)", color: "text-amber-600 dark:text-amber-400" };
    if (scale <= 8) return { text: "Berat (Sangat Menyakitkan)", color: "text-orange-600 dark:text-orange-400" };
    return { text: "Kritis / Tak Tertahankan", color: "text-red-600 dark:text-red-400 font-black animate-pulse" };
  };

  const painInfo = getPainDescriptor(painScale);

  // Content render
  const content = (
    <div className="space-y-6">
      
      {/* Patient Biometrics & Telemetry Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-lg border border-teal-400/30 shrink-0">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-sm text-white">{patient.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  {patient.role} • {patient.age} Tahun
                </span>
                <span className="text-[10px] text-slate-300">
                  Gol. Darah: <strong className="text-white">{patient.bloodType}</strong>
                </span>
              </div>
              <p className="text-[11px] text-teal-200/80 mt-0.5">
                Riwayat: <strong>{patient.medicalHistory}</strong> • Alergi: <strong>{patient.allergies?.join(", ") || "Nihil"}</strong>
              </p>
            </div>
          </div>

          {/* Live Sensor Telemetry */}
          <div className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-xl text-xs font-mono font-bold self-start sm:self-auto border border-white/10">
            <div className="flex items-center gap-1 text-rose-400" title="Detak Jantung Sensor">
              <Heart className="w-3.5 h-3.5 animate-pulse" />
              <span>{patient.vitals.heartRate} BPM</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="text-blue-300" title="Tekanan Darah">
              <span>{patient.vitals.bloodPressure}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="text-cyan-300" title="Saturasi SpO2">
              <span>{patient.vitals.spo2}% SpO2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Input & Selection, Right = Live AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Symptom Selection & Clinical Context (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* STEP 1: SELECT PHYSICAL SYMPTOMS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Pilih Gejala Fisik yang Dirasakan
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bisa memilih lebih dari satu gejala pada kategori tubuh terkait
                  </p>
                </div>
              </div>

              {selectedSymptoms.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  {selectedSymptoms.length} Gejala Terpilih
                </span>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <label htmlFor={searchInputId} className="sr-only">Cari gejala fisik spesifik</label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari gejala (misal: nyeri dada, sesak, pusing, pelo, muntah)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all cursor-pointer text-xs ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Symptoms Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredSymptoms.map(sym => {
                const isSelected = selectedSymptoms.includes(sym.name);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.name)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-500"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by button
                          className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className={`text-xs font-bold leading-snug ${isSelected ? "text-emerald-900 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200"}`}>
                          {sym.name}
                        </span>
                      </div>
                      
                      {sym.isRedFlag && (
                        <span 
                          className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0 flex items-center gap-0.5 border border-rose-300 dark:border-rose-800"
                          title="Tanda Bahaya Red Flag (Membutuhkan Atensi Cepat)"
                        >
                          <ShieldAlert className="w-2.5 h-2.5" />
                          <span>Red Flag</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 line-clamp-2">
                      {sym.description}
                    </p>
                  </button>
                );
              })}

              {filteredSymptoms.length === 0 && (
                <div className="col-span-full py-6 text-center text-slate-400 text-xs">
                  Tidak ada gejala yang cocok dengan pencarian "{searchQuery}".
                </div>
              )}
            </div>

            {/* Selected Symptoms Chips display */}
            {selectedSymptoms.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                  Gejala Terpilih ({selectedSymptoms.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.map(symName => (
                    <span
                      key={symName}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    >
                      <span>{symName}</span>
                      <button
                        type="button"
                        onClick={() => toggleSymptom(symName)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedSymptoms([])}
                    className="text-[11px] text-slate-400 hover:text-red-500 underline self-center ml-2 cursor-pointer"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: PAIN INTENSITY, DURATION & CLINICAL CONTEXT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Intensitas Nyeri & Durasi Onset
              </h4>
            </div>

            {/* Pain Scale Slider (1-10) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={painSliderId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tingkat Keparahan / Skala Nyeri:
                </label>
                <span className={`text-xs font-bold ${painInfo.color}`}>
                  Skala {painScale}/10 • {painInfo.text}
                </span>
              </div>

              <input
                id={painSliderId}
                type="range"
                min="1"
                max="10"
                step="1"
                value={painScale}
                onChange={e => setPainScale(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 (Ringan)</span>
                <span>3 (Sedikit Sakit)</span>
                <span>5 (Sedang)</span>
                <span>8 (Berat)</span>
                <span>10 (Kritis)</span>
              </div>
            </div>

            {/* Duration and Consciousness row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Duration selector */}
              <div className="space-y-1.5">
                <label htmlFor="duration-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kapan Gejala Dimulai?</span>
                </label>
                <select
                  id="duration-select"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Kurang dari 1 jam (Mendadak/Akut)">Kurang dari 1 jam (Mendadak / Akut)</option>
                  <option value="1-6 jam terakhir">1 - 6 jam terakhir</option>
                  <option value="1-2 hari">1 - 2 hari</option>
                  <option value="Lebih dari 3 hari">Lebih dari 3 hari</option>
                  <option value="Sudah berlangsung kronis berminggu-minggu">Sudah kronis berminggu-minggu</option>
                </select>
              </div>

              {/* Patient Conscious Switch */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Status Kesadaran Pasien</span>
                </label>
                <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPatientConscious(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      patientConscious
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Sadar Penuh
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientConscious(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !patientConscious
                        ? "bg-red-600 text-white shadow-xs animate-pulse"
                        : "text-slate-600 dark:text-slate-400 hover:text-red-500"
                    }`}
                  >
                    Bingung / Tidak Sadar
                  </button>
                </div>
              </div>

            </div>

            {/* Additional Notes Textarea */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor={notesTextareaId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Keluhan Tambahan / Pemicu (Opsional):
              </label>
              <textarea
                id={notesTextareaId}
                rows={2}
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                placeholder="Contoh: muncul setelah makan udang, atau nyeri timbul saat naik tangga..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Trigger AI Evaluation Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset Gejala
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isLoading || selectedSymptoms.length === 0}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Triase Klinis AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Analisis Urgensi Kesehatan Berbasis AI</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Live AI Urgency Recommendation & Direct EmergencyModal Integration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {analysisResult ? (
            /* ACTIVE RESULT CARD */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Top Urgency Badge Banner */}
              <div className={`p-5 rounded-3xl border shadow-lg text-white space-y-3 relative overflow-hidden ${
                analysisResult.urgencyLevel === "DARURAT_KRITIS"
                  ? "bg-gradient-to-br from-red-600 via-rose-600 to-red-800 border-red-400 shadow-red-600/30 animate-pulse"
                  : analysisResult.urgencyLevel === "TINGGI_MENDESAK"
                  ? "bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 border-orange-400 shadow-orange-600/30"
                  : analysisResult.urgencyLevel === "SEDANG_OBSERVASI"
                  ? "bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 border-amber-300 text-slate-950"
                  : "bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 border-emerald-400"
              }`}>
                
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {analysisResult.urgencyLevel === "DARURAT_KRITIS" ? (
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
                        <Siren className="w-5 h-5 text-white" />
                      </div>
                    ) : analysisResult.urgencyLevel === "TINGGI_MENDESAK" ? (
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-black opacity-90">
                        {analysisResult.urgencyLevel === "DARURAT_KRITIS"
                          ? "🚨 KODE MERAH • GAWAT DARURAT"
                          : analysisResult.urgencyLevel === "TINGGI_MENDESAK"
                          ? "⚠️ KODE KUNING TINGGI • MENDESAK"
                          : analysisResult.urgencyLevel === "SEDANG_OBSERVASI"
                          ? "📋 KODE KUNING • OBSERVASI DOKTER"
                          : "✅ KODE HIJAU • PERAWATAN MANDIRI"}
                      </span>
                      <p className="text-sm font-black leading-tight">
                        Skor Urgensi: {analysisResult.urgencyScore} / 100
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono opacity-80">
                    {analysisResult.checkedAt}
                  </span>
                </div>

                {/* Headline message */}
                <p className="text-xs font-semibold leading-relaxed">
                  {analysisResult.headline}
                </p>

                {/* DIRECT INTEGRATION WITH EMERGENCYMODAL (ACTION BUTTON) */}
                {analysisResult.urgencyLevel === "DARURAT_KRITIS" || analysisResult.requiresAmbulance ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onTriggerEmergency(
                        analysisResult.recommendedEmergencyConditionTitle,
                        analysisResult.recommendedEmergencyConditionKey
                      )}
                      className="w-full py-3.5 px-4 bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-red-950/40 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-2 border-white"
                    >
                      <Siren className="w-5 h-5 text-red-600 animate-spin" />
                      <span>BUKA RESPON DARURAT 119 & PANDUAN FIRST AID</span>
                    </button>
                    <p className="text-[10px] text-center text-red-100 mt-1.5">
                      Klik untuk langsung menyiarkan GPS & melihat panduan pertolongan pertama real-time
                    </p>
                  </div>
                ) : analysisResult.urgencyLevel === "TINGGI_MENDESAK" ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onTriggerEmergency(
                        analysisResult.recommendedEmergencyConditionTitle,
                        analysisResult.recommendedEmergencyConditionKey
                      )}
                      className="w-full py-3 px-4 bg-white text-orange-700 hover:bg-orange-50 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Cek Faskes Terdekat / Panggil Ambulans (EmergencyModal)</span>
                    </button>
                  </div>
                ) : null}

              </div>

              {/* Diagnosis & Clinical Correlation Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
                
                {/* Primary Suspect */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Dugaan Diagnosis Utama:
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {analysisResult.primarySuspect}
                  </p>
                </div>

                {/* Differential Diagnoses */}
                {analysisResult.differentialDiagnoses?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Diagnosis Banding Lainnya:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.differentialDiagnoses.map((diff, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                        >
                          • {diff}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Analysis Explanation */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Korelasi Klinis & Biometrik Sensor:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysisResult.clinicalAnalysis}
                  </p>
                </div>

                {/* Red Flags warnings */}
                {analysisResult.redFlags?.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                    <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 flex items-center gap-1 uppercase tracking-wider">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Tanda Bahaya yang Wajib Diwaspadai (Red Flags):
                    </span>
                    <ul className="space-y-1 text-slate-800 dark:text-slate-200 text-[11px] list-disc list-inside">
                      {analysisResult.redFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Immediate Actions */}
                {analysisResult.immediateActions?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tindakan Detik Ini yang Disarankan:
                    </span>
                    <div className="space-y-1">
                      {analysisResult.immediateActions.map((act, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Specialist & LimoCity Holistic Plan */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Rekomendasi Spesialis:</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {analysisResult.recommendedSpecialist}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-[11px] gap-2">
                    <span className="text-slate-500 shrink-0">Terapi LimoCity:</span>
                    <span className="text-slate-700 dark:text-slate-300 text-right">
                      {analysisResult.limoCityTherapyAdvice}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: EmergencyModal / Teleconsult */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => onTriggerEmergency(
                      analysisResult.recommendedEmergencyConditionTitle,
                      analysisResult.recommendedEmergencyConditionKey
                    )}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Siren className="w-4 h-4" />
                    <span>Buka EmergencyModal</span>
                  </button>

                  {onOpenTeleconsult && (
                    <button
                      type="button"
                      onClick={onOpenTeleconsult}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Telekonsultasi Dokter</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          ) : (
            /* EMPTY PLACEHOLDER STATE */
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              
              <div className="max-w-xs mx-auto space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Triase Klinis AI Belum Dijalankan
                </h4>
                <p className="text-xs text-slate-500">
                  Pilih gejala fisik yang dialami {patient.name} di sebelah kiri, tentukan skala nyeri, lalu klik tombol <strong>"Analisis Urgensi Kesehatan Berbasis AI"</strong>.
                </p>
              </div>

              {/* Quick direct emergency launch even before checking */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-left">
                <p className="text-[11px] font-bold text-red-600 mb-1 flex items-center gap-1">
                  <Siren className="w-3.5 h-3.5" />
                  Kondisi Sangat Gawat / Tidak Sadar?
                </p>
                <p className="text-[11px] text-slate-500 mb-2">
                  Jika pasien pingsan, henti napas, atau nyeri dada kolaps, jangan tunggu mengisi gejala. Segera aktifkan respon 119:
                </p>
                <button
                  type="button"
                  onClick={() => onTriggerEmergency("Kondisi Darurat Akut Tidak Sadar", "unconscious")}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer active:scale-95 transition-transform"
                >
                  <Siren className="w-4 h-4 animate-bounce" />
                  <span>Langsung Buka EmergencyModal (SOS 119)</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );

  // If embedded in a page, return directly; if modal, wrap in modal overlay
  if (isEmbedded) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">
                  Pemeriksa Gejala AI (Symptom Checker)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Triase Klinis Terintegrasi 119
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Deteksi tingkat urgensi kesehatan & panduan aksi cepat terhubung EmergencyModal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {content}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Sistem Triase Berbasis Protokol Kedokteran Gawat Darurat & AI Klinis GerSaKa LimoCity
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
