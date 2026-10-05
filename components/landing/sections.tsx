'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import {
    Award, Check, ChevronDown, CircleHelp, Clock, CreditCard, Heart, Leaf, Mail, MapPin, MessageCircle,
    Phone, ShieldCheck, Smile, Sparkles, Star, ThumbsUp, Truck, Users, Zap, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    buildMapsUrl, buildWhatsAppUrl, getRating, type LandingModel,
} from '@/lib/landing/model';
import { CallLink, CopyButton, ShareButton, WhatsAppLink } from './actions';
import { HeroGallery } from './HeroGallery';
import type { SectionLink } from './chrome';

type Props = { model: LandingModel };

// ─── Base ────────────────────────────────────────────────────────────────────
// El fondo alterno (blanco / tinte de marca) lo aplica el contenedor en
// PublicLandingView con nth-of-type, así no se repite aunque falten secciones.
function Section({
    id, title, description, icon: Icon, children, className,
}: {
    id: string; title: string; description?: ReactNode; icon?: LucideIcon; children: ReactNode; className?: string;
}) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-title`}
            // scroll-mt = alto del header fijo (barra + chips de navegación)
            className={cn('scroll-mt-28 border-t py-10 sm:py-16', className)}
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-6 max-w-2xl sm:mb-8">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground shadow-sm">
                                <Icon className="size-5" aria-hidden />
                            </span>
                        )}
                        <h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                            {title}
                        </h2>
                    </div>
                    {description && <p className="mt-3 text-muted-foreground text-pretty">{description}</p>}
                </div>
                {children}
            </div>
        </section>
    );
}

function Stars({ value, className }: { value: number; className?: string }) {
    const filled = Math.round(Math.min(5, Math.max(0, value)));
    return (
        <span role="img" aria-label={`${value} de 5 estrellas`} className={cn('flex gap-0.5', className)}>
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    aria-hidden
                    className={cn('size-4', i < filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
                />
            ))}
        </span>
    );
}

/** Botón "Ver más / Ver menos" para recortar listas largas en móvil. */
function ShowMore({
    expanded, onToggle, total, noun,
}: {
    expanded: boolean; onToggle: () => void; total: number; noun: string;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-background text-sm font-semibold transition-colors hover:border-brand hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:px-6"
        >
            {expanded ? 'Ver menos' : `Ver ${noun} (${total})`}
            <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden />
        </button>
    );
}

/** Acordeón nativo (details/summary): accesible y sin JS extra. */
function Disclosure({
    title, icon, children, defaultOpen,
}: {
    title: ReactNode; icon?: ReactNode; children: ReactNode; defaultOpen?: boolean;
}) {
    return (
        <details className="group" open={defaultOpen}>
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 font-semibold sm:p-5 [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                {icon}
                <span className="flex-1">{title}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="px-4 pb-5 sm:px-5">{children}</div>
        </details>
    );
}

// Mapa explícito en vez de `import * as Icons` (que mete ~1,500 iconos al bundle).
// Alinea estas claves con el selector de iconos del panel admin.
const VALUE_ICONS: Record<string, LucideIcon> = {
    award: Award, clock: Clock, heart: Heart, leaf: Leaf, shield: ShieldCheck,
    shieldcheck: ShieldCheck, smile: Smile, sparkles: Sparkles, star: Star,
    thumbsup: ThumbsUp, truck: Truck, users: Users, zap: Zap,
};

function ValueIcon({ name }: { name?: string | null }) {
    const Icon = VALUE_ICONS[(name ?? '').toLowerCase().replace(/[^a-z]/g, '')] ?? Star;
    return <Icon className="size-5" aria-hidden />;
}

// ─── Navegación ──────────────────────────────────────────────────────────────
function hasAbout({ history, mission, vision, values, stats }: LandingModel) {
    return Boolean(history || mission || vision || values.length || stats.length);
}

/** Secciones con contenido, en el mismo orden en que se renderizan. */
export function getSectionLinks(model: LandingModel): SectionLink[] {
    const links: (SectionLink | false)[] = [
        model.services.length > 0 && { id: 'servicios', label: 'Servicios' },
        model.testimonials.length > 0 && { id: 'opiniones', label: 'Opiniones' },
        hasAbout(model) && { id: 'nosotros', label: 'Nosotros' },
        model.faqs.length > 0 && { id: 'preguntas', label: 'Preguntas' },
        model.paymentCards.length > 0 && { id: 'pagos', label: 'Pagos' },
        hasContactSection(model) && { id: 'contacto', label: 'Contacto' },
    ];
    return links.filter(Boolean) as SectionLink[];
}

// ─── Hero ────────────────────────────────────────────────────────────────────
// Móvil: carrusel a todo lo ancho arriba y debajo nombre + qué hacen + CTA.
// El logotipo vive en el header fijo (ya no se encima sobre la foto).
export function Hero({ model }: Props) {
    const rating = getRating(model.testimonials);
    const hasGallery = model.gallery.length > 0;
    const hasVisual = hasGallery || Boolean(model.logoUrl);

    return (
        <section id="inicio" aria-labelledby="inicio-title" className="scroll-mt-28 bg-brand-soft">
            <div
                className={cn(
                    'mx-auto max-w-6xl lg:grid lg:gap-12 lg:px-6 lg:py-16',
                    hasVisual && 'lg:grid-cols-[1fr_1.1fr] lg:items-center'
                )}
            >
                {hasGallery ? (
                    <HeroGallery
                        items={model.gallery}
                        businessName={model.name}
                        className="lg:order-last lg:rounded-3xl lg:shadow-xl lg:ring-1 lg:ring-black/5"
                    />
                ) : model.logoUrl ? (
                    <div className="px-4 pt-8 sm:px-6 lg:order-last lg:p-0">
                        <div className="relative mx-auto aspect-square w-32 rounded-3xl bg-background shadow-sm ring-1 ring-border lg:w-full lg:max-w-xs">
                            <Image
                                src={model.logoUrl}
                                alt={`Logotipo de ${model.name}`}
                                fill
                                priority
                                sizes="(max-width: 1024px) 128px, 320px"
                                className="object-contain p-4 lg:p-10"
                            />
                        </div>
                    </div>
                ) : null}

                <div className="px-4 pt-6 pb-10 sm:px-6 lg:p-0">
                    {model.openingHours && (
                        <p className="inline-flex max-w-full items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
                            <Clock className="size-4 shrink-0 text-brand-ink" aria-hidden />
                            <span className="truncate">{model.openingHours}</span>
                        </p>
                    )}

                    <h1
                        id="inicio-title"
                        className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                    >
                        {model.name}
                    </h1>

                    {model.description && (
                        <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
                            {model.description}
                        </p>
                    )}

                    {rating && (
                        <a href="#opiniones" className="mt-4 inline-flex items-center gap-2 text-sm hover:underline">
                            <Stars value={rating.average} />
                            <span className="font-semibold">{rating.average.toFixed(1)}</span>
                            <span className="text-muted-foreground">
                                · {rating.count} {rating.count === 1 ? 'opinión' : 'opiniones'}
                            </span>
                        </a>
                    )}

                    {model.hasContact ? (
                        <div id="hero-cta" className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                            {model.whatsappNumber && (
                                <WhatsAppLink number={model.whatsappNumber} message={model.whatsappMessage} />
                            )}
                            {model.phoneHref && <CallLink href={model.phoneHref} phone={model.phone} />}
                        </div>
                    ) : (
                        <p className="mt-6 text-sm text-muted-foreground">
                            Este negocio aún no ha publicado sus datos de contacto.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

// ─── Servicios ───────────────────────────────────────────────────────────────
const SERVICES_PREVIEW = 6;

export function Services({ model }: Props) {
    const [expanded, setExpanded] = useState(false);
    if (model.services.length === 0) return null;
    const wa = model.whatsappNumber;
    const visible = expanded ? model.services : model.services.slice(0, SERVICES_PREVIEW);

    return (
        <Section
            id="servicios"
            title="Servicios"
            icon={Sparkles}
            description={wa ? 'Toca un servicio para pedir información por WhatsApp.' : undefined}
        >
            <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                {visible.map((service, i) => {
                    const content = (
                        <>
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand-ink">
                                <Check className="size-4" aria-hidden />
                            </span>
                            <span className="flex-1 font-medium">{service}</span>
                        </>
                    );
                    return (
                        <li key={`${service}-${i}`}>
                            {wa ? (
                                <a
                                    href={buildWhatsAppUrl(wa, `Hola, me interesa: ${service}`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 rounded-xl border bg-background p-3.5 transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
                                >
                                    {content}
                                    <MessageCircle className="size-4 text-muted-foreground group-hover:text-brand-ink" aria-hidden />
                                    <span className="sr-only">Pedir información por WhatsApp</span>
                                </a>
                            ) : (
                                <div className="flex items-center gap-3 rounded-xl border bg-background p-3.5 sm:p-4">{content}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
            {model.services.length > SERVICES_PREVIEW && (
                <ShowMore
                    expanded={expanded}
                    onToggle={() => setExpanded((v) => !v)}
                    total={model.services.length}
                    noun="todos los servicios"
                />
            )}
        </Section>
    );
}

// ─── Sobre nosotros ──────────────────────────────────────────────────────────
const HISTORY_CLAMP_CHARS = 280;

export function About({ model }: Props) {
    const [showFullHistory, setShowFullHistory] = useState(false);
    if (!hasAbout(model)) return null;
    const { history, mission, vision, values, stats } = model;
    const longHistory = history.length > HISTORY_CLAMP_CHARS;
    const hasDetails = Boolean(mission || vision || values.length);

    return (
        <Section id="nosotros" title="Sobre nosotros" icon={Users}>
            <div className={cn('grid gap-8', hasDetails && 'lg:grid-cols-[1.2fr_1fr] lg:gap-10')}>
                <div>
                    {history && (
                        <>
                            <p
                                className={cn(
                                    'max-w-prose leading-relaxed whitespace-pre-line text-pretty sm:text-lg',
                                    longHistory && !showFullHistory && 'line-clamp-5'
                                )}
                            >
                                {history}
                            </p>
                            {longHistory && (
                                <button
                                    type="button"
                                    onClick={() => setShowFullHistory((v) => !v)}
                                    aria-expanded={showFullHistory}
                                    className="mt-2 text-sm font-semibold text-brand-ink underline-offset-4 hover:underline"
                                >
                                    {showFullHistory ? 'Leer menos' : 'Leer más'}
                                </button>
                            )}
                        </>
                    )}
                    {stats.length > 0 && (
                        <dl className={cn('grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2.5', history && 'mt-6')}>
                            {stats.map((s, i) => (
                                <div key={s.id ?? i} className="flex flex-col-reverse rounded-xl border bg-background p-3.5">
                                    <dt className="text-xs text-muted-foreground sm:text-sm">{s.label}</dt>
                                    <dd className="text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">{s.value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>

                {/* Misión, visión y valores colapsados: el usuario abre solo lo que le interesa */}
                {hasDetails && (
                    <div className="divide-y self-start rounded-2xl border bg-background">
                        {mission && (
                            <Disclosure title="Misión">
                                <p className="leading-relaxed text-muted-foreground">{mission}</p>
                            </Disclosure>
                        )}
                        {vision && (
                            <Disclosure title="Visión">
                                <p className="leading-relaxed text-muted-foreground">{vision}</p>
                            </Disclosure>
                        )}
                        {values.length > 0 && (
                            <Disclosure title={`Nuestros valores (${values.length})`}>
                                <ul className="space-y-4">
                                    {values.map((v, i) => (
                                        <li key={v.id ?? i} className="flex gap-3">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand-ink">
                                                <ValueIcon name={v.icon} />
                                            </span>
                                            <div>
                                                <p className="font-semibold">{v.title}</p>
                                                {v.description && <p className="mt-0.5 text-sm text-muted-foreground">{v.description}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Disclosure>
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
}

// ─── Opiniones ───────────────────────────────────────────────────────────────
export function Testimonials({ model }: Props) {
    if (model.testimonials.length === 0) return null;
    const rating = getRating(model.testimonials);
    const swipeable = model.testimonials.length > 1;

    return (
        <Section
            id="opiniones"
            title="Opiniones"
            icon={Star}
            description={
                rating ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                        <Stars value={rating.average} />
                        <span className="font-semibold text-foreground">{rating.average.toFixed(1)} de 5</span>
                        <span>· {rating.count} {rating.count === 1 ? 'opinión' : 'opiniones'}</span>
                    </span>
                ) : (
                    'Lo que dicen nuestros clientes.'
                )
            }
        >
            {/* Móvil: tarjetas deslizables horizontalmente (no alargan la página). sm+: cuadrícula */}
            <div
                className={cn(
                    'grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3',
                    swipeable &&
                    '-mx-4 flex snap-x snap-mandatory overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden'
                )}
            >
                {model.testimonials.map((t, i) => (
                    <figure
                        key={t.id ?? i}
                        className={cn(
                            'flex flex-col rounded-2xl border bg-background p-5',
                            swipeable && 'w-[85%] shrink-0 snap-start sm:w-auto'
                        )}
                    >
                        {Number(t.rating) > 0 && <Stars value={Number(t.rating)} />}
                        <blockquote className="mt-3 line-clamp-6 flex-1 leading-relaxed text-pretty">“{t.text}”</blockquote>
                        {t.author && <figcaption className="mt-4 text-sm font-semibold">{t.author}</figcaption>}
                    </figure>
                ))}
            </div>
            {swipeable && (
                <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">Desliza para ver más →</p>
            )}
        </Section>
    );
}

// ─── Preguntas frecuentes ────────────────────────────────────────────────────
const FAQ_PREVIEW = 4;

export function Faq({ model }: Props) {
    const [expanded, setExpanded] = useState(false);
    if (model.faqs.length === 0) return null;
    const visible = expanded ? model.faqs : model.faqs.slice(0, FAQ_PREVIEW);

    return (
        <Section id="preguntas" title="Preguntas frecuentes" icon={CircleHelp}>
            <div className="max-w-3xl divide-y rounded-2xl border bg-background">
                {visible.map((f, i) => (
                    <Disclosure key={f.id ?? i} title={<span className="font-medium">{f.question}</span>}>
                        <p className="leading-relaxed text-muted-foreground whitespace-pre-line">{f.answer}</p>
                    </Disclosure>
                ))}
            </div>
            {model.faqs.length > FAQ_PREVIEW && (
                <ShowMore
                    expanded={expanded}
                    onToggle={() => setExpanded((v) => !v)}
                    total={model.faqs.length}
                    noun="todas las preguntas"
                />
            )}
        </Section>
    );
}

// ─── Datos de pago ───────────────────────────────────────────────────────────
export function Payments({ model, slug }: Props & { slug: string }) {
    if (model.paymentCards.length === 0) return null;
    return (
        <Section
            id="pagos"
            title="Pagos y anticipos"
            icon={CreditCard}
            description="Antes de transferir, verifica que el nombre del beneficiario coincida."
        >
            <div className="grid gap-3 sm:grid-cols-2">
                {model.paymentCards.map((card, i) => (
                    <div key={card.id ?? i} className="rounded-2xl border bg-background p-5">
                        <div className="flex items-center gap-3">
                            <span className="grid size-9 place-items-center rounded-lg bg-brand-muted text-brand-ink">
                                <CreditCard className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0">
                                <p className="font-semibold">{card.bank}</p>
                                <p className="truncate text-sm text-muted-foreground">{card.beneficiary}</p>
                            </div>
                        </div>
                        <dl className="mt-4 space-y-3">
                            {card.clabe && (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <dt className="text-xs text-muted-foreground">CLABE</dt>
                                        <dd className="font-mono text-sm tabular-nums break-all">{card.clabe}</dd>
                                    </div>
                                    <CopyButton value={card.clabe} label="CLABE" />
                                </div>
                            )}
                            {card.cardNumber && (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <dt className="text-xs text-muted-foreground">Tarjeta</dt>
                                        <dd className="font-mono text-sm tabular-nums break-all">{card.cardNumber}</dd>
                                    </div>
                                    <CopyButton value={card.cardNumber} label="tarjeta" />
                                </div>
                            )}
                        </dl>
                    </div>
                ))}
            </div>
            <ShareButton
                path={`/${slug}#pagos`}
                title={`Datos de pago · ${model.name}`}
                label="Compartir datos de pago"
                className="mt-4"
            />
        </Section>
    );
}

// ─── Contacto ────────────────────────────────────────────────────────────────
export function hasContactSection(model: LandingModel) {
    return Boolean(model.hasContact || model.address || model.openingHours || model.coverageAreas.length);
}

export function Contact({ model, slug }: Props & { slug: string }) {
    if (!hasContactSection(model)) return null;

    const rows = [
        model.openingHours && { icon: Clock, label: 'Horario', value: model.openingHours },
        model.address && {
            icon: MapPin, label: 'Dirección', value: model.address, href: buildMapsUrl(model.address), external: true,
        },
        model.coverageAreas.length > 0 && {
            icon: Truck, label: 'Cobertura', value: model.coverageAreas.join(', '),
        },
        model.email && { icon: Mail, label: 'Correo', value: model.email, href: `mailto:${model.email}` },
    ].filter(Boolean) as { icon: LucideIcon; label: string; value: string; href?: string; external?: boolean }[];

    return (
        <Section id="contacto" title="Contacto" icon={Phone}>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
                {rows.length > 0 && (
                    <dl className="divide-y rounded-2xl border bg-background">
                        {rows.map(({ icon: Icon, label, value, href, external }) => (
                            <div key={label} className="flex gap-4 p-4">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-ink">
                                    <Icon className="size-4" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                    <dt className="text-sm text-muted-foreground">{label}</dt>
                                    <dd className="font-medium break-words">
                                        {href ? (
                                            <a
                                                href={href}
                                                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                                className="underline-offset-2 hover:underline"
                                            >
                                                {value}
                                            </a>
                                        ) : (
                                            value
                                        )}
                                    </dd>
                                </div>
                            </div>
                        ))}
                    </dl>
                )}

                {/* En móvil la barra inferior ya ofrece WhatsApp / Llamar: esta tarjeta solo desde sm */}
                {model.hasContact && (
                    <div className="hidden rounded-3xl bg-brand p-6 text-brand-foreground sm:block sm:p-8">
                        <p className="text-2xl font-bold tracking-tight text-balance">¿Tienes alguna pregunta?</p>
                        <p className="mt-2 opacity-90">Escríbenos o llámanos y con gusto te atendemos.</p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                            {model.whatsappNumber && (
                                <WhatsAppLink number={model.whatsappNumber} message={model.whatsappMessage} />
                            )}
                            {model.phoneHref && <CallLink href={model.phoneHref} phone={model.phone} variant="inverted" />}
                        </div>
                    </div>
                )}
            </div>

            <ShareButton
                path={`/${slug}`}
                title={model.name}
                label="Compartir esta página"
                className="mt-6"
            />
        </Section>
    );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export function Footer({ model }: Props) {
    // Deja espacio para la barra de acciones fija en móvil
    const hasActionBar = Boolean(model.whatsappNumber || model.phoneHref);
    return (
        <footer className="border-t bg-muted/40">
            <div
                className={cn(
                    'mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6',
                    hasActionBar && 'pb-28 sm:pb-6'
                )}
            >
                © {new Date().getFullYear()} {model.name}
            </div>
        </footer>
    );
}