import React, { useState, useEffect } from 'react';
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
  FileDown,
  ChevronDown,
  CheckSquare,
  AlertTriangle,
  Download,
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
import { exportElementToPdf, exportMilitaryDocumentToPdf } from '../../services/pdfExportService';
import { useToast } from '../../context/ToastContext';

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

export const formatSignerDisplay = (rank?: string, name?: string): string => {
  const cleanName = (name || '').trim();
  const cleanRank = (rank || '').trim();
  if (!cleanName) return cleanRank;
  if (!cleanRank) return cleanName;

  const militaryRanks = [
    'đại tướng',
    'thượng tướng',
    'trung tướng',
    'thiếu tướng',
    'đại tá',
    'thượng tá',
    'trung tá',
    'thiếu tá',
    'đại úy',
    'thượng úy',
    'trung úy',
    'thiếu úy',
  ];

  const lowerName = cleanName.toLowerCase();
  const alreadyHasRank = militaryRanks.some((r) => lowerName.startsWith(r));
  if (alreadyHasRank) {
    return cleanName;
  }
  return `${cleanRank} ${cleanName}`;
};

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPdfDropdown, setShowPdfDropdown] = useState(false);
  const [includeAllInCycle, setIncludeAllInCycle] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const toast = useToast();
  const [allowanceScope, setAllowanceScope] = useState<ReviewAllowanceScope>(
    cycle?.loaiCheDo || 'Tổng hợp cả 3 chế độ'
  );

  // Editable state for Document 1: TỜ TRÌNH XIN PHÊ DUYỆT TỔNG CỤC
  const [toTrinhData, setToTrinhData] = useState<ToTrinhTongCucInfo>({
    soToTrinh: cycle?.toTrinh?.soToTrinh || '89/TTr-HC2',
    ngayTrinh: cycle?.toTrinh?.ngayTrinh || '2026-03-15',
    coQuanCapTren: cycle?.toTrinh?.coQuanCapTren || 'BỘ QUỐC PHÒNG',
    coQuanTongCuc: cycle?.toTrinh?.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT',
    donViTrinh: cycle?.toTrinh?.donViTrinh || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
    tieuDeTrinh:
      cycle?.toTrinh?.tieuDeTrinh ||
      'Về việc đề nghị phê duyệt nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho Quân nhân chuyên nghiệp Đợt 1 năm 2026',
    kinhGui: cycle?.toTrinh?.kinhGui || [
      'Thủ trưởng Tổng cục Hậu cần - Kỹ thuật;',
      'Cục Cán bộ - Tổng cục Chính trị;',
      'Cục Quân lực - Bộ Tổng Tham mưu.',
    ],
    canCu: cycle?.toTrinh?.canCu || [
      'Căn cứ Luật Quân nhân chuyên nghiệp, công nhân và viên chức quốc phòng năm 2015;',
      'Căn cứ Nghị định số 204/2004/NĐ-CP và Nghị định số 73/2024/NĐ-CP của Chính phủ;',
      'Căn cứ Thông tư số 170/2016/TT-BQP của Bộ Quốc phòng quy định cấp bậc quân hàm QNCN tương ứng với mức lương;',
      'Căn cứ Biên bản họp xét nâng bậc lương của Hội đồng lương Trường Cao Đẳng Hậu cần 2 ngày 14/03/2026.',
    ],
    noiDungTrinh:
      cycle?.toTrinh?.noiDungTrinh ||
      'Trường Cao Đẳng Hậu cần 2 kính trình Thủ trưởng Tổng cục Hậu cần xem xét, quyết định nâng bậc lương thường xuyên, nâng bậc lương trước thời hạn có thành tích xuất sắc, nâng phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp đủ tiêu chuẩn, điều kiện đợt 1 năm 2026 (danh sách trích ngang kèm theo).',
    nguoiKyTrinh: cycle?.toTrinh?.nguoiKyTrinh || 'Đại tá Trần Hữu Nghĩa',
    chucVuNguoiKyTrinh: cycle?.toTrinh?.chucVuNguoiKyTrinh || 'Hiệu trưởng Trường Cao Đẳng Hậu cần 2',
    capBacNguoiKyTrinh: cycle?.toTrinh?.capBacNguoiKyTrinh || 'Đại tá',
    chucDanhPheDuyet:
      cycle?.toTrinh?.chucDanhPheDuyet || 'THỦ TRƯỞNG TỔNG CỤC HẬU CẦN PHÊ DUYỆT',
    chucVuNguoiPheDuyet: cycle?.toTrinh?.chucVuNguoiPheDuyet || 'Chủ nhiệm Tổng cục Hậu cần',
    capBacNguoiPheDuyet: cycle?.toTrinh?.capBacNguoiPheDuyet || 'Trung tướng',
    nguoiPheDuyet: cycle?.toTrinh?.nguoiPheDuyet || 'Nguyễn Văn Điều',
    yKienPheDuyet:
      cycle?.toTrinh?.yKienPheDuyet ||
      'Đồng ý phê duyệt nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp Trường Cao Đẳng Hậu cần 2 theo danh sách đề nghị. Giao Cục Cán bộ hoàn tất Quyết định ban hành.',
    ngayPheDuyet: cycle?.toTrinh?.ngayPheDuyet || '2026-03-22',
    noiNhan: cycle?.toTrinh?.noiNhan || [
      'Như Kính gửi;',
      'Phòng Chính trị;',
      'Ban Quân lực;',
      'Lưu: VT, HC2.',
    ],
  });

  // Editable state for Document 2: QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN
  const [qdData, setQdData] = useState<QuyetDinhTongCucInfo>({
    soQuyetDinh: cycle?.quyetDinh?.soQuyetDinh || '318/QĐ-TCHC',
    ngayKy: cycle?.quyetDinh?.ngayKy || '2026-03-24',
    chucDanhNguoiKy: cycle?.quyetDinh?.chucDanhNguoiKy || 'THỦ TRƯỞNG TỔNG CỤC HẬU CẦN',
    chucVuNguoiKy: cycle?.quyetDinh?.chucVuNguoiKy || 'Chủ nhiệm Tổng cục Hậu cần',
    capBacNguoiKy: cycle?.quyetDinh?.capBacNguoiKy || 'Trung tướng',
    nguoiKy: cycle?.quyetDinh?.nguoiKy || 'Nguyễn Văn Điều',
    coQuanCapTren: cycle?.quyetDinh?.coQuanCapTren || 'BỘ QUỐC PHÒNG',
    coQuanBanHanh: cycle?.quyetDinh?.coQuanBanHanh || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT',
    trichYeu:
      cycle?.quyetDinh?.trichYeu ||
      'Về việc nâng bậc lương, phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung đối với Quân nhân chuyên nghiệp các đơn vị trực thuộc Tổng cục Hậu cần Đợt 1 năm 2026',
    canCu: cycle?.quyetDinh?.canCu || [
      'Căn cứ Luật Quân nhân chuyên nghiệp, công nhân và viên chức quốc phòng năm 2015;',
      'Căn cứ Nghị định số 204/2004/NĐ-CP và Nghị định số 73/2024/NĐ-CP của Chính phủ;',
      'Căn cứ Thông tư số 170/2016/TT-BQP của Bộ Quốc phòng quy định cấp bậc quân hàm QNCN tương ứng với mức lương;',
      'Xét đề nghị của Hiệu trưởng Trường Cao Đẳng Hậu cần 2 tại Tờ trình số 89/TTr-HC2 ngày 15/03/2026 và đề nghị của Cục trưởng Cục Cán bộ.',
    ],
    dieu1:
      cycle?.quyetDinh?.dieu1 ||
      'Nâng bậc lương, nâng phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp thuộc Trường Cao Đẳng Hậu cần 2 (có danh sách kèm theo).',
    dieu2:
      cycle?.quyetDinh?.dieu2 ||
      'Các đồng chí có tên tại Điều 1 được hưởng chế độ tiền lương và phụ cấp mới kể từ ngày ghi trong danh sách trích ngang kèm theo Quyết định này. Thời gian xét nâng bậc lần sau tính từ ngày hưởng mới.',
    dieu3:
      cycle?.quyetDinh?.dieu3 ||
      'Cục trưởng Cục Cán bộ, Cục trưởng Cục Quân sự, Cục trưởng Cục Tài chính, Hiệu trưởng Trường Cao Đẳng Hậu cần 2 và các đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.',
    noiNhan: cycle?.quyetDinh?.noiNhan || [
      'Bộ Tư lệnh Tổng cục Hậu cần;',
      'Trường Cao Đẳng Hậu cần 2 (để trích sao và thực hiện);',
      'Cục Cán bộ, Cục Quân lực, Cục Tài chính;',
      'Lưu: VT, CB.',
    ],
  });

  // Editable state for Document 3: BẢN TRÍCH SAO QUYẾT ĐỊNH CỦA TRƯỜNG CĐ HẬU CẦN 2
  const [tsData, setTsData] = useState<TrichSaoDonViInfo>({
    soTrichSao: cycle?.trichSao?.soTrichSao || '52/TS-HC2',
    ngaySao: cycle?.trichSao?.ngaySao || '2026-03-28',
    chucDanhKySao: cycle?.trichSao?.chucDanhKySao || 'HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
    nguoiKySao: cycle?.trichSao?.nguoiKySao || 'Đại tá Trần Hữu Nghĩa',
    coQuanCapTren: cycle?.trichSao?.coQuanCapTren || 'BỘ QUỐC PHÒNG',
    coQuanTongCuc: cycle?.trichSao?.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT',
    donViSao: cycle?.trichSao?.donViSao || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
    chungThuc:
      cycle?.trichSao?.chungThuc ||
      'Sao y bản chính Quyết định số 318/QĐ-TCHC ngày 24 tháng 03 năm 2026 của Thủ trưởng Tổng cục Hậu cần để các cơ quan, khoa giáo viên, đơn vị trực thuộc Trường Cao Đẳng Hậu cần 2 và cá nhân liên quan thi hành.',
    dieu1Trích:
      cycle?.trichSao?.dieu1Trích ||
      'Nâng bậc lương, nâng phụ cấp thâm niên nghề và phụ cấp thâm niên vượt khung cho các đồng chí Quân nhân chuyên nghiệp thuộc Trường Cao Đẳng Hậu cần 2 (có danh sách trích sao kèm theo).',
    dieu2Trích:
      cycle?.trichSao?.dieu2Trích ||
      'Các đồng chí có tên tại Điều 1 được hưởng bậc lương mới, hệ số lương mới và phụ cấp kể từ ngày ghi trong danh sách trích sao. Ban Tài chính Trường Cao Đẳng Hậu cần 2 thực hiện tính toán chi trả các chế độ tiền lương mới theo quy định.',
    dieu3Trích:
      cycle?.trichSao?.dieu3Trích ||
      'Hiệu trưởng Trường Cao Đẳng Hậu cần 2, Trưởng phòng Chính trị, Trưởng ban Quân lực, Trưởng ban Tài chính, Chỉ huy các cơ quan, đơn vị có liên quan và các đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.',
    noiNhanSao: cycle?.trichSao?.noiNhanSao || [
      'Phòng Chính trị (để theo dõi);',
      'Ban Tài chính (để lập dự toán và chi trả lương mới);',
      'Ban Quân lực (để quản lý hồ sơ QNCN);',
      'Các khoa, phòng, ban trực thuộc có quân nhân được nâng lương;',
      'Lưu vào Hồ sơ cán bộ của từng quân nhân;',
      'Lưu: VT, QL.',
    ],
  });

  // Sync tab when requested tab changes or modal opens
  useEffect(() => {
    if (defaultTab) {
      setActiveDocTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  // Sync cycle data when cycle changes
  useEffect(() => {
    if (cycle) {
      if (cycle.loaiCheDo) {
        setAllowanceScope(cycle.loaiCheDo);
      }
      if (cycle.toTrinh) {
        setToTrinhData((prev) => ({ ...prev, ...cycle.toTrinh }));
      }
      if (cycle.quyetDinh) {
        setQdData((prev) => ({ ...prev, ...cycle.quyetDinh }));
      }
      if (cycle.trichSao) {
        setTsData((prev) => ({ ...prev, ...cycle.trichSao }));
      }
    }
  }, [cycle]);

  const [includeDisciplined, setIncludeDisciplined] = useState(true);

  const disciplinedInCycle = (cycle?.danhSachDeXuat || []).filter(
    (i) => i.loaiNangLuong === 'Kéo dài do kỷ luật' || (i.kyLuat && i.kyLuat !== 'Không')
  );

  const approvedList = (cycle?.danhSachDeXuat || []).filter(
    (i) => i.trangThaiPheDuyet === 'Đã duyệt'
  );

  // Personnel list to render in official documents and 19-column appendix table
  const rawList =
    includeAllInCycle || approvedList.length === 0
      ? (cycle?.danhSachDeXuat || [])
      : approvedList;

  const displayList = includeDisciplined
    ? rawList
    : rawList.filter((i) => i.loaiNangLuong !== 'Kéo dài do kỷ luật' && (!i.kyLuat || i.kyLuat === 'Không'));

  // Safe Vietnamese date formatter
  const formatVN = (dateStr?: string) => {
    if (!dateStr) return { day: '15', month: '03', year: '2026', full: 'ngày 15 tháng 03 năm 2026' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '15', month: '03', year: '2026', full: 'ngày 15 tháng 03 năm 2026' };
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      return { day, month, year, full: `ngày ${day} tháng ${month} năm ${year}` };
    } catch {
      return { day: '15', month: '03', year: '2026', full: 'ngày 15 tháng 03 năm 2026' };
    }
  };

  const handlePrint = () => {
    toast.info(
      'Đang gửi lệnh in văn bản...',
      'Nếu trình duyệt không mở hộp thoại in, đồng chí hãy bấm nút "Tải PDF (.pdf)" để nhận tệp ngay.',
      { badge: 'IN ẤN', duration: 3500 }
    );
    try {
      window.print();
    } catch (e) {
      console.warn('Print blocked:', e);
      handleExportPdf(activeDocTab);
    }
  };

  /**
   * Real PDF File Export using jsPDF & html2canvas:
   * Generates and downloads an authentic .pdf file directly to the user's computer.
   */
  const handleExportPdf = async (targetDoc?: 'totrinh' | 'tongcuc' | 'trichsao' | 'all') => {
    const docType = targetDoc || activeDocTab;

    let defaultFileName = 'To_Trinh_89_TTr_HC2_Phe_Duyet_Nang_Luong';
    if (docType === 'tongcuc') {
      defaultFileName = 'Quyet_Dinh_318_QD_TCHC_Nang_Bac_Luong';
    } else if (docType === 'trichsao') {
      defaultFileName = 'Trich_Sao_52_TS_HC2_Quyet_Dinh_Nang_Luong';
    }

    setIsExportingPdf(true);
    toast.info('Đang kết xuất tệp PDF...', 'Vui lòng chờ trong giây lát trong khi hệ thống tạo văn bản.', {
      badge: 'XUẤT PDF',
      duration: 3000,
    });

    try {
      if (docType === 'all') {
        // Sequentially switch to each document tab so DOM elements are mounted and visible for html2canvas
        // 1. Tờ trình
        setActiveDocTab('totrinh');
        await new Promise((r) => setTimeout(r, 250));
        await exportMilitaryDocumentToPdf({
          fileName: '1_To_Trinh_89_TTr_HC2_Phe_Duyet.pdf',
          mainElementId: 'doc-totrinh-main',
          appendixElementId: 'doc-totrinh-appendix',
          title: 'TỜ TRÌNH ĐỀ NGHỊ PHÊ DUYỆT NÂNG LƯƠNG QNCN',
        });

        // 2. Quyết định
        setActiveDocTab('tongcuc');
        await new Promise((r) => setTimeout(r, 250));
        await exportMilitaryDocumentToPdf({
          fileName: '2_Quyet_Dinh_318_QD_TCHC_Nang_Luong.pdf',
          mainElementId: 'doc-tongcuc-main',
          appendixElementId: 'doc-tongcuc-appendix',
          title: 'QUYẾT ĐỊNH NÂNG BẬC LƯƠNG QNCN',
        });

        // 3. Bản trích sao
        setActiveDocTab('trichsao');
        await new Promise((r) => setTimeout(r, 250));
        await exportMilitaryDocumentToPdf({
          fileName: '3_Trich_Sao_52_TS_HC2_Quyet_Dinh.pdf',
          mainElementId: 'doc-trichsao-main',
          appendixElementId: 'doc-trichsao-appendix',
          title: 'BẢN TRÍCH SAO QUYẾT ĐỊNH NÂNG BẬC LƯƠNG',
        });

        toast.success(
          'Đã xuất trọn bộ 3 tệp PDF thành công!',
          'Các văn bản Tờ trình, Quyết định và Bản trích sao đã được tải về máy của đồng chí.',
          { badge: 'XUẤT PDF', duration: 4000 }
        );
      } else {
        if (activeDocTab !== docType) {
          setActiveDocTab(docType);
          await new Promise((r) => setTimeout(r, 250));
        }

        const success = await exportMilitaryDocumentToPdf({
          fileName: `${defaultFileName}.pdf`,
          mainElementId: `doc-${docType}-main`,
          appendixElementId: `doc-${docType}-appendix`,
          title:
            docType === 'totrinh'
              ? 'TỜ TRÌNH ĐỀ NGHỊ PHÊ DUYỆT NÂNG LƯƠNG QNCN'
              : docType === 'tongcuc'
              ? 'QUYẾT ĐỊNH NÂNG BẬC LƯƠNG QNCN'
              : 'BẢN TRÍCH SAO QUYẾT ĐỊNH NÂNG BẬC LƯƠNG',
        });
        if (success) {
          toast.success(
            'Đã xuất file PDF thành công!',
            `Tệp PDF "${defaultFileName}.pdf" đã được lưu về máy của đồng chí.`,
            { badge: 'XUẤT PDF', duration: 4000 }
          );
        }
      }
    } catch (e) {
      console.error(e);
      handleDownloadHtml(docType);
      toast.info('Đã tải tệp văn bản in ấn HTML', 'Tệp in ấn đã được tải về máy của đồng chí.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  /**
   * Download standalone printable HTML file with embedded styling
   */
  const handleDownloadHtml = (targetDoc?: 'totrinh' | 'tongcuc' | 'trichsao' | 'all') => {
    const docType = targetDoc || activeDocTab;
    let elementId = 'doc-totrinh-content';
    let defaultFileName = 'To_Trinh_89_TTr_HC2_Phe_Duyet_Nang_Luong';
    let docTitle = 'TỜ TRÌNH ĐỀ NGHỊ PHÊ DUYỆT NÂNG LƯƠNG QNCN - TRƯỜNG CĐHC2';

    if (docType === 'tongcuc') {
      elementId = 'doc-tongcuc-content';
      defaultFileName = 'Quyet_Dinh_318_QD_TCHC_Nang_Bac_Luong';
      docTitle = 'QUYẾT ĐỊNH NÂNG BẬC LƯƠNG QNCN - TỔNG CỤC HẬU CẦN';
    } else if (docType === 'trichsao') {
      elementId = 'doc-trichsao-content';
      defaultFileName = 'Trich_Sao_52_TS_HC2_Quyet_Dinh_Nang_Luong';
      docTitle = 'BẢN TRÍCH SAO QUYẾT ĐỊNH NÂNG BẬC LƯƠNG - TRƯỜNG CĐHC2';
    } else if (docType === 'all') {
      defaultFileName = 'Tron_Bo_3_Van_Ban_Nang_Luong_HC2';
      docTitle = 'TRỌN BỘ TỜ TRÌNH, QUYẾT ĐỊNH & BẢN TRÍCH SAO - TRƯỜNG CĐHC2';
    }

    let innerContent = '';
    if (docType === 'all') {
      const el1 = document.getElementById('doc-totrinh-content')?.innerHTML || '';
      const el2 = document.getElementById('doc-tongcuc-content')?.innerHTML || '';
      const el3 = document.getElementById('doc-trichsao-content')?.innerHTML || '';
      innerContent = `
        <div class="print-document-section mb-12">${el1}</div>
        <div style="page-break-before: always;" class="print-document-section pt-8 mb-12">${el2}</div>
        <div style="page-break-before: always;" class="print-document-section pt-8">${el3}</div>
      `;
    } else {
      const el = document.getElementById(elementId);
      innerContent = el ? el.innerHTML : '';
    }

    const htmlString = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${docTitle}</title>
  <style>
    @page {
      size: landscape;
      margin: 8mm 10mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      background: #ffffff !important;
      color: #000000 !important;
      font-size: 9.5pt;
      line-height: 1.45;
      padding: 15px;
      margin: 0;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 8pt !important;
    }
    tr {
      page-break-inside: avoid;
    }
    thead {
      display: table-header-group;
    }
    th, td {
      border: 1px solid #1e293b !important;
      padding: 3px 4px !important;
    }
    table.admin-doc-table, table.admin-doc-table tr, table.admin-doc-table td, table.admin-doc-table th {
      border: none !important;
      padding: 0 !important;
      background: transparent !important;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  ${innerContent}
</body>
</html>`;

    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${defaultFileName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    let elId = 'doc-totrinh-content';
    if (activeDocTab === 'tongcuc') elId = 'doc-tongcuc-content';
    if (activeDocTab === 'trichsao') elId = 'doc-trichsao-content';

    const text = document.getElementById(elId)?.innerText || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveTemplateChanges = () => {
    if (onUpdateCycleDocuments) {
      onUpdateCycleDocuments(toTrinhData, qdData, tsData, allowanceScope);
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleScopeChange = (newScope: ReviewAllowanceScope) => {
    setAllowanceScope(newScope);
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

  // Safe early return ONLY after all React Hooks have been declared
  if (!isOpen) return null;

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

            {/* PDF Export Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowPdfDropdown(!showPdfDropdown)}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                title="Tải văn bản về máy dưới dạng file PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {isExportingPdf
                    ? 'Đang tạo PDF...'
                    : `Xuất file PDF (${activeDocTab === 'totrinh' ? 'Tờ trình' : activeDocTab === 'tongcuc' ? 'Quyết định' : 'Trích sao'})`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showPdfDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs text-slate-200 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                    Tùy chọn tải tệp PDF
                  </div>
                  <button
                    onClick={() => {
                      setShowPdfDropdown(false);
                      handleExportPdf(activeDocTab);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 font-bold text-white transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Xuất PDF văn bản đang xem</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPdfDropdown(false);
                      handleExportPdf('totrinh');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-300 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>1. Tải PDF Tờ trình Tổng cục</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPdfDropdown(false);
                      handleExportPdf('tongcuc');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-300 transition-colors"
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Tải PDF Quyết định Tổng cục</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPdfDropdown(false);
                      handleExportPdf('trichsao');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-300 transition-colors"
                  >
                    <Stamp className="w-3.5 h-3.5 text-amber-400" />
                    <span>3. Tải PDF Bản Trích sao Đơn vị</span>
                  </button>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setShowPdfDropdown(false);
                      handleExportPdf('all');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 font-bold text-amber-300 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tải trọn bộ 3 văn bản ra PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPdfDropdown(false);
                      handleDownloadHtml(activeDocTab);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tải file HTML in sẵn (.html)</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
              title="Mở hộp thoại in ấn trực tiếp từ trình duyệt"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              In văn bản
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
          {/* Allowance Scope Dropdown & Personnel Selection Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 px-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
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

              {/* Tích chọn tất cả quân nhân trong đợt vào phụ lục */}
              <button
                type="button"
                onClick={() => setIncludeAllInCycle(!includeAllInCycle)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all border shadow-xs ${
                  includeAllInCycle
                    ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-500/40'
                    : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50'
                }`}
                title="Tích chọn đưa tất cả các quân nhân có trong đợt xét vào danh sách trích ngang kèm theo"
              >
                <CheckSquare className={`w-3.5 h-3.5 ${includeAllInCycle ? 'text-amber-300' : 'text-emerald-700'}`} />
                <span>
                  {includeAllInCycle
                    ? `✓ Phụ lục: Đang chọn tất cả (${cycle.danhSachDeXuat.length} đ/c trong đợt)`
                    : `Tích chọn tất cả ${cycle.danhSachDeXuat.length} quân nhân trong đợt`}
                </span>
              </button>

              {/* Bật/Tắt xét duyệt kỷ luật kéo dài thời hạn */}
              <button
                type="button"
                onClick={() => setIncludeDisciplined(!includeDisciplined)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all border shadow-xs ${
                  includeDisciplined
                    ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-400/40 hover:bg-amber-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Xét duyệt và đưa các trường hợp Kéo dài thời hạn do kỷ luật vào Quyết định Tổng cục & Bản Trích sao"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${includeDisciplined ? 'text-amber-200' : 'text-amber-600'}`} />
                <span>
                  {includeDisciplined
                    ? `✓ Phê duyệt Kỷ luật kéo dài (${disciplinedInCycle.length} đ/c)`
                    : `Bỏ qua hồ sơ Kỷ luật (${disciplinedInCycle.length})`}
                </span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              * Tờ trình, Quyết định và Bản Trích sao đồng bộ trích xuất theo danh sách {displayList.length} quân nhân
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
        {saveSuccess && (
          <div className="no-print bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-300" />
              Đã lưu thành công các thông tin điều chỉnh của mẫu văn bản vào hệ thống!
            </span>
            <button
              onClick={() => setSaveSuccess(false)}
              className="text-white hover:text-emerald-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
            className="p-6 sm:p-10 text-slate-950 overflow-y-auto font-serif leading-relaxed text-sm bg-white flex-1"
          >
            <div id="doc-totrinh-main" className="admin-doc-page">
              {/* Header Block: 2-Column Administrative Table (Never Collapses) */}
              <table className="admin-doc-table w-full mb-3 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ width: '46%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 8px 0 0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {isEditing ? (
                        <input
                          type="text"
                          value={toTrinhData.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                          onChange={(e) => setToTrinhData({ ...toTrinhData, coQuanCapTren: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                        />
                      ) : (
                        toTrinhData.coQuanCapTren || 'BỘ QUỐC PHÒNG'
                      )}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-0.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={toTrinhData.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                          onChange={(e) => setToTrinhData({ ...toTrinhData, coQuanTongCuc: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                        />
                      ) : (
                        toTrinhData.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'
                      )}
                    </div>
                    <div className="text-xs font-black uppercase tracking-wide text-emerald-950 mt-0.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={toTrinhData.donViTrinh || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'}
                          onChange={(e) => setToTrinhData({ ...toTrinhData, donViTrinh: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs font-bold text-center w-full"
                        />
                      ) : (
                        toTrinhData.donViTrinh || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'
                      )}
                    </div>
                    <div className="w-24 h-[1px] bg-black mx-auto my-1"></div>
                    <div className="text-xs mt-1 text-slate-800 flex items-center justify-center gap-1">
                      <span>Số:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={toTrinhData.soToTrinh}
                          onChange={(e) => setToTrinhData({ ...toTrinhData, soToTrinh: e.target.value })}
                          className="border border-amber-400 rounded px-1.5 py-0.5 font-bold font-mono text-xs w-32 text-center"
                        />
                      ) : (
                        <strong className="font-bold text-blue-900">{toTrinhData.soToTrinh}</strong>
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
                          value={toTrinhData.ngayTrinh}
                          onChange={(e) => setToTrinhData({ ...toTrinhData, ngayTrinh: e.target.value })}
                          className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                        />
                      ) : (
                        <span>
                          {formatVN(toTrinhData.ngayTrinh).day} tháng {formatVN(toTrinhData.ngayTrinh).month} năm {formatVN(toTrinhData.ngayTrinh).year}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="border-t border-slate-300 my-4" />

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
              <div className="font-bold text-slate-800">Tổng hợp danh sách đề nghị phê duyệt ({displayList.length} đồng chí):</div>
              <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                <li>Nâng bậc lương đúng niên hạn: {displayList.filter((i) => i.loaiNangLuong === 'Đúng thời hạn' || i.loaiNangLuong === 'Thường xuyên').length} đồng chí</li>
                <li>Nâng bậc lương trước thời hạn (có thành tích khen thưởng): {displayList.filter((i) => i.loaiNangLuong === 'Trước thời hạn').length} đồng chí</li>
                <li>Nâng phụ cấp thâm niên vượt khung: {displayList.filter((i) => i.loaiNangLuong === 'Vượt khung').length} đồng chí</li>
                <li>Hưởng và nâng mức phụ cấp thâm niên nghề Quân đội: {displayList.length} đồng chí</li>
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
            <table className="admin-doc-table w-full mt-8 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  {/* Bên trái: Nơi nhận & Đơn vị lập tờ trình */}
                  <td style={{ width: '48%', verticalAlign: 'top', textAlign: 'left', border: 'none', padding: '0 12px 0 0' }}>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold italic text-slate-700">Nơi nhận:</div>
                      {toTrinhData.noiNhan?.map((n, i) => (
                        <div key={i}>- {n}</div>
                      ))}
                    </div>

                    <div className="pt-6 text-center">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={toTrinhData.chucVuNguoiKyTrinh || 'HIỆU TRƯỞNG TRƯỜNG CĐ HẬU CẦN 2'}
                            onChange={(e) => setToTrinhData({ ...toTrinhData, chucVuNguoiKyTrinh: e.target.value })}
                            className="border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold text-center w-full uppercase"
                            placeholder="Chức danh người ký trình"
                          />
                        ) : (
                          toTrinhData.chucVuNguoiKyTrinh || 'HIỆU TRƯỞNG TRƯỜNG CĐ HẬU CẦN 2'
                        )}
                      </div>
                      <div className="text-[11px] italic text-slate-500 mb-14 mt-1">
                        (Ký tên, đóng dấu)
                      </div>
                      <div className="text-xs font-bold uppercase text-slate-900">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={toTrinhData.nguoiKyTrinh}
                              onChange={(e) => setToTrinhData({ ...toTrinhData, nguoiKyTrinh: e.target.value, capBacNguoiKyTrinh: '' })}
                              className="border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold text-center w-full uppercase"
                              placeholder="Cấp bậc & Họ tên người ký trình (VD: Đại tá Trần Hữu Nghĩa)"
                            />
                            <div className="flex flex-wrap items-center justify-center gap-1 text-[10px]">
                              <span className="text-slate-500 font-normal">Gợi ý:</span>
                              <button
                                type="button"
                                onClick={() => setToTrinhData({ ...toTrinhData, capBacNguoiKyTrinh: '', nguoiKyTrinh: 'Đại tá Trần Hữu Nghĩa' })}
                                className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 hover:bg-blue-200 font-semibold"
                              >
                                Đại tá Trần Hữu Nghĩa
                              </button>
                              <button
                                type="button"
                                onClick={() => setToTrinhData({ ...toTrinhData, capBacNguoiKyTrinh: '', nguoiKyTrinh: 'Trung tá Lê Minh Tuấn' })}
                                className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold"
                              >
                                Trung tá Lê Minh Tuấn
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-emerald-700 hover:underline"
                            onClick={() => setIsEditing(true)}
                            title="Bấm để chỉnh sửa người ký trình"
                          >
                            {toTrinhData.nguoiKyTrinh}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* BÊN PHẢI: PHẦN PHÊ DUYỆT CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN KÝ DUYỆT (KHÔNG KHUNG) */}
                  <td style={{ width: '52%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 12px' }}>
                    <div
                      className="approval-section text-center relative"
                      style={{ backgroundColor: 'transparent', color: '#000000', border: 'none', outline: 'none', boxShadow: 'none', padding: '0' }}
                    >
                      <div className="text-[11px] font-black uppercase text-black mb-1" style={{ color: '#000000' }}>
                        PHẦN PHÊ DUYỆT CỦA CẤP TRÊN
                      </div>

                      <div className="text-xs font-black uppercase tracking-wider text-black mt-1" style={{ color: '#000000' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={toTrinhData.chucDanhPheDuyet}
                            onChange={(e) => setToTrinhData({ ...toTrinhData, chucDanhPheDuyet: e.target.value })}
                            className="border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold text-center w-full uppercase"
                          />
                        ) : (
                          toTrinhData.chucDanhPheDuyet
                        )}
                      </div>

                      <div className="text-[11px] font-bold text-black mt-1" style={{ color: '#000000' }}>
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
                      <div
                        className="my-2 p-1.5 text-center text-[11px] text-slate-800 italic"
                        style={{ backgroundColor: 'transparent', color: '#000000', border: 'none' }}
                      >
                        <strong style={{ color: '#000000' }}>Ý kiến phê duyệt: </strong>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={toTrinhData.yKienPheDuyet}
                            onChange={(e) => setToTrinhData({ ...toTrinhData, yKienPheDuyet: e.target.value })}
                            className="w-full border border-amber-400 rounded p-1 text-xs mt-1 not-italic font-sans"
                          />
                        ) : (
                          <span style={{ color: '#000000' }}>"{toTrinhData.yKienPheDuyet}"</span>
                        )}
                      </div>

                      <div className="text-[11px] italic text-slate-600 mb-14">
                        (Ký tên, đóng dấu Tổng cục Hậu cần)
                      </div>

                      {/* Người ký duyệt: THỦ TRƯỞNG TỔNG CỤC HẬU CẦN KÝ */}
                      <div
                        className="text-xs font-black uppercase text-black pt-1"
                        style={{ color: '#000000' }}
                      >
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={toTrinhData.nguoiPheDuyet}
                              onChange={(e) => setToTrinhData({ ...toTrinhData, nguoiPheDuyet: e.target.value, capBacNguoiPheDuyet: '' })}
                              className="border border-amber-400 rounded px-2 py-0.5 text-xs text-center font-bold w-full max-w-[280px] mx-auto block uppercase"
                              placeholder="Cấp bậc & Họ tên người phê duyệt"
                            />
                            <div className="flex flex-wrap items-center justify-center gap-1 text-[10px]">
                              <span className="text-slate-500 font-normal">Gợi ý:</span>
                              <button
                                type="button"
                                onClick={() => setToTrinhData({ ...toTrinhData, capBacNguoiPheDuyet: '', nguoiPheDuyet: 'Trung tướng Nguyễn Văn Điều' })}
                                className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-semibold"
                              >
                                Trung tướng Nguyễn Văn Điều
                              </button>
                              <button
                                type="button"
                                onClick={() => setToTrinhData({ ...toTrinhData, capBacNguoiPheDuyet: '', nguoiPheDuyet: 'Đại tá Trần Hữu Nghĩa' })}
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
                            title="Bấm để chỉnh sửa người phê duyệt"
                          >
                            {formatSignerDisplay(toTrinhData.capBacNguoiPheDuyet, toTrinhData.nguoiPheDuyet)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Appendix Table: Official Military Standard with Dual Groups: LƯƠNG HIỆN HƯỞNG & XẾP LƯƠNG MỚI */}
            <div
              id="doc-totrinh-appendix-wrapper"
              className="appendix-table-section break-before-page page-break-before mt-4 pt-2 print:break-before-page print:mt-2 print:pt-0"
            >
              <MilitaryPayrollAppendixTable
                approvedList={displayList}
                qncnList={qncnList}
                documentNumber={toTrinhData.soToTrinh}
                documentDate={toTrinhData.ngayTrinh}
                documentType="totrinh"
                allowanceScope={allowanceScope}
                appendixSignerName={toTrinhData.nguoiKyTrinh}
                appendixSignerTitle={toTrinhData.chucVuNguoiKyTrinh}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENT 2: QUYẾT ĐỊNH CỦA THỦ TRƯỞNG TỔNG CỤC HẬU CẦN                   */}
        {/* ========================================================================= */}
        {activeDocTab === 'tongcuc' && (
          <div
            id="doc-tongcuc-content"
            className="p-6 sm:p-10 text-slate-950 overflow-y-auto font-serif leading-relaxed text-sm bg-white flex-1"
          >
            <div id="doc-tongcuc-main" className="admin-doc-page">
              {/* Header Block: 2-Column Administrative Table (Never Collapses) */}
              <table className="admin-doc-table w-full mb-3 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ width: '46%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 8px 0 0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {isEditing ? (
                        <input
                          type="text"
                          value={qdData.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                          onChange={(e) => setQdData({ ...qdData, coQuanCapTren: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                        />
                      ) : (
                        qdData.coQuanCapTren || 'BỘ QUỐC PHÒNG'
                      )}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-0.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={qdData.coQuanBanHanh || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                          onChange={(e) => setQdData({ ...qdData, coQuanBanHanh: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                        />
                      ) : (
                        qdData.coQuanBanHanh || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'
                      )}
                    </div>
                    <div className="w-24 h-[1px] bg-black mx-auto my-1"></div>
                    <div className="text-xs mt-1 text-slate-800 flex items-center justify-center gap-1">
                      <span>Số:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={qdData.soQuyetDinh}
                          onChange={(e) => setQdData({ ...qdData, soQuyetDinh: e.target.value })}
                          className="border border-amber-400 rounded px-1.5 py-0.5 font-bold text-xs w-28 text-center"
                        />
                      ) : (
                        <strong className="font-bold">{qdData.soQuyetDinh}</strong>
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
                          value={qdData.ngayKy}
                          onChange={(e) => setQdData({ ...qdData, ngayKy: e.target.value })}
                          className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                        />
                      ) : (
                        <span>
                          {formatVN(qdData.ngayKy).day} tháng {formatVN(qdData.ngayKy).month} năm {formatVN(qdData.ngayKy).year}
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
              {qdData.canCu?.map((c, i) => (
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

            {/* Signature Block: 2-Column Administrative Table (Never Collapses) */}
            <table className="admin-doc-table w-full mt-8 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ width: '48%', verticalAlign: 'top', textAlign: 'left', border: 'none', padding: '0 12px 0 0' }}>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold italic text-slate-700">Nơi nhận:</div>
                      {qdData.noiNhan?.map((n, i) => (
                        <div key={i}>- {n}</div>
                      ))}
                    </div>
                  </td>

                  <td style={{ width: '52%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 12px' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={qdData.chucDanhNguoiKy}
                          onChange={(e) => setQdData({ ...qdData, chucDanhNguoiKy: e.target.value })}
                          className="border border-amber-400 rounded px-1.5 py-0.5 text-xs font-bold text-center w-full uppercase"
                          placeholder="Chức danh ký (VD: THỦ TRƯỞNG TỔNG CỤC HẬU CẦN)"
                        />
                      ) : (
                        qdData.chucDanhNguoiKy
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={qdData.chucVuNguoiKy}
                          onChange={(e) => setQdData({ ...qdData, chucVuNguoiKy: e.target.value })}
                          className="border border-amber-400 rounded px-1.5 py-0.5 text-xs text-center w-full"
                          placeholder="Chức vụ người ký (VD: Chủ nhiệm Tổng cục Hậu cần)"
                        />
                      ) : (
                        qdData.chucVuNguoiKy
                      )}
                    </div>
                    <div className="text-[11px] italic text-slate-500 mb-14 mt-1">
                      (Ký tên, đóng dấu Tổng cục Hậu cần)
                    </div>
                    <div className="text-xs font-bold uppercase text-slate-900">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={qdData.nguoiKy}
                            onChange={(e) => setQdData({ ...qdData, nguoiKy: e.target.value, capBacNguoiKy: '' })}
                            className="border border-amber-400 rounded px-2 py-1 text-xs text-center font-bold w-full max-w-[320px] mx-auto block uppercase"
                            placeholder="Cấp bậc & Họ tên người ký (VD: Trung tướng Nguyễn Văn Điều hoặc Đại tá Trần Hữu Nghĩa)"
                          />
                          <div className="flex flex-wrap items-center justify-center gap-1 text-[10px]">
                            <span className="text-slate-500 font-normal">Gợi ý chọn nhanh:</span>
                            <button
                              type="button"
                              onClick={() => setQdData({ ...qdData, capBacNguoiKy: '', nguoiKy: 'Trung tướng Nguyễn Văn Điều' })}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-semibold"
                            >
                              Trung tướng Nguyễn Văn Điều
                            </button>
                            <button
                              type="button"
                              onClick={() => setQdData({ ...qdData, capBacNguoiKy: '', nguoiKy: 'Đại tá Trần Hữu Nghĩa' })}
                              className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 hover:bg-blue-200 font-semibold"
                            >
                              Đại tá Trần Hữu Nghĩa
                            </button>
                            <button
                              type="button"
                              onClick={() => setQdData({ ...qdData, capBacNguoiKy: '', nguoiKy: 'Thiếu tướng Lê Hồng Quân' })}
                              className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 hover:bg-purple-200 font-semibold"
                            >
                              Thiếu tướng Lê Hồng Quân
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:text-emerald-700 hover:underline"
                          onClick={() => setIsEditing(true)}
                          title="Bấm để chỉnh sửa tên người ký (như Trung tướng Nguyễn Văn Điều / Đại tá Trần Hữu Nghĩa)"
                        >
                          {formatSignerDisplay(qdData.capBacNguoiKy, qdData.nguoiKy)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Appendix Table: Official Military Standard with Dual Groups: LƯƠNG HIỆN HƯỞNG & XẾP LƯƠNG MỚI */}
            <div
              id="doc-tongcuc-appendix-wrapper"
              className="appendix-table-section break-before-page page-break-before mt-4 pt-2 print:break-before-page print:mt-2 print:pt-0"
            >
              <MilitaryPayrollAppendixTable
                approvedList={displayList}
                qncnList={qncnList}
                documentNumber={qdData.soQuyetDinh}
                documentDate={qdData.ngayKy}
                documentType="tongcuc"
                allowanceScope={allowanceScope}
                appendixSignerName={formatSignerDisplay(qdData.capBacNguoiKy, qdData.nguoiKy)}
                appendixSignerTitle={qdData.chucDanhNguoiKy}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENT 3: BẢN TRÍCH SAO QUYẾT ĐỊNH CỦA HIỆU TRƯỞNG TRƯỜNG CĐ HẬU CẦN 2 */}
        {/* ========================================================================= */}
        {activeDocTab === 'trichsao' && (
          <div
            id="doc-trichsao-content"
            className="p-6 sm:p-10 text-slate-950 overflow-y-auto font-serif leading-relaxed text-sm bg-white flex-1"
          >
            <div id="doc-trichsao-main" className="admin-doc-page">
              {/* Official Military Header: 2-Column Administrative Table (Never Collapses) */}
              <table className="admin-doc-table w-full mb-3 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ width: '46%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 8px 0 0' }}>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tsData.coQuanCapTren || 'BỘ QUỐC PHÒNG'}
                          onChange={(e) => setTsData({ ...tsData, coQuanCapTren: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                        />
                      ) : (
                        tsData.coQuanCapTren || 'BỘ QUỐC PHÒNG'
                      )}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-0.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tsData.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'}
                          onChange={(e) => setTsData({ ...tsData, coQuanTongCuc: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs text-center w-full"
                        />
                      ) : (
                        tsData.coQuanTongCuc || 'TỔNG CỤC HẬU CẦN - KỸ THUẬT'
                      )}
                    </div>
                    <div className="text-xs font-black uppercase tracking-wide text-emerald-950 mt-0.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tsData.donViSao || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'}
                          onChange={(e) => setTsData({ ...tsData, donViSao: e.target.value })}
                          className="border border-amber-400 rounded px-1 text-xs font-bold text-center w-full"
                        />
                      ) : (
                        tsData.donViSao || 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2'
                      )}
                    </div>
                    <div className="w-24 h-[1px] bg-black mx-auto my-1"></div>
                    <div className="text-xs mt-1 text-slate-800 flex items-center justify-center gap-1">
                      <span>Số:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tsData.soTrichSao}
                          onChange={(e) => setTsData({ ...tsData, soTrichSao: e.target.value })}
                          className="border border-amber-400 rounded px-1.5 py-0.5 font-bold text-xs w-28 text-center"
                        />
                      ) : (
                        <strong className="font-bold">{tsData.soTrichSao}</strong>
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
                          value={tsData.ngaySao}
                          onChange={(e) => setTsData({ ...tsData, ngaySao: e.target.value })}
                          className="border border-amber-400 rounded px-1 py-0.5 text-xs"
                        />
                      ) : (
                        <span>
                          {formatVN(tsData.ngaySao).day} tháng {formatVN(tsData.ngaySao).month} năm {formatVN(tsData.ngaySao).year}
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
                Số: {qdData.soQuyetDinh} ngày {formatVN(qdData.ngayKy).day} tháng {formatVN(qdData.ngayKy).month} năm {formatVN(qdData.ngayKy).year} của Thủ trưởng Tổng cục Hậu cần
                {allowanceScope === 'Phụ cấp thâm niên nghề' && ' về việc nâng phụ cấp thâm niên nghề cho QNCN'}
                {allowanceScope === 'Phụ cấp thâm niên vượt khung' && ' về việc nâng phụ cấp thâm niên vượt khung cho QNCN'}
                {allowanceScope === 'Nâng bậc lương & Vượt khung' && ' về việc nâng bậc lương và phụ cấp thâm niên vượt khung cho QNCN'}
                {allowanceScope === 'Tổng hợp cả 3 chế độ' && ' về việc nâng bậc lương, thâm niên nghề và vượt khung cho QNCN'}
              </p>
            </div>

            {/* Authority */}
            <div className="text-center my-3 font-bold uppercase text-xs tracking-wider text-black">
              {qdData.chucDanhNguoiKy}
            </div>

            {/* Legal grounds */}
            <div className="space-y-1 text-xs italic text-slate-800 my-4 text-justify">
              {qdData.canCu?.map((c, i) => (
                <p key={i}>- {c}</p>
              ))}
            </div>

            <div className="text-center font-bold text-xs uppercase tracking-wider my-3 text-black">
              QUYẾT ĐỊNH (TRÍCH):
            </div>

            {/* Articles Extracted */}
            <div className="space-y-3.5 text-xs text-justify">
              <p className="indent-6">
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
              </p>

              <p className="indent-6">
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
              </p>

              <p className="indent-6">
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
              </p>
            </div>

            {/* Signatures & Certification: 2-Column Administrative Table (Never Collapses) */}
            <table className="admin-doc-table w-full mt-6 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  {/* Left Column: Nơi nhận */}
                  <td style={{ width: '48%', verticalAlign: 'top', textAlign: 'left', border: 'none', padding: '0 12px 0 0' }}>
                    <div className="text-xs font-bold italic mb-1.5 text-black">Nơi nhận trích sao:</div>
                    <div className="text-[11px] leading-relaxed text-slate-800 space-y-0.5">
                      {tsData.noiNhanSao?.map((n, i) => (
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
                          value={tsData.chungThuc}
                          onChange={(e) => setTsData({ ...tsData, chungThuc: e.target.value })}
                          className="w-full border border-amber-400 rounded p-1 text-xs"
                        />
                      ) : (
                        <span>{tsData.chungThuc}</span>
                      )}
                    </div>

                    <div className="text-xs font-bold uppercase tracking-wider text-black mt-3">
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
                    <div className="text-xs font-bold uppercase text-black">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={tsData.nguoiKySao}
                            onChange={(e) => setTsData({ ...tsData, nguoiKySao: e.target.value })}
                            className="border border-amber-400 rounded px-2 py-0.5 text-xs text-center font-bold w-full max-w-[280px] mx-auto block uppercase"
                            placeholder="Cấp bậc & Họ tên người ký sao (VD: Đại tá Trần Hữu Nghĩa)"
                          />
                          <div className="flex flex-wrap items-center justify-center gap-1 text-[10px]">
                            <span className="text-slate-500 font-normal">Gợi ý:</span>
                            <button
                              type="button"
                              onClick={() => setTsData({ ...tsData, nguoiKySao: 'Đại tá Trần Hữu Nghĩa' })}
                              className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 hover:bg-blue-200 font-semibold"
                            >
                              Đại tá Trần Hữu Nghĩa
                            </button>
                            <button
                              type="button"
                              onClick={() => setTsData({ ...tsData, nguoiKySao: 'Trung tá Nguyễn Văn Thành' })}
                              className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold"
                            >
                              Trung tá Nguyễn Văn Thành
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:text-emerald-700 hover:underline"
                          onClick={() => setIsEditing(true)}
                          title="Bấm để chỉnh sửa người ký sao"
                        >
                          {tsData.nguoiKySao}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Appendix Table: Official Military Standard with Dual Groups: LƯƠNG HIỆN HƯỞNG & XẾP LƯƠNG MỚI */}
            <div
              id="doc-trichsao-appendix-wrapper"
              className="appendix-table-section break-before-page page-break-before mt-4 pt-2 print:break-before-page print:mt-2 print:pt-0"
            >
              <MilitaryPayrollAppendixTable
                approvedList={displayList}
                qncnList={qncnList}
                documentNumber={tsData.soTrichSao}
                documentDate={tsData.ngaySao}
                documentType="trichsao"
                allowanceScope={allowanceScope}
                appendixSignerName={tsData.nguoiKySao}
                appendixSignerTitle={tsData.chucDanhKySao}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
