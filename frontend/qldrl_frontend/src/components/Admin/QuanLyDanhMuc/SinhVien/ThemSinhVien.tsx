"use client";

import type React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import FormField from "../../QuanLyDanhMuc/common/FormField";
import type { SinhVien, Lop } from "../../types";
import Notification from "../../../../Pages/Dashboard/Admin/views/Notification";

interface ThemSinhVienProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lopList: Lop[];
}

const ThemSinhVien: React.FC<ThemSinhVienProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lopList,
}) => {
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

  const [capTaiKhoan, setCapTaiKhoan] = useState<boolean>(false);
  const [anhDaiDien, setAnhDaiDien] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAnhDaiDien(e.target.files[0]);
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Thêm các trường thông tin sinh viên
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Thêm trường CapTaiKhoan
      formDataToSend.append("CapTaiKhoan", capTaiKhoan.toString());

      // Thêm ảnh đại diện nếu có
      if (anhDaiDien) {
        formDataToSend.append("anhDaiDien", anhDaiDien);
      }

      // Gọi API tạo sinh viên
      const response = await fetch(
        "http://localhost:5163/api/QuanLySinhVien/them_sinh_vien",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi thêm sinh viên");
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
      setNotification({
        show: true,
        message: data.message || "Thêm sinh viên thành công!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Lỗi khi thêm sinh viên:", error);
      setError(error.message || "Có lỗi xảy ra khi thêm sinh viên");
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
              type="select"
              required
              options={lopList.map((lop) => ({
                value: lop.MaLop,
                label: lop.TenLop,
              }))}
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
              type="email"
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
            <div className="form-group">
              <label htmlFor="anhDaiDien">Ảnh đại diện</label>
              <input
                type="file"
                id="anhDaiDien"
                name="anhDaiDien"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="form-control"
              />
              <small className="form-text text-muted">
                Chỉ chấp nhận định dạng .jpg, .jpeg, .png
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="capTaiKhoan"
                  name="capTaiKhoan"
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
                định mã sinh viên
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
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default ThemSinhVien;
