import type React from "react";
import { AlertCircle, X } from "lucide-react";

interface XacNhanXoaGiangVienProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  giangVienId: string | null;
  giangVienName: string | null;
}

const XacNhanXoaGiangVien: React.FC<XacNhanXoaGiangVienProps> = ({
  isOpen,
  onClose,
  onConfirm,
  giangVienId,
  giangVienName,
}) => {
  if (!isOpen || !giangVienId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container confirm-modal">
        <div className="modal-header">
          <h2>Xác nhận xóa</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-content confirm">
          <AlertCircle className="warning-icon" />
          <p>
            Bạn có chắc chắn muốn xóa giảng viên {giangVienName || giangVienId}{" "}
            không?
          </p>
          <p className="warning-text">Hành động này không thể hoàn tác.</p>
        </div>
        <div className="form-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-submit" onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default XacNhanXoaGiangVien;
