import React, { useState, useMemo } from 'react';
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
  ArrowUpDown,
  Building,
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
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Unique list of units
  const units = useMemo(() => {
    const set = new Set<string>();
    qncnList.forEach((p) => {
      if (p.donVi) set.add(p.donVi);
    });
    return Array.from(set).sort();
  }, [qncnList]);

  // Filtered and evaluated list
  const filteredList = useMemo(() => {
    return qncnList
      .map((p) => {
        const evaluation = evaluateQNCNEligibility(p, scales, rules, todayStr);
        return { profile: p, evaluation };
      })
      .filter(({ profile, evaluation }) => {
        // Search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = profile.hoVaTen.toLowerCase().includes(term);
          const matchCode = profile.maQNCN.toLowerCase().includes(term);
          const matchCCCD = (profile.soCCCD || '').toLowerCase().includes(term);
          const matchRank = profile.capBac.toLowerCase().includes(term);
          const matchUnit = profile.donVi.toLowerCase().includes(term);
          if (!matchName && !matchCode && !matchCCCD && !matchRank && !matchUnit) {
            return false;
          }
        }

        // Unit
        if (selectedUnit !== 'all' && profile.donVi !== selectedUnit) {
          return false;
        }

        // Grade
        if (selectedGrade !== 'all' && profile.ngach !== selectedGrade) {
          return false;
        }

        // Status
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'due-regular' && evaluation.loaiNangLuong !== 'Thường xuyên') return false;
          if (selectedStatus === 'due-early' && evaluation.loaiNangLuong !== 'Trước thời hạn') return false;
          if (selectedStatus === 'due-vk' && evaluation.loaiNangLuong !== 'Vượt khung') return false;
          if (selectedStatus === 'disciplined' && evaluation.loaiNangLuong !== 'Kéo dài do kỷ luật') return false;
          if (selectedStatus === 'pending' && evaluation.loaiNangLuong !== 'Chưa đủ điều kiện') return false;
        }

        return true;
      });
  }, [qncnList, scales, rules, searchTerm, selectedUnit, selectedGrade, selectedStatus, todayStr]);

  const handleExport = () => {
    exportQNCNToExcel(qncnList);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            Cơ Sở Dữ Liệu Hồ Sơ Quân Nhân Chuyên Nghiệp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý toàn bộ danh sách quân nhân, lịch sử ngạch bậc và niên hạn nâng bậc lương
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            Import Excel
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Xuất Excel
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm mới QNCN
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, số hiệu, CCCD..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Unit Filter */}
        <div>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">-- Tất cả Đơn vị / Khoa / Phòng --</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">-- Tất cả Ngạch lương --</option>
            {scales.map((s) => (
              <option key={s.id} value={s.ngach}>
                {s.tenNgach}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">-- Trạng thái nâng lương --</option>
            <option value="due-regular">Đến hạn nâng thường xuyên</option>
            <option value="due-early">Đủ điều kiện trước thời hạn</option>
            <option value="due-vk">Đến hạn nâng Vượt khung</option>
            <option value="pending">Chưa đủ điều kiện</option>
            <option value="disciplined">Bị kéo dài do kỷ luật</option>
          </select>
        </div>
      </div>

      {/* Table Result */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Hiển thị <strong className="text-slate-900">{filteredList.length}</strong> / {qncnList.length} hồ sơ quân nhân
          </span>
          <span className="text-[11px] text-slate-400">
            * Thời hạn giữ bậc được tự động tính đến ngày {todayStr}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Quân nhân</th>
                <th className="py-2.5 px-3">Cấp bậc / Chức vụ</th>
                <th className="py-2.5 px-3">Đơn vị</th>
                <th className="py-2.5 px-3">Ngạch & Bậc hiện tại</th>
                <th className="py-2.5 px-3">Ngày hưởng</th>
                <th className="py-2.5 px-3">Thời gian giữ</th>
                <th className="py-2.5 px-3">Trạng thái nâng lương</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy quân nhân chuyên nghiệp nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredList.map(({ profile, evaluation }, idx) => (
                  <tr key={profile.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    
                    {/* Personnel Info */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{profile.hoVaTen}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <span>{profile.maQNCN}</span>
                        {profile.gioiTinh === 'Nữ' && (
                          <span className="text-[10px] text-pink-600 font-medium">(Nữ)</span>
                        )}
                      </div>
                    </td>

                    {/* Rank & Position */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-emerald-800">{profile.capBac}</div>
                      <div className="text-[11px] text-slate-600">{profile.chucVu}</div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {profile.donVi}
                    </td>

                    {/* Grade & Step */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">
                        Bậc {profile.bacLuongHienTai} <span className="font-mono text-emerald-700 font-semibold">(Hệ số: {profile.heSoLuongHienTai.toFixed(2)})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{profile.ngach}</div>
                      {profile.phanTramVuotKhung > 0 && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                          VK: {profile.phanTramVuotKhung}%
                        </span>
                      )}
                    </td>

                    {/* Date received */}
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {profile.ngayHuongHienTai}
                    </td>

                    {/* Elapsed months */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 font-mono">
                        {evaluation.soThangDaGiuBac} tháng
                      </span>
                    </td>

                    {/* Evaluation status pill */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          evaluation.loaiNangLuong === 'Trước thời hạn'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : evaluation.loaiNangLuong === 'Thường xuyên'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : evaluation.loaiNangLuong === 'Vượt khung'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : evaluation.loaiNangLuong === 'Kéo dài do kỷ luật'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {evaluation.loaiNangLuong === 'Trước thời hạn' && <Award className="w-3 h-3 text-amber-700" />}
                        {evaluation.loaiNangLuong === 'Thường xuyên' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                        {evaluation.loaiNangLuong === 'Kéo dài do kỷ luật' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        {evaluation.loaiNangLuong}
                      </span>
                      {evaluation.loaiNangLuong !== 'Chưa đủ điều kiện' && evaluation.loaiNangLuong !== 'Kéo dài do kỷ luật' && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          Đề xuất ➔ Bậc {evaluation.bacDeXuat} (+{formatVND(evaluation.chenhLechTienLuong)})
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewProfile(profile)}
                          title="Xem chi tiết hồ sơ & tính lương"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditProfile(profile)}
                          title="Chỉnh sửa thông tin"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa hồ sơ quân nhân ${profile.hoVaTen} khỏi danh sách?`)) {
                              onDeleteProfile(profile.id);
                            }
                          }}
                          title="Xóa hồ sơ"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
