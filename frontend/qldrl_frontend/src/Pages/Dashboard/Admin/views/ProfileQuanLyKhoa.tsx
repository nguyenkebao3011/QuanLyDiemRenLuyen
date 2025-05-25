import React, { useEffect, useState } from "react";
import { ApiService } from "../../../../untils/services/service-api";
import Notification from "./Notification";

interface QuanLyKhoaDTO {
  HoTen?: string;
  Khoa?: string;
  Email?: string;
  SoDienThoai?: string;
}

interface ProfileProps {
  onBack?: () => void; // callback khi quay lại
}

const ProfileQuanLyKhoa: React.FC<ProfileProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<QuanLyKhoaDTO>({
    HoTen: "",
    Khoa: "",
    Email: "",
    SoDienThoai: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await ApiService.thongTinQuanLyKhoa();
        setProfile(data);
      } catch {
        setNotification({
          show: true,
          message: "Không thể tải thông tin quản lý khoa.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setNotification({ show: false, message: "", type: "success" });
    try {
      await ApiService.capNhatQuanLyKhoa(profile);
      setNotification({
        show: true,
        message: "Cập nhật thông tin thành công!",
        type: "success",
      });
      // Sau 2 giây tự động gọi onBack (quay về trang chủ)
      setTimeout(() => {
        onBack && onBack();
      }, 2000);
    } catch {
      setNotification({
        show: true,
        message: "Cập nhật thất bại. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };
  const handleBack = () => {
    window.history.back();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Hồ sơ Quản lý Khoa</h2>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotification({ show: false, message: "", type: "success" })
          }
        />
      )}

      <div style={{ marginBottom: 10 }}>
        <label>Họ tên:</label>
        <input
          type="text"
          name="HoTen"
          value={profile.HoTen || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Khoa:</label>
        <input
          type="text"
          name="Khoa"
          value={profile.Khoa || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Email:</label>
        <input
          type="email"
          name="Email"
          value={profile.Email || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Số điện thoại:</label>
        <input
          type="text"
          name="SoDienThoai"
          value={profile.SoDienThoai || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          marginRight: 10,
        }}
      >
        {saving ? "Đang lưu..." : "Lưu thông tin"}
      </button>

      <button
        onClick={handleBack}
        style={{
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Quay lại
      </button>
    </div>
  );
};

export default ProfileQuanLyKhoa;
