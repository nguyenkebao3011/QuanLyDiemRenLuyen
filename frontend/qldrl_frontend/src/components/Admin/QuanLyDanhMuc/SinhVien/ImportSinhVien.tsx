"use client";

import type React from "react";
import { useState } from "react";
import { X, Upload, FileText } from "lucide-react";

interface ImportSinhVienProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportSinhVien: React.FC<ImportSinhVienProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capTaiKhoan, setCapTaiKhoan] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Tạo FormData để gửi file và các tham số
      const formData = new FormData();
      if (file) {
        formData.append("excelFile", file);
      }
      formData.append("capTaiKhoan", capTaiKhoan.toString());

      // Gọi API import sinh viên từ Excel
      const response = await fetch(
        "http://localhost:5163/api/QuanLySinhVien/import_sinh_vien",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Có lỗi xảy ra khi import sinh viên"
        );
      }

      const data = await response.json();
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi import sinh viên:", error);
      setError(error.message || "Có lỗi xảy ra khi import sinh viên");
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Tạo URL để tải mẫu Excel
    window.open(
      "http://localhost:5163/api/QuanLySinhVien/download_template",
      "_blank"
    );
  };

  return (
    <div className="form-overlay">
      <div className="student-form import-form">
        <div className="form-header">
          <h3>Import sinh viên từ Excel</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="import-instructions">
            <h4>Hướng dẫn:</h4>
            <ol>
              <li>
                Tải xuống{" "}
                <a
                  href="#"
                  onClick={handleDownloadTemplate}
                  className="template-link"
                >
                  mẫu Excel
                </a>{" "}
                để đảm bảo định dạng chính xác.
              </li>
              <li>Điền thông tin sinh viên vào mẫu Excel.</li>
              <li>Tải lên file Excel đã điền thông tin.</li>
            </ol>
          </div>

          <div className="file-upload-container">
            <div className="file-upload-area">
              {file ? (
                <div className="selected-file">
                  <FileText size={24} />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <Upload size={32} />
                  <p>Kéo thả file Excel hoặc nhấp để chọn</p>
                  <span>Chỉ chấp nhận file .xlsx, .xls</span>
                </div>
              )}
              <input
                type="file"
                id="excel-file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="capTaiKhoan"
                  checked={capTaiKhoan}
                  onChange={(e) => setCapTaiKhoan(e.target.checked)}
                  className="checkbox-input"
                />
                <label htmlFor="capTaiKhoan" className="checkbox-label">
                  Cấp tài khoản cho sinh viên
                </label>
              </div>
              <p className="checkbox-hint">
                Nếu chọn, hệ thống sẽ tự động tạo tài khoản với mật khẩu mặc
                định là ngày sinh (ddMMyyyy)
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? "Đang xử lý..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportSinhVien;
