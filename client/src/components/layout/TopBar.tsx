'use client';

import MobileNav from './MobileNav';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';

export default function TopBar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface-0/80 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile hamburger */}
      <MobileNav />

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {user && (
          <div className="hidden lg:block">
            <Avatar name={user.name} size="sm" />
          </div>
        )}
      </div>
    </header>
  );
}
