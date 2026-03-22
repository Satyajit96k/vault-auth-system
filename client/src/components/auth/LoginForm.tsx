'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';
import { toast } from '@/stores/toastStore';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export default function LoginForm() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => {
        if (prev <= 1) { setError(null); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const apiError = err.response.data as ApiError;
        if (err.response.status === 429) {
          const retryAfter = apiError.retryAfter || 60;
          setRateLimitSeconds(retryAfter);
          setError(`Too many attempts. Try again in ${retryAfter}s.`);
        } else {
          toast.error(apiError.message || 'Invalid email or password');
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-text-primary tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-[14px] text-text-secondary">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <Alert variant="warning" onDismiss={() => setError(null)}>
            {rateLimitSeconds > 0
              ? `Too many attempts. Try again in ${rateLimitSeconds}s.`
              : error}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          icon={<Mail className="h-[18px] w-[18px]" />}
          autoComplete="email"
        />

        <FormField
          control={control}
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock className="h-[18px] w-[18px]" />}
          showPasswordToggle
          autoComplete="current-password"
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={rateLimitSeconds > 0}>
          {rateLimitSeconds > 0 ? `Wait ${rateLimitSeconds}s` : 'Sign in'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="bg-surface-0 px-3 text-text-tertiary">or</span>
        </div>
      </div>

      <p className="text-center text-[14px] text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
