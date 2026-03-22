import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles = {
  primary:
    'bg-brand text-white hover:bg-brand-hover hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.98]',
  secondary:
    'bg-surface-2 text-text-primary border border-border hover:bg-surface-3 hover:border-border-hover active:scale-[0.98]',
  danger:
    'bg-error text-white hover:brightness-110 active:scale-[0.98]',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary',
  outline:
    'bg-transparent text-brand border border-brand hover:bg-brand-muted active:scale-[0.98]',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-[14px] gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium cursor-pointer',
        'rounded-[var(--radius-md)]',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
        'disabled:opacity-40 disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
export default Button;
