import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { DemoBootstrap } from '@/demo/DemoBootstrap';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const PRODUCT = process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Hospital Cart';

export const metadata: Metadata = {
  title: `${PRODUCT} — Live Demo`,
  description: `Interactive demo of ${PRODUCT}. Fictional sample data; nothing is sent to real patients.`,
  robots: { index: false, follow: false },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.png',
    apple: '/icon-512.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DemoBootstrap />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
