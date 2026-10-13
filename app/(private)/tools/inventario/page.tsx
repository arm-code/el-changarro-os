// app/tools/inventario/page.tsx
import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ItemsTab from '@/components/inventario/tabs/ItemsTab'

export default function InventarioPage() {
  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Inventario"
        description="Lo que tienes y dónde está."
        // En móvil el engrane queda arriba a la derecha, no debajo del título
        className="flex-row items-start justify-between"
        action={<SettingsMenu />}
      />
      <ItemsTab />
    </div>
  )
}

function SettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Ajustes de inventario"
        >
          <Settings2 className="size-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">Ajustes</DropdownMenuLabel>
        <DropdownMenuItem asChild className="min-h-11 rounded-lg text-[15px]">
          <Link href="/tools/inventario/movimientos">Movimientos</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-11 rounded-lg text-[15px]">
          <Link href="/tools/inventario/categorias">Categorías</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-11 rounded-lg text-[15px]">
          <Link href="/tools/inventario/ubicaciones">Ubicaciones</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
