'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/auth';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, setAuth, clearAuth, setInitialized, setLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isInitialized) return;

    if (!isInitialized) {
      const initAuth = async () => {
        setLoading(true);
        try {
          const refreshRes = await authApi.refresh();
          const accessToken = refreshRes.data.data.accessToken;

          useAuthStore.getState().updateAccessToken(accessToken);
          const userRes = await authApi.getMe();
          const user = userRes.data.data!.user;

          setAuth(user, accessToken);
        } catch {
          clearAuth();
          router.push('/login');
        } finally {
          setInitialized();
          setLoading(false);
        }
      };

      initAuth();
    }
  }, [isAuthenticated, isInitialized, setAuth, clearAuth, setInitialized, setLoading, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-surface-0 p-8">
        <div className="mx-auto max-w-5xl lg:pl-[var(--sidebar-width)]">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
