import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/session-provider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Planify',
  description: 'Sistema completo para gerenciamento de tarefas',
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 'NCe49nc5aLlU7AWI7PqaAbCvLlFVZH7KT9cUSpJ-H8o',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <div className="app-shell flex flex-col">
            <Navbar />
            <main className="app-main">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
