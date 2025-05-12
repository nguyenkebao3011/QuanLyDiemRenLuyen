import React, { useState, useEffect } from 'react';
import '../css/PhanHoiMinhChung.css';

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
}

interface ApiResponse {
  message?: string;
  data?: HoatDong[];
}

interface SubmitResponse {
  Message: string;
  MaMinhChung: number;
}

const GuiPhanHoi: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [hoatDong, setHoatDong] = useState<HoatDong[]>([]);
  const [maDangKy, setMaDangKy] = useState("");
  const [moTa, setMoTa] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("Vui lòng đăng nhập để tiếp tục.");
      setIsLoading(false);
      return;
    }

    const fetchHoatDong = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5163/api/DangKyHoatDongs/danh-sach-dang-ky", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Status:", res.status);
        if (res.status === 401) {
          setMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem('token');
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
        setMessage("Lỗi khi lấy danh sách hoạt động: " + (err as Error).message);
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
    if (!maDangKy || !moTa || !file) {
      showNotificationMessage("Vui lòng điền đầy đủ thông tin.", false);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("MaDangKy", maDangKy);
    formData.append("MoTa", moTa);
    formData.append("FileAnh", file);

    try {
      const res = await fetch("http://localhost:5163/api/MinhChungHoatDongs/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      console.log("Submit Status:", res.status);
      if (res.status === 401) {
        showNotificationMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", false);
        localStorage.removeItem('token');
        setToken(null);
        return;
      }
      const data: SubmitResponse = await res.json();
      if (res.ok) {
        showNotificationMessage(data.Message, true);
        setMaDangKy("");
        setMoTa("");
        setFile(null);
        setFileName("");
        (document.getElementById("fileInput") as HTMLInputElement).value = "";
      } else {
        showNotificationMessage("Lỗi: " + (data.Message || "Không thể gửi phản hồi."), false);
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
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="gph-container">
      <div className={`gph-notification ${showNotification ? 'gph-show' : ''} ${isSuccess ? 'gph-success' : 'gph-error'}`}>
        <span className="gph-notification-message">{message}</span>
        <button className="gph-close-notification" onClick={() => setShowNotification(false)}>×</button>
      </div>

      <div className="gph-page-header">
        <h1>Gửi Phản Hồi Hoạt Động</h1>
        <p className="gph-header-description">
          Gửi phản hồi về hoạt động bạn đã tham gia và upload ảnh minh chứng
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
                    value={maDangKy}
                    onChange={(e) => setMaDangKy(e.target.value)}
                    disabled={!token || hoatDong.length === 0 || isLoading}
                    className="gph-form-control"
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {Array.isArray(hoatDong) && hoatDong.map(hd => (
                      <option key={hd.MaHoatDong} value={hd.MaHoatDong.toString()}>
                        {hd.TenHoatDong}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="gph-form-group">
                <label htmlFor="description">Mô Tả</label>
                <textarea
                  id="description"
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  placeholder="Nhập mô tả chi tiết về hoạt động bạn đã tham gia..."
                  required
                  disabled={!token || hoatDong.length === 0 || isLoading}
                  className="gph-form-control"
                  rows={5}
                ></textarea>
              </div>
              
              <div className="gph-form-group">
                <label htmlFor="fileInput">Upload Ảnh Minh Chứng</label>
                <div className="gph-file-input-wrapper">
                  <input
                    id="fileInput"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                    disabled={!token || hoatDong.length === 0 || isLoading}
                    className="gph-hidden-file-input"
                  />
                  <div className="gph-custom-file-input">
                    <span className="gph-file-name">{fileName || "Chưa có file nào được chọn"}</span>
                    <button type="button" className="gph-browse-button" onClick={() => document.getElementById('fileInput')?.click()}>
                      Chọn file
                    </button>
                  </div>
                  <p className="gph-file-hint">Chấp nhận các định dạng: JPG, JPEG, PNG</p>
                </div>
              </div>
              
              <div className="gph-form-actions">
                <button 
                  type="submit" 
                  className="gph-submit-button"
                  disabled={!token || hoatDong.length === 0 || isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Gửi Phản Hồi'}
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
                  hoatDong.map(hd => (
                    <div key={hd.MaHoatDong} className="gph-activity-item">
                      <div className="gph-activity-header">
                        <h3 className="gph-activity-title">{hd.TenHoatDong}</h3>
                        <span className={`gph-activity-status gph-status-${hd.TrangThaiHoatDong.toLowerCase().replace(/\s+/g, '-')}`}>
                          {hd.TrangThaiHoatDong}
                        </span>
                      </div>
                      
                      <div className="gph-activity-details">
                        {/* <div className="gph-detail-row">
                          <span className="gph-detail-label">Mã hoạt động:</span>
                          <span className="gph-detail-value">{hd.MaHoatDong}</span>
                        </div> */}
                        <div className="gph-detail-row">
                          <span className="gph-detail-label">Ngày bắt đầu:</span>
                          <span className="gph-detail-value">{hd.NgayBatDau}</span>
                        </div>
                        <div className="gph-detail-row">
                          <span className="gph-detail-label">Địa điểm:</span>
                          <span className="gph-detail-value">{hd.diaDiem}</span>
                        </div>
                        <div className="gph-detail-row">
                          <span className="gph-detail-label">Điểm cộng:</span>
                          <span className="gph-detail-value gph-highlight">{hd.diemCong} điểm</span>
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
                    <p className="gph-empty-hint">Vui lòng đăng ký hoạt động trước khi gửi phản hồi.</p>
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

export default GuiPhanHoi;