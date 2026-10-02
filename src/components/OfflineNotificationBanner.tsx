import React from "react";
import { useOfflineStatus } from "../utils/offlineStorage";
import { WifiOff, Database, ShieldCheck, ChevronRight, X, AlertTriangle } from "lucide-react";

interface OfflineNotificationBannerProps {
  onOpenOfflineVault: () => void;
}

export const OfflineNotificationBanner: React.FC<OfflineNotificationBannerProps> = ({
  onOpenOfflineVault,
}) => {
  const { isOnline, isSimulatedOffline, metadata } = useOfflineStatus();
  const [dismissed, setDismissed] = React.useState(false);

  // If online and not simulated, don't show banner
  if (isOnline && !isSimulatedOffline) return null;
  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between gap-3 relative z-30 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 flex-1 flex-wrap">
        <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
          <WifiOff className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
        </div>

        <div>
          <span className="font-black tracking-wide uppercase mr-1.5 text-yellow-200">
            {isSimulatedOffline ? "Mode Simulasi Offline" : "Koneksi Offline Terdeteksi"}
          </span>
          <span className="text-white/90">
            Sistem beralih ke <strong>Service Worker & Local Storage Cache</strong>. Data tanda vital, jadwal konsumsi obat, dan nomor darurat 119 tetap siap diakses 100%.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenOfflineVault}
          className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span>Buka Offline Vault</span>
          <ChevronRight className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-white/80 hover:text-white hover:bg-black/20 transition-colors"
          title="Tutup banner peringatan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
