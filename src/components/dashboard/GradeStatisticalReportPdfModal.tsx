import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Building,
  FileText,
  Calendar,
  Layers,
  Award,
  Users,
  TrendingUp,
  Shield,
  Briefcase,
  FileDown,
} from 'lucide-react';
import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
} from '../../types';
import { formatVND, calculatePayrollRecord } from '../../services/salaryCalculator';
import { docTienBangChu } from '../../services/numberToWords';
import { SchoolLogo } from '../common/SchoolLogo';
import { exportElementToPdf } from '../../services/pdfExportService';
import { useToast } from '../../context/ToastContext';

interface GradeStatisticalReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
}

export const GradeStatisticalReportPdfModal: React.FC<GradeStatisticalReportPdfModalProps> = ({
  isOpen,
  onClose,
  qncnList,
  scales,
  rules,
}) => {
  const [reportPeriod, setReportPeriod] = useState('Định kỳ Quý I - Năm 2026');
  const [copied, setCopied] = useState(false);
  const [showUnitBreakdown, setShowUnitBreakdown] = useState(true);
  const [showEvaluationNotes, setShowEvaluationNotes] = useState(true);

  // Signatures
  const [reporterName, setReporterName] = useState('Đại úy QNCN Vũ Quang Huy');
  const [reporterTitle, setReporterTitle] = useState('Trợ lý Ban Quân lực');
  const [headName, setHeadName] = useState('Thượng tá Lê Văn Nam');
  const [headTitle, setHeadTitle] = useState('Trưởng Ban Quân lực');
  const [commanderName, setCommanderName] = useState('Đại tá Trần Hữu Nghĩa');
  const [commanderTitle, setCommanderTitle] = useState('Hiệu trưởng Trường CĐ Hậu cần 2');

  // Compute grade groupings
  const gradeGroups = useMemo(() => {
    const list = [
      {
        id: 'cc1',
        name: 'Cao cấp Nhóm 1',
        shortCode: 'CC-1',
        description: 'Bác sỹ, Dược sỹ, Giảng viên chính, Kỹ sư chính',
        heSoMin: 3.85,
        heSoMax: 7.7,
      },
      {
        id: 'cc2',
        name: 'Cao cấp Nhóm 2',
        shortCode: 'CC-2',
        description: 'Giảng viên, Kỹ thuật viên cao cấp, Chuyên viên chính',
        heSoMin: 3.65,
        heSoMax: 7.5,
      },
      {
        id: 'tc1',
        name: 'Trung cấp Nhóm 1',
        shortCode: 'TC-1',
        description: 'Y sỹ, Kỹ thuật viên trung cấp, Nhân viên chuyên môn',
        heSoMin: 3.5,
        heSoMax: 6.2,
      },
      {
        id: 'tc2',
        name: 'Trung cấp Nhóm 2',
        shortCode: 'TC-2',
        description: 'Điều dưỡng trung cấp, Kỹ thuật viên phụ',
        heSoMin: 3.2,
        heSoMax: 5.9,
      },
      {
        id: 'sc',
        name: 'Sơ cấp',
        shortCode: 'SC',
        description: 'Nhân viên văn thư, Lái xe, Bảo vệ, Phục vụ hậu cần',
        heSoMin: 2.9,
        heSoMax: 5.6,
      },
    ];

    return list.map((g) => {
      const matched = qncnList.filter(
        (p) =>
          p.ngach === g.name ||
          p.ngach.includes(g.shortCode) ||
          p.ngach.toLowerCase().includes(g.id)
      );

      const count = matched.length;
      const totalHeSo = matched.reduce((sum, p) => sum + p.heSoLuongHienTai, 0);
      const avgHeSo = count > 0 ? totalHeSo / count : 0;

      // Vuot khung count
      const vuotKhungCount = matched.filter((p) => p.phanTramVuotKhung > 0).length;

      // Payroll totals
      const payrollRecords = matched.map((p) => calculatePayrollRecord(p, rules));
      const totalBasicSalary = payrollRecords.reduce((sum, r) => sum + r.luongTheoHeSo, 0);
      const totalNetSalary = payrollRecords.reduce((sum, r) => sum + r.thucLinh, 0);

      // Dominant military ranks
      const rankCounts: Record<string, number> = {};
      matched.forEach((p) => {
        rankCounts[p.capBac] = (rankCounts[p.capBac] || 0) + 1;
      });
      const topRanks = Object.entries(rankCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([r, c]) => `${r} (${c})`)
        .join(', ');

      // Grade range
      const bacList = matched.map((p) => p.bacLuongHienTai);
      const minBac = bacList.length > 0 ? Math.min(...bacList) : 0;
      const maxBac = bacList.length > 0 ? Math.max(...bacList) : 0;
      const bacRangeStr = count > 0 ? `Bậc ${minBac} - ${maxBac}` : '-';

      return {
        ...g,
        count,
        percent: qncnList.length > 0 ? Math.round((count / qncnList.length) * 100) : 0,
        avgHeSo,
        vuotKhungCount,
        bacRangeStr,
        topRanks: topRanks || 'Chưa có',
        totalBasicSalary,
        totalNetSalary,
        matched,
      };
    });
  }, [qncnList, rules]);

  // Total summary metrics
  const totalSummary = useMemo(() => {
    const totalCount = qncnList.length;
    const totalVuotKhung = qncnList.filter((p) => p.phanTramVuotKhung > 0).length;
    const allRecords = qncnList.map((p) => calculatePayrollRecord(p, rules));
    const totalPayroll = allRecords.reduce((sum, r) => sum + r.thucLinh, 0);
    const totalBasic = allRecords.reduce((sum, r) => sum + r.luongTheoHeSo, 0);
    const avgHeSo =
      totalCount > 0
        ? qncnList.reduce((sum, p) => sum + p.heSoLuongHienTai, 0) / totalCount
        : 0;

    return {
      totalCount,
      totalVuotKhung,
      totalPayroll,
      totalBasic,
      avgHeSo,
    };
  }, [qncnList, rules]);

  // Breakdown by Units
  const unitBreakdown = useMemo(() => {
    const unitMap = new Map<string, QNCNProfile[]>();
    qncnList.forEach((p) => {
      const u = p.donVi || 'Đơn vị khác';
      if (!unitMap.has(u)) unitMap.set(u, []);
      unitMap.get(u)!.push(p);
    });

    return Array.from(unitMap.entries())
      .map(([unitName, members]) => {
        const cc1 = members.filter((m) => m.ngach.includes('Cao cấp Nhóm 1') || m.ngach.includes('CC-1')).length;
        const cc2 = members.filter((m) => m.ngach.includes('Cao cấp Nhóm 2') || m.ngach.includes('CC-2')).length;
        const tc1 = members.filter((m) => m.ngach.includes('Trung cấp Nhóm 1') || m.ngach.includes('TC-1')).length;
        const tc2 = members.filter((m) => m.ngach.includes('Trung cấp Nhóm 2') || m.ngach.includes('TC-2')).length;
        const sc = members.filter((m) => m.ngach.includes('Sơ cấp') || m.ngach.includes('SC')).length;

        const totalNet = members.reduce(
          (sum, m) => sum + calculatePayrollRecord(m, rules).thucLinh,
          0
        );

        return {
          unitName,
          count: members.length,
          cc1,
          cc2,
          tc1,
          tc2,
          sc,
          totalNet,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [qncnList, rules]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handlePrint = () => {
    toast.info(
      'Đang gửi lệnh in ấn...',
      'Nếu trình duyệt không mở hộp thoại in, đồng chí hãy bấm nút "Tải file PDF (.pdf)" để nhận tệp ngay.',
      { badge: 'IN BÁO CÁO', duration: 3500 }
    );
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print blocked:', e);
      handleExportPdf();
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    toast.info('Đang kết xuất tệp PDF...', 'Vui lòng chờ trong giây lát trong khi hệ thống tạo báo cáo thống kê.', {
      badge: 'XUẤT PDF',
      duration: 3000,
    });
    const fileName = `Bao_Cao_Thong_Ke_Ngach_Bac_QNCN_${new Date().getFullYear()}.pdf`;
    try {
      const success = await exportElementToPdf('grade-statistical-pdf-content', {
        fileName,
        orientation: 'landscape',
        title: 'BÁO CÁO THỐNG KÊ TỔNG HỢP CƠ CẤU NGẠCH NHÓM LƯƠNG QNCN',
      });
      if (success) {
        toast.success('Đã xuất PDF báo cáo thống kê!', `Tệp "${fileName}" đã được tải về máy của đồng chí.`, {
          badge: 'XUẤT PDF',
          duration: 4000,
        });
      }
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopy = () => {
    const el = document.getElementById('grade-statistical-pdf-content');
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const today = new Date();
  const dateStr = `${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl xl:max-w-7xl w-full border border-slate-200 overflow-hidden my-3 sm:my-5 flex flex-col max-h-[96vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SchoolLogo size={36} className="ring-1 ring-amber-400/40" />
            <div>
              <span className="font-bold text-sm text-white block">
                Báo Cáo Thống Kê Tổng Hợp Cơ Cấu Ngạch Nhóm Lương QNCN (PDF)
              </span>
              <span className="text-[11px] text-emerald-300">
                Phục vụ công tác báo cáo định kỳ Tổng cục Hậu cần & Bộ Quốc phòng • Hỗ trợ in ấn và xuất PDF
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Export PDF File Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              title="Tải tệp báo cáo về máy dưới định dạng PDF"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải file PDF (.pdf)'}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              In Báo Cáo
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Đã chép
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Sao chép
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toolbar (Hidden on print) */}
        <div className="no-print bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Kỳ báo cáo:</span>
              <input
                type="text"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800 w-52"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={showUnitBreakdown}
                onChange={(e) => setShowUnitBreakdown(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Phân bổ theo Khoa/Phòng/Ban</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={showEvaluationNotes}
                onChange={(e) => setShowEvaluationNotes(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Đánh giá & Kiến nghị đề xuất</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Tổng quân số: <strong>{qncnList.length}</strong> đồng chí • {gradeGroups.length} nhóm ngạch
          </div>
        </div>

        {/* Printable Document View */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-50 flex-1">
          <div
            id="grade-statistical-pdf-content"
            className="bg-white shadow-md rounded-xl p-6 sm:p-10 border border-slate-300 text-slate-900 font-serif leading-relaxed text-xs max-w-6xl mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none"
          >
            {/* Header: Hierarchy & Motto */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
              <div className="text-center sm:text-left flex items-start gap-3">
                <SchoolLogo size={52} className="hidden sm:inline-block mt-0.5" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    BỘ QUỐC PHÒNG
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                    TỔNG CỤC HẬU CẦN - KỸ THUẬT
                  </div>
                  <div className="text-xs font-black uppercase tracking-wide text-slate-950">
                    TRƯỜNG CAO ĐẲNG HẬU CẦN 2
                  </div>
                  <div className="text-xs font-bold uppercase text-emerald-900 underline underline-offset-4 decoration-emerald-700">
                    BAN QUÂN LỰC & BAN TÀI CHÍNH
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-xs font-bold text-slate-800 underline underline-offset-4 decoration-slate-400">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-[11px] italic text-slate-600 mt-2 font-sans">
                  TP. Hồ Chí Minh, ngày {dateStr}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-300 my-3" />

            {/* Document Title */}
            <div className="text-center my-6 space-y-1">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-950">
                BÁO CÁO THỐNG KÊ TỔNG HỢP CƠ CẤU QUÂN SỐ VÀ NGẠCH NHÓM LƯƠNG
              </h2>
              <div className="text-xs font-bold uppercase text-slate-800">
                ĐỐI VỚI QUÂN NHÂN CHUYÊN NGHIỆP TRƯỜNG CAO ĐẲNG HẬU CẦN 2
              </div>
              <div className="text-xs italic text-slate-600 font-sans font-semibold">
                ({reportPeriod})
              </div>
            </div>

            {/* Quick KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 font-sans">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Tổng Quân Số QNCN
                </div>
                <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {totalSummary.totalCount} <span className="text-xs font-normal">đ/c</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Hệ Số Lương Bình Quân
                </div>
                <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">
                  {totalSummary.avgHeSo.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Hưởng Thâm Niên Vượt Khung
                </div>
                <div className="text-lg font-black text-purple-900 font-mono mt-0.5">
                  {totalSummary.totalVuotKhung} <span className="text-xs font-normal">đ/c</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Tổng Quỹ Thực Lĩnh Tháng
                </div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {formatVND(totalSummary.totalPayroll)}
                </div>
              </div>
            </div>

            {/* TABLE 1: SUMMARY BY SALARY GRADE GROUP */}
            <div className="my-6">
              <div className="font-bold text-xs uppercase text-slate-900 mb-2 flex items-center gap-1.5 font-sans">
                <span>I. BẢNG TỔNG HỢP THEO TỪNG NGẠCH NHÓM LƯƠNG QUÂN ĐỘI</span>
              </div>

              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse border-2 border-black font-sans print:text-[8pt] print:leading-tight">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-black text-center border-b-2 border-black">
                      <th className="border-r border-black p-1.5 w-7 text-center">TT</th>
                      <th className="border-r border-black p-1.5 min-w-[130px] text-center">
                        Ngạch nhóm lương
                      </th>
                      <th className="border-r border-black p-1.5 w-12 text-center">
                        Ký hiệu
                      </th>
                      <th className="border-r border-black p-1.5 w-14 text-center">
                        Quân số
                        <br />
                        (đ/c)
                      </th>
                      <th className="border-r border-black p-1.5 w-12 text-center">
                        Tỷ lệ
                        <br />
                        (%)
                      </th>
                      <th className="border-r border-black p-1.5 w-14 text-center">
                        Hệ số
                        <br />
                        Bình quân
                      </th>
                      <th className="border-r border-black p-1.5 min-w-[75px] text-center">
                        Khoảng bậc
                        <br />
                        hiện hưởng
                      </th>
                      <th className="border-r border-black p-1.5 w-14 text-center">
                        Hưởng
                        <br />
                        TNVK
                      </th>
                      <th className="border-r border-black p-1.5 min-w-[120px] text-center">
                        Cơ cấu quân hàm chính
                      </th>
                      <th className="border-r border-black p-1.5 min-w-[95px] text-center">
                        Lương cơ bản
                      </th>
                      <th className="p-1.5 min-w-[105px] text-center bg-emerald-50 text-emerald-950 font-black">
                        Tổng thực lĩnh
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {gradeGroups.map((g, idx) => (
                      <tr
                        key={g.id}
                        className="border-b border-black/80 hover:bg-amber-50/20 text-black leading-snug"
                      >
                        <td className="border-r border-black p-1.5 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="border-r border-black p-1.5 font-bold">
                          {g.name}
                          <div className="text-[9px] text-slate-500 font-normal italic">
                            {g.description}
                          </div>
                        </td>
                        <td className="border-r border-black p-1.5 text-center font-mono font-bold">
                          {g.shortCode}
                        </td>
                        <td className="border-r border-black p-1.5 text-center font-mono font-bold">
                          {g.count}
                        </td>
                        <td className="border-r border-black p-1.5 text-center font-mono">
                          {g.percent}%
                        </td>
                        <td className="border-r border-black p-1.5 text-right font-mono font-medium pr-1.5">
                          {g.avgHeSo > 0 ? g.avgHeSo.toFixed(2).replace('.', ',') : '-'}
                        </td>
                        <td className="border-r border-black p-1.5 text-center font-mono">
                          {g.bacRangeStr}
                        </td>
                        <td className="border-r border-black p-1.5 text-center font-mono text-purple-900 font-semibold">
                          {g.vuotKhungCount > 0 ? `${g.vuotKhungCount} đ/c` : '-'}
                        </td>
                        <td className="border-r border-black p-1.5 text-center text-[10px]">
                          {g.topRanks}
                        </td>
                        <td className="border-r border-black p-1.5 text-right font-mono pr-1.5">
                          {formatVND(g.totalBasicSalary).replace(' ₫', '')}
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold text-emerald-950 bg-emerald-50/50 pr-1.5">
                          {formatVND(g.totalNetSalary).replace(' ₫', '')}
                        </td>
                      </tr>
                    ))}

                    {/* Grand Total Row */}
                    <tr className="bg-slate-200/90 font-black text-black border-t-2 border-black">
                      <td colSpan={3} className="border-r border-black p-2 text-center uppercase">
                        TỔNG CỘNG
                      </td>
                      <td className="border-r border-black p-1.5 text-center font-mono">
                        {totalSummary.totalCount}
                      </td>
                      <td className="border-r border-black p-1.5 text-center font-mono">
                        100%
                      </td>
                      <td className="border-r border-black p-1.5 text-right font-mono pr-1.5">
                        {totalSummary.avgHeSo.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="border-r border-black p-1.5 text-center font-mono">
                        Toàn trường
                      </td>
                      <td className="border-r border-black p-1.5 text-center font-mono text-purple-900">
                        {totalSummary.totalVuotKhung} đ/c
                      </td>
                      <td className="border-r border-black p-1.5 text-center text-[10px]">
                        Sĩ quan & QNCN
                      </td>
                      <td className="border-r border-black p-1.5 text-right font-mono pr-1.5">
                        {formatVND(totalSummary.totalBasic).replace(' ₫', '')}
                      </td>
                      <td className="p-1.5 text-right font-mono font-black text-emerald-950 bg-emerald-200/90 pr-1.5">
                        {formatVND(totalSummary.totalPayroll).replace(' ₫', '')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLE 2: BREAKDOWN BY ORGANIZATIONAL UNITS (Optional) */}
            {showUnitBreakdown && (
              <div className="my-6">
                <div className="font-bold text-xs uppercase text-slate-900 mb-2 flex items-center gap-1.5 font-sans">
                  <span>II. PHÂN BỔ CƠ CẤU NGẠCH LƯƠNG THEO CÁC KHOA, PHÒNG, BAN TRỰC THUỘC</span>
                </div>

                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full text-left text-[10px] border-collapse border border-black font-sans print:text-[8pt] print:leading-tight">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-black text-center border-b border-black">
                        <th className="border-r border-black p-1 w-7 text-center">TT</th>
                        <th className="border-r border-black p-1 min-w-[130px] text-center">
                          Tên đơn vị (Khoa / Phòng / Ban)
                        </th>
                        <th className="border-r border-black p-1 w-12 text-center">
                          Tổng số
                        </th>
                        <th className="border-r border-black p-1 w-11 text-center">
                          CC-1
                        </th>
                        <th className="border-r border-black p-1 w-11 text-center">
                          CC-2
                        </th>
                        <th className="border-r border-black p-1 w-11 text-center">
                          TC-1
                        </th>
                        <th className="border-r border-black p-1 w-11 text-center">
                          TC-2
                        </th>
                        <th className="border-r border-black p-1 w-11 text-center">
                          SC
                        </th>
                        <th className="p-1 min-w-[100px] text-center">
                          Tổng quỹ thực lĩnh
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {unitBreakdown.map((u, idx) => (
                        <tr
                          key={u.unitName}
                          className="border-b border-black/60 hover:bg-amber-50/20 text-black leading-snug"
                        >
                          <td className="border-r border-black p-1 text-center font-mono">
                            {idx + 1}
                          </td>
                          <td className="border-r border-black p-1 font-semibold">
                            {u.unitName}
                          </td>
                          <td className="border-r border-black p-1 text-center font-mono font-bold">
                            {u.count}
                          </td>
                          <td className="border-r border-black p-1 text-center font-mono">
                            {u.cc1 > 0 ? u.cc1 : '-'}
                          </td>
                          <td className="border-r border-black p-1 text-center font-mono">
                            {u.cc2 > 0 ? u.cc2 : '-'}
                          </td>
                          <td className="border-r border-black p-1 text-center font-mono">
                            {u.tc1 > 0 ? u.tc1 : '-'}
                          </td>
                          <td className="border-r border-black p-1 text-center font-mono">
                            {u.tc2 > 0 ? u.tc2 : '-'}
                          </td>
                          <td className="border-r border-black p-1 text-center font-mono">
                            {u.sc > 0 ? u.sc : '-'}
                          </td>
                          <td className="p-1 text-right font-mono font-medium pr-1.5">
                            {formatVND(u.totalNet).replace(' ₫', '')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 3: EVALUATION AND RECOMMENDATIONS */}
            {showEvaluationNotes && (
              <div className="my-6 p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed space-y-2 print:bg-white print:border-black/50">
                <div className="font-bold uppercase text-slate-900 font-sans">
                  III. ĐÁNH GIÁ & KIẾN NGHỊ ĐỀ XUẤT CÔNG TÁC QUẢN LÝ NHÂN LỰC QNCN:
                </div>
                <div className="space-y-1.5 text-slate-800">
                  <p>
                    <strong>1. Đánh giá cơ cấu:</strong> Đội ngũ Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2 có cơ cấu ngạch lương vững chắc, trong đó nhóm <strong>Cao cấp (Nhóm 1 & 2)</strong> chiếm tỷ lệ chủ lực, phản ánh chất lượng chuyên môn nghiệp vụ cao của lực lượng giảng viên, bác sỹ, kỹ sư và cán bộ quản lý hậu cần quân sự.
                  </p>
                  <p>
                    <strong>2. Tình hình vượt khung:</strong> Hiện toàn trường có <strong>{totalSummary.totalVuotKhung} đồng chí ({totalSummary.totalCount > 0 ? Math.round((totalSummary.totalVuotKhung / totalSummary.totalCount) * 100) : 0}%)</strong> đã đạt bậc lương kịch khung và đang hưởng phụ cấp thâm niên vượt khung (TNVK), là nguồn cán bộ giàu kinh nghiệm thực tiễn gắn bó lâu năm với Nhà trường.
                  </p>
                  <p>
                    <strong>3. Kiến nghị đề xuất:</strong> Ban Quân lực phối hợp chặt chẽ cùng Ban Tài chính tiếp tục rà soát niên hạn giữ bậc, kịp thời lập danh sách đề nghị Thủ trưởng Tổng cục Hậu cần phê duyệt nâng bậc lương thường xuyên và trước thời hạn đúng quy định, bảo đảm quyền lợi chính sách cho cán bộ, nhân viên an tâm công tác.
                  </p>
                </div>
              </div>
            )}

            {/* Official Military 3-Signatory Block */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center font-sans">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  NGƯỜI LẬP BÁO CÁO
                </div>
                <div className="text-[11px] italic text-slate-500 mb-16">
                  (Ký, ghi rõ họ tên)
                </div>
                <div className="text-xs font-bold uppercase text-slate-950">
                  {reporterName}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {reporterTitle}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  TRƯỞNG BAN QUÂN LỰC
                </div>
                <div className="text-[11px] italic text-slate-500 mb-16">
                  (Ký, ghi rõ họ tên)
                </div>
                <div className="text-xs font-bold uppercase text-slate-950">
                  {headName}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {headTitle}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  HIỆU TRƯỞNG TRƯỜNG CĐ HẬU CẦN 2
                </div>
                <div className="text-[11px] italic text-slate-500 mb-16">
                  (Ký tên, đóng dấu)
                </div>
                <div className="text-xs font-bold uppercase text-slate-950">
                  {commanderName}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {commanderTitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
