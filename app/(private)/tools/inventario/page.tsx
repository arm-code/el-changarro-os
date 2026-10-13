// app/tools/inventario/page.tsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ItemsTab from '@/components/inventario/tabs/ItemsTab'
import MovementsTab from '@/components/inventario/tabs/MovementsTab'
import CategoriesTab from '@/components/inventario/tabs/CategoriesTab'
import LocationsTab from '@/components/inventario/tabs/LocationsTab'

const TABS = [
  { value: 'items', label: 'Artículos' },
  { value: 'movements', label: 'Movimientos' },
  { value: 'categories', label: 'Categorías' },
  { value: 'locations', label: 'Ubicaciones' },
] as const

export default function InventarioPage() {
  const [activeTab, setActiveTab] = useState<string>('items')

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader title="Inventario" description="Lo que tienes y dónde está." />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mismo control segmentado que Eventos: sin iconos, sin color de acento */}
        <TabsList
          aria-label="Secciones del inventario"
          className="grid h-12 w-full grid-cols-4 rounded-xl bg-muted p-1"
        >
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-full rounded-lg px-1 text-[13px] font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:text-sm dark:data-[state=active]:bg-card"
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
        <TabsContent value="categories" className="mt-0 focus-visible:outline-none">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="locations" className="mt-0 focus-visible:outline-none">
          <LocationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
