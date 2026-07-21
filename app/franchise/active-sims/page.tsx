"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Filter, Smartphone, CheckCircle, Clock, Package, Upload, Download, X, FileSpreadsheet, AlertCircle, FileDown, Eye, Pencil, Trash2, Calendar, CheckSquare } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { apiLoad, apiSave, apiUpdate, apiDelete } from "@/lib/api";

interface Activation { id: string; type: string; simNumber: string; status: string; bvsStatus: string; fcaStatus: string; ifcaStatus: string; dsoId: string; retailerId: string; createdAt: string; franchiseId: string; }

interface ImportRow {
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
    try { await apiSave("franchiseSimVerification", verification); } catch {}
  }
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["\s]/g, ""));
  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/["']/g, ""));
    if (cols.length < 4) continue;
    const deviceIdIdx = headers.findIndex((h) => h.includes("device") && h.includes("id"));
    const retailerIdx = headers.findIndex((h) => h.includes("retailer"));
    const simNumIdx = headers.findIndex((h) => h.includes("sim") && h.includes("number"));
    const bvsIdx = headers.findIndex((h) => h.includes("bvs"));
    const fcaIdx = headers.findIndex((h) => h.includes("fca"));
    const ifcaIdx = headers.findIndex((h) => h.includes("ifca"));
    rows.push({
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
  return `SIM Number,Device ID,Retailer ID,BVS,FCA,IFCA
0341-1111111,NRWP-1217-841,03001234567,1,1,1
0301-2222222,NRWP-1217-842,03001234568,1,1,0
0331-3333333,,03001234569,1,0,0`;
}

interface SIMUpdateRow {
  iccid: string;
  network?: string;
  status?: string;
  deviceId?: string;
  simNumber?: string;
  matched?: boolean;
  matchedSimId?: string;
  matchedSimNumber?: string;
}

function parseSIMUpdateCSV(text: string): SIMUpdateRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["\s]/g, ""));
  const rows: SIMUpdateRow[] = [];
  const iccidIdx = headers.findIndex((h) => h.includes("iccid"));
  const networkIdx = headers.findIndex((h) => h.includes("network"));
  const statusIdx = headers.findIndex((h) => h.includes("status"));
  const deviceIdIdx = headers.findIndex((h) => (h.includes("device") && h.includes("id")) || h === "deviceid");
  const simNumIdx = headers.findIndex((h) => (h.includes("sim") && h.includes("number")) || h === "simnumber");
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/["']/g, ""));
    if (cols.length < 1) continue;
    const iccid = iccidIdx >= 0 ? cols[iccidIdx] : "";
    if (!iccid) continue;
    rows.push({
      iccid,
      network: networkIdx >= 0 ? cols[networkIdx] : undefined,
      status: statusIdx >= 0 ? cols[statusIdx] : undefined,
      deviceId: deviceIdIdx >= 0 ? cols[deviceIdIdx] : undefined,
      simNumber: simNumIdx >= 0 ? cols[simNumIdx] : undefined,
    });
  }
  return rows;
}

function generateSIMUpdateSampleCSV(): string {
  return `ICCID,Network,Status,Device ID
89920387654321098765,Jazz,Active,NRWP-1217-841
89920387654321098766,Telenor,Verified,NRWP-1217-842`;
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

function downloadSIMUpdateSampleFile() {
  const csv = generateSIMUpdateSampleCSV();
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sim-update-import-sample.csv";
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
  const [importMode, setImportMode] = useState<"verification" | "simUpdate">("verification");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [simUpdateRows, setSimUpdateRows] = useState<SIMUpdateRow[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewSIM, setViewSIM] = useState<any>(null);
  const [editSIM, setEditSIM] = useState<any>(null);
  const [editForm, setEditForm] = useState({ network: "", status: "", notes: "", bvs: "", fca: "", ifca: "", deviceId: "", iccid: "" });
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
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", onVisibility); };
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

  const getDerivedStatus = (pending: string[]) => {
    if (pending.length === 0) return "Completed";
    return `Pending ${pending.join(", ")} (${pending.length})`;
  };

  const getDisplayStatus = (sim: any): { status: string; bvs: string; fca: string; ifca: string } => {
    const activation = getActivationForSIM(sim.simNumber);
    if (!activation) return { status: "Issued", bvs: "X", fca: "X", ifca: "X" };
    const imp = importVerifications[sim.simNumber];
    if (imp) {
      const bvs = imp.bvs;
      const fca = imp.fca;
      const ifcaV = imp.ifca;
      const done: string[] = [];
      const pending: string[] = [];
      if (bvs === "1") done.push("BVS"); else pending.push("BVS");
      if (fca === "1") done.push("FCA"); else pending.push("FCA");
      if (ifcaV === "1") done.push("IFCA"); else pending.push("IFCA");
      const status = pending.length === 0 ? "Verified" : done.length === 0 ? "Active" : "Pending-V";
      return { status, bvs, fca, ifca: ifcaV };
    }
    const bvs = vcFromActivation(activation.bvsStatus);
    const fca = vcFromActivation(activation.fcaStatus);
    const ifcaV = vcFromActivation(activation.ifcaStatus);
    const pending: string[] = [];
    if (bvs === "X") pending.push("BVS");
    if (fca === "X") pending.push("FCA");
    if (ifcaV === "X") pending.push("IFCA");
    const status = getDerivedStatus(pending);
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
        (statusFilter === "Pending" ? (status === "Active" || status === "Pending-V") : status === statusFilter);
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
  }, [activeSIMs, search, statusFilter, typeFilter, dateFrom, dateTo, allActivations]);

  const stats = useMemo(() => {
    let issued = 0, active = 0, verified = 0, pending = 0;
    activeSIMs.forEach((s) => { const { status } = getDisplayStatus(s); if (status === "Issued") issued++; else if (status === "Active" || status === "Pending-V") pending++; else if (status === "Verified") verified++; else active++; });
    return { total: activeSIMs.length, issued, active, verified, pending };
  }, [activeSIMs, allActivations]);

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
        let matchType: "deviceId" | "retailerId" | "simNumber" = "simNumber";
        if (row.simNumber) {
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
        return { ...row, matched: !!foundSim, matchType: foundSim ? matchType : undefined, matchedSimNumber: foundSim?.simNumber };
      });
      setImportRows(matched);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const matchedRows = importRows.filter((r) => r.matched);
    if (matchedRows.length === 0) { setImportError("No matching SIMs found."); return; }
    const verifications = await loadImportVerifications();
    let updatedCount = 0;
    for (const row of matchedRows) {
      const simNum = row.matchedSimNumber || row.simNumber;
      if (!simNum) continue;
      verifications[simNum] = {
        simNumber: simNum,
        bvs: row.bvs === "1" ? "1" : "0",
        fca: row.fca === "1" ? "1" : "0",
        ifca: row.ifca === "1" ? "1" : "0",
        verifiedAt: new Date().toISOString(),
      };
      updatedCount++;
    }
    await saveImportVerifications(verifications);
    setImportSuccess(`Imported ${updatedCount} records. BVS/FCA/IFCA updated.`);
    setImportRows([]); setImportFile(null);
    setTimeout(() => { setShowImportModal(false); setImportSuccess(""); window.location.reload(); }, 2000);
  };

  const handleSIMUpdateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(""); setImportSuccess(""); setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseSIMUpdateCSV(text);
      if (rows.length === 0) { setImportError("No valid rows found. Check file has ICCID column."); return; }
      const matched = rows.map((row) => {
        const foundSim = sims.find((s) => s.iccid && s.iccid.toLowerCase() === row.iccid.toLowerCase());
        return { ...row, matched: !!foundSim, matchedSimId: foundSim?.id, matchedSimNumber: foundSim?.simNumber };
      });
      setSimUpdateRows(matched);
    };
    reader.readAsText(file);
  };

  const handleSIMUpdateImport = async () => {
    const matchedRows = simUpdateRows.filter((r) => r.matched);
    if (matchedRows.length === 0) { setImportError("No matching SIMs found by ICCID."); return; }
    let updatedCount = 0;
    for (const row of matchedRows) {
      if (!row.matchedSimId) continue;
      const existing = sims.find((s) => s.id === row.matchedSimId);
      if (!existing) continue;
      const updates: any = {};
      if (row.network && row.network !== existing.network) updates.network = row.network;
      if (row.status && row.status !== existing.status) updates.status = row.status;
      if (row.deviceId && row.deviceId !== existing.deviceId) updates.deviceId = row.deviceId;
      if (Object.keys(updates).length > 0) {
        await apiUpdate("sim", row.matchedSimId, { ...existing, ...updates });
        updatedCount++;
      }
    }
    setImportSuccess(`Updated ${updatedCount} SIM records by ICCID match.`);
    setSimUpdateRows([]); setImportFile(null);
    setTimeout(() => { setShowImportModal(false); setImportSuccess(""); window.location.reload(); }, 2000);
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
          <div><p className="text-lg font-black text-amber-600">{stats.active}</p><p className="text-gray-500 text-[10px]">Active</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Clock size={14} className="text-orange-600" /></div>
          <div><p className="text-lg font-black text-orange-600">{stats.pending}</p><p className="text-gray-500 text-[10px]">Pending</p></div>
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
            {["All", "Issued", "Active", "Pending", "Verified"].map((s) => (
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
            <button onClick={() => { setBulkEditActive(true); const first = filteredList.find((s) => selectedIds.includes(s.id)); if (first) { const display = getDisplayStatus(first); setEditSIM(first); setEditForm({ network: first.network, status: first.status, notes: "", bvs: display.bvs, fca: display.fca, ifca: display.ifca, deviceId: first.deviceId || "", iccid: first.iccid || "" }); } }} className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all flex items-center gap-1.5">
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
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${simStatus === "Verified" ? "bg-green-50 text-green-700" : simStatus === "Completed" ? "bg-emerald-50 text-emerald-700" : simStatus === "Active" ? "bg-gray-100 text-gray-600" : simStatus === "Pending-V" ? "bg-amber-50 text-amber-700" : "bg-amber-50 text-amber-700"}`}>{simStatus}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${simType === "New" ? "bg-cyan-50 text-cyan-600" : simType === "MNP" ? "bg-purple-50 text-purple-600" : simType === "BYN" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>{simType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${bvs === "1" || bvs === "0" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-400"}`}>{bvs}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${fca === "1" || fca === "0" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-400"}`}>{fca}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${ifca === "1" || ifca === "0" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-400"}`}>{ifca}</span>
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
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Status</p><span className={`px-2 py-1 rounded-lg text-xs font-bold ${viewSIM.simStatus === "Verified" ? "bg-green-100 text-green-700" : viewSIM.simStatus === "Completed" ? "bg-emerald-100 text-emerald-700" : viewSIM.simStatus === "Active" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-700"}`}>{viewSIM.simStatus}</span></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2 font-medium">Verification</p>
                <div className="flex gap-3">
                  <div className={`flex-1 text-center p-3 rounded-xl ${viewSIM.bvs === "1" || viewSIM.bvs === "0" ? "bg-green-100" : "bg-red-50"}`}><p className={`text-2xl font-black ${viewSIM.bvs === "1" || viewSIM.bvs === "0" ? "text-green-700" : "text-red-400"}`}>{viewSIM.bvs}</p><p className="text-xs font-medium text-gray-500">BVS</p></div>
                  <div className={`flex-1 text-center p-3 rounded-xl ${viewSIM.fca === "1" || viewSIM.fca === "0" ? "bg-green-100" : "bg-red-50"}`}><p className={`text-2xl font-black ${viewSIM.fca === "1" || viewSIM.fca === "0" ? "text-green-700" : "text-red-400"}`}>{viewSIM.fca}</p><p className="text-xs font-medium text-gray-500">FCA</p></div>
                  <div className={`flex-1 text-center p-3 rounded-xl ${viewSIM.ifca === "1" || viewSIM.ifca === "0" ? "bg-green-100" : "bg-red-50"}`}><p className={`text-2xl font-black ${viewSIM.ifca === "1" || viewSIM.ifca === "0" ? "text-green-700" : "text-red-400"}`}>{viewSIM.ifca}</p><p className="text-xs font-medium text-gray-500">IFCA</p></div>
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
                    <option value="Issued">Issued</option><option value="Active">Active</option><option value="Verified">Verified</option>
                  </select>
                </div>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowImportModal(false); setImportRows([]); setSimUpdateRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A2647]/10 flex items-center justify-center"><FileSpreadsheet size={20} className="text-[#0A2647]" /></div>
                <div><h3 className="text-gray-900 font-bold">Import CSV</h3><p className="text-gray-500 text-xs">Choose import type below</p></div>
              </div>
              <button onClick={() => { setShowImportModal(false); setImportRows([]); setSimUpdateRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                <button onClick={() => { setImportMode("verification"); setImportRows([]); setSimUpdateRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${importMode === "verification" ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}>Verification (BVS/FCA/IFCA)</button>
                <button onClick={() => { setImportMode("simUpdate"); setImportRows([]); setSimUpdateRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${importMode === "simUpdate" ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}>SIM Update (by ICCID)</button>
              </div>

              {importMode === "verification" ? (
                <>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-blue-800 text-sm font-medium mb-2">Format: SIM Number, Device ID, Retailer ID, BVS, FCA, IFCA</p>
                    <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                      <li>Match by <strong>SIM Number</strong> OR <strong>Device ID</strong> OR <strong>Retailer ID</strong></li>
                      <li>Use <code className="bg-blue-100 px-1 rounded">1</code> for done, <code className="bg-blue-100 px-1 rounded">0</code> for pending</li>
                      <li>When BVS=1, FCA=1, IFCA=1 → Status becomes <strong>Verified</strong></li>
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
                </>
              ) : (
                <>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-purple-800 text-sm font-medium mb-2">Format: ICCID, Network, Status, Device ID</p>
                    <ul className="text-purple-700 text-xs space-y-1 list-disc list-inside">
                      <li>Match by <strong>ICCID</strong> (required column)</li>
                      <li>Optional fields: Network, Status, Device ID — only changed fields are updated</li>
                      <li>Leave a field empty to keep the existing value</li>
                    </ul>
                    <button onClick={downloadSIMUpdateSampleFile} className="mt-3 inline-flex items-center gap-1.5 text-purple-700 text-xs font-bold hover:underline"><Download size={12} /> Download Sample CSV</button>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Upload File</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0A2647]/50 hover:bg-gray-50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                      {importFile ? <div><p className="text-gray-900 text-sm font-medium">{importFile.name}</p><p className="text-gray-500 text-xs">{simUpdateRows.length} rows</p></div> : <div><p className="text-gray-600 text-sm">Click to upload CSV</p></div>}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleSIMUpdateFileUpload} className="hidden" />
                  </div>
                  {importError && <div className="bg-red-50 rounded-xl p-3 border border-red-200 flex items-center gap-2"><AlertCircle size={16} className="text-red-500" /><p className="text-red-700 text-sm">{importError}</p></div>}
                  {importSuccess && <div className="bg-green-50 rounded-xl p-3 border border-green-200 flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /><p className="text-green-700 text-sm">{importSuccess}</p></div>}
                  {simUpdateRows.length > 0 && (
                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-2">Preview ({simUpdateRows.filter((r) => r.matched).length} matched by ICCID)</p>
                      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0"><tr>
                            <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">ICCID</th>
                            <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">Network</th>
                            <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">Status</th>
                            <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">Device ID</th>
                            <th className="text-left px-3 py-2 text-gray-500 text-xs font-medium">SIM Number</th>
                            <th className="text-center px-3 py-2 text-gray-500 text-xs font-medium">Match</th>
                          </tr></thead>
                          <tbody>
                            {simUpdateRows.map((row, i) => (
                              <tr key={i} className={`border-t border-gray-100 ${row.matched ? "bg-green-50/50" : "bg-red-50/50"}`}>
                                <td className="px-3 py-2 text-gray-700 text-xs font-mono">{row.iccid}</td>
                                <td className="px-3 py-2 text-gray-700 text-xs">{row.network || "—"}</td>
                                <td className="px-3 py-2 text-gray-700 text-xs">{row.status || "—"}</td>
                                <td className="px-3 py-2 text-gray-700 text-xs font-mono">{row.deviceId || "—"}</td>
                                <td className="px-3 py-2 text-gray-700 text-xs font-mono">{row.matchedSimNumber || "—"}</td>
                                <td className="px-3 py-2 text-center">
                                  {row.matched ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">Matched</span> : <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Not Found</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setShowImportModal(false); setImportRows([]); setSimUpdateRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              {importMode === "verification" ? (
                <button onClick={handleImport} disabled={importRows.length === 0 || importRows.filter((r) => r.matched).length === 0} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Upload size={14} /> Import {importRows.filter((r) => r.matched).length} Records</button>
              ) : (
                <button onClick={handleSIMUpdateImport} disabled={simUpdateRows.length === 0 || simUpdateRows.filter((r) => r.matched).length === 0} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Upload size={14} /> Update {simUpdateRows.filter((r) => r.matched).length} SIMs</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
