import type React from "react";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart2,
  Bell,
  Award,
  FileText,
} from "lucide-react";
import type { TongQuanThongKeDTO, HoatDong, ThongBao } from "../types";
import { ApiService } from "../../../untils/services/service-api";

const TongQuanHeThong: React.FC = () => {
  const [recentActivities, setRecentActivities] = useState<HoatDong[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [recentNotifications, setRecentNotifications] = useState<ThongBao[]>(
    []
  );
  const [loadingNotifications, setLoadingNotifications] =
    useState<boolean>(true);
  const [stats, setStats] = useState<TongQuanThongKeDTO>({
    TongSinhVien: 0,
    TongGiangVien: 0,
    TongHoatDong: 0,
    TongPhanHoi: 0,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Thêm useEffect để lấy dữ liệu hoạt động gần đây và thông báo
  useEffect(() => {
    fetchRecentActivities();
    fetchStats();
  }, []);

  // Hàm lấy dữ liệu thống kê từ API
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await ApiService.layThongKeTongQuan();
      setStats(response);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      // Giữ giá trị mặc định nếu có lỗi
    } finally {
      setLoadingStats(false);
    }
  };

  // Hàm lấy dữ liệu hoạt động gần đây từ API
  const fetchRecentActivities = async () => {
    setLoadingActivities(true);
    try {
      const data = await ApiService.layDanhSachHoatDong();
      // Lấy 4 hoạt động gần đây nhất
      const recentData = data
        .sort((a: HoatDong, b: HoatDong) => {
          const dateA = new Date(a.NgayBatDau || a.NgayBatDau || "");
          const dateB = new Date(b.NgayKetThuc || b.NgayKetThuc || "");
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 4);
      setRecentActivities(recentData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hoạt động gần đây:", error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Hàm xác định icon dựa trên trạng thái hoạt động
  const getActivityIcon = (trangThai: string) => {
    switch (trangThai) {
      case "Đang mở đăng ký":
        return <Calendar size={16} />;
      case "Đã đóng đăng ký":
        return <Bell size={16} />;
      case "Đang diễn ra":
        return <Award size={16} />;
      case "Đã kết thúc":
        return <FileText size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  // Hàm xác định trạng thái hiển thị
  const getActivityStatus = (trangThai: string) => {
    switch (trangThai) {
      case "Đang mở đăng ký":
        return { class: "new", text: "Mới" };
      case "Đã đóng đăng ký":
        return { class: "in-progress", text: "Đang xử lý" };
      case "Đang diễn ra":
        return { class: "in-progress", text: "Đang diễn ra" };
      case "Đã kết thúc":
        return { class: "completed", text: "Đã kết thúc" };
      default:
        return { class: "new", text: "Mới" };
    }
  };

  // Hàm xác định trạng thái thông báo
  const getNotificationStatus = (ngayTao: string) => {
    const today = new Date();
    const notificationDate = new Date(ngayTao);

    // Tính số mili giây trong 1 tuần
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Kiểm tra xem thông báo có trong vòng 1 tuần không
    if (today.getTime() - notificationDate.getTime() <= oneWeek) {
      return { class: "new", text: "Mới" };
    }

    return { class: "normal", text: "" };
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Kiểm tra nếu là hôm nay
      if (date.toDateString() === today.toDateString()) {
        return `Hôm nay, ${date.getHours()}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }

      // Kiểm tra nếu là hôm qua
      if (date.toDateString() === yesterday.toDateString()) {
        return `Hôm qua, ${date.getHours()}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }

      // Ngày khác
      return `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}, ${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      return "Không xác định";
    }
  };

  // Hàm xử lý khi tạo hoạt động mới
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
            {loadingStats ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">
                {stats.TongSinhVien.toLocaleString()}
              </p>
            )}
            <p className="stat-desc">Tổng số sinh viên</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teacher-icon">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Giáo viên</h3>
            {loadingStats ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">
                {stats.TongGiangVien.toLocaleString()}
              </p>
            )}
            <p className="stat-desc">Tổng số giáo viên</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon activity-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-details">
            <h3>Hoạt động</h3>
            {loadingStats ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">
                {stats.TongHoatDong.toLocaleString()}
              </p>
            )}
            <p className="stat-desc">Tổng số hoạt động</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon feedback-icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-details">
            <h3>Phản hồi</h3>
            {loadingStats ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">{stats.TongPhanHoi.toLocaleString()}</p>
            )}
            <p className="stat-desc">Tổng số phản hồi</p>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget recent-activities">
          <div className="widget-header">
            <h3>Hoạt động gần đây</h3>
            <button
              className="view-all"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/admin/dashboard?menu=activities"
                );
                window.dispatchEvent(new Event("popstate"));
              }}
            >
              Xem tất cả
            </button>
          </div>
          <div className="widget-content">
            {loadingActivities ? (
              <div className="loading-activities">Đang tải dữ liệu...</div>
            ) : (
              <ul className="activity-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const status = getActivityStatus(activity.TrangThai || "");
                    return (
                      <li key={activity.MaHoatDong} className="activity-item">
                        <div className="activity-icon">
                          {getActivityIcon(activity.TrangThai || "")}
                        </div>
                        <div className="activity-details">
                          <p className="activity-title">
                            {activity.TenHoatDong}
                          </p>
                          <p className="activity-time">
                            {formatDateTime(activity.NgayBatDau || "")}
                          </p>
                        </div>
                        <span className={`activity-status ${status.class}`}>
                          {status.text}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li className="no-activities">
                    Không có hoạt động nào gần đây
                  </li>
                )}
              </ul>
            )}
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
