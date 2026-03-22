'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, User, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profile' },
];

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-border animate-slide-in-left flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-text-primary tracking-tight">Vault</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors',
                  active
                    ? 'bg-brand/10 text-brand'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {user && (
          <div className="border-t border-border p-3 space-y-2 shrink-0">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">{user.name}</p>
                <p className="text-[12px] text-text-tertiary truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { onClose(); logout(); }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[14px] text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && <MobileDrawer onClose={() => setOpen(false)} />}
    </div>
  );
}
