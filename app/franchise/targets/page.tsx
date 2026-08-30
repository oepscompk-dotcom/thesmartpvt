"use client";

import { useState, useEffect, useMemo } from "react";
import { Target, LayoutGrid, List, Settings, Users, Save, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { apiLoadById, apiSave } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const defaultSettings = { deviceWeight: 2, simWeight: 1, warnLow: 50, warnHigh: 80 };

type Staff = { id: string; name: string; role: "DSO" | "DSM" };

export default function TargetsPage() {
  const { auth, dso, dsms, getTarget, upsertTarget } = useFranchiseData();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [view, setView] = useState<"cards" | "list">("cards");
  const [roleFilter, setRoleFilter] = useState<"All" | "DSO" | "DSM">("All");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    (async () => {
      try {
        const s = await apiLoadById("franchiseData", "target-settings-" + auth.franchiseId);
        if (s?.data) setSettings({ ...defaultSettings, ...JSON.parse(s.data) });
      } catch {}
    })();
  }, [auth?.franchiseId]);

  const saveSettings = async () => {
    try {
      await apiSave("franchiseData", { id: "target-settings-" + auth.franchiseId, data: JSON.stringify(settings) });
      setShowSettings(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    }
  };

  const employees: Staff[] = useMemo(
    () => [
      ...dso.map((d) => ({ id: d.id, name: d.name, role: "DSO" as const })),
      ...dsms.map((d) => ({ id: d.id, name: d.name, role: "DSM" as const })),
    ],
    [dso, dsms]
  );

  const rows = useMemo(() => employees
    .filter((e) => roleFilter === "All" || e.role === roleFilter)
    .map((e) => ({ ...e, target: getTarget(e.id, month, e.role) }))
    .sort((a, b) => a.name.localeCompare(b.name)), [employees, month, roleFilter, getTarget]);

  const stats = useMemo(() => {
    let withTargets = 0, totalPts = 0, onTrack = 0, warning = 0, behind = 0;
    rows.forEach((r) => {
      const t = r.target;
      const devPct = (t.deviceTarget ?? 0) > 0 ? (t.deviceAchieved ?? 0) / (t.deviceTarget ?? 1) : 0;
      const simPct = (t.simTarget ?? 0) > 0 ? (t.simAchieved ?? 0) / (t.simTarget ?? 1) : 0;
      const wPct = Math.round(((devPct * settings.deviceWeight + simPct * settings.simWeight) / (settings.deviceWeight + settings.simWeight)) * 100);
      totalPts += (t.deviceAchieved ?? 0) * settings.deviceWeight + (t.simAchieved ?? 0) * settings.simWeight;
      if ((t.deviceTarget ?? 0) > 0 || (t.simTarget ?? 0) > 0) withTargets++;
      if (wPct >= settings.warnHigh) onTrack++;
      else if (wPct >= settings.warnLow) warning++;
      else if ((t.deviceTarget ?? 0) > 0 || (t.simTarget ?? 0) > 0) behind++;
    });
    return { total: rows.length, withTargets, totalPts, onTrack, warning, behind };
  }, [rows, settings]);

  const handleUpdate = (id: string, role: "DSO" | "DSM", field: string, value: number) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const current = row.target;
    upsertTarget(id, month, role, { ...current, [field]: value });
  };

  const pct = (target: number, achieved: number) => target > 0 ? Math.min(Math.round((achieved / target) * 100), 100) : 0;
  const weighted = (t: any) => {
    const devPct = t.deviceTarget ? (t.deviceAchieved ?? 0) / t.deviceTarget : 0;
    const simPct = t.simTarget ? (t.simAchieved ?? 0) / t.simTarget : 0;
    return Math.round(((devPct * settings.deviceWeight + simPct * settings.simWeight) / (settings.deviceWeight + settings.simWeight)) * 100);
  };
  const statusOf = (w: number) => w >= settings.warnHigh ? { label: "On Track", tone: "positive" as const } : w >= settings.warnLow ? { label: "Warning", tone: "warning" as const } : { label: "Behind", tone: "negative" as const };
  const barColor = (w: number) => w >= settings.warnHigh ? "bg-green-500" : w >= settings.warnLow ? "bg-yellow-500" : "bg-red-500";

  const ProgressBlock = ({ label, target, achieved, accent, onTarget, onAchieved }: {
    label: string; target: number; achieved: number; accent: string;
    onTarget: (v: number) => void; onAchieved: (v: number) => void;
  }) => {
    const p = pct(target, achieved);
    return (
      <div className="min-w-0">
        <div className="flex justify-between items-center gap-2 text-xs mb-1">
          <span className="text-gray-500 shrink-0">{label}</span>
          <span className={`font-medium whitespace-nowrap ${p >= settings.warnHigh ? "text-green-600" : p >= settings.warnLow ? "text-yellow-600" : "text-red-600"}`}>
            {achieved}/{target} ({p}%)
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor(p)}`} style={{ width: `${Math.max(p, target > 0 ? 2 : 0)}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          <input type="number" value={target} onChange={(e) => onTarget(Number(e.target.value))} placeholder="Target" className={`w-full min-w-0 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#0A2647]/50 ${accent}`} />
          <input type="number" value={achieved} onChange={(e) => onAchieved(Number(e.target.value))} placeholder="Done" className="w-full min-w-0 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Targets" }]}
        title="Target & Achievement"
        description="Monthly targets for DSO & DSM teams"
        actions={
          <>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
              <Target size={16} className="text-muted-foreground" />
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-transparent text-xs outline-none" />
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button onClick={() => setView("cards")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${view === "cards" ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                <LayoutGrid size={14} /> Cards
              </button>
              <button onClick={() => setView("list")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${view === "list" ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                <List size={14} /> List
              </button>
            </div>
            <Button variant={showSettings ? "primary" : "outline"} size="sm" onClick={() => setShowSettings((p) => !p)}>
              <Settings size={14} /> Settings
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Team Members" value={stats.total} icon={Users} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Targets Set" value={stats.withTargets} icon={Target} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Total Points" value={stats.totalPts.toLocaleString()} icon={Target} iconClass="text-slate-600 bg-slate-100" />
        <StatCard label="On Track" value={stats.onTrack} icon={CheckCircle2} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Warning" value={stats.warning} icon={AlertTriangle} iconClass="text-yellow-600 bg-yellow-50" />
        <StatCard label="Behind" value={stats.behind} icon={AlertTriangle} iconClass="text-red-600 bg-red-50" />
      </div>

      {showSettings && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-5">
            <CardTitle className="flex items-center gap-2 text-sm font-bold"><Settings size={16} className="text-brand-600" /> Target Settings</CardTitle>
            <button onClick={() => setShowSettings(false)} className="p-1 text-muted-foreground hover:text-slate-900"><X size={16} /></button>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Points per Device</label><Input type="number" value={settings.deviceWeight} onChange={(e) => setSettings((p) => ({ ...p, deviceWeight: Number(e.target.value) }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Points per SIM</label><Input type="number" value={settings.simWeight} onChange={(e) => setSettings((p) => ({ ...p, simWeight: Number(e.target.value) }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Warning Below (%)</label><Input type="number" value={settings.warnLow} onChange={(e) => setSettings((p) => ({ ...p, warnLow: Number(e.target.value) }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">On Track Above (%)</label><Input type="number" value={settings.warnHigh} onChange={(e) => setSettings((p) => ({ ...p, warnHigh: Number(e.target.value) }))} /></div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button onClick={saveSettings}><Save size={14} /> Save Settings</Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex w-fit gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
        {(["All", "DSO", "DSM"] as const).map((r) => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${roleFilter === r ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
            <Users size={14} /> {r}
            <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${roleFilter === r ? "bg-white/20" : "bg-slate-100"}`}>
              {r === "All" ? rows.length : rows.filter((x) => x.role === r).length}
            </span>
          </button>
        ))}
      </div>

      {rows.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState icon={Target} title={`No ${roleFilter === "All" ? "" : roleFilter + " "}members found`} description="No members found for this month." />
          </CardContent>
        </Card>
      )}

      {view === "cards" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rows.map((r) => {
            const w = weighted(r.target);
            const st = statusOf(w);
            const pts = (r.target.deviceAchieved ?? 0) * settings.deviceWeight + (r.target.simAchieved ?? 0) * settings.simWeight;
            return (
              <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden min-w-0">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold ${r.role === "DSM" ? "bg-blue-600" : "bg-green-600"}`}>{r.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="text-gray-900 font-bold text-sm truncate">{r.name}</p>
                      <p className="text-gray-400 text-xs font-mono truncate">{r.id} · {r.role}</p>
                    </div>
                  </div>
                  <StatusPill label={st.label} tone={st.tone} />
                </div>

                <div className="space-y-3">
                  <ProgressBlock label="Devices" target={r.target.deviceTarget ?? 0} achieved={r.target.deviceAchieved ?? 0} accent="text-blue-600"
                    onTarget={(v) => handleUpdate(r.id, r.role, "deviceTarget", v)}
                    onAchieved={(v) => handleUpdate(r.id, r.role, "deviceAchieved", v)} />
                  <ProgressBlock label="SIMs" target={r.target.simTarget ?? 0} achieved={r.target.simAchieved ?? 0} accent="text-green-600"
                    onTarget={(v) => handleUpdate(r.id, r.role, "simTarget", v)}
                    onAchieved={(v) => handleUpdate(r.id, r.role, "simAchieved", v)} />
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center gap-2 text-xs">
                  <span className="text-gray-500 shrink-0">Points</span>
                  <span className="font-black text-gray-900 whitespace-nowrap min-w-0">{pts.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Employee</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Devices</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">SIMs</th>
                  <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase">Points</th>
                  <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const w = weighted(r.target);
                  const st = statusOf(w);
                  const pts = (r.target.deviceAchieved ?? 0) * settings.deviceWeight + (r.target.simAchieved ?? 0) * settings.simWeight;
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-gray-900 text-sm font-medium">{r.name}</p>
                        <p className="text-gray-400 text-xs font-mono">{r.id}</p>
                      </td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.role === "DSM" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{r.role}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input type="number" value={r.target.deviceTarget ?? 0} onChange={(e) => handleUpdate(r.id, r.role, "deviceTarget", Number(e.target.value))} className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900" />
                          <span className="text-gray-400 text-xs">/</span>
                          <input type="number" value={r.target.deviceAchieved ?? 0} onChange={(e) => handleUpdate(r.id, r.role, "deviceAchieved", Number(e.target.value))} className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900" />
                          <span className={`text-xs font-bold w-10 text-right ${pct(r.target.deviceTarget ?? 0, r.target.deviceAchieved ?? 0) >= settings.warnHigh ? "text-green-600" : pct(r.target.deviceTarget ?? 0, r.target.deviceAchieved ?? 0) >= settings.warnLow ? "text-yellow-600" : "text-red-600"}`}>{pct(r.target.deviceTarget ?? 0, r.target.deviceAchieved ?? 0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input type="number" value={r.target.simTarget ?? 0} onChange={(e) => handleUpdate(r.id, r.role, "simTarget", Number(e.target.value))} className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900" />
                          <span className="text-gray-400 text-xs">/</span>
                          <input type="number" value={r.target.simAchieved ?? 0} onChange={(e) => handleUpdate(r.id, r.role, "simAchieved", Number(e.target.value))} className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900" />
                          <span className={`text-xs font-bold w-10 text-right ${pct(r.target.simTarget ?? 0, r.target.simAchieved ?? 0) >= settings.warnHigh ? "text-green-600" : pct(r.target.simTarget ?? 0, r.target.simAchieved ?? 0) >= settings.warnLow ? "text-yellow-600" : "text-red-600"}`}>{pct(r.target.simTarget ?? 0, r.target.simAchieved ?? 0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-gray-900">{pts.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center"><StatusPill label={st.label} tone={st.tone} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}