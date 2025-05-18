import React, { useState, useEffect } from "react";
import "../css/PhanHoiMinhChung.css";

interface HoatDongDTO {
  MaDangKy: number;
  MaSv: string;
  MaHoatDong: number;
  TenHoatDong: string;
  NgayDangKy: string;
  TrangThai: string;
  DiaDiem?: string;
  NgayBatDau?: string;
  DiemCong?: number;
  MoTa?: string;
  MaHocKy?: number;
}

interface HocKyDTO {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
}

interface ApiResponse {
  message?: string;
  data?: any[];
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
  // Lấy mã sinh viên đúng theo key backend trả ra
  const maSv = localStorage.getItem("username") || "";
  const [hoatDong, setHoatDong] = useState<HoatDongDTO[]>([]);
  const [maDangKy, setMaDangKy] = useState<number | null>(null);
  const [noiDungPhanHoi, setNoiDungPhanHoi] = useState("");
  const [moTaMinhChung, setMoTaMinhChung] = useState("");
  const [fileMinhChung, setFileMinhChung] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [maHocKy, setMaHocKy] = useState<number | undefined>(undefined);
  const [hocKyList, setHocKyList] = useState<HocKyDTO[]>([]);
  const [selectedHoatDong, setSelectedHoatDong] = useState<HoatDongDTO | null>(
    null
  );

  const API_URL = "http://localhost:5163/api";

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
        const hocKyResponse = await fetch(`${API_URL}/HocKy/lay_hoc_ky`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (hocKyResponse.ok) {
          const hocKyData = await hocKyResponse.json();
          setHocKyList(hocKyData);
        }

        // Lấy danh sách hoạt động đã đăng ký
        const hoatDongResponse = await fetch(
          `${API_URL}/DangKyHoatDongs/danh-sach-dang-ky`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (hoatDongResponse.status === 401) {
          setMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }
        if (!hoatDongResponse.ok) {
          throw new Error(
            `Lỗi HTTP: ${hoatDongResponse.status} ${hoatDongResponse.statusText}`
          );
        }

        const data: ApiResponse = await hoatDongResponse.json();
        if (data.data && Array.isArray(data.data)) {
          const formattedData = data.data.map((item: any) => ({
            MaDangKy: Number(item.MaDangKy), // MaDangKy phải là số
            MaSv: item.MaSv ?? "",
            MaHoatDong: item.MaHoatDong,
            TenHoatDong: item.TenHoatDong ?? "",
            NgayDangKy: item.NgayDangKy ?? "",
            TrangThai:
              item.TrangThai ?? item.TrangThaiHoatDong ?? "Chưa xác định",
            DiaDiem: item.DiaDiem ?? item.diaDiem ?? "",
            NgayBatDau: item.NgayBatDau ?? "",
            DiemCong: item.DiemCong ?? item.diemCong ?? 0,
            MoTa: item.MoTa ?? "",
            MaHocKy:
              item.MaHocKy !== undefined && item.MaHocKy !== null
                ? Number(item.MaHocKy)
                : undefined,
          }));
          setHoatDong(formattedData);
          if (formattedData.length === 0)
            setMessage("Bạn chưa đăng ký hoạt động nào.");
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
  }, [token, API_URL]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
      ? Number.parseInt(e.target.value)
      : null;
    setMaDangKy(selectedValue);
    if (selectedValue) {
      const selected = hoatDong.find((hd) => hd.MaDangKy === selectedValue);
      setSelectedHoatDong(selected || null);
      if (selected && selected.MaHocKy !== undefined)
        setMaHocKy(Number(selected.MaHocKy));
      else setMaHocKy(undefined);
    } else {
      setSelectedHoatDong(null);
      setMaHocKy(undefined);
    }
  };

  const getHocKyName = (maHocKy?: number): string => {
    if (maHocKy === undefined) return "";
    const hocKy = hocKyList.find((hk) => hk.MaHocKy === Number(maHocKy));
    return hocKy ? `${hocKy.TenHocKy} - ${hocKy.NamHoc}` : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showNotificationMessage("Vui lòng đăng nhập để gửi phản hồi.", false);
      return;
    }
    if (
      !maDangKy ||
      !noiDungPhanHoi ||
      !fileMinhChung ||
      maHocKy === undefined
    ) {
      showNotificationMessage("Vui lòng điền đầy đủ thông tin.", false);
      return;
    }
    // === LOG DEBUG THÔNG TIN GỬI ĐI ===
    console.log("=== THÔNG TIN GỬI BACKEND ===");
    console.log("MaSv:", maSv);
    console.log("MaHocKy:", maHocKy);
    console.log("MaDangKy:", maDangKy);
    console.log("NoiDungPhanHoi:", noiDungPhanHoi);
    console.log("MoTaMinhChung:", moTaMinhChung);
    console.log("FileMinhChung:", fileMinhChung);
    console.log("=============================");
    setIsLoading(true);
    const formData = new FormData();
    formData.append("MaSv", maSv);
    formData.append("MaHocKy", maHocKy.toString());
    formData.append("MaDangKy", maDangKy.toString());
    formData.append("NoiDungPhanHoi", noiDungPhanHoi);
    formData.append("MoTaMinhChung", moTaMinhChung || "");
    if (fileMinhChung) {
      formData.append("FileMinhChung", fileMinhChung);
    }
    const submitUrl = `${API_URL}/PhanHoiDiemRenLuyen/TaoPhanHoiVeHoatDong`;
    console.log("[SUBMIT FETCH URL]", submitUrl);
    try {
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

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
        showNotificationMessage(
          data.message || "Gửi phản hồi thành công!",
          true
        );
        setMaDangKy(null);
        setSelectedHoatDong(null);
        setNoiDungPhanHoi("");
        setMoTaMinhChung("");
        setFileMinhChung(null);
        setFileName("");
        setMaHocKy(undefined);
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

  const formatDate = (dateString?: string) => {
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
                    disabled={isLoading}
                    className="gph-form-control"
                    required
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {hoatDong.map((hd) => (
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
                  {isLoading && maDangKy ? (
                    <div className="gph-semester-loading">
                      <div className="gph-small-loader"></div>
                      <span>Đang lấy thông tin học kỳ...</span>
                    </div>
                  ) : maHocKy !== undefined && getHocKyName(maHocKy) ? (
                    <div className="gph-semester-info">
                      {getHocKyName(maHocKy)}
                    </div>
                  ) : (
                    <div className="gph-semester-placeholder">
                      Học kỳ sẽ được chọn tự động khi bạn chọn hoạt động
                    </div>
                  )}
                  <input type="hidden" name="MaHocKy" value={maHocKy ?? ""} />
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
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
                {hoatDong.length > 0 ? (
                  hoatDong.map((hd) => (
                    <div key={hd.MaDangKy} className="gph-activity-item">
                      <div className="gph-activity-header">
                        <h3 className="gph-activity-title">
                          {hd.TenHoatDong || `Hoạt động #${hd.MaHoatDong}`}
                          {hd.MaHocKy !== undefined && (
                            <span className="gph-semester-badge">
                              {getHocKyName(hd.MaHocKy)}
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
                            {formatDate(hd.NgayBatDau)}
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
