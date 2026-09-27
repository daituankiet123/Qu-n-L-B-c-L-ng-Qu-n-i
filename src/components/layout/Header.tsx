import React from 'react';
import { Shield, Award, Database, RefreshCw, Download, Upload, AlertCircle } from 'lucide-react';
import { formatVND } from '../../services/salaryCalculator';
import { GeneralSalaryRules } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

interface HeaderProps {
  rules: GeneralSalaryRules;
  totalQNCN: number;
  dueForReviewCount: number;
  onResetDefaults: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  rules,
  totalQNCN,
  dueForReviewCount,
  onResetDefaults,
  onExportBackup,
  onImportBackup,
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white shadow-lg border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3.5">
            <SchoolLogo size={56} className="ring-2 ring-amber-400/50 hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  Tổng cục Hậu cần - Kỹ thuật
                </span>
                <span className="text-[11px] text-emerald-200 hidden sm:inline">Trường Cao Đẳng Hậu cần 2</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                QNCN BẬC LƯƠNG
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 border border-emerald-500/40">
                  Phiên bản 2026
                </span>
              </h1>
              <p className="text-xs text-emerald-200/90 font-medium">
                Hệ thống Tính toán, Quản lý Hồ sơ & Phê duyệt Nâng Bậc Lương Quân Nhân Chuyên Nghiệp
              </p>
            </div>
          </div>

          {/* Quick Metrics & System Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Base salary pill */}
            <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-lg px-3 py-1.5 text-right">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide">Mức lương cơ sở</div>
              <div className="text-sm font-bold text-amber-300 font-mono">
                {formatVND(rules.luongCoSo)}
              </div>
            </div>

            {/* Personnel Count */}
            <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-lg px-3 py-1.5 text-right">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide">Quân số QNCN</div>
              <div className="text-sm font-bold text-white font-mono flex items-center justify-end gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                {totalQNCN} đ/c
              </div>
            </div>

            {/* Pending alert */}
            {dueForReviewCount > 0 && (
              <div className="bg-amber-950/80 border border-amber-600/60 rounded-lg px-3 py-1.5 text-right">
                <div className="text-[10px] text-amber-300 uppercase tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" /> Đến hạn xét
                </div>
                <div className="text-sm font-bold text-amber-300 font-mono">
                  {dueForReviewCount} hồ sơ
                </div>
              </div>
            )}

            {/* Backup / Restore dropdown / buttons */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-emerald-800">
              <button
                onClick={onExportBackup}
                title="Sao lưu toàn bộ dữ liệu (JSON)"
                className="p-2 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors border border-emerald-600/40 text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sao lưu</span>
              </button>
              <button
                onClick={onImportBackup}
                title="Phục hồi dữ liệu từ file sao lưu"
                className="p-2 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors border border-emerald-600/40 text-xs flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Phục hồi</span>
              </button>
              <button
                onClick={onResetDefaults}
                title="Khôi phục dữ liệu gốc chuẩn Trường CĐHC2"
                className="p-2 rounded-lg bg-emerald-900/60 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors border border-emerald-700/50 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Dữ liệu gốc</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
