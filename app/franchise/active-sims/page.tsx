"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Filter, Smartphone, CheckCircle, Clock, Package, Upload, Download, X, FileSpreadsheet, AlertCircle, FileDown, Eye, Pencil, Trash2, Calendar, CheckSquare } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { apiLoad, apiLoadById, apiSave, apiUpdate, apiDelete } from "@/lib/api";

interface Activation { id: string; type: string; simNumber: string; status: string; bvsStatus: string; fcaStatus: string; ifcaStatus: string; dsoId: string; retailerId: string; createdAt: string; franchiseId: string; }

interface ImportRow {
  iccid: string;
  deviceId: string;
  retailerId: string;
  simNumber: string;
  bvs: string;
  fca: string;
  ifca: string;
  matched?: boolean;
  matchType?: "deviceId" | "retailerId" | "simNumber" | "iccid";
  matchedSimNumber?: string;
  matchedSimId?: string;
}

async function loadActivations(franchiseId: string): Promise<Activation[]> {
  if (!franchiseId) return [];
  try {
    const [dsoActivations, dsmActivations] = await Promise.all([
      apiLoad("dsoActivation", franchiseId),
      apiLoad("dsmActivation", franchiseId),
    ]);
    return [...(dsoActivations || []), ...(dsmActivations || [])];
  } catch {
    return [];
  }
}

interface ImportVerification {
  simNumber: string;
  bvs: string;
  fca: string;
  ifca: string;
  verifiedAt: string;
}

async function loadImportVerifications(): Promise<Record<string, ImportVerification>> {
  try {
    const data = await apiLoad("franchiseSimVerification");
    if (Array.isArray(data)) {
      const result: Record<string, ImportVerification> = {};
      for (const item of data) {
        if (item.simNumber) result[item.simNumber] = item;
      }
      return result;
    }
  } catch {}
  return {};
}

async function saveImportVerifications(data: Record<string, ImportVerification>) {
  for (const verification of Object.values(data)) {
    try { await apiSave("franchiseSimVerification", { ...verification, id: verification.simNumber }); } catch (e) { console.error("saveImportVerifications error:", e); }
  }
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["\s]/g, ""));
  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/["']/g, ""));
    if (cols.length < 2) continue;
    const iccidIdx = headers.findIndex((h) => h.includes("iccid"));
    const deviceIdIdx = headers.findIndex((h) => h.includes("device") && h.includes("id"));
    const retailerIdx = headers.findIndex((h) => h.includes("retailer"));
    const simNumIdx = headers.findIndex((h) => h.includes("sim") && h.includes("number"));
    const bvsIdx = headers.findIndex((h) => h.includes("bvs"));
    const fcaIdx = headers.findIndex((h) => h.includes("fca"));
    const ifcaIdx = headers.findIndex((h) => h.includes("ifca"));
    rows.push({
      iccid: iccidIdx >= 0 ? cols[iccidIdx] : "",
      deviceId: deviceIdIdx >= 0 ? cols[deviceIdIdx] : "",
      retailerId: retailerIdx >= 0 ? cols[retailerIdx] : "",
      simNumber: simNumIdx >= 0 ? cols[simNumIdx] : "",
      bvs: bvsIdx >= 0 ? cols[bvsIdx] : "0",
      fca: fcaIdx >= 0 ? cols[fcaIdx] : "0",
      ifca: ifcaIdx >= 0 ? cols[ifcaIdx] : "0",
    });
  }
  return rows;
}

function generateSampleCSV(): string {
  return `ICCID,SIM Number,Device ID,Retailer ID,BVS,FCA,IFCA
89920387654321098765,0341-1111111,NRWP-1217-841,03001234567,0,0,0
89920387654321098766,0301-2222222,NRWP-1217-842,03001234568,1,1,0
89920387654321098767,0331-3333333,,03001234569,1,1,1`;
}

function downloadSampleFile() {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "active-sims-import-sample.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = ["Sr.No", "Retailer ID", "SIM Number", "ICCID", "Network", "Device ID", "DSO/DSM ID", "DSO/DSM Name", "Date", "Status", "SIM Type", "BVS", "FCA", "IFCA"];
  const rows = data.map((row) => [
    row.srNo, row.retailerId, row.simNumber, row.iccid, row.network,
    row.deviceId, row.dsoId, row.dsoName, row.date, row.status,
    row.simType, row.bvs, row.fca, row.ifca,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const datePart = dateStr.split(" ")[0].split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export default function ActiveSIMsPage() {
  const { sims, dso, dsms, auth } = useFranchiseData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewSIM, setViewSIM] = useState<any>(null);
  const [editSIM, setEditSIM] = useState<any>(null);
  const [editForm, setEditForm] = useState({ network: "", status: "", notes: "", bvs: "", fca: "", ifca: "", deviceId: "", iccid: "", simType: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [allActivations, setAllActivations] = useState<Activation[]>([]);
  const [importVerifications, setImportVerifications] = useState<Record<string, ImportVerification>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkEditActive, setBulkEditActive] = useState(false);
  const [pageMounted, setPageMounted] = useState(false);

  const refreshActivations = async () => {
    if (auth?.franchiseId) {
      setAllActivations(await loadActivations(auth.franchiseId));
    }
  };

  useEffect(() => {
    setPageMounted(true);
  }, []);

  useEffect(() => {
    if (auth?.franchiseId) {
      loadActivations(auth.franchiseId).then(setAllActivations);
    }
  }, [auth?.franchiseId, pageMounted]);

  useEffect(() => {
    loadImportVerifications().then(setImportVerifications);
  }, []);

  useEffect(() => {
    const refresh = async () => { await refreshActivations(); setImportVerifications(await loadImportVerifications()); };
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 10000);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", onVisibility); clearInterval(interval); };
  }, [auth?.franchiseId]);

  const getPersonName = (dsoId: string) => {
    if (!dsoId || dsoId === "—") return "—";
    const foundDso = dso.find((d) => d.id === dsoId);
    if (foundDso) return foundDso.name;
    const foundDsm = dsms.find((d) => d.id === dsoId);
    if (foundDsm) return foundDsm.name;
    return dsoId;
  };

  const getPersonRetailerId = (dsoId: string) => {
    if (!dsoId || dsoId === "—") return "—";
    const foundDso = dso.find((d) => d.id === dsoId);
    if (foundDso) return foundDso.retailerId || "—";
    const foundDsm = dsms.find((d) => d.id === dsoId);
    if (foundDsm) return foundDsm.retailerId || "—";
    return "—";
  };

  const getActivationForSIM = (simNumber: string) => allActivations.find((a) => a.simNumber === simNumber);

  const vcFromActivation = (v: string) => v === "Completed" ? "0" : "X";

  const getDisplayStatus = (sim: any): { status: string; bvs: string; fca: string; ifca: string } => {
    const imp = importVerifications[sim.simNumber];
    const activation = getActivationForSIM(sim.simNumber);
    const actBvs = activation ? vcFromActivation(activation.bvsStatus) : "X";
    const actFca = activation ? vcFromActivation(activation.fcaStatus) : "X";
    const actIfca = activation ? vcFromActivation(activation.ifcaStatus) : "X";
    const impBvs = imp?.bvs || "X";
    const impFca = imp?.fca || "X";
    const impIfca = imp?.ifca || "X";
    const best = (a: string, b: string) => a === "0" || b === "0" ? "0" : a === "1" || b === "1" ? "1" : "X";
    let bvs = best(actBvs, impBvs);
    let fca = best(actFca, impFca);
    let ifcaV = best(actIfca, impIfca);
    const vals = { BVS: bvs, FCA: fca, IFCA: ifcaV };
    const xItems = Object.entries(vals).filter(([, v]) => v === "X").map(([k]) => k);
    const oneItems = Object.entries(vals).filter(([, v]) => v === "1").map(([k]) => k);
    const allX = bvs === "X" && fca === "X" && ifcaV === "X";
    const allZero = bvs === "0" && fca === "0" && ifcaV === "0";
    const allOne = bvs === "1" && fca === "1" && ifcaV === "1";
    let status: string;
    if (allX) {
      status = "Issued";
    } else if (xItems.length > 0) {
      status = `Pending ${xItems.join(", ")} (${xItems.length})`;
    } else if (allZero) {
      status = "Completed";
    } else if (allOne) {
      status = "Verified";
    } else {
      status = "Pending-V";
    }
    return { status, bvs, fca, ifca: ifcaV };
  };

  const getSIMType = (sim: any): string => {
    if (sim.type === "new") return "New";
    const activation = getActivationForSIM(sim.simNumber);
    if (activation) {
      const t = activation.type.toLowerCase();
      if (t === "mnp") return "MNP";
      if (t === "byn") return "BYN";
      if (t === "replacement" || t === "repl") return "REPL";
    }
    return "HLR";
  };

  const activeSIMs = useMemo(() => {
    const activatedSimNumbers = new Set(allActivations.map((a) => a.simNumber));
    return sims.filter((s) =>
      s.status === "Issued" || s.status === "Activated" || s.status === "Active" ||
      activatedSimNumbers.has(s.simNumber)
    );
  }, [sims, allActivations]);

  const filteredList = useMemo(() => {
    return activeSIMs.filter((s) => {
      const activation = getActivationForSIM(s.simNumber);
      const dsoId = s.issuedToId || activation?.dsoId || "";
      const dsoName = s.issuedToName || getPersonName(dsoId);
      const retailerId = activation?.retailerId || getPersonRetailerId(dsoId);
      const { status } = getDisplayStatus(s);
      const simType = getSIMType(s);

      const matchSearch = !search ||
        s.simNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.iccid?.toLowerCase().includes(search.toLowerCase()) ||
        s.deviceId?.toLowerCase().includes(search.toLowerCase()) ||
        dsoId.toLowerCase().includes(search.toLowerCase()) ||
        dsoName.toLowerCase().includes(search.toLowerCase()) ||
        retailerId.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || 
        (statusFilter === "Issued" && status === "Issued") ||
        (statusFilter === "Pending" && status.startsWith("Pending ") && !status.startsWith("Pending-V")) ||
        (statusFilter === "Pending-V" && status.startsWith("Pending-V")) ||
        (statusFilter === "Completed" && status.startsWith("Completed")) ||
        (statusFilter === "Verified" && status.startsWith("Verified"));
      const matchType = typeFilter === "All" || simType === typeFilter;

      let matchDate = true;
      if (dateFrom || dateTo) {
        const dateStr = formatDate(activation?.createdAt || "");
        if (dateFrom && dateTo) matchDate = dateStr >= dateFrom && dateStr <= dateTo;
        else if (dateFrom) matchDate = dateStr >= dateFrom;
        else if (dateTo) matchDate = dateStr <= dateTo;
      }
      return matchSearch && matchStatus && matchType && matchDate;
    });
  }, [activeSIMs, search, statusFilter, typeFilter, dateFrom, dateTo, allActivations, importVerifications]);

  const stats = useMemo(() => {
    let issued = 0, completed = 0, verified = 0, pending = 0, pendingV = 0;
    activeSIMs.forEach((s) => {
      const { status } = getDisplayStatus(s);
      if (status === "Issued") issued++;
      else if (status.startsWith("Pending-V")) pendingV++;
      else if (status.startsWith("Verified")) verified++;
      else if (status.startsWith("Completed")) completed++;
      else pending++;
    });
    return { total: activeSIMs.length, issued, completed, verified, pending, pendingV };
  }, [activeSIMs, allActivations, importVerifications]);

  const typeStats = useMemo(() => {
    let newCount = 0, mnp = 0, byn = 0, repl = 0;
    activeSIMs.forEach((s) => { const t = getSIMType(s); if (t === "New") newCount++; else if (t === "MNP") mnp++; else if (t === "BYN") byn++; else if (t === "REPL") repl++; });
    return { newCount, mnp, byn, repl };
  }, [activeSIMs, allActivations]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(""); setImportSuccess(""); setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) { setImportError("No valid rows found. Check file format."); return; }
      const matched = rows.map((row) => {
        let foundSim = null;
        let matchType: "deviceId" | "retailerId" | "simNumber" | "iccid" = "iccid";
        if (row.iccid) {
          foundSim = activeSIMs.find((s) => s.iccid && s.iccid.toLowerCase() === row.iccid.toLowerCase());
          matchType = "iccid";
        }
        if (!foundSim && row.simNumber) {
          foundSim = activeSIMs.find((s) => s.simNumber === row.simNumber);
          matchType = "simNumber";
        }
        if (!foundSim && row.deviceId) {
          foundSim = activeSIMs.find((s) => s.issuedToId === row.deviceId || s.deviceId === row.deviceId);
          matchType = "deviceId";
        }
        if (!foundSim && row.retailerId) {
          foundSim = activeSIMs.find((s) => {
            const personRetailer = getPersonRetailerId(s.issuedToId || "");
            return personRetailer === row.retailerId;
          });
          matchType = "retailerId";
        }
        return { ...row, matched: !!foundSim, matchType: foundSim ? matchType : undefined, matchedSimNumber: foundSim?.simNumber, matchedSimId: foundSim?.id };
      });
      setImportRows(matched);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const matchedRows = importRows.filter((r) => r.matched);
    if (matchedRows.length === 0) { setImportError("No matching SIMs found."); return; }
    const freshActivations = await loadActivations(auth.franchiseId);
    let updatedCount = 0;
    let errors: string[] = [];
    const localVerifications: Record<string, ImportVerification> = { ...importVerifications };
    for (const row of matchedRows) {
      const simNum = row.matchedSimNumber || row.simNumber;
      if (!simNum) continue;
      const prev = localVerifications[simNum] || { bvs: "X", fca: "X", ifca: "X" };
      const newBvs = row.bvs === "0" || row.bvs === "1" ? row.bvs : (prev.bvs || "X");
      const newFca = row.fca === "0" || row.fca === "1" ? row.fca : (prev.fca || "X");
      const newIfca = row.ifca === "0" || row.ifca === "1" ? row.ifca : (prev.ifca || "X");
      try {
        const result = await apiSave("franchiseSimVerification", {
          id: simNum,
          simNumber: simNum,
          bvs: newBvs,
          fca: newFca,
          ifca: newIfca,
          verifiedAt: new Date().toISOString(),
        });
        if (result && (result as any).error) {
          errors.push(`${simNum}: ${(result as any).error}`);
        } else {
          updatedCount++;
        }
      } catch (e: any) {
        errors.push(`${simNum}: ${e.message || "save failed"}`);
      }
      localVerifications[simNum] = { simNumber: simNum, bvs: newBvs, fca: newFca, ifca: newIfca, verifiedAt: new Date().toISOString() };
      console.log(`Import ${simNum}: bvs=${newBvs} fca=${newFca} ifca=${newIfca}`);
      const activation = freshActivations.find((a) => a.simNumber === simNum);
      if (activation) {
        const actUpdates: Record<string, string> = {};
        if (newBvs === "0" && activation.bvsStatus !== "Completed") { actUpdates.bvsStatus = "Completed"; actUpdates.bvsDate = new Date().toISOString(); }
        if (newFca === "0" && activation.fcaStatus !== "Completed") { actUpdates.fcaStatus = "Completed"; actUpdates.fcaDate = new Date().toISOString(); }
        if (newIfca === "0" && activation.ifcaStatus !== "Completed") { actUpdates.ifcaStatus = "Completed"; actUpdates.ifcaDate = new Date().toISOString(); }
        if (Object.keys(actUpdates).length > 0) {
          try { await apiUpdate("dsoActivation", activation.id, actUpdates); } catch {}
          try { await apiUpdate("dsmActivation", activation.id, actUpdates); } catch {}
          Object.assign(activation, actUpdates);
        }
      }
      if (row.matchedSimId && row.iccid) {
        try {
          const freshSim = await apiLoadById("sim", row.matchedSimId);
          if (freshSim && freshSim.iccid !== row.iccid) {
            await apiUpdate("sim", row.matchedSimId, { ...freshSim, iccid: row.iccid });
          }
        } catch (e) { console.error("ICCID update error:", e); }
      }
    }
    if (updatedCount === 0) {
      setImportError(`Import failed: ${errors[0] || "Unknown error"}. Check console.`);
    } else if (errors.length > 0) {
      setImportSuccess(`Imported ${updatedCount} records (${errors.length} failed: ${errors[0]})`);
    } else {
      setImportSuccess(`Imported ${updatedCount} records. BVS/FCA/IFCA updated.`);
    }
    setImportRows([]); setImportFile(null);
    setAllActivations(freshActivations);
    setImportVerifications(localVerifications);
    setTimeout(() => { setShowImportModal(false); setImportSuccess(""); }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Active SIMs</h1>
          <p className="text-gray-500 text-sm mt-1">All issued, active and verified SIMs ({activeSIMs.length} total)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const exportData = filteredList.map((sim, idx) => {
              const { status, bvs, fca, ifca } = getDisplayStatus(sim);
              const activation = getActivationForSIM(sim.simNumber);
              const dsoId = sim.issuedToId || activation?.dsoId || "—";
              const dsoName = sim.issuedToName || getPersonName(dsoId);
              const retailerId = activation?.retailerId || getPersonRetailerId(dsoId);
              return { srNo: idx + 1, retailerId, simNumber: sim.simNumber, iccid: sim.iccid || "—", network: sim.network,
                deviceId: sim.deviceId || "—", dsoId, dsoName, date: formatDate(activation?.createdAt || sim.receiveDate),
                status, simType: getSIMType(sim), bvs, fca, ifca };
            });
            exportToCSV(exportData, `active-sims-${new Date().toISOString().split("T")[0]}.csv`);
          }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 font-medium text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
            <FileDown size={16} /> Export
          </button>
          <button onClick={() => setShowImportModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
            <Upload size={16} /> Import
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0A2647]/10 flex items-center justify-center"><Package size={14} className="text-[#0A2647]" /></div>
          <div><p className="text-lg font-black text-gray-900">{stats.total}</p><p className="text-gray-500 text-[10px]">Total</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Clock size={14} className="text-blue-600" /></div>
          <div><p className="text-lg font-black text-blue-600">{stats.issued}</p><p className="text-gray-500 text-[10px]">Issued</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><AlertCircle size={14} className="text-amber-600" /></div>
          <div><p className="text-lg font-black text-amber-600">{stats.pending}</p><p className="text-gray-500 text-[10px]">Pending</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Clock size={14} className="text-orange-600" /></div>
          <div><p className="text-lg font-black text-orange-600">{stats.pendingV}</p><p className="text-gray-500 text-[10px]">Pending-V</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle size={14} className="text-emerald-600" /></div>
          <div><p className="text-lg font-black text-emerald-600">{stats.completed}</p><p className="text-gray-500 text-[10px]">Completed</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle size={14} className="text-green-600" /></div>
          <div><p className="text-lg font-black text-green-600">{stats.verified}</p><p className="text-gray-500 text-[10px]">Verified</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center"><Smartphone size={14} className="text-cyan-600" /></div>
          <div><p className="text-lg font-black text-cyan-600">{typeStats.newCount}</p><p className="text-gray-500 text-[10px]">New</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><span className="text-purple-600 font-black text-xs">M</span></div>
          <div><p className="text-lg font-black text-purple-600">{typeStats.mnp}</p><p className="text-gray-500 text-[10px]">MNP</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><span className="text-amber-600 font-black text-xs">B</span></div>
          <div><p className="text-lg font-black text-amber-600">{typeStats.byn}</p><p className="text-gray-500 text-[10px]">BYN</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center"><span className="text-rose-600 font-black text-xs">R</span></div>
          <div><p className="text-lg font-black text-rose-600">{typeStats.repl}</p><p className="text-gray-500 text-[10px]">REPL</p></div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Sr.No, SIM, ICCID, Device, DSO/DSM, Retailer..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Issued", "Pending", "Pending-V", "Completed", "Verified"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                <span className="flex items-center gap-1.5"><Filter size={12} /> {s}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {["All", "New", "MNP", "BYN", "REPL"].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${typeFilter === t ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap sm:ml-auto">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-gray-500 text-xs">From:</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-gray-900 text-xs focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
              <span className="text-gray-500 text-xs">To:</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-gray-900 text-xs focus:outline-none" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-[#0A2647]/5 rounded-2xl px-5 py-3 border border-[#0A2647]/10">
          <CheckSquare size={16} className="text-[#0A2647]" />
          <span className="text-sm font-medium text-[#0A2647]">{selectedIds.length} SIM{selectedIds.length > 1 ? "s" : ""} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => { setBulkEditActive(true); const first = filteredList.find((s) => selectedIds.includes(s.id)); if (first) { const display = getDisplayStatus(first); setEditSIM(first); setEditForm({ network: first.network, status: first.status, notes: "", bvs: display.bvs, fca: display.fca, ifca: display.ifca, deviceId: first.deviceId || "", iccid: first.iccid || "", simType: first.type || "" }); } }} className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all flex items-center gap-1.5">
              <Pencil size={14} /> Edit Selected
            </button>
            <button onClick={() => setDeleteConfirm({ _bulk: true, count: selectedIds.length })} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-1.5">
              <Trash2 size={14} /> Delete Selected
            </button>
            <button onClick={() => setSelectedIds([])} className="px-3 py-2 text-gray-500 text-xs font-medium hover:text-gray-700 transition-all"><X size={14} /></button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-10 px-2 py-3 text-center"><input type="checkbox" checked={filteredList.length > 0 && selectedIds.length === filteredList.length} onChange={(e) => { if (e.target.checked) setSelectedIds(filteredList.map((s) => s.id)); else setSelectedIds([]); }} className="accent-[#0A2647] w-4 h-4 cursor-pointer" /></th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-10">Sr.No</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Retailer ID</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">SIM Number</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">ICCID</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Network</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Device ID</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">DSO/DSM ID</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">DSO/DSM Name</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">BVS</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">FCA</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">IFCA</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((sim, idx) => {
                const activation = getActivationForSIM(sim.simNumber);
                const { status: simStatus, bvs, fca, ifca } = getDisplayStatus(sim);
                const dsoId = sim.issuedToId || activation?.dsoId || "—";
                const dsoName = sim.issuedToName || getPersonName(dsoId);
                const retailerId = activation?.retailerId || getPersonRetailerId(dsoId);
                const dateStr = formatDate(activation?.createdAt || sim.receiveDate);
                const deviceId = sim.deviceId || "—";
                const simType = getSIMType(sim);

                return (
                  <tr key={sim.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-3 text-center">
                      <input type="checkbox" checked={selectedIds.includes(sim.id)} onChange={() => setSelectedIds((prev) => prev.includes(sim.id) ? prev.filter((id) => id !== sim.id) : [...prev, sim.id])} className="accent-[#0A2647] w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-mono">{retailerId}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 text-sm font-mono font-medium">{sim.simNumber}</p>
                      <p className="text-gray-400 text-[10px] font-mono">{sim.id}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs font-mono">{sim.iccid || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sim.network === "Jazz" ? "bg-red-50 text-red-600" : sim.network === "Telenor" ? "bg-blue-50 text-blue-600" : sim.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{sim.network}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-gray-500 text-xs font-mono">{deviceId}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-700 text-xs font-mono">{dsoId}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700 text-sm">{dsoName}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{dateStr}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${simStatus.startsWith("Verified") ? "bg-green-50 text-green-700" : simStatus.startsWith("Completed") ? "bg-emerald-50 text-emerald-700" : simStatus.startsWith("Pending-V") ? "bg-orange-50 text-orange-700" : simStatus === "Issued" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{simStatus}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${simType === "New" ? "bg-cyan-50 text-cyan-600" : simType === "MNP" ? "bg-purple-50 text-purple-600" : simType === "BYN" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>{simType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${bvs === "0" || bvs === "1" ? "bg-green-100 text-green-700" : bvs === "X" ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-400"}`}>{bvs}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${fca === "0" || fca === "1" ? "bg-green-100 text-green-700" : fca === "X" ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-400"}`}>{fca}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${ifca === "0" || ifca === "1" ? "bg-green-100 text-green-700" : ifca === "X" ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-400"}`}>{ifca}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewSIM({ sim, activation, simStatus, bvs, fca, ifca, dsoId, dsoName, retailerId, deviceId, dateStr, simType, srNo: idx + 1 })} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all" title="View"><Eye size={14} /></button>
                        <button onClick={() => { 
                          const display = getDisplayStatus(sim);
                          setEditSIM(sim); 
                          setEditForm({ 
                            network: sim.network, 
                            status: sim.status,
                            notes: "", 
                            bvs: display.bvs,
                            fca: display.fca,
                            ifca: display.ifca,
                            deviceId: sim.deviceId || "",
                            iccid: sim.iccid || "",
                            simType: sim.type || "",
                          }); 
                        }} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-all" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirm(sim)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredList.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Smartphone size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No SIMs found matching your filters</p>
          </div>
        )}
      </div>

      {viewSIM && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewSIM(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Eye size={18} /> SIM Details — #{viewSIM.srNo}</h3>
              <button onClick={() => setViewSIM(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">SIM Number</p><p className="text-gray-900 font-mono font-bold text-sm">{viewSIM.sim.simNumber}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">SIM Type</p><span className={`px-2 py-1 rounded-lg text-xs font-bold ${viewSIM.simType === "New" ? "bg-cyan-100 text-cyan-700" : viewSIM.simType === "MNP" ? "bg-purple-100 text-purple-700" : viewSIM.simType === "BYN" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{viewSIM.simType}</span></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Retailer ID</p><p className="text-gray-900 font-mono text-sm">{viewSIM.retailerId}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">ICCID</p><p className="text-gray-900 font-mono text-sm">{viewSIM.sim.iccid || "—"}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Network</p><p className="text-gray-900 text-sm font-bold">{viewSIM.sim.network}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Device ID</p><p className="text-gray-900 font-mono text-sm">{viewSIM.deviceId}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">DSO/DSM ID</p><p className="text-gray-900 font-mono text-sm">{viewSIM.dsoId}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">DSO/DSM Name</p><p className="text-gray-900 text-sm font-medium">{viewSIM.dsoName}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Date</p><p className="text-gray-900 text-sm">{viewSIM.dateStr}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Status</p><span className={`px-2 py-1 rounded-lg text-xs font-bold ${viewSIM.simStatus.startsWith("Verified") ? "bg-green-100 text-green-700" : viewSIM.simStatus.startsWith("Completed") ? "bg-emerald-100 text-emerald-700" : viewSIM.simStatus.startsWith("Pending-V") ? "bg-orange-100 text-orange-700" : viewSIM.simStatus === "Issued" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{viewSIM.simStatus}</span></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2 font-medium">Verification</p>
                <div className="flex gap-3">
                  <div className={`flex-1 text-center p-3 rounded-xl ${viewSIM.bvs === "0" || viewSIM.bvs === "1" ? "bg-green-100" : viewSIM.bvs === "X" ? "bg-gray-100" : "bg-red-50"}`}><p className={`text-2xl font-black ${viewSIM.bvs === "0" || viewSIM.bvs === "1" ? "text-green-700" : viewSIM.bvs === "X" ? "text-gray-400" : "text-red-400"}`}>{viewSIM.bvs}</p><p className="text-xs font-medium text-gray-500">BVS</p></div>
                  <div className={`flex-1 text-center p-3 rounded-xl ${viewSIM.fca === "0" || viewSIM.fca === "1" ? "bg-green-100" : viewSIM.fca === "X" ? "bg-gray-100" : "bg-red-50"}`}><p className={`text-2xl font-black ${viewSIM.fca === "0" || viewSIM.fca === "1" ? "text-green-700" : viewSIM.fca === "X" ? "text-gray-400" : "text-red-400"}`}>{viewSIM.fca}</p><p className="text-xs font-medium text-gray-500">FCA</p></div>
                  <div className={`flex-1 text-center p-3 rounded-xl ${viewSIM.ifca === "0" || viewSIM.ifca === "1" ? "bg-green-100" : viewSIM.ifca === "X" ? "bg-gray-100" : "bg-red-50"}`}><p className={`text-2xl font-black ${viewSIM.ifca === "0" || viewSIM.ifca === "1" ? "text-green-700" : viewSIM.ifca === "X" ? "text-gray-400" : "text-red-400"}`}>{viewSIM.ifca}</p><p className="text-xs font-medium text-gray-500">IFCA</p></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100"><button onClick={() => setViewSIM(null)} className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Close</button></div>
          </div>
        </div>
      )}

      {editSIM && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setEditSIM(null); setBulkEditActive(false); }}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Pencil size={18} /> {bulkEditActive ? `Edit ${selectedIds.length} SIMs` : "Edit SIM"}</h3>
              <button onClick={() => { setEditSIM(null); setBulkEditActive(false); }} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">SIM Number</p><p className="text-gray-900 font-mono font-bold text-sm">{bulkEditActive ? `Multiple SIMs (${selectedIds.length} selected)` : editSIM.simNumber}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Network</label>
                  <select value={editForm.network} onChange={(e) => setEditForm((p) => ({ ...p, network: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    <option value="Telenor">Telenor</option><option value="Jazz">Jazz</option><option value="Ufone">Ufone</option><option value="Zong">Zong</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    {bulkEditActive && <option value="">— No change —</option>}
                    <option value="Issued">Issued</option>
                    <option value="Active">Active</option>
                    <option value="Pending BVS">Pending BVS</option>
                    <option value="Pending FCA">Pending FCA</option>
                    <option value="Pending IFCA">Pending IFCA</option>
                    <option value="Completed">Completed</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending-V">Pending-V</option>
                    <option value="Returned">Returned</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Decommissioned">Decommissioned</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">SIM Category</label>
                <select value={editForm.simType || ""} onChange={(e) => setEditForm((p) => ({ ...p, simType: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  {bulkEditActive && <option value="">— No change —</option>}
                  <option value="new">New</option><option value="mnp">MNP</option><option value="byn">BYN</option><option value="replacement">REPL</option><option value="hlr">HLR</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Device ID</label>
                  <input type="text" value={editForm.deviceId} onChange={(e) => setEditForm((p) => ({ ...p, deviceId: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">ICCID</label>
                  <input type="text" value={editForm.iccid} onChange={(e) => setEditForm((p) => ({ ...p, iccid: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-500 text-xs font-medium mb-3">Verification Status</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-medium mb-1">BVS</label>
                    <select value={editForm.bvs} onChange={(e) => setEditForm((p) => ({ ...p, bvs: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                      {bulkEditActive && <option value="">— No change —</option>}
                      <option value="0">0 — Pending</option>
                      <option value="1">1 — Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-medium mb-1">FCA</label>
                    <select value={editForm.fca} onChange={(e) => setEditForm((p) => ({ ...p, fca: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                      {bulkEditActive && <option value="">— No change —</option>}
                      <option value="0">0 — Pending</option>
                      <option value="1">1 — Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-medium mb-1">IFCA</label>
                    <select value={editForm.ifca} onChange={(e) => setEditForm((p) => ({ ...p, ifca: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                      {bulkEditActive && <option value="">— No change —</option>}
                      <option value="0">0 — Pending</option>
                      <option value="1">1 — Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Notes</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 h-20 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setEditSIM(null); setBulkEditActive(false); }} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={async () => {
                try {
                  if (auth?.franchiseId) {
                    const targets = bulkEditActive
                      ? selectedIds.map((id) => {
                          const sim = allActivations.find((a) => a.simNumber === id) || sims.find((s) => s.id === id);
                          return sim;
                        }).filter(Boolean)
                      : [editSIM];
                    for (const sim of targets) {
                      if (!sim) continue;
                      const updatedSim = {
                        ...sim,
                        network: editForm.network || sim.network,
                        ...(editForm.status ? { status: editForm.status } : {}),
                        ...(editForm.simType ? { type: editForm.simType } : {}),
                        deviceId: editForm.deviceId || sim.deviceId,
                        iccid: editForm.iccid || sim.iccid,
                      };
                      await apiUpdate("sim", sim.id, updatedSim);
                    }
                  }
                } catch {}
                try {
                  if (auth?.franchiseId) {
                    const existingVerifications = await loadImportVerifications();
                    const targets = bulkEditActive
                      ? selectedIds.map((id) => { const sim = allActivations.find((a) => a.simNumber === id) || sims.find((s) => s.id === id); return sim?.simNumber; }).filter(Boolean)
                      : [editSIM.simNumber];
                    for (const simNum of targets) {
                      if (!simNum) continue;
                      const existing = existingVerifications[simNum] || {};
                      await apiSave("franchiseSimVerification", {
                        ...existing,
                        id: simNum,
                        simNumber: simNum,
                        bvs: editForm.bvs || existing.bvs || "0",
                        fca: editForm.fca || existing.fca || "0",
                        ifca: editForm.ifca || existing.ifca || "0",
                        verifiedAt: new Date().toISOString(),
                      });
                    }
                  }
                } catch {}
                setEditSIM(null); setBulkEditActive(false); setSelectedIds([]); window.location.reload();
              }} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] flex items-center justify-center gap-2"><Pencil size={14} /> {bulkEditActive ? `Update ${selectedIds.length} SIMs` : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-600" /></div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">{deleteConfirm._bulk ? `Delete ${deleteConfirm.count} SIM Records?` : "Delete SIM Record?"}</h3>
              {deleteConfirm._bulk ? (
                <p className="text-gray-500 text-sm">{deleteConfirm.count} selected SIM{deleteConfirm.count > 1 ? "s" : ""} will be permanently deleted.</p>
              ) : (
                <p className="text-gray-500 text-sm mb-1">SIM: <span className="font-mono font-bold">{deleteConfirm.simNumber}</span></p>
              )}
              <p className="text-gray-400 text-xs">This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={async () => {
                try {
                  if (deleteConfirm._bulk) {
                    for (const id of selectedIds) {
                      await apiDelete("sim", id);
                    }
                  } else {
                    await apiDelete("sim", deleteConfirm.id);
                  }
                } catch {}
                setDeleteConfirm(null); setSelectedIds([]); window.location.reload();
              }} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"><Trash2 size={14} /> {deleteConfirm._bulk ? `Delete ${deleteConfirm.count}` : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowImportModal(false); setImportRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A2647]/10 flex items-center justify-center"><FileSpreadsheet size={20} className="text-[#0A2647]" /></div>
                <div><h3 className="text-gray-900 font-bold">Import Verification File</h3><p className="text-gray-500 text-xs">Match by ICCID, SIM Number, Device ID, or Retailer ID</p></div>
              </div>
              <button onClick={() => { setShowImportModal(false); setImportRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-blue-800 text-sm font-medium mb-2">Format: ICCID, SIM Number, Device ID, Retailer ID, BVS, FCA, IFCA</p>
                <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                  <li>Match by <strong>ICCID</strong> OR <strong>SIM Number</strong> OR <strong>Device ID</strong> OR <strong>Retailer ID</strong></li>
                  <li>ICCID column will also be <strong>updated</strong> on matched SIM records</li>
                  <li>Use <code className="bg-blue-100 px-1 rounded">0</code> = Done, <code className="bg-blue-100 px-1 rounded">1</code> = Verified, leave empty to keep existing</li>
                  <li>All 0 → <strong>Completed</strong>, All 1 → <strong>Verified</strong>, Has X → <strong>Pending</strong></li>
                </ul>
                <button onClick={downloadSampleFile} className="mt-3 inline-flex items-center gap-1.5 text-blue-700 text-xs font-bold hover:underline"><Download size={12} /> Download Sample CSV</button>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0A2647]/50 hover:bg-gray-50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                  {importFile ? <div><p className="text-gray-900 text-sm font-medium">{importFile.name}</p><p className="text-gray-500 text-xs">{importRows.length} rows</p></div> : <div><p className="text-gray-600 text-sm">Click to upload CSV</p></div>}
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </div>
              {importError && <div className="bg-red-50 rounded-xl p-3 border border-red-200 flex items-center gap-2"><AlertCircle size={16} className="text-red-500" /><p className="text-red-700 text-sm">{importError}</p></div>}
              {importSuccess && <div className="bg-green-50 rounded-xl p-3 border border-green-200 flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /><p className="text-green-700 text-sm">{importSuccess}</p></div>}
              {importRows.length > 0 && (
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-2">Preview ({importRows.filter((r) => r.matched).length} matched)</p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0"><tr>
                        <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">ICCID</th>
                        <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">SIM Number</th>
                        <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">Device ID</th>
                        <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">Retailer ID</th>
                        <th className="text-center px-3 py-2 text-gray-500 text-xs font-medium">BVS</th>
                        <th className="text-center px-3 py-2 text-gray-500 text-xs font-medium">FCA</th>
                        <th className="text-center px-3 py-2 text-gray-500 text-xs font-medium">IFCA</th>
                        <th className="text-center px-3 py-2 text-gray-500 text-xs font-medium">Status</th>
                      </tr></thead>
                      <tbody>
                        {importRows.map((row, i) => (
                          <tr key={i} className={`border-t border-gray-100 ${row.matched ? "bg-green-50/50" : "bg-red-50/50"}`}>
                            <td className="px-3 py-2 text-gray-700 text-xs font-mono">{row.iccid || "—"}</td>
                            <td className="px-3 py-2 text-gray-700 text-xs font-mono">{row.simNumber || "—"}</td>
                            <td className="px-3 py-2 text-gray-700 text-xs font-mono">{row.deviceId || "—"}</td>
                            <td className="px-3 py-2 text-gray-700 text-xs font-mono">{row.retailerId || "—"}</td>
                            <td className="px-3 py-2 text-center"><span className={`text-xs font-bold ${row.bvs === "1" ? "text-green-600" : "text-gray-400"}`}>{row.bvs}</span></td>
                            <td className="px-3 py-2 text-center"><span className={`text-xs font-bold ${row.fca === "1" ? "text-green-600" : "text-gray-400"}`}>{row.fca}</span></td>
                            <td className="px-3 py-2 text-center"><span className={`text-xs font-bold ${row.ifca === "1" ? "text-green-600" : "text-gray-400"}`}>{row.ifca}</span></td>
                            <td className="px-3 py-2 text-center">
                              {row.matched ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">Matched ({row.matchType})</span> : <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Not Found</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setShowImportModal(false); setImportRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleImport} disabled={importRows.length === 0 || importRows.filter((r) => r.matched).length === 0} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Upload size={14} /> Import {importRows.filter((r) => r.matched).length} Records</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
