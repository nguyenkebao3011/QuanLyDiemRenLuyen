import type React from "react";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { DiemRenLuyenDTO } from "../types";
import "./DiemRenLuyen.css";

interface DiemRenLuyenInfoProps {
  diemRenLuyen: DiemRenLuyenDTO;
  onBack: () => void;
}

const DiemRenLuyenInfo: React.FC<DiemRenLuyenInfoProps> = ({
  diemRenLuyen,
  onBack,
}) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <AlertCircle className="status-icon unknown" />;

    switch (status.toLowerCase()) {
      case "đã duyệt":
        return <CheckCircle className="status-icon completed" />;
      case "đang duyệt":
        return <Clock className="status-icon processing" />;
      case "chưa duyệt":
        return <AlertCircle className="status-icon pending" />;
      default:
        return <AlertCircle className="status-icon unknown" />;
    }
  };

  const getStatusClass = (status: string | null | undefined) => {
    if (!status) return "status-unknown";

    switch (status.toLowerCase()) {
      case "đã duyệt":
        return "status-completed";
      case "đang duyệt":
        return "status-processing";
      case "chưa duyệt":
        return "status-pending";
      default:
        return "status-unknown";
    }
  };

  const getXepLoaiClass = (xepLoai: string | null | undefined) => {
    if (!xepLoai) return "xep-loai-unknown";

    switch (xepLoai.toLowerCase()) {
      case "xuất sắc":
        return "xep-loai-excellent";
      case "tốt":
        return "xep-loai-good";
      case "khá":
        return "xep-loai-fair";
      case "trung bình":
        return "xep-loai-average";
      case "yếu":
        return "xep-loai-weak";
      case "kém":
        return "xep-loai-poor";
      default:
        return "xep-loai-unknown";
    }
  };

  return (
    <div className="diem-ren-luyen-info-container">
      <div className="info-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
        <h2>Thông tin điểm rèn luyện</h2>
        <div
          className={`status-badge ${getStatusClass(diemRenLuyen.TrangThai)}`}
        >
          {getStatusIcon(diemRenLuyen.TrangThai)}
          <span>{diemRenLuyen.TrangThai || "Chưa xác định"}</span>
        </div>
      </div>

      <div className="info-content">
        <div className="basic-info-section">
          <h3>Thông tin cơ bản</h3>
          <div className="info-grid">
            <div className="info-item">
              <FileText className="info-icon" />
              <div className="info-content">
                <span className="info-label">Mã điểm rèn luyện:</span>
                <span className="info-value">
                  {diemRenLuyen.MaDiemRenLuyen}
                </span>
              </div>
            </div>
            <div className="info-item">
              <Calendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Học kỳ:</span>
                <span className="info-value">
                  {diemRenLuyen.HocKy || "N/A"}
                </span>
              </div>
            </div>
            <div className="info-item">
              <Calendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Ngày chốt:</span>
                <span className="info-value">
                  {formatDate(diemRenLuyen.NgayChot)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="student-info-section">
          <h3>Thông tin sinh viên</h3>
          <div className="info-grid">
            <div className="info-item">
              <User className="info-icon" />
              <div className="info-content">
                <span className="info-label">Mã sinh viên:</span>
                <span className="info-value">{diemRenLuyen.MaSv}</span>
              </div>
            </div>
            <div className="info-item">
              <User className="info-icon" />
              <div className="info-content">
                <span className="info-label">Tên sinh viên:</span>
                <span className="info-value">
                  {diemRenLuyen.TenSinhVien || "Không có thông tin"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="score-section">
          <h3>Thông tin điểm</h3>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-value">{diemRenLuyen.TongDiem || 0}</span>
              <span className="score-label">Tổng điểm</span>
            </div>
            <div
              className={`xep-loai-badge ${getXepLoaiClass(
                diemRenLuyen.XepLoai
              )}`}
            >
              <Award className="xep-loai-icon" />
              <span>{diemRenLuyen.XepLoai || "Chưa xếp loại"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="info-actions">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );
};

export default DiemRenLuyenInfo;
