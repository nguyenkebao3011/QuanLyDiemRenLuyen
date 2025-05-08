import type React from "react";
import { useEffect, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import type {
  PhanHoiDiemRenLuyenDetailDTO,
  XuLyPhanHoiRequest,
} from "../types";
import "../../../Pages/Dashboard/Admin/css/PhanHoiDiem.css";
import Notification from "../../../Pages/Dashboard/Admin/views/Notification";

interface PhanHoiProcessFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: XuLyPhanHoiRequest) => void;
  phanHoi: PhanHoiDiemRenLuyenDetailDTO | null;
  loading: boolean;
  error: string | null;
  maQl: string;
}

const PhanHoiProcessForm: React.FC<PhanHoiProcessFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  phanHoi,
  loading,
  error,
  maQl,
}) => {
  const [formData, setFormData] = useState<XuLyPhanHoiRequest>({
    NoiDungXuLy: "",
    MaQl: maQl,
    CapNhatTongDiem: null,
    XepLoai: null,
    TrangThaiDiemRenLuyen: null,
  });
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      MaQl: maQl,
    }));
  }, [maQl]);
  const [updateScore, setUpdateScore] = useState<boolean>(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "CapNhatTongDiem") {
      const numValue = value ? Number.parseFloat(value) : null;
      setFormData((prev: XuLyPhanHoiRequest) => ({
        ...prev,
        [name]: numValue,
        XepLoai: numValue ? calculateXepLoai(numValue) : null,
      }));
    } else {
      setFormData((prev: XuLyPhanHoiRequest) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const calculateXepLoai = (diem: number): string => {
    if (diem >= 90) return "Xuất sắc";
    if (diem >= 80) return "Tốt";
    if (diem >= 70) return "Khá";
    if (diem >= 60) return "Trung bình";
    if (diem >= 50) return "Yếu";
    return "Kém";
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.NoiDungXuLy.trim()) {
      setNotification({
        show: true,
        message: "Vui lòng nhập nội dung xử lý",
        type: "error",
      });
      return;
    }

    if (phanHoi) {
      // Nếu không cập nhật điểm, xóa các trường liên quan
      if (!updateScore) {
        const { CapNhatTongDiem, XepLoai, TrangThaiDiemRenLuyen, ...rest } =
          formData;
        onSubmit(phanHoi.MaPhanHoi, rest);
      } else {
        if (!formData.CapNhatTongDiem) {
          setNotification({
            show: true,
            message: "Vui lòng nhập điểm rèn luyện mới",
            type: "error",
          });
          return;
        }

        if (!formData.TrangThaiDiemRenLuyen) {
          setNotification({
            show: true,
            message: "Vui lòng chọn trạng thái điểm rèn luyện",
            type: "error",
          });
          return;
        }

        onSubmit(phanHoi.MaPhanHoi, formData);
      }
    }
  };

  if (!isOpen || !phanHoi) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container phan-hoi-form-modal">
        <div className="modal-header">
          <h2>Xử lý phản hồi</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
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

        {error && !notification.show && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sinh viên:</label>
            <div className="info-text">
              {phanHoi.DiemRenLuyen?.TenSinhVien || "N/A"}
            </div>
          </div>

          <div className="form-group">
            <label>Nội dung phản hồi:</label>
            <div className="info-text feedback-content">
              {phanHoi.NoiDungPhanHoi || "Không có nội dung"}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="NoiDungXuLy">Nội dung xử lý:</label>
            <textarea
              id="NoiDungXuLy"
              name="NoiDungXuLy"
              value={formData.NoiDungXuLy}
              onChange={handleInputChange}
              rows={5}
              disabled={loading}
              required
              placeholder="Nhập nội dung xử lý phản hồi..."
            />
          </div>

          <div className="form-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="updateScore"
                checked={updateScore}
                onChange={(e) => setUpdateScore(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="updateScore">Cập nhật điểm rèn luyện</label>
            </div>
          </div>

          {updateScore && (
            <>
              <div className="form-group">
                <label htmlFor="CapNhatTongDiem">Điểm rèn luyện mới:</label>
                <input
                  type="number"
                  id="CapNhatTongDiem"
                  name="CapNhatTongDiem"
                  value={formData.CapNhatTongDiem || ""}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={loading}
                  required={updateScore}
                />
              </div>

              <div className="form-group">
                <label htmlFor="XepLoai">Xếp loại:</label>
                <input
                  type="text"
                  id="XepLoai"
                  name="XepLoai"
                  value={formData.XepLoai || ""}
                  readOnly
                  disabled
                />
                <small>Xếp loại được tính tự động dựa trên điểm</small>
              </div>

              <div className="form-group">
                <label htmlFor="TrangThaiDiemRenLuyen">
                  Trạng thái điểm rèn luyện:
                </label>
                <select
                  id="TrangThaiDiemRenLuyen"
                  name="TrangThaiDiemRenLuyen"
                  value={formData.TrangThaiDiemRenLuyen || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                  required={updateScore}
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="Chưa duyệt">Chưa duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                  <option value="Đã chốt">Đã chốt</option>
                </select>
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !formData.NoiDungXuLy.trim()}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Save className="save-icon" />
                  <span>Xác nhận xử lý</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhanHoiProcessForm;
