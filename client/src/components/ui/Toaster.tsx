'use client';

import { useToastStore } from '@/stores/toastStore';
import Toast from './Toast';

export default function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          type={t.type}
          message={t.message}
          onDismiss={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}
