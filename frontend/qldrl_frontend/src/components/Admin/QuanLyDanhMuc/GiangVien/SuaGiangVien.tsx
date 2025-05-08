import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import FormField from "../common/FormField";
import type { GiaoVien } from "../../types";
import { ApiService } from "../../../../untils/services/service-api";
import Notification from "../../../../Pages/Dashboard/Admin/views/Notification";

interface SuaGiangVienProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  giangVienId: string | null;
  data?: GiaoVien | null;
}

const SuaGiangVien: React.FC<SuaGiangVienProps> = ({
  isOpen,
  onClose,
  onSuccess,
  giangVienId,
  data,
}) => {
  const [formData, setFormData] = useState<Partial<GiaoVien>>({
    HoTen: "",
    MaGv: "",
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    GioiTinh: "",
    NgaySinh: "",
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

  // Load dữ liệu giảng viên khi component được mở
  useEffect(() => {
    if (isOpen && data) {
      setFormData({
        HoTen: data.HoTen || "",
        MaGv: data.MaGv,
        Email: data.Email || "",
        SoDienThoai: data.SoDienThoai || "",
        DiaChi: data.DiaChi || "",
        GioiTinh: data.GioiTinh || "",
        NgaySinh: formatDate(data.NgaySinh),
        TrangThai: data.TrangThai || "HoatDong",
      });
    }
  }, [isOpen, data]);

  if (!isOpen || !giangVienId) return null;

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
    setFormData((prev) => ({
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
      // Validate form data
      if (!formData.HoTen || !formData.MaGv) {
        setNotification({
          show: true,
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // Use ApiService instead of direct axios call
      await ApiService.capNhatGiangVien(giangVienId, formData);

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật giảng viên:", error);
      setNotification({
        show: true,
        message:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật giảng viên",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="lecturer-form">
        <div className="form-header">
          <h3>Cập nhật thông tin giảng viên</h3>
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
              disabled
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
              {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuaGiangVien;
