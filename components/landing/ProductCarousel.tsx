'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay'; // npm i embla-carousel-autoplay
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/types/finance';

interface ProductCarouselProps {
  items: GalleryItem[];
  id?: string;
  title?: string;
  description?: string;
  businessName?: string;
}

export default function ProductCarousel({
  items,
  id = 'galeria',
  title = 'Galería',
  description,
  businessName,
}: ProductCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Pausa con hover, sigue tras swipe, y se apaga si el usuario pidió reducir movimiento.
  const autoplay = useRef(
    Autoplay({
      delay: 4500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
    })
  );

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    const onReInit = () => {
      setCount(api.scrollSnapList().length);
      onSelect();
    };
    onReInit();
    api.on('select', onSelect).on('reInit', onReInit);
    return () => {
      api.off('select', onSelect).off('reInit', onReInit);
    };
  }, [api]);

  if (!items?.length) return null;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {title}
          </h2>
          {description && <p className="mt-2 text-muted-foreground">{description}</p>}
        </div>

        {/* El swipe táctil lo maneja Embla de forma nativa: no se agregan handlers propios */}
        <Carousel
          setApi={setApi}
          plugins={[autoplay.current]}
          opts={{ align: 'start', loop: items.length > 1 }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {items.map((item, i) => (
              <CarouselItem
                key={item.id ?? i}
                // 85% en móvil: se asoma la siguiente foto e invita a deslizar
                className="basis-[85%] pl-3 sm:basis-1/2 md:pl-4 lg:basis-1/3"
              >
                <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={item.url}
                    alt={item.alt ?? item.label ?? `Foto de ${businessName ?? 'el negocio'}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {item.label && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-sm font-semibold text-white">
                      {item.label}
                    </figcaption>
                  )}
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden sm:flex -left-4 size-10 bg-background" />
          <CarouselNext className="hidden sm:flex -right-4 size-10 bg-background" />
        </Carousel>

        {count > 1 && (
          <div className="mt-5 flex justify-center gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`Ir a la foto ${i + 1} de ${count}`}
                aria-current={i === current}
                // Área táctil de 24px aunque el punto se vea pequeño
                className="grid h-6 place-items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <span
                  className={cn(
                    'block h-2 rounded-full transition-all duration-300',
                    i === current ? 'w-6 bg-brand' : 'w-2 bg-brand-muted'
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}