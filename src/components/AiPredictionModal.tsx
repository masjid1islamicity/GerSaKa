import React, { useState, useEffect } from "react";
import { FamilyMember, PredictionResult } from "../types";
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Stethoscope, 
  RefreshCw, 
  Info,
  Calendar,
  ChevronRight,
  TrendingUp,
  HeartPulse
} from "lucide-react";

interface AiPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
  onConnectDoctor: () => void;
}

export const AiPredictionModal: React.FC<AiPredictionModalProps> = ({
  isOpen,
  onClose,
  patient,
  onConnectDoctor
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/predict-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult({
          ...data.data,
          source: data.source || "gemini-3.8-flash",
          generatedAt: new Date().toLocaleTimeString("id-ID")
        });
      } else {
        throw new Error(data.error || "Gagal memproses prediksi klinis.");
      }
    } catch (err: any) {
      console.error("AI Prediction Error:", err);
      setError(err.message || "Terjadi kendala jaringan saat menghubungi server AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrediction();
    }
  }, [isOpen, patient.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Analisis Prediksi Penyakit AI</h3>
                <span className="text-[10px] bg-emerald-500/40 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-white/20">
                  Gemini Clinical Engine
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Profil Pasien: {patient.name} ({patient.role}, {patient.age} thn)
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 animate-spin">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Memproses Riwayat & Telemetri Vital Pasien...
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Model AI Gemini sedang memetakan profil kardiovaskular, metabolisme, saturasi oksigen, dan riwayat klinis keluarga LimoCity.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchPrediction}
                className="px-3 py-1 bg-red-600 text-white rounded-lg font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          ) : result ? (
            <>
              {/* Overall Score Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-2xl border border-emerald-500/20">
                    {result.overallHealthScore}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                      Skor Kesehatan
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {result.overallHealthScore >= 80 ? "Sangat Baik & Terkontrol" : "Perlu Perhatian Klinis"}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col justify-center text-xs text-slate-600 dark:text-slate-300 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-3 md:pt-0 md:pl-4">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    <span>Kesimpulan Klinis AI LimoCity</span>
                  </div>
                  <p className="leading-relaxed">{result.summaryAnalysis}</p>
                </div>
              </div>

              {/* Urgent Alert if detected */}
              {result.urgentAlert && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm">Peringatan Kritis Dini:</span>
                    <p className="mt-0.5">
                      Ditemukan satu atau lebih biomarker yang memerlukan observasi segera oleh dokter spesialis LimoCity atau faskes terdekat.
                    </p>
                  </div>
                </div>
              )}

              {/* Conditions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Prediksi Risiko Kondisi & Penyakit</span>
                </h4>

                {result.predictedConditions.map((cond, idx) => {
                  const isHigh = cond.riskLevel === "Tinggi" || cond.riskLevel === "Kritis";
                  const isMed = cond.riskLevel === "Sedang";
                  const badgeColor = isHigh 
                    ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300"
                    : isMed
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300";

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                            {cond.condition}
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            Probabilitas Risiko: {cond.probabilityScore}%
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor} self-start sm:self-auto`}>
                          Risiko: {cond.riskLevel}
                        </span>
                      </div>

                      {/* Probability Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${cond.probabilityScore}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-blue-500" />
                            <span>Tanda Peringatan Dini:</span>
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                            {cond.earlyWarningSigns.map((sign, sIdx) => (
                              <li key={sIdx}>{sign}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                          <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tindakan Medis Rekomendasi:</span>
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                            {cond.recommendedClinicalActions.map((action, aIdx) => (
                              <li key={aIdx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200">
                        <span className="font-bold">Protokol LimoCity Therapy:</span> {cond.ltcTherapyAdvice}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weekly Prognosis */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-slate-900 dark:text-white">Prognosis Mingguan:</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {result.weeklyForecast}
                  </p>
                </div>
              </div>
            </>
          ) : null}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Enkripsi Medis Terjaga (SHA-256)</span>
            <span>•</span>
            <span>Waktu: {result?.generatedAt || "Real-time"}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchPrediction}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Analisis Ulang</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onConnectDoctor();
              }}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Konsultasi Dokter Sekarang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
