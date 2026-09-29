import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Building,
  Stamp,
  Edit3,
  Save,
  RotateCcw,
  Sliders,
  Send,
  Award,
} from 'lucide-react';
import {
  SalaryReviewCycle,
  ToTrinhTongCucInfo,
  QuyetDinhTongCucInfo,
  TrichSaoDonViInfo,
  ReviewAllowanceScope,
  QNCNProfile,
} from '../../types';
import { formatVND } from '../../services/salaryCalculator';
import { SchoolLogo } from '../common/SchoolLogo';
import { MilitaryPayrollAppendixTable } from './MilitaryPayrollAppendixTable';

interface DecisionDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: SalaryReviewCycle;
  qncnList?: QNCNProfile[];
  defaultTab?: 'totrinh' | 'tongcuc' | 'trichsao';
  onUpdateCycleDocuments?: (
    updatedToTrinh: ToTrinhTongCucInfo,
    updatedQd: QuyetDinhTongCucInfo,
    updatedTs: TrichSaoDonViInfo,
    scope: ReviewAllowanceScope
  ) => void;
}

export const DecisionDocumentModal: React.FC<DecisionDocumentModalProps> = ({
  isOpen,
  onClose,
  cycle,
  qncnList = [],
  defaultTab = 'totrinh',
  onUpdateCycleDocuments,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'totrinh' | 'tongcuc' | 'trichsao'>(defaultTab);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allowanceScope, setAllowanceScope] = useState<ReviewAllowanceScope>(
    cycle.loaiCheDo || 'Tổng hợp cả 3 chế độ'
  );

  // Editable state for Document 1: TỜ TRÌNH XIN PHÊ DUYỆT TỔNG CỤC
  // Yêu cầu: riêng phần tờ trình tổng cục duyệt thì chỗ ký phải là thủ trưởng Tổng cục Hậu Cần Ký
  const [toTrinhData, setToTrinhData] = useState<ToTrinhTongCucInfo>({
    soToTrinh: cycle.toTrinh?.soToTrinh || '89/TTr-HC2',
    ngayTrinh: cycle.toTrinh?.ngayTrinh || '2026-03-15',
    coQuanCapTren: cycle.toTrinh?.coQuanCapTren || 'BỘ QUỐC PHÒNG',
    coQuanTongCuc: cycle.toTrinh?.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT',
    donViTrinh: cycle.toTrinh?.donViTrinh || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
    tieuDeTrinh:
      cycle.toTrinh?.tieuDeTrinh ||
      'Về việc đề nghị phê duyệt nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho Quân nhân chuyên nghiệp Đợt 1 năm 2026',
    kinhGui: cycle.toTrinh?.kinhGui || [
      'Thủ trưởng Tổng cục Hậu cần - Kỹ thuật;',
      'Cục Cán bộ - Tổng cục Chính trị;',
      'Cục Quân lực - Bộ Tổng Tham mưu.',
    ],
    canCu: cycle.toTrinh?.canCu || [
      'Căn cứ Luật Quân nhân chuyên nghiệp, công nhân và viên chức quốc phòng năm 2015;',
      'Căn cứ Nghị định số 204/2004/NĐ-CP và Nghị định số 73/2024/NĐ-CP của Chính phủ;',
      'Căn cứ Thông tư số 170/2016/TT-BQP của Bộ Quốc phòng quy định cấp bậc quân hàm QNCN tương ứng với mức lương;',
      'Căn cứ Biên bản họp xét nâng bậc lương của Hội đồng lương Trường Cao Đẳng Hậu cần 2 ngày 14/03/2026.',
    ],
    noiDungTrinh:
      cycle.toTrinh?.noiDungTrinh ||
      'Trường Cao Đẳng Hậu cần 2 kính trình Thủ trưởng Tổng cục Hậu cần xem xét, quyết định nâng bậc lương thường xuyên, nâng bậc lương trước thời hạn có thành tích xuất sắc, nâng phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp đủ tiêu chuẩn, điều kiện đợt 1 năm 2026 (danh sách trích ngang kèm theo).',
    nguoiKyTrinh: cycle.toTrinh?.nguoiKyTrinh || 'Đại tá Trần Hữu Nghĩa',
    chucVuNguoiKyTrinh: cycle.toTrinh?.chucVuNguoiKyTrinh || 'Hiệu trưởng Trường Cao Đẳng Hậu cần 2',
    capBacNguoiKyTrinh: cycle.toTrinh?.capBacNguoiKyTrinh || 'Đại tá',
    // Khung phê duyệt chính thức: THỦ TRƯỞNG TỔNG CỤC HẬU CẦN KÝ DUYỆT
    chucDanhPheDuyet:
      cycle.toTrinh?.chucDanhPheDuyet || 'THỦ TRƯỞNG TỔNG CỤC HẬU CẦN PHÊ DUYỆT',
    chucVuNguoiPheDuyet: cycle.toTrinh?.chucVuNguoiPheDuyet || 'Chủ nhiệm Tổng cục Hậu cần',
    capBacNguoiPheDuyet: cycle.toTrinh?.capBacNguoiPheDuyet || 'Trung tướng',
    nguoiPheDuyet: cycle.toTrinh?.nguoiPheDuyet || 'Nguyễn Văn Điều',
    yKienPheDuyet:
      cycle.toTrinh?.yKienPheDuyet ||
      'Đồng ý phê duyệt nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2 theo danh sách đề nghị. Giao Cục Cán bộ hoàn tất Quyết định ban hành.',
    ngayPheDuyet: cycle.toTrinh?.ngayPheDuyet || '2026-03-22',
    noiNhan: cycle.toTrinh?.noiNhan || [
      'Như Kính gửi;',
      'Phòng Chính trị;',
      'Ban Quân lực;',
      'Lưu: VT, HC2.',
    ],
  });

  // Editable state for Document 2: QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN
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

  // Editable state for Document 3: BẢN TRÍCH SAO QUYẾT ĐỊNH CỦA TRƯỜNG CĐ HẬU CẦN 2
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
    let elId = 'doc-totrinh-content';
    if (activeDocTab === 'tongcuc') elId = 'doc-tongcuc-content';
    if (activeDocTab === 'trichsao') elId = 'doc-trichsao-content';

    const text = document.getElementById(elId)?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveTemplateChanges = () => {
    if (onUpdateCycleDocuments) {
      onUpdateCycleDocuments(toTrinhData, qdData, tsData, allowanceScope);
    }
    setIsEditing(false);
    alert('Đã lưu mẫu in thành công vào hệ thống!');
  };

  const handleScopeChange = (newScope: ReviewAllowanceScope) => {
    setAllowanceScope(newScope);
    // Tự động điều chỉnh tiêu đề phù hợp
    if (newScope === 'Phụ cấp thâm niên nghề') {
      setToTrinhData((prev) => ({
        ...prev,
        tieuDeTrinh:
          'Về việc đề nghị phê duyệt nâng mức hưởng phụ cấp thâm niên nghề đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
      setQdData((prev) => ({
        ...prev,
        trichYeu:
          'Về việc nâng mức hưởng phụ cấp thâm niên nghề đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
    } else if (newScope === 'Phụ cấp thâm niên vượt khung') {
      setToTrinhData((prev) => ({
        ...prev,
        tieuDeTrinh:
          'Về việc đề nghị phê duyệt nâng phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
      setQdData((prev) => ({
        ...prev,
        trichYeu:
          'Về việc nâng phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
    } else if (newScope === 'Nâng bậc lương & Vượt khung') {
      setToTrinhData((prev) => ({
        ...prev,
        tieuDeTrinh:
          'Về việc đề nghị phê duyệt nâng bậc lương và phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
      setQdData((prev) => ({
        ...prev,
        trichYeu:
          'Về việc nâng bậc lương và phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2',
      }));
    } else {
      setToTrinhData((prev) => ({
        ...prev,
        tieuDeTrinh:
          'Về việc đề nghị phê duyệt nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho Quân nhân chuyên nghiệp Đợt 1 năm 2026',
      }));
      setQdData((prev) => ({
        ...prev,
        trichYeu:
          'Về việc nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp các đơn vị trực thuộc Tổng cục Hậu cần Đợt 1 năm 2026',
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl xl:max-w-7xl w-full border border-slate-200 overflow-hidden my-3 sm:my-5 flex flex-col max-h-[96vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SchoolLogo size={36} className="ring-1 ring-amber-400/40" />
            <div>
              <span className="font-bold text-sm text-white block">
                Hệ Thống Mẫu In & Bản Trích Sao Quân Đội
              </span>
              <span className="text-[11px] text-emerald-300">
                Tờ trình Thủ trưởng Tổng cục duyệt ký • Quyết định Tổng cục • Bản Trích sao Hiệu trưởng ký
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-300'
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

        {/* Scope Selector & 3 Document Tabs */}
        <div className="no-print bg-slate-100 p-2.5 border-b border-slate-200 space-y-2 flex-shrink-0">
          {/* Allowance Scope Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                Áp dụng văn bản cho:
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
              * Tùy chỉnh áp dụng cho từng chế độ phụ cấp thâm niên, vượt khung và nâng bậc lương
            </span>
          </div>

          {/* 3 Document Switcher Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Tab 1: Tờ trình */}
            <button
              onClick={() => setActiveDocTab('totrinh')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-left ${
                activeDocTab === 'totrinh'
                  ? 'bg-blue-800 text-white shadow-sm ring-1 ring-blue-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate font-bold">1. TỜ TRÌNH TỔNG CỤC</span>
                <span className="text-[10px] block opacity-85">Thủ trưởng Tổng cục ký duyệt</span>
              </div>
            </button>

            {/* Tab 2: Quyết định Tổng cục */}
            <button
              onClick={() => setActiveDocTab('tongcuc')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-left ${
                activeDocTab === 'tongcuc'
                  ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate font-bold">2. QUYẾT ĐỊNH TỔNG CỤC</span>
                <span className="text-[10px] block opacity-85">Thủ trưởng Tổng cục ban hành</span>
              </div>
            </button>

            {/* Tab 3: Bản Trích sao */}
            <button
              onClick={() => setActiveDocTab('trichsao')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-left ${
                activeDocTab === 'trichsao'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-700'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Stamp className="w-3.5 h-3.5 text-amber-200 flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate font-bold">3. BẢN TRÍCH SAO ĐƠN VỊ</span>
                <span className="text-[10px] block opacity-85">Hiệu trưởng duyệt chi trả</span>
              </div>
            </button>
          </div>
        </div>

        {/* Notice Bar when editing is active */}
        {isEditing && (
          <div className="no-print bg-amber-50 p-2.5 border-b border-amber-200 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3 animate-fadeIn flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <Edit3 className="w-4 h-4 text-amber-700" />
                Chế độ chỉnh sửa mẫu in đang bật:
              </span>
              <span className="text-[11px] text-amber-800">
                Bạn có thể sửa trực tiếp số hiệu văn bản, ngày tháng, tên người ký, chức vụ, nơi nhận và các điều khoản bên dưới.
              </span>
            </div>
            <button
              onClick={handleSaveTemplateChanges}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" /> Lưu mẫu in
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENT 1: TỜ TRÌNH XIN PHÊ DUYỆT TỔNG CỤC */}
        {/* CHỖ KÝ PHÊ DUYỆT: THỦ TRƯỞNG TỔNG CỤC HẬU CẦN KÝ DUYỆT */}
        {/* ========================================================================= */}
        {activeDocTab === 'totrinh' && (
          <div
            id="doc-totrinh-content"
            className="p-6 sm:p-10 text-slate-900 overflow-y-auto font-serif leading-relaxed text-sm bg-white flex-1"
          >
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
              <div className="text-center sm:text-left flex items-start gap-3">
                <SchoolLogo size={52} className="hidden sm:inline-block mt-0.5 print-only" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={toTrinhData.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                        onChange={(e) => setToTrinhData({ ...toTrinhData, coQuanCapTren: e.target.value })}
                        className="border border-amber-400 rounded px-1 text-xs"
                      />
                    ) : (
                      toTrinhData.coQuanCapTren || 'BỘ QUỐC PHÒNG'
                    )}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isEditing ? (
                      <input
                        type="text"
                        value={toTrinhData.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                        onChange={(e) => setToTrinhData({ ...toTrinhData, coQuanTongCuc: e.target.value })}
                        className="border border-amber-400 rounded px-1 text-xs"
                      />
                    ) : (
                      toTrinhData.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'
                    )}
                  </div>
                  <div className="text-xs font-black uppercase tracking-wide text-emerald-950 underline underline-offset-4 decoration-emerald-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={toTrinhData.donViTrinh || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'}
                        onChange={(e) => setToTrinhData({ ...toTrinhData, donViTrinh: e.target.value })}
                        className="border border-amber-400 rounded px-1 text-xs font-bold"
                      />
                    ) : (
                      toTrinhData.donViTrinh || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'
                    )}
                  </div>
                  <div className="text-xs mt-2 font-mono text-slate-700 font-sans flex items-center gap-1">
                    <span>Số:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={toTrinhData.soToTrinh}
                        onChange={(e) => setToTrinhData({ ...toTrinhData, soToTrinh: e.target.value })}
                        className="border border-amber-400 rounded px-1.5 py-0.5 font-bold font-mono text-xs w-32"
                      />
                    ) : (
                      <strong className="font-bold text-blue-900">{toTrinhData.soToTrinh}</strong>
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
                      value={toTrinhData.ngayTrinh}
                      onChange={(e) => setToTrinhData({ ...toTrinhData, ngayTrinh: e.target.value })}
                      className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                    />
                  ) : (
                    <span>
                      {new Date(toTrinhData.ngayTrinh).getDate()} tháng {new Date(toTrinhData.ngayTrinh).getMonth() + 1} năm {new Date(toTrinhData.ngayTrinh).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-300 my-3" />

            {/* Document Title: TỜ TRÌNH */}
            <div className="text-center my-5 space-y-1">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                TỜ TRÌNH
              </h2>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={toTrinhData.tieuDeTrinh}
                  onChange={(e) => setToTrinhData({ ...toTrinhData, tieuDeTrinh: e.target.value })}
                  className="w-full text-center text-xs font-bold uppercase border border-amber-400 rounded p-1"
                />
              ) : (
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 max-w-xl mx-auto">
                  {toTrinhData.tieuDeTrinh}
                </p>
              )}
            </div>

            {/* Kính gửi Section */}
            <div className="my-4 text-xs font-semibold text-slate-800 space-y-1">
              <div>
                <strong>Kính gửi: </strong>
              </div>
              <div className="pl-6 space-y-0.5">
                {toTrinhData.kinhGui.map((kg, i) => (
                  <p key={i}>- {kg}</p>
                ))}
              </div>
            </div>

            {/* Legal grounds */}
            <div className="space-y-1 text-xs italic text-slate-700 my-4">
              {toTrinhData.canCu?.map((c, i) => (
                <p key={i}>- {c}</p>
              ))}
            </div>

            {/* Body Content */}
            <div className="my-4 text-xs text-justify leading-relaxed">
              {isEditing ? (
                <textarea
                  rows={4}
                  value={toTrinhData.noiDungTrinh}
                  onChange={(e) => setToTrinhData({ ...toTrinhData, noiDungTrinh: e.target.value })}
                  className="w-full border border-amber-400 rounded p-2 text-xs"
                />
              ) : (
                <p className="indent-6">{toTrinhData.noiDungTrinh}</p>
              )}
            </div>

            {/* SUMMARY STATS OF NOMINATED PERSONNEL */}
            <div className="my-4 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1">
              <div className="font-bold text-slate-800">Tổng hợp danh sách đề nghị phê duyệt ({approvedList.length} đồng chí):</div>
              <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                <li>Nâng bậc lương đúng niên hạn: {approvedList.filter((i) => i.loaiNangLuong === 'Đúng thời hạn').length} đồng chí</li>
                <li>Nâng bậc lương trước thời hạn (có thành tích khen thưởng): {approvedList.filter((i) => i.loaiNangLuong === 'Trước thời hạn').length} đồng chí</li>
                <li>Nâng phụ cấp thâm niên vượt khung: {approvedList.filter((i) => i.loaiNangLuong === 'Vượt khung').length} đồng chí</li>
                <li>Hưởng và nâng mức phụ cấp thâm niên nghề Quân đội: {approvedList.length} đồng chí</li>
              </ul>
            </div>

            <p className="text-xs italic text-slate-700 indent-6 my-3">
              Trường Cao Đẳng Hậu cần 2 kính trình Thủ trưởng Tổng cục Hậu cần xem xét, quyết định phê duyệt./.
            </p>

            {/* ===================================================================== */}
            {/* SIGNATURE SECTION: SCHOOL SUBMISSION + CRITICAL REQUIREMENT:          */}
            {/* "riêng phần tờ trình tổng cục duyệt thì chỗ ký phải là thủ trưởng    */}
            {/*  Tổng cục Hậu Cần Ký"                                                 */}
            {/* ===================================================================== */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Bên trái: Nơi nhận & Đơn vị lập tờ trình */}
              <div className="space-y-4">
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold italic text-slate-700">Nơi nhận:</div>
                  {toTrinhData.noiNhan?.map((n, i) => (
                    <div key={i}>- {n}</div>
                  ))}
                </div>

                {/* Chữ ký của Đơn vị trình (Hiệu trưởng) */}
                <div className="pt-2 text-center md:text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    HIỆU TRƯỞNG TRƯỜNG CĐ HẬU CẦN 2
                  </div>
                  <div className="text-[11px] italic text-slate-500 mb-14">
                    (Ký tên, đóng dấu)
                  </div>
                  <div className="text-xs font-bold uppercase text-slate-900">
                    {toTrinhData.nguoiKyTrinh}
                  </div>
                </div>
              </div>

              {/* BÊN PHẢI: KHUNG PHÊ DUYỆT CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN KÝ DUYỆT */}
              <div className="p-4 bg-amber-50/70 border-2 border-amber-600/70 rounded-xl text-center relative shadow-xs">
                <div className="absolute -top-3 left-4 bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  PHẦN PHÊ DUYỆT CỦA CẤP TRÊN
                </div>

                <div className="text-xs font-black uppercase tracking-wider text-slate-950 mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={toTrinhData.chucDanhPheDuyet}
                      onChange={(e) => setToTrinhData({ ...toTrinhData, chucDanhPheDuyet: e.target.value })}
                      className="border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold text-center w-full"
                    />
                  ) : (
                    toTrinhData.chucDanhPheDuyet
                  )}
                </div>

                <div className="text-[11px] font-bold text-amber-900 mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={toTrinhData.chucVuNguoiPheDuyet}
                      onChange={(e) => setToTrinhData({ ...toTrinhData, chucVuNguoiPheDuyet: e.target.value })}
                      className="border border-amber-400 rounded px-1.5 py-0.5 text-xs text-center w-full"
                    />
                  ) : (
                    toTrinhData.chucVuNguoiPheDuyet
                  )}
                </div>

                {/* Ý kiến phê duyệt */}
                <div className="my-2.5 p-2 bg-white/90 border border-amber-200 rounded text-left text-[11px] text-slate-800 italic">
                  <strong>Ý kiến phê duyệt: </strong>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={toTrinhData.yKienPheDuyet}
                      onChange={(e) => setToTrinhData({ ...toTrinhData, yKienPheDuyet: e.target.value })}
                      className="w-full border border-amber-400 rounded p-1 text-xs mt-1 not-italic font-sans"
                    />
                  ) : (
                    <span>"{toTrinhData.yKienPheDuyet}"</span>
                  )}
                </div>

                <div className="text-[11px] italic text-slate-600 mb-14">
                  (Ký tên, đóng dấu Tổng cục Hậu cần)
                </div>

                {/* Người ký duyệt: THỦ TRƯỞNG TỔNG CỤC HẬU CẦN KÝ */}
                <div className="text-xs font-black uppercase text-slate-950 border-t border-amber-200 pt-2">
                  {isEditing ? (
                    <div className="flex gap-2 justify-center">
                      <input
                        type="text"
                        value={toTrinhData.capBacNguoiPheDuyet}
                        onChange={(e) => setToTrinhData({ ...toTrinhData, capBacNguoiPheDuyet: e.target.value })}
                        className="border border-amber-400 rounded px-1 py-0.5 text-xs w-24 text-center font-bold"
                      />
                      <input
                        type="text"
                        value={toTrinhData.nguoiPheDuyet}
                        onChange={(e) => setToTrinhData({ ...toTrinhData, nguoiPheDuyet: e.target.value })}
                        className="border border-amber-400 rounded px-1 py-0.5 text-xs text-center font-bold"
                      />
                    </div>
                  ) : (
                    <span>
                      {toTrinhData.capBacNguoiPheDuyet ? `${toTrinhData.capBacNguoiPheDuyet} ` : ''}
                      {toTrinhData.nguoiPheDuyet}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Appendix Table: Official Military Standard with Dual Groups: LƯƠNG HIỆN HƯỞNG & XẾP LƯƠNG MỚI */}
            <MilitaryPayrollAppendixTable
              approvedList={approvedList}
              qncnList={qncnList}
              documentNumber={toTrinhData.soToTrinh}
              documentDate={toTrinhData.ngayTrinh}
              documentType="totrinh"
              allowanceScope={allowanceScope}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENT 2: QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN                   */}
        {/* ========================================================================= */}
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

            {/* Appendix Table: Official Military Standard with Dual Groups: LƯƠNG HIỆN HƯỞNG & XẾP LƯƠNG MỚI */}
            <MilitaryPayrollAppendixTable
              approvedList={approvedList}
              qncnList={qncnList}
              documentNumber={qdData.soQuyetDinh}
              documentDate={qdData.ngayKy}
              documentType="tongcuc"
              allowanceScope={allowanceScope}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENT 3: BẢN TRÍCH SAO QUYẾT ĐỊNH CỦA HIỆU TRƯỞNG TRƯỜNG CĐ HẬU CẦN 2 */}
        {/* ========================================================================= */}
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

            {/* Appendix Table: Official Military Standard with Dual Groups: LƯƠNG HIỆN HƯỞNG & XẾP LƯƠNG MỚI */}
            <MilitaryPayrollAppendixTable
              approvedList={approvedList}
              qncnList={qncnList}
              documentNumber={tsData.soTrichSao}
              documentDate={tsData.ngaySao}
              documentType="trichsao"
              allowanceScope={allowanceScope}
            />
          </div>
        )}
      </div>
    </div>
  );
};
