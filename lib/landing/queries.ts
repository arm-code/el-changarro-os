import { queryOptions } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';

/** Slug válido: minúsculas/números/guiones, 1–64 caracteres. Se valida antes de llamar al backend. */
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/i;

export function isNotFound(error: unknown): boolean {
    const e = error as { status?: number; response?: { status?: number } } | null;
    return e?.status === 404 || e?.response?.status === 404;
}

export const publicBusinessQuery = (slug: string) =>
    queryOptions({
        queryKey: ['publicBusiness', slug] as const,
        queryFn: async () => {
            const data = await businessApi.getPublicBusinessBySlug(slug);
            return (data as any).data ?? data;
        },
        staleTime: 1000 * 60 * 10, // 10 min
        // Un 404 no se reintenta; errores de red sí (hasta 2 veces)
        retry: (failureCount, error) => !isNotFound(error) && failureCount < 2,
    });