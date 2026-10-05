'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { LandingModel } from '@/lib/landing/model';
import { CallLink, ShareButton, WhatsAppLink } from './actions';

export type SectionLink = { id: string; label: string };

/** true mientras el elemento con ese id esté visible en pantalla. */
function useInView(id: string, rootMargin = '0px') {
    const [inView, setInView] = useState(true);
    useEffect(() => {
        const el = document.getElementById(id);
        if (!el) {
            setInView(false);
            return;
        }
        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
        io.observe(el);
        return () => io.disconnect();
    }, [id, rootMargin]);
    return inView;
}

/** Scroll-spy: id de la sección que ocupa la franja central de la pantalla. */
function useActiveSection(ids: string[]) {
    const [active, setActive] = useState<string | null>(null);
    const key = ids.join('|');
    useEffect(() => {
        const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
        if (els.length === 0) return;
        const io = new IntersectionObserver(
            (entries) => {
                const hit = entries.find((e) => e.isIntersecting);
                if (hit) setActive(hit.target.id);
            },
            { rootMargin: '-40% 0px -55% 0px' }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    return active;
}

// ─── Header fijo con logo + navegación por secciones ─────────────────────────
export function SiteHeader({
    model, slug, sections,
}: {
    model: LandingModel; slug: string; sections: SectionLink[];
}) {
    // El nombre aparece en el header solo cuando el <h1> del Hero ya salió de pantalla
    const heroTitleVisible = useInView('inicio-title', '-56px 0px 0px 0px');
    const active = useActiveSection(sections.map((s) => s.id));
    const navRef = useRef<HTMLDivElement>(null);

    // Mantiene visible el chip activo dentro de la barra horizontal
    useEffect(() => {
        const nav = navRef.current;
        const chip = nav?.querySelector<HTMLElement>(`[data-id="${active}"]`);
        if (!nav || !chip) return;
        const left = chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2;
        nav.scrollTo({ left, behavior: 'smooth' });
    }, [active]);

    return (
        <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
                <a href="#inicio" className="flex min-w-0 items-center gap-2.5" aria-label={`${model.name}, ir al inicio`}>
                    {model.logoUrl ? (
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-border">
                            <Image src={model.logoUrl} alt="" fill sizes="36px" className="object-contain p-0.5" />
                        </span>
                    ) : (
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
                            {model.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span
                        className={cn(
                            'truncate font-semibold transition-all duration-300',
                            heroTitleVisible ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
                        )}
                    >
                        {model.name}
                    </span>
                </a>

                <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                    <ShareButton path={`/${slug}`} title={model.name} label="Compartir" iconOnly />
                    {model.whatsappNumber && (
                        <WhatsAppLink
                            number={model.whatsappNumber}
                            message={model.whatsappMessage}
                            className="hidden h-10 px-4 sm:inline-flex"
                        >
                            WhatsApp
                        </WhatsAppLink>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Menu className="size-5" />
                            <span className="sr-only">Menú</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href={`/${slug}/payment-info`} className="cursor-pointer">
                                    Datos bancarios
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/auth/login" className="cursor-pointer">
                                    Administración
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {sections.length > 1 && (
                <nav aria-label="Secciones de la página" className="mx-auto max-w-6xl">
                    <div
                        ref={navRef}
                        className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
                    >
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                data-id={s.id}
                                aria-current={active === s.id ? 'location' : undefined}
                                className={cn(
                                    'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    active === s.id
                                        ? 'border-brand bg-brand text-brand-foreground'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
}

// ─── Barra de acciones inferior (solo móvil) ─────────────────────────────────
export function MobileActionBar({ model }: { model: LandingModel }) {
    // Se oculta mientras los botones del Hero estén visibles, para no duplicarlos
    const heroCtaVisible = useInView('hero-cta');
    if (!model.whatsappNumber && !model.phoneHref) return null;

    return (
        <div
            inert={heroCtaVisible}
            className={cn(
                'fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-md transition-transform duration-300 sm:hidden',
                'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
                heroCtaVisible ? 'pointer-events-none translate-y-full' : 'translate-y-0'
            )}
        >
            <div className="flex gap-2 px-4 pt-3">
                {model.whatsappNumber && (
                    <WhatsAppLink
                        number={model.whatsappNumber}
                        message={model.whatsappMessage}
                        className="flex-1"
                    >
                        WhatsApp
                    </WhatsAppLink>
                )}
                {model.phoneHref && (
                    <CallLink
                        href={model.phoneHref}
                        phone={model.phone}
                        iconOnly={Boolean(model.whatsappNumber)}
                        className={model.whatsappNumber ? undefined : 'flex-1'}
                    />
                )}
            </div>
        </div>
    );
}
