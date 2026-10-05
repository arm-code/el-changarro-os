'use client';

import { usePathname } from 'next/navigation';
import { useTenant } from '@/components/providers/TenantProvider';
import { toLandingModel } from '@/lib/landing/model';
import { SiteHeader } from './chrome';
import { getSectionLinks } from './sections';

export function GlobalSiteHeader() {
  const { publicBusiness, negocio } = useTenant();
  const pathname = usePathname();

  if (!publicBusiness) return null;

  const model = toLandingModel(publicBusiness);
  
  // Solo mostramos las secciones si estamos exactamente en la landing page del negocio.
  // La landing page puede ser "/" (si es un subdominio o se resuelve via middleware) 
  // o "/[negocio]" explícitamente.
  const isLandingPage = pathname === '/' || pathname === `/${negocio}` || pathname === `/${negocio}/`;
  const sections = isLandingPage ? getSectionLinks(model) : [];

  return (
    <div className="landing" data-palette={model.palette}>
      <SiteHeader model={model} slug={negocio} sections={sections} />
    </div>
  );
}
