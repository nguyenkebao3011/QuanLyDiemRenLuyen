import type React from "react";
import { useState } from "react";
import {
  Search,
  Bell,
  Calendar,
  Eye,
  Filter,
  RefreshCw,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { ThongBaoDTO } from "../types";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import Notification from "../../../Pages/Dashboard/Admin/views/Notification";

interface ThongBaoListProps {
  thongBaos: ThongBaoDTO[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedLoaiThongBao: string;
  onSearchChange: (value: string) => void;
  onLoaiThongBaoChange: (value: string) => void;
  onRefresh: () => void;
  onViewDetail: (maThongBao: number) => void;
}

const ThongBaoList: React.FC<ThongBaoListProps> = ({
  thongBaos,
  loading,
  error,
  searchTerm,
  selectedLoaiThongBao,
  onSearchChange,
  onLoaiThongBaoChange,
  onRefresh,
  onViewDetail,
}) => {
  const [sortBy, setSortBy] = useState<"NgayTao" | "SoLuotXem">("NgayTao");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Add notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const handleSort = (field: "NgayTao" | "SoLuotXem") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const sortedThongBaos = [...thongBaos].sort((a, b) => {
    if (sortBy === "NgayTao") {
      return sortOrder === "asc"
        ? new Date(a.NgayTao).getTime() - new Date(b.NgayTao).getTime()
        : new Date(b.NgayTao).getTime() - new Date(a.NgayTao).getTime();
    } else {
      return sortOrder === "asc"
        ? a.SoLuotXem - b.SoLuotXem
        : b.SoLuotXem - a.SoLuotXem;
    }
  });

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const getLoaiThongBaoClass = (loaiThongBao: string) => {
    switch (loaiThongBao.toLowerCase()) {
      case "hoạt động":
        return "badge-blue";
      case "học tập":
        return "badge-green";
      case "khẩn cấp":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  const handleRefresh = () => {
    onRefresh();
    setNotification({
      show: true,
      message: "Dữ liệu đã được làm mới!",
      type: "info",
    });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return (
    <div className="thong-bao-list-container">
      <div className="thong-bao-list-header">
        <h2>Danh sách thông báo</h2>
        <div className="search-filter-container">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <Filter className="filter-icon" />
            <select
              value={selectedLoaiThongBao}
              onChange={(e) => onLoaiThongBaoChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả loại</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Học tập">Học tập</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <button
            className="btn-refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`refresh-icon ${loading ? "spinning" : ""}`}
            />
            Làm mới
          </button>
        </div>
      </div>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {error && (
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="thong-bao-table-container">
            <table className="thong-bao-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Loại thông báo</th>
                  <th>Người tạo</th>
                  <th
                    className={`sortable ${
                      sortBy === "NgayTao" ? "sorted" : ""
                    }`}
                    onClick={() => handleSort("NgayTao")}
                  >
                    Ngày tạo
                    {sortBy === "NgayTao" && (
                      <span className="sort-indicator">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className={`sortable ${
                      sortBy === "SoLuotXem" ? "sorted" : ""
                    }`}
                    onClick={() => handleSort("SoLuotXem")}
                  >
                    Lượt xem
                    {sortBy === "SoLuotXem" && (
                      <span className="sort-indicator">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedThongBaos.length > 0 ? (
                  sortedThongBaos.map((thongBao) => (
                    <tr
                      key={thongBao.MaThongBao}
                      className={thongBao.DaDoc ? "" : "unread-row"}
                    >
                      <td className="thong-bao-title">
                        <Bell
                          className={`bell-icon ${
                            !thongBao.DaDoc ? "unread" : ""
                          }`}
                        />
                        {thongBao.TieuDe}
                      </td>
                      <td>
                        <span
                          className={`badge ${getLoaiThongBaoClass(
                            thongBao.LoaiThongBao
                          )}`}
                        >
                          {thongBao.LoaiThongBao}
                        </span>
                      </td>
                      <td>{thongBao.TenNguoiTao}</td>
                      <td>
                        <div className="date-info">
                          <Calendar className="date-icon" />
                          {formatDate(thongBao.NgayTao)}
                        </div>
                      </td>
                      <td>
                        <div className="view-count">
                          <Eye className="view-icon" />
                          {thongBao.SoLuotXem}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-view-detail"
                          onClick={() => onViewDetail(thongBao.MaThongBao)}
                        >
                          <span>Chi tiết</span>
                          <ChevronRight className="chevron-icon" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-data">
                      Không có thông báo nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ThongBaoList;
