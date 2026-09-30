import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Copy,
  Check,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Settings2,
  FileDown,
} from 'lucide-react';
import { PayrollRecord, GeneralSalaryRules } from '../../types';
import { formatVND, formatNumber } from '../../services/salaryCalculator';
import { docTienBangChu } from '../../services/numberToWords';
import { SchoolLogo } from '../common/SchoolLogo';
import { exportElementToPdf } from '../../services/pdfExportService';
import { useToast } from '../../context/ToastContext';

interface PayrollReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PayrollRecord[];
  rules: GeneralSalaryRules;
  defaultMonthYear?: string;
  defaultUnit?: string;
  units?: string[];
}

export const PayrollReportPdfModal: React.FC<PayrollReportPdfModalProps> = ({
  isOpen,
  onClose,
  records,
  rules,
  defaultMonthYear = '03/2026',
  defaultUnit = 'all',
  units = [],
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(defaultUnit);
  const [monthYear, setMonthYear] = useState<string>(defaultMonthYear);
  const [showSignColumn, setShowSignColumn] = useState<boolean>(true);
  const [showSignBlock, setShowSignBlock] = useState<boolean>(true);
  const [showSummaryStats, setShowSummaryStats] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const toast = useToast();

  // Signatory details
  const [creatorName, setCreatorName] = useState('Đại úy QNCN Lê Hoài Nam');
  const [creatorTitle, setCreatorTitle] = useState('Cán bộ Tài chính');
  const [chiefAccountant, setChiefAccountant] = useState('Trung tá QNCN Vũ Thị Loan');
  const [chiefTitle, setChiefTitle] = useState('Trưởng Ban Tài chính');
  const [commanderName, setCommanderName] = useState('Đại tá Trần Hữu Nghĩa');
  const [commanderTitle, setCommanderTitle] = useState('Hiệu trưởng Trường CĐ Hậu cần 2');

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedUnit !== 'all' && r.donVi !== selectedUnit) return false;
      return true;
    });
  }, [records, selectedUnit]);

  // Compute totals
  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => {
        acc.heSoLuong += r.heSoLuong;
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
        heSoLuong: 0,
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

  if (!isOpen) return null;

  const handlePrint = () => {
    toast.info(
      'Đang gửi lệnh in ấn...',
      'Nếu trình duyệt không mở hộp thoại in, đồng chí hãy bấm nút "Tải file PDF (.pdf)" để nhận tệp ngay.',
      { badge: 'IN ẤN', duration: 3500 }
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
    toast.info('Đang kết xuất tệp PDF...', 'Vui lòng chờ trong giây lát trong khi hệ thống tạo bảng lương.', {
      badge: 'XUẤT PDF',
      duration: 3000,
    });

    const fileName = `Bang_Luong_QNCN_Thang_${monthYear.replace('/', '_')}_${selectedUnit === 'all' ? 'Toan_Truong' : selectedUnit.replace(/\s+/g, '_')}.pdf`;

    try {
      const success = await exportElementToPdf('payroll-pdf-report-content', {
        fileName,
        orientation: 'landscape',
        title: `BẢNG THANH TOÁN TIỀN LƯƠNG QNCN - THÁNG ${monthYear}`,
      });
      if (success) {
        toast.success(
          'Đã xuất file PDF thành công!',
          `Tệp PDF "${fileName}" đã được tải về máy của đồng chí.`,
          { badge: 'XUẤT PDF', duration: 4000 }
        );
      }
    } catch (e) {
      console.error(e);
      handleDownloadHtml();
      toast.info('Đã tải tệp in ấn HTML', 'Tệp in ấn đã được tải về máy của đồng chí.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    const el = document.getElementById('payroll-pdf-report-content');
    if (!el) return;
    const fileName = `Bang_Luong_QNCN_Thang_${monthYear.replace('/', '_')}_${selectedUnit === 'all' ? 'Toan_Truong' : selectedUnit.replace(/\s+/g, '_')}`;
    const htmlString = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>BẢNG THANH TOÁN TIỀN LƯƠNG QNCN - THÁNG ${monthYear}</title>
  <style>
    @page {
      size: landscape;
      margin: 8mm 10mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      background: #ffffff !important;
      color: #000000 !important;
      font-size: 9.5pt;
      line-height: 1.35;
      padding: 15px;
      margin: 0;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 8pt !important;
    }
    tr {
      page-break-inside: avoid;
    }
    thead {
      display: table-header-group;
    }
    th, td {
      border: 1px solid #000000 !important;
      padding: 3px 4px !important;
    }
    table.admin-doc-table, table.admin-doc-table tr, table.admin-doc-table td, table.admin-doc-table th {
      border: none !important;
      padding: 0 !important;
      background: transparent !important;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  ${el.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const el = document.getElementById('payroll-pdf-report-content');
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const today = new Date();
  const ngayBaoCao = `${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl xl:max-w-7xl w-full border border-slate-200 overflow-hidden my-3 sm:my-5 flex flex-col max-h-[96vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SchoolLogo size={36} className="ring-1 ring-amber-400/40" />
            <div>
              <span className="font-bold text-sm text-white block">
                Báo Cáo Bảng Lương & Phụ Cấp QNCN (Định dạng PDF / In ấn)
              </span>
              <span className="text-[11px] text-emerald-300">
                Chuẩn bố cục tài chính Quân đội • Hỗ trợ in trực tiếp hoặc lưu PDF từ trình duyệt
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Export PDF File Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              title="Tải tệp bảng lương về máy dưới định dạng file PDF"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải file PDF (.pdf)'}
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              title="Mở hộp thoại in ấn trực tiếp từ trình duyệt"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              In Báo Cáo
            </button>

            {/* Download standalone HTML */}
            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Tải tệp HTML in ấn hoàn chỉnh để lưu trữ hoặc mở trên máy tính khác"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Tải HTML in ấn
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
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

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toolbar (Hidden on print) */}
        <div className="no-print bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Unit */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Đơn vị:</span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Toàn trường ({records.length} đồng chí)</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Month/Year */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Tháng:</span>
              <input
                type="text"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder="03/2026"
                className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-center font-mono font-bold text-slate-800"
              />
            </div>

            {/* Toggle checkboxes */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={showSignColumn}
                onChange={(e) => setShowSignColumn(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Cột ký nhận</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={showSignBlock}
                onChange={(e) => setShowSignBlock(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Khung chữ ký 3 bên</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={showSummaryStats}
                onChange={(e) => setShowSummaryStats(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Dòng tóm tắt quỹ tiền</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Hiển thị: <strong>{filteredRecords.length}</strong> / {records.length} quân nhân
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-50 flex-1">
          <div
            id="payroll-pdf-report-content"
            className="bg-white shadow-md rounded-xl p-6 sm:p-10 border border-slate-300 text-slate-900 font-serif leading-relaxed text-xs max-w-6xl mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none"
          >
            {/* Official Military Header Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
              {/* Left Column: Organization Hierarchy */}
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
                    BAN TÀI CHÍNH
                  </div>
                </div>
              </div>

              {/* Right Column: National Motto */}
              <div className="text-center sm:text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-xs font-bold text-slate-800 underline underline-offset-4 decoration-slate-400">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-[11px] italic text-slate-600 mt-2 font-sans">
                  TP. Hồ Chí Minh, ngày {ngayBaoCao}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-300 my-3" />

            {/* Document Title */}
            <div className="text-center my-6 space-y-1">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-950">
                BẢNG THANH TOÁN TIỀN LƯƠNG VÀ CÁC KHOẢN PHỤ CẤP
              </h2>
              <div className="text-xs font-bold uppercase text-slate-800">
                ĐỐI VỚI QUÂN NHÂN CHUYÊN NGHIỆP - THÁNG {monthYear}
              </div>
              {selectedUnit !== 'all' && (
                <div className="text-xs font-bold text-emerald-900 uppercase">
                  (ĐƠN VỊ: {selectedUnit})
                </div>
              )}
              <div className="text-[11px] italic text-slate-600 font-sans">
                (Áp dụng mức lương cơ sở: {formatVND(rules.luongCoSo)}/tháng theo Nghị định số 73/2024/NĐ-CP)
              </div>
            </div>

            {/* Main Payroll Table */}
            <div className="overflow-x-auto print:overflow-visible my-4">
              <table className="w-full text-left text-[10px] border-collapse border-2 border-black font-sans print:text-[8pt] print:leading-tight">
                <thead>
                  <tr className="bg-slate-100 font-bold text-black text-center border-b-2 border-black">
                    <th className="border-r border-black p-1.5 w-7 text-center align-middle">
                      TT
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[125px] text-center align-middle">
                      HỌ VÀ TÊN
                    </th>
                    <th className="border-r border-black p-1.5 w-16 text-center align-middle">
                      CẤP BẬC
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[90px] text-center align-middle">
                      CHỨC VỤ
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[70px] text-center align-middle">
                      ĐƠN VỊ
                    </th>
                    <th className="border-r border-black p-1.5 w-10 text-center align-middle">
                      HỆ SỐ
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[80px] text-center align-middle">
                      LƯƠNG CƠ BẢN
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[80px] text-center align-middle">
                      PC THÂM NIÊN
                      <br />
                      (%, Tiền)
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[75px] text-center align-middle">
                      PC VƯỢT KHUNG
                      <br />
                      (%, Tiền)
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[70px] text-center align-middle">
                      PC CHỨC VỤ
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[70px] text-center align-middle">
                      PC ĐẶC THÙ
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[85px] text-center align-middle bg-slate-200/80">
                      TỔNG THU NHẬP
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[75px] text-center align-middle text-rose-950">
                      KHẤU TRỪ BH
                      <br />
                      (9.5%)
                    </th>
                    <th className="border-r border-black p-1.5 min-w-[90px] text-center align-middle bg-emerald-100/90 text-emerald-950 font-black">
                      THỰC LĨNH
                    </th>
                    {showSignColumn && (
                      <th className="p-1.5 min-w-[70px] text-center align-middle">
                        KÝ NHẬN
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((r, idx) => (
                    <tr
                      key={r.qncnId}
                      className="text-black leading-snug"
                      style={{ border: 'none', backgroundColor: '#ffffff' }}
                    >
                      {/* TT */}
                      <td className="border-r border-b border-black p-1 text-center font-mono" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {idx + 1}
                      </td>

                      {/* Họ và tên */}
                      <td className="border-r border-b border-black p-1 font-bold whitespace-nowrap" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.hoVaTen}
                      </td>

                      {/* Cấp bậc */}
                      <td className="border-r border-b border-black p-1 text-center whitespace-nowrap" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.capBac}
                      </td>

                      {/* Chức vụ */}
                      <td className="border-r border-b border-black p-1 whitespace-nowrap" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.chucVu}
                      </td>

                      {/* Đơn vị */}
                      <td className="border-r border-b border-black p-1 text-center whitespace-nowrap" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.donVi.replace(/^Khoa\s+/i, 'K.').replace(/^Phòng\s+/i, 'P.').replace(/^Ban\s+/i, 'B.')}
                      </td>

                      {/* Hệ số */}
                      <td className="border-r border-b border-black p-1 text-right font-mono font-medium pr-1.5" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.heSoLuong.toFixed(2).replace('.', ',')}
                      </td>

                      {/* Lương cơ bản */}
                      <td className="border-r border-b border-black p-1 text-right font-mono pr-1.5" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {formatVND(r.luongTheoHeSo).replace(' ₫', '')}
                      </td>

                      {/* PC Thâm niên */}
                      <td className="border-r border-b border-black p-1 text-right font-mono pr-1.5 whitespace-nowrap" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.phanTramThamNien > 0 ? (
                          <span>
                            {r.phanTramThamNien}% - {formatVND(r.tienThamNien).replace(' ₫', '')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* PC Vượt khung */}
                      <td className="border-r border-b border-black p-1 text-right font-mono pr-1.5 whitespace-nowrap" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.phanTramVuotKhung > 0 ? (
                          <span>
                            {r.phanTramVuotKhung}% - {formatVND(r.tienVuotKhung).replace(' ₫', '')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* PC Chức vụ */}
                      <td className="border-r border-b border-black p-1 text-right font-mono pr-1.5" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.tienChucVu > 0 ? formatVND(r.tienChucVu).replace(' ₫', '') : '-'}
                      </td>

                      {/* PC Đặc thù */}
                      <td className="border-r border-b border-black p-1 text-right font-mono pr-1.5" style={{ backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>
                        {r.tienDacThu > 0 ? formatVND(r.tienDacThu).replace(' ₫', '') : '-'}
                      </td>

                      {/* Tổng thu nhập */}
                      <td className="border-r border-b border-black p-1 text-right font-mono font-bold pr-1.5" style={{ backgroundColor: '#f8fafc', color: '#000000', verticalAlign: 'middle' }}>
                        {formatVND(r.tongThuNhap).replace(' ₫', '')}
                      </td>

                      {/* Khấu trừ bảo hiểm */}
                      <td className="border-r border-b border-black p-1 text-right font-mono pr-1.5" style={{ backgroundColor: '#ffffff', color: '#881337', verticalAlign: 'middle' }}>
                        -{formatVND(r.tongKhauTru).replace(' ₫', '')}
                      </td>

                      {/* Thực lĩnh */}
                      <td className="border-r border-b border-black p-1 text-right font-mono font-black pr-1.5" style={{ backgroundColor: '#f0fdf4', color: '#052e16', verticalAlign: 'middle' }}>
                        {formatVND(r.thucLinh).replace(' ₫', '')}
                      </td>

                      {/* Ký nhận */}
                      {showSignColumn && (
                        <td className="border-b border-black p-1 text-center font-serif italic text-slate-400" style={{ backgroundColor: '#ffffff', verticalAlign: 'middle' }}>
                          {/* Blank for physical signature */}
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* Summary Row */}
                  <tr className="font-black text-black" style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #000000' }}>
                    <td colSpan={5} className="border-r border-b border-black p-2 text-center uppercase tracking-wide" style={{ backgroundColor: '#f1f5f9', color: '#000000' }}>
                      TỔNG CỘNG ({filteredRecords.length} ĐỒNG CHÍ)
                    </td>
                    {/* Sum of coefficients */}
                    <td className="border-r border-b border-black p-1.5 text-right font-mono pr-1.5" style={{ backgroundColor: '#f1f5f9', color: '#000000' }}>
                      {totals.heSoLuong.toFixed(2).replace('.', ',')}
                    </td>
                    {/* Sum basic salary */}
                    <td className="border-r border-b border-black p-1.5 text-right font-mono pr-1.5" style={{ backgroundColor: '#f1f5f9', color: '#000000' }}>
                      {formatVND(totals.luongTheoHeSo).replace(' ₫', '')}
                    </td>
                    {/* Sum Thâm niên */}
                    <td className="border-r border-b border-black p-1.5 text-right font-mono pr-1.5" style={{ backgroundColor: '#f1f5f9', color: '#000000' }}>
                      {formatVND(totals.tienThamNien).replace(' ₫', '')}
                    </td>
                    {/* Sum Vượt khung */}
                    <td className="border-r border-b border-black p-1.5 text-right font-mono pr-1.5" style={{ backgroundColor: '#f1f5f9', color: '#000000' }}>
                      {formatVND(totals.tienVuotKhung).replace(' ₫', '')}
                    </td>
                    {/* Sum Chức vụ */}
                    <td className="border-r border-black p-1.5 text-right font-mono pr-1.5">
                      {formatVND(totals.tienChucVu).replace(' ₫', '')}
                    </td>
                    {/* Sum Đặc thù */}
                    <td className="border-r border-black p-1.5 text-right font-mono pr-1.5">
                      {formatVND(totals.tienDacThu).replace(' ₫', '')}
                    </td>
                    {/* Sum Tổng thu nhập */}
                    <td className="border-r border-black p-1.5 text-right font-mono font-bold pr-1.5 bg-slate-300/80">
                      {formatVND(totals.tongThuNhap).replace(' ₫', '')}
                    </td>
                    {/* Sum Khấu trừ */}
                    <td className="border-r border-black p-1.5 text-right font-mono text-rose-950 pr-1.5">
                      -{formatVND(totals.tongKhauTru).replace(' ₫', '')}
                    </td>
                    {/* Sum Thực lĩnh */}
                    <td className="border-r border-black p-1.5 text-right font-mono font-black text-emerald-950 bg-emerald-200/90 pr-1.5">
                      {formatVND(totals.thucLinh).replace(' ₫', '')}
                    </td>
                    {showSignColumn && <td className="p-1.5" />}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Amount in Words */}
            {showSummaryStats && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1 print:bg-white print:border-black/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <strong>Tổng số quân nhân hưởng lương: </strong>
                    <span className="font-mono font-bold">{filteredRecords.length} đồng chí.</span>
                  </div>
                  <div>
                    <strong>Tổng số tiền thực lĩnh chi trả: </strong>
                    <span className="font-mono font-bold text-emerald-900 text-sm">
                      {formatVND(totals.thucLinh)}
                    </span>
                  </div>
                </div>
                <div className="pt-1 text-slate-800 italic">
                  <strong>Số tiền viết bằng chữ: </strong>
                  <span>{docTienBangChu(totals.thucLinh)}</span>
                </div>
              </div>
            )}

            {/* Official Military 3-Signatory Block */}
            {showSignBlock && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center font-sans">
                {/* Column 1: Người lập biểu */}
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    NGƯỜI LẬP BIỂU
                  </div>
                  <div className="text-[11px] italic text-slate-500 mb-16">
                    (Ký, ghi rõ họ tên)
                  </div>
                  <div className="text-xs font-bold uppercase text-slate-950">
                    {creatorName}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {creatorTitle}
                  </div>
                </div>

                {/* Column 2: Trưởng Ban Tài chính */}
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    TRƯỞNG BAN TÀI CHÍNH
                  </div>
                  <div className="text-[11px] italic text-slate-500 mb-16">
                    (Ký, ghi rõ họ tên)
                  </div>
                  <div className="text-xs font-bold uppercase text-slate-950">
                    {chiefAccountant}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {chiefTitle}
                  </div>
                </div>

                {/* Column 3: Thủ trưởng đơn vị / Hiệu trưởng */}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
