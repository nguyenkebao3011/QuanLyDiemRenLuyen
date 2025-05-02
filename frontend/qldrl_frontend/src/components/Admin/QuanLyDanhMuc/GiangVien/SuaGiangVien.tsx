import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import FormField from "../common/FormField";
import { GiaoVien } from "../../types";

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
  const API_URL = "http://localhost:5163/api";

  const [formData, setFormData] = useState<Partial<GiaoVien>>({
    HoTen: "",
    MaGv: "",
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    GioiTinh: "",
    NgaySinh: "",
    TrangThai: "1",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");

      // Gọi API cập nhật giảng viên
      await axios.put(
        `${API_URL}/QuanLyGiangVien/cap_nhat_giang_vien/${giangVienId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsSubmitting(false);
      onSuccess();
      onClose();
      alert("Cập nhật giảng viên thành công");
    } catch (error: any) {
      console.error("Lỗi khi cập nhật giảng viên:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật giảng viên"
      );
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
