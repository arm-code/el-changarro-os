import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import type { Metadata } from 'next';
import PwaRegistration from '@/components/PwaRegistration';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import QueryProvider from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/lib/auth';
import { BusinessProvider } from '@/lib/business';
import { DataProvider } from '@/lib/data-store';

const BASE_URL = 'https://dejuarez.mx';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'NegocioFácil – Administra tu negocio desde el celular',
    template: '%s | NegocioFácil',
  },
  description:
    'Sistema de gestión para negocios locales de Ciudad Juárez. Inventario, cotizaciones, finanzas y más. Sin complicaciones, en español.',
  keywords: [
    'punto de venta',
    'sistema para negocios',
    'inventario',
    'cotizaciones',
    'Ciudad Juárez',
    'NegocioFácil',
    'tienda',
    'abarrotes',
    'software para negocios',
  ],
  authors: [{ name: 'Alexis Romero Mendoza' }],
  creator: 'NegocioFácil',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: BASE_URL,
    siteName: 'NegocioFácil',
    title: 'NegocioFácil – Administra tu negocio desde el celular',
    description:
      'Inventario, cotizaciones y finanzas para negocios de Ciudad Juárez. ¡Fácil de usar desde el celular!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NegocioFácil – Administra tu negocio',
    description: 'Sistema de gestión para negocios locales en Ciudad Juárez.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es' className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className='min-h-screen bg-gray-50'>
        <QueryProvider>
          <AuthProvider>
            <BusinessProvider>
              <DataProvider>
                <PwaRegistration />
                {children}
                <Toaster position="top-right" richColors />
              </DataProvider>
            </BusinessProvider>
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
