import { QNCNProfile, GeneralSalaryRules, PayrollRecord } from '../types';

export function calculatePayrollRecord(
  profile: QNCNProfile,
  rules: GeneralSalaryRules
): PayrollRecord {
  const luongCoSo = rules.luongCoSo;
  const luongTheoHeSo = Math.round(profile.heSoLuongHienTai * luongCoSo);
  
  // Phụ cấp thâm niên nghề quân đội (% tính trên Lương theo ngạch bậc + PC chức vụ + PC thâm niên vượt khung)
  // Thông tư liên tịch quy định: Mức hưởng = (Lương ngạch bậc + PC Chức vụ + PC Thâm niên vượt khung) * % Thâm niên
  const tienChucVu = Math.round(profile.heSoChucVu * luongCoSo);
  const tienVuotKhung = Math.round((luongTheoHeSo * (profile.phanTramVuotKhung || 0)) / 100);
  
  const tienThamNien = Math.round(
    ((luongTheoHeSo + tienChucVu + tienVuotKhung) * (profile.phanTramThamNien || 0)) / 100
  );
  
  // Phụ cấp đặc thù (ngành hậu cần, giảng dạy, trách nhiệm kỹ thuật...)
  const tienDacThu = Math.round(luongTheoHeSo * (profile.heSoDacThu || 0));
  
  const tongThuNhap = luongTheoHeSo + tienThamNien + tienVuotKhung + tienChucVu + tienDacThu;
  
  // Trích nộp bảo hiểm (tính trên: Lương + PC Chức vụ + PC Thâm niên nghề + PC Thâm niên vượt khung)
  const quyLuongDongBaoHiem = luongTheoHeSo + tienChucVu + tienThamNien + tienVuotKhung;
  const dongBHXH = Math.round((quyLuongDongBaoHiem * rules.tyLeDongBHXH) / 100);
  const dongBHYT = Math.round((quyLuongDongBaoHiem * rules.tyLeDongBHYT) / 100);
  const dongBHTN = Math.round((quyLuongDongBaoHiem * rules.tyLeDongBHTN) / 100);
  const tongKhauTru = dongBHXH + dongBHYT + dongBHTN;
  
  const thucLinh = tongThuNhap - tongKhauTru;

  return {
    qncnId: profile.id,
    maQNCN: profile.maQNCN,
    hoVaTen: profile.hoVaTen,
    donVi: profile.donVi,
    capBac: profile.capBac,
    chucVu: profile.chucVu,
    ngach: profile.ngach,
    bac: profile.bacLuongHienTai,
    heSoLuong: profile.heSoLuongHienTai,
    phanTramThamNien: profile.phanTramThamNien,
    phanTramVuotKhung: profile.phanTramVuotKhung,
    heSoChucVu: profile.heSoChucVu,
    heSoDacThu: profile.heSoDacThu,
    
    luongTheoHeSo,
    tienThamNien,
    tienVuotKhung,
    tienChucVu,
    tienDacThu,
    tongThuNhap,
    
    dongBHXH,
    dongBHYT,
    dongBHTN,
    tongKhauTru,
    
    thucLinh,
  };
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}
