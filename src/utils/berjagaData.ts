import { FamilyMember } from "../types";

export type BerjagaPillarId = 
  | "bergerak" 
  | "bekerja" 
  | "berbekam" 
  | "berdakwah" 
  | "bersyariah" 
  | "berjamaah" 
  | "bermuamalah" 
  | "bahagia_sejahtera";

export interface BerjagaPillarInfo {
  id: BerjagaPillarId;
  code: string;
  letter: string;
  name: string;
  tagline: string;
  arabicName: string;
  colorScheme: {
    primary: string;
    bg: string;
    border: string;
    text: string;
    gradient: string;
    badge: string;
  };
  iconName: string;
  quranHadithRef: {
    arabic: string;
    translation: string;
    source: string;
  };
  dailyTargetSummary: string;
  actionItems: {
    id: string;
    title: string;
    category: string;
    points: number;
    description: string;
    completed: boolean;
  }[];
}

export interface BekamPoint {
  id: string;
  nameArabic: string;
  nameLatin: string;
  location: string;
  anatomicalCode: string;
  clinicalBenefits: string[];
  contraindications: string[];
  recommendedSesi: string;
}

export interface DailyHadithCard {
  id: string;
  theme: string;
  arabic: string;
  translation: string;
  narrator: string;
  healthWisdom: string;
  actionAdvice: string;
  sharableText: string;
}

export interface HalalAuditItem {
  id: string;
  productName: string;
  brandOrSource: string;
  category: "Obat & Farmasi" | "Nutrisi & Suplemen" | "Herbal Thayyib" | "Pangan Sehari-hari";
  halalCertStatus: "Tersertifikasi BPJPH/MUI" | "Herbal Nabawi Murni" | "Dalam Peninjauan";
  halalRegNo: string;
  thayyibScore: number; // 0-100
  clinicalNotes: string;
  suitableForMemberIds: string[];
}

export interface MosqueprayerSchedule {
  subuh: string;
  syuruq: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  nextPrayer: string;
  countdownMinutes: number;
}

export const SUNNAH_BEKAM_POINTS: BekamPoint[] = [
  {
    id: "p-kahil",
    nameArabic: "الكاهل",
    nameLatin: "Al-Kahil",
    location: "Punggung atas, setinggi ruas tulang leher ke-7 dan tulang punggung ke-1 (C7-T1)",
    anatomicalCode: "C7-T1 Vertebrae",
    clinicalBenefits: [
      "Menormalkan tekanan darah arterial (hipertensi) dan sirkulasi kardiovaskular",
      "Meredakan ketegangan otot servikal, bahu kaku, dan migrain vaskular",
      "Titik sentral pembersihan endotoksin metabolik dan mediator inflamasi"
    ],
    contraindications: ["Luka infeksi terbuka di area tengkuk", "Kulit terbakar sinar matahari parah"],
    recommendedSesi: "Wajib / Titik Utama Setiap Sesi Hijamah"
  },
  {
    id: "p-akhdain",
    nameArabic: "الأخدعان",
    nameLatin: "Al-Akhda'ain",
    location: "Dua urat leher lateral, di belakang otot sternocleidomastoideus",
    anatomicalCode: "Bilateral Lateral Cervical",
    clinicalBenefits: [
      "Mengurangi tekanan intrakranial, pusing vertigo, dan tinitus",
      "Memperbaiki aliran darah mikro ke telinga, mata, dan sinus serebral",
      "Meredakan kekakuan leher akibat stres kerja atau postur layar"
    ],
    contraindications: ["Dilarang menusuk langsung pada arteri carotis (hanya bekam kering atau kop ringan bagi pemula)"],
    recommendedSesi: "Sangat Dianjurkan untuk Pekerja Meja & Hipertensi"
  },
  {
    id: "p-katifain",
    nameArabic: "الكتفين",
    nameLatin: "Al-Katifain",
    location: "Kedua puncak bahu (otot trapezius kanan dan kiri)",
    anatomicalCode: "Acromial / Trapezius Area",
    clinicalBenefits: [
      "Mengatasi sindrom bahu beku (frozen shoulder) dan myalgia trapezius",
      "Membantu menurunkan respons stres otonom dan ketegangan psikis",
      "Meningkatkan rentang gerak ekstremitas atas"
    ],
    contraindications: ["Fraktur klavikula aktif", "Dislokasi sendi bahu akut"],
    recommendedSesi: "Dianjurkan untuk Atlet, Pekerja Fisik & Lansia"
  },
  {
    id: "p-haamah",
    nameArabic: "الهامة / اليافوخ",
    nameLatin: "Al-Haamah / Yafukh",
    location: "Puncak kepala (Vertex cranial) atau pertemuan garis telinga atas",
    anatomicalCode: "Cranial Vertex / Sagittal Suture",
    clinicalBenefits: [
      "Menjernihkan pikiran, meningkatkan memori dan konsentrasi",
      "Meredakan sakit kepala kronis (cefalea) dan ketegangan insomnia",
      "Titik kesadaran spiritual dan keseimbangan sistem saraf pusat"
    ],
    contraindications: ["Pasca operasi bedah tempurung kepala", "Anak di bawah usia 5 tahun"],
    recommendedSesi: "Opsional dengan Terapis PBI Berpengalaman"
  },
  {
    id: "p-warik",
    nameArabic: "الورك",
    nameLatin: "Al-Warik / Lumbo-Sacral",
    location: "Punggung bawah setinggi L4-S1 dan pangkal panggul",
    anatomicalCode: "Lumbar-Sacral Junction (L4-S1)",
    clinicalBenefits: [
      "Mengurangi nyeri pinggang bawah (low back pain) dan linu panggul",
      "Membantu dekompresi saraf ischiadicus dan kekakuan sendi sakroiliaka",
      "Memperlancar peredaran darah organ pelvis dan saluran kemih"
    ],
    contraindications: ["Wanita hamil trimester pertama atau ketiga", "Hernia nukleus pulposus akut tahap bedah"],
    recommendedSesi: "Sangat Dianjurkan untuk Lansia & Pengemudi Rutin"
  }
];

export const DAILY_HADITH_COLLECTION: DailyHadithCard[] = [
  {
    id: "hadith-01",
    theme: "Dua Kenikmatan Terbesar: Sehat & Waktu Luang",
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
    translation: "Dua kenikmatan yang seringkali membuat manusia tertipu (lalai dan merugi): kesehatan dan waktu luang.",
    narrator: "HR. Al-Bukhari (No. 6412) dari Sahabat Ibnu Abbas radhiyallahu 'anhuma",
    healthWisdom: "Kesehatan adalah modal utama ibadah, jihad, dan muamalah. Jangan menunggu jatuh sakit baru menyadari betapa berharganya organ tubuh yang berfungsi normal.",
    actionAdvice: "Gunakan 30 menit waktu luang pagi ini untuk berjalan kaki aktif, bersyukur atas detak jantung yang normal, dan memperbanyak istighfar.",
    sharableText: "✨ Mutiara Sehat Islamicity BERJAGA:\n\"Dua kenikmatan yang seringkali membuat manusia tertipu: kesehatan dan waktu luang.\" (HR. Al-Bukhari)\nYuk rawat kesehatan keluarga kita sebagai amanah Allah!"
  },
  {
    id: "hadith-02",
    theme: "Aturan Makan Thayyib: Prinsip Sepertiga Lambung",
    arabic: "مَا مَلأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ، بِحَسْبِ ابْنِ آدَمَ أُكُلاَتٌ يُقِمْنَ صُلْبَهُ، فَإِنْ كَانَ لاَ مَحَالَةَ فَثُلُثٌ لِطَعَامِهِ، وَثُلُثٌ لِشَرَابِهِ، وَثُلُثٌ لِنَفَسِهِ",
    translation: "Tidak ada wadah yang lebih buruk dipenuhi oleh manusia selain perutnya. Cukuplah bagi anak Adam beberapa suap makanan yang menegakkan punggungnya. Jika harus lebih, maka sepertiga untuk makanannya, sepertiga untuk minumannya, dan sepertiga untuk nafasnya.",
    narrator: "HR. At-Tirmidzi (No. 2380) & Ibnu Majah, dinilai Shahih oleh Al-Albani",
    healthWisdom: "Prinsip 1/3 makanan, 1/3 air, 1/3 udara adalah dasar metabolisme modern: mencegah lonjakan glukosa (spike insulin), menjaga elastisitas diafragma paru, dan meringankan beban kerja jantung.",
    actionAdvice: "Makan perlahan, kunyah makanan hingga halus, berhenti sebelum kenyang berlebih, dan hindari minum air dingin bergelas-gelas saat perut baru terisi makanan padat.",
    sharableText: "🍽️ Sunnah Makan Islamicity BERJAGA:\nRasulullah ﷺ mengajarkan: 1/3 untuk makanan, 1/3 untuk minuman, 1/3 untuk nafas (HR. Tirmidzi). Menjaga perut ringan adalah kunci vitalitas panjang umur!"
  },
  {
    id: "hadith-03",
    theme: "Thibbun Nabawi: Pengobatan Bekam & Madu",
    arabic: "الشِّفَاءُ فِي ثَلاَثَةٍ: شَرْبَةِ عَسَلٍ، وَشَرْطَةِ مِحْجَمٍ، وَكَيَّةِ نَارٍ، وَأَنْهَى أُمَّتِي عَنِ الْكَيِّ",
    translation: "Kesembuhan itu ada pada tiga perkara: tegukan madu, sayatan alat bekam (hijamah), dan sundutan api (kayy). Namun aku melarang umatku dari sundutan api.",
    narrator: "HR. Al-Bukhari (No. 5680) dari Sahabat Ibnu Abbas radhiyallahu 'anhuma",
    healthWisdom: "Bekam membersihkan sel darah merah tua (eritrosit terdeformasi) dan menurunkan stres oksidatif vaskular, sedangkan madu murni kaya enzim inhibin, asam amino, dan mikronutrien imun.",
    actionAdvice: "Minum satu sendok makan madu murni dicampur air hangat di pagi hari saat perut kosong, dan jadwalkan bekam pada tanggal sunnah 17, 19, atau 21 Hijriah.",
    sharableText: "🍯 Sunnah Penyembuhan Islamicity BERJAGA:\n\"Kesembuhan ada pada tegukan madu dan sayatan bekam...\" (HR. Bukhari). Sinergi Thibbun Nabawi dan sains kedokteran untuk keluarga berkah!"
  },
  {
    id: "hadith-04",
    theme: "Mukmin yang Kuat Lebih Dicintai Allah",
    arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ",
    translation: "Mukmin yang kuat lebih baik dan lebih dicintai oleh Allah daripada mukmin yang lemah, namun pada keduanya ada kebaikan.",
    narrator: "HR. Muslim (No. 2664) dari Sahabat Abu Hurairah radhiyallahu 'anhu",
    healthWisdom: "Kekuatan mencakup kekuatan fisik, ketahanan mental, kebugaran kardiorespirasi, dan kemandirian finansial yang menunjang ketaatan kepada Allah.",
    actionAdvice: "Lakukan latihan kekuatan otot teratur (push-up, squat, peregangan sunnah) agar di usia senja tetap mandiri, mampu shalat berdiri, dan mampu berkhidmat bagi umat.",
    sharableText: "💪 Filosofi Bergerak Islamicity BERJAGA:\n\"Mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah...\" (HR. Muslim). Mari berolahraga dengan niat ibadah!"
  }
];

export const HALAL_THAYYIB_AUDIT_ITEMS: HalalAuditItem[] = [
  {
    id: "hal-01",
    productName: "Amlodipine Besilate & Kapsul Obat Kardio",
    brandOrSource: "Kimia Farma / Apotek LimoCity Farma",
    category: "Obat & Farmasi",
    halalCertStatus: "Tersertifikasi BPJPH/MUI",
    halalRegNo: "ID0011000023410122",
    thayyibScore: 98,
    clinicalNotes: "Cangkang kapsul 100% gelatin sapi halal bersertifikat MUI. Aman untuk terapi hipertensi Ayah Hendra tanpa syubhat.",
    suitableForMemberIds: ["fam-01"]
  },
  {
    id: "hal-02",
    productName: "Madu Habbatussauda Raw Organik",
    brandOrSource: "LimoCity Herbal Thayyib Care",
    category: "Herbal Thayyib",
    halalCertStatus: "Herbal Nabawi Murni",
    halalRegNo: "PIRT-2093276010044-26",
    thayyibScore: 96,
    clinicalNotes: "Kadar enzim diastase tinggi, kadar air < 19%, bebas zat kimia tambahan. Sangat baik untuk daya tahan seluler seluruh keluarga.",
    suitableForMemberIds: ["fam-01", "fam-02", "fam-03", "fam-04", "fam-05"]
  },
  {
    id: "hal-03",
    productName: "Minyak Zaitun Extra Virgin (Perasan Dingin)",
    brandOrSource: "Al-Arbiya Organic Imports",
    category: "Nutrisi & Suplemen",
    halalCertStatus: "Tersertifikasi BPJPH/MUI",
    halalRegNo: "ID3211000189920034",
    thayyibScore: 95,
    clinicalNotes: "Kaya asam lemak tak jenuh tunggal (MUFA) dan polifenol pelindung endotel pembuluh darah dan kesehatan sendi Ibu Siti.",
    suitableForMemberIds: ["fam-01", "fam-02", "fam-05"]
  },
  {
    id: "hal-04",
    productName: "Susu Kambing Etawa Kurma Organik",
    brandOrSource: "Peternakan Berkah Daulah LimoCity",
    category: "Pangan Sehari-hari",
    halalCertStatus: "Tersertifikasi BPJPH/MUI",
    halalRegNo: "ID3211000087720121",
    thayyibScore: 94,
    clinicalNotes: "Tinggi kalsium organik dan fosfor mudah diserap usus, rendah laktosa, bebas pengawet. Mendukung remineralisasi tulang Ibu Siti dan Kakek Mansyur.",
    suitableForMemberIds: ["fam-02", "fam-05"]
  }
];

export function getEstimatedHijriDate(date: Date = new Date()): {
  day: number;
  monthName: string;
  year: number;
  isSunnahBekamDay: boolean;
  daysUntilNextSunnahBekam: number;
  nextSunnahBekamHijriDay: number;
} {
  // Approximate Hijri conversion for demonstration
  // In early October 2026, it is approximately 19-20 Rabi'ul Akhir 1448 H
  const hijriYear = 1448;
  const hijriMonth = "Rabi'ul Akhir";
  
  // Calculate day based on standard modulo offset
  const baseEpochMs = new Date(2026, 9, 1).getTime(); // Oct 1, 2026
  const currentEpochMs = date.getTime();
  const dayOffset = Math.floor((currentEpochMs - baseEpochMs) / (1000 * 60 * 60 * 24));
  
  // Let Oct 1, 2026 correspond to 19 Rabi'ul Akhir 1448 H (Sunnah Bekam!)
  let hijriDay = ((19 + dayOffset - 1) % 30) + 1;

  const sunnahDays = [17, 19, 21];
  const isSunnah = sunnahDays.includes(hijriDay);
  
  let daysUntil = 0;
  let nextDay = 17;

  if (hijriDay < 17) {
    daysUntil = 17 - hijriDay;
    nextDay = 17;
  } else if (hijriDay === 17) {
    daysUntil = 0;
    nextDay = 17;
  } else if (hijriDay < 19) {
    daysUntil = 19 - hijriDay;
    nextDay = 19;
  } else if (hijriDay === 19) {
    daysUntil = 0;
    nextDay = 19;
  } else if (hijriDay < 21) {
    daysUntil = 21 - hijriDay;
    nextDay = 21;
  } else if (hijriDay === 21) {
    daysUntil = 0;
    nextDay = 21;
  } else {
    // Next month's 17th
    daysUntil = (30 - hijriDay) + 17;
    nextDay = 17;
  }

  return {
    day: hijriDay,
    monthName: hijriMonth,
    year: hijriYear,
    isSunnahBekamDay: isSunnah,
    daysUntilNextSunnahBekam: daysUntil,
    nextSunnahBekamHijriDay: nextDay
  };
}

export function calculateBerjagaHolisticScore(
  member: FamilyMember,
  completedActionsCount: number,
  totalActionsCount: number
): {
  overallScore: number;
  tierName: string;
  tierColor: string;
  statusBadge: string;
  maqashidScores: {
    nafs: number; // Jiwa
    aql: number;  // Akal
    mal: number;  // Harta
    nasl: number; // Keturunan
    din: number;  // Agama
  };
} {
  const stepsScore = Math.min(100, Math.round(((member.vitals.steps || 7000) / 8000) * 100));
  const sleepScore = Math.min(100, Math.round(((member.vitals.sleepScore || 80) / 90) * 100));
  const hrScore = (member.vitals.heartRate >= 60 && member.vitals.heartRate <= 85) ? 95 : 82;
  const actionPct = totalActionsCount > 0 ? Math.round((completedActionsCount / totalActionsCount) * 100) : 75;

  // Weighted overall holistic score
  const overall = Math.min(99, Math.max(50, Math.round(
    stepsScore * 0.25 + 
    sleepScore * 0.20 + 
    hrScore * 0.15 + 
    actionPct * 0.40
  )));

  let tierName = "Pejuang Sunnah";
  let tierColor = "text-teal-600";
  let statusBadge = "Istiqomah Berproses";

  if (overall >= 90) {
    tierName = "Baitul Jannah (Keluarga Sakinah Teladan)";
    tierColor = "text-amber-500";
    statusBadge = "Keluarga Sejahtera Paripurna";
  } else if (overall >= 80) {
    tierName = "Mutiara Thayyib LimoCity";
    tierColor = "text-emerald-500";
    statusBadge = "Konsistensi Tinggi & Berkah";
  } else if (overall >= 70) {
    tierName = "Raudhah Kebugaran Daulah";
    tierColor = "text-teal-500";
    statusBadge = "Berjalan Baik Sesuai Syariat";
  }

  return {
    overallScore: overall,
    tierName,
    tierColor,
    statusBadge,
    maqashidScores: {
      nafs: Math.min(98, overall + 2),
      aql: Math.min(97, overall - 1),
      mal: Math.min(96, overall - 3),
      nasl: Math.min(99, overall + 1),
      din: Math.min(99, overall + 3)
    }
  };
}
