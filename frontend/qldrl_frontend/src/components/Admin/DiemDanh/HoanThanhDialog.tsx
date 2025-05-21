"use client";

import type React from "react";
import { X } from "lucide-react";

interface HoanThanhDialogProps {
  isOpen: boolean;
  hoatDongName?: string;
  ghiChu: string;
  isSubmitting: boolean;
  onClose: () => void;
  setGhiChu: (value: string) => void;
  onConfirm: () => void;
}

const HoanThanhDialog: React.FC<HoanThanhDialogProps> = ({
  isOpen,
  hoatDongName,
  ghiChu,
  isSubmitting,
  onClose,
  setGhiChu,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">Hoàn thành hoạt động</h2>
          <p className="dialog-description">
            Xác nhận hoàn thành hoạt động "{hoatDongName || ""}"
          </p>
          <button className="dialog-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="dialog-content">
          <p className="dialog-info">
            Khi hoàn thành hoạt động, trạng thái sẽ được chuyển thành "Đã hoàn
            thành" và không thể điểm danh thêm.
          </p>
          <div className="form-group">
            <label htmlFor="ghichu" className="form-label">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="ghichu"
              placeholder="Nhập ghi chú về việc hoàn thành hoạt động..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="textarea"
            ></textarea>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-success"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận hoàn thành"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoanThanhDialog;
