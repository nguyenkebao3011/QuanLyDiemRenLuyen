import type React from "react";
import { GraduationCap, Users, Calendar, User } from "lucide-react";

interface LopDTO {
  MaLop: string;
  TenLop: string;
  NienKhoa: string;
  MaGv: string;
  SoSinhVien?: number;
  TenGiangVien?: string;
}

interface GiangVien {
  MaGv: string;
  HoTen: string;
  Email: string;
  Khoa: string;
}

interface ModalDetailLopProps {
  show: boolean;
  lop: LopDTO | null;
  onClose: () => void;
  onEdit: (maLop: string) => void;
  giangViens: GiangVien[];
}

const ModalDetailLop: React.FC<ModalDetailLopProps> = ({
  show,
  lop,
  onClose,
  onEdit,
  giangViens,
}) => {
  if (!show || !lop) return null;

  const giangVien = giangViens.find((gv) => gv.MaGv === lop.MaGv);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header2">
          <h2 className="modal-title">
            <GraduationCap className="icon" />
            Chi tiết lớp học
          </h2>
        </div>
        <div className="modal-body">
          <div className="space-y-6">
            <div className="detail-grid">
              <div className="detail-item">
                <label className="detail-label">Mã lớp</label>
                <p className="detail-value">{lop.MaLop}</p>
              </div>
              <div className="detail-item">
                <label className="detail-label">Tên lớp</label>
                <p className="detail-value">{lop.TenLop}</p>
              </div>
              <div className="detail-item">
                <label className="detail-label flex items-center gap-1">
                  <Calendar className="icon" />
                  Niên khóa
                </label>
                <p className="badge2 badge-secondary">{lop.NienKhoa}</p>
              </div>
              <div className="detail-item">
                <label className="detail-label2 flex items-center gap-1">
                  <Users className="icon" />
                  Số sinh viên
                </label>
                <p className="detail-value">{lop.SoSinhVien || 0}</p>
              </div>
            </div>

            {giangVien && (
              <div className="detail-section">
                <h4 className="detail-section-title">
                  <User className="icon" />
                  Thông tin giảng viên
                </h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label className="detail-label">Họ tên</label>
                    <p className="font-medium">{giangVien.HoTen}</p>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Email</label>
                    <p style={{ color: "var(--primary)" }}>{giangVien.Email}</p>
                  </div>
                  {/* <div className="detail-item">
                    <label className="detail-label">Khoa</label>
                    <span className="badge badge-outline">
                      {giangVien.Khoa}
                    </span>
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(lop.MaLop);
            }}
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailLop;
