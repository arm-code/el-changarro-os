// app/tools/configuracion/page.tsx
'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Card } from '@/components/ui/card'
import { EmptyState, InlineError, ListSkeleton } from '@/components/ui/states'
import { formatMxPhone, toMxPhone } from '@/lib/display'
import { defaultBusinessConfig } from '@/lib/config'
import type { BusinessConfig, PaymentCard } from '@/types/finance'
import { cn } from '@/lib/utils'
import { useBusinessConfig } from '@/components/configuracion/useBusinessConfig'
import { BusinessInfoSheet } from '@/components/configuracion/BusinessInfoSheet'
import { BankAccountsSheet } from '@/components/configuracion/BankAccountsSheet'
import { TermsSheet } from '@/components/configuracion/TermsSheet'
import { PublicPageSheet } from '@/components/configuracion/PublicPageSheet'
import { GallerySheet } from '@/components/configuracion/GallerySheet'
import { ValuesSheet } from '@/components/configuracion/ValuesSheet'
import { StatsSheet } from '@/components/configuracion/StatsSheet'
import { TestimonialsSheet } from '@/components/configuracion/TestimonialsSheet'
import { FaqsSheet } from '@/components/configuracion/FaqsSheet'
import { Button } from '@/components/ui/button'

type SectionKey = 'business' | 'accounts' | 'terms' | 'page' | 'gallery' | 'values' | 'stats' | 'testimonials' | 'faqs'

interface Section {
  key: SectionKey
  title: string
  summary: string
  needsAttention?: boolean
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function buildSections(config: BusinessConfig, accounts: PaymentCard[]): Section[] {
  const phone = toMxPhone(config.phone)
  const services = config.services ?? defaultBusinessConfig.services ?? []
  const zones = config.coverageAreas ?? defaultBusinessConfig.coverageAreas ?? []
  const terms = config.termsAndConditions?.trim() ?? ''

  return [
    {
      key: 'business',
      title: 'Datos del negocio',
      summary: config.name
        ? [config.name, phone ? formatMxPhone(phone) : ''].filter(Boolean).join(' · ')
        : 'Falta el nombre de tu negocio',
      needsAttention: !config.name,
    },
    {
      key: 'accounts',
      title: 'Cuentas para recibir pagos',
      summary:
        accounts.length === 0
          ? 'Sin cuentas'
          : `${plural(accounts.length, 'cuenta', 'cuentas')}: ${accounts.map((a) => a.bank).join(', ')}`,
    },
    {
      key: 'terms',
      title: 'Términos del contrato',
      summary: terms ? terms.split('\n')[0] : 'Sin términos',
    },
    {
      key: 'page',
      title: 'Tu página',
      summary: `${plural(services.length, 'servicio', 'servicios')} · ${plural(zones.length, 'zona', 'zonas')}`,
    },
    {
      key: 'gallery',
      title: 'Catálogo de imágenes',
      summary: config.gallery?.length
        ? `${plural(config.gallery.length, 'imagen', 'imágenes')}`
        : 'Sube fotos de tus productos',
    },
    {
      key: 'values',
      title: 'Valores corporativos',
      summary: config.values?.length
        ? `${plural(config.values.length, 'valor', 'valores')}`
        : 'Misión, visión y valores',
    },
    {
      key: 'stats',
      title: 'En números',
      summary: config.stats?.length
        ? `${plural(config.stats.length, 'estadística', 'estadísticas')}`
        : 'Agrega cifras destacadas',
    },
    {
      key: 'testimonials',
      title: 'Testimonios',
      summary: config.testimonials?.length
        ? `${plural(config.testimonials.length, 'testimonio', 'testimonios')}`
        : 'Lo que dicen tus clientes',
    },
    {
      key: 'faqs',
      title: 'Preguntas frecuentes',
      summary: config.faqs?.length
        ? `${plural(config.faqs.length, 'pregunta', 'preguntas')}`
        : 'Resuelve dudas comunes',
    },
  ]
}

export default function ConfigurationPage() {
  const { config, isLoading, isError, refetch } = useBusinessConfig()
  const [openSection, setOpenSection] = useState<SectionKey | null>(null)

  const accounts: PaymentCard[] = Array.isArray(config?.paymentCards) ? config.paymentCards : []
  const close = (open: boolean) => !open && setOpenSection(null)

  return (
    <div className="space-y-8">
      <PageHeader title="Configuración" description="Los datos que aparecen en tus notas, contratos y página." />

      {isLoading ? (
        <ListSkeleton rows={4} label="Cargando configuración" />
      ) : isError ? (
        <InlineError message="No se pudo cargar tu configuración." onRetry={() => refetch()} />
      ) : !config ? (
        <EmptyState title="No encontramos la configuración de tu negocio" />
      ) : (
        <>
          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {buildSections(config, accounts).map((section) => (
                <li key={section.key}>
                  <Button
                    variant="ghost"
                    onClick={() => setOpenSection(section.key)}
                    className="flex h-auto min-h-16 w-full items-center justify-between rounded-none px-4 py-3 font-normal hover:bg-accent/60"
                  >
                    <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                      <p className="font-medium text-foreground">{section.title}</p>
                      <p
                        className={cn(
                          'truncate text-[15px]',
                          section.needsAttention ? 'font-medium text-destructive' : 'text-muted-foreground'
                        )}
                      >
                        {section.summary}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <BusinessInfoSheet open={openSection === 'business'} onOpenChange={close} />
          <BankAccountsSheet open={openSection === 'accounts'} onOpenChange={close} accounts={accounts} />
          <TermsSheet open={openSection === 'terms'} onOpenChange={close} />
          <PublicPageSheet open={openSection === 'page'} onOpenChange={close} />
          <GallerySheet open={openSection === 'gallery'} onOpenChange={close} />
          <ValuesSheet open={openSection === 'values'} onOpenChange={close} />
          <StatsSheet open={openSection === 'stats'} onOpenChange={close} />
          <TestimonialsSheet open={openSection === 'testimonials'} onOpenChange={close} />
          <FaqsSheet open={openSection === 'faqs'} onOpenChange={close} />
        </>
      )}
    </div>
  )
}