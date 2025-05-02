import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
} from "lucide-react";
import "./QuanLyGiangVien.css";
import { GiaoVien } from "../../types";
import ThemGiangVien from "./ThemGiangVien";
import SuaGiangVien from "./SuaGiangVien";
import XacNhanXoaGiangVien from "./XacNhanXoaGiangVien";

const API_URL = "http://localhost:5163/api";

const QuanLyGiangVien: React.FC = () => {
  const [giangVienList, setGiangVienList] = useState<GiaoVien[]>([]);
  const [filteredList, setFilteredList] = useState<GiaoVien[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // Hàm lấy danh sách giảng viên
  const fetchGiangVien = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/GiaoViens`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGiangVienList(response.data);
      setFilteredList(response.data);
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
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Xử lý làm mới dữ liệu
  const handleRefresh = () => {
    fetchGiangVien();
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
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/QuanLyGiangVien/xoa_giang_vien/${deletingGiangVien.MaGv}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGiangVienList(
        giangVienList.filter((gv) => gv.MaGv !== deletingGiangVien.MaGv)
      );
      setFilteredList(
        filteredList.filter((gv) => gv.MaGv !== deletingGiangVien.MaGv)
      );
      setDeletingGiangVien({ MaGv: "", name: null });
      alert("Xóa giảng viên thành công");
    } catch (error: any) {
      console.error("Lỗi khi xóa giảng viên:", error);
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa giảng viên"
      );
    }
  };

  // Xử lý xuất Excel
  const handleExportExcel = () => {
    alert("Chức năng xuất Excel đang được phát triển");
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
        <form onSubmit={() => handleSearch} className="search-form">
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
              {filteredList.map((gv, index) => (
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
        <button className="pagination-btn active">1</button>
        <button className="pagination-btn">2</button>
        <button className="pagination-btn">3</button>
        <button className="pagination-btn">...</button>
        <button className="pagination-btn">10</button>
      </div>

      {/* Modals */}
      <ThemGiangVien
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchGiangVien}
      />

      <SuaGiangVien
        isOpen={!!editingGiangVien.MaGv}
        onClose={() => setEditingGiangVien({ MaGv: "", data: null })}
        onSuccess={fetchGiangVien}
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
    </div>
  );
};

export default QuanLyGiangVien;
