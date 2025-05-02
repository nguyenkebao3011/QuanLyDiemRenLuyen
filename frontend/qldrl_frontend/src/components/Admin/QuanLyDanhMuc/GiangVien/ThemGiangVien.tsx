import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import FormField from "../common/FormField";
import { GiaoVien } from "../../types";

interface ThemGiangVienProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ThemGiangVien: React.FC<ThemGiangVienProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const API_URL = "http://localhost:5163/api";

  const [formData, setFormData] = useState<Partial<GiaoVien>>({
    HoTen: "",
    MaGv: "",
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    GioiTinh: "",
    NgaySinh: new Date().toISOString().split("T")[0],
    TrangThai: "HoatDong",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<GiaoVien>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");
      // Gọi API thêm giảng viên
      await axios.post(`${API_URL}/QuanLyGiangVien/them_giang_vien`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
      alert("Thêm giảng viên mới thành công");
    } catch (error: any) {
      console.error("Lỗi khi thêm giảng viên:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm giảng viên"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="lecturer-form">
        <div className="form-header">
          <h3>Thêm giảng viên mới</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormField
              label="Họ và tên"
              id="HoTen"
              name="HoTen"
              value={formData.HoTen || ""}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Mã giảng viên"
              id="MaGv"
              name="MaGv"
              value={formData.MaGv || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <FormField
              label="Email"
              id="Email"
              name="Email"
              value={formData.Email || ""}
              onChange={handleInputChange}
              type="Email"
              required
            />
            <FormField
              label="Số điện thoại"
              id="SoDienThoai"
              name="SoDienThoai"
              value={formData.SoDienThoai || ""}
              onChange={handleInputChange}
              type="tel"
              required
              placeholder="0901234567"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Địa chỉ"
              id="DiaChi"
              name="DiaChi"
              value={formData.DiaChi || ""}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Giới tính"
              id="GioiTinh"
              name="GioiTinh"
              value={formData.GioiTinh || ""}
              onChange={handleInputChange}
              type="select"
              required
              options={[
                { value: "Nam", label: "Nam" },
                { value: "Nữ", label: "Nữ" },
                { value: "Khác", label: "Khác" },
              ]}
            />
          </div>

          <div className="form-row">
            <FormField
              label="Ngày sinh"
              id="NgaySinh"
              name="NgaySinh"
              value={formData.NgaySinh?.toString() || ""}
              onChange={handleInputChange}
              type="date"
            />
            <FormField
              label="Trạng thái"
              id="TrangThai"
              name="TrangThai"
              value={formData.TrangThai || "HoatDong"}
              onChange={handleInputChange}
              type="select"
              options={[
                { value: "HoatDong", label: "Hoạt động" },
                { value: "Khoa", label: "Khóa" },
              ]}
            />
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
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemGiangVien;
