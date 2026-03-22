import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-brand/10 text-brand',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-error/10 text-error',
};

const sizeStyles = { sm: 'px-2 py-0.5 text-[11px]', md: 'px-2.5 py-0.5 text-[12px]' };

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full font-medium tracking-wide uppercase', variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}
