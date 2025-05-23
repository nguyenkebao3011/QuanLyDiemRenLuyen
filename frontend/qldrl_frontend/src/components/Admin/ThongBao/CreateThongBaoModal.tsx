import type React from "react";
import { useState, useEffect } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import type { HoatDong, TaoThongBaoRequest } from "../types";
import { ApiService } from "../../../untils/services/service-api";
import Notification from "../../../Pages/Dashboard/Admin/views/Notification";

interface CreateThongBaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maQl: string;
}

const CreateThongBaoModal: React.FC<CreateThongBaoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  maQl,
}) => {
  const [hoatDongs, setHoatDongs] = useState<HoatDong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaoThongBaoRequest>({
    MaHoatDong: 0,
    TieuDe: "",
    NoiDung: "",
    MaQl: maQl,
    LoaiThongBao: "Hoạt động",
  });

  const [selectedHoatDong, setSelectedHoatDong] = useState<HoatDong | null>(
    null
  );

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
  useEffect(() => {
    if (isOpen) {
      fetchHoatDongs();
    }
  }, [isOpen]);
  useEffect(() => {
    if (selectedHoatDong) {
      setFormData((prev) => ({
        ...prev,
        MaHoatDong: selectedHoatDong.MaHoatDong,
        TieuDe: `Thông báo về hoạt động: ${selectedHoatDong.TenHoatDong}`,
        NoiDung: `
          <p>Kính gửi các bạn sinh viên,</p>
          <p>Nhà trường thông báo về hoạt động <strong>${
            selectedHoatDong.TenHoatDong
          }</strong> với các thông tin chi tiết như sau:</p>
          <ul>
            <li><strong>Thời gian:</strong> ${formatDateTime(
              selectedHoatDong.NgayBatDau
            )} - ${formatDateTime(selectedHoatDong.NgayKetThuc)}</li>
            <li><strong>Địa điểm:</strong> ${selectedHoatDong.DiaDiem}</li>
            <li><strong>Mô tả:</strong> ${selectedHoatDong.MoTa}</li>
            <li><strong>Điểm cộng:</strong> ${selectedHoatDong.DiemCong}</li>
          </ul>
          <p>Đề nghị sinh viên đăng ký tham gia đúng thời hạn.</p>
          <p>Trân trọng,</p>
          <p>Ban quản lý khoa</p>
        `,
      }));
    }
  }, [selectedHoatDong]);

  const fetchHoatDongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.layDanhSachHoatDongAll();
      setHoatDongs(data);
    } catch (err) {
      setError("Không thể tải danh sách hoạt động. Vui lòng thử lại sau.");
      console.error(err);
      setNotification({
        show: true,
        message: "Không thể tải danh sách hoạt động. Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHoatDongChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const maHoatDong = Number.parseInt(e.target.value);
    if (maHoatDong > 0) {
      const selected =
        hoatDongs.find((hd) => hd.MaHoatDong === maHoatDong) || null;
      setSelectedHoatDong(selected);
    } else {
      setSelectedHoatDong(null);
      setFormData((prev) => ({
        ...prev,
        MaHoatDong: 0,
        TieuDe: "",
        NoiDung: "",
      }));
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.MaHoatDong <= 0) {
      setError("Vui lòng chọn một hoạt động");
      setNotification({
        show: true,
        message: "Vui lòng chọn một hoạt động",
        type: "error",
      });
      return;
    }

    if (!formData.TieuDe?.trim()) {
      setError("Vui lòng nhập tiêu đề thông báo");
      setNotification({
        show: true,
        message: "Vui lòng nhập tiêu đề thông báo",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Form data:", formData);
      await ApiService.taoThongBao(formData);
      setNotification({
        show: true,
        message: "Tạo thông báo thành công!",
        type: "success",
      });

      // Reset form sau 2 giây
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError("Không thể tạo thông báo. Vui lòng thử lại sau.");
      console.error(err);
      setNotification({
        show: true,
        message: "Không thể tạo thông báo. Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()} ${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container create-thong-bao-modal">
        <div className="modal-header">
          <h2>Tạo thông báo từ hoạt động</h2>
          <button className="btn-close" onClick={onClose} disabled={loading}>
            <X className="close-icon" />
          </button>
        </div>

        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}

        {error && !notification.show && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="MaHoatDong">Chọn hoạt động</label>
            <select
              id="MaHoatDong"
              name="MaHoatDong"
              value={formData.MaHoatDong}
              onChange={handleHoatDongChange}
              disabled={loading}
              required
            >
              <option value={0}>-- Chọn hoạt động --</option>
              {hoatDongs.map((hd) => (
                <option key={hd.MaHoatDong} value={hd.MaHoatDong}>
                  {hd.TenHoatDong}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="LoaiThongBao">Loại thông báo</label>
            <select
              id="LoaiThongBao"
              name="LoaiThongBao"
              value={formData.LoaiThongBao}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="Hoạt động">Hoạt động</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="TieuDe">Tiêu đề</label>
            <input
              type="text"
              id="TieuDe"
              name="TieuDe"
              value={formData.TieuDe}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="NoiDung">Nội dung</label>
            <textarea
              id="NoiDung"
              name="NoiDung"
              value={formData.NoiDung}
              onChange={handleInputChange}
              rows={10}
              disabled={loading}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Send className="send-icon" />
                  <span>Tạo thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThongBaoModal;
