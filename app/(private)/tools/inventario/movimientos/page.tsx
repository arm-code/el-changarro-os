// app/tools/inventario/movimientos/page.tsx
import { PageHeader } from '@/components/admin/page-header'
import { BackLink } from '@/components/ui/back-link'
import MovementsTab from '@/components/inventario/tabs/MovementsTab'

export default function MovimientosPage() {
  return (
    <div className="space-y-2 pb-28 sm:pb-8">
      <BackLink href="/tools/inventario" label="Inventario" />
      <PageHeader title="Movimientos" description="Entradas, salidas y traslados de tus artículos." />
      <MovementsTab />
    </div>
  )
}
