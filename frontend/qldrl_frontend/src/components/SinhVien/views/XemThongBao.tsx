import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Eye, User, Bookmark, CheckCircle } from 'lucide-react';
import '../css/XemThongBao.css';

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
        if (!response.ok) throw new Error(`Lỗi HTTP! Status: ${response.status}`);

        const data: ThongBao[] = await response.json();
        setDanhSachThongBao(data);
        if (data.length > 0) setSelectedThongBao(data[0]);
        setIsLoading(false);
      } catch (err: any) {
        setError(`Đã xảy ra lỗi khi tải thông báo: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchThongBao();
  }, []);

  const handleSelectThongBao = (thongBao: ThongBao): void => {
    setSelectedThongBao(thongBao);
  };

  const handleMarkAllAsRead = () => {
    const updated = danhSachThongBao.map(tb => ({ ...tb, DaDoc: true }));
    setDanhSachThongBao(updated);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('vi-VN', options);
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  const getBadgeClass = (loaiThongBao: string): string => {
    switch (loaiThongBao) {
      case 'Hoạt động': return 'tb-badge-activity';
      case 'Học vụ': return 'tb-badge-academic';
      case 'Lịch thi': return 'tb-badge-exam';
      case 'Học phí': return 'tb-badge-fee';
      default: return 'tb-badge-general';
    }
  };

  if (isLoading) {
    return <div className="tb-loader"><div className="tb-spinner"></div><p>Đang tải thông báo...</p></div>;
  }

  if (error) {
    return <div className="tb-error"><p>{error}</p><button onClick={() => window.location.reload()}>Thử lại</button></div>;
  }

  return (
    <div className="tb-wrapper">
      <div className="tb-header">
        <h2><Bell /> Danh sách thông báo</h2>
        <button className="tb-mark-read-btn" onClick={handleMarkAllAsRead}>
          <CheckCircle className="tb-icon" /> Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="tb-main">
        <ul className="tb-list">
          {danhSachThongBao.length > 0 ? danhSachThongBao.map(thongBao => (
            <li key={thongBao.MaThongBao} className={`tb-item ${selectedThongBao?.MaThongBao === thongBao.MaThongBao ? 'tb-selected' : ''} ${thongBao.DaDoc ? 'tb-read' : 'tb-unread'}`} onClick={() => handleSelectThongBao(thongBao)}>
              <div className="tb-content">
                <h3 className="tb-title">{thongBao.TieuDe}</h3>
                <div className="tb-meta">
                  <span><Calendar className="tb-icon" /> {formatDate(thongBao.NgayTao)}</span>
                  <span className={`tb-badge ${getBadgeClass(thongBao.LoaiThongBao)}`}>{thongBao.LoaiThongBao}</span>
                </div>
                <div className="tb-author"><User className="tb-icon" /> {thongBao.TenNguoiTao}</div>
              </div>
              {!thongBao.DaDoc && <div className="tb-unread-indicator"></div>}
            </li>
          )) : (
            <div className="tb-empty"><Bookmark className="tb-icon" /> <p>Chưa có thông báo nào</p></div>
          )}
        </ul>

        {selectedThongBao && (
          <div className="tb-detail">
            <h2>{selectedThongBao.TieuDe}</h2>
            <div className="tb-detail-meta">
              <span><User className="tb-icon" /> {selectedThongBao.TenNguoiTao}</span>
              <span><Calendar className="tb-icon" /> {formatDate(selectedThongBao.NgayTao)}</span>
              <span className={`tb-badge ${getBadgeClass(selectedThongBao.LoaiThongBao)}`}>{selectedThongBao.LoaiThongBao}</span>
            </div>
            <div className="tb-detail-body" dangerouslySetInnerHTML={{ __html: selectedThongBao.NoiDung }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XemThongBao;
