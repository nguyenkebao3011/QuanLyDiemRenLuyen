import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { ApiService } from "../../../../untils/services/service-api";
import PhanHoiList from "../../../../components/Admin/PhanHoi/PhanHoiList";
import PhanHoiDetail from "../../../../components/Admin/PhanHoi/PhanHoiDetail";
import PhanHoiProcessForm from "../../../../components/Admin/PhanHoi/PhanHoiProcessForm";
import PhanHoiStats from "../../../../components/Admin/PhanHoi/PhanHoiStats";
import type {
  PhanHoiDiemRenLuyenListDTO,
  PhanHoiDiemRenLuyenDetailDTO,
  XuLyPhanHoiRequest,
} from "../../../../components/Admin/types";
import "../css/PhanHoiDiem.css";

const PhanHoiDiem: React.FC = () => {
  // State cho danh sách phản hồi
  const [phanHois, setPhanHois] = useState<PhanHoiDiemRenLuyenListDTO[]>([]);
  const [filteredPhanHois, setFilteredPhanHois] = useState<
    PhanHoiDiemRenLuyenListDTO[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrangThai, setSelectedTrangThai] = useState("all");

  // State cho chi tiết phản hồi
  const [selectedPhanHoi, setSelectedPhanHoi] = useState<number | null>(null);
  const [phanHoiDetail, setPhanHoiDetail] =
    useState<PhanHoiDiemRenLuyenDetailDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State cho form xử lý phản hồi
  const [isProcessFormOpen, setIsProcessFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // State cho quản lý khoa
  const [maQl, setMaQl] = useState<string>("QL02"); // Mã mặc định

  // State cho xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // State cho thống kê
  const [stats, setStats] = useState({
    totalPhanHoi: 0,
    daXuLy: 0,
    chuaXuLy: 0,
    dangXuLy: 0,
  });

  // Lấy thông tin quản lý khoa
  const fetchQuanLyKhoa = useCallback(async () => {
    try {
      const qlKhoaData = await ApiService.thongTinQuanLyKhoa();
      setMaQl(qlKhoaData.MaQl);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin quản lý khoa:", error);
    }
  }, []);

  // Lấy danh sách phản hồi
  const fetchPhanHois = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachPhanHoi();
      setPhanHois(data);
      setFilteredPhanHois(data);

      // Cập nhật thống kê
      const daXuLy = data.filter(
        (item) => item.TrangThai?.toLowerCase() === "đã xử lý"
      ).length;
      const chuaXuLy = data.filter(
        (item) => item.TrangThai?.toLowerCase() === "chưa xử lý"
      ).length;
      const dangXuLy = data.filter(
        (item) => item.TrangThai?.toLowerCase() === "đang xử lý"
      ).length;

      setStats({
        totalPhanHoi: data.length,
        daXuLy,
        chuaXuLy,
        dangXuLy,
      });
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phản hồi:", err);
      setError("Không thể tải danh sách phản hồi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy chi tiết phản hồi
  const fetchPhanHoiDetail = useCallback(async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await ApiService.layChiTietPhanHoi(id);
      setPhanHoiDetail(data);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết phản hồi:", err);
      setError("Không thể tải chi tiết phản hồi. Vui lòng thử lại sau.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Tìm kiếm phản hồi
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);

      if (!term.trim()) {
        // Nếu không có từ khóa tìm kiếm, áp dụng bộ lọc trạng thái
        filterPhanHois(phanHois, "", selectedTrangThai);
        return;
      }

      filterPhanHois(phanHois, term, selectedTrangThai);
    },
    [phanHois, selectedTrangThai]
  );

  // Lọc theo trạng thái
  const handleTrangThaiChange = useCallback(
    (trangThai: string) => {
      setSelectedTrangThai(trangThai);
      filterPhanHois(phanHois, searchTerm, trangThai);
    },
    [phanHois, searchTerm]
  );

  // Hàm lọc phản hồi
  const filterPhanHois = (
    data: PhanHoiDiemRenLuyenListDTO[],
    term: string,
    trangThai: string
  ) => {
    let filtered = [...data];

    // Lọc theo từ khóa tìm kiếm
    if (term.trim()) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(
        (phanHoi) =>
          (phanHoi.TenSinhVien &&
            phanHoi.TenSinhVien.toLowerCase().includes(lowerTerm)) ||
          (phanHoi.NoiDungPhanHoi &&
            phanHoi.NoiDungPhanHoi.toLowerCase().includes(lowerTerm)) ||
          (phanHoi.MaSv && phanHoi.MaSv.toLowerCase().includes(lowerTerm))
      );
    }

    // Lọc theo trạng thái
    if (trangThai !== "all") {
      filtered = filtered.filter(
        (phanHoi) =>
          phanHoi.TrangThai &&
          phanHoi.TrangThai.toLowerCase() === trangThai.toLowerCase()
      );
    }

    setFilteredPhanHois(filtered);
  };

  // Xem chi tiết phản hồi
  const handleViewDetail = (id: number) => {
    setSelectedPhanHoi(id);
    fetchPhanHoiDetail(id);
  };

  // Đóng chi tiết phản hồi
  const handleCloseDetail = () => {
    setSelectedPhanHoi(null);
    setPhanHoiDetail(null);
  };

  // Mở form xử lý phản hồi
  const handleOpenProcessForm = (id: number) => {
    fetchPhanHoiDetail(id).then(() => {
      setIsProcessFormOpen(true);
      setFormError(null);
    });
  };

  // Đóng form xử lý phản hồi
  const handleCloseProcessForm = () => {
    setIsProcessFormOpen(false);
    setFormError(null);
  };

  // Xử lý phản hồi
  const handleProcessPhanHoi = async (id: number, data: XuLyPhanHoiRequest) => {
    setFormLoading(true);
    setFormError(null);

    try {
      await ApiService.xuLyPhanHoi(id, data);

      // Đóng form và làm mới dữ liệu
      setIsProcessFormOpen(false);
      fetchPhanHois();

      // Nếu đang xem chi tiết, cập nhật lại chi tiết
      if (selectedPhanHoi === id) {
        fetchPhanHoiDetail(id);
      }
    } catch (err) {
      console.error("Lỗi khi xử lý phản hồi:", err);
      setFormError("Không thể xử lý phản hồi. Vui lòng thử lại sau.");
    } finally {
      setFormLoading(false);
    }
  };

  // Xử lý xóa phản hồi
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Xác nhận xóa phản hồi
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await ApiService.xoaPhanHoi(deleteId);
      fetchPhanHois();
      // Nếu đang xem chi tiết phản hồi bị xóa, quay lại danh sách
      if (selectedPhanHoi === deleteId) {
        setSelectedPhanHoi(null);
        setPhanHoiDetail(null);
      }
    } catch (err) {
      console.error("Lỗi khi xóa phản hồi:", err);
      setError("Không thể xóa phản hồi. Vui lòng thử lại sau.");
    }
  };

  // Hủy xóa phản hồi
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchQuanLyKhoa();
    fetchPhanHois();
  }, [fetchQuanLyKhoa, fetchPhanHois]);

  return (
    <div className="phan-hoi-management-container">
      <div className="phan-hoi-header">
        <div className="header-title">
          <h1>Quản lý phản hồi điểm rèn luyện</h1>
          <p className="header-description">
            Quản lý và xử lý phản hồi điểm rèn luyện của sinh viên
          </p>
        </div>
      </div>

      <PhanHoiStats
        totalPhanHoi={stats.totalPhanHoi}
        daXuLy={stats.daXuLy}
        chuaXuLy={stats.chuaXuLy}
        dangXuLy={stats.dangXuLy}
      />

      {selectedPhanHoi ? (
        <PhanHoiDetail
          phanHoi={phanHoiDetail}
          loading={loadingDetail}
          onBack={handleCloseDetail}
          onProcess={handleOpenProcessForm}
        />
      ) : (
        <PhanHoiList
          phanHois={filteredPhanHois}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          selectedTrangThai={selectedTrangThai}
          onSearchChange={handleSearch}
          onTrangThaiChange={handleTrangThaiChange}
          onRefresh={fetchPhanHois}
          onViewDetail={handleViewDetail}
          onProcess={handleOpenProcessForm}
          onDelete={handleDelete}
        />
      )}

      {/* Form xử lý phản hồi */}
      <PhanHoiProcessForm
        isOpen={isProcessFormOpen}
        onClose={handleCloseProcessForm}
        onSubmit={handleProcessPhanHoi}
        phanHoi={phanHoiDetail}
        loading={formLoading}
        error={formError}
        maQl={maQl}
      />

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
            </div>
            <div className="modal-content">
              <AlertCircle className="warning-icon" />
              <p>Bạn có chắc chắn muốn xóa phản hồi này không?</p>
              <p className="warning-text">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Hủy
              </button>
              <button className="btn-delete" onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhanHoiDiem;
