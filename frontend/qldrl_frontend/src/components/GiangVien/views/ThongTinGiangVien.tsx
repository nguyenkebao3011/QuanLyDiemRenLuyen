"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BadgeIcon as IdCard,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface Lecturer {
  MaGV: string
  HoTen: string
  Email: string
  SoDienThoai: string
  AnhDaiDien: string | null
  DiaChi: string
  NgaySinh: string
  GioiTinh: string
}

const LecturerInfoDisplay: React.FC = () => {
  const [lecturer, setLecturer] = useState<Lecturer | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchLecturer = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Không có token!")

        const res = await axios.get("http://localhost:5163/api/GiaoViens/lay-giangvien-theo-vai-tro", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setLecturer(res.data.data)
      } catch (err) {
        console.error("Lỗi khi gọi API:", err)
        setError("Không thể tải thông tin giảng viên.")
      } finally {
        setLoading(false)
      }
    }

    fetchLecturer()
  }, [])

  if (loading) {
    return (
      <div className="lecturer-info-loading">
        <div className="lecturer-info-spinner">
          <Loader2 size={40} className="lecturer-info-spinner-icon" />
        </div>
        <p>Đang tải thông tin...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lecturer-info-error">
        <AlertCircle size={48} />
        <p>{error}</p>
      </div>
    )
  }

  if (!lecturer) {
    return (
      <div className="lecturer-info-wrapper">
        <div className="lecturer-info-container">
          <div className="lecturer-info-card">
            <div className="lecturer-info-card-header">
              <h2 className="lecturer-info-title">
                <GraduationCap className="lecturer-info-title-icon" />
                Thông tin Giảng Viên
              </h2>
            </div>
            <div className="lecturer-info-content">
              <div className="lecturer-info-no-data">
                <GraduationCap size={64} />
                <p>Không có thông tin giảng viên để hiển thị.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lecturer-info-wrapper">
      <div className="lecturer-info-container">
        <div className="lecturer-info-card">
          <div className="lecturer-info-card-header">
            <h2 className="lecturer-info-title">
              <GraduationCap className="lecturer-info-title-icon" />
              Thông tin Giảng Viên
            </h2>
          </div>

          <div className="lecturer-info-content">
            {/* Avatar Section */}
            <div className="lecturer-info-avatar-section">
              <div className="lecturer-info-avatar-container">
                {lecturer.AnhDaiDien ? (
                  <img
                    src={`http://localhost:5163${lecturer.AnhDaiDien}`}
                    alt="Ảnh đại diện"
                    className="lecturer-info-avatar-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : (
                  <div className="lecturer-info-avatar-placeholder">
                    <GraduationCap size={48} />
                  </div>
                )}
              </div>

              <div className="lecturer-info-basic-info">
                <h3 className="lecturer-info-name">{lecturer.HoTen}</h3>
                <p className="lecturer-info-lecturer-id">Mã GV: {lecturer.MaGV}</p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="lecturer-info-grid">
              <div className="lecturer-info-item">
                <div className="lecturer-info-label">
                  <IdCard size={20} />
                  <span>Mã giảng viên</span>
                </div>
                <div className="lecturer-info-value">{lecturer.MaGV || "Chưa có"}</div>
              </div>

              <div className="lecturer-info-item">
                <div className="lecturer-info-label">
                  <User size={20} />
                  <span>Họ tên</span>
                </div>
                <div className="lecturer-info-value">{lecturer.HoTen || "Chưa có"}</div>
              </div>

              <div className="lecturer-info-item">
                <div className="lecturer-info-label">
                  <Mail size={20} />
                  <span>Email</span>
                </div>
                <div className="lecturer-info-value">{lecturer.Email || "Chưa có"}</div>
              </div>

              <div className="lecturer-info-item">
                <div className="lecturer-info-label">
                  <Phone size={20} />
                  <span>Số điện thoại</span>
                </div>
                <div className="lecturer-info-value">{lecturer.SoDienThoai || "Chưa có"}</div>
              </div>

              <div className="lecturer-info-item">
                <div className="lecturer-info-label">
                  <User size={20} />
                  <span>Giới tính</span>
                </div>
                <div className="lecturer-info-value">{lecturer.GioiTinh || "Chưa có"}</div>
              </div>

              <div className="lecturer-info-item">
                <div className="lecturer-info-label">
                  <Calendar size={20} />
                  <span>Ngày sinh</span>
                </div>
                <div className="lecturer-info-value">{lecturer.NgaySinh || "Chưa có"}</div>
              </div>

              <div className="lecturer-info-item lecturer-info-address-item">
                <div className="lecturer-info-label">
                  <MapPin size={20} />
                  <span>Địa chỉ</span>
                </div>
                <div className="lecturer-info-value">{lecturer.DiaChi || "Chưa có"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LecturerInfoDisplay
