import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--surface-0)]">
        <Sidebar />
        <div className="lg:pl-[var(--sidebar-width)]">
          <TopBar />
          <main className="px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-5xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
