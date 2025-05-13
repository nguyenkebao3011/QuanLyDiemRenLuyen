import type React from "react";
import { useState, useEffect } from "react";
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
  Search,
  ChevronDown,
  Home,
} from "lucide-react";
import "../css/Dashboard.css";

// Import các components
import QuanLyDanhMuc from "./QuanLyDanhMuc";
import HoatDongNamHoc from "./HoatDongNamHoc";
import ChamDiemRenLuyen from "./ChamDiemRenLuyen";
import ThongBaoDiemDanh from "./ThongBaoDiemDanh";
import PhanHoiDiem from "./PhanHoiDiem";
import ThongKeBaoCao from "./ThongKeBaoCao";
import HoiDongChamDiem from "./HoiDongChamDiem";
import TongQuanHeThong from "../../../../components/Admin/HoatDong/TongQuanHeThong";
import TaoHoatDong from "../../../../components/Admin/HoatDong/TaoHoatDong";
import { ApiService } from "../../../../untils/services/service-api";
import { QuanLyKhoa } from "../../../../components/Admin/types";

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [viewParam, setViewParam] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const username = localStorage.getItem("username") || "Admin";

  const [quanLyKhoa, setQuanLyKhoa] = useState<QuanLyKhoa | null>(null);
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const menuParam = params.get("menu");
      const viewParam = params.get("view");

      if (menuParam) {
        setActiveMenu(menuParam);
      }

      if (viewParam) {
        setViewParam(viewParam);
      } else {
        setViewParam(null);
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);
  const fetchQLKhoa = async () => {
    try {
      const data = await ApiService.thongTinQuanLyKhoa();
      setQuanLyKhoa(data);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin quản lý khoa:", err);
    }
  };
  useEffect(() => {
    fetchQLKhoa();
  }, []);
  const renderContent = () => {
    if (activeMenu === "activities" && viewParam === "create") {
      return <TaoHoatDong />;
    }

    switch (activeMenu) {
      case "category":
        return <QuanLyDanhMuc />;
      case "activities":
        return <HoatDongNamHoc />;
      case "scoring":
        return <ChamDiemRenLuyen />;
      case "notification":
        return <ThongBaoDiemDanh />;
      case "feedback":
        return <PhanHoiDiem />;
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

  const getMenuTitle = () => {
    switch (activeMenu) {
      case "dashboard":
        return "Tổng quan hệ thống";
      case "category":
        return "Quản lý danh mục";
      case "activities":
        return viewParam === "create"
          ? "Tạo hoạt động mới"
          : "Hoạt động năm học";
      case "scoring":
        return "Chấm điểm rèn luyện";
      case "notification":
        return "Thông báo điểm danh";
      case "evidence":
        return "Cập nhật minh chứng";
      case "feedback":
        return "Phản hồi điểm rèn luyện";
      case "statistics":
        return "Thống kê, báo cáo";
      case "committee":
        return "Hội đồng chấm điểm";
      default:
        return "Tổng quan hệ thống";
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <Home size={24} className="logo-icon" />
            <h2>Quản lý điểm rèn luyện</h2>
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="user-info">
          <div className="avatar">
            {quanLyKhoa?.HoTen.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{quanLyKhoa?.HoTen}</h3>
            <p>Quản trị viên</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeMenu === "dashboard" ? "active" : ""}
              onClick={() => {
                setActiveMenu("dashboard");
                window.history.pushState({}, "", "?menu=dashboard");
              }}
            >
              <BookOpen size={18} />
              <span>Tổng quan</span>
            </li>
            <li
              className={activeMenu === "category" ? "active" : ""}
              onClick={() => {
                setActiveMenu("category");
                window.history.pushState({}, "", "?menu=category");
              }}
            >
              <Users size={18} />
              <span>Quản lý danh mục</span>
            </li>
            <li
              className={activeMenu === "activities" ? "active" : ""}
              onClick={() => {
                setActiveMenu("activities");
                window.history.pushState({}, "", "?menu=activities");
              }}
            >
              <Calendar size={18} />
              <span>Hoạt động năm học</span>
            </li>
            <li
              className={activeMenu === "scoring" ? "active" : ""}
              onClick={() => {
                setActiveMenu("scoring");
                window.history.pushState({}, "", "?menu=scoring");
              }}
            >
              <Award size={18} />
              <span>Chấm điểm rèn luyện</span>
            </li>
            <li
              className={activeMenu === "notification" ? "active" : ""}
              onClick={() => {
                setActiveMenu("notification");
                window.history.pushState({}, "", "?menu=notification");
              }}
            >
              <Bell size={18} />
              <span>Thông báo điểm danh</span>
            </li>
            <li
              className={activeMenu === "feedback" ? "active" : ""}
              onClick={() => {
                setActiveMenu("feedback");
                window.history.pushState({}, "", "?menu=feedback");
              }}
            >
              <MessageSquare size={18} />
              <span>Phản hồi điểm rèn luyện</span>
            </li>
            <li
              className={activeMenu === "statistics" ? "active" : ""}
              onClick={() => {
                setActiveMenu("statistics");
                window.history.pushState({}, "", "?menu=statistics");
              }}
            >
              <BarChart2 size={18} />
              <span>Thống kê, báo cáo</span>
            </li>
            <li
              className={activeMenu === "committee" ? "active" : ""}
              onClick={() => {
                setActiveMenu("committee");
                window.history.pushState({}, "", "?menu=committee");
              }}
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
      <div className={`main-content ${!sidebarOpen ? "expanded" : ""}`}>
        <header className="content-header">
          <div className="header-left">
            {/* Chỉ hiển thị nút toggle khi sidebar đóng */}
            {!sidebarOpen && (
              <button
                className="toggle-btn-header"
                onClick={() => setSidebarOpen(true)}
                aria-label="Toggle sidebar"
              >
                <Menu size={24} />
              </button>
            )}
            <h1>{getMenuTitle()}</h1>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Tìm kiếm..." />
            </div>

            <div className="user-dropdown">
              <button
                className="user-dropdown-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar-small">
                  {quanLyKhoa?.HoTen.charAt(0).toUpperCase()}
                </div>
                <span className="username-display">{quanLyKhoa?.HoTen}</span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item">Hồ sơ</button>
                  <button className="dropdown-item">Cài đặt</button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
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

export default Dashboard;
