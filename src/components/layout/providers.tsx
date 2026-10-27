'use client';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { useEvents } from '@/stores/events';
import { STORAGE_KEY } from '@/lib/storage/event-repository';
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      richColors
      position="bottom-right"
      closeButton
    />
  );
}
export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useEvents((state) => state.hydrate);
  useEffect(() => {
    hydrate();
    const refresh = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) hydrate();
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [hydrate]);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="timeverse:theme"
      disableTransitionOnChange={false}
    >
      <MotionConfig reducedMotion="user">
        {children}
        <ThemedToaster />
      </MotionConfig>
    </ThemeProvider>
  );
}
