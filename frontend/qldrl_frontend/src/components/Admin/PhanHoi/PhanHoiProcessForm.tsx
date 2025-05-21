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
    CoCongDiem: false,
  });
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      MaQl: maQl,
    }));
  }, [maQl]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: XuLyPhanHoiRequest) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: XuLyPhanHoiRequest) => ({
      ...prev,
      CoCongDiem: e.target.checked,
    }));
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
      onSubmit(phanHoi.MaPhanHoi, formData);
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
                id="congDiem"
                checked={formData.CoCongDiem || false}
                onChange={handleCheckboxChange}
                disabled={loading}
              />
              <label htmlFor="congDiem">
                Cộng điểm hoạt động vào điểm rèn luyện
              </label>
            </div>
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
