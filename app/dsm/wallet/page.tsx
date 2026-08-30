"use client";

import { useState } from "react";
import { Wallet, Plus, ArrowDown, ArrowUp, X, Receipt, Smartphone, Landmark, Send, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DSMWalletPage() {
  const { wallet, auth, staffWalletPayments, paymentRequests, submitPaymentRequest, deletePaymentRequest, bankAccounts, deleteWalletEntry } = useDSMData();
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

  const myPayments = staffWalletPayments.filter((p) => p.role === "DSM" && p.staffId === auth.dsmId);
  const myLoans = myPayments.filter((p) => p.type !== "Package");
  const myPackages = myPayments.filter((p) => p.type === "Package");
  const myOutstanding = myLoans.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const outstandingList = myLoans.filter((p) => p.status === "Paid");

  const myRequests = paymentRequests.filter((r) => r.role === "DSM" && r.staffId === auth.dsmId);

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
        role: "DSM",
        staffId: auth.dsmId,
        staffName: auth.dsmName,
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
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Wallet" }]}
        title="Wallet"
        description="Your balance, transactions and loan/advance repayments"
        actions={
          myOutstanding > 0 && (
            <Button onClick={openModal} disabled={bankAccounts.length === 0}>
              <Plus size={16} /> Submit Loan / Advance Payment
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Balance" value={`PKR ${balance.toLocaleString()}`} icon={Wallet} iconClass="text-slate-900 bg-slate-100" />
        <StatCard label="Total Credits" value={`PKR ${totalCredits.toLocaleString()}`} icon={ArrowDown} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Total Debits" value={`PKR ${totalDebits.toLocaleString()}`} icon={ArrowUp} iconClass="text-red-600 bg-red-50" />
      </div>

      {myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2"><Send size={16} className="text-brand-600" /> My Payment Requests</CardTitle>
              <StatusPill label={`${myRequests.filter((r) => r.status === "Pending").length} Pending`} tone="warning" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {[...myRequests].reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
                    {r.paymentType === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.paymentType} Repayment</p>
                    <p className="text-xs text-muted-foreground">
                      Ref: <span className="font-mono">{r.paymentId}</span> {formatDateDDMMYYYY(r.paymentDate)} {r.bank ? ` · ${r.bank}` : ""} {r.transactionId ? ` · ${r.transactionId}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">PKR {r.amount.toLocaleString()}</p>
                    <StatusPill label={r.status === "Received" ? "Received" : "Pending Verification"} tone={r.status === "Received" ? "positive" : "warning"} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(r.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Delete">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(myLoans.length > 0 || myPackages.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2"><Receipt size={16} className="text-brand-600" /> Loan / Advance &amp; Package Earnings</CardTitle>
              {myOutstanding > 0 && (
                <StatusPill label={`Outstanding: PKR ${myOutstanding.toLocaleString()}`} tone="warning" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {[...myLoans].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
                    {p.type === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.type} Payment</p>
                    <p className="text-xs text-muted-foreground">{formatDateDDMMYYYY(p.paymentDate)} {p.note ? ` · ${p.note}` : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <StatusPill label={p.status === "Deducted" ? "Deducted from Salary" : "Outstanding"} tone={p.status === "Deducted" ? "positive" : "warning"} />
                </div>
              </div>
            ))}
            {[...myPackages].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                    <Smartphone size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">SIM Package</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.iccid || p.simNumber || p.simId || "—"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateDDMMYYYY(p.paymentDate)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {selectedTxnIds.length > 0 && (
            <div className="px-6 py-2.5 border-b border-red-100 bg-red-50/60 flex items-center justify-between gap-3">
              <p className="text-red-700 text-sm font-medium">{selectedTxnIds.length} selected</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedTxnIds([])}>Clear</Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDeleteTxns}>
                  <Trash2 size={12} /> Delete Selected
                </Button>
              </div>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-center px-3 py-4 text-muted-foreground text-xs font-medium uppercase w-10">
                  <input type="checkbox" checked={allTxnsSelected} onChange={toggleAllTxns} className="w-4 h-4 accent-brand-600 cursor-pointer" />
                </th>
                <th className="text-left px-6 py-4 text-muted-foreground text-xs font-medium uppercase">Date</th>
                <th className="text-left px-6 py-4 text-muted-foreground text-xs font-medium uppercase">Type</th>
                <th className="text-right px-6 py-4 text-muted-foreground text-xs font-medium uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-muted-foreground text-xs font-medium uppercase hidden md:table-cell">Note</th>
                <th className="text-right px-6 py-4 text-muted-foreground text-xs font-medium uppercase">Balance</th>
                <th className="text-center px-4 py-4 text-muted-foreground text-xs font-medium uppercase w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...wallet].map((w) => (
                <tr key={w.id} className={`border-b border-slate-50 transition-colors ${selectedTxnIds.includes(w.id) ? "bg-brand-50" : "hover:bg-slate-50"}`}>
                  <td className="px-3 py-4 text-center">
                    <input type="checkbox" checked={selectedTxnIds.includes(w.id)} onChange={() => toggleTxn(w.id)} className="w-4 h-4 accent-brand-600 cursor-pointer" />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{formatDateDDMMYYYY(w.date)}</td>
                  <td className="px-6 py-4"><StatusPill label={w.type} tone={w.type === "Credit" ? "positive" : "negative"} /></td>
                  <td className="px-6 py-4 text-right"><span className={`font-bold text-sm ${w.type === "Credit" ? "text-green-600" : "text-red-600"}`}>{w.type === "Credit" ? "+" : "-"} PKR {w.amount.toLocaleString()}</span></td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted-foreground text-sm">{w.note}</td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-foreground">PKR {w.balance.toLocaleString()}</td>
                  <td className="px-4 py-4 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTxn(w.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Delete">
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {wallet.length === 0 && <EmptyState icon={Wallet} title="No transactions yet" description="Your wallet activity will appear here." />}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <Landmark size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Submit Loan / Advance Payment</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">Request verification of your repayment</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-muted p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-muted-foreground text-xs font-medium mb-2">Select Loan / Advance to repay</label>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {outstandingList.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedPaymentId(p.id); setAmount(p.amount); }}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedPaymentId === p.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 flex-shrink-0">
                        {p.type === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.type} · {formatDateDDMMYYYY(p.paymentDate)}</p>
                        <p className="text-muted-foreground text-xs">Outstanding: PKR {p.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">PKR {p.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-muted-foreground text-xs font-medium mb-1.5">Amount (PKR)</label>
                <Input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-muted-foreground text-xs font-medium mb-2">Pay Into (Company Account)</label>
                {bankAccounts.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {bankAccounts.map((a) => (
                      <button key={a.id} onClick={() => setSelectedAccountId(a.id)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedAccountId === a.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="flex-shrink-0">
                          {selectedAccountId === a.id ? <CheckCircle2 size={18} className="text-brand-600" /> : <span className="block w-5 h-5 rounded-full border-2 border-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{a.name || "Unnamed Account"}</p>
                          <p className="text-muted-foreground text-xs font-mono truncate">{a.accountNumber || a.accountTitle || "—"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <Landmark size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No company accounts configured</p>
                  </div>
                )}
                {selectedAccountId && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                    {(() => { const a = bankAccounts.find((x) => x.id === selectedAccountId); return a ? <>
                      <div className="flex items-center justify-between"><span className="text-emerald-700 text-xs font-medium">Bank / Digital</span><span className="text-foreground text-xs">{a.name}</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-700 text-xs font-medium">Account Title</span><span className="text-foreground text-xs">{a.accountTitle}</span></div>
                      <div className="flex items-center justify-between"><span className="text-emerald-700 text-xs font-medium">Account Number</span>
                        <div className="flex items-center gap-1">
                          <span className="text-foreground text-xs font-mono">{a.accountNumber}</span>
                          <button type="button" onClick={() => { navigator.clipboard.writeText(a.accountNumber); }} className="text-emerald-600 hover:text-emerald-800" title="Copy"><Copy size={12} /></button>
                        </div>
                      </div>
                    </> : null; })()}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-muted-foreground text-xs font-medium mb-1.5">Transaction ID (Optional)</label>
                <Input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. TID-83920" />
              </div>
              <div>
                <label className="block text-muted-foreground text-xs font-medium mb-1.5">Note (Optional)</label>
                <Input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid via bank transfer" />
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Receipt size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">This payment will show as <b>Pending</b> until the franchise verifies and marks it received.</p>
                </div>
              </div>
            </div>
            <CardFooter className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={!selectedPaymentId || !selectedAccountId || amount <= 0 || amount > (myLoans.find((p) => p.id === selectedPaymentId)?.amount || 0) || sending}>
                {sending ? "Submitting..." : "Submit for Verification"}
              </Button>
            </CardFooter>
          </div>
        </div>
      )}
    </div>
  );
}