import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastItem, ToastOptions } from '../types/toast';

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  success: (title: string, message: string, options?: Partial<ToastOptions>) => string;
  info: (title: string, message: string, options?: Partial<ToastOptions>) => string;
  warning: (title: string, message: string, options?: Partial<ToastOptions>) => string;
  error: (title: string, message: string, options?: Partial<ToastOptions>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duration = options.duration ?? 5000;

      const newToast: ToastItem = {
        ...options,
        id,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep maximum 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message: string, options?: Partial<ToastOptions>) => {
      return showToast({
        type: 'success',
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message: string, options?: Partial<ToastOptions>) => {
      return showToast({
        type: 'info',
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message: string, options?: Partial<ToastOptions>) => {
      return showToast({
        type: 'warning',
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message: string, options?: Partial<ToastOptions>) => {
      return showToast({
        type: 'error',
        title,
        message,
        ...options,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        success,
        info,
        warning,
        error,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
