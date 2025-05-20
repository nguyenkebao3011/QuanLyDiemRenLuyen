"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./QuanLySinhVien.css";
import type { SinhVien, Lop } from "../../types";
import ThemSinhVien from "./ThemSinhVien";
import SuaSinhVien from "./SuaSinhVien";
import XacNhanXoaSinhVien from "./XacNhanXoaSinhVien";
import Notification from "../../../../Pages/Dashboard/Admin/views/Notification";
import "../../../../Pages/Dashboard/Admin/css/notification.css";
import { ApiService } from "../../../../untils/services/service-api";
import ImportSinhVien from "./ImportSinhVien";

const pageSize = 10;

const QuanLySinhVien: React.FC = () => {
  const [sinhVienList, setSinhVienList] = useState<SinhVien[]>([]);
  const [filteredList, setFilteredList] = useState<SinhVien[]>([]);
  const [lopList, setLopList] = useState<Lop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterLop, setFilterLop] = useState<string>("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("");
  const [filterGioiTinh, setFilterGioiTinh] = useState<string>("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSinhVien, setEditingSinhVien] = useState<{
    MaSV: string;
    data: SinhVien | null;
  }>({ MaSV: "", data: null });
  const [deletingSinhVien, setDeletingSinhVien] = useState<{
    MaSV: string;
    name: string | null;
  }>({ MaSV: "", name: null });

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const [showImportModal, setShowImportModal] = useState(false);

  const fetchLop = async () => {
    try {
      const data = await ApiService.layDanhSachLop();
      setLopList(data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách lớp:", error);
      setError("Không thể tải danh sách lớp");
    }
  };

  const fetchSinhVien = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachSinhVienTheoVaiTro();
      setSinhVienList(data);
      setFilteredList(data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      setError(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải dữ liệu sinh viên"
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

  useEffect(() => {
    fetchSinhVien();
    fetchLop();
  }, []);

  useEffect(() => {
    let filtered = sinhVienList;

    if (searchTerm) {
      filtered = filtered.filter(
        (sv) =>
          sv.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sv.MaSV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sv.MaLop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sv.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLop) {
      filtered = filtered.filter((sv) => sv.MaLop === filterLop);
    }

    if (filterTrangThai) {
      filtered = filtered.filter((sv) => sv.TrangThai === filterTrangThai);
    }

    if (filterGioiTinh) {
      filtered = filtered.filter((sv) => sv.GioiTinh === filterGioiTinh);
    }

    setFilteredList(filtered);
  }, [searchTerm, filterLop, filterTrangThai, filterGioiTinh, sinhVienList]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredList.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredList.length, currentPage]);

  const formatDate = (dateString: Date | string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      return "-";
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    fetchSinhVien();
    setSearchTerm("");
    setFilterLop("");
    setFilterTrangThai("");
    setFilterGioiTinh("");
    setNotification({
      show: true,
      message: "Dữ liệu đã được làm mới!",
      type: "info",
    });
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = (MaSV: string) => {
    const sinhVien = sinhVienList.find((sv) => sv.MaSV === MaSV);
    setEditingSinhVien({ MaSV: MaSV, data: sinhVien || null });
  };

  const handleDeleteClick = (MaSV: string) => {
    const sinhVien = sinhVienList.find((sv) => sv.MaSV === MaSV);
    setDeletingSinhVien({ MaSV: MaSV, name: sinhVien?.HoTen || null });
  };

  const handleDelete = async () => {
    if (!deletingSinhVien.MaSV) return;
    try {
      await ApiService.xoaSinhVien(deletingSinhVien.MaSV);
      setSinhVienList(
        sinhVienList.filter((sv) => sv.MaSV !== deletingSinhVien.MaSV)
      );
      setFilteredList(
        filteredList.filter((sv) => sv.MaSV !== deletingSinhVien.MaSV)
      );
      setDeletingSinhVien({ MaSV: "", name: null });

      setNotification({
        show: true,
        message: "Xóa sinh viên thành công!",
        type: "success",
      });
    } catch (error: any) {
      console.error("Lỗi khi xóa sinh viên:", error);

      let errorMessage = "Có lỗi xảy ra khi xóa sinh viên";
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

  const handleExportExcel = () => {
    setNotification({
      show: true,
      message: "Chức năng xuất Excel đang được phát triển",
      type: "info",
    });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleAddSuccess = () => {
    fetchSinhVien();
    setNotification({
      show: true,
      message: "Thêm sinh viên mới thành công!",
      type: "success",
    });
  };

  const handleEditSuccess = () => {
    fetchSinhVien();
    setNotification({
      show: true,
      message: "Cập nhật sinh viên thành công!",
      type: "success",
    });
  };

  const getLopName = (sinhVien: SinhVien): string => {
    if (sinhVien.MaLopNavigation && sinhVien.MaLopNavigation.tenLop) {
      return sinhVien.MaLopNavigation.tenLop;
    }
    const lop = lopList.find((l) => l.MaLop === sinhVien.MaLop);
    return lop ? lop.TenLop : sinhVien.MaLop || "";
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  return (
    <div className="sinh-vien-management">
      <div className="management-header">
        <h2>Quản lý sinh viên</h2>
        <div className="action-buttons">
          <button className="refresh-btn" onClick={handleRefresh}>
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </button>
          <button className="export-btn" onClick={handleExportExcel}>
            <Download size={16} />
            <span>Xuất Excel</span>
          </button>
          <button className="import-btn" onClick={handleImportClick}>
            <Upload size={16} />
            <span>Import Excel</span>
          </button>
          <button className="add-btn" onClick={handleAddClick}>
            <Plus size={16} />
            <span>Thêm sinh viên</span>
          </button>
        </div>
      </div>

      <div className="filter-search-container">
        <div className="filter-box">
          <div className="form-group">
            <label htmlFor="filterLop">Lớp</label>
            <select
              id="filterLop"
              value={filterLop}
              onChange={(e) => setFilterLop(e.target.value)}
            >
              <option value="">Tất cả lớp</option>
              {lopList.map((lop) => (
                <option key={lop.MaLop} value={lop.MaLop}>
                  {lop.TenLop}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filterTrangThai">Trạng thái</label>
            <select
              id="filterTrangThai"
              value={filterTrangThai}
              onChange={(e) => setFilterTrangThai(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="HoatDong">Hoạt động</option>
              <option value="Khoa">Khóa</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filterGioiTinh">Giới tính</label>
            <select
              id="filterGioiTinh"
              value={filterGioiTinh}
              onChange={(e) => setFilterGioiTinh(e.target.value)}
            >
              <option value="">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>
        <div className="search-box">
          <form onSubmit={() => handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên..."
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
              {filteredList
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((sv, index) => (
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
                    <td>
                      {sv.TrangThai === "HoatDong" ? "Hoạt động" : "Khóa"}
                    </td>
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

      <ThemSinhVien
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        lopList={lopList}
      />

      <SuaSinhVien
        isOpen={!!editingSinhVien.MaSV}
        onClose={() => setEditingSinhVien({ MaSV: "", data: null })}
        onSuccess={handleEditSuccess}
        sinhVienId={editingSinhVien.MaSV}
        data={editingSinhVien.data}
        lopList={lopList}
      />

      <XacNhanXoaSinhVien
        isOpen={!!deletingSinhVien.MaSV}
        onClose={() => setDeletingSinhVien({ MaSV: "", name: null })}
        onConfirm={handleDelete}
        sinhVienId={deletingSinhVien.MaSV}
        sinhVienName={deletingSinhVien.name}
      />

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {showImportModal && (
        <ImportSinhVien
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchSinhVien();
            setNotification({
              show: true,
              message: "Import sinh viên thành công!",
              type: "success",
            });
          }}
        />
      )}
    </div>
  );
};

export default QuanLySinhVien;
