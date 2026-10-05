import type { businessApi } from '@/lib/api/business';
import type { BusinessConfig } from '@/types/finance';

// ─── Paletas ──────────────────────────────────────────────────────────────────
export const PALETTES = ['violeta', 'azul', 'esmeralda', 'terracota', 'rosa', 'grafito'] as const;
export type Palette = (typeof PALETTES)[number];
export const DEFAULT_PALETTE: Palette = 'violeta';

/** Allowlist: cualquier valor desconocido del backend cae en la paleta por defecto. */
export function resolvePalette(value: unknown): Palette {
    return typeof value === 'string' && (PALETTES as readonly string[]).includes(value)
        ? (value as Palette)
        : DEFAULT_PALETTE;
}

// ─── Helpers de saneamiento ──────────────────────────────────────────────────
const DEFAULT_COUNTRY_CODE = '52'; // México: wa.me exige lada internacional

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Solo http(s) o rutas relativas; descarta javascript:, data:, etc. */
function safeUrl(v: unknown): string {
    const s = text(v);
    if (!s) return '';
    if (s.startsWith('/') && !s.startsWith('//')) return s;
    try {
        const { protocol } = new URL(s);
        return protocol === 'https:' || protocol === 'http:' ? s : '';
    } catch {
        return '';
    }
}

function normalizeWhatsApp(v: unknown): string | null {
    const digits = text(v).replace(/\D/g, '');
    if (digits.length === 10) return `${DEFAULT_COUNTRY_CODE}${digits}`;
    if (digits.length >= 11 && digits.length <= 15) return digits;
    return null;
}

function normalizeTel(v: unknown): string | null {
    const tel = text(v).replace(/[^\d+]/g, '');
    return tel.replace(/\D/g, '').length >= 7 ? `tel:${tel}` : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildWhatsAppUrl(number: string, message: string): string {
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildMapsUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// ─── Modelo de vista ─────────────────────────────────────────────────────────
type PublicBusiness = NonNullable<
    Awaited<ReturnType<typeof businessApi.getPublicBusinessBySlug>>
>;

export function toLandingModel(business: PublicBusiness) {
    const c: Partial<BusinessConfig> = business.config ?? {};
    const name = text(business.name) || text(c.name) || 'Nuestro negocio';
    const email = text(c.email);

    const model = {
        name,
        logoUrl: safeUrl(business.logoUrl) || safeUrl(c.logoUrl),
        description: text(c.description),
        address: text(c.address),
        openingHours: text(c.openingHours),
        phone: text(c.phone),
        phoneHref: normalizeTel(c.phone),
        whatsappNumber: normalizeWhatsApp(c.whatsapp),
        whatsappMessage: text(c.whatsappMessage) || `Hola, quiero más información sobre ${name}`,
        email: EMAIL_RE.test(email) ? email : '',
        history: text(c.history),
        mission: text(c.mission),
        vision: text(c.vision),
        services: (c.services ?? []).map(text).filter(Boolean),
        coverageAreas: (c.coverageAreas ?? []).map(text).filter(Boolean),
        paymentCards: (c.paymentCards ?? []).filter((p) => p && (p.clabe || p.cardNumber)),
        gallery: (c.gallery ?? [])
            .map((g) => ({ ...g, url: safeUrl(g?.url) }))
            .filter((g) => Boolean(g.url)),
        values: (c.values ?? []).filter((v) => text(v?.title)),
        stats: (c.stats ?? []).filter((s) => text(String(s?.value ?? '')) && text(s?.label)),
        testimonials: (c.testimonials ?? []).filter((t) => text(t?.text)),
        faqs: (c.faqs ?? []).filter((f) => text(f?.question) && text(f?.answer)),
        // Campo futuro: el admin elegirá la paleta. Hoy cae en el default.
        palette: resolvePalette((c as { palette?: unknown }).palette),
    };

    return {
        ...model,
        hasContact: Boolean(model.whatsappNumber || model.phoneHref || model.email),
    };
}

export type LandingModel = ReturnType<typeof toLandingModel>;

export function getRating(testimonials: LandingModel['testimonials']) {
    const rated = testimonials
        .map((t) => Number(t.rating))
        .filter((r) => Number.isFinite(r) && r > 0)
        .map((r) => Math.min(5, r));
    if (rated.length === 0) return null;
    const average = rated.reduce((a, b) => a + b, 0) / rated.length;
    return { average: Math.round(average * 10) / 10, count: rated.length };
}