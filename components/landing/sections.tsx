'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import {
    Award, Check, ChevronDown, Clock, CreditCard, Heart, Leaf, Mail, MapPin, MessageCircle,
    ShieldCheck, Smile, Sparkles, Star, ThumbsUp, Truck, Users, Zap, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    buildMapsUrl, buildWhatsAppUrl, getRating, type LandingModel,
} from '@/lib/landing/model';
import { CallLink, CopyButton, ShareButton, WhatsAppLink } from './actions';

type Props = { model: LandingModel };

// ─── Base ────────────────────────────────────────────────────────────────────
function Section({
    id, title, description, children, className,
}: {
    id: string; title: string; description?: string; children: ReactNode; className?: string;
}) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-20 py-12 sm:py-16', className)}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-8 max-w-2xl">
                    <h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                        {title}
                    </h2>
                    {description && <p className="mt-2 text-muted-foreground text-pretty">{description}</p>}
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

// ─── Hero ────────────────────────────────────────────────────────────────────
export function Hero({ model }: Props) {
    const cover = model.gallery[0];
    const rating = getRating(model.testimonials);
    const hasVisual = Boolean(cover || model.logoUrl);

    return (
        <section id="inicio" className="border-b bg-brand-soft">
            <div
                className={cn(
                    'mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:py-16',
                    hasVisual && 'lg:grid-cols-[1.1fr_1fr] lg:items-center'
                )}
            >
                <div>
                    {model.openingHours && (
                        <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
                            <Clock className="size-4 text-brand-ink" aria-hidden />
                            {model.openingHours}
                        </p>
                    )}

                    <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        {model.name}
                    </h1>

                    {model.description && (
                        <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted-foreground text-pretty">
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
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            {model.whatsappNumber && (
                                <WhatsAppLink number={model.whatsappNumber} message={model.whatsappMessage} />
                            )}
                            {model.phoneHref && <CallLink href={model.phoneHref} phone={model.phone} />}
                        </div>
                    ) : (
                        <p className="mt-8 text-sm text-muted-foreground">
                            Este negocio aún no ha publicado sus datos de contacto.
                        </p>
                    )}

                    {model.address && (
                        <a
                            href={buildMapsUrl(model.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
                            <span>
                                {model.address} <span className="underline underline-offset-2">Ver en el mapa</span>
                            </span>
                        </a>
                    )}
                </div>

                {cover ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-xl ring-1 ring-black/5">
                        <Image
                            src={cover.url}
                            alt={cover.alt ?? cover.label ?? `Foto de ${model.name}`}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                        {model.logoUrl && (
                            <div className="absolute bottom-4 left-4 size-16 rounded-2xl bg-background p-2 shadow-lg">
                                <div className="relative size-full">
                                    <Image src={model.logoUrl} alt="" fill sizes="64px" className="object-contain" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : model.logoUrl ? (
                    <div className="relative mx-auto aspect-square w-full max-w-xs rounded-3xl bg-background shadow-sm ring-1 ring-border">
                        <Image
                            src={model.logoUrl}
                            alt={`Logotipo de ${model.name}`}
                            fill
                            priority
                            sizes="320px"
                            className="object-contain p-10"
                        />
                    </div>
                ) : null}
            </div>
        </section>
    );
}

// ─── Servicios ───────────────────────────────────────────────────────────────
export function Services({ model }: Props) {
    if (model.services.length === 0) return null;
    const wa = model.whatsappNumber;

    return (
        <Section
            id="servicios"
            title="Servicios"
            description={wa ? 'Toca un servicio para pedir información por WhatsApp.' : undefined}
        >
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {model.services.map((service, i) => {
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
                                    className="group flex items-center gap-3 rounded-xl border bg-background p-4 transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {content}
                                    <MessageCircle className="size-4 text-muted-foreground group-hover:text-brand-ink" aria-hidden />
                                    <span className="sr-only">Pedir información por WhatsApp</span>
                                </a>
                            ) : (
                                <div className="flex items-center gap-3 rounded-xl border bg-background p-4">{content}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Section>
    );
}

// ─── Sobre nosotros ──────────────────────────────────────────────────────────
export function About({ model }: Props) {
    const { history, mission, vision, values, stats } = model;
    if (!history && !mission && !vision && !values.length && !stats.length) return null;

    return (
        <Section id="nosotros" title="Sobre nosotros" className="border-y bg-muted/40">
            <div className={cn('grid gap-10', (mission || vision) && 'lg:grid-cols-[1.2fr_1fr]')}>
                <div>
                    {history && (
                        <p className="max-w-prose text-lg leading-relaxed whitespace-pre-line text-pretty">{history}</p>
                    )}
                    {stats.length > 0 && (
                        <dl className={cn('grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-6', history && 'mt-8 border-t pt-6')}>
                            {stats.map((s, i) => (
                                <div key={s.id ?? i} className="flex flex-col-reverse">
                                    <dt className="text-sm text-muted-foreground">{s.label}</dt>
                                    <dd className="text-3xl font-bold tracking-tight text-brand-ink">{s.value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>

                {(mission || vision) && (
                    <div className="space-y-6">
                        {mission && (
                            <div className="border-l-2 border-brand pl-4">
                                <h3 className="font-semibold">Misión</h3>
                                <p className="mt-1 text-muted-foreground">{mission}</p>
                            </div>
                        )}
                        {vision && (
                            <div className="border-l-2 border-brand pl-4">
                                <h3 className="font-semibold">Visión</h3>
                                <p className="mt-1 text-muted-foreground">{vision}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {values.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-lg font-semibold">Nuestros valores</h3>
                    <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {values.map((v, i) => (
                            <li key={v.id ?? i} className="flex gap-4">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-ink">
                                    <ValueIcon name={v.icon} />
                                </span>
                                <div>
                                    <p className="font-semibold">{v.title}</p>
                                    {v.description && <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Section>
    );
}

// ─── Opiniones ───────────────────────────────────────────────────────────────
export function Testimonials({ model }: Props) {
    if (model.testimonials.length === 0) return null;
    return (
        <Section id="opiniones" title="Lo que dicen nuestros clientes">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {model.testimonials.map((t, i) => (
                    <figure key={t.id ?? i} className="flex flex-col rounded-2xl border bg-background p-5">
                        {Number(t.rating) > 0 && <Stars value={Number(t.rating)} />}
                        <blockquote className="mt-3 flex-1 leading-relaxed text-pretty">“{t.text}”</blockquote>
                        {t.author && <figcaption className="mt-4 text-sm font-semibold">{t.author}</figcaption>}
                    </figure>
                ))}
            </div>
        </Section>
    );
}

// ─── Preguntas frecuentes ────────────────────────────────────────────────────
export function Faq({ model }: Props) {
    if (model.faqs.length === 0) return null;
    return (
        <Section id="preguntas" title="Preguntas frecuentes" className="border-y bg-muted/40">
            <div className="max-w-3xl divide-y rounded-2xl border bg-background">
                {model.faqs.map((f, i) => (
                    <details key={f.id ?? i} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring rounded-2xl">
                            {f.question}
                            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                        </summary>
                        <p className="px-5 pb-5 leading-relaxed text-muted-foreground whitespace-pre-line">{f.answer}</p>
                    </details>
                ))}
            </div>
        </Section>
    );
}

// ─── Datos de pago ───────────────────────────────────────────────────────────
export function Payments({ model, slug }: Props & { slug: string }) {
    if (model.paymentCards.length === 0) return null;
    return (
        <Section
            id="pagos"
            title="Datos para pagos y anticipos"
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
        <Section id="contacto" title="Contacto" className="border-t bg-muted/40">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
                {rows.length > 0 && (
                    <dl className="space-y-5">
                        {rows.map(({ icon: Icon, label, value, href, external }) => (
                            <div key={label} className="flex gap-4">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background text-brand-ink ring-1 ring-border">
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

                {model.hasContact && (
                    <div className="rounded-3xl bg-brand p-6 text-brand-foreground sm:p-8">
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
                className="mt-8"
            />
        </Section>
    );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export function Footer({ model }: Props) {
    return (
        <footer className="border-t">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6">
                © {new Date().getFullYear()} {model.name}
            </div>
        </footer>
    );
}