'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Si hay usuario, ir a dashboard
    if (user) {
      router.push('/dashboard');
    } else {
      // Si no, ir a login
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-500">Redirigiendo...</p>
      </div>
    </div>
  );
}
