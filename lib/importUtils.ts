export type SheetRow = string[];

/** Reads a CSV / Excel (.xls, .xlsx) file into a matrix of trimmed strings.
 *  The first sheet of a workbook is used. The Excel parser is loaded on
 *  demand so it never weighs down the initial page bundle. */
export async function readSpreadsheetRows(file: File): Promise<SheetRow[]> {
  if (/\.(csv|txt)$/i.test(file.name)) {
    return parseCSV(await file.text());
  }
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[sheetName], {
    header: 1,
    blankrows: false,
    defval: "",
  });
  return rows
    .map((row) => (Array.isArray(row) ? row : []).map((cell) => (cell == null ? "" : String(cell).trim())))
    .filter((row) => row.some((cell) => cell !== ""));
}

/** RFC4180-ish CSV parser: handles quoted fields, embedded commas/newlines and CRLF. */
export function parseCSV(text: string): SheetRow[] {
  const source = text.replace(/^\uFEFF/, "");
  const rows: SheetRow[] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field.trim());
      field = "";
    } else if (char === "\n") {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell !== ""));
}

export function normalizeHeader(header: string): string {
  return (header || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface ColumnSpec {
  field: string;
  aliases: string[];
  /** Headers containing any of these tokens never match this field. */
  exclude?: string[];
}

/**
 * Maps column headers onto fields. Exact alias matches win first, then a
 * second pass falls back to substring matches so "DSO Full Name" still maps
 * to `name`. Each column can only be claimed once.
 */
export function mapColumns(headers: string[], specs: ColumnSpec[]): Record<string, number> {
  const normalized = headers.map(normalizeHeader);
  const claimed = new Set<number>();
  const result: Record<string, number> = {};

  const isExcluded = (spec: ColumnSpec, header: string) =>
    (spec.exclude || []).some((token) => header.includes(token));

  for (const spec of specs) {
    const index = normalized.findIndex(
      (header, i) => !claimed.has(i) && header !== "" && spec.aliases.includes(header) && !isExcluded(spec, header)
    );
    if (index >= 0) {
      result[spec.field] = index;
      claimed.add(index);
    }
  }

  for (const spec of specs) {
    if (result[spec.field] !== undefined) continue;
    const index = normalized.findIndex(
      (header, i) =>
        !claimed.has(i) &&
        header !== "" &&
        !isExcluded(spec, header) &&
        spec.aliases.some((alias) => alias.length >= 3 && header.includes(alias))
    );
    if (index >= 0) {
      result[spec.field] = index;
      claimed.add(index);
    }
  }

  return result;
}

export function digitsOnly(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/** Normalises a CNIC to 12345-6789012-3 when it has exactly 13 digits. */
export function normalizeCNIC(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 13) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  return (value || "").trim();
}

export const CNIC_PATTERN = /^\d{5}-\d{7}-\d{1}$/;

/** Normalises a Pakistani mobile number to 03XXXXXXXXX. */
export function normalizePhone(value: string): string {
  let digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.startsWith("92") && digits.length === 12) digits = `0${digits.slice(2)}`;
  else if (digits.startsWith("3") && digits.length === 10) digits = `0${digits}`;
  return digits;
}

export const PHONE_PATTERN = /^03\d{9}$/;

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
