import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./QuanLyGiangVien.css";
import type { GiaoVien } from "../../types";
import ThemGiangVien from "./ThemGiangVien";
import SuaGiangVien from "./SuaGiangVien";
import XacNhanXoaGiangVien from "./XacNhanXoaGiangVien";
import Notification from "../../../../Pages/Dashboard/Admin/views/Notification";
import "../../../../Pages/Dashboard/Admin/css/notification.css";
import { ApiService } from "../../../../untils/services/service-api";

const pageSize = 10;

const QuanLyGiangVien: React.FC = () => {
  const [giangVienList, setGiangVienList] = useState<GiaoVien[]>([]);
  const [filteredList, setFilteredList] = useState<GiaoVien[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // State cho modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGiangVien, setEditingGiangVien] = useState<{
    MaGv: string;
    data: GiaoVien | null;
  }>({ MaGv: "", data: null });
  const [deletingGiangVien, setDeletingGiangVien] = useState<{
    MaGv: string;
    name: string | null;
  }>({ MaGv: "", name: null });

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

  // Hàm lấy danh sách giảng viên
  const fetchGiangVien = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachGiaoVien();
      setGiangVienList(data);
      setFilteredList(data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách giảng viên:", error);
      setError(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải dữ liệu giảng viên"
      );
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchGiangVien();
  }, []);

  // Lọc danh sách khi searchTerm thay đổi
  useEffect(() => {
    if (searchTerm) {
      const filtered = giangVienList.filter(
        (gv) =>
          gv.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gv.MaGv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gv.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(giangVienList);
    }
  }, [searchTerm, giangVienList]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredList.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredList.length, currentPage]);

  // Format ngày sinh để hiển thị
  const formatDate = (dateString: Date | string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
    } catch (error) {
      return "-";
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Xử lý làm mới dữ liệu
  const handleRefresh = () => {
    fetchGiangVien();
    setNotification({
      show: true,
      message: "Dữ liệu đã được làm mới!",
      type: "info",
    });
  };

  // Xử lý mở modal thêm giảng viên
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  // Xử lý mở modal sửa giảng viên
  const handleEditClick = (MaGv: string) => {
    const giangVien = giangVienList.find((gv) => gv.MaGv === MaGv);
    setEditingGiangVien({ MaGv, data: giangVien || null });
  };

  // Xử lý mở modal xóa giảng viên
  const handleDeleteClick = (MaGv: string) => {
    const giangVien = giangVienList.find((gv) => gv.MaGv === MaGv);
    setDeletingGiangVien({ MaGv, name: giangVien?.HoTen || null });
  };

  // Xử lý xóa giảng viên
  const handleDelete = async () => {
    if (!deletingGiangVien.MaGv) return;
    try {
      await ApiService.xoaGiangVien(deletingGiangVien.MaGv);

      setGiangVienList(
        giangVienList.filter((gv) => gv.MaGv !== deletingGiangVien.MaGv)
      );
      setFilteredList(
        filteredList.filter((gv) => gv.MaGv !== deletingGiangVien.MaGv)
      );
      setDeletingGiangVien({ MaGv: "", name: null });

      setNotification({
        show: true,
        message: "Xóa giảng viên thành công!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Lỗi khi xóa giảng viên:", error);

      let errorMessage = "Có lỗi xảy ra khi xóa giảng viên";
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        }
      }

      setNotification({
        show: true,
        message: `Lỗi: ${errorMessage}`,
        type: "error",
      });
    }
  };

  // Xử lý xuất Excel
  const handleExportExcel = () => {
    setNotification({
      show: true,
      message: "Chức năng xuất Excel đang được phát triển",
      type: "info",
    });
  };

  // Add function to close notification
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  // Add function to handle successful add
  const handleAddSuccess = () => {
    fetchGiangVien();
    setNotification({
      show: true,
      message: "Thêm giảng viên mới thành công!",
      type: "success",
    });
  };

  // Add function to handle successful edit
  const handleEditSuccess = () => {
    fetchGiangVien();
    setNotification({
      show: true,
      message: "Cập nhật giảng viên thành công!",
      type: "success",
    });
  };

  return (
    <div className="giang-vien-management">
      <div className="management-header">
        <h2>Quản lý giảng viên</h2>
        <div className="action-buttons">
          <button className="filter-btn">
            <Filter size={16} />
            <span>Lọc</span>
          </button>
          <button className="refresh-btn" onClick={handleRefresh}>
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </button>
          <button className="export-btn" onClick={handleExportExcel}>
            <Download size={16} />
            <span>Xuất Excel</span>
          </button>
          <button className="add-btn" onClick={handleAddClick}>
            <Plus size={16} />
            <span>Thêm giảng viên</span>
          </button>
        </div>
      </div>

      <div className="search-box">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm giảng viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <span>Q</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="lecturer-table-container">
        {loading ? (
          <div className="loading-message">Đang tải dữ liệu giảng viên...</div>
        ) : filteredList.length === 0 ? (
          <div className="empty-message">Không có dữ liệu giảng viên</div>
        ) : (
          <table className="lecturer-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã GV</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredList
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((gv, index) => (
                  <tr key={gv.MaGv}>
                    <td>{index + 1}</td>
                    <td>{gv.MaGv}</td>
                    <td>{gv.HoTen || "-"}</td>
                    <td>{gv.Email || "-"}</td>
                    <td>{gv.SoDienThoai || "-"}</td>
                    <td>{gv.DiaChi || "-"}</td>
                    <td>{formatDate(gv.NgaySinh)}</td>
                    <td>{gv.GioiTinh || "-"}</td>
                    <td>{gv.TrangThai == "HoatDong" ? "Hoạt động" : "Khóa"}</td>
                    <td className="action-cell">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(gv.MaGv)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(gv.MaGv)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="pagination-info">
          Trang {currentPage} / {Math.ceil(filteredList.length / pageSize)}
        </div>

        <button
          className="pagination-button"
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(filteredList.length / pageSize))
            )
          }
          disabled={currentPage === Math.ceil(filteredList.length / pageSize)}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Modals */}
      <ThemGiangVien
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <SuaGiangVien
        isOpen={!!editingGiangVien.MaGv}
        onClose={() => setEditingGiangVien({ MaGv: "", data: null })}
        onSuccess={handleEditSuccess}
        giangVienId={editingGiangVien.MaGv}
        data={editingGiangVien.data}
      />

      <XacNhanXoaGiangVien
        isOpen={!!deletingGiangVien.MaGv}
        onClose={() => setDeletingGiangVien({ MaGv: "", name: null })}
        onConfirm={handleDelete}
        giangVienId={deletingGiangVien.MaGv}
        giangVienName={deletingGiangVien.name}
      />

      {/* Add notification component */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default QuanLyGiangVien;
