// components/inventario/modals/LocationFormSheet.tsx
// Alta y edición de una ubicación en el mismo formulario.
'use client'

import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { inventarioApi } from '@/lib/inventario/api'
import { cn } from '@/lib/utils'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LABEL, TOUCH } from '@/components/ui/detail'
import { LOCATION_TYPE_LABEL } from '@/lib/inventario/labels'
import type { InventoryLocation, InventoryLocationType } from '@/lib/inventario/types'

const TYPES = Object.keys(LOCATION_TYPE_LABEL) as InventoryLocationType[]

const locationSchema = yup.object({
  name: yup.string().trim().required('Escribe un nombre').max(100, 'Máximo 100 caracteres'),
  type: yup.string().oneOf(TYPES).required(),
})

interface LocationFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sin ubicación: alta nueva. Con ubicación: edición. */
  location?: InventoryLocation | null
}

export default function LocationFormSheet({ open, onOpenChange, location }: LocationFormSheetProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(location)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(locationSchema), defaultValues: { type: 'warehouse' } })

  const type = watch('type') as InventoryLocationType

  useEffect(() => {
    if (open) reset({ name: location?.name ?? '', type: location?.type ?? 'warehouse' })
  }, [open, location, reset])

  const saveMutation = useMutation({
    mutationFn: (data: { name: string; type: InventoryLocationType }) =>
      location ? inventarioApi.updateLocation(location.id, data) : inventarioApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'locations'] })
      // Los artículos muestran el nombre de su ubicación
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] })
      toast.success(isEditing ? 'Cambios guardados' : 'Ubicación creada')
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      console.error('[LocationFormSheet] save', err)
      const message = err instanceof Error && err.message ? err.message : 'Revisa tu conexión e intenta de nuevo.'
      toast.error('No se pudo guardar', { description: message })
    },
  })

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar ubicación' : 'Nueva ubicación'}
      footer={
        <Button type="submit" form="location-form" className={cn(TOUCH, 'w-full')} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Guardando…
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Guardar ubicación'
          )}
        </Button>
      }
    >
      <form
        id="location-form"
        noValidate
        onSubmit={handleSubmit((data) =>
          saveMutation.mutate({ name: data.name, type: data.type as InventoryLocationType })
        )}
        className="space-y-8"
      >
        <div className="space-y-2">
          <label htmlFor="location-name" className={LABEL}>
            Nombre
          </label>
          <Input
            id="location-name"
            autoFocus={!isEditing}
            autoComplete="off"
            maxLength={100}
            placeholder="Ej. Bodega principal"
            aria-invalid={Boolean(errors.name)}
            className={cn('h-12 rounded-xl text-base', errors.name && 'border-destructive')}
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <section className="space-y-3">
          <h3 className={LABEL}>¿Qué es?</h3>
          <div role="group" aria-label="Tipo de ubicación" className="grid grid-cols-3 gap-2">
            {TYPES.map((value) => (
              <Button
                key={value}
                type="button"
                variant={type === value ? 'default' : 'outline'}
                aria-pressed={type === value}
                onClick={() => setValue('type', value)}
                className={cn(TOUCH, 'px-2')}
              >
                {LOCATION_TYPE_LABEL[value]}
              </Button>
            ))}
          </div>
        </section>
      </form>
    </AppBottomSheet>
  )
}
