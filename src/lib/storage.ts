'use client';
// Guardado en el navegador (localStorage) compartido entre componentes.
// Todos los componentes que usan la misma clave ven el mismo valor y se actualizan a la vez.
import { useCallback, useSyncExternalStore } from 'react';

export const STORAGE_PREFIX = 'cubo-algs-';
export const KEYS = {
  progress: 'cubo-algs-v1',
  timer: 'cubo-algs-timer-v1',
  practice: 'cubo-algs-practice-v1',
  daily: 'cubo-algs-daily-v1',
  lessons: 'cubo-algs-lessons-v2',
  coach: 'cubo-algs-coach-v1',
} as const;

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function load<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = initial;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      value = initial && typeof initial === 'object' && !Array.isArray(initial) ? { ...initial, ...parsed } : parsed;
    }
  } catch { /* sin almacenamiento: se usan los valores por defecto */ }
  cache.set(key, value);
  return value;
}

/** Escribe un valor (también desde fuera de React, p. ej. en un callback de otra página) */
export function writeStore<T>(key: string, initial: T, update: T | ((prev: T) => T)) {
  const prev = load(key, initial);
  const next = typeof update === 'function' ? (update as (p: T) => T)(prev) : update;
  cache.set(key, next);
  try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignorar */ }
  listeners.get(key)?.forEach(l => l());
}
export const readStore = <T,>(key: string, initial: T) => load(key, initial);

/**
 * Como useState, pero guardado en localStorage y compartido entre componentes.
 * `initial` debe ser una constante (misma referencia en cada render).
 */
export function usePersistentState<T>(key: string, initial: T): [T, (update: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback((cb: () => void) => {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(cb);
    return () => { listeners.get(key)!.delete(cb); };
  }, [key]);
  const value = useSyncExternalStore(subscribe, () => load(key, initial), () => initial);
  const set = useCallback((u: T | ((prev: T) => T)) => writeStore(key, initial, u), [key, initial]);
  return [value, set];
}

/** Todas las claves de la app, para exportar el progreso */
export function exportAll(): Record<string, unknown> {
  const stores: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith(STORAGE_PREFIX)) stores[k] = JSON.parse(localStorage.getItem(k)!);
  }
  return stores;
}
export function importAll(stores: Record<string, unknown>) {
  for (const [k, v] of Object.entries(stores)) if (k.startsWith(STORAGE_PREFIX)) localStorage.setItem(k, JSON.stringify(v));
  cache.clear();
}
