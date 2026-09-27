import React from 'react';
import {
  X,
  User,
  Shield,
  Award,
  AlertTriangle,
  History,
  Calendar,
  Building,
  CreditCard,
  Briefcase,
  FileText,
  Clock,
} from 'lucide-react';
import { QNCNProfile, SalaryScaleConfig, GeneralSalaryRules } from '../../types';
import { formatVND, calculatePayrollRecord } from '../../services/salaryCalculator';
import { evaluateQNCNEligibility } from '../../services/salaryProgressionEngine';

interface PersonnelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: QNCNProfile | null;
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  onEdit: (profile: QNCNProfile) => void;
}

export const PersonnelDetailModal: React.FC<PersonnelDetailModalProps> = ({
  isOpen,
  onClose,
  profile,
  scales,
  rules,
  onEdit,
}) => {
  if (!isOpen || !profile) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const evalResult = evaluateQNCNEligibility(profile, scales, rules, todayStr);
  const payroll = calculatePayrollRecord(profile, rules);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded">
                  {profile.capBac}
                </span>
                <span className="text-xs text-emerald-200 font-mono">
                  {profile.maQNCN}
                </span>
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">{profile.hoVaTen}</h3>
              <p className="text-xs text-emerald-200">
                {profile.chucVu} • {profile.donVi}
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Eligibility status alert box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              evalResult.loaiNangLuong === 'Trước thời hạn'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : evalResult.loaiNangLuong === 'Thường xuyên'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : evalResult.loaiNangLuong === 'Vượt khung'
                ? 'bg-purple-50 border-purple-300 text-purple-900'
                : evalResult.loaiNangLuong === 'Kéo dài do kỷ luật'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Trạng thái xét nâng bậc:</span>
                <span className="underline">{evalResult.loaiNangLuong}</span>
              </div>
              <p className="text-xs mt-1 leading-relaxed">{evalResult.lyDoDeXuat}</p>
              {evalResult.loaiNangLuong !== 'Chưa đủ điều kiện' && evalResult.loaiNangLuong !== 'Kéo dài do kỷ luật' && (
                <div className="mt-2 text-xs font-semibold flex items-center gap-2">
                  <span>Đề xuất: Bậc {evalResult.bacDeXuat} (Hệ số {evalResult.heSoDeXuat.toFixed(2)})</span>
                  {evalResult.vuotKhungDeXuat > 0 && <span>+ VK {evalResult.vuotKhungDeXuat}%</span>}
                  <span className="text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                    +{formatVND(evalResult.chenhLechTienLuong)}/tháng
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2-column detailed breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: General Profile Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                Thông tin Quân nhân
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-medium text-slate-800">{profile.ngaySinh} ({profile.gioiTinh})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số CCCD / CMT Quân đội:</span>
                <span className="font-mono text-slate-800">{profile.soCCCD || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày nhập ngũ:</span>
                <span className="font-medium text-slate-800">{profile.ngayNhapNgu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cấp bậc quân hàm:</span>
                <span className="font-bold text-emerald-800">{profile.capBac}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chức vụ công tác:</span>
                <span className="font-medium text-slate-800">{profile.chucVu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị / Khoa / Phòng:</span>
                <span className="font-medium text-slate-800">{profile.donVi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khen thưởng gần nhất:</span>
                <span className="font-medium text-amber-700">{profile.khenThuongGanNhat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kỷ luật gần nhất:</span>
                <span className={`font-medium ${profile.kyLuatGanNhat === 'Không' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {profile.kyLuatGanNhat}
                </span>
              </div>
            </div>

            {/* Right: Salary & Allowance Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                Mức lương & Phụ cấp hiện hưởng
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngạch lương:</span>
                <span className="font-bold text-slate-800">{profile.ngach}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bậc hiện tại:</span>
                <span className="font-bold text-slate-800">
                  Bậc {profile.bacLuongHienTai} (Hệ số: {profile.heSoLuongHienTai.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày hưởng bậc hiện tại:</span>
                <span className="font-medium text-slate-800">{profile.ngayHuongHienTai}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian đã giữ bậc:</span>
                <span className="font-bold text-emerald-800 font-mono">{evalResult.soThangDaGiuBac} tháng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phụ cấp thâm niên nghề:</span>
                <span className="font-medium text-slate-800">{profile.phanTramThamNien}% ({formatVND(payroll.tienThamNien)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phụ cấp thâm niên vượt khung:</span>
                <span className="font-medium text-slate-800">{profile.phanTramVuotKhung}% ({formatVND(payroll.tienVuotKhung)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phụ cấp chức vụ (Hệ số {profile.heSoChucVu}):</span>
                <span className="font-medium text-slate-800">{formatVND(payroll.tienChucVu)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phụ cấp đặc thù ngành / giáo viên:</span>
                <span className="font-medium text-slate-800">{formatVND(payroll.tienDacThu)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">Lương thực lĩnh hiện tại:</span>
                <span className="font-bold text-emerald-800 text-sm font-mono">{formatVND(payroll.thucLinh)}</span>
              </div>
            </div>
          </div>

          {/* Promotion History */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-700" />
              Lịch sử quá trình nâng bậc lương
            </h4>
            {profile.lichSuNangLuong && profile.lichSuNangLuong.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Ngày quyết định</th>
                      <th className="py-2 px-3">Số quyết định</th>
                      <th className="py-2 px-3">Bậc chuyển đổi</th>
                      <th className="py-2 px-3">Hệ số</th>
                      <th className="py-2 px-3">Ngày hưởng</th>
                      <th className="py-2 px-3">Hình thức</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profile.lichSuNangLuong.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-600">{item.ngayQuyetDinh}</td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">{item.soQuyetDinh}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          Bậc {item.tuBac} ➔ Bậc {item.lenBac}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700">
                          {item.tuHeSo.toFixed(2)} ➔ {item.lenHeSo.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{item.ngayHuong}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[10px]">
                            {item.hinhThuc}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                Chưa có dữ liệu lịch sử các đợt nâng bậc trước đó. Lịch sử sẽ tự động ghi lại khi phê duyệt Quyết định.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Hồ sơ thuộc quyền quản lý Ban Quân lực - Trường CĐHC2
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(profile);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
            >
              Chỉnh sửa hồ sơ
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
