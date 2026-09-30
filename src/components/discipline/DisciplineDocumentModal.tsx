import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  Edit3,
  Save,
  RotateCcw,
  Building,
  Stamp,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import {
  DisciplineCaseRecord,
  DisciplineDecisionInfo,
  DisciplineExtractInfo,
} from '../../types';
import { formatSignerDisplay } from '../approval/DecisionDocumentModal';
import { exportMilitaryDocumentToPdf } from '../../services/pdfExportService';
import { useToast } from '../../context/ToastContext';

interface DisciplineDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: DisciplineCaseRecord[];
  decisionData: DisciplineDecisionInfo;
  extractData: DisciplineExtractInfo;
  onSaveDocuments: (
    updatedDecision: DisciplineDecisionInfo,
    updatedExtract: DisciplineExtractInfo
  ) => void;
  defaultTab?: 'decision' | 'extract';
}

const formatVN = (dateStr?: string) => {
  if (!dateStr) return { day: '.....', month: '.....', year: '2026' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: '.....', month: '.....', year: '2026' };
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear()),
    };
  } catch {
    return { day: '.....', month: '.....', year: '2026' };
  }
};

const formatDateShortVN = (dateStr?: string) => {
  if (!dateStr) return '-';
  const clean = dateStr.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) return clean;
  if (/^\d{2}\/\d{2}$/.test(clean)) return clean;
  try {
    const d = new Date(clean);
    if (isNaN(d.getTime())) return clean;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return clean;
  }
};

const formatDecimalVN = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '-';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return String(val);
  return num.toFixed(2).replace('.', ',');
};

export const DisciplineDocumentModal: React.FC<DisciplineDocumentModalProps> = ({
  isOpen,
  onClose,
  cases,
  decisionData: initialDecision,
  extractData: initialExtract,
  onSaveDocuments,
  defaultTab = 'decision',
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'decision' | 'extract'>(defaultTab);
  const [isEditing, setIsEditing] = useState(false);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Local state for documents
  const [decision, setDecision] = useState<DisciplineDecisionInfo>(initialDecision);
  const [extract, setExtract] = useState<DisciplineExtractInfo>(initialExtract);

  if (!isOpen) return null;

  // Filter display cases
  const displayCases = onlyApproved
    ? cases.filter((c) => c.trangThaiPheDuyet === 'Đã duyệt kéo dài')
    : cases;

  const handleSave = () => {
    onSaveDocuments(decision, extract);
    setIsEditing(false);
    toast.success(
      'Đã lưu văn bản kỷ luật!',
      'Thông tin Quyết định & Bản Trích sao xử lý kỷ luật đã được lưu trữ thành công.',
      { badge: 'VĂN BẢN KỶ LUẬT' }
    );
  };

  const handleResetToDefault = () => {
    setDecision(initialDecision);
    setExtract(initialExtract);
    setIsEditing(false);
    toast.info('Đã hoàn tác văn bản', 'Khôi phục nội dung văn bản về mặc định.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const isDecision = activeTab === 'decision';
      const mainElementId = isDecision ? 'discipline-decision-main' : 'discipline-extract-main';
      const appendixElementId = isDecision
        ? 'discipline-decision-appendix-wrapper'
        : 'discipline-extract-appendix-wrapper';

      const fileName = isDecision
        ? `Quyet_Dinh_Ky_Luat_Keo_Dai_${decision.soQuyetDinh.replace(/\//g, '_')}.pdf`
        : `Trich_Sao_Ky_Luat_Keo_Dai_${extract.soTrichSao.replace(/\//g, '_')}.pdf`;

      await exportMilitaryDocumentToPdf({
        mainElementId,
        appendixElementId,
        fileName,
        title: isDecision
          ? 'Quyết định Kéo dài thời hạn nâng lương do kỷ luật'
          : 'Bản Trích sao Quyết định kéo dài thời hạn nâng lương',
        appendixOrientation: 'portrait',
      });

      toast.success(
        'Xuất file PDF thành công!',
        `Đã lưu tệp văn bản "${fileName}" chuẩn quân đội 2 trang (Trang 1: Quyết định, Trang 2: Phụ lục danh sách).`,
        { badge: 'PDF EXPORT' }
      );
    } catch (err) {
      console.error(err);
      toast.error('Lỗi xuất PDF', 'Không thể tạo file PDF. Vui lòng thử dùng tính năng In trực tiếp.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print-backdrop print:p-0 print:bg-white print:static print:block">
      {/* Embedded print styling to ensure signer names on Page 1 and Page 2 are NEVER cut off or covered */}
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 8mm 10mm 10mm 10mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Times New Roman', Times, serif !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .admin-doc-page {
            page-break-after: always !important;
            break-after: page !important;
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
          }
          .appendix-table-section {
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 4px !important;
            margin-top: 0 !important;
          }
          .signature-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
      <div className="bg-[#f8fafc] w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-300/80 print:max-h-none print:h-auto print:max-w-none print:w-full print:border-none print:shadow-none print:overflow-visible print:rounded-none">
        {/* Modal Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100 flex items-center gap-2">
                Văn Bản Pháp Quy: Kéo Dài Thời Hạn Nâng Bậc Lương Do Kỷ Luật
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {displayCases.length} quân nhân
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Trình bày chuẩn mẫu quân đội (Trang 1: Quyết định pháp quy / Bản Trích sao; Trang 2: Phụ lục trích ngang)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls Toolbar */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 no-print">
          {/* Document Switcher Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('decision')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'decision'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              1. Quyết định Tổng cục Hậu cần
            </button>
            <button
              onClick={() => setActiveTab('extract')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'extract'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              2. Bản Trích sao Trường CĐHC2
            </button>
          </div>

          {/* Filter & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Only Approved */}
            <button
              type="button"
              onClick={() => setOnlyApproved(!onlyApproved)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                onlyApproved
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>{onlyApproved ? 'Đang lọc: Chỉ đ/c Đã duyệt' : 'Hiện tất cả hồ sơ kỷ luật'}</span>
            </button>

            {/* Edit / Save Toggle */}
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu thay đổi
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 border border-slate-300"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                Chỉnh sửa văn bản
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              In A4
            </button>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              {isExportingPdf ? 'Đang xuất...' : 'Xuất PDF 2 trang'}
            </button>
          </div>
        </div>

        {/* Document Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-[#e2e8f0]/40 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
          {/* ========================================================================= */}
          {/* TAB 1: QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN                         */}
          {/* ========================================================================= */}
          {activeTab === 'decision' && (
            <div
              id="doc-discipline-decision-content"
              className="p-6 sm:p-8 text-slate-950 font-serif leading-relaxed text-sm bg-white flex-1 max-w-[210mm] shadow-md rounded-2xl print:p-0 print:m-0 print:max-w-none print:w-full print:shadow-none print:rounded-none print:overflow-visible"
            >
              {/* TRANG 1: VĂN BẢN QUYẾT ĐỊNH (TRÌNH BÀY CHUẨN NHƯ NÂNG LƯƠNG) */}
              <div id="discipline-decision-main" className="admin-doc-page discipline-page-1 print:page-break-after-always">
                {/* Header Block: 2-Column Administrative Table (Never Collapses) */}
                <table
                  className="admin-doc-table w-full mb-3 text-slate-950 font-serif"
                  style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ width: '46%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 8px 0 0' }}>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                              onChange={(e) => setDecision({ ...decision, coQuanCapTren: e.target.value })}
                              className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                            />
                          ) : (
                            decision.coQuanCapTren || 'BỘ QUỐC PHÒNG'
                          )}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider mt-0.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                              onChange={(e) => setDecision({ ...decision, coQuanTongCuc: e.target.value })}
                              className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                            />
                          ) : (
                            decision.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'
                          )}
                        </div>
                        <div className="w-24 h-[1px] bg-black mx-auto my-1"></div>
                        <div className="text-xs mt-1 text-slate-800 flex items-center justify-center gap-1">
                          <span>Số:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.soQuyetDinh}
                              onChange={(e) => setDecision({ ...decision, soQuyetDinh: e.target.value })}
                              className="border border-amber-400 rounded px-1.5 py-0.5 font-bold text-xs w-28 text-center"
                            />
                          ) : (
                            <strong className="font-bold">{decision.soQuyetDinh}</strong>
                          )}
                        </div>
                      </td>

                      <td style={{ width: '54%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 8px' }}>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div className="text-[13px] font-bold text-slate-900 mt-0.5">
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                        <div className="w-36 h-[1px] bg-black mx-auto my-1"></div>
                        <div className="text-xs italic text-slate-700 mt-1 flex items-center justify-center gap-1">
                          <span>Hà Nội, ngày</span>
                          {isEditing ? (
                            <input
                              type="date"
                              value={decision.ngayKy}
                              onChange={(e) => setDecision({ ...decision, ngayKy: e.target.value })}
                              className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                            />
                          ) : (
                            <span>
                              {formatVN(decision.ngayKy).day} tháng {formatVN(decision.ngayKy).month} năm {formatVN(decision.ngayKy).year}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-t border-slate-300 my-4" />

                {/* Document Name */}
                <div className="text-center my-5 space-y-1">
                  <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                    QUYẾT ĐỊNH
                  </h2>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={decision.tieuDe}
                      onChange={(e) => setDecision({ ...decision, tieuDe: e.target.value })}
                      className="w-full text-center text-xs font-bold uppercase border border-amber-400 rounded p-1"
                    />
                  ) : (
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-800 max-w-xl mx-auto">
                      {decision.tieuDe}
                    </p>
                  )}
                </div>

                {/* Signing Authority */}
                <div className="text-center my-3 font-bold uppercase text-xs tracking-wider">
                  {isEditing ? (
                    <input
                      type="text"
                      value={decision.chucDanhNguoiKy}
                      onChange={(e) => setDecision({ ...decision, chucDanhNguoiKy: e.target.value })}
                      className="text-center font-bold border border-amber-400 rounded px-2 py-0.5 text-xs w-80 uppercase"
                    />
                  ) : (
                    decision.chucDanhNguoiKy
                  )}
                </div>

                {/* Legal Grounds (Nội dung căn cứ chuyên biệt cho Kỷ luật kéo dài) */}
                <div className="space-y-1 text-xs italic text-slate-700 my-4">
                  {decision.canCu?.map((c, i) => (
                    <p key={i}>- {c}</p>
                  ))}
                </div>

                <div className="text-center font-bold text-xs uppercase tracking-wider my-3">
                  QUYẾT ĐỊNH:
                </div>

                {/* Articles (Nội dung quyết định chuyên biệt cho Kỷ luật kéo dài) */}
                <div className="space-y-3.5 text-xs text-justify">
                  <div>
                    <strong className="font-bold">Điều 1. </strong>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={decision.dieu1}
                        onChange={(e) => setDecision({ ...decision, dieu1: e.target.value })}
                        className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                      />
                    ) : (
                      <span>{decision.dieu1}</span>
                    )}
                  </div>

                  <div>
                    <strong className="font-bold">Điều 2. </strong>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={decision.dieu2}
                        onChange={(e) => setDecision({ ...decision, dieu2: e.target.value })}
                        className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                      />
                    ) : (
                      <span>{decision.dieu2}</span>
                    )}
                  </div>

                  <div>
                    <strong className="font-bold">Điều 3. </strong>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={decision.dieu3}
                        onChange={(e) => setDecision({ ...decision, dieu3: e.target.value })}
                        className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                      />
                    ) : (
                      <span>{decision.dieu3}</span>
                    )}
                  </div>
                </div>

                {/* Signature Block: 2-Column Administrative Table (Never Collapses) */}
                <table
                  className="admin-doc-table w-full mt-6 print:mt-4 text-slate-950 font-serif signature-section"
                  style={{ width: '100%', borderCollapse: 'collapse', border: 'none', pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ width: '48%', verticalAlign: 'top', textAlign: 'left', border: 'none', padding: '0 12px 0 0' }}>
                        <div className="text-[11px] text-slate-600 space-y-1">
                          <div className="font-bold italic text-slate-700">Nơi nhận:</div>
                          {decision.noiNhan?.map((n, i) => (
                            <div key={i}>- {n}</div>
                          ))}
                        </div>
                      </td>

                      <td style={{ width: '52%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 12px' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.chucDanhNguoiKy}
                              onChange={(e) => setDecision({ ...decision, chucDanhNguoiKy: e.target.value })}
                              className="border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold text-center w-full uppercase"
                              placeholder="Chức danh ký (VD: THỦ TRƯỞNG TỔNG CỤC HẬU CẦN)"
                            />
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa chức danh"
                            >
                              {decision.chucDanhNguoiKy}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.chucVuNguoiKy}
                              onChange={(e) => setDecision({ ...decision, chucVuNguoiKy: e.target.value })}
                              className="border border-amber-400 rounded px-1.5 py-0.5 text-xs text-center w-full"
                              placeholder="Chức vụ người ký (VD: Chủ nhiệm Tổng cục Hậu cần)"
                            />
                          ) : (
                            decision.chucVuNguoiKy
                          )}
                        </div>
                        <div className="text-[11px] italic text-slate-500 mt-0.5 mb-8 sm:mb-10 print:mb-6">
                          (Ký tên, đóng dấu Tổng cục Hậu cần)
                        </div>
                        <div className="text-xs font-bold uppercase text-slate-900 pb-1">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={decision.nguoiKy}
                                onChange={(e) => setDecision({ ...decision, nguoiKy: e.target.value, capBacNguoiKy: '' })}
                                className="border border-amber-400 rounded px-2 py-1 text-xs text-center font-bold w-full max-w-[320px] mx-auto block uppercase"
                                placeholder="Cấp bậc & Họ tên người ký"
                              />
                              <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] no-print">
                                <span className="text-slate-500 font-normal">Gợi ý:</span>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, capBacNguoiKy: '', nguoiKy: 'Trung tướng Nguyễn Văn Điều' })}
                                  className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-semibold"
                                >
                                  Trung tướng Nguyễn Văn Điều
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, capBacNguoiKy: '', nguoiKy: 'Đại tá Trần Hữu Nghĩa' })}
                                  className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 hover:bg-blue-200 font-semibold"
                                >
                                  Đại tá Trần Hữu Nghĩa
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa tên người ký"
                            >
                              {formatSignerDisplay(decision.capBacNguoiKy, decision.nguoiKy)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TRANG 2: BẢNG PHỤ LỤC DANH SÁCH QUÂN NHÂN KỶ LUẬT (TÁCH SANG TRANG 2) */}
              <div
                id="discipline-decision-appendix-wrapper"
                className="appendix-table-section break-before-page page-break-before mt-8 pt-6 border-t border-slate-300 print:break-before-page print:mt-0 print:pt-2"
              >
                {/* Header Table Phụ lục */}
                <table className="admin-doc-table w-full mb-3 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '45%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 4px 0 0' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-black">
                          {decision.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-black mt-0.5">
                          TRƯỜNG CAO ĐẲNG HẬU CẦN 2
                        </div>
                        <div className="w-24 h-[1px] bg-black mx-auto my-1"></div>
                      </td>
                      <td style={{ width: '55%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 4px' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-black">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div className="text-[13px] font-bold text-black mt-0.5">
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                        <div className="w-32 h-[1px] bg-black mx-auto my-1"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tiêu đề Bảng phụ lục */}
                <div className="text-center my-3.5 space-y-1">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-black font-serif">
                    DANH SÁCH QUÂN NHÂN CHUYÊN NGHIỆP KÉO DÀI THỜI HẠN NÂNG BẬC LƯƠNG DO KỶ LUẬT
                  </h3>
                  <p className="text-xs italic text-black font-serif">
                    (Kèm theo Quyết định số: <span className="font-semibold">{decision.soQuyetDinh}</span> ngày {formatVN(decision.ngayKy).day} tháng {formatVN(decision.ngayKy).month} năm {formatVN(decision.ngayKy).year} của Thủ trưởng Tổng cục Hậu cần)
                  </p>
                </div>

                {/* Bảng dữ liệu trích ngang 11 cột chuẩn quân sự cân đối với trang A4 */}
                <div className="w-full overflow-visible">
                  <table
                    className="w-full text-left border-collapse border border-black font-serif text-black"
                    style={{
                      width: '100%',
                      tableLayout: 'fixed',
                      borderCollapse: 'collapse',
                      border: '1.5px solid #000000',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: '10.5px',
                      lineHeight: '1.3',
                    }}
                  >
                    <thead>
                      {/* Header Row 1: 11 Cột */}
                      <tr className="bg-slate-100 text-center font-bold text-[10.5px] print:text-[8pt] text-black">
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '4%' }}>STT</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '15%' }}>Họ và tên</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8.5%' }}>Cấp bậc</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '15%' }}>Chức vụ, đơn vị</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '7%' }}>Ngạch</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8%' }}>Lương hiện hưởng</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '14.5%' }}>Hình thức & QĐ kỷ luật</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '7.5%' }}>Thời gian kéo dài</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8%' }}>Thời hạn cũ</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8%' }}>Thời hạn mới</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '6.5%' }}>Ghi chú</th>
                      </tr>
                      {/* Header Row 2: Đánh số thứ tự cột từ 1 đến 11 chuẩn văn bản hành chính */}
                      <tr className="bg-slate-50 text-center text-[9px] print:text-[7pt] italic text-black">
                        <th className="border border-black py-0.5 px-1 text-center font-normal">1</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">2</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">3</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">4</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">5</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">6</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">7</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">8</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">9</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">10</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">11</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCases.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="border border-black p-4 text-center italic text-slate-500">
                            Không có quân nhân nào trong danh sách kỷ luật.
                          </td>
                        </tr>
                      ) : (
                        displayCases.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50 text-[10.5px] print:text-[8pt] text-black">
                            <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                            <td className="border border-black p-1 font-bold text-left break-words">
                              <div>{item.hoVaTen}</div>
                              <div className="text-[9.5px] font-normal text-slate-600 font-mono">{item.maQNCN}</div>
                            </td>
                            <td className="border border-black p-1 text-center break-words">{item.capBac}</td>
                            <td className="border border-black p-1 text-left break-words">
                              <div className="font-medium">{item.chucVu}</div>
                              <div className="text-[9.5px] italic text-slate-700">{item.donVi}</div>
                            </td>
                            <td className="border border-black p-1 text-center text-[10px] break-words">{item.ngach}</td>
                            <td className="border border-black p-1 text-center break-words">
                              <div className="font-bold">Bậc {item.bacHienTai}</div>
                              <div className="text-[9.5px] text-slate-700">({formatDecimalVN(item.heSoHienTai)})</div>
                            </td>
                            <td className="border border-black p-1 text-left break-words">
                              <div className="font-bold text-black">{item.hinhThucKyLuat}</div>
                              <div className="text-[9.5px] text-slate-700">
                                QĐ {item.soQuyetDinhKyLuat} ({formatDateShortVN(item.ngayKyLuat)})
                              </div>
                            </td>
                            <td className="border border-black p-1 text-center font-bold text-black break-words">
                              {item.soThangKeoDai} tháng
                            </td>
                            <td className="border border-black p-1 text-center text-[10px] break-words">
                              {formatDateShortVN(item.hanNangLuongBanDau)}
                            </td>
                            <td className="border border-black p-1 text-center font-bold text-black text-[10px] break-words">
                              {formatDateShortVN(item.hanNangLuongMoi)}
                            </td>
                            <td className="border border-black p-1 text-left text-[9.5px] italic break-words">
                              {item.lyDoKyLuat || item.ghiChu || 'Kéo dài thời hạn theo quy định BQP'}
                            </td>
                          </tr>
                        ))
                      )}
                      {/* Dòng Tổng cộng */}
                      {displayCases.length > 0 && (
                        <tr className="bg-slate-50 font-bold text-black text-[10.5px] print:text-[8.5pt]">
                          <td className="border border-black p-1 text-center font-bold">CỘNG</td>
                          <td colSpan={10} className="border border-black p-1 font-bold uppercase tracking-wider text-left pl-2">
                            TỔNG SỐ: {displayCases.length} ĐỒNG CHÍ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Appendix Signatures Block: 3 Columns (Fully Editable for Page 2, Balanced A4) */}
                <table
                  className="w-full mt-6 print:mt-4 text-slate-950 font-serif signature-section"
                  style={{ width: '100%', borderCollapse: 'collapse', border: 'none', pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <tbody>
                    <tr>
                      {/* Cột 1: Người lập biểu */}
                      <td style={{ width: '33.33%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 6px' }}>
                        <div className="text-[11px] invisible mb-1 select-none">Hà Nội, ngày 28 tháng 03 năm 2026</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.chucDanhNguoiLap || 'NGƯỜI LẬP BIỂU'}
                              onChange={(e) => setDecision({ ...decision, chucDanhNguoiLap: e.target.value })}
                              className="border border-amber-400 rounded px-1 py-0.5 text-xs text-center font-bold w-full uppercase"
                              placeholder="Chức danh"
                            />
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa chức danh"
                            >
                              {decision.chucDanhNguoiLap || 'NGƯỜI LẬP BIỂU'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] italic text-slate-600 mt-0.5 mb-10 sm:mb-12 print:mb-8">
                          (Ký, ghi rõ họ tên)
                        </div>
                        <div className="text-xs font-bold uppercase text-slate-900 pb-1">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={decision.nguoiLap || 'Ban Quân lực'}
                                onChange={(e) => setDecision({ ...decision, nguoiLap: e.target.value })}
                                className="border border-amber-400 rounded px-1.5 py-0.5 text-xs text-center font-bold w-full uppercase"
                                placeholder="Họ tên người lập"
                              />
                              <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] no-print">
                                <span className="text-slate-500 font-normal">Gợi ý:</span>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, nguoiLap: 'Ban Quân lực' })}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                                >
                                  Ban Quân lực
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, nguoiLap: 'Đại úy Nguyễn Văn A' })}
                                  className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold"
                                >
                                  Đại úy Nguyễn Văn A
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa người lập"
                            >
                              {decision.nguoiLap || 'Ban Quân lực'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 2: Trưởng ban Quân lực */}
                      <td style={{ width: '33.33%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 6px' }}>
                        <div className="text-[11px] invisible mb-1 select-none">Hà Nội, ngày 28 tháng 03 năm 2026</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.chucDanhTruongBan || 'TRƯỞNG BAN QUÂN LỰC'}
                              onChange={(e) => setDecision({ ...decision, chucDanhTruongBan: e.target.value })}
                              className="border border-amber-400 rounded px-1 py-0.5 text-xs text-center font-bold w-full uppercase"
                              placeholder="Chức danh"
                            />
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa chức danh"
                            >
                              {decision.chucDanhTruongBan || 'TRƯỞNG BAN QUÂN LỰC'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] italic text-slate-600 mt-0.5 mb-10 sm:mb-12 print:mb-8">
                          (Ký, ghi rõ họ tên)
                        </div>
                        <div className="text-xs font-bold uppercase text-slate-900 pb-1">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={decision.nguoiKyTruongBan || 'Thượng tá Nguyễn Văn Bình'}
                                onChange={(e) => setDecision({ ...decision, nguoiKyTruongBan: e.target.value })}
                                className="border border-amber-400 rounded px-1.5 py-0.5 text-xs text-center font-bold w-full uppercase"
                                placeholder="Họ tên người ký"
                              />
                              <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] no-print">
                                <span className="text-slate-500 font-normal">Gợi ý:</span>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, nguoiKyTruongBan: 'Thượng tá Nguyễn Văn Bình' })}
                                  className="px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold"
                                >
                                  Thượng tá Nguyễn Văn Bình
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, nguoiKyTruongBan: 'Trung tá Lê Minh Tuấn' })}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                                >
                                  Trung tá Lê Minh Tuấn
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa người ký"
                            >
                              {decision.nguoiKyTruongBan || 'Thượng tá Nguyễn Văn Bình'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 3: Thủ trưởng / Hiệu trưởng */}
                      <td style={{ width: '33.34%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 6px' }}>
                        <div className="text-[11px] italic text-slate-700 mb-1">
                          Hà Nội, ngày {formatVN(decision.ngayKy).day} tháng {formatVN(decision.ngayKy).month} năm {formatVN(decision.ngayKy).year}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={decision.chucDanhHieuTruong || 'HIỆU TRƯỞNG'}
                              onChange={(e) => setDecision({ ...decision, chucDanhHieuTruong: e.target.value })}
                              className="border border-amber-400 rounded px-1 py-0.5 text-xs text-center font-bold w-full uppercase"
                              placeholder="Chức danh"
                            />
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa chức danh"
                            >
                              {decision.chucDanhHieuTruong || 'HIỆU TRƯỞNG'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] italic text-slate-600 mt-0.5 mb-10 sm:mb-12 print:mb-8">
                          (Ký tên, đóng dấu)
                        </div>
                        <div className="text-xs font-bold uppercase text-slate-900 pb-1">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={decision.nguoiKyHieuTruong || 'Đại tá Trần Hữu Nghĩa'}
                                onChange={(e) => setDecision({ ...decision, nguoiKyHieuTruong: e.target.value })}
                                className="border border-amber-400 rounded px-1.5 py-0.5 text-xs text-center font-bold w-full uppercase"
                                placeholder="Họ tên người ký"
                              />
                              <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] no-print">
                                <span className="text-slate-500 font-normal">Gợi ý:</span>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, nguoiKyHieuTruong: 'Đại tá Trần Hữu Nghĩa' })}
                                  className="px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold"
                                >
                                  Đại tá Trần Hữu Nghĩa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDecision({ ...decision, nguoiKyHieuTruong: 'Trung tướng Nguyễn Văn Điều' })}
                                  className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold"
                                >
                                  Trung tướng Nguyễn Văn Điều
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa người ký"
                            >
                              {decision.nguoiKyHieuTruong || 'Đại tá Trần Hữu Nghĩa'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BẢN TRÍCH SAO QUYẾT ĐỊNH CỦA TRƯỜNG CAO ĐẲNG HẬU CẦN 2             */}
          {/* ========================================================================= */}
          {activeTab === 'extract' && (
            <div
              id="doc-discipline-extract-content"
              className="p-6 sm:p-8 text-slate-950 font-serif leading-relaxed text-sm bg-white flex-1 max-w-[210mm] shadow-md rounded-2xl print:p-0 print:m-0 print:max-w-none print:w-full print:shadow-none print:rounded-none print:overflow-visible"
            >
              {/* TRANG 1: BẢN TRÍCH SAO (TRÌNH BÀY CHUẨN NHƯ BẢN TRÍCH SAO NÂNG LƯƠNG) */}
              <div id="discipline-extract-main" className="admin-doc-page discipline-page-1 print:page-break-after-always">
                {/* Official Military Header: 2-Column Administrative Table (Never Collapses) */}
                <table
                  className="admin-doc-table w-full mb-3 text-slate-950 font-serif"
                  style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ width: '46%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 8px 0 0' }}>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          {isEditing ? (
                            <input
                              type="text"
                              value={extract.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                              onChange={(e) => setExtract({ ...extract, coQuanCapTren: e.target.value })}
                              className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                            />
                          ) : (
                            extract.coQuanCapTren || 'BỘ QUỐC PHÒNG'
                          )}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider mt-0.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={extract.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                              onChange={(e) => setExtract({ ...extract, coQuanTongCuc: e.target.value })}
                              className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                            />
                          ) : (
                            extract.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'
                          )}
                        </div>
                        <div className="text-xs font-black uppercase tracking-wide text-emerald-950 mt-0.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={extract.coQuanTruong || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'}
                              onChange={(e) => setExtract({ ...extract, coQuanTruong: e.target.value })}
                              className="border border-amber-400 rounded px-1 text-xs font-bold text-center w-full"
                            />
                          ) : (
                            extract.coQuanTruong || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'
                          )}
                        </div>
                        <div className="w-24 h-[1px] bg-black mx-auto my-1"></div>
                        <div className="text-xs mt-1 text-slate-800 flex items-center justify-center gap-1">
                          <span>Số:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={extract.soTrichSao}
                              onChange={(e) => setExtract({ ...extract, soTrichSao: e.target.value })}
                              className="border border-amber-400 rounded px-1.5 py-0.5 font-bold text-xs w-28 text-center"
                            />
                          ) : (
                            <strong className="font-bold">{extract.soTrichSao}</strong>
                          )}
                        </div>
                      </td>

                      <td style={{ width: '54%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 8px' }}>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div className="text-[13px] font-bold text-slate-900 mt-0.5">
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                        <div className="w-36 h-[1px] bg-black mx-auto my-1"></div>
                        <div className="text-xs italic text-slate-700 mt-1 flex items-center justify-center gap-1">
                          <span>TP. Hồ Chí Minh, ngày</span>
                          {isEditing ? (
                            <input
                              type="date"
                              value={extract.ngaySao}
                              onChange={(e) => setExtract({ ...extract, ngaySao: e.target.value })}
                              className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                            />
                          ) : (
                            <span>
                              {formatVN(extract.ngaySao).day} tháng {formatVN(extract.ngaySao).month} năm {formatVN(extract.ngaySao).year}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-t border-slate-300 my-4" />

                {/* Document Title: BẢN TRÍCH SAO */}
                <div className="text-center my-6 space-y-1">
                  <h2 className="text-lg font-black uppercase tracking-wider text-slate-950 font-serif">
                    BẢN TRÍCH SAO
                  </h2>
                  <h3 className="text-sm font-bold uppercase text-slate-900 font-serif">
                    QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN
                  </h3>
                  <p className="text-xs font-medium italic text-slate-800 max-w-xl mx-auto font-serif">
                    Số: {decision.soQuyetDinh} ngày {formatVN(decision.ngayKy).day} tháng {formatVN(decision.ngayKy).month} năm {formatVN(decision.ngayKy).year} của Thủ trưởng Tổng cục Hậu cần về việc kéo dài thời hạn nâng bậc lương của Quân nhân chuyên nghiệp do bị kỷ luật
                  </p>
                </div>

                {/* Signing Authority */}
                <div className="text-center my-3 font-bold uppercase text-xs tracking-wider text-black">
                  {decision.chucDanhNguoiKy}
                </div>

                {/* Legal grounds (Nội dung căn cứ chuyên biệt cho Kỷ luật kéo dài) */}
                <div className="space-y-1 text-xs italic text-slate-800 my-4 text-justify">
                  {decision.canCu?.map((c, i) => (
                    <p key={i}>- {c}</p>
                  ))}
                </div>

                <div className="text-center font-bold text-xs uppercase tracking-wider my-3 text-black">
                  QUYẾT ĐỊNH (TRÍCH):
                </div>

                {/* Articles Extracted (Nội dung quyết định trích chuyên biệt cho Kỷ luật kéo dài) */}
                <div className="space-y-3.5 text-xs text-justify">
                  <p className="indent-6">
                    <strong className="font-bold">Điều 1 (Trích). </strong>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={extract.dieu1Trích || decision.dieu1}
                        onChange={(e) => setExtract({ ...extract, dieu1Trích: e.target.value })}
                        className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                      />
                    ) : (
                      <span>{extract.dieu1Trích || decision.dieu1}</span>
                    )}
                  </p>

                  <p className="indent-6">
                    <strong className="font-bold">Điều 2 (Trích). </strong>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={extract.dieu2Trích || decision.dieu2}
                        onChange={(e) => setExtract({ ...extract, dieu2Trích: e.target.value })}
                        className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                      />
                    ) : (
                      <span>{extract.dieu2Trích || decision.dieu2}</span>
                    )}
                  </p>

                  <p className="indent-6">
                    <strong className="font-bold">Điều 3 (Trích). </strong>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={extract.dieu3Trích || decision.dieu3}
                        onChange={(e) => setExtract({ ...extract, dieu3Trích: e.target.value })}
                        className="w-full border border-amber-400 rounded p-1 text-xs mt-1"
                      />
                    ) : (
                      <span>{extract.dieu3Trích || decision.dieu3}</span>
                    )}
                  </p>
                </div>

                {/* Signatures & Certification: 2-Column Administrative Table (Never Collapses) */}
                <table
                  className="admin-doc-table w-full mt-6 print:mt-4 text-slate-950 font-serif signature-section"
                  style={{ width: '100%', borderCollapse: 'collapse', border: 'none', pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <tbody>
                    <tr>
                      {/* Left Column: Nơi nhận */}
                      <td style={{ width: '48%', verticalAlign: 'top', textAlign: 'left', border: 'none', padding: '0 12px 0 0' }}>
                        <div className="text-xs font-bold italic mb-1.5 text-black">Nơi nhận trích sao:</div>
                        <div className="text-[11px] leading-relaxed text-slate-800 space-y-0.5">
                          {extract.noiNhanSao?.map((n, i) => (
                            <div key={i}>- {n}</div>
                          ))}
                        </div>
                      </td>

                      {/* Right Column: CHỨNG THỰC SAO Y BẢN CHÍNH & HIỆU TRƯỞNG KÝ */}
                      <td style={{ width: '52%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 12px' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-black">
                          CHỨNG THỰC SAO Y BẢN CHÍNH
                        </div>
                        <div className="text-[11px] italic text-slate-700 my-1.5 leading-snug">
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={extract.chungThuc}
                              onChange={(e) => setExtract({ ...extract, chungThuc: e.target.value })}
                              className="w-full border border-amber-400 rounded p-1 text-xs"
                            />
                          ) : (
                            <span>{extract.chungThuc}</span>
                          )}
                        </div>

                        <div className="text-xs font-bold uppercase tracking-wider text-black mt-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={extract.chucDanhKySao}
                              onChange={(e) => setExtract({ ...extract, chucDanhKySao: e.target.value })}
                              className="border border-amber-400 rounded px-2 py-0.5 text-xs text-center font-bold w-full uppercase"
                            />
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa chức danh ký"
                            >
                              {extract.chucDanhKySao}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] italic text-slate-500 mt-0.5 mb-8 sm:mb-10 print:mb-6">
                          (Ký tên, đóng dấu chứng thực sao y của Trường)
                        </div>
                        <div className="text-xs font-bold uppercase text-black pb-1">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={extract.nguoiKySao}
                                onChange={(e) => setExtract({ ...extract, nguoiKySao: e.target.value })}
                                className="border border-amber-400 rounded px-2 py-0.5 text-xs text-center font-bold w-full max-w-[280px] mx-auto block uppercase"
                                placeholder="Cấp bậc & Họ tên người ký sao"
                              />
                              <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] no-print">
                                <span className="text-slate-500 font-normal">Gợi ý:</span>
                                <button
                                  type="button"
                                  onClick={() => setExtract({ ...extract, nguoiKySao: 'Đại tá Trần Hữu Nghĩa' })}
                                  className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 hover:bg-blue-200 font-semibold"
                                >
                                  Đại tá Trần Hữu Nghĩa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExtract({ ...extract, nguoiKySao: 'Thượng tá Nguyễn Văn Bình' })}
                                  className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold"
                                >
                                  Thượng tá Nguyễn Văn Bình
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:text-emerald-700 hover:underline"
                              onClick={() => setIsEditing(true)}
                              title="Bấm để chỉnh sửa người ký sao"
                            >
                              {extract.nguoiKySao}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TRANG 2: PHỤ LỤC TRÍCH DANH SÁCH QUÂN NHÂN (TÁCH SANG TRANG 2) */}
              <div
                id="discipline-extract-appendix-wrapper"
                className="appendix-table-section break-before-page page-break-before mt-8 pt-6 border-t border-slate-300 print:break-before-page print:mt-0 print:pt-2"
              >
                {/* Header Table Phụ lục */}
                <table className="admin-doc-table w-full mb-3 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '45%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 4px 0 0' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-black">
                          {extract.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-black mt-0.5">
                          {extract.coQuanTruong || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'}
                        </div>
                        <div className="w-24 h-[1px] bg-black mx-auto my-1"></div>
                      </td>
                      <td style={{ width: '55%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 4px' }}>
                        <div className="text-xs font-bold uppercase tracking-wider text-black">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </div>
                        <div className="text-[13px] font-bold text-black mt-0.5">
                          Độc lập - Tự do - Hạnh phúc
                        </div>
                        <div className="w-32 h-[1px] bg-black mx-auto my-1"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tiêu đề Bảng phụ lục trích sao */}
                <div className="text-center my-3.5 space-y-1">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-black font-serif">
                    BẢN TRÍCH DANH SÁCH QUÂN NHÂN CHUYÊN NGHIỆP KÉO DÀI THỜI HẠN NÂNG BẬC LƯƠNG DO KỶ LUẬT
                  </h3>
                  <p className="text-xs italic text-black font-serif">
                    (Kèm theo Bản Trích sao số: <span className="font-semibold">{extract.soTrichSao}</span> ngày {formatVN(extract.ngaySao).day} tháng {formatVN(extract.ngaySao).month} năm {formatVN(extract.ngaySao).year} của Hiệu trưởng Trường Cao đẳng Hậu cần 2)
                  </p>
                </div>

                {/* Bảng dữ liệu trích ngang 11 cột chuẩn quân sự cân đối với trang A4 */}
                <div className="w-full overflow-visible">
                  <table
                    className="w-full text-left border-collapse border border-black font-serif text-black"
                    style={{
                      width: '100%',
                      tableLayout: 'fixed',
                      borderCollapse: 'collapse',
                      border: '1.5px solid #000000',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: '10.5px',
                      lineHeight: '1.3',
                    }}
                  >
                    <thead>
                      {/* Header Row 1: 11 Cột */}
                      <tr className="bg-slate-100 text-center font-bold text-[10.5px] print:text-[8pt] text-black">
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '4%' }}>STT</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '15%' }}>Họ và tên</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8.5%' }}>Cấp bậc</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '15%' }}>Chức vụ, đơn vị</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '7%' }}>Ngạch</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8%' }}>Lương hiện hưởng</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '14.5%' }}>Hình thức & QĐ kỷ luật</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '7.5%' }}>Thời gian kéo dài</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8%' }}>Thời hạn cũ</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '8%' }}>Thời hạn mới</th>
                        <th className="border border-black p-1 text-center font-bold" style={{ width: '6.5%' }}>Ghi chú</th>
                      </tr>
                      {/* Header Row 2: Đánh số thứ tự cột từ 1 đến 11 chuẩn văn bản hành chính */}
                      <tr className="bg-slate-50 text-center text-[9px] print:text-[7pt] italic text-black">
                        <th className="border border-black py-0.5 px-1 text-center font-normal">1</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">2</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">3</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">4</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">5</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">6</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">7</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">8</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">9</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">10</th>
                        <th className="border border-black py-0.5 px-1 text-center font-normal">11</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCases.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="border border-black p-4 text-center italic text-slate-500">
                            Không có quân nhân nào trong danh sách kỷ luật.
                          </td>
                        </tr>
                      ) : (
                        displayCases.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50 text-[10.5px] print:text-[8pt] text-black">
                            <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                            <td className="border border-black p-1 font-bold text-left break-words">
                              <div>{item.hoVaTen}</div>
                              <div className="text-[9.5px] font-normal text-slate-600 font-mono">{item.maQNCN}</div>
                            </td>
                            <td className="border border-black p-1 text-center break-words">{item.capBac}</td>
                            <td className="border border-black p-1 text-left break-words">
                              <div className="font-medium">{item.chucVu}</div>
                              <div className="text-[9.5px] italic text-slate-700">{item.donVi}</div>
                            </td>
                            <td className="border border-black p-1 text-center text-[10px] break-words">{item.ngach}</td>
                            <td className="border border-black p-1 text-center break-words">
                              <div className="font-bold">Bậc {item.bacHienTai}</div>
                              <div className="text-[9.5px] text-slate-700">({formatDecimalVN(item.heSoHienTai)})</div>
                            </td>
                            <td className="border border-black p-1 text-left break-words">
                              <div className="font-bold text-black">{item.hinhThucKyLuat}</div>
                              <div className="text-[9.5px] text-slate-700">
                                QĐ {item.soQuyetDinhKyLuat} ({formatDateShortVN(item.ngayKyLuat)})
                              </div>
                            </td>
                            <td className="border border-black p-1 text-center font-bold text-black break-words">
                              {item.soThangKeoDai} tháng
                            </td>
                            <td className="border border-black p-1 text-center text-[10px] break-words">
                              {formatDateShortVN(item.hanNangLuongBanDau)}
                            </td>
                            <td className="border border-black p-1 text-center font-bold text-black text-[10px] break-words">
                              {formatDateShortVN(item.hanNangLuongMoi)}
                            </td>
                            <td className="border border-black p-1 text-left text-[9.5px] italic break-words">
                              {item.lyDoKyLuat || item.ghiChu || 'Kéo dài thời hạn theo quy định BQP'}
                            </td>
                          </tr>
                        ))
                      )}
                      {/* Dòng Tổng cộng */}
                      {displayCases.length > 0 && (
                        <tr className="bg-slate-50 font-bold text-black text-[10.5px] print:text-[8.5pt]">
                          <td className="border border-black p-1 text-center font-bold">CỘNG</td>
                          <td colSpan={10} className="border border-black p-1 font-bold uppercase tracking-wider text-left pl-2">
                            TỔNG SỐ: {displayCases.length} ĐỒNG CHÍ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Extract Certification Footer (Fully Editable for Page 2) */}
                <div
                  className="mt-6 flex justify-end signature-section"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <div className="text-center font-serif" style={{ width: '52%' }}>
                    <div className="text-[11px] italic text-slate-700 mb-1">
                      TP. Hồ Chí Minh, ngày {formatVN(extract.ngaySao).day} tháng {formatVN(extract.ngaySao).month} năm {formatVN(extract.ngaySao).year}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-black">
                      {isEditing ? (
                        <input
                          type="text"
                          value={extract.chucDanhKyPhuLuc || 'HIỆU TRƯỞNG'}
                          onChange={(e) => setExtract({ ...extract, chucDanhKyPhuLuc: e.target.value })}
                          className="border border-amber-400 rounded px-1 py-0.5 text-xs text-center font-bold w-full uppercase"
                          placeholder="Chức danh ký (VD: HIỆU TRƯỞNG)"
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:text-emerald-700 hover:underline"
                          onClick={() => setIsEditing(true)}
                          title="Bấm để chỉnh sửa chức danh"
                        >
                          {extract.chucDanhKyPhuLuc || 'HIỆU TRƯỞNG'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] italic text-slate-500 mt-0.5 mb-10 sm:mb-12 print:mb-8">
                      (Ký tên, đóng dấu chứng thực sao y của Trường)
                    </div>
                    <div className="text-xs font-bold uppercase text-black pb-1">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={extract.nguoiKyPhuLuc || extract.nguoiKySao || 'Đại tá Trần Hữu Nghĩa'}
                            onChange={(e) => setExtract({ ...extract, nguoiKyPhuLuc: e.target.value })}
                            className="border border-amber-400 rounded px-2 py-0.5 text-xs text-center font-bold w-full max-w-[280px] mx-auto block uppercase"
                            placeholder="Cấp bậc & Họ tên người ký"
                          />
                          <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] no-print">
                            <span className="text-slate-500 font-normal">Gợi ý:</span>
                            <button
                              type="button"
                              onClick={() => setExtract({ ...extract, nguoiKyPhuLuc: 'Đại tá Trần Hữu Nghĩa' })}
                              className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 hover:bg-blue-200 font-semibold"
                            >
                              Đại tá Trần Hữu Nghĩa
                            </button>
                            <button
                              type="button"
                              onClick={() => setExtract({ ...extract, nguoiKyPhuLuc: 'Thượng tá Nguyễn Văn Bình' })}
                              className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold"
                            >
                              Thượng tá Nguyễn Văn Bình
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:text-emerald-700 hover:underline"
                          onClick={() => setIsEditing(true)}
                          title="Bấm để chỉnh sửa người ký"
                        >
                          {extract.nguoiKyPhuLuc || extract.nguoiKySao || 'Đại tá Trần Hữu Nghĩa'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
