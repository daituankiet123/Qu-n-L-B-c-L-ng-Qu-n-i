import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  Building,
  X,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  History,
  FileCheck2,
} from 'lucide-react';
import { QNCNProfile, SalaryScaleConfig, GeneralSalaryRules } from '../../types';
import { formatVND } from '../../services/salaryCalculator';
import { evaluateQNCNEligibility } from '../../services/salaryProgressionEngine';
import { exportQNCNToExcel } from '../../services/excelService';

interface PersonnelListProps {
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
  onEditProfile: (profile: QNCNProfile) => void;
  onViewProfile: (profile: QNCNProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export type StatusFilterType =
  | 'all'
  | 'pending-promotion' // Đang chờ nâng lương (thường xuyên, trước hạn, vượt khung)
  | 'promoted' // Đã nâng lương (đã có lịch sử nâng lương hoặc đã ban hành QĐ)
  | 'due-regular' // Đến hạn thường xuyên
  | 'due-early' // Trước thời hạn (khen thưởng)
  | 'due-vk' // Đến hạn vượt khung
  | 'not-due' // Chưa đủ điều kiện (đang trong niên hạn giữ bậc)
  | 'disciplined'; // Kéo dài do kỷ luật

export const PersonnelList: React.FC<PersonnelListProps> = ({
  qncnList,
  scales,
  rules,
  onOpenImportModal,
  onOpenAddModal,
  onEditProfile,
  onViewProfile,
  onDeleteProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterType>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Unique list of units
  const units = useMemo(() => {
    const set = new Set<string>();
    qncnList.forEach((p) => {
      if (p.donVi) set.add(p.donVi);
    });
    return Array.from(set).sort();
  }, [qncnList]);

  // Helper function to check if someone is "Đã nâng lương"
  const isAlreadyPromoted = (p: QNCNProfile) => {
    const hasHistory = Boolean(p.lichSuNangLuong && p.lichSuNangLuong.length > 0);
    const hasPromotionNote = Boolean(
      p.ghiChu &&
        (p.ghiChu.toLowerCase().includes('nâng lương') ||
          p.ghiChu.toLowerCase().includes('quyết định') ||
          p.ghiChu.toLowerCase().includes('trích sao'))
    );
    const hasRewardProcessed = p.khenThuongGanNhat === 'Đã xét nâng trước hạn';
    return hasHistory || hasPromotionNote || hasRewardProcessed;
  };

  // Helper function to check if someone is "Đang chờ nâng lương"
  const isPendingPromotion = (evaluation: any, p: QNCNProfile) => {
    const isDueByProgression =
      evaluation.loaiNangLuong === 'Thường xuyên' ||
      evaluation.loaiNangLuong === 'Trước thời hạn' ||
      evaluation.loaiNangLuong === 'Vượt khung';
    const isExplicitStatus = p.trangThai === 'Chờ nâng lương';
    return isDueByProgression || isExplicitStatus;
  };

  // Evaluate all personnel once for counts and filtering
  const evaluatedList = useMemo(() => {
    return qncnList.map((p) => {
      const evaluation = evaluateQNCNEligibility(p, scales, rules, todayStr);
      const promoted = isAlreadyPromoted(p);
      const pending = isPendingPromotion(evaluation, p);
      return { profile: p, evaluation, isPromoted: promoted, isPending: pending };
    });
  }, [qncnList, scales, rules, todayStr]);

  // Status counts for quick filter buttons
  const counts = useMemo(() => {
    let pendingCount = 0;
    let promotedCount = 0;
    let notDueCount = 0;
    let disciplinedCount = 0;

    evaluatedList.forEach(({ evaluation, isPromoted, isPending }) => {
      if (isPending) pendingCount++;
      if (isPromoted) promotedCount++;
      if (evaluation.loaiNangLuong === 'Chưa đủ điều kiện') notDueCount++;
      if (evaluation.loaiNangLuong === 'Kéo dài do kỷ luật') disciplinedCount++;
    });

    return {
      all: qncnList.length,
      pending: pendingCount,
      promoted: promotedCount,
      notDue: notDueCount,
      disciplined: disciplinedCount,
    };
  }, [evaluatedList, qncnList.length]);

  // Filtered list based on search and filters
  const filteredList = useMemo(() => {
    return evaluatedList.filter(({ profile, evaluation, isPromoted, isPending }) => {
      // 1. Search Bar filter: Match name, military code, unit, rank, position, CCCD, notes
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = profile.hoVaTen.toLowerCase().includes(term);
        const matchCode = profile.maQNCN.toLowerCase().includes(term);
        const matchCCCD = (profile.soCCCD || '').toLowerCase().includes(term);
        const matchRank = profile.capBac.toLowerCase().includes(term);
        const matchUnit = profile.donVi.toLowerCase().includes(term);
        const matchPosition = (profile.chucVu || '').toLowerCase().includes(term);
        const matchNote = (profile.ghiChu || '').toLowerCase().includes(term);

        if (
          !matchName &&
          !matchCode &&
          !matchCCCD &&
          !matchRank &&
          !matchUnit &&
          !matchPosition &&
          !matchNote
        ) {
          return false;
        }
      }

      // 2. Unit filter
      if (selectedUnit !== 'all' && profile.donVi !== selectedUnit) {
        return false;
      }

      // 3. Grade filter
      if (selectedGrade !== 'all' && profile.ngach !== selectedGrade) {
        return false;
      }

      // 4. Status filter: đang chờ nâng lương, đã nâng lương, v.v.
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'pending-promotion' && !isPending) return false;
        if (selectedStatus === 'promoted' && !isPromoted) return false;
        if (selectedStatus === 'due-regular' && evaluation.loaiNangLuong !== 'Thường xuyên') return false;
        if (selectedStatus === 'due-early' && evaluation.loaiNangLuong !== 'Trước thời hạn') return false;
        if (selectedStatus === 'due-vk' && evaluation.loaiNangLuong !== 'Vượt khung') return false;
        if (selectedStatus === 'not-due' && evaluation.loaiNangLuong !== 'Chưa đủ điều kiện') return false;
        if (selectedStatus === 'disciplined' && evaluation.loaiNangLuong !== 'Kéo dài do kỷ luật') return false;
      }

      return true;
    });
  }, [evaluatedList, searchTerm, selectedUnit, selectedGrade, selectedStatus]);

  const handleExport = () => {
    exportQNCNToExcel(qncnList);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedUnit('all');
    setSelectedGrade('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedUnit !== 'all' ||
    selectedGrade !== 'all' ||
    selectedStatus !== 'all';

  return (
    <div className="space-y-4">
      {/* Top Action Bar in Neumorphic Card */}
      <div className="neu-flat rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            Cơ Sở Dữ Liệu Hồ Sơ Quân Nhân Chuyên Nghiệp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Quản lý toàn bộ danh sách quân nhân, tra cứu số hiệu, theo dõi niên hạn và trạng thái nâng lương
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl neu-emerald text-white font-bold text-xs shadow-sm transition-all"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            Import Excel
          </motion.button>

          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl neu-convex text-slate-700 font-bold text-xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            Xuất Excel
          </motion.button>

          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl neu-amber text-slate-950 font-black text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm mới QNCN
          </motion.button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROMINENT SEARCH BAR & STATUS FILTER PILLS CARD                           */}
      {/* ========================================================================= */}
      <div className="neu-flat rounded-3xl p-5 space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-emerald-700" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nhanh quân nhân theo họ tên, số hiệu QNCN (e.g. HC2-QN...), đơn vị công tác, chức vụ, CCCD..."
            className="w-full pl-12 pr-10 py-3 neu-input rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Status Filter Pills (Đang chờ nâng lương, Đã nâng lương, Tất cả...) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-300/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              Lọc nhanh:
            </span>

            {/* All */}
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                selectedStatus === 'all'
                  ? 'neu-emerald text-white shadow-xs'
                  : 'neu-flat text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedStatus === 'all' ? 'bg-emerald-950/40 text-emerald-200' : 'bg-slate-300/60 text-slate-700'
                }`}
              >
                {counts.all}
              </span>
            </button>

            {/* Đang chờ nâng lương */}
            <button
              onClick={() => setSelectedStatus('pending-promotion')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                selectedStatus === 'pending-promotion'
                  ? 'neu-amber text-slate-950 shadow-xs'
                  : 'neu-flat text-amber-900 hover:text-amber-950'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Đang chờ nâng lương</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  selectedStatus === 'pending-promotion'
                    ? 'bg-amber-950/30 text-slate-950'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {counts.pending}
              </span>
            </button>

            {/* Đã nâng lương */}
            <button
              onClick={() => setSelectedStatus('promoted')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                selectedStatus === 'promoted'
                  ? 'neu-emerald text-white shadow-xs'
                  : 'neu-flat text-emerald-900 hover:text-emerald-950'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã nâng lương</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  selectedStatus === 'promoted'
                    ? 'bg-emerald-950/40 text-emerald-200'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {counts.promoted}
              </span>
            </button>

            {/* Đang giữ bậc (Chưa đủ điều kiện) */}
            <button
              onClick={() => setSelectedStatus('not-due')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                selectedStatus === 'not-due'
                  ? 'neu-convex bg-slate-700 text-white shadow-xs'
                  : 'neu-flat text-slate-600 hover:text-slate-800'
              }`}
            >
              <span>Đang giữ bậc</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedStatus === 'not-due'
                    ? 'bg-slate-900/40 text-slate-200'
                    : 'bg-slate-300/60 text-slate-700'
                }`}
              >
                {counts.notDue}
              </span>
            </button>

            {/* Kỷ luật kéo dài (nếu có) */}
            {counts.disciplined > 0 && (
              <button
                onClick={() => setSelectedStatus('disciplined')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  selectedStatus === 'disciplined'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'neu-flat text-rose-700 hover:text-rose-900'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>Kỷ luật</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-100 text-rose-800">
                  {counts.disciplined}
                </span>
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-800 flex items-center gap-1 flex-shrink-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {/* Dropdown Filters Row: Unit, Grade, Specific Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Unit Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Lọc theo Đơn vị / Khoa / Ban:
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full pl-9 pr-3 py-2 neu-input rounded-2xl text-xs font-semibold text-slate-800"
              >
                <option value="all">-- Tất cả Đơn vị / Khoa / Ban --</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Lọc theo Ngạch lương Quân nhân:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-semibold text-slate-800"
            >
              <option value="all">-- Tất cả Ngạch lương --</option>
              {scales.map((s) => (
                <option key={s.id} value={s.ngach}>
                  {s.tenNgach}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Status Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Phân loại trạng thái chi tiết:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilterType)}
              className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-bold text-emerald-950"
            >
              <option value="all">-- Tất cả trạng thái ({counts.all}) --</option>
              <option value="pending-promotion">⏳ Đang chờ nâng lương ({counts.pending})</option>
              <option value="due-regular">--- Đến hạn nâng thường xuyên</option>
              <option value="due-early">--- Đủ điều kiện trước thời hạn (Khen thưởng)</option>
              <option value="due-vk">--- Đến hạn nâng Phụ cấp vượt khung</option>
              <option value="promoted">✅ Đã nâng lương gần đây ({counts.promoted})</option>
              <option value="not-due">⚪ Đang giữ bậc (Chưa đủ điều kiện) ({counts.notDue})</option>
              {counts.disciplined > 0 && (
                <option value="disciplined">⚠️ Bị kéo dài do kỷ luật ({counts.disciplined})</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLE RESULTS IN NEUMORPHIC CARD                                         */}
      {/* ========================================================================= */}
      <div className="neu-flat rounded-3xl p-4 sm:p-5 space-y-3 overflow-hidden">
        {/* Results Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 px-1 gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              Kết quả: <strong className="text-emerald-950 font-mono text-sm">{filteredList.length}</strong> / {qncnList.length} quân nhân
            </span>
            {searchTerm && (
              <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Từ khóa: "<strong>{searchTerm}</strong>"
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="text-[11px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                Trạng thái: <strong>
                  {selectedStatus === 'pending-promotion' && 'Đang chờ nâng lương'}
                  {selectedStatus === 'promoted' && 'Đã nâng lương'}
                  {selectedStatus === 'due-regular' && 'Đến hạn thường xuyên'}
                  {selectedStatus === 'due-early' && 'Trước thời hạn'}
                  {selectedStatus === 'due-vk' && 'Đến hạn vượt khung'}
                  {selectedStatus === 'not-due' && 'Đang giữ bậc'}
                  {selectedStatus === 'disciplined' && 'Kỷ luật kéo dài'}
                </strong>
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            * Niên hạn giữ bậc tính tự động đến ngày {todayStr}
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-2xl neu-pressed p-2">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-700 font-black border-b border-slate-300/80">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Quân nhân</th>
                <th className="py-2.5 px-3">Cấp bậc / Chức vụ</th>
                <th className="py-2.5 px-3">Đơn vị công tác</th>
                <th className="py-2.5 px-3">Ngạch & Bậc hiện tại</th>
                <th className="py-2.5 px-3">Ngày hưởng</th>
                <th className="py-2.5 px-3">Thời gian giữ</th>
                <th className="py-2.5 px-3">Trạng thái nâng lương</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <p className="font-bold text-slate-700">Không tìm thấy quân nhân chuyên nghiệp nào phù hợp.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Đặt lại bộ lọc" bên trên.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 px-3 py-1.5 rounded-xl neu-flat text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Xóa tất cả điều kiện lọc
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredList.map(({ profile, evaluation, isPromoted, isPending }, idx) => (
                  <tr key={profile.id} className="hover:bg-white/60 transition-colors group">
                    <td className="py-3 px-3 text-slate-400 font-mono font-bold">{idx + 1}</td>

                    {/* Personnel Info */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-950 transition-colors flex items-center gap-1.5">
                        <span>{profile.hoVaTen}</span>
                        {profile.gioiTinh === 'Nữ' && (
                          <span className="text-[10px] text-pink-600 font-bold px-1 rounded bg-pink-50 border border-pink-200">
                            Nữ
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono font-semibold flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-900">{profile.maQNCN}</span>
                        {profile.soCCCD && (
                          <span className="text-slate-400 text-[10px]">CCCD: {profile.soCCCD}</span>
                        )}
                      </div>
                    </td>

                    {/* Rank & Position */}
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-emerald-900">{profile.capBac}</div>
                      <div className="text-[11px] text-slate-600">{profile.chucVu}</div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{profile.donVi}</span>
                    </td>

                    {/* Grade & Step */}
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-800">
                        Bậc {profile.bacLuongHienTai}{' '}
                        <span className="font-mono text-emerald-800 font-bold">
                          (Hệ số: {profile.heSoLuongHienTai.toFixed(2)})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{profile.ngach}</div>
                      {profile.phanTramVuotKhung > 0 && (
                        <span className="inline-block mt-0.5 text-[10px] font-black text-purple-800 neu-pressed px-2 py-0.5 rounded-full">
                          VK: {profile.phanTramVuotKhung}%
                        </span>
                      )}
                    </td>

                    {/* Date received */}
                    <td className="py-3 px-3 text-slate-600 font-mono font-medium">
                      {profile.ngayHuongHienTai}
                    </td>

                    {/* Elapsed months */}
                    <td className="py-3 px-3">
                      <span className="font-black text-slate-900 font-mono">
                        {evaluation.soThangDaGiuBac} tháng
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {/* Primary Progression Evaluation Badge */}
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-xs ${
                              evaluation.loaiNangLuong === 'Trước thời hạn'
                                ? 'neu-amber text-slate-950'
                                : evaluation.loaiNangLuong === 'Thường xuyên'
                                ? 'neu-emerald text-white'
                                : evaluation.loaiNangLuong === 'Vượt khung'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : evaluation.loaiNangLuong === 'Kéo dài do kỷ luật'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'neu-convex text-slate-600'
                            }`}
                          >
                            {evaluation.loaiNangLuong === 'Trước thời hạn' && (
                              <Award className="w-3 h-3 text-slate-950" />
                            )}
                            {evaluation.loaiNangLuong === 'Thường xuyên' && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                            {evaluation.loaiNangLuong === 'Kéo dài do kỷ luật' && (
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                            )}
                            {evaluation.loaiNangLuong === 'Chưa đủ điều kiện' ? 'Đang giữ bậc' : evaluation.loaiNangLuong}
                          </span>
                        </div>

                        {/* Proposal details if due */}
                        {isPending && (
                          <div className="text-[10px] text-emerald-800 font-bold pl-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Đề xuất ➔ Bậc {evaluation.bacDeXuat} (+{formatVND(evaluation.chenhLechTienLuong)})</span>
                          </div>
                        )}

                        {/* Already Promoted Indicator Badge */}
                        {isPromoted && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                            <FileCheck2 className="w-3 h-3 text-blue-600" />
                            <span>Đã có quyết định nâng lương</span>
                            {profile.lichSuNangLuong && profile.lichSuNangLuong.length > 0 && (
                              <span className="font-mono text-[9px] bg-blue-200/80 px-1 rounded-full">
                                {profile.lichSuNangLuong.length} lần
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onViewProfile(profile)}
                          title="Xem chi tiết hồ sơ & tính lương"
                          className="p-1.5 rounded-xl neu-convex text-emerald-800 hover:text-emerald-950 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onEditProfile(profile)}
                          title="Chỉnh sửa thông tin"
                          className="p-1.5 rounded-xl neu-convex text-blue-700 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (window.confirm(`Xóa hồ sơ quân nhân ${profile.hoVaTen} (${profile.maQNCN}) khỏi danh sách?`)) {
                              onDeleteProfile(profile.id);
                            }
                          }}
                          title="Xóa hồ sơ"
                          className="p-1.5 rounded-xl neu-convex text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
