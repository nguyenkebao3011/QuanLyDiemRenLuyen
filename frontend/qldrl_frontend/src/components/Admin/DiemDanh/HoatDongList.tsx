import type React from "react";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { HoatDong, HocKy } from "../types";

interface HoatDongListProps {
  danhSachHoatDong: HoatDong[];
  filteredHoatDong: HoatDong[];
  loadingHoatDong: boolean;
  searchTerm: string;
  selectedHocKy: string;
  selectedTrangThai: string;
  uniqueHocKy: string[];
  selectedHoatDong: number | null;
  setSearchTerm: (value: string) => void;
  setSelectedHocKy: (value: string) => void;
  setSelectedTrangThai: (value: string) => void;
  handleSelectHoatDong: (maHoatDong: number) => void;
  fetchDanhSachHoatDong: () => void;
  hocKys?: HocKy[];
  handleHocKyChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTrangThaiChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  uniqueTrangThai?: string[];
}

const HoatDongList: React.FC<HoatDongListProps> = ({
  filteredHoatDong,
  loadingHoatDong,
  searchTerm,
  selectedHocKy,
  selectedTrangThai,
  uniqueHocKy,
  selectedHoatDong,
  setSearchTerm,
  setSelectedHocKy,
  setSelectedTrangThai,
  handleSelectHoatDong,
  fetchDanhSachHoatDong,
  hocKys = [],
  handleHocKyChange,
  handleTrangThaiChange,
  uniqueTrangThai = [],
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

  // Render trạng thái hoạt động
  const renderTrangThaiHoatDong = (trangThai: string | null) => {
    switch (trangThai) {
      case "Đang diễn ra":
        return <span className="badge badge-blue">Đang diễn ra</span>;
      case "Đã đóng đăng ký":
        return <span className="badge badge-green">Đã đóng đăng ký</span>;
      case "Chưa bắt đầu":
        return <span className="badge badge-yellow">Chưa bắt đầu</span>;
      case "Đang mở đăng ký":
        return <span className="badge badge-purple">Đang mở đăng ký</span>;
      default:
        return <span className="badge badge-gray">{trangThai}</span>;
    }
  };

  // Xử lý khi chọn học kỳ - sử dụng handler được truyền vào nếu có
  const onHocKyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (handleHocKyChange) {
      handleHocKyChange(e);
    } else {
      setSelectedHocKy(e.target.value);
    }
  };

  // Xử lý khi chọn trạng thái - sử dụng handler được truyền vào nếu có
  const onTrangThaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (handleTrangThaiChange) {
      handleTrangThaiChange(e);
    } else {
      setSelectedTrangThai(e.target.value);
    }
  };

  // Xử lý khi nhấn nút "Xem tất cả học kỳ"
  const viewAllHocKy = () => {
    if (handleHocKyChange) {
      handleHocKyChange({
        target: { value: "all" },
      } as React.ChangeEvent<HTMLSelectElement>);
    } else {
      setSelectedHocKy("all");
    }
  };

  // Xử lý khi nhấn nút "Xem tất cả trạng thái"
  const viewAllTrangThai = () => {
    if (handleTrangThaiChange) {
      handleTrangThaiChange({
        target: { value: "all" },
      } as React.ChangeEvent<HTMLSelectElement>);
    } else {
      setSelectedTrangThai("all");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Danh sách hoạt động</h2>
        <p className="card-description">
          Chọn một hoạt động để quản lý điểm danh
        </p>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm hoạt động..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <div className="card-content">
        <div className="filter-container">
          <select
            className="select"
            value={selectedHocKy}
            onChange={onHocKyChange}
          >
            <option value="all">Tất cả học kỳ</option>
            {hocKys && hocKys.length > 0
              ? hocKys.map((hk) => (
                  <option key={hk.MaHocKy} value={hk.TenHocKy}>
                    {hk.TenHocKy} năm học {hk.NamHoc || ""}
                  </option>
                ))
              : uniqueHocKy.map((hocKy) => (
                  <option key={hocKy} value={hocKy}>
                    {hocKy}
                  </option>
                ))}
          </select>

          <select
            className="select"
            value={selectedTrangThai}
            onChange={onTrangThaiChange}
          >
            <option value="all">Tất cả trạng thái</option>
            {uniqueTrangThai && uniqueTrangThai.length > 0
              ? uniqueTrangThai.map((trangThai) => (
                  <option key={trangThai} value={trangThai}>
                    {trangThai}
                  </option>
                ))
              : [
                  "Đang diễn ra",
                  "Đã đóng đăng ký",
                  "Chưa bắt đầu",
                  "Đang mở đăng ký",
                ].map((trangThai) => (
                  <option key={trangThai} value={trangThai}>
                    {trangThai}
                  </option>
                ))}
          </select>
        </div>

        <div className="hoat-dong-list">
          {loadingHoatDong ? (
            // Skeleton loading
            Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="skeleton-item">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line" style={{ width: "50%" }}></div>
                  <div className="skeleton-line" style={{ width: "70%" }}></div>
                </div>
              ))
          ) : filteredHoatDong.length === 0 ? (
            <div className="empty-state">
              <AlertCircle className="empty-icon" />
              {selectedHocKy !== "all" ? (
                <>
                  <p>Không tìm thấy hoạt động nào trong {selectedHocKy}</p>
                  <button
                    className="btn btn-outline btn-sm mt-3"
                    onClick={viewAllHocKy}
                  >
                    Xem tất cả học kỳ
                  </button>
                </>
              ) : selectedTrangThai !== "all" ? (
                <>
                  <p>
                    Không tìm thấy hoạt động nào có trạng thái "
                    {selectedTrangThai}"
                  </p>
                  <button
                    className="btn btn-outline btn-sm mt-3"
                    onClick={viewAllTrangThai}
                  >
                    Xem tất cả trạng thái
                  </button>
                </>
              ) : searchTerm ? (
                <>
                  <p>
                    Không tìm thấy hoạt động nào phù hợp với từ khóa "
                    {searchTerm}"
                  </p>
                  <button
                    className="btn btn-outline btn-sm mt-3"
                    onClick={() => setSearchTerm("")}
                  >
                    Xóa tìm kiếm
                  </button>
                </>
              ) : (
                <p>Không tìm thấy hoạt động nào</p>
              )}
            </div>
          ) : (
            filteredHoatDong.map((hoatDong) => (
              <div
                key={hoatDong.MaHoatDong}
                className={`hoat-dong-item ${
                  selectedHoatDong === hoatDong.MaHoatDong ? "active" : ""
                }`}
                onClick={() => handleSelectHoatDong(hoatDong.MaHoatDong)}
              >
                <div className="hoat-dong-header">
                  <h3 className="hoat-dong-title">{hoatDong.TenHoatDong}</h3>
                  {renderTrangThaiHoatDong(hoatDong.TrangThai)}
                </div>
                <div className="hoat-dong-details">
                  <div className="hoat-dong-detail">
                    <Calendar className="detail-icon" />
                    <span>{formatDate(hoatDong.NgayBatDau)}</span>
                  </div>
                  <div className="hoat-dong-detail">
                    <MapPin className="detail-icon" />
                    <span>{hoatDong.DiaDiem || "Chưa xác định"}</span>
                  </div>
                  <div className="hoat-dong-detail">
                    <Users className="detail-icon" />
                    <span>
                      {hoatDong.SoLuongDaDangKy || 0} sinh viên đăng ký
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="card-footer">
        <button
          className="btn btn-outline"
          onClick={fetchDanhSachHoatDong}
          disabled={loadingHoatDong}
        >
          <RefreshCw className={`btn-icon ${loadingHoatDong ? "spin" : ""}`} />
          Làm mới danh sách
        </button>
      </div>
    </div>
  );
};

export default HoatDongList;
