import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Calendar,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { ThongBaoDTO } from "../types";
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
  onDeleteThongBao?: (maThongBao: number) => void;
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
  onDeleteThongBao,
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

  // Danh sách loại thông báo lấy từ API
  const [loaiThongBaoList, setLoaiThongBaoList] = useState<string[]>([]);

  useEffect(() => {
    // Gọi API lấy các loại thông báo
    axios
      .get("http://localhost:5163/api/ThongBao/lay_cac_loai_thong_bao")
      .then((res) => {
        setLoaiThongBaoList(res.data);
      })
      .catch((err) => {
        setLoaiThongBaoList([]);
      });
  }, []);

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
              {loaiThongBaoList.map((loai) => (
                <option key={loai} value={loai}>
                  {loai}
                </option>
              ))}
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
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => onViewDetail(thongBao.MaThongBao)}
                            title="Xem chi tiết"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              borderRadius: "4px",
                              border: "none",
                              backgroundColor: "#e6f7ff",
                              color: "#1890ff",
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          {onDeleteThongBao && (
                            <button
                              onClick={() =>
                                onDeleteThongBao(thongBao.MaThongBao)
                              }
                              title="Xóa"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "4px",
                                border: "none",
                                backgroundColor: "#fff1f0",
                                color: "#ff4d4f",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
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
