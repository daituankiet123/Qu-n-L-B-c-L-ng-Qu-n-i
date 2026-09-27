import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Download,
  Building,
  Stamp,
  Edit3,
  Save,
  RotateCcw,
  Sliders,
  ChevronDown,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  SalaryReviewCycle,
  QuyetDinhTongCucInfo,
  TrichSaoDonViInfo,
  ReviewAllowanceScope,
} from '../../types';
import { formatVND } from '../../services/salaryCalculator';
import { SchoolLogo } from '../common/SchoolLogo';

interface DecisionDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: SalaryReviewCycle;
  defaultTab?: 'tongcuc' | 'trichsao';
  onUpdateCycleDocuments?: (
    updatedQd: QuyetDinhTongCucInfo,
    updatedTs: TrichSaoDonViInfo,
    scope: ReviewAllowanceScope
  ) => void;
}

export const DecisionDocumentModal: React.FC<DecisionDocumentModalProps> = ({
  isOpen,
  onClose,
  cycle,
  defaultTab = 'tongcuc',
  onUpdateCycleDocuments,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'tongcuc' | 'trichsao'>(defaultTab);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allowanceScope, setAllowanceScope] = useState<ReviewAllowanceScope>(
    cycle.loaiCheDo || 'Tổng hợp cả 3 chế độ'
  );

  // Editable state for Document 1 (Quyết định của Tổng cục Hậu cần)
  const [qdData, setQdData] = useState<QuyetDinhTongCucInfo>({
    soQuyetDinh: cycle.quyetDinh?.soQuyetDinh || '318/QĐ-TCHC',
    ngayKy: cycle.quyetDinh?.ngayKy || '2026-03-24',
    chucDanhNguoiKy: cycle.quyetDinh?.chucDanhNguoiKy || 'THỦ TRƯỞNG TỔNG CỤC HẬU CẦN',
    chucVuNguoiKy: cycle.quyetDinh?.chucVuNguoiKy || 'Chủ nhiệm Tổng cục Hậu cần',
    capBacNguoiKy: cycle.quyetDinh?.capBacNguoiKy || 'Trung tướng',
    nguoiKy: cycle.quyetDinh?.nguoiKy || 'Nguyễn Văn Điều',
    coQuanCapTren: cycle.quyetDinh?.coQuanCapTren || 'BỘ QUỐC PHÒNG',
    coQuanBanHanh: cycle.quyetDinh?.coQuanBanHanh || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT',
    trichYeu:
      cycle.quyetDinh?.trichYeu ||
      'Về việc nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp các đơn vị trực thuộc Tổng cục Hậu cần Đợt 1 năm 2026',
    canCu: cycle.quyetDinh?.canCu || [
      'Căn cứ Luật Quân nhân chuyên nghiệp, công nhân và viên chức quốc phòng năm 2015;',
      'Căn cứ Nghị định số 204/2004/NĐ-CP và Nghị định số 73/2024/NĐ-CP của Chính phủ;',
      'Căn cứ Thông tư số 170/2016/TT-BQP của Bộ Quốc phòng quy định cấp bậc quân hàm QNCN tương ứng với mức lương;',
      'Xét đề nghị của Hiệu trưởng Trường Cao Đẳng Hậu cần 2 tại Tờ trình số 89/TTr-HC2 ngày 15/03/2026 và đề nghị của Cục trưởng Cục Cán bộ.',
    ],
    dieu1:
      cycle.quyetDinh?.dieu1 ||
      'Nâng bậc lương, nâng phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp thuộc Trường Cao Đẳng Hậu cần 2 (có danh sách kèm theo).',
    dieu2:
      cycle.quyetDinh?.dieu2 ||
      'Các đồng chí có tên tại Điều 1 được hưởng chế độ tiền lương và phụ cấp mới kể từ ngày ghi trong danh sách trích ngang kèm theo Quyết định này. Thời gian xét nâng bậc lần sau tính từ ngày hưởng mới.',
    dieu3:
      cycle.quyetDinh?.dieu3 ||
      'Cục trưởng Cục Cán bộ, Cục trưởng Cục Quân sự, Cục trưởng Cục Tài chính, Hiệu trưởng Trường Cao Đẳng Hậu cần 2 và các đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.',
    noiNhan: cycle.quyetDinh?.noiNhan || [
      'Bộ Tư lệnh Tổng cục Hậu cần;',
      'Trường Cao Đẳng Hậu cần 2 (để trích sao và thực hiện);',
      'Cục Cán bộ, Cục Quân lực, Cục Tài chính;',
      'Lưu: VT, CB.',
    ],
  });

  // Editable state for Document 2 (Bản Trích sao của Trường CĐ Hậu cần 2)
  const [tsData, setTsData] = useState<TrichSaoDonViInfo>({
    soTrichSao: cycle.trichSao?.soTrichSao || '52/TS-HC2',
    ngaySao: cycle.trichSao?.ngaySao || '2026-03-28',
    chucDanhKySao: cycle.trichSao?.chucDanhKySao || 'HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
    nguoiKySao: cycle.trichSao?.nguoiKySao || 'Đại tá Trần Hữu Nghĩa',
    coQuanCapTren: cycle.trichSao?.coQuanCapTren || 'BỘ QUỐC PHÒNG',
    coQuanTongCuc: cycle.trichSao?.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT',
    donViSao: cycle.trichSao?.donViSao || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
    chungThuc:
      cycle.trichSao?.chungThuc ||
      'Sao y bản chính Quyết định số 318/QĐ-TCHC ngày 24 tháng 03 năm 2026 của Thủ trưởng Tổng cục Hậu cần để các cơ quan, khoa giáo viên, đơn vị trực thuộc Trường Cao Đẳng Hậu cần 2 và cá nhân liên quan thi hành.',
    dieu1Trích:
      cycle.trichSao?.dieu1Trích ||
      'Nâng bậc lương, nâng phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp thuộc Trường Cao Đẳng Hậu cần 2 (có danh sách trích sao kèm theo).',
    dieu2Trích:
      cycle.trichSao?.dieu2Trích ||
      'Các đồng chí có tên tại Điều 1 được hưởng bậc lương mới, hệ số lương mới và phụ cấp kể từ ngày ghi trong danh sách trích sao. Ban Tài chính Trường Cao Đẳng Hậu cần 2 thực hiện tính toán chi trả các chế độ tiền lương mới theo quy định.',
    dieu3Trích:
      cycle.trichSao?.dieu3Trích ||
      'Hiệu trưởng Trường Cao Đẳng Hậu cần 2, Trưởng phòng Chính trị, Trưởng ban Quân lực, Trưởng ban Tài chính, Chỉ huy các cơ quan, đơn vị có liên quan và các đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.',
    noiNhanSao: cycle.trichSao?.noiNhanSao || [
      'Phòng Chính trị (để theo dõi);',
      'Ban Tài chính (để lập dự toán và chi trả lương mới);',
      'Ban Quân lực (để quản lý hồ sơ QNCN);',
      'Các khoa, phòng, ban trực thuộc có quân nhân được nâng lương;',
      'Lưu vào Hồ sơ cán bộ của từng quân nhân;',
      'Lưu: VT, QL.',
    ],
  });

  if (!isOpen) return null;

  const approvedList = cycle.danhSachDeXuat.filter(
    (i) => i.trangThaiPheDuyet === 'Đã duyệt'
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const elId = activeDocTab === 'tongcuc' ? 'doc-tongcuc-content' : 'doc-trichsao-content';
    const text = document.getElementById(elId)?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveTemplateChanges = () => {
    if (onUpdateCycleDocuments) {
      onUpdateCycleDocuments(qdData, tsData, allowanceScope);
    }
    setIsEditing(false);
    alert('Đã lưu mẫu in thành công!');
  };

  const handleScopeChange = (newScope: ReviewAllowanceScope) => {
    setAllowanceScope(newScope);
    // Auto adjust trichYeu if default
    if (newScope === 'Phụ cấp thâm niên nghề') {
      setQdData((prev) => ({
        ...prev,
        trichYeu: 'Về việc nâng mức hưởng phụ cấp thâm niên nghề đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
    } else if (newScope === 'Phụ cấp thâm niên vượt khung') {
      setQdData((prev) => ({
        ...prev,
        trichYeu: 'Về việc nâng phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
    } else if (newScope === 'Nâng bậc lương & Vượt khung') {
      setQdData((prev) => ({
        ...prev,
        trichYeu: 'Về việc nâng bậc lương và phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
    } else {
      setQdData((prev) => ({
        ...prev,
        trichYeu: 'Về việc nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SchoolLogo size={36} className="ring-1 ring-amber-400/40" />
            <div>
              <span className="font-bold text-sm text-white block">
                Hệ Thống In Văn Bản & Bản Trích Sao Quân Đội
              </span>
              <span className="text-[11px] text-emerald-300">
                Thủ trưởng Tổng cục Hậu cần ký Quyết định • Hiệu trưởng duyệt ký Bản Trích sao
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Đóng chế độ sửa' : 'Chỉnh sửa mẫu in'}
            </button>

            {isEditing && (
              <button
                onClick={handleSaveTemplateChanges}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu mẫu in
              </button>
            )}

            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              In Văn Bản
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scope Selector & Document Switcher Tabs (Hidden when printing) */}
        <div className="no-print bg-slate-100 p-2.5 border-b border-slate-200 space-y-2 flex-shrink-0">
          {/* Allowance Scope Dropdown (Nâng bậc lương, Phụ cấp thâm niên, Vượt khung, hoặc Cả 3) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                Áp dụng văn bản cho chế độ:
              </span>
              <select
                value={allowanceScope}
                onChange={(e) => handleScopeChange(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold text-emerald-900 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Tổng hợp cả 3 chế độ">Tổng hợp cả 3 chế độ (Lương + Thâm niên + Vượt khung)</option>
                <option value="Nâng bậc lương & Vượt khung">Chuyên đề Nâng Bậc Lương & Vượt khung</option>
                <option value="Phụ cấp thâm niên nghề">Chuyên đề Phụ cấp Thâm niên nghề Quân đội</option>
                <option value="Phụ cấp thâm niên vượt khung">Chuyên đề Phụ cấp Thâm niên vượt khung</option>
              </select>
            </div>

            <span className="text-[11px] text-slate-500">
              * Tự động điều chỉnh tiêu đề, các điều khoản và bảng dữ liệu phụ lục
            </span>
          </div>

          {/* 2 Document Switcher Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDocTab('tongcuc')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeDocTab === 'tongcuc'
                  ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Building className="w-4 h-4 text-amber-300" />
              <span>1. QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN</span>
              <span className="text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full text-emerald-200">
                Thủ trưởng Tổng cục ký
              </span>
            </button>

            <button
              onClick={() => setActiveDocTab('trichsao')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeDocTab === 'trichsao'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-700'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Stamp className="w-4 h-4 text-amber-200" />
              <span>2. BẢN TRÍCH SAO QUYẾT ĐỊNH (Hiệu trưởng duyệt chi trả)</span>
              <span className="text-[10px] bg-amber-900/60 px-2 py-0.5 rounded-full text-amber-200">
                Hiệu trưởng ký sao y
              </span>
            </button>
          </div>
        </div>

        {/* In-Line Editing Controls Bar (Active when isEditing is true) */}
        {isEditing && (
          <div className="no-print bg-amber-50 p-3 border-b border-amber-200 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3 animate-fadeIn flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <Edit3 className="w-4 h-4 text-amber-700" />
                Đang bật chế độ chỉnh sửa mẫu in:
              </span>
              <span className="text-[11px] text-amber-800">
                Bạn có thể sửa trực tiếp số hiệu, ngày ký, tên người ký, chức danh và nội dung các điều bên dưới.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTemplateChanges}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> Lưu mẫu
              </button>
            </div>
          </div>
        )}

        {/* DOCUMENT 1: QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN */}
        {activeDocTab === 'tongcuc' && (
          <div
            id="doc-tongcuc-content"
            className="p-6 sm:p-10 text-slate-900 overflow-y-auto font-serif leading-relaxed text-sm bg-white flex-1"
          >
            {/* Header Title Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
              <div className="text-center sm:text-left flex items-start gap-3">
                <SchoolLogo size={52} className="hidden sm:inline-block mt-0.5 print-only" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={qdData.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                        onChange={(e) => setQdData({ ...qdData, coQuanCapTren: e.target.value })}
                        className="border border-amber-400 rounded px-1 text-xs"
                      />
                    ) : (
                      qdData.coQuanCapTren || 'BỘ QUỐC PHÒNG'
                    )}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={qdData.coQuanBanHanh || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                        onChange={(e) => setQdData({ ...qdData, coQuanBanHanh: e.target.value })}
                        className="border border-amber-400 rounded px-1 text-xs"
                      />
                    ) : (
                      qdData.coQuanBanHanh || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'
                    )}
                  </div>
                  <div className="text-xs mt-2 font-mono text-slate-700 font-sans flex items-center gap-1">
                    <span>Số:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={qdData.soQuyetDinh}
                        onChange={(e) => setQdData({ ...qdData, soQuyetDinh: e.target.value })}
                        className="border border-amber-400 rounded px-1.5 py-0.5 font-bold font-mono text-xs w-32"
                      />
                    ) : (
                      <strong className="font-bold">{qdData.soQuyetDinh}</strong>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-xs font-bold text-slate-800 underline underline-offset-4 decoration-slate-400">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-xs italic text-slate-600 mt-2 font-sans flex items-center justify-center gap-1">
                  <span>Hà Nội, ngày</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={qdData.ngayKy}
                      onChange={(e) => setQdData({ ...qdData, ngayKy: e.target.value })}
                      className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                    />
                  ) : (
                    <span>
                      {new Date(qdData.ngayKy).getDate()} tháng {new Date(qdData.ngayKy).getMonth() + 1} năm {new Date(qdData.ngayKy).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-300 my-3" />

            {/* Document Name */}
            <div className="text-center my-5 space-y-1">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                QUYẾT ĐỊNH
              </h2>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={qdData.trichYeu}
                  onChange={(e) => setQdData({ ...qdData, trichYeu: e.target.value })}
                  className="w-full text-center text-xs font-bold uppercase border border-amber-400 rounded p-1"
                />
              ) : (
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 max-w-xl mx-auto">
                  {qdData.trichYeu}
                </p>
              )}
            </div>

            {/* Signing Authority */}
            <div className="text-center my-3 font-bold uppercase text-xs tracking-wider">
              {isEditing ? (
                <input
                  type="text"
                  value={qdData.chucDanhNguoiKy}
                  onChange={(e) => setQdData({ ...qdData, chucDanhNguoiKy: e.target.value })}
                  className="text-center font-bold border border-amber-400 rounded px-2 py-0.5 text-xs w-80"
                />
              ) : (
                qdData.chucDanhNguoiKy
              )}
            </div>

            {/* Legal Grounds */}
            <div className="space-y-1 text-xs italic text-slate-700 my-4">
              {qdData.canCu.map((c, i) => (
                <p key={i}>- {c}</p>
              ))}
            </div>

            <div className="text-center font-bold text-xs uppercase tracking-wider my-3">
              QUYẾT ĐỊNH:
            </div>

            {/* Articles */}
            <div className="space-y-3.5 text-xs text-justify">
              <div>
                <strong className="font-bold">Điều 1. </strong>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={qdData.dieu1}
                    onChange={(e) => setQdData({ ...qdData, dieu1: e.target.value })}
                    className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                  />
                ) : (
                  <span>{qdData.dieu1}</span>
                )}
              </div>

              <div>
                <strong className="font-bold">Điều 2. </strong>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={qdData.dieu2}
                    onChange={(e) => setQdData({ ...qdData, dieu2: e.target.value })}
                    className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                  />
                ) : (
                  <span>{qdData.dieu2}</span>
                )}
              </div>

              <div>
                <strong className="font-bold">Điều 3. </strong>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={qdData.dieu3}
                    onChange={(e) => setQdData({ ...qdData, dieu3: e.target.value })}
                    className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                  />
                ) : (
                  <span>{qdData.dieu3}</span>
                )}
              </div>
            </div>

            {/* Signature Block - THỦ TRƯỞNG TỔNG CỤC HẬU CẦN KÝ */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-start gap-6 pt-4">
              <div className="text-[11px] text-slate-600 space-y-1">
                <div className="font-bold italic text-slate-700">Nơi nhận:</div>
                {qdData.noiNhan.map((n, i) => (
                  <div key={i}>- {n}</div>
                ))}
              </div>

              {/* Exact user requirement: Signature must be THỦ TRƯỞNG TỔNG CỤC HẬU CẦN */}
              <div className="text-center min-w-[240px] self-end sm:self-auto">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {qdData.chucDanhNguoiKy}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {qdData.chucVuNguoiKy}
                </div>
                <div className="text-[11px] italic text-slate-500 mb-16">
                  (Ký tên, đóng dấu Tổng cục Hậu cần)
                </div>
                <div className="text-xs font-bold uppercase text-slate-900">
                  {qdData.capBacNguoiKy ? `${qdData.capBacNguoiKy} ` : ''}
                  {qdData.nguoiKy}
                </div>
              </div>
            </div>

            {/* Appendix Table */}
            <div className="mt-12 pt-6 border-t-2 border-slate-300">
              <div className="text-center mb-4 space-y-1">
                <h3 className="text-xs font-bold uppercase text-slate-900">
                  DANH SÁCH QUÂN NHÂN CHUYÊN NGHIỆP TRƯỜNG CAO ĐẲNG HẬU CẦN 2
                  {allowanceScope === 'Phụ cấp thâm niên nghề' && ' ĐƯỢC NÂNG PHỤ CẤP THÂM NIÊN NGHỀ'}
                  {allowanceScope === 'Phụ cấp thâm niên vượt khung' && ' ĐƯỢC NÂNG PHỤ CẤP THÂM NIÊN VƯỢT KHUNG'}
                  {allowanceScope === 'Nâng bậc lương & Vượt khung' && ' ĐƯỢC NÂNG BẬC LƯƠNG & VƯỢT KHUNG'}
                  {allowanceScope === 'Tổng hợp cả 3 chế độ' && ' ĐƯỢC NÂNG BẬC LƯƠNG, THÂM NIÊN VÀ VƯỢT KHUNG'}
                </h3>
                <p className="text-[11px] italic text-slate-600">
                  (Kèm theo Quyết định số {qdData.soQuyetDinh} của Thủ trưởng Tổng cục Hậu cần)
                </p>
              </div>

              <table className="w-full text-left text-[11px] border-collapse border border-slate-400 font-sans">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                    <th className="border border-slate-400 p-2">STT</th>
                    <th className="border border-slate-400 p-2">Họ và tên</th>
                    <th className="border border-slate-400 p-2">Số hiệu</th>
                    <th className="border border-slate-400 p-2">Cấp bậc</th>
                    <th className="border border-slate-400 p-2">Chức vụ - Đơn vị</th>
                    {allowanceScope !== 'Phụ cấp thâm niên nghề' && (
                      <>
                        <th className="border border-slate-400 p-2">Bậc & HS cũ</th>
                        <th className="border border-slate-400 p-2">Bậc & HS mới</th>
                      </>
                    )}
                    {(allowanceScope === 'Phụ cấp thâm niên nghề' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                      <th className="border border-slate-400 p-2">% Thâm niên</th>
                    )}
                    {(allowanceScope === 'Phụ cấp thâm niên vượt khung' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                      <th className="border border-slate-400 p-2">% Vượt khung</th>
                    )}
                    <th className="border border-slate-400 p-2">Ngày hưởng</th>
                    <th className="border border-slate-400 p-2">Hình thức</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedList.map((item, idx) => (
                    <tr key={item.id} className="text-slate-800">
                      <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-400 p-2 font-bold">{item.hoVaTen}</td>
                      <td className="border border-slate-400 p-2 font-mono text-center">{item.maQNCN}</td>
                      <td className="border border-slate-400 p-2 text-center">{item.capBac}</td>
                      <td className="border border-slate-400 p-2">
                        {item.chucVu} - {item.donVi}
                      </td>

                      {allowanceScope !== 'Phụ cấp thâm niên nghề' && (
                        <>
                          <td className="border border-slate-400 p-2 text-center">
                            Bậc {item.bacHienTai} ({item.heSoHienTai.toFixed(2)})
                          </td>
                          <td className="border border-slate-400 p-2 text-center font-bold text-emerald-900">
                            {item.loaiNangLuong === 'Vượt khung'
                              ? `VK ${item.vuotKhungDeXuat}%`
                              : `Bậc ${item.bacDeXuat} (${item.heSoDeXuat.toFixed(2)})`}
                          </td>
                        </>
                      )}

                      {(allowanceScope === 'Phụ cấp thâm niên nghề' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                        <td className="border border-slate-400 p-2 text-center font-mono font-semibold">
                          24%
                        </td>
                      )}

                      {(allowanceScope === 'Phụ cấp thâm niên vượt khung' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                        <td className="border border-slate-400 p-2 text-center font-mono font-bold text-purple-900">
                          {item.vuotKhungDeXuat > 0 ? `${item.vuotKhungDeXuat}%` : '-'}
                        </td>
                      )}

                      <td className="border border-slate-400 p-2 text-center font-mono">
                        {item.ngayHuongMoi}
                      </td>
                      <td className="border border-slate-400 p-2 text-center">
                        {item.loaiNangLuong}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCUMENT 2: BẢN TRÍCH SAO QUYẾT ĐỊNH CỦA HIỆU TRƯỞNG TRƯỜNG CĐ HẬU CẦN 2 */}
        {activeDocTab === 'trichsao' && (
          <div
            id="doc-trichsao-content"
            className="p-6 sm:p-10 text-slate-900 overflow-y-auto font-serif leading-relaxed text-sm bg-white flex-1"
          >
            {/* Header Block with School Logo */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
              <div className="text-center sm:text-left flex items-start gap-3">
                <SchoolLogo size={52} className="hidden sm:inline-block mt-0.5 print-only" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {tsData.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {tsData.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                  </div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-emerald-950 underline underline-offset-4 decoration-emerald-600">
                    {tsData.donViSao || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'}
                  </div>
                  <div className="text-xs mt-2 font-mono text-slate-700 font-sans flex items-center gap-1">
                    <span>Số:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tsData.soTrichSao}
                        onChange={(e) => setTsData({ ...tsData, soTrichSao: e.target.value })}
                        className="border border-amber-400 rounded px-1.5 py-0.5 font-bold font-mono text-xs w-32"
                      />
                    ) : (
                      <strong className="font-bold text-amber-900">{tsData.soTrichSao}</strong>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-xs font-bold text-slate-800 underline underline-offset-4 decoration-slate-400">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-xs italic text-slate-600 mt-2 font-sans flex items-center justify-center gap-1">
                  <span>TP. Hồ Chí Minh, ngày</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={tsData.ngaySao}
                      onChange={(e) => setTsData({ ...tsData, ngaySao: e.target.value })}
                      className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                    />
                  ) : (
                    <span>
                      {new Date(tsData.ngaySao).getDate()} tháng {new Date(tsData.ngaySao).getMonth() + 1} năm {new Date(tsData.ngaySao).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-300 my-3" />

            {/* Document Title: BẢN TRÍCH SAO */}
            <div className="text-center my-5 space-y-1">
              <div className="inline-block px-4 py-1 rounded bg-amber-100 text-amber-950 font-bold uppercase tracking-widest text-xs border border-amber-300 mb-1">
                VĂN BẢN TRÍCH SAO CHÍNH THỨC
              </div>
              <h2 className="text-lg font-black uppercase tracking-wide text-slate-900">
                BẢN TRÍCH SAO
              </h2>
              <h3 className="text-sm font-bold uppercase text-slate-800">
                QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN
              </h3>
              <p className="text-xs font-medium italic text-slate-700 max-w-xl mx-auto">
                Số: {qdData.soQuyetDinh} ngày {new Date(qdData.ngayKy).getDate()} tháng {new Date(qdData.ngayKy).getMonth() + 1} năm {new Date(qdData.ngayKy).getFullYear()} của Thủ trưởng Tổng cục Hậu cần
                {allowanceScope === 'Phụ cấp thâm niên nghề' && ' về việc nâng phụ cấp thâm niên nghề cho QNCN'}
                {allowanceScope === 'Phụ cấp thâm niên vượt khung' && ' về việc nâng phụ cấp thâm niên vượt khung cho QNCN'}
                {allowanceScope === 'Nâng bậc lương & Vượt khung' && ' về việc nâng bậc lương và phụ cấp thâm niên vượt khung cho QNCN'}
                {allowanceScope === 'Tổng hợp cả 3 chế độ' && ' về việc nâng bậc lương, thâm niên nghề và vượt khung cho QNCN'}
              </p>
            </div>

            {/* Authority */}
            <div className="text-center my-3 font-bold uppercase text-xs tracking-wider">
              {qdData.chucDanhNguoiKy}
            </div>

            {/* Legal grounds */}
            <div className="space-y-1 text-xs italic text-slate-700 my-4">
              {qdData.canCu.map((c, i) => (
                <p key={i}>- {c}</p>
              ))}
            </div>

            <div className="text-center font-bold text-xs uppercase tracking-wider my-3">
              QUYẾT ĐỊNH (TRÍCH):
            </div>

            {/* Articles Extracted */}
            <div className="space-y-3.5 text-xs text-justify">
              <div>
                <strong className="font-bold">Điều 1 (Trích). </strong>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={tsData.dieu1Trích}
                    onChange={(e) => setTsData({ ...tsData, dieu1Trích: e.target.value })}
                    className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                  />
                ) : (
                  <span>{tsData.dieu1Trích}</span>
                )}
              </div>

              <div>
                <strong className="font-bold">Điều 2 (Trích). </strong>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={tsData.dieu2Trích}
                    onChange={(e) => setTsData({ ...tsData, dieu2Trích: e.target.value })}
                    className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                  />
                ) : (
                  <span>{tsData.dieu2Trích}</span>
                )}
              </div>

              <div>
                <strong className="font-bold">Điều 3 (Trích). </strong>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={tsData.dieu3Trích}
                    onChange={(e) => setTsData({ ...tsData, dieu3Trích: e.target.value })}
                    className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                  />
                ) : (
                  <span>{tsData.dieu3Trích}</span>
                )}
              </div>
            </div>

            {/* Certificate of True Extract (Chứng thực sao y) */}
            <div className="mt-6 p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase mb-1">
                <Stamp className="w-4 h-4 text-amber-600" />
                Chứng thực sao y bản chính:
              </div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={tsData.chungThuc}
                  onChange={(e) => setTsData({ ...tsData, chungThuc: e.target.value })}
                  className="w-full border border-amber-400 rounded p-1 text-xs"
                />
              ) : (
                <p className="text-xs text-slate-700 italic">
                  {tsData.chungThuc}
                </p>
              )}
            </div>

            {/* Signatures & Certification - HIỆU TRƯỞNG KÝ DUYỆT BẢN TRÍCH SAO */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-start gap-6 pt-4">
              <div className="text-[11px] text-slate-600 space-y-1">
                <div className="font-bold italic text-slate-700">Nơi nhận trích sao:</div>
                {tsData.noiNhanSao.map((n, i) => (
                  <div key={i}>- {n}</div>
                ))}
              </div>

              <div className="text-center min-w-[260px] self-end sm:self-auto">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={tsData.chucDanhKySao}
                      onChange={(e) => setTsData({ ...tsData, chucDanhKySao: e.target.value })}
                      className="border border-amber-400 rounded px-2 py-0.5 text-xs text-center font-bold w-full"
                    />
                  ) : (
                    tsData.chucDanhKySao
                  )}
                </div>
                <div className="text-[11px] italic text-slate-500 mb-16">
                  (Ký tên, đóng dấu chứng thực sao y của Trường)
                </div>
                <div className="text-xs font-bold uppercase text-slate-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={tsData.nguoiKySao}
                      onChange={(e) => setTsData({ ...tsData, nguoiKySao: e.target.value })}
                      className="border border-amber-400 rounded px-2 py-0.5 text-xs text-center font-bold"
                    />
                  ) : (
                    tsData.nguoiKySao
                  )}
                </div>
              </div>
            </div>

            {/* Appendix Table for Extracted QNCN */}
            <div className="mt-12 pt-6 border-t-2 border-slate-300">
              <div className="text-center mb-4 space-y-1">
                <h3 className="text-xs font-bold uppercase text-slate-900">
                  DANH SÁCH TRÍCH SAO QUÂN NHÂN CHUYÊN NGHIỆP ĐƯỢC HƯỞNG CHẾ ĐỘ
                  {allowanceScope === 'Phụ cấp thâm niên nghề' && ' (PHỤ CẤP THÂM NIÊN NGHỀ)'}
                  {allowanceScope === 'Phụ cấp thâm niên vượt khung' && ' (PHỤ CẤP THÂM NIÊN VƯỢT KHUNG)'}
                  {allowanceScope === 'Nâng bậc lương & Vượt khung' && ' (NÂNG BẬC LƯƠNG & VƯỢT KHUNG)'}
                  {allowanceScope === 'Tổng hợp cả 3 chế độ' && ' (NÂNG LƯƠNG, THÂM NIÊN VÀ VƯỢT KHUNG)'}
                </h3>
                <p className="text-[11px] italic text-slate-600">
                  (Kèm theo Bản Trích sao số {tsData.soTrichSao} ngày {tsData.ngaySao} của Hiệu trưởng Trường CĐHC2)
                </p>
              </div>

              <table className="w-full text-left text-[11px] border-collapse border border-slate-400 font-sans">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                    <th className="border border-slate-400 p-2">STT</th>
                    <th className="border border-slate-400 p-2">Họ và tên</th>
                    <th className="border border-slate-400 p-2">Số hiệu</th>
                    <th className="border border-slate-400 p-2">Cấp bậc</th>
                    <th className="border border-slate-400 p-2">Chức vụ - Đơn vị</th>
                    {allowanceScope !== 'Phụ cấp thâm niên nghề' && (
                      <>
                        <th className="border border-slate-400 p-2">Bậc & HS cũ</th>
                        <th className="border border-slate-400 p-2">Bậc & HS MỚI</th>
                      </>
                    )}
                    {(allowanceScope === 'Phụ cấp thâm niên nghề' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                      <th className="border border-slate-400 p-2">% Thâm niên mới</th>
                    )}
                    {(allowanceScope === 'Phụ cấp thâm niên vượt khung' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                      <th className="border border-slate-400 p-2">% Vượt khung mới</th>
                    )}
                    <th className="border border-slate-400 p-2">Ngày hưởng</th>
                    <th className="border border-slate-400 p-2">Hình thức</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedList.map((item, idx) => (
                    <tr key={item.id} className="text-slate-800">
                      <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-400 p-2 font-bold">{item.hoVaTen}</td>
                      <td className="border border-slate-400 p-2 font-mono text-center">{item.maQNCN}</td>
                      <td className="border border-slate-400 p-2 text-center">{item.capBac}</td>
                      <td className="border border-slate-400 p-2">
                        {item.chucVu} - {item.donVi}
                      </td>

                      {allowanceScope !== 'Phụ cấp thâm niên nghề' && (
                        <>
                          <td className="border border-slate-400 p-2 text-center">
                            Bậc {item.bacHienTai} ({item.heSoHienTai.toFixed(2)})
                          </td>
                          <td className="border border-slate-400 p-2 text-center font-bold text-emerald-900 bg-emerald-50/50">
                            {item.loaiNangLuong === 'Vượt khung'
                              ? `VK ${item.vuotKhungDeXuat}%`
                              : `Bậc ${item.bacDeXuat} (${item.heSoDeXuat.toFixed(2)})`}
                          </td>
                        </>
                      )}

                      {(allowanceScope === 'Phụ cấp thâm niên nghề' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                        <td className="border border-slate-400 p-2 text-center font-mono font-bold text-emerald-800 bg-emerald-50/30">
                          24%
                        </td>
                      )}

                      {(allowanceScope === 'Phụ cấp thâm niên vượt khung' || allowanceScope === 'Tổng hợp cả 3 chế độ') && (
                        <td className="border border-slate-400 p-2 text-center font-mono font-bold text-purple-900 bg-purple-50/30">
                          {item.vuotKhungDeXuat > 0 ? `${item.vuotKhungDeXuat}%` : '-'}
                        </td>
                      )}

                      <td className="border border-slate-400 p-2 text-center font-mono font-semibold">
                        {item.ngayHuongMoi}
                      </td>
                      <td className="border border-slate-400 p-2 text-center">
                        {item.loaiNangLuong}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
