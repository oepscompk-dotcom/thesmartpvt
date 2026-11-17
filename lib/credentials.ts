export function genId(prefix: string, num: number) {
  return `${prefix}-${String(num).padStart(3, "0")}`;
}

export function genUsername(name: string, num: number) {
  return name.toLowerCase().replace(/\s+/g, "").slice(0, 5) + String(num).padStart(3, "0");
}

export function genPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@";
  let p = "TS@";
  for (let i = 0; i < 4; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

export function genRetailerId(mobile: string) {
  return mobile.replace(/[\s+\-()]/g, "").slice(-11);
}
