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
import "./QuanLySinhVien.css";
import { SinhVien } from "../../types";
import ThemSinhVien from "./ThemSinhVien";
import SuaSinhVien from "./SuaSinhVien";
import XacNhanXoaSinhVien from "./XacNhanXoaSinhVien";

const API_URL = "http://localhost:5163/api";

const QuanLySinhVien: React.FC = () => {
  const [sinhVienList, setSinhVienList] = useState<SinhVien[]>([]);
  const [filteredList, setFilteredList] = useState<SinhVien[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // State cho modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSinhVien, setEditingSinhVien] = useState<{
    MaSV: string;
    data: SinhVien | null;
  }>({ MaSV: "", data: null });
  const [deletingSinhVien, setDeletingSinhVien] = useState<{
    MaSV: string;
    name: string | null;
  }>({ MaSV: "", name: null });

  // Hàm lấy danh sách sinh viên
  const fetchSinhVien = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/SinhVien/lay-sinhvien-theo-vai-tro`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataArr = Array.isArray(response.data)
        ? response.data
        : [response.data];
      setSinhVienList(dataArr);
      setFilteredList(dataArr);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      setError(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải dữ liệu sinh viên"
      );

      // Xử lý lỗi 401 - Unauthorized
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
    fetchSinhVien();
  }, []);

  // Lọc danh sách khi searchTerm thay đổi
  useEffect(() => {
    if (searchTerm) {
      const filtered = sinhVienList.filter(
        (sv) =>
          sv.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sv.MaSV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sv.MaLop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sv.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(sinhVienList);
    }
  }, [searchTerm, sinhVienList]);

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
    fetchSinhVien();
  };

  // Xử lý mở modal thêm sinh viên
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  // Xử lý mở modal sửa sinh viên
  const handleEditClick = (MaSV: string) => {
    const sinhVien = sinhVienList.find((sv) => sv.MaSV === MaSV);
    setEditingSinhVien({ MaSV: MaSV, data: sinhVien || null });
  };

  // Xử lý mở modal xóa sinh viên
  const handleDeleteClick = (MaSV: string) => {
    const sinhVien = sinhVienList.find((sv) => sv.MaSV === MaSV);
    setDeletingSinhVien({ MaSV: MaSV, name: sinhVien?.HoTen || null });
  };

  // Xử lý xóa sinh viên
  const handleDelete = async () => {
    if (!deletingSinhVien.MaSV) return;

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");

      //Gọi API xóa sinh viên
      await axios.delete(
        `${API_URL}/QuanLySinhVien/xoa_sinh_vien/${deletingSinhVien.MaSV}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Tạm thời dùng setTimeout để giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Cập nhật state sau khi xóa
      setSinhVienList(
        sinhVienList.filter((sv) => sv.MaSV !== deletingSinhVien.MaSV)
      );
      setFilteredList(
        filteredList.filter((sv) => sv.MaSV !== deletingSinhVien.MaSV)
      );

      // Đóng modal và reset state
      setDeletingSinhVien({ MaSV: "", name: null });
      alert("Xóa sinh viên thành công");
    } catch (error: any) {
      console.error("Lỗi khi xóa sinh viên:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi xóa sinh viên");
    }
  };

  // Xử lý xuất Excel
  const handleExportExcel = () => {
    // Xử lý xuất Excel
    alert("Chức năng xuất Excel đang được phát triển");
  };

  const getLopName = (sinhVien: SinhVien): string => {
    if (sinhVien.MaLopNavigation && sinhVien.MaLopNavigation.tenLop) {
      return sinhVien.MaLopNavigation.tenLop;
    }
    return sinhVien.MaLop || "";
  };

  return (
    <div className="sinh-vien-management">
      <div className="management-header">
        <h2>Quản lý sinh viên</h2>
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
            <span>Thêm sinh viên</span>
          </button>
        </div>
      </div>

      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm sinh viên theo tên, mã SV, lớp..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="student-table-container">
        {loading ? (
          <div className="loading-message">Đang tải dữ liệu sinh viên...</div>
        ) : filteredList.length === 0 ? (
          <div className="empty-message">Không có dữ liệu sinh viên</div>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã SV</th>
                <th>Họ và tên</th>
                <th>Lớp</th>
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
              {filteredList.map((sv, index) => (
                <tr key={sv.MaSV}>
                  <td>{index + 1}</td>
                  <td>{sv.MaSV}</td>
                  <td>{sv.HoTen || "-"}</td>
                  <td>{getLopName(sv)}</td>
                  <td>{sv.Email || "-"}</td>
                  <td>{sv.SoDienThoai || "-"}</td>
                  <td>{sv.DiaChi || "-"}</td>
                  <td>{formatDate(sv.NgaySinh)}</td>
                  <td>{sv.GioiTinh || "-"}</td>
                  <td>{sv.TrangThai === "HoatDong" ? "Hoạt động" : "Khóa"}</td>
                  <td className="action-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(sv.MaSV)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteClick(sv.MaSV)}
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
      <ThemSinhVien
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchSinhVien}
      />

      <SuaSinhVien
        isOpen={!!editingSinhVien.MaSV}
        onClose={() => setEditingSinhVien({ MaSV: "", data: null })}
        onSuccess={fetchSinhVien}
        sinhVienId={editingSinhVien.MaSV}
        data={editingSinhVien.data}
      />

      <XacNhanXoaSinhVien
        isOpen={!!deletingSinhVien.MaSV}
        onClose={() => setDeletingSinhVien({ MaSV: "", name: null })}
        onConfirm={handleDelete}
        sinhVienId={deletingSinhVien.MaSV}
        sinhVienName={deletingSinhVien.name}
      />
    </div>
  );
};

export default QuanLySinhVien;
