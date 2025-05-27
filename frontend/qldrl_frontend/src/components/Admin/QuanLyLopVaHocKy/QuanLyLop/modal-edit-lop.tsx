import type React from "react";
import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { ApiService } from "../../../../untils/services/service-api";

interface LopDTO {
  MaLop: string;
  TenLop: string;
  NienKhoa: string;
  MaGv: string;
  SoSinhVien?: number;
  TenGiangVien?: string;
}

interface GiangVien {
  MaGv: string;
  HoTen: string;
  Email: string;
  Khoa: string;
}

interface ModalEditLopProps {
  show: boolean;
  onClose: () => void;
  lop: LopDTO | null;
  giangViens: GiangVien[];
  onSuccess: () => void;
  showToast: (
    title: string,
    description: string,
    type?: "success" | "error" | "warning"
  ) => void;
}

const ModalEditLop: React.FC<ModalEditLopProps> = ({
  show,
  onClose,
  lop,
  giangViens,
  onSuccess,
  showToast,
}) => {
  const [formData, setFormData] = useState<LopDTO>({
    MaLop: "",
    TenLop: "",
    NienKhoa: "",
    MaGv: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lop) {
      setFormData(lop);
      setErrors({});
    }
  }, [lop]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.TenLop.trim()) {
      newErrors.TenLop = "Tên lớp không được bỏ trống";
    }
    if (!formData.NienKhoa.trim()) {
      newErrors.NienKhoa = "Niên khóa không được bỏ trống";
    }
    if (!formData.MaGv) {
      newErrors.MaGv = "Vui lòng chọn giảng viên";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await ApiService.capNhatLop(formData.MaLop, formData);

      onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi cập nhật lớp:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Không thể cập nhật lớp. Vui lòng thử lại sau.";
      showToast("Lỗi", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show || !lop) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X className="icon" />
        </button>

        <h2>Chỉnh sửa lớp học</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mã lớp</label>
            <input className="form-input" value={formData.MaLop} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">
              Tên lớp <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.TenLop ? "error" : ""}`}
              value={formData.TenLop}
              onChange={(e) => handleChange("TenLop", e.target.value)}
              placeholder="Nhập tên lớp"
            />
            {errors.TenLop && <p className="error-text">{errors.TenLop}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Niên khóa <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.NienKhoa ? "error" : ""}`}
              value={formData.NienKhoa}
              onChange={(e) => handleChange("NienKhoa", e.target.value)}
              placeholder="Ví dụ: 2023-2024"
            />
            {errors.NienKhoa && <p className="error-text">{errors.NienKhoa}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Giảng viên <span className="required">*</span>
            </label>
            <select
              className={`form-select ${errors.MaGv ? "error" : ""}`}
              value={formData.MaGv}
              onChange={(e) => handleChange("MaGv", e.target.value)}
            >
              <option value="">Chọn giảng viên</option>
              {giangViens.map((gv) => (
                <option key={gv.MaGv} value={gv.MaGv}>
                  {gv.HoTen} - {gv.Khoa}
                </option>
              ))}
            </select>
            {errors.MaGv && <p className="error-text">{errors.MaGv}</p>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              <X className="icon" />
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              <Save className="icon" />
              {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditLop;
