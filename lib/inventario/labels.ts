import type { InventoryItemStatus } from './types'

/** Texto de cada estado de artículo, compartido por la lista y el detalle. */
export const ITEM_STATUS_LABEL: Record<InventoryItemStatus, string> = {
  available: 'Disponible',
  rented: 'En renta',
  maintenance: 'En mantenimiento',
  damaged: 'Dañado',
  lost: 'Perdido',
  retired: 'Retirado',
}

/** Solo estos estados se pintan como alerta; el resto va en gris. */
export const isAlertStatus = (status: InventoryItemStatus) => status === 'damaged' || status === 'lost'
