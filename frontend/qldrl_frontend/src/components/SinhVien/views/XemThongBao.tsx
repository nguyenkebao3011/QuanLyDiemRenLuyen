import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Eye, User, Bookmark } from 'lucide-react';
import '../css/XemThongBao.css';

// Định nghĩa kiểu dữ liệu cho thông báo
interface ThongBao {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  MaQl: string;
  LoaiThongBao: string;
  TrangThai: string;
  TenNguoiTao: string;
  Khoa: string;
  SoLuotXem: number;
  DaDoc: boolean;
}

const XemThongBao: React.FC = () => {
  const [danhSachThongBao, setDanhSachThongBao] = useState<ThongBao[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedThongBao, setSelectedThongBao] = useState<ThongBao | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThongBao = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5163/api/ThongBao/lay_thong_bao');
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }
        const data: ThongBao[] = await response.json();
        console.log('API Response:', data); // Debug để kiểm tra dữ liệu
        
        setDanhSachThongBao(data);
        // Mặc định chọn thông báo đầu tiên nếu có
        if (data.length > 0) {
          setSelectedThongBao(data[0]);
        }
        setIsLoading(false);
      } catch (err: any) {
        setError(`Đã xảy ra lỗi khi tải thông báo: ${err.message}`);
        setIsLoading(false);
        console.error('Lỗi khi tải thông báo:', err);
      }
    };

    fetchThongBao();
  }, []);

  const handleSelectThongBao = (thongBao: ThongBao): void => {
    setSelectedThongBao(thongBao);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      };
      return date.toLocaleDateString('vi-VN', options);
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  // Xác định loại badge cho từng loại thông báo
  const getBadgeClass = (loaiThongBao: string): string => {
    switch (loaiThongBao) {
      case 'Hoạt động':
        return 'badge-activity';
      case 'Học vụ':
        return 'badge-academic';
      case 'Lịch thi':
        return 'badge-exam';
      case 'Học phí':
        return 'badge-fee';
      default:
        return 'badge-general';
    }
  };

  if (isLoading) {
    return (
      <div className="thong-bao-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông báo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="thong-bao-error">
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="thong-bao-container">
      <div className="thong-bao-header">
        <h2 className="thong-bao-title">
          <Bell className="title-icon" />
          Danh sách thông báo
        </h2>
      </div>

      <div className="thong-bao-content2">
        <div className="thong-bao-list2">
          {danhSachThongBao.length > 0 ? (
            <ul className="notification-list">
              {danhSachThongBao.map((thongBao) => (
                <li 
                  key={thongBao.MaThongBao} 
                  className={`notification-item ${selectedThongBao && selectedThongBao.MaThongBao === thongBao.MaThongBao ? 'selected' : ''} ${thongBao.DaDoc ? 'read' : 'unread'}`}
                  onClick={() => handleSelectThongBao(thongBao)}
                >
                  <div className="notification-item-content">
                    <h3 className="notification-title">{thongBao.TieuDe}</h3>
                    <div className="notification-meta">
                      <span className="notification-date">
                        <Calendar className="meta-icon" />
                        {formatDate(thongBao.NgayTao)}
                      </span>
                      {/* <span className="notification-views">
                        <Eye className="meta-icon" />
                        {thongBao.SoLuotXem} lượt xem
                      </span> */}
                    </div>
                    <div className="notification-footer">
                      <span className={`notification-badge ${getBadgeClass(thongBao.LoaiThongBao)}`}>
                        {thongBao.LoaiThongBao}
                      </span>
                      <span className="notification-author">
                        <User className="meta-icon" />
                        {thongBao.TenNguoiTao}
                      </span>
                    </div>
                  </div>
                  {!thongBao.DaDoc && <div className="unread-indicator"></div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-notification">
              <Bookmark className="empty-icon" />
              <p>Chưa có thông báo nào</p>
            </div>
          )}
        </div>

        {selectedThongBao && (
          <div className="thong-bao-detail2">
            <div className="detail-header">
              <h2 className="detail-title">{selectedThongBao.TieuDe}</h2>
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <User className="detail-icon" />
                  <span>{selectedThongBao.TenNguoiTao}</span>
                </div>
                <div className="detail-meta-item">
                  <Calendar className="detail-icon" />
                  <span>{formatDate(selectedThongBao.NgayTao)}</span>
                </div>
                <div className="detail-meta-item">
                  <span className={`detail-badge ${getBadgeClass(selectedThongBao.LoaiThongBao)}`}>
                    {selectedThongBao.LoaiThongBao}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="detail-content">
              <div dangerouslySetInnerHTML={{ __html: selectedThongBao.NoiDung }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XemThongBao;