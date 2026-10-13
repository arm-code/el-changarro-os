// app/tools/inventario/categorias/page.tsx
import { PageHeader } from '@/components/admin/page-header'
import { BackLink } from '@/components/ui/back-link'
import CategoriesTab from '@/components/inventario/tabs/CategoriesTab'

export default function CategoriasPage() {
  return (
    <div className="space-y-2 pb-28 sm:pb-8">
      <BackLink href="/tools/inventario" label="Inventario" />
      <PageHeader title="Categorías" description="Sirven para agrupar tus artículos." />
      <CategoriesTab />
    </div>
  )
}
