import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * Replica la estructura y alturas de la landing real para evitar saltos (CLS).
 * Usa grises neutros: aún no conocemos la paleta del negocio, así no hay destello de color.
 */
function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
    return <div aria-hidden style={style} className={cn('rounded-md bg-muted motion-safe:animate-pulse', className)} />;
}

export function LandingSkeleton() {
    return (
        <div role="status" aria-busy="true" className="min-h-dvh bg-background">
            <span className="sr-only">Cargando información del negocio…</span>

            {/* Header + chips de secciones */}
            <div className="sticky top-0 z-40 border-b bg-background">
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
                    <Bone className="size-9 rounded-lg" />
                    <Bone className="ml-auto size-9 rounded-lg" />
                    <Bone className="hidden h-10 w-28 rounded-xl sm:block" />
                </div>
                <div className="mx-auto flex max-w-6xl gap-1.5 overflow-hidden px-4 pb-2.5 sm:px-6">
                    {[20, 22, 20, 24, 16, 20].map((w, i) => (
                        <Bone key={i} className="h-8 shrink-0 rounded-full" style={{ width: `${w * 4}px` }} />
                    ))}
                </div>
            </div>

            {/* Hero: carrusel a todo lo ancho en móvil, a la derecha en desktop */}
            <div>
                <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:px-6 lg:py-16">
                    <Bone className="aspect-[4/3] w-full rounded-none lg:order-last lg:aspect-[5/4] lg:rounded-3xl" />
                    <div className="px-4 pt-6 pb-10 sm:px-6 lg:p-0">
                        <Bone className="h-7 w-44 rounded-full" />
                        <Bone className="mt-4 h-9 w-4/5 sm:h-12 lg:h-14" />
                        <div className="mt-4 space-y-2.5">
                            <Bone className="h-4 w-full max-w-prose" />
                            <Bone className="h-4 w-2/3" />
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                            <Bone className="h-12 w-full rounded-xl sm:w-60" />
                            <Bone className="h-12 w-full rounded-xl sm:w-44" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Servicios */}
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
                <Bone className="h-8 w-48" />
                <Bone className="mt-3 h-4 w-72" />
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border p-4">
                            <Bone className="size-9 rounded-lg" />
                            <Bone className="h-4 flex-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}