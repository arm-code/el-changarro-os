import { TenantProvider } from '@/components/providers/TenantProvider';
import { GlobalSiteHeader } from '@/components/landing/GlobalSiteHeader';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <TenantProvider>
      <GlobalSiteHeader />
      {children}
    </TenantProvider>
  );
}
