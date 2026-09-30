import React from 'react';
import { motion } from 'motion/react';
import { Monitor, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenWindowsModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenWindowsModal }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // If running in standalone desktop app mode
  if (isInstalled) {
    return (
      <button
        onClick={onOpenWindowsModal}
        title="Ứng dụng đang chạy ở chế độ Windows Desktop Standalone. Nhấp để xem Trung tâm Windows."
        className="px-2.5 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border border-blue-600/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
        <span className="hidden xl:inline">Windows App</span>
      </button>
    );
  }

  // If prompt is available (Edge, Chrome on Windows)
  if (isInstallable) {
    return (
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={install}
        title="Cài đặt phần mềm trực tiếp lên máy tính Windows (Thêm vào Taskbar & Desktop)"
        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/50 text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer animate-pulse"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Cài đặt Windows</span>
      </motion.button>
    );
  }

  // Default button to open the Windows center
  return (
    <button
      onClick={onOpenWindowsModal}
      title="Trung tâm hỗ trợ cài đặt & khởi chạy trên hệ điều hành Windows"
      className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
    >
      <Monitor className="w-3.5 h-3.5 text-blue-400" />
      <span className="hidden xl:inline">Dùng trên Windows</span>
    </button>
  );
};
