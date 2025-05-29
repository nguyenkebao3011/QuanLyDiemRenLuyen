

import { Component } from "react"
import axios from "axios"


interface RecommendationItem {
  MaHoatDong: number
  TenHoatDong: string
  LoaiHoatDong: string
//   NgayDienRa: number
  // Thêm các field chi tiết từ API
  MoTa?: string
  NgayBatDau?: string
  NgayKetThuc?: string
  DiaDiem?: string
  SoLuongToiDa?: number
  SoLuongDaDangKy?: number
  DiemCong?: number
  TrangThai?: string
  ThoiGianDienRa?: string
  MaHocKy?: number
  MaQl?: string
  NgayTao?: string
  NgayDienRa?: boolean
}

interface RecommendationResponse {
  Recommendations: RecommendationItem[] | null
  Type: string | null
  Error: string | null
}

interface State {
  recommendations: RecommendationItem[]
  loading: boolean
  error: string | null
  recommendationType: string
  token: string | null
  tenDangNhap: string | null
  currentPage: number
  // Modal states
  showRegisterModal: boolean
  selectedHoatDong: RecommendationItem | null
  modalError: string | null
  modalSuccess: string | null
  modalLoading: boolean
  showDetailModal: boolean
  selectedDetailHoatDong: RecommendationItem | null
}

class RecommendationList extends Component<{}, State> {
  private itemsPerPage = 3

  constructor(props: {}) {
    super(props)
    this.state = {
      recommendations: [],
      loading: true,
      error: null,
      recommendationType: "",
      token: null,
      tenDangNhap: null,
      currentPage: 1,
      showRegisterModal: false,
      selectedHoatDong: null,
      modalError: null,
      modalSuccess: null,
      modalLoading: false,
      showDetailModal: false,
      selectedDetailHoatDong: null,
    }
  }

  componentDidMount() {
    const storedToken = localStorage.getItem("token")
    const storedTenDangNhap = localStorage.getItem("username")

    this.setState(
      {
        token: storedToken,
        tenDangNhap: storedTenDangNhap,
      },
      () => {
        if (this.state.tenDangNhap && this.state.token) {
          this.fetchRecommendations()
        } else {
          this.setState({
            error: "Chưa đăng nhập. Vui lòng đăng nhập để xem gợi ý.",
            loading: false,
          })
        }
      },
    )
  }

  fetchRecommendations = async () => {
    const { tenDangNhap, token } = this.state

    if (!tenDangNhap || !token) {
      this.setState({
        error: "Chưa đăng nhập. Vui lòng đăng nhập để xem gợi ý.",
        loading: false,
      })
      return
    }

    try {
      this.setState({
        loading: true,
        error: null,
      })

      console.log("Gửi maSinhVien:", tenDangNhap)

      const requestData = {
        maSinhVien: tenDangNhap,
        topN: 6,
      }

      const response = await axios.post<RecommendationResponse>(
        "http://localhost:5163/api/HoatDongs/goi-y-hoat-dong",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Response từ API gợi ý:", response.data)

      if (response.data.Error) {
        this.setState({
          error: response.data.Error,
          loading: false,
        })
      } else if (response.data.Recommendations && response.data.Recommendations.length > 0) {
        // Lấy thông tin chi tiết cho mỗi hoạt động
        const detailedRecommendations = await this.fetchDetailedRecommendations(response.data.Recommendations)

        this.setState({
          recommendations: detailedRecommendations,
          recommendationType: response.data.Type || "",
          loading: false,
        })
      } else {
        this.setState({
          error: "Không có gợi ý nào để hiển thị.",
          loading: false,
        })
      }
    } catch (err) {
      console.error("Lỗi khi gọi API gợi ý:", err)
      let errorMessage = "Lỗi không xác định khi gọi API."

      if (axios.isAxiosError(err)) {
        errorMessage = `Lỗi khi gọi API: ${err.response?.data?.message || err.message}`
      }

      this.setState({
        error: errorMessage,
        loading: false,
      })
    }
  }

  // Lấy thông tin chi tiết từ API HoatDong (không có 's')
  fetchDetailedRecommendations = async (recommendations: RecommendationItem[]): Promise<RecommendationItem[]> => {
    const { token } = this.state
    const detailedRecommendations: RecommendationItem[] = []

    for (const rec of recommendations) {
      try {
        if (!rec.MaHoatDong) {
          console.warn("MaHoatDong không tồn tại:", rec)
          continue
        }

        console.log(`Đang lấy chi tiết cho hoạt động ID: ${rec.MaHoatDong}`)

        // Chỉ sử dụng endpoint hoạt động: /api/HoatDong/{id}
        const detailResponse = await axios.get(`http://localhost:5163/api/HoatDong/${rec.MaHoatDong}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (detailResponse.data) {
          console.log(`Chi tiết hoạt động ${rec.MaHoatDong}:`, detailResponse.data)

          // Merge dữ liệu từ gợi ý và chi tiết
          detailedRecommendations.push({
            ...rec,
            ...detailResponse.data, // Ghi đè với dữ liệu chi tiết từ API
          })
        }
      } catch (err) {
        console.error(`Lỗi khi lấy chi tiết hoạt động ${rec.MaHoatDong}:`, err)
        // Nếu không lấy được chi tiết, bỏ qua hoạt động này
        console.warn(`Bỏ qua hoạt động ${rec.MaHoatDong} do không lấy được chi tiết`)
      }
    }

    return detailedRecommendations
  }

  formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
  }

  formatThoiGianDienRa = (ngayBatDau: string, ngayKetThuc: string): string => {
    const start = new Date(ngayBatDau)
    const end = new Date(ngayKetThuc)

    const startTime = start.toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
    })
    const endTime = end.toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
    })

    if (startTime === endTime) {
      return startTime
    }

    return `${startTime}-${endTime}`
  }

  handleRegisterClick = (hoatDong: RecommendationItem) => {
    const token = this.state.token
    if (!token) {
      this.setState({
        modalError: "Bạn cần đăng nhập để đăng ký hoạt động.",
        showRegisterModal: true,
        selectedHoatDong: hoatDong,
      })
      return
    }
    this.setState({
      selectedHoatDong: hoatDong,
      showRegisterModal: true,
      modalError: null,
      modalSuccess: null,
    })
  }

  confirmRegister = async () => {
    const { selectedHoatDong, token } = this.state
    if (!selectedHoatDong) return

    if (!token) {
      this.setState({
        modalError: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        modalLoading: false,
      })
      return
    }

    try {
      this.setState({ modalLoading: true, modalError: null })

      console.log("Đăng ký hoạt động:", {
        maHoatDong: selectedHoatDong.MaHoatDong,
        tenHoatDong: selectedHoatDong.TenHoatDong,
      })

      const response = await axios.post(
        "http://localhost:5163/api/DangKyHoatDongs/dang-ky",
        {
          maHoatDong: selectedHoatDong.MaHoatDong,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("Kết quả đăng ký:", response)

      if (response.status === 200 || response.status === 201) {
        this.setState({
          modalSuccess: "Đăng ký thành công!",
          recommendations: this.state.recommendations.map((hd) =>
            hd.MaHoatDong === selectedHoatDong.MaHoatDong
              ? { ...hd, SoLuongDaDangKy: (hd.SoLuongDaDangKy || 0) + 1 }
              : hd,
          ),
        })

        setTimeout(() => {
          this.setState({
            showRegisterModal: false,
            selectedHoatDong: null,
            modalSuccess: null,
          })
        }, 1500)
      }
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err)
      let errorMessage = "Đã xảy ra lỗi khi đăng ký."

      if (err.response?.status === 401) {
        errorMessage = "Bạn không có quyền đăng ký. Vui lòng đăng nhập lại."
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Dữ liệu đăng ký không hợp lệ."
      } else if (err.response?.status === 409) {
        errorMessage = "Bạn đã đăng ký hoạt động này rồi."
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      this.setState({ modalError: `Lỗi: ${errorMessage}` })
    } finally {
      this.setState({ modalLoading: false })
    }
  }

  cancelRegister = () => {
    this.setState({
      showRegisterModal: false,
      selectedHoatDong: null,
      modalError: null,
      modalSuccess: null,
    })
  }

  handleViewDetail = (hoatDong: RecommendationItem) => {
    this.setState({
      selectedDetailHoatDong: hoatDong,
      showDetailModal: true,
    })
  }

  closeDetailModal = () => {
    this.setState({
      showDetailModal: false,
      selectedDetailHoatDong: null,
    })
  }

  render() {
    const {
      recommendations,
      loading,
      error,
      recommendationType,
      currentPage,
      showRegisterModal,
      selectedHoatDong,
      modalError,
      modalSuccess,
      modalLoading,
      showDetailModal,
      selectedDetailHoatDong,
    } = this.state

    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p className="loading-text">Đang tải gợi ý...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-card">
            <div className="error-content">
              <p className="error-message">Lỗi: {error}</p>
            </div>
          </div>
        </div>
      )
    }

    const startIndex = (currentPage - 1) * this.itemsPerPage
    const currentRecommendations = recommendations.slice(startIndex, startIndex + this.itemsPerPage)
    const totalPages = Math.ceil(recommendations.length / this.itemsPerPage) || 1

    return (
      <div className="hoatdong-container">
        <div className="header">
          <h2 className="hoatdong-title">Gợi ý hoạt động</h2>
          {recommendationType && (
            <div className="recommendation-type">
              <span className="type-label">Loại gợi ý: {recommendationType}</span>
            </div>
          )}
        </div>

        {/* Modal xác nhận đăng ký */}
        {showRegisterModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Xác nhận đăng ký</h3>
              {selectedHoatDong ? (
                <>
                  <div className="modal-body">
                    <p>
                      <strong>Tên hoạt động:</strong> {selectedHoatDong.TenHoatDong}
                    </p>
                    <p>
                      <strong>Loại hoạt động:</strong> {selectedHoatDong.LoaiHoatDong}
                    </p>
                    <p>
                      <strong>Điểm cộng:</strong> {selectedHoatDong.DiemCong}
                    </p>
                    <p>
                      <strong>Số lượng đã đăng ký:</strong> {selectedHoatDong.SoLuongDaDangKy}
                    </p>
                    {!modalSuccess && !modalError && <p>Bạn có chắc chắn muốn đăng ký hoạt động này?</p>}
                  </div>
                </>
              ) : (
                <p className="modal-body">Vui lòng đăng nhập để tiếp tục.</p>
              )}

              {modalSuccess && (
                <div className="success-message">
                  <svg
                    className="icon-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{modalSuccess}</span>
                </div>
              )}

              {modalError && (
                <div className="error-message">
                  <svg
                    className="icon-error"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{modalError}</span>
                </div>
              )}

              {!modalSuccess && (
                <div className="modal-footer">
                  <button onClick={this.cancelRegister} className="btn-cancel" disabled={modalLoading}>
                    Hủy
                  </button>
                  {selectedHoatDong && (
                    <button onClick={this.confirmRegister} className="btn-confirm" disabled={modalLoading}>
                      {modalLoading ? (
                        <>
                          <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="spinner-circle"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        "Xác nhận"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal xem chi tiết */}
        {showDetailModal && selectedDetailHoatDong && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Chi tiết hoạt động</h3>
              <div className="modal-body">
                <p>
                  <strong>Tên hoạt động:</strong> {selectedDetailHoatDong.TenHoatDong}
                </p>
                <p>
                  <strong>Mô tả công việc:</strong> {selectedDetailHoatDong.MoTa}. Sinh viên sẽ tham gia hỗ trợ với sự
                  hướng dẫn của Giảng Viên hoặc các nhân viên nhà trường. Các bạn phải có mặt đúng giờ, chấp hành các
                  nội quy đã đề ra. Sinh viên đăng ký mà không tham gia sẽ bị trừ điểm:{" "}
                  <strong style={{ color: "red" }}>5 điểm/hoạt động</strong>. Mong các bạn thực hiện nghiêm túc!
                </p>
                <p>
                  <strong>Số lượng sinh viên có thể đăng ký:</strong>{" "}
                  {Math.max(
                    0,
                    (selectedDetailHoatDong.SoLuongToiDa || 0) - (selectedDetailHoatDong.SoLuongDaDangKy || 0),
                  )}
                </p>
                <p>
                  <strong>Số điểm cộng:</strong>{" "}
                  <strong style={{ color: "red" }}>{selectedDetailHoatDong.DiemCong}</strong>
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {selectedDetailHoatDong.NgayBatDau && this.formatDate(selectedDetailHoatDong.NgayBatDau)} →{" "}
                  {selectedDetailHoatDong.NgayKetThuc && this.formatDate(selectedDetailHoatDong.NgayKetThuc)} từ{" "}
                  {selectedDetailHoatDong.NgayBatDau &&
                    selectedDetailHoatDong.NgayKetThuc &&
                    this.formatThoiGianDienRa(selectedDetailHoatDong.NgayBatDau, selectedDetailHoatDong.NgayKetThuc)}
                </p>
                <p>
                  <strong>Địa điểm:</strong> {selectedDetailHoatDong.DiaDiem}
                </p>
                <p>
                  <strong>Quy định về đồng phục: </strong> Đối với các hoạt động trong trường:{" "}
                  <strong style={{ color: "red" }}>
                    Các bạn vui lòng thực hiện đúng đồng phục (áo sơ mi, áo thể chất, áo khoa,...)
                  </strong>{" "}
                  . Đối với các hoạt động ngoài trường, nhà trường vẫn khuyến khích các bạn mặc đồng phục nhà trường để
                  thuận tiện cho công tác quản lý điểm danh sinh viên. Các bạn muốn mặc trang phục khác phải chỉnh tề,
                  nghiêm túc phù hợp với hoạt động.
                </p>
              </div>
              <div className="modal-footer">
                <button onClick={this.closeDetailModal} className="btn-cancel">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {recommendations.length === 0 ? (
          <div className="no-data-container">
            <p className="no-data">Không có gợi ý nào hoặc không thể lấy chi tiết hoạt động.</p>
          </div>
        ) : (
          <>
            <div className="hoatdong-list">
              {currentRecommendations.map((hd) => (
                <div className="hoatdong-card" key={hd.MaHoatDong}>
                  <div className="hoatdong-header">
                    <h3>{hd.TenHoatDong}</h3>
                    <span className={`status-badge ${(hd.TrangThai || "").toLowerCase().replace(/\s+/g, "-")}`}>
                      {hd.TrangThai}
                    </span>
                  </div>
                  <div className="hoatdong-content">
                    <p className="hoatdong-desc">{hd.MoTa}</p>
                    <div className="hoatdong-details">
                      <p>
                        <i className="icon-calendar"></i> <strong>Thời gian:</strong>{" "}
                        {hd.NgayBatDau && this.formatDate(hd.NgayBatDau)}
                      </p>
                      <p>
                        <i className="icon-location"></i> <strong>Địa điểm:</strong> {hd.DiaDiem}
                      </p>
                      <p>
                        <i className="icon-user"></i> <strong>Số lượng tối đa:</strong> {hd.SoLuongToiDa}
                      </p>
                      <p>
                        <i className="icon-star"></i> <strong>Điểm cộng:</strong> {hd.DiemCong}
                      </p>
                      <p>
                        <i className="icon-watch"></i> <strong>Thời gian diễn ra:</strong>{" "}
                        {hd.NgayBatDau && hd.NgayKetThuc && this.formatThoiGianDienRa(hd.NgayBatDau, hd.NgayKetThuc)}
                      </p>
                    </div>
                  </div>
                  <div className="hoatdong-footer">
                    <button
                      className="btn-dangky"
                      onClick={() => this.handleRegisterClick(hd)}
                      disabled={hd.TrangThai === "Đã kết thúc" || hd.TrangThai === "Hủy bỏ"}
                    >
                      Đăng ký tham gia
                    </button>
                    <button className="btn-chitiet" onClick={() => this.handleViewDetail(hd)}>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-page"
                  disabled={currentPage === 1}
                  onClick={() => this.setState({ currentPage: currentPage - 1 })}
                >
                  «
                </button>
                <span className="page-info">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  className="btn-page"
                  disabled={currentPage === totalPages}
                  onClick={() => this.setState({ currentPage: currentPage + 1 })}
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    )
  }
}

export default RecommendationList
