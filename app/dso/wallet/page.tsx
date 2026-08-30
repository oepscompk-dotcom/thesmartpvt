"use client";

import { useState, useMemo, useEffect } from "react";
import { Wallet, Plus, ArrowDown, ArrowUp, X, Receipt, Smartphone, Landmark, Send, Copy, CheckCircle2, Trash2, SearchX } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 8;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredTxns = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return q
      ? wallet.filter((w) => (w.note || "").toLowerCase().includes(q) || w.type.toLowerCase().includes(q) || w.date.includes(q))
      : wallet;
  }, [wallet, searchQuery]);

  const pagedTxns = filteredTxns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredTxns.length / PAGE_SIZE));

  const balance = wallet.length > 0 ? wallet[0].balance : 0;
  const totalCredits = wallet.filter((w) => w.type === "Credit").reduce((s, w) => s + w.amount, 0);
  const totalDebits = wallet.filter((w) => w.type === "Debit").reduce((s, w) => s + w.amount, 0);

  const myPayments = staffWalletPayments.filter((p) => p.role === "DSO" && p.staffId === auth.dsoId);
  const myLoans = myPayments.filter((p) => p.type !== "Package");
  const myPackages = myPayments.filter((p) => p.type === "Package");
  const myOutstanding = myLoans.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const outstandingList = myLoans.filter((p) => p.status === "Paid");

  const myRequests = paymentRequests.filter((r) => r.role === "DSO" && r.staffId === auth.dsoId);

  const allTxnsSelected = filteredTxns.length > 0 && filteredTxns.every((w) => selectedTxnIds.includes(w.id));
  const toggleTxn = (id: string) => setSelectedTxnIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleAllTxns = () => setSelectedTxnIds(allTxnsSelected ? [] : filteredTxns.map((w) => w.id));
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
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "Wallet" }]}
        title="Wallet"
        description="Your balance, transactions and loan/advance repayments"
        actions={
          myOutstanding > 0 ? (
            <Button onClick={openModal} disabled={bankAccounts.length === 0}>
              <Plus size={16} /> Submit Loan / Advance Payment
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Balance" value={`PKR ${balance.toLocaleString()}`} icon={Wallet} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Total Credits" value={`PKR ${totalCredits.toLocaleString()}`} icon={ArrowDown} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Total Debits" value={`PKR ${totalDebits.toLocaleString()}`} icon={ArrowUp} iconClass="text-red-600 bg-red-50" />
      </div>

      {/* Payment Requests */}
      {myRequests.length > 0 && (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Send size={16} className="text-brand-600" /> My Payment Requests</h3>
            <StatusPill label={`${myRequests.filter((r) => r.status === "Pending").length} Pending`} tone="warning" />
          </div>
          <div className="divide-y divide-slate-100">
            {[...myRequests].reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                    {r.paymentType === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.paymentType} Repayment</p>
                    <p className="text-xs text-muted-foreground">
                      Ref: <span className="font-mono">{r.paymentId}</span> {formatDateDDMMYYYY(r.paymentDate)} {r.bank ? ` · ${r.bank}` : ""} {r.transactionId ? ` · ${r.transactionId}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">PKR {r.amount.toLocaleString()}</p>
                    <StatusPill label={r.status === "Received" ? "Received" : "Pending Verification"} tone={r.status === "Received" ? "positive" : "warning"} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(r.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700" title="Delete">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Loan / Advance & Package Earnings */}
      {(myLoans.length > 0 || myPackages.length > 0) && (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Receipt size={16} className="text-brand-600" /> Loan / Advance &amp; Package Earnings</h3>
            {myOutstanding > 0 && (
              <StatusPill label={`Outstanding: PKR ${myOutstanding.toLocaleString()}`} tone="warning" />
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {[...myLoans].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                    {p.type === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.type} Payment</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateDDMMYYYY(p.paymentDate)} {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <StatusPill label={p.status === "Deducted" ? "Deducted from Salary" : "Outstanding"} tone={p.status === "Deducted" ? "positive" : "warning"} />
                </div>
              </div>
            ))}
            {[...myPackages].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Smartphone size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">SIM Package</p>
                    <p className="text-xs font-mono text-muted-foreground">{p.iccid || p.simNumber || p.simId || "—"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateDDMMYYYY(p.paymentDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput placeholder="Search transactions..." value={searchQuery} onSearch={setSearchQuery} className="sm:max-w-sm" />
        {selectedTxnIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedTxnIds([])}>Clear</Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDeleteTxns}><Trash2 size={12} /> Delete Selected ({selectedTxnIds.length})</Button>
          </div>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-center px-3 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground w-10">
                  <input type="checkbox" checked={allTxnsSelected} onChange={toggleAllTxns} className="h-4 w-4 cursor-pointer accent-brand-600" />
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Note</th>
                <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Balance</th>
                <th className="text-center px-4 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedTxns.map((w) => (
                <tr key={w.id} className={`transition-colors ${selectedTxnIds.includes(w.id) ? "bg-brand-50/60" : "hover:bg-slate-50"}`}>
                  <td className="px-3 py-4 text-center">
                    <input type="checkbox" checked={selectedTxnIds.includes(w.id)} onChange={() => toggleTxn(w.id)} className="h-4 w-4 cursor-pointer accent-brand-600" />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDateDDMMYYYY(w.date)}</td>
                  <td className="px-6 py-4"><StatusPill label={w.type} tone={w.type === "Credit" ? "positive" : "negative"} /></td>
                  <td className="px-6 py-4 text-right"><span className={`text-sm font-bold ${w.type === "Credit" ? "text-green-600" : "text-red-600"}`}>{w.type === "Credit" ? "+" : "-"} PKR {w.amount.toLocaleString()}</span></td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-muted-foreground">{w.note}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-foreground">PKR {w.balance.toLocaleString()}</td>
                  <td className="px-4 py-4 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTxn(w.id)} className="mx-auto text-red-600 hover:bg-red-50 hover:text-red-700" title="Delete">
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTxns.length === 0 && (
          <EmptyState icon={SearchX} title="No transactions found" description="Adjust your search or try a different term." />
        )}
        {filteredTxns.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <Landmark size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Submit Loan / Advance Payment</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Request verification of your repayment</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Select Loan / Advance to repay</label>
                <div className="max-h-44 space-y-2 overflow-y-auto">
                  {outstandingList.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedPaymentId(p.id); setAmount(p.amount); }}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${selectedPaymentId === p.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                        {p.type === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{p.type} · {formatDateDDMMYYYY(p.paymentDate)}</p>
                        <p className="text-xs text-muted-foreground">Outstanding: PKR {p.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">PKR {p.amount.toLocaleString()}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{p.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount (PKR)</label>
                <Input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Pay Into (Company Account)</label>
                {bankAccounts.length > 0 ? (
                  <div className="max-h-44 space-y-2 overflow-y-auto">
                    {bankAccounts.map((a) => (
                      <button key={a.id} onClick={() => setSelectedAccountId(a.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${selectedAccountId === a.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="flex-shrink-0">
                          {selectedAccountId === a.id ? <CheckCircle2 size={18} className="text-brand-600" /> : <span className="h-5 w-5 rounded-full border-2 border-slate-300" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{a.name || "Unnamed Account"}</p>
                          <p className="truncate text-xs font-mono text-muted-foreground">{a.accountNumber || a.accountTitle || "—"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
                    <Landmark size={24} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-muted-foreground">No company accounts configured</p>
                  </div>
                )}
                {selectedAccountId && (
                  <div className="mt-3 space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    {(() => { const a = bankAccounts.find((x) => x.id === selectedAccountId); return a ? <>
                      <div className="flex items-center justify-between"><span className="text-xs font-medium text-emerald-700">Bank / Digital</span><span className="text-xs text-foreground">{a.name}</span></div>
                      <div className="flex items-center justify-between"><span className="text-xs font-medium text-emerald-700">Account Title</span><span className="text-xs text-foreground">{a.accountTitle}</span></div>
                      <div className="flex items-center justify-between"><span className="text-xs font-medium text-emerald-700">Account Number</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-foreground">{a.accountNumber}</span>
                          <button type="button" onClick={() => { navigator.clipboard.writeText(a.accountNumber); }} className="text-emerald-600 hover:text-emerald-800" title="Copy"><Copy size={12} /></button>
                        </div>
                      </div>
                    </> : null; })()}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Transaction ID (Optional)</label>
                <Input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. TID-83920" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Note (Optional)</label>
                <Input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid via bank transfer" />
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <Receipt size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">This payment will show as <b>Pending</b> until the franchise verifies and marks it received.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={!selectedPaymentId || !selectedAccountId || amount <= 0 || amount > (myLoans.find((p) => p.id === selectedPaymentId)?.amount || 0) || sending}>
                {sending ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
