"use client";

import { useState } from "react";
import { Check, Edit, X, Save, Trash2 } from "lucide-react";
import { useData, Subscription } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SubscriptionsPage() {
  const { subscriptions, updateSubscription } = useData();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Subscription>({ name: "", price: "", period: "", features: [], franchises: 0, color: "" });

  const openEdit = (index: number) => {
    setEditIndex(index);
    setForm({ ...subscriptions[index], features: [...subscriptions[index].features] });
  };

  const handleSave = () => {
    if (editIndex !== null) {
      updateSubscription(editIndex, form);
      setEditIndex(null);
    }
  };

  const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const removeFeature = (fi: number) => setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== fi) }));
  const updateFeature = (fi: number, val: string) => setForm((prev) => ({ ...prev, features: prev.features.map((f, i) => (i === fi ? val : f)) }));

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Subscriptions" }]}
        title="Subscription Packages"
        description="Manage subscription plans and pricing"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {subscriptions.map((pkg, index) => (
          <Card
            key={pkg.name}
            className={`relative overflow-hidden transition-all hover:scale-[1.02] ${pkg.popular ? "border-brand-600/30 shadow-[0_0_30px_rgba(37,99,235,0.12)]" : ""}`}
          >
            {pkg.popular && <div className="absolute right-0 top-0 rounded-bl-lg bg-brand-600 px-3 py-1 text-[10px] font-bold text-white">MOST POPULAR</div>}
            <div className={`h-1.5 bg-gradient-to-r ${pkg.color}`} />
            <div className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-700 hover:bg-brand-50" onClick={() => openEdit(index)} title="Edit package"><Edit className="h-4 w-4" /></Button>
              </div>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground">PKR</span>
                <span className="text-3xl font-bold text-foreground">{Number(pkg.price).toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">{pkg.period}</span>
              </div>
              <div className="mb-6 space-y-3">
                {pkg.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={14} className="flex-shrink-0 text-green-500" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{pkg.franchises}</span> franchises subscribed
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setEditIndex(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">Edit Package</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditIndex(null)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Package Name</label>
                <Input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price (PKR)</label>
                  <Input type="text" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Period</label>
                  <Input type="text" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Franchises Subscribed</label>
                <Input type="number" value={form.franchises} onChange={(e) => setForm((p) => ({ ...p, franchises: Number(e.target.value) }))} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Features</label>
                  <Button variant="ghost" size="sm" onClick={addFeature} type="button" className="text-brand-700 hover:bg-brand-50">+ Add Feature</Button>
                </div>
                <div className="space-y-2">
                  {form.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <Input type="text" value={f} onChange={(e) => updateFeature(fi, e.target.value)} className="flex-1" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeFeature(fi)} title="Remove feature"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditIndex(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}><Save className="h-4 w-4" /> Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}