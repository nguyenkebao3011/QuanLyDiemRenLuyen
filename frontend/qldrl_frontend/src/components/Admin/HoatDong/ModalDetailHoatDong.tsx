import React from "react";
import { X, Calendar, Edit, Download } from "lucide-react";
import type { HoatDong } from "../types";

interface ModalDetailHoatDongProps {
  show: boolean;
  hoatDong: HoatDong | null;
  onClose: () => void;
  onEdit: (maHoatDong: number) => void;
  formatDateTime: (dateString: string) => string;
  getStatusColor: (trangThai: string) => string;
}

const ModalDetailHoatDong: React.FC<ModalDetailHoatDongProps> = ({
  show,
  hoatDong,
  onClose,
  onEdit,
  formatDateTime,
  getStatusColor,
}) => {
  if (!show || !hoatDong) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container detail-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>Chi tiết hoạt động</h2>
        <div className="detail-content">
          <div className="detail-header">
            <h3>{hoatDong.TenHoatDong}</h3>
            <span
              className={`status-badge ${getStatusColor(hoatDong.TrangThai)}`}
            >
              {hoatDong.TrangThai}
            </span>
          </div>
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Học kỳ
              </div>
              <div className="detail-info-value">
                {hoatDong.MaHocKyNavigation
                  ? `${hoatDong.MaHocKyNavigation.TenHocKy} - ${hoatDong.MaHocKyNavigation.NamHoc}`
                  : `Học kỳ ${hoatDong.MaHocKy}`}
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Thời gian bắt đầu
              </div>
              <div className="detail-info-value">
                {formatDateTime(hoatDong.NgayBatDau)}
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Thời gian kết thúc
              </div>
              <div className="detail-info-value">
                {formatDateTime(hoatDong.NgayKetThuc)}
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Địa điểm
              </div>
              <div className="detail-info-value">{hoatDong.DiaDiem}</div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Số lượng đăng ký
              </div>
              <div className="detail-info-value">
                {hoatDong.SoLuongDaDangKy || 0} / {hoatDong.SoLuongToiDa}
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Điểm cộng
              </div>
              <div className="detail-info-value">{hoatDong.DiemCong}</div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Người tạo
              </div>
              <div className="detail-info-value">
                {hoatDong.MaQlNavigation
                  ? `${hoatDong.MaQlNavigation.HoTen} - ${hoatDong.MaQlNavigation.Khoa}`
                  : hoatDong.MaQl}
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">
                <Calendar size={16} /> Ngày tạo
              </div>
              <div className="detail-info-value">
                {formatDateTime(hoatDong.NgayTao)}
              </div>
            </div>
          </div>
          <div className="detail-description">
            <h4>Mô tả hoạt động</h4>
            <p>{hoatDong.MoTa || "Không có mô tả"}</p>
          </div>
          <div className="detail-actions">
            <button
              className="btn-edit"
              onClick={() => {
                onClose();
                onEdit(hoatDong.MaHoatDong);
              }}
            >
              <Edit size={16} /> Chỉnh sửa
            </button>
            <button className="btn-export">
              <Download size={16} /> Xuất danh sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailHoatDong;
