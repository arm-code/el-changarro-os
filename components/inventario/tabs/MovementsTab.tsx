// components/inventario/tabs/MovementsTab.tsx
'use client'

import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { inventarioApi } from '@/lib/inventario/api'
import { describeDate, parseDate, toLocalDateInput } from '@/lib/display'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MobileFab } from '@/components/ui/mobile-fab'
import { LABEL, TOUCH } from '@/components/ui/detail'
import { EmptyState, InlineError, ListSkeleton } from '@/components/ui/states'
import MovementFormSheet from '@/components/inventario/modals/MovementFormSheet'
import type { InventoryMovement, InventoryMovementType } from '@/lib/inventario/types'

const PAGE_SIZE = 30

const TYPE_LABEL: Record<InventoryMovementType, string> = {
  in: 'Entrada',
  out: 'Salida',
  transfer: 'Traspaso',
  adjustment: 'Ajuste',
}

/* ─── Presentación ──────────────────────────────────────────────────────── */

/** Cantidad con signo: solo las entradas se destacan, igual que en Finanzas. */
function quantityOf(mov: InventoryMovement): { text: string; positive: boolean } {
  switch (mov.type) {
    case 'in':
      return { text: `+${mov.quantity}`, positive: true }
    case 'out':
      return { text: `−${mov.quantity}`, positive: false }
    default:
      return { text: String(mov.quantity), positive: false }
  }
}

/** Segunda línea: tipo y lo que da contexto (de dónde a dónde, o el motivo). */
function subtitleOf(mov: InventoryMovement): string {
  const label = TYPE_LABEL[mov.type] ?? 'Movimiento'
  const reason = mov.reason?.trim() ?? ''

  if (mov.type === 'transfer' && (mov.originLocationName || mov.destinationLocationName)) {
    return `${label} · ${mov.originLocationName ?? '—'} → ${mov.destinationLocationName ?? '—'}`
  }
  if (mov.type === 'adjustment') {
    const after = mov.snapshotStockAfter?.total
    return [label, typeof after === 'number' ? `Quedó en ${after}` : reason].filter(Boolean).join(' · ')
  }
  return [label, reason].filter(Boolean).join(' · ')
}

/** Agrupa por día conservando el orden que manda la API. */
function groupByDay(list: InventoryMovement[]) {
  const groups: { key: string; label: string; items: InventoryMovement[] }[] = []
  for (const mov of list) {
    const date = parseDate(mov.createdAt)
    const key = date ? toLocalDateInput(date) : 'sin-fecha'
    let group = groups.find((g) => g.key === key)
    if (!group) {
      const info = describeDate(mov.createdAt)
      const label = info ? (Math.abs(info.days) <= 1 ? info.relative : info.label) : 'Sin fecha'
      group = { key, label, items: [] }
      groups.push(group)
    }
    group.items.push(mov)
  }
  return groups
}

/* ─── Componente ────────────────────────────────────────────────────────── */

export default function MovementsTab() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const listQuery = useInfiniteQuery({
    queryKey: ['inventory', 'movements'],
    queryFn: ({ pageParam }) => inventarioApi.getMovements({ page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta?.hasNextPage ? (last.meta.page ?? 1) + 1 : undefined),
  })

  const movements = useMemo(() => {
    const seen = new Set<string>()
    return (listQuery.data?.pages ?? [])
      .flatMap((page) => page.items ?? [])
      .filter((mov) => !seen.has(mov.id) && seen.add(mov.id))
  }, [listQuery.data])

  const groups = useMemo(() => groupByDay(movements), [movements])
  const loadedPages = listQuery.data?.pages.length ?? 0

  return (
    <div className="space-y-6">
      <div className="hidden justify-end sm:flex">
        <Button className={TOUCH} onClick={() => setIsCreateOpen(true)}>
          <Plus aria-hidden />
          Nuevo movimiento
        </Button>
      </div>

      <section aria-label="Historial de movimientos">
        {listQuery.isLoading ? (
          <ListSkeleton rows={5} label="Cargando movimientos" />
        ) : listQuery.isError && movements.length === 0 ? (
          <InlineError message="No se pudieron cargar tus movimientos." onRetry={() => listQuery.refetch()} />
        ) : movements.length === 0 ? (
          <EmptyState
            title="Aún no hay movimientos"
            description="Aquí verás cada entrada, salida o traspaso de tus artículos."
            action={
              <Button className={TOUCH} onClick={() => setIsCreateOpen(true)}>
                <Plus aria-hidden />
                Nuevo movimiento
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.key} className="space-y-2">
                <h3 className={LABEL}>{group.label}</h3>
                <Card className="gap-0 overflow-hidden py-0">
                  <ul className="divide-y">
                    {group.items.map((mov) => (
                      <MovementRow key={mov.id} mov={mov} />
                    ))}
                  </ul>
                </Card>
              </div>
            ))}

            <p className="sr-only" aria-live="polite">
              {movements.length} movimientos mostrados
            </p>

            {listQuery.hasNextPage ? (
              <div className="space-y-2">
                {listQuery.isFetchNextPageError && (
                  <p className="text-center text-sm text-muted-foreground">
                    No se pudieron cargar más. Revisa tu conexión.
                  </p>
                )}
                <Button
                  variant="outline"
                  className={cn(TOUCH, 'w-full')}
                  onClick={() => listQuery.fetchNextPage()}
                  disabled={listQuery.isFetchingNextPage}
                >
                  {listQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden />
                      Cargando…
                    </>
                  ) : listQuery.isFetchNextPageError ? (
                    'Reintentar'
                  ) : (
                    'Ver más movimientos'
                  )}
                </Button>
              </div>
            ) : (
              loadedPages > 1 && (
                <p className="py-2 text-center text-sm text-muted-foreground">Ya viste todos tus movimientos</p>
              )
            )}
          </div>
        )}
      </section>

      <MobileFab
        onClick={() => setIsCreateOpen(true)}
        aria-label="Nuevo movimiento"
        title="Nuevo movimiento"
      />

      <MovementFormSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function MovementRow({ mov }: { mov: InventoryMovement }) {
  const quantity = quantityOf(mov)
  return (
    <li className="flex min-h-16 items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium">{mov.itemName}</p>
        <p className="truncate text-[15px] text-muted-foreground">{subtitleOf(mov)}</p>
      </div>
      <p className={cn('shrink-0 text-base font-semibold tabular-nums', quantity.positive && 'text-success')}>
        {quantity.text}
      </p>
    </li>
  )
}
