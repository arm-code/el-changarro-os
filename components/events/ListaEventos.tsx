'use client'

import { CalendarX2, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { BusinessEvent, EventStatus } from '@/types/finance'
import { formatCurrency } from '@/lib/format'
import { describeDate, parseDate, toLocalDateInput } from '@/lib/display'
import { LABEL } from '@/components/ui/detail'
import { Button } from '../ui/button'

/* ────────────────────────────────────────────────────────────────────────────
   CONSTANTES Y FORMATO
   ─────────────────────────────────────────────────────────────────────────── */
const STATUS_LABEL: Record<EventStatus, string> = {
    pending: 'Pendiente',
    delivered: 'Entregado',
    collected: 'Terminado',
    cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<EventStatus, string> = {
    pending: 'text-primary',
    delivered: 'text-primary',
    collected: 'text-success',
    cancelled: 'text-destructive',
}

/** Agrupa por día conservando el orden que ya trae la lista (sin fecha, al final). */
function groupByDay(list: BusinessEvent[]) {
    const groups: { key: string; label: string; items: BusinessEvent[] }[] = []
    for (const evt of list) {
        const date = parseDate(evt.date, { dateOnly: true })
        const key = date ? toLocalDateInput(date) : 'sin-fecha'
        let group = groups.find((g) => g.key === key)
        if (!group) {
            const info = describeDate(evt.date, { dateOnly: true })
            const label = info ? (Math.abs(info.days) <= 1 ? info.relative : info.label) : 'Por definir'
            group = { key, label, items: [] }
            groups.push(group)
        }
        group.items.push(evt)
    }
    return groups
}

/* ────────────────────────────────────────────────────────────────────────────
   PROPS
   ─────────────────────────────────────────────────────────────────────────── */
interface ListaEventosProps {
    filteredEvents: BusinessEvent[]
    isLoading: boolean
    activeTab: 'upcoming' | 'finished' | 'cancelled' | 'all'
    onSelectEvent: (event: BusinessEvent) => void
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE
   ─────────────────────────────────────────────────────────────────────────── */
export function ListaEventos({ filteredEvents, isLoading, activeTab, onSelectEvent }: ListaEventosProps) {
    if (isLoading) {
        return (
            <Card className="gap-0 overflow-hidden py-0" aria-busy="true" aria-label="Cargando eventos">
                <ul className="divide-y">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/5" />
                                <Skeleton className="h-3.5 w-2/5" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </li>
                    ))}
                </ul>
            </Card>
        )
    }

    if (filteredEvents.length === 0) {
        return (
            <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <CalendarX2 className="size-8 text-muted-foreground/60" aria-hidden />
                <p className="font-medium text-foreground">
                    No hay eventos {activeTab !== 'all' ? 'en esta categoría' : 'guardados'}.
                </p>
            </Card>
        )
    }

    const groups = groupByDay(filteredEvents)

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <div key={group.key} className="space-y-2">
                    <h3 className={LABEL}>{group.label}</h3>
                    <Card className="gap-0 overflow-hidden py-0">
                        <ul className="divide-y">
                            {group.items.map((evt) => {
                                const status = evt.status || 'pending'

                                return (
                                    <li key={evt.id}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => onSelectEvent(evt)}
                                            className={cn(
                                                'flex w-full h-auto min-h-16 items-center justify-start gap-3 px-4 py-3 text-left font-normal rounded-none',
                                                'transition-colors hover:bg-accent/60 active:bg-accent',
                                                'outline-none focus-visible:bg-accent'
                                            )}
                                        >
                                            {/* Información principal */}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-[15px] text-foreground">
                                                    {evt.name || 'Evento sin nombre'}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {evt.clientName || 'Sin cliente'}
                                                </p>
                                            </div>

                                            {/* Costo y Estado */}
                                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                                                <span className="font-medium tabular-nums text-[15px] text-foreground">
                                                    {formatCurrency(Number.isFinite(Number(evt.cost)) ? Number(evt.cost) : 0)}
                                                </span>
                                                <span className={cn('text-xs', STATUS_COLOR[status])}>
                                                    {STATUS_LABEL[status]}
                                                </span>
                                            </div>

                                            <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                                        </Button>
                                    </li>
                                )
                            })}
                        </ul>
                    </Card>
                </div>
            ))}
        </div>
    )
}
