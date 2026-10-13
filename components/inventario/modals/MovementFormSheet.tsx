// components/inventario/modals/MovementFormSheet.tsx
'use client'

import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { inventarioApi } from '@/lib/inventario/api'
import { parseAmount } from '@/lib/display'
import { cn } from '@/lib/utils'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LABEL, TOUCH } from '@/components/ui/detail'
import type { CreateInventoryMovementDto, InventoryMovementType } from '@/lib/inventario/types'

/* ─── Tipos de movimiento ───────────────────────────────────────────────── */

interface TypeConfig {
  value: InventoryMovementType
  label: string
  /** Pregunta sobre la cantidad. */
  question: string
  /** Una línea que aclara qué hace el movimiento. */
  hint: string
  needsOrigin: boolean
  needsDestination: boolean
  originLabel: string
  destinationLabel: string
  /** Motivo que se usa si la persona no escribe uno. */
  defaultReason: string
  reasonPlaceholder: string
}

const TYPES: readonly TypeConfig[] = [
  {
    value: 'in',
    label: 'Entrada',
    question: '¿Cuántos entran?',
    hint: 'Suma artículos a tu inventario.',
    needsOrigin: false,
    needsDestination: true,
    originLabel: '',
    destinationLabel: 'A dónde entran',
    defaultReason: 'Entrada de inventario',
    reasonPlaceholder: 'Ej. Compra a proveedor',
  },
  {
    value: 'out',
    label: 'Salida',
    question: '¿Cuántos salen?',
    hint: 'Resta artículos de tu inventario.',
    needsOrigin: true,
    needsDestination: false,
    originLabel: 'De dónde salen',
    destinationLabel: '',
    defaultReason: 'Salida de inventario',
    reasonPlaceholder: 'Ej. Se rompieron o se vendieron',
  },
  {
    value: 'transfer',
    label: 'Traspaso',
    question: '¿Cuántos mueves?',
    hint: 'Cambia artículos de un lugar a otro.',
    needsOrigin: true,
    needsDestination: true,
    originLabel: 'De dónde salen',
    destinationLabel: 'A dónde llegan',
    defaultReason: 'Traspaso entre ubicaciones',
    reasonPlaceholder: 'Ej. Se llevan al salón',
  },
  {
    value: 'adjustment',
    label: 'Ajuste',
    question: '¿Cuántos hay en total?',
    hint: 'Corrige el total: esta cantidad reemplaza lo que tenías.',
    needsOrigin: true,
    needsDestination: false,
    originLabel: 'Dónde están',
    destinationLabel: '',
    defaultReason: 'Ajuste de inventario',
    reasonPlaceholder: 'Ej. Conteo físico',
  },
]

/* ─── Validación ────────────────────────────────────────────────────────── */

const movementSchema = yup.object({
  type: yup.string().oneOf(TYPES.map((t) => t.value)).required(),
  itemId: yup.string().required('Elige un artículo'),
  quantity: yup
    .number()
    .transform((_, original) => parseAmount(original))
    .typeError('Escribe una cantidad, por ejemplo 10')
    .min(0, 'La cantidad no puede ser negativa')
    .max(1_000_000, 'Revisa la cantidad, parece demasiado alta')
    .required('Escribe una cantidad'),
  originLocationId: yup.string().optional(),
  destinationLocationId: yup.string().optional(),
  reason: yup.string().trim().max(255, 'Máximo 255 caracteres').optional(),
})

type MovementFormData = yup.InferType<typeof movementSchema>

/* ─── Componente ────────────────────────────────────────────────────────── */

interface MovementFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MovementFormSheet({ open, onOpenChange }: MovementFormSheetProps) {
  const queryClient = useQueryClient()

  const itemsQuery = useQuery({
    queryKey: ['inventory', 'items', 'for-movements'],
    queryFn: () => inventarioApi.getItems({ limit: 100 }),
    enabled: open,
  })
  const locationsQuery = useQuery({
    queryKey: ['inventory', 'locations'],
    queryFn: () => inventarioApi.getLocations(),
    enabled: open,
  })
  const items = useMemo(() => itemsQuery.data?.items ?? [], [itemsQuery.data])
  const locations = useMemo(() => locationsQuery.data ?? [], [locationsQuery.data])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(movementSchema),
    defaultValues: { type: 'in' },
  })

  const type = watch('type') as InventoryMovementType
  const itemId = watch('itemId')
  const originLocationId = watch('originLocationId')
  const destinationLocationId = watch('destinationLocationId')
  const quantity = parseAmount(watch('quantity'))
  const config = TYPES.find((t) => t.value === type) ?? TYPES[0]

  useEffect(() => {
    if (open) reset({ type: 'in' })
  }, [open, reset])

  // Con una sola ubicación no hay nada que decidir
  useEffect(() => {
    if (!open || locations.length !== 1) return
    const only = locations[0].id
    if (config.needsOrigin && !originLocationId) setValue('originLocationId', only)
    if (config.needsDestination && !destinationLocationId) setValue('destinationLocationId', only)
  }, [open, locations, config, originLocationId, destinationLocationId, setValue])

  const createMutation = useMutation({
    mutationFn: (dto: CreateInventoryMovementDto) => inventarioApi.createMovement(dto),
    onSuccess: () => {
      // El movimiento cambia las existencias: se refresca también la lista de artículos
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] })
      toast.success('Movimiento guardado')
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      console.error('[MovementFormSheet] createMovement', err)
      const message = err instanceof Error && err.message ? err.message : 'Revisa tu conexión e intenta de nuevo.'
      toast.error('No se pudo guardar', { description: message })
    },
  })

  const onSubmit = handleSubmit((data: MovementFormData) => {
    let invalid = false
    if (data.type !== 'adjustment' && data.quantity <= 0) {
      setError('quantity', { message: 'La cantidad debe ser mayor a 0' })
      invalid = true
    }
    if (config.needsOrigin && !data.originLocationId) {
      setError('originLocationId', { message: 'Elige la ubicación' })
      invalid = true
    }
    if (config.needsDestination && !data.destinationLocationId) {
      setError('destinationLocationId', { message: 'Elige la ubicación' })
      invalid = true
    }
    if (invalid) return

    createMutation.mutate({
      itemId: data.itemId,
      type: data.type as InventoryMovementType,
      quantity: data.quantity,
      reason: data.reason || config.defaultReason,
      ...(config.needsOrigin ? { originLocationId: data.originLocationId } : {}),
      ...(config.needsDestination ? { destinationLocationId: data.destinationLocationId } : {}),
    })
  })

  const saveLabel =
    Number.isFinite(quantity) && quantity > 0
      ? `Guardar ${config.label.toLowerCase()} de ${quantity}`
      : `Guardar ${config.label.toLowerCase()}`

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo movimiento"
      footer={
        <Button type="submit" form="movement-form" className={cn(TOUCH, 'w-full')} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Guardando…
            </>
          ) : (
            saveLabel
          )}
        </Button>
      }
    >
      <form id="movement-form" noValidate onSubmit={onSubmit} className="space-y-8">
        {/* 1. ¿Qué pasó? */}
        <section className="space-y-3">
          <div role="group" aria-label="Tipo de movimiento" className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <Button
                key={t.value}
                type="button"
                variant={type === t.value ? 'default' : 'outline'}
                aria-pressed={type === t.value}
                onClick={() => setValue('type', t.value)}
                className={cn(TOUCH, 'text-base')}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <p className="text-[15px] text-muted-foreground">{config.hint}</p>
        </section>

        {/* 2. ¿Cuál artículo? */}
        <div className="space-y-2">
          <label htmlFor="mov-item" className={LABEL}>
            Artículo
          </label>
          {itemsQuery.isLoading ? (
            <Skeleton className="h-12 w-full rounded-xl" />
          ) : itemsQuery.isError ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
              <p className="text-[15px] text-muted-foreground">No se pudieron cargar tus artículos.</p>
              <Button type="button" variant="outline" onClick={() => itemsQuery.refetch()}>
                Reintentar
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">Primero agrega un artículo para poder moverlo.</p>
          ) : (
            <Select
              value={itemId ?? ''}
              onValueChange={(value) => setValue('itemId', value, { shouldValidate: Boolean(errors.itemId) })}
            >
              <SelectTrigger
                id="mov-item"
                aria-invalid={Boolean(errors.itemId)}
                className={cn('h-12 rounded-xl text-base', errors.itemId && 'border-destructive')}
              >
                <SelectValue placeholder="Elige un artículo" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="min-h-11 text-base">
                    {item.name}
                    {item.sku && <span className="ml-1.5 text-sm text-muted-foreground">{item.sku}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.itemId && <p className="text-sm text-destructive">{errors.itemId.message}</p>}
        </div>

        {/* 3. ¿Cuántos? — lo que siempre cambia */}
        <div className="rounded-xl bg-muted/60 px-4 py-4 focus-within:ring-[3px] focus-within:ring-ring/50">
          <label htmlFor="mov-quantity" className={LABEL}>
            {config.question}
          </label>
          <input
            id="mov-quantity"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            placeholder="0"
            maxLength={9}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? 'mov-quantity-error' : undefined}
            className="mt-1 w-full min-w-0 bg-transparent text-4xl font-semibold tabular-nums tracking-tight outline-none placeholder:text-muted-foreground/40"
            {...register('quantity')}
            onKeyDown={(e) => {
              // Enter cierra el teclado para ver lo que sigue; no guarda por accidente
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
          />
          {errors.quantity && (
            <p id="mov-quantity-error" className="mt-2 text-sm text-destructive">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* 4. ¿Dónde? */}
        {config.needsOrigin && (
          <LocationPicker
            label={config.originLabel}
            locations={locations}
            loading={locationsQuery.isLoading}
            value={originLocationId}
            error={errors.originLocationId?.message}
            onChange={(id) => setValue('originLocationId', id, { shouldValidate: Boolean(errors.originLocationId) })}
          />
        )}
        {config.needsDestination && (
          <LocationPicker
            label={config.destinationLabel}
            locations={locations}
            loading={locationsQuery.isLoading}
            value={destinationLocationId}
            error={errors.destinationLocationId?.message}
            onChange={(id) =>
              setValue('destinationLocationId', id, { shouldValidate: Boolean(errors.destinationLocationId) })
            }
          />
        )}

        {/* 5. Motivo — opcional, al final */}
        <div className="space-y-2">
          <label htmlFor="mov-reason" className={LABEL}>
            Motivo <span className="font-normal">(opcional)</span>
          </label>
          <Input
            id="mov-reason"
            autoComplete="off"
            maxLength={255}
            placeholder={config.reasonPlaceholder}
            className="h-12 rounded-xl text-base"
            {...register('reason')}
          />
          {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
        </div>
      </form>
    </AppBottomSheet>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function LocationPicker({
  label,
  locations,
  loading,
  value,
  error,
  onChange,
}: {
  label: string
  locations: { id: string; name: string }[]
  loading: boolean
  value?: string
  error?: string
  onChange: (id: string) => void
}) {
  return (
    <section className="space-y-3">
      <h3 className={LABEL}>{label}</h3>
      {loading ? (
        <div className="flex gap-2" aria-busy="true" aria-label="Cargando ubicaciones">
          <Skeleton className="h-12 w-28 rounded-xl" />
          <Skeleton className="h-12 w-28 rounded-xl" />
        </div>
      ) : locations.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">Aún no tienes ubicaciones. Crea una en Ajustes.</p>
      ) : (
        <div role="group" aria-label={label} className="flex flex-wrap gap-2">
          {locations.map((l) => (
            <Button
              key={l.id}
              type="button"
              variant={value === l.id ? 'default' : 'outline'}
              aria-pressed={value === l.id}
              onClick={() => onChange(l.id)}
              className={cn(TOUCH, 'px-4')}
            >
              <span className="truncate">{l.name}</span>
            </Button>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
