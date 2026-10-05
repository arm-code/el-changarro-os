import { TenantProvider } from '@/components/providers/TenantProvider';
import type { ReactNode } from 'react';

interface NegocioLayoutProps {
  children: ReactNode;
  params: Promise<{ negocio: string }>;
}

export default async function NegocioLayout({ children, params }: NegocioLayoutProps) {
  const { negocio } = await params;

  return (
    <TenantProvider negocio={negocio}>
      {children}
    </TenantProvider>
  );
}
