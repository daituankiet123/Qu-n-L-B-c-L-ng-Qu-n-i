export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  badge?: string;
  duration?: number; // milliseconds, default 5000ms
  createdAt: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ToastOptions = Omit<ToastItem, 'id' | 'createdAt'>;
