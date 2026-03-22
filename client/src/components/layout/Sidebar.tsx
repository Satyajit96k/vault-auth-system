'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-[var(--sidebar-width)] lg:border-r lg:border-border lg:bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">
            Vault
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
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

      {/* User card */}
      {user && (
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-text-primary truncate">
                {user.name}
              </p>
              <Badge size="sm">{user.role}</Badge>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[14px] text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
