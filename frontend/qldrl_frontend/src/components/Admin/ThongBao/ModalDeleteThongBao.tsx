import type React from "react";
import { X, AlertTriangle } from "lucide-react";

interface ModalDeleteThongBaoProps {
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ModalDeleteThongBao: React.FC<ModalDeleteThongBaoProps> = ({
  show,
  onClose,
  onDelete,
  isDeleting,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Xác nhận xóa thông báo</h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">
          <div className="warning-message">
            <AlertTriangle size={24} className="warning-icon" />
            <p>
              Bạn có chắc chắn muốn xóa thông báo này không? Hành động này không
              thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến thông báo.
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn-confirm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="loading-spinner-small"></div>
                <span>Đang xóa...</span>
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteThongBao;
