import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  FileSpreadsheet,
  CalendarCheck2,
  Users,
  Award,
  Bell,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ToastItem } from '../../types/toast';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  const getIcon = (toast: ToastItem) => {
    if (toast.badge?.includes('EXCEL') || toast.title.includes('Import') || toast.title.includes('hồ sơ')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (toast.badge?.includes('ĐỢT XÉT') || toast.title.includes('đợt xét') || toast.title.includes('Đợt')) {
      return <CalendarCheck2 className="w-5 h-5 text-blue-600" />;
    }
    if (toast.title.includes('Quyết định') || toast.title.includes('Trích sao')) {
      return <Award className="w-5 h-5 text-amber-600" />;
    }

    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-emerald-600 border-slate-200/80';
      case 'warning':
        return 'border-l-4 border-l-amber-500 border-slate-200/80';
      case 'error':
        return 'border-l-4 border-l-rose-500 border-slate-200/80';
      default:
        return 'border-l-4 border-l-blue-600 border-slate-200/80';
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 70, scale: 0.9, transition: { duration: 0.22 } }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 28,
            }}
            className={`pointer-events-auto neu-flat rounded-2xl p-4 shadow-xl bg-[#e9eef5]/95 backdrop-blur-md relative overflow-hidden border ${getBorderColor(
              toast.type
            )}`}
          >
            {/* Top row: Icon, Title, Badge, Dismiss Button */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(toast)}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {toast.title}
                  </h4>
                  {toast.badge && (
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider neu-pressed text-emerald-950 font-mono">
                      {toast.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {toast.message}
                </p>

                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      dismissToast(toast.id);
                    }}
                    className="mt-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center gap-1"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-300/40 transition-colors flex-shrink-0"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timed progress bar */}
            {toast.duration && toast.duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  toast.type === 'success'
                    ? 'bg-emerald-600'
                    : toast.type === 'warning'
                    ? 'bg-amber-500'
                    : toast.type === 'error'
                    ? 'bg-rose-500'
                    : 'bg-blue-600'
                }`}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
