import type React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import type { GiaoVien } from "../types";

interface AddThanhVienFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  giaoViens: GiaoVien[];
  loading: boolean;
}

const AddThanhVienForm: React.FC<AddThanhVienFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  giaoViens,
  loading,
}) => {
  const [maGv, setMaGv] = useState("");
  const [vaiTro, setVaiTro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List of predefined roles for dropdown
  const vaiTroOptions = [
    { value: "Chủ tịch hội đồng", label: "Chủ tịch hội đồng" },
    { value: "Thư ký hội đồng", label: "Thư ký hội đồng" },
    { value: "Thành viên", label: "Thành viên" },
    { value: "Ủy viên", label: "Ủy viên" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!maGv) {
      setError("Vui lòng chọn giáo viên");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = {
        MaGv: maGv,
        VaiTroTrongHoiDong: vaiTro || null,
      };
      console.log("Dữ liệu gửi thêm thành viên:", formData); // Logging dữ liệu gửi
      const success = await onSubmit(formData);
      if (success) {
        // Reset form
        setMaGv("");
        setVaiTro("");
        onClose();
      }
    } catch (err) {
      console.error("Lỗi khi thêm thành viên:", err);
      setError("Không thể thêm thành viên. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Thêm thành viên hội đồng</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="maGv">
                Chọn giáo viên <span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="maGv"
                value={maGv}
                onChange={(e) => setMaGv(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">-- Chọn giáo viên --</option>
                {giaoViens.map((gv) => (
                  <option key={gv.MaGv} value={gv.MaGv}>
                    {gv.HoTen} ({gv.MaGv})
                  </option>
                ))}
              </select>
              {loading && (
                <p style={{ color: "#666", fontSize: "0.875rem" }}>
                  Đang tải danh sách giáo viên...
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="vaiTro">Vai trò trong hội đồng</label>
              <select
                id="vaiTro"
                value={vaiTro}
                onChange={(e) => setVaiTro(e.target.value)}
              >
                <option value="">-- Chọn vai trò --</option>
                {vaiTroOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Đang xử lý..." : "Thêm thành viên"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddThanhVienForm;
