import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertTriangle,
  User,
  ShieldCheck,
  Calendar,
  Building,
  FileText,
  Clock,
} from 'lucide-react';
import { DisciplineCaseRecord, QNCNProfile, SalaryScaleConfig, GeneralSalaryRules } from '../../types';
import { calculateQNCNNextDueDate } from '../personnel/PersonnelList';

interface DisciplineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: DisciplineCaseRecord) => void;
  initialRecord?: DisciplineCaseRecord | null;
  qncnList: QNCNProfile[];
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
}

export const DisciplineFormModal: React.FC<DisciplineFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  qncnList,
  scales,
  rules,
}) => {
  const [selectedQncnId, setSelectedQncnId] = useState<string>('');
  const [hinhThucKyLuat, setHinhThucKyLuat] = useState<string>('Khiển trách');
  const [soQuyetDinhKyLuat, setSoQuyetDinhKyLuat] = useState<string>('');
  const [ngayKyLuat, setNgayKyLuat] = useState<string>('');
  const [coQuanRaQuyetDinh, setCoQuanRaQuyetDinh] = useState<string>('Hiệu trưởng Trường Cao đẳng Hậu cần 2');
  const [lyDoKyLuat, setLyDoKyLuat] = useState<string>('');
  const [soThangKeoDai, setSoThangKeoDai] = useState<number>(6);
  const [hanNangLuongBanDau, setHanNangLuongBanDau] = useState<string>('');
  const [hanNangLuongMoi, setHanNangLuongMoi] = useState<string>('');
  const [trangThaiPheDuyet, setTrangThaiPheDuyet] = useState<'Chờ xét duyệt' | 'Đã duyệt kéo dài' | 'Từ chối'>('Chờ xét duyệt');
  const [yKienHoiDong, setYKienHoiDong] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');

  // Selected profile details
  const selectedProfile = qncnList.find((p) => p.id === selectedQncnId);

  // Helper to add months to YYYY-MM-DD
  const addMonthsToDateStr = (dateStr: string, monthsToAdd: number): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setMonth(d.getMonth() + monthsToAdd);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    if (initialRecord) {
      setSelectedQncnId(initialRecord.qncnId);
      setHinhThucKyLuat(initialRecord.hinhThucKyLuat);
      setSoQuyetDinhKyLuat(initialRecord.soQuyetDinhKyLuat);
      setNgayKyLuat(initialRecord.ngayKyLuat);
      setCoQuanRaQuyetDinh(initialRecord.coQuanRaQuyetDinh);
      setLyDoKyLuat(initialRecord.lyDoKyLuat);
      setSoThangKeoDai(initialRecord.soThangKeoDai);
      setHanNangLuongBanDau(initialRecord.hanNangLuongBanDau);
      setHanNangLuongMoi(initialRecord.hanNangLuongMoi);
      setTrangThaiPheDuyet(initialRecord.trangThaiPheDuyet as any);
      setYKienHoiDong(initialRecord.yKienHoiDong || '');
      setGhiChu(initialRecord.ghiChu || '');
    } else {
      // New case: pick first profile or reset
      const first = qncnList[0];
      if (first) {
        setSelectedQncnId(first.id);
        const due = calculateQNCNNextDueDate(first, scales, rules);
        const parts = due.dueYearMonth.split('-');
        const defaultDue = `${parts[0]}-${parts[1]}-01`;
        setHanNangLuongBanDau(defaultDue);
        setHanNangLuongMoi(addMonthsToDateStr(defaultDue, 6));
      }
      setHinhThucKyLuat('Khiển trách');
      setSoThangKeoDai(6);
      setSoQuyetDinhKyLuat('15/QĐ-HC2');
      setNgayKyLuat(new Date().toISOString().split('T')[0]);
      setCoQuanRaQuyetDinh('Hiệu trưởng Trường Cao đẳng Hậu cần 2');
      setLyDoKyLuat('');
      setTrangThaiPheDuyet('Chờ xét duyệt');
      setYKienHoiDong('');
      setGhiChu('');
    }
  }, [initialRecord, isOpen]);

  // When profile selection changes
  const handleProfileChange = (profileId: string) => {
    setSelectedQncnId(profileId);
    const p = qncnList.find((item) => item.id === profileId);
    if (p) {
      const due = calculateQNCNNextDueDate(p, scales, rules);
      const parts = due.dueYearMonth.split('-');
      const defaultDue = `${parts[0]}-${parts[1]}-01`;
      setHanNangLuongBanDau(defaultDue);
      setHanNangLuongMoi(addMonthsToDateStr(defaultDue, soThangKeoDai));
    }
  };

  // When discipline type changes: auto-set recommended extension
  const handleDisciplineTypeChange = (type: string) => {
    setHinhThucKyLuat(type);
    let newMonths = 6;
    if (type === 'Khiển trách') {
      newMonths = 6;
    } else if (type === 'Cảnh cáo' || type === 'Hạ bậc lương' || type === 'Giáng cấp bậc quân hàm' || type === 'Cách chức') {
      newMonths = 12;
    }
    setSoThangKeoDai(newMonths);
    if (hanNangLuongBanDau) {
      setHanNangLuongMoi(addMonthsToDateStr(hanNangLuongBanDau, newMonths));
    }
  };

  // When extension months change
  const handleMonthsChange = (months: number) => {
    setSoThangKeoDai(months);
    if (hanNangLuongBanDau) {
      setHanNangLuongMoi(addMonthsToDateStr(hanNangLuongBanDau, months));
    }
  };

  // When base due date changes
  const handleBaseDueDateChange = (baseDue: string) => {
    setHanNangLuongBanDau(baseDue);
    setHanNangLuongMoi(addMonthsToDateStr(baseDue, soThangKeoDai));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    const record: DisciplineCaseRecord = {
      id: initialRecord ? initialRecord.id : `disc-${Date.now()}`,
      qncnId: selectedProfile.id,
      maQNCN: selectedProfile.maQNCN,
      hoVaTen: selectedProfile.hoVaTen,
      donVi: selectedProfile.donVi,
      capBac: selectedProfile.capBac,
      chucVu: selectedProfile.chucVu,
      ngach: selectedProfile.ngach,
      bacHienTai: selectedProfile.bacLuongHienTai,
      heSoHienTai: selectedProfile.heSoLuongHienTai,
      ngayHuongHienTai: selectedProfile.ngayHuongHienTai,
      hinhThucKyLuat,
      soQuyetDinhKyLuat: soQuyetDinhKyLuat.trim() || '12/QĐ-HC2',
      ngayKyLuat: ngayKyLuat || new Date().toISOString().split('T')[0],
      coQuanRaQuyetDinh: coQuanRaQuyetDinh.trim(),
      lyDoKyLuat: lyDoKyLuat.trim(),
      soThangKeoDai,
      hanNangLuongBanDau,
      hanNangLuongMoi,
      trangThaiPheDuyet,
      yKienHoiDong,
      ghiChu,
    };

    onSave(record);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f8fafc] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100">
                {initialRecord ? 'Chỉnh Sửa Hồ Sơ Kỷ Luật' : 'Thêm Mới Hồ Sơ Kỷ Luật Kéo Dài Thời Hạn'}
              </h3>
              <p className="text-xs text-slate-400">
                Quy chuẩn theo Thông tư BQP: Khiển trách 06 tháng, Cảnh cáo 12 tháng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Select Personnel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-800" />
              Chọn Quân nhân chuyên nghiệp bị xử lý kỷ luật:
            </label>
            <select
              value={selectedQncnId}
              onChange={(e) => handleProfileChange(e.target.value)}
              disabled={!!initialRecord}
              className="w-full px-3 py-2.5 neu-input rounded-2xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              {qncnList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.hoVaTen} - {p.capBac} - {p.maQNCN} ({p.donVi} - Bậc {p.bacLuongHienTai})
                </option>
              ))}
            </select>
          </div>

          {/* Personnel Quick Info Banner */}
          {selectedProfile && (
            <div className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Cấp bậc:</span>
                <span className="font-extrabold text-emerald-950">{selectedProfile.capBac}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Đơn vị:</span>
                <span className="font-bold text-slate-800">{selectedProfile.donVi}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Lương hiện hưởng:</span>
                <span className="font-bold text-slate-800">
                  Bậc {selectedProfile.bacLuongHienTai} (HS {selectedProfile.heSoLuongHienTai.toFixed(2)})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Ngày hưởng bậc:</span>
                <span className="font-mono text-slate-800">{selectedProfile.ngayHuongHienTai}</span>
              </div>
            </div>
          )}

          {/* Discipline Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hình thức kỷ luật */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                Hình thức kỷ luật:
              </label>
              <select
                value={hinhThucKyLuat}
                onChange={(e) => handleDisciplineTypeChange(e.target.value)}
                className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-bold text-rose-900 focus:outline-none"
              >
                <option value="Khiển trách">Khiển trách (Kéo dài 06 tháng)</option>
                <option value="Cảnh cáo">Cảnh cáo (Kéo dài 12 tháng)</option>
                <option value="Giáng cấp bậc quân hàm">Giáng cấp bậc quân hàm (Kéo dài 12 tháng)</option>
                <option value="Hạ bậc lương">Hạ bậc lương (Kéo dài 12 tháng)</option>
                <option value="Cách chức">Cách chức (Kéo dài 12 tháng)</option>
              </select>
            </div>

            {/* Số tháng kéo dài */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Số tháng kéo dài thời hạn nâng bậc:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={soThangKeoDai}
                  onChange={(e) => handleMonthsChange(Number(e.target.value))}
                  className="w-24 px-3 py-2 neu-input rounded-2xl text-xs font-mono font-bold text-center"
                />
                <span className="text-xs font-bold text-slate-600">tháng</span>
                <div className="flex gap-1 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleMonthsChange(6)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                      soThangKeoDai === 6 ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-700'
                    }`}
                  >
                    6 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMonthsChange(12)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                      soThangKeoDai === 12 ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-700'
                    }`}
                  >
                    12 tháng
                  </button>
                </div>
              </div>
            </div>

            {/* Số quyết định kỷ luật */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Quyết định xử lý kỷ luật:
              </label>
              <input
                type="text"
                value={soQuyetDinhKyLuat}
                onChange={(e) => setSoQuyetDinhKyLuat(e.target.value)}
                placeholder="VD: 12/QĐ-HC2"
                className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-bold font-mono"
                required
              />
            </div>

            {/* Ngày ký quyết định kỷ luật */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày ban hành quyết định kỷ luật:
              </label>
              <input
                type="date"
                value={ngayKyLuat}
                onChange={(e) => setNgayKyLuat(e.target.value)}
                className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Cơ quan ra quyết định & Lý do */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cơ quan / Cấp ra quyết định kỷ luật:
              </label>
              <input
                type="text"
                value={coQuanRaQuyetDinh}
                onChange={(e) => setCoQuanRaQuyetDinh(e.target.value)}
                className="w-full px-3 py-2 neu-input rounded-2xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung / Lý do vi phạm kỷ luật:
              </label>
              <textarea
                rows={2}
                value={lyDoKyLuat}
                onChange={(e) => setLyDoKyLuat(e.target.value)}
                placeholder="Ghi rõ hành vi vi phạm dẫn đến quyết định xử lý kỷ luật..."
                className="w-full px-3 py-2 neu-input rounded-2xl text-xs"
              />
            </div>
          </div>

          {/* Time range progression timeline */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              Mốc Thời Gian Tính Nâng Lương Kế Tiếp:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-600 block text-[11px] font-semibold mb-1">
                  Mốc đến hạn chuẩn ban đầu:
                </span>
                <input
                  type="date"
                  value={hanNangLuongBanDau}
                  onChange={(e) => handleBaseDueDateChange(e.target.value)}
                  className="w-full px-3 py-1.5 neu-input rounded-xl font-mono text-xs font-bold"
                  required
                />
              </div>
              <div>
                <span className="text-slate-600 block text-[11px] font-semibold mb-1">
                  Mốc đến hạn mới (sau khi kéo dài +{soThangKeoDai} tháng):
                </span>
                <input
                  type="date"
                  value={hanNangLuongMoi}
                  onChange={(e) => setHanNangLuongMoi(e.target.value)}
                  className="w-full px-3 py-1.5 neu-input rounded-xl font-mono text-xs font-bold text-emerald-900 bg-emerald-50/60"
                  required
                />
              </div>
            </div>
          </div>

          {/* Approval status & Council review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trạng thái thẩm định của Hội đồng:
              </label>
              <select
                value={trangThaiPheDuyet}
                onChange={(e) => setTrangThaiPheDuyet(e.target.value as any)}
                className="w-full px-3 py-2 neu-input rounded-2xl text-xs font-bold"
              >
                <option value="Chờ xét duyệt">⏳ Chờ xét duyệt</option>
                <option value="Đã duyệt kéo dài">✓ Đã duyệt kéo dài</option>
                <option value="Từ chối">✕ Từ chối</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ý kiến kết luận của Hội đồng:
              </label>
              <input
                type="text"
                value={yKienHoiDong}
                onChange={(e) => setYKienHoiDong(e.target.value)}
                placeholder="Nhất trí kéo dài thời hạn..."
                className="w-full px-3 py-2 neu-input rounded-2xl text-xs"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              {initialRecord ? 'Lưu cập nhật' : 'Thêm hồ sơ kỷ luật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
