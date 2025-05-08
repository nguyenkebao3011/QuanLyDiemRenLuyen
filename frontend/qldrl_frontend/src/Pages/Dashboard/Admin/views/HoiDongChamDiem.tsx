"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { ApiService } from "../../../../untils/services/service-api";
import {
  AlertCircle,
  X,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import HoiDongList from "../../../../components/Admin/HoiDongChamDiem/HoiDongList";
import HoiDongDetail from "../../../../components/Admin/HoiDongChamDiem/HoiDongDetail";
import CreateHoiDongForm from "../../../../components/Admin/HoiDongChamDiem/CreateHoiDongForm";
import AddThanhVienForm from "../../../../components/Admin/HoiDongChamDiem/AddThanhVienForm";
import type {
  HoiDongChamDiemDTO,
  HoiDongChamDiemDetailDTO,
  GiaoVien,
} from "../../../../components/Admin/types";
import "../css/HoiDongChamDiem.css";
import "../css/notification.css";

// Add pageSize constant at the top of the file, after imports
const pageSize = 10;

const Notification = ({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}) => {
  return (
    <div className="notification-overlay">
      <div className={`notification-container notification-${type}`}>
        <div className="notification-icon">
          {type === "success" && (
            <CheckCircle2 className="text-green-500" size={24} />
          )}
          {type === "error" && (
            <AlertCircle className="text-red-500" size={24} />
          )}
          {type === "info" && <Info className="text-blue-500" size={24} />}
        </div>
        <div className="notification-content">
          <p>{message}</p>
        </div>
        <button className="notification-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const HoiDongChamDiem: React.FC = () => {
  // State cho danh sách hội đồng
  const [hoiDongs, setHoiDongs] = useState<HoiDongChamDiemDTO[]>([]);
  const [filteredHoiDongs, setFilteredHoiDongs] = useState<
    HoiDongChamDiemDTO[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // State cho chi tiết hội đồng
  const [selectedHoiDong, setSelectedHoiDong] = useState<number | null>(null);
  const [hoiDongDetail, setHoiDongDetail] =
    useState<HoiDongChamDiemDetailDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Thêm để buộc re-render

  // State cho form tạo hội đồng
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  // State cho form thêm thành viên
  const [isAddMemberFormOpen, setIsAddMemberFormOpen] = useState(false);

  // State cho xác nhận xóa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<number | null>(null);
  const [isDeleteMember, setIsDeleteMember] = useState(false);

  // State cho danh sách giáo viên (để thêm thành viên)
  const [giaoViens, setGiaoViens] = useState<GiaoVien[]>([]);
  const [loadingGiaoViens, setLoadingGiaoViens] = useState(false);

  // Add these state variables inside the component (with the other state variables)
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Add currentPage state in the component state declarations
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy danh sách hội đồng
  const fetchHoiDongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.layDanhSachHoiDong();
      setHoiDongs(data);
      setFilteredHoiDongs(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách hội đồng:", err);
      setError("Không thể tải danh sách hội đồng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy chi tiết hội đồng
  const fetchHoiDongDetail = useCallback(async (id: number) => {
    setLoadingDetail(true);
    try {
      // Thêm delay nhỏ để đảm bảo API cập nhật dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = await ApiService.layChiTietHoiDong(id);
      console.log("Dữ liệu chi tiết hội đồng:", data);
      if (data) {
        setHoiDongDetail({
          MaHoiDong: data.MaHoiDong ?? 0,
          TenHoiDong: data.TenHoiDong ?? "",
          MaHocKy: data.MaHocKy ?? 0,
          TenHocKy: data.TenHocKy ?? "",
          NgayThanhLap: data.NgayThanhLap ?? "",
          GhiChu: data.GhiChu ?? "",
          ThanhViens: data.ThanhViens || [],
        });
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết hội đồng:", err);
      setError("Không thể tải chi tiết hội đồng. Vui lòng thử lại sau.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Lấy danh sách giáo viên
  const fetchGiaoViens = useCallback(async () => {
    setLoadingGiaoViens(true);
    try {
      const data = await ApiService.layDanhSachGiaoVien();
      setGiaoViens(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách giáo viên:", err);
    } finally {
      setLoadingGiaoViens(false);
    }
  }, []);

  // Tìm kiếm hội đồng
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);

      if (!term.trim()) {
        setFilteredHoiDongs(hoiDongs);
        return;
      }

      const filtered = hoiDongs.filter(
        (hoiDong) =>
          hoiDong.TenHoiDong.toLowerCase().includes(term.toLowerCase()) ||
          hoiDong.TenHocKy?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredHoiDongs(filtered);
    },
    [hoiDongs]
  );

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHoiDongs();
    if (selectedHoiDong) {
      await fetchHoiDongDetail(selectedHoiDong);
    }
    setRefreshing(false);
  };

  // Xem chi tiết hội đồng
  const handleViewDetail = (id: number) => {
    setSelectedHoiDong(id);
    fetchHoiDongDetail(id);
  };

  // Đóng chi tiết hội đồng
  const handleCloseDetail = () => {
    setSelectedHoiDong(null);
    setHoiDongDetail(null);
  };

  // Replace the handleAddMember function with this updated version
  const handleAddMember = async (data: any) => {
    if (!selectedHoiDong) return false;

    try {
      // Make the API call
      await ApiService.themThanhVien(selectedHoiDong, data);

      // Close the form
      setIsAddMemberFormOpen(false);

      // Show success notification
      setNotification({
        show: true,
        message: "Thêm thành viên hội đồng thành công!",
        type: "success",
      });

      // Refresh the committee details
      await fetchHoiDongDetail(selectedHoiDong);

      return true;
    } catch (err: any) {
      console.error("Lỗi khi thêm thành viên:", err);

      // Extract error message
      let errorMessage = "Không thể thêm thành viên. Vui lòng thử lại sau.";

      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Show error notification
      setNotification({
        show: true,
        message: `Lỗi: ${errorMessage}`,
        type: "error",
      });

      return false;
    }
  };

  // Update the handleCreateHoiDong function to use the notification system
  const handleCreateHoiDong = async (data: any) => {
    try {
      await ApiService.taoHoiDong(data);
      setIsCreateFormOpen(false);
      fetchHoiDongs();
      setNotification({
        show: true,
        message: "Tạo hội đồng thành công!",
        type: "success",
      });
      return true;
    } catch (err: any) {
      console.error("Lỗi khi tạo hội đồng:", err);

      let errorMessage = "Không thể tạo hội đồng. Vui lòng thử lại sau.";

      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setNotification({
        show: true,
        message: `Lỗi: ${errorMessage}`,
        type: "error",
      });
      return false;
    }
  };

  // Xác nhận xóa hội đồng
  const confirmDeleteHoiDong = (id: number) => {
    setDeleteId(id);
    setIsDeleteMember(false);
    setShowDeleteConfirm(true);
  };

  // Xác nhận xóa thành viên
  const confirmDeleteThanhVien = (id: number) => {
    setDeleteMemberId(id);
    setIsDeleteMember(true);
    setShowDeleteConfirm(true);
  };

  // Also update the handleConfirmDelete function to use the notification system
  const handleConfirmDelete = async () => {
    try {
      if (isDeleteMember && deleteMemberId) {
        await ApiService.xoaThanhVien(deleteMemberId);
        if (selectedHoiDong) {
          await fetchHoiDongDetail(selectedHoiDong);
        }
        setNotification({
          show: true,
          message: "Xóa thành viên thành công!",
          type: "success",
        });
      } else if (deleteId) {
        await ApiService.xoaHoiDong(deleteId);
        fetchHoiDongs();
        if (selectedHoiDong === deleteId) {
          setSelectedHoiDong(null);
          setHoiDongDetail(null);
        }
        setNotification({
          show: true,
          message: "Xóa hội đồng thành công!",
          type: "success",
        });
      }
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error("Lỗi khi xóa:", err);
      let errorMessage = "Không thể xóa. Vui lòng thử lại sau.";

      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setNotification({
        show: true,
        message: `Lỗi: ${errorMessage}`,
        type: "error",
      });
      setShowDeleteConfirm(false);
    }
  };

  // Hủy xóa
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
    setDeleteMemberId(null);
    setIsDeleteMember(false);
  };

  // Mở form thêm thành viên
  const handleOpenAddMemberForm = () => {
    fetchGiaoViens();
    setIsAddMemberFormOpen(true);
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchHoiDongs();
  }, [fetchHoiDongs]);

  // Add useEffect to reset currentPage when filters change
  // Add this after the useEffect for loading data:
  useEffect(() => {
    const totalPages = Math.ceil(filteredHoiDongs.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredHoiDongs.length, currentPage]);

  // Add a function to close the notification
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return (
    <div className="hoi-dong-management-container">
      <div className="hoi-dong-header">
        <h1>Quản lý hội đồng chấm điểm</h1>
        <p className="header-description">
          Quản lý hội đồng chấm điểm rèn luyện cho sinh viên
        </p>
      </div>

      {selectedHoiDong && hoiDongDetail ? (
        <HoiDongDetail
          hoiDong={hoiDongDetail}
          loading={loadingDetail}
          onBack={handleCloseDetail}
          onAddMember={handleOpenAddMemberForm}
          onDeleteMember={confirmDeleteThanhVien}
          onDeleteHoiDong={confirmDeleteHoiDong}
          refreshKey={refreshKey}
        />
      ) : (
        <>
          <HoiDongList
            hoiDongs={filteredHoiDongs.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onCreateNew={() => setIsCreateFormOpen(true)}
            onView={handleViewDetail}
            onDelete={confirmDeleteHoiDong}
          />

          {filteredHoiDongs.length > pageSize && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="pagination-info">
                Trang {currentPage} /{" "}
                {Math.ceil(filteredHoiDongs.length / pageSize)}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredHoiDongs.length / pageSize)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(filteredHoiDongs.length / pageSize)
                }
                className="pagination-button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Form tạo hội đồng */}
      {isCreateFormOpen && (
        <CreateHoiDongForm
          isOpen={isCreateFormOpen}
          onClose={() => setIsCreateFormOpen(false)}
          onSubmit={handleCreateHoiDong}
        />
      )}

      {/* Form thêm thành viên */}
      {isAddMemberFormOpen && (
        <AddThanhVienForm
          isOpen={isAddMemberFormOpen}
          onClose={() => setIsAddMemberFormOpen(false)}
          onSubmit={handleAddMember}
          giaoViens={giaoViens}
          loading={loadingGiaoViens}
        />
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
              <button className="modal-close" onClick={handleCancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content confirm">
              <AlertCircle className="warning-icon" />
              <p>
                {isDeleteMember
                  ? "Bạn có chắc chắn muốn xóa thành viên này khỏi hội đồng không?"
                  : "Bạn có chắc chắn muốn xóa hội đồng này không?"}
              </p>
              <p className="warning-text">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={handleCancelDelete}>
                Hủy
              </button>
              <button className="btn-submit" onClick={handleConfirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
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

export default HoiDongChamDiem;
