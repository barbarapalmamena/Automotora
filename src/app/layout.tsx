import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Automotora | Venta de Camionetas y Autos en Puerto Montt',
  description: 'Encuentra camionetas 4x4, pick-ups y SUVs seminuevos en Puerto Montt y la Décima Región. Garantía ética de 7 días, inspección mecánica y financiamiento a tu medida.',
  keywords: ['automotora puerto montt', 'camionetas 4x4 chile', 'autos usados decima region', 'compra venta autos santiago puerto montt'],
  authors: [{ name: 'Automotora Chile' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="layout-container">
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
