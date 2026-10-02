// components/admin/admin-header.tsx
'use client'

import { useState } from 'react'
import { LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerTrigger
} from '@/components/ui/drawer'
import { AdminSidebarContent } from './admin-sidebar'
import { BusinessBadge } from './BusinessBadge'
import { cn } from '@/lib/utils'

export function AdminHeader() {
    const { user, signOut } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-3 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-xl md:hidden">
            <div className="flex min-w-0 max-w-[65%] items-center gap-2">
                <BusinessBadge compact />
            </div>

            <div className="flex items-center gap-1">
                {/* Menú hamburguesa */}
                <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
                    <DrawerTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Abrir menú de navegación"
                            className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95"
                        >
                            <Menu className="size-5" aria-hidden />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="flex flex-col border-t p-0">
                        <DrawerHeader className="sr-only">
                            <DrawerTitle>Menú principal</DrawerTitle>
                            <DrawerDescription>Navegación de la aplicación</DrawerDescription>
                        </DrawerHeader>
                        <div className="flex-1 overflow-y-auto pb-6 pt-2">
                            <AdminSidebarContent onNavigate={() => setMenuOpen(false)} />
                        </div>
                    </DrawerContent>
                </Drawer>

                {/* Menú de usuario */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Abrir menú de cuenta"
                            className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95"
                        >
                            <User className="size-5" aria-hidden />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 sm:w-72">
                        <DropdownMenuLabel className="flex flex-col gap-1 p-3">
                            <span className="text-[15px] font-semibold leading-none text-foreground">
                                {user?.name || 'Usuario'}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">
                                {user?.email || 'admin@eventosmendoza.com'}
                            </span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={signOut}
                            className="h-11 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive m-1"
                        >
                            <LogOut className="mr-2 size-4" aria-hidden />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}