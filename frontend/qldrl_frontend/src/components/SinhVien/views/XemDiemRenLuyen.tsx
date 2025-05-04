import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Award, ChevronDown } from 'lucide-react';
import '../css/XemDiemRenLuyen.css';
// Interface định nghĩa kiểu dữ liệu học kỳ
interface HocKy {
  MaHocKy: string;
  TenHocKy: string;
  NgayChot: string;
  TrangThai: string;
  TongDiem: number;
  XepLoai: string;
}

// Hàm lấy token từ cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const XemDiemRenLuyen: React.FC = () => {
  const [diemRenLuyenData, setDiemRenLuyenData] = useState<HocKy[]>([]);
  const [selectedHocKy, setSelectedHocKy] = useState<HocKy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Thử lấy token từ localStorage, sessionStorage, và cookie
        const localToken = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwt');
        const sessionToken = sessionStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('jwt');
        const cookieToken = getCookie('authToken') || getCookie('token') || getCookie('jwt');

       

        const token = localToken || sessionToken || cookieToken;

        if (!token) {
          throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }

        const response = await fetch('http://localhost:5163/api/DiemRenLuyens/xem-diem-tat-ca-hoc-ky', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Gửi cookie nếu backend dùng HTTP-only cookie
        });

        
      

        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Không thể đọc response';
          }
          console.log('Response body:', errorText);

          if (response.status === 401) {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          } else if (response.status === 400) {
            throw new Error('Dữ liệu không hợp lệ: ' + errorText);
          } else {
            throw new Error(`Lỗi ${response.status}: ${errorText || response.statusText}`);
          }
        }

        const result = await response.json();
        

        setDiemRenLuyenData(result.data || []);
        setSelectedHocKy(result.data[0] ?? null);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Lỗi khi lấy điểm rèn luyện:', error);
        setErrorMessage(error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHocKyChange = (hocKy: HocKy) => {
    setSelectedHocKy(hocKy);
    setIsDropdownOpen(false);
  };

  const getXepLoaiClass = (xepLoai: string): string => {
    switch (xepLoai) {
      case 'Xuất sắc': return 'xep-loai-xuat-sac';
      case 'Tốt': return 'xep-loai-tot';
      case 'Khá': return 'xep-loai-kha';
      case 'Trung bình': return 'xep-loai-trung-binh';
      case 'Yếu': return 'xep-loai-yeu';
      case 'Kém': return 'xep-loai-kem';
      default: return 'xep-loai-default';
    }
  };

  const getDiemProgress = (diem: number): number => {
    return Math.min(Math.max(diem, 0), 100);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="error-container">
        <AlertCircle className="error-icon" />
        <p className="error-message">{errorMessage}</p>
        <button
          className="retry-button"
          onClick={() => window.location.href = '/login'}
        >
          Đăng nhập lại
        </button>
      </div>
    );
  }

  if (!diemRenLuyenData.length) {
    return (
      <div className="no-data-container">
        <p>Chưa có điểm rèn luyện nào được ghi nhận.</p>
      </div>
    );
  }

  return (
    <div className="diem-ren-luyen-container">
      <div className="header-section">
        <h3 className="page-title">Xem Điểm Rèn Luyện</h3>

        <div className="dropdown-container">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="dropdown-button"
          >
            <span>{selectedHocKy?.TenHocKy || 'Chọn học kỳ'}</span>
            <ChevronDown className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              {diemRenLuyenData.map((hocKy) => (
                <div
                  key={hocKy.MaHocKy}
                  className="dropdown-item"
                  onClick={() => handleHocKyChange(hocKy)}
                >
                  {hocKy.TenHocKy}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedHocKy && (
        <div className="diem-detail-container">
          <div className="hoc-ky-info">
            <div className="hoc-ky-header">
              <h4 className="hoc-ky-title">{selectedHocKy.TenHocKy}</h4>
              <p className="ngay-chot">
                Ngày chốt:{' '}
                {selectedHocKy.NgayChot
                  ? new Date(selectedHocKy.NgayChot).toLocaleDateString('vi-VN')
                  : 'Chưa chốt'}
              </p>
            </div>

            <div className="status-badge2">
              <div
                className={`status-indicator ${
                  selectedHocKy.TrangThai === 'Đã chốt' ? 'status-completed' : 'status-pending'
                }`}
              >
                {selectedHocKy.TrangThai === 'Đã chốt' ? (
                  <CheckCircle className="status-icon" />
                ) : (
                  <AlertCircle className="status-icon" />
                )}
                <span className="status-text">{selectedHocKy.TrangThai}</span>
              </div>
            </div>
          </div>

          <div className="score-card">
            <div className="score-header">
              <h5 className="score-title">Tổng Điểm</h5>
              <div className="score-value">
                <Award className="award-icon" />
                <span className="total-score">{selectedHocKy.TongDiem}</span>
                <span className="max-score">/100</span>
              </div>
            </div>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${getDiemProgress(selectedHocKy.TongDiem)}%` }}
              ></div>
            </div>
          </div>

          <div className="classification-card">
            <div className="classification-content">
              <h5 className="classification-title">Xếp Loại</h5>
              <span className={`classification-value ${getXepLoaiClass(selectedHocKy.XepLoai)}`}>
                {selectedHocKy.XepLoai}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XemDiemRenLuyen;