import React, { useState } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  Bell,
  FileText,
  MessageSquare,
  BarChart2,
  UserCheck,
  LogOut,
  Menu,
  X,
} from "react-feather";
import "./Dashboard.css";

// Import các components
import QuanLyDanhMuc from "../../../components/Admin/QuanLyDanhMuc";
import HoatDongNamHoc from "../../../components/Admin/HoatDongNamHoc";
import ChamDiemRenLuyen from "../../../components/Admin/ChamDiemRenLuyen";
import ThongBaoDiemDanh from "../../../components/Admin/ThongBaoDiemDanh";
import CapNhatMinhChung from "../../../components/Admin/CapNhatMinhChung";
import PhanHoiDiemRenLuyen from "../../../components/Admin/PhanHoiDiemRenLuyen";
import ThongKeBaoCao from "../../../components/Admin/ThongKeBaoCao";
import HoiDongChamDiem from "../../../components/Admin/HoiDongChamDiem";

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const username = localStorage.getItem("username") || "Admin";

  const renderContent = () => {
    switch (activeMenu) {
      case "category":
        return <QuanLyDanhMuc />;
      case "activities":
        return <HoatDongNamHoc />;
      case "scoring":
        return <ChamDiemRenLuyen />;
      case "notification":
        return <ThongBaoDiemDanh />;
      case "evidence":
        return <CapNhatMinhChung />;
      case "feedback":
        return <PhanHoiDiemRenLuyen />;
      case "statistics":
        return <ThongKeBaoCao />;
      case "committee":
        return <HoiDongChamDiem />;
      default:
        return <TongQuanHeThong />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>QLĐRL Sinh Viên</h2>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="user-info">
          <div className="avatar">{username.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <h3>{username}</h3>
            <p>Quản trị viên</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeMenu === "dashboard" ? "active" : ""}
              onClick={() => setActiveMenu("dashboard")}
            >
              <BookOpen size={18} />
              <span>Tổng quan</span>
            </li>
            <li
              className={activeMenu === "category" ? "active" : ""}
              onClick={() => setActiveMenu("category")}
            >
              <Users size={18} />
              <span>Quản lý danh mục</span>
            </li>
            <li
              className={activeMenu === "activities" ? "active" : ""}
              onClick={() => setActiveMenu("activities")}
            >
              <Calendar size={18} />
              <span>Hoạt động năm học</span>
            </li>
            <li
              className={activeMenu === "scoring" ? "active" : ""}
              onClick={() => setActiveMenu("scoring")}
            >
              <Award size={18} />
              <span>Chấm điểm rèn luyện</span>
            </li>
            <li
              className={activeMenu === "notification" ? "active" : ""}
              onClick={() => setActiveMenu("notification")}
            >
              <Bell size={18} />
              <span>Thông báo điểm danh</span>
            </li>
            <li
              className={activeMenu === "evidence" ? "active" : ""}
              onClick={() => setActiveMenu("evidence")}
            >
              <FileText size={18} />
              <span>Cập nhật minh chứng</span>
            </li>
            <li
              className={activeMenu === "feedback" ? "active" : ""}
              onClick={() => setActiveMenu("feedback")}
            >
              <MessageSquare size={18} />
              <span>Phản hồi điểm rèn luyện</span>
            </li>
            <li
              className={activeMenu === "statistics" ? "active" : ""}
              onClick={() => setActiveMenu("statistics")}
            >
              <BarChart2 size={18} />
              <span>Thống kê, báo cáo</span>
            </li>
            <li
              className={activeMenu === "committee" ? "active" : ""}
              onClick={() => setActiveMenu("committee")}
            >
              <UserCheck size={18} />
              <span>Hội đồng chấm điểm</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="content-header">
          <h1>
            {activeMenu === "dashboard" && "Tổng quan hệ thống"}
            {activeMenu === "category" && "Quản lý danh mục"}
            {activeMenu === "activities" && "Hoạt động năm học"}
            {activeMenu === "scoring" && "Chấm điểm rèn luyện"}
            {activeMenu === "notification" && "Thông báo điểm danh"}
            {activeMenu === "evidence" && "Cập nhật minh chứng"}
            {activeMenu === "feedback" && "Phản hồi điểm rèn luyện"}
            {activeMenu === "statistics" && "Thống kê, báo cáo"}
            {activeMenu === "committee" && "Hội đồng chấm điểm"}
          </h1>
          <div className="header-actions">
            <div className="search-box">
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            <div className="notification-icon">
              <Bell size={20} />
              <span className="badge">3</span>
            </div>
          </div>
        </header>

        <div className="content-body">{renderContent()}</div>
      </div>
    </div>
  );
};

// Component tổng quan
const TongQuanHeThong: React.FC = () => {
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
              <button className="quick-action-btn">
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

export default Dashboard;
