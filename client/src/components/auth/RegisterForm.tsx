'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';
import PasswordStrength from '@/components/ui/PasswordStrength';
import { toast } from '@/stores/toastStore';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, setError: setFieldError, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      const { confirmPassword: _, ...registerData } = data;
      const result = await registerUser(registerData);
      if (result) {
        toast.success('Account created! Redirecting to sign in...');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const apiError = err.response.data as ApiError;
        if (err.response.status === 409) {
          setFieldError('email', { message: 'This email is already registered' });
        } else if (apiError.errors) {
          apiError.errors.forEach((e) => {
            setFieldError(e.field as keyof RegisterFormData, { message: e.message });
          });
        } else {
          setError(apiError.message || 'Registration failed');
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
          Create your account
        </h2>
        <p className="mt-1.5 text-[14px] text-text-secondary">
          Start securing your app in minutes
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField control={control} name="name" label="Full name" placeholder="Jane Smith"
          icon={<User className="h-[18px] w-[18px]" />} autoComplete="name" />

        <FormField control={control} name="email" label="Work email" type="email" placeholder="jane@company.com"
          icon={<Mail className="h-[18px] w-[18px]" />} autoComplete="email" />

        <div>
          <FormField control={control} name="password" label="Password" type="password"
            placeholder="Min 8 characters" icon={<Lock className="h-[18px] w-[18px]" />}
            showPasswordToggle autoComplete="new-password" />
          <PasswordStrength password={password} />
        </div>

        <FormField control={control} name="confirmPassword" label="Confirm password" type="password"
          placeholder="Re-enter your password" icon={<Lock className="h-[18px] w-[18px]" />}
          showPasswordToggle autoComplete="new-password" />

        <p className="text-[12px] text-text-tertiary leading-relaxed">
          By creating an account, you agree to our{' '}
          <span className="text-text-secondary underline cursor-default">Terms of Service</span>
          {' '}and{' '}
          <span className="text-text-secondary underline cursor-default">Privacy Policy</span>.
        </p>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create account
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
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
