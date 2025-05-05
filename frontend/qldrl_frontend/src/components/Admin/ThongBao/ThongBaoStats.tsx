import type React from "react";
import { Bell, Users, Eye, AlertCircle } from "lucide-react";

interface ThongBaoStatsProps {
  totalThongBao: number;
  totalViews: number;
  totalReaders: number;
  unreadCount: number;
}

const ThongBaoStats: React.FC<ThongBaoStatsProps> = ({
  totalThongBao,
  totalViews,
  totalReaders,
  unreadCount,
}) => {
  return (
    <div className="thong-bao-stats-container">
      <div className="stats-card">
        <div className="stats-icon-container blue">
          <Bell className="stats-icon" />
        </div>
        <div className="stats-content">
          <h3 className="stats-title">Tổng thông báo</h3>
          <p className="stats-value">{totalThongBao}</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon-container green">
          <Eye className="stats-icon" />
        </div>
        <div className="stats-content">
          <h3 className="stats-title">Lượt xem</h3>
          <p className="stats-value">{totalViews}</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon-container purple">
          <Users className="stats-icon" />
        </div>
        <div className="stats-content">
          <h3 className="stats-title">Người đọc</h3>
          <p className="stats-value">{totalReaders}</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon-container orange">
          <AlertCircle className="stats-icon" />
        </div>
        <div className="stats-content">
          <h3 className="stats-title">Chưa đọc</h3>
          <p className="stats-value">{unreadCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ThongBaoStats;
