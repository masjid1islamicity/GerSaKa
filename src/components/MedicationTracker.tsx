import React, { useState } from "react";
import { FamilyMember, MedicationItem } from "../types";
import { 
  X, 
  Pill, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Store, 
  Truck, 
  Check, 
  AlertCircle, 
  Calendar,
  Sparkles,
  Award
} from "lucide-react";

interface MedicationTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: FamilyMember;
  medications: MedicationItem[];
  onToggleTakeMed: (medId: string, time: string) => void;
  onAddMedication: (newMed: MedicationItem) => void;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  onToggleTakeMed,
  onAddMedication,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("1x sehari sesudah makan");
  const [newTime, setNewTime] = useState("08:00");
  const [newInstructions, setNewInstructions] = useState("Diminum bersama air putih hangat");

  const patientMeds = medications.filter(m => m.patientId === patient.id);

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMedItem: MedicationItem = {
      id: "med-" + Date.now(),
      patientId: patient.id,
      name: newName.trim(),
      dosage: newDosage.trim() || "1 Tablet",
      frequency: newFrequency,
      times: [newTime],
      instructions: newInstructions,
      prescribedBy: "dr. Spesialis LimoCity",
      pharmacyName: "Apotek Mitra LimoCity",
      rxNumber: "RX-LMC-MANUAL-" + Math.floor(1000 + Math.random() * 9000),
      stockRemaining: 30,
      takenToday: { [newTime]: false },
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    onAddMedication(newMedItem);
    setNewName("");
    setNewDosage("");
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Jadwal Pengingat Obat & E-Resep</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Kepatuhan 96%
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Pasien: {patient.name} ({patient.role}) • Terhubung ke Apotek Terdekat
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
          
          {/* Adherence Streak Banner */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Streak Kepatuhan Minum Obat: 14 Hari Berturut-turut!
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  Kepatuhan jadwal minum obat yang konsisten mempercepat stabilitas biomarker kardiovaskular.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Batal" : "Tambah Jadwal"}</span>
            </button>
          </div>

          {/* Add Medication Form */}
          {showAddForm && (
            <form onSubmit={handleSaveMed} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">Tambah Pengingat Obat Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Nama Obat</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Contoh: Candesartan / Vitamin C"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Dosis</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={e => setNewDosage(e.target.value)}
                    placeholder="Contoh: 8 mg / 1 tablet"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Waktu Minum</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Petunjuk</label>
                  <input
                    type="text"
                    value={newInstructions}
                    onChange={e => setNewInstructions(e.target.value)}
                    placeholder="Contoh: Sesudah sarapan pagi"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          )}

          {/* Medication List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Daftar Obat Aktif Hari Ini</span>
            </h4>

            {patientMeds.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed rounded-xl">
                Tidak ada resep obat aktif untuk {patient.name}. Tambahkan jadwal baru jika diperlukan.
              </div>
            ) : (
              patientMeds.map(med => (
                <div
                  key={med.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {med.name}
                        </h5>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {med.instructions} • Frekuensi: {med.frequency}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 text-right">
                      <span className="block font-semibold text-slate-700 dark:text-slate-300">
                        Sisa Stok: {med.stockRemaining} Tablet
                      </span>
                      <span>No. Resep: {med.rxNumber}</span>
                    </div>
                  </div>

                  {/* Dose Schedule Checkers */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">{med.pharmacyName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {med.times.map(time => {
                        const isTaken = Boolean(med.takenToday[time]);
                        return (
                          <button
                            key={time}
                            onClick={() => onToggleTakeMed(med.id, time)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isTaken
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            }`}
                          >
                            {isTaken ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Sudah Diminum ({time})</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Tandai Minum ({time})</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pharmacy E-Delivery Integration Tracker */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Truck className="w-4 h-4 text-indigo-500" />
                <span>Pengiriman Obat Farmasi Terintegrasi</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                Sedang Diantar
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Paket resep elektronik dari Apotek Kimia Farma Limo (Resep #RX-LMC-2026-0812) sedang dalam perjalanan oleh kurir farmasi LimoCity Express (Estimasi Tiba: 25 menit).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Sistem Sinkronisasi Apotek & Faskes LimoCity
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
