import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
  AuditLogEntry,
  DisciplineCaseRecord,
  DisciplineDecisionInfo,
  DisciplineExtractInfo,
} from '../types';
import {
  DEFAULT_SALARY_SCALES,
  DEFAULT_SALARY_RULES,
  INITIAL_QNCN_LIST,
  INITIAL_REVIEW_CYCLES,
} from '../data/militaryPayrollDefaults';

const KEYS = {
  QNCN: 'cdhc2_qncn_list_v1',
  SCALES: 'cdhc2_salary_scales_v1',
  RULES: 'cdhc2_salary_rules_v1',
  CYCLES: 'cdhc2_review_cycles_v1',
  AUDIT_LOGS: 'cdhc2_audit_logs_v1',
  DISCIPLINE_CASES: 'cdhc2_discipline_cases_v1',
  DISCIPLINE_DECISION: 'cdhc2_discipline_decision_v1',
  DISCIPLINE_EXTRACT: 'cdhc2_discipline_extract_v1',
};

export const INITIAL_DISCIPLINE_CASES: DisciplineCaseRecord[] = [
  {
    id: 'disc-001',
    qncnId: 'qncn-005',
    maQNCN: 'HC2-QN02319',
    hoVaTen: 'Hoàng Quốc Việt',
    donVi: 'Phòng Đào tạo',
    capBac: 'Đại úy QNCN',
    chucVu: 'Nhân viên Thống kê Quân lực',
    ngach: 'Trung cấp Nhóm 2',
    bacHienTai: 4,
    heSoHienTai: 4.25,
    ngayHuongHienTai: '2023-01-01',
    hinhThucKyLuat: 'Khiển trách',
    soQuyetDinhKyLuat: '12/QĐ-HC2',
    ngayKyLuat: '2025-08-15',
    coQuanRaQuyetDinh: 'Hiệu trưởng Trường Cao đẳng Hậu cần 2',
    lyDoKyLuat: 'Vi phạm quy định về bảo đảm an toàn dữ liệu và thời gian công tác',
    soThangKeoDai: 6,
    hanNangLuongBanDau: '2026-01-01',
    hanNangLuongMoi: '2026-07-01',
    trangThaiPheDuyet: 'Đã duyệt kéo dài',
    yKienHoiDong: 'Nhất trí kéo dài thời hạn nâng bậc lương 06 tháng theo Thông tư của Bộ Quốc phòng.',
    ghiChu: 'Thời hạn nâng lương kéo dài đến 01/07/2026',
  },
  {
    id: 'disc-002',
    qncnId: 'qncn-008',
    maQNCN: 'HC2-QN02102',
    hoVaTen: 'Ngô Văn Thắng',
    donVi: 'Tiểu đoàn 1',
    capBac: 'Thượng úy QNCN',
    chucVu: 'Kỹ thuật viên Sửa chữa',
    ngach: 'Trung cấp Nhóm 1',
    bacHienTai: 3,
    heSoHienTai: 4.00,
    ngayHuongHienTai: '2023-03-01',
    hinhThucKyLuat: 'Cảnh cáo',
    soQuyetDinhKyLuat: '06/QĐ-HC2',
    ngayKyLuat: '2025-05-20',
    coQuanRaQuyetDinh: 'Hiệu trưởng Trường Cao đẳng Hậu cần 2',
    lyDoKyLuat: 'Không chấp hành nghiêm quy định về lễ tiết tác phong và trực chỉ huy đơn vị',
    soThangKeoDai: 12,
    hanNangLuongBanDau: '2026-03-01',
    hanNangLuongMoi: '2027-03-01',
    trangThaiPheDuyet: 'Chờ xét duyệt',
    yKienHoiDong: 'Đang xem xét thời hạn kéo dài 12 tháng theo Thông tư BQP.',
    ghiChu: 'Hồ sơ chuyển Hội đồng thẩm định kỷ luật',
  },
];

export const DEFAULT_DISCIPLINE_DECISION: DisciplineDecisionInfo = {
  soQuyetDinh: '89/QĐ-THC',
  ngayKy: '2026-03-28',
  coQuanCapTren: 'BỘ QUỐC PHÒNG',
  coQuanTongCuc: 'TỔNG CỤC HẬU CẦN',
  tieuDe: 'QUYẾT ĐỊNH VỀ VIỆC KÉO DÀI THỜI HẠN NÂNG BẬC LƯƠNG CỦA QUÂN NHÂN CHUYÊN NGHIỆP DO BỊ KỶ LUẬT',
  canCu: [
    'Căn cứ Luật Quân nhân chuyên nghiệp, công nhân và viên chức quốc phòng ngày 26 tháng 11 năm 2015;',
    'Căn cứ Nghị định số 73/2024/NĐ-CP ngày 30 tháng 6 năm 2024 của Chính phủ quy định mức lương cơ sở và chế độ tiền lương;',
    'Căn cứ Thông tư số 170/2016/TT-BQP của Bộ trưởng Bộ Quốc phòng quy định cấp bậc quân hàm quân nhân chuyên nghiệp tương ứng với mức lương và chế độ kéo dài thời hạn nâng bậc lương do kỷ luật;',
    'Xét đề nghị của Hiệu trưởng Trường Cao đẳng Hậu cần 2 tại Tờ trình số 89/TTr-HC2 ngày 15 tháng 3 năm 2026 và đề nghị của Cục Cán bộ - Quân lực Tổng cục Hậu cần,',
  ],
  dieu1: 'Kéo dài thời hạn nâng bậc lương đối với các đồng chí Quân nhân chuyên nghiệp thuộc Trường Cao đẳng Hậu cần 2 do bị xử lý kỷ luật trong thời gian giữ bậc (có danh sách và mức thời gian kéo dài chi tiết kèm theo).',
  dieu2: 'Trong thời gian kéo dài thời hạn nâng bậc lương, các đồng chí có tên tại Điều 1 vẫn được hưởng các chế độ phụ cấp hiện hưởng theo quy định hiện hành nếu không có thay đổi về chức danh hoặc nhiệm vụ.',
  dieu3: 'Chỉ huy các cơ quan, đơn vị thuộc Tổng cục Hậu cần, Hiệu trưởng Trường Cao đẳng Hậu cần 2 và các đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.',
  noiNhan: [
    'Như Điều 3;',
    'Bộ Tư lệnh (để b/c);',
    'Cục Tài chính BQP;',
    'Cục Cán bộ BQP;',
    'Lưu: VT, QL.',
  ],
  chucDanhNguoiKy: 'THỦ TRƯỞNG TỔNG CỤC HẬU CẦN',
  chucVuNguoiKy: 'Chủ nhiệm Tổng cục Hậu cần',
  nguoiKy: 'Trung tướng Nguyễn Văn Điều',
  capBacNguoiKy: 'Trung tướng',
  chucDanhNguoiLap: 'NGƯỜI LẬP BIỂU',
  nguoiLap: 'Ban Quân lực',
  chucDanhTruongBan: 'TRƯỞNG BAN QUÂN LỰC',
  nguoiKyTruongBan: 'Thượng tá Nguyễn Văn Bình',
  chucDanhHieuTruong: 'HIỆU TRƯỞNG',
  nguoiKyHieuTruong: 'Đại tá Trần Hữu Nghĩa',
};

export const DEFAULT_DISCIPLINE_EXTRACT: DisciplineExtractInfo = {
  soTrichSao: '53/TS-HC2',
  ngaySao: '2026-03-29',
  coQuanCapTren: 'BỘ QUỐC PHÒNG',
  coQuanTongCuc: 'TỔNG CỤC HẬU CẦN - KỸ THUẬT',
  coQuanTruong: 'TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
  tieuDe: 'TRÍCH SAO QUYẾT ĐỊNH VỀ VIỆC KÉO DÀI THỜI HẠN NÂNG BẬC LƯƠNG CỦA QUÂN NHÂN CHUYÊN NGHIỆP DO BỊ KỶ LUẬT',
  chungThuc: 'Chứng thực sao y bản chính từ Quyết định số 89/QĐ-THC ngày 28/03/2026 của Thủ trưởng Tổng cục Hậu cần.',
  chucDanhKySao: 'HIỆU TRƯỞNG TRƯỜNG CAO ĐẲNG HẬU CẦN 2',
  nguoiKySao: 'Đại tá Trần Hữu Nghĩa',
  chucDanhKyPhuLuc: 'HIỆU TRƯỞNG',
  nguoiKyPhuLuc: 'Đại tá Trần Hữu Nghĩa',
  noiNhanSao: [
    'Ban Giám hiệu Trường CĐHC2;',
    'Ban Quân lực (để theo dõi);',
    'Ban Tài chính (để thi hành chế độ);',
    'Các Khoa, Ban, Tiểu đoàn có liên quan;',
    'Lưu: Văn thư, Hồ sơ cán bộ.',
  ],
  dieu1Trích: 'Kéo dài thời hạn nâng bậc lương đối với các đồng chí Quân nhân chuyên nghiệp thuộc Trường Cao đẳng Hậu cần 2 do bị kỷ luật trong thời gian giữ bậc theo danh sách đính kèm.',
  dieu2Trích: 'Các chế độ phụ cấp và quyền lợi liên quan vẫn thực hiện theo quy định hiện hành.',
  dieu3Trích: 'Ban Quân lực, Ban Tài chính, các đơn vị liên quan và các đồng chí có tên thi hành quyết định.',
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-03-28T09:45:00Z',
    nguoiThucHien: 'Đại tá Trần Hữu Nghĩa',
    chucVuNguoiThucHien: 'Hiệu trưởng',
    chuyenMuc: 'Phê duyệt & Trích sao',
    loaiHanhDong: 'FINALIZE_PROMOTION',
    hanhDong: 'Ký duyệt Bản Trích sao Quyết định thi hành',
    chiTiet: 'Hiệu trưởng ký duyệt Bản Trích sao số 52/TS-HC2 căn cứ Quyết định 318/QĐ-TCHC của Thủ trưởng Tổng cục Hậu cần. Đã cập nhật bậc lương và hệ số mới cho 3 quân nhân đủ điều kiện.',
    doiTuongLienQuan: 'Bản Trích sao: 52/TS-HC2 (QĐ: 318/QĐ-TCHC)',
    mucDo: 'QUAN TRỌNG',
    diaChiIP: '192.168.1.10 (Mạng Quân sự nội bộ)',
  },
  {
    id: 'log-002',
    timestamp: '2026-03-24T14:30:00Z',
    nguoiThucHien: 'Trung tướng Nguyễn Văn Điều',
    chucVuNguoiThucHien: 'Chủ nhiệm Tổng cục Hậu cần',
    chuyenMuc: 'Phê duyệt & Trích sao',
    loaiHanhDong: 'APPROVE_CYCLE_STAGE',
    hanhDong: 'Thủ trưởng Tổng cục Hậu cần phê duyệt & ký Quyết định',
    chiTiet: 'Thủ trưởng Tổng cục Hậu cần ký ban hành Quyết định số 318/QĐ-TCHC nâng bậc lương, phụ cấp thâm niên nghề và thâm niên vượt khung cho QNCN Trường CĐHC2.',
    doiTuongLienQuan: 'QĐ số 318/QĐ-TCHC',
    mucDo: 'QUAN TRỌNG',
    diaChiIP: '10.0.8.5 (Tổng cục Hậu cần)',
  },
  {
    id: 'log-003',
    timestamp: '2026-03-15T10:15:00Z',
    nguoiThucHien: 'Đại tá Trần Hữu Nghĩa',
    chucVuNguoiThucHien: 'Chủ tịch Hội đồng Lương',
    chuyenMuc: 'Phê duyệt & Trích sao',
    loaiHanhDong: 'APPROVE_CYCLE_STAGE',
    hanhDong: 'Ký Tờ trình gửi Thủ trưởng Tổng cục Hậu cần',
    chiTiet: 'Hội đồng xét duyệt nâng bậc lương họp thẩm định và thống nhất lập Tờ trình số 89/TTr-HC2 trình Thủ trưởng Tổng cục Hậu cần phê duyệt đợt 1 năm 2026.',
    doiTuongLienQuan: 'Tờ trình số 89/TTr-HC2',
    mucDo: 'QUAN TRỌNG',
    diaChiIP: '192.168.1.10 (Sở Chỉ huy Nhà trường)',
  },
  {
    id: 'log-004',
    timestamp: '2026-03-12T08:20:00Z',
    nguoiThucHien: 'Thượng tá Nguyễn Văn Bình',
    chucVuNguoiThucHien: 'Trưởng ban Quân lực',
    chuyenMuc: 'Cấu hình Lương',
    loaiHanhDong: 'UPDATE_SALARY_RULES',
    hanhDong: 'Cập nhật cấu hình mức lương cơ sở & tỷ lệ bảo hiểm',
    chiTiet: 'Thiết lập mức lương cơ sở 2.340.000 VNĐ theo Nghị định số 73/2024/NĐ-CP; tỷ lệ trích đóng BHXH (8%), BHYT (1.5%), BHTN (1%).',
    doiTuongLienQuan: 'Mức lương cơ sở: 2.340.000 VNĐ',
    mucDo: 'THÔNG TIN',
    diaChiIP: '192.168.1.25 (Ban Quân lực)',
  },
  {
    id: 'log-005',
    timestamp: '2026-03-05T16:00:00Z',
    nguoiThucHien: 'Thiếu tá Đỗ Mạnh Cường',
    chucVuNguoiThucHien: 'Trợ lý Quân lực',
    chuyenMuc: 'Hồ sơ QNCN',
    loaiHanhDong: 'IMPORT_PERSONNEL',
    hanhDong: 'Import cơ sở dữ liệu hồ sơ QNCN từ file Excel',
    chiTiet: 'Nạp danh sách 15 Quân nhân chuyên nghiệp toàn trường từ file Danh_sach_QNCN_Mau_Truong_CDHC2.xlsx vào hệ thống quản lý.',
    doiTuongLienQuan: '15 hồ sơ quân nhân',
    mucDo: 'THÔNG TIN',
    diaChiIP: '192.168.1.26 (Ban Quân lực)',
  },
];

export const storageService = {
  getQNCNList(): QNCNProfile[] {
    try {
      const data = localStorage.getItem(KEYS.QNCN);
      return data ? JSON.parse(data) : INITIAL_QNCN_LIST;
    } catch {
      return INITIAL_QNCN_LIST;
    }
  },

  saveQNCNList(list: QNCNProfile[]) {
    localStorage.setItem(KEYS.QNCN, JSON.stringify(list));
  },

  getSalaryScales(): SalaryScaleConfig[] {
    try {
      const data = localStorage.getItem(KEYS.SCALES);
      return data ? JSON.parse(data) : DEFAULT_SALARY_SCALES;
    } catch {
      return DEFAULT_SALARY_SCALES;
    }
  },

  saveSalaryScales(scales: SalaryScaleConfig[]) {
    localStorage.setItem(KEYS.SCALES, JSON.stringify(scales));
  },

  getSalaryRules(): GeneralSalaryRules {
    try {
      const data = localStorage.getItem(KEYS.RULES);
      return data ? JSON.parse(data) : DEFAULT_SALARY_RULES;
    } catch {
      return DEFAULT_SALARY_RULES;
    }
  },

  saveSalaryRules(rules: GeneralSalaryRules) {
    localStorage.setItem(KEYS.RULES, JSON.stringify(rules));
  },

  getReviewCycles(): SalaryReviewCycle[] {
    try {
      const data = localStorage.getItem(KEYS.CYCLES);
      if (!data) return INITIAL_REVIEW_CYCLES;
      const parsed: SalaryReviewCycle[] = JSON.parse(data);
      // Ensure the first cycle has the disciplined proposal if none exists
      if (parsed.length > 0 && !parsed[0].danhSachDeXuat.some((i) => i.loaiNangLuong === 'Kéo dài do kỷ luật')) {
        const prop05 = INITIAL_REVIEW_CYCLES[0]?.danhSachDeXuat.find((i) => i.id === 'prop-05');
        if (prop05) {
          parsed[0].danhSachDeXuat.push(prop05);
        }
      }
      return parsed;
    } catch {
      return INITIAL_REVIEW_CYCLES;
    }
  },

  saveReviewCycles(cycles: SalaryReviewCycle[]) {
    localStorage.setItem(KEYS.CYCLES, JSON.stringify(cycles));
  },

  getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  saveAuditLogs(logs: AuditLogEntry[]) {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  getDisciplineCases(): DisciplineCaseRecord[] {
    try {
      const data = localStorage.getItem(KEYS.DISCIPLINE_CASES);
      return data ? JSON.parse(data) : INITIAL_DISCIPLINE_CASES;
    } catch {
      return INITIAL_DISCIPLINE_CASES;
    }
  },

  saveDisciplineCases(cases: DisciplineCaseRecord[]) {
    localStorage.setItem(KEYS.DISCIPLINE_CASES, JSON.stringify(cases));
  },

  getDisciplineDecision(): DisciplineDecisionInfo {
    try {
      const data = localStorage.getItem(KEYS.DISCIPLINE_DECISION);
      return data ? JSON.parse(data) : DEFAULT_DISCIPLINE_DECISION;
    } catch {
      return DEFAULT_DISCIPLINE_DECISION;
    }
  },

  saveDisciplineDecision(decision: DisciplineDecisionInfo) {
    localStorage.setItem(KEYS.DISCIPLINE_DECISION, JSON.stringify(decision));
  },

  getDisciplineExtract(): DisciplineExtractInfo {
    try {
      const data = localStorage.getItem(KEYS.DISCIPLINE_EXTRACT);
      return data ? JSON.parse(data) : DEFAULT_DISCIPLINE_EXTRACT;
    } catch {
      return DEFAULT_DISCIPLINE_EXTRACT;
    }
  },

  saveDisciplineExtract(extract: DisciplineExtractInfo) {
    localStorage.setItem(KEYS.DISCIPLINE_EXTRACT, JSON.stringify(extract));
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const currentLogs = this.getAuditLogs();
    const updated = [newEntry, ...currentLogs];
    this.saveAuditLogs(updated);
    return newEntry;
  },

  clearAuditLogs() {
    this.saveAuditLogs([]);
  },

  resetAllToDefault() {
    localStorage.removeItem(KEYS.QNCN);
    localStorage.removeItem(KEYS.SCALES);
    localStorage.removeItem(KEYS.RULES);
    localStorage.removeItem(KEYS.CYCLES);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
    localStorage.removeItem(KEYS.DISCIPLINE_CASES);
    localStorage.removeItem(KEYS.DISCIPLINE_DECISION);
    localStorage.removeItem(KEYS.DISCIPLINE_EXTRACT);
  },

  exportFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      qncnList: this.getQNCNList(),
      salaryScales: this.getSalaryScales(),
      salaryRules: this.getSalaryRules(),
      reviewCycles: this.getReviewCycles(),
      auditLogs: this.getAuditLogs(),
      disciplineCases: this.getDisciplineCases(),
      disciplineDecision: this.getDisciplineDecision(),
      disciplineExtract: this.getDisciplineExtract(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importFullBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.qncnList) this.saveQNCNList(parsed.qncnList);
      if (parsed.salaryScales) this.saveSalaryScales(parsed.salaryScales);
      if (parsed.salaryRules) this.saveSalaryRules(parsed.salaryRules);
      if (parsed.reviewCycles) this.saveReviewCycles(parsed.reviewCycles);
      if (parsed.auditLogs) this.saveAuditLogs(parsed.auditLogs);
      if (parsed.disciplineCases) this.saveDisciplineCases(parsed.disciplineCases);
      if (parsed.disciplineDecision) this.saveDisciplineDecision(parsed.disciplineDecision);
      if (parsed.disciplineExtract) this.saveDisciplineExtract(parsed.disciplineExtract);
      return true;
    } catch {
      return false;
    }
  },
};
