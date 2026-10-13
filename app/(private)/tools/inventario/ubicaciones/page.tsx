// app/tools/inventario/ubicaciones/page.tsx
import { PageHeader } from '@/components/admin/page-header'
import { BackLink } from '@/components/ui/back-link'
import LocationsTab from '@/components/inventario/tabs/LocationsTab'

export default function UbicacionesPage() {
  return (
    <div className="space-y-2 pb-28 sm:pb-8">
      <BackLink href="/tools/inventario" label="Inventario" />
      <PageHeader title="Ubicaciones" description="Dónde guardas tus artículos." />
      <LocationsTab />
    </div>
  )
}
