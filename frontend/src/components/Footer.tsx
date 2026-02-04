

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

export default function Footer() {

  const pathname = usePathname();
  const { user, token, currentTeam } = useAuth();

  if (!user || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <div className="w-full bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        Desenvolvido por <a href="https://github.com/vinicius-pascoal" target="_blank" rel="noopener noreferrer" className="text-sky-500">Vinicius pascoal</a> &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
