// components/admin/admin-sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { isActive, primaryNav } from '@/lib/nav'
import { Button } from '@/components/ui/button'

import { BusinessBadge } from './BusinessBadge'

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()
    const items = [...primaryNav]

    return (
        <div className="flex h-full flex-col">
            <div className="border-b p-4 md:hidden">
                <BusinessBadge />
            </div>
            <nav className="flex flex-col gap-1 p-3">
                {items.map((item) => {
                    const active = isActive(pathname, item)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                'flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors active:scale-95',
                                active
                                    ? 'bg-primary/10 font-semibold text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <Icon
                                className={cn("size-5 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                                aria-hidden
                            />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

export function AdminSidebar() {
    const { user, signOut } = useAuth()

    return (
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
            <div className="border-b p-4">
                <BusinessBadge />
            </div>

            <div className="flex-1 overflow-y-auto">
                <AdminSidebarContent />
            </div>

            <div className="border-t bg-muted/10 p-4">
                <div className="mb-3 px-1">
                    <p className="truncate text-[15px] font-semibold text-foreground">
                        {user?.name || 'Usuario'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user?.email || 'admin@eventosmendoza.com'}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    className="h-11 w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={signOut}
                >
                    <LogOut className="mr-3 size-4 shrink-0" aria-hidden />
                    Cerrar sesión
                </Button>
            </div>
        </aside>
    )
}