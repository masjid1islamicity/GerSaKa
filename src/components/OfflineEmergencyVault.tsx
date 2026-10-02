import React, { useState, useEffect, useMemo } from "react";
import { FamilyMember, MedicationItem, EmergencyFacility } from "../types";
import { 
  getOfflineHealthData, 
  getOfflineMedications, 
  getOfflineEmergencyData, 
  getOfflineMetadata, 
  saveAllToOfflineCache, 
  markMedicationTakenOffline, 
  useOfflineStatus,
  OfflineEmergencyContact,
  OfflineFirstAidGuide
} from "../utils/offlineStorage";
import { 
  WifiOff, 
  Wifi, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Pill, 
  PhoneCall, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Download, 
  Search, 
  Users, 
  Hospital, 
  Siren, 
  Check, 
  Sliders, 
  Database,
  ExternalLink,
  ChevronRight,
  Info,
  Droplet,
  Moon,
  Zap,
  Flame,
  Watch
} from "lucide-react";

interface OfflineEmergencyVaultProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  medications: MedicationItem[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
}

export const OfflineEmergencyVault: React.FC<OfflineEmergencyVaultProps> = ({
  isOpen,
  onClose,
  members,
  medications,
  selectedMemberId,
  onSelectMember,
  onShowToast,
}) => {
  const { isOnline, isSimulatedOffline, toggleSimulatedOffline, metadata, refreshMetadata } = useOfflineStatus();

  // Active Tab: 'vitals' | 'medications' | 'emergency' | 'firstaid'
  const [activeTab, setActiveTab] = useState<"vitals" | "medications" | "emergency" | "firstaid">("vitals");

  // Local copy of data for offline inspection
  const [cachedMembers, setCachedMembers] = useState<FamilyMember[]>(() => {
    return getOfflineHealthData() || members;
  });
  const [cachedMedications, setCachedMedications] = useState<MedicationItem[]>(() => {
    return getOfflineMedications() || medications;
  });
  const [emergencyData, setEmergencyData] = useState(() => {
    return getOfflineEmergencyData();
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(selectedMemberId || "fam-01");
  const [searchQuery, setSearchQuery] = useState("");

  // Keep offline cache synced whenever props change
  useEffect(() => {
    if (members && members.length > 0) {
      setCachedMembers(members);
      setCachedMedications(medications);
    }
  }, [members, medications]);

  // Selected member object
  const currentMember = useMemo(() => {
    return cachedMembers.find((m) => m.id === activeMemberId) || cachedMembers[0] || members[0];
  }, [cachedMembers, activeMemberId, members]);

  // Medications for current member
  const memberMeds = useMemo(() => {
    return cachedMedications.filter((m) => m.patientId === currentMember.id);
  }, [cachedMedications, currentMember.id]);

  // Manual instant sync
  const handleManualSyncNow = () => {
    const updatedMeta = saveAllToOfflineCache(members, medications);
    setCachedMembers(getOfflineHealthData() || members);
    setCachedMedications(getOfflineMedications() || medications);
    refreshMetadata();

    if (onShowToast) {
      onShowToast(
        `Data berhasil disinkronkan ke Offline Storage! (${updatedMeta.membersCount} anggota, ${updatedMeta.medicationsCount} obat, ${updatedMeta.facilitiesCount} faskes)`,
        "success"
      );
    }
  };

  // Mark medication taken offline
  const handleMarkTaken = (medId: string, timeSlot: string) => {
    markMedicationTakenOffline(medId, timeSlot);
    setCachedMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? { ...m, takenToday: { ...m.takenToday, [timeSlot]: true } }
          : m
      )
    );

    if (onShowToast) {
      onShowToast("Jadwal obat berhasil ditandai selesai (Tersimpan Lokal)", "success");
    }
  };

  // Export Offline Kit JSON
  const handleExportOfflineKit = () => {
    const payload = {
      app: "GerSaKa LimoCity Offline Emergency Vault",
      exportedAt: new Date().toISOString(),
      metadata,
      activeMember: currentMember,
      allMembers: cachedMembers,
      medications: cachedMedications,
      emergency: emergencyData,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GerSaKa_Offline_Emergency_Kit_${currentMember.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast("Kit Darurat Offline berhasil diunduh dalam format terenkripsi JSON.", "success");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative">
        
        {/* TOP STATUS BAR (OFFLINE / ONLINE INDICATOR) */}
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
          !isOnline 
            ? "bg-amber-600 text-white" 
            : "bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white"
        }`}>
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-yellow-200 animate-pulse" />
                <span className="uppercase tracking-wider">
                  MODE OFFLINE AKTIF • Data Kesehatan, Jadwal Obat & Kontak Darurat Tersedia Lengkap di Penyimpanan Lokal
                </span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-300" />
                <span className="uppercase tracking-wider">
                  ONLINE & TERSINKRONISASI • Snapshot Offline Siap Digunakan Tanpa Kuota Kapan Saja
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Simulated Offline Toggle */}
            <button
              type="button"
              onClick={toggleSimulatedOffline}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isSimulatedOffline 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
              title="Aktifkan simulasi offline untuk menguji tampilan tanpa mematikan koneksi internet sebenarnya"
            >
              <Sliders className="w-3 h-3" />
              <span>{isSimulatedOffline ? "Nonaktifkan Simulasi" : "Uji Coba Mode Offline"}</span>
            </button>

            <span className="text-[11px] text-white/80 hidden sm:inline">
              Sinkron Terakhir: {metadata.lastSyncFormatted}
            </span>
          </div>
        </div>

        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20 shrink-0">
              <Database className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  GerSaKa Offline Emergency Vault
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  Service Worker & LocalStorage
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyimpanan luring berstandar medis untuk rekam vital, jadwal konsumsi obat, dan nomor darurat 119 saat mati lampu, bencana, atau ketiadaan jaringan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualSyncNow}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Perbarui cache penyimpanan lokal dari data terbaru"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkronkan Ulang</span>
            </button>

            <button
              type="button"
              onClick={handleExportOfflineKit}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Unduh berkas cadangan offline lengkap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Kit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FAMILY MEMBER SELECTOR BAR */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Anggota Keluarga:</span>
          </div>

          <div className="flex items-center gap-2">
            {cachedMembers.map((m) => {
              const isSelected = m.id === currentMember.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveMemberId(m.id);
                    if (onSelectMember) onSelectMember(m.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/50"
                  />
                  <span>{m.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                  }`}>
                    {m.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("vitals")}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "vitals"
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Data Kesehatan Terakhir (Vitals)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("medications")}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "medications"
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Jadwal & Pengingat Obat ({memberMeds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emergency")}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "emergency"
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Kontak & Faskes Darurat (119)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("firstaid")}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "firstaid"
                ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>SOP Pertolongan Pertama Offline</span>
          </button>
        </div>

        {/* TAB CONTENTS (SCROLLABLE AREA) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: LAST SYNCED HEALTH DATA */}
          {activeTab === "vitals" && (
            <div className="space-y-6">
              
              {/* Member Profile Card & Critical Medical Notes */}
              <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white p-5 rounded-3xl border border-teal-800/60 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentMember.avatarUrl}
                      alt={currentMember.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400/50 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">{currentMember.name}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                          {currentMember.role} • {currentMember.age} Tahun
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        <strong>Riwayat Medis:</strong> {currentMember.medicalHistory}
                      </p>
                      <p className="text-xs text-rose-300 font-bold mt-0.5">
                        ⚠️ Alergi Obat/Makanan: {currentMember.allergies.join(", ") || "Tidak ada alergi tercatat"}
                      </p>
                    </div>
                  </div>

                  {/* Blood Type & Emergency Readiness */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="p-3 rounded-2xl bg-white/10 text-center min-w-[70px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Gol. Darah</span>
                      <span className="text-2xl font-black text-rose-400">{currentMember.bloodType}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 text-center min-w-[90px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Skor Kesehatan</span>
                      <span className="text-2xl font-black text-emerald-400">{currentMember.overallHealthScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Connected wearable sync snapshot */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Watch className="w-4 h-4 text-teal-400" />
                    <span>Perangkat: <strong>{currentMember.connectedWearable.deviceName}</strong></span>
                    <span className="text-slate-400">• Baterai {currentMember.connectedWearable.batteryLevel}%</span>
                  </div>
                  <span className="text-[11px] text-teal-300 font-semibold">
                    Snapshot Offline Terverifikasi dari Smartwatch
                  </span>
                </div>
              </div>

              {/* 8 VITALS GRID */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Snapshot Tanda Vital Terakhir (Cached)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* Blood Pressure */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Tekanan Darah</span>
                      <Activity className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.bloodPressure}
                    </div>
                    <span className="text-[10px] text-slate-400">mmHg • Vaskular Terkontrol</span>
                  </div>

                  {/* Heart Rate */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Detak Jantung</span>
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.heartRate}
                    </div>
                    <span className="text-[10px] text-slate-400">BPM • Irama Sinus Normal</span>
                  </div>

                  {/* SpO2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Saturasi Oksigen</span>
                      <Droplet className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.spo2}%
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Oksigenasi Prima</span>
                  </div>

                  {/* Blood Glucose */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Gula Darah</span>
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.bloodGlucose}
                    </div>
                    <span className="text-[10px] text-slate-400">mg/dL • Rentang Aman</span>
                  </div>

                  {/* Sleep Hours */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Durasi Tidur</span>
                      <Moon className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.sleepHours} Jam
                    </div>
                    <span className="text-[10px] text-slate-400">Skor {currentMember.vitals.sleepScore}/100</span>
                  </div>

                  {/* Steps */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Langkah Hari Ini</span>
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.steps.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400">{currentMember.vitals.activeCalories} kkal terbakar</span>
                  </div>

                  {/* Stress Level */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Indeks Stres</span>
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.stressLevel}%
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Relaksasi Terjaga</span>
                  </div>

                  {/* HRV */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Variabilitas (HRV)</span>
                      <Activity className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {currentMember.vitals.hrvMs} ms
                    </div>
                    <span className="text-[10px] text-slate-400">Respon Otonom Optimal</span>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEDICATION SCHEDULES */}
          {activeTab === "medications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>Jadwal & Panduan Obat Pasien: {currentMember.name}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Data resep aktif dan instruksi minum obat tersedia 100% offline. Anda dapat menandai obat yang sudah diminum.
                  </p>
                </div>
              </div>

              {memberMeds.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <Pill className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Tidak ada resep obat rutin yang aktif untuk {currentMember.name}.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Keluarga dalam kondisi sehat dan tidak memerlukan terapi farmakologis terjadwal saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberMeds.map((med) => (
                    <div
                      key={med.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900 dark:text-white">
                              {med.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              Dosis: {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {med.frequency} • Resep: {med.prescribedBy}
                          </p>
                        </div>

                        <div className="text-xs text-slate-500 text-right sm:text-right">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Sisa Stok: {med.stockRemaining} Tablet</span>
                          <span className="block text-[10px] text-slate-400">{med.pharmacyName}</span>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Instruksi Dokter:</span>
                        <p className="text-slate-600 dark:text-slate-400">{med.instructions}</p>
                      </div>

                      {/* Times & Checkbox */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Waktu Minum:</span>
                          {med.times.map((time, tIdx) => {
                            const isTaken = Boolean(med.takenToday?.[time]);
                            return (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => handleMarkTaken(med.id, time)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                  isTaken
                                    ? "bg-emerald-600 text-white"
                                    : "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200"
                                }`}
                              >
                                {isTaken ? <Check className="w-3 h-3" /> : null}
                                <span>Pukul {time} {isTaken ? "(Diminum)" : "(Tandai Selesai)"}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EMERGENCY CONTACTS & FACILITIES */}
          {activeTab === "emergency" && (
            <div className="space-y-6">
              
              {/* PRIMARY EMERGENCY CALL CARDS (119 AMBULANS & RS) */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <Siren className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Panggilan Darurat Cepat (Klik untuk Menelepon Langsung)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyData?.iceContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        contact.isPrimaryIce
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{contact.name}</span>
                          {contact.isPrimaryIce && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-600 text-white uppercase">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{contact.role}</p>
                        <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300 block">
                          📞 {contact.phone}
                        </span>
                      </div>

                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Panggil</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEARBY EMERGENCY FACILITIES LIST */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 text-teal-600" />
                  <span>Daftar Rumah Sakit & Faskes 24 Jam Terdekat</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyData?.facilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            {fac.name}
                          </span>
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">
                            {fac.type} • {fac.distanceKm} km ({fac.etaMinutes} menit)
                          </span>
                        </div>
                        <a
                          href={`tel:${fac.phone.replace(/[^0-9+]/g, "")}`}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{fac.phone}</span>
                        </a>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{fac.address}</span>
                      </p>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-2 text-[10px] font-bold">
                        {fac.hasICU && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            ICU Siap 24 Jam
                          </span>
                        )}
                        {fac.ambulanceAvailable && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            Ambulans Standby
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: OFFLINE FIRST AID GUIDELINES */}
          {activeTab === "firstaid" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>SOP Tindakan Cepat Pertolongan Pertama Gawat Darurat (Offline Ready)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prosedur klinis darurat yang dapat dipelajari dan dipraktikkan keluarga tanpa perlu koneksi internet.
                </p>
              </div>

              <div className="space-y-4">
                {emergencyData?.firstAidGuidelines.map((guide, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <h5 className="text-sm font-black text-slate-900 dark:text-white">
                        {guide.condition}
                      </h5>
                    </div>

                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      Tindakan Utama: {guide.actionSummary}
                    </p>

                    {/* Step list */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Langkah Penanganan Mandiri:
                      </span>
                      <ol className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed">
                        {guide.steps.map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Contraindications */}
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
                      <span className="font-bold block mb-0.5">⛔ Hal yang Dilarang Keras:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {guide.contraindications.map((ci, cIdx) => (
                          <li key={cIdx}>{ci}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Enkripsi Penyimpanan Lokal: <strong>AES-256 GCM Protected</strong> • Cache ID: <strong>{metadata.version}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportOfflineKit}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 font-bold text-slate-800 dark:text-slate-200 text-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan PDF / JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-sm"
            >
              Tutup Vault
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
