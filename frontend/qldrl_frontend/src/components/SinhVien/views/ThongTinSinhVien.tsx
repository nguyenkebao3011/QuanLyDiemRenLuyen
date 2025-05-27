
import type React from "react"
import { User, Mail, Phone, MapPin, Calendar, Users, BadgeIcon as IdCard, GraduationCap } from "lucide-react"

interface Student {
  MaSV: string
  HoTen: string
  Email: string
  SoDienThoai: string
  MaTaiKhoan: string
  AnhDaiDien: string | null
  DiaChi?: string
  NgaySinh?: string
  GioiTinh?: string
  MaLop?: string
  TenLop?: string
}

interface Props {
  student: Student
}

const StudentInfoDisplay: React.FC<Props> = ({ student }) => {
  return (
    <div className="student-info-wrapper">
      <div className="student-info-container">
        <div className="student-info-card">
          <div className="student-info-card-header">
            <h2 className="student-info-title">
              <GraduationCap className="student-info-title-icon" />
              Thông tin sinh viên
            </h2>
          </div>

          <div className="student-info-content">
            {/* Avatar Section */}
            <div className="student-info-avatar-section">
              <div className="student-info-avatar-container">
                {student.AnhDaiDien ? (
                  <img
                    src={student.AnhDaiDien || "/placeholder.svg"}
                    alt="Ảnh đại diện"
                    className="student-info-avatar-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : (
                  <div className="student-info-avatar-placeholder">
                    <User size={48} />
                  </div>
                )}
              </div>

              <div className="student-info-basic-info">
                <h3 className="student-info-name">{student.HoTen}</h3>
                <p className="student-info-student-id">MSSV: {student.MaSV}</p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="student-info-grid">
              <div className="student-info-item">
                <div className="student-info-label">
                  <IdCard size={20} />
                  <span>Mã sinh viên</span>
                </div>
                <div className="student-info-value">{student.MaSV}</div>
              </div>

              <div className="student-info-item">
                <div className="student-info-label">
                  <User size={20} />
                  <span>Họ tên</span>
                </div>
                <div className="student-info-value">{student.HoTen}</div>
              </div>

              <div className="student-info-item">
                <div className="student-info-label">
                  <Mail size={20} />
                  <span>Email</span>
                </div>
                <div className="student-info-value">{student.Email}</div>
              </div>

              <div className="student-info-item">
                <div className="student-info-label">
                  <Phone size={20} />
                  <span>Số điện thoại</span>
                </div>
                <div className="student-info-value">{student.SoDienThoai}</div>
              </div>

              <div className="student-info-item">
                <div className="student-info-label">
                  <User size={20} />
                  <span>Giới tính</span>
                </div>
                <div className="student-info-value">{student.GioiTinh || "Chưa có"}</div>
              </div>

              <div className="student-info-item">
                <div className="student-info-label">
                  <Calendar size={20} />
                  <span>Ngày sinh</span>
                </div>
                <div className="student-info-value">{student.NgaySinh || "Chưa có"}</div>
              </div>

              <div className="student-info-item">
                <div className="student-info-label">
                  <MapPin size={20} />
                  <span>Địa chỉ</span>
                </div>
                <div className="student-info-value">{student.DiaChi || "Chưa có"}</div>
              </div>

              <div className="student-info-item">
                <div className="student-info-label">
                  <Users size={20} />
                  <span>Lớp</span>
                </div>
                <div className="student-info-value">{student.TenLop || student.MaLop || "Chưa có"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentInfoDisplay
