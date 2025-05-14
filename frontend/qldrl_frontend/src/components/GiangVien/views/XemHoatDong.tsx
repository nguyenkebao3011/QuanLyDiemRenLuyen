import React, { useEffect, useState } from "react";
import axios from "axios";
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

type Class = {
  maLop: string;
  tenLop: string;
};

type Student = {
  maSV: string;
  hoTen: string;
  maLop: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  ngaySinh: string;
  gioiTinh: string;
  maVaiTro: number;
  trangThai: string;
  tenLop: string;
  anhDaiDien: string | null;
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

  // State cho modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailHoatDong, setSelectedDetailHoatDong] = useState<HoatDong | null>(null);

  // State cho modal chỉ định sinh viên
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignHoatDong, setAssignHoatDong] = useState<HoatDong | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  // Hàm lấy token từ localStorage
  const getToken = () => localStorage.getItem("token");

  // Hàm lấy danh sách lớp
  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5163/api/Lops/lay_danh_sach_lop_theo_giang_vien', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const mappedClasses = response.data.map((cls: any) => ({
        maLop: cls.MaLop,
        tenLop: cls.TenLop,
      }));
      console.log("Danh sách lớp đã ánh xạ:", mappedClasses);
      setClasses(mappedClasses);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lớp:", error);
      setAssignError('Lỗi khi lấy danh sách lớp.');
    }
  };

  // Hàm lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5163/api/SinhVien/lay-sinhvien-theo-vai-tro', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const mappedStudents = response.data.map((student: any) => ({
        maSV: student.MaSV,
        hoTen: student.HoTen,
        maLop: student.MaLop,
        email: student.Email,
        soDienThoai: student.SoDienThoai,
        diaChi: student.DiaChi,
        ngaySinh: student.NgaySinh,
        gioiTinh: student.GioiTinh,
        maVaiTro: student.MaVaiTro,
        trangThai: student.TrangThai,
        tenLop: student.TenLop,
        anhDaiDien: student.AnhDaiDien,
      }));
      console.log("Danh sách sinh viên đã ánh xạ:", mappedStudents);
      setStudents(mappedStudents);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      setAssignError('Lỗi khi lấy danh sách sinh viên.');
    }
  };

  // Hàm mở modal chỉ định sinh viên
  const handleAssignClick = (hoatDong: HoatDong) => {
    const token = getToken();
    console.log("Token:", token);
    if (!token) {
      setAssignError("Bạn cần đăng nhập để chỉ định sinh viên.");
      setShowAssignModal(true);
      return;
    }
    setAssignHoatDong(hoatDong);
    setShowAssignModal(true);
    setAssignError(null);
    setAssignSuccess(null);
    setSelectedClass("");
    setSelectedStudents([]);
    fetchClasses();
    fetchStudents();
  };

  // Hàm xử lý chọn lớp
  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(event.target.value);
    setSelectedStudents([]);
    setAssignError(null);
    setAssignSuccess(null);
  };

  // Hàm xử lý chọn sinh viên
  const handleStudentSelect = (maSV: string) => {
    setSelectedStudents((prev) =>
      prev.includes(maSV) ? prev.filter((id) => id !== maSV) : [...prev, maSV]
    );
    setAssignError(null);
    setAssignSuccess(null);
  };

  // Hàm gửi yêu cầu chỉ định
  const confirmAssign = async () => {
    if (!assignHoatDong || selectedStudents.length === 0) {
      setAssignError("Vui lòng chọn ít nhất một sinh viên.");
      return;
    }

    const token = getToken();
    if (!token) {
      setAssignError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setAssignLoading(true);
      const response = await axios.post(
        `http://localhost:5163/chi-dinh/${assignHoatDong.MaHoatDong}/cho-sinh-vien`,
        { maHoatDong: assignHoatDong.MaHoatDong, maSVs: selectedStudents },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignSuccess("Chỉ định sinh viên thành công!");
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignHoatDong(null);
        setAssignSuccess(null);
        setSelectedStudents([]);
        setSelectedClass("");
      }, 1500);
    } catch (error: any) {
      setAssignError(error.response?.data || "Lỗi khi chỉ định sinh viên.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Hàm đóng modal chỉ định
  const cancelAssign = () => {
    setShowAssignModal(false);
    setAssignHoatDong(null);
    setAssignError(null);
    setAssignSuccess(null);
    setSelectedStudents([]);
    setSelectedClass("");
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
  const currentHoatDungs = hoatDongList.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(hoatDongList.length / itemsPerPage) || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatThoiGianDienRa = (ngayBatDau: string, ngayKetThuc: string) => {
    const start = new Date(ngayBatDau);
    const end = new Date(ngayKetThuc);
    if (start.toDateString() !== end.toDateString()) return "Chưa xác định";
    const formatTime = (date: Date) => date.toTimeString().slice(0, 5);
    return `${formatTime(start)}-${formatTime(end)}`;
  };

  const handleViewDetail = (hoatDong: HoatDong) => {
    setSelectedDetailHoatDong(hoatDong);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetailHoatDong(null);
  };

  return (
    <div className="hoatdong-container">
      <h2 className="hoatdong-title">Danh sách hoạt động</h2>

      <div className="filter-toggle">
        <button
          className="btn-toggle-filter"
          onClick={() => setFilterVisible(!filterVisible)}
        >
          {filterVisible ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
        </button>
      </div>

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
                  <option key="tat-ca" value="">Tất cả</option>
                  <option key="sap-dien-ra" value="Sắp diễn ra">CHƯA BẮT ĐẦU</option>
                  <option key="dang-dien-ra" value="Đang diễn ra">Đang diễn ra</option>
                  <option key="da-ket-thuc" value="Đã kết thúc">Đã kết thúc</option>
                  <option key="huy-bo" value="Hủy bỏ">Hủy bỏ</option>
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

      {/* Modal xem chi tiết */}
      {showDetailModal && selectedDetailHoatDong && (
        <div className="modal-overlay" style={styles.modalOverlay}>
          <div className="modal-content" style={styles.modalContent}>
            <h3 className="modal-title" style={styles.modalTitle}>Chi tiết hoạt động</h3>
            <div className="modal-body" style={styles.modalBody}>
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
            <div className="modal-footer" style={styles.modalFooter}>
              <button onClick={closeDetailModal} className="btn-cancel" style={styles.btnCancel}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉ định sinh viên */}
      {showAssignModal && (
        <div className="modal-overlay" style={styles.modalOverlay}>
          <div className="modal-content modal-assign-content" style={{ ...styles.modalContent, width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 className="modal-title" style={styles.modalTitle}>Chỉ định sinh viên</h3>
            {assignHoatDong ? (
              <>
                <div className="modal-body" style={styles.modalBody}>
                  <p><strong>Hoạt động:</strong> {assignHoatDong.TenHoatDong}</p>
                  <p><strong>Mã hoạt động:</strong> {assignHoatDong.MaHoatDong}</p>

                  {/* Chọn lớp */}
                  <div className="form-group" style={styles.formGroup}>
                    <label htmlFor="class-select" style={styles.label}>Chọn lớp:</label>
                    <select
                      id="class-select"
                      value={selectedClass}
                      onChange={handleClassChange}
                      disabled={assignLoading}
                      style={styles.select}
                    >
                      <option value="">-- Chọn lớp --</option>
                      {classes.map((cls) => (
                        <option key={cls.maLop} value={cls.maLop}>
                          {cls.tenLop} ({cls.maLop})
                        </option>
                      ))}
                    </select>
                  </div>

                  {assignError && (
                    <div style={styles.errorMessage}>
                      <span>{assignError}</span>
                    </div>
                  )}
                  {classes.length === 0 && !assignError && (
                    <div style={styles.errorMessage}>
                      <span>Không có lớp nào để hiển thị.</span>
                    </div>
                  )}

                  {/* Danh sách sinh viên */}
                  <div className="students-table" style={styles.studentsTable}>
                    <h4 style={styles.h4}>
                      Danh sách sinh viên {selectedClass ? `lớp ${classes.find(c => c.maLop === selectedClass)?.tenLop}` : ''}
                    </h4>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Chọn</th>
                          <th style={styles.th}>Mã SV</th>
                          <th style={styles.th}>Họ tên</th>
                          <th style={styles.th}>Email</th>
                          <th style={styles.th}>Số điện thoại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClass ? (
                          students.filter((student) => student.maLop === selectedClass).length === 0 ? (
                            <tr>
                              <td colSpan={5} style={styles.td}>Không có sinh viên trong lớp này.</td>
                            </tr>
                          ) : (
                            students
                              .filter((student) => student.maLop === selectedClass)
                              .map((student) => (
                                <tr key={student.maSV}>
                                  <td style={styles.td}>
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(student.maSV)}
                                      onChange={() => handleStudentSelect(student.maSV)}
                                      disabled={assignLoading}
                                      style={styles.checkbox}
                                    />
                                  </td>
                                  <td style={styles.td}>{student.maSV}</td>
                                  <td style={styles.td}>{student.hoTen}</td>
                                  <td style={styles.td}>{student.email}</td>
                                  <td style={styles.td}>{student.soDienThoai}</td>
                                </tr>
                              ))
                          )
                        ) : (
                          <tr>
                            <td colSpan={5} style={styles.td}>Vui lòng chọn lớp để xem sinh viên.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Thông báo thành công hoặc lỗi */}
                  {assignSuccess && (
                    <div style={styles.successMessage}>
                      <span>{assignSuccess}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="modal-body" style={styles.modalBody}>Vui lòng đăng nhập để tiếp tục.</p>
            )}

            {/* Nút điều khiển */}
            {!assignSuccess && (
              <div className="modal-footer" style={styles.modalFooter}>
                <button
                  onClick={cancelAssign}
                  className="btn-cancel"
                  disabled={assignLoading}
                  style={styles.btnCancel}
                >
                  Hủy
                </button>
                {assignHoatDong && (
                  <button
                    onClick={confirmAssign}
                    className="btn-confirm"
                    disabled={assignLoading || !selectedClass}
                    style={styles.btnConfirm}
                  >
                    {assignLoading ? 'Đang xử lý...' : 'Chỉ định'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div>
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
          </div>
        </div>
      ) : currentHoatDungs.length === 0 ? (
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
            {currentHoatDungs.map((hd) => (
              <div className="hoatdong-card" key={hd.MaHoatDong}>
                <div className="hoatdong-header">
                  <h3>{hd.TenHoatDong}</h3>
                  <span
                    className={`status-badge ${hd.TrangThai.toLowerCase().replace(/\s+/g, "-")}`}
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
                    onClick={() => handleAssignClick(hd)}
                    disabled={hd.TrangThai === "Đã kết thúc" || hd.TrangThai === "Hủy bỏ"}
                  >
                    Chỉ định sinh viên
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

const styles = {
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    position: 'relative' as const,
  },
  modalTitle: {
    marginBottom: '15px',
    color: '#333',
  },
  modalBody: {
    marginBottom: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnCancel: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  btnConfirm: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold' as const,
    marginBottom: '5px',
    color: '#555',
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  studentsTable: {
    marginTop: '15px',
  },
  h4: {
    marginBottom: '10px',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
  },
  th: {
    padding: '8px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold' as const,
    color: '#333',
  },
  td: {
    padding: '8px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #ddd',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    textAlign: 'center' as const,
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    textAlign: 'center' as const,
  },
};

export default HoatDongList;