import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
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
};

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

  resetAllToDefault() {
    localStorage.removeItem(KEYS.QNCN);
    localStorage.removeItem(KEYS.SCALES);
    localStorage.removeItem(KEYS.RULES);
    localStorage.removeItem(KEYS.CYCLES);
  },

  exportFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      qncnList: this.getQNCNList(),
      salaryScales: this.getSalaryScales(),
      salaryRules: this.getSalaryRules(),
      reviewCycles: this.getReviewCycles(),
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
      return true;
    } catch {
      return false;
    }
  },
};
