"use client"

import React from "react"
import "../css/XemLichTheoTuan.css"

interface Activity {
  MaDangKy: string
  MaHocKy: string
  MaSv: string
  MaHoatDong: string
  TenHoatDong: string
  NgayBatDau: string
  MoTa: string
  diaDiem: string
  diemCong: number
  SoLuongDaDangKy: number
  TrangThaiHoatDong: string
  NgayDangKy: string
}

interface ActivityCalendarProps {
  isOpen: boolean
  onClose: () => void
}

interface ActivityCalendarState {
  activities: Activity[]
  currentWeek: Date
  isLoading: boolean
  error: string | null
  selectedActivity: Activity | null
  showActivityDetail: boolean
}

class XemLichTheoTuan extends React.Component<ActivityCalendarProps, ActivityCalendarState> {
  constructor(props: ActivityCalendarProps) {
    super(props)
    this.state = {
      activities: [],
      currentWeek: new Date(),
      isLoading: false,
      error: null,
      selectedActivity: null,
      showActivityDetail: false,
    }
  }

  componentDidMount() {
    if (this.props.isOpen) {
      this.fetchActivities()
    }
  }

  componentDidUpdate(prevProps: ActivityCalendarProps) {
    if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      this.fetchActivities()
    }
  }

  fetchActivities = async () => {
    this.setState({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.")
      }

      const [ongoingResponse, endedResponse] = await Promise.all([
        fetch("http://localhost:5163/api/DangKyHoatDongs/danh-sach-dang-ky", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5163/api/DangKyHoatDongs/danh-sach-dang-ky-da-ket-thuc", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!ongoingResponse.ok || !endedResponse.ok) {
        throw new Error("Lỗi khi tải dữ liệu từ server")
      }

      const ongoingData = await ongoingResponse.json()
      const endedData = await endedResponse.json()

      const allActivities = [...(ongoingData.data || []), ...(endedData.data || [])]
      this.setState({ activities: allActivities, isLoading: false })
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách hoạt động:", error)
      this.setState({
        error: error.message || "Có lỗi xảy ra khi tải dữ liệu",
        isLoading: false,
      })
    }
  }

  getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1) // Bắt đầu từ thứ 2
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  getActivitiesForDay = (day: Date): Activity[] => {
    return this.state.activities.filter((activity) => {
      const activityDate = new Date(activity.NgayBatDau)
      return activityDate.toDateString() === day.toDateString()
    })
  }

  handlePreviousWeek = () => {
    const newDate = new Date(this.state.currentWeek)
    newDate.setDate(this.state.currentWeek.getDate() - 7)
    this.setState({ currentWeek: newDate })
  }

  handleNextWeek = () => {
    const newDate = new Date(this.state.currentWeek)
    newDate.setDate(this.state.currentWeek.getDate() + 7)
    this.setState({ currentWeek: newDate })
  }

  handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value)
    if (!isNaN(selectedDate.getTime())) {
      this.setState({ currentWeek: selectedDate })
    }
  }

  handleActivityClick = (activity: Activity) => {
    this.setState({
      selectedActivity: activity,
      showActivityDetail: true,
    })
  }

  closeActivityDetail = () => {
    this.setState({
      selectedActivity: null,
      showActivityDetail: false,
    })
  }

  formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  getWeekRange = (date: Date): string => {
    const weekDays = this.getWeekDays(date)
    const start = weekDays[0]
    const end = weekDays[6]
    return `${start.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString("vi-VN")}`
  }

  render() {
    const { isOpen, onClose } = this.props
    const { currentWeek, isLoading, error, selectedActivity, showActivityDetail } = this.state
    const weekDays = this.getWeekDays(currentWeek)
    const weekRange = this.getWeekRange(currentWeek)

    if (!isOpen) return null

    return (
      <div className="calendar-modal-overlay">
        <div className="calendar-modal">
          <div className="calendar-content">
            <div className="calendar-header">
              <div className="calendar-nav">
                <button
                  type="button"
                  className="nav-btn prev-btn"
                  onClick={this.handlePreviousWeek}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Tuần trước
                </button>

                <div className="calendar-title">
                  <h2>Lịch hoạt động theo tuần</h2>
                  <p className="week-range">{weekRange}</p>
                </div>

                <button type="button" className="nav-btn next-btn" onClick={this.handleNextWeek} disabled={isLoading}>
                  Tuần sau
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              <div className="calendar-controls">
                <input
                  type="date"
                  className="date-picker"
                  value={currentWeek.toISOString().split("T")[0]}
                  onChange={this.handleDateChange}
                  disabled={isLoading}
                />
                <button type="button" className="close-button" onClick={onClose}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="calendar-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải lịch hoạt động...</p>
              </div>
            )}

            {error && (
              <div className="calendar-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>{error}</p>
                <button onClick={this.fetchActivities} className="retry-btn">
                  Thử lại
                </button>
              </div>
            )}

            {!isLoading && !error && (
              <div className="calendar-grid-container">
                {/* Header với tên các ngày */}
                <div className="calendar-grid calendar-header-grid">
                  <div className="calendar-time-header">Thời gian</div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="calendar-day-header">
                      <div className="day-name">{day.toLocaleDateString("vi-VN", { weekday: "short" })}</div>
                      <div className="day-date">
                        {day.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buổi sáng */}
                <div className="calendar-grid">
                  <div className="calendar-time-slot morning">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    Buổi sáng
                    <span className="time-range">(6:00 - 12:00)</span>
                  </div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="calendar-day-slot">
                      {this.getActivitiesForDay(day)
                        .filter((activity) => {
                          const hour = new Date(activity.NgayBatDau).getHours()
                          return hour >= 6 && hour < 12
                        })
                        .map((activity, idx) => (
                          <div
                            key={idx}
                            className="activity-card morning-activity"
                            onClick={() => this.handleActivityClick(activity)}
                          >
                            <div className="activity-header">
                              <h4 className="activity-title2">{activity.TenHoatDong}</h4>
                              <span className="activity-time">{this.formatTime(activity.NgayBatDau)}</span>
                            </div>
                            <div className="activity-status-wrapper">
                                                        <div
                              className={`activity-status ${
                                activity.TrangThaiHoatDong === "Đã kết thúc"
                                  ? "ended"
                                  : activity.TrangThaiHoatDong === "Đang mở đăng ký"
                                  ? "open"
                                  : activity.TrangThaiHoatDong === "Đã đóng đăng ký"
                                  ? "closed"
                                  : activity.TrangThaiHoatDong === "Đang diễn ra"
                                  ? "in-progress"
                                  : ""
                              }`}
                            >
                              {activity.TrangThaiHoatDong}
                            </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>

                {/* Buổi chiều */}
                <div className="calendar-grid">
                  <div className="calendar-time-slot afternoon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    Buổi chiều
                    <span className="time-range">(12:00 - 18:00)</span>
                  </div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="calendar-day-slot">
                      {this.getActivitiesForDay(day)
                        .filter((activity) => {
                          const hour = new Date(activity.NgayBatDau).getHours()
                          return hour >= 12 && hour < 18
                        })
                        .map((activity, idx) => (
                          <div
                            key={idx}
                            className="activity-card afternoon-activity"
                            onClick={() => this.handleActivityClick(activity)}
                          >
                            <div className="activity-header">
                              <h4 className="activity-title2">{activity.TenHoatDong}</h4>
                              <span className="activity-time">{this.formatTime(activity.NgayBatDau)}</span>
                            </div>
                            <div className="activity-status-wrapper">
                              <div
                                className={`activity-status ${activity.TrangThaiHoatDong === "Đã kết thúc" ? "ended" : "active"}`}
                              >
                                {activity.TrangThaiHoatDong}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>

                {/* Buổi tối */}
                <div className="calendar-grid">
                  <div className="calendar-time-slot evening">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    Buổi tối
                    <span className="time-range">(18:00 - 24:00)</span>
                  </div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="calendar-day-slot">
                      {this.getActivitiesForDay(day)
                        .filter((activity) => {
                          const hour = new Date(activity.NgayBatDau).getHours()
                          return hour >= 18
                        })
                        .map((activity, idx) => (
                          <div
                            key={idx}
                            className="activity-card evening-activity"
                            onClick={() => this.handleActivityClick(activity)}
                          >
                            <div className="activity-header">
                              <h4 className="activity-title2">{activity.TenHoatDong}</h4>
                              <span className="activity-time">{this.formatTime(activity.NgayBatDau)}</span>
                            </div>
                            <div className="activity-status-wrapper">
                              <div
                                className={`activity-status ${activity.TrangThaiHoatDong === "Đã kết thúc" ? "ended" : "active"}`}
                              >
                                {activity.TrangThaiHoatDong}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>

                {/* Thông báo khi không có hoạt động */}
                {this.state.activities.length === 0 && (
                  <div className="no-activities">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>Không có hoạt động nào trong tuần này</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal chi tiết hoạt động */}
        {showActivityDetail && selectedActivity && (
          <div className="activity-detail-overlay" onClick={this.closeActivityDetail}>
            <div className="activity-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="activity-detail-header">
                <h3>{selectedActivity.TenHoatDong}</h3>
                <button className="close-detail-btn" onClick={this.closeActivityDetail}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="activity-detail-content">
                <div className="detail-section">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Thời gian</span>
                      <span className="detail-value">
                        {this.formatDate(selectedActivity.NgayBatDau)} lúc {this.formatTime(selectedActivity.NgayBatDau)}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Địa điểm</span>
                      <span className="detail-value">{selectedActivity.diaDiem || "Chưa xác định"}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Điểm cộng</span>
                      <span className="detail-value highlight-points">{selectedActivity.diemCong} điểm</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Mô tả</span>
                      <span className="detail-value">{selectedActivity.MoTa || "Không có mô tả"}</span>
                    </div>
                  </div>

                  

                  <div className="detail-item">
                    <div className="detail-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Trạng thái</span>
                      <span
                        className={`detail-status ${selectedActivity.TrangThaiHoatDong === "Đã kết thúc" ? "ended" : "active"}`}
                      >
                        {selectedActivity.TrangThaiHoatDong}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="activity-detail-footer">
                <button className="close-detail-btn-text" onClick={this.closeActivityDetail}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default XemLichTheoTuan
