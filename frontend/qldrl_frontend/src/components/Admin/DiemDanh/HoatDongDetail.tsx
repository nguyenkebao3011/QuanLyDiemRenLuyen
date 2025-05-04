import React from "react";
import {
  Calendar,
  MapPin,
  Award,
  User,
  Users,
  CheckCircle,
  Info,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ThongTinHoatDong } from "../types";

interface HoatDongDetailProps {
  thongTinHoatDong: ThongTinHoatDong | null;
  loadingThongTin: boolean;
  renderTrangThaiHoatDong: (trangThai: string | null) => JSX.Element;
}

const HoatDongDetail: React.FC<HoatDongDetailProps> = ({
  thongTinHoatDong,
  loadingThongTin,
  renderTrangThaiHoatDong,
}) => {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  if (!thongTinHoatDong) {
    return (
      <div className="empty-state large">
        <Info className="empty-icon" />
        <h3>Chưa chọn hoạt động</h3>
        <p>
          Vui lòng chọn một hoạt động từ danh sách bên trái để quản lý điểm danh
        </p>
      </div>
    );
  }

  return (
    <div className="card-header">
      <div className="header-content">
        <div>
          <h2 className="card-title">
            {thongTinHoatDong?.TenHoatDong || "Đang tải..."}
          </h2>
          <p className="card-description">
            {thongTinHoatDong
              ? `${thongTinHoatDong.TenHocKy} - ${thongTinHoatDong.NamHoc}`
              : "Đang tải thông tin..."}
          </p>
        </div>
        {renderTrangThaiHoatDong(thongTinHoatDong?.TrangThai || null)}
      </div>

      {loadingThongTin ? (
        <div className="skeleton-container">
          <div className="skeleton-line"></div>
          <div className="skeleton-line" style={{ width: "75%" }}></div>
          <div className="skeleton-line" style={{ width: "50%" }}></div>
        </div>
      ) : (
        <div className="info-grid">
          <div className="info-column">
            <div className="info-item">
              <Calendar className="info-icon" />
              <span className="info-label">Thời gian:</span>
              <span>
                {formatDate(thongTinHoatDong.NgayBatDau)} -{" "}
                {formatDate(thongTinHoatDong.NgayKetThuc)}
              </span>
            </div>
            <div className="info-item">
              <MapPin className="info-icon" />
              <span className="info-label">Địa điểm:</span>
              <span>{thongTinHoatDong.DiaDiem || "Chưa xác định"}</span>
            </div>
            <div className="info-item">
              <Award className="info-icon" />
              <span className="info-label">Điểm cộng:</span>
              <span>{thongTinHoatDong.DiemCong || 0} điểm</span>
            </div>
          </div>
          <div className="info-column">
            <div className="info-item">
              <User className="info-icon" />
              <span className="info-label">Người quản lý:</span>
              <span>{thongTinHoatDong.TenQl || "Chưa xác định"}</span>
            </div>
            <div className="info-item">
              <Users className="info-icon" />
              <span className="info-label">Số lượng đăng ký:</span>
              <span>{thongTinHoatDong.SoLuongDangKy || 0} sinh viên</span>
            </div>
            <div className="info-item">
              <CheckCircle className="info-icon" />
              <span className="info-label">Đã điểm danh:</span>
              <span>
                {thongTinHoatDong.SoLuongDiemDanh || 0}/
                {thongTinHoatDong.SoLuongDangKy || 0} (
                {thongTinHoatDong.TiLeDiemDanh
                  ? thongTinHoatDong.TiLeDiemDanh.toFixed(1)
                  : "0"}
                %)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoatDongDetail;
