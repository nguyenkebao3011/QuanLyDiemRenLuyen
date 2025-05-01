import React from "react";

// Đúng với dữ liệu trả về từ API
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

interface Props {
    lecturer: Lecturer;
}

const ThongTinGiangVien: React.FC<Props> = ({ lecturer }) => {
  return (
    <div className="thongtin-container">
      <h3>Thông tin Giảng Viên</h3>

      <div className="thongtin-content">
        {/* Hiển thị ảnh đại diện nếu có */}
        {lecturer.AnhDaiDien && (
          <div className="avatar-container">
            <img
              src={lecturer.AnhDaiDien}
              alt="Ảnh đại diện"
              className="lecturer-avatar"
            />
          </div>
        )}

        {/* Bảng thông tin giảng viên */}
        <table className="student-info-table">
          <tbody>
            <tr className="row">
              <td><strong>Mã giảng viên:</strong></td>
              <td>{lecturer.MaGV}</td>
              <td><strong>Họ tên:</strong></td>
              <td>{lecturer.HoTen}</td>
            </tr>
            <tr className="row">
              <td><strong>Email:</strong></td>
              <td>{lecturer.Email}</td>
              <td><strong>Số điện thoại:</strong></td>
              <td>{lecturer.SoDienThoai}</td>
            </tr>
            <tr className="row">
              <td><strong>Giới tính:</strong></td>
              <td>{lecturer.GioiTinh || "Chưa có"}</td>
              <td><strong>Ngày sinh:</strong></td>
              <td>{lecturer.NgaySinh || "Chưa có"}</td>
            </tr>
            <tr className="row">
              <td><strong>Địa chỉ:</strong></td>
              <td>{lecturer.DiaChi || "Chưa có"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThongTinGiangVien;