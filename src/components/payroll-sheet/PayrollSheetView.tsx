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
} from 'lucide-react';
import { QNCNProfile, GeneralSalaryRules, PayrollRecord } from '../../types';
import { calculatePayrollRecord, formatVND } from '../../services/salaryCalculator';
import { exportPayrollSheetToExcel } from '../../services/excelService';
import { SalarySlipModal } from './SalarySlipModal';

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
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            Bảng Thanh Toán Lương Quân Nhân Chuyên Nghiệp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tính toán đầy đủ tiền lương cơ bản, các khoản phụ cấp thâm niên, vượt khung, chức vụ và trích nộp bảo hiểm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Tháng trả lương:</span>
            <input
              type="text"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              placeholder="03/2026"
              className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg font-bold font-mono text-xs text-center"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-amber-300" />
            Xuất Bảng Lương Excel
          </button>
        </div>
      </div>

      {/* Filter and Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Filter row */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <option value="all">-- Tất cả Đơn vị / Khoa / Phòng --</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Payroll Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Quân nhân</th>
                <th className="py-2.5 px-3">Cấp bậc / Đơn vị</th>
                <th className="py-2.5 px-3">Ngạch & Bậc</th>
                <th className="py-2.5 px-3 text-right">Lương ngạch bậc</th>
                <th className="py-2.5 px-3 text-right">PC Thâm niên</th>
                <th className="py-2.5 px-3 text-right">PC Vượt khung</th>
                <th className="py-2.5 px-3 text-right">PC Khác</th>
                <th className="py-2.5 px-3 text-right">Tổng thu nhập</th>
                <th className="py-2.5 px-3 text-right">Khấu trừ BH</th>
                <th className="py-2.5 px-3 text-right font-bold text-emerald-900">THỰC LĨNH</th>
                <th className="py-2.5 px-3 text-center">Phiếu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    Không có bản ghi lương nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.qncnId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{r.hoVaTen}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.maQNCN}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-emerald-800">{r.capBac}</div>
                      <div className="text-[11px] text-slate-600">{r.donVi}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">
                        Bậc {r.bac} ({r.heSoLuong.toFixed(2)})
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{r.ngach}</div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      {formatVND(r.luongTheoHeSo)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      <div>{formatVND(r.tienThamNien)}</div>
                      <div className="text-[10px] text-slate-500">({r.phanTramThamNien}%)</div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-purple-900">
                      {r.phanTramVuotKhung > 0 ? (
                        <>
                          <div>{formatVND(r.tienVuotKhung)}</div>
                          <div className="text-[10px] text-purple-600 font-bold">({r.phanTramVuotKhung}%)</div>
                        </>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      {r.tienChucVu + r.tienDacThu > 0 ? formatVND(r.tienChucVu + r.tienDacThu) : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatVND(r.tongThuNhap)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                      -{formatVND(r.tongKhauTru)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-900 text-sm">
                      {formatVND(r.thucLinh)}
                    </td>

                    <td className="py-2.5 px-3 text-center">
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
              <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right uppercase">
                    TỔNG CỘNG:
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{formatVND(totals.luongTheoHeSo)}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatVND(totals.tienThamNien)}</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-900">{formatVND(totals.tienVuotKhung)}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatVND(totals.tienChucVu + totals.tienDacThu)}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatVND(totals.tongThuNhap)}</td>
                  <td className="py-3 px-3 text-right font-mono text-rose-700">-{formatVND(totals.tongKhauTru)}</td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-900 text-sm">
                    {formatVND(totals.thucLinh)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
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
    </div>
  );
};
