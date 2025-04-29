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
import "../../../Pages/Dashboard/Admin/css/TaoHoatDong.css";
import { HocKy, QuanLyKhoa } from "../types";

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
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  // State để lưu giá trị ngày giờ
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const api = axios.create({
    baseURL: "http://localhost:5163/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    setError(null);
    try {
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

  const formatDateToISO = (date: string, time: string): string => {
    if (!date || !time) return "";
    const [day, month, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}T${time}:00`;
  };

  const formatDateToDDMMYYYY = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validateDates = (
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string
  ) => {
    setStartDateError(null);
    setEndDateError(null);

    if (!startDate || !startTime || !endDate || !endTime) {
      setStartDateError("Vui lòng nhập đầy đủ ngày và giờ");
      setEndDateError("Vui lòng nhập đầy đủ ngày và giờ");
      return false;
    }

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      setStartDateError("Định dạng ngày phải là DD/MM/YYYY");
      setEndDateError("Định dạng ngày phải là DD/MM/YYYY");
      return false;
    }

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      setStartDateError("Định dạng giờ phải là HH:MM");
      setEndDateError("Định dạng giờ phải là HH:MM");
      return false;
    }

    const start = new Date(formatDateToISO(startDate, startTime));
    const end = new Date(formatDateToISO(endDate, endTime));
    const currentDate = new Date("2025-04-24"); // Ngày hiện tại là 24/04/2025

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setStartDateError("Ngày giờ không hợp lệ");
      setEndDateError("Ngày giờ không hợp lệ");
      return false;
    }

    // Ràng buộc 1: Ngày kết thúc phải sau ngày bắt đầu
    if (start >= end) {
      setEndDateError("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }

    // Ràng buộc 2: Ngày bắt đầu không được là ngày trong quá khứ
    if (start < currentDate) {
      setStartDateError("Ngày bắt đầu không được là ngày trong quá khứ");
      return false;
    }

    // Ràng buộc 3: Ngày bắt đầu và ngày kết thúc phải thuộc học kỳ
    const selectedHocKy = hocKys.find((hk) => hk.MaHocKy === formData.maHocKy);
    if (!selectedHocKy) {
      setStartDateError("Vui lòng chọn học kỳ hợp lệ");
      setEndDateError("Vui lòng chọn học kỳ hợp lệ");
      return false;
    }

    const hocKyStart = new Date(selectedHocKy.NgayBatDau);
    const hocKyEnd = new Date(selectedHocKy.NgayKetThuc);

    if (start < hocKyStart || end > hocKyEnd) {
      const hocKyStartFormatted = formatDateToDDMMYYYY(
        selectedHocKy.NgayBatDau
      );
      const hocKyEndFormatted = formatDateToDDMMYYYY(selectedHocKy.NgayKetThuc);
      setStartDateError(
        `Ngày bắt đầu phải nằm trong học kỳ (${selectedHocKy.TenHocKy} - ${selectedHocKy.NamHoc}) từ ${hocKyStartFormatted} đến ${hocKyEndFormatted}`
      );
      setEndDateError(
        `Ngày kết thúc phải nằm trong học kỳ (${selectedHocKy.TenHocKy} - ${selectedHocKy.NamHoc}) từ ${hocKyStartFormatted} đến ${hocKyEndFormatted}`
      );
      return false;
    }

    return true;
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "startDate" | "endDate"
  ) => {
    const { value } = e.target;
    const [year, month, day] = value.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    if (field === "startDate") {
      setStartDate(formattedDate);
      setFormData((prev) => ({
        ...prev,
        ngayBatDau: startTime ? `${formattedDate} ${startTime}` : formattedDate,
      }));
    } else {
      setEndDate(formattedDate);
      setFormData((prev) => ({
        ...prev,
        ngayKetThuc: endTime ? `${formattedDate} ${endTime}` : formattedDate,
      }));
    }
  };

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "startTime" | "endTime"
  ) => {
    const { value } = e.target;

    if (field === "startTime") {
      setStartTime(value);
      if (startDate) {
        setFormData((prev) => ({
          ...prev,
          ngayBatDau: `${startDate} ${value}`,
        }));
      }
    } else {
      setEndTime(value);
      if (endDate) {
        setFormData((prev) => ({
          ...prev,
          ngayKetThuc: `${endDate} ${value}`,
        }));
      }
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
    setStartDateError(null);
    setEndDateError(null);

    const isValid = validateDates(startDate, startTime, endDate, endTime);
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    const formattedData = {
      ...formData,
      ngayBatDau: formatDateToISO(startDate, startTime),
      ngayKetThuc: formatDateToISO(endDate, endTime),
    };

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
      const response = await api.post("/HoatDong/tao_hoat_dong", formattedData);
      if (response.status === 200 || response.status === 201) {
        toast.success("Tạo hoạt động thành công!");
        resetForm();
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
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setStartDateError(null);
    setEndDateError(null);
  };

  const handleCancel = () => {
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
            <label>
              <Calendar size={16} />
              Ngày bắt đầu <span className="required">*</span>
            </label>
            <div className="date-time-inputs">
              <input
                type="date"
                value={
                  startDate ? startDate.split("/").reverse().join("-") : ""
                }
                onChange={(e) => handleDateChange(e, "startDate")}
                required
                className="date-input"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange(e, "startTime")}
                required
                className="time-input"
              />
            </div>
            <p className="date-format-hint">
              Đã chọn:{" "}
              {startDate && startTime
                ? `${startDate} ${startTime}`
                : "Chưa chọn"}
            </p>
            {startDateError && (
              <div className="error-message">{startDateError}</div>
            )}
          </div>

          <div className="form-group">
            <label>
              <Clock size={16} />
              Ngày kết thúc <span className="required">*</span>
            </label>
            <div className="date-time-inputs">
              <input
                type="date"
                value={endDate ? endDate.split("/").reverse().join("-") : ""}
                onChange={(e) => handleDateChange(e, "endDate")}
                required
                className="date-input"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange(e, "endTime")}
                required
                className="time-input"
              />
            </div>
            <p className="date-format-hint">
              Đã chọn:{" "}
              {endDate && endTime ? `${endDate} ${endTime}` : "Chưa chọn"}
            </p>
            {endDateError && (
              <div className="error-message">{endDateError}</div>
            )}
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
