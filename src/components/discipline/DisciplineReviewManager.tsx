import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileDown,
  Building,
  RotateCcw,
  Edit2,
  Trash2,
  Stamp,
  Scan,
  CheckSquare,
  Square,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  DisciplineCaseRecord,
  DisciplineDecisionInfo,
  DisciplineExtractInfo,
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
} from '../../types';
import { DisciplineDocumentModal } from './DisciplineDocumentModal';
import { DisciplineFormModal } from './DisciplineFormModal';
import { calculateQNCNNextDueDate } from '../personnel/PersonnelList';
import { useToast } from '../../context/ToastContext';

interface DisciplineReviewManagerProps {
  cases: DisciplineCaseRecord[];
  decisionData: DisciplineDecisionInfo;
  extractData: DisciplineExtractInfo;
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  onSaveCases: (updated: DisciplineCaseRecord[]) => void;
  onSaveDocuments: (decision: DisciplineDecisionInfo, extract: DisciplineExtractInfo) => void;
}

export const DisciplineReviewManager: React.FC<DisciplineReviewManagerProps> = ({
  cases,
  decisionData,
  extractData,
  qncnList,
  scales,
  rules,
  onSaveCases,
  onSaveDocuments,
}) => {
  const toast = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Selected item IDs for batch processing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalDefaultTab, setDocModalDefaultTab] = useState<'decision' | 'extract'>('decision');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DisciplineCaseRecord | null>(null);

  // Units list
  const units = useMemo(() => {
    const s = new Set<string>();
    qncnList.forEach((p) => {
      if (p.donVi) s.add(p.donVi);
    });
    return Array.from(s).sort();
  }, [qncnList]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase().trim();
        const mName = c.hoVaTen.toLowerCase().includes(t);
        const mCode = c.maQNCN.toLowerCase().includes(t);
        const mUnit = c.donVi.toLowerCase().includes(t);
        const mRank = c.capBac.toLowerCase().includes(t);
        const mDec = (c.soQuyetDinhKyLuat || '').toLowerCase().includes(t);
        const mReason = (c.lyDoKyLuat || '').toLowerCase().includes(t);
        if (!mName && !mCode && !mUnit && !mRank && !mDec && !mReason) return false;
      }

      if (selectedUnit !== 'all' && c.donVi !== selectedUnit) return false;
      if (selectedType !== 'all' && c.hinhThucKyLuat !== selectedType) return false;
      if (selectedStatus !== 'all' && c.trangThaiPheDuyet !== selectedStatus) return false;

      return true;
    });
  }, [cases, searchTerm, selectedUnit, selectedType, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = cases.length;
    const approved = cases.filter((c) => c.trangThaiPheDuyet === 'Đã duyệt kéo dài').length;
    const pending = cases.filter((c) => c.trangThaiPheDuyet === 'Chờ xét duyệt').length;
    const totalMonths = cases.reduce((acc, c) => acc + (c.soThangKeoDai || 0), 0);
    return { total, approved, pending, totalMonths };
  }, [cases]);

  // Checkbox handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredCases.length && filteredCases.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCases.map((c) => c.id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Batch approve
  const handleBatchApprove = () => {
    if (selectedIds.size === 0) return;
    const updated = cases.map((c) => {
      if (selectedIds.has(c.id)) {
        return { ...c, trangThaiPheDuyet: 'Đã duyệt kéo dài' as const };
      }
      return c;
    });
    onSaveCases(updated);
    toast.success(
      'Đã duyệt hàng loạt!',
      `Đã phê duyệt kéo dài thời hạn cho ${selectedIds.size} quân nhân bị kỷ luật.`,
      { badge: 'XÉT DUYỆT' }
    );
  };

  // Toggle single status
  const handleToggleSingleStatus = (id: string) => {
    const updated = cases.map((c) => {
      if (c.id === id) {
        const nextStatus =
          c.trangThaiPheDuyet === 'Đã duyệt kéo dài' ? ('Chờ xét duyệt' as const) : ('Đã duyệt kéo dài' as const);
        return { ...c, trangThaiPheDuyet: nextStatus };
      }
      return c;
    });
    onSaveCases(updated);
  };

  // Delete case
  const handleDeleteCase = (id: string) => {
    const target = cases.find((c) => c.id === id);
    const updated = cases.filter((c) => c.id !== id);
    onSaveCases(updated);
    toast.warning(
      'Đã xóa hồ sơ kỷ luật',
      `Đã xóa hồ sơ kỷ luật của đồng chí ${target?.hoVaTen || ''} khỏi danh sách xét duyệt.`,
      { badge: 'XÓA HỒ SƠ' }
    );
  };

  // Scan database for disciplined profiles
  const handleScanDatabase = () => {
    const existingQncnIds = new Set(cases.map((c) => c.qncnId));
    const disciplinedProfiles = qncnList.filter(
      (p) =>
        p.kyLuatGanNhat &&
        p.kyLuatGanNhat !== 'Không' &&
        p.kyLuatGanNhat.trim() !== '' &&
        !existingQncnIds.has(p.id)
    );

    if (disciplinedProfiles.length === 0) {
      toast.info(
        'Đã quét toàn bộ CSDL',
        'Tất cả quân nhân có thông tin kỷ luật hiện tại đều đã được đưa vào danh sách theo dõi.'
      );
      return;
    }

    const newCases: DisciplineCaseRecord[] = disciplinedProfiles.map((p) => {
      const isCanhCao = p.kyLuatGanNhat.toLowerCase().includes('cảnh cáo');
      const months = isCanhCao ? 12 : 6;
      const due = calculateQNCNNextDueDate(p, scales, rules);
      const parts = due.dueYearMonth.split('-');
      const baseDue = `${parts[0]}-${parts[1]}-01`;

      // Calculate new due
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      d.setMonth(d.getMonth() + months);
      const yNew = d.getFullYear();
      const mNew = String(d.getMonth() + 1).padStart(2, '0');
      const newDue = `${yNew}-${mNew}-01`;

      return {
        id: `disc-scan-${Date.now()}-${p.id}`,
        qncnId: p.id,
        maQNCN: p.maQNCN,
        hoVaTen: p.hoVaTen,
        donVi: p.donVi,
        capBac: p.capBac,
        chucVu: p.chucVu,
        ngach: p.ngach,
        bacHienTai: p.bacLuongHienTai,
        heSoHienTai: p.heSoLuongHienTai,
        ngayHuongHienTai: p.ngayHuongHienTai,
        hinhThucKyLuat: p.kyLuatGanNhat,
        soQuyetDinhKyLuat: '12/QĐ-HC2',
        ngayKyLuat: p.ngayKyLuat || '2025-08-15',
        coQuanRaQuyetDinh: 'Hiệu trưởng Trường Cao đẳng Hậu cần 2',
        lyDoKyLuat: p.ghiChu || 'Vi phạm kỷ luật trong niên hạn công tác',
        soThangKeoDai: months,
        hanNangLuongBanDau: baseDue,
        hanNangLuongMoi: newDue,
        trangThaiPheDuyet: 'Chờ xét duyệt',
        yKienHoiDong: `Kéo dài thời hạn ${months} tháng theo quy định`,
        ghiChu: p.ghiChu,
      };
    });

    onSaveCases([...cases, ...newCases]);
    toast.success(
      'Quét CSDL thành công!',
      `Đã phát hiện và bổ sung thêm ${newCases.length} hồ sơ quân nhân có kỷ luật vào danh sách xét duyệt.`,
      { badge: 'QUÉT CSDL' }
    );
  };

  const handleOpenDocModal = (tab: 'decision' | 'extract') => {
    setDocModalDefaultTab(tab);
    setIsDocModalOpen(true);
  };

  const handleSaveFormRecord = (record: DisciplineCaseRecord) => {
    const existingIndex = cases.findIndex((c) => c.id === record.id);
    let updated: DisciplineCaseRecord[];
    if (existingIndex >= 0) {
      updated = [...cases];
      updated[existingIndex] = record;
      toast.success(
        'Cập nhật hồ sơ kỷ luật thành công!',
        `Đã lưu thông tin kỷ luật của đồng chí ${record.hoVaTen}.`,
        { badge: 'CẬP NHẬT' }
      );
    } else {
      updated = [record, ...cases];
      toast.success(
        'Thêm hồ sơ kỷ luật thành công!',
        `Đã bổ sung đồng chí ${record.hoVaTen} vào danh sách theo dõi kỷ luật.`,
        { badge: 'THÊM MỚI' }
      );
    }
    onSaveCases(updated);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedUnit('all');
    setSelectedType('all');
    setSelectedStatus('all');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="neu-flat rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            Nghiệp Vụ Xét Duyệt Kỷ Luật & Kéo Dài Thời Hạn Nâng Bậc Lương
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Áp dụng Luật QNCN, CN&VCQP và Thông tư BQP: Khiển trách kéo dài 06 tháng, Cảnh cáo kéo dài 12 tháng.
            Xuất văn bản Quyết định & Bản Trích sao chính quy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Open Documents Modal */}
          <button
            onClick={() => handleOpenDocModal('decision')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-sm transition-all"
            title="Mở Quyết định của Tổng cục Hậu cần & Bản Trích sao Trường CĐHC2"
          >
            <FileText className="w-4 h-4 text-amber-200" />
            In Quyết định & Trích sao
          </button>

          {/* Scan DB */}
          <button
            onClick={handleScanDatabase}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl neu-convex text-slate-700 hover:text-slate-900 font-bold text-xs transition-all"
            title="Quét toàn bộ CSDL hồ sơ quân nhân để nạp tự động các trường hợp có kỷ luật"
          >
            <Scan className="w-4 h-4 text-emerald-800" />
            Quét từ CSDL
          </button>

          {/* Add New Case */}
          <button
            onClick={() => {
              setEditingRecord(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl neu-amber text-slate-950 font-black text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm hồ sơ kỷ luật
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="neu-flat rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-200 text-slate-700">
            <ShieldAlert className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-mono">{stats.total}</div>
            <div className="text-[11px] font-bold text-slate-500">Tổng hồ sơ kỷ luật</div>
          </div>
        </div>

        <div className="neu-flat rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-950 font-mono">{stats.approved}</div>
            <div className="text-[11px] font-bold text-emerald-800">Đã duyệt kéo dài</div>
          </div>
        </div>

        <div className="neu-flat rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-950 font-mono">{stats.pending}</div>
            <div className="text-[11px] font-bold text-amber-800">Chờ xét duyệt</div>
          </div>
        </div>

        <div className="neu-flat rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <div className="text-xl font-black text-rose-950 font-mono">{stats.totalMonths} thg</div>
            <div className="text-[11px] font-bold text-rose-800">Tổng thời gian kéo dài</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="neu-flat rounded-3xl p-5 space-y-3">
        {/* Search row */}
        <div className="relative">
          <Search className="w-4 h-4 text-emerald-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nhanh theo họ tên, số hiệu QNCN, đơn vị, số quyết định kỷ luật, lý do vi phạm..."
            className="w-full pl-10 pr-4 py-2.5 neu-input rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Unit Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Lọc theo Đơn vị:
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-semibold text-slate-800"
            >
              <option value="all">-- Tất cả Đơn vị ({units.length}) --</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Discipline Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Hình thức kỷ luật:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-semibold text-slate-800"
            >
              <option value="all">-- Tất cả hình thức kỷ luật --</option>
              <option value="Khiển trách">Khiển trách (06 tháng)</option>
              <option value="Cảnh cáo">Cảnh cáo (12 tháng)</option>
              <option value="Giáng cấp bậc quân hàm">Giáng cấp bậc quân hàm</option>
              <option value="Hạ bậc lương">Hạ bậc lương</option>
              <option value="Cách chức">Cách chức</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Trạng thái thẩm định:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-bold text-emerald-950"
            >
              <option value="all">-- Tất cả trạng thái --</option>
              <option value="Đã duyệt kéo dài">✓ Đã duyệt kéo dài</option>
              <option value="Chờ xét duyệt">⏳ Chờ xét duyệt</option>
              <option value="Từ chối">✕ Từ chối</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear */}
        {(searchTerm || selectedUnit !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              Tìm thấy <strong className="text-slate-800 font-mono">{filteredCases.length}</strong> trường hợp kỷ luật
            </span>
            <button
              onClick={handleResetFilters}
              className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="neu-flat rounded-3xl p-4 sm:p-5 space-y-3 overflow-hidden">
        {/* Table Top Controls & Batch Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="p-1 rounded text-slate-600 hover:text-slate-900"
              title="Chọn tất cả"
            >
              {selectedIds.size === filteredCases.length && filteredCases.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-800" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <span className="text-xs font-bold text-slate-700">
              Danh Sách Quân Nhân Kỷ Luật ({filteredCases.length} hồ sơ)
            </span>
            {selectedIds.size > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                Đã chọn {selectedIds.size}
              </span>
            )}
          </div>

          {/* Batch Buttons */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <button
                type="button"
                onClick={handleBatchApprove}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Duyệt kéo dài ({selectedIds.size})
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl neu-pressed p-2">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-700 font-black border-b border-slate-300/80">
              <tr>
                <th className="py-2.5 px-2 w-8 text-center"></th>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Quân nhân</th>
                <th className="py-2.5 px-3">Cấp bậc / Chức vụ</th>
                <th className="py-2.5 px-3">Đơn vị</th>
                <th className="py-2.5 px-3">Lương hiện tại</th>
                <th className="py-2.5 px-3">Hình thức & QĐ Kỷ luật</th>
                <th className="py-2.5 px-3 text-center">Kéo dài</th>
                <th className="py-2.5 px-3">Mốc nâng cũ ➔ Mới</th>
                <th className="py-2.5 px-3">Trạng thái duyệt</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <p className="font-bold text-slate-700">Chưa có hồ sơ kỷ luật nào phù hợp.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Bấm nút "Quét từ CSDL" hoặc "Thêm hồ sơ kỷ luật" để tạo mới.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((item, idx) => {
                  const isChecked = selectedIds.has(item.id);
                  const isApproved = item.trangThaiPheDuyet === 'Đã duyệt kéo dài';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-white/60 transition-colors group ${
                        isChecked ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-800" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* STT */}
                      <td className="py-3 px-3 text-slate-400 font-mono font-bold">{idx + 1}</td>

                      {/* Personnel */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                          {item.hoVaTen}
                        </div>
                        <div className="text-[11px] text-emerald-900 font-mono font-semibold">
                          {item.maQNCN}
                        </div>
                      </td>

                      {/* Rank & Position */}
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-emerald-900">{item.capBac}</div>
                        <div className="text-[11px] text-slate-600">{item.chucVu}</div>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{item.donVi}</span>
                      </td>

                      {/* Salary */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">
                          Bậc {item.bacHienTai}{' '}
                          <span className="font-mono text-emerald-800 font-bold">
                            (HS {item.heSoHienTai.toFixed(2)})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">{item.ngach}</div>
                      </td>

                      {/* Discipline details */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-900 border border-rose-300">
                          {item.hinhThucKyLuat}
                        </span>
                        <div className="text-[11px] font-mono text-slate-700 mt-0.5">
                          Số QĐ: {item.soQuyetDinhKyLuat} ({item.ngayKyLuat})
                        </div>
                        {item.lyDoKyLuat && (
                          <div className="text-[10px] text-slate-500 italic max-w-xs truncate" title={item.lyDoKyLuat}>
                            Lý do: {item.lyDoKyLuat}
                          </div>
                        )}
                      </td>

                      {/* Extension months */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-black text-rose-800 px-2 py-1 rounded-xl bg-rose-50 border border-rose-200">
                          +{item.soThangKeoDai} tháng
                        </span>
                      </td>

                      {/* Progression Dates */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-500 line-through">{item.hanNangLuongBanDau}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-emerald-900">{item.hanNangLuongMoi}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleSingleStatus(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs transition-all ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                          }`}
                          title="Bấm để chuyển đổi trạng thái duyệt"
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Đã duyệt kéo dài</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Chờ xét duyệt</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecord(item);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl neu-convex text-slate-700 hover:text-emerald-900 transition-colors"
                            title="Chỉnh sửa hồ sơ kỷ luật"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Print / View */}
                          <button
                            type="button"
                            onClick={() => handleOpenDocModal('decision')}
                            className="p-1.5 rounded-xl neu-convex text-amber-800 hover:text-amber-950 transition-colors"
                            title="Xem trong Quyết định & Bản Trích sao"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCase(item.id)}
                            className="p-1.5 rounded-xl neu-convex text-rose-700 hover:text-rose-900 transition-colors"
                            title="Xóa hồ sơ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Military Discipline Document Modal (Decision & Extract) */}
      <DisciplineDocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        cases={cases}
        decisionData={decisionData}
        extractData={extractData}
        onSaveDocuments={onSaveDocuments}
        defaultTab={docModalDefaultTab}
      />

      {/* Add / Edit Discipline Form Modal */}
      <DisciplineFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveFormRecord}
        initialRecord={editingRecord}
        qncnList={qncnList}
        scales={scales}
        rules={rules}
      />
    </div>
  );
};
