'use client';

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Ignorar errores de registro en producción
        });
      });
    }
  }, []);

  return null;
}
