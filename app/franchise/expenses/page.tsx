"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Save, Receipt, Tags } from "lucide-react";
import { useFranchiseData, Expense } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ExpensesPage() {
  const { auth, expenses, addExpense, updateExpense, deleteExpense, expenseCategories, addExpenseCategory, deleteExpenseCategory } = useFranchiseData();
  const [tab, setTab] = useState<"expenses" | "categories">("expenses");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const emptyForm: Expense = { id: "", category: "", amount: 0, note: "", date: new Date().toISOString().split("T")[0], franchiseId: auth.franchiseId };
  const [form, setForm] = useState<Expense>(emptyForm);

  const categories = expenseCategories;
  const filtered = expenses.filter((e) => e.date.startsWith(month) && ((e.category || "").toLowerCase().includes(search.toLowerCase()) || (e.note || "").toLowerCase().includes(search.toLowerCase())));
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, id: `EXP-${String(expenses.length + 1).padStart(3, "0")}` }); setShowForm(true); };
  const openEdit = (e: Expense) => { setEditing(e); setForm({ ...e }); setShowForm(true); };
  const handleSave = () => {
    if (!form.category) return;
    if (editing) updateExpense(editing.id, form);
    else addExpense(form);
    setShowForm(false);
  };
  const setField = (field: keyof Expense, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const grouped = categories.map((c) => ({ category: c, total: filtered.filter((e) => (e.category || "") === c).reduce((s, e) => s + e.amount, 0) })).filter((g) => g.total > 0).sort((a, b) => b.total - a.total);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await addExpenseCategory(newCategory);
    setNewCategory("");
  };
  const handleDeleteCategory = async (c: string) => {
    if (!confirm(`Delete category "${c}"?`)) return;
    await deleteExpenseCategory(c);
    setSelectedCats((p) => p.filter((x) => x !== c));
  };
  const toggleCat = (c: string) => setSelectedCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const handleBulkDeleteCats = async () => {
    if (!selectedCats.length || !confirm(`Delete ${selectedCats.length} selected category(ies)?`)) return;
    for (const c of selectedCats) await deleteExpenseCategory(c);
    setSelectedCats([]);
  };

  const tabButton = (t: "expenses" | "categories", label: string, icon: any) => (
    <button onClick={() => setTab(t)}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${tab === t ? "bg-brand-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Expenses" }]}
        title="Expenses"
        description="Track franchise expenses"
        actions={tab === "expenses" ? <Button onClick={openAdd}><Plus size={16} /> Add Expense</Button> : undefined}
      />

      <div className="flex gap-2">
        {tabButton("expenses", "Expenses", <Receipt size={14} />)}
        {tabButton("categories", "Categories", <Tags size={14} />)}
      </div>

      {tab === "expenses" && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <StatCard label={`Total Expenses (${month})`} value={`PKR ${total.toLocaleString()}`} sub="For selected month" icon={Receipt} iconClass="text-red-600 bg-red-50" />
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold">Top Categories</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {grouped.slice(0, 3).map((g) => <div key={g.category} className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{g.category}</span><span className="font-medium text-slate-900">PKR {g.total.toLocaleString()}</span></div>)}
                {grouped.length === 0 && <p className="text-xs text-muted-foreground">No expenses</p>}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="sm:w-48" />
            <SearchInput placeholder="Search expenses..." onSearch={setSearch} className="flex-1" />
          </div>

          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-bold"><Receipt size={16} className="text-brand-600" /> Expense List</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-medium uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-medium uppercase">Category</th>
                    <th className="px-6 py-4 text-right text-muted-foreground text-xs font-medium uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-muted-foreground text-xs font-medium uppercase hidden md:table-cell">Note</th>
                    <th className="px-6 py-4 text-right text-muted-foreground text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map((e) => (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-600 text-sm">{formatDateDDMMYYYY(e.date)}</td>
                      <td className="px-6 py-4"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{e.category}</span></td>
                      <td className="px-6 py-4 text-right font-bold text-red-600 text-sm">PKR {e.amount.toLocaleString()}</td>
                      <td className="hidden px-6 py-4 text-slate-600 text-sm md:table-cell">{e.note}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(e)} className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-amber-50 hover:text-amber-600"><Edit size={14} /></button>
                          <button onClick={() => deleteExpense(e.id)} className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <EmptyState icon={Receipt} title="No expenses found" description="No expenses match the selected month or search." actions={<Button variant="outline" size="sm" onClick={openAdd}><Plus size={14} /> Add Expense</Button>} />}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "categories" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-bold"><Tags size={16} className="text-brand-600" /> Expense Categories</CardTitle>
              <CardTitle className="mt-0.5 text-xs font-normal text-muted-foreground">Manage the category list used in the Add Expense dropdown</CardTitle>
            </div>
            <div className="flex gap-2">
              <Input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} placeholder="New category name" className="sm:w-64" />
              <Button onClick={handleAddCategory} disabled={!newCategory.trim()}><Plus size={14} /> Add</Button>
            </div>
          </CardHeader>
          {selectedCats.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50/60 px-6 py-2.5">
              <p className="text-sm font-medium text-red-700">{selectedCats.length} selected</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedCats([])}>Clear</Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDeleteCats}><Trash2 size={12} /> Delete Selected</Button>
              </div>
            </div>
          )}
          <CardContent className="p-6">
            {categories.length === 0 && <EmptyState icon={Tags} title="No categories yet" description="Add one above to get started." />}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => {
                const used = expenses.filter((e) => (e.category || "") === c).length;
                return (
                  <div key={c} className={`flex items-center justify-between gap-3 rounded-xl border bg-white p-3 transition-colors ${selectedCats.includes(c) ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="checkbox" checked={selectedCats.includes(c)} onChange={() => toggleCat(c)} className="h-4 w-4 flex-shrink-0 cursor-pointer accent-brand-600" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{c}</p>
                        <p className="text-[10px] text-muted-foreground">{used} expense{used === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCategory(c)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
              <CardTitle>{editing ? "Edit Expense" : "Add Expense"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-slate-900"><X size={18} /></button>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
                <Select value={form.category} onChange={(e) => setField("category", e.target.value)}><option value="">Select...</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount (PKR)</label>
                <Input type="number" value={form.amount || ""} onChange={(e) => setField("amount", Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Note</label>
                <Input type="text" value={form.note} onChange={(e) => setField("note", e.target.value)} />
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
