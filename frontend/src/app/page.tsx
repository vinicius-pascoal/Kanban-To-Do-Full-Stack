'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      router.push('/teams');
    } else {
      router.push('/login');
    }
  }, [user, token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Carregando...</h1>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
