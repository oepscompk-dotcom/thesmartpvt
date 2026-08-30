"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Smartphone, CheckCircle, Clock, Package, Upload, Download, X, FileSpreadsheet, AlertCircle, FileDown, Eye, Pencil, Trash2, Calendar, CheckSquare, ArrowLeftRight, Tag, RefreshCcw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, toneForStatus, QuickChip } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
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
  if (!dateStr) return "â€”";
  const datePart = dateStr.split(" ")[0].split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export default function ActiveSIMsPage() {
  const { sims, dso, dsms, auth, generateSIMMilestones } = useFranchiseData();
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
    if (!dsoId || dsoId === "â€”") return "â€”";
    const foundDso = dso.find((d) => d.id === dsoId);
    if (foundDso) return foundDso.name;
    const foundDsm = dsms.find((d) => d.id === dsoId);
    if (foundDsm) return foundDsm.name;
    return dsoId;
  };

  const getPersonRetailerId = (dsoId: string) => {
    if (!dsoId || dsoId === "â€”") return "â€”";
    const foundDso = dso.find((d) => d.id === dsoId);
    if (foundDso) return foundDso.retailerId || "â€”";
    const foundDsm = dsms.find((d) => d.id === dsoId);
    if (foundDsm) return foundDsm.retailerId || "â€”";
    return "â€”";
  };

  const getActivationForSIM = (simNumber: string) => allActivations.find((a) => a.simNumber === simNumber);

  const vcFromActivation = (v: string) => v === "Completed" ? "0" : "X";

  const getDisplayStatus = (sim: any): { status: string; bvs: string; fca: string; ifca: string } => {
    const imp = importVerifications[sim.simNumber];
    const activation = getActivationForSIM(sim.simNumber);
    const actBvs = activation ? vcFromActivation(activation.bvsStatus) : "X";
    const actFca = activation ? vcFromActivation(activation.fcaStatus) : "X";
    const actIfca = activation ? vcFromActivation(activation.ifcaStatus) : "X";
    const pick = (impV: string | undefined, actV: string) =>
      impV === "1" ? "1" : actV === "0" ? "0" : impV === "0" ? "0" : "X";
    let bvs = pick(imp?.bvs, actBvs);
    let fca = pick(imp?.fca, actFca);
    let ifcaV = pick(imp?.ifca, actIfca);
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

  const mapSaleType = (t: string): "New" | "HLR-MNP" | "HLR-Replace" | "HLR-BYN" => {
    if (t === "New") return "New";
    if (t === "MNP") return "HLR-MNP";
    if (t === "BYN") return "HLR-BYN";
    if (t === "REPL") return "HLR-Replace";
    return "HLR-MNP";
  };

  const autoGenerateSale = async (sim: any, activation: any, stages: { bvs: string; fca: string; ifca: string }) => {
    try {
      const bvs = stages.bvs || "0";
      const fca = stages.fca || "0";
      const ifca = stages.ifca || "0";
      if (bvs !== "1" && fca !== "1" && ifca !== "1") return;
      const simType = mapSaleType(getSIMType(sim));
      const staffId = sim.issuedToId || activation?.dsoId || "";
      if (!staffId) return;
      const isDsm = dsms.some((d) => d.id === staffId) || sim.issuedToRole === "DSM";
      const isDso = dso.some((d) => d.id === staffId) || sim.issuedToRole === "DSO";
      const role = isDsm ? "DSM" : isDso ? "DSO" : "";
      if (!role) return;
      const name = sim.issuedToName || getPersonName(staffId) || staffId;
      await generateSIMMilestones({
        simNumber: sim.simNumber,
        network: sim.network || "",
        simType,
        supplier: simType === "New" ? sim.network : "Default",
        staff: { id: staffId, role: role as "DSO" | "DSM", name },
        stages: { BVS: bvs, FCA: fca, IFCA: ifca },
      });
    } catch (e) {
      console.error("autoGenerateSale error:", e);
    }
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

  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter, dateFrom, dateTo]);
  const PAGE_SIZE = 10;
  const pageCount = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const pagedList = useMemo(() => filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredList, page]);

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
      const newBvs = row.bvs === "0" || row.bvs === "1" || row.bvs === "X" ? row.bvs : (prev.bvs || "X");
      const newFca = row.fca === "0" || row.fca === "1" || row.fca === "X" ? row.fca : (prev.fca || "X");
      const newIfca = row.ifca === "0" || row.ifca === "1" || row.ifca === "X" ? row.ifca : (prev.ifca || "X");
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
    for (const row of matchedRows) {
      const simNum = row.matchedSimNumber || row.simNumber;
      if (!simNum || !localVerifications[simNum]) continue;
      const freshSim = activeSIMs.find((s) => s.simNumber === simNum);
      const activation = freshActivations.find((a) => a.simNumber === simNum);
      if (freshSim) {
        await autoGenerateSale(freshSim, activation, {
          bvs: localVerifications[simNum].bvs || "0",
          fca: localVerifications[simNum].fca || "0",
          ifca: localVerifications[simNum].ifca || "0",
        });
      }
    }
    setTimeout(() => { setShowImportModal(false); setImportSuccess(""); }, 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Active SIMs" }]}
        title="Active SIMs"
        description={`All issued, active and verified SIMs (${activeSIMs.length} total)`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                const exportData = filteredList.map((sim, idx) => {
                  const { status, bvs, fca, ifca } = getDisplayStatus(sim);
                  const activation = getActivationForSIM(sim.simNumber);
                  const dsoId = sim.issuedToId || activation?.dsoId || "â€”";
                  const dsoName = sim.issuedToName || getPersonName(dsoId);
                  const retailerId = activation?.retailerId || getPersonRetailerId(dsoId);
                  return { srNo: idx + 1, retailerId, simNumber: sim.simNumber, iccid: sim.iccid || "â€”", network: sim.network,
                    deviceId: sim.deviceId || "â€”", dsoId, dsoName, date: formatDate(activation?.createdAt || sim.receiveDate),
                    status, simType: getSIMType(sim), bvs, fca, ifca };
                });
                exportToCSV(exportData, `active-sims-${new Date().toISOString().split("T")[0]}.csv`);
              }}
            >
              <FileDown size={16} /> Export
            </Button>
            <Button onClick={() => setShowImportModal(true)}>
              <Upload size={16} /> Import
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total" value={stats.total} icon={Package} />
        <StatCard label="Issued" value={stats.issued} icon={Clock} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Pending" value={stats.pending} icon={AlertCircle} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Pending-V" value={stats.pendingV} icon={Clock} iconClass="text-orange-600 bg-orange-50" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} iconClass="text-emerald-600 bg-emerald-50" />
        <StatCard label="Verified" value={stats.verified} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
        <StatCard label="New" value={typeStats.newCount} icon={Smartphone} iconClass="text-cyan-600 bg-cyan-50" />
        <StatCard label="MNP" value={typeStats.mnp} icon={ArrowLeftRight} iconClass="text-purple-600 bg-purple-50" />
        <StatCard label="BYN" value={typeStats.byn} icon={Tag} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="REPL" value={typeStats.repl} icon={RefreshCcw} iconClass="text-rose-600 bg-rose-50" />
      </div>

      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput
              placeholder="Search by Sr.No, SIM, ICCID, Device, DSO/DSM, Retailer..."
              value={search}
              onChange={(v) => setSearch(v)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Issued", "Pending", "Pending-V", "Completed", "Verified"].map((s) => (
                <QuickChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "New", "MNP", "BYN", "REPL"].map((t) => (
                <QuickChip key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">From:</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-xs text-foreground focus:outline-none" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">To:</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-xs text-foreground focus:outline-none" />
              </div>
              {(dateFrom || dateTo) && (
                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3">
          <CheckSquare className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-medium text-brand-700">{selectedIds.length} SIM{selectedIds.length > 1 ? "s" : ""} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setBulkEditActive(true); const first = filteredList.find((s) => selectedIds.includes(s.id)); if (first) { const display = getDisplayStatus(first); setEditSIM(first); setEditForm({ network: first.network, status: first.status, notes: "", bvs: display.bvs, fca: display.fca, ifca: display.ifca, deviceId: first.deviceId || "", iccid: first.iccid || "", simType: first.type || "" }); } }}>
              <Pencil className="h-4 w-4" /> Edit Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm({ _bulk: true, count: selectedIds.length })}>
              <Trash2 className="h-4 w-4" /> Delete Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle>Active SIM Records</CardTitle>
          <span className="text-sm text-muted-foreground">{filteredList.length} of {activeSIMs.length}</span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="w-10 px-2 py-3 text-center"><input type="checkbox" checked={filteredList.length > 0 && selectedIds.length === filteredList.length} onChange={(e) => { if (e.target.checked) setSelectedIds(filteredList.map((s) => s.id)); else setSelectedIds([]); }} className="h-4 w-4 cursor-pointer accent-brand-600" /></th>
                  <th className="w-10 px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Sr.No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Retailer ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">SIM Number</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">ICCID</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Network</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">Device ID</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">DSO/DSM ID</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">DSO/DSM Name</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">BVS</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">FCA</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">IFCA</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedList.map((sim, idx) => {
                const activation = getActivationForSIM(sim.simNumber);
                const { status: simStatus, bvs, fca, ifca } = getDisplayStatus(sim);
                const dsoId = sim.issuedToId || activation?.dsoId || "â€”";
                const dsoName = sim.issuedToName || getPersonName(dsoId);
                const retailerId = activation?.retailerId || getPersonRetailerId(dsoId);
                const dateStr = formatDate(activation?.createdAt || sim.receiveDate);
                const deviceId = sim.deviceId || "â€”";
                const simType = getSIMType(sim);
                const srNo = (page - 1) * PAGE_SIZE + idx + 1;

                return (
                  <tr key={sim.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-2 py-3 text-center">
                      <input type="checkbox" checked={selectedIds.includes(sim.id)} onChange={() => setSelectedIds((prev) => prev.includes(sim.id) ? prev.filter((id) => id !== sim.id) : [...prev, sim.id])} className="h-4 w-4 cursor-pointer accent-brand-600" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">{srNo}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{retailerId}</td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm font-medium text-foreground">{sim.simNumber}</p>
                      <p className="font-mono text-xs text-muted-foreground">{sim.id}</p>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">{sim.iccid || "â€”"}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${sim.network === "Jazz" ? "bg-red-50 text-red-600" : sim.network === "Telenor" ? "bg-blue-50 text-blue-600" : sim.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{sim.network}</span>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground xl:table-cell">{deviceId}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">{dsoId}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="text-sm text-foreground">{dsoName}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{dateStr}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusPill label={simStatus} tone={toneForStatus(simStatus)} />
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${simType === "New" ? "bg-cyan-50 text-cyan-600" : simType === "MNP" ? "bg-purple-50 text-purple-600" : simType === "BYN" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>{simType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${bvs === "0" || bvs === "1" ? "bg-green-100 text-green-700" : bvs === "X" ? "bg-slate-100 text-slate-400" : "bg-red-50 text-red-400"}`}>{bvs}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${fca === "0" || fca === "1" ? "bg-green-100 text-green-700" : fca === "X" ? "bg-slate-100 text-slate-400" : "bg-red-50 text-red-400"}`}>{fca}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${ifca === "0" || ifca === "1" ? "bg-green-100 text-green-700" : ifca === "X" ? "bg-slate-100 text-slate-400" : "bg-red-50 text-red-400"}`}>{ifca}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewSIM({ sim, activation, simStatus, bvs, fca, ifca, dsoId, dsoName, retailerId, deviceId, dateStr, simType, srNo })} className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50" title="View"><Eye className="h-4 w-4" /></button>
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
                        }} className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-50" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteConfirm(sim)} className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={pageCount} onChange={setPage} />
        {filteredList.length === 0 && (
          <EmptyState icon={Smartphone} title="No SIMs found" description="No SIMs found matching your filters." />
        )}
        </CardContent>
      </Card>

      {viewSIM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setViewSIM(null)}>
          <Card className="w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Eye className="h-4 w-4" /> SIM Details â€” #{viewSIM.srNo}</h3>
              <button onClick={() => setViewSIM(null)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">SIM Number</p><p className="font-mono text-sm font-semibold text-foreground">{viewSIM.sim.simNumber}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">SIM Type</p><span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${viewSIM.simType === "New" ? "bg-cyan-100 text-cyan-700" : viewSIM.simType === "MNP" ? "bg-purple-100 text-purple-700" : viewSIM.simType === "BYN" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{viewSIM.simType}</span></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Retailer ID</p><p className="font-mono text-sm text-foreground">{viewSIM.retailerId}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">ICCID</p><p className="font-mono text-sm text-foreground">{viewSIM.sim.iccid || "â€”"}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Network</p><p className="text-sm font-semibold text-foreground">{viewSIM.sim.network}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Device ID</p><p className="font-mono text-sm text-foreground">{viewSIM.deviceId}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">DSO/DSM ID</p><p className="font-mono text-sm text-foreground">{viewSIM.dsoId}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">DSO/DSM Name</p><p className="text-sm font-medium text-foreground">{viewSIM.dsoName}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Date</p><p className="text-sm text-foreground">{viewSIM.dateStr}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Status</p><StatusPill label={viewSIM.simStatus} tone={toneForStatus(viewSIM.simStatus)} /></div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Verification</p>
                <div className="flex gap-3">
                  <div className={`flex-1 rounded-lg p-3 text-center ${viewSIM.bvs === "0" || viewSIM.bvs === "1" ? "bg-green-100" : viewSIM.bvs === "X" ? "bg-slate-100" : "bg-red-50"}`}><p className={`text-2xl font-bold ${viewSIM.bvs === "0" || viewSIM.bvs === "1" ? "text-green-700" : viewSIM.bvs === "X" ? "text-slate-400" : "text-red-400"}`}>{viewSIM.bvs}</p><p className="text-xs font-medium text-muted-foreground">BVS</p></div>
                  <div className={`flex-1 rounded-lg p-3 text-center ${viewSIM.fca === "0" || viewSIM.fca === "1" ? "bg-green-100" : viewSIM.fca === "X" ? "bg-slate-100" : "bg-red-50"}`}><p className={`text-2xl font-bold ${viewSIM.fca === "0" || viewSIM.fca === "1" ? "text-green-700" : viewSIM.fca === "X" ? "text-slate-400" : "text-red-400"}`}>{viewSIM.fca}</p><p className="text-xs font-medium text-muted-foreground">FCA</p></div>
                  <div className={`flex-1 rounded-lg p-3 text-center ${viewSIM.ifca === "0" || viewSIM.ifca === "1" ? "bg-green-100" : viewSIM.ifca === "X" ? "bg-slate-100" : "bg-red-50"}`}><p className={`text-2xl font-bold ${viewSIM.ifca === "0" || viewSIM.ifca === "1" ? "text-green-700" : viewSIM.ifca === "X" ? "text-slate-400" : "text-red-400"}`}>{viewSIM.ifca}</p><p className="text-xs font-medium text-muted-foreground">IFCA</p></div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="w-full" onClick={() => setViewSIM(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}

      {editSIM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => { setEditSIM(null); setBulkEditActive(false); }}>
          <Card className="w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Pencil className="h-4 w-4" /> {bulkEditActive ? `Edit ${selectedIds.length} SIMs` : "Edit SIM"}</h3>
              <button onClick={() => { setEditSIM(null); setBulkEditActive(false); }} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">SIM Number</p><p className="font-mono text-sm font-semibold text-foreground">{bulkEditActive ? `Multiple SIMs (${selectedIds.length} selected)` : editSIM.simNumber}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Network</label>
                  <select value={editForm.network} onChange={(e) => setEditForm((p) => ({ ...p, network: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                    <option value="Telenor">Telenor</option><option value="Jazz">Jazz</option><option value="Ufone">Ufone</option><option value="Zong">Zong</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                    {bulkEditActive && <option value="">â€” No change â€”</option>}
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
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">SIM Category</label>
                <select value={editForm.simType || ""} onChange={(e) => setEditForm((p) => ({ ...p, simType: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                  {bulkEditActive && <option value="">â€” No change â€”</option>}
                  <option value="new">New</option><option value="mnp">MNP</option><option value="byn">BYN</option><option value="replacement">REPL</option><option value="hlr">HLR</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Device ID</label>
                  <input type="text" value={editForm.deviceId} onChange={(e) => setEditForm((p) => ({ ...p, deviceId: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ICCID</label>
                  <input type="text" value={editForm.iccid} onChange={(e) => setEditForm((p) => ({ ...p, iccid: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Verification Status</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-muted-foreground">BVS</label>
                    <select value={editForm.bvs} onChange={(e) => setEditForm((p) => ({ ...p, bvs: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                      {bulkEditActive && <option value="">â€” No change â€”</option>}
                      <option value="0">0 â€” Pending</option>
                      <option value="1">1 â€” Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-muted-foreground">FCA</label>
                    <select value={editForm.fca} onChange={(e) => setEditForm((p) => ({ ...p, fca: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                      {bulkEditActive && <option value="">â€” No change â€”</option>}
                      <option value="0">0 â€” Pending</option>
                      <option value="1">1 â€” Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-muted-foreground">IFCA</label>
                    <select value={editForm.ifca} onChange={(e) => setEditForm((p) => ({ ...p, ifca: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                      {bulkEditActive && <option value="">â€” No change â€”</option>}
                      <option value="0">0 â€” Pending</option>
                      <option value="1">1 â€” Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." className="h-20 w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => { setEditSIM(null); setBulkEditActive(false); }}>Cancel</Button>
              <Button className="flex-1" onClick={async () => {
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
                    for (const simNum of targets) {
                      if (!simNum) continue;
                      const sim = allActivations.find((a) => a.simNumber === simNum) || sims.find((s) => s.simNumber === simNum);
                      const activation = allActivations.find((a) => a.simNumber === simNum);
                      if (sim) {
                        await autoGenerateSale(sim, activation, {
                          bvs: editForm.bvs || existingVerifications[simNum]?.bvs || "0",
                          fca: editForm.fca || existingVerifications[simNum]?.fca || "0",
                          ifca: editForm.ifca || existingVerifications[simNum]?.ifca || "0",
                        });
                      }
                    }
                  }
                } catch {}
                setEditSIM(null); setBulkEditActive(false); setSelectedIds([]); window.location.reload();
              }}><Pencil className="h-4 w-4" /> {bulkEditActive ? `Update ${selectedIds.length} SIMs` : "Save"}</Button>
            </div>
          </Card>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <Card className="w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100"><Trash2 className="h-6 w-6 text-red-600" /></div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{deleteConfirm._bulk ? `Delete ${deleteConfirm.count} SIM Records?` : "Delete SIM Record?"}</h3>
              {deleteConfirm._bulk ? (
                <p className="text-sm text-muted-foreground">{deleteConfirm.count} selected SIM{deleteConfirm.count > 1 ? "s" : ""} will be permanently deleted.</p>
              ) : (
                <p className="mb-1 text-sm text-muted-foreground">SIM: <span className="font-mono font-bold text-foreground">{deleteConfirm.simNumber}</span></p>
              )}
              <p className="text-xs text-muted-foreground/80">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={async () => {
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
              }}><Trash2 className="h-4 w-4" /> {deleteConfirm._bulk ? `Delete ${deleteConfirm.count}` : "Delete"}</Button>
            </div>
          </Card>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => { setShowImportModal(false); setImportRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }}>
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50"><FileSpreadsheet className="h-5 w-5 text-brand-600" /></div>
                <div><h3 className="text-base font-semibold text-foreground">Import Verification File</h3><p className="text-xs text-muted-foreground">Match by ICCID, SIM Number, Device ID, or Retailer ID</p></div>
              </div>
              <button onClick={() => { setShowImportModal(false); setImportRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-sm font-medium text-blue-800">Format: ICCID, SIM Number, Device ID, Retailer ID, BVS, FCA, IFCA</p>
                <ul className="list-inside list-disc space-y-1 text-xs text-blue-700">
                  <li>Match by <strong>ICCID</strong> OR <strong>SIM Number</strong> OR <strong>Device ID</strong> OR <strong>Retailer ID</strong></li>
                  <li>ICCID column will also be <strong>updated</strong> on matched SIM records</li>
                  <li>Use <code className="rounded bg-blue-100 px-1">0</code> = Done, <code className="rounded bg-blue-100 px-1">1</code> = Verified, leave empty to keep existing</li>
                  <li>All 0 â†’ <strong>Completed</strong>, All 1 â†’ <strong>Verified</strong>, Has X â†’ <strong>Pending</strong></li>
                </ul>
                <button onClick={downloadSampleFile} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"><Download className="h-3 w-3" /> Download Sample CSV</button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Upload File</label>
                <div className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:border-brand-500/50 hover:bg-slate-50" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  {importFile ? <div><p className="text-sm font-medium text-foreground">{importFile.name}</p><p className="text-xs text-muted-foreground">{importRows.length} rows</p></div> : <div><p className="text-sm text-muted-foreground">Click to upload CSV</p></div>}
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </div>
              {importError && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3"><AlertCircle className="h-4 w-4 text-red-500" /><p className="text-sm text-red-700">{importError}</p></div>}
              {importSuccess && <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3"><CheckCircle className="h-4 w-4 text-green-500" /><p className="text-sm text-green-700">{importSuccess}</p></div>}
              {importRows.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Preview ({importRows.filter((r) => r.matched).length} matched)</p>
                  <div className="max-h-[300px] overflow-hidden overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-50"><tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ICCID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">SIM Number</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Device ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Retailer ID</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">BVS</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">FCA</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">IFCA</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {importRows.map((row, i) => (
                          <tr key={i} className={`border-t border-slate-100 ${row.matched ? "bg-green-50/50" : "bg-red-50/50"}`}>
                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.iccid || "â€”"}</td>
                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.simNumber || "â€”"}</td>
                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.deviceId || "â€”"}</td>
                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.retailerId || "â€”"}</td>
                            <td className="px-3 py-2 text-center"><span className={`text-xs font-bold ${row.bvs === "1" ? "text-green-600" : "text-muted-foreground"}`}>{row.bvs}</span></td>
                            <td className="px-3 py-2 text-center"><span className={`text-xs font-bold ${row.fca === "1" ? "text-green-600" : "text-muted-foreground"}`}>{row.fca}</span></td>
                            <td className="px-3 py-2 text-center"><span className={`text-xs font-bold ${row.ifca === "1" ? "text-green-600" : "text-muted-foreground"}`}>{row.ifca}</span></td>
                            <td className="px-3 py-2 text-center">
                              {row.matched ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Matched ({row.matchType})</span> : <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Not Found</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowImportModal(false); setImportRows([]); setImportFile(null); setImportError(""); setImportSuccess(""); }}>Cancel</Button>
              <Button className="flex-1" onClick={handleImport} disabled={importRows.length === 0 || importRows.filter((r) => r.matched).length === 0}><Upload className="h-4 w-4" /> Import {importRows.filter((r) => r.matched).length} Records</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
