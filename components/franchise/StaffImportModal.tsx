"use client";

import { useMemo, useRef, useState } from "react";
import {
  Upload, X, FileSpreadsheet, Download, CheckCircle2, AlertTriangle,
  Loader2, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadTextFile, readSpreadsheetRows, mapColumns, normalizeCNIC, normalizePhone, CNIC_PATTERN, PHONE_PATTERN, digitsOnly } from "@/lib/importUtils";
import { buildStaffRecord, type StaffKind } from "@/lib/staffDefaults";


/** Structural subset shared by DSO and DSM records — all this modal needs to read. */
interface StaffLike {
  id: string;
  username: string;
  cnic: string;
  mobile: string;
}

const COLUMN_SPECS = [
  { field: "name", aliases: ["fullname", "dsname", "name", "employeename", "staffname", "personname"], exclude: ["father", "guardian", "dad", "mother"] },
  { field: "fatherName", aliases: ["fathername", "fathersname", "father", "guardianname", "sirname"] },
  { field: "cnic", aliases: ["cnic", "cnicnumber", "cnicno", "nic", "nationalidentitycard", "idcard"] },
  { field: "mobile", aliases: ["mobile", "mobilenumber", "mobilephone", "mobileno", "phone", "phonenumber", "contact", "contactnumber"], exclude: ["whatsapp"] },
  { field: "whatsapp", aliases: ["whatsapp", "whatsappnumber", "whatsapnumber", "whatsappno", "whatsappphone"] },
];

const REQUIRED_FIELDS = ["name", "cnic", "mobile"];

const FIELD_LABELS: Record<string, string> = {
  name: "Full Name",
  fatherName: "Father Name",
  cnic: "CNIC Number",
  mobile: "Mobile Number",
  whatsapp: "Whatsapp Number",
};

const SAMPLE_CSV = `Full Name,Father Name,CNIC Number,Mobile Number,Whatsapp Number
Ali Khan,Muhammad Khan,12345-6789012-3,0300-1234567,0300-1234567
Sara Bibi,Ahmad Bibi,98765-4321098-7,0321-7654321,
`;

interface PreviewRow {
  line: number;
  name: string;
  fatherName: string;
  cnic: string;
  mobile: string;
  whatsapp: string;
  issues: string[];
}

export default function StaffImportModal({
  kind,
  existing,
  franchiseId,
  onImport,
  onClose,
}: {
  kind: StaffKind;
  existing: StaffLike[];
  franchiseId: string;
  onImport: (records: any[]) => Promise<void>;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  const ready = rows.filter((r) => r.issues.length === 0);
  const skipped = rows.length - ready.length;

  const handleFile = async (picked: File | null) => {
    if (!picked) return;
    if (!/\.(csv|txt|xls|xlsx)$/i.test(picked.name)) {
      setError("Unsupported file. Please choose a .csv, .xls or .xlsx file.");
      return;
    }
    setFile(picked);
    setError(null);
    setRows([]);
    setHeaders([]);
    setMissing([]);
    setParsing(true);
    try {
      const matrix = await readSpreadsheetRows(picked);
      if (matrix.length < 2) {
        setError("The file has no data rows. The first row must contain column headers.");
        setParsing(false);
        return;
      }
      const headerRow = matrix[0];
      const mapping = mapColumns(headerRow, COLUMN_SPECS);
      const absent = REQUIRED_FIELDS.filter((f) => mapping[f] === undefined);
      setHeaders(headerRow);
      setMissing(absent);
      if (absent.length === REQUIRED_FIELDS.length) {
        setError("Could not find any of the expected columns. Download the sample template to see the format.");
        setParsing(false);
        return;
      }

      const seenCnic = new Set<string>();
      const seenMobile = new Set<string>();
      const existingCnic = new Set(existing.map((d) => digitsOnly(d.cnic)).filter(Boolean));
      const existingMobile = new Set(existing.map((d) => digitsOnly(d.mobile)).filter(Boolean));

      const parsed: PreviewRow[] = matrix.slice(1).map((cells, i) => {
        const get = (field: string) => {
          const index = mapping[field];
          return index === undefined ? "" : (cells[index] || "").trim();
        };
        const rawName = get("name");
        const cnic = normalizeCNIC(get("cnic"));
        const mobile = normalizePhone(get("mobile"));
        const whatsapp = normalizePhone(get("whatsapp"));

        const issues: string[] = [];
        if (!rawName) issues.push("Full Name is required");
        if (mapping["cnic"] === undefined) issues.push("CNIC column missing");
        else if (!cnic) issues.push("CNIC is required");
        else if (!CNIC_PATTERN.test(cnic)) issues.push("CNIC must be 13 digits");
        if (mapping["mobile"] === undefined) issues.push("Mobile column missing");
        else if (!mobile) issues.push("Mobile is required");
        else if (!PHONE_PATTERN.test(mobile)) issues.push("Invalid mobile number");
        if (whatsapp && !PHONE_PATTERN.test(whatsapp)) issues.push("Invalid Whatsapp number");

        const cnicKey = digitsOnly(cnic);
        const mobileKey = digitsOnly(mobile);
        if (!issues.length) {
          if (cnicKey && seenCnic.has(cnicKey)) issues.push("Duplicate CNIC in file");
          else if (existingCnic.has(cnicKey)) issues.push("CNIC already registered");
          else if (mobileKey && seenMobile.has(mobileKey)) issues.push("Duplicate mobile in file");
          else if (existingMobile.has(mobileKey)) issues.push("Mobile already registered");
        }
        seenCnic.add(cnicKey);
        if (mobileKey) seenMobile.add(mobileKey);

        return {
          line: i + 2,
          name: rawName,
          fatherName: get("fatherName"),
          cnic,
          mobile,
          whatsapp,
          issues,
        };
      });

      if (!parsed.length) {
        setError("The file has headers but no data rows.");
      }
      setRows(parsed);
    } catch (e: any) {
      setError(e?.message ? `Could not read file: ${e.message}` : "Could not read the selected file.");
    } finally {
      setParsing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setRows([]);
    setHeaders([]);
    setMissing([]);
    setError(null);
    setImported(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async () => {
    if (!ready.length) return;
    setImporting(true);
    setError(null);
    try {
      const franchiseCode = franchiseId.split("-")[0] || "FR";
      const idFor = (n: number) => `${kind}-${franchiseCode}-${String(n).padStart(3, "0")}`;
      const usernameFor = (n: number) => `${kind.toLowerCase()}${String(n).padStart(3, "0")}`;
      const usedIds = new Set(existing.map((d) => d.id));
      const usedUsernames = new Set(existing.map((d) => d.username));
      let seq =
        existing
          .map((d) => parseInt(d.id.split("-").pop() || "0", 10))
          .filter((n) => Number.isFinite(n))
          .reduce((max, n) => Math.max(max, n), 0) + 1;

      const records = ready.map((row) => {
        while (usedIds.has(idFor(seq)) || usedUsernames.has(usernameFor(seq))) seq++;
        const id = idFor(seq);
        const username = usernameFor(seq);
        usedIds.add(id);
        usedUsernames.add(username);
        seq++;
        return buildStaffRecord(kind, row, { franchiseId, id, username });
      });

      await onImport(records);
      setImported(records.length);
    } catch (e: any) {
      setError(e?.message ? `Import failed: ${e.message}` : "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const mapping = useMemo(() => (headers.length ? mapColumns(headers, COLUMN_SPECS) : {}), [headers]);
  const mappedCount = useMemo(
    () => COLUMN_SPECS.filter((c) => mapping[c.field] !== undefined).length,
    [mapping]
  );

  if (imported > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle2 size={22} className="text-green-600" />
          </div>
          <h3 className="mb-2 text-slate-900 font-bold">{imported} {kind}{imported > 1 ? "s" : ""} imported</h3>
          <p className="mb-6 text-sm text-slate-500">
            Credentials were generated automatically — open any record to view the username and password.
          </p>
          <Button className="w-full" onClick={onClose}>
            Done <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <FileSpreadsheet size={18} className="text-brand-600" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold">Import {kind}s from CSV / Excel</h3>
              <p className="text-xs text-slate-500">Bulk-create {kind === "DSO" ? "Direct Sales Officers" : "District Sales Managers"} in one go</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Expected columns</p>
            <div className="flex flex-wrap gap-1.5">
              {COLUMN_SPECS.map((c) => (
                <span
                  key={c.field}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                    REQUIRED_FIELDS.includes(c.field)
                      ? "bg-white text-slate-700 ring-1 ring-slate-200"
                      : "bg-white/70 text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {FIELD_LABELS[c.field]}
                  {REQUIRED_FIELDS.includes(c.field) ? " *" : ""}
                </span>
              ))}
            </div>
            <button
              onClick={() => downloadTextFile(`${kind.toLowerCase()}-import-template.csv`, SAMPLE_CSV)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Download sample CSV
            </button>
          </div>

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
            >
              <Upload size={22} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Click to upload your file</span>
              <span className="text-xs text-slate-500">Supports .csv, .xls and .xlsx — first sheet is read</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet size={15} className="text-green-600" />
                  <span className="font-medium text-slate-700">{file.name}</span>
                  <span className="text-xs text-slate-400">{rows.length} row(s)</span>
                </div>
                <button onClick={reset} className="text-xs font-semibold text-brand-600 hover:underline">
                  Choose another file
                </button>
              </div>

              {parsing && (
                <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" /> Reading file…
                </div>
              )}

              {headers.length > 0 && !parsing && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-green-50 px-2 py-1 font-semibold text-green-700">
                    {mappedCount} of {COLUMN_SPECS.length} columns matched
                  </span>
                  {missing.map((f) => (
                    <span key={f} className="rounded-md bg-red-50 px-2 py-1 font-semibold text-red-600">
                      Missing: {FIELD_LABELS[f]}
                    </span>
                  ))}
                </div>
              )}

              {rows.length > 0 && !parsing && (
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                    {ready.length} ready to import
                  </span>
                  {skipped > 0 && (
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                      {skipped} will be skipped
                    </span>
                  )}
                </div>
              )}

              {rows.length > 0 && !parsing && (
                <div className="max-h-64 overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                        <th className="px-2 py-2 font-semibold">Row</th>
                        <th className="px-2 py-2 font-semibold">Full Name</th>
                        <th className="px-2 py-2 font-semibold">Father Name</th>
                        <th className="px-2 py-2 font-semibold">CNIC</th>
                        <th className="px-2 py-2 font-semibold">Mobile</th>
                        <th className="px-2 py-2 font-semibold">Whatsapp</th>
                        <th className="px-2 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((r) => (
                        <tr key={r.line} className={r.issues.length ? "bg-red-50/40" : ""}>
                          <td className="px-2 py-2 text-slate-400">{r.line}</td>
                          <td className="px-2 py-2 font-medium text-slate-700">{r.name || "—"}</td>
                          <td className="px-2 py-2 text-slate-600">{r.fatherName || "—"}</td>
                          <td className="px-2 py-2 font-mono text-slate-600">{r.cnic || "—"}</td>
                          <td className="px-2 py-2 font-mono text-slate-600">{r.mobile || "—"}</td>
                          <td className="px-2 py-2 font-mono text-slate-600">{r.whatsapp || "—"}</td>
                          <td className="px-2 py-2">
                            {r.issues.length ? (
                              <span className="font-semibold text-red-600">{r.issues.join(", ")}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                                <CheckCircle2 size={12} /> Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleImport}
            disabled={!ready.length || parsing || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Importing…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Import {ready.length} {kind}{ready.length === 1 ? "" : "s"}
              </>
            )}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.xls,.xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
