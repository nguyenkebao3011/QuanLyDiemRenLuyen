import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import FormField from "../../QuanLyDanhMuc/common/FormField";
import { SinhVien } from "../../types";

interface ThemSinhVienProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ThemSinhVien: React.FC<ThemSinhVienProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const API_URL = "http://localhost:5163/api";

  const [formData, setFormData] = useState<Partial<SinhVien>>({
    HoTen: "",
    MaSV: "",
    MaLop: "",
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    GioiTinh: "",
    NgaySinh: new Date().toISOString().split("T")[0],
    MaVaiTro: 1,
    TrangThai: "HoatDong",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

      // Form data để submit
      const formDataToSubmit = new FormData();

      // Thêm các trường dữ liệu vào FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSubmit.append(key, value.toString());
        }
      });

      // Gọi API thêm sinh viên
      await axios.post(
        `${API_URL}/QuanLySinhVien/them_sinh_vien`,
        formDataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Tạm thời dùng setTimeout để giả lập API call
    } catch (error: any) {
      console.error("Lỗi khi thêm sinh viên:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm sinh viên"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="student-form">
        <div className="form-header">
          <h3>Thêm sinh viên mới</h3>
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
              label="Mã sinh viên"
              id="MaSV"
              name="MaSV"
              value={formData.MaSV || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <FormField
              label="Lớp"
              id="MaLop"
              name="MaLop"
              value={formData.MaLop || ""}
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
              label="Email"
              id="Email"
              name="Email"
              value={formData.Email || ""}
              onChange={handleInputChange}
              type="Email"
              required
              placeholder="example@huit.edu.vn"
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
              label="Ngày sinh"
              id="NgaySinh"
              name="NgaySinh"
              value={formData.NgaySinh?.toString() || ""}
              onChange={handleInputChange}
              type="date"
              required
            />
          </div>

          <div className="form-row">
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
            <FormField
              label="Vai trò"
              id="MaVaiTro"
              name="MaVaiTro"
              value={formData.MaVaiTro?.toString() || "1"}
              onChange={handleInputChange}
              type="select"
              options={[{ value: 1, label: "Sinh viên" }]}
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

export default ThemSinhVien;
