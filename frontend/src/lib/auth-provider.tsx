'use client';

import { ReactNode } from 'react';
import { useAuthStore } from './auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export function useAuth() {
  return useAuthStore();
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!user || !token) {
      router.push('/login');
    }
  }, [user, token, router, isClient]);

  if (!isClient || !user || !token) {
    return null;
  }

  return <>{children}</>;
}
