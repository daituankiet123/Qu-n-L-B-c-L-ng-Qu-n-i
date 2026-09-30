@echo off
chcp 65001 >nul
title DONG GOI UNG DUNG CHO WINDOWS - TRUONG CAO DANG HAU CAN 2
color 0A

echo =========================================================================
echo    BỘ QUỐC PHÒNG - TỔNG CỤC HẬU CẦN
echo    TRƯỜNG CAO ĐẲNG HẬU CẦN 2
echo    ĐÓNG GÓI PHẦN MỀM CHẠY OFFLINE TRÊN MÁY TÍNH WINDOWS
echo =========================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Không tìm thấy Node.js. Vui lòng cài đặt Node.js trước khi đóng gói.
    pause
    exit /b
)

echo [*] Đang biên dịch mã nguồn và đóng gói thư mục 'dist'...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo [V] ĐÃ ĐÓNG GÓI THÀNH CÔNG!
    echo Toàn bộ mã nguồn chạy offline đã sẵn sàng tại thư mục "dist".
    echo Đồng chí có thể sao chép thư mục "dist" sang máy tính quân sự không có internet
    echo và chạy trực tiếp bằng bất kỳ công cụ web server tĩnh nào (hoặc chạy lệnh: npm run preview).
    echo.
) else (
    echo.
    echo [X] Quá trình biên dịch xảy ra lỗi. Vui lòng kiểm tra lại.
    echo.
)

pause
