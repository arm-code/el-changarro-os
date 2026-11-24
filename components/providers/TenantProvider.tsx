'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import { publicBusinessQuery } from '@/lib/landing/queries';
import { defaultBusinessConfig } from '@/lib/config';
import type { PublicBusinessResponse } from '@/types/finance';

interface TenantContextValue {
  publicBusiness: PublicBusinessResponse | undefined;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

/**
 * TenantProvider — carga la información pública del negocio de esta instancia
 * (una instancia = un negocio) sin necesidad de autenticación.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: publicBusiness, isLoading } = useQuery(publicBusinessQuery());

  return (
    <TenantContext.Provider value={{ publicBusiness, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook para consumir el contexto del negocio en cualquier componente hijo.
 * Devuelve los datos del negocio y un objeto `config` con fallbacks seguros.
 * Solo expone datos reales del backend — sin fallbacks hardcodeados de ningún negocio.
 */
export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant debe usarse dentro de un <TenantProvider>');
  }

  const { publicBusiness, isLoading } = ctx;

  const config = publicBusiness?.config ?? defaultBusinessConfig;
  const businessName = publicBusiness?.name || config.name || '';
  // logoUrl: null del API significa que el negocio no ha subido logo — no usar imagen de otro negocio
  const logoUrl = publicBusiness?.logoUrl || config.logoUrl || '';
  const whatsapp = config.whatsapp || '';
  const phone = config.phone || '';
  const email = config.email || '';
  const address = config.address || '';
  const openingHours = config.openingHours || '';
  const termsAndConditions = config.termsAndConditions || '';
  const description = config.description || '';
  const services = config.services ?? [];
  const coverageAreas = config.coverageAreas ?? [];
  const paymentCards = config.paymentCards ?? [];
  const whatsappMessage = config.whatsappMessage || null;
  const gallery = config.gallery ?? [];
  const values = config.values ?? [];
  const stats = config.stats ?? [];
  const testimonials = config.testimonials ?? [];
  const faqs = config.faqs ?? [];

  return {
    publicBusiness,
    isLoading,
    config,
    businessName,
    logoUrl,
    whatsapp,
    phone,
    email,
    address,
    openingHours,
    termsAndConditions,
    description,
    services,
    coverageAreas,
    paymentCards,
    whatsappMessage,
    gallery,
    values,
    stats,
    testimonials,
    faqs,
  };
}
