import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Sliders,
  CalendarCheck2,
  FileCheck2,
  Receipt,
  Droplets,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

export type ActiveTab =
  | 'dashboard'
  | 'personnel'
  | 'salary-config'
  | 'review-cycles'
  | 'discipline'
  | 'approval'
  | 'payroll-sheet';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingReviewsCount: number;
  disciplinedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingReviewsCount,
  disciplinedCount = 0,
}) => {
  const [hoveredTab, setHoveredTab] = useState<ActiveTab | null>(null);

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tổng quan & Chỉ số',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Báo cáo & điều hành',
    },
    {
      id: 'personnel' as ActiveTab,
      label: 'Hồ sơ QNCN (Database)',
      icon: Users,
      badge: 'Excel Import',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Quân số toàn trường',
    },
    {
      id: 'salary-config' as ActiveTab,
      label: 'Quy chế & Bảng hệ số',
      icon: Sliders,
      badge: 'Nhập tay',
      badgeColor: 'bg-amber-100 text-amber-900',
      desc: 'Tùy biến tham số 100%',
    },
    {
      id: 'review-cycles' as ActiveTab,
      label: 'Đợt xét nâng lương',
      icon: CalendarCheck2,
      badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : null,
      badgeColor: 'bg-rose-500 text-white',
      desc: 'Quét niên hạn tự động',
    },
    {
      id: 'discipline' as ActiveTab,
      label: 'Xét duyệt Kỷ luật',
      icon: ShieldAlert,
      badge: disciplinedCount > 0 ? `${disciplinedCount} đ/c` : null,
      badgeColor: 'bg-rose-600 text-white font-bold',
      desc: 'Kéo dài thời hạn nâng lương',
    },
    {
      id: 'approval' as ActiveTab,
      label: 'Tổng cục Duyệt & Trích sao',
      icon: FileCheck2,
      badge: '2 Quyết định',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      desc: 'Quy trình chuẩn BQP',
    },
    {
      id: 'payroll-sheet' as ActiveTab,
      label: 'Bảng thanh toán lương',
      icon: Receipt,
      badge: null,
      desc: 'Tính lương & Phiếu lương',
    },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col justify-between space-y-4 no-print">
      {/* Neumorphic Navigation Card */}
      <div className="neu-flat rounded-3xl p-4 sm:p-5 space-y-2 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-emerald-700" />
            Nghiệp vụ Tiền lương
          </span>
          <span className="text-[10px] font-semibold text-emerald-800 px-2 py-0.5 rounded-full neu-pressed">
            Hậu cần 2
          </span>
        </div>

        <nav className="space-y-2 relative">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                whileTap={{ scale: 0.98 }}
                className={`w-full relative flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left outline-none ${
                  isActive ? 'text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {/* Active Liquid Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-liquid-pill"
                    className="absolute inset-0 rounded-2xl neu-emerald z-0"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  >
                    <div className="absolute inset-x-3 top-0.5 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none" />
                  </motion.div>
                )}

                {/* Hover Soft Inset Shadow for non-active items */}
                {!isActive && isHovered && (
                  <motion.div
                    layoutId="sidebar-hover-slot"
                    className="absolute inset-0 rounded-2xl neu-pressed z-0"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}

                {/* Left content: Icon + Title + Description */}
                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950 font-bold shadow-md'
                        : isHovered
                        ? 'neu-convex text-emerald-800'
                        : 'neu-pressed text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 font-normal ${
                        isActive ? 'text-emerald-100/90' : 'text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>

                {/* Right Badge */}
                {item.badge && (
                  <div className="relative z-10">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                        isActive
                          ? 'bg-amber-400 text-emerald-950 font-black'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Neumorphic School Brand Card */}
      <div className="neu-flat rounded-3xl p-4 flex items-center gap-3 relative overflow-hidden group">
        <SchoolLogo size={46} className="ring-2 ring-emerald-700/30 flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-xs font-black text-slate-800 tracking-tight flex items-center gap-1">
            <span>Trường CĐHC2</span>
            <span className="text-[10px] font-bold text-amber-600 font-mono">1977</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug truncate">
            Tổng cục Hậu cần - Kỹ thuật
          </p>
          <div className="mt-1 text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
            <span>Hệ thống Soft-UI 2026</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
