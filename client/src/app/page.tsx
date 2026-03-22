import Link from 'next/link';
import { Shield, RefreshCw, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const features = [
  {
    icon: RefreshCw,
    title: 'Token rotation',
    description: 'Refresh tokens are single-use and rotated on every request. Compromised tokens are detected and all sessions are revoked.',
  },
  {
    icon: ShieldCheck,
    title: 'Brute-force protection',
    description: 'Redis-backed rate limiting per endpoint. Sliding window counters that adapt to attack patterns automatically.',
  },
  {
    icon: Activity,
    title: 'Session management',
    description: 'View active sessions, sign out individual devices, or revoke everything with a single click.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">Vault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-brand px-4 text-[14px] font-medium text-white hover:bg-brand-hover transition-all duration-150 hover:-translate-y-px"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px] pointer-events-none bg-brand" />
        <div className="absolute bottom-1/4 -right-32 h-[400px] w-[400px] rounded-full opacity-10 blur-[120px] pointer-events-none bg-[#8B5CF6]" />

        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-[12px] font-medium tracking-wide uppercase mb-6">
                <Shield className="h-3 w-3" />
                Identity infrastructure
              </div>

              <h1 className="text-4xl lg:text-[3.25rem] font-extrabold text-text-primary leading-[1.1] tracking-tight">
                Authentication that doesn&apos;t get in&nbsp;the&nbsp;way.
              </h1>

              <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-lg">
                Passwords, sessions, tokens &mdash; handled. Stop rebuilding auth from scratch and ship what actually matters.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-medium text-white hover:bg-brand-hover transition-all duration-150 hover:-translate-y-px hover:shadow-md"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-6 text-[15px] font-medium text-text-primary hover:bg-surface-2 transition-all duration-150"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Abstract visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-3xl border-2 border-border rotate-45 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl border border-brand/30 bg-brand/10 flex items-center justify-center -rotate-45">
                      <Shield className="h-12 w-12 text-brand" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-12 h-3 w-3 rounded-full bg-success" />
                <div className="absolute bottom-12 left-8 h-2 w-2 rounded-full bg-brand" />
                <div className="absolute top-1/2 right-4 h-2.5 w-2.5 rounded-full bg-accent" />
                <div className="absolute bottom-4 right-1/3 h-2 w-2 rounded-full bg-warning" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-text-primary tracking-tight">
              Security, not security theater
            </h2>
            <p className="mt-2 text-[15px] text-text-secondary max-w-lg mx-auto">
              Every feature exists because a real vulnerability demanded it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-border bg-surface-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-border-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 mb-4 group-hover:bg-brand transition-colors duration-200">
                  <Icon className="h-5 w-5 text-brand group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
