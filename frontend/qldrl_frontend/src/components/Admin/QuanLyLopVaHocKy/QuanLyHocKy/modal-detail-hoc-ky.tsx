"use client";

import type React from "react";
import { BookOpen, Calendar, Clock, X } from "lucide-react";

interface HocKyDTO {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
  NgayBatDau: string;
  NgayKetThuc: string;
}

interface ModalDetailHocKyProps {
  show: boolean;
  hocKy: HocKyDTO | null;
  onClose: () => void;
  onEdit: (maHocKy: number) => void;
}

const ModalDetailHocKy: React.FC<ModalDetailHocKyProps> = ({
  show,
  hocKy,
  onClose,
  onEdit,
}) => {
  if (!show || !hocKy) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return `${weeks} tuần${days > 0 ? ` ${days} ngày` : ""}`;
  };

  const getHocKyStatus = (ngayBatDau: string, ngayKetThuc: string) => {
    const now = new Date();
    const startDate = new Date(ngayBatDau);
    const endDate = new Date(ngayKetThuc);

    if (now < startDate) {
      return { text: "Chưa bắt đầu", class: "status-upcoming" };
    } else if (now > endDate) {
      return { text: "Đã kết thúc", class: "status-completed" };
    } else {
      return { text: "Đang diễn ra", class: "status-ongoing" };
    }
  };

  const status = getHocKyStatus(hocKy.NgayBatDau, hocKy.NgayKetThuc);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <X className="icon" />
        </button>

        <div className="detail-content">
          <div className="detail-header">
            <h3>
              <BookOpen className="icon" />
              Chi tiết học kỳ
            </h3>
          </div>

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <label className="detail-info-label">Mã học kỳ</label>
              <p className="detail-info-value">{hocKy.MaHocKy}</p>
            </div>
            <div className="detail-info-item">
              <label className="detail-info-label">Tên học kỳ</label>
              <p className="detail-info-value">{hocKy.TenHocKy}</p>
            </div>
            <div className="detail-info-item">
              <label className="detail-info-label">Năm học</label>
              <span className="status-badge">{hocKy.NamHoc}</span>
            </div>
            <div className="detail-info-item">
              <label className="detail-info-label">Trạng thái</label>
              <span className={`status-badge2 ${status.class}`}>
                {status.text}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h4>
              <Calendar className="icon" />
              Thời gian học kỳ
            </h4>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <label className="detail-info-label">Ngày bắt đầu</label>
                <p className="detail-info-value">
                  {formatDate(hocKy.NgayBatDau)}
                </p>
              </div>
              <div className="detail-info-item">
                <label className="detail-info-label">Ngày kết thúc</label>
                <p className="detail-info-value">
                  {formatDate(hocKy.NgayKetThuc)}
                </p>
              </div>
              <div className="detail-info-item">
                <label className="detail-info-label">
                  <Clock className="icon" />
                  Thời lượng
                </label>
                <p className="detail-info-value">
                  {calculateDuration(hocKy.NgayBatDau, hocKy.NgayKetThuc)}
                </p>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              Đóng
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                onClose();
                onEdit(hocKy.MaHocKy);
              }}
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailHocKy;
