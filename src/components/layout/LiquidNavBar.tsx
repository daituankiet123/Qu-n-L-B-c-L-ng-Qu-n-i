import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Sliders,
  CalendarCheck2,
  FileCheck2,
  Receipt,
  Sparkles,
  Droplet,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface LiquidNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingReviewsCount: number;
}

export const LiquidNavBar: React.FC<LiquidNavBarProps> = ({
  activeTab,
  onTabChange,
  pendingReviewsCount,
}) => {
  const [hoveredTab, setHoveredTab] = useState<ActiveTab | null>(null);

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'personnel' as ActiveTab,
      label: 'Hồ sơ QNCN',
      icon: Users,
      badge: 'Excel',
    },
    {
      id: 'salary-config' as ActiveTab,
      label: 'Cấu hình Lương',
      icon: Sliders,
      badge: 'Nhập tay',
    },
    {
      id: 'review-cycles' as ActiveTab,
      label: 'Đợt xét nâng lương',
      icon: CalendarCheck2,
      badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : null,
    },
    {
      id: 'approval' as ActiveTab,
      label: 'Tổng cục & Trích sao',
      icon: FileCheck2,
      badge: '2 Quyết định',
    },
    {
      id: 'payroll-sheet' as ActiveTab,
      label: 'Bảng thanh toán lương',
      icon: Receipt,
      badge: null,
    },
  ];

  return (
    <div className="w-full relative py-1">
      {/* Liquid Floating Dock Container */}
      <div className="neu-flat rounded-2xl sm:rounded-full p-1.5 sm:p-2 flex items-center justify-between sm:justify-start gap-1 overflow-x-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-colors z-10 flex items-center gap-2 whitespace-nowrap outline-none flex-shrink-0"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Liquid Sliding Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="liquid-nav-pill"
                  className="absolute inset-0 rounded-full neu-emerald z-0"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                    mass: 0.8,
                  }}
                >
                  {/* Subtle fluid glossy glow highlight */}
                  <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-full pointer-events-none" />
                  
                  {/* Small ambient liquid droplet spark */}
                  <motion.div
                    className="absolute -top-1 right-3 w-1.5 h-1.5 rounded-full bg-amber-300 blur-[0.5px]"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              )}

              {/* Hover Fluid Ghost Bubble */}
              {!isActive && isHovered && (
                <motion.div
                  layoutId="liquid-hover-ghost"
                  className="absolute inset-0 rounded-full neu-pressed opacity-70 z-0"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 30,
                  }}
                />
              )}

              {/* Content Icon & Label */}
              <div className="relative z-10 flex items-center gap-2">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive
                      ? 'text-amber-300 scale-110'
                      : isHovered
                      ? 'text-emerald-700 scale-105'
                      : 'text-slate-500'
                  }`}
                />
                <span
                  className={`transition-colors duration-200 hidden md:inline ${
                    isActive
                      ? 'text-white font-extrabold'
                      : isHovered
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 font-medium'
                  }`}
                >
                  {item.label}
                </span>

                {/* Badges with squishy fluid physics */}
                {item.badge && (
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.15 }}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs transition-all ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950 shadow-sm'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
