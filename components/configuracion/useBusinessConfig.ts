// components/configuracion/useBusinessConfig.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api/finance'
import type { BusinessConfig } from '@/types/finance'

// Campos que se editan en Configuración (las cuentas bancarias van por su propio endpoint)
const EDITABLE_KEYS = [
    'name',
    'phone',
    'whatsapp',
    'email',
    'address',
    'logoUrl',
    'openingHours',
    'services',
    'coverageAreas',
    'termsAndConditions',
    'description',
    'history',
    'mission',
    'vision',
    'whatsappMessage',
] as const

type EditableKey = (typeof EDITABLE_KEYS)[number]
export type ConfigChanges = Partial<Pick<BusinessConfig, EditableKey>>

/**
 * Configuración del negocio + guardado por secciones.
 * Cada sección manda solo sus cambios; se combinan con lo guardado para que,
 * si la API reemplaza el objeto completo, no se borre lo de otras secciones.
 */
export function useBusinessConfig() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['businessConfig'],
        queryFn: () => financeApi.getConfig(),
    })

    const save = useMutation({
        mutationFn: (changes: ConfigChanges) => {
            const current = (query.data ?? {}) as Partial<BusinessConfig>
            const base: ConfigChanges = {}
            for (const key of EDITABLE_KEYS) {
                if (current[key] !== undefined) (base as Record<string, unknown>)[key] = current[key]
            }
            return financeApi.updateConfig({ ...base, ...changes })
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
        onError: (err: unknown) => console.error('[useBusinessConfig] updateConfig', err),
    })

    return { ...query, config: query.data as BusinessConfig | undefined, save, queryClient }
}