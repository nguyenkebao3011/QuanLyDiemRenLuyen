import type React from "react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Users,
  UserPlus,
  Trash,
} from "lucide-react";
import type { HoiDongChamDiemDetailDTO } from "../types";

interface HoiDongDetailProps {
  hoiDong: HoiDongChamDiemDetailDTO;
  loading: boolean;
  onBack: () => void;
  onAddMember: () => void;
  onDeleteMember: (id: number) => void;
  onDeleteHoiDong: (id: number) => void;
  refreshKey: number; // Thêm prop để buộc re-render
}

const HoiDongDetail: React.FC<HoiDongDetailProps> = ({
  hoiDong,
  loading,
  onBack,
  onAddMember,
  onDeleteMember,
  onDeleteHoiDong,
  refreshKey,
}) => {
  console.log("Danh sách thành viên:", hoiDong.ThanhViens); // Logging để debug

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="hoi-dong-detail-container loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin hội đồng...</p>
      </div>
    );
  }

  // Render role badge with appropriate styling
  const renderRoleBadge = (role: string | null | undefined) => {
    if (!role)
      return <span className="member-role member-role-member">Thành viên</span>;

    const roleLower = role.toLowerCase();
    if (roleLower.includes("chủ tịch") || roleLower.includes("chu tich")) {
      return <span className="member-role member-role-chairman">{role}</span>;
    } else if (roleLower.includes("thư ký") || roleLower.includes("thu ky")) {
      return <span className="member-role member-role-secretary">{role}</span>;
    } else {
      return <span className="member-role member-role-member">{role}</span>;
    }
  };

  return (
    <div className="hoi-dong-detail-container" key={refreshKey}>
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
        <h2>Chi tiết hội đồng chấm điểm</h2>
        <button
          className="btn-delete"
          onClick={() => onDeleteHoiDong(hoiDong.MaHoiDong)}
          title="Xóa hội đồng"
        >
          <Trash size={16} />
          <span>Xóa hội đồng</span>
        </button>
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h3>Thông tin cơ bản</h3>
          <div className="info-grid">
            <div className="info-item">
              <FileText className="info-icon" />
              <div className="info-content">
                <span className="info-label">Mã hội đồng:</span>
                <span className="info-value">{hoiDong.MaHoiDong}</span>
              </div>
            </div>
            <div className="info-item">
              <FileText className="info-icon" />
              <div className="info-content">
                <span className="info-label">Tên hội đồng:</span>
                <span className="info-value">{hoiDong.TenHoiDong}</span>
              </div>
            </div>
            <div className="info-item">
              <Calendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Học kỳ:</span>
                <span className="info-value">{hoiDong.TenHocKy || "N/A"}</span>
              </div>
            </div>
            <div className="info-item">
              <Calendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Ngày thành lập:</span>
                <span className="info-value">
                  {formatDate(hoiDong.NgayThanhLap)}
                </span>
              </div>
            </div>
          </div>

          {hoiDong.GhiChu && (
            <div className="info-item" style={{ marginTop: "16px" }}>
              <FileText className="info-icon" />
              <div className="info-content">
                <span className="info-label">Ghi chú:</span>
                <span className="info-value">{hoiDong.GhiChu}</span>
              </div>
            </div>
          )}
        </div>

        <div className="thanh-vien-section">
          <div className="thanh-vien-header">
            <h3>
              <Users
                size={20}
                className="mr-2"
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              Danh sách thành viên
            </h3>
            <button className="btn-add-member" onClick={onAddMember}>
              <UserPlus size={16} />
              <span>Thêm thành viên</span>
            </button>
          </div>

          <div className="thanh-vien-table-container">
            <table className="thanh-vien-table">
              <thead>
                <tr>
                  <th>Mã GV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò trong hội đồng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {hoiDong.ThanhViens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-data">
                      Chưa có thành viên nào trong hội đồng
                    </td>
                  </tr>
                ) : (
                  hoiDong.ThanhViens.map((thanhVien) => (
                    <tr key={thanhVien.MaThanhVien}>
                      <td>{thanhVien.MaGv || "N/A"}</td>
                      <td>{thanhVien.HoTen || "N/A"}</td>
                      <td>{thanhVien.Email || "N/A"}</td>
                      <td>{renderRoleBadge(thanhVien.VaiTroTrongHoiDong)}</td>
                      <td>
                        <div className="member-actions">
                          <button
                            className="member-action-btn member-delete-btn"
                            onClick={() =>
                              onDeleteMember(thanhVien.MaThanhVien)
                            }
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoiDongDetail;
