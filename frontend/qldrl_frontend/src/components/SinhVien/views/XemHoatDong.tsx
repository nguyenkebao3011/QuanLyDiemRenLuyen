import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/XemHoatDong.css";
import { useNavigate } from "react-router-dom";

type HoatDong = {
  MaHoatDong: number;
  TenHoatDong: string;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  DiaDiem: string;
  SoLuongToiDa: number;
  SoLuongDaDangKy: number;
  DiemCong: number;
  TrangThai: string;
  ThoiGianDienRa: string;
};

const HoatDongList: React.FC = () => {
  const navigate = useNavigate();
  const [hoatDongList, setHoatDongList] = useState<HoatDong[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState("http://localhost:5163/api/HoatDongs/lay-danh-sach-hoat-dong");
  const itemsPerPage = 6;

  // State cho bộ lọc
  const [ten, setTen] = useState("");
  const [batDauTu, setBatDauTu] = useState("");
  const [ketThucTruoc, setKetThucTruoc] = useState("");
  const [diemMin, setDiemMin] = useState("");
  const [diemMax, setDiemMax] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);

  // State cho modal đăng ký
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedHoatDong, setSelectedHoatDong] = useState<HoatDong | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // State cho modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailHoatDong, setSelectedDetailHoatDong] = useState<HoatDong | null>(null);

  // Hàm lấy token từ localStorage
  const getToken = () => localStorage.getItem("token");

  // Hàm xử lý khi nhấn nút đăng ký
  const handleRegisterClick = (hoatDong: HoatDong) => {
    const token = getToken();
    if (!token) {
      setModalError("Bạn cần đăng nhập để đăng ký hoạt động.");
      setShowRegisterModal(true);
      return;
    }
    setSelectedHoatDong(hoatDong);
    setShowRegisterModal(true);
    setModalError(null);
    setModalSuccess(null);
  };

  // Hàm xác nhận đăng ký
  const confirmRegister = async () => {
    if (!selectedHoatDong) return;

    const token = getToken();
    if (!token) {
      setModalError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setModalLoading(false);
      return;
    }

    try {
      setModalLoading(true);
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
        }
      );

      if (response.status === 200 || response.status === 201) {
        setModalSuccess("Đăng ký thành công!");
        setHoatDongList((prevList) =>
          prevList.map((hd) =>
            hd.MaHoatDong === selectedHoatDong.MaHoatDong
              ? { ...hd, SoLuongDaDangKy: hd.SoLuongDaDangKy + 1 }
              : hd
          )
        );
        setTimeout(() => {
          setShowRegisterModal(false);
          setSelectedHoatDong(null);
          setModalSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      let errorMessage = "Đã xảy ra lỗi khi đăng ký.";
      if (err.response?.status === 401) {
        errorMessage = "Bạn không có quyền đăng ký. Vui lòng đăng nhập lại.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setModalError(`Lỗi: ${errorMessage}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Hàm hủy đăng ký
  const cancelRegister = () => {
    setShowRegisterModal(false);
    setSelectedHoatDong(null);
    setModalError(null);
    setModalSuccess(null);
  };

  // Chức năng lọc hoạt động
  const applyFilters = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5163/api/HoatDongs/loc-hoat-dong?";

      if (ten) url += `Ten=${encodeURIComponent(ten)}&`;
      if (batDauTu) url += `BatDauTu=${encodeURIComponent(batDauTu)}&`;
      if (ketThucTruoc) url += `KetThucTruoc=${encodeURIComponent(ketThucTruoc)}&`;
      if (diemMin) url += `DiemMin=${encodeURIComponent(diemMin)}&`;
      if (diemMax) url += `DiemMax=${encodeURIComponent(diemMax)}&`;
      if (trangThai) url += `TrangThai=${encodeURIComponent(trangThai)}&`;

      url = url.endsWith("&") ? url.slice(0, -1) : url;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken() || ""}`,
        },
      });

      if (response.data) {
        setHoatDongList(response.data);
        setCurrentPage(1);
        setError(null);
      }
    } catch (err: any) {
      console.error("Lỗi khi lọc hoạt động:", err);
      setError(`Lỗi khi lọc hoạt động: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xóa bộ lọc
  const clearFilters = () => {
    setTen("");
    setBatDauTu("");
    setKetThucTruoc("");
    setDiemMin("");
    setDiemMax("");
    setTrangThai("");
    fetchHoatDong();
  };

  // Hàm lấy danh sách hoạt động
  const fetchHoatDong = async () => {
    try {
      setLoading(true);

      const response = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken() || ""}`,
        },
      });

      if (response.data) {
        const chuaKetThuc = response.data.filter(
          (hd: HoatDong) => hd.TrangThai !== "Đã kết thúc"
        );
        setHoatDongList(chuaKetThuc);
        setError(null);
      }
    } catch (err: any) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      setError(`API error (${err.response?.status || "unknown"}): ${err.message}`);

      console.log("Chi tiết lỗi:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        url: apiUrl,
      });

      const alternativeEndpoints = [
        "http://localhost:5163/api/HoatDongs",
        "http://localhost:5163/api/HoatDong/lay-danh-sach-hoat-dong",
      ];

      let dataFetched = false;

      for (const endpoint of alternativeEndpoints) {
        if (endpoint === apiUrl) continue;

        try {
          console.log(`Thử với endpoint: ${endpoint}`);
          const altResponse = await axios.get(endpoint, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${getToken() || ""}`,
            },
          });

          if (altResponse.data) {
            const chuaKetThuc = altResponse.data.filter(
              (hd: HoatDong) => hd.TrangThai !== "Đã kết thúc"
            );
            setHoatDongList(chuaKetThuc);
            setError(null);
            setApiUrl(endpoint);
            dataFetched = true;
            console.log(`Endpoint hoạt động: ${endpoint}`);
            break;
          }
        } catch (altErr) {
          console.log(`Endpoint không hoạt động: ${endpoint}`, altErr);
        }
      }

      if (!dataFetched) {
        setHoatDongList([
          {
            MaHoatDong: 1,
            TenHoatDong: "Hoạt động mẫu 1",
            MoTa: "Đây là dữ liệu mẫu khi không thể kết nối đến API",
            NgayBatDau: new Date().toISOString(),
            NgayKetThuc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            DiaDiem: "Trường Đại học",
            SoLuongToiDa: 100,
            SoLuongDaDangKy: 50,
            DiemCong: 5,
            TrangThai: "Sắp diễn ra",
            ThoiGianDienRa: "1000",
          },
          {
            MaHoatDong: 2,
            TenHoatDong: "Hoạt động mẫu 2",
            MoTa: "Hoạt động thử nghiệm khi API gặp lỗi",
            NgayBatDau: new Date().toISOString(),
            NgayKetThuc: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            DiaDiem: "Hội trường",
            SoLuongToiDa: 50,
            SoLuongDaDangKy: 20,
            DiemCong: 3,
            TrangThai: "Đang diễn ra",
            ThoiGianDienRa: "1000",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoatDong();
  }, [apiUrl]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHoatDongs = hoatDongList.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(hoatDongList.length / itemsPerPage) || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Hàm định dạng thời gian diễn ra từ NgayBatDau và NgayKetThuc
  const formatThoiGianDienRa = (ngayBatDau: string, ngayKetThuc: string) => {
    const start = new Date(ngayBatDau);
    const end = new Date(ngayKetThuc);
    if (start.toDateString() !== end.toDateString()) return "Chưa xác định";
    const formatTime = (date: Date) => date.toTimeString().slice(0, 5); // Lấy HH:mm
    return `${formatTime(start)}-${formatTime(end)}`;
  };

  // Hàm mở modal xem chi tiết
  const handleViewDetail = (hoatDong: HoatDong) => {
    setSelectedDetailHoatDong(hoatDong);
    setShowDetailModal(true);
  };

  // Hàm đóng modal xem chi tiết
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetailHoatDong(null);
  };

  return (
    <div className="hoatdong-container">
      <h2 className="hoatdong-title">Danh sách hoạt động</h2>

      {/* Toggle button cho bộ lọc */}
      <div className="filter-toggle">
        <button
          className="btn-toggle-filter"
          onClick={() => setFilterVisible(!filterVisible)}
        >
          {filterVisible ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
        </button>
      </div>

      {/* Bộ lọc hoạt động */}
      {filterVisible && (
        <div className="filter-container">
          <h3 className="filter-title">Lọc hoạt động</h3>
          <div className="filter-form">
            <div className="filter-row">
              <div className="filter-group">
                <label>Tên hoạt động:</label>
                <input
                  type="text"
                  value={ten}
                  onChange={(e) => setTen(e.target.value)}
                  placeholder="Nhập tên hoạt động"
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Trạng thái:</label>
                <select
                  value={trangThai}
                  onChange={(e) => setTrangThai(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  <option value="Sắp diễn ra">CHƯA BẮT ĐẦU</option>
                  <option value="Đang diễn ra">Đang diễn ra</option>
                  <option value="Đã kết thúc">Đã kết thúc</option>
                  <option value="Hủy bỏ">Hủy bỏ</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Bắt đầu từ:</label>
                <input
                  type="datetime-local"
                  value={batDauTu}
                  onChange={(e) => setBatDauTu(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Kết thúc trước:</label>
                <input
                  type="datetime-local"
                  value={ketThucTruoc}
                  onChange={(e) => setKetThucTruoc(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Điểm tối thiểu:</label>
                <input
                  type="number"
                  value={diemMin}
                  onChange={(e) => setDiemMin(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Điểm tối đa:</label>
                <input
                  type="number"
                  value={diemMax}
                  onChange={(e) => setDiemMax(e.target.value)}
                  placeholder="10"
                  min="0"
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="btn-clear-filter">
                Xóa bộ lọc
              </button>
              <button onClick={applyFilters} className="btn-apply-filter">
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <strong>Điểm cộng:</strong> {selectedHoatDong.DiemCong}
                  </p>
                  <p>
                    <strong>Số lượng đã đăng ký:</strong> {selectedHoatDong.SoLuongDaDangKy}
                  </p>
                  {!modalSuccess && !modalError && (
                    <p>Bạn có chắc chắn muốn đăng ký hoạt động này?</p>
                  )}
                </div>
              </>
            ) : (
              <p className="modal-body">Vui lòng đăng nhập để tiếp tục.</p>
            )}

            {/* Thông báo thành công */}
            {modalSuccess && (
              <div className="success-message">
                <svg
                  className="icon-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Thông báo lỗi */}
            {modalError && (
              <div className="error-message">
                <svg
                  className="icon-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>{modalError}</span>
              </div>
            )}

            {/* Nút điều khiển */}
            {!modalSuccess && (
              <div className="modal-footer">
                <button
                  onClick={cancelRegister}
                  className="btn-cancel"
                  disabled={modalLoading}
                >
                  Hủy
                </button>
                {selectedHoatDong && (
                  <button
                    onClick={confirmRegister}
                    className="btn-confirm"
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <svg
                          className="spinner"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="spinner-circle"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="spinner-path"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
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
                <strong>Mô tả công việc:</strong> {selectedDetailHoatDong.MoTa}. Sinh viên sẽ tham gia hỗ trợ với sự hướng dẫn của Giảng Viên hoặc các nhân viên nhà trường. Các bạn phải có mặt đúng giờ, chấp hành các nội quy đã đề ra. Sinh viên đăng ký mà không tham gia sẽ bị trừ điểm như quy định hiện hành. Mong các bạn thực hiện nghiêm túc!
              </p>
              <p>
                <strong>Số lượng sinh viên có thể đăng ký:</strong>{" "}
                {Math.max(0, selectedDetailHoatDong.SoLuongToiDa - selectedDetailHoatDong.SoLuongDaDangKy)}
              </p>
              <p>
                <strong>Số điểm cộng:</strong> {selectedDetailHoatDong.DiemCong}
              </p>
              <p>
                <strong>Thời gian:</strong> {formatDate(selectedDetailHoatDong.NgayBatDau)} từ{" "}
                {formatThoiGianDienRa(selectedDetailHoatDong.NgayBatDau, selectedDetailHoatDong.NgayKetThuc)}
              </p>
              <p>
                <strong>Địa điểm:</strong> {selectedDetailHoatDong.DiaDiem}
              </p>
              <p>
                <strong>Quy định về đồng phục: </strong> Đối với các hoạt động trong trường: Các bạn vui lòng thực hiện đúng đồng phục (áo sơ mi, áo thể chất, áo khoa,...). Đối với các hoạt động ngoài trường, nhà trường vẫn khuyến khích các bạn mặc đồng phục nhà trường để thuận tiện cho công tác quản lý điểm danh sinh viên. Các bạn muốn mặc trang phục khác phải chỉnh tề, nghiêm túc phù hợp với hoạt động.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={closeDetailModal} className="btn-cancel">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p className="error-title">Không thể tải dữ liệu</p>
          <p className="error-details">{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn-reload">
              Làm mới trang
            </button>
            <div className="api-url-changer">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="api-input"
                placeholder="Nhập URL API mới"
              />
              <button onClick={() => {}} className="btn-change-api">
                Thay đổi API
              </button>
            </div>
            <div className="api-test-options">
              <p>Các API có thể thử:</p>
              <button
                onClick={() => setApiUrl("http://localhost:5163/api/HoatDongs")}
                className="btn-api-option"
              >
                /api/HoatDongs
              </button>
              <button
                onClick={() => setApiUrl("http://localhost:5163/api/HoatDong")}
                className="btn-api-option"
              >
                /api/HoatDong
              </button>
              <button
                onClick={() => setApiUrl("http://localhost:5163/api/HoatDong/danh-sach")}
                className="btn-api-option"
              >
                /api/HoatDong/danh-sach
              </button>
            </div>
          </div>
        </div>
      ) : currentHoatDongs.length === 0 ? (
        <div className="no-data-container">
          <p className="no-data">Không có hoạt động nào phù hợp với bộ lọc hiện tại.</p>
          {filterVisible && (
            <button onClick={clearFilters} className="btn-clear-filter-centered">
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hoatdong-list">
            {currentHoatDongs.map((hd) => (
              <div className="hoatdong-card" key={hd.MaHoatDong}>
                <div className="hoatdong-header">
                  <h3>{hd.TenHoatDong}</h3>
                  <span
                    className={`status-badge ${hd.TrangThai.toLowerCase().replace(
                      /\s+/g,
                      "-"
                    )}`}
                  >
                    {hd.TrangThai}
                  </span>
                </div>
                <div className="hoatdong-content">
                  <p className="hoatdong-desc">{hd.MoTa}</p>
                  <div className="hoatdong-details">
                    <p>
                      <i className="icon-calendar"></i> <strong>Thời gian:</strong>{" "}
                      {formatDate(hd.NgayBatDau)} → {formatDate(hd.NgayKetThuc)}
                    </p>
                    <p>
                      <i className="icon-location"></i> <strong>Địa điểm:</strong> {hd.DiaDiem}
                    </p>
                    <p>
                      <i className="icon-user"></i> <strong>Số lượng tối đa:</strong>{" "}
                      {hd.SoLuongToiDa}
                    </p>
                    <p>
                      <i className="icon-star"></i> <strong>Điểm cộng:</strong> {hd.DiemCong}
                    </p>
                    <p>
                      <i className="icon-watch"></i>{" "}
                      <strong>Thời gian diễn ra:</strong>{" "}
                      {formatThoiGianDienRa(hd.NgayBatDau, hd.NgayKetThuc)}
                    </p>
                  </div>
                </div>
                <div className="hoatdong-footer">
                  <button
                    className="btn-dangky"
                    onClick={() => handleRegisterClick(hd)}
                    disabled={hd.TrangThai === "Đã kết thúc" || hd.TrangThai === "Hủy bỏ"}
                  >
                    Đăng ký tham gia
                  </button>
                  <button className="btn-chitiet" onClick={() => handleViewDetail(hd)}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              className="btn-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              «
            </button>
            <span className="page-info">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="btn-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              »
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HoatDongList;