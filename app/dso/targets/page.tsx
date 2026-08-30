"use client";

import { useState } from "react";
import { Target, Save, TrendingUp } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function DSOTargetsPage() {
  const { targets, updateTargets } = useDSOData();
  const [form, setForm] = useState({
    newSIM: targets.newSIM,
    newSIMAchieved: targets.newSIMAchieved,
    mnp: targets.mnp,
    mnpAchieved: targets.mnpAchieved,
    replacement: targets.replacement,
    replacementAchieved: targets.replacementAchieved,
    byn: targets.byn,
    bynAchieved: targets.bynAchieved,
  });
  const [saved, setSaved] = useState(false);

  const targetItems = [
    { key: "newSIM" as const, label: "New SIM", achieved: form.newSIMAchieved, target: form.newSIM, fieldA: "newSIMAchieved" as const, fieldT: "newSIM" as const, color: "blue" },
    { key: "mnp" as const, label: "MNP", achieved: form.mnpAchieved, target: form.mnp, fieldA: "mnpAchieved" as const, fieldT: "mnp" as const, color: "green" },
    { key: "replacement" as const, label: "Replacement", achieved: form.replacementAchieved, target: form.replacement, fieldA: "replacementAchieved" as const, fieldT: "replacement" as const, color: "orange" },
    { key: "byn" as const, label: "BYN", achieved: form.bynAchieved, target: form.byn, fieldA: "bynAchieved" as const, fieldT: "byn" as const, color: "purple" },
  ];

  const handleSave = () => {
    updateTargets({
      newSIM: form.newSIM,
      newSIMAchieved: form.newSIMAchieved,
      mnp: form.mnp,
      mnpAchieved: form.mnpAchieved,
      replacement: form.replacement,
      replacementAchieved: form.replacementAchieved,
      byn: form.byn,
      bynAchieved: form.bynAchieved,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const overallTarget = form.newSIM + form.mnp + form.replacement + form.byn;
  const overallAchieved = form.newSIMAchieved + form.mnpAchieved + form.replacementAchieved + form.bynAchieved;
  const overallPct = overallTarget > 0 ? Math.round((overallAchieved / overallTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "Targets" }]}
        title="Targets & Achievements"
        description={`${targets.month} — Track and update your monthly goals`}
        actions={
          <Button onClick={handleSave}>
            <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <TrendingUp size={18} />
            </div>
            <p className="text-2xl font-bold text-foreground">{overallPct}%</p>
            <p className="text-xs font-medium text-muted-foreground">Overall Progress ({overallAchieved}/{overallTarget})</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all duration-500 ${overallPct >= 80 ? "bg-green-500" : overallPct >= 50 ? "bg-brand-500" : "bg-red-500"}`} style={{ width: `${Math.min(overallPct, 100)}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {targetItems.map((item) => {
          const pct = item.target > 0 ? Math.round((item.achieved / item.target) * 100) : 0;
          const iconClass = item.color === "blue" ? "text-blue-600 bg-blue-50" : item.color === "green" ? "text-green-600 bg-green-50" : item.color === "orange" ? "text-orange-600 bg-orange-50" : "text-purple-600 bg-purple-50";
          const barClass = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-brand-500" : "bg-red-500";

          return (
            <Card key={item.key}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}><Target size={18} /></div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">{item.label}</p>
                    <p className="text-xs font-mono text-muted-foreground">{pct}%</p>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </CardHeader>
              <CardContent className="flex gap-2 pt-0">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Target</label>
                  <Input type="number" value={item.target} onChange={(e) => setForm((p) => ({ ...p, [item.fieldT]: Number(e.target.value) }))} />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Achieved</label>
                  <Input type="number" value={item.achieved} onChange={(e) => setForm((p) => ({ ...p, [item.fieldA]: Number(e.target.value) }))} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-xs text-muted-foreground">Remaining</span>
                <span className="text-xs font-bold text-foreground">{Math.max(item.target - item.achieved, 0)}</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
