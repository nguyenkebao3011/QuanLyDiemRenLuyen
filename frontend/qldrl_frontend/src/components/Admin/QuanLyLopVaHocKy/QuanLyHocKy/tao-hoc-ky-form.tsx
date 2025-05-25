"use client";

import type React from "react";
import { useState } from "react";
import { Save, X, BookOpen, RotateCcw } from "lucide-react";
import { ApiService } from "../../../../untils/services/service-api";

interface HocKyDTO {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
  NgayBatDau: string;
  NgayKetThuc: string;
}

interface TaoHocKyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  showToast: (
    title: string,
    description: string,
    type?: "success" | "error" | "warning"
  ) => void;
}

const TaoHocKyForm: React.FC<TaoHocKyFormProps> = ({
  onSuccess,
  onCancel,
  showToast,
}) => {
  const [formData, setFormData] = useState<Omit<HocKyDTO, "MaHocKy">>({
    TenHocKy: "",
    NamHoc: "",
    NgayBatDau: "",
    NgayKetThuc: "",
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
      await ApiService.taoHocKy(formData);

      onSuccess();
    } catch (err: any) {
      console.error("Lỗi khi tạo học kỳ:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Không thể tạo học kỳ. Vui lòng thử lại sau.";
      showToast("Lỗi", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      TenHocKy: "",
      NamHoc: "",
      NgayBatDau: "",
      NgayKetThuc: "",
    });
    setErrors({});
  };

  return (
    <div className="tao-lop-container">
      <div className="form-header">
        <h2>
          <BookOpen className="icon-xl" />
          Tạo học kỳ mới
        </h2>
        <p>Điền đầy đủ thông tin để tạo học kỳ mới trong hệ thống</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Tên học kỳ <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.TenHocKy ? "error" : ""}`}
              value={formData.TenHocKy}
              onChange={(e) => handleChange("TenHocKy", e.target.value)}
              placeholder="Ví dụ: Học kỳ 1, Học kỳ 2, Học kỳ hè"
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
            {isLoading ? "Đang xử lý..." : "Lưu học kỳ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaoHocKyForm;
