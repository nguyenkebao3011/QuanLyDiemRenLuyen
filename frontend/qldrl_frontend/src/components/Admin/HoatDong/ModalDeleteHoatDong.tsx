import React from "react";
import { X } from "lucide-react";

interface ModalDeleteHoatDongProps {
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const ModalDeleteHoatDong: React.FC<ModalDeleteHoatDongProps> = ({
  show,
  onClose,
  onDelete,
}) => {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>Xác nhận xóa</h2>
        <p>Bạn có chắc chắn muốn xóa hoạt động này không?</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={onDelete}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteHoatDong;
