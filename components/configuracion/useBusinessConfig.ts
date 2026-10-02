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

    const addGallery = useMutation({
        mutationFn: financeApi.addGalleryItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })

    const updateGallery = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { label?: string; order?: number } }) => financeApi.updateGalleryItem(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })

    const removeGallery = useMutation({
        mutationFn: financeApi.removeGalleryItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })

    // --- Values ---
    const addValue = useMutation({
        mutationFn: financeApi.addValue,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const updateValue = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof financeApi.updateValue>[1] }) => financeApi.updateValue(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const removeValue = useMutation({
        mutationFn: financeApi.removeValue,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })

    // --- Stats ---
    const addStat = useMutation({
        mutationFn: financeApi.addStat,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const updateStat = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof financeApi.updateStat>[1] }) => financeApi.updateStat(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const removeStat = useMutation({
        mutationFn: financeApi.removeStat,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })

    // --- Testimonials ---
    const addTestimonial = useMutation({
        mutationFn: financeApi.addTestimonial,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const updateTestimonial = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof financeApi.updateTestimonial>[1] }) => financeApi.updateTestimonial(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const removeTestimonial = useMutation({
        mutationFn: financeApi.removeTestimonial,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })

    // --- FAQs ---
    const addFaq = useMutation({
        mutationFn: financeApi.addFaq,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const updateFaq = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof financeApi.updateFaq>[1] }) => financeApi.updateFaq(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })
    const removeFaq = useMutation({
        mutationFn: financeApi.removeFaq,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessConfig'] }),
    })

    return { 
        ...query, 
        config: query.data as BusinessConfig | undefined, 
        save, 
        addGallery, 
        updateGallery, 
        removeGallery,
        addValue,
        updateValue,
        removeValue,
        addStat,
        updateStat,
        removeStat,
        addTestimonial,
        updateTestimonial,
        removeTestimonial,
        addFaq,
        updateFaq,
        removeFaq,
        queryClient 
    }
}