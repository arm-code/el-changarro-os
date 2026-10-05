import { TenantProvider } from '@/components/providers/TenantProvider';
import { getBusinessSlugFromHostname } from '@/lib/subdomain';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const slug = getBusinessSlugFromHostname();

  return (
    <TenantProvider negocio={slug}>
      {children}
    </TenantProvider>
  );
}
