import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PersonnelList } from './components/personnel/PersonnelList';
import { ImportPersonnelModal } from './components/personnel/ImportPersonnelModal';
import { PersonnelDetailModal } from './components/personnel/PersonnelDetailModal';
import { PersonnelFormModal } from './components/personnel/PersonnelFormModal';
import { SalaryConfigView } from './components/salary-config/SalaryConfigView';
import { ReviewCycleManager } from './components/review-cycles/ReviewCycleManager';
import { ApprovalWorkflowView } from './components/approval/ApprovalWorkflowView';
import { PayrollSheetView } from './components/payroll-sheet/PayrollSheetView';
import { storageService } from './services/storageService';
import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
} from './types';
import { evaluateQNCNEligibility } from './services/salaryProgressionEngine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Datasets
  const [qncnList, setQncnList] = useState<QNCNProfile[]>(() => storageService.getQNCNList());
  const [scales, setScales] = useState<SalaryScaleConfig[]>(() => storageService.getSalaryScales());
  const [rules, setRules] = useState<GeneralSalaryRules>(() => storageService.getSalaryRules());
  const [reviewCycles, setReviewCycles] = useState<SalaryReviewCycle[]>(() =>
    storageService.getReviewCycles()
  );

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formProfileToEdit, setFormProfileToEdit] = useState<QNCNProfile | null>(null);
  const [detailProfile, setDetailProfile] = useState<QNCNProfile | null>(null);

  // Hidden JSON backup input
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    storageService.saveQNCNList(qncnList);
  }, [qncnList]);

  useEffect(() => {
    storageService.saveSalaryScales(scales);
  }, [scales]);

  useEffect(() => {
    storageService.saveSalaryRules(rules);
  }, [rules]);

  useEffect(() => {
    storageService.saveReviewCycles(reviewCycles);
  }, [reviewCycles]);

  // Count due for review currently
  const todayStr = new Date().toISOString().split('T')[0];
  const dueCount = qncnList.filter((p) => {
    const ev = evaluateQNCNEligibility(p, scales, rules, todayStr);
    return ev.loaiNangLuong !== 'Chưa đủ điều kiện' && ev.loaiNangLuong !== 'Kéo dài do kỷ luật';
  }).length;

  // Handlers
  const handleImportSuccess = (imported: QNCNProfile[], mode: 'append' | 'overwrite') => {
    if (mode === 'overwrite') {
      setQncnList(imported);
    } else {
      // Append without duplicate IDs
      const existingIds = new Set(qncnList.map((p) => p.maQNCN));
      const filtered = imported.filter((p) => !existingIds.has(p.maQNCN));
      setQncnList([...qncnList, ...filtered]);
    }
  };

  const handleSaveProfile = (profile: QNCNProfile) => {
    const existingIndex = qncnList.findIndex((p) => p.id === profile.id);
    if (existingIndex >= 0) {
      const updated = [...qncnList];
      updated[existingIndex] = profile;
      setQncnList(updated);
    } else {
      setQncnList([profile, ...qncnList]);
    }
  };

  const handleDeleteProfile = (id: string) => {
    setQncnList(qncnList.filter((p) => p.id !== id));
  };

  const handleApplyApprovedPromotion = (cycle: SalaryReviewCycle) => {
    const decisionNumber = cycle.quyetDinh?.soQuyetDinh || '156/QĐ-HC2';
    const decisionDate = cycle.quyetDinh?.ngayKy || todayStr;

    // Map of approved items
    const approvedMap = new Map();
    cycle.danhSachDeXuat.forEach((item) => {
      if (item.trangThaiPheDuyet === 'Đã duyệt') {
        approvedMap.set(item.qncnId, item);
      }
    });

    // Update personnel in database
    const updatedPersonnel = qncnList.map((p) => {
      const prop = approvedMap.get(p.id);
      if (!prop) return p;

      const historyEntry = {
        id: `ls-${Date.now()}-${p.id}`,
        ngayQuyetDinh: decisionDate,
        soQuyetDinh: decisionNumber,
        tuBac: p.bacLuongHienTai,
        lenBac: prop.bacDeXuat,
        tuHeSo: p.heSoLuongHienTai,
        lenHeSo: prop.heSoDeXuat,
        ngayHuong: prop.ngayHuongMoi,
        hinhThuc: prop.loaiNangLuong,
      };

      return {
        ...p,
        bacLuongHienTai: prop.bacDeXuat,
        heSoLuongHienTai: prop.heSoDeXuat,
        phanTramVuotKhung: prop.vuotKhungDeXuat || p.phanTramVuotKhung,
        ngayHuongHienTai: prop.ngayHuongMoi,
        khenThuongGanNhat: 'Đã xét nâng trước hạn',
        lichSuNangLuong: [historyEntry, ...(p.lichSuNangLuong || [])],
        ghiChu: `Đã nâng bậc lương theo QĐ ${decisionNumber} ngày ${decisionDate}`,
      };
    });

    // Update cycle status
    const updatedCycle: SalaryReviewCycle = {
      ...cycle,
      trangThai: 'Đã ban hành Quyết định',
    };

    const updatedCycles = reviewCycles.map((c) => (c.id === cycle.id ? updatedCycle : c));

    setQncnList(updatedPersonnel);
    setReviewCycles(updatedCycles);
    alert(`Đã ban hành Quyết định ${decisionNumber} và cập nhật dữ liệu nâng bậc lương thành công cho ${approvedMap.size} quân nhân!`);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu ban đầu của Trường Cao Đẳng Hậu cần 2?'
      )
    ) {
      storageService.resetAllToDefault();
      setQncnList(storageService.getQNCNList());
      setScales(storageService.getSalaryScales());
      setRules(storageService.getSalaryRules());
      setReviewCycles(storageService.getReviewCycles());
      alert('Đã khôi phục dữ liệu gốc!');
    }
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_He_Thong_QNCN_CDHC2_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    backupInputRef.current?.click();
  };

  const handleBackupFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importFullBackup(content);
      if (success) {
        setQncnList(storageService.getQNCNList());
        setScales(storageService.getSalaryScales());
        setRules(storageService.getSalaryRules());
        setReviewCycles(storageService.getReviewCycles());
        alert('Phục hồi dữ liệu hệ thống từ file sao lưu thành công!');
      } else {
        alert('File sao lưu không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-800 selection:text-white">
      {/* Hidden JSON file input for backup */}
      <input
        ref={backupInputRef}
        type="file"
        accept=".json"
        onChange={handleBackupFileSelected}
        className="hidden"
      />

      {/* Header */}
      <Header
        rules={rules}
        totalQNCN={qncnList.length}
        dueForReviewCount={dueCount}
        onResetDefaults={handleResetDefaults}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingReviewsCount={dueCount}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              qncnList={qncnList}
              scales={scales}
              rules={rules}
              reviewCycles={reviewCycles}
              onNavigate={setActiveTab}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {activeTab === 'personnel' && (
            <PersonnelList
              qncnList={qncnList}
              scales={scales}
              rules={rules}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenAddModal={() => {
                setFormProfileToEdit(null);
                setIsFormModalOpen(true);
              }}
              onEditProfile={(p) => {
                setFormProfileToEdit(p);
                setIsFormModalOpen(true);
              }}
              onViewProfile={(p) => setDetailProfile(p)}
              onDeleteProfile={handleDeleteProfile}
            />
          )}

          {activeTab === 'salary-config' && (
            <SalaryConfigView
              scales={scales}
              rules={rules}
              onSaveScales={setScales}
              onSaveRules={setRules}
            />
          )}

          {activeTab === 'review-cycles' && (
            <ReviewCycleManager
              cycles={reviewCycles}
              qncnList={qncnList}
              scales={scales}
              rules={rules}
              onSaveCycles={setReviewCycles}
              onSelectCycle={() => {}}
              onNavigateToApproval={(c) => setActiveTab('approval')}
            />
          )}

          {activeTab === 'approval' && (
            <ApprovalWorkflowView
              cycles={reviewCycles}
              qncnList={qncnList}
              onSaveCycle={(c) => {
                setReviewCycles(reviewCycles.map((old) => (old.id === c.id ? c : old)));
              }}
              onApplyApprovedPromotion={handleApplyApprovedPromotion}
            />
          )}

          {activeTab === 'payroll-sheet' && (
            <PayrollSheetView qncnList={qncnList} rules={rules} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ImportPersonnelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <PersonnelFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setFormProfileToEdit(null);
        }}
        onSave={handleSaveProfile}
        initialProfile={formProfileToEdit}
        scales={scales}
      />

      <PersonnelDetailModal
        isOpen={!!detailProfile}
        onClose={() => setDetailProfile(null)}
        profile={detailProfile}
        scales={scales}
        rules={rules}
        onEdit={(p) => {
          setDetailProfile(null);
          setFormProfileToEdit(p);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
};
