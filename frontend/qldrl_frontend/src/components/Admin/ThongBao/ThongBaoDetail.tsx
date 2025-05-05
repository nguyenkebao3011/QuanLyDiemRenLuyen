import type React from "react";
import {
  X,
  Calendar,
  User,
  BookOpen,
  Eye,
  Clock,
  ArrowLeft,
  Download,
  Printer,
} from "lucide-react";
import type { ThongBaoChiTietDTO } from "../types";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface ThongBaoDetailProps {
  thongBao: ThongBaoChiTietDTO | null;
  loading: boolean;
  onClose: () => void;
  onBack: () => void;
}

const ThongBaoDetail: React.FC<ThongBaoDetailProps> = ({
  thongBao,
  loading,
  onClose,
  onBack,
}) => {
  if (loading) {
    return (
      <div className="thong-bao-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin chi tiết...</p>
        </div>
      </div>
    );
  }

  if (!thongBao) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Giả lập chức năng xuất PDF
    alert("Chức năng xuất PDF đang được phát triển");
  };

  return (
    <div className="thong-bao-detail-container">
      <div className="thong-bao-detail-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft className="back-icon" />
          <span>Quay lại</span>
        </button>
        <div className="detail-actions">
          <button className="btn-export" onClick={handleExportPDF}>
            <Download className="export-icon" />
            <span>Xuất PDF</span>
          </button>
          <button className="btn-print" onClick={handlePrint}>
            <Printer className="print-icon" />
            <span>In</span>
          </button>
          <button className="btn-close" onClick={onClose}>
            <X className="close-icon" />
          </button>
        </div>
      </div>

      <div className="thong-bao-detail-content">
        <h1 className="thong-bao-detail-title">{thongBao.TieuDe}</h1>

        <div className="thong-bao-meta">
          <div className="meta-item">
            <Calendar className="meta-icon" />
            <span>Ngày tạo: {formatDate(thongBao.NgayTao)}</span>
          </div>
          <div className="meta-item">
            <User className="meta-icon" />
            <span>Người tạo: {thongBao.TenNguoiTao}</span>
          </div>
          <div className="meta-item">
            <BookOpen className="meta-icon" />
            <span>Loại: {thongBao.LoaiThongBao}</span>
          </div>
          <div className="meta-item">
            <Eye className="meta-icon" />
            <span>Lượt xem: {thongBao.SoLuotXem}</span>
          </div>
        </div>

        <div className="thong-bao-body">
          <div
            className="thong-bao-content"
            dangerouslySetInnerHTML={{ __html: thongBao.NoiDung }}
          />
        </div>

        <div className="thong-bao-readers">
          <h3>
            Danh sách sinh viên đã đọc ({thongBao.DanhSachSinhVienDaDoc.length})
          </h3>

          {thongBao.DanhSachSinhVienDaDoc.length > 0 ? (
            <div className="readers-table-container">
              <table className="readers-table">
                <thead>
                  <tr>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Lớp</th>
                    <th>Thời gian đọc</th>
                  </tr>
                </thead>
                <tbody>
                  {thongBao.DanhSachSinhVienDaDoc.map((sv) => (
                    <tr key={sv.MaSV}>
                      <td>{sv.MaSV}</td>
                      <td>{sv.HoTen}</td>
                      <td>{sv.MaLop}</td>
                      <td>
                        <div className="time-read">
                          <Clock className="time-icon" />
                          {formatDate(sv.NgayDoc)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-readers">
              <p>Chưa có sinh viên nào đọc thông báo này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThongBaoDetail;
