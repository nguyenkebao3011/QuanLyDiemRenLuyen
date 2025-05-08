"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import FormField from "../common/FormField";
import type { SinhVien, Lop } from "../../types";
import { ApiService } from "../../../../untils/services/service-api";
import Notification from "../../../../Pages/Dashboard/Admin/views/Notification";

interface SuaSinhVienProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sinhVienId: string | null;
  data?: SinhVien | null;
  lopList: Lop[];
}

const SuaSinhVien: React.FC<SuaSinhVienProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sinhVienId,
  data,
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

  useEffect(() => {
    if (isOpen && data) {
      setFormData({
        HoTen: data.HoTen || "",
        MaSV: data.MaSV,
        MaLop: data.MaLop || "",
        Email: data.Email || "",
        SoDienThoai: data.SoDienThoai || "",
        DiaChi: data.DiaChi || "",
        GioiTinh: data.GioiTinh || "",
        NgaySinh: formatDate(data.NgaySinh),
        MaVaiTro: data.MaVaiTro,
        TrangThai: data.TrangThai || "HoatDong",
      });
    }
  }, [isOpen, data]);

  if (!isOpen || !sinhVienId) return null;

  const formatDate = (dateString: Date | string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
    } catch (error) {
      return "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<SinhVien>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await ApiService.capNhatSinhVien(sinhVienId, formData);
      setIsSubmitting(false);
      onSuccess();
      onClose();
      setNotification({
        show: true,
        message: "Cập nhật sinh viên thành công!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Lỗi khi cập nhật sinh viên:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật sinh viên"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="student-form">
        <div className="form-header">
          <h3>Cập nhật thông tin sinh viên</h3>
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
              disabled
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
              {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
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

export default SuaSinhVien;
