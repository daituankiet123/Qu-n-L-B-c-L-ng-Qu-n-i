import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Monitor,
  Download,
  Upload,
  Printer,
  FileText,
  CheckCircle2,
  HardDrive,
  Wifi,
  WifiOff,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  HelpCircle,
  FileCode,
  ShieldCheck,
  X,
  Keyboard,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface WindowsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
}

export const WindowsAppModal: React.FC<WindowsAppModalProps> = ({
  isOpen,
  onClose,
  onExportBackup,
  onImportBackup,
}) => {
  const { isInstallable, isInstalled, isWindows, isOnline, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'offline' | 'backup' | 'print' | 'shortcuts'>('install');
  const [copiedBatch, setCopiedBatch] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBatch = () => {
    const batchContent = `@echo off
chcp 65001 >nul
title HE THONG XET DUYET NANG BAC LUONG QNCN - TRUONG CAO DANG HAU CAN 2
color 1F

echo =========================================================================
echo    BỘ QUỐC PHÒNG - TỔNG CỤC HẬU CẦN - KỸ THUẬT
echo    TRƯỜNG CAO ĐẲNG HẬU CẦN 2 - BAN QUÂN LỰC
echo =========================================================================
echo.
echo    HỆ THỐNG QUẢN LÝ VÀ XÉT DUYỆT NÂNG BẬC LƯƠNG QUÂN NHÂN CHUYÊN NGHIỆP
echo    (PHIÊN BẢN CHẠY TRỰC TIẾP TRÊN HỆ ĐIỀU HÀNH WINDOWS)
echo.
echo =========================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] KHONG TIM THAY NODEJS TREN MAY TINH!
    echo Vui long cai dat Node.js tai https://nodejs.org/ (Ban LTS)
    pause
    exit /b
)

if not exist node_modules (
    echo [*] Dang cai dat thu vien phan mem lan dau (mat 1-2 phut)...
    call npm install
)

echo [*] Dang khoi dong ung dung tai cong 3000...
start "" "http://localhost:3000"
npm run dev
pause`;

    const blob = new Blob([batchContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'start-windows.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = () => {
    const mdContent = `# HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG TRÊN WINDOWS
## TRƯỜNG CAO ĐẲNG HẬU CẦN 2 - BAN QUÂN LỰC

1. CÀI ĐẶT DESKTOP APP (PWA):
- Mở ứng dụng trên Microsoft Edge hoặc Google Chrome.
- Bấm vào biểu tượng Cài đặt trên thanh địa chỉ (hoặc nút Cài đặt ngay trên màn hình).
- Chọn Ghim vào Taskbar và tạo lối tắt trên Desktop.

2. CHẠY TRÊN MẠNG NỘI BỘ QUÂN SỰ KHÔNG CÓ INTERNET:
- Sao chép thư mục ứng dụng vào máy tính.
- Kích đúp vào file "start-windows.bat".
- Hệ thống tự động mở tại http://localhost:3000.

3. IN ẤN CHUẨN A4 THEO NGHỊ ĐỊNH 30/2020/NĐ-CP:
- Khổ giấy: A4 (210 x 297 mm)
- Bố cục: Dọc (Portrait)
- Đánh dấu chọn: Background graphics (Đồ họa nền)`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Huong-Dan-Windows-CDHC2.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-blue-400/40">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Trung tâm Hỗ trợ Windows
                </span>
                <span className="text-[11px] text-emerald-300">
                  Phiên bản Máy tính để bàn & Mạng nội bộ
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5 flex items-center gap-2">
                Hoàn thiện Khâu Sử dụng trên Hệ điều hành Windows
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>Hệ điều hành:</span>
              <strong className="text-slate-900 font-bold">{isWindows ? 'Microsoft Windows (Đã tối ưu)' : 'Máy tính để bàn'}</strong>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Trực tuyến (Sẵn sàng đồng bộ)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" /> Ngoại tuyến (Đang chạy Cache Offline)
                </span>
              )}
            </div>
          </div>

          <div>
            {isInstalled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đang chạy chế độ Desktop Standalone
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-300">
                <Monitor className="w-3.5 h-3.5 text-blue-600" /> Sẵn sàng cài đặt thành App Windows
              </span>
            )}
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'install'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            1. Cài đặt Desktop App (PWA)
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'offline'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            2. Chạy Mạng Nội Bộ Quân Sự (.BAT)
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            3. Sao lưu & Di chuyển dữ liệu (.JSON)
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'print'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            4. In ấn Khổ A4 trên Windows
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'shortcuts'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            5. Phím tắt Windows
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CÀI ĐẶT DESKTOP APP */}
          {activeTab === 'install' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      Công nghệ PWA
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Cài đặt trực tiếp thành Phần mềm Windows độc lập
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 max-w-xl">
                    Chạy như ứng dụng máy tính nguyên bản (Native App) trên Windows 10 & 11, có biểu tượng trên Desktop, ghim vào thanh Taskbar và Start Menu, hoạt động độc lập không phụ thuộc thanh địa chỉ trình duyệt.
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {isInstalled ? (
                    <div className="px-5 py-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Đã cài đặt trên Windows</span>
                    </div>
                  ) : isInstallable ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={install}
                      className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      <span>CÀI ĐẶT NGAY LÊN WINDOWS</span>
                    </motion.button>
                  ) : (
                    <div className="text-center">
                      <div className="px-4 py-2.5 rounded-xl bg-slate-200/80 text-slate-700 font-semibold text-xs border border-slate-300">
                        Sử dụng Microsoft Edge hoặc Chrome
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Xem hướng dẫn 3 bước bên dưới
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3 Steps Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full flex items-start justify-end p-2 text-blue-700 font-black text-lg">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    Bước 1: Mở trình duyệt
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mở phần mềm bằng <strong>Microsoft Edge</strong> (mặc định trên Windows) hoặc <strong>Google Chrome</strong>.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full flex items-start justify-end p-2 text-blue-700 font-black text-lg">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-600" />
                    Bước 2: Bấm biểu tượng App
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tại góc phải của thanh địa chỉ URL, nhấp vào biểu tượng <strong>Cài đặt ứng dụng</strong> (App Available / Install) rồi bấm <strong>Cài đặt (Install)</strong>.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full flex items-start justify-end p-2 text-blue-700 font-black text-lg">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Bước 3: Ghim vào Windows
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tích chọn <strong>Ghim vào Taskbar</strong> và <strong>Tạo lối tắt trên Màn hình nền</strong> để mở nhanh hàng ngày từ thanh tác vụ Windows.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHẠY OFFLINE MẠNG NỘI BỘ BẰNG FILE .BAT */}
          {activeTab === 'offline' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      Bảo mật Quân sự
                    </span>
                    <h3 className="text-base font-bold text-emerald-950">
                      Khởi chạy tại Ban Quân lực & Mạng nội bộ không có Internet
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">100% Offline</span>
                </div>
                <p className="text-sm text-slate-700">
                  Tại Trường Cao Đẳng Hậu Cần 2, các máy tính xử lý tài liệu mật và hồ sơ nhân sự quân sự thường được ngắt mạng Internet bên ngoài. Bộ khởi chạy Windows tự động giúp đồng chí khởi động ứng dụng chỉ với <strong>1 cú nhấp đúp chuột</strong>.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={handleDownloadBatch}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    Tải file chạy "start-windows.bat"
                  </button>

                  <button
                    onClick={handleDownloadDoc}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-2 transition"
                  >
                    <FileText className="w-4 h-4 text-emerald-700" />
                    Tải tài liệu hướng dẫn (.txt)
                  </button>
                </div>
              </div>

              {/* Code Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    Nội dung kịch bản chạy tự động (start-windows.bat)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `@echo off\nchcp 65001 >nul\ntitle NANG BAC LUONG QNCN - CDHC 2\nstart "" "http://localhost:3000"\nnpm run dev`
                      );
                      setCopiedBatch(true);
                      setTimeout(() => setCopiedBatch(false), 2000);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    {copiedBatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedBatch ? 'Đã sao chép!' : 'Sao chép lệnh'}
                  </button>
                </div>
                <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800">
                  <p>@echo off</p>
                  <p>chcp 65001 &gt;nul</p>
                  <p>title HE THONG XET DUYET NANG BAC LUONG QNCN - TRUONG CAO DANG HAU CAN 2</p>
                  <p>echo [*] Dang khoi dong may chu ung dung noi bo tai cong 3000...</p>
                  <p>start "" "http://localhost:3000"</p>
                  <p>npm run dev</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAO LƯU & DI CHUYỂN DỮ LIỆU */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    An toàn dữ liệu
                  </span>
                  <h3 className="text-base font-bold text-amber-950">
                    Sao lưu & Di chuyển Cơ sở dữ liệu giữa các máy tính Windows bằng USB
                  </h3>
                </div>
                <p className="text-sm text-slate-700">
                  Đồng chí có thể xuất toàn bộ dữ liệu (Hồ sơ QNCN, thang bảng lương, quy chế nâng lương, lịch sử xét duyệt và danh sách kỷ luật) ra 1 file dữ liệu <code>.json</code> để lưu giữ dự phòng hoặc copy qua USB sang máy tính của Thủ trưởng hoặc trợ lý khác.
                </p>

                <div className="pt-2 flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      onExportBackup();
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    XUẤT TOÀN BỘ CSDL RA FILE JSON (SAO LƯU)
                  </button>

                  <button
                    onClick={() => {
                      onImportBackup();
                    }}
                    className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-amber-400 flex items-center gap-2 shadow-sm transition"
                  >
                    <Upload className="w-4 h-4 text-amber-600" />
                    KHÔI PHỤC DỮ LIỆU TỪ FILE JSON (RESTORE)
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs text-slate-600">
                <h5 className="font-bold text-slate-800">Quy trình bàn giao và sao lưu định kỳ khuyến nghị:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Hàng tháng/quý</strong>: Sau khi hoàn thành xét duyệt nâng bậc lương, cán bộ quân lực bấm "Xuất toàn bộ CSDL ra file JSON" và lưu vào thư mục lưu trữ của đơn vị.</li>
                  <li><strong>Chuyển giao máy tính</strong>: Khi đổi máy tính công tác mới, chỉ cần cắm USB chứa file sao lưu và bấm "Khôi phục dữ liệu từ file JSON", toàn bộ hồ sơ sẽ được khôi phục 100%.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: TỐI ƯU IN ẤN TRÊN WINDOWS */}
          {activeTab === 'print' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-700 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Chuẩn Nghị định 30/2020/NĐ-CP
                  </span>
                  <h3 className="text-base font-bold text-purple-950">
                    Cấu hình In ấn Chuẩn Khổ A4 trên Trình điều khiển Máy in Windows
                  </h3>
                </div>
                <p className="text-sm text-slate-700">
                  Hệ thống đã được thiết kế sẵn tỷ lệ co giãn thông minh (Auto-fit proportional scaling) cam kết không đứt trang, không mất tiêu đề cột và không đè lấp chữ ký. Để bản in ra máy in Canon LBP 2900/3300 hoặc HP LaserJet đạt độ sắc nét cao nhất:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-purple-600" />
                    1. Thiết lập Trang in Windows (Ctrl + P)
                  </h5>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• <strong>Khổ giấy (Paper size)</strong>: Chọn chính xác <strong>A4 (210 x 297 mm)</strong>.</li>
                    <li>• <strong>Hướng in (Orientation)</strong>: <strong>Dọc (Portrait)</strong> cho cả Trang 1 (Quyết định) và Trang 2 (Bảng phụ lục danh sách).</li>
                    <li>• <strong>Tỷ lệ (Scale)</strong>: Chọn <strong>Mặc định (100%)</strong> hoặc <strong>Vừa với vùng in (Fit to printable area)</strong>.</li>
                    <li>• <strong>Căn lề (Margins)</strong>: Chọn <strong>Mặc định</strong> hoặc <strong>Tối thiểu</strong>.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    2. Tùy chọn bắt buộc
                  </h5>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• <strong>Đồ họa nền (Background graphics)</strong>: <strong className="text-emerald-700">BẮT BUỘC TÍCH CHỌN</strong> để đường kẻ viền bảng, huy hiệu và màu nền tiêu đề bảng hiển thị trọn vẹn.</li>
                    <li>• <strong>Đầu trang & Chân trang (Headers & Footers)</strong>: <strong>BỎ TÍCH</strong> để loại bỏ dòng URL và ngày giờ mặc định của trình duyệt.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PHÍM TẮT WINDOWS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Các tổ hợp phím tắt nhanh trên bàn phím máy tính Windows:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-700 font-medium">In tức thì văn bản / quyết định:</span>
                  <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow font-mono font-bold text-slate-800">
                    Ctrl + P
                  </kbd>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Xuất tệp sao lưu dữ liệu nhanh:</span>
                  <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow font-mono font-bold text-slate-800">
                    Ctrl + S
                  </kbd>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Chế độ xem toàn màn hình (Full Screen):</span>
                  <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow font-mono font-bold text-slate-800">
                    F11
                  </kbd>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Mở Trung tâm hỗ trợ Windows:</span>
                  <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow font-mono font-bold text-slate-800">
                    Ctrl + Shift + W
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Trường Cao Đẳng Hậu Cần 2 - Tổng cục Hậu cần • Hỗ trợ kỹ thuật Ban Quân lực
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
