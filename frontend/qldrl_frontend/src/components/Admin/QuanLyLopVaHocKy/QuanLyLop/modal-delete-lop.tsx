"use client";

import type React from "react";
import { AlertTriangle } from "lucide-react";

interface ModalDeleteLopProps {
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
  lopName: string;
}

const ModalDeleteLop: React.FC<ModalDeleteLopProps> = ({
  show,
  onClose,
  onDelete,
  lopName,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <AlertTriangle className="icon text-red-500" />
            Xác nhận xóa lớp
          </h2>
        </div>
        <div className="modal-body">
          <div className="space-y-4">
            <p className="text-sm">
              Bạn có chắc chắn muốn xóa lớp <strong>"{lopName}"</strong> không?
            </p>
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              <strong>Lưu ý:</strong> Không thể xóa lớp nếu có sinh viên trong
              lớp.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-destructive" onClick={onDelete}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteLop;
