import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { FamilyOverview } from "./components/FamilyOverview";
import { DoctorAnalyticsView } from "./components/DoctorAnalyticsView";
import { AiPredictionModal } from "./components/AiPredictionModal";
import { NutritionModal } from "./components/NutritionModal";
import { EmergencyModal } from "./components/EmergencyModal";
import { TeleconsultationModal } from "./components/TeleconsultationModal";
import { MedicationTracker } from "./components/MedicationTracker";
import { HospitalPaymentModal } from "./components/HospitalPaymentModal";
import { SecurityAuthModal } from "./components/SecurityAuthModal";
import { ReportExportModal } from "./components/ReportExportModal";
import { FitCityKpiView } from "./components/FitCityKpiView";
import { SymptomChecker } from "./components/SymptomChecker";
import { OfflineEmergencyVault } from "./components/OfflineEmergencyVault";
import { OfflineNotificationBanner } from "./components/OfflineNotificationBanner";
import { IslamicityBerjagaView } from "./components/IslamicityBerjagaView";
import { ProactiveHealthAlertModal } from "./components/ProactiveHealthAlertModal";
import { saveAllToOfflineCache } from "./utils/offlineStorage";
import { ProactiveHealthAlert } from "./types/proactiveAlerts";
import { 
  generateHeuristicProactiveAlerts, 
  fetchProactiveHealthAlerts, 
  getStoredProactiveAlerts, 
  saveStoredProactiveAlerts,
  playProactiveAlertChime
} from "./utils/proactiveAlertEngine";

import { INITIAL_FAMILY_MEMBERS, INITIAL_MEDICATIONS } from "./data/mockData";
import { FamilyMember, MedicationItem } from "./types";
import { 
  Heart, 
  ShieldCheck, 
  Watch, 
  Bell, 
  CreditCard, 
  Stethoscope, 
  CheckCircle,
  AlertTriangle,
  Info,
  Landmark,
  Sparkles
} from "lucide-react";

export default function App() {
  // Theme & Accessibility States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gersaka_theme") === "dark";
    }
    return false;
  });
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  // Navigation Tab: "family" | "doctor" | "admin" | "fitcity" | "berjaga"
  const [currentTab, setCurrentTab] = useState<"family" | "doctor" | "admin" | "fitcity" | "berjaga">("family");

  // Clinical & Patient Data States
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("fam-01");
  const [medications, setMedications] = useState<MedicationItem[]>(INITIAL_MEDICATIONS);

  // Security & 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Modals Open/Close States
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isTeleconsultOpen, setIsTeleconsultOpen] = useState(false);
  const [isMedicationOpen, setIsMedicationOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);
  const [isOfflineVaultOpen, setIsOfflineVaultOpen] = useState(false);
  const [isProactiveAlertModalOpen, setIsProactiveAlertModalOpen] = useState(false);
  const [isScanningAlerts, setIsScanningAlerts] = useState(false);

  // Proactive Health Alert System State
  const [proactiveAlerts, setProactiveAlerts] = useState<ProactiveHealthAlert[]>(() => {
    const stored = getStoredProactiveAlerts();
    if (stored && stored.length > 0) return stored;
    const initial: ProactiveHealthAlert[] = [];
    INITIAL_FAMILY_MEMBERS.forEach(m => {
      initial.push(...generateHeuristicProactiveAlerts(m).alerts);
    });
    return initial;
  });

  useEffect(() => {
    saveStoredProactiveAlerts(proactiveAlerts);
  }, [proactiveAlerts]);

  const unreadAlertsCount = proactiveAlerts.filter(a => !a.isRead).length;

  const handleMarkAlertAsRead = (alertId: string) => {
    setProactiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  const handleMarkAllAlertsAsRead = () => {
    setProactiveAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    showToast("Seluruh notifikasi peringatan dini telah ditandai dibaca.", "info");
  };

  const handleTakeAlertAction = (alertId: string) => {
    setProactiveAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          isActionTaken: true,
          isRead: true,
          severity: "stabilizing",
          severityLabel: "Stabil Terkendali",
        };
      }
      return a;
    }));
  };

  // Dynamic initial emergency conditions passed from SymptomChecker
  const [emergencyInitialTitle, setEmergencyInitialTitle] = useState<string | undefined>();
  const [emergencyInitialKey, setEmergencyInitialKey] = useState<string | undefined>();

  // Background Wearable Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(Date.now());
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  // Active Member selector
  const activeMember = members.find(m => m.id === selectedMemberId) || members[0];

  // Dark Mode side effect on root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gersaka_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gersaka_theme", "light");
    }
  }, [darkMode]);

  // Keep offline cache synced automatically for offline emergency availability
  useEffect(() => {
    saveAllToOfflineCache(members, medications);
  }, [members, medications]);

  // Subtle real-time heart rate variation simulation for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers(prev => prev.map(member => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        const newHR = Math.max(58, Math.min(110, member.vitals.heartRate + delta));
        return {
          ...member,
          vitals: {
            ...member.vitals,
            heartRate: newHR,
          }
        };
      }));
      setLastSyncTimestamp(Date.now());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (text: string, type: "success" | "info" | "warning" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Direct Integration: Launch EmergencyModal from SymptomChecker with triaged condition
  const handleTriggerEmergencyFromSymptoms = (conditionTitle: string, conditionKey?: string) => {
    setEmergencyInitialTitle(conditionTitle);
    setEmergencyInitialKey(conditionKey);
    setIsSymptomCheckerOpen(false);
    setIsEmergencyOpen(true);
    showToast(`🚨 Mengaktifkan protokol darurat 119: ${conditionTitle}`, "warning");
  };

  // Trigger wearable telemetry pull from server
  const handleSyncWearable = async () => {
    setIsSyncing(true);
    showToast("Menghubungi sensor wearable bluetooth...", "info");
    try {
      const response = await fetch("/api/sync/wearable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: activeMember.id }),
      });
      const data = await response.json();
      if (data.success && data.vitals) {
        const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setMembers(prev => prev.map(m => {
          if (m.id === activeMember.id) {
            return {
              ...m,
              vitals: {
                ...m.vitals,
                ...data.vitals,
              },
              connectedWearable: {
                ...m.connectedWearable,
                lastSync: nowTime,
                batteryLevel: Math.min(100, m.connectedWearable.batteryLevel + 1),
              }
            };
          }
          return m;
        }));
        setLastSyncTimestamp(Date.now());
        showToast(`Sinkronisasi telemetri ${activeMember.name} selesai. Data terbaru tersimpan terenkripsi.`, "success");
      }
    } catch (err) {
      console.error("Wearable sync error:", err);
      showToast("Sinkronisasi gagal, periksa koneksi sensor.", "warning");
    } finally {
      setIsSyncing(false);
    }
  };

  // Medication adherence toggle
  const handleToggleTakeMed = (medId: string, time: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medId) {
        const currentVal = Boolean(med.takenToday[time]);
        return {
          ...med,
          takenToday: {
            ...med.takenToday,
            [time]: !currentVal,
          },
          stockRemaining: !currentVal ? Math.max(0, med.stockRemaining - 1) : med.stockRemaining,
        };
      }
      return med;
    }));
    showToast("Status minum obat diperbarui pada log kepatuhan medis.", "success");
  };

  const handleAddMedication = (newMed: MedicationItem) => {
    setMedications(prev => [newMed, ...prev]);
    showToast(`Obat ${newMed.name} berhasil ditambahkan ke jadwal.`, "success");
  };

  const handlePrescriptionIssued = (medName: string, dosage: string) => {
    const newMed: MedicationItem = {
      id: "med-" + Date.now(),
      patientId: activeMember.id,
      name: medName,
      dosage: dosage,
      frequency: "1x sehari",
      times: ["08:00"],
      instructions: "Resep Elektronik Dokter Spesialis LimoCity",
      prescribedBy: "dr. Dokter Spesialis LimoCity",
      pharmacyName: "Apotek Kimia Farma Limo",
      rxNumber: "RX-E2EE-" + Math.floor(10000 + Math.random() * 90000),
      stockRemaining: 30,
      takenToday: { "08:00": false },
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    setMedications(prev => [newMed, ...prev]);
    showToast(`Resep elektronik (${medName}) otomatis masuk ke jadwal obat dan diteruskan ke apotek!`, "success");
  };

  const handleRunAiAlertScan = async () => {
    setIsScanningAlerts(true);
    showToast(`🔍 Menjalankan pemindaian AI proaktif terhadap tren tanda vital ${activeMember.name}...`, "info");
    try {
      const res = await fetchProactiveHealthAlerts(activeMember);
      setProactiveAlerts(prev => {
        const otherAlerts = prev.filter(a => a.patientId !== activeMember.id);
        return [...res.alerts, ...otherAlerts];
      });

      const hasEarlyAnomaly = res.alerts.some(a => a.severity !== "stabilizing");
      if (hasEarlyAnomaly) {
        playProactiveAlertChime("early_warning");
        showToast(`⚠️ Terdeteksi ${res.activeAnomaliesCount} potensi anomali pra-kritis! Tindakan pencegahan diaktifkan.`, "warning");
      } else {
        showToast(`✅ Seluruh parameter tanda vital ${activeMember.name} berada dalam koridor aman.`, "success");
      }
    } finally {
      setIsScanningAlerts(false);
    }
  };

  const handleSimulateAlertScenario = (type: "bp_surge" | "hrv_drop" | "spo2_dip") => {
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    let newAlert: ProactiveHealthAlert;

    if (type === "bp_surge") {
      newAlert = {
        id: `alert-sim-bp-${Date.now()}`,
        patientId: activeMember.id,
        patientName: activeMember.name,
        patientRole: activeMember.role,
        avatarUrl: activeMember.avatarUrl,
        title: "Simulasi Lonjakan Tensi Mendadak (Pre-Crisis Hypertensive Surge)",
        vitalMetric: "Tekanan Darah",
        currentReading: "148/92 mmHg",
        baselineReading: "120/80 mmHg",
        percentageDrift: 23,
        severity: "moderate_anomaly",
        severityLabel: "Peringatan Anomali Moderat",
        probabilityOfCriticalPct: 82,
        estimatedHoursToCritical: 8,
        timeframeHorizon: "Prognosis 8 Jam",
        trendAnalysis: "Simulasi mendeteksi lonjakan resistensi vaskular tajam (+28 mmHg) dalam 6 jam terakhir sebelum keluhan klinis muncul.",
        rootCauseHypothesis: "Vasokonstriksi akut akibat stres kerja akumulatif dan dehidrasi mikrovaskular.",
        actionSteps: [
          {
            stepNumber: 1,
            title: "Rehidrasi 500 ml Air Putih Thayyib Segera",
            description: "Menurunkan viskositas plasma dan meringankan tahanan vaskular perifer.",
            estimatedEffect: "Penurunan tensi 4-6 mmHg dalam 30 menit"
          },
          {
            stepNumber: 2,
            title: "Relaksasi Pernapasan Box Breathing 4-4-4-4",
            description: "Menstimulasi saraf parasimpatis untuk menekan lonjakan simpatis.",
            estimatedEffect: "Menstabilkan irama jantung"
          }
        ],
        sunnahHerbalAdvice: "Konsumsi 1 sendok makan minyak zaitun extra virgin dan jadwalkan bekam sunnah titik Al-Kahil.",
        clinicalRationale: "Mencegah komplikasi vaskular akut atau krisis ensefalopati hipertensi.",
        detectedAt: nowTime,
        isRead: false,
        isDismissed: false,
        isActionTaken: false,
        sourceWearable: activeMember.connectedWearable.deviceName,
        sourceModel: "GerSaKa Anomaly Simulator"
      };
    } else if (type === "hrv_drop") {
      newAlert = {
        id: `alert-sim-hrv-${Date.now()}`,
        patientId: activeMember.id,
        patientName: activeMember.name,
        patientRole: activeMember.role,
        avatarUrl: activeMember.avatarUrl,
        title: "Simulasi Kelelahan Sistem Saraf Otonom (Acute Autonomic Strain)",
        vitalMetric: "Detak Jantung & HRV",
        currentReading: "HRV 32 ms (RHR: 86 BPM)",
        baselineReading: "HRV 58 ms",
        percentageDrift: -44,
        severity: "moderate_anomaly",
        severityLabel: "Peringatan Anomali Moderat",
        probabilityOfCriticalPct: 75,
        estimatedHoursToCritical: 18,
        timeframeHorizon: "Prognosis 18 Jam",
        trendAnalysis: "Penurunan tajam variabilitas detak jantung mengindikasikan dominasi simpatis ekstrem.",
        rootCauseHypothesis: "Kelelahan fisik berlebih dan kurang tidur restoratif.",
        actionSteps: [
          {
            stepNumber: 1,
            title: "Istirahat Total 30 Menit Tanpa Layar Digital",
            description: "Memejamkan mata dan berdzikir untuk memulihkan tonus parasimpatis.",
            estimatedEffect: "Peningkatan HRV +10-15 ms"
          }
        ],
        sunnahHerbalAdvice: "Minum madu murni dicampur air hangat.",
        clinicalRationale: "Mencegah aritmia dan sindrom kelelahan kronis.",
        detectedAt: nowTime,
        isRead: false,
        isDismissed: false,
        isActionTaken: false,
        sourceWearable: activeMember.connectedWearable.deviceName,
        sourceModel: "GerSaKa Anomaly Simulator"
      };
    } else {
      newAlert = {
        id: `alert-sim-spo2-${Date.now()}`,
        patientId: activeMember.id,
        patientName: activeMember.name,
        patientRole: activeMember.role,
        avatarUrl: activeMember.avatarUrl,
        title: "Simulasi Fluktuasi Desaturasi Oksigen Nokturnal",
        vitalMetric: "Saturasi O2",
        currentReading: "94% SPO2",
        baselineReading: "98% - 99% SPO2",
        percentageDrift: -4,
        severity: "early_warning",
        severityLabel: "Peringatan Dini Hipoksia",
        probabilityOfCriticalPct: 62,
        estimatedHoursToCritical: 24,
        timeframeHorizon: "Prognosis 24 Jam",
        trendAnalysis: "Saturasi oksigen turun di bawah ambang fisiologis saat fase tidur.",
        rootCauseHypothesis: "Penyempitan jalan nafas saat tidur terlentang.",
        actionSteps: [
          {
            stepNumber: 1,
            title: "Tidur Miring ke Sisi Kanan",
            description: "Posisi tidur sunnah untuk melancarkan saluran respirasi.",
            estimatedEffect: "Menaikkan SPO2 +2%"
          }
        ],
        sunnahHerbalAdvice: "Aromaterapi minyak kayu putih / mint.",
        clinicalRationale: "Mencegah hipoksia serebral dini.",
        detectedAt: nowTime,
        isRead: false,
        isDismissed: false,
        isActionTaken: false,
        sourceWearable: activeMember.connectedWearable.deviceName,
        sourceModel: "GerSaKa Anomaly Simulator"
      };
    }

    setProactiveAlerts(prev => [newAlert, ...prev]);
    playProactiveAlertChime(newAlert.severity);
    showToast(`🚨 Simulasi: '${newAlert.title}' berhasil ditambahkan ke sistem peringatan dini!`, "warning");
  };

  // Font size multiplier class
  const fontSizeClass = fontSize === "large" ? "text-base" : fontSize === "xlarge" ? "text-lg" : "text-sm";

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${fontSizeClass}`}>
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : toastMessage.type === "warning"
              ? "bg-amber-600 text-white border-amber-500"
              : "bg-slate-900 text-white border-slate-700"
          }`}>
            {toastMessage.type === "success" && <CheckCircle className="w-4 h-4" />}
            {toastMessage.type === "warning" && <AlertTriangle className="w-4 h-4" />}
            {toastMessage.type === "info" && <Info className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Top Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenWearableSync={handleSyncWearable}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onOpenReminders={() => setIsProactiveAlertModalOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenBackup={() => {
          setIsSecurityOpen(true);
        }}
        wearableSyncCount={members.length}
        unreadNotifications={unreadAlertsCount}
        onOpenSymptomChecker={() => setIsSymptomCheckerOpen(true)}
        onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
      />

      {/* Persistent Offline Status Banner */}
      <OfflineNotificationBanner onOpenOfflineVault={() => setIsOfflineVaultOpen(true)} />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: FAMILY HEALTH OVERVIEW */}
        {currentTab === "family" && (
          <FamilyOverview
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            onRunAiPrediction={() => setIsPredictionOpen(true)}
            onOpenNutrition={() => setIsNutritionOpen(true)}
            onOpenTeleconsult={() => setIsTeleconsultOpen(true)}
            onOpenMedication={() => setIsMedicationOpen(true)}
            onOpenPayment={() => setIsPaymentOpen(true)}
            onSyncWearable={handleSyncWearable}
            isSyncing={isSyncing}
            onShowToast={showToast}
            lastSyncTimestamp={lastSyncTimestamp}
            onNavigateToFitCity={() => setCurrentTab("fitcity")}
            onNavigateToBerjaga={() => setCurrentTab("berjaga")}
            onOpenSymptomChecker={() => setIsSymptomCheckerOpen(true)}
            onTriggerEmergency={handleTriggerEmergencyFromSymptoms}
            onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
            proactiveAlerts={proactiveAlerts}
            onOpenProactiveModal={() => setIsProactiveAlertModalOpen(true)}
          />
        )}

        {/* TAB 2: ISLAMICITY BERJAGA (BERGERAK, BEKERJA, BERBEKAM, BERDAKWAH, BERSYARIAH, BERJAMAAH, BERMUAMALAH - SAMPAI BAHAGIA SEJAHTERA) */}
        {currentTab === "berjaga" && (
          <IslamicityBerjagaView
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            onShowToast={showToast}
            onNavigateToFamily={() => setCurrentTab("family")}
            onNavigateToDoctor={() => setCurrentTab("doctor")}
            onSyncWearable={handleSyncWearable}
            isSyncing={isSyncing}
          />
        )}

        {/* TAB 3: DOCTOR CLINICAL DASHBOARD & LONGITUDINAL TRENDS */}
        {currentTab === "doctor" && (
          <DoctorAnalyticsView
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenTeleconsult={() => setIsTeleconsultOpen(true)}
          />
        )}

        {/* TAB 4: FITCITY KEY PERFORMANCE INDEX CERDAS BERDAYA WILAYAH DAULAH ISLAMICITY */}
        {currentTab === "fitcity" && (
          <FitCityKpiView
            members={members}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            onShowToast={showToast}
            onNavigateToFamily={() => setCurrentTab("family")}
            onNavigateToDoctor={() => setCurrentTab("doctor")}
          />
        )}

        {/* TAB 5: HOSPITAL ADMINISTRATION & PAYMENT GATEWAY */}
        {currentTab === "admin" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Portal Administrasi & Pembayaran RS LimoCity</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kelola tagihan perawatan medis, e-resep farmasi, sesi terapi, dan integrasi penjaminan BPJS Kesehatan keluarga Anda.
                </p>
              </div>
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buka Pembayaran & Tagihan Aktif</span>
              </button>
            </div>

            {/* Embedded Medication schedule view in admin/quick access */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Resep Farmasi Terdaftar & Log Terapi
                </h3>
                <button
                  onClick={() => setIsMedicationOpen(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Kelola Pengingat Obat →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {medications.map(med => (
                  <div key={med.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>{med.name} ({med.dosage})</span>
                      <span className="text-emerald-600 font-mono">{med.rxNumber}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{med.instructions} • {med.pharmacyName}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              G
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              GerSaKa — Gerakan Sehat Keluarga LimoCity Therapy
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              E2EE Enkripsi Medis Terjaga
            </span>
            <span>•</span>
            <span>IGD 24 Jam: (021) 754-8900</span>
            <span>•</span>
            <span>© 2026 LimoCity Health Inc.</span>
          </div>
        </div>
      </footer>

      {/* ALL MODAL DIALOGS */}
      
      {/* 1. AI Disease Prediction Modal */}
      <AiPredictionModal
        isOpen={isPredictionOpen}
        onClose={() => setIsPredictionOpen(false)}
        patient={activeMember}
        onConnectDoctor={() => {
          setIsPredictionOpen(false);
          setIsTeleconsultOpen(true);
        }}
      />

      {/* 2. Personalized Nutrition & Smart Meal Plan Modal */}
      <NutritionModal
        isOpen={isNutritionOpen}
        onClose={() => setIsNutritionOpen(false)}
        patient={activeMember}
      />

      {/* 3. Emergency SOS & Nearest Faskes Dispatch Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => {
          setIsEmergencyOpen(false);
          setEmergencyInitialTitle(undefined);
          setEmergencyInitialKey(undefined);
        }}
        patient={activeMember}
        initialConditionTitle={emergencyInitialTitle}
        initialConditionKey={emergencyInitialKey}
        onOpenTeleconsult={() => {
          setIsEmergencyOpen(false);
          setIsTeleconsultOpen(true);
        }}
      />

      {/* 4. Telehealth Video Consultation & E-Prescription Modal */}
      <TeleconsultationModal
        isOpen={isTeleconsultOpen}
        onClose={() => setIsTeleconsultOpen(false)}
        patient={activeMember}
        onPrescriptionIssued={handlePrescriptionIssued}
      />

      {/* 5. Medication Tracker & Schedule Modal */}
      <MedicationTracker
        isOpen={isMedicationOpen}
        onClose={() => setIsMedicationOpen(false)}
        patient={activeMember}
        medications={medications}
        onToggleTakeMed={handleToggleTakeMed}
        onAddMedication={handleAddMedication}
      />

      {/* 6. Hospital Payment Administration Gateway Modal */}
      <HospitalPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* 7. Security, Biometrics, 2FA & Cloud Backup Modal */}
      <SecurityAuthModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        patient={activeMember}
        is2FAEnabled={is2FAEnabled}
        onToggle2FA={() => {
          setIs2FAEnabled(!is2FAEnabled);
          showToast(is2FAEnabled ? "2FA dinonaktifkan." : "2FA berhasil diaktifkan.", "info");
        }}
      />

      {/* 8. Medical Report Export Modal (PDF / CSV) */}
      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        patient={activeMember}
        allMembers={members}
      />

      {/* 9. AI Symptom Checker & Health Urgency Recommendation Modal (Integrated with EmergencyModal) */}
      <SymptomChecker
        isOpen={isSymptomCheckerOpen}
        onClose={() => setIsSymptomCheckerOpen(false)}
        patient={activeMember}
        onTriggerEmergency={handleTriggerEmergencyFromSymptoms}
        onOpenTeleconsult={() => {
          setIsSymptomCheckerOpen(false);
          setIsTeleconsultOpen(true);
        }}
      />

      {/* 10. Offline Health & Emergency Vault Modal (Offline Access for Vitals, Meds & 119 Faskes) */}
      <OfflineEmergencyVault
        isOpen={isOfflineVaultOpen}
        onClose={() => setIsOfflineVaultOpen(false)}
        members={members}
        medications={medications}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        onShowToast={showToast}
      />

      {/* 11. Proactive Health Alert Early Warning Notification Modal */}
      <ProactiveHealthAlertModal
        isOpen={isProactiveAlertModalOpen}
        onClose={() => setIsProactiveAlertModalOpen(false)}
        alerts={proactiveAlerts}
        onMarkAsRead={handleMarkAlertAsRead}
        onMarkAllAsRead={handleMarkAllAlertsAsRead}
        onTakeAction={handleTakeAlertAction}
        onRunScan={handleRunAiAlertScan}
        isScanning={isScanningAlerts}
        onOpenTeleconsult={() => {
          setIsProactiveAlertModalOpen(false);
          setIsTeleconsultOpen(true);
        }}
        onOpenDoctorAnalytics={() => {
          setIsProactiveAlertModalOpen(false);
          setCurrentTab("doctor");
        }}
        onShowToast={showToast}
        onSimulateScenario={handleSimulateAlertScenario}
      />

    </div>
  );
}
