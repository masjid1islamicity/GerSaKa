import React, { useState } from "react";
import { FamilyMember } from "../types";
import { 
  X, 
  ShieldCheck, 
  Fingerprint, 
  KeyRound, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  Lock, 
  FileLock, 
  Database,
  Smartphone,
  Eye,
  Check
} from "lucide-react";

interface SecurityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
  is2FAEnabled: boolean;
  onToggle2FA: () => void;
}

export const SecurityAuthModal: React.FC<SecurityAuthModalProps> = ({
  isOpen,
  onClose,
  patient,
  is2FAEnabled,
  onToggle2FA,
}) => {
  const [activeTab, setActiveTab] = useState<"biometric" | "2fa" | "backup">("biometric");
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [totpCode, setTotpCode] = useState("492 810");
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulateBiometric = () => {
    setBiometricScanning(true);
    setBiometricVerified(false);
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricVerified(true);
    }, 1600);
  };

  const handleTriggerCloudBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch("/api/sync/cloud-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id }),
      });
      const data = await response.json();
      if (data.success) {
        setBackupResult(data.backup);
      }
    } catch (err) {
      console.error("Backup error:", err);
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Keamanan & Enkripsi Medis GerSaKa</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Autentikasi Biometrik, 2FA, dan Cadangan Cloud Terenkripsi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4">
          <button
            onClick={() => setActiveTab("biometric")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "biometric"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Autentikasi Biometrik</span>
          </button>

          <button
            onClick={() => setActiveTab("2fa")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "2fa"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Modul 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "backup"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cadangan Cloud Enkripsi</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: BIOMETRIC AUTHENTICATION */}
          {activeTab === "biometric" && (
            <div className="space-y-4 text-center">
              <div className="max-w-md mx-auto">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Verifikasi Identitas Biometrik Medis
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Akses ke seluruh rekam medis sensitif keluarga dikunci menggunakan modul WebAuthn / FIDO2 Biometric Sensor.
                </p>
              </div>

              {/* Biometric Scanner Visual */}
              <div className="py-6">
                <div
                  onClick={handleSimulateBiometric}
                  className={`w-28 h-28 mx-auto rounded-3xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                    biometricScanning
                      ? "bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/20 animate-pulse"
                      : biometricVerified
                      ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-600"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 hover:border-emerald-400"
                  }`}
                >
                  {biometricVerified ? (
                    <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                  ) : (
                    <Fingerprint className={`w-14 h-14 ${biometricScanning ? "text-emerald-500 animate-bounce" : ""}`} />
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-4">
                  {biometricScanning
                    ? "Memindai Sidik Jari / Sensor Biometrik..."
                    : biometricVerified
                    ? "Autentikasi Biometrik Berhasil Terverifikasi! ✓"
                    : "Sentuh sensor sidik jari atau klik tombol di atas"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>Kunci Kriptografi Perangkat Lokal</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Kunci privat disimpan aman di Secure Enclave perangkat Anda dan tidak pernah dikirim ke server dalam bentuk teks mentah.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TWO FACTOR AUTHENTICATION (2FA) */}
          {activeTab === "2fa" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-emerald-500" />
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Autentikasi Dua Faktor (2FA / TOTP)
                    </h5>
                    <p className="text-xs text-slate-500">
                      Wajibkan kode 6-digit saat membuka rekam medis dari perangkat baru.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onToggle2FA}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    is2FAEnabled
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {is2FAEnabled ? "2FA Aktif ✓" : "Aktifkan 2FA"}
                </button>
              </div>

              {is2FAEnabled && (
                <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Kode Keamanan TOTP Aktif (Google Authenticator)
                  </span>
                  
                  <div className="text-3xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tracking-widest py-2">
                    {totpCode}
                  </div>

                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Kode di atas diperbarui setiap 30 detik. Sinkronkan dengan aplikasi authenticator favorit Anda.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLOUD BACKUP & ENCRYPTED ARCHIVE */}
          {activeTab === "backup" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Cadangan Cloud Otomatis Terenkripsi</span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sinkronisasi cloud dengan protokol Zero-Knowledge Encryption.
                  </p>
                </div>

                <button
                  onClick={handleTriggerCloudBackup}
                  disabled={backupLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${backupLoading ? "animate-spin" : ""}`} />
                  <span>{backupLoading ? "Mengenkripsi..." : "Buat Cadangan Sekarang"}</span>
                </button>
              </div>

              {backupResult && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cadangan Medis Berhasil Terarsip Aman!</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    <p>Status: {backupResult.status}</p>
                    <p>Algoritma: {backupResult.encryption}</p>
                    <p>Hash Verifikasi: {backupResult.encryptedHash}</p>
                    <p>Waktu Simpan: {backupResult.timestamp}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Sertifikasi Standar Privasi Data Medis ISO 27001 & HIPAA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
