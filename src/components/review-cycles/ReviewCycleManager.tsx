import React, { useState } from 'react';
import {
  CalendarCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  Download,
  Trash2,
  Edit2,
  ArrowRight,
  Shield,
  FileCheck2,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  SalaryReviewCycle,
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  ReviewProposalItem,
} from '../../types';
import { formatVND } from '../../services/salaryCalculator';
import { evaluateQNCNEligibility } from '../../services/salaryProgressionEngine';
import { exportReviewProposalsToExcel } from '../../services/excelService';
import { useToast } from '../../context/ToastContext';

interface ReviewCycleManagerProps {
  cycles: SalaryReviewCycle[];
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  onSaveCycles: (cycles: SalaryReviewCycle[]) => void;
  onSelectCycle: (cycle: SalaryReviewCycle) => void;
  onNavigateToApproval: (cycle: SalaryReviewCycle) => void;
}

export const ReviewCycleManager: React.FC<ReviewCycleManagerProps> = ({
  cycles,
  qncnList,
  scales,
  rules,
  onSaveCycles,
  onSelectCycle,
  onNavigateToApproval,
}) => {
  const toast = useToast();
  const [selectedCycleId, setSelectedCycleId] = useState<string>(cycles[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCycleForm, setNewCycleForm] = useState({
    maDot: `DOT-${new Date().getFullYear()}-02`,
    tenDot: `Xét nâng bậc lương QNCN Đợt 2 năm ${new Date().getFullYear()}`,
    nam: new Date().getFullYear(),
    kyXet: '6 tháng cuối năm' as const,
    ngayChotSoLieu: `${new Date().getFullYear()}-09-30`,
    nguoiLap: 'Thiếu tá Đỗ Mạnh Cường (Trợ lý Quân lực)',
    ghiChu: 'Xét nâng lương định kỳ và trước thời hạn cho QNCN các khoa, phòng, ban',
  });

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0];

  // Auto scan and populate cycle
  const handleAutoScanAndPopulate = (cycleId: string) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return;

    const evaluatedItems: ReviewProposalItem[] = [];

    qncnList.forEach((profile) => {
      const evaluation = evaluateQNCNEligibility(profile, scales, rules, cycle.ngayChotSoLieu);
      // Include eligible or disciplined
      if (evaluation.loaiNangLuong !== 'Chưa đủ điều kiện') {
        evaluatedItems.push(evaluation);
      }
    });

    const updatedCycle: SalaryReviewCycle = {
      ...cycle,
      danhSachDeXuat: evaluatedItems,
    };

    const updatedList = cycles.map((c) => (c.id === cycleId ? updatedCycle : c));
    onSaveCycles(updatedList);
    toast.success(
      'Đã quét dữ liệu quân nhân!',
      `Đã tự động cập nhật ${evaluatedItems.length} quân nhân đủ tiêu chuẩn vào "${cycle.tenDot}".`,
      {
        badge: 'TỰ ĐỘNG QUÉT',
        duration: 4500,
      }
    );
  };

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const newCycle: SalaryReviewCycle = {
      id: `cycle-${Date.now()}`,
      maDot: newCycleForm.maDot,
      tenDot: newCycleForm.tenDot,
      nam: newCycleForm.nam,
      kyXet: newCycleForm.kyXet,
      ngayChotSoLieu: newCycleForm.ngayChotSoLieu,
      ngayTao: new Date().toISOString().split('T')[0],
      nguoiLap: newCycleForm.nguoiLap,
      trangThai: 'Đơn vị đề xuất',
      ghiChu: newCycleForm.ghiChu,
      thanhVienHoiDong: selectedCycle ? selectedCycle.thanhVienHoiDong : [],
      danhSachDeXuat: [],
    };

    // Automatically scan immediately
    const evaluatedItems: ReviewProposalItem[] = [];
    qncnList.forEach((profile) => {
      const evaluation = evaluateQNCNEligibility(profile, scales, rules, newCycle.ngayChotSoLieu);
      if (evaluation.loaiNangLuong !== 'Chưa đủ điều kiện') {
        evaluatedItems.push(evaluation);
      }
    });
    newCycle.danhSachDeXuat = evaluatedItems;

    const updated = [newCycle, ...cycles];
    onSaveCycles(updated);
    setSelectedCycleId(newCycle.id);
    setShowCreateModal(false);

    toast.success(
      'Đã tạo đợt xét duyệt lương mới!',
      `Khởi tạo thành công "${newCycle.tenDot}" (Năm ${newCycle.nam}) với ${evaluatedItems.length} quân nhân đủ điều kiện đề xuất.`,
      {
        badge: 'ĐỢT XÉT MỚI',
        duration: 5500,
      }
    );
  };

  const handleDeleteCycle = (id: string) => {
    const target = cycles.find((c) => c.id === id);
    if (window.confirm(`Xác nhận xóa đợt xét "${target?.tenDot || id}"?`)) {
      const updated = cycles.filter((c) => c.id !== id);
      onSaveCycles(updated);
      if (updated.length > 0) setSelectedCycleId(updated[0].id);

      toast.info(
        'Đã xóa đợt xét nâng lương',
        `Đợt xét "${target?.tenDot || id}" đã được xóa khỏi hệ thống.`,
        { badge: 'XÓA ĐỢT XÉT' }
      );
    }
  };

  const handleExportProposals = () => {
    if (!selectedCycle) return;
    exportReviewProposalsToExcel(selectedCycle.tenDot, selectedCycle.danhSachDeXuat);
  };

  // Change individual proposal item status or grade
  const handleUpdateProposalItem = (
    itemId: string,
    field: keyof ReviewProposalItem,
    value: any
  ) => {
    if (!selectedCycle) return;
    const updatedItems = selectedCycle.danhSachDeXuat.map((item) => {
      if (item.id !== itemId) return item;
      const updatedItem = { ...item, [field]: value };
      // Recalculate diff if heSoDeXuat changed
      if (field === 'heSoDeXuat') {
        updatedItem.chenhLechHeSo = Number((value - updatedItem.heSoHienTai).toFixed(2));
        updatedItem.chenhLechTienLuong = Math.round(updatedItem.chenhLechHeSo * rules.luongCoSo);
      }
      return updatedItem;
    });

    const updatedCycle = { ...selectedCycle, danhSachDeXuat: updatedItems };
    const updatedCycles = cycles.map((c) => (c.id === selectedCycle.id ? updatedCycle : c));
    onSaveCycles(updatedCycles);
  };

  const handleRemoveProposalItem = (itemId: string) => {
    if (!selectedCycle) return;
    const updatedItems = selectedCycle.danhSachDeXuat.filter((item) => item.id !== itemId);
    const updatedCycle = { ...selectedCycle, danhSachDeXuat: updatedItems };
    const updatedCycles = cycles.map((c) => (c.id === selectedCycle.id ? updatedCycle : c));
    onSaveCycles(updatedCycles);
  };

  // Calculate cycle summary metrics
  const totalProposals = selectedCycle?.danhSachDeXuat.length || 0;
  const regularCount = selectedCycle?.danhSachDeXuat.filter((i) => i.loaiNangLuong === 'Thường xuyên').length || 0;
  const earlyCount = selectedCycle?.danhSachDeXuat.filter((i) => i.loaiNangLuong === 'Trước thời hạn').length || 0;
  const vkCount = selectedCycle?.danhSachDeXuat.filter((i) => i.loaiNangLuong === 'Vượt khung').length || 0;
  const monthlyBudgetIncrease = selectedCycle?.danhSachDeXuat.reduce(
    (sum, i) => sum + i.chenhLechTienLuong,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-emerald-700" />
            Quản Lý & Lập Đợt Xét Nâng Bậc Lương QNCN
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động rà soát từ database, phân loại thường xuyên / trước thời hạn và tính toán chênh lệch quỹ lương
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            Tạo đợt xét mới (Nhập tay)
          </button>
        </div>
      </div>

      {/* Cycle Selector & Statistics */}
      {selectedCycle && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Cycle Selection Dropdown Card */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn đợt xét làm việc:
            </label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tenDot} ({c.maDot})
                </option>
              ))}
            </select>

            <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="font-bold text-emerald-800">{selectedCycle.trangThai}</span>
              </div>
              <div className="flex justify-between">
                <span>Chốt số liệu:</span>
                <span className="font-mono font-medium text-slate-800">{selectedCycle.ngayChotSoLieu}</span>
              </div>
              <div className="flex justify-between">
                <span>Người lập:</span>
                <span className="font-medium text-slate-800 truncate max-w-[140px]">{selectedCycle.nguoiLap}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => handleAutoScanAndPopulate(selectedCycle.id)}
                className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Quét tự động từ Database
              </button>
              <button
                onClick={() => onNavigateToApproval(selectedCycle)}
                className="w-full py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
                Trình Tổng cục & Ký Trích sao
              </button>
            </div>
          </div>

          {/* 3 Metric Summary Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total proposals */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tổng hồ sơ đề xuất
                </span>
                <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                  {totalProposals} <span className="text-xs font-normal text-slate-500">quân nhân</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  TX: {regularCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                  Trước hạn: {earlyCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                  VK: {vkCount}
                </span>
              </div>
            </div>

            {/* Monthly Budget Increase */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Chênh lệch quỹ lương tháng
                </span>
                <div className="mt-2 text-xl font-black text-emerald-800 font-mono">
                  +{formatVND(monthlyBudgetIncrease)}
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Tăng hằng năm ước tính: <strong className="text-slate-800 font-mono">+{formatVND(monthlyBudgetIncrease * 12)}</strong>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Xuất văn bản & Danh sách
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Xuất danh sách trích ngang kèm căn cứ nâng lương ra Excel
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleExportProposals}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  Xuất file Excel (.xlsx)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Table for Selected Cycle */}
      {selectedCycle && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Danh Sách Trích Ngang QNCN Đề Nghị Nâng Bậc Lương
                <span className="text-xs font-normal text-slate-500">({selectedCycle.danhSachDeXuat.length} hồ sơ)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cho phép sửa tay trực tiếp Bậc đề xuất, Hệ số, Lý do và Trạng thái duyệt của từng quân nhân
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Họ và tên / Số hiệu</th>
                  <th className="py-2.5 px-3">Cấp bậc / Đơn vị</th>
                  <th className="py-2.5 px-3">Bậc hiện tại</th>
                  <th className="py-2.5 px-3">Thời gian giữ</th>
                  <th className="py-2.5 px-3">Phân loại</th>
                  <th className="py-2.5 px-3">Bậc & Hệ số đề xuất</th>
                  <th className="py-2.5 px-3 text-right">Lương tăng/tháng</th>
                  <th className="py-2.5 px-3">Lý do & Tiêu chuẩn</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedCycle.danhSachDeXuat.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      Chưa có hồ sơ nào trong đợt xét này. Bấm "Quét tự động từ Database" ở trên để đưa các đồng chí đủ tiêu chuẩn vào đợt.
                    </td>
                  </tr>
                ) : (
                  selectedCycle.danhSachDeXuat.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>

                      {/* Name & Code */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.hoVaTen}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.maQNCN}</div>
                      </td>

                      {/* Rank & Unit */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-emerald-800">{item.capBac}</div>
                        <div className="text-[11px] text-slate-600">{item.donVi}</div>
                      </td>

                      {/* Current Grade */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">
                          Bậc {item.bacHienTai} <span className="font-mono text-slate-600">({item.heSoHienTai.toFixed(2)})</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Từ {item.ngayHuongHienTai}</div>
                      </td>

                      {/* Holding months */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 font-mono">
                          {item.soThangDaGiuBac} tháng
                        </span>
                      </td>

                      {/* Promotion Type */}
                      <td className="py-3 px-3">
                        <select
                          value={item.loaiNangLuong}
                          onChange={(e) =>
                            handleUpdateProposalItem(item.id, 'loaiNangLuong', e.target.value)
                          }
                          className="px-2 py-1 border border-slate-300 rounded font-semibold text-[11px] bg-white"
                        >
                          <option value="Thường xuyên">Thường xuyên</option>
                          <option value="Trước thời hạn">Trước thời hạn</option>
                          <option value="Vượt khung">Vượt khung</option>
                          <option value="Chưa đủ điều kiện">Chưa đủ ĐK</option>
                          <option value="Kéo dài do kỷ luật">Kéo dài kỷ luật</option>
                        </select>
                      </td>

                      {/* Proposed Grade & Step (Direct manual edit) */}
                      <td className="py-3 px-3">
                        {item.loaiNangLuong === 'Vượt khung' ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-purple-800">VK:</span>
                            <input
                              type="number"
                              value={item.vuotKhungDeXuat}
                              onChange={(e) =>
                                handleUpdateProposalItem(item.id, 'vuotKhungDeXuat', Number(e.target.value))
                              }
                              className="w-14 px-1.5 py-1 border border-slate-300 rounded font-mono font-bold text-purple-900 text-xs"
                            />
                            <span className="text-xs font-bold text-purple-800">%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              max="15"
                              value={item.bacDeXuat}
                              onChange={(e) =>
                                handleUpdateProposalItem(item.id, 'bacDeXuat', Number(e.target.value))
                              }
                              className="w-12 px-1.5 py-1 border border-slate-300 rounded font-mono font-bold text-slate-900 text-xs text-center"
                            />
                            <span className="text-slate-400">➔</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.heSoDeXuat}
                              onChange={(e) =>
                                handleUpdateProposalItem(item.id, 'heSoDeXuat', Number(e.target.value))
                              }
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded font-mono font-bold text-emerald-800 text-xs"
                            />
                          </div>
                        )}
                      </td>

                      {/* Salary Difference */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                        +{formatVND(item.chenhLechTienLuong)}
                      </td>

                      {/* Reason / Notes */}
                      <td className="py-3 px-3 max-w-xs">
                        <textarea
                          rows={2}
                          value={item.lyDoDeXuat}
                          onChange={(e) =>
                            handleUpdateProposalItem(item.id, 'lyDoDeXuat', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded text-[11px] bg-white resize-none"
                        />
                      </td>

                      {/* Approval Status */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={item.trangThaiPheDuyet}
                          onChange={(e) =>
                            handleUpdateProposalItem(item.id, 'trangThaiPheDuyet', e.target.value)
                          }
                          className={`px-2 py-1 rounded font-bold text-[11px] border ${
                            item.trangThaiPheDuyet === 'Đã duyệt'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : item.trangThaiPheDuyet === 'Từ chối'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Chờ duyệt">Chờ duyệt</option>
                          <option value="Đã duyệt">Đã duyệt</option>
                          <option value="Từ chối">Từ chối</option>
                          <option value="Bảo lưu">Bảo lưu</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleRemoveProposalItem(item.id)}
                          title="Loại khỏi đợt xét này"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create New Review Cycle */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-amber-300" />
                Tạo Đợt Xét Nâng Bậc Lương Mới (Nhập Tay)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã đợt xét</label>
                <input
                  type="text"
                  required
                  value={newCycleForm.maDot}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, maDot: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên đợt xét nâng bậc lương</label>
                <input
                  type="text"
                  required
                  value={newCycleForm.tenDot}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, tenDot: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Năm xét</label>
                  <input
                    type="number"
                    value={newCycleForm.nam}
                    onChange={(e) =>
                      setNewCycleForm({ ...newCycleForm, nam: Number(e.target.value) || 2026 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kỳ xét</label>
                  <select
                    value={newCycleForm.kyXet}
                    onChange={(e) =>
                      setNewCycleForm({ ...newCycleForm, kyXet: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="6 tháng đầu năm">6 tháng đầu năm</option>
                    <option value="6 tháng cuối năm">6 tháng cuối năm</option>
                    <option value="Quý 1">Quý 1</option>
                    <option value="Quý 2">Quý 2</option>
                    <option value="Quý 3">Quý 3</option>
                    <option value="Quý 4">Quý 4</option>
                    <option value="Đột xuất">Đột xuất</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ngày chốt số liệu niên hạn
                </label>
                <input
                  type="date"
                  required
                  value={newCycleForm.ngayChotSoLieu}
                  onChange={(e) =>
                    setNewCycleForm({ ...newCycleForm, ngayChotSoLieu: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Người lập đợt</label>
                <input
                  type="text"
                  value={newCycleForm.nguoiLap}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, nguoiLap: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú mục tiêu</label>
                <textarea
                  rows={2}
                  value={newCycleForm.ghiChu}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, ghiChu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  Khởi tạo đợt xét
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
