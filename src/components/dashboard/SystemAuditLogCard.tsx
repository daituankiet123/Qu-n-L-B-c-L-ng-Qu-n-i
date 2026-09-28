import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  User,
  Building,
  FileText,
  X,
  Sliders,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AuditLogEntry, AuditLogCategory } from '../../types';

interface SystemAuditLogCardProps {
  logs: AuditLogEntry[];
  onClearLogs?: () => void;
  onRefreshLogs?: () => void;
  onAddManualLog?: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

export const SystemAuditLogCard: React.FC<SystemAuditLogCardProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
  onAddManualLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TẤT CẢ');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New manual audit log state
  const [manualUser, setManualUser] = useState('Ban Quân lực');
  const [manualRole, setManualRole] = useState('Cán bộ kiểm tra');
  const [manualAction, setManualAction] = useState('Kiểm tra hồ sơ định kỳ');
  const [manualCategory, setManualCategory] = useState<AuditLogCategory>('Phê duyệt & Trích sao');
  const [manualDetail, setManualDetail] = useState('');
  const [manualTarget, setManualTarget] = useState('');
  const [manualLevel, setManualLevel] = useState<'THÔNG TIN' | 'CẢNH BÁO' | 'QUAN TRỌNG'>('THÔNG TIN');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchCategory =
        selectedCategory === 'TẤT CẢ' || log.chuyenMuc === selectedCategory;

      const q = searchKeyword.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.hanhDong.toLowerCase().includes(q) ||
        log.chiTiet.toLowerCase().includes(q) ||
        log.nguoiThucHien.toLowerCase().includes(q) ||
        (log.doiTuongLienQuan && log.doiTuongLienQuan.toLowerCase().includes(q)) ||
        (log.chucVuNguoiThucHien && log.chucVuNguoiThucHien.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [logs, selectedCategory, searchKeyword]);

  // Export logs to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('Không có dữ liệu nhật ký để xuất!');
      return;
    }

    const headers = [
      'STT',
      'Mã Log',
      'Thời gian',
      'Người thực hiện',
      'Chức vụ',
      'Chuyên mục',
      'Hành động',
      'Mô tả chi tiết',
      'Đối tượng liên quan',
      'Mức độ',
      'Địa chỉ IP/Thiết bị',
    ];

    const rows = filteredLogs.map((log, index) => [
      index + 1,
      log.id,
      new Date(log.timestamp).toLocaleString('vi-VN'),
      `"${log.nguoiThucHien}"`,
      `"${log.chucVuNguoiThucHien || ''}"`,
      `"${log.chuyenMuc}"`,
      `"${log.hanhDong}"`,
      `"${log.chiTiet.replace(/"/g, '""')}"`,
      `"${log.doiTuongLienQuan || ''}"`,
      log.mucDo,
      `"${log.diaChiIP || 'Mạng Quân sự nội bộ'}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `Nhat_Ky_He_Thong_AuditLog_CDHC2_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDetail.trim()) {
      alert('Vui lòng nhập nội dung chi tiết kiểm tra!');
      return;
    }

    if (onAddManualLog) {
      onAddManualLog({
        nguoiThucHien: manualUser,
        chucVuNguoiThucHien: manualRole,
        chuyenMuc: manualCategory,
        loaiHanhDong: 'APPROVE_CYCLE_STAGE',
        hanhDong: manualAction,
        chiTiet: manualDetail,
        doiTuongLienQuan: manualTarget || undefined,
        mucDo: manualLevel,
        diaChiIP: '192.168.1.15 (Ban Thanh tra - Kiểm tra)',
      });
    }

    setShowAddModal(false);
    setManualDetail('');
    setManualTarget('');
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'QUAN TRỌNG':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            QUAN TRỌNG
          </span>
        );
      case 'CẢNH BÁO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            CẢNH BÁO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            THÔNG TIN
          </span>
        );
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Hồ sơ QNCN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Cấu hình Lương':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Phê duyệt & Trích sao':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN')}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="neu-flat rounded-3xl p-5 sm:p-7 space-y-5 border border-slate-300/60">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl neu-pressed text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <History className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Nhật Ký Hoạt Động Hệ Thống (System Audit Log)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold neu-pressed text-emerald-900 font-mono">
                {logs.length} bản ghi
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Ghi nhận tự động các thao tác trọng yếu: Import danh sách QNCN, phê duyệt nâng bậc lương, ban hành Bản Trích sao, thay đổi cấu hình lương phục vụ thanh tra & kiểm tra.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl neu-flat text-xs font-bold text-slate-700 hover:text-emerald-900 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            Thêm ghi chú kiểm tra
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl neu-flat text-xs font-bold text-emerald-900 flex items-center gap-1.5 transition-all shadow-xs"
            title="Xuất file CSV nhật ký để phục vụ báo cáo"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            Xuất Excel/CSV
          </motion.button>

          {onRefreshLogs && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefreshLogs}
              className="p-2 rounded-xl neu-flat text-slate-600 hover:text-slate-900 transition-all shadow-xs"
              title="Làm mới nhật ký"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {onClearLogs && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (window.confirm('CẢNH BÁO KIỂM TRA:\nBạn có chắc chắn muốn xóa toàn bộ lịch sử nhật ký hệ thống không? Hành động này sẽ làm sạch nhật ký kiểm tra.')) {
                  onClearLogs();
                }
              }}
              className="p-2 rounded-xl neu-flat text-rose-600 hover:text-rose-800 transition-all shadow-xs"
              title="Xóa nhật ký (chỉ dùng khi reset hệ thống)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['TẤT CẢ', 'Hồ sơ QNCN', 'Cấu hình Lương', 'Phê duyệt & Trích sao', 'Hệ thống & Dữ liệu'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                  selectedCategory === cat
                    ? 'neu-emerald text-white shadow-xs'
                    : 'neu-flat text-slate-700 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, người thực hiện, QĐ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full neu-input pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="neu-pressed rounded-2xl overflow-hidden p-1">
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#e4eaf2] text-slate-700 font-bold border-b border-slate-300 z-10">
              <tr>
                <th className="p-3 w-36 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Thời gian
                  </div>
                </th>
                <th className="p-3 w-44 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Người thực hiện
                  </div>
                </th>
                <th className="p-3 w-36 whitespace-nowrap">Chuyên mục</th>
                <th className="p-3">Hành động & Chi tiết nghiệp vụ</th>
                <th className="p-3 w-28 text-center whitespace-nowrap">Mức độ</th>
                <th className="p-3 w-20 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-200/50 transition-colors cursor-pointer group"
                  >
                    {/* Timestamp */}
                    <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>

                    {/* Operator */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{log.nguoiThucHien}</span>
                      </div>
                      {log.chucVuNguoiThucHien && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px] pl-3">
                          {log.chucVuNguoiThucHien}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(
                          log.chuyenMuc
                        )}`}
                      >
                        {log.chuyenMuc}
                      </span>
                    </td>

                    {/* Action & Detail */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                        {log.hanhDong}
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">
                        {log.chiTiet}
                      </div>
                      {log.doiTuongLienQuan && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/70 text-slate-700 border border-slate-300/60">
                          <span className="text-slate-500 font-sans">Liên quan:</span>
                          <strong>{log.doiTuongLienQuan}</strong>
                        </div>
                      )}
                    </td>

                    {/* Level */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {getLevelBadge(log.mucDo)}
                    </td>

                    {/* Action Button */}
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-300/60 text-slate-500 hover:text-slate-900 transition-colors"
                        title="Xem chi tiết"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer for Auditors */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 px-1 pt-1 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Hệ thống ghi log tự động theo tiêu chuẩn bảo mật Quân sự. Lưu trữ cục bộ & đồng bộ trong file sao lưu.</span>
        </div>
        <div className="font-medium text-slate-700">
          Hiển thị <strong>{filteredLogs.length}</strong> / <strong>{logs.length}</strong> bản ghi nhật ký
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHI TIẾT BẢN GHI NHẬT KÝ (LOG DETAIL MODAL)                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <History className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Chi Tiết Bản Ghi Nhật Ký</h4>
                    <span className="text-[11px] font-mono text-slate-500">ID: {selectedLog.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium">Thời gian ghi nhận:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatTimestamp(selectedLog.timestamp)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Người thực hiện:</span>
                    <strong className="text-slate-900 block">{selectedLog.nguoiThucHien}</strong>
                    {selectedLog.chucVuNguoiThucHien && (
                      <span className="text-slate-500 block text-[10px]">
                        {selectedLog.chucVuNguoiThucHien}
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Mức độ & Chuyên mục:</span>
                    <div className="mt-1 flex flex-col gap-1 items-start">
                      {getLevelBadge(selectedLog.mucDo)}
                      <span className="text-[10px] font-bold text-slate-700">
                        {selectedLog.chuyenMuc}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium block">Tên hành động nghiệp vụ:</span>
                  <strong className="text-emerald-950 block text-sm">{selectedLog.hanhDong}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium block">Chi tiết mô tả:</span>
                  <p className="text-slate-800 leading-relaxed text-xs">{selectedLog.chiTiet}</p>
                </div>

                {selectedLog.doiTuongLienQuan && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5">
                    <span className="text-amber-800 font-bold block text-[11px]">Văn bản / Đối tượng liên quan:</span>
                    <span className="text-slate-900 font-mono font-bold">{selectedLog.doiTuongLienQuan}</span>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Mạng / Thiết bị:</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {selectedLog.diaChiIP || '192.168.1.10 (Mạng Quân sự nội bộ)'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl neu-flat text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM GHI CHÚ KIỂM TRA THỦ CÔNG (MANUAL AUDIT ENTRY)              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-sm text-slate-900">Ghi Nhận Biên Bản Kiểm Tra</h4>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualLog} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Người kiểm tra:</label>
                    <input
                      type="text"
                      value={manualUser}
                      onChange={(e) => setManualUser(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Chức vụ / Đơn vị:</label>
                    <input
                      type="text"
                      value={manualRole}
                      onChange={(e) => setManualRole(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Chuyên mục:</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium bg-white"
                    >
                      <option value="Hồ sơ QNCN">Hồ sơ QNCN</option>
                      <option value="Cấu hình Lương">Cấu hình Lương</option>
                      <option value="Phê duyệt & Trích sao">Phê duyệt & Trích sao</option>
                      <option value="Hệ thống & Dữ liệu">Hệ thống & Dữ liệu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mức độ:</label>
                    <select
                      value={manualLevel}
                      onChange={(e) => setManualLevel(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium bg-white"
                    >
                      <option value="THÔNG TIN">THÔNG TIN</option>
                      <option value="CẢNH BÁO">CẢNH BÁO</option>
                      <option value="QUAN TRỌNG">QUAN TRỌNG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tên hành động / Tiêu đề:</label>
                  <input
                    type="text"
                    value={manualAction}
                    onChange={(e) => setManualAction(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Văn bản / Đối tượng liên quan:</label>
                  <input
                    type="text"
                    placeholder="e.g. Biên bản kiểm tra số 12/BB-HC2 hoặc Mã QNCN"
                    value={manualTarget}
                    onChange={(e) => setManualTarget(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nội dung chi tiết kiểm tra:</label>
                  <textarea
                    rows={3}
                    placeholder="Ghi nhận kết quả kiểm toán hồ sơ hoặc kiểm tra đối chiếu bảng lương..."
                    value={manualDetail}
                    onChange={(e) => setManualDetail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl neu-flat text-xs font-bold text-slate-700"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl neu-emerald text-white text-xs font-bold shadow-xs"
                  >
                    Lưu vào nhật ký
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
