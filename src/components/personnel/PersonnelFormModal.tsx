import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Edit3 } from 'lucide-react';
import { QNCNProfile, SalaryScaleConfig, MilitaryRank } from '../../types';

interface PersonnelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: QNCNProfile) => void;
  initialProfile?: QNCNProfile | null;
  scales: SalaryScaleConfig[];
}

const MILITARY_RANKS: MilitaryRank[] = [
  'Đại tá QNCN',
  'Thượng tá QNCN',
  'Trung tá QNCN',
  'Thiếu tá QNCN',
  'Đại úy QNCN',
  'Thượng úy QNCN',
  'Trung úy QNCN',
  'Thiếu úy QNCN',
  'Thượng sĩ QNCN',
  'Trung sĩ QNCN',
];

const DEPARTMENTS = [
  'Khoa Quân sự',
  'Khoa Hậu cần Quân sự',
  'Khoa Vận tải - Quân nhu',
  'Khoa Xăng dầu',
  'Khoa Cơ bản - Cơ sở',
  'Phòng Đào tạo',
  'Phòng Chính trị',
  'Ban Hậu cần - Kỹ thuật',
  'Ban Tài chính',
  'Ban Quân lực',
  'Trạm Y tế',
  'Đại đội Vận tải',
  'Ban Quản trị đời sống',
];

export const PersonnelFormModal: React.FC<PersonnelFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  scales,
}) => {
  const isEditing = !!initialProfile;

  const [formData, setFormData] = useState<Partial<QNCNProfile>>({
    maQNCN: '',
    hoVaTen: '',
    ngaySinh: '1985-01-01',
    gioiTinh: 'Nam',
    soCCCD: '',
    capBac: 'Thiếu tá QNCN',
    chucVu: 'Giảng viên',
    donVi: 'Khoa Hậu cần Quân sự',
    ngach: scales[0]?.ngach || 'Cao cấp Nhóm 1',
    bacLuongHienTai: 1,
    heSoLuongHienTai: 3.85,
    ngayHuongHienTai: new Date().toISOString().split('T')[0],
    ngayNhapNgu: '2005-03-01',
    phanTramThamNien: 15,
    phanTramVuotKhung: 0,
    heSoChucVu: 0.0,
    heSoDacThu: 0.25,
    khenThuongGanNhat: 'Không',
    kyLuatGanNhat: 'Không',
    trangThai: 'Đang công tác',
    ghiChu: '',
  });

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    } else {
      setFormData({
        maQNCN: `HC2-QN${Math.floor(10000 + Math.random() * 90000)}`,
        hoVaTen: '',
        ngaySinh: '1988-05-15',
        gioiTinh: 'Nam',
        soCCCD: '',
        capBac: 'Thiếu tá QNCN',
        chucVu: 'Giảng viên',
        donVi: 'Khoa Hậu cần Quân sự',
        ngach: scales[0]?.ngach || 'Cao cấp Nhóm 1',
        bacLuongHienTai: 1,
        heSoLuongHienTai: scales[0]?.danhSachBac[0]?.heSo || 3.85,
        ngayHuongHienTai: '2023-01-01',
        ngayNhapNgu: '2008-02-15',
        phanTramThamNien: 15,
        phanTramVuotKhung: 0,
        heSoChucVu: 0.0,
        heSoDacThu: 0.25,
        khenThuongGanNhat: 'Không',
        kyLuatGanNhat: 'Không',
        trangThai: 'Đang công tác',
        ghiChu: '',
      });
    }
  }, [initialProfile, scales]);

  if (!isOpen) return null;

  // When ngach or bac changes, suggest heSo from current scale
  const handleScaleOrGradeChange = (newNgach: string, newBac: number) => {
    const scale = scales.find((s) => s.ngach === newNgach);
    const step = scale?.danhSachBac.find((b) => b.bac === newBac);
    setFormData((prev) => ({
      ...prev,
      ngach: newNgach,
      bacLuongHienTai: newBac,
      heSoLuongHienTai: step ? step.heSo : prev.heSoLuongHienTai,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoVaTen || !formData.maQNCN) {
      alert('Vui lòng điền đầy đủ Mã QNCN và Họ tên.');
      return;
    }

    const finalProfile: QNCNProfile = {
      id: initialProfile?.id || `qncn-${Date.now()}`,
      maQNCN: formData.maQNCN!,
      hoVaTen: formData.hoVaTen!,
      ngaySinh: formData.ngaySinh || '1985-01-01',
      gioiTinh: formData.gioiTinh || 'Nam',
      soCCCD: formData.soCCCD || '',
      capBac: formData.capBac || 'Thiếu tá QNCN',
      chucVu: formData.chucVu || 'Giảng viên',
      donVi: formData.donVi || 'Khoa Hậu cần Quân sự',
      ngach: formData.ngach || 'Cao cấp Nhóm 1',
      bacLuongHienTai: Number(formData.bacLuongHienTai) || 1,
      heSoLuongHienTai: Number(formData.heSoLuongHienTai) || 3.85,
      ngayHuongHienTai: formData.ngayHuongHienTai || '2023-01-01',
      ngayNhapNgu: formData.ngayNhapNgu || '2005-03-01',
      phanTramThamNien: Number(formData.phanTramThamNien) || 0,
      phanTramVuotKhung: Number(formData.phanTramVuotKhung) || 0,
      heSoChucVu: Number(formData.heSoChucVu) || 0,
      heSoDacThu: Number(formData.heSoDacThu) || 0,
      khenThuongGanNhat: formData.khenThuongGanNhat || 'Không',
      kyLuatGanNhat: formData.kyLuatGanNhat || 'Không',
      trangThai: formData.trangThai || 'Đang công tác',
      ghiChu: formData.ghiChu || '',
      lichSuNangLuong: initialProfile?.lichSuNangLuong || [],
    };

    onSave(finalProfile);
    onClose();
  };

  const selectedScale = scales.find((s) => s.ngach === formData.ngach);
  const maxBac = selectedScale ? selectedScale.bacToiDa : 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isEditing ? 'Chỉnh Sửa Hồ Sơ QNCN' : 'Thêm Mới Quân Nhân Chuyên Nghiệp'}
              </h3>
              <p className="text-xs text-emerald-200">
                Nhập thông tin chi tiết quân nhân vào cơ sở dữ liệu trường CĐ Hậu cần 2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
            {/* Row 1: Số hiệu, Họ tên, Giới tính, Ngày sinh */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Số hiệu QNCN <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.maQNCN || ''}
                  onChange={(e) => setFormData({ ...formData, maQNCN: e.target.value })}
                  placeholder="HC2-QN01234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hoVaTen || ''}
                  onChange={(e) => setFormData({ ...formData, hoVaTen: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                <select
                  value={formData.gioiTinh || 'Nam'}
                  onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            {/* Row 2: CCCD, Ngày sinh, Ngày nhập ngũ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số CCCD / CMT Quân đội</label>
                <input
                  type="text"
                  value={formData.soCCCD || ''}
                  onChange={(e) => setFormData({ ...formData, soCCCD: e.target.value })}
                  placeholder="079085..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.ngaySinh || ''}
                  onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày nhập ngũ</label>
                <input
                  type="date"
                  value={formData.ngayNhapNgu || ''}
                  onChange={(e) => setFormData({ ...formData, ngayNhapNgu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Row 3: Cấp bậc, Chức vụ, Đơn vị */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cấp bậc</label>
                <select
                  value={formData.capBac || 'Thiếu tá QNCN'}
                  onChange={(e) => setFormData({ ...formData, capBac: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-emerald-800"
                >
                  {MILITARY_RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chức vụ công tác</label>
                <input
                  type="text"
                  value={formData.chucVu || ''}
                  onChange={(e) => setFormData({ ...formData, chucVu: e.target.value })}
                  placeholder="Giảng viên / Trợ lý / Thợ kỹ thuật..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đơn vị / Khoa / Phòng</label>
                <select
                  value={formData.donVi || 'Khoa Hậu cần Quân sự'}
                  onChange={(e) => setFormData({ ...formData, donVi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4: Ngạch, Bậc, Hệ số, Ngày hưởng */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
              <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                Ngạch - Bậc Lương & Thời gian hưởng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngạch QNCN</label>
                  <select
                    value={formData.ngach || 'Cao cấp Nhóm 1'}
                    onChange={(e) => handleScaleOrGradeChange(e.target.value, formData.bacLuongHienTai || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                  >
                    {scales.map((s) => (
                      <option key={s.id} value={s.ngach}>
                        {s.tenNgach}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bậc lương hiện tại</label>
                  <select
                    value={formData.bacLuongHienTai || 1}
                    onChange={(e) => handleScaleOrGradeChange(formData.ngach || 'Cao cấp Nhóm 1', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-bold font-mono"
                  >
                    {Array.from({ length: maxBac }, (_, i) => i + 1).map((b) => (
                      <option key={b} value={b}>
                        Bậc {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hệ số lương</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.heSoLuongHienTai || 3.85}
                    onChange={(e) => setFormData({ ...formData, heSoLuongHienTai: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày hưởng bậc hiện tại</label>
                  <input
                    type="date"
                    required
                    value={formData.ngayHuongHienTai || ''}
                    onChange={(e) => setFormData({ ...formData, ngayHuongHienTai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Phụ cấp (Thâm niên, Vượt khung, Chức vụ, Đặc thù) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">% Phụ cấp thâm niên</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.phanTramThamNien ?? 0}
                    onChange={(e) => setFormData({ ...formData, phanTramThamNien: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">% Thâm niên vượt khung</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.phanTramVuotKhung ?? 0}
                    onChange={(e) => setFormData({ ...formData, phanTramVuotKhung: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hệ số phụ cấp chức vụ</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1.5"
                  value={formData.heSoChucVu ?? 0}
                  onChange={(e) => setFormData({ ...formData, heSoChucVu: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hệ số PC đặc thù / GV</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1.5"
                  value={formData.heSoDacThu ?? 0}
                  onChange={(e) => setFormData({ ...formData, heSoDacThu: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                />
              </div>
            </div>

            {/* Row 6: Khen thưởng, Kỷ luật */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Khen thưởng trong kỳ giữ bậc (để xét nâng trước hạn)
                </label>
                <input
                  type="text"
                  value={formData.khenThuongGanNhat || 'Không'}
                  onChange={(e) => setFormData({ ...formData, khenThuongGanNhat: e.target.value })}
                  placeholder="Chiến sĩ thi đua cấp cơ sở / Huân chương..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs text-amber-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kỷ luật trong kỳ giữ bậc (kéo dài thời hạn nâng)
                </label>
                <input
                  type="text"
                  value={formData.kyLuatGanNhat || 'Không'}
                  onChange={(e) => setFormData({ ...formData, kyLuatGanNhat: e.target.value })}
                  placeholder="Không / Khiển trách / Cảnh cáo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs text-rose-800 font-medium"
                />
              </div>
            </div>

            {/* Row 7: Ghi chú */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghi chú bổ sung</label>
              <textarea
                rows={2}
                value={formData.ghiChu || ''}
                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                placeholder="Ghi chú về hồ sơ, điều kiện ưu tiên..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Dữ liệu sẽ được lưu tự động vào bộ nhớ hệ thống
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-amber-300" />
                {isEditing ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ mới'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
