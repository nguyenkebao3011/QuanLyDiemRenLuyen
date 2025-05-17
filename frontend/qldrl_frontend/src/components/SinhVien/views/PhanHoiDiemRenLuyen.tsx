import type React from "react";
import { useState, useEffect } from "react";
import "../css/PhanHoiMinhChung.css";

interface HoatDong {
  MaHoatDong: number;
  TenHoatDong: string;
  NgayBatDau: string;
  MoTa: string;
  diaDiem: string;
  diemCong: number;
  soLuong: number;
  TrangThaiHoatDong: string;
  NgayDangKy: string;
  MaDangKy?: number;
}

interface ApiResponse {
  message?: string;
  data?: HoatDong[];
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
  const [hoatDong, setHoatDong] = useState<HoatDong[]>([]);
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
  const [hocKyList, setHocKyList] = useState<
    { MaHocKy: number; TenHocKy: string }[]
  >([
    { MaHocKy: 1, TenHocKy: "Học kỳ 1 - 2023-2024" },
    { MaHocKy: 2, TenHocKy: "Học kỳ 2 - 2023-2024" },
  ]);

  useEffect(() => {
    if (!token) {
      setMessage("Vui lòng đăng nhập để tiếp tục.");
      setIsLoading(false);
      return;
    }

    const fetchHoatDong = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          "http://localhost:5163/api/DangKyHoatDongs/danh-sach-dang-ky",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Status:", res.status);
        if (res.status === 401) {
          setMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }
        if (!res.ok) {
          throw new Error(`Lỗi HTTP: ${res.status} ${res.statusText}`);
        }
        const data: ApiResponse = await res.json();
        console.log("Dữ liệu API:", data);
        if (data.data && Array.isArray(data.data)) {
          setHoatDong(data.data);
          if (data.data.length === 0) {
            setMessage("Bạn chưa đăng ký hoạt động nào.");
          } else if (data.message) {
            setMessage(data.message);
          }
        } else {
          setHoatDong([]);
          setMessage("Dữ liệu từ server không đúng định dạng.");
        }
      } catch (err) {
        setMessage(
          "Lỗi khi lấy danh sách hoạt động: " + (err as Error).message
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoatDong();
  }, [token]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

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
    formData.append("MaSv", getUserIdFromToken(token)); // Lấy MaSv từ token
    formData.append("MaHocKy", maHocKy.toString());
    formData.append("NoiDungPhanHoi", noiDungPhanHoi);
    formData.append("MaDangKy", maDangKy.toString());
    formData.append("FileMinhChung", fileMinhChung);
    formData.append("MoTaMinhChung", moTaMinhChung);

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
      console.log("Submit Status:", res.status);
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
    // Giả định: Lấy MaSv từ token, thay thế bằng logic thực tế của bạn
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
      return "unknown";
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
                <label htmlFor="hocky-select">Chọn Học Kỳ</label>
                <div className="gph-select-wrapper">
                  <select
                    id="hocky-select"
                    value={maHocKy || ""}
                    onChange={(e) =>
                      setMaHocKy(
                        e.target.value ? Number.parseInt(e.target.value) : null
                      )
                    }
                    disabled={!token || isLoading}
                    className="gph-form-control"
                    required
                  >
                    <option value="">-- Chọn học kỳ --</option>
                    {hocKyList.map((hk) => (
                      <option key={hk.MaHocKy} value={hk.MaHocKy}>
                        {hk.TenHocKy}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gph-form-group">
                <label htmlFor="activity-select">Chọn Hoạt Động</label>
                <div className="gph-select-wrapper">
                  <select
                    id="activity-select"
                    value={maDangKy || ""}
                    onChange={(e) =>
                      setMaDangKy(
                        e.target.value ? Number.parseInt(e.target.value) : null
                      )
                    }
                    disabled={!token || hoatDong.length === 0 || isLoading}
                    className="gph-form-control"
                    required
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {Array.isArray(hoatDong) &&
                      hoatDong.map((hd) => (
                        <option
                          key={hd.MaHoatDong}
                          value={hd.MaDangKy || hd.MaHoatDong}
                        >
                          {hd.TenHoatDong}
                        </option>
                      ))}
                  </select>
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
                  hoatDong.map((hd) => (
                    <div key={hd.MaHoatDong} className="gph-activity-item">
                      <div className="gph-activity-header">
                        <h3 className="gph-activity-title">{hd.TenHoatDong}</h3>
                        <span
                          className={`gph-activity-status gph-status-${hd.TrangThaiHoatDong.toLowerCase().replace(
                            /\s+/g,
                            "-"
                          )}`}
                        >
                          {hd.TrangThaiHoatDong}
                        </span>
                      </div>

                      <div className="gph-activity-details">
                        <div className="gph-detail-row">
                          <span className="gph-detail-label">
                            Ngày bắt đầu:
                          </span>
                          <span className="gph-detail-value">
                            {hd.NgayBatDau}
                          </span>
                        </div>
                        <div className="gph-detail-row">
                          <span className="gph-detail-label">Địa điểm:</span>
                          <span className="gph-detail-value">{hd.diaDiem}</span>
                        </div>
                        <div className="gph-detail-row">
                          <span className="gph-detail-label">Điểm cộng:</span>
                          <span className="gph-detail-value gph-highlight">
                            {hd.diemCong} điểm
                          </span>
                        </div>
                        <div className="gph-detail-row">
                          <span className="gph-detail-label">Số lượng:</span>
                          <span className="gph-detail-value">{hd.soLuong}</span>
                        </div>
                      </div>

                      <div className="gph-activity-description">
                        <h4>Mô tả:</h4>
                        <p>{hd.MoTa}</p>
                      </div>
                    </div>
                  ))
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
