import React, { useState } from 'react';
import {
  Sliders,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Shield,
  Award,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { SalaryScaleConfig, GeneralSalaryRules } from '../../types';
import { formatVND } from '../../services/salaryCalculator';
import { DEFAULT_SALARY_RULES, DEFAULT_SALARY_SCALES } from '../../data/militaryPayrollDefaults';

interface SalaryConfigViewProps {
  scales: SalaryScaleConfig[];
  rules: GeneralSalaryRules;
  onSaveScales: (scales: SalaryScaleConfig[]) => void;
  onSaveRules: (rules: GeneralSalaryRules) => void;
}

export const SalaryConfigView: React.FC<SalaryConfigViewProps> = ({
  scales,
  rules,
  onSaveScales,
  onSaveRules,
}) => {
  const [currentRules, setCurrentRules] = useState<GeneralSalaryRules>({ ...rules });
  const [currentScales, setCurrentScales] = useState<SalaryScaleConfig[]>([...scales]);
  const [activeScaleTab, setActiveScaleTab] = useState<string>(scales[0]?.id || '');
  const [savedToast, setSavedToast] = useState(false);

  // New reward rule state
  const [newReward, setNewReward] = useState({ danhHieu: '', soThangRutNgan: 6, moTa: '' });
  // New discipline rule state
  const [newDisc, setNewDisc] = useState({ hinhThuc: '', soThangKeoDai: 6, moTa: '' });

  const handleSaveAll = () => {
    onSaveRules(currentRules);
    onSaveScales(currentScales);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetRulesToDefault = () => {
    if (window.confirm('Khôi phục toàn bộ quy chế và bảng lương về mặc định quy định Quân đội?')) {
      setCurrentRules(DEFAULT_SALARY_RULES);
      setCurrentScales(DEFAULT_SALARY_SCALES);
      onSaveRules(DEFAULT_SALARY_RULES);
      onSaveScales(DEFAULT_SALARY_SCALES);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  const selectedScale = currentScales.find((s) => s.id === activeScaleTab) || currentScales[0];

  const handleStepCoefficientChange = (scaleId: string, bacIndex: number, newHeSo: number) => {
    setCurrentScales((prev) =>
      prev.map((s) => {
        if (s.id !== scaleId) return s;
        const newSteps = [...s.danhSachBac];
        newSteps[bacIndex] = { ...newSteps[bacIndex], heSo: newHeSo };
        return { ...s, danhSachBac: newSteps };
      })
    );
  };

  const handleAddStep = (scaleId: string) => {
    setCurrentScales((prev) =>
      prev.map((s) => {
        if (s.id !== scaleId) return s;
        const lastStep = s.danhSachBac[s.danhSachBac.length - 1];
        const nextBac = lastStep ? lastStep.bac + 1 : 1;
        const nextHeSo = lastStep ? Number((lastStep.heSo + 0.35).toFixed(2)) : 3.0;
        return {
          ...s,
          bacToiDa: nextBac,
          danhSachBac: [...s.danhSachBac, { bac: nextBac, heSo: nextHeSo }],
        };
      })
    );
  };

  const handleRemoveStep = (scaleId: string, bac: number) => {
    setCurrentScales((prev) =>
      prev.map((s) => {
        if (s.id !== scaleId) return s;
        const newSteps = s.danhSachBac.filter((st) => st.bac !== bac);
        return {
          ...s,
          bacToiDa: newSteps.length,
          danhSachBac: newSteps,
        };
      })
    );
  };

  const handleAddRewardRule = () => {
    if (!newReward.danhHieu) return;
    const rule = {
      id: `rew-${Date.now()}`,
      danhHieu: newReward.danhHieu,
      soThangRutNgan: Number(newReward.soThangRutNgan) || 6,
      moTa: newReward.moTa || newReward.danhHieu,
    };
    setCurrentRules((prev) => ({
      ...prev,
      quyDinhNangTruocHan: [...prev.quyDinhNangTruocHan, rule],
    }));
    setNewReward({ danhHieu: '', soThangRutNgan: 6, moTa: '' });
  };

  const handleRemoveRewardRule = (id: string) => {
    setCurrentRules((prev) => ({
      ...prev,
      quyDinhNangTruocHan: prev.quyDinhNangTruocHan.filter((r) => r.id !== id),
    }));
  };

  const handleAddDiscRule = () => {
    if (!newDisc.hinhThuc) return;
    const rule = {
      id: `disc-${Date.now()}`,
      hinhThuc: newDisc.hinhThuc,
      soThangKeoDai: Number(newDisc.soThangKeoDai) || 6,
      moTa: newDisc.moTa || newDisc.hinhThuc,
    };
    setCurrentRules((prev) => ({
      ...prev,
      quyDinhKyLuat: [...prev.quyDinhKyLuat, rule],
    }));
    setNewDisc({ hinhThuc: '', soThangKeoDai: 6, moTa: '' });
  };

  const handleRemoveDiscRule = (id: string) => {
    setCurrentRules((prev) => ({
      ...prev,
      quyDinhKyLuat: prev.quyDinhKyLuat.filter((r) => r.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Save Action */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-700" />
              Thiết Lập Quy Chế & Bảng Hệ Số Lương (Nhập Tay)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Tùy biến 100%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cho phép cán bộ tự do thay đổi mức lương cơ sở, chu kỳ giữ bậc, bảng hệ số lương và quy chế khen thưởng / kỷ luật
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetRulesToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục chuẩn BQP
          </button>
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4 text-amber-300" />
            Lưu toàn bộ thiết lập
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Đã lưu thành công các thông số và bảng hệ số mới vào hệ thống!
        </div>
      )}

      {/* Grid: 2 sections (Parameters & Scales) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General Rules & Manual Parameters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Base Salary Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              1. Mức lương cơ sở & Bảo hiểm
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mức lương cơ sở (VNĐ) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    value={currentRules.luongCoSo}
                    onChange={(e) =>
                      setCurrentRules({ ...currentRules, luongCoSo: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-sm text-emerald-900"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">VNĐ</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  Hiện hành: <span className="font-bold text-amber-700">{formatVND(currentRules.luongCoSo)}</span> (NĐ 73/2024/NĐ-CP)
                </div>
              </div>

              {/* Insurance rates */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">% BHXH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRules.tyLeDongBHXH}
                    onChange={(e) =>
                      setCurrentRules({ ...currentRules, tyLeDongBHXH: Number(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">% BHYT</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRules.tyLeDongBHYT}
                    onChange={(e) =>
                      setCurrentRules({ ...currentRules, tyLeDongBHYT: Number(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">% BHTN</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRules.tyLeDongBHTN}
                    onChange={(e) =>
                      setCurrentRules({ ...currentRules, tyLeDongBHTN: Number(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Standard Holding Period (Thời gian giữ bậc chuẩn) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Shield className="w-4 h-4 text-emerald-700" />
              2. Thời hạn giữ bậc quy định (Tháng)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ngạch Cao cấp (Nhóm 1, Nhóm 2)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentRules.soThangGiuBacCaoCap}
                    onChange={(e) =>
                      setCurrentRules({
                        ...currentRules,
                        soThangGiuBacCaoCap: Number(e.target.value) || 36,
                      })
                    }
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                  />
                  <span className="text-slate-500">tháng ({currentRules.soThangGiuBacCaoCap / 12} năm)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ngạch Trung cấp (Nhóm 1, Nhóm 2)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentRules.soThangGiuBacTrungCap}
                    onChange={(e) =>
                      setCurrentRules({
                        ...currentRules,
                        soThangGiuBacTrungCap: Number(e.target.value) || 36,
                      })
                    }
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                  />
                  <span className="text-slate-500">tháng ({currentRules.soThangGiuBacTrungCap / 12} năm)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ngạch Sơ cấp
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentRules.soThangGiuBacSoCap}
                    onChange={(e) =>
                      setCurrentRules({
                        ...currentRules,
                        soThangGiuBacSoCap: Number(e.target.value) || 24,
                      })
                    }
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                  />
                  <span className="text-slate-500">tháng ({currentRules.soThangGiuBacSoCap / 12} năm)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seniority & Beyond-Grade Rules */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Award className="w-4 h-4 text-emerald-700" />
              3. Phụ cấp Thâm niên & Vượt khung
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">Thâm niên nghề Quân đội:</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Bắt đầu tính sau:</span>
                  <span className="font-bold text-slate-800 font-mono">{currentRules.thoiHanThamNienBatDauNam} năm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tỷ lệ khởi điểm (đủ 5 năm):</span>
                  <span className="font-bold text-slate-800 font-mono">{currentRules.mucHuongThamNienKhoiDiem}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mỗi năm tiếp theo cộng:</span>
                  <span className="font-bold text-slate-800 font-mono">+{currentRules.moiNamThamNienThem}%</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">Thâm niên vượt khung (Kịch bậc):</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mức hưởng năm đầu tiên:</span>
                  <span className="font-bold text-purple-800 font-mono">{currentRules.mucVuotKhungNamDau}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mỗi năm giữ kịch bậc thêm:</span>
                  <span className="font-bold text-purple-800 font-mono">+{currentRules.moiNamVuotKhungThem}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Salary Scales (Bảng Hệ Số Ngạch - Bậc) & Reward/Discipline Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Salary Scale Table with Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bảng Hệ Số Lương Theo Từng Ngạch QNCN
                </h3>
                <p className="text-xs text-slate-500">
                  Sửa đổi trực tiếp hệ số của từng bậc lương, thêm bậc mới hoặc xóa bậc
                </p>
              </div>
              <button
                onClick={() => handleAddStep(selectedScale.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Bậc {selectedScale.danhSachBac.length + 1}
              </button>
            </div>

            {/* Scale Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1 text-xs">
              {currentScales.map((scale) => (
                <button
                  key={scale.id}
                  onClick={() => setActiveScaleTab(scale.id)}
                  className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeScaleTab === scale.id
                      ? 'bg-white text-emerald-900 font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {scale.tenNgach}
                </button>
              ))}
            </div>

            {/* Scale Steps Table */}
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {selectedScale.tenNgach} • Bậc tối đa: <span className="font-bold text-emerald-800 font-mono">{selectedScale.bacToiDa}</span>
                </span>
                <span className="text-slate-400">Niên hạn giữ bậc: {selectedScale.soNamGiuBacChuan} năm</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedScale.danhSachBac.map((step, idx) => {
                  const monthlyMoney = Math.round(step.heSo * currentRules.luongCoSo);
                  return (
                    <div
                      key={step.bac}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-500 transition-all space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">
                          Bậc {step.bac}
                        </span>
                        {idx === selectedScale.danhSachBac.length - 1 && selectedScale.danhSachBac.length > 1 && (
                          <button
                            onClick={() => handleRemoveStep(selectedScale.id, step.bac)}
                            title="Xóa bậc cao nhất này"
                            className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
                          Hệ số
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={step.heSo}
                          onChange={(e) =>
                            handleStepCoefficientChange(selectedScale.id, idx, Number(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold text-emerald-800 text-xs bg-white"
                        />
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        = {formatVND(monthlyMoney)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reward & Discipline Rules Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rewards (Nâng trước thời hạn) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Khen thưởng (Nâng trước hạn)
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentRules.quyDinhNangTruocHan.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-amber-950">{r.danhHieu}</div>
                      <div className="text-[11px] text-amber-800">
                        Rút ngắn: <strong className="font-mono">{r.soThangRutNgan} tháng</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRewardRule(r.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add reward rule input */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Tên danh hiệu khen thưởng..."
                  value={newReward.danhHieu}
                  onChange={(e) => setNewReward({ ...newReward, danhHieu: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <select
                    value={newReward.soThangRutNgan}
                    onChange={(e) => setNewReward({ ...newReward, soThangRutNgan: Number(e.target.value) })}
                    className="w-32 px-2 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value={6}>Rút 6 tháng</option>
                    <option value={9}>Rút 9 tháng</option>
                    <option value={12}>Rút 12 tháng</option>
                  </select>
                  <button
                    onClick={handleAddRewardRule}
                    className="flex-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm quy định
                  </button>
                </div>
              </div>
            </div>

            {/* Discipline (Kéo dài thời hạn) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Kỷ luật (Kéo dài thời hạn)
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentRules.quyDinhKyLuat.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-rose-950">{d.hinhThuc}</div>
                      <div className="text-[11px] text-rose-800">
                        Kéo dài thêm: <strong className="font-mono">{d.soThangKeoDai} tháng</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDiscRule(d.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add discipline rule input */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Hình thức kỷ luật mới..."
                  value={newDisc.hinhThuc}
                  onChange={(e) => setNewDisc({ ...newDisc, hinhThuc: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <select
                    value={newDisc.soThangKeoDai}
                    onChange={(e) => setNewDisc({ ...newDisc, soThangKeoDai: Number(e.target.value) })}
                    className="w-32 px-2 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value={6}>Kéo dài 6T</option>
                    <option value={12}>Kéo dài 12T</option>
                  </select>
                  <button
                    onClick={handleAddDiscRule}
                    className="flex-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm quy định
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
