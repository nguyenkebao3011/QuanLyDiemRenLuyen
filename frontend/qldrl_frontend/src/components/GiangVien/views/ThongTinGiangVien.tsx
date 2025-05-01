import React, { useEffect, useState } from "react";
import axios from "axios";

// Định nghĩa kiểu dữ liệu
interface Lecturer {
  MaGV: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  AnhDaiDien: string | null;
  DiaChi: string;
  NgaySinh: string;
  GioiTinh: string;
}

const ThongTinGiangVien: React.FC = () => {
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchLecturer = async () => {
      try {
        const token = localStorage.getItem("token"); // Lấy token từ localStorage
        if (!token) throw new Error("Không có token!");
  
        const res = await axios.get("http://localhost:5163/api/GiaoViens/lay-giangvien-theo-vai-tro", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setLecturer(res.data.data);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError("Không thể tải thông tin giảng viên.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchLecturer();
  }, []);

  if (loading) return <p>Đang tải thông tin...</p>;

  if (error) return <p>{error}</p>;

  if (!lecturer) {
    return (
      <div className="thongtin-container">
        <h3>Thông tin Giảng Viên</h3>
        <p>Không có thông tin giảng viên để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="thongtin-container">
      <h3>Thông tin Giảng Viên</h3>

      <div className="thongtin-content">
        {lecturer.AnhDaiDien ? (
          <div className="avatar-container">
            <img
               src={`http://localhost:5163${lecturer.AnhDaiDien}`}
              alt="Ảnh đại diện"
              className="student-avatar"
            />
          </div>
        ) : (
          <div className="avatar-container">
            <div className="default-avatar">
              {lecturer.HoTen ? lecturer.HoTen.charAt(0).toUpperCase() : "T"}
            </div>
          </div>
        )}

        <table className="student-info-table">
          <tbody>
            <tr className="row">
              <td><strong>Mã giảng viên:</strong></td>
              <td>{lecturer.MaGV || "Chưa có"}</td>
              <td><strong>Họ tên:</strong></td>
              <td>{lecturer.HoTen || "Chưa có"}</td>
            </tr>
            <tr className="row">
              <td><strong>Email:</strong></td>
              <td>{lecturer.Email || "Chưa có"}</td>
              <td><strong>Số điện thoại:</strong></td>
              <td>{lecturer.SoDienThoai || "Chưa có"}</td>
            </tr>
            <tr className="row">
              <td><strong>Giới tính:</strong></td>
              <td>{lecturer.GioiTinh || "Chưa có"}</td>
              <td><strong>Ngày sinh:</strong></td>
              <td>{lecturer.NgaySinh || "Chưa có"}</td>
            </tr>
            <tr className="row">
              <td><strong>Địa chỉ:</strong></td>
              <td colSpan={3}>{lecturer.DiaChi || "Chưa có"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThongTinGiangVien;
