import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Droplets,
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
      {/* Top Banner & Save Action in Neumorphic Card */}
      <div className="neu-flat rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-700" />
              Thiết Lập Quy Chế & Bảng Hệ Số Lương (Nhập Tay 100%)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black neu-amber text-slate-950">
              Soft UI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Tự do thay đổi mức lương cơ sở, chu kỳ giữ bậc, bảng hệ số lương và quy chế khen thưởng / kỷ luật
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleResetRulesToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl neu-convex text-slate-700 font-bold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục chuẩn BQP
          </motion.button>
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl neu-emerald text-white font-black text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4 text-amber-300" />
            Lưu toàn bộ thiết lập
          </motion.button>
        </div>
      </div>

      {savedToast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 neu-flat rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900 border-l-4 border-emerald-600"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Đã lưu thành công các thông số và bảng hệ số mới vào hệ thống!
        </motion.div>
      )}

      {/* Grid: 2 sections (Parameters & Scales) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General Rules & Manual Parameters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Base Salary Card */}
          <div className="neu-flat rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-300/60">
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
                    className="w-full px-3.5 py-2 neu-input rounded-2xl font-mono font-black text-sm text-emerald-950"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">VNĐ</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                  Hiện hành: <span className="font-black text-amber-700">{formatVND(currentRules.luongCoSo)}</span> (NĐ 73/2024/NĐ-CP)
                </div>
              </div>

              {/* Insurance rates */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-300/50">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">% BHXH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRules.tyLeDongBHXH}
                    onChange={(e) =>
                      setCurrentRules({ ...currentRules, tyLeDongBHXH: Number(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 neu-input rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">% BHYT</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRules.tyLeDongBHYT}
                    onChange={(e) =>
                      setCurrentRules({ ...currentRules, tyLeDongBHYT: Number(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 neu-input rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">% BHTN</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRules.tyLeDongBHTN}
                    onChange={(e) =>
                      setCurrentRules({ ...currentRules, tyLeDongBHTN: Number(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 neu-input rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Standard Holding Period (Thời gian giữ bậc chuẩn) */}
          <div className="neu-flat rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-300/60">
              <Shield className="w-4 h-4 text-emerald-700" />
              2. Thời hạn giữ bậc quy định (Tháng)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
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
                    className="w-24 px-3 py-1.5 neu-input rounded-xl font-mono font-black text-xs"
                  />
                  <span className="text-slate-500 font-semibold">tháng ({currentRules.soThangGiuBacCaoCap / 12} năm)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
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
                    className="w-24 px-3 py-1.5 neu-input rounded-xl font-mono font-black text-xs"
                  />
                  <span className="text-slate-500 font-semibold">tháng ({currentRules.soThangGiuBacTrungCap / 12} năm)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
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
                    className="w-24 px-3 py-1.5 neu-input rounded-xl font-mono font-black text-xs"
                  />
                  <span className="text-slate-500 font-semibold">tháng ({currentRules.soThangGiuBacSoCap / 12} năm)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seniority & Beyond-Grade Rules */}
          <div className="neu-flat rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-300/60">
              <Award className="w-4 h-4 text-emerald-700" />
              3. Phụ cấp Thâm niên & Vượt khung
            </h3>

            <div className="space-y-3 text-xs">
              <div className="neu-pressed p-3 rounded-2xl space-y-2">
                <span className="font-black text-slate-900 block text-[11px]">Thâm niên nghề Quân đội:</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Bắt đầu tính sau:</span>
                  <span className="font-black text-slate-900 font-mono">{currentRules.thoiHanThamNienBatDauNam} năm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tỷ lệ khởi điểm (đủ 5 năm):</span>
                  <span className="font-black text-slate-900 font-mono">{currentRules.mucHuongThamNienKhoiDiem}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Mỗi năm tiếp theo cộng:</span>
                  <span className="font-black text-slate-900 font-mono">+{currentRules.moiNamThamNienThem}%</span>
                </div>
              </div>

              <div className="neu-pressed p-3 rounded-2xl space-y-2">
                <span className="font-black text-slate-900 block text-[11px]">Thâm niên vượt khung (Kịch bậc):</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Mức hưởng năm đầu tiên:</span>
                  <span className="font-black text-purple-900 font-mono">{currentRules.mucVuotKhungNamDau}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Mỗi năm giữ kịch bậc thêm:</span>
                  <span className="font-black text-purple-900 font-mono">+{currentRules.moiNamVuotKhungThem}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Salary Scales (Bảng Hệ Số Ngạch - Bậc) & Reward/Discipline Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Salary Scale Table with Liquid Tabs */}
          <div className="neu-flat rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-300/60">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Bảng Hệ Số Lương Theo Từng Ngạch QNCN
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Sửa đổi trực tiếp hệ số của từng bậc lương, thêm bậc mới hoặc xóa bậc
                </p>
              </div>
              <motion.button
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAddStep(selectedScale.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl neu-emerald text-white font-bold text-xs transition-colors self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Bậc {selectedScale.danhSachBac.length + 1}
              </motion.button>
            </div>

            {/* Liquid-style Scale Tabs in Neumorphic Well */}
            <div className="neu-pressed rounded-2xl p-1.5 flex gap-1 overflow-x-auto text-xs">
              {currentScales.map((scale) => (
                <button
                  key={scale.id}
                  onClick={() => setActiveScaleTab(scale.id)}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all outline-none ${
                    activeScaleTab === scale.id
                      ? 'neu-convex text-emerald-950 font-black shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {scale.tenNgach}
                </button>
              ))}
            </div>

            {/* Scale Steps Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-extrabold text-slate-800">
                  {selectedScale.tenNgach} • Bậc tối đa: <span className="font-black text-emerald-900 font-mono">{selectedScale.bacToiDa}</span>
                </span>
                <span className="text-slate-500 font-medium">Niên hạn giữ bậc: {selectedScale.soNamGiuBacChuan} năm</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedScale.danhSachBac.map((step, idx) => {
                  const monthlyMoney = Math.round(step.heSo * currentRules.luongCoSo);
                  return (
                    <motion.div
                      key={step.bac}
                      whileHover={{ y: -2 }}
                      className="p-3.5 rounded-2xl neu-convex space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs">
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
                        <label className="block text-[10px] text-slate-500 uppercase font-black mb-0.5">
                          Hệ số
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={step.heSo}
                          onChange={(e) =>
                            handleStepCoefficientChange(selectedScale.id, idx, Number(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 neu-input rounded-xl font-mono font-black text-emerald-950 text-xs"
                        />
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono truncate font-semibold">
                        = {formatVND(monthlyMoney)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reward & Discipline Rules Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rewards (Nâng trước thời hạn) */}
            <div className="neu-flat rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Khen thưởng (Nâng trước hạn)
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentRules.quyDinhNangTruocHan.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 neu-pressed rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-amber-950">{r.danhHieu}</div>
                      <div className="text-[11px] text-amber-800">
                        Rút ngắn: <strong className="font-mono font-black">{r.soThangRutNgan} tháng</strong>
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
              <div className="pt-2 border-t border-slate-300/50 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Tên danh hiệu khen thưởng..."
                  value={newReward.danhHieu}
                  onChange={(e) => setNewReward({ ...newReward, danhHieu: e.target.value })}
                  className="w-full px-3 py-1.5 neu-input rounded-xl font-medium"
                />
                <div className="flex gap-2">
                  <select
                    value={newReward.soThangRutNgan}
                    onChange={(e) => setNewReward({ ...newReward, soThangRutNgan: Number(e.target.value) })}
                    className="w-32 px-2.5 py-1.5 neu-input rounded-xl font-bold"
                  >
                    <option value={6}>Rút 6 tháng</option>
                    <option value={9}>Rút 9 tháng</option>
                    <option value={12}>Rút 12 tháng</option>
                  </select>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddRewardRule}
                    className="flex-1 px-3 py-1.5 neu-amber text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm quy định
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Discipline (Kéo dài thời hạn) */}
            <div className="neu-flat rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Kỷ luật (Kéo dài thời hạn)
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentRules.quyDinhKyLuat.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 neu-pressed rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-rose-950">{d.hinhThuc}</div>
                      <div className="text-[11px] text-rose-800">
                        Kéo dài thêm: <strong className="font-mono font-black">{d.soThangKeoDai} tháng</strong>
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
              <div className="pt-2 border-t border-slate-300/50 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Hình thức kỷ luật mới..."
                  value={newDisc.hinhThuc}
                  onChange={(e) => setNewDisc({ ...newDisc, hinhThuc: e.target.value })}
                  className="w-full px-3 py-1.5 neu-input rounded-xl font-medium"
                />
                <div className="flex gap-2">
                  <select
                    value={newDisc.soThangKeoDai}
                    onChange={(e) => setNewDisc({ ...newDisc, soThangKeoDai: Number(e.target.value) })}
                    className="w-32 px-2.5 py-1.5 neu-input rounded-xl font-bold"
                  >
                    <option value={6}>Kéo dài 6T</option>
                    <option value={12}>Kéo dài 12T</option>
                  </select>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddDiscRule}
                    className="flex-1 px-3 py-1.5 neu-rose text-white font-black rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm quy định
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
