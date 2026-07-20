const BASE = "/api/data";

async function request(method: string, body?: any) {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE, opts);
  return res.json();
}

export async function apiLoad(model: string, franchiseId?: string) {
  const params = new URLSearchParams({ model });
  if (franchiseId) params.set("franchiseId", franchiseId);
  const res = await fetch(`${BASE}?${params}`);
  return res.json();
}

export async function apiLoadById(model: string, id: string) {
  const params = new URLSearchParams({ model, id });
  const res = await fetch(`${BASE}?${params}`);
  return res.json();
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
