export const CURRENCY = 'PKR';
export function toPaisa(v: unknown): number { const n = Number(v); return isFinite(n) ? Math.round(n * 100) : 0; }
export function fromPaisa(p: number): number { return p / 100; }
export function fmtAmount(v: number): string {
  const n = Number(v);
  if (!isFinite(n)) return `${CURRENCY} 0.00`;
  return `${CURRENCY} ${n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function fmtDate(d: string | null): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDateTime(d: string | null): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function todayISO(): string { return new Date().toISOString().slice(0, 10); }
export function nowISO(): string { return new Date().toISOString(); }
export function startOfDay(d: string): Date { const dt = new Date(d); dt.setHours(0,0,0,0); return dt; }
export function endOfDay(d: string): Date { const dt = new Date(d); dt.setHours(23,59,59,999); return dt; }
export function uid(prefix = 'ID'): string { return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`; }
export function initials(name: string): string {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}
export function esc(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
