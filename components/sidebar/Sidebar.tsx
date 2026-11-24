'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarHeader from './SidebarHeader';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';
import Topbar from './Topbar';
import { useAuth } from '@/lib/auth';
import { View } from '@/types/View.types';
import { Home, Package, PackagePlus, Settings, Tags, Menu, X, Boxes, Wrench, PackageSearch, DollarSign, FileText, LayoutDashboard } from 'lucide-react';
import { MenuItem } from './SidebarNav';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: React.ReactNode;
}

const nombre_negocio = 'Mobiliario Mendoza';

export default function SidebarLayout({
  currentView,
  onViewChange,
  children,
}: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Abierto por defecto en desktop
  const [isMobile, setIsMobile] = useState(false);
  const { user, signOut } = useAuth();
  // SidebarFooter y Topbar esperan { user: { email } } (forma heredada)
  const session = user ? { user } : null;
  const router = useRouter();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    await signOut('/auth/login');
  };

  const menuItems: MenuItem[] = [
    { id: 'principal', label: 'Principal', icon: <Home className='w-5 h-5' /> },
    {
      id: 'tools',
      label: 'Herramientas',
      icon: <Wrench className='w-5 h-5' />,
      subItems: [
        { id: 'tools', label: 'Panel General', icon: <LayoutDashboard className='w-4 h-4' /> },
        { id: 'notas-venta', label: 'Historial Notas', icon: <FileText className='w-4 h-4' /> },
        { id: 'finanzas', label: 'Finanzas', icon: <DollarSign className='w-4 h-4' /> }
      ]
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: <Settings className='w-5 h-5' />,
    },
  ];

  // En móvil, el sidebar siempre está oculto por defecto
  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-20';

  return (
    <div className="flex min-h-screen bg-violet-50">
      {/* Overlay para móvil */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 flex flex-col h-screen transition-all duration-300 bg-white border-r border-violet-200 shadow-lg z-50
          ${isMobile ?
            (isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full') :
            sidebarWidth
          }
        `}
      >
        <SidebarHeader
          nombreNegocio={nombre_negocio}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        <div className='flex-1 overflow-y-auto'>
          <SidebarNav
            items={menuItems}
            currentView={currentView}
            onViewChange={(view) => {
              onViewChange(view);
              if (isMobile) closeSidebar();
            }}
            isSidebarOpen={isSidebarOpen}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        </div>

        <SidebarFooter
          isSidebarOpen={isSidebarOpen}
          session={session}
          onLogout={handleLogout}
        />
      </aside>

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-20')}
        `}
      >
        <Topbar
          session={session}
          onMenuToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <main className="flex-1 p-4 lg:p-6 mt-16 lg:mt-20">
          {children}
        </main>
      </div>
    </div>
  );
}