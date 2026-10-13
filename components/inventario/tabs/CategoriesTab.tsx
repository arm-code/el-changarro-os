// components/inventario/tabs/CategoriesTab.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Plus } from 'lucide-react'
import { inventarioApi } from '@/lib/inventario/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MobileFab } from '@/components/ui/mobile-fab'
import { TOUCH } from '@/components/ui/detail'
import { EmptyState, InlineError, ListSkeleton } from '@/components/ui/states'
import CategoryFormSheet from '@/components/inventario/modals/CategoryFormSheet'
import type { InventoryCategory } from '@/lib/inventario/types'

export default function CategoriesTab() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  // Sin categoría seleccionada el formulario da de alta; con una, edita
  const [editing, setEditing] = useState<InventoryCategory | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory', 'categories'],
    queryFn: () => inventarioApi.getCategories(),
  })
  const categories = Array.isArray(data) ? data : []

  const openForm = (category: InventoryCategory | null) => {
    setEditing(category)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <ListSkeleton label="Cargando categorías" />
      ) : isError ? (
        <InlineError message="No se pudieron cargar tus categorías." onRetry={() => refetch()} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Aún no tienes categorías"
          description="Crea algunas como Sillas, Mesas o Mantelería para ordenar tus artículos."
          action={
            <Button className={TOUCH} onClick={() => openForm(null)}>
              <Plus aria-hidden />
              Nueva categoría
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {categories.map((category) => {
                const count = category.attributes?.length ?? 0
                return (
                  <li key={category.id}>
                    <Button
                      variant="ghost"
                      onClick={() => openForm(category)}
                      className={cn(
                        'flex h-auto min-h-16 w-full items-center justify-start gap-3 rounded-none px-4 py-3 text-left font-normal',
                        'transition-colors hover:bg-accent/60 active:bg-accent',
                        'outline-none focus-visible:bg-accent'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-foreground">{category.name}</p>
                        {count > 0 && (
                          <p className="truncate text-sm text-muted-foreground">
                            {count} {count === 1 ? 'característica' : 'características'}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                    </Button>
                  </li>
                )
              })}
            </ul>
          </Card>
          <Button variant="outline" className={cn(TOUCH, 'hidden w-full sm:inline-flex')} onClick={() => openForm(null)}>
            <Plus aria-hidden />
            Nueva categoría
          </Button>
        </div>
      )}

      <MobileFab onClick={() => openForm(null)} aria-label="Nueva categoría" title="Nueva categoría" />

      <CategoryFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} category={editing} />
    </div>
  )
}
