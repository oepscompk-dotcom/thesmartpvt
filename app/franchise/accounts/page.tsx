"use client";

import { useState } from "react";
import { Landmark, Plus, Edit, Trash2, X, Save, Wallet } from "lucide-react";
import { useFranchiseData, Account } from "@/lib/FranchiseDataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AccountsPage() {
  const { bankAccounts, addAccount, updateAccount, deleteAccount } = useFranchiseData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const emptyForm: Account = { id: "", name: "", type: "Bank", accountNumber: "", balance: 0, status: "Active" };
  const [form, setForm] = useState<Account>(emptyForm);

  const filtered = bankAccounts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()));
  const totalBalance = bankAccounts.filter((a) => a.status === "Active").reduce((s, a) => s + a.balance, 0);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, id: `ACC-${String(bankAccounts.length + 1).padStart(3, "0")}` }); setShowForm(true); };
  const openEdit = (a: Account) => { setEditing(a); setForm({ ...a }); setShowForm(true); };
  const handleSave = () => {
    if (!form.name) return;
    if (editing) updateAccount(editing.id, form);
    else addAccount(form);
    setShowForm(false);
  };
  const setField = (field: keyof Account, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Accounts" }]}
        title="Accounts"
        description="Bank accounts and cash management"
        actions={<Button onClick={openAdd}><Plus size={16} /> Add Account</Button>}
      />

      <StatCard label="Total Balance" value={`PKR ${totalBalance.toLocaleString()}`} icon={Wallet} iconClass="text-brand-600 bg-brand-50" />

      <SearchInput placeholder="Search accounts..." onSearch={setSearch} />

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Landmark size={18} /></div>
                  <StatusPill label={a.status} tone={toneForStatus(a.status)} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{a.name}</h3>
                <p className="text-xs font-mono text-muted-foreground mb-3">{a.accountNumber}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{a.type}</span>
                  <span className="ml-auto text-lg font-bold text-slate-900">PKR {a.balance.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(a)}><Edit size={12} /> Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteAccount(a.id)}><Trash2 size={12} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmptyState icon={Landmark} title="No accounts found" description="No bank accounts match your search." actions={<Button variant="outline" size="sm" onClick={openAdd}><Plus size={14} /> Add Account</Button>} />
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md" >
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
              <CardTitle>{editing ? "Edit Account" : "Add Account"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-slate-900"><X size={18} /></button>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Account ID</label>
                <input type="text" value={form.id} onChange={(e) => setField("id", e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
                <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
                <Select value={form.type} onChange={(e) => setField("type", e.target.value)}>{["Bank", "Cash", "Digital Wallet"].map((t) => <option key={t} value={t}>{t}</option>)}</Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Account Number</label>
                <Input value={form.accountNumber} onChange={(e) => setField("accountNumber", e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Balance (PKR)</label>
                <Input type="number" value={form.balance || ""} onChange={(e) => setField("balance", Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
                <Select value={form.status} onChange={(e) => setField("status", e.target.value)}>{["Active", "Inactive"].map((s) => <option key={s} value={s}>{s}</option>)}</Select>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}><Save size={14} /> {editing ? "Update" : "Add"}</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
