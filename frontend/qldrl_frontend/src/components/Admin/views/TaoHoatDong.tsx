import type React from "react";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Award,
  Save,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "../css/TaoHoatDong.css";
interface HoatDongFormData {
  tenHoatDong: string;
  moTa: string;
  diaDiem: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  soLuongToiDa: number;
  diemCong: number;
  trangThai: string;
  maLoaiHoatDong: number;
}

const TaoHoatDong: React.FC = () => {
  const [formData, setFormData] = useState<HoatDongFormData>({
    tenHoatDong: "",
    moTa: "",
    diaDiem: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    soLuongToiDa: 0,
    diemCong: 0,
    trangThai: "Đang mở đăng ký",
    maLoaiHoatDong: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "soLuongToiDa" ||
        name === "diemCong" ||
        name === "maLoaiHoatDong"
          ? Number.parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/HoatDong/tao_hoat_dong", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Tạo hoạt động thành công!");
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(`Lỗi: ${errorData.message || "Không thể tạo hoạt động"}`);
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi kết nối với máy chủ");
      console.error("Error creating activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenHoatDong: "",
      moTa: "",
      diaDiem: "",
      ngayBatDau: "",
      ngayKetThuc: "",
      soLuongToiDa: 0,
      diemCong: 0,
      trangThai: "Đang mở đăng ký",
      maLoaiHoatDong: 1,
    });
  };

  return (
    <div className="tao-hoat-dong-container">
      <div className="form-header">
        <h2>Tạo hoạt động mới</h2>
        <p>Điền đầy đủ thông tin để tạo hoạt động mới trong hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="activity-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="tenHoatDong">
              <FileText size={16} />
              Tên hoạt động <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tenHoatDong"
              name="tenHoatDong"
              value={formData.tenHoatDong}
              onChange={handleChange}
              placeholder="Nhập tên hoạt động"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maLoaiHoatDong">
              <Award size={16} />
              Loại hoạt động <span className="required">*</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="diaDiem">
              <MapPin size={16} />
              Địa điểm <span className="required">*</span>
            </label>
            <input
              type="text"
              id="diaDiem"
              name="diaDiem"
              value={formData.diaDiem}
              onChange={handleChange}
              placeholder="Nhập địa điểm tổ chức"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ngayBatDau">
              <Calendar size={16} />
              Ngày bắt đầu <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="ngayBatDau"
              name="ngayBatDau"
              value={formData.ngayBatDau}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ngayKetThuc">
              <Clock size={16} />
              Ngày kết thúc <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="ngayKetThuc"
              name="ngayKetThuc"
              value={formData.ngayKetThuc}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="soLuongToiDa">
              <Users size={16} />
              Số lượng tối đa <span className="required">*</span>
            </label>
            <input
              type="number"
              id="soLuongToiDa"
              name="soLuongToiDa"
              value={formData.soLuongToiDa}
              onChange={handleChange}
              min="1"
              placeholder="Nhập số lượng sinh viên tối đa"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="diemCong">
              <Award size={16} />
              Điểm cộng <span className="required">*</span>
            </label>
            <input
              type="number"
              id="diemCong"
              name="diemCong"
              value={formData.diemCong}
              onChange={handleChange}
              min="0"
              step="0.5"
              placeholder="Nhập điểm cộng cho hoạt động"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="trangThai">
              <FileText size={16} />
              Trạng thái
            </label>
            <select
              id="trangThai"
              name="trangThai"
              value={formData.trangThai}
              onChange={handleChange}
            >
              <option value="Đang mở đăng ký">Đang mở đăng ký</option>
              <option value="Đã đóng đăng ký">Đã đóng đăng ký</option>
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="moTa">
            <FileText size={16} />
            Mô tả hoạt động
          </label>
          <textarea
            id="moTa"
            name="moTa"
            value={formData.moTa}
            onChange={handleChange}
            rows={4}
            placeholder="Nhập mô tả chi tiết về hoạt động"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={resetForm} className="btn-cancel">
            <X size={16} />
            Hủy
          </button>
          <button type="submit" className="btn-submit" disabled={isLoading}>
            <Save size={16} />
            {isLoading ? "Đang xử lý..." : "Lưu hoạt động"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaoHoatDong;
