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
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { Facebook, Mail, Phone, MapPin, Globe } from "react-feather";
import XemHoatDong from "../../../components/GiangVien/views/XemHoatDong";
import DanhSachSinhVien from "../../../components/GiangVien/views/DanhSachSinhVien";
import XemThongBao from "../../../components/SinhVien/views/XemThongBao";
import GuiPhanHoi from "../../../components/SinhVien/views/PhanHoiDiemRenLuyen";
import ThongTinGiangVien from "../../../components/GiangVien/views/ThongTinGiangVien";
import { ThongKe } from "../../../components/GiangVien/views/ThongKe";

// Định nghĩa kiểu Lecturer
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

type MenuKey =
  | "dashboard"
  | "activities"
  | "score"
  | "notifications"
  | "evidence";
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <div className="footer-logo">
            <img
              src="../hinhanh/HUIT(2).jpeg"
              alt="Logo trường HUIT"
              className="footer-logo-img"
            />
          </div>
          <h3>TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h3>
          <p>HO CHI MINH CITY UNIVERSITY OF INDUSTRY AND TRADE</p>
        </div>

        <div className="footer-column">
          <h4>Liên hệ</h4>
          <ul className="footer-links">
            <li>
              <MapPin size={16} className="footer-icon" />
              <span>140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM</span>
            </li>
            <li>
              <Phone size={16} className="footer-icon" />
              <span>(028) 3816 1673 - (028) 3816 1674</span>
            </li>
            <li>
              <Mail size={16} className="footer-icon" />
              <span>contact@huit.edu.vn</span>
            </li>
            <li>
              <Globe size={16} className="footer-icon" />
              <span>www.huit.edu.vn</span>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Liên kết nhanh</h4>
          <ul className="footer-links">
            <li>
              <a href="/">Trang chủ</a>
            </li>
            <li>
              <a href="/thong-bao">Thông báo</a>
            </li>
            <li>
              <a href="/diem-ren-luyen">Điểm rèn luyện</a>
            </li>
            <li>
              <a href="/hoat-dong">Hoạt động</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-links">
            <a
              href="https://www.facebook.com/huit.edu.vn"
              className="social-link"
            >
              <Facebook size={24} />
            </a>
            <a href="mailto:contact@huit.edu.vn" className="social-link">
              <Mail size={24} />
            </a>
          </div>
          <div className="qr-code">
            <img src="../hinhanh/qr_code.png" alt="QR Code" />
            <p>Quét mã để truy cập</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Hệ thống Quản lý điểm rèn luyện - Trường
          Đại học Công Thương TP.HCM
        </p>
      </div>
    </footer>
  );
};
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

  const menuConfig: Record<MenuKey, { title: string; icon: React.ReactNode }> =
    {
      dashboard: { title: "Tổng quan", icon: <BookOpen size={18} /> },
      activities: { title: "Các hoạt động", icon: <Calendar size={18} /> },
      score: { title: "Danh sách sinh viên", icon: <Award size={18} /> },
      notifications: { title: "Thông báo", icon: <Bell size={18} /> },
      evidence: { title: "Thống kê", icon: <FileText size={18} /> },
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
        console.log("Token:", token); // Kiểm tra token có trong localStorage không
        if (!token) {
          throw new Error("Không tìm thấy token");
        }

        // Định dạng lại kiểu trả về để tương thích với API
        const response: AxiosResponse<{ data: Lecturer }> = await axios.get(
          `${BASE_URL}/api/GiaoViens/lay-giangvien-theo-vai-tro`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Teacher Data:", response.data); // Kiểm tra dữ liệu trả về

        const teacher = response.data.data; // Truy cập vào trường `data` trong response
        setTeacherData(teacher);
        setTeacherName(teacher.HoTen || "Giảng Viên");

        if (teacher.AnhDaiDien) {
          const avatarPath = teacher.AnhDaiDien;
          const avatarUrl = avatarPath.startsWith("http")
            ? avatarPath
            : `${BASE_URL}${avatarPath}`;
          console.log("Avatar URL:", avatarUrl); // Kiểm tra đường dẫn ảnh
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
        return <DanhSachSinhVien />;
      case "evidence":
        return <ThongKe />;
      default:
        return (
          <div>
            <h2>Xin chào, Giảng Viên {teacherName}</h2>
            {teacherData ? (
              <ThongTinGiangVien />
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
              src={avatar}
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
                <div
                  className="menu-item"
                  onClick={() => navigate("/cap-nhat-thong-tin-giang-vien")}
                >
                  Cập nhật thông tin
                </div>
                <div
                  className="menu-item"
                  onClick={() => navigate("/doi-mat-khau")}
                >
                  Đổi mật khẩu
                </div>
                <div className="menu-item" onClick={handleLogout}>
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        </header>
        <main>{renderContent()}</main>
        {/* <DanhSachSinhVien /> */}
        <Footer />
      </div>
    </div>
  );
};

export default TeacherDashboard;
