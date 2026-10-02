import React, { useState, useEffect } from "react";
import { FamilyMember, NutritionPlan } from "../types";
import { 
  X, 
  Utensils, 
  Droplet, 
  Flame, 
  Bell, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Clock, 
  RefreshCw,
  Award,
  Apple
} from "lucide-react";

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [scheduledAlerts, setScheduledAlerts] = useState<Record<number, boolean>>({});

  const fetchNutritionPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/nutrition-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          goal: `Manajemen pencegahan penyakit & terapi ${patient.therapyProgram}`
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setPlan(data.data);
      }
    } catch (err) {
      console.error("Gizi AI error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNutritionPlan();
    }
  }, [isOpen, patient.id]);

  const toggleAlert = (idx: number) => {
    setScheduledAlerts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Rencana & Notifikasi Gizi Personal</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  LimoCity Clinical Nutrition
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Menu Dietetik & Notifikasi Khusus: {patient.name} ({patient.role})
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
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Menyusun Rencana Gizi & Notifikasi Pintar...
              </p>
            </div>
          ) : plan ? (
            <>
              {/* Daily Calorie & Macro Target Strip */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <div>
                      <span className="text-xs text-slate-500">Target Kalori Harian</span>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {plan.dailyCalorieTarget} kkal / hari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Droplet className="w-4 h-4 text-cyan-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Kebutuhan Air: {plan.macroSplit.waterLiters} Liter/Hari
                    </span>
                  </div>
                </div>

                {/* Macro Split Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>Karbohidrat: {plan.macroSplit.carbsPercent}%</span>
                    <span>Protein: {plan.macroSplit.proteinPercent}%</span>
                    <span>Lemak Sehat: {plan.macroSplit.fatPercent}%</span>
                    <span>Serat: {plan.macroSplit.fiberGrams}g</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                    <div style={{ width: `${plan.macroSplit.carbsPercent}%` }} className="bg-amber-500" title="Karbohidrat" />
                    <div style={{ width: `${plan.macroSplit.proteinPercent}%` }} className="bg-emerald-500" title="Protein" />
                    <div style={{ width: `${plan.macroSplit.fatPercent}%` }} className="bg-blue-500" title="Lemak Sehat" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  <span className="font-semibold not-italic text-slate-800 dark:text-slate-200">Fokus Gizi Utama:</span> {plan.keyNutritionalFocus}
                </p>
              </div>

              {/* 5-Meal Schedule */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Jadwal Menu Gizi Harian (Kuliner Sehat Nusantara)</span>
                </h4>

                <div className="space-y-2.5">
                  {plan.meals.map((meal, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs shrink-0 border border-teal-200 dark:border-teal-800">
                          {meal.time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {meal.type}
                            </span>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              • {meal.calories} kkal
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                            {meal.menu}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            💡 {meal.tips}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Push Notifications List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notifikasi Gizi & Hidrasi Terjadwal</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {plan.smartPushAlerts.map((alert, idx) => {
                    const isScheduled = Boolean(scheduledAlerts[idx]);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {alert.time}
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                            {alert.message}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleAlert(idx)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                            isScheduled
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                          }`}
                          title={isScheduled ? "Pengingat Aktif" : "Aktifkan Notifikasi"}
                        >
                          {isScheduled ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Superfoods vs Avoid Foods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    <span>Superfood Dianjurkan (Lokal):</span>
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {plan.superfoods.map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Pantangan / Batasi Konsumsi:</span>
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {plan.avoidFoods.map((food, idx) => (
                      <li key={idx}>{food}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Divalidasi oleh Tim Nutrisi Klinis LimoCity
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
