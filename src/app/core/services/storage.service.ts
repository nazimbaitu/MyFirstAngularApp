import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value) as T; }
    catch { return fallback; }
  }
  set<T>(key: string, value: T): boolean {
    if (typeof localStorage === 'undefined') return false;
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  remove(key: string): void { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); }
}
