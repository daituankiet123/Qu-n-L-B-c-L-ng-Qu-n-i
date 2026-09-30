import React from 'react';
import { ReviewProposalItem, QNCNProfile, ReviewAllowanceScope } from '../../types';

interface MilitaryPayrollAppendixTableProps {
  approvedList: ReviewProposalItem[];
  qncnList?: QNCNProfile[];
  documentNumber: string;
  documentDate: string;
  documentType?: 'totrinh' | 'tongcuc' | 'trichsao';
  allowanceScope?: ReviewAllowanceScope;
  appendixSignerName?: string;
  appendixSignerTitle?: string;
}

/**
 * Format date into standard military MM/YY (e.g. 01/06, 12/22, 07/26)
 */
export function formatMonthYearShort(dateStr?: string): string {
  if (!dateStr) return '';
  // Check if already in MM/YY format
  if (/^\d{2}\/\d{2}$/.test(dateStr.trim())) return dateStr.trim();
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = String(d.getFullYear()).slice(-2);
    return `${m}/${y}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format military salary scale category (e.g. CC-1, CC-2, TC-1, SC)
 */
export function formatNgachShort(ngachStr?: string): string {
  if (!ngachStr) return 'CC-1';
  if (ngachStr.includes('CC-1') || ngachStr.includes('CC1')) return 'CC-1';
  if (ngachStr.includes('CC-2') || ngachStr.includes('CC2')) return 'CC-2';
  if (ngachStr.includes('TC-1') || ngachStr.includes('TC1')) return 'TC-1';
  if (ngachStr.includes('TC-2') || ngachStr.includes('TC2')) return 'TC-2';
  if (ngachStr.includes('Cao cấp Nhóm 1') || ngachStr.includes('Cao cấp - Nhóm 1')) return 'CC-1';
  if (ngachStr.includes('Cao cấp Nhóm 2') || ngachStr.includes('Cao cấp - Nhóm 2')) return 'CC-2';
  if (ngachStr.includes('Trung cấp Nhóm 1')) return 'TC-1';
  if (ngachStr.includes('Trung cấp Nhóm 2')) return 'TC-2';
  if (ngachStr.includes('Sơ cấp')) return 'SC';
  return ngachStr;
}

/**
 * Format pay grade step with max step (e.g. 5/12, 9/12, 6/12)
 */
export function formatBacStep(bac?: number | string, ngachStr?: string): string {
  if (bac === undefined || bac === null || bac === '') return '';
  const isCC = !ngachStr || ngachStr.includes('Cao cấp') || ngachStr.includes('CC');
  const maxBac = isCC ? 12 : 10;
  return `${bac}/${maxBac}`;
}

/**
 * Format Vietnamese decimal number with comma (e.g. 5,25, 6,65, 7,00)
 */
export function formatVietnameseNumber(val?: number | string): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return String(val);
  return num.toFixed(2).replace('.', ',');
}

/**
 * Military rank abbreviation as used in official military personnel documents:
 * 4// = Đại tá QNCN
 * 3// = Thượng tá QNCN
 * 2// = Trung tá QNCN
 * 1// = Thiếu tá QNCN
 * 4/  = Đại úy QNCN
 * 3/  = Thượng úy QNCN
 * 2/  = Trung úy QNCN
 * 1/  = Thiếu úy QNCN
 */
export function formatMilitaryRankShort(rank?: string): string {
  if (!rank) return '';
  if (rank.includes('Đại tá')) return '4//';
  if (rank.includes('Thượng tá')) return '3//';
  if (rank.includes('Trung tá')) return '2//';
  if (rank.includes('Thiếu tá')) return '1//';
  if (rank.includes('Đại úy')) return '4/';
  if (rank.includes('Thượng úy')) return '3/';
  if (rank.includes('Trung úy')) return '2/';
  if (rank.includes('Thiếu úy')) return '1/';
  return rank;
}

/**
 * Calculate promoted military rank code (e.g. 1//, 2//, 3//)
 * when salary grade qualifies for military rank advancement
 */
export function getPromotedRankShort(
  currentRank: string,
  newBac: number,
  loaiNangLuong: string
): string {
  if (loaiNangLuong === 'Vượt khung') return '';
  const currentShort = formatMilitaryRankShort(currentRank);

  // Reaching Bậc 5 (5.25): promote from 4/ (Đại úy) to 1// (Thiếu tá)
  if (newBac >= 5 && currentShort === '4/') return '1//';

  // Reaching Bậc 7 (5.95) or 8 (6.30): promote from 1// (Thiếu tá) to 2// (Trung tá)
  if (newBac >= 7 && currentShort === '1//') return '2//';

  // Reaching Bậc 9 (6.65) or 10 (7.00): promote from 2// (Trung tá) to 3// (Thượng tá)
  if (newBac >= 9 && currentShort === '2//') return '3//';

  // Reaching Bậc 11 (7.35) or 12 (7.70): promote from 3// (Thượng tá) to 4// (Đại tá)
  if (newBac >= 11 && currentShort === '3//') return '4//';

  return '';
}

/**
 * Military unit abbreviation (e.g. P.TMHC, P.ĐT, P.HCKT, K.YHCS, K.YHLS...)
 */
export function formatUnitShort(donVi?: string): string {
  if (!donVi) return '';
  const map: Record<string, string> = {
    'Phòng Tham mưu - Hậu cần': 'P.TMHC',
    'Phòng Tham mưu': 'P.TM',
    'Phòng Đào tạo': 'P.ĐT',
    'Phòng Hậu cần - Kỹ thuật': 'P.HCKT',
    'Phòng Chính trị': 'P.CT',
    'Ban Tài chính': 'B.TC',
    'Ban Quân lực': 'B.QL',
    'Ban Hậu cần': 'B.HC',
    'Khoa Y học Cơ sở': 'K.YHCS',
    'Khoa Y học Lâm sàng': 'K.YHLS',
    'Khoa Y học Quân sự': 'K.YHQS',
    'Khoa Hậu cần Quân sự': 'K.HCQS',
    'Khoa Vận tải - Quân nhu': 'K.VTQN',
    'Khoa Dược': 'K.D',
    'Khoa Điều dưỡng': 'K.ĐD',
    'Tiểu đoàn Quản lý học viên': 'TĐ.QLHV',
  };

  for (const [k, v] of Object.entries(map)) {
    if (donVi.toLowerCase().includes(k.toLowerCase())) return v;
  }

  // Shorten generic names
  let shortened = donVi
    .replace(/^Phòng\s+/i, 'P.')
    .replace(/^Khoa\s+/i, 'K.')
    .replace(/^Ban\s+/i, 'B.')
    .replace(/^Tiểu đoàn\s+/i, 'TĐ.')
    .replace(/^Bộ môn\s+/i, 'BM.');

  return shortened;
}

export const MilitaryPayrollAppendixTable: React.FC<MilitaryPayrollAppendixTableProps> = ({
  approvedList,
  qncnList = [],
  documentNumber,
  documentDate,
  documentType = 'totrinh',
  allowanceScope = 'Tổng hợp cả 3 chế độ',
  appendixSignerName,
  appendixSignerTitle,
}) => {
  // Map qncnId to profile for fast lookup of enlistment date and allowances
  const profileMap = React.useMemo(() => {
    const map = new Map<string, QNCNProfile>();
    qncnList.forEach((p) => {
      map.set(p.id, p);
      map.set(p.maQNCN, p);
    });
    return map;
  }, [qncnList]);

  // Group items into categories matching military official reports:
  // I. NÂNG BẬC LƯƠNG TX
  // II. NÂNG BẬC LƯƠNG TRƯỚC THỜI HẠN (nếu có)
  // III. HƯỞNG PHỤ CẤP TNVK (nếu có)
  // IV. KÉO DÀI THỜI HẠN DO KỶ LUẬT (nếu có)
  const regularList = approvedList.filter((i) => i.loaiNangLuong === 'Đúng thời hạn' || i.loaiNangLuong === 'Thường xuyên');
  const earlyList = approvedList.filter((i) => i.loaiNangLuong === 'Trước thời hạn');
  const vuotKhungList = approvedList.filter((i) => i.loaiNangLuong === 'Vượt khung');
  const disciplinedList = approvedList.filter(
    (i) => i.loaiNangLuong === 'Kéo dài do kỷ luật' || (i.kyLuat && i.kyLuat !== 'Không')
  );
  const otherList = approvedList.filter(
    (i) =>
      i.loaiNangLuong !== 'Đúng thời hạn' &&
      i.loaiNangLuong !== 'Thường xuyên' &&
      i.loaiNangLuong !== 'Trước thời hạn' &&
      i.loaiNangLuong !== 'Vượt khung' &&
      i.loaiNangLuong !== 'Kéo dài do kỷ luật' &&
      (!i.kyLuat || i.kyLuat === 'Không')
  );

  // Group sections with sequential Roman numerals
  const rawSections = [
    {
      title: `NÂNG BẬC LƯƠNG TX = ${regularList.length}`,
      items: regularList,
    },
    ...(earlyList.length > 0
      ? [
          {
            title: `NÂNG BẬC LƯƠNG TRƯỚC THỜI HẠN = ${earlyList.length}`,
            items: earlyList,
          },
        ]
      : []),
    ...(vuotKhungList.length > 0
      ? [
          {
            title: `HƯỞNG PHỤ CẤP TNVK = ${vuotKhungList.length}`,
            items: vuotKhungList,
          },
        ]
      : []),
    ...(disciplinedList.length > 0
      ? [
          {
            title: `KÉO DÀI THỜI HẠN NÂNG BẬC LƯƠNG DO KỶ LUẬT = ${disciplinedList.length}`,
            items: disciplinedList,
          },
        ]
      : []),
    ...(otherList.length > 0
      ? [
          {
            title: `CÁC TRƯỜNG HỢP KHÁC = ${otherList.length}`,
            items: otherList,
          },
        ]
      : []),
  ];

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const sections = rawSections.map((sec, idx) => ({
    roman: romanNumerals[idx] || `${idx + 1}`,
    ...sec,
  }));

  const safeDate = React.useMemo(() => {
    if (!documentDate) return { day: '15', month: '03', year: '2026' };
    try {
      const d = new Date(documentDate);
      if (isNaN(d.getTime())) return { day: '15', month: '03', year: '2026' };
      return {
        day: String(d.getDate()).padStart(2, '0'),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        year: String(d.getFullYear()),
      };
    } catch {
      return { day: '15', month: '03', year: '2026' };
    }
  }, [documentDate]);

  let currentGlobalIndex = 0;

  const appendixId =
    documentType === 'trichsao'
      ? 'doc-trichsao-appendix'
      : documentType === 'tongcuc'
      ? 'doc-tongcuc-appendix'
      : 'doc-totrinh-appendix';

  return (
    <div
      id={appendixId}
      className="appendix-table-section break-before-page page-break-before mt-4 pt-2 font-serif text-black print:mt-2 print:pt-0"
    >
      {/* Appendix Header */}
      <div className="text-center mb-4 space-y-1">
        <div className="text-xs font-bold italic">Phụ lục</div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black">
          {documentType === 'trichsao'
            ? 'BẢN TRÍCH SAO DANH SÁCH'
            : documentType === 'tongcuc'
            ? 'DANH SÁCH QUÂN NHÂN CHUYÊN NGHIỆP'
            : 'DANH SÁCH ĐỀ NGHỊ'}
        </h3>
        <h4 className="text-xs font-bold uppercase tracking-wide text-black">
          {allowanceScope === 'Phụ cấp thâm niên nghề'
            ? `NÂNG PHỤ CẤP THÂM NIÊN NGHỀ QUÂN ĐỘI NĂM ${safeDate.year}`
            : allowanceScope === 'Phụ cấp thâm niên vượt khung'
            ? `HƯỞNG PHỤ CẤP THÂM NIÊN VƯỢT KHUNG NĂM ${safeDate.year}`
            : allowanceScope === 'Nâng bậc lương & Vượt khung'
            ? `NÂNG BẬC LƯƠNG VÀ PHỤ CẤP TNVK NĂM ${safeDate.year}`
            : `NÂNG BẬC LƯƠNG THƯỜNG XUYÊN, HƯỞNG PHỤ CẤP TNVK, THĂNG QUÂN HÀM QNCN NĂM ${safeDate.year}`}
        </h4>
        <p className="text-[11px] italic text-black">
          (Kèm theo {documentType === 'totrinh' ? 'Tờ trình số:' : documentType === 'tongcuc' ? 'Quyết định số:' : 'Bản Trích sao số:'}{' '}
          <span className="font-semibold underline underline-offset-2">{documentNumber || '.../...'}</span>{' '}
          ngày <span className="font-semibold">{safeDate.day} / {safeDate.month} / {safeDate.year}</span>{' '}
          của {documentType === 'tongcuc' ? 'Thủ trưởng Tổng cục Hậu cần' : 'Trường Cao đẳng Hậu cần 2'})
        </p>
      </div>

      {/* Main Table Matching Official Military Template */}
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse border border-black font-sans print:text-[8pt] print:leading-tight" style={{ borderCollapse: 'collapse', border: '1.5px solid #000000', backgroundColor: '#ffffff', color: '#000000' }}>
          <thead>
            {/* Header Row 1: 5 Main Administrative Groups (Zero rowSpan, immune to html2canvas clipping) */}
            <tr className="font-bold text-black text-center text-xs" style={{ backgroundColor: '#e2e8f0', border: 'none' }}>
              <th
                colSpan={4}
                className="border border-black p-1.5 text-center font-bold uppercase tracking-wider text-black"
                style={{ backgroundColor: '#e2e8f0', color: '#000000', border: '1px solid #000000' }}
              >
                THÔNG TIN QUÂN NHÂN
              </th>
              <th
                colSpan={6}
                className="border border-black p-1.5 text-center font-bold uppercase tracking-wider text-black"
                style={{ backgroundColor: '#e2e8f0', color: '#000000', border: '1px solid #000000' }}
              >
                LƯƠNG HIỆN HƯỞNG
              </th>
              <th
                colSpan={1}
                className="border border-black p-1.5 text-center font-bold uppercase tracking-wider text-black"
                style={{ backgroundColor: '#e2e8f0', color: '#000000', border: '1px solid #000000' }}
              >
                QUÂN HÀM
              </th>
              <th
                colSpan={7}
                className="border border-black p-1.5 text-center font-bold uppercase tracking-wider text-black"
                style={{ backgroundColor: '#e2e8f0', color: '#000000', border: '1px solid #000000' }}
              >
                XẾP LƯƠNG MỚI
              </th>
              <th
                colSpan={1}
                className="border border-black p-1.5 text-center font-bold uppercase tracking-wider text-black"
                style={{ backgroundColor: '#e2e8f0', color: '#000000', border: '1px solid #000000' }}
              >
                ĐƠN VỊ
              </th>
            </tr>

            {/* Header Row 2: All 19 Individual Columns (Zero rowSpan, 100% visible and perfectly aligned) */}
            <tr className="font-bold text-black text-center text-[9.5px] print:text-[7pt] leading-tight" style={{ backgroundColor: '#f1f5f9', border: 'none' }}>
              {/* Group 1: Thông tin quân nhân */}
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '32px', minWidth: '30px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                TT
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '155px', minWidth: '140px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                HỌ VÀ TÊN
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '65px', minWidth: '58px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Nhập ngũ,
                <br />
                Tuyển dụng
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '105px', minWidth: '95px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Chức vụ
                <br />
                (CNQS đang làm)
              </th>

              {/* Group 2: LƯƠNG HIỆN HƯỞNG */}
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '52px', minWidth: '46px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Tháng
                <br />
                năm
                <br />
                nhận
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '55px', minWidth: '48px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Loại
                <br />
                nhóm
                <br />
                ngạch
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '42px', minWidth: '38px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Bậc
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '50px', minWidth: '44px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Hệ
                <br />
                số
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '45px', minWidth: '40px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                %<br />
                PC
                <br />
                TN
                <br />
                VK
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '42px', minWidth: '38px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                HS
                <br />
                bảo
                <br />
                lưu
              </th>

              {/* Group 3: QUÂN HÀM */}
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '55px', minWidth: '48px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Quân hàm
                <br />
                QNCN
              </th>

              {/* Group 4: XẾP LƯƠNG MỚI */}
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '55px', minWidth: '48px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Loại
                <br />
                nhóm
                <br />
                ngạch
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '45px', minWidth: '40px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Bậc
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '50px', minWidth: '44px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Hệ
                <br />
                số
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '45px', minWidth: '40px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                %<br />
                PC
                <br />
                TN
                <br />
                VK
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '42px', minWidth: '38px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                HS
                <br />
                bảo
                <br />
                lưu
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '58px', minWidth: '50px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Thăng
                <br />
                quân
                <br />
                hàm
                <br />
                QNCN
              </th>
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '52px', minWidth: '46px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                Tháng
                <br />
                năm
                <br />
                nhận
              </th>

              {/* Group 5: ĐƠN VỊ */}
              <th
                className="border border-black p-1 text-center font-bold"
                style={{ width: '75px', minWidth: '65px', backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                ĐƠN VỊ
              </th>
            </tr>

            {/* Header Row 3: Official Standard Column Numbering (1) to (19) */}
            <tr className="text-black text-center text-[8.5px] print:text-[6.5pt] italic" style={{ backgroundColor: '#f8fafc', border: 'none' }}>
              {Array.from({ length: 19 }, (_, i) => (
                <th
                  key={i}
                  className="border border-black py-0.5 px-0.5 text-center font-normal"
                  style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #000000' }}
                >
                  ({i + 1})
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sections.map((sec, secIdx) => {
              if (sec.items.length === 0) return null;

              // Break section into ngạch groups like: "+ CAO CẤP = 24"
              const caoCapCount = sec.items.filter(
                (i) => !i.ngach || i.ngach.includes('Cao cấp') || i.ngach.includes('CC')
              ).length;
              const trungCapCount = sec.items.filter(
                (i) => i.ngach && (i.ngach.includes('Trung cấp') || i.ngach.includes('TC'))
              ).length;
              const soCapCount = sec.items.filter(
                (i) => i.ngach && (i.ngach.includes('Sơ cấp') || i.ngach.includes('SC'))
              ).length;

              return (
                <React.Fragment key={secIdx}>
                  {/* Category Header (e.g. I | NÂNG BẬC LƯƠNG TX = 3) */}
                  <tr className="font-extrabold text-black" style={{ backgroundColor: '#f1f5f9', border: 'none' }}>
                    <td
                      className="border border-black p-1 text-center font-bold"
                      style={{ backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
                    >
                      {sec.roman}
                    </td>
                    <td
                      colSpan={18}
                      className="border border-black p-1 uppercase font-bold tracking-wide"
                      style={{ backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
                    >
                      {sec.title}
                    </td>
                  </tr>

                  {/* Sub-group row (e.g. + | CAO CẤP = 24) */}
                  {caoCapCount > 0 && (
                    <tr className="font-bold text-black" style={{ backgroundColor: '#f8fafc', border: 'none' }}>
                      <td
                        className="border border-black p-1 text-center font-bold"
                        style={{ backgroundColor: '#f8fafc', color: '#000000', border: '1px solid #000000' }}
                      >
                        +
                      </td>
                      <td
                        colSpan={18}
                        className="border border-black p-1 font-bold uppercase text-[10px]"
                        style={{ backgroundColor: '#f8fafc', color: '#000000', border: '1px solid #000000' }}
                      >
                        CAO CẤP = {caoCapCount}
                      </td>
                    </tr>
                  )}
                  {trungCapCount > 0 && (
                    <tr className="font-bold text-black" style={{ backgroundColor: '#f8fafc', border: 'none' }}>
                      <td
                        className="border border-black p-1 text-center font-bold"
                        style={{ backgroundColor: '#f8fafc', color: '#000000', border: '1px solid #000000' }}
                      >
                        +
                      </td>
                      <td
                        colSpan={18}
                        className="border border-black p-1 font-bold uppercase text-[10px]"
                        style={{ backgroundColor: '#f8fafc', color: '#000000', border: '1px solid #000000' }}
                      >
                        TRUNG CẤP = {trungCapCount}
                      </td>
                    </tr>
                  )}
                  {soCapCount > 0 && (
                    <tr className="font-bold text-black" style={{ backgroundColor: '#f8fafc', border: 'none' }}>
                      <td
                        className="border border-black p-1 text-center font-bold"
                        style={{ backgroundColor: '#f8fafc', color: '#000000', border: '1px solid #000000' }}
                      >
                        +
                      </td>
                      <td
                        colSpan={18}
                        className="border border-black p-1 font-bold uppercase text-[10px]"
                        style={{ backgroundColor: '#f8fafc', color: '#000000', border: '1px solid #000000' }}
                      >
                        SƠ CẤP = {soCapCount}
                      </td>
                    </tr>
                  )}

                  {/* Personnel Rows */}
                  {sec.items.map((item) => {
                    currentGlobalIndex += 1;
                    const profile = profileMap.get(item.qncnId) || profileMap.get(item.maQNCN);

                    // Nhập ngũ / Tuyển dụng format MM/YY
                    const rawNhapNgu = profile?.ngayNhapNgu;
                    const nhapNguShort = rawNhapNgu
                      ? formatMonthYearShort(rawNhapNgu)
                      : '01/06';

                    // Lương hiện hưởng
                    const thangNamNhanHienTai = formatMonthYearShort(item.ngayHuongHienTai);
                    const loaiNgachHienTai = formatNgachShort(item.ngach);
                    const bacHienTaiStr = formatBacStep(item.bacHienTai, item.ngach);
                    const heSoHienTaiStr = formatVietnameseNumber(item.heSoHienTai);
                    const pctnvkHienTai =
                      profile && profile.phanTramVuotKhung > 0
                        ? `${profile.phanTramVuotKhung}`
                        : '';
                    const hsBaoLuuHienTai = '';

                    // Quân hàm QNCN
                    const quanHamHienTai = formatMilitaryRankShort(item.capBac);

                    // Xếp lương mới
                    const loaiNgachMoi = formatNgachShort(item.ngach);
                    const isVuotKhung = item.loaiNangLuong === 'Vượt khung';
                    const bacMoiStr = isVuotKhung
                      ? `${item.bacHienTai}/12`
                      : formatBacStep(item.bacDeXuat, item.ngach);
                    const heSoMoiStr = isVuotKhung
                      ? formatVietnameseNumber(item.heSoHienTai)
                      : formatVietnameseNumber(item.heSoDeXuat);
                    const pctnvkMoi = item.vuotKhungDeXuat > 0 ? `${item.vuotKhungDeXuat}` : '';
                    const hsBaoLuuMoi = '';

                    // Thăng quân hàm QNCN
                    const thangQuanHam = getPromotedRankShort(
                      item.capBac,
                      item.bacDeXuat,
                      item.loaiNangLuong
                    );

                    // Tháng năm nhận mới
                    const thangNamNhanMoi = formatMonthYearShort(item.ngayHuongMoi);

                    // Đơn vị rút gọn
                    const donViShort = formatUnitShort(item.donVi);

                    return (
                      <tr
                        key={item.id}
                        className="text-black leading-snug"
                        style={{ border: 'none', backgroundColor: '#ffffff' }}
                      >
                        {/* TT */}
                        <td
                          className="border border-black p-1 text-center font-mono"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {currentGlobalIndex}
                        </td>

                        {/* Họ và tên */}
                        <td
                          className="border border-black p-1 font-bold whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          <div>{item.hoVaTen}</div>
                          {item.loaiNangLuong === 'Kéo dài do kỷ luật' && (
                            <div className="text-[9px] font-medium text-rose-700 italic not-print:font-semibold">
                              * Kéo dài thời hạn ({item.kyLuat || 'Kỷ luật'})
                            </div>
                          )}
                        </td>

                        {/* Nhập ngũ, Tuyển dụng */}
                        <td
                          className="border border-black p-1 text-center font-mono whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {nhapNguShort}
                        </td>

                        {/* Chức vụ */}
                        <td
                          className="border border-black p-1 whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {item.chucVu}
                        </td>

                        {/* --- LƯƠNG HIỆN HƯỞNG --- */}
                        {/* Tháng năm nhận */}
                        <td
                          className="border border-black p-1 text-center font-mono whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {thangNamNhanHienTai}
                        </td>
                        {/* Loại nhóm ngạch */}
                        <td
                          className="border border-black p-1 text-center font-mono whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {loaiNgachHienTai}
                        </td>
                        {/* Bậc */}
                        <td
                          className="border border-black p-1 text-center font-mono whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {bacHienTaiStr}
                        </td>
                        {/* Hệ số */}
                        <td
                          className="border border-black p-1 text-right font-mono font-medium pr-1.5"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {heSoHienTaiStr}
                        </td>
                        {/* % PC TN VK */}
                        <td
                          className="border border-black p-1 text-center font-mono"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {pctnvkHienTai}
                        </td>
                        {/* HS bảo lưu */}
                        <td
                          className="border border-black p-1 text-center font-mono"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {hsBaoLuuHienTai}
                        </td>

                        {/* --- QUÂN HÀM QNCN --- */}
                        <td
                          className="border border-black p-1 text-center font-mono font-semibold"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {quanHamHienTai}
                        </td>

                        {/* --- XẾP LƯƠNG MỚI --- */}
                        {/* Loại nhóm ngạch */}
                        <td
                          className="border border-black p-1 text-center font-mono whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {loaiNgachMoi}
                        </td>
                        {/* Bậc */}
                        <td
                          className="border border-black p-1 text-center font-mono font-bold whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {bacMoiStr}
                        </td>
                        {/* Hệ số */}
                        <td
                          className="border border-black p-1 text-right font-mono font-bold pr-1.5"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {heSoMoiStr}
                        </td>
                        {/* % PC TN VK */}
                        <td
                          className="border border-black p-1 text-center font-mono font-semibold"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {pctnvkMoi}
                        </td>
                        {/* HS bảo lưu */}
                        <td
                          className="border border-black p-1 text-center font-mono"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {hsBaoLuuMoi}
                        </td>
                        {/* Thăng quân hàm QNCN */}
                        <td
                          className="border border-black p-1 text-center font-mono font-bold"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {thangQuanHam}
                        </td>
                        {/* Tháng năm nhận */}
                        <td
                          className="border border-black p-1 text-center font-mono whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {thangNamNhanMoi}
                        </td>

                        {/* ĐƠN VỊ */}
                        <td
                          className="border border-black p-1 text-center font-medium whitespace-nowrap"
                          style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', verticalAlign: 'middle' }}
                        >
                          {donViShort}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Summary Row */}
            <tr className="font-bold text-black" style={{ backgroundColor: '#f1f5f9', border: 'none' }}>
              <td
                className="border border-black p-1.5 text-center font-bold"
                style={{ backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                CỘNG
              </td>
              <td
                colSpan={18}
                className="border border-black p-1.5 uppercase font-bold tracking-wide"
                style={{ backgroundColor: '#f1f5f9', color: '#000000', border: '1px solid #000000' }}
              >
                TỔNG SỐ: {currentGlobalIndex} ĐỒNG CHÍ ĐỀ NGHỊ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Explanatory notes below table in official standard */}
      <div className="mt-3 text-[10px] text-slate-700 italic space-y-0.5 print:text-[7pt]">
        <p>
          * Ghi chú ký hiệu quân hàm QNCN: 1/ (Thiếu úy), 2/ (Trung úy), 3/ (Thượng úy), 4/ (Đại úy), 1// (Thiếu tá), 2// (Trung tá), 3// (Thượng tá), 4// (Đại tá QNCN).
        </p>
        <p>
          * Cột Xếp lương mới: Đối với QNCN đủ điều kiện thăng quân hàm theo niên hạn nâng lương, hệ thống tự động đề xuất cấp bậc quân hàm mới tại cột "Thăng quân hàm QNCN".
        </p>
      </div>

      {/* Official Confirmation Signatures Block at Bottom of Appendix */}
      <table className="admin-doc-table w-full mt-6 text-slate-950 font-serif" style={{ width: '100%', borderCollapse: 'collapse', border: 'none', backgroundColor: 'transparent' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 8px 0 0', backgroundColor: 'transparent' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-black">
                {documentType === 'trichsao'
                  ? 'TRƯỞNG BAN TÀI CHÍNH'
                  : documentType === 'tongcuc'
                  ? 'TL. THỦ TRƯỞNG TỔNG CỤC'
                  : 'TRƯỞNG BAN QUÂN LỰC'}
              </div>
              {documentType === 'tongcuc' && (
                <div className="text-xs font-bold uppercase tracking-wider text-black">CỤC TRƯỞNG CỤC CÁN BỘ</div>
              )}
              <div className="text-[11px] italic text-slate-600 my-1">
                (Ký, ghi rõ họ tên)
              </div>
              <div className="h-14"></div>
              <div className="text-xs font-bold uppercase text-black">
                {documentType === 'trichsao'
                  ? 'Trung tá Nguyễn Văn Thành'
                  : documentType === 'tongcuc'
                  ? 'Thiếu tướng Lê Hồng Quân'
                  : 'Trung tá Lê Minh Tuấn'}
              </div>
            </td>

            <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'center', border: 'none', padding: '0 0 0 8px', backgroundColor: 'transparent' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-black">
                {appendixSignerTitle ||
                  (documentType === 'trichsao'
                    ? 'HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG HẬU CẦN 2'
                    : documentType === 'tongcuc'
                    ? 'THỦ TRƯỞNG TỔNG CỤC HẬU CẦN'
                    : 'HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG HẬU CẦN 2')}
              </div>
              <div className="text-[11px] italic text-slate-600 my-1">
                {documentType === 'trichsao'
                  ? '(Chứng thực sao y bản chính, ký và đóng dấu)'
                  : '(Ký tên, đóng dấu)'}
              </div>
              <div className="h-14"></div>
              <div className="text-xs font-bold uppercase text-black">
                {appendixSignerName ||
                  (documentType === 'tongcuc' ? 'Trung tướng Nguyễn Văn Điều' : 'Đại tá Trần Hữu Nghĩa')}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
