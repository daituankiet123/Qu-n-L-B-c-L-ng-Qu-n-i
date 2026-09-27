import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  X,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { QNCNProfile } from '../../types';
import { downloadQNCNTemplate, parseQNCNExcel } from '../../services/excelService';

interface ImportPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (profiles: QNCNProfile[], mode: 'append' | 'overwrite') => void;
}

export const ImportPersonnelModal: React.FC<ImportPersonnelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<QNCNProfile[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setParseErrors([]);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = parseQNCNExcel(buffer);
      setParsedData(result.profiles);
      setParseErrors(result.errors);
    } catch (err: any) {
      setParseErrors([`Không thể đọc file: ${err.message || 'Lỗi định dạng Excel'}`]);
      setParsedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Import Danh Sách QNCN từ File Dữ Liệu</h3>
              <p className="text-xs text-emerald-200">
                Nhập danh sách quân số đồng loạt để phục vụ tính lương và xét duyệt nâng bậc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Download Template Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Chưa có file dữ liệu đúng mẫu?</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Tải ngay file mẫu Excel chuẩn Trường Cao Đẳng Hậu cần 2 với đầy đủ cấu trúc cột (Số hiệu, Cấp bậc, Ngạch, Bậc, Hệ số, Ngày hưởng...).
                </p>
              </div>
            </div>
            <button
              onClick={downloadQNCNTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4 text-amber-300" />
              Tải file mẫu Excel (.xlsx)
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-8 text-center bg-slate-50/60 hover:bg-emerald-50/30 transition-all cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 group-hover:text-emerald-700 group-hover:scale-105 transition-all mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {file ? file.name : 'Bấm vào đây để chọn file Excel (.xlsx, .xls, .csv) hoặc kéo thả vào đây'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống tự động nhận diện các cột dữ liệu theo định dạng chuẩn quân sự
            </p>
          </div>

          {/* Errors Display */}
          {parseErrors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Cảnh báo khi đọc dữ liệu ({parseErrors.length} lỗi):
              </div>
              <ul className="text-xs text-rose-700 list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800">
                    Đã đọc thành công {parsedData.length} bản ghi quân nhân
                  </span>
                </div>

                {/* Import Mode Radio */}
                <div className="flex items-center gap-4 text-xs font-medium">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Thêm nối tiếp vào danh sách cũ</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-rose-700">
                    <input
                      type="radio"
                      name="importMode"
                      value="overwrite"
                      checked={importMode === 'overwrite'}
                      onChange={() => setImportMode('overwrite')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Ghi đè làm mới toàn bộ database</span>
                  </label>
                </div>
              </div>

              {/* Preview table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">STT</th>
                        <th className="py-2 px-3">Họ và tên</th>
                        <th className="py-2 px-3">Số hiệu</th>
                        <th className="py-2 px-3">Cấp bậc / Chức vụ</th>
                        <th className="py-2 px-3">Đơn vị</th>
                        <th className="py-2 px-3">Ngạch</th>
                        <th className="py-2 px-3">Bậc</th>
                        <th className="py-2 px-3">Hệ số</th>
                        <th className="py-2 px-3">Ngày hưởng</th>
                        <th className="py-2 px-3">% TN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.slice(0, 10).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{p.hoVaTen}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{p.maQNCN}</td>
                          <td className="py-2 px-3 text-slate-700">
                            {p.capBac} - {p.chucVu}
                          </td>
                          <td className="py-2 px-3 text-slate-700">{p.donVi}</td>
                          <td className="py-2 px-3 text-slate-600">{p.ngach}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">Bậc {p.bacLuongHienTai}</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-800">{p.heSoLuongHienTai}</td>
                          <td className="py-2 px-3 text-slate-600">{p.ngayHuongHienTai}</td>
                          <td className="py-2 px-3 text-slate-700">{p.phanTramThamNien}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <div className="py-2 px-3 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
                    ... và còn {parsedData.length - 10} đồng chí nữa
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedData.length > 0 && `Đang chọn chế độ: ${importMode === 'append' ? 'Thêm nối tiếp' : 'Ghi đè'}`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedData.length === 0}
              className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              Lưu vào cơ sở dữ liệu ({parsedData.length} QNCN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
