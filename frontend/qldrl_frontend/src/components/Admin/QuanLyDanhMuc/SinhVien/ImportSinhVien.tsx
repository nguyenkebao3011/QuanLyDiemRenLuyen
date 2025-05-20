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
  const [importResults, setImportResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setShowResults(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Vui lòng chọn file Excel");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setImportResults([]);
    setShowResults(false);

    try {
      // Kiểm tra định dạng file
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        throw new Error("File phải có định dạng .xlsx hoặc .xls");
      }

      // Kiểm tra kích thước file (dưới 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước file không được vượt quá 5MB");
      }

      const formData = new FormData();
      formData.append("file", file);
      const url = `http://localhost:5163/api/QuanLySinhVien/import_sinh_vien?capTaiKhoan=${capTaiKhoan}`;

      console.log("Bắt đầu gửi request"); // Debug log
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      console.log("Nhận response, status:", response.status); // Debug log

      // Xử lý lỗi HTTP
      if (!response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          // Nếu response là JSON, đọc lỗi từ JSON
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Lỗi từ server: " + response.status
          );
        } else {
          // Nếu không phải JSON, đọc dưới dạng text
          const errorText = await response.text();
          throw new Error(
            `Lỗi từ server (${response.status}): ${errorText.substring(
              0,
              100
            )}...`
          );
        }
      }

      // Xử lý response thành công
      const data = await response.json();
      console.log("Dữ liệu trả về:", data); // Debug log

      if (data.chiTiet && Array.isArray(data.chiTiet)) {
        setImportResults(data.chiTiet);
      }

      setShowResults(true);

      if (!data.chiTiet || data.chiTiet.length === 0) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Lỗi khi import sinh viên:", error);
      setError(error.message || "Có lỗi xảy ra khi import sinh viên");
    } finally {
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

          {showResults && importResults.length > 0 && (
            <div className="import-results">
              <h4>Kết quả import:</h4>
              <div className="results-container">
                <ul>
                  {importResults.map((result, index) => (
                    <li
                      key={index}
                      className={
                        result.includes("Lỗi")
                          ? "error-result"
                          : "success-result"
                      }
                    >
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

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
                định là mã sinh viên
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
