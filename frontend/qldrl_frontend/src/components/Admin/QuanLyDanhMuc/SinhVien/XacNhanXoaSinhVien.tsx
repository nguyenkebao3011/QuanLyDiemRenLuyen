"use client";

import type React from "react";
import { AlertCircle, X } from "lucide-react";

interface XacNhanXoaSinhVienProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  sinhVienId: string | null;
  sinhVienName: string | null;
}

const XacNhanXoaSinhVien: React.FC<XacNhanXoaSinhVienProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sinhVienId,
  sinhVienName,
}) => {
  if (!isOpen || !sinhVienId) return null;

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
            Bạn có chắc chắn muốn xóa sinh viên {sinhVienName || sinhVienId}{" "}
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

export default XacNhanXoaSinhVien;
