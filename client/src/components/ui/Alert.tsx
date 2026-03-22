import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

const config = {
  success: { icon: CheckCircle, bg: 'bg-success/10', border: 'border-l-success', text: 'text-success' },
  error:   { icon: AlertCircle, bg: 'bg-error/10', border: 'border-l-error', text: 'text-error' },
  warning: { icon: AlertTriangle, bg: 'bg-warning/10', border: 'border-l-warning', text: 'text-warning' },
  info:    { icon: Info, bg: 'bg-brand/10', border: 'border-l-brand', text: 'text-brand' },
};

export default function Alert({ variant = 'info', onDismiss, className, children, ...props }: AlertProps) {
  const { icon: Icon, bg, border, text } = config[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border-l-4 px-4 py-3 text-[14px] animate-fade-in',
        bg, border, className
      )}
      role="alert"
      {...props}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', text)} />
      <div className="flex-1 text-text-primary">{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
