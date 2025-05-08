import type React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import FormField from "../common/FormField";
import type { GiaoVien } from "../../types";
import { ApiService } from "../../../../untils/services/service-api";
import Notification from "../../../../Pages/Dashboard/Admin/views/Notification";

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
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "error",
  });

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

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification({ show: false, message: "", type: "error" });

    try {
      if (!formData.HoTen || !formData.MaGv) {
        setNotification({
          show: true,
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      await ApiService.themGiangVien(formData);

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi thêm giảng viên:", error);
      setNotification({
        show: true,
        message:
          error.response?.data?.message || "Có lỗi xảy ra khi thêm giảng viên",
        type: "error",
      });
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

        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}

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
