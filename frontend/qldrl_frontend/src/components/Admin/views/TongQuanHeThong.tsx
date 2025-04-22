"use client";
import type React from "react";
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart2,
  Bell,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TongQuanHeThong: React.FC = () => {
  const navigate = useNavigate();

  // Sửa lại hàm handleCreateActivity để sử dụng window.history.pushState thay vì navigate
  const handleCreateActivity = () => {
    // Thay đổi URL và cập nhật lịch sử
    window.history.pushState(
      {},
      "",
      "/admin/dashboard?menu=activities&view=create"
    );

    // Kích hoạt sự kiện popstate để Dashboard component biết URL đã thay đổi
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="dashboard-overview">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon student-icon">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Sinh viên</h3>
            <p className="stat-value">1,234</p>
            <p className="stat-desc">Tổng số sinh viên</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teacher-icon">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Giáo viên</h3>
            <p className="stat-value">56</p>
            <p className="stat-desc">Tổng số giáo viên</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon activity-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-details">
            <h3>Hoạt động</h3>
            <p className="stat-value">28</p>
            <p className="stat-desc">Hoạt động đang diễn ra</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon feedback-icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-details">
            <h3>Phản hồi</h3>
            <p className="stat-value">12</p>
            <p className="stat-desc">Phản hồi chưa xử lý</p>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget recent-activities">
          <div className="widget-header">
            <h3>Hoạt động gần đây</h3>
            <button className="view-all">Xem tất cả</button>
          </div>
          <div className="widget-content">
            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-icon">
                  <Calendar size={16} />
                </div>
                <div className="activity-details">
                  <p className="activity-title">Hoạt động tình nguyện mùa hè</p>
                  <p className="activity-time">Hôm nay, 10:30</p>
                </div>
                <span className="activity-status new">Mới</span>
              </li>
              <li className="activity-item">
                <div className="activity-icon">
                  <Award size={16} />
                </div>
                <div className="activity-details">
                  <p className="activity-title">Chấm điểm rèn luyện học kỳ 1</p>
                  <p className="activity-time">Hôm qua, 15:45</p>
                </div>
                <span className="activity-status in-progress">Đang xử lý</span>
              </li>
              <li className="activity-item">
                <div className="activity-icon">
                  <MessageSquare size={16} />
                </div>
                <div className="activity-details">
                  <p className="activity-title">
                    Phản hồi điểm rèn luyện từ Nguyễn Văn A
                  </p>
                  <p className="activity-time">24/07/2023, 09:15</p>
                </div>
                <span className="activity-status completed">Đã xử lý</span>
              </li>
              <li className="activity-item">
                <div className="activity-icon">
                  <Bell size={16} />
                </div>
                <div className="activity-details">
                  <p className="activity-title">Thông báo hết hạn điểm danh</p>
                  <p className="activity-time">22/07/2023, 18:00</p>
                </div>
                <span className="activity-status completed">Đã xử lý</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="widget quick-actions">
          <div className="widget-header">
            <h3>Thao tác nhanh</h3>
          </div>
          <div className="widget-content">
            <div className="quick-action-grid">
              <button className="quick-action-btn">
                <Users size={20} />
                <span>Thêm sinh viên</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={handleCreateActivity}
              >
                <Calendar size={20} />
                <span>Tạo hoạt động</span>
              </button>
              <button className="quick-action-btn">
                <Bell size={20} />
                <span>Gửi thông báo</span>
              </button>
              <button className="quick-action-btn">
                <BarChart2 size={20} />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TongQuanHeThong;
