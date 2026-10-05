'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { LandingModel } from '@/lib/landing/model';

type Props = {
    items: LandingModel['gallery'];
    businessName: string;
    className?: string;
};

/**
 * Carrusel principal del Hero: una foto a la vez, a todo lo ancho en móvil,
 * con autoplay (se pausa al tocar / pasar el mouse / con "reducir movimiento").
 */
export function HeroGallery({ items, businessName, className }: Props) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const many = items.length > 1;

    const autoplay = useRef(
        Autoplay({
            delay: 4500,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
            breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
        })
    );

    useEffect(() => {
        if (!api) return;
        const onSelect = () => setCurrent(api.selectedScrollSnap());
        onSelect();
        api.on('select', onSelect).on('reInit', onSelect);
        return () => {
            api.off('select', onSelect).off('reInit', onSelect);
        };
    }, [api]);

    if (items.length === 0) return null;

    return (
        <div className={cn('relative overflow-hidden bg-muted', className)}>
            <Carousel
                setApi={setApi}
                plugins={many ? [autoplay.current] : []}
                opts={{ loop: many }}
                aria-label={`Fotos de ${businessName}`}
            >
                <CarouselContent className="ml-0">
                    {items.map((item, i) => (
                        <CarouselItem
                            key={item.id ?? i}
                            className="pl-0"
                            aria-label={`${i + 1} de ${items.length}`}
                        >
                            <figure className="relative aspect-[4/3] lg:aspect-[5/4]">
                                <Image
                                    src={item.url}
                                    alt={item.alt ?? item.label ?? `Foto de ${businessName}`}
                                    fill
                                    priority={i === 0}
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                                {item.label && (
                                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pt-12 pb-9 text-sm font-semibold text-white">
                                        {item.label}
                                    </figcaption>
                                )}
                            </figure>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {many && (
                <>
                    <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm">
                        {current + 1}/{items.length}
                    </span>
                    <div className="absolute inset-x-0 bottom-2 flex justify-center">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => api?.scrollTo(i)}
                                aria-label={`Ir a la foto ${i + 1} de ${items.length}`}
                                aria-current={i === current}
                                // Área táctil de 24px aunque el punto se vea pequeño
                                className="grid h-6 place-items-center px-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <span
                                    className={cn(
                                        'block h-1.5 rounded-full shadow-sm transition-all duration-300',
                                        i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
