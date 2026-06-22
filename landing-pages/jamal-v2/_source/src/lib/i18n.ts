import { useSyncExternalStore } from 'react';

/**
 * Tiny language store (module-level, like lenisStore) wired to React via
 * useSyncExternalStore. JAMAL ships bilingual: English (Bodoni + Manrope, LTR)
 * and Arabic (Thmanyah Serif Display + Thmanyah Sans, RTL). The actual
 * <html lang/dir> + ScrollTrigger.refresh on change is owned by App's effect;
 * this module only holds the value, persists it, and notifies subscribers.
 */
export type Lang = 'en' | 'ar';

const STORAGE_KEY = 'jamal-lang';

function readInitial(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* private mode / storage blocked — fall through to default */
  }
  return 'en';
}

let current: Lang = readInitial();
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang): void {
  if (next === current) return;
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore persistence failures */
  }
  listeners.forEach((l) => l());
}

export function toggleLang(): void {
  setLang(current === 'en' ? 'ar' : 'en');
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Current language; re-renders the component when it changes. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => 'en');
}

export const isRTL = (lang: Lang): boolean => lang === 'ar';
