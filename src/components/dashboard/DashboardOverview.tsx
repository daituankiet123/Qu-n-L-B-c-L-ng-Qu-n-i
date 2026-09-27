import React from 'react';
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
} from 'lucide-react';
import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
} from '../../types';
import { formatVND, calculatePayrollRecord } from '../../services/salaryCalculator';
import { evaluateQNCNEligibility } from '../../services/salaryProgressionEngine';
import { ActiveTab } from '../layout/Sidebar';
import { SchoolLogo } from '../common/SchoolLogo';

interface DashboardOverviewProps {
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  reviewCycles: SalaryReviewCycle[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenImportModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  qncnList,
  scales,
  rules,
  reviewCycles,
  onNavigate,
  onOpenImportModal,
}) => {
  // Current evaluation cutoff (e.g., end of current quarter or today)
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

  // By Unit breakdown
  const unitCounts: Record<string, number> = {};
  qncnList.forEach((p) => {
    unitCounts[p.donVi] = (unitCounts[p.donVi] || 0) + 1;
  });

  const activeCycle = reviewCycles[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-emerald-700/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Tổng cục Hậu cần - Kỹ thuật • Trường Cao Đẳng Hậu Cần 2
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Hệ Thống Phê Duyệt Nâng Bậc Lương QNCN
            </h2>
            <p className="mt-2 text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Quy trình 2 cấp chặt chẽ: Trường lập Tờ trình gửi <strong>Thủ trưởng Tổng cục Hậu cần</strong> phê duyệt & ký ban hành ➔ Sau đó <strong>Hiệu trưởng</strong> duyệt thành <strong>BẢN TRÍCH SAO</strong> gửi Ban Tài chính thi hành chi trả lương mới.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-md transition-all"
              >
                <Users className="w-4 h-4" />
                Import dữ liệu QNCN từ Excel
              </button>
              <button
                onClick={() => onNavigate('approval')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs border border-emerald-600/60 transition-all"
              >
                <Building className="w-4 h-4 text-amber-300" />
                1. Tờ trình Tổng cục
              </button>
              <button
                onClick={() => onNavigate('approval')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-sm"
              >
                <Stamp className="w-4 h-4 text-amber-200" />
                2. Bản Trích sao Hiệu trưởng
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs flex-shrink-0">
            <SchoolLogo size={105} className="ring-4 ring-amber-400/50 shadow-2xl hover:scale-105 transition-transform" />
            <span className="text-[11px] font-bold text-amber-300 mt-2">Trường CĐ Hậu cần 2</span>
            <span className="text-[10px] text-emerald-300">Thành lập 30-8-1977</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total QNCN */}
        <div
          onClick={() => onNavigate('personnel')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng quân số QNCN
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {qncnList.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">đồng chí</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <span>Xem hồ sơ chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Regular Due */}
        <div
          onClick={() => onNavigate('review-cycles')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Đến hạn nâng thường xuyên
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700 font-mono">
              {dueRegular.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">đủ niên hạn 36T/24T</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1">
            <span>Đưa vào đợt xét</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Early promotion (rewards) */}
        <div
          onClick={() => onNavigate('review-cycles')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Đủ điều kiện trước hạn
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {dueEarly.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">thành tích xuất sắc</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
            <span>Rút ngắn 6 - 12 tháng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Monthly Payroll Impact */}
        <div
          onClick={() => onNavigate('payroll-sheet')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quỹ lương thực lĩnh tháng
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 font-mono">
              {formatVND(totalCurrentMonthlyPayroll)}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center justify-between">
            <span>Dự kiến tăng thêm:</span>
            <span className="font-bold text-amber-600">+{formatVND(projectedMonthlyIncrease)}/tháng</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Action & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personnel Ready For Promotion */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Danh sách QNCN đủ tiêu chuẩn nâng bậc kỳ này
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tự động rà soát từ niên hạn giữ bậc, khen thưởng và lịch sử công tác
              </p>
            </div>
            <button
              onClick={() => onNavigate('review-cycles')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Chi tiết đợt xét <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">QNCN</th>
                  <th className="py-2.5 px-3 font-semibold">Đơn vị / Cấp bậc</th>
                  <th className="py-2.5 px-3 font-semibold">Bậc hiện tại</th>
                  <th className="py-2.5 px-3 font-semibold">Thời gian giữ</th>
                  <th className="py-2.5 px-3 font-semibold">Đề xuất</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Lương tăng/tháng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...dueRegular, ...dueEarly, ...dueBeyondGrade].slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.hoVaTen}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.maQNCN}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{item.donVi}</div>
                      <div className="text-[11px] text-emerald-700 font-medium">{item.capBac}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        Bậc {item.bacHienTai} ({item.heSoHienTai.toFixed(2)})
                      </div>
                      <div className="text-[10px] text-slate-500">{item.ngach}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-700 font-mono">
                        {item.soThangDaGiuBac} tháng
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.loaiNangLuong === 'Trước thời hạn'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : item.loaiNangLuong === 'Vượt khung'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {item.loaiNangLuong === 'Vượt khung'
                          ? `VK ${item.vuotKhungDeXuat}%`
                          : `Bậc ${item.bacDeXuat} (${item.heSoDeXuat.toFixed(2)})`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      +{formatVND(item.chenhLechTienLuong)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {disciplined.length > 0 && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Lưu ý kỷ luật:</span> Có {disciplined.length} đồng chí bị kéo dài thời gian nâng bậc theo quy định (do kỷ luật Khiển trách/Cảnh cáo).
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Review Cycle & Grade Distribution */}
        <div className="space-y-6">
          {/* Active Review Cycle Status Card */}
          {activeCycle && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Đợt xét hiện hành
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activeCycle.trangThai}
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activeCycle.tenDot}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Mã đợt: <span className="font-mono font-medium">{activeCycle.maDot}</span> • Năm: {activeCycle.nam}
                </p>
                <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số hồ sơ trong đợt:</span>
                    <span className="font-bold text-slate-800">{activeCycle.danhSachDeXuat.length} đ/c</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người lập:</span>
                    <span className="text-slate-700 font-medium">{activeCycle.nguoiLap}</span>
                  </div>
                  {activeCycle.quyetDinh && (
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Số quyết định:</span>
                      <span className="font-bold text-emerald-800 font-mono">{activeCycle.quyetDinh.soQuyetDinh}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onNavigate('approval')}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Phê duyệt Quyết định
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grade Breakdown Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Cơ cấu Ngạch lương QNCN
            </h4>
            <div className="space-y-2.5">
              {Object.entries(gradeCounts).map(([ngach, count]) => {
                const percent = Math.round((count / qncnList.length) * 100) || 0;
                return (
                  <div key={ngach} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 truncate max-w-[180px]">{ngach}</span>
                      <span className="text-slate-500 font-mono">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-700 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
