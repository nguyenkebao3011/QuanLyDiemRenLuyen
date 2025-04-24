import type React from "react";
import { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  Award,
  Download,
} from "lucide-react";
import axios from "axios";
import "../css/HoatDongNamHoc.css";

interface HoatDong {
  MaHoatDong: number;
  TenHoatDong: string;
  MoTa: string;
  DiaDiem: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  SoLuongToiDa: number;
  SoLuongDaDangKy: number;
  DiemCong: number;
  TrangThai: string;
  MaHocKy: number;
  MaQl: string;
  NgayTao: string;
  MaHocKyNavigation?: {
    TenHocKy: string;
    NamHoc: string;
  };
  MaQlNavigation?: {
    HoTen: string;
    Khoa: string;
  };
}

interface HocKy {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
}

const HoatDongNamHoc: React.FC = () => {
  // State cho danh sách hoạt động
  const [hoatDongs, setHoatDongs] = useState<HoatDong[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // State cho bộ lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTrangThai, setFilterTrangThai] = useState<string>("all");
  const [filterHocKy, setFilterHocKy] = useState<number | string>("all");
  const [hocKys, setHocKys] = useState<HocKy[]>([]);

  // State cho modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [hoatDongToDelete, setHoatDongToDelete] = useState<number | null>(null);

  // State cho thông báo
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedHoatDong, setSelectedHoatDong] = useState<HoatDong | null>(
    null
  );

  // Lấy danh sách hoạt động khi component mount hoặc khi các tham số thay đổi
  useEffect(() => {
    fetchHoatDongs();
  }, [currentPage, pageSize, filterTrangThai, filterHocKy]);

  // Lấy danh sách học kỳ khi component mount
  useEffect(() => {
    fetchHocKys();
  }, []);

  // Hàm lấy danh sách hoạt động từ API
  const fetchHoatDongs = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `http://localhost:5163/api/HoatDong/lay_hoat_dong_all`;

      // // Thêm bộ lọc trạng thái nếu có
      // if (filterTrangThai !== "all") {
      //   url = `http://localhost:5163/api/HoatDong/lay_hoat_dong_theo_trang_thai/${filterTrangThai}?pageNumber=${currentPage}&pageSize=${pageSize}`;
      // }

      // // Thêm bộ lọc học kỳ nếu có
      // if (filterHocKy !== "all") {
      //   url = `http://localhost:5163/api/HoatDong/lay_hoat_dong_theo_hoc_ky/${filterHocKy}?pageNumber=${currentPage}&pageSize=${pageSize}`;
      // }

      // // Thêm tìm kiếm nếu có
      // if (searchTerm.trim()) {
      //   url = `http://localhost:5163/api/HoatDong/tim_kiem_hoat_dong?keyword=${encodeURIComponent(
      //     searchTerm
      //   )}&pageNumber=${currentPage}&pageSize=${pageSize}`;
      // }

      const response = await axios.get(url);

      if (response.status === 200) {
        // Nếu response có cấu trúc phân trang
        if (response.data.items) {
          setHoatDongs(response.data.items);
          setTotalPages(response.data.totalPages);
        } else {
          // Nếu response là mảng trực tiếp
          setHoatDongs(response.data);
          setTotalPages(Math.ceil(response.data.length / pageSize));
        }
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách hoạt động:", err);
      setError("Không thể tải danh sách hoạt động. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách học kỳ từ API
  const fetchHocKys = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5163/api/HocKy/lay_hoc_ky"
      );
      if (response.status === 200) {
        setHocKys(response.data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách học kỳ:", err);
    }
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHoatDongs();
  };

  // Hàm xử lý thay đổi bộ lọc trạng thái
  const handleFilterTrangThaiChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterTrangThai(e.target.value);
    setCurrentPage(1);
  };

  // Hàm xử lý thay đổi bộ lọc học kỳ
  const handleFilterHocKyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterHocKy(e.target.value);
    setCurrentPage(1);
  };

  // Hàm xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Hàm xử lý xác nhận xóa hoạt động
  const confirmDelete = (maHoatDong: number) => {
    setHoatDongToDelete(maHoatDong);
    setShowDeleteModal(true);
  };

  // Hàm xử lý xóa hoạt động
  const handleDelete = async () => {
    if (!hoatDongToDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:5163/api/HoatDong/xoa_hoat_dong/${hoatDongToDelete}`
      );

      if (response.status === 200) {
        setNotification({
          type: "success",
          message: "Xóa hoạt động thành công!",
        });
        fetchHoatDongs();
      }
    } catch (err) {
      console.error("Lỗi khi xóa hoạt động:", err);
      setNotification({
        type: "error",
        message: "Không thể xóa hoạt động. Vui lòng thử lại sau.",
      });
    } finally {
      setShowDeleteModal(false);
      setHoatDongToDelete(null);

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Hàm xử lý xem chi tiết hoạt động
  const handleViewDetail = (hoatDong: HoatDong) => {
    setSelectedHoatDong(hoatDong);
    setShowDetailModal(true);
  };

  // Hàm xử lý tạo hoạt động mới
  const handleCreateActivity = () => {
    window.history.pushState(
      {},
      "",
      "/admin/dashboard?menu=activities&view=create"
    );
    window.dispatchEvent(new Event("popstate"));
  };

  // Hàm xử lý chỉnh sửa hoạt động
  const handleEditActivity = (maHoatDong: number) => {
    window.history.pushState(
      {},
      "",
      `/admin/dashboard?menu=activities&view=edit&id=${maHoatDong}`
    );
    window.dispatchEvent(new Event("popstate"));
  };

  // Hàm định dạng ngày giờ
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

  // Hàm lấy màu cho trạng thái
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

          <button className="btn-refresh" onClick={() => fetchHoatDongs()}>
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="close-notification"
          >
            <X size={18} />
          </button>
        </div>
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
                {hoatDongs.length > 0 ? (
                  hoatDongs.map((hoatDong) => (
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
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewDetail(hoatDong)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() =>
                            handleEditActivity(hoatDong.MaHoatDong)
                          }
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => confirmDelete(hoatDong.MaHoatDong)}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
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

      {/* Modal xóa hoạt động */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa hoạt động này không?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button className="btn-confirm" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết hoạt động */}
      {showDetailModal && selectedHoatDong && (
        <div className="modal-overlay">
          <div className="modal-container detail-modal">
            <button
              className="modal-close"
              onClick={() => setShowDetailModal(false)}
            >
              <X size={18} />
            </button>
            <h2>Chi tiết hoạt động</h2>

            <div className="detail-content">
              <div className="detail-header">
                <h3>{selectedHoatDong.TenHoatDong}</h3>
                <span
                  className={`status-badge ${getStatusColor(
                    selectedHoatDong.TrangThai
                  )}`}
                >
                  {selectedHoatDong.TrangThai}
                </span>
              </div>

              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <Calendar size={16} /> Học kỳ
                  </div>
                  <div className="detail-info-value">
                    {selectedHoatDong.MaHocKyNavigation
                      ? `${selectedHoatDong.MaHocKyNavigation.TenHocKy} - ${selectedHoatDong.MaHocKyNavigation.NamHoc}`
                      : `Học kỳ ${selectedHoatDong.MaHocKy}`}
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <Clock size={16} /> Thời gian bắt đầu
                  </div>
                  <div className="detail-info-value">
                    {formatDateTime(selectedHoatDong.NgayBatDau)}
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <Clock size={16} /> Thời gian kết thúc
                  </div>
                  <div className="detail-info-value">
                    {formatDateTime(selectedHoatDong.NgayKetThuc)}
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <MapPin size={16} /> Địa điểm
                  </div>
                  <div className="detail-info-value">
                    {selectedHoatDong.DiaDiem}
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <Users size={16} /> Số lượng đăng ký
                  </div>
                  <div className="detail-info-value">
                    {selectedHoatDong.SoLuongDaDangKy || 0} /{" "}
                    {selectedHoatDong.SoLuongToiDa}
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <Award size={16} /> Điểm cộng
                  </div>
                  <div className="detail-info-value">
                    {selectedHoatDong.DiemCong}
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <FileText size={16} /> Người tạo
                  </div>
                  <div className="detail-info-value">
                    {selectedHoatDong.MaQlNavigation
                      ? `${selectedHoatDong.MaQlNavigation.HoTen} - ${selectedHoatDong.MaQlNavigation.Khoa}`
                      : selectedHoatDong.MaQl}
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-label">
                    <Calendar size={16} /> Ngày tạo
                  </div>
                  <div className="detail-info-value">
                    {formatDateTime(selectedHoatDong.NgayTao)}
                  </div>
                </div>
              </div>

              <div className="detail-description">
                <h4>Mô tả hoạt động</h4>
                <p>{selectedHoatDong.MoTa || "Không có mô tả"}</p>
              </div>

              <div className="detail-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditActivity(selectedHoatDong.MaHoatDong);
                  }}
                >
                  <Edit size={16} /> Chỉnh sửa
                </button>
                <button className="btn-export">
                  <Download size={16} /> Xuất danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoatDongNamHoc;
