import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { ApiService } from "../../../../untils/services/service-api";
import ThongBaoList from "../../../../components/Admin/ThongBao/ThongBaoList";
import ThongBaoDetail from "../../../../components/Admin/ThongBao/ThongBaoDetail";
import CreateThongBaoModal from "../../../../components/Admin/ThongBao/CreateThongBaoModal";
import ThongBaoStats from "../../../../components/Admin/ThongBao/ThongBaoStats";
import type {
  ThongBaoDTO,
  ThongBaoChiTietDTO,
} from "../../../../components/Admin/types";
import "../css/ThongBaoDiemDanh.css";
import type { QuanLyKhoa } from "../../../../components/Admin/types";

const ThongBaoManagement: React.FC = () => {
  // State cho danh sách thông báo
  const [thongBaos, setThongBaos] = useState<ThongBaoDTO[]>([]);
  const [filteredThongBaos, setFilteredThongBaos] = useState<ThongBaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoaiThongBao, setSelectedLoaiThongBao] = useState("all");

  // State cho chi tiết thông báo
  const [selectedThongBao, setSelectedThongBao] = useState<number | null>(null);
  const [thongBaoDetail, setThongBaoDetail] =
    useState<ThongBaoChiTietDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State cho modal tạo thông báo
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State cho thống kê
  const [stats, setStats] = useState({
    totalThongBao: 0,
    totalViews: 0,
    totalReaders: 0,
    unreadCount: 0,
  });

  // State cho quản lý khoa
  const [quanLyKhoa, setQuanLyKhoa] = useState<QuanLyKhoa | null>(null);
  const [maQl, setMaQl] = useState<string>("QL02"); // Mã mặc định

  // Lấy thông tin quản lý khoa
  const fetchQuanLyKhoa = useCallback(async () => {
    try {
      const qlKhoaData = await ApiService.thongTinQuanLyKhoa();
      setQuanLyKhoa(qlKhoaData);
      setMaQl(qlKhoaData.MaQl);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin quản lý khoa:", error);
    }
  }, []);

  // Gọi API lấy thông tin quản lý khi component mount
  useEffect(() => {
    fetchQuanLyKhoa();
  }, [fetchQuanLyKhoa]);

  // Lấy danh sách thông báo
  const fetchThongBaos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachThongBao();
      setThongBaos(data);
      setFilteredThongBaos(data);

      // Cập nhật thống kê
      const totalViews = data.reduce((sum, item) => sum + item.SoLuotXem, 0);
      const uniqueReaders = new Set();
      data.forEach((item) => {
        // Giả định rằng mỗi lượt xem là một người đọc duy nhất
        uniqueReaders.add(item.SoLuotXem > 0 ? item.MaThongBao : null);
      });

      setStats({
        totalThongBao: data.length,
        totalViews,
        totalReaders: uniqueReaders.size - (uniqueReaders.has(null) ? 1 : 0),
        unreadCount: data.filter((item) => item.SoLuotXem === 0).length,
      });
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thông báo:", err);
      setError("Không thể tải danh sách thông báo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy chi tiết thông báo
  const fetchThongBaoDetail = useCallback(async (maThongBao: number) => {
    setLoadingDetail(true);
    try {
      const data = await ApiService.layChiTietThongBao(maThongBao);
      setThongBaoDetail(data);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết thông báo:", err);
      setError("Không thể tải chi tiết thông báo. Vui lòng thử lại sau.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Tìm kiếm thông báo
  const handleSearch = useCallback(
    async (term: string) => {
      setSearchTerm(term);

      if (term.trim() === "") {
        // Nếu từ khóa trống, áp dụng lọc theo loại
        filterByLoaiThongBao(selectedLoaiThongBao);
        return;
      }

      try {
        if (term.length >= 3) {
          // Nếu từ khóa đủ dài, gọi API tìm kiếm
          const data = await ApiService.timKiemThongBao(term);

          // Áp dụng lọc theo loại cho kết quả tìm kiếm
          if (selectedLoaiThongBao !== "all") {
            const filtered = data.filter(
              (item) =>
                item.LoaiThongBao.toLowerCase() ===
                selectedLoaiThongBao.toLowerCase()
            );
            setFilteredThongBaos(filtered);
          } else {
            setFilteredThongBaos(data);
          }
        } else {
          // Nếu từ khóa ngắn, tìm kiếm cục bộ
          const filtered = thongBaos.filter(
            (item) =>
              item.TieuDe.toLowerCase().includes(term.toLowerCase()) ||
              (item.NoiDung &&
                item.NoiDung.toLowerCase().includes(term.toLowerCase()))
          );

          // Áp dụng lọc theo loại
          if (selectedLoaiThongBao !== "all") {
            const furtherFiltered = filtered.filter(
              (item: ThongBaoDTO) =>
                item.LoaiThongBao.toLowerCase() ===
                selectedLoaiThongBao.toLowerCase()
            );
            setFilteredThongBaos(furtherFiltered);
          } else {
            setFilteredThongBaos(filtered);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tìm kiếm thông báo:", err);
        // Nếu API lỗi, tìm kiếm cục bộ
        const filtered = thongBaos.filter(
          (item) =>
            item.TieuDe.toLowerCase().includes(term.toLowerCase()) ||
            (item.NoiDung &&
              item.NoiDung.toLowerCase().includes(term.toLowerCase()))
        );

        // Áp dụng lọc theo loại
        if (selectedLoaiThongBao !== "all") {
          const furtherFiltered = filtered.filter(
            (item) =>
              item.LoaiThongBao.toLowerCase() ===
              selectedLoaiThongBao.toLowerCase()
          );
          setFilteredThongBaos(furtherFiltered);
        } else {
          setFilteredThongBaos(filtered);
        }
      }
    },
    [thongBaos, selectedLoaiThongBao]
  );

  // Lọc theo loại thông báo
  const filterByLoaiThongBao = useCallback(
    (loaiThongBao: string) => {
      setSelectedLoaiThongBao(loaiThongBao);

      if (loaiThongBao === "all") {
        // Nếu chọn "Tất cả", chỉ áp dụng tìm kiếm
        if (searchTerm.trim() !== "") {
          handleSearch(searchTerm);
        } else {
          setFilteredThongBaos(thongBaos);
        }
      } else {
        // Lọc theo loại thông báo
        const filtered = thongBaos.filter(
          (item: ThongBaoDTO) =>
            item.LoaiThongBao.toLowerCase() === loaiThongBao.toLowerCase()
        );

        // Áp dụng tìm kiếm nếu có
        if (searchTerm.trim() !== "") {
          const furtherFiltered = filtered.filter(
            (item: ThongBaoDTO) =>
              item.TieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (item.NoiDung &&
                item.NoiDung.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          setFilteredThongBaos(furtherFiltered);
        } else {
          setFilteredThongBaos(filtered);
        }
      }
    },
    [thongBaos, searchTerm, handleSearch]
  );

  // Xem chi tiết thông báo
  const handleViewDetail = (maThongBao: number) => {
    setSelectedThongBao(maThongBao);
    fetchThongBaoDetail(maThongBao);
  };

  // Đóng chi tiết thông báo
  const handleCloseDetail = () => {
    setSelectedThongBao(null);
    setThongBaoDetail(null);
  };

  // Mở modal tạo thông báo
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // Đóng modal tạo thông báo
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Xử lý sau khi tạo thông báo thành công
  const handleCreateSuccess = () => {
    fetchThongBaos();
  };

  // Lấy danh sách thông báo khi component mount
  useEffect(() => {
    fetchThongBaos();
  }, [fetchThongBaos]);

  // Cập nhật danh sách lọc khi thay đổi tìm kiếm hoặc loại thông báo
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      handleSearch(searchTerm);
    } else {
      filterByLoaiThongBao(selectedLoaiThongBao);
    }
  }, [searchTerm, selectedLoaiThongBao, handleSearch, filterByLoaiThongBao]);

  return (
    <div className="thong-bao-management-container">
      <div className="thong-bao-header">
        <div className="header-title">
          <h1>Quản lý thông báo</h1>
          <p className="header-description">
            Quản lý và theo dõi thông báo điểm danh hoạt động
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-create-thong-bao"
            onClick={handleOpenCreateModal}
          >
            <Plus className="create-icon" />
            <span>Tạo thông báo mới</span>
          </button>
        </div>
      </div>

      <ThongBaoStats
        totalThongBao={stats.totalThongBao}
        totalViews={stats.totalViews}
        totalReaders={stats.totalReaders}
        unreadCount={stats.unreadCount}
      />

      {selectedThongBao ? (
        <ThongBaoDetail
          thongBao={thongBaoDetail}
          loading={loadingDetail}
          onClose={handleCloseDetail}
          onBack={handleCloseDetail}
        />
      ) : (
        <ThongBaoList
          thongBaos={filteredThongBaos}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          selectedLoaiThongBao={selectedLoaiThongBao}
          onSearchChange={setSearchTerm}
          onLoaiThongBaoChange={filterByLoaiThongBao}
          onRefresh={fetchThongBaos}
          onViewDetail={handleViewDetail}
        />
      )}

      <CreateThongBaoModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
        maQl={maQl}
      />
    </div>
  );
};

export default ThongBaoManagement;
