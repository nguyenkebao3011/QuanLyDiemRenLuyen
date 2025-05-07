import { Users, GraduationCap, Calendar, MessageSquare } from "lucide-react";
import type { TongQuanThongKeDTO } from "../types";

interface OverviewStatsProps {
  stats: TongQuanThongKeDTO | null;
  loading: boolean;
  error: string | null;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({
  stats,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="overview-stats-container loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thống kê tổng quan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overview-stats-container error">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="overview-stats-container empty">
        <p>Không có dữ liệu thống kê</p>
      </div>
    );
  }

  return (
    <div className="overview-stats-container">
      <div className="overview-card">
        <div className="overview-icon student">
          <Users size={24} />
        </div>
        <div className="overview-content">
          <h3 className="overview-value">
            {stats.TongSinhVien.toLocaleString()}
          </h3>
          <p className="overview-label">Sinh viên</p>
        </div>
      </div>

      <div className="overview-card">
        <div className="overview-icon teacher">
          <GraduationCap size={24} />
        </div>
        <div className="overview-content">
          <h3 className="overview-value">
            {stats.TongGiangVien.toLocaleString()}
          </h3>
          <p className="overview-label">Giảng viên</p>
        </div>
      </div>

      <div className="overview-card">
        <div className="overview-icon activity">
          <Calendar size={24} />
        </div>
        <div className="overview-content">
          <h3 className="overview-value">
            {stats.TongHoatDong.toLocaleString()}
          </h3>
          <p className="overview-label">Hoạt động</p>
        </div>
      </div>

      <div className="overview-card">
        <div className="overview-icon feedback">
          <MessageSquare size={24} />
        </div>
        <div className="overview-content">
          <h3 className="overview-value">
            {stats.TongPhanHoi.toLocaleString()}
          </h3>
          <p className="overview-label">Phản hồi</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewStats;
