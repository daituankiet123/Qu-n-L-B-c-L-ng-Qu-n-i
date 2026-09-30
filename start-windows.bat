@echo off
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
    echo [!] KHÔNG TÌM THẤY NODEJS TRÊN MÁY TÍNH CỦA ĐỒNG CHÍ!
    echo.
    echo Để chạy hệ thống cục bộ trên Windows, vui lòng tải và cài đặt Node.js:
    echo Tải tại: https://nodejs.org/ (Chọn bản LTS khuyên dùng)
    echo.
    echo Sau khi cài đặt xong, hãy mở lại file "start-windows.bat" này.
    echo.
    pause
    exit /b
)

echo [*] Đang kiểm tra thư viện phần mềm...
if not exist node_modules (
    echo [*] Thư viện chưa được cài đặt. Đang tiến hành cài đặt lần đầu (mất 1-2 phút)...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] Cài đặt thư viện thất bại! Vui lòng kiểm tra kết nối mạng.
        pause
        exit /b
    )
)

echo.
echo [*] Đang khởi động máy chủ ứng dụng tại cổng 3000...
echo [*] Trình duyệt web sẽ tự động mở trong giây lát...
echo.
echo -------------------------------------------------------------------------
echo    Mẹo: Bấm Ctrl + C nếu muốn dừng ứng dụng.
echo    Địa chỉ truy cập: http://localhost:3000
echo -------------------------------------------------------------------------
echo.

start "" "http://localhost:3000"
npm run dev

pause
