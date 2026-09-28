import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Users,
  Shield,
  Award,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Lock,
  Building,
  Stamp,
  Edit3,
} from 'lucide-react';
import {
  SalaryReviewCycle,
  CouncilMember,
  QNCNProfile,
} from '../../types';
import { DecisionDocumentModal } from './DecisionDocumentModal';
import { SchoolLogo } from '../common/SchoolLogo';

interface ApprovalWorkflowViewProps {
  cycles: SalaryReviewCycle[];
  qncnList: QNCNProfile[];
  onSaveCycle: (cycle: SalaryReviewCycle) => void;
  onApplyApprovedPromotion: (cycle: SalaryReviewCycle) => void;
}

export const ApprovalWorkflowView: React.FC<ApprovalWorkflowViewProps> = ({
  cycles,
  qncnList,
  onSaveCycle,
  onApplyApprovedPromotion,
}) => {
  const [selectedCycleId, setSelectedCycleId] = useState<string>(cycles[0]?.id || '');
  const [showDocModal, setShowDocModal] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState<'totrinh' | 'tongcuc' | 'trichsao'>('totrinh');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  const cycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0];

  if (!cycle) {
    return (
      <div className="p-8 bg-white rounded-xl text-center text-slate-500">
        Chưa có đợt xét nào trong hệ thống. Vui lòng tạo đợt xét trước.
      </div>
    );
  }

  const approvedCount = cycle.danhSachDeXuat.filter((i) => i.trangThaiPheDuyet === 'Đã duyệt').length;
  const rejectedCount = cycle.danhSachDeXuat.filter((i) => i.trangThaiPheDuyet === 'Từ chối').length;
  const pendingCount = cycle.danhSachDeXuat.filter((i) => i.trangThaiPheDuyet === 'Chờ duyệt').length;

  const steps = [
    { label: '1. Đơn vị cơ sở đề xuất', key: 'Đơn vị đề xuất' },
    { label: '2. Ban Quân lực rà soát thẩm định', key: 'Ban Quân lực rà soát' },
    { label: '3. Hội đồng Lương họp xét & Lập tờ trình', key: 'Hội đồng Lương xét duyệt' },
    { label: '4. Trình Thủ trưởng Tổng cục Hậu cần phê duyệt', key: 'Trình Tổng cục Hậu cần phê duyệt' },
    { label: '5. Hiệu trưởng duyệt Bản Trích sao thi hành', key: 'Hiệu trưởng duyệt Bản Trích sao' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === cycle.trangThai);

  const handleMemberVote = (index: number, vote: boolean) => {
    const newMembers = [...cycle.thanhVienHoiDong];
    newMembers[index] = { ...newMembers[index], dongY: vote };
    const updated = { ...cycle, thanhVienHoiDong: newMembers };
    onSaveCycle(updated);
  };

  const handleMemberComment = (index: number, text: string) => {
    const newMembers = [...cycle.thanhVienHoiDong];
    newMembers[index] = { ...newMembers[index], yKien: text };
    const updated = { ...cycle, thanhVienHoiDong: newMembers };
    onSaveCycle(updated);
  };

  const handleAdvanceStage = (nextState: any) => {
    const updated = { ...cycle, trangThai: nextState };
    onSaveCycle(updated);
  };

  const handleOpenDocModal = (tab: 'totrinh' | 'tongcuc' | 'trichsao') => {
    setModalDefaultTab(tab);
    setShowDocModal(true);
  };

  const handleUpdateCycleDocuments = (
    updatedToTrinh: any,
    updatedQd: any,
    updatedTs: any,
    scope: any
  ) => {
    const updated = {
      ...cycle,
      toTrinh: updatedToTrinh,
      quyetDinh: updatedQd,
      trichSao: updatedTs,
      loaiCheDo: scope,
    };
    onSaveCycle(updated);
  };

  const handleFinalizeAndPublish = () => {
    const qdNum = cycle.quyetDinh?.soQuyetDinh || '318/QĐ-TCHC';
    const tsNum = cycle.trichSao?.soTrichSao || '52/TS-HC2';
    if (
      window.confirm(
        `XÁC NHẬN HIỆU TRƯỞNG DUYỆT BẢN TRÍCH SAO THI HÀNH?\n\nCăn cứ Quyết định số ${qdNum} của Thủ trưởng Tổng cục Hậu cần:\n1. Hiệu trưởng Trường CĐ Hậu cần 2 ký duyệt Bản Trích sao số ${tsNum}\n2. Tự động cập nhật Bậc lương mới, Hệ số mới và Ngày hưởng mới vào Hồ sơ ${approvedCount} quân nhân trong cơ sở dữ liệu!\n3. Chuyển Ban Tài chính lập chứng từ chi trả tiền lương mới.`
      )
    ) {
      onApplyApprovedPromotion(cycle);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SchoolLogo size={52} className="ring-2 ring-emerald-700/30" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
              Quy Trình Duyệt Nâng Bậc Lương & Ban Hành Bản Trích Sao
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hồ sơ gửi Tổng cục Hậu cần xem xét & phê duyệt ➔ Sau đó Hiệu trưởng duyệt thành Bản Trích sao chi trả
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tenDot}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleOpenDocModal('totrinh')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            1. Tờ trình Tổng cục duyệt
          </button>

          <button
            onClick={() => handleOpenDocModal('tongcuc')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Building className="w-4 h-4 text-amber-300" />
            2. Quyết định Tổng cục
          </button>

          <button
            onClick={() => handleOpenDocModal('trichsao')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Stamp className="w-4 h-4 text-amber-100" />
            3. Bản Trích sao Đơn vị
          </button>
        </div>
      </div>

      {/* 2-Decision Military Workflow Notice Card */}
      <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 flex-shrink-0 mt-0.5">
            <Stamp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              Thể thức hành chính Quân đội: Tờ trình phê duyệt • Quyết định Tổng cục • Bản Trích sao Đơn vị
            </h4>
            <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
              Theo quy định phân cấp: <strong>Thủ trưởng Tổng cục Hậu cần</strong> là cấp có thẩm quyền phê duyệt Tờ trình và ký Quyết định nâng bậc lương. Sau khi có Quyết định từ Tổng cục gửi về Trường, <strong>Hiệu trưởng Trường Cao Đẳng Hậu cần 2</strong> duyệt ký <strong>BẢN TRÍCH SAO QUYẾT ĐỊNH</strong> để Ban Tài chính chi trả và lưu vào hồ sơ cán bộ.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <button
            onClick={() => handleOpenDocModal('totrinh')}
            className="px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold border border-blue-600 transition-colors"
          >
            1. Tờ trình Tổng cục
          </button>
          <button
            onClick={() => handleOpenDocModal('tongcuc')}
            className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-600 transition-colors"
          >
            2. Quyết định Tổng cục
          </button>
          <button
            onClick={() => handleOpenDocModal('trichsao')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold transition-colors shadow-sm"
          >
            3. Bản Trích sao
          </button>
        </div>
      </div>

      {/* Military Approval Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tiến trình thẩm định & ban hành: {cycle.tenDot}
          </h3>
          <span className="text-xs font-semibold text-emerald-800 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            {cycle.trangThai}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const isCompleted = idx <= (currentStepIndex === -1 ? 0 : currentStepIndex);
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border text-xs transition-all relative ${
                  isCurrent
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/40'
                    : isCompleted
                    ? 'bg-emerald-50/80 text-emerald-950 border-emerald-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold opacity-80">Bước {idx + 1}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="font-bold text-xs leading-snug">{step.label}</div>
              </div>
            );
          })}
        </div>

        {/* Action bar for changing workflow stage */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Trạng thái:</span>
            <span className="font-bold text-emerald-900 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300">
              {cycle.trangThai}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {cycle.trangThai !== 'Đã ban hành Quyết định' && cycle.trangThai !== 'Hiệu trưởng duyệt Bản Trích sao' ? (
              <>
                <button
                  onClick={() => handleAdvanceStage('Hội đồng Lương xét duyệt')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Hội đồng thẩm định
                </button>
                <button
                  onClick={() => handleAdvanceStage('Trình Tổng cục Hậu cần phê duyệt')}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold transition-colors flex items-center gap-1"
                >
                  <Building className="w-3.5 h-3.5" />
                  Trình Tổng cục Hậu cần
                </button>
                <button
                  onClick={() => handleAdvanceStage('Hiệu trưởng duyệt Bản Trích sao')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold shadow-xs transition-colors flex items-center gap-1"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  Đã nhận QĐ Tổng cục ➔ Ký Trích sao
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFinalizeAndPublish}
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  Hiệu trưởng ký duyệt Bản Trích sao & Áp dụng lương mới ({approvedCount} QNCN)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Council Members & 2 Document Metadata Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Council Members & Voting */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                Thành Viên Hội Đồng Xét Nâng Bậc Lương Trường
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận ý kiến biểu quyết và thẩm định của từng thành viên hội đồng trước khi lập tờ trình gửi Tổng cục
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Tán thành: {cycle.thanhVienHoiDong.filter((m) => m.dongY).length} / {cycle.thanhVienHoiDong.length}
            </div>
          </div>

          <div className="space-y-3">
            {cycle.thanhVienHoiDong.map((member, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{member.hoTen}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {member.vaiTro}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{member.chucVu}</div>
                  </div>

                  {/* Vote toggle */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMemberVote(idx, true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        member.dongY === true
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600 hover:bg-emerald-100'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Nhất trí
                    </button>
                    <button
                      onClick={() => handleMemberVote(idx, false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        member.dongY === false
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600 hover:bg-rose-100'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Không
                    </button>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <input
                    type="text"
                    placeholder="Ý kiến nhận xét của thành viên..."
                    value={member.yKien || ''}
                    onChange={(e) => handleMemberComment(idx, e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: 3 Document Metadata Details */}
        <div className="space-y-4">
          {/* Document 1: Tờ trình trình Tổng cục phê duyệt */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-xs p-5 space-y-3 bg-blue-50/20">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                1. Tờ trình gửi Tổng cục phê duyệt
              </h4>
              <button
                onClick={() => handleOpenDocModal('totrinh')}
                className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Mở bản in
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Số Tờ trình:</span>
                <span className="font-bold text-blue-900 font-mono">{cycle.toTrinh?.soToTrinh || '89/TTr-HC2'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị trình:</span>
                <span className="font-semibold text-slate-800">{cycle.toTrinh?.donViTrinh || 'Trường Cao Đẳng Hậu cần 2'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người ký trình:</span>
                <span className="font-medium text-slate-800">{cycle.toTrinh?.nguoiKyTrinh || 'Đại tá Trần Hữu Nghĩa'}</span>
              </div>
              <div className="flex justify-between bg-amber-50 p-1.5 rounded border border-amber-200">
                <span className="text-amber-900 font-bold">Thủ trưởng Tổng cục duyệt:</span>
                <span className="font-black text-amber-900">{cycle.toTrinh?.nguoiPheDuyet || 'Trung tướng Nguyễn Văn Điều'}</span>
              </div>
            </div>
          </div>

          {/* Document 2: Quyết định Tổng cục Card */}
          <div className="bg-white rounded-xl border border-emerald-200 shadow-xs p-5 space-y-3 bg-emerald-50/20">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-700" />
                2. Quyết định Tổng cục Hậu cần
              </h4>
              <button
                onClick={() => handleOpenDocModal('tongcuc')}
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Mở bản in
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Số Quyết định Tổng cục:</span>
                <span className="font-bold text-emerald-800 font-mono">{cycle.quyetDinh?.soQuyetDinh || '318/QĐ-TCHC'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày ký Tổng cục:</span>
                <span className="font-mono text-slate-800">{cycle.quyetDinh?.ngayKy || '2026-03-24'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người ký Tổng cục:</span>
                <span className="font-medium text-slate-800">{cycle.quyetDinh?.nguoiKy || 'Trung tướng Nguyễn Văn Điều'}</span>
              </div>
            </div>
          </div>

          {/* Document 3: Bản Trích sao Đơn vị Card */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-xs p-5 space-y-3 bg-amber-50/30">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-amber-600" />
                3. Bản Trích sao Trường CĐHC2
              </h4>
              <button
                onClick={() => handleOpenDocModal('trichsao')}
                className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Mở bản in
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Số Bản Trích sao:</span>
                <span className="font-bold text-amber-900 font-mono">{cycle.trichSao?.soTrichSao || '52/TS-HC2'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày sao:</span>
                <span className="font-mono text-slate-800">{cycle.trichSao?.ngaySao || '2026-03-28'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người ký chứng thực:</span>
                <span className="font-bold text-slate-800">{cycle.trichSao?.nguoiKySao || 'Đại tá Trần Hữu Nghĩa'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chức danh:</span>
                <span className="font-medium text-slate-700">Hiệu trưởng</span>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-900">
              * Ban Tài chính căn cứ Bản Trích sao này để lập bảng lương chi trả thực lĩnh mới.
            </div>
          </div>

          {/* Review Results Metric Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Tổng kết hồ sơ đợt này
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-emerald-50 text-emerald-900">
                <span>Hồ sơ đủ điều kiện (Đã duyệt):</span>
                <span className="font-bold font-mono">{approvedCount} đ/c</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-amber-50 text-amber-900">
                <span>Hồ sơ chờ xem xét:</span>
                <span className="font-bold font-mono">{pendingCount} đ/c</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-rose-50 text-rose-900">
                <span>Hồ sơ chưa đạt / Từ chối:</span>
                <span className="font-bold font-mono">{rejectedCount} đ/c</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision and Trích Sao Document Modal */}
      <DecisionDocumentModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        cycle={cycle}
        defaultTab={modalDefaultTab}
        onUpdateCycleDocuments={handleUpdateCycleDocuments}
      />
    </div>
  );
};
