import React from 'react';
import { ReviewProposalItem, QNCNProfile, ReviewAllowanceScope } from '../../types';

interface MilitaryPayrollAppendixTableProps {
  approvedList: ReviewProposalItem[];
  qncnList?: QNCNProfile[];
  documentNumber: string;
  documentDate: string;
  documentType?: 'totrinh' | 'tongcuc' | 'trichsao';
  allowanceScope?: ReviewAllowanceScope;
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
export function formatBacStep(bac: number, ngachStr?: string): string {
  const isCC = !ngachStr || ngachStr.includes('Cao cấp') || ngachStr.includes('CC');
  const maxBac = isCC ? 12 : 10;
  return `${bac}/${maxBac}`;
}

/**
 * Format Vietnamese decimal number with comma (e.g. 5,25, 6,65, 7,00)
 */
export function formatVietnameseNumber(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return '';
  return val.toFixed(2).replace('.', ',');
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
  const regularList = approvedList.filter((i) => i.loaiNangLuong === 'Đúng thời hạn' || i.loaiNangLuong === 'Thường xuyên');
  const earlyList = approvedList.filter((i) => i.loaiNangLuong === 'Trước thời hạn');
  const vuotKhungList = approvedList.filter((i) => i.loaiNangLuong === 'Vượt khung');
  const otherList = approvedList.filter(
    (i) =>
      i.loaiNangLuong !== 'Đúng thời hạn' &&
      i.loaiNangLuong !== 'Thường xuyên' &&
      i.loaiNangLuong !== 'Trước thời hạn' &&
      i.loaiNangLuong !== 'Vượt khung'
  );

  // Group sections
  const sections = [
    {
      roman: 'I',
      title: `NÂNG BẬC LƯƠNG TX = ${regularList.length}`,
      items: regularList,
    },
    ...(earlyList.length > 0
      ? [
          {
            roman: 'II',
            title: `NÂNG BẬC LƯƠNG TRƯỚC THỜI HẠN = ${earlyList.length}`,
            items: earlyList,
          },
        ]
      : []),
    ...(vuotKhungList.length > 0
      ? [
          {
            roman: earlyList.length > 0 ? 'III' : 'II',
            title: `HƯỞNG PHỤ CẤP TNVK = ${vuotKhungList.length}`,
            items: vuotKhungList,
          },
        ]
      : []),
    ...(otherList.length > 0
      ? [
          {
            roman: 'IV',
            title: `CÁC TRƯỜNG HỢP KHÁC = ${otherList.length}`,
            items: otherList,
          },
        ]
      : []),
  ];

  let currentGlobalIndex = 0;

  return (
    <div className="mt-8 pt-6 border-t-2 border-black/80 font-serif text-black print:mt-4 print:pt-2">
      {/* Appendix Header */}
      <div className="text-center mb-4 space-y-1">
        <div className="text-xs font-bold italic">Phụ lục</div>
        <h3 className="text-sm font-bold uppercase tracking-wider">
          DANH SÁCH ĐỀ NGHỊ
        </h3>
        <h4 className="text-xs font-bold uppercase tracking-wide">
          NÂNG BẬC LƯƠNG THƯỜNG XUYÊN, HƯỞNG PHỤ CẤP TNVK, THĂNG QUÂN HÀM QNCN NĂM {new Date(documentDate || Date.now()).getFullYear()}
        </h4>
        <p className="text-[11px] italic text-slate-800">
          (Kèm theo {documentType === 'totrinh' ? 'Tờ trình số:' : documentType === 'tongcuc' ? 'Quyết định số:' : 'Bản Trích sao số:'}{' '}
          <span className="font-semibold underline underline-offset-2">{documentNumber || '.../...'}</span>{' '}
          ngày <span className="font-semibold">{documentDate ? `${new Date(documentDate).getDate()} / ${new Date(documentDate).getMonth() + 1} / ${new Date(documentDate).getFullYear()}` : '... / ... / ......'}</span>{' '}
          của Trường Cao đẳng Hậu cần 2)
        </p>
      </div>

      {/* Main Table Matching Official Military Template */}
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse border-2 border-black font-sans print:text-[8pt] print:leading-tight">
          <thead>
            {/* Header Row 1 */}
            <tr className="bg-slate-100 font-bold text-black text-center border-b-2 border-black">
              <th
                rowSpan={2}
                className="border-r border-black p-1.5 w-7 text-center align-middle"
              >
                TT
              </th>
              <th
                rowSpan={2}
                className="border-r border-black p-1.5 min-w-[130px] text-center align-middle"
              >
                HỌ VÀ TÊN
              </th>
              <th
                rowSpan={2}
                className="border-r border-black p-1.5 w-14 text-center align-middle leading-tight"
              >
                Nhập ngũ,
                <br />
                Tuyển dụng
              </th>
              <th
                rowSpan={2}
                className="border-r border-black p-1.5 min-w-[95px] text-center align-middle leading-tight"
              >
                Chức vụ
                <br />
                (CNQS đang làm)
              </th>

              {/* Group Header 1: LƯƠNG HIỆN HƯỞNG */}
              <th
                colSpan={6}
                className="border-r border-black p-1.5 text-center font-extrabold uppercase bg-amber-50/70 border-b border-black text-slate-900"
              >
                LƯƠNG HIỆN HƯỞNG
              </th>

              {/* Middle Column: Quân hàm QNCN */}
              <th
                rowSpan={2}
                className="border-r border-black p-1.5 w-12 text-center align-middle leading-tight"
              >
                Quân hàm
                <br />
                QNCN
              </th>

              {/* Group Header 2: XẾP LƯƠNG MỚI */}
              <th
                colSpan={7}
                className="border-r border-black p-1.5 text-center font-extrabold uppercase bg-emerald-50/70 border-b border-black text-slate-900"
              >
                XẾP LƯƠNG MỚI
              </th>

              {/* Final Column: ĐƠN VỊ */}
              <th
                rowSpan={2}
                className="p-1.5 min-w-[70px] text-center align-middle"
              >
                ĐƠN VỊ
              </th>
            </tr>

            {/* Header Row 2: Sub-columns for LƯƠNG HIỆN HƯỞNG & XẾP LƯƠNG MỚI */}
            <tr className="bg-slate-50 font-bold text-black text-center border-b-2 border-black text-[9.5px] print:text-[7pt] leading-tight">
              {/* Under LƯƠNG HIỆN HƯỞNG */}
              <th className="border-r border-black p-1 w-11">
                Tháng
                <br />
                năm
                <br />
                nhận
              </th>
              <th className="border-r border-black p-1 w-11">
                Loại
                <br />
                nhóm
                <br />
                ngạch
              </th>
              <th className="border-r border-black p-1 w-9">Bậc</th>
              <th className="border-r border-black p-1 w-11">
                Hệ
                <br />
                số
              </th>
              <th className="border-r border-black p-1 w-10">
                %<br />
                PC
                <br />
                TN
                <br />
                VK
              </th>
              <th className="border-r border-black p-1 w-10">
                HS
                <br />
                bảo
                <br />
                lưu
              </th>

              {/* Under XẾP LƯƠNG MỚI */}
              <th className="border-r border-black p-1 w-11">
                Loại
                <br />
                nhóm
                <br />
                ngạch
              </th>
              <th className="border-r border-black p-1 w-9">Bậc</th>
              <th className="border-r border-black p-1 w-11">
                Hệ
                <br />
                số
              </th>
              <th className="border-r border-black p-1 w-10">
                %<br />
                PC
                <br />
                TN
                <br />
                VK
              </th>
              <th className="border-r border-black p-1 w-10">
                HS
                <br />
                bảo
                <br />
                lưu
              </th>
              <th className="border-r border-black p-1 w-12">
                Thăng
                <br />
                quân
                <br />
                hàm
                <br />
                QNCN
              </th>
              <th className="border-r border-black p-1 w-11">
                Tháng
                <br />
                năm
                <br />
                nhận
              </th>
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
                  <tr className="bg-slate-200/90 font-extrabold text-black border-y border-black">
                    <td className="border-r border-black p-1.5 text-center font-bold">
                      {sec.roman}
                    </td>
                    <td
                      colSpan={18}
                      className="p-1.5 uppercase font-bold tracking-wide"
                    >
                      {sec.title}
                    </td>
                  </tr>

                  {/* Sub-group row (e.g. + | CAO CẤP = 24) */}
                  {caoCapCount > 0 && (
                    <tr className="bg-slate-100/70 font-bold text-black border-b border-black">
                      <td className="border-r border-black p-1 text-center font-bold">
                        +
                      </td>
                      <td
                        colSpan={18}
                        className="p-1 font-bold uppercase text-[10px]"
                      >
                        CAO CẤP = {caoCapCount}
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
                        className="hover:bg-amber-50/30 transition-colors border-b border-dotted border-black/80 text-black leading-snug"
                      >
                        {/* TT */}
                        <td className="border-r border-black p-1 text-center font-mono">
                          {currentGlobalIndex}
                        </td>

                        {/* Họ và tên */}
                        <td className="border-r border-black p-1 font-bold whitespace-nowrap">
                          {item.hoVaTen}
                        </td>

                        {/* Nhập ngũ, Tuyển dụng */}
                        <td className="border-r border-black p-1 text-center font-mono whitespace-nowrap">
                          {nhapNguShort}
                        </td>

                        {/* Chức vụ */}
                        <td className="border-r border-black p-1 whitespace-nowrap">
                          {item.chucVu}
                        </td>

                        {/* --- LƯƠNG HIỆN HƯỞNG --- */}
                        {/* Tháng năm nhận */}
                        <td className="border-r border-black p-1 text-center font-mono whitespace-nowrap">
                          {thangNamNhanHienTai}
                        </td>
                        {/* Loại nhóm ngạch */}
                        <td className="border-r border-black p-1 text-center font-mono whitespace-nowrap">
                          {loaiNgachHienTai}
                        </td>
                        {/* Bậc */}
                        <td className="border-r border-black p-1 text-center font-mono whitespace-nowrap">
                          {bacHienTaiStr}
                        </td>
                        {/* Hệ số */}
                        <td className="border-r border-black p-1 text-right font-mono font-medium pr-1.5">
                          {heSoHienTaiStr}
                        </td>
                        {/* % PC TN VK */}
                        <td className="border-r border-black p-1 text-center font-mono">
                          {pctnvkHienTai}
                        </td>
                        {/* HS bảo lưu */}
                        <td className="border-r border-black p-1 text-center font-mono">
                          {hsBaoLuuHienTai}
                        </td>

                        {/* --- QUÂN HÀM QNCN --- */}
                        <td className="border-r border-black p-1 text-center font-mono font-semibold">
                          {quanHamHienTai}
                        </td>

                        {/* --- XẾP LƯƠNG MỚI --- */}
                        {/* Loại nhóm ngạch */}
                        <td className="border-r border-black p-1 text-center font-mono whitespace-nowrap">
                          {loaiNgachMoi}
                        </td>
                        {/* Bậc */}
                        <td className="border-r border-black p-1 text-center font-mono font-bold whitespace-nowrap">
                          {bacMoiStr}
                        </td>
                        {/* Hệ số */}
                        <td className="border-r border-black p-1 text-right font-mono font-bold pr-1.5">
                          {heSoMoiStr}
                        </td>
                        {/* % PC TN VK */}
                        <td className="border-r border-black p-1 text-center font-mono font-semibold">
                          {pctnvkMoi}
                        </td>
                        {/* HS bảo lưu */}
                        <td className="border-r border-black p-1 text-center font-mono">
                          {hsBaoLuuMoi}
                        </td>
                        {/* Thăng quân hàm QNCN */}
                        <td className="border-r border-black p-1 text-center font-mono font-bold">
                          {thangQuanHam}
                        </td>
                        {/* Tháng năm nhận */}
                        <td className="border-r border-black p-1 text-center font-mono whitespace-nowrap">
                          {thangNamNhanMoi}
                        </td>

                        {/* ĐƠN VỊ */}
                        <td className="p-1 text-center font-medium whitespace-nowrap">
                          {donViShort}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
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
    </div>
  );
};
