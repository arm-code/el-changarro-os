// components/inventario/tabs/LocationsTab.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Plus } from 'lucide-react'
import { inventarioApi } from '@/lib/inventario/api'
import { LOCATION_TYPE_LABEL } from '@/lib/inventario/labels'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MobileFab } from '@/components/ui/mobile-fab'
import { TOUCH } from '@/components/ui/detail'
import { EmptyState, InlineError, ListSkeleton } from '@/components/ui/states'
import LocationFormSheet from '@/components/inventario/modals/LocationFormSheet'
import type { InventoryLocation } from '@/lib/inventario/types'

export default function LocationsTab() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  // Sin ubicación seleccionada el formulario da de alta; con una, edita
  const [editing, setEditing] = useState<InventoryLocation | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory', 'locations'],
    queryFn: () => inventarioApi.getLocations(),
  })
  const locations = Array.isArray(data) ? data : []

  const openForm = (location: InventoryLocation | null) => {
    setEditing(location)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <ListSkeleton label="Cargando ubicaciones" />
      ) : isError ? (
        <InlineError message="No se pudieron cargar tus ubicaciones." onRetry={() => refetch()} />
      ) : locations.length === 0 ? (
        <EmptyState
          title="Aún no tienes ubicaciones"
          description="Agrega tu bodega, un salón o un vehículo para saber dónde está cada cosa."
          action={
            <Button className={TOUCH} onClick={() => openForm(null)}>
              <Plus aria-hidden />
              Nueva ubicación
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {locations.map((location) => (
                <li key={location.id}>
                  <Button
                    variant="ghost"
                    onClick={() => openForm(location)}
                    className={cn(
                      'flex h-auto min-h-16 w-full items-center justify-start gap-3 rounded-none px-4 py-3 text-left font-normal',
                      'transition-colors hover:bg-accent/60 active:bg-accent',
                      'outline-none focus-visible:bg-accent'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-foreground">{location.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {LOCATION_TYPE_LABEL[location.type] ?? 'Ubicación'}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
          <Button variant="outline" className={cn(TOUCH, 'hidden w-full sm:inline-flex')} onClick={() => openForm(null)}>
            <Plus aria-hidden />
            Nueva ubicación
          </Button>
        </div>
      )}

      <MobileFab onClick={() => openForm(null)} aria-label="Nueva ubicación" title="Nueva ubicación" />

      <LocationFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} location={editing} />
    </div>
  )
}
