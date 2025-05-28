"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bell, Calendar, Eye, User, Bookmark, CheckCircle, Tag, Clock } from "lucide-react"
import "../css/XemThongBao.css"

interface ThongBao {
  MaThongBao: number
  TieuDe: string
  NoiDung: string
  NgayTao: string
  MaQl: string
  LoaiThongBao: string
  TrangThai: string
  TenNguoiTao: string
  Khoa: string
  SoLuotXem: number
  DaDoc: boolean
}

const XemThongBao: React.FC = () => {
  const [danhSachThongBao, setDanhSachThongBao] = useState<ThongBao[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedThongBao, setSelectedThongBao] = useState<ThongBao | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchThongBao = async (): Promise<void> => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:5163/api/ThongBao/lay_thong_bao")
        if (!response.ok) throw new Error(`Lỗi HTTP! Status: ${response.status}`)

        const data: ThongBao[] = await response.json()
        setDanhSachThongBao(data)
        if (data.length > 0) setSelectedThongBao(data[0])
        setIsLoading(false)
      } catch (err: any) {
        setError(`Đã xảy ra lỗi khi tải thông báo: ${err.message}`)
        setIsLoading(false)
      }
    }

    fetchThongBao()
  }, [])

  const handleSelectThongBao = (thongBao: ThongBao): void => {
    // Mark the selected notification as read
    if (!thongBao.DaDoc) {
      const updatedList = danhSachThongBao.map((tb) =>
        tb.MaThongBao === thongBao.MaThongBao ? { ...tb, DaDoc: true } : tb,
      )
      setDanhSachThongBao(updatedList)
    }
    setSelectedThongBao(thongBao)
  }

  const handleMarkAllAsRead = () => {
    const updated = danhSachThongBao.map((tb) => ({ ...tb, DaDoc: true }))
    setDanhSachThongBao(updated)
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      return date.toLocaleDateString("vi-VN", options)
    } catch {
      return "Ngày không hợp lệ"
    }
  }

  const getBadgeClass = (loaiThongBao: string): string => {
    switch (loaiThongBao?.toLowerCase()) {
      case "hoạt động":
        return "tb-badge-activity"
      case "học vụ":
        return "tb-badge-academic"
      case "lịch thi":
        return "tb-badge-exam"
      case "học phí":
        return "tb-badge-fee"
      default:
        return "tb-badge-general"
    }
  }

  const countUnreadNotifications = (): number => {
    return danhSachThongBao.filter((tb) => !tb.DaDoc).length
  }

  if (isLoading) {
    return (
      <div className="tb-wrapper">
        <div className="tb-loader">
          <div className="tb-spinner"></div>
          <p>Đang tải thông báo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tb-wrapper">
        <div className="tb-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    )
  }

  const unreadCount = countUnreadNotifications()

  return (
    <div className="tb-wrapper">
      <div className="tb-header">
        <h2>
          <Bell className="tb-icon" />
          Danh sách thông báo
          {unreadCount > 0 && (
            <span className="tb-badge tb-badge-fee" style={{ marginLeft: "8px" }}>
              {unreadCount}
            </span>
          )}
        </h2>
        <button className="tb-mark-read-btn" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
          <CheckCircle size={18} />
          Đánh dấu đã đọc
        </button>
      </div>

      <div className="tb-main">
        <ul className="tb-list">
          {danhSachThongBao.length > 0 ? (
            danhSachThongBao.map((thongBao) => (
              <li
                key={thongBao.MaThongBao}
                className={`tb-item ${selectedThongBao?.MaThongBao === thongBao.MaThongBao ? "tb-selected" : ""} ${thongBao.DaDoc ? "tb-read" : ""}`}
                onClick={() => handleSelectThongBao(thongBao)}
              >
                {!thongBao.DaDoc && <div className="tb-unread-indicator"></div>}
                <div className="tb-content">
                  <h3 className="tb-title">{thongBao.TieuDe}</h3>
                  <div className="tb-meta">
                    <div>
                      <span className={`tb-badge ${getBadgeClass(thongBao.LoaiThongBao)}`}>
                        {thongBao.LoaiThongBao}
                      </span>
                    </div>
                    <div>
                      <Clock size={14} style={{ marginRight: "4px" }} />
                      {formatDate(thongBao.NgayTao)}
                    </div>
                  </div>
                  <div className="tb-author">
                    <User size={14} style={{ marginRight: "4px" }} />
                    {thongBao.TenNguoiTao}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <div className="tb-empty">
              <Bookmark size={40} className="tb-icon" style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p>Chưa có thông báo nào</p>
            </div>
          )}
        </ul>

        {selectedThongBao ? (
          <div className="tb-detail">
            <h2>{selectedThongBao.TieuDe}</h2>
            <div className="tb-detail-meta">
              <div className="meta-item">
                <User size={16} style={{ marginRight: "6px" }} />
                {selectedThongBao.TenNguoiTao}
              </div>
              <div className="meta-item">
                <Calendar size={16} style={{ marginRight: "6px" }} />
                {formatDate(selectedThongBao.NgayTao)}
              </div>
              <div className="meta-item">
                <Tag size={16} style={{ marginRight: "6px" }} />
                <span className={`tb-badge ${getBadgeClass(selectedThongBao.LoaiThongBao)}`}>
                  {selectedThongBao.LoaiThongBao}
                </span>
              </div>
              {/* <div className="meta-item">
                <Eye size={16} style={{ marginRight: "6px" }} />
                {selectedThongBao.SoLuotXem} lượt xem
              </div> */}
            </div>
            <div className="tb-detail-body" dangerouslySetInnerHTML={{ __html: selectedThongBao.NoiDung }}></div>
          </div>
        ) : (
          <div className="tb-detail tb-empty">
            <Bell size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p>Chọn một thông báo để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default XemThongBao
