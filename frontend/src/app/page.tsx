'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      router.push('/teams');
    } else {
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="h-full min-h-0 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Carregando...</h1>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
