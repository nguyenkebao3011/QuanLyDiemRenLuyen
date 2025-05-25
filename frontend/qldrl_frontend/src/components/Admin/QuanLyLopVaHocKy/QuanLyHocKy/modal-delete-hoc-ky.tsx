"use client";

import type React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ModalDeleteHocKyProps {
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
  hocKyName: string;
}

const ModalDeleteHocKy: React.FC<ModalDeleteHocKyProps> = ({
  show,
  onClose,
  onDelete,
  hocKyName,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X className="icon" />
        </button>

        <h2>
          <AlertTriangle className="icon" style={{ color: "var(--danger)" }} />
          Xác nhận xóa học kỳ
        </h2>

        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <p style={{ marginBottom: "var(--spacing-3)" }}>
            Bạn có chắc chắn muốn xóa học kỳ <strong>"{hocKyName}"</strong>{" "}
            không?
          </p>
          <p
            style={{ color: "var(--danger)", fontSize: "var(--font-size-sm)" }}
          >
            <strong>Lưu ý:</strong> Việc xóa học kỳ có thể ảnh hưởng đến dữ liệu
            liên quan.
          </p>
        </div>

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

export default ModalDeleteHocKy;
