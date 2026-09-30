import React from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Award,
  Database,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { formatVND } from '../../services/salaryCalculator';
import { GeneralSalaryRules } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { Monitor } from 'lucide-react';

interface HeaderProps {
  rules: GeneralSalaryRules;
  totalQNCN: number;
  dueForReviewCount: number;
  onResetDefaults: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onOpenWindowsModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  rules,
  totalQNCN,
  dueForReviewCount,
  onResetDefaults,
  onExportBackup,
  onImportBackup,
  onOpenWindowsModal,
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white shadow-xl border-b border-emerald-800/80 relative z-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-4">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <SchoolLogo
                size={54}
                className="ring-2 ring-amber-400/50 shadow-lg cursor-pointer"
              />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Tổng cục Hậu cần - Kỹ thuật
                </span>
                <span className="text-[11px] text-emerald-200 hidden sm:inline font-medium">
                  Trường Cao Đẳng Hậu cần 2
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                QNCN BẬC LƯƠNG
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700/90 text-amber-300 border border-emerald-500/40 font-mono">
                  Soft-UI 2026
                </span>
              </h1>
              <p className="text-xs text-emerald-200/90 font-medium">
                Hệ thống Tính toán, Quản lý Hồ sơ & Phê duyệt Nâng Bậc Lương Quân Nhân Chuyên Nghiệp
              </p>
            </div>
          </div>

          {/* Quick Metrics & Neumorphic Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Base salary pill */}
            <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-right shadow-inner">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide font-semibold">
                Mức lương cơ sở
              </div>
              <div className="text-sm font-black text-amber-300 font-mono">
                {formatVND(rules.luongCoSo)}
              </div>
            </div>

            {/* Personnel Count */}
            <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-right shadow-inner">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide font-semibold">
                Quân số QNCN
              </div>
              <div className="text-sm font-black text-white font-mono flex items-center justify-end gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                {totalQNCN} đ/c
              </div>
            </div>

            {/* Pending alert */}
            {dueForReviewCount > 0 && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-amber-950/90 border border-amber-500/60 rounded-xl px-3 py-1.5 text-right shadow-inner"
              >
                <div className="text-[10px] text-amber-300 uppercase tracking-wide font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" /> Đến hạn xét
                </div>
                <div className="text-sm font-black text-amber-300 font-mono">
                  {dueForReviewCount} hồ sơ
                </div>
              </motion.div>
            )}

            {/* Tactile System Buttons */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-emerald-800">
              {/* Windows App & PWA Install Button */}
              <PWAInstallButton onOpenWindowsModal={onOpenWindowsModal} />

              <motion.button
                whileHover={{ y: -1.5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenWindowsModal}
                title="Trung tâm cài đặt & hỗ trợ Windows (Phím tắt, Offline, In ấn A4)"
                className="px-2.5 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-100 hover:text-white transition-all border border-blue-600/50 text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Monitor className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden md:inline">Hỗ trợ Windows</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -1.5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExportBackup}
                title="Sao lưu toàn bộ dữ liệu (JSON)"
                className="px-2.5 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white transition-all border border-emerald-600/40 text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sao lưu</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -1.5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onImportBackup}
                title="Phục hồi dữ liệu từ file sao lưu"
                className="px-2.5 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white transition-all border border-emerald-600/40 text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Phục hồi</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -1.5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onResetDefaults}
                title="Khôi phục dữ liệu gốc chuẩn Trường CĐHC2"
                className="p-1.5 rounded-xl bg-emerald-950/70 hover:bg-rose-900/70 text-slate-300 hover:text-rose-200 transition-all border border-emerald-700/50 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px] font-semibold">Dữ liệu gốc</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
