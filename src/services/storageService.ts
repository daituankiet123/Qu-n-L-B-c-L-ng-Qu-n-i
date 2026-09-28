import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
  AuditLogEntry,
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
      return data ? JSON.parse(data) : INITIAL_REVIEW_CYCLES;
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
  },

  exportFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      qncnList: this.getQNCNList(),
      salaryScales: this.getSalaryScales(),
      salaryRules: this.getSalaryRules(),
      reviewCycles: this.getReviewCycles(),
      auditLogs: this.getAuditLogs(),
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
      return true;
    } catch {
      return false;
    }
  },
};
