import type React from "react";
import { useState, useEffect } from "react";
import "../css/PhanHoiMinhChung.css";
import { ApiService } from "../../../untils/services/service-api";
import type { HoatDong, HocKy } from "../../Admin/types";

interface DangKyHoatDongDTO {
  MaDangKy: number;
  MaSv: string;
  MaHoatDong: number;
  NgayDangKy: string;
  TrangThai: string;
  TenHoatDong?: string;
  DiaDiem?: string;
  NgayBatDau?: string;
  DiemCong?: number;
  MoTa?: string;
  MaHocKy?: number;
}

interface SubmitResponse {
  success: boolean;
  message: string;
  MaPhanHoi?: number;
  MaMinhChung?: number;
  DuongDanFile?: string;
}

const GuiPhanHoiDiemRenLuyen: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [hoatDong, setHoatDong] = useState<DangKyHoatDongDTO[]>([]);
  const [maDangKy, setMaDangKy] = useState<number | null>(null);
  const [noiDungPhanHoi, setNoiDungPhanHoi] = useState("");
  const [moTaMinhChung, setMoTaMinhChung] = useState("");
  const [fileMinhChung, setFileMinhChung] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [maHocKy, setMaHocKy] = useState<number | null>(null);
  const [hocKyList, setHocKyList] = useState<HocKy[]>([]);
  const [hoatDongDetails, setHoatDongDetails] = useState<Map<number, HoatDong>>(
    new Map()
  );

  useEffect(() => {
    if (!token) {
      setMessage("Vui lòng đăng nhập để tiếp tục.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Lấy danh sách học kỳ
        const hocKyData = await ApiService.layDanhSachHocKy();
        setHocKyList(hocKyData);

        // Lấy danh sách hoạt động đã đăng ký
        const res = await fetch(
          "http://localhost:5163/api/DangKyHoatDongs/danh-sach-dang-ky",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          setMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }

        if (!res.ok) {
          throw new Error(`Lỗi HTTP: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (data.data && Array.isArray(data.data)) {
          setHoatDong(data.data);

          // Lấy thông tin chi tiết cho mỗi hoạt động để có MaHocKy
          const hoatDongMap = new Map<number, HoatDong>();
          const allHoatDong = await ApiService.layDanhSachHoatDong();

          for (const hd of allHoatDong) {
            hoatDongMap.set(hd.MaHoatDong, hd);
          }

          setHoatDongDetails(hoatDongMap);

          if (data.data.length === 0) {
            setMessage("Bạn chưa đăng ký hoạt động nào.");
          }
        } else {
          setHoatDong([]);
          setMessage("Dữ liệu từ server không đúng định dạng.");
        }
      } catch (err) {
        setMessage("Lỗi khi lấy dữ liệu: " + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
      ? Number.parseInt(e.target.value)
      : null;
    setMaDangKy(selectedValue);

    if (selectedValue) {
      // Tìm hoạt động được chọn
      const selectedActivity = hoatDong.find(
        (hd) => hd.MaDangKy === selectedValue
      );

      if (selectedActivity && selectedActivity.MaHoatDong) {
        // Lấy thông tin chi tiết hoạt động để có MaHocKy
        const hoatDongDetail = hoatDongDetails.get(selectedActivity.MaHoatDong);

        if (hoatDongDetail && hoatDongDetail.MaHocKy) {
          setMaHocKy(hoatDongDetail.MaHocKy);
        } else {
          // Nếu không tìm thấy thông tin học kỳ, gọi API để lấy thông tin chi tiết
          fetchHoatDongDetail(selectedActivity.MaHoatDong);
        }
      }
    } else {
      // Reset học kỳ nếu không chọn hoạt động
      setMaHocKy(null);
    }
  };

  const fetchHoatDongDetail = async (maHoatDong: number) => {
    try {
      const response = await fetch(
        `http://localhost:5163/api/HoatDong/chi-tiet/${maHoatDong}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const hoatDongDetail = await response.json();

        if (hoatDongDetail && hoatDongDetail.MaHocKy) {
          setMaHocKy(hoatDongDetail.MaHocKy);

          // Cập nhật cache
          setHoatDongDetails((prev) => {
            const newMap = new Map(prev);
            newMap.set(maHoatDong, hoatDongDetail);
            return newMap;
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết hoạt động:", error);
    }
  };

  const getHocKyName = (maHocKy?: number): string => {
    if (!maHocKy) return "";
    const hocKy = hocKyList.find((hk) => hk.MaHocKy === maHocKy);
    return hocKy ? `${hocKy.TenHocKy} - ${hocKy.NamHoc}` : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showNotificationMessage("Vui lòng đăng nhập để gửi phản hồi.", false);
      return;
    }
    if (!maDangKy || !noiDungPhanHoi || !fileMinhChung || !maHocKy) {
      showNotificationMessage("Vui lòng điền đầy đủ thông tin.", false);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("MaSv", getUserIdFromToken(token));
    formData.append("MaHocKy", maHocKy.toString());
    formData.append("MaDangKy", maDangKy.toString());
    formData.append("NoiDungPhanHoi", noiDungPhanHoi);
    formData.append("MoTaMinhChung", moTaMinhChung || "");
    formData.append("FileMinhChung", fileMinhChung);

    try {
      const res = await fetch(
        "http://localhost:5163/api/PhanHoiDiemRenLuyen/TaoPhanHoiVeHoatDong",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.status === 401) {
        showNotificationMessage(
          "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
          false
        );
        localStorage.removeItem("token");
        setToken(null);
        return;
      }

      const data: SubmitResponse = await res.json();

      if (res.ok) {
        showNotificationMessage(data.message, true);
        setMaDangKy(null);
        setNoiDungPhanHoi("");
        setMoTaMinhChung("");
        setFileMinhChung(null);
        setFileName("");
        setMaHocKy(null);
        (document.getElementById("fileInput") as HTMLInputElement).value = "";
      } else {
        showNotificationMessage(
          "Lỗi: " + (data.message || "Không thể gửi phản hồi."),
          false
        );
      }
    } catch (err) {
      showNotificationMessage("Lỗi: " + (err as Error).message, false);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserIdFromToken = (token: string): string => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return payload.MaSv || payload.sub || "unknown";
    } catch (e) {
      console.error("Lỗi khi giải mã token:", e);
      return "DHTH603148"; // Giá trị mặc định để test
    }
  };

  const showNotificationMessage = (msg: string, success: boolean) => {
    setMessage(msg);
    setIsSuccess(success);
    setShowNotification(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFileMinhChung(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="gph-container">
      <div
        className={`gph-notification ${showNotification ? "gph-show" : ""} ${
          isSuccess ? "gph-success" : "gph-error"
        }`}
      >
        <span className="gph-notification-message">{message}</span>
        <button
          className="gph-close-notification"
          onClick={() => setShowNotification(false)}
        >
          ×
        </button>
      </div>

      <div className="gph-page-header">
        <h1>Gửi Phản Hồi Điểm Rèn Luyện</h1>
        <p className="gph-header-description">
          Gửi phản hồi về hoạt động bạn đã tham gia và upload minh chứng
        </p>
      </div>

      <div className="gph-content-wrapper">
        <div className="gph-form-section">
          <div className="gph-form-card">
            <h2 className="gph-form-title">
              <i className="gph-icon-feedback"></i>
              Thông tin phản hồi
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="gph-form-group">
                <label htmlFor="activity-select">Chọn Hoạt Động</label>
                <div className="gph-select-wrapper">
                  <select
                    id="activity-select"
                    value={maDangKy || ""}
                    onChange={handleActivityChange}
                    disabled={!token || hoatDong.length === 0 || isLoading}
                    className="gph-form-control"
                    required
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {Array.isArray(hoatDong) &&
                      hoatDong.map((hd) => (
                        <option key={hd.MaDangKy} value={hd.MaDangKy}>
                          {hd.TenHoatDong || `Hoạt động #${hd.MaHoatDong}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="gph-form-group">
                <label>Học Kỳ</label>
                <div className="gph-selected-semester">
                  {maHocKy ? (
                    <div className="gph-semester-info">
                      {getHocKyName(maHocKy)}
                    </div>
                  ) : (
                    <div className="gph-semester-placeholder">
                      Học kỳ sẽ được chọn tự động khi bạn chọn hoạt động
                    </div>
                  )}
                  <input type="hidden" name="MaHocKy" value={maHocKy || ""} />
                </div>
              </div>

              <div className="gph-form-group">
                <label htmlFor="noiDungPhanHoi">Nội Dung Phản Hồi</label>
                <textarea
                  id="noiDungPhanHoi"
                  value={noiDungPhanHoi}
                  onChange={(e) => setNoiDungPhanHoi(e.target.value)}
                  placeholder="Nhập nội dung phản hồi về hoạt động..."
                  required
                  disabled={!token || isLoading}
                  className="gph-form-control"
                  rows={5}
                ></textarea>
              </div>

              <div className="gph-form-group">
                <label htmlFor="moTaMinhChung">Mô Tả Minh Chứng</label>
                <textarea
                  id="moTaMinhChung"
                  value={moTaMinhChung}
                  onChange={(e) => setMoTaMinhChung(e.target.value)}
                  placeholder="Mô tả về minh chứng bạn đính kèm..."
                  disabled={!token || isLoading}
                  className="gph-form-control"
                  rows={3}
                ></textarea>
              </div>

              <div className="gph-form-group">
                <label htmlFor="fileInput">
                  Upload Minh Chứng{" "}
                  <span className="gph-required">(Bắt buộc)</span>
                </label>
                <div className="gph-file-input-wrapper">
                  <input
                    id="fileInput"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.docx"
                    onChange={handleFileChange}
                    required
                    disabled={!token || isLoading}
                    className="gph-hidden-file-input"
                  />
                  <div className="gph-custom-file-input">
                    <span className="gph-file-name">
                      {fileName || "Chưa có file nào được chọn"}
                    </span>
                    <button
                      type="button"
                      className="gph-browse-button"
                      onClick={() =>
                        document.getElementById("fileInput")?.click()
                      }
                    >
                      Chọn file
                    </button>
                  </div>
                  <p className="gph-file-hint">
                    Chấp nhận các định dạng: JPG, JPEG, PNG, PDF, DOCX
                  </p>
                </div>
              </div>

              <div className="gph-form-actions">
                <button
                  type="submit"
                  className="gph-submit-button"
                  disabled={!token || isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Gửi Phản Hồi"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="gph-activity-section">
          <div className="gph-activity-card">
            <h2 className="gph-section-title">
              <i className="gph-icon-list"></i>
              Danh Sách Hoạt Động Đã Đăng Ký
            </h2>

            {isLoading ? (
              <div className="gph-loading-indicator">
                <div className="gph-loader"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="gph-activity-list">
                {Array.isArray(hoatDong) && hoatDong.length > 0 ? (
                  hoatDong.map((hd) => {
                    const hoatDongDetail = hoatDongDetails.get(hd.MaHoatDong);
                    return (
                      <div key={hd.MaDangKy} className="gph-activity-item">
                        <div className="gph-activity-header">
                          <h3 className="gph-activity-title">
                            {hd.TenHoatDong || `Hoạt động #${hd.MaHoatDong}`}
                            {hoatDongDetail?.MaHocKy && (
                              <span className="gph-semester-badge">
                                {getHocKyName(hoatDongDetail.MaHocKy)}
                              </span>
                            )}
                          </h3>
                          <span
                            className={`gph-activity-status gph-status-${hd.TrangThai?.toLowerCase().replace(
                              /\s+/g,
                              "-"
                            )}`}
                          >
                            {hd.TrangThai || "Chưa xác định"}
                          </span>
                        </div>

                        <div className="gph-activity-details">
                          <div className="gph-detail-row">
                            <span className="gph-detail-label">
                              Ngày bắt đầu:
                            </span>
                            <span className="gph-detail-value">
                              {formatDate(hd.NgayBatDau || "")}
                            </span>
                          </div>
                          <div className="gph-detail-row">
                            <span className="gph-detail-label">Địa điểm:</span>
                            <span className="gph-detail-value">
                              {hd.DiaDiem || "Chưa cập nhật"}
                            </span>
                          </div>
                          <div className="gph-detail-row">
                            <span className="gph-detail-label">Điểm cộng:</span>
                            <span className="gph-detail-value gph-highlight">
                              {hd.DiemCong || 0} điểm
                            </span>
                          </div>
                          <div className="gph-detail-row">
                            <span className="gph-detail-label">
                              Ngày đăng ký:
                            </span>
                            <span className="gph-detail-value">
                              {formatDate(hd.NgayDangKy)}
                            </span>
                          </div>
                        </div>

                        {hd.MoTa && (
                          <div className="gph-activity-description">
                            <h4>Mô tả:</h4>
                            <p>{hd.MoTa}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="gph-empty-state">
                    <i className="gph-icon-empty"></i>
                    <p>Bạn chưa đăng ký hoạt động nào.</p>
                    <p className="gph-empty-hint">
                      Vui lòng đăng ký hoạt động trước khi gửi phản hồi.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuiPhanHoiDiemRenLuyen;
