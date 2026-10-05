'use client';

import { PublicLandingView } from '@/components/landing/PublicLandingView';
import { getBusinessSlugFromHostname } from '@/lib/subdomain';

export default function HomePage() {
  const slug = getBusinessSlugFromHostname();
  return <PublicLandingView negocio={slug} />;
}