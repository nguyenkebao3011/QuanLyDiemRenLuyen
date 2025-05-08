import type React from "react";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
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
import axios from "axios";
import type { HocKy, QuanLyKhoa, HoatDong } from "../types";
import Notification from "../../../Pages/Dashboard/Admin/views/Notification";
import "../../../Pages/Dashboard/Admin/css/TaoHoatDong.css";
import { ApiService } from "../../../untils/services/service-api";

interface ModalEditHoatDongProps {
  show: boolean;
  onClose: () => void;
  hoatDong: HoatDong | null;
  hocKys: HocKy[];
  quanLyKhoa: QuanLyKhoa | null;
  onSuccess?: () => void;
  fetchHocKys: () => void;
}

const TRANG_THAI_OPTIONS = [
  "Chưa bắt đầu",
  "Đang mở đăng ký",
  "Đã đóng đăng ký",
  "Đang diễn ra",
  "Đã kết thúc",
];

const ModalEditHoatDong: React.FC<ModalEditHoatDongProps> = ({
  show,
  onClose,
  hoatDong,
  hocKys,
  quanLyKhoa,
  onSuccess,
  fetchHocKys,
}) => {
  const [form, setForm] = useState<HoatDong | null>(hoatDong);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Phục vụ cho date/time input
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  // Add notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Đồng bộ dữ liệu khi mở modal
  useEffect(() => {
    setGlobalError(null);
    setFieldErrors({});
    if (hoatDong) {
      setForm(hoatDong);
      if (hoatDong.NgayBatDau) {
        const d = new Date(hoatDong.NgayBatDau);
        setStartDate(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`
        );
        setStartTime(
          `${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}`
        );
      }
      if (hoatDong.NgayKetThuc) {
        const d = new Date(hoatDong.NgayKetThuc);
        setEndDate(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`
        );
        setEndTime(
          `${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}`
        );
      }
    }
  }, [hoatDong]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!form) return;
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "startDate" | "endDate"
  ) => {
    const { value } = e.target;
    if (field === "startDate") {
      setStartDate(value);
      setFieldErrors((prev) => ({ ...prev, startDate: "" }));
    } else {
      setEndDate(value);
      setFieldErrors((prev) => ({ ...prev, endDate: "" }));
    }
  };

  const handleTimeChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "startTime" | "endTime"
  ) => {
    const { value } = e.target;
    if (field === "startTime") {
      setStartTime(value);
      setFieldErrors((prev) => ({ ...prev, startTime: "" }));
    } else {
      setEndTime(value);
      setFieldErrors((prev) => ({ ...prev, endTime: "" }));
    }
  };

  function combineDateTime(date: string, time: string) {
    if (!date || !time) return "";
    return `${date}T${time}:00`;
  }

  const validateFields = (): boolean => {
    if (!form) return false;
    const errors: Record<string, string> = {};
    // Validate required fields
    if (!form.TenHoatDong || !form.TenHoatDong.trim())
      errors.TenHoatDong = "Tên hoạt động không được bỏ trống";
    if (!form.DiaDiem || !form.DiaDiem.trim())
      errors.DiaDiem = "Địa điểm không được bỏ trống";
    if (!startDate) errors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!startTime) errors.startTime = "Vui lòng chọn giờ bắt đầu";
    if (!endDate) errors.endDate = "Vui lòng chọn ngày kết thúc";
    if (!endTime) errors.endTime = "Vui lòng chọn giờ kết thúc";
    if (!form.SoLuongToiDa || form.SoLuongToiDa < 1)
      errors.SoLuongToiDa = "Số lượng tối đa phải lớn hơn 0";
    if (form.DiemCong == null || form.DiemCong < 0)
      errors.DiemCong = "Điểm cộng không hợp lệ";
    if (!form.MaHocKy) errors.MaHocKy = "Vui lòng chọn học kỳ";
    if (!form.TrangThai) errors.TrangThai = "Vui lòng chọn trạng thái";

    // Validate ngày giờ logic
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(combineDateTime(startDate, startTime));
      const end = new Date(combineDateTime(endDate, endTime));
      if (isNaN(start.getTime()))
        errors.startDate = "Ngày bắt đầu không hợp lệ";
      if (isNaN(end.getTime())) errors.endDate = "Ngày kết thúc không hợp lệ";
      if (!errors.startDate && !errors.endDate && start >= end) {
        errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGlobalError(null);

    if (!form) {
      setIsLoading(false);
      return;
    }

    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...form,
        NgayBatDau: combineDateTime(startDate, startTime),
        NgayKetThuc: combineDateTime(endDate, endTime),
      };

      await ApiService.suaHoatDong(form.MaHoatDong, dataToSend);

      setNotification({
        show: true,
        message: "Cập nhật hoạt động thành công!",
        type: "success",
      });
      onSuccess && onSuccess();
      onClose();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status === 400 &&
          typeof error.response.data === "string"
        ) {
          setGlobalError(error.response.data);
          setNotification({
            show: true,
            message: error.response.data,
            type: "error",
          });
        } else if (error.response?.data?.message) {
          setGlobalError(error.response.data.message);
          setNotification({
            show: true,
            message: error.response.data.message,
            type: "error",
          });
        } else {
          setGlobalError("Lỗi không xác định khi cập nhật hoạt động!");
          setNotification({
            show: true,
            message: "Lỗi không xác định khi cập nhật hoạt động!",
            type: "error",
          });
        }
      } else {
        setGlobalError("Lỗi khi cập nhật hoạt động!");
        setNotification({
          show: true,
          message: "Lỗi khi cập nhật hoạt động!",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!show || !form) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ minWidth: 480, maxWidth: 650 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="form-header">
          <h2>Chỉnh sửa hoạt động</h2>
          {quanLyKhoa && (
            <div className="admin-info">
              <p>
                Người chỉnh sửa: <strong>{quanLyKhoa.HoTen}</strong> - Khoa{" "}
                <strong>{quanLyKhoa.Khoa}</strong>
              </p>
            </div>
          )}
        </div>

        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}

        <form onSubmit={handleSubmit} className="activity-form">
          {globalError && (
            <div className="error-message" style={{ marginBottom: 16 }}>
              {globalError}
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label>
                <FileText size={16} />
                Tên hoạt động <span className="required">*</span>
              </label>
              <input
                type="text"
                name="TenHoatDong"
                value={form.TenHoatDong || ""}
                onChange={handleChange}
                required
                className="input-field"
              />
              {fieldErrors.TenHoatDong && (
                <div className="error-message">{fieldErrors.TenHoatDong}</div>
              )}
            </div>
            <div className="form-group">
              <label>
                <MapPin size={16} />
                Địa điểm <span className="required">*</span>
              </label>
              <input
                type="text"
                name="DiaDiem"
                value={form.DiaDiem || ""}
                onChange={handleChange}
                required
                className="input-field"
              />
              {fieldErrors.DiaDiem && (
                <div className="error-message">{fieldErrors.DiaDiem}</div>
              )}
            </div>
            <div className="form-group">
              <label>
                <Calendar size={16} />
                Ngày bắt đầu <span className="required">*</span>
              </label>
              <div className="date-time-inputs">
                <input
                  type="date"
                  value={startDate}
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
              {fieldErrors.startDate && (
                <div className="error-message">{fieldErrors.startDate}</div>
              )}
              {fieldErrors.startTime && (
                <div className="error-message">{fieldErrors.startTime}</div>
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
                  value={endDate}
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
              {fieldErrors.endDate && (
                <div className="error-message">{fieldErrors.endDate}</div>
              )}
              {fieldErrors.endTime && (
                <div className="error-message">{fieldErrors.endTime}</div>
              )}
            </div>
            <div className="form-group">
              <label>
                <Users size={16} />
                Số lượng tối đa <span className="required">*</span>
              </label>
              <input
                type="number"
                name="SoLuongToiDa"
                value={form.SoLuongToiDa}
                onChange={handleChange}
                min={1}
                required
                className="input-field"
              />
              {fieldErrors.SoLuongToiDa && (
                <div className="error-message">{fieldErrors.SoLuongToiDa}</div>
              )}
            </div>
            <div className="form-group">
              <label>
                <Award size={16} />
                Điểm cộng <span className="required">*</span>
              </label>
              <input
                type="number"
                name="DiemCong"
                value={form.DiemCong}
                onChange={handleChange}
                min={0}
                step={0.5}
                required
                className="input-field"
              />
              {fieldErrors.DiemCong && (
                <div className="error-message">{fieldErrors.DiemCong}</div>
              )}
            </div>
            <div className="form-group">
              <label>
                <Calendar size={16} />
                Học kỳ <span className="required">*</span>
                <button
                  type="button"
                  className="reload-btn"
                  onClick={fetchHocKys}
                  title="Tải lại dữ liệu học kỳ"
                >
                  <RefreshCw size={14} />
                </button>
              </label>
              <select
                name="MaHocKy"
                value={form.MaHocKy || ""}
                onChange={handleChange}
                required
                className="select-field"
              >
                <option value="">Chọn học kỳ</option>
                {hocKys.map((hk) => (
                  <option key={hk.MaHocKy} value={hk.MaHocKy}>
                    {hk.TenHocKy} - {hk.NamHoc}
                  </option>
                ))}
              </select>
              {fieldErrors.MaHocKy && (
                <div className="error-message">{fieldErrors.MaHocKy}</div>
              )}
            </div>
            <div className="form-group">
              <label>
                <FileText size={16} />
                Trạng thái
              </label>
              <select
                name="TrangThai"
                value={form.TrangThai}
                onChange={handleChange}
                className="select-field"
              >
                {TRANG_THAI_OPTIONS.map((tt) => (
                  <option key={tt} value={tt}>
                    {tt}
                  </option>
                ))}
              </select>
              {fieldErrors.TrangThai && (
                <div className="error-message">{fieldErrors.TrangThai}</div>
              )}
            </div>
          </div>
          <div className="form-group full-width">
            <label>
              <FileText size={16} />
              Mô tả hoạt động
            </label>
            <textarea
              name="MoTa"
              value={form.MoTa || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Nhập mô tả chi tiết về hoạt động"
              className="textarea-field"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              <X size={16} />
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              <Save size={16} />
              {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditHoatDong;
