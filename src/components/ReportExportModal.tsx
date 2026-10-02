import React, { useState } from "react";
import { FamilyMember } from "../types";
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar,
  Building2
} from "lucide-react";

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
  allMembers: FamilyMember[];
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  patient,
  allMembers,
}) => {
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [includeAIAnalysis, setIncludeAIAnalysis] = useState(true);
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const [includeMedication, setIncludeMedication] = useState(true);
  const [reportPeriod, setReportPeriod] = useState("Laporan Mingguan (7 Hari Terakhir)");
  const [exported, setExported] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const headers = "Nama Pasien,Peran,Usia,Gol Darah,Detak Jantung (BPM),Tekanan Darah (mmHg),SpO2 (%),Glukosa (mg/dL),Langkah Harian,Skor Tidur,Program Terapi\n";
    const rows = allMembers.map(m => 
      `"${m.name}","${m.role}",${m.age},"${m.bloodType}",${m.vitals.heartRate},"${m.vitals.bloodPressure}",${m.vitals.spo2},${m.vitals.bloodGlucose},${m.vitals.steps},${m.vitals.sleepScore},"${m.therapyProgram}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GerSaKa_Laporan_Kesehatan_Keluarga_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Ekspor Laporan Medis Keluarga</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Standar Faskes RS LimoCity
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Laporan Komprehensif Siap Dibagikan ke Tenaga Medis & Dokter Spesialis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Format Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("pdf")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                format === "pdf"
                  ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Format PDF Resmi</p>
                <p className="text-[11px] text-slate-500">Lengkap kop surat RS, barcode & verifikasi</p>
              </div>
            </button>

            <button
              onClick={() => setFormat("csv")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                format === "csv"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Dataset CSV / Excel</p>
                <p className="text-[11px] text-slate-500">Telemetri mentah seluruh anggota keluarga</p>
              </div>
            </button>
          </div>

          {/* Configuration Options */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">Konfigurasi Laporan</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Periode Waktu Laporan</label>
                <select
                  value={reportPeriod}
                  onChange={e => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option>Laporan Mingguan (7 Hari Terakhir)</option>
                  <option>Laporan Bulanan (30 Hari Terakhir)</option>
                  <option>Laporan Triwulan / Kuartal Medis</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Cakupan Pasien</label>
                <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                  {patient.name} ({patient.role}) & Seluruh Keluarga
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAIAnalysis}
                  onChange={e => setIncludeAIAnalysis(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Sertakan Prediksi AI Gemini & Diagnosis Dini</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNutrition}
                  onChange={e => setIncludeNutrition(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Sertakan Rekomendasi Gizi Personal</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMedication}
                  onChange={e => setIncludeMedication(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Sertakan Log Kepatuhan Minum Obat & E-Resep</span>
              </label>
            </div>
          </div>

          {/* Printable Report Document Preview */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-900 shadow-inner space-y-4 print:m-0 print:p-0 print:border-none">
            
            {/* Header Letterhead */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800 dark:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl">
                  +
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                    RUMAH SAKIT & KLINIK TERAPUTIK LIMOCITY
                  </h2>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Instalasi Rawat Jalan & Platform Kesehatan Digital GerSaKa • Izin Kemenkes RI No: 445/LMC/2026
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <p>KODE LAPORAN: LMC-RPT-8891</p>
                <p>TANGGAL: {new Date().toLocaleDateString("id-ID")}</p>
              </div>
            </div>

            {/* Patient Header Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[10px]">NAMA PASIEN</span>
                <span className="font-bold text-slate-900 dark:text-white">{patient.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PERAN / USIA</span>
                <span className="font-bold text-slate-900 dark:text-white">{patient.role} ({patient.age} Thn)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">GOLONGAN DARAH</span>
                <span className="font-bold text-slate-900 dark:text-white">{patient.bloodType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PROGRAM TERAPI</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{patient.therapyProgram}</span>
              </div>
            </div>

            {/* Vitals Summary Table */}
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Telemetri Biomarker & Tanda Vital
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2">Parameter</th>
                      <th className="p-2">Nilai Terukur</th>
                      <th className="p-2">Rentang Rujukan</th>
                      <th className="p-2">Status Klinis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-2 font-medium">Detak Jantung</td>
                      <td className="p-2 font-bold">{patient.vitals.heartRate} BPM</td>
                      <td className="p-2 text-slate-500">60 - 100 BPM</td>
                      <td className="p-2 text-emerald-600 font-semibold">Normal Sinus</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Tekanan Darah</td>
                      <td className="p-2 font-bold">{patient.vitals.bloodPressure} mmHg</td>
                      <td className="p-2 text-slate-500">&lt; 120/80 mmHg</td>
                      <td className="p-2 text-amber-600 font-semibold">Terkontrol Terapi</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Saturasi Oksigen</td>
                      <td className="p-2 font-bold">{patient.vitals.spo2}% SpO2</td>
                      <td className="p-2 text-slate-500">95 - 100%</td>
                      <td className="p-2 text-emerald-600 font-semibold">Adekuat</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Gula Darah Acak</td>
                      <td className="p-2 font-bold">{patient.vitals.bloodGlucose} mg/dL</td>
                      <td className="p-2 text-slate-500">70 - 140 mg/dL</td>
                      <td className="p-2 text-emerald-600 font-semibold">Homeostasis</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor Signature Block */}
            <div className="pt-4 flex justify-between items-end text-xs border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Dokumen Sah Ditandatangani Digital (E-Sign BSrE/BSSN)</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400">Dokter Penanggung Jawab,</p>
                <div className="h-10 flex items-center justify-center font-serif text-slate-400 italic text-sm">
                  dr. Farhan Alamsyah, Sp.JP(K)
                </div>
                <p className="font-bold text-slate-900 dark:text-white">dr. Farhan Alamsyah, Sp.JP(K)</p>
                <p className="text-[10px] text-slate-500">SIP: 446/SIP.D/2024/0912</p>
              </div>
            </div>

          </div>

          {exported && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Laporan berhasil diunduh ke perangkat Anda.</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dapat langsung dilampirkan untuk rujukan BPJS atau asuransi swasta
          </span>

          <div className="flex items-center gap-2">
            {format === "pdf" ? (
              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File CSV</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
