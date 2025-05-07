import type React from "react";
import { MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import "./phan-hoi.css";

interface PhanHoiStatsProps {
  totalPhanHoi: number;
  daXuLy: number;
  chuaXuLy: number;
  dangXuLy: number;
}

const PhanHoiStats: React.FC<PhanHoiStatsProps> = ({
  totalPhanHoi,
  daXuLy,
  chuaXuLy,
  dangXuLy,
}) => {
  return (
    <div className="phan-hoi-stats-container">
      <div className="stats-card">
        <div className="stats-icon total">
          <MessageSquare size={24} />
        </div>
        <div className="stats-content">
          <h3 className="stats-value">{totalPhanHoi}</h3>
          <p className="stats-label">Tổng số phản hồi</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon processed">
          <CheckCircle size={24} />
        </div>
        <div className="stats-content">
          <h3 className="stats-value">{daXuLy}</h3>
          <p className="stats-label">Đã xử lý</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon pending">
          <AlertCircle size={24} />
        </div>
        <div className="stats-content">
          <h3 className="stats-value">{chuaXuLy}</h3>
          <p className="stats-label">Chưa xử lý</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon processing">
          <Clock size={24} />
        </div>
        <div className="stats-content">
          <h3 className="stats-value">{dangXuLy}</h3>
          <p className="stats-label">Đang xử lý</p>
        </div>
      </div>
    </div>
  );
};

export default PhanHoiStats;
