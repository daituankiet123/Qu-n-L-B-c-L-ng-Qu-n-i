import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { LiquidNavBar } from './components/layout/LiquidNavBar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PersonnelList } from './components/personnel/PersonnelList';
import { ImportPersonnelModal } from './components/personnel/ImportPersonnelModal';
import { PersonnelDetailModal } from './components/personnel/PersonnelDetailModal';
import { PersonnelFormModal } from './components/personnel/PersonnelFormModal';
import { SalaryConfigView } from './components/salary-config/SalaryConfigView';
import { ReviewCycleManager } from './components/review-cycles/ReviewCycleManager';
import { ApprovalWorkflowView } from './components/approval/ApprovalWorkflowView';
import { PayrollSheetView } from './components/payroll-sheet/PayrollSheetView';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { storageService } from './services/storageService';
import {
  QNCNProfile,
  SalaryScaleConfig,
  GeneralSalaryRules,
  SalaryReviewCycle,
  AuditLogEntry,
} from './types';
import { evaluateQNCNEligibility } from './services/salaryProgressionEngine';

const MainApp: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Datasets
  const [qncnList, setQncnList] = useState<QNCNProfile[]>(() => storageService.getQNCNList());
  const [scales, setScales] = useState<SalaryScaleConfig[]>(() => storageService.getSalaryScales());
  const [rules, setRules] = useState<GeneralSalaryRules>(() => storageService.getSalaryRules());
  const [reviewCycles, setReviewCycles] = useState<SalaryReviewCycle[]>(() =>
    storageService.getReviewCycles()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => storageService.getAuditLogs());

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

  useEffect(() => {
    storageService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  // Count due for review currently
  const todayStr = new Date().toISOString().split('T')[0];
  const dueCount = qncnList.filter((p) => {
    const ev = evaluateQNCNEligibility(p, scales, rules, todayStr);
    return ev.loaiNangLuong !== 'Chưa đủ điều kiện' && ev.loaiNangLuong !== 'Kéo dài do kỷ luật';
  }).length;

  // Handlers with Audit Logging and Real-time Toasts
  const handleImportSuccess = (imported: QNCNProfile[], mode: 'append' | 'overwrite') => {
    if (mode === 'overwrite') {
      setQncnList(imported);
    } else {
      // Append without duplicate IDs
      const existingIds = new Set(qncnList.map((p) => p.maQNCN));
      const filtered = imported.filter((p) => !existingIds.has(p.maQNCN));
      setQncnList([...qncnList, ...filtered]);
    }

    // Ghi nhật ký kiểm tra hệ thống
    const newLog = storageService.addAuditLog({
      nguoiThucHien: 'Ban Quân lực',
      chucVuNguoiThucHien: 'Cán bộ Quân lực',
      chuyenMuc: 'Hồ sơ QNCN',
      loaiHanhDong: 'IMPORT_PERSONNEL',
      hanhDong: 'Import danh sách QNCN từ Excel',
      chiTiet: `Đã nạp thành công ${imported.length} hồ sơ quân nhân (Chế độ: ${mode === 'overwrite' ? 'Ghi đè toàn bộ' : 'Bổ sung danh sách'}).`,
      doiTuongLienQuan: `${imported.length} hồ sơ`,
      mucDo: 'THÔNG TIN',
      diaChiIP: '192.168.1.25 (Ban Quân lực)',
    });
    setAuditLogs((prev) => [newLog, ...prev]);

    // Real-time Toast Notification
    toast.success(
      'Import danh sách QNCN thành công!',
      `Đã nạp thành công ${imported.length} hồ sơ quân nhân vào hệ thống (${mode === 'overwrite' ? 'Ghi đè toàn bộ' : 'Bổ sung vào danh sách hiện có'}).`,
      {
        badge: 'EXCEL IMPORT',
        duration: 5500,
        action: {
          label: 'Xem danh sách hồ sơ quân nhân ➔',
          onClick: () => setActiveTab('personnel'),
        },
      }
    );
  };

  const handleSaveProfile = (profile: QNCNProfile) => {
    const existingIndex = qncnList.findIndex((p) => p.id === profile.id);
    const isUpdate = existingIndex >= 0;

    if (isUpdate) {
      const updated = [...qncnList];
      updated[existingIndex] = profile;
      setQncnList(updated);
    } else {
      setQncnList([profile, ...qncnList]);
    }

    // Ghi nhật ký
    const newLog = storageService.addAuditLog({
      nguoiThucHien: 'Ban Quân lực',
      chucVuNguoiThucHien: 'Trợ lý Quân lực',
      chuyenMuc: 'Hồ sơ QNCN',
      loaiHanhDong: isUpdate ? 'UPDATE_PERSONNEL' : 'ADD_PERSONNEL',
      hanhDong: isUpdate ? 'Cập nhật hồ sơ QNCN' : 'Tạo mới hồ sơ QNCN',
      chiTiet: `${isUpdate ? 'Cập nhật thông tin' : 'Tạo mới hồ sơ'} đồng chí ${profile.hoVaTen} (${profile.capBac}, Bậc ${profile.bacLuongHienTai}, HS ${profile.heSoLuongHienTai.toFixed(2)}) - Đơn vị: ${profile.donVi}.`,
      doiTuongLienQuan: `Mã QNCN: ${profile.maQNCN}`,
      mucDo: 'THÔNG TIN',
      diaChiIP: '192.168.1.26 (Ban Quân lực)',
    });
    setAuditLogs((prev) => [newLog, ...prev]);

    // Real-time Toast
    toast.success(
      isUpdate ? 'Đã cập nhật hồ sơ QNCN' : 'Đã thêm mới hồ sơ QNCN',
      `Đồng chí ${profile.hoVaTen} (${profile.capBac}, Số hiệu: ${profile.maQNCN}) đã được lưu vào hệ thống.`,
      {
        badge: isUpdate ? 'CẬP NHẬT' : 'THÊM MỚI',
        duration: 4000,
      }
    );
  };

  const handleDeleteProfile = (id: string) => {
    const target = qncnList.find((p) => p.id === id);
    setQncnList(qncnList.filter((p) => p.id !== id));

    // Ghi nhật ký cảnh báo xóa hồ sơ
    const newLog = storageService.addAuditLog({
      nguoiThucHien: 'Ban Quân lực',
      chucVuNguoiThucHien: 'Trưởng ban Quân lực',
      chuyenMuc: 'Hồ sơ QNCN',
      loaiHanhDong: 'DELETE_PERSONNEL',
      hanhDong: 'Xóa hồ sơ QNCN',
      chiTiet: `Đã xóa hồ sơ quân nhân ${target?.hoVaTen || id} (${target?.capBac || ''}, Số hiệu: ${target?.maQNCN || ''}) khỏi hệ thống.`,
      doiTuongLienQuan: `Mã: ${target?.maQNCN || id}`,
      mucDo: 'CẢNH BÁO',
      diaChiIP: '192.168.1.25 (Ban Quân lực)',
    });
    setAuditLogs((prev) => [newLog, ...prev]);

    toast.warning(
      'Đã xóa hồ sơ quân nhân',
      `Đã xóa hồ sơ ${target?.hoVaTen || id} (${target?.maQNCN || ''}) khỏi cơ sở dữ liệu.`,
      {
        badge: 'XÓA HỒ SƠ',
        duration: 4500,
      }
    );
  };

  const handleSaveScales = (newScales: SalaryScaleConfig[]) => {
    setScales(newScales);
    const newLog = storageService.addAuditLog({
      nguoiThucHien: 'Ban Tài chính',
      chucVuNguoiThucHien: 'Trưởng ban Tài chính',
      chuyenMuc: 'Cấu hình Lương',
      loaiHanhDong: 'UPDATE_SALARY_SCALE',
      hanhDong: 'Cập nhật bảng thang bảng lương QNCN',
      chiTiet: `Cập nhật cấu hình hệ số các bậc lương cho ${newScales.length} ngạch nhóm lương Quân nhân chuyên nghiệp.`,
      doiTuongLienQuan: `${newScales.length} ngạch lương`,
      mucDo: 'QUAN TRỌNG',
      diaChiIP: '192.168.1.30 (Ban Tài chính)',
    });
    setAuditLogs((prev) => [newLog, ...prev]);

    toast.success(
      'Cập nhật thang bảng lương thành công!',
      `Đã lưu cấu hình mới cho ${newScales.length} ngạch nhóm lương QNCN.`,
      { badge: 'CẤU HÌNH LƯƠNG' }
    );
  };

  const handleSaveRules = (newRules: GeneralSalaryRules) => {
    setRules(newRules);
    const newLog = storageService.addAuditLog({
      nguoiThucHien: 'Ban Tài chính',
      chucVuNguoiThucHien: 'Trưởng ban Tài chính',
      chuyenMuc: 'Cấu hình Lương',
      loaiHanhDong: 'UPDATE_SALARY_RULES',
      hanhDong: 'Thay đổi tham số cấu hình mức lương & bảo hiểm',
      chiTiet: `Mức lương cơ sở: ${newRules.luongCoSo.toLocaleString('vi-VN')} VNĐ; BHXH: ${newRules.tyLeDongBHXH}%, BHYT: ${newRules.tyLeDongBHYT}%, BHTN: ${newRules.tyLeDongBHTN}%.`,
      doiTuongLienQuan: `Mức lương cơ sở: ${newRules.luongCoSo.toLocaleString('vi-VN')} đ`,
      mucDo: 'QUAN TRỌNG',
      diaChiIP: '192.168.1.30 (Ban Tài chính)',
    });
    setAuditLogs((prev) => [newLog, ...prev]);

    toast.success(
      'Cập nhật tham số tiền lương thành công!',
      `Mức lương cơ sở: ${newRules.luongCoSo.toLocaleString('vi-VN')} VNĐ (Nghị định 73/2024/NĐ-CP).`,
      { badge: 'LƯƠNG CƠ SỞ' }
    );
  };

  const handleApplyApprovedPromotion = (cycle: SalaryReviewCycle) => {
    const decisionNumber = cycle.quyetDinh?.soQuyetDinh || '318/QĐ-TCHC';
    const trichSaoNumber = cycle.trichSao?.soTrichSao || '52/TS-HC2';
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
        soQuyetDinh: `${decisionNumber} (Trích sao: ${trichSaoNumber})`,
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
        ghiChu: `Nâng lương theo QĐ ${decisionNumber} của Tổng cục Hậu cần (Bản Trích sao số ${trichSaoNumber})`,
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

    // Ghi nhật ký phê duyệt trọng yếu
    const newLog = storageService.addAuditLog({
      nguoiThucHien: 'Đại tá Trần Hữu Nghĩa',
      chucVuNguoiThucHien: 'Hiệu trưởng',
      chuyenMuc: 'Phê duyệt & Trích sao',
      loaiHanhDong: 'FINALIZE_PROMOTION',
      hanhDong: 'Hiệu trưởng duyệt Bản Trích sao Quyết định thi hành',
      chiTiet: `Ký duyệt Bản Trích sao số ${trichSaoNumber} căn cứ Quyết định số ${decisionNumber} của Thủ trưởng Tổng cục Hậu cần. Tự động cập nhật Bậc lương, Hệ số và Ngày hưởng mới cho ${approvedMap.size} quân nhân.`,
      doiTuongLienQuan: `Bản Trích sao: ${trichSaoNumber} (QĐ: ${decisionNumber})`,
      mucDo: 'QUAN TRỌNG',
      diaChiIP: '192.168.1.10 (Sở Chỉ huy Nhà trường)',
    });
    setAuditLogs((prev) => [newLog, ...prev]);

    // Real-time Toast Notification
    toast.success(
      'Ban hành Quyết định & Bản Trích sao thành công!',
      `Hiệu trưởng đã duyệt Bản Trích sao số ${trichSaoNumber} (QĐ ${decisionNumber}). Bậc lương và hệ số mới của ${approvedMap.size} quân nhân đã được cập nhật vào hồ sơ!`,
      {
        badge: 'BAN HÀNH THÀNH CÔNG',
        duration: 6500,
        action: {
          label: 'Xem bảng thanh toán lương mới ➔',
          onClick: () => setActiveTab('payroll-sheet'),
        },
      }
    );
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
      setAuditLogs(storageService.getAuditLogs());

      toast.info(
        'Khôi phục dữ liệu gốc thành công!',
        'Cơ sở dữ liệu mẫu chuẩn của Trường Cao Đẳng Hậu cần 2 đã được tái lập.',
        { badge: 'KHÔI PHỤC' }
      );
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

    // Ghi nhận log xuất backup
    const newLog = storageService.addAuditLog({
      nguoiThucHien: 'Quản trị hệ thống',
      chucVuNguoiThucHien: 'Bộ phận CNTT',
      chuyenMuc: 'Hệ thống & Dữ liệu',
      loaiHanhDong: 'BACKUP_EXPORT',
      hanhDong: 'Xuất file sao lưu toàn bộ hệ thống (Backup)',
      chiTiet: `Đã xuất toàn bộ cơ sở dữ liệu hồ sơ QNCN, thang bảng lương, các đợt xét và nhật ký kiểm tra ra file JSON.`,
      doiTuongLienQuan: `Sao_Luu_He_Thong_QNCN_CDHC2_${todayStr}.json`,
      mucDo: 'THÔNG TIN',
      diaChiIP: '192.168.1.50 (Máy chủ Quản trị)',
    });
    setAuditLogs((prev) => [newLog, ...prev]);

    toast.success(
      'Đã xuất tệp sao lưu hệ thống!',
      `Tệp sao lưu Sao_Luu_He_Thong_QNCN_CDHC2_${todayStr}.json đã được tải xuống an toàn.`,
      { badge: 'BACKUP' }
    );
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
        setAuditLogs(storageService.getAuditLogs());

        const newLog = storageService.addAuditLog({
          nguoiThucHien: 'Quản trị hệ thống',
          chucVuNguoiThucHien: 'Bộ phận CNTT',
          chuyenMuc: 'Hệ thống & Dữ liệu',
          loaiHanhDong: 'BACKUP_IMPORT',
          hanhDong: 'Phục hồi dữ liệu từ file sao lưu (Restore)',
          chiTiet: `Phục hồi thành công toàn bộ cơ sở dữ liệu hệ thống từ file ${file.name}.`,
          doiTuongLienQuan: file.name,
          mucDo: 'QUAN TRỌNG',
          diaChiIP: '192.168.1.50 (Máy chủ Quản trị)',
        });
        setAuditLogs((prev) => [newLog, ...prev]);

        toast.success(
          'Phục hồi dữ liệu hệ thống thành công!',
          `Đã phục hồi hoàn chỉnh cơ sở dữ liệu từ file sao lưu "${file.name}".`,
          { badge: 'RESTORE', duration: 5500 }
        );
      } else {
        toast.error(
          'Phục hồi dữ liệu thất bại',
          'Tệp sao lưu không hợp lệ hoặc bị lỗi cấu trúc dữ liệu JSON!',
          { badge: 'LỖI TỆP' }
        );
      }
    };
    reader.readAsText(file);
  };

  const handleClearAuditLogs = () => {
    storageService.clearAuditLogs();
    setAuditLogs([]);
    toast.info('Đã xóa lịch sử nhật ký hệ thống', 'Toàn bộ dữ liệu audit log đã được làm sạch.');
  };

  const handleRefreshAuditLogs = () => {
    setAuditLogs(storageService.getAuditLogs());
    toast.info('Đã làm mới nhật ký kiểm tra', 'Dữ liệu mới nhất đã được cập nhật.');
  };

  const handleAddManualAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog = storageService.addAuditLog(entry);
    setAuditLogs((prev) => [newLog, ...prev]);
    toast.success(
      'Đã ghi nhận biên bản kiểm tra!',
      `Hành động "${entry.hanhDong}" đã được lưu vào sổ nhật ký kiểm tra.`,
      { badge: 'NHẬT KÝ' }
    );
  };

  return (
    <div className="min-h-screen bg-[#e9eef5] text-slate-800 flex flex-col selection:bg-emerald-800 selection:text-white antialiased">
      {/* Hidden JSON file input for backup */}
      <input
        ref={backupInputRef}
        type="file"
        accept=".json"
        onChange={handleBackupFileSelected}
        className="hidden"
      />

      {/* Neumorphic Header */}
      <Header
        rules={rules}
        totalQNCN={qncnList.length}
        dueForReviewCount={dueCount}
        onResetDefaults={handleResetDefaults}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar with Neumorphism & Tactile Motion */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingReviewsCount={dueCount}
        />

        {/* Dynamic Content Views with Liquid Navigation & Fluid Page Transitions */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Top Liquid Navigation Dock */}
          <LiquidNavBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingReviewsCount={dueCount}
          />

          {/* Fluid Tab Content with Spring Motion Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  qncnList={qncnList}
                  scales={scales}
                  rules={rules}
                  reviewCycles={reviewCycles}
                  auditLogs={auditLogs}
                  onClearAuditLogs={handleClearAuditLogs}
                  onRefreshAuditLogs={handleRefreshAuditLogs}
                  onAddManualAuditLog={handleAddManualAuditLog}
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
                  onSaveScales={handleSaveScales}
                  onSaveRules={handleSaveRules}
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
                  onNavigateToApproval={() => setActiveTab('approval')}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals with Spring Transitions */}
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

      {/* Real-time Toast Notifications Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
};
