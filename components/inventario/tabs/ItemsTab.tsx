// components/inventario/tabs/ItemsTab.tsx
'use client'

import { useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ChevronRight, Loader2, Plus } from 'lucide-react'
import { inventarioApi } from '@/lib/inventario/api'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MobileFab } from '@/components/ui/mobile-fab'
import { SearchInput } from '@/components/ui/search-input'
import { TOUCH } from '@/components/ui/detail'
import { EmptyState, InlineError, ListSkeleton } from '@/components/ui/states'
import { ItemTypeIcon } from '@/components/inventario/ItemTypeIcon'
import ItemFormSheet from '@/components/inventario/modals/ItemFormSheet'
import ItemDetailSheet from '@/components/inventario/modals/ItemDetailSheet'
import { ITEM_STATUS_LABEL, isAlertStatus } from '@/lib/inventario/labels'
import type { InventoryItem } from '@/lib/inventario/types'

const PAGE_SIZE = 30

/* ─── Estado del artículo ───────────────────────────────────────────────────
   Un solo texto por fila, sin chips de color. Lo normal (disponible) no se
   anuncia; solo se destaca lo que requiere atención. */

function describeStock(item: InventoryItem): { text: string; alert: boolean } | null {
  if (item.status !== 'available') {
    return { text: ITEM_STATUS_LABEL[item.status], alert: isAlertStatus(item.status) }
  }
  const { total, available } = item.stock
  if (total <= 0) return null
  if (available === 0) return { text: 'Agotado', alert: true }
  return { text: `${available} ${available === 1 ? 'disponible' : 'disponibles'}`, alert: false }
}

/* ─── Componente ────────────────────────────────────────────────────────── */

export default function ItemsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  // Sin artículo seleccionado el formulario da de alta; con uno, edita
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const search = useDebouncedValue(searchTerm.trim(), 300)
  const searching = search.length > 0

  const itemsQuery = useInfiniteQuery({
    queryKey: ['inventory', 'items', search],
    queryFn: ({ pageParam }) =>
      inventarioApi.getItems({ search: search || undefined, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta?.hasNextPage ? (last.meta.page ?? 1) + 1 : undefined),
  })

  // Solo los formularios las necesitan; se piden una vez y se reutilizan
  const categoriesQuery = useQuery({
    queryKey: ['inventory', 'categories'],
    queryFn: () => inventarioApi.getCategories(),
  })
  const locationsQuery = useQuery({
    queryKey: ['inventory', 'locations'],
    queryFn: () => inventarioApi.getLocations(),
  })

  // Une páginas y descarta repetidos (un alta durante la navegación recorre los resultados)
  const items = useMemo(() => {
    const seen = new Set<string>()
    return (itemsQuery.data?.pages ?? [])
      .flatMap((page) => page.items ?? [])
      .filter((item) => !seen.has(item.id) && seen.add(item.id))
  }, [itemsQuery.data])

  const totalItems = itemsQuery.data?.pages[0]?.meta?.totalItems ?? items.length

  const openCreate = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const openDetails = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <section aria-label="Búsqueda" className="flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre o código"
        />
        <Button className={cn(TOUCH, 'hidden shrink-0 sm:inline-flex')} onClick={() => openCreate()}>
          <Plus aria-hidden />
          Nuevo artículo
        </Button>
      </section>

      <section aria-label="Lista de artículos" className="space-y-3">
        {itemsQuery.isLoading ? (
          <ListSkeleton rows={5} label="Cargando artículos" />
        ) : itemsQuery.isError && items.length === 0 ? (
          <InlineError message="No se pudo cargar tu inventario." onRetry={() => itemsQuery.refetch()} />
        ) : items.length === 0 ? (
          searching ? (
            <EmptyState title="Ningún artículo coincide con tu búsqueda" />
          ) : (
            <EmptyState
              title="Aún no hay artículos"
              description="Agrega lo que rentas o vendes para llevar el control de tus existencias."
              action={
                <Button className={TOUCH} onClick={() => openCreate()}>
                  <Plus aria-hidden />
                  Nuevo artículo
                </Button>
              }
            />
          )
        ) : (
          <>
            <p role="status" className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
            </p>

            <Card className="gap-0 overflow-hidden py-0">
              <ul className="divide-y">
                {items.map((item) => (
                  <ItemRow key={item.id} item={item} onSelect={openDetails} />
                ))}
              </ul>
            </Card>

            {itemsQuery.hasNextPage && (
              <div className="space-y-2">
                {itemsQuery.isFetchNextPageError && (
                  <p className="text-center text-sm text-muted-foreground">
                    No se pudieron cargar más. Revisa tu conexión.
                  </p>
                )}
                <Button
                  variant="outline"
                  className={cn(TOUCH, 'w-full')}
                  onClick={() => itemsQuery.fetchNextPage()}
                  disabled={itemsQuery.isFetchingNextPage}
                >
                  {itemsQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden />
                      Cargando…
                    </>
                  ) : itemsQuery.isFetchNextPageError ? (
                    'Reintentar'
                  ) : (
                    'Ver más artículos'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <MobileFab
        onClick={() => openCreate()}
        aria-label="Nuevo artículo"
        title="Nuevo artículo"
      />

      <ItemFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        item={editingItem}
        categories={categoriesQuery.data ?? []}
        locations={locationsQuery.data ?? []}
      />

      <ItemDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={selectedItem}
        onEditClick={() => {
          setIsDetailOpen(false)
          setEditingItem(selectedItem)
          setIsFormOpen(true)
        }}
      />
    </div>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function ItemRow({ item, onSelect }: { item: InventoryItem; onSelect: (item: InventoryItem) => void }) {
  const stock = describeStock(item)
  const subtitle = [item.sku, item.categoryName].filter(Boolean).join(' · ')

  return (
    <li>
      <Button
        variant="ghost"
        onClick={() => onSelect(item)}
        className={cn(
          'flex h-auto min-h-16 w-full items-center justify-start gap-3 rounded-none px-4 py-3 text-left font-normal',
          'transition-colors hover:bg-accent/60 active:bg-accent',
          'outline-none focus-visible:bg-accent'
        )}
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
          <ItemTypeIcon type={item.type} className="text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-foreground">{item.name}</p>
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {item.rentPrice != null && (
            <span className="text-[15px] font-medium tabular-nums text-foreground">
              {formatCurrency(Number(item.rentPrice))}
            </span>
          )}
          {stock && (
            <span className={cn('text-xs', stock.alert ? 'text-destructive' : 'text-muted-foreground')}>
              {stock.text}
            </span>
          )}
        </div>

        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
      </Button>
    </li>
  )
}
