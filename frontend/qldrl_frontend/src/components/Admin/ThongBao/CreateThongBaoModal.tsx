import type React from "react";
import { useState, useEffect } from "react";
import { X, Send, AlertCircle, Check } from "lucide-react";
import type { HoatDong, TaoThongBaoTuHoatDongRequest } from "../types";
import { ApiService } from "../../../untils/services/service-api";

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
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaoThongBaoTuHoatDongRequest>({
    MaHoatDong: 0,
    TieuDe: "",
    NoiDung: "",
    MaQl: maQl,
    LoaiThongBao: "Hoạt động",
  });

  const [selectedHoatDong, setSelectedHoatDong] = useState<HoatDong | null>(
    null
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.MaHoatDong <= 0) {
      setError("Vui lòng chọn một hoạt động");
      return;
    }

    if (!formData.TieuDe?.trim()) {
      setError("Vui lòng nhập tiêu đề thông báo");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await ApiService.taoThongBaoTuHoatDong(formData);
      setSuccess("Tạo thông báo thành công!");

      // Reset form sau 2 giây
      setTimeout(() => {
        setSuccess(null);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError("Không thể tạo thông báo. Vui lòng thử lại sau.");
      console.error(err);
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

        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <Check className="success-icon" />
            <span>{success}</span>
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
              <option value="Học tập">Học tập</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
              <option value="Khác">Khác</option>
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
