import { FamilyMember, DoctorSpecialist, MedicationItem, HospitalInvoice, EmergencyFacility, SecurityAuditLog, DailyReminderSetting, WeeklyHealthGoal } from "../types";

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "fam-01",
    name: "H. Hendra Kusuma",
    role: "Ayah",
    age: 52,
    gender: "Laki-laki",
    bloodType: "O+",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    medicalHistory: "Hipertensi esensial terkontrol (5 thn), riwayat dislipidemia ringan",
    currentSymptoms: "Terkadang kaku di area tengkuk jika kelelahan lembur",
    allergies: ["Penisilin"],
    therapyProgram: "LimoCity Cardiovascular & Ergonomic Recovery Program",
    overallHealthScore: 84,
    vitals: {
      heartRate: 72,
      bloodPressure: "128/82",
      spo2: 98,
      bloodGlucose: 112,
      bodyTemperature: 36.6,
      sleepHours: 7.2,
      sleepScore: 84,
      steps: 8450,
      activeCalories: 480,
      activeMinutes: 52,
      hrvMs: 52,
      stressLevel: 28,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    },
    connectedWearable: {
      deviceName: "Apple Watch Ultra 2 Cellular",
      brand: "Apple",
      batteryLevel: 88,
      lastSync: "1 menit yang lalu",
      isLive: true
    }
  },
  {
    id: "fam-02",
    name: "Hj. Siti Rahmawati",
    role: "Ibu",
    age: 49,
    gender: "Perempuan",
    bloodType: "B+",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    medicalHistory: "Osteoarthritis genu sinistra grade 1 (pemulihan), defisiensi vit D teratasi",
    currentSymptoms: "Pegal lutut kiri ringan saat menaiki tangga",
    allergies: ["Seafood (Udang segar)"],
    therapyProgram: "LimoCity Joint Mobility & Anti-Inflammatory Nutrition",
    overallHealthScore: 89,
    vitals: {
      heartRate: 76,
      bloodPressure: "118/78",
      spo2: 99,
      bloodGlucose: 98,
      bodyTemperature: 36.5,
      sleepHours: 7.8,
      sleepScore: 91,
      steps: 6200,
      activeCalories: 340,
      activeMinutes: 42,
      hrvMs: 60,
      stressLevel: 22,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    },
    connectedWearable: {
      deviceName: "Garmin Venu 3S Health Tracker",
      brand: "Garmin",
      batteryLevel: 94,
      lastSync: "3 menit yang lalu",
      isLive: true
    }
  },
  {
    id: "fam-03",
    name: "Dimas Pratama Kusuma",
    role: "Anak Sulung",
    age: 24,
    gender: "Laki-laki",
    bloodType: "O+",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    medicalHistory: "Tidak ada riwayat kronis, atlet lari rekreasional",
    currentSymptoms: "Kebugaran optimal, sedikit delayed onset muscle soreness (DOMS) pasca lari 10K",
    allergies: ["Tidak ada alergi obat"],
    therapyProgram: "LimoCity Athletic Performance & Rapid Muscle Reconditioning",
    overallHealthScore: 96,
    vitals: {
      heartRate: 58,
      bloodPressure: "115/72",
      spo2: 99,
      bloodGlucose: 90,
      bodyTemperature: 36.4,
      sleepHours: 8.1,
      sleepScore: 95,
      steps: 12400,
      activeCalories: 760,
      activeMinutes: 85,
      hrvMs: 82,
      stressLevel: 16,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    },
    connectedWearable: {
      deviceName: "Garmin Forerunner 965 Pro",
      brand: "Garmin",
      batteryLevel: 79,
      lastSync: "Real-time",
      isLive: true
    }
  },
  {
    id: "fam-04",
    name: "Nadia Anindita Kusuma",
    role: "Anak Bungsu",
    age: 16,
    gender: "Perempuan",
    bloodType: "B+",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    medicalHistory: "Mata lelah (asthenopia) akibat durasi layar belajar",
    currentSymptoms: "Kelelahan mata ringan saat belajar malam",
    allergies: ["Debu tungau rumah"],
    therapyProgram: "LimoCity Postural Ergonomics & Teen Digital Eye Relief",
    overallHealthScore: 92,
    vitals: {
      heartRate: 74,
      bloodPressure: "110/70",
      spo2: 99,
      bloodGlucose: 94,
      bodyTemperature: 36.7,
      sleepHours: 7.5,
      sleepScore: 88,
      steps: 7100,
      activeCalories: 380,
      activeMinutes: 48,
      hrvMs: 68,
      stressLevel: 25,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    },
    connectedWearable: {
      deviceName: "Samsung Galaxy Watch6 LTE",
      brand: "Samsung",
      batteryLevel: 82,
      lastSync: "4 menit yang lalu",
      isLive: true
    }
  },
  {
    id: "fam-05",
    name: "Bpk. H. Subroto",
    role: "Kakek",
    age: 76,
    gender: "Laki-laki",
    bloodType: "A+",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    medicalHistory: "Post-PCI Stent Kardiak (3 thn lalu), Benign Prostatic Hyperplasia terkontrol",
    currentSymptoms: "Napas agak pendek jika jalan menanjak cepat",
    allergies: ["Aspirin dosis tinggi, Sulfa"],
    therapyProgram: "LimoCity Geriatric Cardiopulmonary Care & Fall Prevention",
    overallHealthScore: 78,
    vitals: {
      heartRate: 68,
      bloodPressure: "134/84",
      spo2: 96,
      bloodGlucose: 126,
      bodyTemperature: 36.5,
      sleepHours: 6.8,
      sleepScore: 79,
      steps: 4300,
      activeCalories: 260,
      activeMinutes: 32,
      hrvMs: 38,
      stressLevel: 32,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    },
    connectedWearable: {
      deviceName: "Fitbit Sense 2 Medical Grade",
      brand: "Fitbit",
      batteryLevel: 68,
      lastSync: "30 detik yang lalu",
      isLive: true
    }
  }
];

export const SPECIALIST_DOCTORS: DoctorSpecialist[] = [
  {
    id: "doc-01",
    name: "dr. Farhan Alamsyah, Sp.JP(K), FIHA",
    specialty: "Spesialis Jantung & Pembuluh Darah (Konsultan)",
    hospital: "RS LimoCity Therapy & Heart Center",
    sipNumber: "SIP.446/KARS/5892/2023",
    experienceYears: 16,
    rating: 4.9,
    consultationFee: 250000,
    availableNow: true,
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    focusArea: "Aritmia, Hipertensi Vaskular, Rehabilitasi Kardiopulmonal LimoCity"
  },
  {
    id: "doc-02",
    name: "dr. Clarissa Amanda, Sp.PD, K-EMD, FINASIM",
    specialty: "Spesialis Penyakit Dalam & Metabolik Diabetes",
    hospital: "RS Siloam Cinere & Mitra LimoCity",
    sipNumber: "SIP.446/IDI-DEP/1029/2022",
    experienceYears: 12,
    rating: 4.9,
    consultationFee: 220000,
    availableNow: true,
    avatarUrl: "https://images.unsplash.com/photo-1594824813689-ee34177c387b?w=150&auto=format&fit=crop&q=80",
    focusArea: "Pencegahan Sindrom Metabolik, Gula Darah, Profil Lipid"
  },
  {
    id: "doc-03",
    name: "dr. Maya Kartika, M.Gizi, Sp.GK",
    specialty: "Spesialis Gizi Klinis & Terapi Dietetik Keluarga",
    hospital: "Instalasi Gizi RSUD Kota Depok & LimoCity",
    sipNumber: "SIP.446/GIZI/8831/2024",
    experienceYears: 9,
    rating: 4.8,
    consultationFee: 180000,
    availableNow: true,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    focusArea: "Diet Hipertensi DASH, Meal Plan Anti-Inflamasi, Nutrisi Lansia"
  },
  {
    id: "doc-04",
    name: "Ns. Yoga Pratama, S.Ft, Ftr, M.Biomed",
    specialty: "Spesialis Fisioterapi & Rehabilitasi Muskuloskeletal",
    hospital: "LimoCity Therapy Center of Excellence",
    sipNumber: "SIP-F.882/LMC-REHAB/2021",
    experienceYears: 11,
    rating: 4.9,
    consultationFee: 160000,
    availableNow: true,
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    focusArea: "Terapi Nyeri Sendi, Postural Correction, Latihan Kardio Aman"
  }
];

export const INITIAL_MEDICATIONS: MedicationItem[] = [
  {
    id: "med-01",
    patientId: "fam-01",
    name: "Amlodipine Besylate",
    dosage: "5 mg",
    frequency: "1x sehari pagi hari",
    times: ["07:00"],
    instructions: "Diminum sesudah sarapan pagi bersama air putih hangat",
    prescribedBy: "dr. Farhan Alamsyah, Sp.JP(K)",
    pharmacyName: "Apotek Kimia Farma Limo (Resep Elektronik Terhubung)",
    rxNumber: "RX-LMC-2026-0811",
    stockRemaining: 24,
    takenToday: { "07:00": true },
    startDate: "2026-09-01",
    endDate: "2026-10-01"
  },
  {
    id: "med-02",
    patientId: "fam-01",
    name: "CoQ10 + Omega-3 Max (LimoCity CardioShield)",
    dosage: "100 mg / 1000 mg",
    frequency: "1x sehari siang hari",
    times: ["13:00"],
    instructions: "Suplemen antioksidan endotel vaskular, diminum saat makan siang",
    prescribedBy: "dr. Maya Kartika, Sp.GK",
    pharmacyName: "Instalasi Farmasi RS LimoCity Therapy",
    rxNumber: "RX-LMC-2026-0812",
    stockRemaining: 18,
    takenToday: { "13:00": false },
    startDate: "2026-09-05",
    endDate: "2026-10-05"
  },
  {
    id: "med-03",
    patientId: "fam-02",
    name: "Glucosamine + Chondroitin Complex",
    dosage: "1500 mg",
    frequency: "1x sehari malam hari",
    times: ["20:00"],
    instructions: "Untuk regenerasi kartilago sendi lutut pasca terapi fisioterapi LimoCity",
    prescribedBy: "Ns. Yoga Pratama, S.Ft",
    pharmacyName: "Apotek K-24 Cinere Raya",
    rxNumber: "RX-LMC-2026-0798",
    stockRemaining: 14,
    takenToday: { "20:00": false },
    startDate: "2026-08-20",
    endDate: "2026-09-30"
  },
  {
    id: "med-04",
    patientId: "fam-05",
    name: "Clopidogrel (Plavix)",
    dosage: "75 mg",
    frequency: "1x sehari pagi hari",
    times: ["08:00"],
    instructions: "Antiplatelet proteksi stent jantung, diminum sesudah makan",
    prescribedBy: "dr. Farhan Alamsyah, Sp.JP(K)",
    pharmacyName: "Instalasi Farmasi RS LimoCity Therapy",
    rxNumber: "RX-LMC-2026-0611",
    stockRemaining: 21,
    takenToday: { "08:00": true },
    startDate: "2026-08-01",
    endDate: "2026-11-01"
  },
  {
    id: "med-05",
    patientId: "fam-05",
    name: "Bisoprolol Fumarate",
    dosage: "2.5 mg",
    frequency: "1x sehari pagi hari",
    times: ["08:00"],
    instructions: "Kontrol irama denyut jantung & beban miokard",
    prescribedBy: "dr. Farhan Alamsyah, Sp.JP(K)",
    pharmacyName: "Instalasi Farmasi RS LimoCity Therapy",
    rxNumber: "RX-LMC-2026-0612",
    stockRemaining: 19,
    takenToday: { "08:00": true },
    startDate: "2026-08-01",
    endDate: "2026-11-01"
  }
];

export const INITIAL_INVOICES: HospitalInvoice[] = [
  {
    id: "inv-01",
    invoiceNumber: "INV/LMC/2026/09/0421",
    patientName: "H. Hendra Kusuma",
    serviceDescription: "Konsultasi Video Dokter Spesialis Jantung & Pembuluh Darah + E-Resep Farmasi",
    date: "18 Sep 2026",
    dueDate: "25 Sep 2026",
    amount: 325000,
    status: "Lunas",
    paymentMethod: "BCA Virtual Account (014-998124012)",
    coverageType: "Mandiri / BPJS Bridging"
  },
  {
    id: "inv-02",
    invoiceNumber: "INV/LMC/2026/09/0512",
    patientName: "Hj. Siti Rahmawati",
    serviceDescription: "Paket Rehabilitasi Muskuloskeletal LimoCity Therapy (4 Sesi Komprehensif)",
    date: "20 Sep 2026",
    dueDate: "27 Sep 2026",
    amount: 640000,
    status: "Menunggu Pembayaran",
    coverageType: "Pribadi"
  },
  {
    id: "inv-03",
    invoiceNumber: "INV/LMC/2026/09/0388",
    patientName: "Bpk. H. Subroto",
    serviceDescription: "Pemeriksaan Profil Lipid Lengkap & Telemonitoring Geriatri LimoCity 30 Hari",
    date: "15 Sep 2026",
    dueDate: "22 Sep 2026",
    amount: 480000,
    status: "Lunas",
    paymentMethod: "QRIS Dinamis Bank Indonesia",
    coverageType: "Mandiri / BPJS Bridging"
  }
];

export const EMERGENCY_FACILITIES: EmergencyFacility[] = [
  {
    id: "fas-01",
    name: "RS LimoCity Therapy Center & Emergency Unit",
    type: "Rumah Sakit Rujukan",
    distanceKm: 1.2,
    etaMinutes: 4,
    phone: "(021) 7788-9900",
    address: "Jl. Raya Limo No. 88, Limo, Kota Depok",
    hasICU: true,
    ambulanceAvailable: true
  },
  {
    id: "fas-02",
    name: "Puskesmas 24 Jam Kecamatan Limo",
    type: "Puskesmas 24 Jam",
    distanceKm: 0.8,
    etaMinutes: 3,
    phone: "(021) 7750-119",
    address: "Jl. Raya Cinere - Limo No. 12, Depok",
    hasICU: false,
    ambulanceAvailable: true
  },
  {
    id: "fas-03",
    name: "RSUD Anugerah Sehat Afiat (ASA) Kota Depok",
    type: "Rumah Sakit Rujukan",
    distanceKm: 3.4,
    etaMinutes: 8,
    phone: "(021) 2940-2255",
    address: "Jl. Raya Tapos - Cimanggis, Depok",
    hasICU: true,
    ambulanceAvailable: true
  },
  {
    id: "fas-04",
    name: "RS Siloam Hospitals Cinere",
    type: "Rumah Sakit Rujukan",
    distanceKm: 4.5,
    etaMinutes: 11,
    phone: "(021) 7545-555",
    address: "Jl. Cinere Raya No. 9, Cinere, Depok",
    hasICU: true,
    ambulanceAvailable: true
  }
];

export const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: "log-01",
    timestamp: "21 Sep 2026 09:14:22 WIB",
    eventType: "AUTH_BIOMETRIC",
    user: "Hendra Kusuma (Admin Keluarga)",
    ipAddress: "182.253.114.92",
    device: "iPhone 15 Pro (FaceID WebAuthn Validated)",
    status: "SUCCESS",
    details: "Verifikasi biometrik berhasil dengan enkripsi token sesi 256-bit"
  },
  {
    id: "log-02",
    timestamp: "21 Sep 2026 08:45:10 WIB",
    eventType: "E2EE_KEY_ROTATION",
    user: "Sistem Kriptografi GerSaKa",
    ipAddress: "10.0.4.18 (Internal)",
    device: "Server Node GerSaKa-LMC-Primary",
    status: "SUCCESS",
    details: "Kunci publik sesi video konsultasi dirotasi (Curve25519 / AES-GCM)"
  },
  {
    id: "log-03",
    timestamp: "21 Sep 2026 07:30:00 WIB",
    eventType: "CLOUD_BACKUP",
    user: "AutoScheduler Service",
    ipAddress: "10.0.2.55",
    device: "LimoCity Cloud Vault Backup Engine",
    status: "SUCCESS",
    details: "Pencadangan mingguan otomatis selesai: 342 rekam medis terenkripsi"
  },
  {
    id: "log-04",
    timestamp: "20 Sep 2026 21:10:04 WIB",
    eventType: "2FA_VERIFIED",
    user: "dr. Farhan Alamsyah",
    ipAddress: "103.111.45.18",
    device: "iPad Pro Clinical Console",
    status: "SUCCESS",
    details: "Autentikasi dua faktor TOTP disetujui untuk akses rekam medis pasien"
  }
];

export const DEFAULT_DAILY_REMINDERS: DailyReminderSetting[] = [
  {
    id: "rem-1",
    title: "Minum Air Putih 300ml (Hidrasi Pagi LimoCity)",
    time: "06:30",
    category: "Hidrasi",
    enabled: true,
    soundAlert: true
  },
  {
    id: "rem-2",
    title: "Jadwal Minum Obat Hipertensi (Amlodipine)",
    time: "07:00",
    category: "Obat",
    enabled: true,
    soundAlert: true
  },
  {
    id: "rem-3",
    title: "Pemeriksaan Tekanan Darah & SpO2 Pagi",
    time: "07:15",
    category: "Tensi",
    enabled: true,
    soundAlert: false
  },
  {
    id: "rem-4",
    title: "Peregangan Ergonomis Sendi LimoCity Therapy",
    time: "10:30",
    category: "Peregangan",
    enabled: true,
    soundAlert: true
  },
  {
    id: "rem-5",
    title: "Jalan Santai 15 Menit Pasca Makan Siang",
    time: "13:30",
    category: "Jalan Kaki",
    enabled: true,
    soundAlert: false
  },
  {
    id: "rem-6",
    title: "Persiapan Istirahat & Relaksasi Malam",
    time: "21:30",
    category: "Tidur",
    enabled: true,
    soundAlert: true
  }
];

export const INITIAL_DAILY_HEALTH_TIPS: Record<string, {
  dailyFocusHeadline: string;
  overallReadinessScore: number;
  tips: Array<{
    id: string;
    category: "Kardiovaskular" | "Nutrisi & Hidrasi" | "Aktivitas & Fisioterapi" | "Istirahat & Stres" | "Pencegahan Klinis";
    title: string;
    shortAdvice: string;
    actionableStep: string;
    bestTime: string;
    importance: "Tinggi" | "Penting" | "Rekomendasi";
    scientificRationale: string;
  }>;
}> = {
  "fam-01": {
    dailyFocusHeadline: "Regulasi Tekanan Vaskular & Rileksasi Tengkuk Servikal",
    overallReadinessScore: 84,
    tips: [
      {
        id: "tip-01-1",
        category: "Kardiovaskular",
        title: "Stabilisasi Vaskular Pagi",
        shortAdvice: "Minum 400ml air hangat saat bangun tidur sebelum konsumsi kafein untuk menurunkan resistensi vaskular perifer.",
        actionableStep: "Siapkan satu gelas air putih bersuhu ruang di samping meja kerja pagi ini.",
        bestTime: "Pagi 06:30",
        importance: "Tinggi",
        scientificRationale: "Dehidrasi ringan di pagi hari meningkatkan viskositas darah dan memicu lonjakan tekanan sistolik."
      },
      {
        id: "tip-01-2",
        category: "Aktivitas & Fisioterapi",
        title: "Peregangan Tengkuk Servikal LimoCity",
        shortAdvice: "Lakukan gerakan chin tuck dan rotasi leher lateral 15 detik untuk meredakan kekakuan saraf trapezius akibat kerja duduk.",
        actionableStep: "Lakukan 3 set peregangan leher saat jeda rapat atau di sela jam kerja komputer.",
        bestTime: "Siang 11:30",
        importance: "Penting",
        scientificRationale: "Mengurangi kompresi foramen servikalis dan melancarkan mikrosirkulasi arteri vertebralis ke basis cranii."
      },
      {
        id: "tip-01-3",
        category: "Nutrisi & Hidrasi",
        title: "Asupan Kalium Penyeimbang Natrium",
        shortAdvice: "Konsumsi pisang ambon atau air kelapa murni tanpa gula untuk memicu vasodilatasi pembuluh darah perifer.",
        actionableStep: "Pilih buah potong segar sebagai kudapan sore pengganti gorengan atau camilan bergaram.",
        bestTime: "Sore 15:30",
        importance: "Penting",
        scientificRationale: "Rasio kalium:natrium yang seimbang mengoptimalkan ekskresi kelebihan natrium melalui tubulus ginjal."
      },
      {
        id: "tip-01-4",
        category: "Istirahat & Stres",
        title: "Ritme Napas Diafragma 4-7-8",
        shortAdvice: "Tarik napas 4 detik, tahan 7 detik, lalu hembuskan 8 detik selama 5 siklus untuk mengaktifkan saraf vagus.",
        actionableStep: "Redupkan lampu kamar 30 menit sebelum tidur dan lakukan latihan napas diafragma.",
        bestTime: "Malam 21:45",
        importance: "Rekomendasi",
        scientificRationale: "Menurunkan pelepasan katekolamin dan menstabilkan variabilitas denyut jantung (HRV) saat fase deep sleep."
      }
    ]
  },
  "fam-02": {
    dailyFocusHeadline: "Proteksi Sendi Lutut & Nutrisi Anti-Inflamasi Alami",
    overallReadinessScore: 89,
    tips: [
      {
        id: "tip-02-1",
        category: "Aktivitas & Fisioterapi",
        title: "Aktivasi Isometrik Kuadrisep",
        shortAdvice: "Kencangkan otot paha depan selama 10 detik dalam posisi duduk tegak tanpa membebani engsel lutut.",
        actionableStep: "Lakukan 10 kali kontraksi isometrik kuadrisep setiap pagi sebelum turun dari ranjang.",
        bestTime: "Pagi 07:00",
        importance: "Tinggi",
        scientificRationale: "Memperkuat stabilisator patella dan mengurangi gesekan pada celah sendi lutut kiri yang mengalami OA ringan."
      },
      {
        id: "tip-02-2",
        category: "Nutrisi & Hidrasi",
        title: "Seduhan Kunyit Madu Anti-Inflamasi",
        shortAdvice: "Minum air rebusan rimpang kunyit segar dengan sejumput lada hitam untuk meningkatkan bioavailabilitas kurkumin.",
        actionableStep: "Gantikan teh manis pagi dengan rebusan herbal hangat alami tanpa pemanis buatan.",
        bestTime: "Pagi 08:30",
        importance: "Penting",
        scientificRationale: "Kurkuminoid menghambat enzim COX-2 dan sitokin pro-inflamasi pada jaringan sinovial sendi."
      },
      {
        id: "tip-02-3",
        category: "Pencegahan Klinis",
        title: "Manajemen Hentakan Berjalan",
        shortAdvice: "Gunakan alas kaki berbantalan empuk (cushioning) saat beraktivitas di dalam maupun luar rumah.",
        actionableStep: "Hindari menaiki tangga lebih dari 2 lantai berturut-turut, prioritaskan lift atau jalan datar.",
        bestTime: "Siang 12:00",
        importance: "Penting",
        scientificRationale: "Mengurangi ground reaction force hingga 40% pada kartilago artikular tibia-femoral."
      },
      {
        id: "tip-02-4",
        category: "Istirahat & Stres",
        title: "Elevasi Tungkai Bawah Sore Hari",
        shortAdvice: "Posisikan kaki lebih tinggi dari pinggul selama 15 menit untuk memperlancar aliran balik vena.",
        actionableStep: "Ganjal bantal di bawah betis sambil membaca atau bersantai di sore hari.",
        bestTime: "Sore 17:00",
        importance: "Rekomendasi",
        scientificRationale: "Mencegah edema dependen pada pergelangan kaki dan menurunkan rasa pegal pasca beraktivitas."
      }
    ]
  },
  "fam-03": {
    dailyFocusHeadline: "Pemulihan Otot Atletik & Pengisian Ulang Glikogen",
    overallReadinessScore: 96,
    tips: [
      {
        id: "tip-03-1",
        category: "Aktivitas & Fisioterapi",
        title: "Active Recovery & Dynamic Mobility",
        shortAdvice: "Hindari duduk diam total pasca latihan lari panjang; lakukan jalan santai 10 menit dan peregangan dinamis panggul.",
        actionableStep: "Gunakan foam roller pada area fascia IT band dan betis selama 5 menit.",
        bestTime: "Pagi 08:00",
        importance: "Penting",
        scientificRationale: "Mempercepat klirens laktat dan mengurangi delayed onset muscle soreness (DOMS) pada serabut otot tipe I."
      },
      {
        id: "tip-03-2",
        category: "Nutrisi & Hidrasi",
        title: "Rehidrasi Elektrolit Hipotonik",
        shortAdvice: "Konsumsi cairan elektrolit seimbang (natrium, kalium, magnesium) untuk menggantikan keringat yang hilang.",
        actionableStep: "Targetkan asupan cairan 3,2 liter air hari ini dengan tambahan elektrolit alami.",
        bestTime: "Siang 13:00",
        importance: "Tinggi",
        scientificRationale: "Memulihkan volume plasma intravaskular dan menjaga stabilitas denyut istirahat (resting HR)."
      },
      {
        id: "tip-03-3",
        category: "Kardiovaskular",
        title: "Pantau Tren Recovery HRV",
        shortAdvice: "HRV Anda saat ini tinggi (82 ms), menandakan kapasitas adaptasi otonom parasimpatis sangat prima.",
        actionableStep: "Pertahankan ritme latihan aerobik zona 2 hari ini dan jangan overtraining.",
        bestTime: "Sore 16:30",
        importance: "Rekomendasi",
        scientificRationale: "Indeks parasimpatis tinggi mencerminkan pemulihan kardiorespirasi yang optimal pasca beban fisik."
      },
      {
        id: "tip-03-4",
        category: "Istirahat & Stres",
        title: "Tidur Gelombang Lambat (Deep Sleep)",
        shortAdvice: "Atur suhu kamar tidur pada 22°C dan redupkan pencahayaan untuk memaksimalkan fase restorative sleep.",
        actionableStep: "Hentikan konsumsi suplemen berkafein minimal 7 jam sebelum jam tidur malam.",
        bestTime: "Malam 22:00",
        importance: "Penting",
        scientificRationale: "Fase tidur lambat memicu sekresi human growth hormone (HGH) untuk regenerasi miofibril otot."
      }
    ]
  },
  "fam-04": {
    dailyFocusHeadline: "Pelepasan Astenopia (Mata Lelah) & Postur Belajar Ergonomis",
    overallReadinessScore: 92,
    tips: [
      {
        id: "tip-04-1",
        category: "Pencegahan Klinis",
        title: "Protokol 20-20-20 Relaksasi Mata",
        shortAdvice: "Setiap 20 menit menatap layar laptop atau ponsel, alihkan pandangan ke objek berjarak 6 meter selama 20 detik.",
        actionableStep: "Kedipkan mata 10 kali secara penuh saat alarm jeda layar berbunyi.",
        bestTime: "Siang 10:30",
        importance: "Tinggi",
        scientificRationale: "Melemaskan otot siliaris mata yang terus berkontraksi saat melihat jarak dekat (akomodasi terus-menerus)."
      },
      {
        id: "tip-04-2",
        category: "Aktivitas & Fisioterapi",
        title: "Koreksi Postur Leher Belajar",
        shortAdvice: "Atur tinggi layar sejajar dengan batas atas mata agar leher tidak membungkuk lebih dari 15 derajat.",
        actionableStep: "Gunakan stand laptop atau sanggahan buku agar posisi kepala tetap netral.",
        bestTime: "Siang 14:00",
        importance: "Penting",
        scientificRationale: "Kemiringan leher 30 derajat melipatgandakan beban gravitasi pada ruas tulang leher hingga setara 18 kg."
      },
      {
        id: "tip-04-3",
        category: "Nutrisi & Hidrasi",
        title: "Nutrisi Karotenoid Lutein & Zeaksantin",
        shortAdvice: "Konsumsi sayuran hijau gelap seperti bayam, brokoli, atau wortel segar untuk melindungi fotoreseptor retina.",
        actionableStep: "Sertakan sayur bayam bening atau jus wortel tomat pada menu makan siang hari ini.",
        bestTime: "Siang 12:30",
        importance: "Rekomendasi",
        scientificRationale: "Karotenoid makular bertindak sebagai filter cahaya biru alami pada fotoreseptor retina mata."
      },
      {
        id: "tip-04-4",
        category: "Istirahat & Stres",
        title: "Digital Sunset 45 Menit Pra-Tidur",
        shortAdvice: "Matikan gadget atau aktifkan mode malam hangat 45 menit sebelum tidur malam untuk sintesis melatonin alami.",
        actionableStep: "Ganti scrolling media sosial sebelum tidur dengan membaca buku cetak atau mendengarkan audio relaksasi.",
        bestTime: "Malam 21:15",
        importance: "Penting",
        scientificRationale: "Panjang gelombang cahaya biru menekan pelepasan melatonin dari kelenjar pineal, menunda onset tidur."
      }
    ]
  },
  "fam-05": {
    dailyFocusHeadline: "Pemeliharaan Kapasitas Kardiak Geriatrik & Proteksi Risiko Jatuh",
    overallReadinessScore: 78,
    tips: [
      {
        id: "tip-05-1",
        category: "Kardiovaskular",
        title: "Jalan Santai Pagi di Permukaan Datar",
        shortAdvice: "Jalan kaki santai 15-20 menit di taman datar bersinar matahari pagi, tanpa tanjakan curam yang memicu sesak napas.",
        actionableStep: "Dampingi Kakek berjalan santai setelah sarapan pagi dengan sepatu berdaya cengkeram aman.",
        bestTime: "Pagi 07:30",
        importance: "Tinggi",
        scientificRationale: "Merangsang aliran darah kolateral miokardium tanpa melampaui ambang anaerobik atau membebani stent jantung."
      },
      {
        id: "tip-05-2",
        category: "Pencegahan Klinis",
        title: "Transisi Bangkit Bertahap (Anti-Hipotensi)",
        shortAdvice: "Duduk tegak di tepi ranjang selama 1-2 menit sebelum berdiri untuk mencegah sensasi pusing melayang.",
        actionableStep: "Gerak-gerakkan ujung jari kaki beberapa kali saat duduk sebelum mulai melangkah berdiri.",
        bestTime: "Pagi 06:00",
        importance: "Tinggi",
        scientificRationale: "Refleks baroreseptor usia geriatrik melambat; transisi bertahap mencegah pooling darah di ekstremitas bawah."
      },
      {
        id: "tip-05-3",
        category: "Nutrisi & Hidrasi",
        title: "Porsi Makan Sedang Berserat Halus",
        shortAdvice: "Hindari makan terlalu kenyang dalam satu waktu. Bagi makanan menjadi 4-5 porsi kecil bernutrisi seimbang.",
        actionableStep: "Pilih sup bening dengan potongan tahu lembut dan ikan kukus yang mudah dicerna.",
        bestTime: "Siang 12:00",
        importance: "Penting",
        scientificRationale: "Makan berlebihan mengalihkan aliran darah perifer secara masif ke sirkulasi splanknik (postprandial hypotension)."
      },
      {
        id: "tip-05-4",
        category: "Aktivitas & Fisioterapi",
        title: "Latihan Keseimbangan Statis Ankle",
        shortAdvice: "Latihan berdiri berpegangan pada sandaran kursi kokoh sambil mengangkat tumit secara perlahan 5 kali.",
        actionableStep: "Lakukan latihan keseimbangan didampingi anggota keluarga setelah istirahat siang.",
        bestTime: "Sore 16:00",
        importance: "Penting",
        scientificRationale: "Menjaga kepekaan propioseptif sendi pergelangan kaki yang sangat krusial dalam pencegahan jatuh lansia."
      }
    ]
  }
};

export const INITIAL_WEEKLY_HEALTH_GOALS: Record<string, WeeklyHealthGoal[]> = {
  "fam-01": [
    {
      id: "goal-01-steps",
      category: "steps",
      title: "Langkah Kaki Mingguan",
      unit: "langkah",
      currentWeeklyValue: 43650,
      targetWeeklyValue: 56000,
      dailyHistory: [
        { day: "Sen", value: 8120, achieved: true },
        { day: "Sel", value: 8450, achieved: true },
        { day: "Rab", value: 7600, achieved: false },
        { day: "Kam", value: 8900, achieved: true },
        { day: "Jum", value: 8200, achieved: true },
        { day: "Sab", value: 2380, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "steps",
      recommendedByDoctor: "Dr. Farhan Sp.JP (Spesialis Jantung & Pembuluh Darah)",
      clinicalNote: "Target 8.000 langkah/hari untuk menurunkan resistensi vaskular perifer dan mengontrol tekanan darah sistolik."
    },
    {
      id: "goal-01-sleep",
      category: "sleep",
      title: "Durasi Tidur Restoratif",
      unit: "jam",
      currentWeeklyValue: 36.8,
      targetWeeklyValue: 49.0,
      dailyHistory: [
        { day: "Sen", value: 7.0, achieved: true },
        { day: "Sel", value: 7.2, achieved: true },
        { day: "Rab", value: 6.8, achieved: false },
        { day: "Kam", value: 7.5, achieved: true },
        { day: "Jum", value: 8.3, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "sleepHours",
      recommendedByDoctor: "Dr. Siti Rahayu Sp.N (Spesialis Saraf & Tidur)",
      clinicalNote: "Durasi tidur 7 jam/malam sangat krusial untuk fase nocturnal dipping tekanan darah dan pemulihan endotel."
    },
    {
      id: "goal-01-calories",
      category: "calories",
      title: "Pembakaran Kalori Aktif",
      unit: "kkal",
      currentWeeklyValue: 2450,
      targetWeeklyValue: 3360,
      dailyHistory: [
        { day: "Sen", value: 460, achieved: false },
        { day: "Sel", value: 480, achieved: true },
        { day: "Rab", value: 420, achieved: false },
        { day: "Kam", value: 520, achieved: true },
        { day: "Jum", value: 570, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "activeCalories",
      recommendedByDoctor: "Bambang Tri Nugroho M.Kes (Fisioterapis Utama)",
      clinicalNote: "Membantu metabolisme trigliserida dan menurunkan indeks adipositas viseral."
    },
    {
      id: "goal-01-therapy",
      category: "therapy",
      title: "Sesi Ergonomi & Terapi Kardio",
      unit: "sesi",
      currentWeeklyValue: 3,
      targetWeeklyValue: 4,
      dailyHistory: [
        { day: "Sen", value: 1, achieved: true },
        { day: "Sel", value: 0, achieved: false },
        { day: "Rab", value: 1, achieved: true },
        { day: "Kam", value: 0, achieved: false },
        { day: "Jum", value: 1, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "therapySessions",
      recommendedByDoctor: "Tim Fisioterapi LimoCity",
      clinicalNote: "Protokol relaksasi tengkuk dan peregangan vaskular pasca jam kerja kantor."
    }
  ],
  "fam-02": [
    {
      id: "goal-02-steps",
      category: "steps",
      title: "Langkah Ringan Ramah Sendi",
      unit: "langkah",
      currentWeeklyValue: 33500,
      targetWeeklyValue: 42000,
      dailyHistory: [
        { day: "Sen", value: 6100, achieved: true },
        { day: "Sel", value: 6200, achieved: true },
        { day: "Rab", value: 5800, achieved: false },
        { day: "Kam", value: 6400, achieved: true },
        { day: "Jum", value: 6300, achieved: true },
        { day: "Sab", value: 2700, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "steps",
      recommendedByDoctor: "Dr. Bambang Sp.OT (Spesialis Bedah Ortopedi & Traumatologi)",
      clinicalNote: "Pertahankan 6.000 langkah di permukaan rata bersepatu empuk untuk stimulasi cairan sinovial lutut."
    },
    {
      id: "goal-02-sleep",
      category: "sleep",
      title: "Waktu Tidur Sehat & Regenerasi",
      unit: "jam",
      currentWeeklyValue: 39.5,
      targetWeeklyValue: 52.5,
      dailyHistory: [
        { day: "Sen", value: 7.8, achieved: true },
        { day: "Sel", value: 7.9, achieved: true },
        { day: "Rab", value: 7.6, achieved: true },
        { day: "Kam", value: 8.0, achieved: true },
        { day: "Jum", value: 8.2, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "sleepHours",
      recommendedByDoctor: "Dr. Aisyah Sp.GK (Spesialis Gizi Klinis)",
      clinicalNote: "Tidur 7.5 jam mengoptimalkan sintesis kolagen sendi dan menekan sitokin inflamasi IL-6."
    },
    {
      id: "goal-02-therapy",
      category: "therapy",
      title: "Latihan Mobilitas Lutut & Peregangan",
      unit: "sesi",
      currentWeeklyValue: 4,
      targetWeeklyValue: 5,
      dailyHistory: [
        { day: "Sen", value: 1, achieved: true },
        { day: "Sel", value: 1, achieved: true },
        { day: "Rab", value: 0, achieved: false },
        { day: "Kam", value: 1, achieved: true },
        { day: "Jum", value: 1, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "therapySessions",
      recommendedByDoctor: "Fisioterapi GerSaKa LimoCity",
      clinicalNote: "Penguatan otot paha depan (quadriceps) isometrik tanpa beban kompresi lutut."
    }
  ],
  "fam-03": [
    {
      id: "goal-03-steps",
      category: "steps",
      title: "Total Langkah & Lari Mingguan",
      unit: "langkah",
      currentWeeklyValue: 68500,
      targetWeeklyValue: 84000,
      dailyHistory: [
        { day: "Sen", value: 12800, achieved: true },
        { day: "Sel", value: 12400, achieved: true },
        { day: "Rab", value: 13500, achieved: true },
        { day: "Kam", value: 11900, achieved: false },
        { day: "Jum", value: 14200, achieved: true },
        { day: "Sab", value: 3700, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "steps",
      recommendedByDoctor: "Dr. Farhan Sp.JP (Spesialis Kedokteran Olahraga)",
      clinicalNote: "Kombinasi latihan lari aerobik zona 2 untuk peningkatan VO2 Max dan efisiensi pompa ventrikel."
    },
    {
      id: "goal-03-sleep",
      category: "sleep",
      title: "Tidur Pemulihan Otot & Atlet",
      unit: "jam",
      currentWeeklyValue: 41.2,
      targetWeeklyValue: 56.0,
      dailyHistory: [
        { day: "Sen", value: 8.2, achieved: true },
        { day: "Sel", value: 8.1, achieved: true },
        { day: "Rab", value: 8.4, achieved: true },
        { day: "Kam", value: 7.9, achieved: false },
        { day: "Jum", value: 8.6, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "sleepHours",
      recommendedByDoctor: "Dr. Siti Rahayu Sp.N",
      clinicalNote: "Fase tidur dalam (deep slow-wave sleep) melepaskan hormon pertumbuhan (HGH) untuk regenerasi mikrotear otot."
    },
    {
      id: "goal-03-calories",
      category: "calories",
      title: "Kalori Aktif Atlet Mingguan",
      unit: "kkal",
      currentWeeklyValue: 4200,
      targetWeeklyValue: 5600,
      dailyHistory: [
        { day: "Sen", value: 820, achieved: true },
        { day: "Sel", value: 760, achieved: false },
        { day: "Rab", value: 890, achieved: true },
        { day: "Kam", value: 780, achieved: false },
        { day: "Jum", value: 950, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "activeCalories",
      recommendedByDoctor: "LimoCity Sports Physiology Team",
      clinicalNote: "Menyeimbangkan asupan glikogen dan konsumsi hidrasi elektrolit selama siklus latihan intensitas tinggi."
    }
  ],
  "fam-04": [
    {
      id: "goal-04-steps",
      category: "steps",
      title: "Aktivitas Fisik & Langkah Sehat",
      unit: "langkah",
      currentWeeklyValue: 39800,
      targetWeeklyValue: 49000,
      dailyHistory: [
        { day: "Sen", value: 7200, achieved: true },
        { day: "Sel", value: 7100, achieved: true },
        { day: "Rab", value: 6800, achieved: false },
        { day: "Kam", value: 7500, achieved: true },
        { day: "Jum", value: 7400, achieved: true },
        { day: "Sab", value: 3800, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "steps",
      recommendedByDoctor: "Dr. Citra Sp.A (Spesialis Anak & Remaja)",
      clinicalNote: "Target 7.000 langkah/hari memutus kebiasaan sedentari dan postur membungkuk saat belajar."
    },
    {
      id: "goal-04-sleep",
      category: "sleep",
      title: "Waktu Tidur Remaja & Istirahat Layar",
      unit: "jam",
      currentWeeklyValue: 38.6,
      targetWeeklyValue: 56.0,
      dailyHistory: [
        { day: "Sen", value: 7.6, achieved: false },
        { day: "Sel", value: 7.5, achieved: false },
        { day: "Rab", value: 7.8, achieved: false },
        { day: "Kam", value: 8.0, achieved: true },
        { day: "Jum", value: 7.7, achieved: false },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "sleepHours",
      recommendedByDoctor: "Dr. Siti Rahayu Sp.N",
      clinicalNote: "Minimal 8 jam tidur untuk memulihkan kelelahan akomodasi mata dan retensi memori belajar."
    }
  ],
  "fam-05": [
    {
      id: "goal-05-steps",
      category: "steps",
      title: "Langkah Santai Geriatrik Terarah",
      unit: "langkah",
      currentWeeklyValue: 24200,
      targetWeeklyValue: 31500,
      dailyHistory: [
        { day: "Sen", value: 4600, achieved: true },
        { day: "Sel", value: 4300, achieved: false },
        { day: "Rab", value: 4700, achieved: true },
        { day: "Kam", value: 4550, achieved: true },
        { day: "Jum", value: 4650, achieved: true },
        { day: "Sab", value: 1400, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "steps",
      recommendedByDoctor: "Dr. Hendra Sp.PD-KGer (Konsultan Geriatri)",
      clinicalNote: "Jalan santai pagi 4.500 langkah untuk menjaga sirkulasi kapiler perifer dan fungsi kognitif otak."
    },
    {
      id: "goal-05-sleep",
      category: "sleep",
      title: "Durasi Tidur Lansia & Tidur Siang",
      unit: "jam",
      currentWeeklyValue: 36.2,
      targetWeeklyValue: 49.0,
      dailyHistory: [
        { day: "Sen", value: 7.1, achieved: true },
        { day: "Sel", value: 6.9, achieved: false },
        { day: "Rab", value: 7.3, achieved: true },
        { day: "Kam", value: 7.2, achieved: true },
        { day: "Jum", value: 7.7, achieved: true },
        { day: "Sab", value: 0, achieved: false },
        { day: "Min", value: 0, achieved: false },
      ],
      wearableMetricKey: "sleepHours",
      recommendedByDoctor: "Dr. Siti Rahayu Sp.N",
      clinicalNote: "Mempertahankan pola tidur konsisten 7 jam mencegah fluktuasi tekanan darah pagi (morning BP surge)."
    }
  ]
};


