'use client';

import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  const baseStyles =
    'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur bg-white/95 dark:bg-slate-900/90';

  const typeStyles =
    type === 'success'
      ? 'border-emerald-200 text-emerald-700 dark:border-emerald-700/60 dark:text-emerald-300'
      : 'border-red-200 text-red-700 dark:border-red-700/60 dark:text-red-300';

  return (
    <div className={`${baseStyles} ${typeStyles}`} role="status" aria-live="polite">
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
