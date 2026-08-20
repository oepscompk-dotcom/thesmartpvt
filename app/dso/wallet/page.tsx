"use client";

import { useState } from "react";
import { Wallet, Plus, ArrowDown, ArrowUp, X, Receipt, Smartphone, Landmark, Send, Copy, CheckCircle2, Trash2 } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function DSOWalletPage() {
  const { wallet, auth, staffWalletPayments, paymentRequests, submitPaymentRequest, deletePaymentRequest, bankAccounts, deleteWalletEntry } = useDSOData();
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [amount, setAmount] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [selectedTxnIds, setSelectedTxnIds] = useState<string[]>([]);

  const balance = wallet.length > 0 ? wallet[0].balance : 0;
  const totalCredits = wallet.filter((w) => w.type === "Credit").reduce((s, w) => s + w.amount, 0);
  const totalDebits = wallet.filter((w) => w.type === "Debit").reduce((s, w) => s + w.amount, 0);

  const myPayments = staffWalletPayments.filter((p) => p.role === "DSO" && p.staffId === auth.dsoId);
  const myLoans = myPayments.filter((p) => p.type !== "Package");
  const myPackages = myPayments.filter((p) => p.type === "Package");
  const myOutstanding = myLoans.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const outstandingList = myLoans.filter((p) => p.status === "Paid");

  const myRequests = paymentRequests.filter((r) => r.role === "DSO" && r.staffId === auth.dsoId);

  const allTxnsSelected = wallet.length > 0 && wallet.every((w) => selectedTxnIds.includes(w.id));
  const toggleTxn = (id: string) => setSelectedTxnIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleAllTxns = () => setSelectedTxnIds(allTxnsSelected ? [] : wallet.map((w) => w.id));
  const handleDeleteTxn = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    await deleteWalletEntry(id);
    setSelectedTxnIds((p) => p.filter((x) => x !== id));
  };
  const handleBulkDeleteTxns = async () => {
    if (!selectedTxnIds.length || !confirm(`Delete ${selectedTxnIds.length} selected transaction(s)?`)) return;
    await Promise.all(selectedTxnIds.map((id) => deleteWalletEntry(id)));
    setSelectedTxnIds([]);
  };
  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Delete this payment request?")) return;
    await deletePaymentRequest(id);
  };

  const openModal = () => {
    setSelectedPaymentId("");
    setAmount(0);
    setSelectedAccountId("");
    setTransactionId("");
    setNote("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const payment = myLoans.find((p) => p.id === selectedPaymentId);
    if (!payment || amount <= 0 || amount > payment.amount) return;
    const account = bankAccounts.find((a) => a.id === selectedAccountId);
    if (!account) return;
    setSending(true);
    try {
      await submitPaymentRequest({
        role: "DSO",
        staffId: auth.dsoId,
        staffName: auth.dsoName,
        paymentId: payment.id,
        paymentType: payment.type as "Loan" | "Advance",
        amount,
        bank: account.name,
        accountTitle: account.accountTitle,
        accountNumber: account.accountNumber,
        transactionId: transactionId || undefined,
        note: note || undefined,
        paymentDate: new Date().toISOString().split("T")[0],
      });
      setShowModal(false);
    } catch (e) {
      console.error("Failed to submit payment:", e);
      alert("Failed to submit payment request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Your balance, transactions and loan/advance repayments</p>
        </div>
        {myOutstanding > 0 && (
          <button onClick={openModal} disabled={bankAccounts.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus size={16} /> Submit Loan / Advance Payment
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#0A2647]/10 flex items-center justify-center text-[#0A2647] mx-auto mb-2"><Wallet size={18} /></div>
          <p className="text-3xl font-black text-gray-900">PKR {balance.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Balance</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><ArrowDown size={18} /></div>
          <p className="text-3xl font-black text-green-600">PKR {totalCredits.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Credits</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-2"><ArrowUp size={18} /></div>
          <p className="text-3xl font-black text-red-600">PKR {totalDebits.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Debits</p>
        </div>
      </div>

      {/* Payment Requests */}
      {myRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Send size={16} className="text-[#0A2647]" /> My Payment Requests</h3>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">{myRequests.filter((r) => r.status === "Pending").length} Pending</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[...myRequests].reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    {r.paymentType === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{r.paymentType} Repayment</p>
                    <p className="text-gray-400 text-xs">
                      Ref: <span className="font-mono">{r.paymentId}</span> {formatDateDDMMYYYY(r.paymentDate)} {r.bank ? ` \u00b7 ${r.bank}` : ""} {r.transactionId ? ` \u00b7 ${r.transactionId}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">PKR {r.amount.toLocaleString()}</p>
                    <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${r.status === "Received" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.status === "Received" ? "Received" : "Pending Verification"}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteRequest(r.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loan / Advance & Package Earnings */}
      {(myLoans.length > 0 || myPackages.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Receipt size={16} className="text-[#0A2647]" /> Loan / Advance &amp; Package Earnings</h3>
            {myOutstanding > 0 && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">Outstanding: PKR {myOutstanding.toLocaleString()}</span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {[...myLoans].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    {p.type === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{p.type} Payment</p>
                    <p className="text-gray-400 text-xs">
                      {formatDateDDMMYYYY(p.paymentDate)} {p.note ? ` &middot; ${p.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === "Deducted" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "Deducted" ? "Deducted from Salary" : "Outstanding"}
                  </span>
                </div>
              </div>
            ))}
            {[...myPackages].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Smartphone size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">SIM Package</p>
                    <p className="text-gray-400 text-xs font-mono">{p.iccid || p.simNumber || p.simId || "\u2014"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">{formatDateDDMMYYYY(p.paymentDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {selectedTxnIds.length > 0 && (
            <div className="px-6 py-2.5 border-b border-red-100 bg-red-50/60 flex items-center justify-between gap-3">
              <p className="text-red-700 text-sm font-medium">{selectedTxnIds.length} selected</p>
              <div className="flex gap-2">
                <button onClick={() => setSelectedTxnIds([])} className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-50">Clear</button>
                <button onClick={handleBulkDeleteTxns} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 inline-flex items-center gap-1">
                  <Trash2 size={12} /> Delete Selected
                </button>
              </div>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-center px-3 py-4 text-gray-500 text-xs font-medium uppercase w-10">
                  <input type="checkbox" checked={allTxnsSelected} onChange={toggleAllTxns} className="w-4 h-4 accent-[#0A2647] cursor-pointer" />
                </th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Note</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Balance</th>
                <th className="text-center px-4 py-4 text-gray-500 text-xs font-medium uppercase w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...wallet].map((w) => (
                <tr key={w.id} className={`border-b border-gray-50 transition-colors ${selectedTxnIds.includes(w.id) ? "bg-[#0A2647]/5" : "hover:bg-gray-50"}`}>
                  <td className="px-3 py-4 text-center">
                    <input type="checkbox" checked={selectedTxnIds.includes(w.id)} onChange={() => toggleTxn(w.id)} className="w-4 h-4 accent-[#0A2647] cursor-pointer" />
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{formatDateDDMMYYYY(w.date)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${w.type === "Credit" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{w.type}</span></td>
                  <td className="px-6 py-4 text-right"><span className={`font-bold text-sm ${w.type === "Credit" ? "text-green-600" : "text-red-600"}`}>{w.type === "Credit" ? "+" : "-"} PKR {w.amount.toLocaleString()}</span></td>
                  <td className="px-6 py-4 hidden md:table-cell text-gray-600 text-sm">{w.note}</td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-gray-900">PKR {w.balance.toLocaleString()}</td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => handleDeleteTxn(w.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors mx-auto" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {wallet.length === 0 && <div className="px-6 py-12 text-center"><Wallet size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No transactions yet</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Landmark size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">Submit Loan / Advance Payment</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Request verification of your repayment</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">Select Loan / Advance to repay</label>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {outstandingList.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedPaymentId(p.id); setAmount(p.amount); }}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedPaymentId === p.id ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        {p.type === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium">{p.type} &middot; {formatDateDDMMYYYY(p.paymentDate)}</p>
                        <p className="text-gray-400 text-xs">Outstanding: PKR {p.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">PKR {p.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR)</label>
                <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">Pay Into (Company Account)</label>
                {bankAccounts.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {bankAccounts.map((a) => (
                      <button key={a.id} onClick={() => setSelectedAccountId(a.id)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedAccountId === a.id ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                        <div className="flex-shrink-0">
                          {selectedAccountId === a.id ? <CheckCircle2 size={18} className="text-[#0A2647]" /> : <span className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-medium">{a.name || "Unnamed Account"}</p>
                          <p className="text-gray-400 text-xs font-mono truncate">{a.accountNumber || a.accountTitle || "\u2014"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <Landmark size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No company accounts configured</p>
                  </div>
                )}
                {selectedAccountId && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                    {(() => { const a = bankAccounts.find((x) => x.id === selectedAccountId); return a ? <>
                      <div className="flex items-center justify-between"><span className="text-emerald-700 text-xs font-medium">Bank / Digital</span><span className="text-gray-900 text-xs">{a.name}</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-700 text-xs font-medium">Account Title</span><span className="text-gray-900 text-xs">{a.accountTitle}</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-700 text-xs font-medium">Account Number</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-900 text-xs font-mono">{a.accountNumber}</span>
                          <button type="button" onClick={() => { navigator.clipboard.writeText(a.accountNumber); }} className="text-emerald-600 hover:text-emerald-800" title="Copy"><Copy size={12} /></button>
                        </div>
                      </div>
                    </> : null; })()}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Transaction ID (Optional)</label>
                <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. TID-83920"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Note (Optional)</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid via bank transfer"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Receipt size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">This payment will show as <b>Pending</b> until the franchise verifies and marks it received.</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSubmit} disabled={!selectedPaymentId || !selectedAccountId || amount <= 0 || amount > (myLoans.find((p) => p.id === selectedPaymentId)?.amount || 0) || sending}
                className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed">
                {sending ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
