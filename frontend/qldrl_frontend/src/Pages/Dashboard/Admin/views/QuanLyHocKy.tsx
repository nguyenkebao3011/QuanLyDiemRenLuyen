import type React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
} from "lucide-react";
import "../css/QuanLyLop.css";
import ModalDeleteHocKy from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyHocKy/modal-delete-hoc-ky";
import ActionButtonsHocKy from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyHocKy/action-buttons-hoc-ky";
import ModalEditHocKy from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyHocKy/modal-edit-hoc-ky";
import ModalDetailHocKy from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyHocKy/modal-detail-hoc-ky";
import TaoHocKyForm from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyHocKy/tao-hoc-ky-form";
import Notification from "./Notification"; // import Notification thay vì Toast
import { ApiService } from "../../../../untils/services/service-api";

interface HocKyDTO {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
  NgayBatDau: string;
  NgayKetThuc: string;
}

const pageSize = 10;

const QuanLyHocKy: React.FC = () => {
  // State cho danh sách học kỳ
  const [hocKys, setHocKys] = useState<HocKyDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);

  // State cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterNamHoc, setFilterNamHoc] = useState<string>("all");

  // State cho modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [hocKyToDelete, setHocKyToDelete] = useState<number | null>(null);

  // State cho modal edit
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [hocKyToEdit, setHocKyToEdit] = useState<HocKyDTO | null>(null);

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedHocKy, setSelectedHocKy] = useState<HocKyDTO | null>(null);

  // State cho form tạo mới
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  // State cho notification
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    fetchHocKys();
  }, []);

  const fetchHocKys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachHocKy();
      setHocKys(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách học kỳ:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Không thể tải danh sách học kỳ. Vui lòng thử lại sau.";
      setError(errorMessage);
      setNotification({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter + search
  const filteredHocKys = hocKys.filter(
    (hocKy) =>
      (filterNamHoc === "all" || hocKy.NamHoc === filterNamHoc) &&
      (searchTerm === "" ||
        hocKy.TenHocKy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hocKy.NamHoc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Phân trang
  const totalPages = Math.ceil(filteredHocKys.length / pageSize);
  const pagedHocKys = filteredHocKys.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset currentPage nếu lọc mà không còn trang hiện tại
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filterNamHoc, searchTerm, totalPages, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterNamHocChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterNamHoc(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const confirmDelete = (maHocKy: number) => {
    setHocKyToDelete(maHocKy);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!hocKyToDelete) return;
    try {
      await ApiService.xoaHocKy(hocKyToDelete);
      setNotification({
        show: true,
        type: "success",
        message: "Xóa học kỳ thành công!",
      });
      fetchHocKys();
    } catch (err: any) {
      console.error("Lỗi khi xóa học kỳ:", err);
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Không thể xóa học kỳ. Vui lòng thử lại sau.",
      });
    } finally {
      setShowDeleteModal(false);
      setHocKyToDelete(null);
    }
  };

  const handleViewDetail = (hocKy: HocKyDTO) => {
    setSelectedHocKy(hocKy);
    setShowDetailModal(true);
  };

  const handleCreateHocKy = () => {
    setShowCreateForm(true);
  };

  const handleEditHocKy = async (maHocKy: number) => {
    try {
      const hocKy = await ApiService.layChiTietHocKy(maHocKy);
      setHocKyToEdit(hocKy);
      setShowEditModal(true);
    } catch (err) {
      console.error(`Lỗi khi lấy chi tiết học kỳ ${maHocKy}:`, err);
      setNotification({
        show: true,
        type: "error",
        message: "Không thể lấy chi tiết học kỳ. Vui lòng thử lại sau.",
      });
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setHocKyToEdit(null);
    fetchHocKys();
    setNotification({
      show: true,
      type: "success",
      message: "Cập nhật học kỳ thành công!",
    });
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchHocKys();
    setNotification({
      show: true,
      type: "success",
      message: "Tạo học kỳ thành công!",
    });
  };

  const handleRefresh = () => {
    fetchHocKys();
    setNotification({
      show: true,
      type: "info",
      message: "Dữ liệu đã được làm mới!",
    });
  };

  const getNamHocList = () => {
    // Lọc ra các năm học duy nhất và loại bỏ giá trị null/undefined
    const namHocs = Array.from(
      new Set(hocKys.map((hocKy) => hocKy.NamHoc).filter(Boolean))
    );
    return namHocs.sort();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getHocKyStatus = (ngayBatDau: string, ngayKetThuc: string) => {
    const now = new Date();
    const startDate = new Date(ngayBatDau);
    const endDate = new Date(ngayKetThuc);

    if (now < startDate) {
      return { text: "Chưa bắt đầu", class: "status-upcoming" };
    } else if (now > endDate) {
      return { text: "Đã kết thúc", class: "status-completed" };
    } else {
      return { text: "Đang diễn ra", class: "status-ongoing" };
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  if (showCreateForm) {
    return (
      <TaoHocKyForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreateForm(false)}
        showToast={() => {}} // không dùng toast
      />
    );
  }

  return (
    <div className="quan-ly-lop-container">
      <div className="quan-ly-lop-header">
        <h2>
          <BookOpen className="icon-xl" />
          Quản lý học kỳ
        </h2>
        <button className="btn-create" onClick={handleCreateHocKy}>
          <Plus className="icon" />
          Tạo học kỳ mới
        </button>
      </div>

      <div className="quan-ly-lop-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm học kỳ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <Search className="icon" />
            </button>
          </div>
        </form>

        <div className="filter-container">
          <div className="filter-group">
            <Filter className="icon" />
            <select
              value={filterNamHoc}
              onChange={handleFilterNamHocChange}
              className="filter-select"
            >
              <option value="all">Tất cả năm học</option>
              {getNamHocList().map((namHoc) => (
                <option key={namHoc} value={namHoc}>
                  {namHoc}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-refresh" onClick={handleRefresh}>
            <RefreshCw className="icon" />
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

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : error ? (
        <div className="error-message">
          <AlertCircle className="icon" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="quan-ly-lop-table-container">
            <table className="quan-ly-lop-table">
              <thead>
                <tr>
                  <th>Mã học kỳ</th>
                  <th>Tên học kỳ</th>
                  <th>Năm học</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedHocKys.length > 0 ? (
                  pagedHocKys.map((hocKy) => {
                    const status = getHocKyStatus(
                      hocKy.NgayBatDau,
                      hocKy.NgayKetThuc
                    );
                    return (
                      <tr key={hocKy.MaHocKy}>
                        <td style={{ fontWeight: 500 }}>{hocKy.MaHocKy}</td>
                        <td className="lop-name">{hocKy.TenHocKy}</td>
                        <td>
                          <span className="status-badge">{hocKy.NamHoc}</span>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Calendar className="icon" />
                            <span>{formatDate(hocKy.NgayBatDau)}</span>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Calendar className="icon" />
                            <span>{formatDate(hocKy.NgayKetThuc)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                        <td>
                          <ActionButtonsHocKy
                            onView={() => handleViewDetail(hocKy)}
                            onEdit={() => handleEditHocKy(hocKy.MaHocKy)}
                            onDelete={() => confirmDelete(hocKy.MaHocKy)}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="no-data">
                      Không có học kỳ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="icon" />
              </button>

              <span className="pagination-info">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="icon" />
              </button>
            </div>
          )}
        </>
      )}

      <ModalDeleteHocKy
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        hocKyName={
          hocKys.find((h) => h.MaHocKy === hocKyToDelete)?.TenHocKy || ""
        }
      />

      <ModalEditHocKy
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        hocKy={hocKyToEdit}
        onSuccess={handleEditSuccess}
        showToast={() => {}} // không dùng toast
      />

      <ModalDetailHocKy
        show={showDetailModal}
        hocKy={selectedHocKy}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditHocKy}
      />
    </div>
  );
};

export default QuanLyHocKy;
