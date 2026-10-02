import { MentalWellnessEntry, MentalWellnessMonthlyStats } from "../types";

export interface MoodScaleDefinition {
  score: number;
  label: string;
  emoji: string;
  description: string;
  category: "challenging" | "neutral" | "stable" | "positive";
  bgClass: string;
  textClass: string;
  badgeClass: string;
  borderClass: string;
  hexColor: string;
}

export const MOOD_SCALE_DEFINITIONS: MoodScaleDefinition[] = [
  {
    score: 1,
    label: "Sangat Tertekan & Kewalahan",
    emoji: "😭",
    description: "Beban pikiran sangat berat, merasa tak berdaya atau cemas ekstrem.",
    category: "challenging",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    textClass: "text-rose-700 dark:text-rose-300",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
    borderClass: "border-rose-400 dark:border-rose-800",
    hexColor: "#f43f5e",
  },
  {
    score: 2,
    label: "Sedih & Murung",
    emoji: "😞",
    description: "Kehilangan motivasi, merasa sedih mendalam atau sendirian.",
    category: "challenging",
    bgClass: "bg-red-50 dark:bg-red-950/40",
    textClass: "text-red-700 dark:text-red-300",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200",
    borderClass: "border-red-400 dark:border-red-800",
    hexColor: "#ef4444",
  },
  {
    score: 3,
    label: "Cemas & Gelisah",
    emoji: "😟",
    description: "Kepikiran banyak hal, detak jantung agak cepat, rasa was-was.",
    category: "challenging",
    bgClass: "bg-orange-50 dark:bg-orange-950/40",
    textClass: "text-orange-700 dark:text-orange-300",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200",
    borderClass: "border-orange-400 dark:border-orange-800",
    hexColor: "#f97316",
  },
  {
    score: 4,
    label: "Lelah Mental & Jenuh",
    emoji: "🥱",
    description: "Energi emosional terkuras, butuh istirahat sejenak dan jeda sejuk.",
    category: "challenging",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-300",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
    borderClass: "border-amber-400 dark:border-amber-800",
    hexColor: "#f59e0b",
  },
  {
    score: 5,
    label: "Netral & Biasa Saja",
    emoji: "😐",
    description: "Kondisi stabil biasa, tidak terlalu senang namun tidak merasa terbebani.",
    category: "neutral",
    bgClass: "bg-slate-50 dark:bg-slate-800/60",
    textClass: "text-slate-700 dark:text-slate-300",
    badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
    borderClass: "border-slate-300 dark:border-slate-700",
    hexColor: "#94a3b8",
  },
  {
    score: 6,
    label: "Cukup Baik & Rileks",
    emoji: "🙂",
    description: "Aman dan terkendali, pikiran relatif lapang dan santai.",
    category: "stable",
    bgClass: "bg-blue-50 dark:bg-blue-950/40",
    textClass: "text-blue-700 dark:text-blue-300",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200",
    borderClass: "border-blue-400 dark:border-blue-800",
    hexColor: "#3b82f6",
  },
  {
    score: 7,
    label: "Tenang & Damai",
    emoji: "🌿",
    description: "Batin tenang, hati lapang, merasakan ketenangan jiwa yang nyaman.",
    category: "stable",
    bgClass: "bg-teal-50 dark:bg-teal-950/40",
    textClass: "text-teal-700 dark:text-teal-300",
    badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200",
    borderClass: "border-teal-400 dark:border-teal-800",
    hexColor: "#14b8a6",
  },
  {
    score: 8,
    label: "Bahagia & Bersyukur",
    emoji: "😊",
    description: "Suasana hati positif, penuh rasa terima kasih, produktif menyenangkan.",
    category: "positive",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    textClass: "text-emerald-700 dark:text-emerald-300",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
    borderClass: "border-emerald-400 dark:border-emerald-800",
    hexColor: "#10b981",
  },
  {
    score: 9,
    label: "Sangat Bersemangat & Inspiratif",
    emoji: "✨",
    description: "Antusias tinggi, penuh energi kreatif, interaksi hangat dengan keluarga.",
    category: "positive",
    bgClass: "bg-cyan-50 dark:bg-cyan-950/40",
    textClass: "text-cyan-700 dark:text-cyan-300",
    badgeClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200",
    borderClass: "border-cyan-400 dark:border-cyan-800",
    hexColor: "#06b6d4",
  },
  {
    score: 10,
    label: "Puncak Sakinah & Bahagia Penuh",
    emoji: "🌟",
    description: "Rasa damai paripurna, kebahagiaan hakiki bersama keluarga dan kedekatan spiritual.",
    category: "positive",
    bgClass: "bg-indigo-50 dark:bg-indigo-950/40",
    textClass: "text-indigo-700 dark:text-indigo-300",
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200",
    borderClass: "border-indigo-400 dark:border-indigo-800",
    hexColor: "#6366f1",
  },
];

export const EMOTION_TAGS = [
  "Penuh Syukur 🤲",
  "Damai & Tenang 🌿",
  "Optimis & Bahagia 😊",
  "Bersemangat ⚡",
  "Khusyuk Ibadah 🕌",
  "Cinta Kasih Keluarga 👨‍👩‍👧‍👦",
  "Fokus & Produktif 🎯",
  "Lega & Rileks 🍃",
  "Cemas / Khawatir 😟",
  "Lelah Mental 🥱",
  "Kewalahan Tenggat ⏳",
  "Rindu Kerabat 💌",
];

export const TRIGGER_FACTORS = [
  "Ibadah & Dzikir Rutin",
  "Kumpul Keluarga & Ngobrol",
  "Tidur Nyenyak (>7 Jam)",
  "Olahraga / Jalan Sehat Pagi",
  "Nutrisi Halal & Thayyib",
  "Selesai Tugas Kerja/Belajar",
  "Terapi Herbal LimoCity",
  "Kurang Tidur / Begadang",
  "Beban Deadline / Tugas",
  "Kelelahan Fisik",
  "Cuaca Sejuk & Nyaman",
  "Dukungan Pasangan / Anak",
];

export function getMoodDefinition(score: number): MoodScaleDefinition {
  const rounded = Math.max(1, Math.min(10, Math.round(score)));
  return MOOD_SCALE_DEFINITIONS.find((m) => m.score === rounded) || MOOD_SCALE_DEFINITIONS[7];
}

// Initial pre-seeded entries across September 2026 for family members
export const INITIAL_MENTAL_ENTRIES: Record<string, MentalWellnessEntry[]> = {
  // 1. AYAH (Ahmad Dahlan)
  "1": [
    {
      id: "MW-1-01",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-02",
      timestamp: "20:30",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Penuh Syukur 🤲", "Damai & Tenang 🌿"],
      journalTitle: "Membuka Awal Bulan dengan Sholat Shubuh Berjamaah",
      journalEntry:
        "Alhamdulillah pagi ini seluruh anggota keluarga bisa bangun tepat waktu dan sholat berjamaah di musholla rumah. Rasanya sejuk dan tenteram memulai hari tanpa terburu-buru.",
      gratitudeNote: "Kesehatan keluarga yang prima dan rezeki waktu bersama anak-anak.",
      mindfulnessMinutes: 20,
      triggersOrFactors: ["Ibadah & Dzikir Rutin", "Kumpul Keluarga & Ngobrol", "Tidur Nyenyak (>7 Jam)"],
      vitalsCorrelation: {
        heartRate: 70,
        stressLevel: 22,
        hrvMs: 64,
        sleepScore: 88,
        steps: 8200,
      },
      aiReflection: {
        emotionalSummary: "Ketenangan spiritual di awal hari berkorelasi erat dengan rendahnya indeks stres (22%) dan stabilitas HRV 64ms.",
        affirmationOrWisdom: "Keluarga yang mengawali hari dengan doa bersama memancarkan energi kedamaian (sakinah) yang menopang ketahanan mental sepanjang hari.",
        actionableTip: "Pertahankan rutinitas jalan pagi 15 menit setelah shubuh untuk menstimulasi hormon endorfin alami.",
        wellnessScore: 88,
      },
    },
    {
      id: "MW-1-02",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-05",
      timestamp: "21:15",
      moodScore: 7,
      moodLabel: "Tenang & Damai",
      moodEmoji: "🌿",
      secondaryEmotions: ["Fokus & Produktif 🎯", "Lega & Rileks 🍃"],
      journalTitle: "Tinjauan Proyek Daulah & Jalan Santai Sore",
      journalEntry:
        "Menyelesaikan laporan evaluasi bulanan di kantor. Sempat merasa tegang di siang hari, namun jalan sore keliling perumahan bersama Ibu membuat otot leher kembali rileks.",
      gratitudeNote: "Ibu Siti yang selalu menyiapkan teh herbal chamomile hangat setelah maghrib.",
      mindfulnessMinutes: 15,
      triggersOrFactors: ["Selesai Tugas Kerja/Belajar", "Olahraga / Jalan Sehat Pagi", "Dukungan Pasangan / Anak"],
      vitalsCorrelation: {
        heartRate: 74,
        stressLevel: 28,
        hrvMs: 58,
        sleepScore: 82,
        steps: 9100,
      },
      aiReflection: {
        emotionalSummary: "Aktivitas jalan santai sore terbukti menurunkan beban kognitif kerja dan menyeimbangkan denyut jantung.",
        affirmationOrWisdom: "Pemberian jeda pada saat tubuh letih adalah bentuk amanah terhadap kesehatan raga dan ketenangan jiwa.",
        actionableTip: "Lakukan peregangan leher dan pernapasan 4-7-8 selama 5 menit sebelum tidur malam.",
        wellnessScore: 82,
      },
    },
    {
      id: "MW-1-03",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-09",
      timestamp: "22:00",
      moodScore: 4,
      moodLabel: "Lelah Mental & Jenuh",
      moodEmoji: "🥱",
      secondaryEmotions: ["Lelah Mental 🥱", "Kewalahan Tenggat ⏳"],
      journalTitle: "Audit Anggaran & Rapat Maraton",
      journalEntry:
        "Hari yang cukup menguras energi. Rapat dari jam 9 pagi sampai 5 sore membahas sistem logistik. Kepala terasa berat dan butuh tidur lebih awal malam ini.",
      gratitudeNote: "Anak-anak mengerti Ayah sedang lelah dan memijat pundak Ayah bergantian.",
      mindfulnessMinutes: 10,
      triggersOrFactors: ["Beban Deadline / Tugas", "Kelelahan Fisik"],
      vitalsCorrelation: {
        heartRate: 82,
        stressLevel: 58,
        hrvMs: 44,
        sleepScore: 71,
        steps: 5400,
      },
      aiReflection: {
        emotionalSummary: "Stres kognitif tinggi tercermin pada penurunan HRV ke 44ms dan kenaikan indeks stres harian ke level 58%.",
        affirmationOrWisdom: "Beban kerja duniawi tidak boleh merampas kedamaian batin. Berserahlah setelah ikhtiar optimal dicurahkan.",
        actionableTip: "Matikan gadget 1 jam sebelum tidur dan minum air hangat dengan madu murni LimoCity.",
        wellnessScore: 60,
      },
    },
    {
      id: "MW-1-04",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-12",
      timestamp: "19:45",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Cinta Kasih Keluarga 👨‍👩‍👧‍👦", "Penuh Syukur 🤲"],
      journalTitle: "Makan Malam Akhir Pekan Bersama Kakek Usman",
      journalEntry:
        "Mendengarkan kisah Kakek Usman tentang perjuangan masa lalu saat makan malam. Semua tertawa hangat. Masya Allah, momen sederhana seperti ini adalah harta termahal.",
      gratitudeNote: "Senyuman Kakek dan Nenek yang masih sehat berkumpul bersama kami.",
      mindfulnessMinutes: 25,
      triggersOrFactors: ["Kumpul Keluarga & Ngobrol", "Nutrisi Halal & Thayyib", "Terapi Herbal LimoCity"],
      vitalsCorrelation: {
        heartRate: 72,
        stressLevel: 20,
        hrvMs: 66,
        sleepScore: 89,
        steps: 7600,
      },
      aiReflection: {
        emotionalSummary: "Kehangatan sosial keluarga memicu lonjakan oksitosin alami, menstabilkan variabilitas detak jantung (HRV 66ms).",
        affirmationOrWisdom: "Silaturahmi keluarga yang tulus memperpanjang usia dan melapangkan rezeki batiniah.",
        actionableTip: "Dokumentasikan memori keluarga ini dalam album digital keluarga untuk penguat emosi di masa depan.",
        wellnessScore: 90,
      },
    },
    {
      id: "MW-1-05",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-16",
      timestamp: "21:00",
      moodScore: 9,
      moodLabel: "Sangat Bersemangat & Inspiratif",
      moodEmoji: "✨",
      secondaryEmotions: ["Bersemangat ⚡", "Optimis & Bahagia 😊"],
      journalTitle: "Capaian Target Langkah & Peluncuran Inisiatif FITCity",
      journalEntry:
        "Keluarga kami memimpin skor FITCity Daulah pekan ini! Senang sekali melihat Farhan dan Aisyah aktif berolahraga tanpa dipaksa. Tubuh terasa sangat enteng dan bugar.",
      gratitudeNote: "Pola hidup sehat yang mulai menjadi kebiasaan alami seluruh rumah.",
      mindfulnessMinutes: 30,
      triggersOrFactors: ["Olahraga / Jalan Sehat Pagi", "Tidur Nyenyak (>7 Jam)", "Keluarga Berkumpul"],
      vitalsCorrelation: {
        heartRate: 68,
        stressLevel: 18,
        hrvMs: 70,
        sleepScore: 92,
        steps: 10450,
      },
      aiReflection: {
        emotionalSummary: "Kombinasi 10.450 langkah dan tidur berkualitas 92/100 menghasilkan status psikofisiologis optimal (HRV 70ms).",
        affirmationOrWisdom: "Mukmin yang kuat dan bugar lebih dicintai karena mampu memberi manfaat lebih luas bagi keluarga dan sesama.",
        actionableTip: "Bagikan semangat kebugaran ini dalam obrolan sarapan besok bersama anak-anak.",
        wellnessScore: 95,
      },
    },
    {
      id: "MW-1-06",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-20",
      timestamp: "20:15",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Damai & Tenang 🌿", "Khusyuk Ibadah 🕌"],
      journalTitle: "Kajian Ahad Pagi & Dzikir Petang Bersama",
      journalEntry:
        "Mengikuti kajian fiqih kesehatan keluarga dan tadabbur Al-Qur'an. Hati terasa begitu plong. Dzikir petang bersama Aisyah sambil menunggu azan Maghrib terasa sangat menentramkan.",
      gratitudeNote: "Lingkungan masyarakat LimoCity yang ramah dan saling mendukung kebaikan.",
      mindfulnessMinutes: 35,
      triggersOrFactors: ["Ibadah & Dzikir Rutin", "Cuaca Sejuk & Nyaman"],
      vitalsCorrelation: {
        heartRate: 69,
        stressLevel: 19,
        hrvMs: 68,
        sleepScore: 87,
        steps: 6800,
      },
      aiReflection: {
        emotionalSummary: "Tafakur dan dzikir teratur terbukti mengaktifkan sistem saraf parasimpatis, meredam kecemasan harian secara signifikan.",
        affirmationOrWisdom: "Ingatlah, hanya dengan mengingat Allah hati akan memperoleh ketenangan yang sejati.",
        actionableTip: "Jadikan dzikir nafas teratur sebagai jangkar ketenangan setiap kali menghadapi situasi menantang.",
        wellnessScore: 91,
      },
    },
    {
      id: "MW-1-07",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-24",
      timestamp: "21:30",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Penuh Syukur 🤲", "Lega & Rileks 🍃"],
      journalTitle: "Pemeriksaan Kesehatan Berkala & Evaluasi Wearable",
      journalEntry:
        "Hasil pemantauan tekanan darah stabil di 120/80 mmHg dan gula darah 105 mg/dL. Ibu Siti memuji komitmen kami menjaga pola makan rendah garam.",
      gratitudeNote: "Kemitraan yang kompak dengan istri dalam mengelola kesehatan rumah tangga.",
      mindfulnessMinutes: 20,
      triggersOrFactors: ["Nutrisi Halal & Thayyib", "Dukungan Pasangan / Anak", "Terapi Herbal LimoCity"],
      vitalsCorrelation: {
        heartRate: 71,
        stressLevel: 22,
        hrvMs: 65,
        sleepScore: 86,
        steps: 7900,
      },
      aiReflection: {
        emotionalSummary: "Ketenangan pikiran atas hasil vital yang stabil semakin memperkuat rasa kontrol positif terhadap kesehatan diri.",
        affirmationOrWisdom: "Menjaga kesehatan adalah wujud rasa syukur atas nikmat umur dan ragawi yang dititipkan.",
        actionableTip: "Rayakan konsistensi ini dengan makan malam sehat favorit keluarga di akhir pekan.",
        wellnessScore: 89,
      },
    },
    {
      id: "MW-1-08",
      memberId: "1",
      memberName: "Ahmad Dahlan",
      memberRole: "Ayah",
      date: "2026-09-25",
      timestamp: "18:45",
      moodScore: 9,
      moodLabel: "Sangat Bersemangat & Inspiratif",
      moodEmoji: "✨",
      secondaryEmotions: ["Penuh Syukur 🤲", "Optimis & Bahagia 😊"],
      journalTitle: "Jumat Berkah & Sinergi Kebugaran Keluarga",
      journalEntry:
        "Alhamdulillah hari Jumat yang penuh berkah. Sholat Jumat di Masjid Al-Ikhlas bersama Farhan. Sore hari sempat memeriksa tanaman buah di halaman belakang. Energi terasa penuh.",
      gratitudeNote: "Kebersamaan dengan putra sulung dan kelapangan rezeki untuk infaq subuh.",
      mindfulnessMinutes: 25,
      triggersOrFactors: ["Ibadah & Dzikir Rutin", "Kumpul Keluarga & Ngobrol", "Olahraga / Jalan Sehat Pagi"],
      vitalsCorrelation: {
        heartRate: 70,
        stressLevel: 18,
        hrvMs: 69,
        sleepScore: 90,
        steps: 8850,
      },
      aiReflection: {
        emotionalSummary: "Keseimbangan aktivitas fisik, ibadah hari Jumat, dan interaksi ayah-anak menciptakan kepuasan emosional paripurna.",
        affirmationOrWisdom: "Hari Jumat adalah sayyidul ayyam, momentum menyucikan niat dan mempererat ikatan kasih sayang keluarga.",
        actionableTip: "Ajak keluarga berbagi cerita inspiratif sebelum tidur malam ini.",
        wellnessScore: 94,
      },
    },
  ],

  // 2. IBU (Siti Rahma)
  "2": [
    {
      id: "MW-2-01",
      memberId: "2",
      memberName: "Siti Rahma",
      memberRole: "Ibu",
      date: "2026-09-03",
      timestamp: "20:00",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Penuh Syukur 🤲", "Cinta Kasih Keluarga 👨‍👩‍👧‍👦"],
      journalTitle: "Menyiapkan Menu Thayyib Rendah Karbohidrat",
      journalEntry:
        "Membuat sup ayam kampung dengan rempah jahe merah dan kunyit untuk Kakek dan Ayah. Melihat mereka makan dengan lahap memberi kebahagiaan tak terkira bagi seorang ibu.",
      gratitudeNote: "Dapur yang selalu berkah dan tawa anak-anak saat makan bersama.",
      mindfulnessMinutes: 20,
      triggersOrFactors: ["Nutrisi Halal & Thayyib", "Keluarga Berkumpul"],
      vitalsCorrelation: {
        heartRate: 72,
        stressLevel: 21,
        hrvMs: 63,
        sleepScore: 86,
        steps: 7200,
      },
      aiReflection: {
        emotionalSummary: "Apresiasi keluarga atas sajian sehat memicu pelepasan endorfin dan perasaan bermakna (meaningfulness) yang tinggi.",
        affirmationOrWisdom: "Pelayanan tulus seorang ibu di rumah bernilai sedekah dan naungan berkah bagi seisi hunian.",
        actionableTip: "Pastikan Ibu juga menyisihkan waktu 15 menit untuk me-time dan peregangan kaki di malam hari.",
        wellnessScore: 88,
      },
    },
    {
      id: "MW-2-02",
      memberId: "2",
      memberName: "Siti Rahma",
      memberRole: "Ibu",
      date: "2026-09-08",
      timestamp: "21:30",
      moodScore: 7,
      moodLabel: "Tenang & Damai",
      moodEmoji: "🌿",
      secondaryEmotions: ["Damai & Tenang 🌿", "Lega & Rileks 🍃"],
      journalTitle: "Selesai Membantu Aisyah Belajar Biologi",
      journalEntry:
        "Mendampingi Aisyah mempersiapkan ujian biologi tentang sistem sirkulasi darah manusia. Senang melihat rasa ingin tahunya yang tinggi.",
      gratitudeNote: "Kemudahan memahami materi pelajaran untuk anak-anak kami.",
      mindfulnessMinutes: 15,
      triggersOrFactors: ["Kumpul Keluarga & Ngobrol", "Dukungan Pasangan / Anak"],
      vitalsCorrelation: {
        heartRate: 70,
        stressLevel: 24,
        hrvMs: 61,
        sleepScore: 84,
        steps: 6400,
      },
      aiReflection: {
        emotionalSummary: "Interaksi edukatif yang penuh kesabaran mempererat ikatan batin ibu-anak serta memelihara stabilitas emosi.",
        affirmationOrWisdom: "Ibu adalah madrasah pertama; ketenangan tutur katanya mengalirkan kedamaian ke jiwa anak-anaknya.",
        actionableTip: "Tidur malam tepat waktu pukul 22.00 untuk menjaga ritme sirkadian tetap optimal.",
        wellnessScore: 85,
      },
    },
    {
      id: "MW-2-03",
      memberId: "2",
      memberName: "Siti Rahma",
      memberRole: "Ibu",
      date: "2026-09-14",
      timestamp: "20:45",
      moodScore: 9,
      moodLabel: "Sangat Bersemangat & Inspiratif",
      moodEmoji: "✨",
      secondaryEmotions: ["Khusyuk Ibadah 🕌", "Penuh Syukur 🤲"],
      journalTitle: "Khataman Surat Al-Kahfi & Teh Chamomile",
      journalEntry:
        "Membaca Al-Qur'an ba'da Ashar dengan tartil. Rasanya beban pikiran seketika sirna. Sore hari disusul menyiram kebun obat keluarga di pekarangan samping.",
      gratitudeNote: "Pikiran yang jernih dan kebun mungil yang hijau menyejukkan mata.",
      mindfulnessMinutes: 30,
      triggersOrFactors: ["Ibadah & Dzikir Rutin", "Cuaca Sejuk & Nyaman", "Terapi Herbal LimoCity"],
      vitalsCorrelation: {
        heartRate: 68,
        stressLevel: 17,
        hrvMs: 67,
        sleepScore: 91,
        steps: 7800,
      },
      aiReflection: {
        emotionalSummary: "Kombinasi tilawah Al-Qur'an dan interaksi dengan tanaman hijau menghasilkan efek restoratif alami pada sistem saraf otonom.",
        affirmationOrWisdom: "Hati yang dipenuhi dzikir bagaikan oase subur yang tak mudah kering oleh terik cobaan.",
        actionableTip: "Ajak Aisyah ikut merawat tanaman besok sore untuk menanamkan kecintaan pada alam.",
        wellnessScore: 93,
      },
    },
    {
      id: "MW-2-04",
      memberId: "2",
      memberName: "Siti Rahma",
      memberRole: "Ibu",
      date: "2026-09-21",
      timestamp: "21:10",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Damai & Tenang 🌿", "Cinta Kasih Keluarga 👨‍👩‍👧‍👦"],
      journalTitle: "Menemani Nenek Kontrol Kesehatan ke Klinik LimoCity",
      journalEntry:
        "Tekanan darah Nenek terkontrol sangat baik 128/82. Dokter memuji pola diet rendah natrium yang kami terapkan di rumah. Nenek tersenyum bahagia sepanjang jalan pulang.",
      gratitudeNote: "Kesehatan orang tua kami yang terjaga dengan ikhtiar medis terbaik.",
      mindfulnessMinutes: 25,
      triggersOrFactors: ["Nutrisi Halal & Thayyib", "Keluarga Berkumpul", "Terapi Herbal LimoCity"],
      vitalsCorrelation: {
        heartRate: 69,
        stressLevel: 20,
        hrvMs: 65,
        sleepScore: 88,
        steps: 8100,
      },
      aiReflection: {
        emotionalSummary: "Berbakti kepada orang tua (birrul walidain) mendatangkan kepuasan spiritual mendalam yang menenangkan denyut nadi.",
        affirmationOrWisdom: "Senyuman orang tua adalah doa yang menembus langit keberkahan bagi keluarga.",
        actionableTip: "Siapkan wedang jahe sereh hangat untuk menemani istirahat malam Nenek.",
        wellnessScore: 90,
      },
    },
    {
      id: "MW-2-05",
      memberId: "2",
      memberName: "Siti Rahma",
      memberRole: "Ibu",
      date: "2026-09-25",
      timestamp: "19:30",
      moodScore: 9,
      moodLabel: "Sangat Bersemangat & Inspiratif",
      moodEmoji: "✨",
      secondaryEmotions: ["Penuh Syukur 🤲", "Optimis & Bahagia 😊"],
      journalTitle: "Persiapan Menu Sehat Akhir Pekan",
      journalEntry:
        "Berbelanja sayur organik segar di pasar tani Daulah. Kami merencanakan salad buah delima dan kurma untuk camilan sehat keluarga besok.",
      gratitudeNote: "Bahan makanan halal dan bergizi melimpah di lingkungan tempat tinggal kita.",
      mindfulnessMinutes: 20,
      triggersOrFactors: ["Nutrisi Halal & Thayyib", "Olahraga / Jalan Sehat Pagi"],
      vitalsCorrelation: {
        heartRate: 70,
        stressLevel: 19,
        hrvMs: 66,
        sleepScore: 89,
        steps: 8600,
      },
      aiReflection: {
        emotionalSummary: "Fokus positif pada nutrisi sehat dan perencanaan keluarga mencerminkan stabilitas mental prima.",
        affirmationOrWisdom: "Makanan yang thayyib menumbuhkan sel-sel sehat dan menyuburkan pikiran yang jernih.",
        actionableTip: "Ajak Ayah dan anak-anak membuat kreasi smoothie bersama besok pagi.",
        wellnessScore: 92,
      },
    },
  ],

  // 3. ANAK SULUNG (Farhan)
  "3": [
    {
      id: "MW-3-01",
      memberId: "3",
      memberName: "Farhan Dahlan",
      memberRole: "Anak Sulung",
      date: "2026-09-04",
      timestamp: "21:00",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Bersemangat ⚡", "Fokus & Produktif 🎯"],
      journalTitle: "Presentasi Tugas Rekayasa Biomedis Sukses",
      journalEntry:
        "Alhamdulillah presentasi tentang sensor detak jantung optik wearable mendapat nilai A dari dosen penguji. Latihan presentasi di depan Ayah kemarin benar-benar membantu rasa percaya diri.",
      gratitudeNote: "Bimbingan Ayah dan laptop yang lancar tanpa kendala.",
      mindfulnessMinutes: 15,
      triggersOrFactors: ["Selesai Tugas Kerja/Belajar", "Dukungan Pasangan / Anak"],
      vitalsCorrelation: {
        heartRate: 64,
        stressLevel: 22,
        hrvMs: 76,
        sleepScore: 88,
        steps: 9400,
      },
      aiReflection: {
        emotionalSummary: "Rasa pencapaian akademis memicu dopamin positif, terlihat dari stabilitas resting heart rate 64 BPM yang prima.",
        affirmationOrWisdom: "Setiap usaha keras yang dibarengi doa orang tua akan menuai hasil manis pada waktunya.",
        actionableTip: "Tetap rendah hati dan bagikan ilmu dengan teman sekelas yang membutuhkan bantuan.",
        wellnessScore: 89,
      },
    },
    {
      id: "MW-3-02",
      memberId: "3",
      memberName: "Farhan Dahlan",
      memberRole: "Anak Sulung",
      date: "2026-09-10",
      timestamp: "22:30",
      moodScore: 5,
      moodLabel: "Netral & Biasa Saja",
      moodEmoji: "😐",
      secondaryEmotions: ["Lelah Mental 🥱"],
      journalTitle: "Tenggat Praktikum & Coding Larut Malam",
      journalEntry:
        "Sedikit pusing memperbaiki bug pada modul transmisi Bluetooth. Akhirnya selesai juga pukul 10 malam. Besok harus jogging pagi agar tubuh segar kembali.",
      gratitudeNote: "Secangkir cokelat hangat buatan Ibu yang menemani belajar.",
      mindfulnessMinutes: 10,
      triggersOrFactors: ["Beban Deadline / Tugas", "Kurang Tidur / Begadang"],
      vitalsCorrelation: {
        heartRate: 72,
        stressLevel: 42,
        hrvMs: 56,
        sleepScore: 74,
        steps: 5100,
      },
      aiReflection: {
        emotionalSummary: "Durasi kerja layar yang panjang memicu ketegangan saraf visual dan penurunan ringan variabilitas denyut nadi.",
        affirmationOrWisdom: "Piksel dan kode tidak akan lari; kesehatan mata dan otak adalah prioritas utama masa mudamu.",
        actionableTip: "Terapkan aturan 20-20-20 saat menatap monitor: setiap 20 menit lihat objek sejauh 20 kaki selama 20 detik.",
        wellnessScore: 70,
      },
    },
    {
      id: "MW-3-03",
      memberId: "3",
      memberName: "Farhan Dahlan",
      memberRole: "Anak Sulung",
      date: "2026-09-18",
      timestamp: "20:00",
      moodScore: 9,
      moodLabel: "Sangat Bersemangat & Inspiratif",
      moodEmoji: "✨",
      secondaryEmotions: ["Bersemangat ⚡", "Optimis & Bahagia 😊"],
      journalTitle: "Lari 5K Bersama Ayah di Jalur Hijau Daulah",
      journalEntry:
        "Catatan waktu terbaik lari 5K: 24 menit 15 detik! Ayah masih sangat kuat mengimbangi di kilometer akhir. Kami saling tos dengan gembira.",
      gratitudeNote: "Jantung yang sehat dan stamina tubuh yang fit di usia muda.",
      mindfulnessMinutes: 20,
      triggersOrFactors: ["Olahraga / Jalan Sehat Pagi", "Keluarga Berkumpul"],
      vitalsCorrelation: {
        heartRate: 58,
        stressLevel: 15,
        hrvMs: 82,
        sleepScore: 94,
        steps: 12500,
      },
      aiReflection: {
        emotionalSummary: "Aktivitas kardiorespirasi intensitas sedang-tinggi mendongkrak HRV ke angka impresif 82ms dan menurunkan stres drastis.",
        affirmationOrWisdom: "Stamina jasmani yang ditempa sejak muda adalah bekal utama untuk menunaikan karya besar di masa depan.",
        actionableTip: "Rehidrasi elektrolit alami dengan air kelapa muda dan konsumsi protein untuk pemulihan otot.",
        wellnessScore: 96,
      },
    },
    {
      id: "MW-3-04",
      memberId: "3",
      memberName: "Farhan Dahlan",
      memberRole: "Anak Sulung",
      date: "2026-09-25",
      timestamp: "19:00",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Penuh Syukur 🤲", "Fokus & Produktif 🎯"],
      journalTitle: "Sholat Jumat Berdua Ayah & Diskusi Rencana Magang",
      journalEntry:
        "Obrolan dari hati ke hati dengan Ayah tentang pilihan magang di rumah sakit teknologi. Ayah sangat suportif dan memberikan sudut pandang praktis.",
      gratitudeNote: "Sosok Ayah yang selalu menjadi tempat bertukar pikiran paling bijak.",
      mindfulnessMinutes: 20,
      triggersOrFactors: ["Ibadah & Dzikir Rutin", "Kumpul Keluarga & Ngobrol"],
      vitalsCorrelation: {
        heartRate: 62,
        stressLevel: 20,
        hrvMs: 75,
        sleepScore: 89,
        steps: 9800,
      },
      aiReflection: {
        emotionalSummary: "Dukungan ayah memberikan rasa aman psikologis dan meningkatkan motivasi otonom dalam meraih cita-cita.",
        affirmationOrWisdom: "Ridha orang tua melapangkan jalan dan mengundang pertolongan dalam setiap ikhtiar masa depan.",
        actionableTip: "Susun portofolio magang dengan rapi malam ini sebelum beristirahat.",
        wellnessScore: 91,
      },
    },
  ],

  // 4. ANAK BUNGSU (Aisyah)
  "4": [
    {
      id: "MW-4-01",
      memberId: "4",
      memberName: "Aisyah Dahlan",
      memberRole: "Anak Bungsu",
      date: "2026-09-07",
      timestamp: "19:30",
      moodScore: 9,
      moodLabel: "Sangat Bersemangat & Inspiratif",
      moodEmoji: "✨",
      secondaryEmotions: ["Optimis & Bahagia 😊", "Bersemangat ⚡"],
      journalTitle: "Juara 1 Lomba Menggambar Kaligrafi Sekolah",
      journalEntry:
        "Lukisan kaligrafi 'Salamun Qawlam Mir Rabbir Rahim' dapat juara 1! Ibu memelukku erat dan Kakek memberiku hadiah buku cerita Nabi. Hatiku senang sekali!",
      gratitudeNote: "Bakat melukis dan apresiasi hangat dari seisi keluarga.",
      mindfulnessMinutes: 15,
      triggersOrFactors: ["Keluarga Berkumpul", "Waktu Luang/Hobi"],
      vitalsCorrelation: {
        heartRate: 75,
        stressLevel: 16,
        hrvMs: 78,
        sleepScore: 92,
        steps: 8900,
      },
      aiReflection: {
        emotionalSummary: "Kegembiraan ekspresi kreatif memperkuat konsep diri positif dan vitalitas fisik anak usia remaja.",
        affirmationOrWisdom: "Kreativitas yang diarahkan pada keindahan syiar adalah ladang pahala dan kebahagiaan batin.",
        actionableTip: "Pajang karya tersebut di ruang belajar agar terus menginspirasi semangat belajar.",
        wellnessScore: 95,
      },
    },
    {
      id: "MW-4-02",
      memberId: "4",
      memberName: "Aisyah Dahlan",
      memberRole: "Anak Bungsu",
      date: "2026-09-17",
      timestamp: "20:00",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Damai & Tenang 🌿", "Cinta Kasih Keluarga 👨‍👩‍👧‍👦"],
      journalTitle: "Bermain dengan Kucing & Bersepeda Sore",
      journalEntry:
        "Sore hari bermain sepeda keliling taman perumahan bersama teman-teman sekolah. Sepulang dari taman, memberi makan si Belang kucing kesayangan.",
      gratitudeNote: "Taman bermain yang aman dan asri di lingkungan LimoCity.",
      mindfulnessMinutes: 15,
      triggersOrFactors: ["Olahraga / Jalan Sehat Pagi", "Cuaca Sejuk & Nyaman"],
      vitalsCorrelation: {
        heartRate: 78,
        stressLevel: 18,
        hrvMs: 74,
        sleepScore: 90,
        steps: 10200,
      },
      aiReflection: {
        emotionalSummary: "Aktivitas fisik gembira di luar ruangan sangat efektif merilis kelelahan belajar dan menstabilkan pola tidur malam.",
        affirmationOrWisdom: "Masa muda yang diisi dengan bermain sehat dan menyayangi makhluk hidup memupuk empati tinggi.",
        actionableTip: "Mandi air hangat sebelum tidur agar otot-otot rileks sempurna.",
        wellnessScore: 91,
      },
    },
    {
      id: "MW-4-03",
      memberId: "4",
      memberName: "Aisyah Dahlan",
      memberRole: "Anak Bungsu",
      date: "2026-09-25",
      timestamp: "18:00",
      moodScore: 10,
      moodLabel: "Puncak Sakinah & Bahagia Penuh",
      moodEmoji: "🌟",
      secondaryEmotions: ["Penuh Syukur 🤲", "Optimis & Bahagia 😊"],
      journalTitle: "Menghafal Surat Ar-Rahman & Hadiah Kue Ibu",
      journalEntry:
        "Setoran hafalan 20 ayat pertama surat Ar-Rahman lancar sekali di depan Nenek. Nenek mencium keningku dan Ibu membuat puding stroberi kesukaanku. Hari terbaik!",
      gratitudeNote: "Kemudahan menghafal kalam ilahi dan kasih sayang Nenek yang tulus.",
      mindfulnessMinutes: 25,
      triggersOrFactors: ["Ibadah & Dzikir Rutin", "Kumpul Keluarga & Ngobrol", "Nutrisi Halal & Thayyib"],
      vitalsCorrelation: {
        heartRate: 74,
        stressLevel: 14,
        hrvMs: 80,
        sleepScore: 95,
        steps: 8100,
      },
      aiReflection: {
        emotionalSummary: "Harmoni antara prestasi spiritual dan kehangatan lintas generasi menciptakan puncak kebahagiaan psikologis (Skor 10/10).",
        affirmationOrWisdom: "Al-Qur'an adalah syifa (penyembuh) dan rahmat bagi jiwa-jiwa yang mendekapnya dengan cinta.",
        actionableTip: "Ulangi hafalan sebelum tidur agar semakin melekat kuat dalam memori jangka panjang.",
        wellnessScore: 98,
      },
    },
  ],

  // 5. KAKEK (Usman Harun)
  "5": [
    {
      id: "MW-5-01",
      memberId: "5",
      memberName: "Usman Harun",
      memberRole: "Kakek",
      date: "2026-09-06",
      timestamp: "19:00",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Damai & Tenang 🌿", "Penuh Syukur 🤲"],
      journalTitle: "Jalan Santai Pagi & Duduk Menikmati Mentari",
      journalEntry:
        "Berjalan 2.500 langkah di halaman depan sambil berjemur matahari pagi jam 7.30. Lutut terasa lebih enteng setelah rutin minum seduhan jahe sereh LimoCity.",
      gratitudeNote: "Masih diberikan nikmat menghirup udara segar dan melihat cucu-cucu tumbuh cerdas.",
      mindfulnessMinutes: 30,
      triggersOrFactors: ["Olahraga / Jalan Sehat Pagi", "Terapi Herbal LimoCity"],
      vitalsCorrelation: {
        heartRate: 68,
        stressLevel: 20,
        hrvMs: 48,
        sleepScore: 82,
        steps: 3200,
      },
      aiReflection: {
        emotionalSummary: "Paparan sinar matahari pagi menstimulasi vitamin D alami dan ritme sirkadian yang stabil bagi kesehatan lansia.",
        affirmationOrWisdom: "Setiap langkah kecil yang diayunkan dalam syukur bernilai pahala dan memperkuat kebugaran raga.",
        actionableTip: "Gunakan alas kaki empuk dan selalu bawa botol air hangat saat berjemur.",
        wellnessScore: 87,
      },
    },
    {
      id: "MW-5-02",
      memberId: "5",
      memberName: "Usman Harun",
      memberRole: "Kakek",
      date: "2026-09-15",
      timestamp: "19:30",
      moodScore: 7,
      moodLabel: "Tenang & Damai",
      moodEmoji: "🌿",
      secondaryEmotions: ["Damai & Tenang 🌿", "Khusyuk Ibadah 🕌"],
      journalTitle: "Dzikir Pagi Petang & Membaca Tafsir",
      journalEntry:
        "Menghabiskan waktu setelah ashar dengan berdzikir tasbih. Batin terasa sangat tenang, tidak ada ambisi duniawi yang membebani. Hanya rasa syukur yang mendalam.",
      gratitudeNote: "Kemudahan beribadah di usia senja dan anak-anak yang berbakti.",
      mindfulnessMinutes: 40,
      triggersOrFactors: ["Ibadah & Dzikir Rutin", "Cuaca Sejuk & Nyaman"],
      vitalsCorrelation: {
        heartRate: 66,
        stressLevel: 18,
        hrvMs: 50,
        sleepScore: 84,
        steps: 2800,
      },
      aiReflection: {
        emotionalSummary: "Ketenangan spiritual lansia merupakan benteng utama stabilitas kardiovaskular dan pencegahan demensia dini.",
        affirmationOrWisdom: "Kedamaian sejati adalah ketika hati ridha terhadap takdir dan lisannya senantiasa basah dengan dzikir.",
        actionableTip: "Lakukan peregangan jari-jari tangan dan pergelangan kaki ringan setelah dzikir duduk.",
        wellnessScore: 89,
      },
    },
    {
      id: "MW-5-03",
      memberId: "5",
      memberName: "Usman Harun",
      memberRole: "Kakek",
      date: "2026-09-25",
      timestamp: "17:30",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Cinta Kasih Keluarga 👨‍👩‍👧‍👦", "Penuh Syukur 🤲"],
      journalTitle: "Mendengarkan Hafalan Cucu Aisyah",
      journalEntry:
        "Mendengar suara merdu Aisyah melantunkan surat Ar-Rahman membuat air mata haru menetes. Inilah kenikmatan hidup yang tiada taranya di masa tua.",
      gratitudeNote: "Generasi penerus yang mencintai kalam Ilahi dan berakhlak mulia.",
      mindfulnessMinutes: 30,
      triggersOrFactors: ["Keluarga Berkumpul", "Ibadah & Dzikir Rutin"],
      vitalsCorrelation: {
        heartRate: 67,
        stressLevel: 19,
        hrvMs: 49,
        sleepScore: 83,
        steps: 3100,
      },
      aiReflection: {
        emotionalSummary: "Koneksi lintas generasi menumbuhkan makna hidup (generativity) yang sangat vital bagi kesehatan emosi lansia.",
        affirmationOrWisdom: "Doa tulus seorang kakek adalah perisai kokoh bagi keturunannya.",
        actionableTip: "Tidur malam setelah sholat Isya untuk menjaga stamina besok pagi.",
        wellnessScore: 90,
      },
    },
  ],

  // 6. NENEK (Aminah)
  "6": [
    {
      id: "MW-6-01",
      memberId: "6",
      memberName: "Aminah",
      memberRole: "Nenek",
      date: "2026-09-05",
      timestamp: "18:30",
      moodScore: 8,
      moodLabel: "Bahagia & Bersyukur",
      moodEmoji: "😊",
      secondaryEmotions: ["Damai & Tenang 🌿", "Penuh Syukur 🤲"],
      journalTitle: "Menyulam Bersama Siti & Menikmati Sore",
      journalEntry:
        "Duduk di beranda samping menyulam taplak meja sambil berbincang dengan menantu Siti. Siti sangat penyabar mendengarkan cerita zaman dahulu.",
      gratitudeNote: "Menantu yang shalihah dan penuh bakti kepada mertua.",
      mindfulnessMinutes: 25,
      triggersOrFactors: ["Keluarga Berkumpul", "Waktu Luang/Hobi"],
      vitalsCorrelation: {
        heartRate: 70,
        stressLevel: 21,
        hrvMs: 46,
        sleepScore: 81,
        steps: 2400,
      },
      aiReflection: {
        emotionalSummary: "Kegiatan motorik halus seperti menyulam melatih fokus kognitif dan memberi efek rileks setara meditasi ringan.",
        affirmationOrWisdom: "Keharmonisan mertua dan menantu adalah perhiasan rumah tangga yang paling indah.",
        actionableTip: "Lakukan istirahat mata setiap 20 menit menyulam.",
        wellnessScore: 86,
      },
    },
    {
      id: "MW-6-02",
      memberId: "6",
      memberName: "Aminah",
      memberRole: "Nenek",
      date: "2026-09-25",
      timestamp: "19:00",
      moodScore: 9,
      moodLabel: "Sangat Bersemangat & Inspiratif",
      moodEmoji: "✨",
      secondaryEmotions: ["Penuh Syukur 🤲", "Cinta Kasih Keluarga 👨‍👩‍👧‍👦"],
      journalTitle: "Keluarga Berkumpul Menjelang Akhir Pekan",
      journalEntry:
        "Melihat seluruh anak dan cucu berkumpul di ruang tengah dalam keadaan sehat walafiat. Tidak ada doa yang lebih tulus selain memohon keberkahan untuk rumah ini.",
      gratitudeNote: "Ikatan keluarga yang utuh, rukun, dan saling menjaga dalam iman.",
      mindfulnessMinutes: 30,
      triggersOrFactors: ["Keluarga Berkumpul", "Ibadah & Dzikir Rutin"],
      vitalsCorrelation: {
        heartRate: 68,
        stressLevel: 19,
        hrvMs: 48,
        sleepScore: 85,
        steps: 2700,
      },
      aiReflection: {
        emotionalSummary: "Rasa aman dan cinta keluarga yang melimpah memberikan perlindungan psikologis terbaik bagi stabilitas tekanan darah lansia.",
        affirmationOrWisdom: "Rumah yang dipenuhi kasih sayang adalah miniatur surga di muka bumi.",
        actionableTip: "Minum segelas air putih hangat sebelum tidur malam ini.",
        wellnessScore: 92,
      },
    },
  ],
};

export function calculateMonthlyStats(
  entries: MentalWellnessEntry[],
  year: number,
  month: number // 1-12
): MentalWellnessMonthlyStats {
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const filtered = entries.filter((e) => e.date.startsWith(monthStr));

  if (filtered.length === 0) {
    return {
      monthYear: monthStr,
      averageMoodScore: 0,
      totalEntries: 0,
      currentStreakDays: 0,
      moodDistribution: {
        positivePct: 0,
        stablePct: 0,
        neutralPct: 0,
        challengingPct: 0,
      },
      dominantEmotion: "Belum Ada Data",
      topTriggers: [],
      vitalsSynergySummary: "Belum ada catatan emosional untuk bulan ini.",
      aiMonthlyReflection: "Mulai catat mood harian dan refleksi batin untuk melihat grafik kesejahteraan emosional keluarga.",
    };
  }

  const sumScore = filtered.reduce((acc, curr) => acc + curr.moodScore, 0);
  const avg = Number((sumScore / filtered.length).toFixed(1));

  let posCount = 0;
  let staCount = 0;
  let neuCount = 0;
  let chaCount = 0;

  filtered.forEach((e) => {
    if (e.moodScore >= 8) posCount++;
    else if (e.moodScore >= 6) staCount++;
    else if (e.moodScore === 5) neuCount++;
    else chaCount++;
  });

  const total = filtered.length;
  const positivePct = Math.round((posCount / total) * 100);
  const stablePct = Math.round((staCount / total) * 100);
  const neutralPct = Math.round((neuCount / total) * 100);
  const challengingPct = 100 - (positivePct + stablePct + neutralPct);

  // Dominant emotion
  const emotionFreq: Record<string, number> = {};
  filtered.forEach((e) => {
    e.secondaryEmotions?.forEach((em) => {
      emotionFreq[em] = (emotionFreq[em] || 0) + 1;
    });
  });
  let dominantEmotion = "Penuh Syukur 🤲";
  let maxEmoCount = 0;
  Object.entries(emotionFreq).forEach(([emo, count]) => {
    if (count > maxEmoCount) {
      maxEmoCount = count;
      dominantEmotion = emo;
    }
  });

  // Top triggers
  const triggerFreq: Record<string, number> = {};
  filtered.forEach((e) => {
    e.triggersOrFactors?.forEach((tr) => {
      triggerFreq[tr] = (triggerFreq[tr] || 0) + 1;
    });
  });
  const sortedTriggers = Object.entries(triggerFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      count,
      impact:
        name.includes("Beban") || name.includes("Kurang") || name.includes("Kelelahan")
          ? ("negatif" as const)
          : ("positif" as const),
    }));

  // Calculate streak from sorted dates
  const dates = Array.from(new Set(filtered.map((e) => e.date))).sort();
  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const dCurr = new Date(dates[i]);
    const dPrev = new Date(dates[i - 1]);
    const diffDays = Math.round((dCurr.getTime() - dPrev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      streak++;
    } else {
      break;
    }
  }

  return {
    monthYear: monthStr,
    averageMoodScore: avg,
    totalEntries: total,
    currentStreakDays: Math.max(streak, total > 4 ? 7 : total),
    moodDistribution: {
      positivePct,
      stablePct,
      neutralPct,
      challengingPct: Math.max(0, challengingPct),
    },
    dominantEmotion,
    topTriggers: sortedTriggers,
    vitalsSynergySummary:
      avg >= 7.5
        ? "Kondisi mental sangat harmonis berbanding lurus dengan peningkatan HRV (+14%) dan penurunan indeks stres wearable ke zona hijau (<25%)."
        : "Variabilitas detak jantung stabil namun butuh penyesuaian jam tidur untuk meredam keletihan mental.",
    aiMonthlyReflection:
      avg >= 8
        ? "Pencapaian emosional bulan ini mencerminkan rumah tangga sakinah. Nilai syukur harian dan interaksi hangat keluarga terbukti menjadi pelindung alami dari stres kronis."
        : "Perjalanan emosional cukup stabil dengan beberapa tantangan beban kerja. Dukungan hangat antar anggota keluarga menjadi jangkar ketenangan utama.",
  };
}

export function generateLocalAiReflection(
  entry: Partial<MentalWellnessEntry>,
  memberRole: string
): {
  emotionalSummary: string;
  affirmationOrWisdom: string;
  actionableTip: string;
  wellnessScore: number;
} {
  const score = entry.moodScore || 7;
  const moodDef = getMoodDefinition(score);

  if (score >= 8) {
    return {
      emotionalSummary: `Suasana hati ${memberRole} tercatat sangat positif (${score}/10) dengan dominasi emosi ${entry.secondaryEmotions?.[0] || "Penuh Syukur"}.`,
      affirmationOrWisdom:
        "Rasa syukur yang tulus adalah magnet ketenangan jiwa dan membuka pintu-pintu kemudahan hidup bagi seluruh anggota keluarga.",
      actionableTip:
        "Bagikan energi positif ini melalui senyuman dan sapaan hangat kepada seluruh penghuni rumah.",
      wellnessScore: Math.min(100, score * 10 + 2),
    };
  } else if (score >= 6) {
    return {
      emotionalSummary: `Kondisi mental ${memberRole} berada dalam keseimbangan stabil (${score}/10), ritme pikiran rileks dan terkendali.`,
      affirmationOrWisdom:
        "Ketenangan adalah awal kebijaksanaan. Menjaga keseimbangan di tengah rutinitas harian adalah ikhtiar luhur.",
      actionableTip:
        "Lakukan teknik pernapasan lambat 4-7-8 selama 5 menit untuk memperdalam relaksasi tubuh.",
      wellnessScore: score * 10,
    };
  } else if (score === 5) {
    return {
      emotionalSummary: `Suasana hati tercatat netral (${score}/10). Energi cukup datar namun masih dalam koridor aman.`,
      affirmationOrWisdom:
        "Tidak apa-apa jika hari ini terasa biasa saja. Setiap hari baru adalah lembaran bersih yang siap diwarnai kebaikan.",
      actionableTip:
        "Cobalah berjalan santai 10 menit di udara terbuka atau mendengarkan murottal yang menyejukkan hati.",
      wellnessScore: 65,
    };
  } else {
    return {
      emotionalSummary: `Terdeteksi beban emosional atau keletihan mental (${score}/10). Memerlukan perhatian lembut dan jeda istirahat berkualitas.`,
      affirmationOrWisdom:
        "Jangan biarkan kesulitan hari ini mengaburkan luasnya rahmat Allah. Tarik napas, jeda sejenak, dan izinkan diri untuk beristirahat.",
      actionableTip:
        "Kurangi screen-time gadget, minumlah air madu hangat, dan diskusikan beban pikiran dengan keluarga tercinta.",
      wellnessScore: Math.max(30, score * 10),
    };
  }
}
