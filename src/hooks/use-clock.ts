'use client';
import { useSyncExternalStore } from 'react';
let now: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
const tick = () => {
  now = Math.floor(Date.now() / 1000) * 1000;
  listeners.forEach((listener) => listener());
};
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    tick();
    timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener('visibilitychange', tick);
    }
  };
}
export function useClock() {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );
}
