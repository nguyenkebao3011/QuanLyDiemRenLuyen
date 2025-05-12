import type React from "react";
import { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../css/HoatDongNamHoc.css";
import ModalDeleteHoatDong from "../../../../components/Admin/HoatDong/ModalDeleteHoatDong";
import ActionButtonsHoatDong from "../../../../components/Admin/HoatDong/ActionButtonsHoatDong";
import ModalEditHoatDong from "../../../../components/Admin/HoatDong/ModalEditHoatDong";
import ModalDetailHoatDong from "../../../../components/Admin/HoatDong/ModalDetailHoatDong";
import Notification from "./Notification";
import type {
  HoatDong,
  HocKy,
  QuanLyKhoa,
} from "../../../../components/Admin/types";
import { ApiService } from "../../../../untils/services/service-api";

const pageSize = 10;

const HoatDongNamHoc: React.FC = () => {
  // State cho danh sách hoạt động
  const [hoatDongs, setHoatDongs] = useState<HoatDong[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);

  // State cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("all");
  const [filterHocKy, setFilterHocKy] = useState<number | string>("all");
  const [hocKys, setHocKys] = useState<HocKy[]>([]);

  // State cho modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [hoatDongToDelete, setHoatDongToDelete] = useState<number | null>(null);

  // State cho modal edit
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [hoatDongToEdit, setHoatDongToEdit] = useState<HoatDong | null>(null);

  // State cho thông báo
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const [quanLyKhoa, setQuanLyKhoa] = useState<QuanLyKhoa | null>(null);

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedHoatDong, setSelectedHoatDong] = useState<HoatDong | null>(
    null
  );

  useEffect(() => {
    fetchHoatDongs();
  }, []);

  useEffect(() => {
    fetchHocKys();
    fetchQLKhoa();
  }, []);

  const fetchHoatDongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachHoatDongAll();
      setHoatDongs(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hoạt động:", err);
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as any).response?.data?.message
      ) {
        setError(`Lỗi: ${(err as any).response.data.message}`);
      } else {
        setError("Không thể tải danh sách hoạt động. Vui lòng thử lại sau.");
      }
      setNotification({
        show: true,
        type: "error",
        message:
          (typeof err === "object" &&
            err !== null &&
            "response" in err &&
            (err as any).response?.data?.message) ||
          "Không thể tải danh sách hoạt động. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHocKys = async () => {
    try {
      const data = await ApiService.layDanhSachHocKy();
      setHocKys(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách học kỳ:", err);
      setNotification({
        show: true,
        type: "error",
        message:
          (typeof err === "object" &&
            err !== null &&
            "response" in err &&
            (err as any).response?.data?.message) ||
          "Không thể tải danh sách học kỳ. Vui lòng thử lại sau.",
      });
    }
  };
  const fetchQLKhoa = async () => {
    try {
      const data = await ApiService.thongTinQuanLyKhoa();
      setQuanLyKhoa(data);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin quản lý khoa:", err);
      setNotification({
        show: true,
        type: "error",
        message:
          (typeof err === "object" &&
            err !== null &&
            "response" in err &&
            (err as any).response?.data?.message) ||
          "Không thể tải thông tin quản lý khoa. Vui lòng thử lại sau.",
      });
    }
  };

  // Filter + search
  const filteredHoatDongs = hoatDongs.filter(
    (hd) =>
      (filterTrangThai === "all" || hd.TrangThai === filterTrangThai) &&
      (filterHocKy === "all" || hd.MaHocKy === Number(filterHocKy)) &&
      (searchTerm === "" ||
        hd.TenHoatDong.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Phân trang trên frontend
  const totalPages = Math.ceil(filteredHoatDongs.length / pageSize);
  const pagedHoatDongs = filteredHoatDongs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset currentPage nếu lọc mà không còn trang hiện tại
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line
  }, [filterTrangThai, filterHocKy, searchTerm, totalPages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterTrangThaiChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterTrangThai(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterHocKyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterHocKy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const confirmDelete = (maHoatDong: number) => {
    setHoatDongToDelete(maHoatDong);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!hoatDongToDelete) return;
    try {
      await ApiService.xoaHoatDong(hoatDongToDelete);
      setNotification({
        show: true,
        type: "success",
        message: "Xóa hoạt động thành công!",
      });
      fetchHoatDongs();
    } catch (err) {
      console.error("Lỗi khi xóa hoạt động:", err);
      setNotification({
        show: true,
        type: "error",
        message:
          (typeof err === "object" &&
            err !== null &&
            "response" in err &&
            (err as any).response?.data?.message) ||
          "Không thể xóa hoạt động. Vui lòng thử lại sau.",
      });
    } finally {
      setShowDeleteModal(false);
      setHoatDongToDelete(null);
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleViewDetail = (hoatDong: HoatDong) => {
    setSelectedHoatDong(hoatDong);
    setShowDetailModal(true);
  };

  const handleCreateActivity = () => {
    window.history.pushState(
      {},
      "",
      "/admin/dashboard?menu=activities&view=create"
    );
    window.dispatchEvent(new Event("popstate"));
  };

  const handleEditActivity = (maHoatDong: number) => {
    const hd = hoatDongs.find((h) => h.MaHoatDong === maHoatDong);
    if (hd) {
      setHoatDongToEdit(hd);
      setShowEditModal(true);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setHoatDongToEdit(null);
    fetchHoatDongs();
    setNotification({
      show: true,
      type: "success",
      message: "Cập nhật hoạt động thành công!",
    });
  };

  const handleRefresh = () => {
    fetchHoatDongs();
    setNotification({
      show: true,
      type: "info",
      message: "Dữ liệu đã được làm mới!",
    });
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()} ${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      return "Không xác định";
    }
  };

  const getStatusColor = (trangThai: string) => {
    switch (trangThai) {
      case "Đang mở đăng ký":
        return "status-open";
      case "Đã đóng đăng ký":
        return "status-closed";
      case "Đang diễn ra":
        return "status-ongoing";
      case "Đã kết thúc":
        return "status-completed";
      default:
        return "";
    }
  };

  return (
    <div className="hoat-dong-nam-hoc-container">
      <div className="hoat-dong-header">
        <h2>Quản lý hoạt động năm học</h2>
        <button className="btn-create" onClick={handleCreateActivity}>
          <Plus size={16} /> Tạo hoạt động mới
        </button>
      </div>

      <div className="hoat-dong-filters">
        <form onSubmit={handleSearch} className="search-form">
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

        <div className="filter-container">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterTrangThai}
              onChange={handleFilterTrangThaiChange}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang mở đăng ký">Đang mở đăng ký</option>
              <option value="Đã đóng đăng ký">Đã đóng đăng ký</option>
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={16} />
            <select
              value={filterHocKy}
              onChange={handleFilterHocKyChange}
              className="filter-select"
            >
              <option value="all">Tất cả học kỳ</option>
              {hocKys.map((hocKy) => (
                <option key={hocKy.MaHocKy} value={hocKy.MaHocKy}>
                  {hocKy.TenHocKy} - {hocKy.NamHoc}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-refresh" onClick={handleRefresh}>
            <RefreshCw size={16} /> Làm mới
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
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="hoat-dong-table-container">
            <table className="hoat-dong-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên hoạt động</th>
                  <th>Địa điểm</th>
                  <th>Thời gian</th>
                  <th>Học kỳ</th>
                  <th>Đăng ký</th>
                  <th>Điểm cộng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedHoatDongs.length > 0 ? (
                  pagedHoatDongs.map((hoatDong) => (
                    <tr key={hoatDong.MaHoatDong}>
                      <td>{hoatDong.MaHoatDong}</td>
                      <td className="hoat-dong-name">{hoatDong.TenHoatDong}</td>
                      <td>{hoatDong.DiaDiem}</td>
                      <td>
                        <div className="time-info">
                          <div>
                            Bắt đầu: {formatDateTime(hoatDong.NgayBatDau)}
                          </div>
                          <div>
                            Kết thúc: {formatDateTime(hoatDong.NgayKetThuc)}
                          </div>
                        </div>
                      </td>
                      <td>
                        {hoatDong.MaHocKyNavigation
                          ? `${hoatDong.MaHocKyNavigation.TenHocKy} - ${hoatDong.MaHocKyNavigation.NamHoc}`
                          : `Học kỳ ${hoatDong.MaHocKy}`}
                      </td>
                      <td>
                        <div className="registration-info">
                          <span className="registration-count">
                            {hoatDong.SoLuongDaDangKy || 0}
                          </span>
                          <span className="registration-separator">/</span>
                          <span className="registration-total">
                            {hoatDong.SoLuongToiDa}
                          </span>
                        </div>
                      </td>
                      <td className="diem-cong">{hoatDong.DiemCong}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusColor(
                            hoatDong.TrangThai
                          )}`}
                        >
                          {hoatDong.TrangThai}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <ActionButtonsHoatDong
                          onView={() => handleViewDetail(hoatDong)}
                          onEdit={() => handleEditActivity(hoatDong.MaHoatDong)}
                          onDelete={() => confirmDelete(hoatDong.MaHoatDong)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="no-data">
                      Không có hoạt động nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="pagination-info">
                Trang {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <ModalDeleteHoatDong
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />
      <ModalEditHoatDong
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        hoatDong={hoatDongToEdit}
        hocKys={hocKys}
        quanLyKhoa={quanLyKhoa}
        fetchHocKys={fetchHocKys}
        onSuccess={handleEditSuccess}
      />
      <ModalDetailHoatDong
        show={showDetailModal}
        hoatDong={selectedHoatDong}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditActivity}
        formatDateTime={formatDateTime}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default HoatDongNamHoc;
