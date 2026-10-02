import React, { useState, useEffect, useRef } from "react";
import { FamilyMember, EmergencyFirstAidGuidance, FirstAidStep } from "../types";
import { 
  Heart, 
  Wind, 
  UserCheck, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  ListChecks, 
  Check, 
  Hospital, 
  Siren, 
  Radio, 
  BrainCircuit,
  Info,
  ChevronRight,
  Flame,
  Zap,
  ArrowRight
} from "lucide-react";

interface AiFirstAidGuideProps {
  patient: FamilyMember;
  ambulanceEtaMinutes?: number;
  onConditionChange?: (conditionName: string) => void;
  initialConditionKey?: string;
}

const EMERGENCY_CONDITIONS = [
  {
    key: "chest_pain",
    title: "Nyeri Dada Akut / Suspek Jantung",
    shortLabel: "Nyeri Dada / Jantung",
    icon: "🫀",
    color: "from-rose-600 to-red-700",
  },
  {
    key: "stroke",
    title: "Suspek Serangan Stroke (FAST)",
    shortLabel: "Suspek Stroke (FAST)",
    icon: "🧠",
    color: "from-purple-600 to-indigo-700",
  },
  {
    key: "unconscious",
    title: "Pingsan / Tidak Sadar / Henti Jantung (CPR)",
    shortLabel: "Tidak Sadar / CPR",
    icon: "🩸",
    color: "from-red-700 to-rose-900",
  },
  {
    key: "dyspnea",
    title: "Sesak Napas Berat / Asma Akut",
    shortLabel: "Sesak Napas / Asma",
    icon: "🫁",
    color: "from-cyan-600 to-blue-700",
  },
  {
    key: "trauma",
    title: "Pendarahan Hebat / Cedera Fisik",
    shortLabel: "Pendarahan / Cedera",
    icon: "🤕",
    color: "from-amber-600 to-orange-700",
  },
  {
    key: "hypoglycemia",
    title: "Gula Darah Drop / Lemas Ekstrem",
    shortLabel: "Gula Darah Drop",
    icon: "⚡",
    color: "from-yellow-600 to-amber-700",
  },
];

export const AiFirstAidGuide: React.FC<AiFirstAidGuideProps> = ({
  patient,
  ambulanceEtaMinutes = 4,
  onConditionChange,
  initialConditionKey,
}) => {
  // Selected condition
  const [selectedConditionKey, setSelectedConditionKey] = useState<string>(initialConditionKey || "chest_pain");
  const [isConscious, setIsConscious] = useState<boolean>(initialConditionKey === "unconscious" ? false : true);

  useEffect(() => {
    if (initialConditionKey && initialConditionKey !== selectedConditionKey) {
      setSelectedConditionKey(initialConditionKey);
      if (initialConditionKey === "unconscious") {
        setIsConscious(false);
      }
    }
  }, [initialConditionKey]);

  // Guidance data & loading
  const [guidance, setGuidance] = useState<EmergencyFirstAidGuidance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // CPR Metronome State (110 BPM)
  const [isCprMetronomeActive, setIsCprMetronomeActive] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const metronomeIntervalRef = useRef<any>(null);
  const [cprVisualBeat, setCprVisualBeat] = useState<boolean>(false);

  // Timer for active step
  const [stepTimerSeconds, setStepTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Fetch AI First Aid Guidance
  const fetchGuidance = async (condKey: string, conscious: boolean) => {
    setIsLoading(true);
    const condObj = EMERGENCY_CONDITIONS.find(c => c.key === condKey);
    const title = condObj?.title || "Kondisi Darurat Medis";

    if (onConditionChange) {
      onConditionChange(title);
    }

    try {
      const response = await fetch("/api/ai/first-aid-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          conditionKey: condKey,
          conditionTitle: title,
          patientConscious: conscious,
          ambulanceEtaMinutes,
        }),
      });
      const data = await response.json();
      if (data.success && data.guidance) {
        setGuidance(data.guidance);
        setActiveStepIndex(0);
        setCompletedSteps({});
        // Initialize first step timer if present
        if (data.guidance.steps?.[0]?.timerSeconds) {
          setStepTimerSeconds(data.guidance.steps[0].timerSeconds);
        } else {
          setStepTimerSeconds(null);
        }
        setIsTimerRunning(false);
      }
    } catch (err) {
      console.error("Gagal mengambil panduan pertolongan pertama:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount & when patient changes
  useEffect(() => {
    fetchGuidance(selectedConditionKey, isConscious);
  }, [selectedConditionKey, isConscious, patient.id]);

  // Handle condition switch
  const handleSelectCondition = (key: string) => {
    setSelectedConditionKey(key);
    // If unconscious selected, auto set isConscious to false
    if (key === "unconscious") {
      setIsConscious(false);
    }
  };

  // Step Timer Effect
  useEffect(() => {
    let timer: any;
    if (isTimerRunning && stepTimerSeconds !== null && stepTimerSeconds > 0) {
      timer = setInterval(() => {
        setStepTimerSeconds(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (stepTimerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, stepTimerSeconds]);

  // CPR Metronome Sound (Web Audio API synthesis at 110 BPM)
  const toggleCprMetronome = () => {
    if (isCprMetronomeActive) {
      // Stop
      setIsCprMetronomeActive(false);
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    } else {
      // Start 110 BPM (approx 545ms interval)
      setIsCprMetronomeActive(true);
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current && AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }

        const playTick = () => {
          setCprVisualBeat(true);
          setTimeout(() => setCprVisualBeat(false), 120);

          if (audioContextRef.current && audioContextRef.current.state !== "suspended") {
            const osc = audioContextRef.current.createOscillator();
            const gain = audioContextRef.current.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // High sharp click
            gain.gain.setValueAtTime(0.18, audioContextRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(audioContextRef.current.destination);
            osc.start();
            osc.stop(audioContextRef.current.currentTime + 0.09);
          }
        };

        playTick();
        metronomeIntervalRef.current = setInterval(playTick, 545);
      } catch (err) {
        console.warn("Metronome audio not supported:", err);
      }
    }
  };

  // Clean up CPR Metronome on unmount
  useEffect(() => {
    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Text-To-Speech (Bacakan Langkah Panduan Suara)
  const toggleSpeechGuidance = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!guidance || !guidance.steps[activeStepIndex]) return;

      const currentStep = guidance.steps[activeStepIndex];
      const textToSpeak = `Langkah ${currentStep.stepNumber}. ${currentStep.title}. Tindakan: ${currentStep.action}. Penting: ${guidance.immediateWarning}`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "id-ID";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Toggle Step Checkbox
  const handleToggleStepCompleted = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Move to Next Step
  const handleNextStep = () => {
    if (!guidance) return;
    if (activeStepIndex < guidance.steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      const nextStep = guidance.steps[nextIdx];
      if (nextStep.timerSeconds) {
        setStepTimerSeconds(nextStep.timerSeconds);
      } else {
        setStepTimerSeconds(null);
      }
      setIsTimerRunning(false);
    }
  };

  const handlePrevStep = () => {
    if (!guidance) return;
    if (activeStepIndex > 0) {
      const prevIdx = activeStepIndex - 1;
      setActiveStepIndex(prevIdx);
      const prevStep = guidance.steps[prevIdx];
      if (prevStep.timerSeconds) {
        setStepTimerSeconds(prevStep.timerSeconds);
      } else {
        setStepTimerSeconds(null);
      }
      setIsTimerRunning(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 p-4 sm:p-5 shadow-sm">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-600/30 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Panduan Pertolongan Pertama Real-Time (AI First Aid)
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sebelum Ambulans Tiba</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instruksi tindakan gawat darurat langkah-demi-langkah yang disesuaikan dengan kondisi <strong className="text-slate-800 dark:text-slate-200">{patient.name}</strong>.
            </p>
          </div>
        </div>

        {/* Status Kesadaran Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <span className="text-[10px] font-bold text-slate-500 px-1.5">Kesadaran:</span>
          <button
            type="button"
            onClick={() => setIsConscious(true)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              isConscious
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Sadar
          </button>
          <button
            type="button"
            onClick={() => setIsConscious(false)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              !isConscious
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Tidak Sadar
          </button>
        </div>
      </div>

      {/* 1. KONDISI DARURAT SELECTOR CHIPS */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          Pilih Gejala / Kondisi Darurat yang Sedang Terjadi:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EMERGENCY_CONDITIONS.map(cond => {
            const isSelected = selectedConditionKey === cond.key;
            return (
              <button
                key={cond.key}
                type="button"
                onClick={() => handleSelectCondition(cond.key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-red-50 dark:bg-red-950/60 border-red-500 ring-2 ring-red-500/30 text-red-950 dark:text-white font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                <span className="text-lg shrink-0">{cond.icon}</span>
                <span className="text-xs leading-tight truncate">{cond.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-3 border-red-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Menyusun Protokol Pertolongan Pertama Medis...
          </p>
        </div>
      )}

      {/* GUIDANCE CONTENT */}
      {guidance && !isLoading && (
        <div className="space-y-4">
          
          {/* IMMEDIATE CRITICAL WARNING BANNER */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce text-amber-200 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-red-200 block">
                Peringatan Tindakan Kritis!
              </span>
              <p className="text-xs sm:text-sm font-extrabold leading-snug">
                {guidance.immediateWarning}
              </p>
              <p className="text-[11px] text-red-100">
                {guidance.patientStatus}
              </p>
            </div>
          </div>

          {/* AUDIO CPR METRONOME WIDGET (Visible if CPR is recommended) */}
          {guidance.cprMetronomeRecommended && (
            <div className={`p-4 rounded-xl border transition-all ${
              cprVisualBeat
                ? "bg-rose-500 text-white border-rose-600 scale-[1.01]"
                : "bg-slate-900 text-white border-rose-900"
            } flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-transform ${
                  cprVisualBeat ? "scale-115 bg-white text-rose-600" : "bg-rose-600 text-white"
                }`}>
                  <Heart className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Metronom Irama Resusitasi CPR
                    </span>
                    <span className="text-[10px] bg-rose-950 px-2 py-0.5 rounded font-mono font-bold text-rose-300">
                      110 BPM
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Ketukan audio panduan kompresi dada 100-120 kali/menit sesuai standar AHA/PMI.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleCprMetronome}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isCprMetronomeActive
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300 animate-pulse"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                {isCprMetronomeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isCprMetronomeActive ? "Hentikan Irama Metronom" : "Nyalakan Irama CPR (110 BPM)"}</span>
              </button>
            </div>
          )}

          {/* STEP-BY-STEP ACTION CAROUSEL / INTERACTIVE GUIDE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            
            {/* Steps Progress Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {guidance.steps.map((step, idx) => {
                  const isDone = completedSteps[idx];
                  const isActive = activeStepIndex === idx;
                  return (
                    <button
                      key={step.stepNumber}
                      type="button"
                      onClick={() => {
                        setActiveStepIndex(idx);
                        if (step.timerSeconds) setStepTimerSeconds(step.timerSeconds);
                        else setStepTimerSeconds(null);
                        setIsTimerRunning(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-red-600 text-white shadow-sm"
                          : isDone
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{step.stepNumber}</span>}
                      <span>Langkah {step.stepNumber}</span>
                    </button>
                  );
                })}
              </div>

              {/* Voice Read-Aloud Button */}
              <button
                type="button"
                onClick={toggleSpeechGuidance}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isSpeaking
                    ? "bg-amber-500 text-slate-950 animate-pulse"
                    : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
                title="Dengarkan panduan suara hands-free"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
                <span className="hidden sm:inline">{isSpeaking ? "Hentikan Suara" : "Bacakan Suara"}</span>
              </button>
            </div>

            {/* Active Step Details */}
            {guidance.steps[activeStepIndex] && (
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
                      Langkah {guidance.steps[activeStepIndex].stepNumber} dari {guidance.steps.length}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {guidance.steps[activeStepIndex].title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStepCompleted(activeStepIndex)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      completedSteps[activeStepIndex]
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{completedSteps[activeStepIndex] ? "Langkah Selesai ✓" : "Tandai Selesai"}</span>
                  </button>
                </div>

                {/* Primary Action Box */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 shadow-xs space-y-2">
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed font-semibold">
                    👉 {guidance.steps[activeStepIndex].action}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <strong>Alasan Klinis: </strong>{guidance.steps[activeStepIndex].rational}
                  </p>
                </div>

                {/* Step Timer (if applicable) */}
                {stepTimerSeconds !== null && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        Hitung Waktu Langkah:
                      </span>
                      <span className="font-mono text-base font-black text-red-600 dark:text-red-400">
                        {stepTimerSeconds} detik
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        {isTimerRunning ? "Jeda" : "Mulai Hitung"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setStepTimerSeconds(guidance.steps[activeStepIndex].timerSeconds || 30);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Reset hitungan waktu"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Next / Previous Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={activeStepIndex === 0}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    ← Langkah Sebelumnya
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={activeStepIndex >= guidance.steps.length - 1}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Langkah Selanjutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* DO's & DON'Ts TWO-COLUMN MATRIX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* DO LIST */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 space-y-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Wajib Dilakukan (DO):</span>
              </span>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {guidance.doList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DON'T LIST */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 space-y-2">
              <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Dilarang Keras (DON'T):</span>
              </span>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {guidance.dontList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold shrink-0">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AMBULANCE PREPARATION CHECKLIST */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-red-600" />
                <span>Persiapan Menyambut Kedatangan Paramedis Ambulans (ETA ~{ambulanceEtaMinutes} mnt):</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {guidance.ambulancePreparation.map((prep, pIdx) => (
                <div key={pIdx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-950 text-red-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {pIdx + 1}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {prep}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
