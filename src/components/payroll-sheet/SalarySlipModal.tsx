import React from 'react';
import { X, Printer, Shield, Receipt } from 'lucide-react';
import { PayrollRecord, GeneralSalaryRules } from '../../types';
import { formatVND } from '../../services/salaryCalculator';

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
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm">Phiếu Báo Lương Cá Nhân</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              In phiếu
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs font-sans">
          {/* Slip Header */}
          <div className="text-center pb-3 border-b border-slate-200 space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TRƯỜNG CAO ĐẲNG HẬU CẦN 2 • BAN TÀI CHÍNH
            </div>
            <h3 className="text-base font-bold uppercase text-slate-900">
              PHIẾU THANH TOÁN TIỀN LƯƠNG
            </h3>
            <div className="text-xs text-slate-500 italic">Tháng {monthYear}</div>
          </div>

          {/* Personnel Information */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Họ và tên:</span>
              <span className="font-bold text-slate-900 text-sm">{record.hoVaTen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số hiệu quân nhân:</span>
              <span className="font-mono font-medium text-slate-800">{record.maQNCN}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cấp bậc / Chức vụ:</span>
              <span className="font-semibold text-emerald-800">{record.capBac} - {record.chucVu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Đơn vị:</span>
              <span className="text-slate-800">{record.donVi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngạch & Bậc lương:</span>
              <span className="font-bold text-slate-800">
                {record.ngach} • Bậc {record.bac} (Hệ số: {record.heSoLuong.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              I. Các khoản thu nhập:
            </div>
            <div className="space-y-1 pl-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">1. Lương theo ngạch bậc (HS {record.heSoLuong.toFixed(2)}):</span>
                <span className="font-mono font-medium text-slate-900">{formatVND(record.luongTheoHeSo)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">2. Phụ cấp thâm niên nghề ({record.phanTramThamNien}%):</span>
                <span className="font-mono font-medium text-slate-900">{formatVND(record.tienThamNien)}</span>
              </div>
              {record.phanTramVuotKhung > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">3. Phụ cấp thâm niên vượt khung ({record.phanTramVuotKhung}%):</span>
                  <span className="font-mono font-medium text-purple-900">{formatVND(record.tienVuotKhung)}</span>
                </div>
              )}
              {record.heSoChucVu > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">4. Phụ cấp chức vụ (HS {record.heSoChucVu}):</span>
                  <span className="font-mono font-medium text-slate-900">{formatVND(record.tienChucVu)}</span>
                </div>
              )}
              {record.heSoDacThu > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">5. Phụ cấp đặc thù / Giáo viên:</span>
                  <span className="font-mono font-medium text-slate-900">{formatVND(record.tienDacThu)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold text-slate-900">
                <span>Tổng thu nhập (I):</span>
                <span className="font-mono text-emerald-900">{formatVND(record.tongThuNhap)}</span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              II. Các khoản trích nộp:
            </div>
            <div className="space-y-1 pl-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">1. Bảo hiểm xã hội ({rules.tyLeDongBHXH}%):</span>
                <span className="font-mono font-medium text-rose-700">-{formatVND(record.dongBHXH)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">2. Bảo hiểm y tế ({rules.tyLeDongBHYT}%):</span>
                <span className="font-mono font-medium text-rose-700">-{formatVND(record.dongBHYT)}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-slate-900">
                <span>Tổng khấu trừ (II):</span>
                <span className="font-mono text-rose-700">-{formatVND(record.tongKhauTru)}</span>
              </div>
            </div>
          </div>

          {/* Final Net Pay */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between">
            <span className="font-black text-emerald-950 text-sm uppercase">THỰC LĨNH (I - II):</span>
            <span className="font-black text-emerald-900 text-lg font-mono">
              {formatVND(record.thucLinh)}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-2">
            Mọi thắc mắc về tiền lương quân nhân, vui lòng liên hệ Ban Tài chính - Trường CĐ Hậu cần 2.
          </div>
        </div>
      </div>
    </div>
  );
};
