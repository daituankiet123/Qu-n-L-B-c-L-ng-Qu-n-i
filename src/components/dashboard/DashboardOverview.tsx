import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Receipt,
  FileCheck2,
  Calendar,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Building,
  Stamp,
  Printer,
  FileText,
  BarChart3,
  Layers,
  Scale,
  Clock,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
  AuditLogEntry,
  DisciplineCaseRecord,
} from '../../types';
import { formatVND, calculatePayrollRecord } from '../../services/salaryCalculator';
import { evaluateQNCNEligibility } from '../../services/salaryProgressionEngine';
import { ActiveTab } from '../layout/Sidebar';
import { SchoolLogo } from '../common/SchoolLogo';
import { SystemAuditLogCard } from './SystemAuditLogCard';
import { GradeStatisticalReportPdfModal } from './GradeStatisticalReportPdfModal';

interface DashboardOverviewProps {
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  reviewCycles: SalaryReviewCycle[];
  auditLogs?: AuditLogEntry[];
  disciplineCases?: DisciplineCaseRecord[];
  onClearAuditLogs?: () => void;
  onRefreshAuditLogs?: () => void;
  onAddManualAuditLog?: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenImportModal: () => void;
}

type DashboardSectionTab = 'overview' | 'breakdown' | 'workflow' | 'audit';

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  qncnList,
  scales,
  rules,
  reviewCycles,
  auditLogs = [],
  disciplineCases = [],
  onClearAuditLogs,
  onRefreshAuditLogs,
  onAddManualAuditLog,
  onNavigate,
  onOpenImportModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DashboardSectionTab>('overview');
  const [showGradeReportModal, setShowGradeReportModal] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Evaluate all personnel
  const evaluations = useMemo(
    () => qncnList.map((p) => evaluateQNCNEligibility(p, scales, rules, todayStr)),
    [qncnList, scales, rules, todayStr]
  );

  const dueRegular = evaluations.filter((e) => e.loaiNangLuong === 'Thường xuyên');
  const dueEarly = evaluations.filter((e) => e.loaiNangLuong === 'Trước thời hạn');
  const dueBeyondGrade = evaluations.filter((e) => e.loaiNangLuong === 'Vượt khung');
  const disciplined = evaluations.filter((e) => e.loaiNangLuong === 'Kéo dài do kỷ luật');

  // Total current monthly payroll
  const totalCurrentMonthlyPayroll = useMemo(() => {
    return qncnList.reduce((sum, p) => {
      const rec = calculatePayrollRecord(p, rules);
      return sum + rec.thucLinh;
    }, 0);
  }, [qncnList, rules]);

  // Projected increase if all eligible get promoted
  const projectedMonthlyIncrease = useMemo(() => {
    return [...dueRegular, ...dueEarly, ...dueBeyondGrade].reduce(
      (sum, e) => sum + e.chenhLechTienLuong,
      0
    );
  }, [dueRegular, dueEarly, dueBeyondGrade]);

  // Average Salary Coefficient
  const averageCoefficient = useMemo(() => {
    if (qncnList.length === 0) return 0;
    const total = qncnList.reduce((sum, p) => sum + (p.heSoLuongHienTai || 0), 0);
    return Number((total / qncnList.length).toFixed(2));
  }, [qncnList]);

  // Personnel with Beyond Grade Allowance (Phụ cấp TNVK)
  const vuotKhungPersonnel = useMemo(() => {
    return qncnList.filter((p) => (p.thamNienVuotKhung || 0) > 0);
  }, [qncnList]);

  // Personnel with Professional Seniority Allowance (Phụ cấp TN Nghề)
  const thamNienNghePersonnel = useMemo(() => {
    return qncnList.filter((p) => (p.thamNienNghe || 0) > 0);
  }, [qncnList]);

  // By Grade breakdown
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    qncnList.forEach((p) => {
      counts[p.ngach] = (counts[p.ngach] || 0) + 1;
    });
    return counts;
  }, [qncnList]);

  // Military Rank breakdown
  const rankOrder = [
    'Đại tá QNCN',
    'Thượng tá QNCN',
    'Trung tá QNCN',
    'Thiếu tá QNCN',
    'Đại úy QNCN',
    'Thượng úy QNCN',
    'Trung úy QNCN',
    'Thiếu úy QNCN',
  ];

  const rankCounts = useMemo(() => {
    const map: Record<string, number> = {};
    qncnList.forEach((p) => {
      const r = p.capBac || 'Chưa xếp hạng';
      map[r] = (map[r] || 0) + 1;
    });
    return map;
  }, [qncnList]);

  // Unit breakdown
  const unitStats = useMemo(() => {
    const statsMap: Record<
      string,
      { count: number; totalPayroll: number; dueCount: number; disciplinedCount: number }
    > = {};

    qncnList.forEach((p) => {
      const u = p?.donVi || 'Chưa phân bổ';
      if (!statsMap[u]) {
        statsMap[u] = { count: 0, totalPayroll: 0, dueCount: 0, disciplinedCount: 0 };
      }
      statsMap[u].count += 1;
      const rec = calculatePayrollRecord(p, rules);
      statsMap[u].totalPayroll += rec.thucLinh;
    });

    evaluations.forEach((e) => {
      const u = e?.donVi || 'Chưa phân bổ';
      if (statsMap[u]) {
        if (
          e.loaiNangLuong === 'Thường xuyên' ||
          e.loaiNangLuong === 'Trước thời hạn' ||
          e.loaiNangLuong === 'Vượt khung'
        ) {
          statsMap[u].dueCount += 1;
        }
      }
    });

    disciplineCases.forEach((c) => {
      const u = c?.donVi || 'Chưa phân bổ';
      if (statsMap[u]) {
        statsMap[u].disciplinedCount += 1;
      }
    });

    return Object.entries(statsMap).sort((a, b) => b[1].count - a[1].count);
  }, [qncnList, evaluations, disciplineCases, rules]);

  const activeCycle = reviewCycles[0];

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      return {
        greeting:
          'Xin chào buổi sáng! Chúc đồng chí một ngày làm việc hiệu quả, hoàn thành tốt nhiệm vụ tác chiến nghiệp vụ.',
        icon: '🌅',
      };
    } else if (hour >= 11 && hour < 14) {
      return {
        greeting:
          'Xin chào buổi trưa! Chúc đồng chí có thời gian nghỉ trưa thư thái và nhiều năng lượng.',
        icon: '☀️',
      };
    } else if (hour >= 14 && hour < 18) {
      return {
        greeting:
          'Xin chào buổi chiều! Chúc đồng chí phiên làm việc buổi chiều tập trung, rà soát chính xác mọi số liệu.',
        icon: '🌤️',
      };
    } else {
      return {
        greeting:
          'Xin chào buổi tối! Chúc đồng chí buổi tối an lành, hệ thống quản lý dữ liệu sẵn sàng 24/7.',
        icon: '🌙',
      };
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Neumorphic Welcome Hero Banner */}
      <div className="neu-flat rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#eaf0f7] to-[#e1e9f2] border border-white/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-pressed text-emerald-900 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Tổng cục Hậu cần - Kỹ thuật • Trường Cao Đẳng Hậu Cần 2
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Tổng Quan Điều Hành & Nâng Bậc Lương QNCN
            </h2>

            <div className="flex items-center gap-2 py-1 text-slate-700 text-xs sm:text-sm font-semibold">
              <span className="text-base select-none">{timeGreeting.icon}</span>
              <span className="text-emerald-950 font-bold">{timeGreeting.greeting}</span>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenImportModal}
                className="px-3.5 py-2 rounded-2xl neu-amber text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Import Excel QNCN
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('approval')}
                className="px-3.5 py-2 rounded-2xl neu-emerald text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5 text-amber-300" />
                1. Tờ trình Tổng cục
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('approval')}
                className="px-3.5 py-2 rounded-2xl neu-convex hover:bg-white text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Stamp className="w-3.5 h-3.5 text-amber-600" />
                2. Bản Trích sao Hiệu trưởng
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('discipline')}
                className="px-3.5 py-2 rounded-2xl neu-convex hover:bg-white text-rose-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-rose-200"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                3. Xử lý Kỷ luật kéo dài ({disciplineCases.length})
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('payroll-sheet')}
                className="px-3.5 py-2 rounded-2xl neu-convex hover:bg-white text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-rose-700" />
                4. Báo cáo Bảng lương PDF
              </motion.button>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowGradeReportModal(true)}
                className="px-3.5 py-2 rounded-2xl neu-convex hover:bg-white text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                5. Thống kê Ngạch lương
              </motion.button>
            </div>
          </div>

          {/* School Badge & Traditional Day */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="hidden lg:flex flex-col items-center justify-center p-5 neu-pressed rounded-3xl flex-shrink-0"
          >
            <SchoolLogo size={92} className="ring-4 ring-amber-400/50 shadow-xl" />
            <span className="text-xs font-black text-slate-800 mt-2 tracking-tight">
              Trường CĐ Hậu cần 2
            </span>
            <span className="text-[11px] font-bold text-emerald-800 font-mono">30-8-1977</span>
          </motion.div>
        </div>
      </div>

      {/* 4 Detail Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 neu-pressed rounded-2xl">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'overview'
              ? 'neu-flat text-emerald-950 font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-700" />
          <span>1. Chỉ số Điều hành & Tiến độ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('breakdown')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'breakdown'
              ? 'neu-flat text-emerald-950 font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-700" />
          <span>2. Cơ cấu Quân hàm & 16 Đơn vị</span>
        </button>

        <button
          onClick={() => setActiveSubTab('workflow')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'workflow'
              ? 'neu-flat text-emerald-950 font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-700" />
          <span>3. Luồng Nghiệp vụ & Pháp lý Quân sự</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'audit'
              ? 'neu-flat text-emerald-950 font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-purple-700" />
          <span>4. Sổ Nhật ký & Giám sát ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CHỈ SỐ ĐIỀU HÀNH & TIẾN ĐỘ                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
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
                <span className="text-amber-700 font-black">
                  +{formatVND(projectedMonthlyIncrease)}/tháng
                </span>
              </div>
            </motion.div>
          </div>

          {/* 4 Secondary Quick Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="neu-pressed rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Hệ số lương TB</span>
                <span className="text-lg font-black text-slate-800 font-mono">{averageCoefficient}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                Toàn trường
              </span>
            </div>

            <div className="neu-pressed rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Hưởng Phụ cấp TNVK</span>
                <span className="text-lg font-black text-purple-900 font-mono">
                  {vuotKhungPersonnel.length} đ/c
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                {Math.round((vuotKhungPersonnel.length / (qncnList.length || 1)) * 100)}%
              </span>
            </div>

            <div className="neu-pressed rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Phụ cấp Thâm niên nghề</span>
                <span className="text-lg font-black text-blue-900 font-mono">
                  {thamNienNghePersonnel.length} đ/c
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                {Math.round((thamNienNghePersonnel.length / (qncnList.length || 1)) * 100)}%
              </span>
            </div>

            <div
              onClick={() => onNavigate('discipline')}
              className="neu-pressed rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:bg-rose-50/50 transition-colors"
            >
              <div>
                <span className="text-[11px] font-bold text-rose-700 block">Kéo dài do kỷ luật</span>
                <span className="text-lg font-black text-rose-900 font-mono">
                  {disciplineCases.length} đ/c
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                Theo dõi
              </span>
            </div>
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
                    <span className="font-black">Cảnh báo kỷ luật:</span> Có {disciplined.length} đồng
                    chí bị kéo dài thời gian nâng bậc theo quy định Quân đội.
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
                      Mã đợt:{' '}
                      <span className="font-mono font-bold text-slate-700">{activeCycle.maDot}</span> •
                      Năm {activeCycle.nam}
                    </p>

                    <div className="mt-3 text-xs neu-pressed p-3 rounded-2xl space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Số hồ sơ trong đợt:</span>
                        <span className="font-bold text-slate-900">
                          {activeCycle.danhSachDeXuat.length} đ/c
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Người lập:</span>
                        <span className="text-slate-800 font-medium truncate max-w-[130px]">
                          {activeCycle.nguoiLap}
                        </span>
                      </div>
                      {activeCycle.quyetDinh && (
                        <div className="flex justify-between pt-1 border-t border-slate-300/50">
                          <span className="text-slate-500">QĐ Tổng cục:</span>
                          <span className="font-bold text-emerald-900 font-mono">
                            {activeCycle.quyetDinh.soQuyetDinh}
                          </span>
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
                <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Cơ cấu Ngạch lương QNCN
                  </h4>
                  <button
                    onClick={() => setShowGradeReportModal(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl neu-convex text-emerald-800 hover:text-emerald-950 font-bold text-[11px] transition-all"
                    title="Xuất báo cáo PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-700" />
                    In Báo cáo
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(gradeCounts).map(([ngach, count]) => {
                    const countNum = Number(count) || 0;
                    const percent = Math.round((countNum / (qncnList.length || 1)) * 100) || 0;
                    return (
                      <div key={ngach} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 truncate max-w-[170px]">{ngach}</span>
                          <span className="text-slate-500 font-mono font-bold">
                            {countNum} ({percent}%)
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

                <motion.button
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGradeReportModal(true)}
                  className="w-full mt-3 py-2 px-3 rounded-2xl neu-emerald text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  Xuất Báo Cáo Thống Kê Định Kỳ (PDF)
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: CƠ CẤU QUÂN HÀM & 16 ĐƠN VỊ                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'breakdown' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Rank Distribution & Seniority Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rank Distribution */}
            <div className="neu-flat rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    Cơ cấu Cấp bậc Quân hàm QNCN
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phân bổ quân hàm quân nhân chuyên nghiệp toàn Trường CĐHC2
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 neu-pressed px-2.5 py-1 rounded-xl">
                  {qncnList.length} đồng chí
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {rankOrder.map((rank) => {
                  const count = rankCounts[rank] || 0;
                  const pct = Math.round((count / (qncnList.length || 1)) * 100);
                  const isColonel = rank.includes('Đại tá') || rank.includes('Thượng tá');
                  return (
                    <div
                      key={rank}
                      className="neu-pressed rounded-2xl p-3 text-center space-y-1 hover:bg-white/40 transition-colors"
                    >
                      <span className="text-[11px] font-bold text-slate-600 block truncate" title={rank}>
                        {rank.replace(' QNCN', '')}
                      </span>
                      <div className="text-xl font-black text-slate-900 font-mono">{count}</div>
                      <div className="text-[10px] text-emerald-800 font-semibold">{pct}% quân số</div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isColonel ? 'bg-amber-600' : 'bg-emerald-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seniority & Beyond Grade Insights */}
            <div className="neu-flat rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Chế độ Phụ cấp Thâm niên & Vượt khung
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hưởng theo năm phục vụ quân ngũ và kịch khung ngạch lương
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="neu-pressed rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      Phụ cấp thâm niên nghề Quân đội
                    </span>
                    <p className="text-[11px] text-slate-500">
                      5% sau 5 năm công tác, mỗi năm tiếp theo tăng thêm 1%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-blue-900 font-mono">
                      {thamNienNghePersonnel.length} đ/c
                    </span>
                    <span className="block text-[10px] text-slate-500">Đang hưởng chế độ</span>
                  </div>
                </div>

                <div className="neu-pressed rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      Phụ cấp thâm niên vượt khung (TNVK)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      5% sau khi giữ bậc cuối cùng đủ niên hạn, mỗi năm sau +1%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-purple-900 font-mono">
                      {vuotKhungPersonnel.length} đ/c
                    </span>
                    <span className="block text-[10px] text-slate-500">Kịch khung ngạch</span>
                  </div>
                </div>

                <div className="neu-pressed rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      Mức lương cơ sở áp dụng (Nghị định 73/2024/NĐ-CP)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Chính thức có hiệu lực từ ngày 01/07/2024
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-900 font-mono">
                      {rules.luongCoSo.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="block text-[10px] text-emerald-700 font-bold">Chuẩn Chính phủ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Breakdown Table */}
          <div className="neu-flat rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-300/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  Bảng tổng hợp chi tiết theo 16 Đơn vị, Khoa, Ban, Tiểu đoàn
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thống kê số lượng quân nhân, quỹ tiền lương thực tế và số đồng chí đến hạn nâng bậc
                </p>
              </div>
              <button
                onClick={() => onNavigate('payroll-sheet')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-convex text-xs font-bold text-emerald-900 hover:text-emerald-950 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Xem Bảng thanh toán lương chi tiết
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl neu-pressed p-2">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-600 font-bold border-b border-slate-300/80">
                  <tr>
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Đơn vị / Khoa / Ban</th>
                    <th className="py-2.5 px-3 text-center">Quân số</th>
                    <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                    <th className="py-2.5 px-3 text-right">Tổng quỹ lương/tháng</th>
                    <th className="py-2.5 px-3 text-right">Lương bình quân</th>
                    <th className="py-2.5 px-3 text-center">Đến hạn nâng bậc</th>
                    <th className="py-2.5 px-3 text-center">Kỷ luật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {unitStats.map(([unitName, s], idx) => {
                    const avgSalary = s.count > 0 ? Math.round(s.totalPayroll / s.count) : 0;
                    const pct = Math.round((s.count / (qncnList.length || 1)) * 100);
                    return (
                      <tr key={unitName} className="hover:bg-white/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-600 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{unitName}</td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">{s.count}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-mono">{pct}%</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900">
                          {formatVND(s.totalPayroll)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {formatVND(avgSalary)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {s.dueCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold font-mono text-[11px]">
                              {s.dueCount} đ/c
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {s.disciplinedCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold font-mono text-[11px]">
                              {s.disciplinedCount}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: LUỒNG NGHIỆP VỤ & PHÁP LÝ QUÂN SỰ                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'workflow' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 5-Step Military Standard Workflow Map */}
          <div className="neu-flat rounded-3xl p-6 space-y-6">
            <div className="pb-2 border-b border-slate-300/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                Sơ Đồ Quy Trình Tác Chiến Nghiệp Vụ Nâng Bậc Lương QNCN (5 Bước Chuẩn Quân Đội)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy trình khép kín từ khâu rà soát niên hạn đến ban hành Quyết định và trích sao thi hành
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Step 1 */}
              <div className="neu-pressed rounded-2xl p-4 space-y-2 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center font-mono">
                      1
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase neu-flat px-2 py-0.5 rounded-lg">
                      Rà soát
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Ban Quân lực rà soát</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hệ thống tự động quét niên hạn 36T/24T, kiểm tra thành tích khen thưởng và hồ sơ kỷ luật.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('personnel')}
                  className="mt-3 w-full py-1.5 rounded-xl neu-convex text-[11px] font-bold text-emerald-900 flex items-center justify-center gap-1"
                >
                  Hồ sơ QNCN <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Step 2 */}
              <div className="neu-pressed rounded-2xl p-4 space-y-2 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-blue-700 text-white font-black text-xs flex items-center justify-center font-mono">
                      2
                    </span>
                    <span className="text-[10px] font-bold text-blue-800 uppercase neu-flat px-2 py-0.5 rounded-lg">
                      Xét duyệt
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Hội đồng Lương xét</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Lập Đợt xét duyệt, thông qua Hội đồng thi đua khen thưởng và lập Tờ trình số 89/TTr-HC2.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('review-cycles')}
                  className="mt-3 w-full py-1.5 rounded-xl neu-convex text-[11px] font-bold text-blue-900 flex items-center justify-center gap-1"
                >
                  Đợt xét lương <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Step 3 */}
              <div className="neu-pressed rounded-2xl p-4 space-y-2 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center font-mono">
                      3
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 uppercase neu-flat px-2 py-0.5 rounded-lg">
                      Phê duyệt
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Thủ trưởng Tổng cục</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Chủ nhiệm Tổng cục Hậu cần phê duyệt Tờ trình và ký ban hành Quyết định số 318/QĐ-TCHC.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('approval')}
                  className="mt-3 w-full py-1.5 rounded-xl neu-convex text-[11px] font-bold text-amber-900 flex items-center justify-center gap-1"
                >
                  Xem Quyết định <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Step 4 */}
              <div className="neu-pressed rounded-2xl p-4 space-y-2 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-rose-700 text-white font-black text-xs flex items-center justify-center font-mono">
                      4
                    </span>
                    <span className="text-[10px] font-bold text-rose-800 uppercase neu-flat px-2 py-0.5 rounded-lg">
                      Trích sao
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Hiệu trưởng ký Trích sao</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hiệu trưởng ký chứng thực Bản Trích sao số 52/TS-HC2 ban hành đến các đơn vị, cơ quan.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('approval')}
                  className="mt-3 w-full py-1.5 rounded-xl neu-convex text-[11px] font-bold text-rose-900 flex items-center justify-center gap-1"
                >
                  Bản Trích sao <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Step 5 */}
              <div className="neu-pressed rounded-2xl p-4 space-y-2 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-purple-700 text-white font-black text-xs flex items-center justify-center font-mono">
                      5
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 uppercase neu-flat px-2 py-0.5 rounded-lg">
                      Chi trả
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Ban Tài chính chi trả</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Tính toán bảng thanh toán tiền lương mới, lập dự toán ngân sách và in báo cáo theo dõi.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('payroll-sheet')}
                  className="mt-3 w-full py-1.5 rounded-xl neu-convex text-[11px] font-bold text-purple-900 flex items-center justify-center gap-1"
                >
                  Bảng lương tháng <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Legal Framework & Military Regulations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Legal Documents */}
            <div className="neu-flat rounded-3xl p-6 space-y-4">
              <div className="pb-2 border-b border-slate-300/60">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  Căn Cứ Pháp Lý & Văn Bản Quy Phạm Pháp Luật Áp Dụng
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các văn bản quy định thẩm quyền, tiêu chuẩn và hệ số tiền lương Quân đội
                </p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                <div className="neu-pressed rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>1. Luật QNCN, Công nhân và Viên chức quốc phòng</span>
                    <span className="text-emerald-800 font-mono text-[11px]">Năm 2015</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Quy định vị trí, chức năng, quyền lợi, nghĩa vụ và chế độ tiền lương, phụ cấp của QNCN trong Quân đội nhân dân Việt Nam.
                  </p>
                </div>

                <div className="neu-pressed rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>2. Nghị định số 73/2024/NĐ-CP của Chính phủ</span>
                    <span className="text-emerald-800 font-mono text-[11px]">30/06/2024</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Quy định mức lương cơ sở 2.340.000 VNĐ/tháng áp dụng đối với cán bộ, công chức, viên chức và lực lượng vũ trang.
                  </p>
                </div>

                <div className="neu-pressed rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>3. Thông tư số 170/2016/TT-BQP của Bộ Quốc phòng</span>
                    <span className="text-emerald-800 font-mono text-[11px]">Bộ Quốc phòng</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Quy định cấp bậc quân hàm QNCN tương ứng với mức lương; thời hạn nâng bậc lương và kéo dài thời hạn nâng lương do kỷ luật.
                  </p>
                </div>

                <div className="neu-pressed rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>4. Nghị định số 204/2004/NĐ-CP của Chính phủ</span>
                    <span className="text-emerald-800 font-mono text-[11px]">Chính phủ</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Quy định chế độ tiền lương đối với cán bộ, công chức, viên chức và lực lượng vũ trang (Bảng lương nhóm ngạch QNCN).
                  </p>
                </div>
              </div>
            </div>

            {/* Promotion & Discipline Regulations */}
            <div className="neu-flat rounded-3xl p-6 space-y-4">
              <div className="pb-2 border-b border-slate-300/60">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-700" />
                  Quy Định Niên Hạn Nâng Bậc & Xử Lý Kỷ Luật
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời hạn giữ bậc tiêu chuẩn và số tháng kéo dài tương ứng hình thức kỷ luật
                </p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                {/* Regular period */}
                <div className="neu-pressed rounded-2xl p-3 space-y-1">
                  <span className="font-bold text-slate-900 block">
                    Niên hạn giữ bậc thường xuyên:
                  </span>
                  <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                    <li>
                      <strong className="text-slate-900">36 tháng:</strong> Áp dụng cho ngạch Cao cấp Nhóm 1 (CC-1), Cao cấp Nhóm 2 (CC-2) và Trung cấp Nhóm 1 (TC-1).
                    </li>
                    <li>
                      <strong className="text-slate-900">24 tháng:</strong> Áp dụng cho ngạch Trung cấp Nhóm 2 (TC-2) và Sơ cấp (SC).
                    </li>
                  </ul>
                </div>

                {/* Early promotion */}
                <div className="neu-pressed rounded-2xl p-3 space-y-1">
                  <span className="font-bold text-slate-900 block">
                    Nâng bậc lương trước thời hạn (Thành tích xuất sắc):
                  </span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Quân nhân đạt danh hiệu Chiến sĩ thi đua toàn quân, Huân chương hoặc Bằng khen Bộ Quốc phòng được xem xét rút ngắn từ <strong>6 đến 12 tháng</strong>. Không vượt quá 10% quân số trong đợt xét.
                  </p>
                </div>

                {/* Disciplinary delay */}
                <div className="neu-pressed rounded-2xl p-3 space-y-1 border border-rose-200">
                  <span className="font-bold text-rose-900 block">
                    Quy định kéo dài thời hạn do bị xử lý kỷ luật:
                  </span>
                  <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                    <li>
                      <span className="font-bold text-rose-800">Khiển trách:</span> Kéo dài thêm <strong>06 tháng</strong> so với thời hạn thông thường.
                    </li>
                    <li>
                      <span className="font-bold text-rose-800">Cảnh cáo:</span> Kéo dài thêm <strong>12 tháng</strong> so với thời hạn thông thường.
                    </li>
                    <li>
                      <span className="font-bold text-rose-800">Giáng chức / Cách chức:</span> Kéo dài thêm <strong>12 tháng</strong> kể từ ngày thi hành quyết định kỷ luật.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SỔ NHẬT KÝ & GIÁM SÁT HỆ THỐNG                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6 animate-fadeIn">
          {/* System Audit Log Section for Inspection and Governance */}
          <SystemAuditLogCard
            logs={auditLogs}
            onClearLogs={onClearAuditLogs}
            onRefreshLogs={onRefreshAuditLogs}
            onAddManualLog={onAddManualAuditLog}
          />
        </div>
      )}

      {/* Grade Statistical Report PDF Modal */}
      <GradeStatisticalReportPdfModal
        isOpen={showGradeReportModal}
        onClose={() => setShowGradeReportModal(false)}
        qncnList={qncnList}
        scales={scales}
        rules={rules}
      />
    </div>
  );
};
