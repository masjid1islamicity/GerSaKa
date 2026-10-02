import React, { useState, useEffect } from "react";
import { FamilyMember, EmergencyFacility, EmergencyDispatch } from "../types";
import { EMERGENCY_FACILITIES } from "../data/mockData";
import { AiFirstAidGuide } from "./AiFirstAidGuide";
import { SymptomChecker } from "./SymptomChecker";
import { 
  X, 
  AlertTriangle, 
  PhoneCall, 
  Navigation, 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Users, 
  Radio,
  Siren,
  Hospital,
  Sparkles,
  HeartPulse,
  BrainCircuit,
  Stethoscope
} from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
  initialConditionTitle?: string;
  initialConditionKey?: string;
  initialTab?: "first_aid" | "dispatch" | "symptom_checker";
  onOpenTeleconsult?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  patient,
  initialConditionTitle,
  initialConditionKey,
  initialTab = "first_aid",
  onOpenTeleconsult,
}) => {
  const [activeTab, setActiveTab] = useState<"first_aid" | "dispatch" | "symptom_checker">(initialTab);
  const [selectedConditionTitle, setSelectedConditionTitle] = useState<string>(
    initialConditionTitle || "Nyeri Dada Akut / Suspek Jantung"
  );
  const [conditionKey, setConditionKey] = useState<string>(initialConditionKey || "chest_pain");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<EmergencyDispatch | null>(null);

  useEffect(() => {
    if (initialConditionTitle) {
      setSelectedConditionTitle(initialConditionTitle);
    }
    if (initialConditionKey) {
      setConditionKey(initialConditionKey);
    }
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialConditionTitle, initialConditionKey, initialTab]);

  const handleTriggerSOS = async () => {
    setIsDispatching(true);
    try {
      const response = await fetch("/api/emergency/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patient.name,
          condition: selectedConditionTitle || `Kondisi Darurat Vaskular/Vital (${patient.therapyProgram})`,
          vitals: patient.vitals,
          location: "Kecamatan Limo, Kota Depok, Jawa Barat",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setDispatchResult({
          dispatchId: data.dispatchId,
          patientName: patient.name,
          timestamp: new Date().toLocaleTimeString("id-ID"),
          status: "DISPATCHED_CRITICAL",
          targetHospital: data.dispatchedUnit.targetHospital,
          ambulanceCode: data.dispatchedUnit.ambulanceCode,
          team: data.dispatchedUnit.team,
          etaMinutes: data.dispatchedUnit.etaMinutes,
          vitalsSnapshot: patient.vitals,
          encryptedHash: data.encryptedMedicalRecordHash,
        });
        // Stay or switch to first aid so family can immediately act while ambulance drives
        setActiveTab("first_aid");
      }
    } catch (err) {
      console.error("SOS Dispatch Error:", err);
    } finally {
      setIsDispatching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-red-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border-2 border-red-500 shadow-2xl overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Urgent Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce shrink-0">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl tracking-tight">
                  RESPON GAWAT DARURAT MEDIS (SOS 119)
                </h3>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Panduan Pertolongan Pertama AI & Integrasi Ambulans LimoCity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick Hotline direct link */}
            <a
              href="tel:119"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-red-700 font-black text-xs shadow-md hover:bg-red-50 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Hubungi 119</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Biometrics Snapshot Strip */}
        <div className="px-5 py-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-red-800 dark:text-red-300">
              Pasien: {patient.name} ({patient.role}, {patient.age} thn)
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">
              Gol. Darah: <strong>{patient.bloodType}</strong> • Riwayat: <strong>{patient.medicalHistory}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono font-bold text-[11px] self-start sm:self-auto">
            <span className="text-rose-600 dark:text-rose-400">HR: {patient.vitals.heartRate} BPM</span>
            <span className="text-blue-600 dark:text-blue-400">BP: {patient.vitals.bloodPressure}</span>
            <span className="text-cyan-600 dark:text-cyan-400">SpO2: {patient.vitals.spo2}%</span>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="px-5 pt-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("first_aid")}
              className={`pb-2.5 px-3 font-extrabold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "first_aid"
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>1. Panduan Pertolongan Pertama (AI First Aid)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dispatch")}
              className={`pb-2.5 px-3 font-extrabold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "dispatch"
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Siren className="w-4 h-4" />
              <span>2. Ambulans & Faskes Terdekat</span>
              {dispatchResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("symptom_checker")}
              className={`pb-2.5 px-3 font-extrabold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "symptom_checker"
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>3. Pemeriksa Gejala (Symptom Checker)</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
                AI
              </span>
            </button>
          </div>

          {/* Quick status pill */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] pb-2 text-slate-500">
            {dispatchResult ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Ambulans OTW (~{dispatchResult.etaMinutes} mnt)</span>
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Ambulans Siaga 119
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* TAB 1: AI FIRST AID STEP-BY-STEP GUIDANCE */}
          {activeTab === "first_aid" && (
            <div className="space-y-4">
              
              {/* If ambulance is dispatched, show prominent ETA banner */}
              {dispatchResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
                    <Siren className="w-5 h-5 text-emerald-600 animate-bounce shrink-0" />
                    <div>
                      <p className="text-xs font-black">
                        Ambulans Sedang Meluncur ke Lokasi (ETA {dispatchResult.etaMinutes} Menit)
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Unit {dispatchResult.ambulanceCode} ({dispatchResult.team.join(", ")}). Lakukan pertolongan pertama di bawah ini:
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("dispatch")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                  >
                    Lihat Peta & Status Ambulans
                  </button>
                </div>
              )}

              {/* Main AI First Aid Guide Component */}
              <AiFirstAidGuide
                patient={patient}
                ambulanceEtaMinutes={dispatchResult?.etaMinutes || 4}
                onConditionChange={setSelectedConditionTitle}
                initialConditionKey={conditionKey}
              />

              {/* Quick switch to Symptom Checker banner */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Gejala Pasien Mengarah ke Kondisi Lain?
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Gunakan fitur Pemeriksa Gejala (Symptom Checker) untuk kalkulasi tingkat urgensi otomatis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("symptom_checker")}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-slate-800 dark:text-slate-200 text-xs shrink-0 cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Buka Pemeriksa Gejala</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </button>
              </div>

              {/* Action: If not dispatched yet, quick prominent button to trigger ambulance */}
              {!dispatchResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Belum Memanggil Ambulans?
                    </h4>
                    <p className="text-xs text-red-100">
                      Panggil unit paramedis 119 sekarang agar bergerak bersamaan saat Anda memberikan pertolongan pertama.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerSOS}
                    disabled={isDispatching}
                    className="px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>{isDispatching ? "Menghubungi Faskes..." : "Panggil Ambulans 119 Sekarang"}</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: AMBULANCE DISPATCH & HOSPITAL FACILITIES */}
          {activeTab === "dispatch" && (
            <div className="space-y-5">
              
              {/* Active Dispatch Status Display */}
              {dispatchResult ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
                      <span className="font-bold text-sm">Unit Ambulans Berhasil Diberangkatkan!</span>
                    </div>
                    <span className="text-xs font-mono bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded font-bold">
                      {dispatchResult.dispatchId}
                    </span>
                  </div>

                  {/* ETA and Ambulance Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
                      <p className="text-[11px] text-slate-500 font-semibold">Estimasi Tiba (ETA)</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {dispatchResult.etaMinutes} Menit
                      </p>
                      <p className="text-[10px] text-slate-400">Jalur Prioritas Sirene Darurat Aktif</p>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
                      <p className="text-[11px] text-slate-500 font-semibold">Unit & Paramedis</p>
                      <p className="font-bold text-slate-900 dark:text-white">{dispatchResult.ambulanceCode}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        {dispatchResult.team.join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Target Facility & E2EE Transmission */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Rumah Sakit Rujukan: {dispatchResult.targetHospital.name}
                      </span>
                      <span className="text-emerald-600 font-bold">{dispatchResult.targetHospital.phone}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      📍 Lokasi Pasien: Jl. Raya Limo / Cinere (-6.3688, 106.7885)
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Rekam Medis Terenkripsi Dikirim ke IGD (Hash: {dispatchResult.encryptedHash})</span>
                    </div>
                  </div>

                  {/* Button to back to First Aid guide */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("first_aid")}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                      <span>Kembali ke Panduan Pertolongan Pertama (First Aid)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Dispatch Confirmation Action Button */
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                  <div className="max-w-md mx-auto">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      Konfirmasi Panggilan Ambulans 119
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Kondisi Terpilih: <strong className="text-red-600">{selectedConditionTitle}</strong>. Sistem akan mengunci koordinat GPS, menyiarkan status vital ke IGD RS LimoCity dan armada ambulans terdekat.
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerSOS}
                    disabled={isDispatching}
                    className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/40 transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                  >
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span>{isDispatching ? "Menghubungi Faskes..." : "PANGGIL AMBULANS & FASKES 119 SEKARANG"}</span>
                  </button>
                </div>
              )}

              {/* List of Nearest Emergency Facilities with Hotline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Hospital className="w-3.5 h-3.5 text-red-600" />
                  <span>Daftar Fasilitas Kesehatan Terdekat (Limo - Cinere - Depok)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EMERGENCY_FACILITIES.map(facility => (
                    <div
                      key={facility.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {facility.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            {facility.distanceKm} km ({facility.etaMinutes} mnt)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {facility.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <span className="text-[10px] text-slate-400">
                          {facility.hasICU ? "ICU & Ambulans Siaga" : "Instalasi Gawat Darurat 24 Jam"}
                        </span>
                        <a
                          href={`tel:${facility.phone.replace(/[^0-9]/g, "")}`}
                          className="flex items-center gap-1 text-red-600 font-bold hover:underline"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{facility.phone}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AI SYMPTOM CHECKER & HEALTH URGENCY RECOMMENDATION */}
          {activeTab === "symptom_checker" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Pemeriksaan Gejala Fisik Berbasis AI Terintegrasi Faskes 119
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pilih gejala fisik di bawah untuk mendapatkan skor urgensi klinis dan rekomendasi langsung protokol darurat.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("first_aid")}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  Kembali ke First Aid
                </button>
              </div>

              <SymptomChecker
                patient={patient}
                isEmbedded={true}
                onTriggerEmergency={(condTitle, condKey) => {
                  setSelectedConditionTitle(condTitle);
                  if (condKey) setConditionKey(condKey);
                  setActiveTab("first_aid");
                }}
                onOpenTeleconsult={onOpenTeleconsult}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Kanal Tanggap Darurat Medis LimoCity Therapy Response 24 Jam
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

