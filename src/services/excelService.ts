import * as XLSX from 'xlsx';
import { QNCNProfile, ReviewProposalItem, PayrollRecord } from '../types';

export function downloadQNCNTemplate() {
  const templateData = [
    {
      'Số hiệu QNCN': 'HC2-QN09901',
      'Họ và tên': 'Nguyễn Văn An',
      'Ngày sinh (YYYY-MM-DD)': '1985-06-15',
      'Giới tính (Nam/Nữ)': 'Nam',
      'Số CCCD': '079085001234',
      'Cấp bậc': 'Thượng tá QNCN',
      'Chức vụ': 'Giảng viên',
      'Đơn vị / Khoa / Phòng': 'Khoa Hậu cần Quân sự',
      'Ngạch QNCN': 'Cao cấp Nhóm 1',
      'Bậc lương hiện tại': 6,
      'Hệ số lương': 5.60,
      'Ngày hưởng bậc (YYYY-MM-DD)': '2023-01-01',
      'Ngày nhập ngũ (YYYY-MM-DD)': '2003-03-01',
      'Phần trăm thâm niên (%)': 23,
      'Phần trăm vượt khung (%)': 0,
      'Hệ số chức vụ': 0.2,
      'Hệ số đặc thù': 0.35,
      'Khen thưởng gần nhất': 'Chiến sĩ thi đua cấp cơ sở',
      'Kỷ luật gần nhất': 'Không',
      'Ghi chú': 'Hồ sơ tiêu biểu khoa',
    },
    {
      'Số hiệu QNCN': 'HC2-QN09902',
      'Họ và tên': 'Trần Thị Mai',
      'Ngày sinh (YYYY-MM-DD)': '1990-09-20',
      'Giới tính (Nam/Nữ)': 'Nữ',
      'Số CCCD': '079190005678',
      'Cấp bậc': 'Đại úy QNCN',
      'Chức vụ': 'Thủ kho vật tư',
      'Đơn vị / Khoa / Phòng': 'Khoa Vận tải - Quân nhu',
      'Ngạch QNCN': 'Trung cấp Nhóm 1',
      'Bậc lương hiện tại': 4,
      'Hệ số lương': 4.40,
      'Ngày hưởng bậc (YYYY-MM-DD)': '2023-04-01',
      'Ngày nhập ngũ (YYYY-MM-DD)': '2010-09-01',
      'Phần trăm thâm niên (%)': 15,
      'Phần trăm vượt khung (%)': 0,
      'Hệ số chức vụ': 0.0,
      'Hệ số đặc thù': 0.2,
      'Khen thưởng gần nhất': 'Chiến sĩ tiên tiến',
      'Kỷ luật gần nhất': 'Không',
      'Ghi chú': 'Đang chuẩn bị hồ sơ xét nâng bậc',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  // Auto column width
  ws['!cols'] = [
    { wch: 16 }, // Số hiệu QNCN
    { wch: 22 }, // Họ và tên
    { wch: 20 }, // Ngày sinh
    { wch: 16 }, // Giới tính
    { wch: 16 }, // CCCD
    { wch: 18 }, // Cấp bậc
    { wch: 22 }, // Chức vụ
    { wch: 25 }, // Đơn vị
    { wch: 20 }, // Ngạch
    { wch: 18 }, // Bậc
    { wch: 14 }, // Hệ số
    { wch: 22 }, // Ngày hưởng
    { wch: 22 }, // Ngày nhập ngũ
    { wch: 22 }, // % thâm niên
    { wch: 22 }, // % vượt khung
    { wch: 15 }, // Hệ số chức vụ
    { wch: 15 }, // Hệ số đặc thù
    { wch: 28 }, // Khen thưởng
    { wch: 18 }, // Kỷ luật
    { wch: 25 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Danh_Sach_QNCN');
  XLSX.writeFile(wb, 'Mau_Nhap_Lieu_QNCN_Truong_CDHC2.xlsx');
}

export function parseQNCNExcel(dataBuffer: ArrayBuffer): {
  profiles: QNCNProfile[];
  errors: string[];
} {
  const wb = XLSX.read(dataBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

  const profiles: QNCNProfile[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Row 1 is header

    // Find fields with flexible matching
    const maQNCN = (row['Số hiệu QNCN'] || row['SoHieu'] || row['MaQNCN'] || row['Mã QNCN'] || '').toString().trim();
    const hoVaTen = (row['Họ và tên'] || row['HoTen'] || row['Họ tên'] || row['Tên'] || '').toString().trim();
    
    if (!hoVaTen) {
      errors.push(`Dòng ${rowNum}: Thiếu Họ và tên.`);
      return;
    }

    const ngaySinh = formatExcelDate(row['Ngày sinh (YYYY-MM-DD)'] || row['Ngày sinh'] || row['NgaySinh'] || '1985-01-01');
    const gioiTinh = (row['Giới tính (Nam/Nữ)'] || row['Giới tính'] || 'Nam').toString().includes('Nữ') ? 'Nữ' : 'Nam';
    const soCCCD = (row['Số CCCD'] || row['CCCD'] || row['CMND'] || '').toString().trim();
    const capBac = (row['Cấp bậc'] || row['CapBac'] || 'Thiếu tá QNCN').toString().trim();
    const chucVu = (row['Chức vụ'] || row['ChucVu'] || 'Giảng viên').toString().trim();
    const donVi = (row['Đơn vị / Khoa / Phòng'] || row['Đơn vị'] || row['Khoa/Phòng'] || 'Khoa Hậu cần').toString().trim();
    const ngach = (row['Ngạch QNCN'] || row['Ngạch'] || 'Cao cấp Nhóm 1').toString().trim();
    
    const bacLuongHienTai = Number(row['Bậc lương hiện tại'] || row['Bậc'] || row['Bac'] || 1);
    const heSoLuongHienTai = Number(row['Hệ số lương'] || row['Hệ số'] || row['HeSo'] || 3.85);
    const ngayHuongHienTai = formatExcelDate(row['Ngày hưởng bậc (YYYY-MM-DD)'] || row['Ngày hưởng'] || row['NgayHuong'] || '2023-01-01');
    const ngayNhapNgu = formatExcelDate(row['Ngày nhập ngũ (YYYY-MM-DD)'] || row['Ngày nhập ngũ'] || '2005-03-01');
    
    const phanTramThamNien = Number(row['Phần trăm thâm niên (%)'] || row['Thâm niên'] || 0);
    const phanTramVuotKhung = Number(row['Phần trăm vượt khung (%)'] || row['Vượt khung'] || 0);
    const heSoChucVu = Number(row['Hệ số chức vụ'] || row['PC Chức vụ'] || 0);
    const heSoDacThu = Number(row['Hệ số đặc thù'] || row['PC Đặc thù'] || 0);
    
    const khenThuongGanNhat = (row['Khen thưởng gần nhất'] || row['Khen thưởng'] || 'Không').toString().trim();
    const kyLuatGanNhat = (row['Kỷ luật gần nhất'] || row['Kỷ luật'] || 'Không').toString().trim();
    const ghiChu = (row['Ghi chú'] || '').toString().trim();

    profiles.push({
      id: `qncn-import-${Date.now()}-${index}`,
      maQNCN: maQNCN || `HC2-QN${Math.floor(10000 + Math.random() * 90000)}`,
      hoVaTen,
      ngaySinh,
      gioiTinh,
      soCCCD,
      capBac,
      chucVu,
      donVi,
      ngach,
      bacLuongHienTai: isNaN(bacLuongHienTai) ? 1 : bacLuongHienTai,
      heSoLuongHienTai: isNaN(heSoLuongHienTai) ? 3.85 : heSoLuongHienTai,
      ngayHuongHienTai,
      ngayNhapNgu,
      phanTramThamNien: isNaN(phanTramThamNien) ? 0 : phanTramThamNien,
      phanTramVuotKhung: isNaN(phanTramVuotKhung) ? 0 : phanTramVuotKhung,
      heSoChucVu: isNaN(heSoChucVu) ? 0 : heSoChucVu,
      heSoDacThu: isNaN(heSoDacThu) ? 0 : heSoDacThu,
      khenThuongGanNhat,
      kyLuatGanNhat,
      trangThai: 'Đang công tác',
      ghiChu,
    });
  });

  return { profiles, errors };
}

function formatExcelDate(value: any): string {
  if (!value) return '2023-01-01';
  if (typeof value === 'number') {
    // Excel date serial number
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = value.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Try DD/MM/YYYY
  const parts = str.split('/');
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  return str;
}

export function exportQNCNToExcel(profiles: QNCNProfile[]) {
  const exportData = profiles.map((p, idx) => ({
    'STT': idx + 1,
    'Số hiệu QNCN': p.maQNCN,
    'Họ và tên': p.hoVaTen,
    'Ngày sinh': p.ngaySinh,
    'Giới tính': p.gioiTinh,
    'Số CCCD': p.soCCCD,
    'Cấp bậc': p.capBac,
    'Chức vụ': p.chucVu,
    'Đơn vị': p.donVi,
    'Ngạch': p.ngach,
    'Bậc lương': p.bacLuongHienTai,
    'Hệ số lương': p.heSoLuongHienTai,
    'Ngày hưởng': p.ngayHuongHienTai,
    'Ngày nhập ngũ': p.ngayNhapNgu,
    '% Thâm niên': `${p.phanTramThamNien}%`,
    '% Vượt khung': `${p.phanTramVuotKhung}%`,
    'Hệ số chức vụ': p.heSoChucVu,
    'Hệ số đặc thù': p.heSoDacThu,
    'Khen thưởng': p.khenThuongGanNhat,
    'Kỷ luật': p.kyLuatGanNhat,
    'Trạng thái': p.trangThai,
    'Ghi chú': p.ghiChu || '',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_QNCN');
  XLSX.writeFile(wb, `Danh_Sach_QNCN_Truong_CDHC2_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportReviewProposalsToExcel(cycleTitle: string, items: ReviewProposalItem[]) {
  const exportData = items.map((item, idx) => ({
    'STT': idx + 1,
    'Số hiệu QNCN': item.maQNCN,
    'Họ và tên': item.hoVaTen,
    'Đơn vị': item.donVi,
    'Cấp bậc': item.capBac,
    'Chức vụ': item.chucVu,
    'Ngạch': item.ngach,
    'Bậc hiện tại': item.bacHienTai,
    'Hệ số hiện tại': item.heSoHienTai,
    'Ngày hưởng hiện tại': item.ngayHuongHienTai,
    'Số tháng giữ bậc': item.soThangDaGiuBac,
    'Loại nâng lương': item.loaiNangLuong,
    'Bậc đề xuất': item.bacDeXuat,
    'Hệ số đề xuất': item.heSoDeXuat,
    '% Vượt khung đề xuất': item.vuotKhungDeXuat ? `${item.vuotKhungDeXuat}%` : '',
    'Ngày hưởng mới': item.ngayHuongMoi,
    'Chênh lệch hệ số': item.chenhLechHeSo,
    'Tăng lương hàng tháng (VNĐ)': item.chenhLechTienLuong,
    'Lý do & Tiêu chuẩn': item.lyDoDeXuat,
    'Trạng thái duyệt': item.trangThaiPheDuyet,
    'Ý kiến Hội đồng': item.yKienHoiDong || '',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nang_Bac_Luong');
  XLSX.writeFile(wb, `Danh_sach_Nang_Luong_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportPayrollSheetToExcel(records: PayrollRecord[], monthYear: string) {
  const exportData = records.map((r, idx) => ({
    'STT': idx + 1,
    'Số hiệu QNCN': r.maQNCN,
    'Họ và tên': r.hoVaTen,
    'Cấp bậc': r.capBac,
    'Chức vụ': r.chucVu,
    'Đơn vị': r.donVi,
    'Ngạch': r.ngach,
    'Bậc': r.bac,
    'Hệ số lương': r.heSoLuong,
    'Lương theo ngạch bậc (VNĐ)': r.luongTheoHeSo,
    'PC Thâm niên (%)': `${r.phanTramThamNien}%`,
    'Tiền thâm niên (VNĐ)': r.tienThamNien,
    'PC Vượt khung (%)': `${r.phanTramVuotKhung}%`,
    'Tiền vượt khung (VNĐ)': r.tienVuotKhung,
    'PC Chức vụ (VNĐ)': r.tienChucVu,
    'PC Đặc thù (VNĐ)': r.tienDacThu,
    'Tổng thu nhập (VNĐ)': r.tongThuNhap,
    'Trích nộp BHXH (8%)': r.dongBHXH,
    'Trích nộp BHYT (1.5%)': r.dongBHYT,
    'Tổng khấu trừ (VNĐ)': r.tongKhauTru,
    'THỰC LĨNH (VNĐ)': r.thucLinh,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Bang_Luong_${monthYear}`);
  XLSX.writeFile(wb, `Bang_Thanh_Toan_Luong_QNCN_${monthYear}.xlsx`);
}
