import type React from "react";
import { useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Trash2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import type { PhanHoiDiemRenLuyenListDTO } from "../types";
import { format, parseISO } from "date-fns";
import Notification from "../../../Pages/Dashboard/Admin/views/Notification";
import "./phan-hoi.css";
import { vi } from "date-fns/locale";

interface PhanHoiListProps {
  phanHois: PhanHoiDiemRenLuyenListDTO[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedTrangThai: string;
  onSearchChange: (value: string) => void;
  onTrangThaiChange: (value: string) => void;
  onRefresh: () => void;
  onViewDetail: (id: number) => void;
  onProcess: (id: number) => void;
  onDelete: (id: number) => void;
}

const PhanHoiList: React.FC<PhanHoiListProps> = ({
  phanHois,
  loading,
  error,
  searchTerm,
  selectedTrangThai,
  onSearchChange,
  onTrangThaiChange,
  onRefresh,
  onViewDetail,
  onProcess,
  onDelete,
}) => {
  const [sortBy, setSortBy] = useState<"NgayPhanHoi" | "NgayXuLy">(
    "NgayPhanHoi"
  );
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

  const handleSort = (field: "NgayPhanHoi" | "NgayXuLy") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const sortedPhanHois = [...phanHois].sort((a, b) => {
    if (sortBy === "NgayPhanHoi") {
      if (!a.NgayPhanHoi) return 1;
      if (!b.NgayPhanHoi) return -1;
      return sortOrder === "asc"
        ? new Date(a.NgayPhanHoi).getTime() - new Date(b.NgayPhanHoi).getTime()
        : new Date(b.NgayPhanHoi).getTime() - new Date(a.NgayPhanHoi).getTime();
    } else {
      if (!a.NgayXuLy) return 1;
      if (!b.NgayXuLy) return -1;
      return sortOrder === "asc"
        ? new Date(a.NgayXuLy).getTime() - new Date(b.NgayXuLy).getTime()
        : new Date(b.NgayXuLy).getTime() - new Date(a.NgayXuLy).getTime();
    }
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const getTrangThaiClass = (trangThai: string | null) => {
    if (!trangThai) return "";

    switch (trangThai.toLowerCase()) {
      case "đã xử lý":
        return "status-da-xu-ly";
      case "chưa xử lý":
        return "status-chua-xu-ly";
      case "đang xử lý":
        return "status-dang-xu-ly";
      default:
        return "";
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleRefresh = () => {
    onRefresh();
    setNotification({
      show: true,
      message: "Dữ liệu đã được làm mới!",
      type: "info",
    });
  };

  return (
    <div className="phan-hoi-list-container">
      <div className="phan-hoi-list-header">
        <h2>Danh sách phản hồi điểm rèn luyện</h2>
        <div className="search-filter-container">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm phản hồi..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <Filter className="filter-icon" />
            <select
              value={selectedTrangThai}
              onChange={(e) => onTrangThaiChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chưa xử lý">Chưa xử lý</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Đã xử lý">Đã xử lý</option>
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
            <span>Làm mới</span>
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
          <AlertCircle size={18} />
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
          <div className="phan-hoi-table-container">
            <table className="phan-hoi-table">
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Nội dung phản hồi</th>
                  <th
                    className={`sortable ${
                      sortBy === "NgayPhanHoi" ? "sorted" : ""
                    }`}
                    onClick={() => handleSort("NgayPhanHoi")}
                  >
                    Ngày phản hồi
                    {sortBy === "NgayPhanHoi" && (
                      <span className="sort-indicator">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th>Trạng thái</th>
                  <th
                    className={`sortable ${
                      sortBy === "NgayXuLy" ? "sorted" : ""
                    }`}
                    onClick={() => handleSort("NgayXuLy")}
                  >
                    Ngày xử lý
                    {sortBy === "NgayXuLy" && (
                      <span className="sort-indicator">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedPhanHois.length > 0 ? (
                  sortedPhanHois.map((phanHoi) => (
                    <tr
                      key={phanHoi.MaPhanHoi}
                      className={
                        phanHoi.TrangThai?.toLowerCase() === "chưa xử lý"
                          ? "unprocessed-row"
                          : ""
                      }
                    >
                      <td>{phanHoi.MaSv || "N/A"}</td>
                      <td>{phanHoi.TenSinhVien || "N/A"}</td>
                      <td className="phan-hoi-content">
                        <MessageSquare className="message-icon" />
                        <span className="truncate-text">
                          {phanHoi.NoiDungPhanHoi || "N/A"}
                        </span>
                      </td>
                      <td>{formatDate(phanHoi.NgayPhanHoi)}</td>
                      <td>
                        <div
                          className={`status-badge ${getTrangThaiClass(
                            phanHoi.TrangThai
                          )}`}
                        >
                          {phanHoi.TrangThai || "N/A"}
                        </div>
                      </td>
                      <td>{formatDate(phanHoi.NgayXuLy)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => onViewDetail(phanHoi.MaPhanHoi)}
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          {phanHoi.TrangThai?.toLowerCase() !== "đã xử lý" && (
                            <button
                              className="action-btn process-btn"
                              onClick={() => onProcess(phanHoi.MaPhanHoi)}
                              title="Xử lý phản hồi"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            className="action-btn delete-btn"
                            onClick={() => onDelete(phanHoi.MaPhanHoi)}
                            title="Xóa phản hồi"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="no-data">
                      Không có phản hồi nào
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

export default PhanHoiList;
