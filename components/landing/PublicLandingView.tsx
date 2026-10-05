'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicBusinessQuery } from '@/lib/landing/queries';
import { toLandingModel } from '@/lib/landing/model';
import { LandingSkeleton } from './LandingSkeleton';
import {
    Hero, Services, About, Testimonials, Faq, Payments, Contact, Footer, getSectionLinks,
} from './sections';
import { MobileActionBar, SiteHeader } from './chrome';
import { AlertCircle } from 'lucide-react';

function StateLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
            {children}
        </div>
    );
}

export function PublicLandingView({ negocio }: { negocio: string }) {
    const { data, isPending, isError, error } = useQuery(publicBusinessQuery(negocio));

    if (isPending) return <LandingSkeleton />;

    if (isError) {
        const e = error as any;
        if (e?.status === 404 || e?.response?.status === 404) {
             return (
                 <StateLayout>
                     <h2 className="text-2xl font-bold">Negocio no encontrado</h2>
                     <p className="mt-2 text-muted-foreground">La página que buscas no existe o fue eliminada.</p>
                 </StateLayout>
             );
        }
        return (
            <StateLayout>
                <AlertCircle className="mb-4 size-10 text-destructive" />
                <h2 className="text-2xl font-bold">Error al cargar</h2>
                <p className="mt-2 text-muted-foreground">Ocurrió un problema de conexión. Intenta recargar la página.</p>
            </StateLayout>
        );
    }

    if (!data) return null;

    const model = toLandingModel(data);
    const sections = getSectionLinks(model);

    return (
        // `.landing` + data-palette activan las variables --brand-* de landing-palettes.css.
        // (Antes se usaba `theme-${palette}`, que no existe: todos los bg-brand-* salían transparentes.)
        <div className="landing min-h-dvh bg-background text-foreground" data-palette={model.palette}>
            <SiteHeader model={model} slug={negocio} sections={sections} />
            <main>
                <Hero model={model} />
                {/* Fondos alternos automáticos: no se repiten aunque falte alguna sección */}
                <div className="[&>section:nth-of-type(even)]:bg-brand-soft">
                    <Services model={model} />
                    <Testimonials model={model} />
                    <About model={model} />
                    <Faq model={model} />
                    <Payments model={model} slug={negocio} />
                    <Contact model={model} slug={negocio} />
                </div>
            </main>
            <Footer model={model} />
            <MobileActionBar model={model} />
        </div>
    );
}
