const BASE = "/api/data";

async function request(method: string, body?: any) {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE, opts);
  const json = await res.json();
  if (json && json.error) throw new Error(json.error);
  return json;
}

export async function apiLoad(model: string, franchiseId?: string): Promise<any[]> {
  const params = new URLSearchParams({ model });
  if (franchiseId) params.set("franchiseId", franchiseId);
  const res = await fetch(`${BASE}?${params}`, { cache: "no-store" });
  const json = await res.json();
  if (json && json.error) return [];
  return Array.isArray(json) ? json : [];
}

export async function apiLoadById(model: string, id: string): Promise<any | null> {
  const params = new URLSearchParams({ model, id });
  const res = await fetch(`${BASE}?${params}`);
  const json = await res.json();
  if (json && json.error) return null;
  return json || null;
}

export async function apiSave(model: string, data: any) {
  return request("POST", { model, data });
}

export async function apiSaveMany(model: string, data: any[]) {
  return request("POST", { model, data });
}

export async function apiUpdate(model: string, id: string, data: any) {
  return request("PUT", { model, id, data });
}

export async function apiUpdateMany(model: string, ids: string[], data: any) {
  return request("PUT", { model, ids, data });
}

export async function apiDelete(model: string, id: string) {
  return request("DELETE", { model, id });
}

export async function apiDeleteMany(model: string, ids: string[]) {
  return request("DELETE", { model, ids });
}
