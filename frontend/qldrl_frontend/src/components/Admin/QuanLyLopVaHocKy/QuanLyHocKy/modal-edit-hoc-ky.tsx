"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { ApiService } from "../../../../untils/services/service-api";

interface HocKyDTO {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
  NgayBatDau: string;
  NgayKetThuc: string;
}

interface ModalEditHocKyProps {
  show: boolean;
  onClose: () => void;
  hocKy: HocKyDTO | null;
  onSuccess: () => void;
  showToast: (
    title: string,
    description: string,
    type?: "success" | "error" | "warning"
  ) => void;
}

const ModalEditHocKy: React.FC<ModalEditHocKyProps> = ({
  show,
  onClose,
  hocKy,
  onSuccess,
  showToast,
}) => {
  const [formData, setFormData] = useState<HocKyDTO>({
    MaHocKy: 0,
    TenHocKy: "",
    NamHoc: "",
    NgayBatDau: "",
    NgayKetThuc: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hocKy) {
      // Format dates for input fields
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        ...hocKy,
        NgayBatDau: formatDateForInput(hocKy.NgayBatDau),
        NgayKetThuc: formatDateForInput(hocKy.NgayKetThuc),
      });
      setErrors({});
    }
  }, [hocKy]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.TenHocKy.trim()) {
      newErrors.TenHocKy = "Tên học kỳ không được bỏ trống";
    }
    if (!formData.NamHoc.trim()) {
      newErrors.NamHoc = "Năm học không được bỏ trống";
    }
    if (!formData.NgayBatDau) {
      newErrors.NgayBatDau = "Ngày bắt đầu không được bỏ trống";
    }
    if (!formData.NgayKetThuc) {
      newErrors.NgayKetThuc = "Ngày kết thúc không được bỏ trống";
    }

    // Validate date range
    if (formData.NgayBatDau && formData.NgayKetThuc) {
      const startDate = new Date(formData.NgayBatDau);
      const endDate = new Date(formData.NgayKetThuc);
      if (startDate >= endDate) {
        newErrors.NgayKetThuc = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await ApiService.capNhatHocKy(formData.MaHocKy, formData);

      onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi cập nhật học kỳ:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Không thể cập nhật học kỳ. Vui lòng thử lại sau.";
      showToast("Lỗi", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show || !hocKy) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X className="icon" />
        </button>

        <h2>Chỉnh sửa học kỳ</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mã học kỳ</label>
            <input className="form-input" value={formData.MaHocKy} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">
              Tên học kỳ <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.TenHocKy ? "error" : ""}`}
              value={formData.TenHocKy}
              onChange={(e) => handleChange("TenHocKy", e.target.value)}
              placeholder="Nhập tên học kỳ"
            />
            {errors.TenHocKy && <p className="error-text">{errors.TenHocKy}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Năm học <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.NamHoc ? "error" : ""}`}
              value={formData.NamHoc}
              onChange={(e) => handleChange("NamHoc", e.target.value)}
              placeholder="Ví dụ: 2023-2024"
            />
            {errors.NamHoc && <p className="error-text">{errors.NamHoc}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Ngày bắt đầu <span className="required">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.NgayBatDau ? "error" : ""}`}
              value={formData.NgayBatDau}
              onChange={(e) => handleChange("NgayBatDau", e.target.value)}
            />
            {errors.NgayBatDau && (
              <p className="error-text">{errors.NgayBatDau}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Ngày kết thúc <span className="required">*</span>
            </label>
            <input
              type="date"
              className={`form-input ${errors.NgayKetThuc ? "error" : ""}`}
              value={formData.NgayKetThuc}
              onChange={(e) => handleChange("NgayKetThuc", e.target.value)}
            />
            {errors.NgayKetThuc && (
              <p className="error-text">{errors.NgayKetThuc}</p>
            )}
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

export default ModalEditHocKy;
