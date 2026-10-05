'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicBusinessQuery } from '@/lib/landing/queries';
import { toLandingModel } from '@/lib/landing/model';
import { LandingSkeleton } from './LandingSkeleton';
import { Hero, Services, About, Testimonials, Faq, Payments, Contact, Footer } from './sections';
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

    return (
        <main className={`bg-background text-foreground theme-${model.palette}`}>
            <Hero model={model} />
            <Services model={model} />
            <About model={model} />
            <Testimonials model={model} />
            <Faq model={model} />
            <Payments model={model} slug={negocio} />
            <Contact model={model} slug={negocio} />
            <Footer model={model} />
        </main>
    );
}
