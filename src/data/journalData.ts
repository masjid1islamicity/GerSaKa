import { DailyHealthJournalEntry, FamilyMember, MoodType } from "../types";

export const INITIAL_JOURNAL_ENTRIES: Record<string, DailyHealthJournalEntry[]> = {
  "fam-01": [
    {
      id: "journal-01-1",
      memberId: "fam-01",
      memberName: "H. Hendra Kusuma",
      memberRole: "Ayah",
      date: "Kamis, 24 September 2026",
      timestamp: "08:15 WIB",
      mood: "Tenang & Rileks",
      moodEmoji: "🧘",
      energyLevel: 4,
      symptoms: ["Nyeri Tengkuk Ringan"],
      symptomSeverity: "Ringan",
      diet: {
        mealType: "Sarapan",
        description: "Oatmeal almond pisang madu, telur rebus, dan teh chamomile hangat tanpa gula",
        nutritionTag: "Tinggi Serat & Rendah Natrium",
        waterIntakeLiters: 0.8,
      },
      notes: "Tidur semalam cukup nyenyak (7.2 jam). Tengkuk agak sedikit kaku karena posisi bantal, namun berangsur rileks setelah peregangan pagi 10 menit.",
      vitalsSnapshot: {
        heartRate: 72,
        bloodPressure: "128/82",
        bloodGlucose: 112,
        spo2: 98,
        stressLevel: 28,
        sleepHours: 7.2,
        steps: 8450,
        wearableDevice: "Apple Watch Ultra 2 Cellular",
      },
      aiCorrelationInsight: "Tekanan darah sistolik (128 mmHg) berada pada rentang ideal terkontrol. Suasana hati tenang dan asupan rendah natrium terbukti menjaga resistensi vaskular stabil.",
    },
    {
      id: "journal-01-2",
      memberId: "fam-01",
      memberName: "H. Hendra Kusuma",
      memberRole: "Ayah",
      date: "Rabu, 23 September 2026",
      timestamp: "19:30 WIB",
      mood: "Gembira & Berenergi",
      moodEmoji: "😄",
      energyLevel: 5,
      symptoms: ["Tidak Ada Keluhan"],
      symptomSeverity: "Nihil",
      diet: {
        mealType: "Makan Malam",
        description: "Sup bening bayam wortel, dada ayam panggang herbal, kentang rebus, dan pepaya potong",
        nutritionTag: "Kaya Antioksidan & Kalium",
        waterIntakeLiters: 2.4,
      },
      notes: "Berhasil melampaui target 8.000 langkah harian bersama Ibu keliling taman kompleks LimoCity. Badan terasa segar dan kepala enteng.",
      vitalsSnapshot: {
        heartRate: 70,
        bloodPressure: "126/80",
        bloodGlucose: 115,
        spo2: 98,
        stressLevel: 30,
        sleepHours: 7.3,
        steps: 8200,
        wearableDevice: "Apple Watch Ultra 2 Cellular",
      },
      aiCorrelationInsight: "Korelasi positif antara aktivitas 8.200 langkah dengan penurunan indeks stres biometrik (30/100). Homeostasis sirkadian terjaga prima.",
    },
  ],
  "fam-02": [
    {
      id: "journal-02-1",
      memberId: "fam-02",
      memberName: "Hj. Siti Rahmawati",
      memberRole: "Ibu",
      date: "Kamis, 24 September 2026",
      timestamp: "12:45 WIB",
      mood: "Gembira & Berenergi",
      moodEmoji: "😄",
      energyLevel: 4,
      symptoms: ["Pegal Lutut Kiri Ringan"],
      symptomSeverity: "Ringan",
      diet: {
        mealType: "Makan Siang",
        description: "Ikan salmon kukus saus lemon, brokoli wortel rebus, nasi merah separuh porsi, jus alpukat tanpa gula",
        nutritionTag: "Omega-3 Anti-Inflamasi",
        waterIntakeLiters: 1.6,
      },
      notes: "Selesai sesi fisioterapi mandiri dan senam sendi 20 menit. Lutut kiri terasa lebih luwes saat menuruni anak tangga.",
      vitalsSnapshot: {
        heartRate: 76,
        bloodPressure: "118/78",
        bloodGlucose: 98,
        spo2: 99,
        stressLevel: 22,
        sleepHours: 7.8,
        steps: 6200,
        wearableDevice: "Garmin Venu 3S Health Tracker",
      },
      aiCorrelationInsight: "Gula darah 98 mg/dL dan tensi 118/78 mmHg sangat optimal. Asupan asam lemak esensial EPA/DHA mendukung pelumasan cairan sinovial sendi.",
    },
  ],
  "fam-03": [
    {
      id: "journal-03-1",
      memberId: "fam-03",
      memberName: "Dimas Pratama Kusuma",
      memberRole: "Anak Sulung",
      date: "Kamis, 24 September 2026",
      timestamp: "07:30 WIB",
      mood: "Gembira & Berenergi",
      moodEmoji: "🔥",
      energyLevel: 5,
      symptoms: ["Kelelahan Otot Betis (DOMS Ringan)"],
      symptomSeverity: "Ringan",
      diet: {
        mealType: "Sarapan",
        description: "4 butir putih telur orak-arik, roti gandum panggang selai kacang murni, pisang cavendish, whey isolate",
        nutritionTag: "Protein Tinggi & Elektrolit",
        waterIntakeLiters: 1.2,
      },
      notes: "Pagi ini lari tempo 8K di trek LimoCity. Pacing stabil 4:45/km. Detak jantung pemulihan turun cepat di bawah 100 BPM dalam 2 menit pasca lari.",
      vitalsSnapshot: {
        heartRate: 58,
        bloodPressure: "115/72",
        bloodGlucose: 90,
        spo2: 99,
        stressLevel: 16,
        sleepHours: 8.1,
        steps: 12400,
        wearableDevice: "Garmin Forerunner 965 Pro",
      },
      aiCorrelationInsight: "Denyut istirahat 58 BPM dan variabilitas detak jantung (HRV 82 ms) menandakan pemulihan sistem saraf otonom atletik kelas satu.",
    },
  ],
  "fam-04": [
    {
      id: "journal-04-1",
      memberId: "fam-04",
      memberName: "Nadia Anindita Kusuma",
      memberRole: "Anak Bungsu",
      date: "Kamis, 24 September 2026",
      timestamp: "09:00 WIB",
      mood: "Biasa / Netral",
      moodEmoji: "😊",
      energyLevel: 3,
      symptoms: ["Mata Lelah (Layar Belajar)"],
      symptomSeverity: "Ringan",
      diet: {
        mealType: "Sarapan",
        description: "Roti bakar gandum isi telur ceplok dan keju cheddar, susu almond hangat, buah blueberry segar",
        nutritionTag: "Lutein & Vitamin A Alami",
        waterIntakeLiters: 0.7,
      },
      notes: "Menerapkan aturan visual 20-20-20 saat belajar di depan laptop untuk mengurangi ketegangan otot akomodasi mata.",
      vitalsSnapshot: {
        heartRate: 74,
        bloodPressure: "110/70",
        bloodGlucose: 94,
        spo2: 99,
        stressLevel: 25,
        sleepHours: 7.5,
        steps: 7100,
        wearableDevice: "Samsung Galaxy Watch6 LTE",
      },
      aiCorrelationInsight: "Tanda vital remaja berada dalam parameter eukinetik normal. Durasi tidur 7.5 jam efektif mencegah kenaikan kortisol pra-ujian.",
    },
  ],
  "fam-05": [
    {
      id: "journal-05-1",
      memberId: "fam-05",
      memberName: "Bpk. H. Subroto",
      memberRole: "Kakek",
      date: "Kamis, 24 September 2026",
      timestamp: "10:15 WIB",
      mood: "Tenang & Rileks",
      moodEmoji: "🌿",
      energyLevel: 3,
      symptoms: ["Napas Agak Pendek Jika Naik Tanjakan"],
      symptomSeverity: "Ringan",
      diet: {
        mealType: "Sarapan",
        description: "Bubur havermut pisang matang lembut, rebusan telur puyuh, teh jahe sereh hangat tanpa gula",
        nutritionTag: "Geriatri Halus & Ramah Lambung",
        waterIntakeLiters: 0.9,
      },
      notes: "Jalan pagi santai 25 menit di pekarangan rumah sambil berjemur matahari pagi. Tidak ada rasa nyeri dada atau berdebar-debar.",
      vitalsSnapshot: {
        heartRate: 68,
        bloodPressure: "134/84",
        bloodGlucose: 126,
        spo2: 96,
        stressLevel: 32,
        sleepHours: 6.8,
        steps: 4300,
        wearableDevice: "Fitbit Sense 2 Medical Grade",
      },
      aiCorrelationInsight: "Saturasi oksigen 96% afebris dan detak jantung 68 BPM sangat stabil untuk pasien geriatri pasca pemasangan stent kardiak.",
    },
  ],
};

// Common physical symptoms options for quick tagging
export const COMMON_SYMPTOMS_LIST = [
  "Tidak Ada Keluhan",
  "Pusing / Sakit Kepala",
  "Nyeri Tengkuk / Leher",
  "Pegal Sendi / Lutut",
  "Perut Begah / Kembung",
  "Mata Lelah (Layar)",
  "Kelelahan Otot / DOMS",
  "Napas Pendek / Sesak",
  "Tenggorokan Kering",
  "Asam Lambung Naik",
  "Susah Tidur Semalam",
];

// Mood definitions with emojis and descriptors
export const MOOD_DEFINITIONS: Array<{
  type: MoodType;
  emoji: string;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}> = [
  {
    type: "Gembira & Berenergi",
    emoji: "😄",
    label: "Gembira & Berenergi",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    borderClass: "border-emerald-300 dark:border-emerald-700",
    textClass: "text-emerald-700 dark:text-emerald-300",
  },
  {
    type: "Tenang & Rileks",
    emoji: "🧘",
    label: "Tenang & Rileks",
    bgClass: "bg-teal-50 dark:bg-teal-950/40",
    borderClass: "border-teal-300 dark:border-teal-700",
    textClass: "text-teal-700 dark:text-teal-300",
  },
  {
    type: "Biasa / Netral",
    emoji: "😐",
    label: "Biasa / Netral",
    bgClass: "bg-slate-100 dark:bg-slate-800",
    borderClass: "border-slate-300 dark:border-slate-700",
    textClass: "text-slate-700 dark:text-slate-300",
  },
  {
    type: "Lelah / Mengantuk",
    emoji: "🥱",
    label: "Lelah / Mengantuk",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    borderClass: "border-amber-300 dark:border-amber-700",
    textClass: "text-amber-700 dark:text-amber-300",
  },
  {
    type: "Cemas / Stres",
    emoji: "😟",
    label: "Cemas / Stres",
    bgClass: "bg-purple-50 dark:bg-purple-950/40",
    borderClass: "border-purple-300 dark:border-purple-700",
    textClass: "text-purple-700 dark:text-purple-300",
  },
  {
    type: "Kurang Nyaman / Pegal",
    emoji: "😣",
    label: "Kurang Nyaman / Pegal",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    borderClass: "border-rose-300 dark:border-rose-700",
    textClass: "text-rose-700 dark:text-rose-300",
  },
];

// Helper to generate dynamic AI correlation insight between vitals and subjective log
export const generateVitalsCorrelationInsight = (
  member: FamilyMember,
  mood: MoodType,
  symptoms: string[],
  dietDesc: string
): string => {
  const [systolic] = member.vitals.bloodPressure.split("/").map(Number);
  const hr = member.vitals.heartRate;
  const glucose = member.vitals.bloodGlucose;
  const stress = member.vitals.stressLevel;

  if (symptoms.includes("Pusing / Sakit Kepala") || symptoms.includes("Nyeri Tengkuk / Leher")) {
    return `Catatan rasa kaku/pusing beriringan dengan tensi sistolik ${systolic} mmHg. Direkomendasikan pembatasan garam tambahan dan evaluasi tekanan darah serial sore hari.`;
  }

  if (mood === "Gembira & Berenergi" || mood === "Tenang & Rileks") {
    return `Status psikoemosional positif berkorelasi langsung dengan indeks stres rendah (${stress}/100) dan denyut jantung ${hr} BPM yang stabil dan tenang.`;
  }

  if (dietDesc.toLowerCase().includes("oatmeal") || dietDesc.toLowerCase().includes("sayur") || dietDesc.toLowerCase().includes("salmon")) {
    return `Pilihan diet bernutrisi tinggi serat/omega-3 menjaga kadar gula darah ${glucose} mg/dL tetap dalam batas homeostasis LimoCity Therapy.`;
  }

  return `Data telemetri terintegrasi: Tensi ${member.vitals.bloodPressure} mmHg, HR ${hr} BPM, Glukosa ${glucose} mg/dL, dan SpO2 ${member.vitals.spo2}% menunjukkan kondisi fisiologis stabil saat catatan dibuat.`;
};
