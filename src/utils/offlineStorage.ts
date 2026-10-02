import { useState, useEffect } from "react";
import { FamilyMember, MedicationItem, EmergencyFacility } from "../types";
import { EMERGENCY_FACILITIES } from "../data/mockData";

export const STORAGE_KEYS = {
  HEALTH_DATA: "gersaka_offline_health_data_v2",
  MEDICATIONS: "gersaka_offline_medications_v2",
  EMERGENCY: "gersaka_offline_emergency_v2",
  METADATA: "gersaka_offline_metadata_v2",
  SIMULATED_OFFLINE: "gersaka_simulated_offline",
};

export interface OfflineEmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  relation: string;
  isPrimaryIce: boolean;
}

export interface OfflineFirstAidGuide {
  condition: string;
  actionSummary: string;
  steps: string[];
  contraindications: string[];
}

export interface OfflineCacheMetadata {
  lastSyncTimestamp: number;
  lastSyncFormatted: string;
  version: string;
  membersCount: number;
  medicationsCount: number;
  facilitiesCount: number;
  isStorageReady: boolean;
}

export const DEFAULT_OFFLINE_ICE_CONTACTS: OfflineEmergencyContact[] = [
  {
    id: "ice-01",
    name: "H. Hendra Kusuma (Ayah)",
    role: "Kepala Keluarga / Kontak Utama",
    phone: "0812-9876-5432",
    relation: "Ayah",
    isPrimaryIce: true,
  },
  {
    id: "ice-02",
    name: "Hj. Siti Rahmawati (Ibu)",
    role: "Pengelola Kesehatan Keluarga",
    phone: "0813-1234-5678",
    relation: "Ibu",
    isPrimaryIce: true,
  },
  {
    id: "ice-03",
    name: "PSC 119 Kota Depok & LimoCity",
    role: "Layanan Ambulans Gawat Darurat 24 Jam",
    phone: "119",
    relation: "Layanan Medis Darurat Nasional",
    isPrimaryIce: true,
  },
  {
    id: "ice-04",
    name: "IGD RS LimoCity Therapy Center",
    role: "Instalasi Gawat Darurat & Trauma Center",
    phone: "(021) 7780-8888",
    relation: "Faskes Rujukan Utama",
    isPrimaryIce: false,
  },
];

export const OFFLINE_FIRST_AID_GUIDELINES: OfflineFirstAidGuide[] = [
  {
    condition: "Nyeri Dada Akut / Suspek Serangan Jantung",
    actionSummary: "Hentikan seluruh aktivitas segera, posisikan duduk setengah tegak (posisi Fowler), dan longgarkan pakaian ketat.",
    steps: [
      "Dudukkan penderita dalam posisi setengah berbaring (sudut 45 derajat) dengan bantal menopang punggung.",
      "Hubungi segera Ambulans 119 atau IGD RS LimoCity (021) 7780-8888.",
      "Jika penderita memiliki resep ISDN (Isosorbide Dinitrate) di bawah lidah dan tekanan darah >100 mmHg, bantu letakkan 1 tablet di bawah lidah.",
      "Pantau kesadaran dan pola nafas. Jangan berikan makanan padat atau minuman dalam volume besar."
    ],
    contraindications: [
      "Jangan biarkan penderita berjalan atau menyetir sendiri.",
      "Jangan berikan obat penurun tensi jika penderita merasa melayang/pusing berputar hebat."
    ]
  },
  {
    condition: "Gejala Stroke Akut (Metode FAST)",
    actionSummary: "Identifikasi segera FAST (Face drooping, Arm weakness, Speech difficulty, Time to call 119).",
    steps: [
      "Face: Minta penderita tersenyum, amati apakah salah satu sudut bibir terkulai ke bawah.",
      "Arm: Minta angkat kedua lengan lurus ke depan, amati apakah satu lengan jatuh terkulai lemas.",
      "Speech: Minta ucapkan kalimat sederhana, perhatikan apakah suara pelo atau bicara tidak jelas.",
      "Time: Catat jam tepat timbulnya gejala (Golden Period trombolisis <4.5 jam). Segera bawa ke IGD RS dengan CT-Scan siap pakai."
    ],
    contraindications: [
      "JANGAN memberikan aspirin atau obat pengencer darah sebelum dilakukan CT-Scan di rumah sakit.",
      "JANGAN berikan makanan/minuman karena resiko aspirasi paru akibat refleks menelan lumpuh."
    ]
  },
  {
    condition: "Sesak Nafas Berat / Serangan Asma Akut",
    actionSummary: "Dudukkan tegak, ciptakan sirkulasi udara segar, dan bantu gunakan inhaler pereda jika tersedia.",
    steps: [
      "Bantu penderita duduk tegak sedikit membungkuk ke depan dan bertumpu pada lutut.",
      "Gunakan inhaler bronkodilator (Salbutamol) jika ada: 2-4 semprotan dengan jeda 1 menit antar semprotan.",
      "Bimbing penderita melakukan pernapasan dengan bibir mengerucut (pursed-lip breathing).",
      "Jika SpO2 wearable <92% atau bibir tampak membiru, segera minta ambulans darurat."
    ],
    contraindications: [
      "Jangan biarkan penderita berbaring terlentang karena memperberat kerja otot diafragma.",
      "Hindarkan dari asap, parfum menyengat, atau debu."
    ]
  }
];

// Helper to save all data to local storage cache
export function saveAllToOfflineCache(
  members: FamilyMember[],
  medications: MedicationItem[],
  facilities: EmergencyFacility[] = EMERGENCY_FACILITIES
): OfflineCacheMetadata {
  const timestamp = Date.now();
  const dateFormatted = new Date(timestamp).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  try {
    localStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(members));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
    localStorage.setItem(
      STORAGE_KEYS.EMERGENCY,
      JSON.stringify({
        facilities,
        iceContacts: DEFAULT_OFFLINE_ICE_CONTACTS,
        firstAidGuidelines: OFFLINE_FIRST_AID_GUIDELINES,
      })
    );

    const metadata: OfflineCacheMetadata = {
      lastSyncTimestamp: timestamp,
      lastSyncFormatted: dateFormatted,
      version: "2.4.0-offline",
      membersCount: members.length,
      medicationsCount: medications.length,
      facilitiesCount: facilities.length,
      isStorageReady: true,
    };

    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadata));
    return metadata;
  } catch (err) {
    console.error("[GerSaKa OfflineStorage] Gagal menyimpan cache lokal:", err);
    return {
      lastSyncTimestamp: timestamp,
      lastSyncFormatted: dateFormatted,
      version: "2.4.0-offline",
      membersCount: 0,
      medicationsCount: 0,
      facilitiesCount: 0,
      isStorageReady: false,
    };
  }
}

// Retrieve cached members
export function getOfflineHealthData(): FamilyMember[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_DATA);
    if (!raw) return null;
    return JSON.parse(raw) as FamilyMember[];
  } catch {
    return null;
  }
}

// Retrieve cached medications
export function getOfflineMedications(): MedicationItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (!raw) return null;
    return JSON.parse(raw) as MedicationItem[];
  } catch {
    return null;
  }
}

// Mark medication taken offline
export function markMedicationTakenOffline(medicationId: string, timeSlot: string): boolean {
  try {
    const meds = getOfflineMedications();
    if (!meds) return false;

    const updated = meds.map((m) => {
      if (m.id === medicationId) {
        return {
          ...m,
          takenToday: {
            ...m.takenToday,
            [timeSlot]: true,
          },
        };
      }
      return m;
    });

    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

// Retrieve cached emergency data
export function getOfflineEmergencyData(): {
  facilities: EmergencyFacility[];
  iceContacts: OfflineEmergencyContact[];
  firstAidGuidelines: OfflineFirstAidGuide[];
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
    if (!raw) {
      return {
        facilities: EMERGENCY_FACILITIES,
        iceContacts: DEFAULT_OFFLINE_ICE_CONTACTS,
        firstAidGuidelines: OFFLINE_FIRST_AID_GUIDELINES,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      facilities: EMERGENCY_FACILITIES,
      iceContacts: DEFAULT_OFFLINE_ICE_CONTACTS,
      firstAidGuidelines: OFFLINE_FIRST_AID_GUIDELINES,
    };
  }
}

// Retrieve metadata
export function getOfflineMetadata(): OfflineCacheMetadata {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.METADATA);
    if (!raw) {
      return {
        lastSyncTimestamp: Date.now(),
        lastSyncFormatted: "Baru saja disinkronkan",
        version: "2.4.0-offline",
        membersCount: 5,
        medicationsCount: 5,
        facilitiesCount: 4,
        isStorageReady: true,
      };
    }
    return JSON.parse(raw) as OfflineCacheMetadata;
  } catch {
    return {
      lastSyncTimestamp: Date.now(),
      lastSyncFormatted: "Penyimpanan lokal siap",
      version: "2.4.0-offline",
      membersCount: 0,
      medicationsCount: 0,
      facilitiesCount: 0,
      isStorageReady: false,
    };
  }
}

// Custom React Hook for live network status and simulated offline mode
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === "true";
    }
    return false;
  });

  const [metadata, setMetadata] = useState<OfflineCacheMetadata>(() => getOfflineMetadata());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial metadata check
    setMetadata(getOfflineMetadata());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, String(next));
      return next;
    });
  };

  const refreshMetadata = () => {
    setMetadata(getOfflineMetadata());
  };

  // If simulated offline is true, effective status is offline
  const effectiveOnline = isOnline && !isSimulatedOffline;

  return {
    isOnline: effectiveOnline,
    realOnline: isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    metadata,
    refreshMetadata,
  };
}
