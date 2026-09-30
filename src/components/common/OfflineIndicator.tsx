import React from 'react';
import { WifiOff } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400 no-print animate-bounce">
      <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
      <WifiOff className="w-4 h-4" />
      <span>Chế độ Ngoại tuyến (Offline): Dữ liệu máy tính Windows đang được sử dụng an toàn.</span>
    </div>
  );
};
