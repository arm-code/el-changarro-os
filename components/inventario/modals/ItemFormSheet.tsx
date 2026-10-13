// components/inventario/modals/ItemFormSheet.tsx
// Alta y edición de un artículo en el mismo formulario.
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { inventarioApi } from '@/lib/inventario/api'
import { parseAmount, toSlug } from '@/lib/display'
import { cn } from '@/lib/utils'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { LABEL, TOUCH } from '@/components/ui/detail'
import type {
  CategoryAttribute,
  CreateInventoryItemDto,
  InventoryCategory,
  InventoryItem,
  InventoryItemStatus,
  InventoryItemType,
  InventoryLocation,
  UpdateInventoryItemDto,
} from '@/lib/inventario/types'

/* ─── Catálogos de opciones ─────────────────────────────────────────────── */

const ITEM_TYPES: readonly { value: InventoryItemType; label: string }[] = [
  { value: 'product', label: 'Producto' },
  { value: 'serialized', label: 'Con número de serie' },
  { value: 'combo', label: 'Combo' },
  { value: 'consumable', label: 'Consumible' },
  { value: 'service', label: 'Servicio' },
]

// Los demás estados (dañado, perdido) se asignan por otros procesos
const EDITABLE_STATUSES: readonly { value: InventoryItemStatus; label: string }[] = [
  { value: 'available', label: 'Disponible' },
  { value: 'maintenance', label: 'En mantenimiento' },
  { value: 'retired', label: 'Retirado' },
]

/** Tipos que llevan existencias al darlos de alta. */
const STOCKABLE: readonly InventoryItemType[] = ['product', 'consumable', 'serialized']

type AttributeValue = string | number | boolean | null

/** El código es opcional para quien captura: se arma con el nombre y un sufijo corto. */
function generateSku(name: string): string {
  const base = toSlug(name, 'item').toUpperCase().replace(/-/g, '_').slice(0, 14)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}-${suffix}`
}

/* ─── Validación ────────────────────────────────────────────────────────── */

const optionalAmount = (message: string) =>
  yup
    .number()
    .transform((_, original) => (original === '' || original == null ? undefined : parseAmount(original)))
    .typeError(message)
    .min(0, 'No puede ser negativo')
    .max(10_000_000, 'Revisa la cantidad, parece demasiado alta')
    .optional()

const itemSchema = yup.object({
  name: yup.string().trim().required('Escribe el nombre').max(100, 'Máximo 100 caracteres'),
  categoryId: yup.string().required('Elige una categoría'),
  sku: yup.string().trim().max(50, 'Máximo 50 caracteres').optional(),
  type: yup.string().oneOf(ITEM_TYPES.map((t) => t.value)).required(),
  rentPrice: optionalAmount('Escribe un precio, por ejemplo 150 o 150.50'),
  salePrice: optionalAmount('Escribe un precio, por ejemplo 150 o 150.50'),
  initialStock: yup
    .number()
    .transform((_, original) => (original === '' || original == null ? undefined : parseAmount(original)))
    .typeError('Escribe un número, por ejemplo 12')
    .integer('Escribe un número entero')
    .min(0, 'No puede ser negativo')
    .max(1_000_000, 'Revisa la cantidad, parece demasiado alta')
    .optional(),
  locationId: yup.string().optional(),
  status: yup.string().optional(),
})

type ItemFormData = yup.InferType<typeof itemSchema>

/* ─── Componente ────────────────────────────────────────────────────────── */

interface ItemFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sin artículo: alta nueva. Con artículo: edición. */
  item?: InventoryItem | null
  categories: InventoryCategory[]
  locations: InventoryLocation[]
}

export default function ItemFormSheet({ open, onOpenChange, item, categories, locations }: ItemFormSheetProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(item)
  const [showMore, setShowMore] = useState(false)
  const [attributes, setAttributes] = useState<Record<string, AttributeValue>>({})
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(itemSchema),
    defaultValues: { type: 'product' },
  })

  const categoryId = watch('categoryId')
  const type = watch('type') as InventoryItemType
  const locationId = watch('locationId')
  const status = watch('status')
  const stockValue = parseAmount(watch('initialStock'))

  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId])
  const categoryAttributes: CategoryAttribute[] = selectedCategory?.attributes ?? []

  // Cada vez que se abre: formulario limpio, o con los datos del artículo
  useEffect(() => {
    if (!open) return
    if (item) {
      reset({
        name: item.name,
        categoryId: item.categoryId,
        sku: item.sku ?? '',
        type: item.type,
        rentPrice: item.rentPrice ?? undefined,
        salePrice: item.salePrice ?? undefined,
        locationId: item.locationId ?? undefined,
        status: item.status,
      })
      setAttributes(item.attributes ?? {})
    } else {
      reset({
        type: 'product',
        // Con una sola ubicación no hay nada que decidir
        locationId: locations.length === 1 ? locations[0].id : undefined,
      })
      setAttributes({})
    }
    setAttributeErrors({})
    setShowMore(false)
  }, [open, item, locations, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      const base = {
        name: data.name,
        categoryId: data.categoryId,
        type: data.type as InventoryItemType,
        locationId: data.locationId || undefined,
        rentPrice: data.rentPrice,
        salePrice: data.salePrice,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      }

      if (item) {
        const payload: UpdateInventoryItemDto = {
          ...base,
          sku: data.sku || item.sku,
          status: data.status as InventoryItemStatus | undefined,
        }
        return inventarioApi.updateItem(item.id, payload)
      }

      const payload: CreateInventoryItemDto = {
        ...base,
        sku: data.sku || generateSku(data.name),
        initialStock:
          STOCKABLE.includes(base.type) && data.initialStock && data.initialStock > 0 ? data.initialStock : undefined,
      }
      return inventarioApi.createItem(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] })
      toast.success(isEditing ? 'Cambios guardados' : 'Artículo creado')
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      console.error('[ItemFormSheet] save', err)
      const message = err instanceof Error && err.message ? err.message : 'Revisa tu conexión e intenta de nuevo.'
      toast.error('No se pudo guardar', { description: message })
    },
  })

  const onSubmit = handleSubmit((data) => {
    // Las características dependen de la categoría; se validan aparte
    const missing: Record<string, string> = {}
    for (const attr of categoryAttributes) {
      const value = attributes[attr.name]
      if (attr.required && attr.type !== 'boolean' && (value === undefined || value === null || value === '')) {
        missing[attr.name] = 'Este dato es obligatorio'
      }
    }
    setAttributeErrors(missing)
    if (Object.keys(missing).length > 0) return

    saveMutation.mutate(data)
  })

  const pickCategory = (id: string) => {
    if (id !== categoryId) setAttributes({}) // las características son de cada categoría
    setAttributeErrors({})
    setValue('categoryId', id, { shouldValidate: Boolean(errors.categoryId) })
  }

  const setAttribute = (name: string, value: AttributeValue) => {
    setAttributes((prev) => ({ ...prev, [name]: value }))
    setAttributeErrors((prev) => {
      if (!prev[name]) return prev
      const { [name]: _removed, ...rest } = prev
      return rest
    })
  }

  const canHaveStock = !isEditing && STOCKABLE.includes(type)
  const hasStock = Number.isFinite(stockValue) && stockValue > 0
  const askLocation = locations.length > 0 && (isEditing || (canHaveStock && hasStock))
  const moreOpen = showMore || Boolean(errors.sku || errors.salePrice)

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar artículo' : 'Nuevo artículo'}
      footer={
        <Button type="submit" form="item-form" className={cn(TOUCH, 'w-full')} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Guardando…
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Guardar artículo'
          )}
        </Button>
      }
    >
      <form id="item-form" noValidate onSubmit={onSubmit} className="space-y-8">
        {/* 1. ¿Qué es? */}
        <div className="space-y-2">
          <label htmlFor="item-name" className={LABEL}>
            Nombre
          </label>
          <Input
            id="item-name"
            autoFocus={!isEditing}
            autoComplete="off"
            maxLength={100}
            placeholder="Ej. Silla Tiffany blanca"
            aria-invalid={Boolean(errors.name)}
            className={cn('h-12 rounded-xl text-base', errors.name && 'border-destructive')}
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* 2. ¿De qué categoría? */}
        <section className="space-y-3">
          <h3 className={LABEL}>Categoría</h3>
          {categories.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">
              Aún no tienes categorías.{' '}
              <Link href="/tools/inventario/categorias" className="font-medium text-primary underline-offset-4 hover:underline">
                Crea una primero
              </Link>
              .
            </p>
          ) : (
            <div role="group" aria-label="Categoría" className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Chip key={c.id} label={c.name} selected={categoryId === c.id} onClick={() => pickCategory(c.id)} />
              ))}
            </div>
          )}
          {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
        </section>

        {/* 3. Datos propios de la categoría (solo si los tiene) */}
        {categoryAttributes.length > 0 && (
          <section className="space-y-4">
            <h3 className={LABEL}>Características de {selectedCategory?.name}</h3>
            {categoryAttributes.map((attr) => (
              <AttributeField
                key={attr.name}
                attr={attr}
                value={attributes[attr.name]}
                error={attributeErrors[attr.name]}
                onChange={(value) => setAttribute(attr.name, value)}
              />
            ))}
          </section>
        )}

        {/* 4. ¿Cuánto cobras por rentarlo? */}
        <div className="space-y-2">
          <label htmlFor="item-rent" className={LABEL}>
            Precio de renta <span className="font-normal">(opcional)</span>
          </label>
          <MoneyInput id="item-rent" invalid={Boolean(errors.rentPrice)} {...register('rentPrice')} />
          {errors.rentPrice && <p className="text-sm text-destructive">{errors.rentPrice.message}</p>}
        </div>

        {/* 5. ¿Cuántos tienes? Solo al crear */}
        {canHaveStock && (
          <div className="space-y-2">
            <label htmlFor="item-stock" className={LABEL}>
              ¿Cuántos tienes? <span className="font-normal">(opcional)</span>
            </label>
            <Input
              id="item-stock"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              maxLength={7}
              aria-invalid={Boolean(errors.initialStock)}
              className={cn('h-12 rounded-xl text-base tabular-nums', errors.initialStock && 'border-destructive')}
              {...register('initialStock')}
            />
            {errors.initialStock && <p className="text-sm text-destructive">{errors.initialStock.message}</p>}
          </div>
        )}

        {/* 6. ¿Dónde está? Solo cuando hay algo que ubicar */}
        {askLocation && (
          <section className="space-y-3">
            <h3 className={LABEL}>
              {isEditing ? 'Ubicación' : 'Dónde los guardas'} <span className="font-normal">(opcional)</span>
            </h3>
            <div role="group" aria-label="Ubicación" className="flex flex-wrap gap-2">
              {locations.map((l) => (
                <Chip
                  key={l.id}
                  label={l.name}
                  selected={locationId === l.id}
                  onClick={() => setValue('locationId', locationId === l.id ? undefined : l.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 7. Lo que casi nunca cambia */}
        <section className="space-y-6">
          {!moreOpen && (
            <Button
              type="button"
              variant="ghost"
              className="-ml-3 h-11 rounded-xl px-3 text-[15px] text-primary hover:text-primary"
              onClick={() => setShowMore(true)}
            >
              Más opciones
            </Button>
          )}

          {moreOpen && (
            <div className="space-y-8 border-t pt-6">
              <div className="space-y-2">
                <label htmlFor="item-sku" className={LABEL}>
                  Código {!isEditing && <span className="font-normal">(si lo dejas vacío, se genera solo)</span>}
                </label>
                <Input
                  id="item-sku"
                  autoComplete="off"
                  maxLength={50}
                  placeholder="Ej. ST-001"
                  aria-invalid={Boolean(errors.sku)}
                  className={cn('h-12 rounded-xl font-mono text-base', errors.sku && 'border-destructive')}
                  {...register('sku')}
                />
                {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="item-sale" className={LABEL}>
                  Precio de venta <span className="font-normal">(opcional)</span>
                </label>
                <MoneyInput id="item-sale" invalid={Boolean(errors.salePrice)} {...register('salePrice')} />
                {errors.salePrice && <p className="text-sm text-destructive">{errors.salePrice.message}</p>}
              </div>

              <section className="space-y-3">
                <h3 className={LABEL}>Tipo</h3>
                <div role="group" aria-label="Tipo de artículo" className="flex flex-wrap gap-2">
                  {ITEM_TYPES.map((t) => (
                    <Chip key={t.value} label={t.label} selected={type === t.value} onClick={() => setValue('type', t.value)} />
                  ))}
                </div>
              </section>

              {isEditing && (
                <section className="space-y-3">
                  <h3 className={LABEL}>Estado</h3>
                  <div role="group" aria-label="Estado" className="flex flex-wrap gap-2">
                    {EDITABLE_STATUSES.map((s) => (
                      <Chip key={s.value} label={s.label} selected={status === s.value} onClick={() => setValue('status', s.value)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
      </form>
    </AppBottomSheet>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'outline'}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(TOUCH, 'px-4')}
    >
      <span className="truncate">{label}</span>
    </Button>
  )
}

const MoneyInput = ({ invalid, ...props }: React.ComponentProps<typeof Input> & { invalid?: boolean }) => (
  <div className="relative">
    <span
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
      aria-hidden
    >
      $
    </span>
    <Input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      maxLength={13}
      aria-invalid={invalid}
      className={cn('h-12 rounded-xl pl-8 text-base tabular-nums', invalid && 'border-destructive')}
      {...props}
    />
  </div>
)

function AttributeField({
  attr,
  value,
  error,
  onChange,
}: {
  attr: CategoryAttribute
  value: AttributeValue | undefined
  error?: string
  onChange: (value: AttributeValue) => void
}) {
  const id = `attr-${attr.name}`
  const optional = !attr.required && attr.type !== 'boolean'

  if (attr.type === 'boolean') {
    return (
      <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center gap-3 text-base">
        <Checkbox id={id} checked={value === true} onCheckedChange={(checked) => onChange(checked === true)} />
        {attr.name}
      </label>
    )
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {attr.name} {optional && <span className="font-normal">(opcional)</span>}
      </label>
      <Input
        id={id}
        type={attr.type === 'date' ? 'date' : attr.type === 'number' ? 'number' : 'text'}
        inputMode={attr.type === 'number' ? 'decimal' : undefined}
        autoComplete="off"
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(e) => {
          const raw = e.target.value
          onChange(attr.type === 'number' && raw !== '' ? Number(raw) : raw)
        }}
        aria-invalid={Boolean(error)}
        className={cn('h-12 rounded-xl text-base', error && 'border-destructive')}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
