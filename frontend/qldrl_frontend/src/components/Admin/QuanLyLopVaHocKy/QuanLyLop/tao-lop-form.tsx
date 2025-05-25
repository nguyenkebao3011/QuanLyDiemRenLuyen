"use client";

import type React from "react";
import { useState } from "react";
import { Save, X, GraduationCap, RotateCcw } from "lucide-react";
import { ApiService } from "../../../../untils/services/service-api";

interface LopDTO {
  MaLop: string;
  TenLop: string;
  NienKhoa: string;
  MaGv: string;
}

interface GiangVien {
  MaGv: string;
  HoTen: string;
  Email: string;
  Khoa: string;
}

interface TaoLopFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  giangViens: GiangVien[];
  showToast: (
    title: string,
    description: string,
    type?: "success" | "error" | "warning"
  ) => void;
}

const TaoLopForm: React.FC<TaoLopFormProps> = ({
  onSuccess,
  onCancel,
  giangViens,
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.MaLop.trim()) {
      newErrors.MaLop = "Mã lớp không được bỏ trống";
    }
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
      await ApiService.themLop(formData);

      onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi tạo lớp:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Không thể tạo lớp. Vui lòng thử lại sau.";
      showToast("Lỗi", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      MaLop: "",
      TenLop: "",
      NienKhoa: "",
      MaGv: "",
    });
    setErrors({});
  };

  return (
    <div className="tao-lop-container">
      <div className="form-header">
        <h2>
          <GraduationCap className="icon-xl" />
          Tạo lớp học mới
        </h2>
        <p>Điền đầy đủ thông tin để tạo lớp học mới trong hệ thống</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Mã lớp <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.MaLop ? "error" : ""}`}
              value={formData.MaLop}
              onChange={(e) => handleChange("MaLop", e.target.value)}
              placeholder="Nhập mã lớp"
            />
            {errors.MaLop && <p className="error-text">{errors.MaLop}</p>}
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
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <X className="icon" />
            Hủy
          </button>
          <button type="button" className="btn-secondary" onClick={resetForm}>
            <RotateCcw className="icon" />
            Đặt lại
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            <Save className="icon" />
            {isLoading ? "Đang xử lý..." : "Lưu lớp học"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaoLopForm;
