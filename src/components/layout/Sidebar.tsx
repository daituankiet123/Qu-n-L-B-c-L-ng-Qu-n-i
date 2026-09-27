import React from 'react';
import {
  LayoutDashboard,
  Users,
  Sliders,
  CalendarCheck2,
  FileCheck2,
  Receipt,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { SchoolLogo } from '../common/SchoolLogo';

export type ActiveTab =
  | 'dashboard'
  | 'personnel'
  | 'salary-config'
  | 'review-cycles'
  | 'approval'
  | 'payroll-sheet';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingReviewsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingReviewsCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tổng quan & Chỉ số',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'personnel' as ActiveTab,
      label: 'Hồ sơ QNCN (Database)',
      icon: Users,
      badge: 'Excel Import',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'salary-config' as ActiveTab,
      label: 'Quy chế & Bảng hệ số',
      icon: Sliders,
      badge: 'Nhập tay',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'review-cycles' as ActiveTab,
      label: 'Đợt xét nâng lương',
      icon: CalendarCheck2,
      badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'approval' as ActiveTab,
      label: 'Tổng cục Duyệt & Trích sao',
      icon: FileCheck2,
      badge: '2 Quyết định',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
    },
    {
      id: 'payroll-sheet' as ActiveTab,
      label: 'Bảng thanh toán lương',
      icon: Receipt,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0 flex flex-col justify-between">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Chức năng nghiệp vụ
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-amber-300' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-400 text-emerald-950 font-bold' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Military unit footer tag */}
      <div className="p-4 m-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
        <SchoolLogo size={40} className="ring-1 ring-emerald-600/30 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-slate-800">
            Trường CĐ Hậu cần 2
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Tổng cục Hậu cần - Kỹ thuật. Hệ thống quản trị nâng lương QNCN.
          </p>
        </div>
      </div>
    </aside>
  );
};
