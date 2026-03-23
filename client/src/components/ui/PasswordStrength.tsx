import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

const criteria = [
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const levels = [
  { color: 'bg-error', label: 'Weak', textColor: 'text-error' },
  { color: 'bg-error', label: 'Weak', textColor: 'text-error' },
  { color: 'bg-warning', label: 'Fair', textColor: 'text-warning' },
  { color: 'bg-brand', label: 'Good', textColor: 'text-brand' },
  { color: 'bg-success', label: 'Strong', textColor: 'text-success' },
];

function getScore(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  criteria.forEach(({ test }) => { if (test(password)) score++; });
  return Math.min(score, 4);
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = getScore(password);

  if (!password) return null;

  const { color, label, textColor } = levels[score];

  return (
    <div className="mt-2 space-y-2 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= score ? color : 'bg-surface-3'
            )}
          />
        ))}
      </div>
      <span className={cn('text-[12px] font-medium', textColor)}>{label}</span>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {criteria.map(({ label: text, test }) => {
          const passed = test(password);
          return (
            <div key={text} className={cn('flex items-center gap-1.5 text-[12px] transition-colors', passed ? 'text-success' : 'text-text-tertiary')}>
              {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
