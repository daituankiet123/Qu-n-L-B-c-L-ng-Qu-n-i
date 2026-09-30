import React, { useState } from 'react';
import { X, Printer, Shield, Receipt, FileDown, Download, Copy, Check } from 'lucide-react';
import { PayrollRecord, GeneralSalaryRules } from '../../types';
import { formatVND } from '../../services/salaryCalculator';
import { docTienBangChu } from '../../services/numberToWords';
import { exportElementToPdf } from '../../services/pdfExportService';
import { useToast } from '../../context/ToastContext';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecord | null;
  rules: GeneralSalaryRules;
  monthYear: string;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  record,
  rules,
  monthYear,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const toast = useToast();

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    toast.info(
      'Đang gửi lệnh in phiếu lương...',
      'Nếu trình duyệt không mở hộp thoại in, đồng chí hãy bấm nút "Tải file PDF" để nhận tệp ngay.',
      { badge: 'IN PHIẾU', duration: 3500 }
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
    toast.info('Đang kết xuất phiếu lương...', 'Hệ thống đang chuẩn bị tệp PDF.', {
      badge: 'PHIẾU LƯƠNG',
      duration: 2500,
    });

    const fileName = `Phieu_Luong_${record.maQNCN}_${record.hoVaTen.replace(/\s+/g, '_')}_Thang_${monthYear.replace('/', '_')}.pdf`;

    try {
      const success = await exportElementToPdf('salary-slip-printable-content', {
        fileName,
        orientation: 'portrait',
        title: `PHIẾU THANH TOÁN TIỀN LƯƠNG - ${record.hoVaTen}`,
      });
      if (success) {
        toast.success(
          'Đã xuất phiếu lương PDF!',
          `Tệp "${fileName}" đã được tải về máy của đồng chí.`,
          { badge: 'XUẤT PDF', duration: 4000 }
        );
      }
    } catch (e) {
      console.error(e);
      handleDownloadHtml();
      toast.info('Đã tải tệp phiếu lương HTML', 'Tệp in ấn đã được tải về máy của đồng chí.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    const el = document.getElementById('salary-slip-printable-content');
    if (!el) return;
    const fileName = `Phieu_Luong_${record.maQNCN}_${record.hoVaTen.replace(/\s+/g, '_')}_Thang_${monthYear.replace('/', '_')}`;
    const htmlString = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>PHIẾU THANH TOÁN TIỀN LƯƠNG - ${record.hoVaTen}</title>
  <style>
    @page {
      size: portrait;
      margin: 10mm 12mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      background: #ffffff !important;
      color: #000000 !important;
      font-size: 10.5pt;
      line-height: 1.45;
      padding: 20px;
      margin: 0;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 10pt !important;
    }
    tr {
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #000000 !important;
      padding: 4px 6px !important;
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

  const handleCopyText = () => {
    const el = document.getElementById('salary-slip-printable-content');
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col">
        {/* Header (Hidden on print) */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 px-5 py-3 text-white flex items-center justify-between no-print flex-shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-300" />
            <div>
              <span className="font-bold text-sm block">Phiếu Báo Lương Cá Nhân</span>
              <span className="text-[11px] text-emerald-200">Định dạng in ấn chuẩn Quân đội</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Direct Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-60 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              title="Tải phiếu lương về máy dưới định dạng PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-300" />
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải file PDF (.pdf)'}
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              title="Mở hộp thoại in ấn trực tiếp từ trình duyệt"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              In phiếu
            </button>

            {/* Download HTML */}
            <button
              onClick={handleDownloadHtml}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
              title="Tải tệp HTML in ấn"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Tải HTML
            </button>

            {/* Copy */}
            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Sao chép nội dung"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          <div
            id="salary-slip-printable-content"
            className="space-y-4 text-xs font-serif leading-relaxed text-slate-900 bg-white"
          >
            {/* Slip Header */}
            <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1">
              <div className="flex justify-between items-start text-[11px] font-sans">
                <div className="text-left font-bold text-slate-800 uppercase leading-snug">
                  <div>TỔNG CỤC HẬU CẦN - KỸ THUẬT</div>
                  <div className="text-slate-950">TRƯỜNG CAO ĐẲNG HẬU CẦN 2</div>
                  <div className="underline decoration-emerald-700">BAN TÀI CHÍNH</div>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <div className="font-bold">Mẫu số: 02/TL-QNCN</div>
                  <div>Tháng hưởng: {monthYear}</div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-base font-bold uppercase text-slate-950 font-serif tracking-wide">
                  PHIẾU THANH TOÁN TIỀN LƯƠNG & PHỤ CẤP
                </h3>
                <div className="text-xs text-slate-600 italic">
                  Tháng {monthYear} • Quân nhân chuyên nghiệp
                </div>
              </div>
            </div>

            {/* Personnel Information Card */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-300 space-y-1.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Họ và tên: </span>
                  <strong className="text-slate-950 text-sm font-bold">{record.hoVaTen}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mã QNCN: </span>
                  <strong className="font-mono text-slate-900">{record.maQNCN}</strong>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Cấp bậc / Chức vụ: </span>
                  <strong className="text-emerald-900 font-semibold">
                    {record.capBac} - {record.chucVu}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Đơn vị: </span>
                  <strong className="text-slate-900">{record.donVi}</strong>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500">Ngạch lương: </span>
                  <strong className="text-slate-900">{record.ngach}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Bậc lương hiện tại: </span>
                  <strong className="text-slate-900">
                    Bậc {record.bac} (Hệ số: {record.heSoLuong.toFixed(2)})
                  </strong>
                </div>
              </div>
            </div>

            {/* Detailed Salary Breakdown Table */}
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-900 py-1.5 px-2 text-center w-10">TT</th>
                  <th className="border border-slate-900 py-1.5 px-3 text-left">Nội dung chi trả & trích nộp</th>
                  <th className="border border-slate-900 py-1.5 px-2 text-center w-28">Hệ số / Tỷ lệ</th>
                  <th className="border border-slate-900 py-1.5 px-3 text-right w-36">Thành tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="border border-slate-900 py-1 px-2 text-slate-900 uppercase">
                    I. CÁC KHOẢN THU NHẬP
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-1 px-2 text-center">1</td>
                  <td className="border border-slate-900 py-1 px-3">Lương theo ngạch bậc (Mức cơ sở 2.340.000đ)</td>
                  <td className="border border-slate-900 py-1 px-2 text-center font-mono">
                    HS {record.heSoLuong.toFixed(2)}
                  </td>
                  <td className="border border-slate-900 py-1 px-3 text-right font-mono font-medium">
                    {formatVND(record.luongTheoHeSo)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-1 px-2 text-center">2</td>
                  <td className="border border-slate-900 py-1 px-3">Phụ cấp thâm niên nghề quân đội</td>
                  <td className="border border-slate-900 py-1 px-2 text-center font-mono">
                    {record.phanTramThamNien}%
                  </td>
                  <td className="border border-slate-900 py-1 px-3 text-right font-mono font-medium">
                    {formatVND(record.tienThamNien)}
                  </td>
                </tr>
                {record.phanTramVuotKhung > 0 && (
                  <tr>
                    <td className="border border-slate-900 py-1 px-2 text-center">3</td>
                    <td className="border border-slate-900 py-1 px-3">Phụ cấp thâm niên vượt khung</td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-mono text-purple-900">
                      {record.phanTramVuotKhung}%
                    </td>
                    <td className="border border-slate-900 py-1 px-3 text-right font-mono font-medium text-purple-900">
                      {formatVND(record.tienVuotKhung)}
                    </td>
                  </tr>
                )}
                {record.heSoChucVu > 0 && (
                  <tr>
                    <td className="border border-slate-900 py-1 px-2 text-center">4</td>
                    <td className="border border-slate-900 py-1 px-3">Phụ cấp chức vụ lãnh đạo / chỉ huy</td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-mono">
                      HS {record.heSoChucVu.toFixed(2)}
                    </td>
                    <td className="border border-slate-900 py-1 px-3 text-right font-mono font-medium">
                      {formatVND(record.tienChucVu)}
                    </td>
                  </tr>
                )}
                {record.heSoDacThu > 0 && (
                  <tr>
                    <td className="border border-slate-900 py-1 px-2 text-center">5</td>
                    <td className="border border-slate-900 py-1 px-3">Phụ cấp đặc thù ngành / Giáo viên</td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-mono">
                      HS {record.heSoDacThu.toFixed(2)}
                    </td>
                    <td className="border border-slate-900 py-1 px-3 text-right font-mono font-medium">
                      {formatVND(record.tienDacThu)}
                    </td>
                  </tr>
                )}
                <tr className="bg-emerald-50/60 font-bold">
                  <td colSpan={3} className="border border-slate-900 py-1.5 px-3 text-right uppercase text-slate-900">
                    Cộng các khoản thu nhập (I):
                  </td>
                  <td className="border border-slate-900 py-1.5 px-3 text-right font-mono text-emerald-950 font-bold">
                    {formatVND(record.tongThuNhap)}
                  </td>
                </tr>

                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="border border-slate-900 py-1 px-2 text-slate-900 uppercase">
                    II. CÁC KHOẢN TRÍCH NỘP BẢO HIỂM
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-1 px-2 text-center">1</td>
                  <td className="border border-slate-900 py-1 px-3">Trích nộp Bảo hiểm Xã hội (BHXH)</td>
                  <td className="border border-slate-900 py-1 px-2 text-center font-mono">
                    {rules.tyLeDongBHXH}%
                  </td>
                  <td className="border border-slate-900 py-1 px-3 text-right font-mono text-rose-700">
                    -{formatVND(record.dongBHXH)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-1 px-2 text-center">2</td>
                  <td className="border border-slate-900 py-1 px-3">Trích nộp Bảo hiểm Y tế (BHYT)</td>
                  <td className="border border-slate-900 py-1 px-2 text-center font-mono">
                    {rules.tyLeDongBHYT}%
                  </td>
                  <td className="border border-slate-900 py-1 px-3 text-right font-mono text-rose-700">
                    -{formatVND(record.dongBHYT)}
                  </td>
                </tr>
                <tr className="bg-rose-50/60 font-bold">
                  <td colSpan={3} className="border border-slate-900 py-1.5 px-3 text-right uppercase text-slate-900">
                    Cộng các khoản trích nộp (II):
                  </td>
                  <td className="border border-slate-900 py-1.5 px-3 text-right font-mono text-rose-700 font-bold">
                    -{formatVND(record.tongKhauTru)}
                  </td>
                </tr>

                {/* Final Net Pay Row */}
                <tr className="bg-emerald-100 font-black text-sm">
                  <td colSpan={3} className="border border-slate-900 py-2 px-3 text-right uppercase text-emerald-950">
                    SỐ TIỀN THỰC LĨNH (I - II):
                  </td>
                  <td className="border border-slate-900 py-2 px-3 text-right font-mono text-emerald-950 font-black text-base">
                    {formatVND(record.thucLinh)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount in Words */}
            <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-xs italic">
              <strong>Số tiền viết bằng chữ: </strong>
              <span>{docTienBangChu(record.thucLinh)}</span>
            </div>

            {/* Signature Block */}
            <div className="pt-4 grid grid-cols-2 gap-6 text-center font-sans text-xs">
              <div className="space-y-1">
                <div className="font-bold uppercase text-slate-900">NGƯỜI NHẬN TIỀN</div>
                <div className="text-[11px] italic text-slate-500 pb-14">(Ký, ghi rõ họ tên)</div>
                <div className="font-bold text-slate-950 uppercase">{record.hoVaTen}</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold uppercase text-slate-900">CÁN BỘ TÀI CHÍNH</div>
                <div className="text-[11px] italic text-slate-500 pb-14">(Ký, ghi rõ họ tên)</div>
                <div className="font-bold text-slate-950 uppercase">Đại úy QNCN Lê Hoài Nam</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-2 italic no-print font-sans">
              Mọi thắc mắc về tiền lương, phụ cấp, vui lòng liên hệ Ban Tài chính - Trường CĐ Hậu cần 2.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
