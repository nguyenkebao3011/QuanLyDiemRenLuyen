import React, { useMemo } from "react";
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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const displayedHoatDong = useMemo(() => {
    if (!searchTerm) return filteredHoatDong;
    return filteredHoatDong.filter((hd) =>
      hd.TenHoatDong.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredHoatDong, searchTerm]);

  const onHocKyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (handleHocKyChange) handleHocKyChange(e);
    else setSelectedHocKy(e.target.value);
  };

  const onTrangThaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (handleTrangThaiChange) handleTrangThaiChange(e);
    else setSelectedTrangThai(e.target.value);
  };

  const viewAllHocKy = () => onHocKyChange({ target: { value: "all" } } as any);
  const viewAllTrangThai = () =>
    onTrangThaiChange({ target: { value: "all" } } as any);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Danh sách hoạt động</h2>
        <p className="card-description">
          Chọn một hoạt động để quản lý điểm danh
        </p>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      <div className="card-content">
        <div className="filter-container">
          <select
            className="select"
            value={selectedHocKy}
            onChange={onHocKyChange}
          >
            <option value="all">Tất cả học kỳ</option>
            {hocKys.length > 0
              ? hocKys.map((hk) => (
                  <option key={hk.MaHocKy} value={hk.TenHocKy}>
                    {hk.TenHocKy} {hk.NamHoc && `- ${hk.NamHoc}`}
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
            {uniqueTrangThai.length > 0
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
            // Skeleton loading state
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="skeleton-item">
                <div className="skeleton-line" />
                <div className="skeleton-line" style={{ width: "50%" }} />
                <div className="skeleton-line" style={{ width: "70%" }} />
              </div>
            ))
          ) : displayedHoatDong.length === 0 ? (
            <div className="empty-state">
              <AlertCircle className="empty-icon" />
              {searchTerm ? (
                <>
                  <p>
                    Không tìm thấy hoạt động phù hợp với từ khóa “{searchTerm}”
                  </p>
                  <button
                    className="btn btn-outline btn-sm mt-3"
                    onClick={() => setSearchTerm("")}
                  >
                    Xóa tìm kiếm
                  </button>
                </>
              ) : selectedHocKy !== "all" ? (
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
                    Không tìm thấy hoạt động nào có trạng thái “
                    {selectedTrangThai}”
                  </p>
                  <button
                    className="btn btn-outline btn-sm mt-3"
                    onClick={viewAllTrangThai}
                  >
                    Xem tất cả trạng thái
                  </button>
                </>
              ) : (
                <p>Chưa có hoạt động nào.</p>
              )}
            </div>
          ) : (
            displayedHoatDong.map((hoatDong) => (
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
                    <span>{hoatDong.SoLuongDaDangKy || 0} sinh viên</span>
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
