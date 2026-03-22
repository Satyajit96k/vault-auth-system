'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/auth';
import type { LoginInput, RegisterInput } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  const login = useCallback(async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, router]);

  const register = useCallback(async (data: Omit<RegisterInput, 'confirmPassword'>) => {
    setLoading(true);
    try {
      await authApi.register(data);
      return true;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    logoutAll,
  };
}
