// components/inventario/modals/ItemDetailSheet.tsx
'use client'

import { Pencil } from 'lucide-react'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { DetailAmountRow, DetailSection, DetailSummary, LABEL } from '@/components/ui/detail'
import { formatCurrency } from '@/lib/format'
import { ITEM_STATUS_LABEL, isAlertStatus } from '@/lib/inventario/labels'
import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/lib/inventario/types'

interface ItemDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
  onEditClick: () => void
}

/** Fila etiqueta/valor, mismas medidas que las filas de DetailSummary. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <dt className={cn(LABEL, 'pt-0.5')}>{label}</dt>
      <dd className="min-w-0 text-right text-base font-medium leading-snug text-pretty">{children}</dd>
    </div>
  )
}

export default function ItemDetailSheet({ isOpen, onClose, item, onEditClick }: ItemDetailSheetProps) {
  if (!item) return null

  const { total, available, reserved, rented } = item.stock
  // Lo que no está disponible, explicado en una sola línea
  const unavailable = [
    reserved > 0 ? `${reserved} ${reserved === 1 ? 'reservado' : 'reservados'}` : '',
    rented > 0 ? `${rented} en renta` : '',
  ].filter(Boolean)

  const attributes = Object.entries(item.attributes ?? {}).filter(([, value]) => value !== null && value !== '')
  const serials = item.type === 'serialized' ? (item.serials ?? []) : []
  const hasSalePrice = item.salePrice != null && Number(item.salePrice) > 0

  return (
    <AppBottomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={item.name}
      description={item.sku}
      headerAction={
        <Button
          variant="ghost"
          size="icon"
          onClick={onEditClick}
          aria-label="Editar artículo"
          className="size-11 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-5" aria-hidden />
        </Button>
      }
    >
      <div className="space-y-8">
        <DetailSummary>
          {item.rentPrice != null && <DetailAmountRow label="Renta" amount={Number(item.rentPrice)} />}
          {total > 0 && (
            <Row label="Disponibles">
              <p>
                <span className={cn('tabular-nums', available === 0 && 'text-destructive')}>{available}</span>
                <span className="text-muted-foreground"> de {total}</span>
              </p>
              {unavailable.length > 0 && (
                <p className="text-sm font-normal text-muted-foreground">{unavailable.join(' · ')}</p>
              )}
            </Row>
          )}
        </DetailSummary>

        <DetailSection title="Información">
          <dl className="divide-y rounded-xl border">
            <Row label="Estado">
              <span className={cn(isAlertStatus(item.status) && 'text-destructive')}>
                {ITEM_STATUS_LABEL[item.status] ?? ITEM_STATUS_LABEL.available}
              </span>
            </Row>
            <Row label="Categoría">{item.categoryName || '—'}</Row>
            <Row label="Ubicación">
              {item.locationName ?? <span className="font-normal text-muted-foreground">Sin asignar</span>}
            </Row>
            {hasSalePrice && <Row label="Venta">{formatCurrency(Number(item.salePrice))}</Row>}
          </dl>
        </DetailSection>

        {attributes.length > 0 && (
          <DetailSection title="Características">
            <dl className="divide-y rounded-xl border">
              {attributes.map(([key, value]) => (
                <Row key={key} label={key}>
                  {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)}
                </Row>
              ))}
            </dl>
          </DetailSection>
        )}

        {item.type === 'serialized' && (
          <DetailSection title="Números de serie">
            {serials.length > 0 ? (
              <ul className="divide-y rounded-xl border">
                {serials.map((serial) => (
                  <li key={serial.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
                    <span className="truncate font-mono text-[15px]">{serial.serialNumber}</span>
                    <span
                      className={cn(
                        'shrink-0 text-xs',
                        isAlertStatus(serial.status) ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    >
                      {ITEM_STATUS_LABEL[serial.status] ?? ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-muted-foreground">Aún no hay números de serie registrados.</p>
            )}
          </DetailSection>
        )}
      </div>
    </AppBottomSheet>
  )
}
