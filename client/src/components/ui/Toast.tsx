import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onDismiss: () => void;
}

const icons = { success: CheckCircle, error: AlertCircle, info: Info };
const iconColors = { success: 'text-success', error: 'text-error', info: 'text-brand' };

export default function Toast({ type, message, onDismiss }: ToastProps) {
  const Icon = icons[type];
  return (
    <div
      className={cn(
        'flex items-start gap-3 w-80 rounded-xl border border-border',
        'bg-white p-4 shadow-lg animate-slide-in-right'
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[type])} />
      <p className="flex-1 text-[14px] text-text-primary leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
