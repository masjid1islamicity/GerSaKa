import React, { useState } from "react";
import { HospitalInvoice } from "../types";
import { INITIAL_INVOICES } from "../data/mockData";
import { 
  X, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  Building2, 
  FileText, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download,
  AlertCircle
} from "lucide-react";

interface HospitalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HospitalPaymentModal: React.FC<HospitalPaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [invoices, setInvoices] = useState<HospitalInvoice[]>(INITIAL_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<HospitalInvoice | null>(invoices[1]);
  const [paymentMethod, setPaymentMethod] = useState<"bca_va" | "mandiri_va" | "qris" | "bpjs">("bca_va");
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyVA = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessPayment = () => {
    if (!selectedInvoice) return;
    setPaying(true);
    setTimeout(() => {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === selectedInvoice.id) {
          return {
            ...inv,
            status: "Lunas",
            paymentMethod: paymentMethod === "qris" ? "QRIS Dinamis BI" : paymentMethod === "bpjs" ? "BPJS Kesehatan Bridging" : "BCA Virtual Account"
          };
        }
        return inv;
      }));
      setPaying(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Sistem Pembayaran Terintegrasi RS</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Payment Gateway LimoCity
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Administrasi Rumah Sakit, Telekonsultasi, Terapi & Obat Farmasi
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
          
          {/* Invoice Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daftar Tagihan Administrasi Pelayanan
            </h4>

            <div className="space-y-2.5">
              {invoices.map(inv => {
                const isSelected = selectedInvoice?.id === inv.id;
                const isPaid = inv.status === "Lunas";

                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setPaymentSuccess(false);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {inv.invoiceNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                        {inv.serviceDescription}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pasien: {inv.patientName} • Tanggal: {inv.date}
                      </p>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-xs text-slate-500 block">Total Biaya</span>
                      <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                        Rp {inv.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Execution Workspace if selected */}
          {selectedInvoice && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              
              {paymentSuccess || selectedInvoice.status === "Lunas" ? (
                /* Payment Receipt View */
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Pembayaran Rumah Sakit Telah Terverifikasi Sah
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Tagihan {selectedInvoice.invoiceNumber} sebesar Rp {selectedInvoice.amount.toLocaleString("id-ID")} telah lunas tercatat di sistem administrasi LimoCity Hospital.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => alert("Mengunduh Bukti Pembayaran Resmi RS LimoCity (PDF)...")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Kuitansi Sah RS LimoCity</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Payment Gateway Options */
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pilih Metode Pembayaran
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => setPaymentMethod("bca_va")}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === "bca_va"
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      BCA Virtual Account
                    </button>
                    <button
                      onClick={() => setPaymentMethod("mandiri_va")}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === "mandiri_va"
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Mandiri VA
                    </button>
                    <button
                      onClick={() => setPaymentMethod("qris")}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === "qris"
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      QRIS Dinamis BI
                    </button>
                    <button
                      onClick={() => setPaymentMethod("bpjs")}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === "bpjs"
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      BPJS Bridging
                    </button>
                  </div>

                  {/* Payment Details Box */}
                  {paymentMethod === "bca_va" && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-500">Nomor Virtual Account BCA RS LimoCity</span>
                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                          88014-9923841029
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyVA("88014-9923841029")}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Tersalin" : "Salin VA"}</span>
                      </button>
                    </div>
                  )}

                  {paymentMethod === "qris" && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-2">
                      <div className="w-36 h-36 bg-white p-2 rounded-xl border shadow-xs flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-slate-900" />
                      </div>
                      <span className="text-xs text-slate-500">
                        Pindai menggunakan aplikasi GoPay, OVO, Dana, BCA Mobile, atau Livin Mandiri
                      </span>
                    </div>
                  )}

                  {paymentMethod === "bpjs" && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        Bridging Sistem Rujukan BPJS Kesehatan Terverifikasi
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">
                        Klaim administrasi otomatis dipotong dari plafon jaminan kesehatan keluarga LimoCity (No. Kartu BPJS: 0001928471201).
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleProcessPayment}
                    disabled={paying}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{paying ? "Memproses Verifikasi Rumah Sakit..." : `Konfirmasi & Bayar Rp ${selectedInvoice.amount.toLocaleString("id-ID")}`}</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Kanal Transaksi Terenkripsi PCI-DSS Level 1</span>
          </div>
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
