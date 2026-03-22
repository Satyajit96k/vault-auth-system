'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Mail, Calendar, Shield, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { logoutAll, isLoading } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Profile</h1>
        <p className="mt-1 text-[14px] text-text-secondary">Your account information</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar name={user.name} size="xl" />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
            <p className="text-[14px] text-text-secondary mt-0.5">{user.email}</p>
            <div className="mt-2">
              <Badge variant={user.role === 'ADMIN' ? 'warning' : 'default'} size="md">{user.role}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
          <CardDescription>Details associated with your account</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-2">
            <Mail className="h-4 w-4 text-text-tertiary shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] text-text-tertiary uppercase tracking-wider">Email</p>
              <p className="text-[14px] text-text-primary">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center gap-3 py-2">
            <Shield className="h-4 w-4 text-text-tertiary shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] text-text-tertiary uppercase tracking-wider">Role</p>
              <p className="text-[14px] text-text-primary">{user.role}</p>
            </div>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center gap-3 py-2">
            <Calendar className="h-4 w-4 text-text-tertiary shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] text-text-tertiary uppercase tracking-wider">Member since</p>
              <p className="text-[14px] text-text-primary">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-error/20">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <div className="flex items-center justify-between p-4 rounded-xl bg-error/5">
          <div>
            <p className="text-[14px] font-medium text-text-primary">Sign out everywhere</p>
            <p className="text-[13px] text-text-secondary">Revoke all active sessions on every device</p>
          </div>
          <Button variant="danger" size="sm" onClick={logoutAll} isLoading={isLoading}>
            <LogOut className="h-4 w-4" />
            Sign out all
          </Button>
        </div>
      </Card>
    </div>
  );
}
