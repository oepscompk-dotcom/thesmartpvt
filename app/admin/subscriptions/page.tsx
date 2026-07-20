"use client";

import { useState } from "react";
import { Check, Edit, X, Save } from "lucide-react";
import { useData, Subscription } from "@/lib/DataContext";

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
      <div>
        <h1 className="text-2xl font-black text-gray-900">Subscription Packages</h1>
        <p className="text-gray-500 text-sm mt-1">Manage subscription plans and pricing</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {subscriptions.map((pkg, index) => (
          <div key={pkg.name} className={`relative bg-white rounded-2xl border overflow-hidden transition-all hover:scale-105 ${pkg.popular ? "border-[#C8A951]/30 shadow-[0_0_30px_rgba(200,169,81,0.15)]" : "border-gray-200"}`}>
            {pkg.popular && <div className="absolute top-0 right-0 px-3 py-1 bg-[#C8A951] text-[#0A2647] text-[10px] font-bold rounded-bl-xl">MOST POPULAR</div>}
            <div className={`h-1.5 bg-gradient-to-r ${pkg.color}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-900 font-bold text-lg">{pkg.name}</h3>
                <button onClick={() => openEdit(index)} className="p-1.5 text-gray-400 hover:text-[#C8A951] hover:bg-[#C8A951]/10 rounded-lg transition-all"><Edit size={14} /></button>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm text-gray-500">PKR</span>
                <span className="text-3xl font-black text-gray-900">{Number(pkg.price).toLocaleString()}</span>
                <span className="text-gray-400 text-sm">{pkg.period}</span>
              </div>
              <div className="space-y-3 mb-6">
                {pkg.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-gray-600 text-sm">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm">
                  <span className="text-gray-900 font-bold">{pkg.franchises}</span> franchises subscribed
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editIndex !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditIndex(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Edit Package</h3>
              <button onClick={() => setEditIndex(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Package Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Price (PKR)</label>
                  <input type="text" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Period</label>
                  <input type="text" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Franchises Subscribed</label>
                <input type="number" value={form.franchises} onChange={(e) => setForm((p) => ({ ...p, franchises: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-gray-500 text-xs font-medium">Features</label>
                  <button onClick={addFeature} type="button" className="text-[#0A2647] text-xs font-medium hover:underline">+ Add Feature</button>
                </div>
                <div className="space-y-2">
                  {form.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <input type="text" value={f} onChange={(e) => updateFeature(fi, e.target.value)} className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                      <button onClick={() => removeFeature(fi)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditIndex(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all inline-flex items-center justify-center gap-2"><Save size={14} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Trash2({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
