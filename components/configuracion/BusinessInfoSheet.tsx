// components/configuracion/BusinessInfoSheet.tsx
'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { formatMxPhone, toMxPhone } from '@/lib/display'
import type { BusinessConfig } from '@/types/finance'
import { cn } from '@/lib/utils'
import { financeApi } from '@/lib/api/finance'
import { EditorSheet, FormField, INPUT_CLASS } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'

const FORM_ID = 'business-info-form'
const validPhone = (v?: string) => !v?.trim() || toMxPhone(v) !== null
const TEXTAREA_CLASS = "min-h-[100px] resize-none text-[15px] p-3 border-gray-200 focus-visible:ring-1 focus-visible:ring-violet-500 rounded-xl"

const schema = yup.object({
    name: yup.string().trim().required('Escribe el nombre de tu negocio').max(100, 'Máximo 100 caracteres'),
    phone: yup.string().trim().max(20).test('phone', 'Escribe un teléfono de 10 dígitos', validPhone),
    sameWhatsapp: yup.boolean().required(),
    whatsapp: yup
        .string()
        .trim()
        .max(20)
        .when('sameWhatsapp', {
            is: false,
            then: (s) => s.test('wa', 'Escribe un WhatsApp de 10 dígitos', validPhone),
        }),
    whatsappMessage: yup.string().trim().max(500, 'Máximo 500 caracteres').nullable(),
    address: yup.string().trim().max(200, 'Máximo 200 caracteres'),
    openingHours: yup.string().trim().max(100, 'Máximo 100 caracteres'),
    email: yup.string().trim().email('Revisa el correo, por ejemplo contacto@minegocio.com').max(120),
})

function toFormValues(c?: BusinessConfig) {
    const phone = toMxPhone(c?.phone)
    const wa = toMxPhone(c?.whatsapp)
    return {
        name: c?.name ?? '',
        phone: phone ? formatMxPhone(phone) : c?.phone ?? '',
        sameWhatsapp: !c?.whatsapp || (wa !== null && wa === phone),
        whatsapp: wa ? formatMxPhone(wa) : c?.whatsapp ?? '',
        whatsappMessage: c?.whatsappMessage ?? '',
        address: c?.address ?? '',
        openingHours: c?.openingHours ?? '',
        email: c?.email ?? '',
    }
}

export function BusinessInfoSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, save, queryClient } = useBusinessConfig()
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(config?.logoUrl ?? null)
    const [isUploading, setIsUploading] = useState(false)

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty },
    } = useForm({ resolver: yupResolver(schema), defaultValues: toFormValues(config) })

    // Se llena solo al abrir
    useEffect(() => {
        if (open) {
            reset(toFormValues(config))
            setLogoFile(null)
            setLogoPreview(config?.logoUrl ?? null)
        }
    }, [open, reset, config])

    const sameWhatsapp = watch('sameWhatsapp')

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo es muy pesado (máximo 10MB)')
            return
        }
        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
    }

    const onSubmit = handleSubmit(async (v) => {
        if (!isDirty && !logoFile) return onOpenChange(false)

        try {
            setIsUploading(true)

            // Si hay un logo nuevo, lo subimos primero
            if (logoFile) {
                await financeApi.uploadLogo(logoFile)
                // Opcional: Invalida la cache local si el API no devuelve todo el config actualizado
                queryClient.invalidateQueries({ queryKey: ['business-config'] })
            }

            const phone = toMxPhone(v.phone)
            const wa = v.sameWhatsapp ? phone : toMxPhone(v.whatsapp)

            save.mutate(
                {
                    name: v.name,
                    phone: phone ?? '',
                    whatsapp: wa ? `52${wa}` : '',
                    whatsappMessage: v.whatsappMessage || null,
                    address: v.address ?? '',
                    openingHours: v.openingHours ?? '',
                    email: v.email ?? '',
                },
                {
                    onSuccess: () => {
                        toast.success('Datos del negocio guardados')
                        onOpenChange(false)
                    },
                    onError: () => toast.error('No se pudo guardar', { description: 'Revisa tu conexión e intenta de nuevo.' }),
                    onSettled: () => setIsUploading(false)
                }
            )
        } catch (error) {
            console.error('Error al guardar', error)
            toast.error('Error al subir el logotipo')
            setIsUploading(false)
        }
    })

    const invalid = (field: keyof typeof errors, baseClass = INPUT_CLASS) => ({
        'aria-invalid': Boolean(errors[field]),
        'aria-describedby': errors[field] ? `${field}-error` : undefined,
        className: cn(baseClass, errors[field] && 'border-destructive'),
    })

    return (
        <EditorSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Datos del negocio"
            description="Aparecen en el portal público y en tus documentos."
            formId={FORM_ID}
            saveLabel={isUploading ? "Guardando..." : "Guardar datos"}
            isDirty={isDirty || logoFile !== null}
            isPending={save.isPending || isUploading}
        >
            <form id={FORM_ID} noValidate onSubmit={onSubmit} className="space-y-6">

                {/* Logo Upload Section */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900 block">Logotipo</label>
                    <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                            {logoPreview ? (
                                <>
                                    <Image src={logoPreview} alt="Logo preview" fill className="object-contain p-2" />
                                </>
                            ) : (
                                <ImagePlus className="h-6 w-6 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <label htmlFor="logo-upload" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 active:scale-95">
                                Subir logotipo
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                            </label>
                            <p className="mt-1.5 text-xs text-gray-500">
                                JPG, PNG o WebP. Máximo 10MB.
                            </p>
                        </div>
                    </div>
                </div>

                <FormField id="name" label="Nombre del negocio" error={errors.name?.message}>
                    <Input id="name" autoComplete="organization" maxLength={100} placeholder="Ej. Eventos Mendoza" {...invalid('name')} {...register('name')} />
                </FormField>

                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <FormField id="phone" label="Teléfono" error={errors.phone?.message}>
                        <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="656 123 4567" {...invalid('phone')} {...register('phone')} />
                    </FormField>

                    <label htmlFor="sameWhatsapp" className="flex min-h-11 items-center justify-between gap-3 text-[15px]">
                        Mi WhatsApp es el mismo número
                        <Controller
                            control={control}
                            name="sameWhatsapp"
                            render={({ field }) => <Switch id="sameWhatsapp" checked={field.value} onCheckedChange={field.onChange} />}
                        />
                    </label>

                    {!sameWhatsapp && (
                        <FormField id="whatsapp" label="WhatsApp" error={errors.whatsapp?.message}>
                            <Input id="whatsapp" type="tel" inputMode="tel" maxLength={20} placeholder="656 123 4567" {...invalid('whatsapp')} {...register('whatsapp')} />
                        </FormField>
                    )}

                    <FormField id="whatsappMessage" label="Mensaje de WhatsApp" hint="El cliente verá este mensaje pre-llenado al contactarte" error={errors.whatsappMessage?.message}>
                        <Textarea id="whatsappMessage" maxLength={500} placeholder="Hola, quiero cotizar la renta de mobiliario." {...invalid('whatsappMessage', TEXTAREA_CLASS)} {...register('whatsappMessage')} />
                    </FormField>
                </div>

                <FormField id="address" label="Dirección" error={errors.address?.message}>
                    <Input id="address" autoComplete="street-address" maxLength={200} placeholder="Ej. Av. Juárez 123, Col. Centro" {...invalid('address')} {...register('address')} />
                </FormField>

                <FormField id="openingHours" label="Horario" error={errors.openingHours?.message}>
                    <Input id="openingHours" maxLength={100} placeholder="Ej. Lunes a sábado, 9 a 8" {...invalid('openingHours')} {...register('openingHours')} />
                </FormField>

                <FormField id="email" label="Correo" error={errors.email?.message}>
                    <Input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" maxLength={120} placeholder="contacto@minegocio.com" {...invalid('email')} {...register('email')} />
                </FormField>
            </form>
        </EditorSheet>
    )
}