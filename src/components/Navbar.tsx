import React from "react";
import { 
  Heart, 
  ShieldCheck, 
  Fingerprint, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Watch, 
  Bell, 
  FileText, 
  Settings, 
  Cloud, 
  Users, 
  Stethoscope, 
  Activity,
  ZoomIn,
  Landmark,
  Database,
  WifiOff,
  Sparkles
} from "lucide-react";

interface NavbarProps {
  currentTab: "family" | "doctor" | "admin" | "fitcity" | "berjaga";
  setCurrentTab: (tab: "family" | "doctor" | "admin" | "fitcity" | "berjaga") => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: "normal" | "large" | "xlarge";
  setFontSize: (size: "normal" | "large" | "xlarge") => void;
  onOpenEmergency: () => void;
  onOpenWearableSync: () => void;
  onOpenSecurity: () => void;
  onOpenReminders: () => void;
  onOpenExport: () => void;
  onOpenBackup: () => void;
  onOpenOfflineVault?: () => void;
  wearableSyncCount: number;
  unreadNotifications: number;
  onOpenSymptomChecker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  onOpenEmergency,
  onOpenWearableSync,
  onOpenSecurity,
  onOpenReminders,
  onOpenExport,
  onOpenBackup,
  onOpenOfflineVault,
  wearableSyncCount,
  unreadNotifications,
  onOpenSymptomChecker,
}) => {
  const cycleFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("xlarge");
    else setFontSize("normal");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner Alert / Encryption Status Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-1 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">GerSaKa Platform v2.4</span>
          <span className="hidden sm:inline text-white/80">• Gerakan Sehat Keluarga LimoCity Therapy</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden md:inline">Enkripsi End-to-End:</span> AES-256-GCM Aktif
          </span>
          <button 
            onClick={onOpenBackup}
            className="flex items-center gap-1 hover:text-emerald-100 transition-colors underline cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Pencadangan Cloud: Sinkron</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white">
                  GerSaKa
                </h1>
                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/40">
                  LimoCity
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                Smart Family Therapy & Healthcare
              </p>
            </div>
          </div>

          {/* Center Tabs: Family, BERJAGA, Doctor, Admin */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setCurrentTab("family")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "family"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dasbor Keluarga</span>
            </button>
            <button
              onClick={() => setCurrentTab("berjaga")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentTab === "berjaga"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white shadow-sm font-bold"
                  : "text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40"
              }`}
              title="Islamicity BERJAGA: Bergerak, Bekerja, Berbekam, Berdakwah, Bersyariah, Berjamaah, Bermuamalah sampai Bahagia Sejahtera"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Islamicity BERJAGA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
            <button
              onClick={() => setCurrentTab("doctor")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "doctor"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Analitik Dokter</span>
            </button>
            <button
              onClick={() => setCurrentTab("fitcity")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "fitcity"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-500" />
              <span>FITCity Wilayah</span>
            </button>
            <button
              onClick={() => setCurrentTab("admin")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "admin"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Admin & Infrastruktur</span>
            </button>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            
            {/* Symptom Checker Trigger */}
            {onOpenSymptomChecker && (
              <button
                onClick={onOpenSymptomChecker}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                title="Pemeriksa Gejala Fisik AI & Triase Urgensi"
              >
                <Stethoscope className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Cek Gejala</span>
              </button>
            )}

            {/* SOS / Emergency Dispatch Trigger */}
            <button
              id="emergency-sos-btn"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md shadow-red-600/30 transition-transform active:scale-95 animate-pulse cursor-pointer"
              title="Kirim Panggilan Darurat ke Fasilitas Kesehatan Terdekat (Ambulans 119)"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="tracking-wide">SOS DARURAT</span>
            </button>

            {/* Wearable Sync Status Button */}
            <button
              onClick={onOpenWearableSync}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Sinkronisasi Perangkat Wearable Pihak Ketiga"
            >
              <Watch className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{wearableSyncCount} Wearable</span>
            </button>

            {/* Daily Reminders Button */}
            <button
              onClick={onOpenReminders}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors relative"
              title="Pengingat Harian & Notifikasi Pintar"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            {/* Export Report (PDF/CSV) */}
            <button
              onClick={onOpenExport}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Ekspor Laporan Medis (PDF / CSV / JSON)"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Security & Biometrics Modal Trigger */}
            <button
              onClick={onOpenSecurity}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Keamanan 2FA & Autentikasi Biometrik"
            >
              <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Offline Health & Emergency Vault Trigger */}
            {onOpenOfflineVault && (
              <button
                onClick={onOpenOfflineVault}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors flex items-center gap-1.5 cursor-pointer relative"
                title="Offline Emergency Vault: Akses Data Vitals, Jadwal Obat & Faskes 119 Tanpa Internet"
              >
                <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden md:inline">Offline Vault</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </button>
            )}

            {/* Accessibility / Font Size Scaler */}
            <button
              onClick={cycleFontSize}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center font-bold text-xs"
              title={`Aksesibilitas Ukuran Teks (Saat ini: ${fontSize})`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title={darkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for tabs */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCurrentTab("family")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              currentTab === "family"
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Keluarga</span>
          </button>
          <button
            onClick={() => setCurrentTab("berjaga")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
              currentTab === "berjaga"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>BERJAGA</span>
          </button>
          <button
            onClick={() => setCurrentTab("doctor")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              currentTab === "doctor"
                ? "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            <span>Dokter</span>
          </button>
          <button
            onClick={() => setCurrentTab("fitcity")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              currentTab === "fitcity"
                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Landmark className="w-3 h-3" />
            <span>FITCity</span>
          </button>
          <button
            onClick={() => setCurrentTab("admin")}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              currentTab === "admin"
                ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
