import React from "react";
import "../css/ThongTinSinhVien.css";

// Đúng với key trả về từ API (PascalCase)
interface Student {
  MaSV: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  MaTaiKhoan: string;
  AnhDaiDien: string | null;
  DiaChi?: string;
  NgaySinh?: string;
  GioiTinh?: string;
  MaLop?: string;
  TenLop?: string; 
}

interface Props {
  student: Student;
}

const ThongTinSinhVien: React.FC<Props> = ({ student }) => {
  return (
    <div className="thongtin-container">
      <h3 className="thongtin-test">Thông tin sinh viên</h3>
              <div className="thongtin-content">
          <div className="avatar-container">
            {student.AnhDaiDien ? (
              <img
                src={student.AnhDaiDien}
                alt="Ảnh đại diện"
                className="student-avatar"
              />
            ) : (
              <div className="default-avatar">
                {(student.HoTen?.charAt(0) || "T").toUpperCase()}
              </div>
            )}
          </div>
       

        {/* Bảng thông tin sinh viên */}
        <table className="student-info-table">
          <tbody>
            <tr className="row">
              <td><strong>Mã sinh viên:</strong></td>
              <td>{student.MaSV}</td>
              <td><strong>Họ tên:</strong></td>
              <td>{student.HoTen}</td>
            </tr>
            <tr className="row">
              <td><strong>Email:</strong></td>
              <td>{student.Email}</td>
              <td><strong>Số điện thoại:</strong></td>
              <td>{student.SoDienThoai}</td>
            </tr>
            <tr className="row">
              <td><strong>Giới tính:</strong></td>
              <td>{student.GioiTinh || "Chưa có"}</td>
              <td><strong>Ngày sinh:</strong></td>
              <td>{student.NgaySinh || "Chưa có"}</td>
            </tr>
            <tr className="row">
              <td><strong>Địa chỉ:</strong></td>
              <td>{student.DiaChi || "Chưa có"}</td>
              <td><strong>Lớp:</strong></td>
              <td>{student.TenLop || student.MaLop || "Chưa có"}</td>
            </tr>
          </tbody>
        </table>
      </div>
   
    </div>
  );
};

export default ThongTinSinhVien;
