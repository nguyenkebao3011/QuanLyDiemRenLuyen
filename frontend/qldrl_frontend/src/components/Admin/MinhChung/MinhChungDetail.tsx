import type React from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  FileImage,
  File,
} from "lucide-react";
import type { MinhChungHoatDongDTO } from "../types";
import "./MinhChungDetail.css";

interface MinhChungDetailProps {
  minhChung: MinhChungHoatDongDTO;
  onBack: () => void;
}

const BACKEND_URL = "http://localhost:5163";

const MinhChungDetail: React.FC<MinhChungDetailProps> = ({
  minhChung,
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

  const getAbsoluteFileUrl = (duongDanFile?: string | null) => {
    if (!duongDanFile) return "";
    if (/^https?:\/\//.test(duongDanFile)) return duongDanFile;
    if (!duongDanFile.startsWith("/")) duongDanFile = "/" + duongDanFile;
    return BACKEND_URL + duongDanFile;
  };

  const getFileIcon = () => {
    const fileUrl = getAbsoluteFileUrl(minhChung.DuongDanFile);
    const extension = fileUrl.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)) {
      return <FileImage className="file-icon image" />;
    } else if (extension === "pdf") {
      return <FileText className="file-icon pdf" />;
    } else {
      return <File className="file-icon" />;
    }
  };

  const isImageFile = (fileUrl?: string | null) => {
    if (!fileUrl) return false;
    return /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileUrl);
  };

  return (
    <div className="minh-chung-detail-container">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
        <h2>Chi tiết minh chứng</h2>
      </div>

      <div className="detail-content">
        <div className="file-preview">
          {getFileIcon()}
          <h3>{minhChung.MoTa || `Minh chứng #${minhChung.MaMinhChung}`}</h3>
          {isImageFile(minhChung.DuongDanFile) && (
            <div className="image-preview">
              <img
                src={getAbsoluteFileUrl(minhChung.DuongDanFile)}
                alt="Minh chứng"
                style={{ maxWidth: "250px", borderRadius: 8 }}
              />
            </div>
          )}
          {minhChung.DuongDanFile && (
            <a
              href={getAbsoluteFileUrl(minhChung.DuongDanFile)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-download"
            >
              <Download size={16} />
              <span>Tải xuống</span>
            </a>
          )}
        </div>

        <div className="file-info">
          <div className="info-section">
            <h3>Thông tin cơ bản</h3>
            <div className="info-grid">
              <div className="info-item">
                <FileText className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Mã minh chứng:</span>
                  <span className="info-value">{minhChung.MaMinhChung}</span>
                </div>
              </div>
              <div className="info-item">
                <FileText className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Mã đăng ký:</span>
                  <span className="info-value">
                    {minhChung.MaDangKy || "N/A"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Calendar className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Ngày tạo:</span>
                  <span className="info-value">
                    {formatDate(minhChung.NgayTao)}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <FileText className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Trạng thái:</span>
                  <span className="info-value">
                    {minhChung.TrangThai || "Không xác định"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {minhChung.MoTa && (
            <div className="info-section">
              <h3>Mô tả</h3>
              <div className="description-content">
                <p>{minhChung.MoTa}</p>
              </div>
            </div>
          )}

          {/* ĐÃ BỎ PHẦN XEM TRƯỚC Ở DƯỚI */}
        </div>
      </div>

      <div className="detail-actions">
        {minhChung.DuongDanFile && (
          <a
            href={getAbsoluteFileUrl(minhChung.DuongDanFile)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-download"
          >
            <Download size={16} />
            <span>Tải xuống</span>
          </a>
        )}
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );
};

export default MinhChungDetail;
