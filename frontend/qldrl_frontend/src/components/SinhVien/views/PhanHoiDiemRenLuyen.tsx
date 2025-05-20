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

interface PhanHoiDTO {
  MaPhanHoi: number;
  MaDiemRenLuyen: number;
  MaMinhChung: number;
  NoiDungPhanHoi: string;
  NgayPhanHoi: string;
  TrangThai: string;
  MaQL: string | null;
  NoiDungXuLy: string | null;
  NgayXuLy: string | null;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
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
  const [selectedHoatDong, setSelectedHoatDong] = useState<HoatDongDTO | null>(null);
  const [phanHoiList, setPhanHoiList] = useState<PhanHoiDTO[]>([]);
  const [showPhanHoiList, setShowPhanHoiList] = useState(false);

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
        const [hocKyResponse, hoatDongResponse] = await Promise.all([
          fetch(`${API_URL}/HocKy/lay_hoc_ky`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/DangKyHoatDongs/danh-sach-dang-ky-da-ket-thuc`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (hocKyResponse.ok) {
          const hocKyData = await hocKyResponse.json();
          console.log("Danh sách học kỳ:", hocKyData);
          setHocKyList(hocKyData);
          if (hocKyData.length === 0) {
            setMessage("Không tìm thấy danh sách học kỳ.");
          }
        } else {
          throw new Error("Lỗi khi lấy danh sách học kỳ");
        }

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
        console.log("Dữ liệu thô từ API hoạt động:", data);
        if (data.data && Array.isArray(data.data)) {
          const formattedData = data.data
            .map((item: any): HoatDongDTO | null => {
              const maDangKy = item.MaDangKy ? Number(item.MaDangKy) : null;
              const maHocKy = item.MaHocKy !== undefined ? Number(item.MaHocKy) : undefined;
              console.log(`Hoạt động: ${item.TenHoatDong}, MaHocKy: ${maHocKy}, MaDangKy: ${maDangKy}`);
              if (!maDangKy || maDangKy <= 0) {
                console.warn(`Bỏ qua hoạt động không hợp lệ: ${JSON.stringify(item)}`);
                return null;
              }
              return {
                MaDangKy: maDangKy,
                MaSv: item.MaSV ?? maSv,
                MaHoatDong: item.MaHoatDong ?? 0,
                TenHoatDong: item.TenHoatDong ?? `Hoạt động không tên`,
                NgayDangKy: item.NgayDangKy ?? "",
                TrangThai: item.TrangThai ?? item.TrangThaiHoatDong ?? "Chưa xác định",
                DiaDiem: item.diaDiem ?? undefined,
                NgayBatDau: item.NgayBatDau ?? "",
                DiemCong: item.diemCong ?? 0,
                MoTa: item.MoTa ?? "",
                MaHocKy: maHocKy,
              };
            })
            .filter((item): item is HoatDongDTO => item !== null);
          console.log("Dữ liệu hoạt động sau khi xử lý:", formattedData);
          setHoatDong(formattedData);
          if (formattedData.length === 0) {
            setMessage("Không có hoạt động hợp lệ nào để gửi phản hồi.");
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
  }, [token, API_URL, maSv]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const fetchPhanHoiList = async () => {
    if (!token) {
      showNotificationMessage("Vui lòng đăng nhập để xem trạng thái phản hồi.", false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/PhanHoiDiemRenLuyen/danh-sach-phan-hoi?MaSv=${maSv}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 401) {
        showNotificationMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", false);
        localStorage.removeItem("token");
        setToken(null);
        return;
      }
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      console.log("Dữ liệu thô từ API phản hồi:", data);
      if (data.data && Array.isArray(data.data)) {
        const formattedData = data.data.map((item: any): PhanHoiDTO => ({
          MaPhanHoi: item.MaPhanHoi ?? 0,
          MaDiemRenLuyen: item.MaDiemRenLuyen ?? 0,
          MaMinhChung: item.MaMinhChung ?? 0,
          NoiDungPhanHoi: item.NoiDungPhanHoi ?? "",
          NgayPhanHoi: item.NgayPhanHoi ?? "",
          TrangThai: item.TrangThai ?? "Chưa xác định",
          MaQL: item.MaQL ?? null,
          NoiDungXuLy: item.NoiDungXuLy ?? null,
          NgayXuLy: item.NgayXuLy ?? null,
        }));
        setPhanHoiList(formattedData);
        setShowPhanHoiList(true);
        if (formattedData.length === 0) {
          showNotificationMessage("Chưa có phản hồi nào.", false);
        }
      } else {
        setPhanHoiList([]);
        showNotificationMessage("Dữ liệu phản hồi không đúng định dạng.", false);
      }
    } catch (err) {
      showNotificationMessage("Lỗi khi lấy danh sách phản hồi: " + (err as Error).message, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedValue = value ? Number.parseInt(value) : null;
    console.log(`Chọn hoạt động: value=${value}, selectedValue=${selectedValue}`);
    setMaDangKy(selectedValue);

    if (selectedValue !== null && !isNaN(selectedValue) && selectedValue > 0) {
      const selected = hoatDong.find((hd) => hd.MaDangKy === selectedValue);
      console.log(`Hoạt động được chọn:`, selected);
      setSelectedHoatDong(selected || null);

      if (selected && selected.MaHocKy !== undefined && !isNaN(selected.MaHocKy)) {
        const maHocKyNumber = Number(selected.MaHocKy);
        const hocKy = hocKyList.find((hk) => hk.MaHocKy === maHocKyNumber);
        if (hocKy) {
          console.log(`Chọn học kỳ tự động: ${hocKy.TenHocKy} - ${hocKy.NamHoc} (MaHocKy: ${maHocKyNumber})`);
          setMaHocKy(maHocKyNumber);
        } else {
          console.warn(`Không tìm thấy học kỳ với MaHocKy: ${maHocKyNumber}`);
          setMaHocKy(undefined);
          showNotificationMessage("Học kỳ không hợp lệ. Vui lòng liên hệ quản trị viên.", false);
        }
      } else {
        console.warn(`Hoạt động không có MaHocKy hợp lệ: ${JSON.stringify(selected)}`);
        setMaHocKy(undefined);
        showNotificationMessage("Hoạt động không có thông tin học kỳ. Vui lòng liên hệ quản trị viên.", false);
      }
    } else {
      setSelectedHoatDong(null);
      setMaHocKy(undefined);
      if (selectedValue === 0) {
        showNotificationMessage("Hoạt động không hợp lệ. Vui lòng chọn hoạt động khác.", false);
      }
    }
  };

  const getHocKyName = (maHocKy?: number): string => {
    if (maHocKy === undefined || isNaN(maHocKy)) {
      return "Chưa chọn học kỳ";
    }
    const hocKy = hocKyList.find((hk) => hk.MaHocKy === maHocKy);
    return hocKy ? `${hocKy.TenHocKy} - ${hocKy.NamHoc}` : `Học kỳ không tồn tại (Mã: ${maHocKy})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showNotificationMessage("Vui lòng đăng nhập để gửi phản hồi.", false);
      return;
    }

    const errors: string[] = [];
    if (!maSv) errors.push("Mã sinh viên");
    if (maHocKy === undefined) errors.push("Học kỳ");
    if (!maDangKy || maDangKy <= 0) errors.push("Hoạt động");
    if (!noiDungPhanHoi) errors.push("Nội dung phản hồi");

    if (errors.length > 0) {
      showNotificationMessage(`Vui lòng điền đầy đủ: ${errors.join(", ")}.`, false);
      return;
    }

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
    formData.append("MaHocKy", maHocKy!.toString());
    formData.append("MaDangKy", maDangKy!.toString());
    formData.append("NoiDungPhanHoi", noiDungPhanHoi);
    if (moTaMinhChung) {
      formData.append("MoTaMinhChung", moTaMinhChung);
    }
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
        showNotificationMessage(data.message || "Gửi phản hồi thành công!", true);
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
    if (!dateString) return "Chưa xử lý";
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
              <button
                  type="button"
                  className="gph-view-status-button"
                  onClick={fetchPhanHoiList}
                  disabled={isLoading}
                >
                  Xem Trạng Thái Phản Hồi
                </button>
            </h2>
                
            <form onSubmit={handleSubmit}>
              <div className="gph-form-group">
                <label htmlFor="activity-select">Chọn Hoạt Động</label>
                <div className="gph-select-wrapper">
                  <select
                    id="activity-select"
                    value={maDangKy !== null ? String(maDangKy) : ""}
                    onChange={handleActivityChange}
                    disabled={isLoading || hoatDong.length === 0}
                    className="gph-form-control"
                    required
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {hoatDong.length > 0 ? (
                      hoatDong.map((hd) => (
                        <option key={hd.MaDangKy} value={hd.MaDangKy}>
                          {hd.TenHoatDong || `Hoạt động #${hd.MaHoatDong}`}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có hoạt động nào</option>
                    )}
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
                  ) : maHocKy !== undefined && getHocKyName(maHocKy) !== "Chưa chọn học kỳ" ? (
                    <div className="gph-semester-info">{getHocKyName(maHocKy)}</div>
                  ) : (
                    <div className="gph-semester-placeholder">
                      {maDangKy
                        ? `Không tìm thấy học kỳ cho hoạt động đã chọn`
                        : "Học kỳ sẽ được chọn tự động khi bạn chọn hoạt động"}
                    </div>
                  )}
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
                  <span className="gph-required">(Tùy chọn)</span>
                </label>
                <div className="gph-file-input-wrapper">
                  <input
                    id="fileInput"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.docx"
                    onChange={handleFileChange}
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
                      onClick={() => document.getElementById("fileInput")?.click()}
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
                  disabled={isLoading || !maDangKy || maDangKy <= 0}
                >
                  {isLoading ? "Đang xử lý..." : "Gửi Phản Hồi"}
                </button>
               
              </div>
            </form>
          </div>

          {showPhanHoiList && (
            <div className="gph-phanhoi-section">
              <div className="gph-phanhoi-card">
                <h2 className="gph-section-title">
                  <i className="gph-icon-list"></i>
                  Danh Sách Phản Hồi
                </h2>
                {isLoading ? (
                  <div className="gph-loading-indicator">
                    <div className="gph-loader"></div>
                    <p>Đang tải danh sách phản hồi...</p>
                  </div>
                ) : phanHoiList.length > 0 ? (
                  <div className="gph-phanhoi-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Mã Phản Hồi</th>
                          <th>Mã Điểm RL</th>
                          <th>Mã Minh Chứng</th>
                          <th>Nội Dung Phản Hồi</th>
                          <th>Ngày Phản Hồi</th>
                          <th>Trạng Thái</th>
                          <th>Mã QL</th>
                          <th>Nội Dung Xử Lý</th>
                          <th>Ngày Xử Lý</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phanHoiList.map((ph) => (
                          <tr key={ph.MaPhanHoi}>
                            <td>{ph.MaPhanHoi}</td>
                            <td>{ph.MaDiemRenLuyen}</td>
                            <td>{ph.MaMinhChung}</td>
                            <td>{ph.NoiDungPhanHoi}</td>
                            <td>{formatDate(ph.NgayPhanHoi)}</td>
                            <td>{ph.TrangThai}</td>
                            <td>{ph.MaQL || "Chưa có"}</td>
                            <td>{ph.NoiDungXuLy || "Chưa xử lý"}</td>
                                                    </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="gph-empty-state">
                    <i className="gph-icon-empty"></i>
                    <p>Chưa có phản hồi nào</p>
                  </div>
                )}
                <button
                  className="gph-close-phanhoi-button"
                  onClick={() => setShowPhanHoiList(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="gph-activity-section">
          <div className="gph-activity-card">
            <h2 className="gph-section-title">
              <i className="gph-icon-list"></i>
              Danh Sách Hoạt Động Đã Tham Gia
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
                          <span className="gph-detail-label">Ngày bắt đầu:</span>
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
                          <span className="gph-detail-label">Ngày đăng ký:</span>
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
                    <p>Chưa có hoạt động nào kết thúc</p>
                    <p className="gph-empty-hint">
                      Vui lòng đợi hoạt động kết thúc trước khi gửi phản hồi.
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
