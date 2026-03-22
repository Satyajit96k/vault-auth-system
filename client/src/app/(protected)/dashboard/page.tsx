'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, getGreeting } from '@/lib/utils';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Shield, Clock, LogOut, Monitor, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { logout, logoutAll, isLoading } = useAuth();

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          Here&apos;s your account at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile card */}
        <Card>
          <div className="flex items-start gap-4">
            <Avatar name={user.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-primary truncate">{user.name}</h3>
              <p className="text-[14px] text-text-secondary truncate">{user.email}</p>
              <div className="mt-2">
                <Badge variant={user.role === 'ADMIN' ? 'warning' : 'default'}>{user.role}</Badge>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <Clock className="h-3.5 w-3.5" />
              Member since {formatDate(user.createdAt)}
            </div>
          </div>
        </Card>

        {/* Security status */}
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <span className="text-[12px] text-text-secondary text-center">Password</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <span className="text-[12px] text-text-secondary text-center">2FA</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10">
                <Shield className="h-4 w-4 text-success" />
              </div>
              <span className="text-[12px] text-text-secondary text-center">Sessions</span>
            </div>
          </div>
        </Card>

        {/* Account details */}
        <Card>
          <CardHeader><CardTitle>Account details</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">Last login</span>
              <span className="text-[13px] font-medium text-text-primary">{formatDate(user.lastLoginAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">Role</span>
              <Badge variant={user.role === 'ADMIN' ? 'warning' : 'default'} size="sm">{user.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">Account status</span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                <Monitor className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary">Signed in</p>
                <p className="text-[12px] text-text-tertiary">{formatDate(user.lastLoginAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10">
                <Shield className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary">Account created</p>
                <p className="text-[12px] text-text-tertiary">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Session management */}
      <Card>
        <CardHeader><CardTitle>Session management</CardTitle></CardHeader>
        <p className="text-[14px] text-text-secondary mb-4">
          Manage your active sessions across devices.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={logout} isLoading={isLoading}>
            <LogOut className="h-4 w-4" />
            Sign out this device
          </Button>
          <Button variant="danger" onClick={logoutAll} isLoading={isLoading}>
            <LogOut className="h-4 w-4" />
            Sign out all devices
          </Button>
        </div>
      </Card>
    </div>
  );
}
