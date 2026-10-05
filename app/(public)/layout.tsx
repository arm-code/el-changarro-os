import { TenantProvider } from '@/components/providers/TenantProvider';
import { getBusinessSlugFromHostname } from '@/lib/subdomain';
import { GlobalSiteHeader } from '@/components/landing/GlobalSiteHeader';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const slug = getBusinessSlugFromHostname();

  return (
    <TenantProvider negocio={slug}>
      <GlobalSiteHeader />
      {children}
    </TenantProvider>
  );
}
