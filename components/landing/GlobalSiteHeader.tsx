'use client';

import { usePathname } from 'next/navigation';
import { useTenant } from '@/components/providers/TenantProvider';
import { toLandingModel } from '@/lib/landing/model';
import { SiteHeader } from './chrome';
import { getSectionLinks } from './sections';

export function GlobalSiteHeader() {
  const { publicBusiness } = useTenant();
  const pathname = usePathname();

  if (!publicBusiness) return null;

  const model = toLandingModel(publicBusiness);
  
  // Las secciones del menú solo aparecen en la landing del negocio (la raíz).
  const isLandingPage = pathname === '/';
  const sections = isLandingPage ? getSectionLinks(model) : [];

  return (
    <div className="landing" data-palette={model.palette}>
      <SiteHeader model={model} sections={sections} />
    </div>
  );
}
