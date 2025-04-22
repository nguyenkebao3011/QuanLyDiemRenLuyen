import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Award,
  Save,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "../css/TaoHoatDong.css";

interface HocKy {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
  NgayBatDau: string;
  NgayKetThuc: string;
}

interface QuanLyKhoa {
  MaQl: string;
  MaTaiKhoan: string;
  HoTen: string;
  Khoa: string;
  Email: string;
  SoDienThoai: string;
}

interface HoatDongFormData {
  tenHoatDong: string;
  moTa: string;
  diaDiem: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  soLuongToiDa: number;
  diemCong: number;
  trangThai: string;
  maHocKy: number | null;
  maQl: string | null;
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
    maHocKy: null,
    maQl: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hocKys, setHocKys] = useState<HocKy[]>([]);
  const [quanLyKhoa, setQuanLyKhoa] = useState<QuanLyKhoa | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tạo instance axios với cấu hình mặc định
  const api = axios.create({
    baseURL: "http://localhost:5163/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Lấy thông tin học kỳ và quản lý khoa từ API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    setError(null);
    try {
      // Lấy thông tin học kỳ sử dụng axios
      const hocKyResponse = await api.get("/HocKy/lay_hoc_ky");

      if (hocKyResponse.status === 200) {
        const hocKyData = hocKyResponse.data;
        setHocKys(Array.isArray(hocKyData) ? hocKyData : [hocKyData]);

        if (
          hocKyData &&
          (Array.isArray(hocKyData) ? hocKyData.length > 0 : true)
        ) {
          setFormData((prev) => ({
            ...prev,
            maHocKy: Array.isArray(hocKyData)
              ? hocKyData[0].MaHocKy
              : hocKyData.MaHocKy,
          }));
        }
      } else {
        setError("Không thể lấy dữ liệu học kỳ");
      }

      const qlKhoaResponse = await api.get("/QuanLyKhoa/thong_tin");

      if (qlKhoaResponse.status === 200) {
        const qlKhoaData = qlKhoaResponse.data;

        setQuanLyKhoa(qlKhoaData);
        setFormData((prev) => ({
          ...prev,
          maQl: qlKhoaData.MaQl,
        }));
      } else {
        setError("Không thể lấy thông tin quản lý khoa");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          `Lỗi khi tải dữ liệu: ${
            error.response?.data?.message || error.message
          }`
        );
        toast.error(
          `Lỗi khi tải dữ liệu: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        setError("Đã xảy ra lỗi khi tải dữ liệu");
        toast.error("Đã xảy ra lỗi khi tải dữ liệu");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "soLuongToiDa" || name === "diemCong" || name === "maHocKy"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Kiểm tra dữ liệu trước khi gửi
    if (!formData.maHocKy) {
      toast.error("Vui lòng chọn học kỳ");
      setIsLoading(false);
      return;
    }

    if (!formData.maQl) {
      toast.error("Không có thông tin quản lý khoa");
      setIsLoading(false);
      return;
    }

    try {
      // Sử dụng axios để gửi dữ liệu
      const response = await api.post("/HoatDong/tao_hoat_dong", formData);

      if (response.status === 200 || response.status === 201) {
        toast.success("Tạo hoạt động thành công!");
        resetForm();

        // Chuyển về trang danh sách hoạt động sau khi tạo thành công
        window.history.pushState({}, "", "/admin/dashboard?menu=activities");
        window.dispatchEvent(new Event("popstate"));
      } else {
        toast.error(
          `Lỗi: ${response.data.message || "Không thể tạo hoạt động"}`
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          `Lỗi: ${error.response?.data?.message || "Không thể tạo hoạt động"}`
        );
      } else {
        toast.error("Đã xảy ra lỗi khi kết nối với máy chủ");
      }
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
      maHocKy: hocKys.length > 0 ? hocKys[0].MaHocKy : null,
      maQl: quanLyKhoa?.MaQl || null,
    });
  };

  const handleCancel = () => {
    // Quay lại trang danh sách hoạt động
    window.history.pushState({}, "", "/admin/dashboard?menu=activities");
    window.dispatchEvent(new Event("popstate"));
  };

  if (loadingData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="tao-hoat-dong-container">
      <div className="form-header">
        <h2>Tạo hoạt động mới</h2>
        <p>Điền đầy đủ thông tin để tạo hoạt động mới trong hệ thống</p>
        {quanLyKhoa && (
          <div className="admin-info">
            <p>
              Người tạo: <strong>{quanLyKhoa.HoTen}</strong> - Khoa{" "}
              <strong>{quanLyKhoa.Khoa}</strong>
            </p>
          </div>
        )}
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
              className="input-field"
            />
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
              className="input-field"
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
              className="input-field"
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
              className="input-field"
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
              className="input-field"
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
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maHocKy" className="hocky-label">
              <Calendar size={16} />
              Học kỳ <span className="required">*</span>
              <button
                type="button"
                className="reload-btn"
                onClick={fetchData}
                title="Tải lại dữ liệu học kỳ"
              >
                <RefreshCw size={14} />
              </button>
            </label>
            {error && <div className="error-message">{error}</div>}
            <select
              id="maHocKy"
              name="maHocKy"
              value={formData.maHocKy || ""}
              onChange={handleChange}
              required
              className="select-field"
            >
              <option value="">Chọn học kỳ</option>
              {hocKys.map((hocKy) => (
                <option key={hocKy.MaHocKy} value={hocKy.MaHocKy}>
                  {hocKy.TenHocKy} - {hocKy.NamHoc}
                </option>
              ))}
            </select>
            {hocKys.length === 0 && (
              <div className="no-data-message">
                <p>
                  Không có dữ liệu học kỳ. Vui lòng tải lại hoặc kiểm tra kết
                  nối.
                </p>
              </div>
            )}
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
              className="select-field"
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
            className="textarea-field"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-cancel">
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
