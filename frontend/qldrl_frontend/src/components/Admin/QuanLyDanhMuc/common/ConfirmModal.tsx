import React from "react";
import { AlertCircle, X } from "lucide-react";
import "../common/css/ConfirmModal.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "warning" | "danger" | "info";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  type = "warning",
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className={`confirm-modal-header ${type}`}>
          <h3>{title}</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        <div className="confirm-modal-body">
          <div className="confirm-icon">
            <AlertCircle size={32} className={type} />
          </div>
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`confirm-btn ${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
