import React from "react";
import { X } from "lucide-react";

interface DiemDanhDialogProps {
  isDialogOpen: boolean;
  selectedSinhVien: number[];
  ghiChu: string;
  isSubmitting: boolean;
  setIsDialogOpen: (value: boolean) => void;
  setGhiChu: (value: string) => void;
  diemDanhNhom: () => void;
}

const DiemDanhDialog: React.FC<DiemDanhDialogProps> = ({
  isDialogOpen,
  selectedSinhVien,
  ghiChu,
  isSubmitting,
  setIsDialogOpen,
  setGhiChu,
  diemDanhNhom,
}) => {
  if (!isDialogOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">Điểm danh nhóm sinh viên</h2>
          <p className="dialog-description">
            Điểm danh cho {selectedSinhVien.length} sinh viên đã chọn
          </p>
          <button
            className="dialog-close"
            onClick={() => setIsDialogOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="dialog-content">
          <div className="form-group">
            <label htmlFor="ghichu" className="form-label">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="ghichu"
              placeholder="Nhập ghi chú cho nhóm sinh viên này..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="textarea"
            ></textarea>
          </div>
        </div>

        <div className="dialog-footer">
          <button
            className="btn btn-outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={diemDanhNhom}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận điểm danh"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiemDanhDialog;
