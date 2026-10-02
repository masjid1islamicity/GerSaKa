import React, { useState, useEffect, useRef } from "react";
import { FamilyMember, DoctorSpecialist, MedicalSecondOpinion } from "../types";
import { SPECIALIST_DOCTORS } from "../data/mockData";
import { MedicalSecondOpinionPanel } from "./MedicalSecondOpinionPanel";
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  Pill, 
  Sparkles, 
  Award, 
  Stethoscope,
  Activity,
  Heart,
  FileCheck,
  CheckCircle,
  Share2,
  BrainCircuit
} from "lucide-react";

interface TeleconsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
  onPrescriptionIssued?: (medName: string, dosage: string) => void;
}

export const TeleconsultationModal: React.FC<TeleconsultationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onPrescriptionIssued
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSpecialist>(SPECIALIST_DOCTORS[0]);
  const [preCallTab, setPreCallTab] = useState<"doctor_select" | "second_opinion">("doctor_select");
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active">("idle");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "doctor" | "patient"; text: string; time: string }>>([
    {
      sender: "doctor",
      text: `Halo ${patient.name}, saya ${selectedDoctor.name}. Saya telah menerima telemetri tanda vital Anda. Bagaimana keluhan atau kondisi saat ini?`,
      time: "09:00"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (callStatus === "active") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Update initial doctor greeting when selected doctor changes
  useEffect(() => {
    if (callStatus === "idle") {
      setChatMessages([
        {
          sender: "doctor",
          text: `Halo ${patient.name}, saya ${selectedDoctor.name}. Saya telah menerima telemetri tanda vital Anda. Bagaimana keluhan atau kondisi saat ini?`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [selectedDoctor, patient, callStatus]);

  // Attempt real user media if permitted
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (callStatus === "active" && isVideoOn && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.log("Webcam optional fallback active:", err);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [callStatus, isVideoOn]);

  const startCall = () => {
    setCallStatus("connecting");
    setTimeout(() => {
      setCallStatus("active");
    }, 1800);
  };

  const endCall = () => {
    setCallStatus("idle");
    setPreCallTab("doctor_select");
  };

  const handleStartCallWithOpinion = (opinion: MedicalSecondOpinion) => {
    const timeNow = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const briefMessage = `📋 [AI Medical Second Opinion Pra-Konsultasi Terlampir]\n\n• Asesmen Utama: ${opinion.primaryAssessment}\n• Tingkat Urgensi: ${opinion.urgencyLevel} (Skor Keyakinan: ${opinion.confidenceScore}%)\n• Ringkasan Klinis: ${opinion.clinicalSummary}\n\n• Pertanyaan Utama yang Ingin Didiskusikan:\n1. ${opinion.recommendedQuestionsForDoctor[0] || "Peninjauan efektivitas terapi rumatan"}\n2. ${opinion.recommendedQuestionsForDoctor[1] || "Penyesuaian gaya hidup & dosis"}`;

    setChatMessages(prev => [
      ...prev,
      {
        sender: "patient",
        text: briefMessage,
        time: timeNow,
      },
      {
        sender: "doctor",
        text: `Halo ${patient.name}, saya telah membaca ringkasan AI Medical Second Opinion Anda. Analisis riwayat medis dan pertanyaan yang diajukan sangat komprehensif. Mari kita diskusikan langsung sekarang.`,
        time: timeNow,
      }
    ]);
    startCall();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const timeNow = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    setChatMessages(prev => [...prev, { sender: "patient", text: userText, time: timeNow }]);
    setInputMessage("");
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          patientContext: {
            name: patient.name,
            role: patient.role,
            age: patient.age,
            vitals: patient.vitals,
            doctorName: selectedDoctor.name,
            specialty: selectedDoctor.specialty
          }
        })
      });
      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, {
          sender: "doctor",
          text: data.reply,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleIssuePrescription = () => {
    setPrescriptionSent(true);
    if (onPrescriptionIssued) {
      onPrescriptionIssued(
        selectedDoctor.id === "doc-01" ? "Amlodipine Besylate 5mg" : "Multivitamin Anti-Inflamasi LimoCity",
        "1x sehari sesudah makan pagi"
      );
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-5xl w-full border border-slate-700 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        
        {/* Header with Doctor Selector, Encryption Badge, and Pre-Call Tab Switcher */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base">Konsultasi Video Dokter Spesialis</h3>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/60">
                  <ShieldCheck className="w-3 h-3" />
                  E2EE AES-256-GCM Terenkripsi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pasien: {patient.name} ({patient.role}) • LimoCity Telehealth Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pre-Call Mode Switcher (Visible only before call starts) */}
            {callStatus === "idle" && (
              <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPreCallTab("doctor_select")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    preCallTab === "doctor_select"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Pilih Dokter
                </button>
                <button
                  type="button"
                  onClick={() => setPreCallTab("second_opinion")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    preCallTab === "second_opinion"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-teal-300" />
                  <span>AI Second Opinion</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          
          {/* Left 2 Cols: Video Stream Stage OR AI Second Opinion Panel */}
          <div className="lg:col-span-2 flex flex-col justify-between bg-slate-950 relative min-h-[360px] sm:min-h-[440px] overflow-y-auto">
            
            {callStatus === "idle" ? (
              preCallTab === "second_opinion" ? (
                /* Dedicated AI Medical Second Opinion Panel */
                <MedicalSecondOpinionPanel
                  patient={patient}
                  selectedDoctor={selectedDoctor}
                  onStartCallWithOpinion={handleStartCallWithOpinion}
                  onBackToDoctorSelect={() => setPreCallTab("doctor_select")}
                />
              ) : (
                /* Doctor Selection & Ready State */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-5 sm:p-6 space-y-4">
                  
                  {/* Highlight Banner: AI Medical Second Opinion Invitation */}
                  <div className="w-full max-w-xl p-3.5 rounded-xl bg-gradient-to-r from-teal-950/90 via-slate-900 to-indigo-950/90 border border-teal-500/40 flex items-center justify-between gap-3 text-left shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>AI Medical Second Opinion</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-400/30">Pra-Konsultasi</span>
                        </p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          Analisis riwayat rekam medis {patient.name}, alergi, dan vitals sebelum tatap muka dengan dokter.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreCallTab("second_opinion")}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Buka Telaah AI</span>
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Dokter Spesialis Berlisensi
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                    {SPECIALIST_DOCTORS.map(doc => {
                      const isSelected = doc.id === selectedDoctor.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? "bg-teal-950/70 border-teal-500 ring-2 ring-teal-500/30"
                              : "bg-slate-900 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-white truncate">{doc.name}</p>
                            <p className="text-[11px] text-teal-400 truncate">{doc.specialty}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              ⭐ {doc.rating} • SIP: {doc.sipNumber}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => setPreCallTab("second_opinion")}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-700/60 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Telaah Second Opinion Dahulu</span>
                    </button>

                    <button
                      onClick={startCall}
                      className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-900/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>Mulai Panggilan Video Sekarang</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Kanal video privat berkecepatan tinggi dengan transmisi vital real-time
                  </p>
                </div>
              )
            ) : callStatus === "connecting" ? (
              /* Connecting State */
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-6">
                <div className="w-16 h-16 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                <h4 className="text-base font-bold text-slate-200">
                  Menginisiasi Enkripsi Ruang Video...
                </h4>
                <p className="text-xs text-slate-400">
                  Menghubungkan dengan {selectedDoctor.name} ({selectedDoctor.hospital})
                </p>
              </div>
            ) : (
              /* Active Video Stage */
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[300px]">
                  
                  {/* Doctor's Main Video Feed */}
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <img
                      src={selectedDoctor.avatarUrl}
                      alt={selectedDoctor.name}
                      className="w-full h-full object-cover filter brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    
                    {/* Doctor Info Badge Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold">{selectedDoctor.name}</span>
                      <span className="text-white/60">({selectedDoctor.specialty})</span>
                    </div>

                    {/* Call Duration Overlay */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-mono font-bold text-teal-400">
                      {formatDuration(callDuration)}
                    </div>

                    {/* Patient Live Vitals HUD for the Doctor */}
                    <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <Heart className="w-4 h-4 animate-pulse fill-rose-400" />
                        <span className="font-bold">{patient.vitals.heartRate} BPM</span>
                      </div>
                      <div className="h-4 w-px bg-white/20" />
                      <div className="text-cyan-400">
                        <span className="font-bold">BP: {patient.vitals.bloodPressure}</span>
                      </div>
                      <div className="h-4 w-px bg-white/20" />
                      <div className="text-emerald-400">
                        <span className="font-bold">SpO2: {patient.vitals.spo2}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Picture-in-Picture Video */}
                  <div className="absolute bottom-4 right-4 w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-teal-500/80 shadow-2xl bg-black">
                    {isVideoOn ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-[10px] text-slate-400">
                        <VideoOff className="w-5 h-5 mb-1" />
                        <span>Kamera Nonaktif</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1.5 text-[9px] bg-black/70 px-1 rounded text-white/90">
                      Anda ({patient.role})
                    </span>
                  </div>

                </div>

                {/* Video Controls Bar */}
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-3 rounded-full text-white transition-colors cursor-pointer ${
                      isMicOn ? "bg-slate-800 hover:bg-slate-700" : "bg-red-600"
                    }`}
                    title={isMicOn ? "Mute Mikrofon" : "Aktifkan Mikrofon"}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-full text-white transition-colors cursor-pointer ${
                      isVideoOn ? "bg-slate-800 hover:bg-slate-700" : "bg-red-600"
                    }`}
                    title={isVideoOn ? "Matikan Kamera" : "Nyalakan Kamera"}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleIssuePrescription}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Dokter meresepkan obat ke apotek mitra LimoCity"
                  >
                    <Pill className="w-4 h-4" />
                    <span>{prescriptionSent ? "Resep Terkirim ✓" : "Kirim Resep Digital"}</span>
                  </button>

                  <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-transform active:scale-95 cursor-pointer"
                    title="Akhiri Panggilan"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right 1 Col: Live Medical Chat & Clinical Notes */}
          <div className="border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-[320px] lg:h-auto bg-slate-900">
            
            {/* Chat Header */}
            <div className="p-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold">Obrolan Medis Terintegrasi</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>

            {/* Chat Message Scroll Area */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, i) => {
                const isDoc = msg.sender === "doctor";
                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isDoc ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        isDoc
                          ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                          : "bg-teal-600 text-white rounded-tr-none"
                      }`}
                    >
                      <p className="text-[10px] font-bold text-teal-300 mb-1">
                        {isDoc ? selectedDoctor.name : patient.name}
                      </p>
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="text-[9px] text-white/50 block text-right mt-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isSendingChat && (
                <div className="text-[11px] text-slate-400 italic">
                  Dokter sedang mengetik analisis rekam medis...
                </div>
              )}

              {prescriptionSent && (
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-700/80 text-[11px] space-y-1">
                  <div className="flex items-center gap-1 text-indigo-300 font-bold">
                    <FileCheck className="w-4 h-4" />
                    <span>Resep Elektronik Berhasil Diterbitkan!</span>
                  </div>
                  <p className="text-slate-300">
                    Resep telah otomatis disinkronkan ke Apotek Kimia Farma Limo dan ditambahkan ke Pengingat Obat Pasien.
                  </p>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-2 bg-slate-800/80 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Tulis pesan atau pertanyaan klinis..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={isSendingChat}
                className="p-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
