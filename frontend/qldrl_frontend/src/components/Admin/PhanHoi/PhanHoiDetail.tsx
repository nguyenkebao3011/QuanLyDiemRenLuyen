import type React from "react";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  FileCheck,
} from "lucide-react";
import { ApiService } from "../../../untils/services/service-api";
import type {
  PhanHoiDiemRenLuyenDetailDTO,
  MinhChungHoatDongDTO,
} from "../types";
import MinhChungDetail from "../MinhChung/MinhChungDetail";
import DiemRenLuyenInfo from "../DiemRenLuyen/DiemRenLuyenInfo";
import "./phan-hoi.css";

interface PhanHoiDetailProps {
  phanHoi: PhanHoiDiemRenLuyenDetailDTO | null;
  loading: boolean;
  onBack: () => void;
  onProcess: (id: number) => void;
}

const PhanHoiDetail: React.FC<PhanHoiDetailProps> = ({
  phanHoi,
  loading,
  onBack,
  onProcess,
}) => {
  const [relatedMinhChungs, setRelatedMinhChungs] = useState<
    MinhChungHoatDongDTO[]
  >([]);
  const [loadingMinhChungs, setLoadingMinhChungs] = useState<boolean>(false);
  const [showMinhChungDetail, setShowMinhChungDetail] =
    useState<boolean>(false);
  const [selectedMinhChung, setSelectedMinhChung] =
    useState<MinhChungHoatDongDTO | null>(null);
  const [showDiemRenLuyenDetail, setShowDiemRenLuyenDetail] =
    useState<boolean>(false);

  useEffect(() => {
    if (phanHoi?.DiemRenLuyen?.MaDiemRenLuyen) {
      fetchRelatedMinhChungs(phanHoi.DiemRenLuyen.MaDiemRenLuyen);
    }
  }, [phanHoi]);

  const fetchRelatedMinhChungs = async (maDiemRenLuyen: number) => {
    setLoadingMinhChungs(true);
    try {
      const data = await ApiService.layMinhChungTheoDiemRenLuyen(
        maDiemRenLuyen
      );
      setRelatedMinhChungs(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách minh chứng:", error);
    } finally {
      setLoadingMinhChungs(false);
    }
  };

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
      case "đã xử lý":
        return <CheckCircle className="status-icon completed" />;
      case "đang xử lý":
        return <Clock className="status-icon processing" />;
      case "chưa xử lý":
        return <AlertCircle className="status-icon pending" />;
      default:
        return <AlertCircle className="status-icon unknown" />;
    }
  };

  const getStatusClass = (status: string | null | undefined) => {
    if (!status) return "status-unknown";

    switch (status.toLowerCase()) {
      case "đã xử lý":
        return "status-da-xu-ly";
      case "đang xử lý":
        return "status-dang-xu-ly";
      case "chưa xử lý":
        return "status-chua-xu-ly";
      default:
        return "status-unknown";
    }
  };

  const handleViewMinhChung = (minhChung: MinhChungHoatDongDTO) => {
    setSelectedMinhChung(minhChung);
    setShowMinhChungDetail(true);
  };

  if (loading) {
    return (
      <div className="phan-hoi-detail-container loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin phản hồi...</p>
      </div>
    );
  }

  if (!phanHoi) {
    return (
      <div className="phan-hoi-detail-container error">
        <AlertCircle className="error-icon" />
        <p>Không tìm thấy thông tin phản hồi</p>
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>
    );
  }

  // Hiển thị chi tiết minh chứng
  if (showMinhChungDetail && selectedMinhChung) {
    return (
      <MinhChungDetail
        minhChung={selectedMinhChung}
        onBack={() => setShowMinhChungDetail(false)}
      />
    );
  }

  // Hiển thị chi tiết điểm rèn luyện
  if (showDiemRenLuyenDetail && phanHoi.DiemRenLuyen) {
    return (
      <DiemRenLuyenInfo
        diemRenLuyen={phanHoi.DiemRenLuyen}
        onBack={() => setShowDiemRenLuyenDetail(false)}
      />
    );
  }

  return (
    <div className="phan-hoi-detail-container">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
        <h2>Chi tiết phản hồi</h2>
        <div className={`status-badge ${getStatusClass(phanHoi.TrangThai)}`}>
          {phanHoi.TrangThai || "Chưa xác định"}
        </div>
      </div>

      <div className="detail-content">
        <div className="student-info-section">
          <h3>Thông tin sinh viên</h3>
          <div className="info-grid">
            <div className="info-item">
              <User className="info-icon" />
              <div className="info-content">
                <span className="info-label">Sinh viên:</span>
                <span className="info-value">
                  {phanHoi.DiemRenLuyen?.TenSinhVien || "Không có thông tin"}
                </span>
              </div>
            </div>
            <div className="info-item">
              <User className="info-icon" />
              <div className="info-content">
                <span className="info-label">Mã SV:</span>
                <span className="info-value">
                  {phanHoi.DiemRenLuyen?.MaSv || "Không có thông tin"}
                </span>
              </div>
            </div>
            <div className="info-item">
              <Calendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Ngày phản hồi:</span>
                <span className="info-value">
                  {formatDate(phanHoi.NgayPhanHoi)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="feedback-content-section">
          <h3>Nội dung phản hồi:</h3>
          <div className="feedback-message">
            <FileText className="message-icon" />
            <p>{phanHoi.NoiDungPhanHoi || "Không có nội dung phản hồi"}</p>
          </div>
        </div>

        <div className="related-info-section">
          <div className="related-info-header">
            <h3>Thông tin điểm rèn luyện</h3>
            <button
              className="btn-view-detail"
              onClick={() => setShowDiemRenLuyenDetail(true)}
              disabled={!phanHoi.DiemRenLuyen}
            >
              Xem chi tiết
            </button>
          </div>
          <div className="info-grid">
            {phanHoi.DiemRenLuyen ? (
              <>
                <div className="info-item">
                  <FileText className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Mã điểm rèn luyện:</span>
                    <span className="info-value">
                      {phanHoi.DiemRenLuyen.MaDiemRenLuyen}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <FileText className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Tổng điểm:</span>
                    <span className="info-value">
                      {phanHoi.DiemRenLuyen.TongDiem || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <FileText className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Xếp loại:</span>
                    <span className="info-value">
                      {phanHoi.DiemRenLuyen.XepLoai || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Học kỳ:</span>
                    <span className="info-value">
                      {phanHoi.DiemRenLuyen.HocKy || "N/A"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="info-item">
                <AlertCircle className="info-icon" />
                <div className="info-content">
                  <span className="info-value">
                    Không có thông tin điểm rèn luyện
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="related-info-section">
          <div className="related-info-header">
            <h3>Minh chứng</h3>
            {phanHoi.MinhChung && (
              <button
                className="btn-view-detail"
                onClick={() =>
                  phanHoi.MinhChung && handleViewMinhChung(phanHoi.MinhChung)
                }
              >
                Xem chi tiết
              </button>
            )}
          </div>
          <div className="info-grid">
            {phanHoi.MinhChung ? (
              <>
                <div className="info-item">
                  <FileCheck className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Mã minh chứng:</span>
                    <span className="info-value">
                      {phanHoi.MinhChung.MaMinhChung}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <FileText className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Mô tả:</span>
                    <span className="info-value">
                      {phanHoi.MinhChung.MoTa || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Ngày tạo:</span>
                    <span className="info-value">
                      {formatDate(phanHoi.MinhChung.NgayTao)}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <FileText className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Trạng thái:</span>
                    <span className="info-value">
                      {phanHoi.MinhChung.TrangThai || "N/A"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="info-item">
                <AlertCircle className="info-icon" />
                <div className="info-content">
                  <span className="info-value">Không có minh chứng</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedMinhChungs.length > 0 && (
          <div className="related-info-section">
            <h3>Minh chứng hoạt động liên quan</h3>
            <div className="minh-chung-list">
              {relatedMinhChungs.map((minhChung) => (
                <div key={minhChung.MaMinhChung} className="minh-chung-item">
                  <div className="minh-chung-header">
                    <FileText className="minh-chung-icon" />
                    <span className="minh-chung-title">
                      {minhChung.MoTa || `Minh chứng #${minhChung.MaMinhChung}`}
                    </span>
                  </div>
                  <div className="minh-chung-actions">
                    <button
                      className="btn-view-minh-chung"
                      onClick={() => handleViewMinhChung(minhChung)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phanHoi.TrangThai === "Đã xử lý" && (
          <div className="processing-info-section">
            <h3>Thông tin xử lý</h3>
            <div className="info-grid">
              <div className="info-item">
                <User className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Người xử lý:</span>
                  <span className="info-value">{phanHoi.MaQl || "N/A"}</span>
                </div>
              </div>
              <div className="info-item">
                <Calendar className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Ngày xử lý:</span>
                  <span className="info-value">
                    {formatDate(phanHoi.NgayXuLy)}
                  </span>
                </div>
              </div>
            </div>
            <div className="processing-content">
              <h4>Nội dung xử lý:</h4>
              <div className="processing-message">
                <p>{phanHoi.NoiDungXuLy || "Không có nội dung xử lý"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="detail-actions">
        {phanHoi.TrangThai !== "Đã xử lý" && (
          <button
            className="btn-process"
            onClick={() => onProcess(phanHoi.MaPhanHoi)}
          >
            <CheckCircle size={16} />
            <span>Xử lý phản hồi</span>
          </button>
        )}
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );
};

export default PhanHoiDetail;
