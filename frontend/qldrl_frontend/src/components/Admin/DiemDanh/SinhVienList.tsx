import type React from "react";
import { Search, CheckSquare, CheckCircle, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { DangKyHoatDong } from "../types";

interface SinhVienListProps {
  filteredSinhVien: DangKyHoatDong[];
  loadingSinhVien: boolean;
  searchSinhVien: string;
  selectedLop: string;
  selectedTrangThaiDiemDanh: string;
  uniqueLop: string[];
  selectedSinhVien: number[];
  isSubmitting: boolean;
  setSearchSinhVien: (value: string) => void;
  setSelectedLop: (value: string) => void;
  setSelectedTrangThaiDiemDanh: (value: string) => void;
  setIsDialogOpen: (value: boolean) => void;
  handleSelectAllSinhVien: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectSinhVien: (maDangKy: number, checked: boolean) => void;
  diemDanhSinhVien: (maDangKy: number) => void;
  maQL?: string | null;
}

const SinhVienList: React.FC<SinhVienListProps> = ({
  filteredSinhVien,
  loadingSinhVien,
  searchSinhVien,
  selectedLop,
  selectedTrangThaiDiemDanh,
  uniqueLop,
  selectedSinhVien,
  isSubmitting,
  setSearchSinhVien,
  setSelectedLop,
  setSelectedTrangThaiDiemDanh,
  setIsDialogOpen,
  handleSelectAllSinhVien,
  handleSelectSinhVien,
  diemDanhSinhVien,
  maQL,
}) => {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Kiểm tra nếu có thể điểm danh nhóm
  const canDoGroupAttendance =
    maQL &&
    filteredSinhVien.filter((sv) => !sv.DaDiemDanh).length > 0 &&
    !loadingSinhVien;

  // Kiểm tra nếu có thể điểm danh cá nhân
  const canDoIndividualAttendance = (sv: DangKyHoatDong) =>
    maQL && !sv.DaDiemDanh && !isSubmitting;

  return (
    <div>
      <div className="filter-bar">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên..."
            value={searchSinhVien}
            onChange={(e) => setSearchSinhVien(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            className="select"
            value={selectedLop}
            onChange={(e) => setSelectedLop(e.target.value)}
          >
            <option value="all">Tất cả lớp</option>
            {uniqueLop.map((lop) => (
              <option key={lop} value={lop}>
                {lop}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={selectedTrangThaiDiemDanh}
            onChange={(e) => setSelectedTrangThaiDiemDanh(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="dadiemdanh">Đã điểm danh</option>
            <option value="chuadiemdanh">Chưa điểm danh</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={() => setIsDialogOpen(true)}
            disabled={!canDoGroupAttendance}
            title={!maQL ? "Cần có thông tin quản lý để điểm danh" : ""}
          >
            <CheckSquare className="btn-icon" />
            Điểm danh nhóm
          </button>
        </div>
      </div>

      {!maQL && (
        <div className="warning-message">
          <AlertCircle className="warning-icon" />
          <span>Bạn cần có thông tin quản lý để thực hiện điểm danh</span>
        </div>
      )}

      {loadingSinhVien ? (
        <div className="skeleton-container">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={
                      filteredSinhVien.filter((sv) => !sv.DaDiemDanh).length >
                        0 &&
                      selectedSinhVien.length ===
                        filteredSinhVien.filter((sv) => !sv.DaDiemDanh).length
                    }
                    onChange={handleSelectAllSinhVien}
                    disabled={
                      filteredSinhVien.filter((sv) => !sv.DaDiemDanh).length ===
                        0 || !maQL
                    }
                  />
                </th>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
                <th>Thời gian điểm danh</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSinhVien.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Không có sinh viên nào
                  </td>
                </tr>
              ) : (
                filteredSinhVien.map((sinhVien) => (
                  <tr key={sinhVien.MaDangKy}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedSinhVien.includes(sinhVien.MaDangKy)}
                        onChange={(e) =>
                          handleSelectSinhVien(
                            sinhVien.MaDangKy,
                            e.target.checked
                          )
                        }
                        disabled={sinhVien.DaDiemDanh || !maQL}
                      />
                    </td>
                    <td>{sinhVien.MaSv}</td>
                    <td className="font-medium">{sinhVien.HoTen}</td>
                    <td>{sinhVien.Lop}</td>
                    <td>
                      {sinhVien.DaDiemDanh ? (
                        <span className="badge badge-green">Đã điểm danh</span>
                      ) : (
                        <span className="badge badge-yellow">
                          Chưa điểm danh
                        </span>
                      )}
                    </td>
                    <td>
                      {sinhVien.ThoiGianDiemDanh
                        ? formatDate(sinhVien.ThoiGianDiemDanh)
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => diemDanhSinhVien(sinhVien.MaDangKy)}
                        disabled={!canDoIndividualAttendance(sinhVien)}
                        title={
                          !maQL
                            ? "Cần có thông tin quản lý để điểm danh"
                            : sinhVien.DaDiemDanh
                            ? "Sinh viên đã được điểm danh"
                            : ""
                        }
                      >
                        <CheckCircle className="btn-icon" />
                        Điểm danh
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SinhVienList;
