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
  Users,
  GraduationCap,
} from "lucide-react";
import "../css/QuanLyLop.css";
import ModalDeleteLop from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyLop/modal-delete-lop";
import ActionButtonsLop from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyLop/action-buttons-lop";
import ModalEditLop from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyLop/modal-edit-lop";
import ModalDetailLop from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyLop/modal-detail-lop";
import TaoLopForm from "../../../../components/Admin/QuanLyLopVaHocKy/QuanLyLop/tao-lop-form";
import Notification from "./Notification"; // import Notification thay vì Toast
import { ApiService } from "../../../../untils/services/service-api";

interface LopDTO {
  MaLop: string;
  TenLop: string;
  NienKhoa: string;
  MaGv: string;
  SoSinhVien?: number;
  TenGiangVien?: string;
}

interface GiangVien {
  MaGv: string;
  HoTen: string;
  Email: string;
  Khoa: string;
}

const pageSize = 10;

const QuanLyLop: React.FC = () => {
  // State cho danh sách lớp
  const [lops, setLops] = useState<LopDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);

  // State cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterNienKhoa, setFilterNienKhoa] = useState<string>("all");
  const [filterGiangVien, setFilterGiangVien] = useState<string>("all");
  const [giangViens, setGiangViens] = useState<GiangVien[]>([]);

  // State cho modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [lopToDelete, setLopToDelete] = useState<string | null>(null);

  // State cho modal edit
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [lopToEdit, setLopToEdit] = useState<LopDTO | null>(null);

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedLop, setSelectedLop] = useState<LopDTO | null>(null);

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
    fetchLops();
    fetchGiangViens();
  }, []);

  const fetchLops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachLop();
      setLops(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách lớp:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Không thể tải danh sách lớp. Vui lòng thử lại sau.";
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

  const fetchGiangViens = async () => {
    try {
      const data = await ApiService.layDanhSachGiaoVien();
      setGiangViens(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách giảng viên:", err);
    }
  };

  // Filter + search
  const filteredLops = lops.filter(
    (lop) =>
      (filterNienKhoa === "all" || lop.NienKhoa === filterNienKhoa) &&
      (filterGiangVien === "all" || lop.MaGv === filterGiangVien) &&
      (searchTerm === "" ||
        lop.TenLop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lop.MaLop.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Phân trang
  const totalPages = Math.ceil(filteredLops.length / pageSize);
  const pagedLops = filteredLops.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset currentPage nếu lọc mà không còn trang hiện tại
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filterNienKhoa, filterGiangVien, searchTerm, totalPages, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterNienKhoaChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterNienKhoa(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterGiangVienChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterGiangVien(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const confirmDelete = (maLop: string) => {
    setLopToDelete(maLop);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!lopToDelete) return;
    try {
      await ApiService.xoaLop(lopToDelete);
      setNotification({
        show: true,
        type: "success",
        message: "Xóa lớp thành công!",
      });
      fetchLops();
    } catch (err: any) {
      console.error("Lỗi khi xóa lớp:", err);
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Không thể xóa lớp. Vui lòng thử lại sau.",
      });
    } finally {
      setShowDeleteModal(false);
      setLopToDelete(null);
    }
  };

  const handleViewDetail = (lop: LopDTO) => {
    setSelectedLop(lop);
    setShowDetailModal(true);
  };

  const handleCreateClass = () => {
    setShowCreateForm(true);
  };

  const handleEditClass = async (maLop: string) => {
    try {
      const lop = await ApiService.layChiTietLop(maLop);
      setLopToEdit(lop);
      setShowEditModal(true);
    } catch (err) {
      console.error(`Lỗi khi lấy chi tiết lớp ${maLop}:`, err);
      setNotification({
        show: true,
        type: "error",
        message: "Không thể lấy chi tiết lớp. Vui lòng thử lại sau.",
      });
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setLopToEdit(null);
    fetchLops();
    setNotification({
      show: true,
      type: "success",
      message: "Cập nhật lớp thành công!",
    });
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchLops();
    setNotification({
      show: true,
      type: "success",
      message: "Tạo lớp thành công!",
    });
  };

  const handleRefresh = () => {
    fetchLops();
    setNotification({
      show: true,
      type: "info",
      message: "Dữ liệu đã được làm mới!",
    });
  };

  const getGiangVienName = (maGv: string) => {
    const gv = giangViens.find((g) => g.MaGv === maGv);
    return gv ? gv.HoTen : maGv;
  };

  const getNienKhoaList = () => {
    // Lọc ra các niên khóa duy nhất và loại bỏ giá trị null/undefined
    const nienKhoas = Array.from(
      new Set(lops.map((lop) => lop.NienKhoa).filter(Boolean))
    );
    return nienKhoas.sort();
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  if (showCreateForm) {
    return (
      <TaoLopForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreateForm(false)}
        giangViens={giangViens}
        showToast={() => {}} // không dùng toast nữa
      />
    );
  }

  return (
    <div className="quan-ly-lop-container">
      <div className="quan-ly-lop-header">
        <h2>
          <GraduationCap className="icon-xl" />
          Quản lý lớp học
        </h2>
        <button className="btn-create" onClick={handleCreateClass}>
          <Plus className="icon" />
          Tạo lớp mới
        </button>
      </div>

      <div className="quan-ly-lop-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm lớp..."
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
              value={filterNienKhoa}
              onChange={handleFilterNienKhoaChange}
              className="filter-select"
            >
              <option value="all">Tất cả niên khóa</option>
              {getNienKhoaList().map((nienKhoa) => (
                <option key={nienKhoa} value={nienKhoa}>
                  {nienKhoa}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Users className="icon" />
            <select
              value={filterGiangVien}
              onChange={handleFilterGiangVienChange}
              className="filter-select"
            >
              <option value="all">Tất cả giảng viên</option>
              {giangViens.map((gv) => (
                <option key={gv.MaGv} value={gv.MaGv}>
                  {gv.HoTen}
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
                  <th>Mã lớp</th>
                  <th>Tên lớp</th>
                  <th>Niên khóa</th>
                  <th>Giảng viên</th>
                  <th>Số sinh viên</th>
                  <th style={{ textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedLops.length > 0 ? (
                  pagedLops.map((lop) => (
                    <tr key={lop.MaLop}>
                      <td style={{ fontWeight: 500 }}>{lop.MaLop}</td>
                      <td className="lop-name">{lop.TenLop}</td>
                      <td>
                        <span className="status-badge">{lop.NienKhoa}</span>
                      </td>
                      <td>{getGiangVienName(lop.MaGv)}</td>
                      <td>
                        <div className="student-count">
                          <Users className="icon" />
                          <span>{lop.SoSinhVien || 0}</span>
                        </div>
                      </td>
                      <td>
                        <ActionButtonsLop
                          onView={() => handleViewDetail(lop)}
                          onEdit={() => handleEditClass(lop.MaLop)}
                          onDelete={() => confirmDelete(lop.MaLop)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-data">
                      Không có lớp nào
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

      <ModalDeleteLop
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        lopName={lops.find((l) => l.MaLop === lopToDelete)?.TenLop || ""}
      />

      <ModalEditLop
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        lop={lopToEdit}
        giangViens={giangViens}
        onSuccess={handleEditSuccess}
        showToast={() => {}}
      />

      <ModalDetailLop
        show={showDetailModal}
        lop={selectedLop}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditClass}
        giangViens={giangViens}
      />
    </div>
  );
};

export default QuanLyLop;
