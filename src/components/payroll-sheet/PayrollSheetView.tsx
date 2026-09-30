import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  Filter,
  Search,
  Eye,
  Building,
  CreditCard,
  TrendingUp,
  Printer,
  FileText,
  FileDown,
} from 'lucide-react';
import { QNCNProfile, GeneralSalaryRules, PayrollRecord } from '../../types';
import { calculatePayrollRecord, formatVND } from '../../services/salaryCalculator';
import { exportPayrollSheetToExcel } from '../../services/excelService';
import { exportElementToPdf } from '../../services/pdfExportService';
import { useToast } from '../../context/ToastContext';
import { SalarySlipModal } from './SalarySlipModal';
import { PayrollReportPdfModal } from './PayrollReportPdfModal';

interface PayrollSheetViewProps {
  qncnList: QNCNProfile[];
  rules: GeneralSalaryRules;
}

export const PayrollSheetView: React.FC<PayrollSheetViewProps> = ({
  qncnList,
  rules,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('03/2026');
  const [activeSlipRecord, setActiveSlipRecord] = useState<PayrollRecord | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const toast = useToast();

  // Compute payroll records
  const allRecords = useMemo(() => {
    return qncnList.map((p) => calculatePayrollRecord(p, rules));
  }, [qncnList, rules]);

  // Unique units
  const units = useMemo(() => {
    const set = new Set<string>();
    qncnList.forEach((p) => {
      if (p.donVi) set.add(p.donVi);
    });
    return Array.from(set).sort();
  }, [qncnList]);

  // Filtered
  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      if (selectedUnit !== 'all' && r.donVi !== selectedUnit) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = r.hoVaTen.toLowerCase().includes(term);
        const matchCode = r.maQNCN.toLowerCase().includes(term);
        const matchRank = r.capBac.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchRank) return false;
      }
      return true;
    });
  }, [allRecords, selectedUnit, searchTerm]);

  // Totals
  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => {
        acc.luongTheoHeSo += r.luongTheoHeSo;
        acc.tienThamNien += r.tienThamNien;
        acc.tienVuotKhung += r.tienVuotKhung;
        acc.tienChucVu += r.tienChucVu;
        acc.tienDacThu += r.tienDacThu;
        acc.tongThuNhap += r.tongThuNhap;
        acc.tongKhauTru += r.tongKhauTru;
        acc.thucLinh += r.thucLinh;
        return acc;
      },
      {
        luongTheoHeSo: 0,
        tienThamNien: 0,
        tienVuotKhung: 0,
        tienChucVu: 0,
        tienDacThu: 0,
        tongThuNhap: 0,
        tongKhauTru: 0,
        thucLinh: 0,
      }
    );
  }, [filteredRecords]);

  const handleExportExcel = () => {
    exportPayrollSheetToExcel(filteredRecords, selectedMonthYear.replace('/', '_'));
    toast.success('Đã xuất Excel thành công!', 'Tệp bảng lương Excel đã được lưu về máy.');
  };

  /**
   * Explicit Print trigger formatted for landscape A4
   */
  const handlePrint = () => {
    toast.info(
      'Đang chuẩn bị in ấn...',
      'Nếu trình duyệt không mở hộp thoại in tự động, đồng chí có thể bấm "Tải tệp PDF" kế bên.',
      { badge: 'IN ẤN', duration: 3500 }
    );
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print blocked:', e);
      handleExportDirectPdf();
    }
  };

  /**
   * Directly export and download a real PDF file of the current payroll table
   */
  const handleExportDirectPdf = async () => {
    setIsExportingPdf(true);
    toast.info('Đang kết xuất tệp PDF...', 'Vui lòng chờ trong giây lát trong khi hệ thống tạo bảng lương.', {
      badge: 'XUẤT PDF',
      duration: 3000,
    });

    const unitName = selectedUnit === 'all' ? 'Toan_Truong' : selectedUnit.replace(/\s+/g, '_');
    const fileName = `Bang_Luong_QNCN_Thang_${selectedMonthYear.replace('/', '_')}_${unitName}.pdf`;

    try {
      const success = await exportElementToPdf('payroll-sheet-printable-area', {
        fileName,
        orientation: 'landscape',
        title: `BẢNG THANH TOÁN TIỀN LƯƠNG QNCN - THÁNG ${selectedMonthYear}`,
      });
      if (success) {
        toast.success(
          'Đã xuất tệp PDF thành công!',
          `Tệp PDF "${fileName}" đã được tải về máy của đồng chí.`,
          { badge: 'XUẤT PDF', duration: 4000 }
        );
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi xuất PDF', 'Vui lòng thử lại hoặc mở hộp thoại in.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner (Hidden on print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            Bảng Thanh Toán Lương Quân Nhân Chuyên Nghiệp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tính toán đầy đủ tiền lương cơ bản, các khoản phụ cấp thâm niên, vượt khung, chức vụ và trích nộp bảo hiểm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Tháng:</span>
            <input
              type="text"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              placeholder="03/2026"
              className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg font-bold font-mono text-xs text-center"
            />
          </div>

          {/* Dedicated Primary Print/Export PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            title="In nhanh bảng lương theo chuẩn khổ ngang A4 (Ctrl+P)"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            In / Xuất PDF
          </button>

          {/* Direct PDF File Download Button */}
          <button
            onClick={handleExportDirectPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            title="Tải tệp bảng lương về máy dưới định dạng PDF (.pdf)"
          >
            <FileDown className="w-4 h-4 text-amber-300" />
            {isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF'}
          </button>

          {/* Full Military Report Modal */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs shadow-xs transition-colors"
            title="Mở mẫu báo cáo Quân đội chuẩn thể thức Bộ Quốc phòng"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            Mẫu Báo Cáo QNCN
          </button>

          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 shadow-xs transition-colors"
            title="Xuất dữ liệu bảng lương ra file Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filter and Summary Cards (Hidden on print) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Payroll */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Tổng Quỹ Thực Lĩnh Tháng
          </span>
          <div className="mt-2 text-xl font-black text-emerald-900 font-mono">
            {formatVND(totals.thucLinh)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chi trả cho {filteredRecords.length} quân nhân
          </div>
        </div>

        {/* Basic Salary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Lương Ngạch Bậc Cơ Bản
          </span>
          <div className="mt-2 text-lg font-bold text-slate-800 font-mono">
            {formatVND(totals.luongTheoHeSo)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Theo hệ số lương quy định
          </div>
        </div>

        {/* Total Allowances */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Tổng Các Khoản Phụ Cấp
          </span>
          <div className="mt-2 text-lg font-bold text-amber-700 font-mono">
            {formatVND(totals.tienThamNien + totals.tienVuotKhung + totals.tienChucVu + totals.tienDacThu)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Thâm niên + Vượt khung + CV + Đặc thù
          </div>
        </div>

        {/* Total Insurance Deductions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Tổng Khấu Trừ Bảo Hiểm
          </span>
          <div className="mt-2 text-lg font-bold text-rose-700 font-mono">
            -{formatVND(totals.tongKhauTru)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            BHXH ({rules.tyLeDongBHXH}%) + BHYT ({rules.tyLeDongBHYT}%)
          </div>
        </div>
      </div>

      {/* Filter row (Hidden on print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 shadow-xs p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, số hiệu..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          >
            <option value="all">-- Tất cả Đơn vị / Khoa / Phòng ({allRecords.length} quân nhân) --</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Payroll Sheet Printable Area */}
      <div
        id="payroll-sheet-printable-area"
        className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none print:p-0"
      >
        {/* Official Military Print Header (Visible ONLY when printing or exporting PDF) */}
        <div className="print-only hidden pb-3 mb-2 border-b border-black text-slate-900 font-serif">
          <div className="flex justify-between items-start text-xs">
            <div className="text-left font-bold leading-tight">
              <div>BỘ QUỐC PHÒNG</div>
              <div>TỔNG CỤC HẬU CẦN - KỸ THUẬT</div>
              <div>TRƯỜNG CAO ĐẲNG HẬU CẦN 2</div>
              <div className="underline underline-offset-2">BAN TÀI CHÍNH</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="italic text-[11px] font-semibold">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[10px] mt-1 italic text-slate-600">
                TP. Hồ Chí Minh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
            </div>
          </div>
          <div className="text-center my-3">
            <h1 className="text-base font-bold uppercase tracking-wider">
              BẢNG THANH TOÁN TIỀN LƯƠNG & PHỤ CẤP QUÂN NHÂN CHUYÊN NGHIỆP
            </h1>
            <div className="text-xs italic text-slate-700 mt-0.5">
              Tháng lương: <strong>{selectedMonthYear}</strong> • Đơn vị:{' '}
              <strong>{selectedUnit === 'all' ? 'Toàn trường' : selectedUnit}</strong> • Tổng số:{' '}
              <strong>{filteredRecords.length}</strong> đồng chí
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans print:font-serif">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 print:bg-white print:text-black">
              <tr>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-center">STT</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5">Quân nhân</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5">Cấp bậc / Đơn vị</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5">Ngạch & Bậc</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right">Lương ngạch bậc</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right">PC Thâm niên</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right">PC Vượt khung</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right">PC Khác</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right">Tổng thu nhập</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right">Khấu trừ BH</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-bold text-emerald-900 print:text-black">THỰC LĨNH</th>
                <th className="py-2.5 px-3 text-center no-print">Phiếu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    Không có bản ghi lương nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.qncnId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-slate-500 print:text-black font-mono text-center">
                      {idx + 1}
                    </td>
                    
                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5">
                      <div className="font-bold text-slate-900 print:text-black">{r.hoVaTen}</div>
                      <div className="text-[11px] text-slate-500 print:text-slate-600 font-mono">{r.maQNCN}</div>
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5">
                      <div className="font-semibold text-emerald-800 print:text-black">{r.capBac}</div>
                      <div className="text-[11px] text-slate-600">{r.donVi}</div>
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5">
                      <div className="font-bold text-slate-800 print:text-black">
                        Bậc {r.bac} ({r.heSoLuong.toFixed(2)})
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px] print:max-w-none">{r.ngach}</div>
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-mono text-slate-800 print:text-black">
                      {formatVND(r.luongTheoHeSo)}
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-mono text-slate-800 print:text-black">
                      <div>{formatVND(r.tienThamNien)}</div>
                      <div className="text-[10px] text-slate-500">({r.phanTramThamNien}%)</div>
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-mono text-purple-900 print:text-black">
                      {r.phanTramVuotKhung > 0 ? (
                        <>
                          <div>{formatVND(r.tienVuotKhung)}</div>
                          <div className="text-[10px] text-purple-600 print:text-slate-700 font-bold">({r.phanTramVuotKhung}%)</div>
                        </>
                      ) : (
                        <span className="text-slate-300 print:text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-mono text-slate-800 print:text-black">
                      {r.tienChucVu + r.tienDacThu > 0 ? formatVND(r.tienChucVu + r.tienDacThu) : '-'}
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-mono font-bold text-slate-900 print:text-black">
                      {formatVND(r.tongThuNhap)}
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-mono text-rose-700 print:text-black">
                      -{formatVND(r.tongKhauTru)}
                    </td>

                    <td className="py-2.5 px-3 print:py-1.5 print:px-1.5 text-right font-mono font-black text-emerald-900 print:text-black text-sm">
                      {formatVND(r.thucLinh)}
                    </td>

                    <td className="py-2.5 px-3 text-center no-print">
                      <button
                        onClick={() => setActiveSlipRecord(r)}
                        title="Xem phiếu báo lương cá nhân"
                        className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRecords.length > 0 && (
              <tfoot className="bg-slate-100/90 print:bg-white font-bold text-slate-900 print:text-black border-t-2 border-slate-300 print:border-black text-xs">
                <tr>
                  <td colSpan={4} className="py-3 px-3 print:py-2 print:px-1.5 text-right uppercase">
                    TỔNG CỘNG:
                  </td>
                  <td className="py-3 px-3 print:py-2 print:px-1.5 text-right font-mono">{formatVND(totals.luongTheoHeSo)}</td>
                  <td className="py-3 px-3 print:py-2 print:px-1.5 text-right font-mono">{formatVND(totals.tienThamNien)}</td>
                  <td className="py-3 px-3 print:py-2 print:px-1.5 text-right font-mono text-purple-900 print:text-black">{formatVND(totals.tienVuotKhung)}</td>
                  <td className="py-3 px-3 print:py-2 print:px-1.5 text-right font-mono">{formatVND(totals.tienChucVu + totals.tienDacThu)}</td>
                  <td className="py-3 px-3 print:py-2 print:px-1.5 text-right font-mono">{formatVND(totals.tongThuNhap)}</td>
                  <td className="py-3 px-3 print:py-2 print:px-1.5 text-right font-mono text-rose-700 print:text-black">-{formatVND(totals.tongKhauTru)}</td>
                  <td className="py-3 px-3 print:py-2 print:px-1.5 text-right font-mono font-black text-emerald-900 print:text-black text-sm">
                    {formatVND(totals.thucLinh)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Official Military 3-Signature Block (Visible ONLY when printing or exporting PDF) */}
        <div className="print-only hidden pt-8 pb-4 text-xs font-serif text-slate-900">
          <div className="grid grid-cols-3 text-center gap-4">
            <div>
              <div className="font-bold uppercase tracking-wider">NGƯỜI LẬP BẢNG</div>
              <div className="italic text-[10px] text-slate-500">(Ký, ghi rõ họ tên)</div>
              <div className="mt-16 font-bold">Thiếu tá QNCN Trần Văn Cường</div>
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider">TRƯỞNG BAN TÀI CHÍNH</div>
              <div className="italic text-[10px] text-slate-500">(Ký, ghi rõ họ tên)</div>
              <div className="mt-16 font-bold">Trung tá Nguyễn Văn Bình</div>
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider">HIỆU TRƯỞNG / THỦ TRƯỞNG</div>
              <div className="italic text-[10px] text-slate-500">(Ký tên, đóng dấu)</div>
              <div className="mt-16 font-bold">Đại tá Lê Văn Hải</div>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={!!activeSlipRecord}
        onClose={() => setActiveSlipRecord(null)}
        record={activeSlipRecord}
        rules={rules}
        monthYear={selectedMonthYear}
      />

      {/* Official Payroll PDF Report & Direct Print Modal */}
      <PayrollReportPdfModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        records={filteredRecords}
        rules={rules}
        defaultMonthYear={selectedMonthYear}
        defaultUnit={selectedUnit}
        units={units}
      />
    </div>
  );
};
