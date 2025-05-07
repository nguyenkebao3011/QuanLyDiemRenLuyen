import type React from "react";
import { Search, RefreshCw, Plus, Eye, Trash } from "lucide-react";
import type { HoiDongChamDiemDTO } from "../types";

interface HoiDongListProps {
  hoiDongs: HoiDongChamDiemDTO[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onCreateNew: () => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

const HoiDongList: React.FC<HoiDongListProps> = ({
  hoiDongs,
  loading,
  error,
  searchTerm,
  onSearchChange,
  onRefresh,
  refreshing,
  onCreateNew,
  onView,
  onDelete,
}) => {
  // Format date to display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading && !refreshing) {
    return (
      <div className="hoi-dong-list-container loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách hội đồng...</p>
      </div>
    );
  }

  return (
    <div className="hoi-dong-list-container">
      <div className="hoi-dong-list-header">
        <h2>Danh sách hội đồng chấm điểm</h2>
        <div className="action-buttons">
          <button className="btn-create" onClick={onCreateNew}>
            <Plus size={16} />
            <span>Tạo hội đồng mới</span>
          </button>
          <button
            className="btn-refresh"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "refresh-icon spinning" : "refresh-icon"}
            />
            <span>{refreshing ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="search-filter-container">
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tên hội đồng hoặc học kỳ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="hoi-dong-table-container">
        <table className="hoi-dong-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Tên hội đồng</th>
              <th>Học kỳ</th>
              <th>Ngày thành lập</th>
              <th>Ghi chú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {hoiDongs.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  Không có hội đồng nào. Hãy tạo hội đồng mới.
                </td>
              </tr>
            ) : (
              hoiDongs.map((hoiDong) => (
                <tr key={hoiDong.MaHoiDong}>
                  <td>{hoiDong.MaHoiDong}</td>
                  <td>{hoiDong.TenHoiDong}</td>
                  <td>{hoiDong.TenHocKy || "N/A"}</td>
                  <td>{formatDate(hoiDong.NgayThanhLap)}</td>
                  <td>{hoiDong.GhiChu || "—"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => onView(hoiDong.MaHoiDong)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDelete(hoiDong.MaHoiDong)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoiDongList;
