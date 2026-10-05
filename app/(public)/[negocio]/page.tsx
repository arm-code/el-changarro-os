// page anterior

// 'use client';

// import { PublicLandingView } from '@/components/public/PublicLandingView';
// import { useTenant } from '@/components/providers/TenantProvider';

// export default function NegocioLandingPage() {
//   const { negocio } = useTenant();
//   return <PublicLandingView negocio={negocio} />;
// }

// termina page anterior


import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import { isNotFound, publicBusinessQuery, SLUG_PATTERN } from '@/lib/landing/queries';
import { PublicLandingView } from '@/components/landing/PublicLandingView';

// Next 14: params no es una Promise.
type Props = { params: { negocio: string } };

// cache(): generateMetadata y la página comparten UNA sola petición por request.
const getBusiness = cache(async (slug: string) => {
  try {
    const data = await businessApi.getPublicBusinessBySlug(slug);
    return data ? ({ status: 'ok', data } as const) : ({ status: 'not-found' } as const);
  } catch (error) {
    if (isNotFound(error)) return { status: 'not-found' } as const;
    // Log solo en servidor, sin detalles al usuario
    console.error('[landing] No se pudo obtener el negocio:', slug);
    return { status: 'error' } as const;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { negocio } = params;
  if (!SLUG_PATTERN.test(negocio)) return {};

  const result = await getBusiness(negocio);
  if (result.status !== 'ok') return { title: 'Negocio no encontrado' };

  // Adjust if `businessApi.getPublicBusinessBySlug` returns `{ data: ... }`
  const data = (result.data as any).data ? (result.data as any).data : result.data;
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

export default async function PublicBusinessPage({ params }: Props) {
  const { negocio } = params;
  if (!SLUG_PATTERN.test(negocio)) notFound();

  const result = await getBusiness(negocio);
  if (result.status === 'not-found') notFound();

  const queryClient = new QueryClient();
  if (result.status === 'ok') {
    queryClient.setQueryData(publicBusinessQuery(negocio).queryKey, result.data);
  }
  // Si fue 'error' (red, 500) no se hidrata: el cliente reintenta y muestra su estado.

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicLandingView negocio={negocio} />
    </HydrationBoundary>
  );
}