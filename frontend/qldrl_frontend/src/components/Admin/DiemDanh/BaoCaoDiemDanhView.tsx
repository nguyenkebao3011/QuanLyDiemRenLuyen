import React from "react";
import { Download, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { BaoCaoDiemDanh } from "../types";

interface BaoCaoDiemDanhViewProps {
  baoCaoDiemDanh: BaoCaoDiemDanh | null;
  loadingBaoCao: boolean;
  exportToExcel: () => void;
}

const BaoCaoDiemDanhView: React.FC<BaoCaoDiemDanhViewProps> = ({
  baoCaoDiemDanh,
  loadingBaoCao,
  exportToExcel,
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

  return (
    <div>
      <button
        className="btn btn-outline export-btn"
        onClick={exportToExcel}
        disabled={!baoCaoDiemDanh || loadingBaoCao}
      >
        <Download className="btn-icon" />
        Xuất Excel
      </button>

      {loadingBaoCao ? (
        <div className="skeleton-container">
          <div className="skeleton-line" style={{ height: "80px" }}></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      ) : baoCaoDiemDanh ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3 className="stat-title">Tổng số sinh viên</h3>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {baoCaoDiemDanh.ThongKe.TongSoSinhVien}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3 className="stat-title">Đã điểm danh</h3>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {baoCaoDiemDanh.ThongKe.SoLuongDiemDanh}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <h3 className="stat-title">Tỷ lệ điểm danh</h3>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {baoCaoDiemDanh.ThongKe.TiLeDiemDanh.toFixed(1)}%
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${baoCaoDiemDanh.ThongKe.TiLeDiemDanh}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Lớp</th>
                  <th>Trạng thái</th>
                  <th>Thời gian điểm danh</th>
                  <th>Người điểm danh</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {baoCaoDiemDanh.DanhSachDiemDanh.map((sv, index) => (
                  <tr key={index}>
                    <td>{sv.MaSv}</td>
                    <td className="font-medium">
                      {sv.HoTen || "Không có tên"}
                    </td>
                    <td>{sv.Lop || "Không có lớp"}</td>
                    <td>
                      {sv.DaDiemDanh ? (
                        <span className="badge badge-green">Đã điểm danh</span>
                      ) : (
                        <span className="badge badge-yellow">
                          Chưa điểm danh
                        </span>
                      )}
                    </td>
                    <td>
                      {sv.ThoiGianDiemDanh
                        ? formatDate(sv.ThoiGianDiemDanh)
                        : "-"}
                    </td>
                    <td>{sv.NguoiDiemDanh || "-"}</td>
                    <td>{sv.GhiChu || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <p>Chưa có dữ liệu báo cáo</p>
        </div>
      )}
    </div>
  );
};

export default BaoCaoDiemDanhView;
