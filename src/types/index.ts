export type MilitaryRank = 
  | 'Đại tá QNCN'
  | 'Thượng tá QNCN'
  | 'Trung tá QNCN'
  | 'Thiếu tá QNCN'
  | 'Đại úy QNCN'
  | 'Thượng úy QNCN'
  | 'Trung úy QNCN'
  | 'Thiếu úy QNCN'
  | 'Thượng sĩ QNCN'
  | 'Trung sĩ QNCN';

export type SalaryGradeType =
  | 'Cao cấp Nhóm 1'
  | 'Cao cấp Nhóm 2'
  | 'Trung cấp Nhóm 1'
  | 'Trung cấp Nhóm 2'
  | 'Sơ cấp';

export interface QNCNProfile {
  id: string;
  maQNCN: string; // Số hiệu quân nhân
  hoVaTen: string;
  ngaySinh: string; // YYYY-MM-DD
  gioiTinh: 'Nam' | 'Nữ';
  soCCCD: string;
  capBac: MilitaryRank | string;
  chucVu: string;
  donVi: string; // Khoa, Phòng, Ban, Tiểu đoàn
  ngach: SalaryGradeType | string;
  bacLuongHienTai: number;
  heSoLuongHienTai: number;
  ngayHuongHienTai: string; // YYYY-MM-DD
  ngayNhapNgu: string; // YYYY-MM-DD
  phanTramThamNien: number; // % Phụ cấp thâm niên (ví dụ: 15)
  phanTramVuotKhung: number; // % Vượt khung nếu có (ví dụ: 5)
  heSoChucVu: number; // Hệ số phụ cấp chức vụ lãnh đạo
  heSoDacThu: number; // Phụ cấp đặc thù nhà giáo/quân sự/độc hại
  khenThuongGanNhat: string; // CSTĐ cấp cơ sở, Bằng khen, Huân chương...
  kyLuatGanNhat: string; // Không, Khiển trách, Cảnh cáo
  ngayKyLuat?: string;
  trangThai: 'Đang công tác' | 'Chờ nâng lương' | 'Đã nghỉ hưu' | 'Chuyển ngành';
  ghiChu?: string;
  lichSuNangLuong?: {
    id: string;
    ngayQuyetDinh: string;
    soQuyetDinh: string;
    tuBac: number;
    lenBac: number;
    tuHeSo: number;
    lenHeSo: number;
    ngayHuong: string;
    hinhThuc: string; // Thường xuyên, Trước hạn
  }[];
}

export interface SalaryGradeStep {
  bac: number;
  heSo: number;
}

export interface SalaryScaleConfig {
  id: string;
  ngach: SalaryGradeType | string;
  tenNgach: string;
  soNamGiuBacChuan: number; // 3 năm = 36 tháng hoặc 2 năm
  bacToiDa: number;
  danhSachBac: SalaryGradeStep[];
}

export interface RewardRule {
  id: string;
  danhHieu: string;
  soThangRutNgan: number; // 6 tháng, 9 tháng, 12 tháng
  moTa: string;
}

export interface DisciplineRule {
  id: string;
  hinhThuc: string; // Khiển trách, Cảnh cáo, Giáng chức...
  soThangKeoDai: number; // 6 tháng, 12 tháng
  moTa: string;
}

export interface GeneralSalaryRules {
  luongCoSo: number; // Mức lương cơ sở: 2.340.000 VND
  soThangGiuBacCaoCap: number; // 36
  soThangGiuBacTrungCap: number; // 36
  soThangGiuBacSoCap: number; // 24
  tyLeDongBHXH: number; // 8%
  tyLeDongBHYT: number; // 1.5%
  tyLeDongBHTN: number; // 0% hoặc 1%
  thoiHanThamNienBatDauNam: number; // 5 năm
  mucHuongThamNienKhoiDiem: number; // 5%
  moiNamThamNienThem: number; // 1%
  mucVuotKhungNamDau: number; // 5%
  moiNamVuotKhungThem: number; // 1%
  quyDinhNangTruocHan: RewardRule[];
  quyDinhKyLuat: DisciplineRule[];
}

export type ReviewProposalStatus = 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Bảo lưu';

export type ReviewCategory = 
  | 'Thường xuyên' 
  | 'Trước thời hạn' 
  | 'Vượt khung' 
  | 'Chưa đủ điều kiện' 
  | 'Kéo dài do kỷ luật';

export interface ReviewProposalItem {
  id: string;
  qncnId: string;
  maQNCN: string;
  hoVaTen: string;
  donVi: string;
  capBac: string;
  chucVu: string;
  ngach: string;
  bacHienTai: number;
  heSoHienTai: number;
  ngayHuongHienTai: string;
  soThangDaGiuBac: number;
  loaiNangLuong: ReviewCategory;
  bacDeXuat: number;
  heSoDeXuat: number;
  vuotKhungDeXuat: number;
  ngayHuongMoi: string;
  chenhLechHeSo: number;
  chenhLechTienLuong: number; // Chênh lệch lương cơ bản hàng tháng
  lyDoDeXuat: string;
  khenThuong?: string;
  kyLuat?: string;
  trangThaiPheDuyet: ReviewProposalStatus;
  yKienHoiDong?: string;
}

export interface CouncilMember {
  hoTen: string;
  chucVu: string;
  vaiTro: 'Chủ tịch Hội đồng' | 'Phó Chủ tịch' | 'Ủy viên thường trực' | 'Ủy viên' | 'Thư ký';
  yKien?: string;
  dongY?: boolean;
}

export interface ToTrinhTongCucInfo {
  soToTrinh: string;
  ngayTrinh: string;
  coQuanCapTren?: string;
  coQuanTongCuc?: string;
  donViTrinh?: string;
  tieuDeTrinh?: string;
  kinhGui: string[];
  canCu?: string[];
  noiDungTrinh: string;
  nguoiKyTrinh: string;
  chucVuNguoiKyTrinh: string;
  capBacNguoiKyTrinh?: string;
  // Khung phê duyệt của Thủ trưởng Tổng cục Hậu cần ký duyệt
  chucDanhPheDuyet: string; // "THỦ TRƯỞNG TỔNG CỤC HẬU CẦN PHÊ DUYỆT"
  chucVuNguoiPheDuyet: string; // "Chủ nhiệm Tổng cục Hậu cần"
  capBacNguoiPheDuyet?: string; // "Trung tướng"
  nguoiPheDuyet: string; // "Nguyễn Văn Điều"
  yKienPheDuyet: string;
  ngayPheDuyet: string;
  noiNhan?: string[];
}

export interface QuyetDinhTongCucInfo {
  soQuyetDinh: string;
  ngayKy: string;
  nguoiKy: string;
  chucDanhNguoiKy: string; // e.g. "THỦ TRƯỞNG TỔNG CỤC HẬU CẦN"
  chucVuNguoiKy: string; // e.g. "Chủ nhiệm Tổng cục Hậu cần"
  capBacNguoiKy?: string; // e.g. "Trung tướng"
  coQuanCapTren?: string; // "BỘ QUỐC PHÒNG"
  coQuanBanHanh?: string; // "TỔNG CỤC HẬU CẦN - KỸ THUẬT"
  trichYeu: string;
  canCu: string[];
  dieu1?: string;
  dieu2?: string;
  dieu3?: string;
  noiNhan: string[];
}

export interface TrichSaoDonViInfo {
  soTrichSao: string;
  ngaySao: string;
  nguoiKySao: string;
  chucDanhKySao: string; // e.g. "HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG HẬU CẦN 2"
  coQuanCapTren?: string; // "BỘ QUỐC PHÒNG"
  coQuanTongCuc?: string; // "TỔNG CỤC HẬU CẦN - KỸ THUẬT"
  donViSao?: string; // "TRƯỜNG CAO ĐẲNG HẬU CẦN 2"
  noiNhanSao: string[];
  chungThuc: string;
  dieu1Trích?: string;
  dieu2Trích?: string;
  dieu3Trích?: string;
}

// Disciplinary Management & Extended Promotion Types
export interface DisciplineCaseRecord {
  id: string;
  qncnId: string;
  maQNCN: string;
  hoVaTen: string;
  donVi: string;
  capBac: string;
  chucVu: string;
  ngach: string;
  bacHienTai: number;
  heSoHienTai: number;
  ngayHuongHienTai: string; // YYYY-MM-DD
  hinhThucKyLuat: 'Khiển trách' | 'Cảnh cáo' | 'Giáng cấp bậc quân hàm' | 'Hạ bậc lương' | 'Cách chức' | string;
  soQuyetDinhKyLuat: string;
  ngayKyLuat: string;
  coQuanRaQuyetDinh: string;
  lyDoKyLuat: string;
  soThangKeoDai: number; // 6 or 12 or custom
  hanNangLuongBanDau: string; // YYYY-MM-DD
  hanNangLuongMoi: string; // YYYY-MM-DD
  trangThaiPheDuyet: 'Chờ xét duyệt' | 'Đã duyệt kéo dài' | 'Từ chối' | 'Đã hoàn thành thời hạn';
  yKienHoiDong?: string;
  ghiChu?: string;
}

export interface DisciplineDecisionInfo {
  soQuyetDinh: string;
  ngayKy: string;
  coQuanCapTren?: string;
  coQuanTongCuc?: string;
  tieuDe?: string;
  canCu?: string[];
  dieu1?: string;
  dieu2?: string;
  dieu3?: string;
  noiNhan?: string[];
  chucDanhNguoiKy: string;
  chucVuNguoiKy?: string;
  nguoiKy: string;
  capBacNguoiKy?: string;
  // Trang 2 Phụ lục ký tên
  chucDanhNguoiLap?: string;
  nguoiLap?: string;
  chucDanhTruongBan?: string;
  nguoiKyTruongBan?: string;
  chucDanhHieuTruong?: string;
  nguoiKyHieuTruong?: string;
}

export interface DisciplineExtractInfo {
  soTrichSao: string;
  ngaySao: string;
  coQuanCapTren?: string;
  coQuanTongCuc?: string;
  coQuanTruong?: string;
  tieuDe?: string;
  chungThuc?: string;
  chucDanhKySao: string;
  nguoiKySao: string;
  noiNhanSao?: string[];
  dieu1Trích?: string;
  dieu2Trích?: string;
  dieu3Trích?: string;
  // Trang 2 Phụ lục ký tên
  chucDanhKyPhuLuc?: string;
  nguoiKyPhuLuc?: string;
}

export type ReviewAllowanceScope =
  | 'Nâng bậc lương & Vượt khung'
  | 'Phụ cấp thâm niên nghề'
  | 'Phụ cấp thâm niên vượt khung'
  | 'Tổng hợp cả 3 chế độ';

export interface SalaryReviewCycle {
  id: string;
  maDot: string;
  tenDot: string;
  nam: number;
  kyXet: '6 tháng đầu năm' | '6 tháng cuối năm' | 'Quý 1' | 'Quý 2' | 'Quý 3' | 'Quý 4' | 'Đột xuất';
  loaiCheDo?: ReviewAllowanceScope;
  ngayChotSoLieu: string;
  ngayTao: string;
  nguoiLap: string;
  trangThai: 
    | 'Dự thảo'
    | 'Đơn vị đề xuất'
    | 'Ban Quân lực rà soát'
    | 'Hội đồng Lương xét duyệt'
    | 'Trình Tổng cục Hậu cần phê duyệt'
    | 'Tổng cục Hậu cần đã ký duyệt'
    | 'Hiệu trưởng duyệt Bản Trích sao'
    | 'Đã ban hành Quyết định';
  ghiChu: string;
  danhSachDeXuat: ReviewProposalItem[];
  thanhVienHoiDong: CouncilMember[];
  toTrinh?: ToTrinhTongCucInfo;
  quyetDinh?: QuyetDinhTongCucInfo;
  trichSao?: TrichSaoDonViInfo;
}

export interface PayrollRecord {
  qncnId: string;
  maQNCN: string;
  hoVaTen: string;
  donVi: string;
  capBac: string;
  chucVu: string;
  ngach: string;
  bac: number;
  heSoLuong: number;
  phanTramThamNien: number;
  phanTramVuotKhung: number;
  heSoChucVu: number;
  heSoDacThu: number;
  
  // Thành tiền tính toán
  luongTheoHeSo: number;
  tienThamNien: number;
  tienVuotKhung: number;
  tienChucVu: number;
  tienDacThu: number;
  tongThuNhap: number;
  
  // Trích nộp
  dongBHXH: number;
  dongBHYT: number;
  dongBHTN: number;
  tongKhauTru: number;
  
  // Thực lĩnh
  thucLinh: number;
}

export type AuditLogCategory = 
  | 'Hồ sơ QNCN'
  | 'Cấu hình Lương'
  | 'Phê duyệt & Trích sao'
  | 'Hệ thống & Dữ liệu';

export type AuditLogAction = 
  | 'IMPORT_PERSONNEL'
  | 'ADD_PERSONNEL'
  | 'UPDATE_PERSONNEL'
  | 'DELETE_PERSONNEL'
  | 'UPDATE_SALARY_RULES'
  | 'UPDATE_SALARY_SCALE'
  | 'CREATE_REVIEW_CYCLE'
  | 'UPDATE_REVIEW_CYCLE'
  | 'APPROVE_CYCLE_STAGE'
  | 'FINALIZE_PROMOTION'
  | 'RESET_SYSTEM'
  | 'BACKUP_EXPORT'
  | 'BACKUP_IMPORT';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO String
  nguoiThucHien: string; // e.g. "Ban Quân lực", "Hiệu trưởng", "Quản trị viên"
  chucVuNguoiThucHien?: string;
  chuyenMuc: AuditLogCategory;
  loaiHanhDong: AuditLogAction;
  hanhDong: string; // e.g. "Import dữ liệu QNCN"
  chiTiet: string; // e.g. "Import thành công 15 hồ sơ quân nhân từ file Excel"
  doiTuongLienQuan?: string; // e.g. "QĐ: 318/QĐ-TCHC, Bản Trích sao: 52/TS-HC2"
  mucDo: 'THÔNG TIN' | 'CẢNH BÁO' | 'QUAN TRỌNG';
  diaChiIP?: string;
}
