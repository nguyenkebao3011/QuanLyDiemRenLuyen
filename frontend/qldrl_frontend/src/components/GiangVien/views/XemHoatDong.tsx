import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/ChiDinhSinhVien.css";

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
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

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
      setStudents(mappedStudents);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      setAssignError('Lỗi khi lấy danh sách sinh viên.');
    }
  };

  // Hàm mở modal chỉ định sinh viên
  const handleAssignClick = (hoatDong: HoatDong) => {
    const token = getToken();
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

  // Hàm xử lý chọn tất cả sinh viên
  const handleSelectAll = () => {
    if (!selectedClass) return;

    const studentsInClass = students.filter((student) => student.maLop === selectedClass);
    const allSelected = studentsInClass.every((student) =>
      selectedStudents.includes(student.maSV)
    );

    if (allSelected) {
      setSelectedStudents([]);
    } else {
      const newSelectedStudents = studentsInClass.map((student) => student.maSV);
      setSelectedStudents(newSelectedStudents);
    }
    setAssignError(null);
    setAssignSuccess(null);
  };

  // Hàm gửi yêu cầu chỉ định
  const confirmAssign = async () => {
    if (!assignHoatDong || selectedStudents.length === 0) {
      setAssignError("Vui lòng chọn ít nhất một sinh viên.");
      console.log("Lỗi: Chưa chọn sinh viên hoặc hoạt động không hợp lệ.");
      return;
    }

    const token = getToken();
    if (!token) {
      setAssignError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      console.log("Lỗi: Token không tồn tại.");
      return;
    }

    try {
      setAssignLoading(true);
      const payload = {
        MaHoatDong: String(assignHoatDong.MaHoatDong),
        MaSVs: selectedStudents,
      };
      console.log("Gửi payload:", payload);

      const response = await axios.post(
        `http://localhost:5163/chi-dinh/${assignHoatDong.MaHoatDong}/cho-sinh-vien`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("API thành công:", response.data);

      setAssignSuccess("Chỉ định sinh viên thành công!");
      setShowSuccessNotification(true);
      console.log("Đã đặt showSuccessNotification = true");

      setTimeout(() => {
        console.log("Ẩn thông báo và đóng modal...");
        setShowSuccessNotification(false);
        setShowAssignModal(false);
        setAssignHoatDong(null);
        setAssignSuccess(null);
        setSelectedStudents([]);
        setSelectedClass("");
      }, 5000);
    } catch (error: any) {
      console.error("Lỗi API:", error.response?.data || error.message);
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
    setShowSuccessNotification(false);
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

      const alternativeEndpoints = [
        "http://localhost:5163/api/HoatDongs",
        "http://localhost:5163/api/HoatDong/lay-danh-sach-hoat-dong",
      ];

      let dataFetched = false;

      for (const endpoint of alternativeEndpoints) {
        if (endpoint === apiUrl) continue;

        try {
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
                    <option value="">Tất cả</option>
                  <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  <option value="Đang diễn ra">Đang diễn ra</option>
                  <option value="Đang mở đăng ký">Đang mở đăng ký</option>

                  <option value="Đã kết thúc">Đã kết thúc</option>
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

      {/* Modal chỉ định sinh viên */}
      {showAssignModal && (
        <div className="asn-modal-overlay">
          <div className="asn-modal-container">
            <div className="asn-modal-header">
              <h3 className="asn-modal-title">Chỉ định sinh viên</h3>
              <button className="asn-close-button" onClick={cancelAssign}>×</button>
            </div>

            {assignHoatDong ? (
              <>
                <div className="asn-modal-body">
                  <div className="asn-activity-info">
                    <div className="asn-info-item">
                      <span className="asn-info-label">Hoạt động:</span>
                      <span className="asn-info-value">{assignHoatDong.TenHoatDong}</span>
                    </div>
                    {/* <div className="asn-info-item">
                      <span className="asn-info-label">Mã hoạt động:</span>
                      <span className="asn-info-value">{assignHoatDong.MaHoatDong}</span>
                    </div> */}
                  </div>

                  {/* Chọn lớp */}
                  <div className="asn-form-group">
                    <label htmlFor="class-select" className="asn-form-label">
                      Chọn lớp:
                    </label>
                    <div className="asn-select-wrapper">
                      <select
                        id="class-select"
                        value={selectedClass}
                        onChange={handleClassChange}
                        disabled={assignLoading}
                        className="asn-select"
                      >
                        <option value="">-- Chọn lớp --</option>
                        {classes.map((cls) => (
                          <option key={cls.maLop} value={cls.maLop}>
                            {cls.tenLop} ({cls.maLop})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {assignError && (
                    <div className="asn-error-message">
                      <span>{assignError}</span>
                    </div>
                  )}

                  {classes.length === 0 && !assignError && (
                    <div className="asn-notice-message">
                      <span>Không có lớp nào để hiển thị.</span>
                    </div>
                  )}

                  {/* Danh sách sinh viên */}
                  <div className="asn-students-section">
                    <div className="asn-section-header">
                      <h4 className="asn-section-title">
                        Danh sách sinh viên {selectedClass ? `lớp ${classes.find(c => c.maLop === selectedClass)?.tenLop}` : ''}
                      </h4>

                      {selectedClass && students.filter((student) => student.maLop === selectedClass).length > 0 && (
                        <div className="asn-actions">
                          <button
                            className="asn-select-all-btn"
                            onClick={handleSelectAll}
                            disabled={assignLoading}
                          >
                            {students.filter((student) => student.maLop === selectedClass).every((student) =>
                              selectedStudents.includes(student.maSV)
                            ) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="asn-table-container">
                      <table className="asn-table">
                        <thead>
                          <tr>
                            <th className="asn-th asn-th-checkbox">Chọn</th>
                            <th className="asn-th">Mã SV</th>
                            <th className="asn-th">Họ tên</th>
                            <th className="asn-th">Email</th>
                            <th className="asn-th">Số điện thoại</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClass ? (
                            students.filter((student) => student.maLop === selectedClass).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="asn-td-no-data">Không có sinh viên trong lớp này.</td>
                              </tr>
                            ) : (
                              students
                                .filter((student) => student.maLop === selectedClass)
                                .map((student) => (
                                  <tr key={student.maSV} className={selectedStudents.includes(student.maSV) ? "asn-tr-selected" : ""}>
                                    <td className="asn-td asn-td-checkbox">
                                      <label className="asn-checkbox-container">
                                        <input
                                          type="checkbox"
                                          checked={selectedStudents.includes(student.maSV)}
                                          onChange={() => handleStudentSelect(student.maSV)}
                                          disabled={assignLoading}
                                          className="asn-checkbox"
                                        />
                                        <span className="asn-checkmark"></span>
                                      </label>
                                    </td>
                                    <td className="asn-td">{student.maSV}</td>
                                    <td className="asn-td">{student.hoTen}</td>
                                    <td className="asn-td">{student.email}</td>
                                    <td className="asn-td">{student.soDienThoai}</td>
                                  </tr>
                                ))
                            )
                          ) : (
                            <tr>
                              <td colSpan={5} className="asn-td-message">Vui lòng chọn lớp để xem sinh viên.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Hiển thị thông báo thành công trong modal */}
                  {assignSuccess && (
                    <div className="asn-success-message">
                      <span>{assignSuccess}</span>
                    </div>
                  )}
                </div>

                <div className="asn-modal-footer">
                  <div className="asn-selected-count">
                    Đã chọn: <span className="asn-count-number">{selectedStudents.length}</span> sinh viên
                  </div>
                  <div className="asn-footer-buttons">
                    <button
                      className="asn-cancel-btn"
                      onClick={cancelAssign}
                      disabled={assignLoading}
                    >
                      Hủy
                    </button>
                    <button
                      className="asn-assign-btn"
                      onClick={confirmAssign}
                      disabled={assignLoading || !selectedClass || selectedStudents.length === 0}
                    >
                      {assignLoading ? (
                        <span className="asn-loading-spinner"></span>
                      ) : (
                        "Chỉ định"
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="asn-loading-container">
                <div className="asn-loading-spinner"></div>
                <p>Đang tải thông tin...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thông báo thành công toàn màn hình */}
      {showSuccessNotification && (
        <div className="asn-success-notification">
          <div className="asn-success-content">
            <span>{assignSuccess || "Chỉ định sinh viên thành công!"}</span>
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

export default HoatDongList;