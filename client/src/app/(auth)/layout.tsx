import type { ReactNode } from 'react';
import { Shield, Check } from 'lucide-react';

const features = [
  'End-to-end encrypted sessions',
  'Token rotation on every refresh',
  'Brute-force protection built in',
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] lg:flex-col lg:justify-between lg:p-10 relative overflow-hidden bg-surface-1">
        {/* Background gradient orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl bg-brand" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full opacity-15 blur-3xl bg-[#8B5CF6]" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-text-primary tracking-tight">Vault</span>
        </div>

        {/* Quote */}
        <div className="relative z-10 max-w-sm">
          <blockquote className="text-2xl font-semibold text-text-primary leading-snug tracking-tight">
            &ldquo;Your users deserve better than &apos;forgot password&apos; every other Tuesday.&rdquo;
          </blockquote>
          <p className="mt-4 text-[14px] text-text-secondary">
            Ship auth that works. Focus on what matters.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-[14px] text-text-secondary">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                <Check className="h-3 w-3 text-success" />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12 bg-surface-0">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-text-primary tracking-tight">Vault</span>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
