"use client";

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
} from "react-feather";
import "./Dashboard.css";

// Import các components
import QuanLyDanhMuc from "../../../components/Admin/views/QuanLyDanhMuc";
import HoatDongNamHoc from "../../../components/Admin/views/HoatDongNamHoc";
import ChamDiemRenLuyen from "../../../components/Admin/views/ChamDiemRenLuyen";
import ThongBaoDiemDanh from "../../../components/Admin/views/ThongBaoDiemDanh";
import CapNhatMinhChung from "../../../components/Admin/views/CapNhatMinhChung";
import PhanHoiDiemRenLuyen from "../../../components/Admin/views/PhanHoiDiemRenLuyen";
import ThongKeBaoCao from "../../../components/Admin/views/ThongKeBaoCao";
import HoiDongChamDiem from "../../../components/Admin/views/HoiDongChamDiem";
import TongQuanHeThong from "../../../components/Admin/views/TongQuanHeThong";
import TaoHoatDong from "../../../components/Admin/views/TaoHoatDong";

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [viewParam, setViewParam] = useState<string | null>(null);

  const username = localStorage.getItem("username") || "Admin";

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

    // Gọi lần đầu khi component mount
    handleUrlChange();

    // Thêm event listener để lắng nghe sự thay đổi URL
    window.addEventListener("popstate", handleUrlChange);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  const renderContent = () => {
    // Kiểm tra nếu đang ở menu activities và view là create
    if (activeMenu === "activities" && viewParam === "create") {
      return <TaoHoatDong />;
    }

    // Các trường hợp khác
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
              className={activeMenu === "evidence" ? "active" : ""}
              onClick={() => {
                setActiveMenu("evidence");
                window.history.pushState({}, "", "?menu=evidence");
              }}
            >
              <FileText size={18} />
              <span>Cập nhật minh chứng</span>
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

export default Dashboard;
