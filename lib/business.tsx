'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Business, businessApi } from '@/lib/api/business';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface BusinessContextType {
  business: Business | null;
  activeBusinessId: string | null;
  loading: boolean;
  hasNoBusiness: boolean;
  refreshBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType>({
  business: null,
  activeBusinessId: null,
  loading: true,
  hasNoBusiness: false,
  refreshBusiness: async () => {},
});

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasNoBusiness, setHasNoBusiness] = useState<boolean>(false);

  const loadUserBusiness = useCallback(async () => {
    if (!user) {
      setBusiness(null);
      setActiveBusinessIdState(null);
      setHasNoBusiness(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await businessApi.getBusinesses();
      const list = Array.isArray(data) ? data : [];

      if (list.length > 0) {
        // En modelo SaaS Administrado, se selecciona el único negocio asignado al cliente
        const singleBusiness = list[0];
        setBusiness(singleBusiness);
        setActiveBusinessIdState(singleBusiness.id);
        setHasNoBusiness(false);
      } else {
        setBusiness(null);
        setActiveBusinessIdState(null);
        setHasNoBusiness(true);
        toast.error('Atención: Usuario sin negocio', {
          description: 'Tu usuario no tiene un negocio asignado. Por favor contacta a soporte técnico.',
          duration: 6000,
        });
      }
    } catch (err: any) {
      console.error('Error al cargar el negocio del usuario:', err);
      toast.error('Error de autenticación de negocio', {
        description: err?.message || 'No se pudo validar el negocio del usuario.',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserBusiness();
  }, [loadUserBusiness]);

  return (
    <BusinessContext.Provider
      value={{
        business,
        activeBusinessId,
        loading,
        hasNoBusiness,
        refreshBusiness: loadUserBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
