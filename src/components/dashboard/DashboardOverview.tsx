import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Receipt,
  FileCheck2,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  Stamp,
  Droplets,
} from 'lucide-react';
import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
  AuditLogEntry,
} from '../../types';
import { formatVND, calculatePayrollRecord } from '../../services/salaryCalculator';
import { evaluateQNCNEligibility } from '../../services/salaryProgressionEngine';
import { ActiveTab } from '../layout/Sidebar';
import { SchoolLogo } from '../common/SchoolLogo';
import { SystemAuditLogCard } from './SystemAuditLogCard';

interface DashboardOverviewProps {
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  reviewCycles: SalaryReviewCycle[];
  auditLogs?: AuditLogEntry[];
  onClearAuditLogs?: () => void;
  onRefreshAuditLogs?: () => void;
  onAddManualAuditLog?: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenImportModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  qncnList,
  scales,
  rules,
  reviewCycles,
  auditLogs = [],
  onClearAuditLogs,
  onRefreshAuditLogs,
  onAddManualAuditLog,
  onNavigate,
  onOpenImportModal,
}) => {
  // Current evaluation cutoff
  const todayStr = new Date().toISOString().split('T')[0];

  // Evaluate all personnel
  const evaluations = qncnList.map((p) =>
    evaluateQNCNEligibility(p, scales, rules, todayStr)
  );

  const dueRegular = evaluations.filter((e) => e.loaiNangLuong === 'Thường xuyên');
  const dueEarly = evaluations.filter((e) => e.loaiNangLuong === 'Trước thời hạn');
  const dueBeyondGrade = evaluations.filter((e) => e.loaiNangLuong === 'Vượt khung');
  const disciplined = evaluations.filter((e) => e.loaiNangLuong === 'Kéo dài do kỷ luật');

  // Total current monthly payroll
  const totalCurrentMonthlyPayroll = qncnList.reduce((sum, p) => {
    const rec = calculatePayrollRecord(p, rules);
    return sum + rec.thucLinh;
  }, 0);

  // Projected increase if all eligible get promoted
  const projectedMonthlyIncrease = [...dueRegular, ...dueEarly, ...dueBeyondGrade].reduce(
    (sum, e) => sum + e.chenhLechTienLuong,
    0
  );

  // By Grade breakdown
  const gradeCounts: Record<string, number> = {};
  qncnList.forEach((p) => {
    gradeCounts[p.ngach] = (gradeCounts[p.ngach] || 0) + 1;
  });

  const activeCycle = reviewCycles[0];

  return (
    <div className="space-y-6">
      {/* Neumorphic Welcome Hero Banner */}
      <div className="neu-flat rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#eaf0f7] to-[#e1e9f2]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-pressed text-emerald-900 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Tổng cục Hậu cần - Kỹ thuật • Trường Cao Đẳng Hậu Cần 2
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Điều Hành & Nâng Bậc Lương QNCN
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Giao diện thiết kế phong cách <strong>Neumorphism (Soft UI)</strong> kết hợp <strong>Liquid Navigation</strong> siêu mượt mà. Đầy đủ quy trình 2 cấp: Tờ trình gửi <strong>Thủ trưởng Tổng cục Hậu cần duyệt</strong> và <strong>BẢN TRÍCH SAO Hiệu trưởng ký duyệt</strong> chi trả lương mới.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenImportModal}
                className="px-4 py-2.5 rounded-2xl neu-amber text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Import dữ liệu QNCN từ Excel
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('approval')}
                className="px-4 py-2.5 rounded-2xl neu-emerald text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Building className="w-4 h-4 text-amber-300" />
                1. Tờ trình Tổng cục
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('approval')}
                className="px-4 py-2.5 rounded-2xl neu-convex hover:bg-white text-slate-800 font-bold text-xs transition-all flex items-center gap-2"
              >
                <Stamp className="w-4 h-4 text-amber-600" />
                2. Bản Trích sao Hiệu trưởng
              </motion.button>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="hidden lg:flex flex-col items-center justify-center p-5 neu-pressed rounded-3xl flex-shrink-0"
          >
            <SchoolLogo size={100} className="ring-4 ring-amber-400/50 shadow-xl" />
            <span className="text-xs font-black text-slate-800 mt-2.5 tracking-tight">
              Trường CĐ Hậu cần 2
            </span>
            <span className="text-[11px] font-bold text-emerald-800 font-mono">
              30-8-1977
            </span>
          </motion.div>
        </div>
      </div>

      {/* Neumorphic 4 KPI Cards Grid with Tactile Spring Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total QNCN */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('personnel')}
          className="neu-flat rounded-3xl p-5 cursor-pointer group transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Tổng quân số QNCN
            </span>
            <div className="w-10 h-10 rounded-2xl neu-convex text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {qncnList.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">đồng chí</span>
          </div>
          <div className="mt-2 text-xs text-emerald-800 font-bold flex items-center gap-1">
            <span>Quản lý hồ sơ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Regular Due */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('review-cycles')}
          className="neu-flat rounded-3xl p-5 cursor-pointer group transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Đến hạn thường xuyên
            </span>
            <div className="w-10 h-10 rounded-2xl neu-convex text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-800 font-mono tracking-tight">
              {dueRegular.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">đủ niên hạn 36T/24T</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-bold flex items-center gap-1">
            <span>Đưa vào đợt xét</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Early Promotion */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('review-cycles')}
          className="neu-flat rounded-3xl p-5 cursor-pointer group transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Đủ điều kiện trước hạn
            </span>
            <div className="w-10 h-10 rounded-2xl neu-convex text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700 font-mono tracking-tight">
              {dueEarly.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">thành tích xuất sắc</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-bold flex items-center gap-1">
            <span>Rút ngắn 6 - 12 tháng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Monthly Payroll Impact */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('payroll-sheet')}
          className="neu-flat rounded-3xl p-5 cursor-pointer group transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Quỹ lương thực lĩnh tháng
            </span>
            <div className="w-10 h-10 rounded-2xl neu-convex text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 font-mono">
              {formatVND(totalCurrentMonthlyPayroll)}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-800 font-bold flex items-center justify-between">
            <span>Dự kiến tăng:</span>
            <span className="text-amber-700 font-black">+{formatVND(projectedMonthlyIncrease)}/tháng</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Personnel Ready For Promotion & Grade Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personnel Ready For Promotion Table in Neumorphic Card */}
        <div className="lg:col-span-2 neu-flat rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Danh sách QNCN đủ tiêu chuẩn nâng bậc kỳ này
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tự động rà soát niên hạn giữ bậc, khen thưởng và thời điểm công tác
              </p>
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => onNavigate('review-cycles')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              Chi tiết đợt xét <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="overflow-x-auto rounded-2xl neu-pressed p-2">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 font-bold border-b border-slate-300/80">
                <tr>
                  <th className="py-2.5 px-3">QNCN</th>
                  <th className="py-2.5 px-3">Đơn vị / Cấp bậc</th>
                  <th className="py-2.5 px-3">Bậc hiện tại</th>
                  <th className="py-2.5 px-3">Thời gian giữ</th>
                  <th className="py-2.5 px-3">Đề xuất</th>
                  <th className="py-2.5 px-3 text-right">Lương tăng/tháng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {[...dueRegular, ...dueEarly, ...dueBeyondGrade].slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.hoVaTen}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.maQNCN}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{item.donVi}</div>
                      <div className="text-[11px] text-emerald-800 font-bold">{item.capBac}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">
                        Bậc {item.bacHienTai} ({item.heSoHienTai.toFixed(2)})
                      </div>
                      <div className="text-[10px] text-slate-500">{item.ngach}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-black text-slate-800 font-mono">
                        {item.soThangDaGiuBac} tháng
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs ${
                          item.loaiNangLuong === 'Trước thời hạn'
                            ? 'neu-amber text-slate-950 font-black'
                            : item.loaiNangLuong === 'Vượt khung'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : 'neu-emerald text-white'
                        }`}
                      >
                        {item.loaiNangLuong === 'Vượt khung'
                          ? `VK ${item.vuotKhungDeXuat}%`
                          : `Bậc ${item.bacDeXuat} (${item.heSoDeXuat.toFixed(2)})`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-800">
                      +{formatVND(item.chenhLechTienLuong)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {disciplined.length > 0 && (
            <div className="p-3 neu-pressed rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-black">Cảnh báo kỷ luật:</span> Có {disciplined.length} đồng chí bị kéo dài thời gian nâng bậc theo quy định Quân đội.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Review Cycle & Grade Distribution */}
        <div className="space-y-6">
          {/* Active Review Cycle Card */}
          {activeCycle && (
            <div className="neu-flat rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Đợt xét hiện hành
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold neu-pressed text-emerald-900">
                  {activeCycle.trangThai}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activeCycle.tenDot}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Mã đợt: <span className="font-mono font-bold text-slate-700">{activeCycle.maDot}</span> • Năm {activeCycle.nam}
                </p>

                <div className="mt-3 text-xs neu-pressed p-3 rounded-2xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số hồ sơ trong đợt:</span>
                    <span className="font-bold text-slate-900">{activeCycle.danhSachDeXuat.length} đ/c</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người lập:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[130px]">{activeCycle.nguoiLap}</span>
                  </div>
                  {activeCycle.quyetDinh && (
                    <div className="flex justify-between pt-1 border-t border-slate-300/50">
                      <span className="text-slate-500">QĐ Tổng cục:</span>
                      <span className="font-bold text-emerald-900 font-mono">{activeCycle.quyetDinh.soQuyetDinh}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <motion.button
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onNavigate('approval')}
                    className="flex-1 py-2.5 px-3 rounded-2xl neu-emerald text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
                    Tổng cục & Trích sao
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Grade Distribution Neumorphic Card */}
          <div className="neu-flat rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-300/60">
              Cơ cấu Ngạch lương QNCN
            </h4>
            <div className="space-y-3">
              {Object.entries(gradeCounts).map(([ngach, count]) => {
                const percent = Math.round((count / qncnList.length) * 100) || 0;
                return (
                  <div key={ngach} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[170px]">{ngach}</span>
                      <span className="text-slate-500 font-mono font-bold">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full neu-pressed rounded-full h-2.5 overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="bg-emerald-700 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Audit Log Section for Inspection and Governance */}
      <SystemAuditLogCard
        logs={auditLogs}
        onClearLogs={onClearAuditLogs}
        onRefreshLogs={onRefreshAuditLogs}
        onAddManualLog={onAddManualAuditLog}
      />
    </div>
  );
};
