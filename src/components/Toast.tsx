import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none text-right">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#121814] border border-[#20df7c]/40 text-white shadow-2xl animate-in slide-in-from-left duration-200"
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[#20df7c] shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}

          <span className="text-xs font-medium">{toast.message}</span>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-[#8F9A93] hover:text-white mr-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
