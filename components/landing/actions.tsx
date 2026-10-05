'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Copy, MessageCircle, Phone, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildWhatsAppUrl } from '@/lib/landing/model';

export const ctaBase =
    'inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold ' +
    'transition-[background-color,border-color,transform] active:scale-[0.98] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background';

/** Estado "copiado" temporal con limpieza del timer al desmontar. */
function useFlag(ms = 2000) {
    const [on, setOn] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);
    const trigger = () => {
        setOn(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOn(false), ms);
    };
    return [on, trigger] as const;
}

async function copyText(value: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        return false; // sin HTTPS o sin permiso: no rompemos la UI
    }
}

// ─── WhatsApp ────────────────────────────────────────────────────────────────
export function WhatsAppLink({
    number,
    message,
    children = 'Escríbenos por WhatsApp',
    className,
}: {
    number: string;
    message: string;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <a
            href={buildWhatsAppUrl(number, message)}
            target="_blank"
            rel="noopener noreferrer"
            // Verde fijo en todas las paletas: el usuario lo reconoce al instante.
            // green-700 cumple contraste AA con texto blanco (green-600 no).
            className={cn(ctaBase, 'bg-green-700 text-white hover:bg-green-800', className)}
        >
            <MessageCircle className="size-4" aria-hidden />
            {children}
        </a>
    );
}

// ─── Llamar ──────────────────────────────────────────────────────────────────
export function CallLink({
    href,
    phone,
    variant = 'outline',
    iconOnly = false,
    className,
}: {
    href: string;
    phone: string;
    variant?: 'outline' | 'inverted';
    iconOnly?: boolean;
    className?: string;
}) {
    return (
        <a
            href={href}
            aria-label={iconOnly ? `Llamar al ${phone}` : undefined}
            className={cn(
                ctaBase,
                variant === 'outline' &&
                'border border-border bg-background text-foreground hover:border-brand hover:bg-brand-soft',
                variant === 'inverted' &&
                'border border-white/30 bg-transparent text-brand-foreground hover:bg-white/10',
                iconOnly && 'w-12 px-0',
                className
            )}
        >
            <Phone className="size-4" aria-hidden />
            {!iconOnly && <span>Llamar {phone}</span>}
        </a>
    );
}

// ─── Compartir ───────────────────────────────────────────────────────────────
export function ShareButton({
    path,
    title,
    label = 'Compartir',
    iconOnly = false,
    className,
}: {
    path: string;
    title: string;
    label?: string;
    iconOnly?: boolean;
    className?: string;
}) {
    const [copied, flagCopied] = useFlag();

    const handleShare = async () => {
        const url = new URL(path, window.location.origin).toString();
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (err) {
                // AbortError = el usuario cerró el menú; no es un error real
                if (!(err instanceof DOMException && err.name === 'AbortError')) {
                    if (await copyText(url)) flagCopied();
                }
            }
            return;
        }
        if (await copyText(url)) flagCopied();
    };

    const Icon = copied ? Check : Share2;
    const text = copied ? 'Enlace copiado' : label;

    return (
        <button
            type="button"
            onClick={handleShare}
            aria-label={iconOnly ? text : undefined}
            className={cn(
                'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground',
                'transition-colors hover:bg-muted hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                iconOnly && 'w-9 px-0',
                className
            )}
        >
            <Icon className="size-4" aria-hidden />
            {!iconOnly && <span>{text}</span>}
            <span className="sr-only" aria-live="polite">
                {copied ? 'Enlace copiado al portapapeles' : ''}
            </span>
        </button>
    );
}

// ─── Copiar (CLABE, tarjeta) ─────────────────────────────────────────────────
export function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, flagCopied] = useFlag();
    return (
        <button
            type="button"
            onClick={async () => {
                if (await copyText(value.replace(/\s/g, ''))) flagCopied();
            }}
            aria-label={copied ? `${label} copiada` : `Copiar ${label}`}
            className={cn(
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium',
                'transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                copied && 'border-green-700/40 text-green-700 dark:text-green-400'
            )}
        >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? 'Copiado' : 'Copiar'}
        </button>
    );
}