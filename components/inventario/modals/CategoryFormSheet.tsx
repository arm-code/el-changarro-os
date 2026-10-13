// components/inventario/modals/CategoryFormSheet.tsx
// Alta y edición de una categoría en el mismo formulario.
'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { inventarioApi } from '@/lib/inventario/api'
import { cn } from '@/lib/utils'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { LABEL, TOUCH } from '@/components/ui/detail'
import type { CategoryAttribute, InventoryAttributeType, InventoryCategory } from '@/lib/inventario/types'

const ATTRIBUTE_TYPES: readonly { value: InventoryAttributeType; label: string }[] = [
  { value: 'string', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Sí / No' },
  { value: 'date', label: 'Fecha' },
]

const categorySchema = yup.object({
  name: yup.string().trim().required('Escribe un nombre').max(100, 'Máximo 100 caracteres'),
})

interface CategoryFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sin categoría: alta nueva. Con categoría: edición. */
  category?: InventoryCategory | null
}

export default function CategoryFormSheet({ open, onOpenChange, category }: CategoryFormSheetProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(category)
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([])
  const [attributesError, setAttributesError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(categorySchema) })

  useEffect(() => {
    if (!open) return
    reset({ name: category?.name ?? '' })
    setAttributes(category?.attributes ? category.attributes.map((a) => ({ ...a })) : [])
    setAttributesError(null)
  }, [open, category, reset])

  const saveMutation = useMutation({
    mutationFn: ({ name, attrs }: { name: string; attrs: CategoryAttribute[] }) =>
      category
        ? inventarioApi.updateCategory(category.id, { name, attributes: attrs })
        : inventarioApi.createCategory({ name, attributes: attrs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] })
      // Los artículos muestran el nombre de su categoría
      queryClient.invalidateQueries({ queryKey: ['inventory', 'items'] })
      toast.success(isEditing ? 'Cambios guardados' : 'Categoría creada')
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      console.error('[CategoryFormSheet] save', err)
      const message = err instanceof Error && err.message ? err.message : 'Revisa tu conexión e intenta de nuevo.'
      toast.error('No se pudo guardar', { description: message })
    },
  })

  const onSubmit = handleSubmit(({ name }) => {
    const cleaned = attributes.map((a) => ({ ...a, name: a.name.trim() }))

    if (cleaned.some((a) => !a.name)) {
      setAttributesError('Escribe el nombre de cada característica o quita la que sobre.')
      return
    }
    const names = cleaned.map((a) => a.name.toLowerCase())
    if (new Set(names).size !== names.length) {
      setAttributesError('Hay dos características con el mismo nombre.')
      return
    }

    setAttributesError(null)
    saveMutation.mutate({ name, attrs: cleaned })
  })

  const updateAttribute = (index: number, patch: Partial<CategoryAttribute>) => {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)))
    setAttributesError(null)
  }

  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
      footer={
        <Button type="submit" form="category-form" className={cn(TOUCH, 'w-full')} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Guardando…
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Guardar categoría'
          )}
        </Button>
      }
    >
      <form id="category-form" noValidate onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-2">
          <label htmlFor="category-name" className={LABEL}>
            Nombre
          </label>
          <Input
            id="category-name"
            autoFocus={!isEditing}
            autoComplete="off"
            maxLength={100}
            placeholder="Ej. Sillas, Mesas, Mantelería"
            aria-invalid={Boolean(errors.name)}
            className={cn('h-12 rounded-xl text-base', errors.name && 'border-destructive')}
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <section className="space-y-4">
          <div>
            <h3 className={LABEL}>Características (opcional)</h3>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Datos extra que se piden al agregar un artículo de esta categoría, como material o color.
            </p>
          </div>

          {attributes.length > 0 && (
            <ul className="space-y-3">
              {attributes.map((attr, index) => (
                <li key={index} className="space-y-4 rounded-xl border p-4">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <label htmlFor={`attr-name-${index}`} className={LABEL}>
                        Nombre
                      </label>
                      <Input
                        id={`attr-name-${index}`}
                        autoComplete="off"
                        maxLength={50}
                        placeholder="Ej. Material"
                        value={attr.name}
                        onChange={(e) => updateAttribute(index, { name: e.target.value })}
                        className="h-12 rounded-xl text-base"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Quitar característica ${attr.name || index + 1}`}
                      onClick={() => {
                        setAttributes((prev) => prev.filter((_, i) => i !== index))
                        setAttributesError(null)
                      }}
                      className="mt-7 size-11 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-5" aria-hidden />
                    </Button>
                  </div>

                  <div role="group" aria-label="Tipo de dato" className="flex flex-wrap gap-2">
                    {ATTRIBUTE_TYPES.map((t) => (
                      <Button
                        key={t.value}
                        type="button"
                        variant={attr.type === t.value ? 'default' : 'outline'}
                        aria-pressed={attr.type === t.value}
                        onClick={() => updateAttribute(index, { type: t.value })}
                        className={cn(TOUCH, 'px-4')}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>

                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
                    <Checkbox
                      checked={attr.required}
                      onCheckedChange={(checked) => updateAttribute(index, { required: checked === true })}
                    />
                    Obligatorio al agregar un artículo
                  </label>
                </li>
              ))}
            </ul>
          )}

          {attributesError && <p className="text-sm text-destructive">{attributesError}</p>}

          <Button
            type="button"
            variant="outline"
            className={cn(TOUCH, 'w-full')}
            onClick={() => setAttributes((prev) => [...prev, { name: '', type: 'string', required: false }])}
          >
            <Plus aria-hidden />
            Agregar característica
          </Button>
        </section>
      </form>
    </AppBottomSheet>
  )
}
