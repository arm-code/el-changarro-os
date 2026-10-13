// app/tools/inventario/page.tsx
'use client'

import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ItemsTab from '@/components/inventario/tabs/ItemsTab'
import MovementsTab from '@/components/inventario/tabs/MovementsTab'

const TABS = [
  { value: 'items', label: 'Artículos' },
  { value: 'movements', label: 'Movimientos' },
] as const

export default function InventarioPage() {
  const [activeTab, setActiveTab] = useState<string>('items')

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Inventario"
        description="Lo que tienes y dónde está."
        // En móvil el engrane queda arriba a la derecha, no debajo del título
        className="flex-row items-start justify-between"
        action={<SettingsMenu />}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mismo control segmentado que Eventos */}
        <TabsList aria-label="Secciones del inventario" className="grid h-12 w-full grid-cols-2 rounded-xl bg-muted p-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-full rounded-lg px-1 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-card"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="items" className="mt-0 focus-visible:outline-none">
          <ItemsTab />
        </TabsContent>
        <TabsContent value="movements" className="mt-0 focus-visible:outline-none">
          <MovementsTab />
        </TabsContent>
      </Tabs>
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
          <Link href="/tools/inventario/categorias">Categorías</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-11 rounded-lg text-[15px]">
          <Link href="/tools/inventario/ubicaciones">Ubicaciones</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
