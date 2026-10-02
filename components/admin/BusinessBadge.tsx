// components/business/business-badge.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { useBusiness } from '@/lib/business'
import { useBusinessConfig } from '@/components/configuracion/useBusinessConfig'
import { Skeleton } from '@/components/ui/skeleton'

interface BusinessBadgeProps {
  compact?: boolean
}

export function BusinessBadge({ compact = false }: BusinessBadgeProps) {
  const { business, loading: businessLoading } = useBusiness()
  const { config, isLoading: configLoading } = useBusinessConfig()

  const loading = businessLoading || configLoading
  
  // Usar el nombre de config si existe, sino el de business, sino fallback genérico
  const businessName = config?.name || business?.name || 'Mi Negocio'
  
  // Utilizar estrictamente el logo del backend
  const logoUrl = config?.logoUrl || business?.logoUrl

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5">
        <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={businessName}
              width={22}
              height={22}
              className="object-contain"
            />
          ) : (
            <Building2 className="size-3.5 text-muted-foreground" aria-hidden />
          )}
        </div>
        {loading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className="max-w-[130px] truncate text-sm font-medium text-foreground">
            {businessName}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={businessName}
            width={32}
            height={32}
            className="object-contain"
          />
        ) : (
          <span className="text-sm font-semibold text-primary">
            {businessName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        {loading ? (
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        ) : (
          <>
            <p className="truncate text-[15px] font-semibold text-foreground">
              {businessName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Gestión de Renta
            </p>
          </>
        )}
      </div>
    </div>
  )
}