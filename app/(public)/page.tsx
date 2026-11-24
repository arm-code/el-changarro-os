import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import { isNotFound, publicBusinessQuery } from '@/lib/landing/queries';
import { PublicLandingView } from '@/components/landing/PublicLandingView';

// Landing pública del negocio de esta instancia (una instancia = un negocio).
const getBusiness = cache(async () => {
  try {
    const data = await businessApi.getPublicBusiness();
    return data ? ({ status: 'ok', data } as const) : ({ status: 'not-found' } as const);
  } catch (error) {
    if (isNotFound(error)) return { status: 'not-found' } as const;
    // Log solo en servidor, sin detalles al usuario
    console.error('[landing] No se pudo obtener el negocio:', error);
    return { status: 'error' } as const;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const result = await getBusiness();
  if (result.status !== 'ok') return {};

  const data = (result.data as any).data ?? result.data;
  const name = data.name || data.config?.name || 'Negocio';
  const description =
    data.config?.description?.slice(0, 160) || `Conoce los servicios de ${name}.`;
  const image = data.config?.gallery?.[0]?.url || data.logoUrl;

  return {
    title: name,
    description,
    // Vista previa al compartir por WhatsApp/Facebook
    openGraph: { title: name, description, type: 'website', images: image ? [image] : undefined },
  };
}

export default async function HomePage() {
  const result = await getBusiness();
  if (result.status === 'not-found') notFound();

  const queryClient = new QueryClient();
  if (result.status === 'ok') {
    const innerData = (result.data as any).data ?? result.data;
    queryClient.setQueryData(publicBusinessQuery().queryKey, innerData);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicLandingView />
    </HydrationBoundary>
  );
}
