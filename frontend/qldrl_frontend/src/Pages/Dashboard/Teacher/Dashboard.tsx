import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Calendar,
  Award,
  Bell,
  FileText,
  LogOut,
  Menu,
  X,
} from "react-feather";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import XemHoatDong from "../../../components/SinhVien/views/XemHoatDong";
import XemDiemRenLuyen from "../../../components/SinhVien/views/XemDiemRenLuyen";
import XemThongBao from "../../../components/SinhVien/views/XemThongBao";
import GuiPhanHoi from "../../../components/SinhVien/views/PhanHoiDiemRenLuyen";
import ThongTinGiangVien from "../../../components/GiangVien/views/ThongTinGiangVien";

type MenuKey = "dashboard" | "activities" | "score" | "notifications" | "evidence";

interface Lecturer {
  MaGV: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  DiaChi: string;
  NgaySinh: string;
  GioiTinh: string;
  AnhDaiDien: string | null;
}

const TeacherDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [viewParam, setViewParam] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>("Giảng viên");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [teacherData, setTeacherData] = useState<Lecturer | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:5163"; // Thay đổi nếu API chạy trên cổng khác

  const menuConfig: Record<MenuKey, { title: string; icon: React.ReactNode }> = {
    dashboard: { title: "Tổng quan", icon: <BookOpen size={18} /> },
    activities: { title: "Các hoạt động", icon: <Calendar size={18} /> },
    score: { title: "Quản lý điểm rèn luyện", icon: <Award size={18} /> },
    notifications: { title: "Thông báo", icon: <Bell size={18} /> },
    evidence: { title: "Phản hồi điểm rèn luyện", icon: <FileText size={18} /> },
  };

  const handleAvatarClick = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Không tìm thấy token");
        }

        const response = await axios.get<Lecturer>(
          `${BASE_URL}/api/GiaoViens/lay-giangvien-theo-vai-tro`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeacherData(response.data);
        setTeacherName(response.data.HoTen || "Giảng Viên");

        if (response.data.AnhDaiDien) {
          const avatarPath = response.data.AnhDaiDien;
          const avatarUrl = avatarPath.startsWith("http")
            ? avatarPath
            : `${BASE_URL}${avatarPath}`;
          setAvatar(avatarUrl);
        } else {
          setAvatar(null);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin Giảng viên:", error);
        setTeacherName("Giảng Viên");
        setAvatar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const menuParam = params.get("menu") as MenuKey;
      const viewParam = params.get("view");

      if (menuParam && menuConfig[menuParam]) {
        setActiveMenu(menuParam);
      } else {
        setActiveMenu("dashboard");
      }

      setViewParam(viewParam || null);
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div>Đang tải...</div>;
    }

    switch (activeMenu) {
      case "activities":
        return <XemHoatDong />;
      case "notifications":
        return <XemThongBao />;
      case "score":
        return <XemDiemRenLuyen />;
      case "evidence":
        return <GuiPhanHoi />;
      default:
        return (
          <div>
            <h2>Xin chào {teacherName}</h2>
            {teacherData ? (
              <ThongTinGiangVien  />
            ) : (
              <p>Đang tải thông tin giảng viên...</p>
            )}
          </div>
        );
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      window.location.href = "/login";
    }
  };
  console.log(process.env.REACT_APP_API_URL)
  
  const handleMenuClick = (menu: MenuKey) => {
    setActiveMenu(menu);
    window.history.pushState({}, "", `?menu=${menu}`);
  };

  return (
    <div className="teacher-dashboard-container">
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <img
          className="logo"
          src="../hinhanh/HUIT(2).jpeg"
          alt="Logo trường"
          style={{ width: "125px", margin: "15px 0 10px 70px" }}
        />
        <div className="sidebar-header">
          <h2>Quản lý điểm rèn luyện</h2>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className="user-info">
          {avatar ? (
            <img
            src={`${process.env.REACT_APP_API_URL}${avatar}`}  
            
              alt="Avatar"
              className="avatar"
              onError={() => {
                console.warn("Không thể tải ảnh avatar");
                setAvatar(null);
              }}
            />
          ) : (
            <div className="avatar">{teacherName.charAt(0).toUpperCase()}</div>
          )}
          <div className="user-details">
            <h3>{teacherName}</h3>
            <p>Giảng Viên</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {Object.entries(menuConfig).map(([menuKey, { title, icon }]) => (
              <li
                key={menuKey}
                className={activeMenu === menuKey ? "active" : ""}
                onClick={() => handleMenuClick(menuKey as MenuKey)}
              >
                {icon}
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="content-header">
          <h1>{menuConfig[activeMenu].title}</h1>
          <div className="header-actions">
            <div className="search-box">
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            <div className="notification-icon">
              <Bell size={20} />
            </div>
            <div className="avatar-menu-container" ref={avatarRef}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar nhỏ"
                  className="mini-avatar"
                  onClick={handleAvatarClick}
                />
              ) : (
                <div className="mini-avatar" onClick={handleAvatarClick}>
                  {teacherName.charAt(0).toUpperCase()}
                </div>
              )}

              {menuVisible && (
                <div className="avatar-dropdown">
                  <div className="menu-item" onClick={() => navigate("/cap-nhat-thong-tin-giang-vien")}>
                    Cập nhật thông tin
                  </div>
                  <div className="menu-item" onClick={() => navigate("/doi-mat-khau")}>
                    Đổi mật khẩu
                  </div>
                  <div className="menu-item" onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}>
                    Đăng xuất
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content-body">{renderContent()}</div>
      </div>
    </div>
  );
};

export default TeacherDashboard;