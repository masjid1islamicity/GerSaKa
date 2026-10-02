import React, { useState } from "react";
import { FamilyMember, DoctorSpecialist, MedicalSecondOpinion } from "../types";
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Copy, 
  Check, 
  HelpCircle, 
  Activity, 
  Heart, 
  Zap, 
  Droplet, 
  Clock, 
  Video, 
  ArrowLeft, 
  RefreshCw, 
  ListChecks, 
  Stethoscope,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

interface MedicalSecondOpinionPanelProps {
  patient: FamilyMember;
  selectedDoctor: DoctorSpecialist;
  onStartCallWithOpinion: (opinion: MedicalSecondOpinion) => void;
  onBackToDoctorSelect: () => void;
}

export const MedicalSecondOpinionPanel: React.FC<MedicalSecondOpinionPanelProps> = ({
  patient,
  selectedDoctor,
  onStartCallWithOpinion,
  onBackToDoctorSelect,
}) => {
  const [secondOpinion, setSecondOpinion] = useState<MedicalSecondOpinion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSpecificNotes, setUserSpecificNotes] = useState("");
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch("/api/ai/second-opinion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          doctor: selectedDoctor,
          userNotes: userSpecificNotes || patient.currentSymptoms || "Pemeriksaan rutin berkala",
        }),
      });

      const resJson = await res.json();
      if (resJson.success && resJson.analysis) {
        const raw = resJson.analysis;
        const opinion: MedicalSecondOpinion = {
          id: `so-${Date.now()}`,
          patientId: patient.id,
          patientName: patient.name,
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          generatedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          confidenceScore: raw.confidenceScore || 92,
          urgencyLevel: raw.urgencyLevel || "Rutin",
          primaryAssessment: raw.primaryAssessment || "Asesmen klinis mandiri stabil",
          clinicalSummary: raw.clinicalSummary || "Telaah rekam medis terkoordinasi dengan biomarker.",
          differentialDiagnoses: raw.differentialDiagnoses || [],
          contraindicationsAndAlerts: raw.contraindicationsAndAlerts || [],
          recommendedQuestionsForDoctor: raw.recommendedQuestionsForDoctor || [],
          suggestedDiagnosticTests: raw.suggestedDiagnosticTests || [],
          holisticLimoCityPlan: raw.holisticLimoCityPlan || "Terapi gaya hidup sirkadian teratur.",
          sourceModel: resJson.source || "Gemini 3.8 Flash Clinical AI",
        };
        setSecondOpinion(opinion);
      } else {
        throw new Error(resJson.error || "Gagal memperoleh respons analisis dari server.");
      }
    } catch (err: any) {
      console.error("Second opinion analysis error:", err);
      setError(err.message || "Gagal menghubungkan ke modul AI Second Opinion.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 space-y-5">
      
      {/* Top Breadcrumb / Nav */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <button
          onClick={onBackToDoctorSelect}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pemilihan Dokter</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-800/80">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Medical Second Opinion</span>
          </span>
        </div>
      </div>

      {/* Patient Medical Snapshot Strip */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">{patient.name}</h4>
              <span className="text-[11px] text-slate-400">({patient.role}, {patient.age} thn)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Konsultasi Dengan: <strong className="text-teal-400">{selectedDoctor.name}</strong> ({selectedDoctor.specialty})
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold">
              Gol. Darah: {patient.bloodType}
            </span>
          </div>
        </div>

        {/* Clinical Data Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Riwayat Medis Kronis</span>
            <p className="font-semibold text-slate-200 mt-0.5 leading-snug">
              {patient.medicalHistory || "Tidak ada riwayat penyakit kronis"}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Keluhan Saat Ini</span>
            <p className="font-semibold text-slate-200 mt-0.5 leading-snug">
              {patient.currentSymptoms || "Pemeriksaan berkala / evaluasi rutin"}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Alergi Terdaftar</span>
            <p className="font-semibold text-amber-400 mt-0.5 leading-snug">
              {patient.allergies?.length > 0 ? patient.allergies.join(", ") : "Nihil (Tidak Ada Alergi)"}
            </p>
          </div>
        </div>

        {/* Live Vitals Badges */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-3 text-xs flex-wrap">
          <span className="text-[11px] text-slate-500 font-bold">Vitals Terkini:</span>
          <span className="flex items-center gap-1 text-rose-400 font-semibold">
            <Heart className="w-3.5 h-3.5" />
            <span>{patient.vitals.heartRate} BPM</span>
          </span>
          <span className="flex items-center gap-1 text-blue-400 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>BP: {patient.vitals.bloodPressure}</span>
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Gula: {patient.vitals.bloodGlucose} mg/dL</span>
          </span>
          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
            <Droplet className="w-3.5 h-3.5" />
            <span>SpO2: {patient.vitals.spo2}%</span>
          </span>
        </div>
      </div>

      {/* STATE 1: NOT YET RUN */}
      {!secondOpinion && !isLoading && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/10">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-white">
              Mengapa Perlu AI Medical Second Opinion Pra-Konsultasi?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sebelum berbicara tatap muka via video dengan <strong>{selectedDoctor.name}</strong>, sistem AI akan mengkorelasikan seluruh rekam medis kronis, alergi, dan data sensor vital untuk memetakan diferensial diagnosis serta menyusun daftar pertanyaan penting yang wajib Anda tanyakan.
            </p>
          </div>

          {/* Optional User Notes */}
          <div className="max-w-md mx-auto text-left space-y-1.5 pt-2">
            <label className="text-[11px] font-bold text-slate-400 block">
              Ada keluhan atau fokus khusus yang ingin diulas AI? (Opsional)
            </label>
            <input
              type="text"
              value={userSpecificNotes}
              onChange={e => setUserSpecificNotes(e.target.value)}
              placeholder="Misal: Sering pusing saat bangun tidur, atau efek samping obat..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/60 text-xs text-rose-300 max-w-md mx-auto flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-900/40 transition-all flex items-center gap-2 mx-auto cursor-pointer active:scale-98"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Jalankan Analisis AI Medical Second Opinion</span>
            </button>
            <p className="text-[10px] text-slate-500 mt-2">
              Didukung oleh mesin penalaran klinis Gemini 3.8 Flash & protokol LimoCity
            </p>
          </div>
        </div>
      )}

      {/* STATE 2: LOADING / IN-PROGRESS */}
      {isLoading && (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 my-auto">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
            <BrainCircuit className="w-6 h-6 text-teal-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              Menjalankan Telaah Klinis AI Second Opinion...
            </h4>
            <p className="text-xs text-slate-400">
              {loadingStep === 1 && "Menganalisis riwayat medis & komorbiditas longitudinal..."}
              {loadingStep === 2 && "Mengintegrasikan telemetri vital sensor wearable real-time..."}
              {loadingStep >= 3 && "Menyusun diferensial diagnosis & panduan pertanyaan video call..."}
            </p>
          </div>

          <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${loadingStep * 33}%` }}
            />
          </div>
        </div>
      )}

      {/* STATE 3: RESULTS DISPLAY */}
      {secondOpinion && !isLoading && (
        <div className="space-y-4">
          
          {/* Main Assessment Header Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/60 border border-teal-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-400" />
                  <span>Second Opinion Siap</span>
                </span>
                <span className="text-xs text-slate-400">
                  Waktu Telaah: {secondOpinion.generatedAt}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Skor Keyakinan Klinis:</span>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {secondOpinion.confidenceScore}%
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  secondOpinion.urgencyLevel === "Rutin"
                    ? "bg-slate-800 text-slate-300"
                    : secondOpinion.urgencyLevel === "Observasi Ketat"
                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                    : "bg-rose-950 text-rose-300 border border-rose-800"
                }`}>
                  Urgensi: {secondOpinion.urgencyLevel}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Asesmen Utama Klinis
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
                {secondOpinion.primaryAssessment}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
              {secondOpinion.clinicalSummary}
            </p>
          </div>

          {/* 2-Column Grid: Differential Diagnosis & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Differential Diagnoses */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>Pertimbangan Diferensial Diagnosis</span>
              </span>
              <div className="space-y-1.5">
                {secondOpinion.differentialDiagnoses.map((diag, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2 text-xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300">{diag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contraindications & Alerts */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/60 space-y-2.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Peringatan Alergi, Obat & Red Flags</span>
              </span>
              <div className="space-y-1.5">
                {secondOpinion.contraindicationsAndAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-black/40 border border-amber-800/40 flex items-start gap-2 text-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-amber-100/90">{alert}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* CRITICAL QUESTIONS TO ASK DOCTOR (Key Feature) */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-400" />
                <span>Daftar Pertanyaan Kritis untuk Ditanyakan ke Dokter Saat Sesi Video</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Klik salin untuk mencatat
              </span>
            </div>

            <div className="space-y-2">
              {secondOpinion.recommendedQuestionsForDoctor.map((q, idx) => {
                const isCopied = copiedQuestionIndex === idx;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-all flex items-start justify-between gap-3 text-xs group"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-teal-950 text-teal-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-teal-800/60">
                        {idx + 1}
                      </span>
                      <p className="text-slate-200 leading-relaxed font-medium">{q}</p>
                    </div>

                    <button
                      onClick={() => handleCopyQuestion(q, idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      title="Salin pertanyaan ini"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Labs & Holistic Care Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Diagnostic Tests */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-teal-400" />
                <span>Pemeriksaan Penunjang yang Disarankan</span>
              </span>
              <ul className="space-y-1 text-slate-300">
                {secondOpinion.suggestedDiagnosticTests.map((t, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Holistic Plan */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Rekomendasi Terapi Holistik LimoCity</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                {secondOpinion.holisticLimoCityPlan}
              </p>
            </div>
          </div>

          {/* Action Footer: Start Call with Opinion Attached */}
          <div className="pt-2 p-4 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">
                Siap Berdiskusi Tatap Muka dengan {selectedDoctor.name}?
              </p>
              <p className="text-[11px] text-teal-200/80">
                Ringkasan Second Opinion akan otomatis dilampirkan ke ruang obrolan dokter.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSecondOpinion(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Ubah / Telaah Ulang
              </button>

              <button
                onClick={() => onStartCallWithOpinion(secondOpinion)}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Mulai Video Call dengan Second Opinion</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
