import { queryOptions } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';

export function isNotFound(error: unknown): boolean {
    const e = error as { status?: number; response?: { status?: number } } | null;
    return e?.status === 404 || e?.response?.status === 404;
}

/** Landing pública del negocio de esta instancia (no depende de ningún slug). */
export const publicBusinessQuery = () =>
    queryOptions({
        queryKey: ['publicBusiness'] as const,
        queryFn: async () => {
            const data = await businessApi.getPublicBusiness();
            return (data as any).data ?? data;
        },
        staleTime: 1000 * 60 * 10, // 10 min
        // Un 404 no se reintenta; errores de red sí (hasta 2 veces)
        retry: (failureCount, error) => !isNotFound(error) && failureCount < 2,
    });
