import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import axios from 'axios';
import '../css/NotificationDropdown.css';

interface ThongBaoDTOSV {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  DaDoc: boolean;
  NgayDoc?: string | null;
  LoaiThongBao: string;
}

interface ToastProps {
  thongBao: ThongBaoDTOSV;
  onClose: () => void;
  onRead: () => void;
  onRespond?: (response: 'XacNhan' | 'TuChoi') => void; // Thêm prop để xử lý phản hồi
}

// Hàm xử lý định dạng nội dung thông báo đẹp hơn
const formatNoiDung = (noiDung: string): string => {
  let formattedContent = noiDung.replace(/\[MaHoatDong:\d+\]$/, '').trim();
  formattedContent = formattedContent.replace(
    /(\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4})/g,
    '<span class="highlight-date">$1</span>'
  );
  formattedContent = formattedContent.replace(
    /(\d{1,2}:\d{2}(:\d{2})?)/g,
    '<span class="highlight-time">$1</span>'
  );
  formattedContent = formattedContent.replace(
    /\b(Địa điểm|ở)\s+([A-ZÀ-Ỵ][^\.,\n]+)/g,
    '$1 <span class="highlight-location">$2</span>'
  );
  const importantWords = ['bắt đầu', 'kết thúc', 'quan trọng', 'lưu ý', 'hạn chót'];
  importantWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    formattedContent = formattedContent.replace(regex, `<span class="highlight-important">${word}</span>`);
  });
  return formattedContent;
};

// Hàm trích xuất thời gian từ nội dung thông báo
const extractEventTime = (noiDung: string): string | null => {
  const dateMatch = noiDung.match(/(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/);
  const timeMatch = noiDung.match(/(\d{1,2}:\d{2}(:\d{2})?)/);
  if (dateMatch && timeMatch) {
    return `${dateMatch[0]} ${timeMatch[0]}`;
  } else if (dateMatch) {
    return dateMatch[0];
  } else if (timeMatch) {
    return timeMatch[0];
  }
  return null;
};

const Toast: React.FC<ToastProps> = ({ thongBao, onClose, onRead, onRespond }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    onRead();
    onClose();
  };

  const getEmoji = () => {
    const title = thongBao.TieuDe.toLowerCase();
    if (thongBao.LoaiThongBao === 'Thay đổi lịch trình') {
      return '📅';
    } else if (thongBao.LoaiThongBao === 'Nhắc nhở') {
      return '⏰';
    } else if (thongBao.LoaiThongBao === 'Chỉ định sinh viên') {
      return '🎯';
    } else if (title.includes('Giới thiệu') || title.includes('thể thao')) {
      return '🏆';
    } else if (title.includes('hội thao') || title.includes('thi đấu')) {
      return '🎯';
    } else if (title.includes('hỗ trợ') || title.includes('hướng dẫn')) {
      return '🎓';
    } else if (title.includes('tổ chức') || title.includes('chào mừng')) {
      return '🎉';
    }
    return '🔔';
  };

  const formattedContent = formatNoiDung(thongBao.NoiDung);
  const eventTime = extractEventTime(thongBao.NoiDung);

  return (
    <div
      className="toast-notification"
      onClick={thongBao.LoaiThongBao !== 'Chỉ định sinh viên' ? handleClick : undefined}
      data-type={thongBao.LoaiThongBao}
    >
      <div className="toast-icon">{getEmoji()}</div>
      <div className="toast-content">
        <h4 className="toast-title title-prominent">{thongBao.TieuDe}</h4>
        <p className="toast-message" dangerouslySetInnerHTML={{ __html: formattedContent }}></p>
        {eventTime && (
          <p className="toast-event-time">
            <span className="event-time-icon">📆</span> {eventTime}
          </p>
        )}
        <p className="toast-time">{new Date(thongBao.NgayTao).toLocaleString('vi-VN')}</p>
        {thongBao.LoaiThongBao === 'Chỉ định sinh viên' && !thongBao.DaDoc && (
          <div className="toast-actions">
            <button
              className="toast-action-button confirm2"
              onClick={(e) => {
                e.stopPropagation();
                onRespond?.('XacNhan');
                onClose();
              }}
            >
              Xác Nhận
            </button>
            <button
              className="toast-action-button reject2"
              onClick={(e) => {
                e.stopPropagation();
                onRespond?.('TuChoi');
                onClose();
              }}
            >
              Từ Chối
            </button>
          </div>
        )}
      </div>
      <button
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ThongBaoDropdown: React.FC = () => {
  const [hienThi, setHienThi] = useState<boolean>(false);
  const [danhSachThongBao, setDanhSachThongBao] = useState<ThongBaoDTOSV[]>([]);
  const [soThongBaoChuaDoc, setSoThongBaoChuaDoc] = useState<number>(0);
  const [danhSachToast, setDanhSachToast] = useState<ThongBaoDTOSV[]>([]);
  const [daHienThiToast, setDaHienThiToast] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token') || '';

  const handleRespond = async (maThongBao: number, response: 'XacNhan' | 'TuChoi') => {
    try {
      const maSV = localStorage.getItem('maSV') || ''; // Giả sử mã sinh viên được lưu trong localStorage
      await axios.post(
        `http://localhost:5163/api/ThongBaoHoatDong/${maThongBao}/respond`,
        { MaChiTietThongBao: maThongBao, MaSV: maSV, Response: response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Cập nhật trạng thái thông báo
      setDanhSachThongBao((prev) =>
        prev.map((tb) =>
          tb.MaThongBao === maThongBao ? { ...tb, DaDoc: true, NgayDoc: new Date().toISOString() } : tb
        )
      );
      setSoThongBaoChuaDoc((prev) => prev - 1);
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
    }
  };

  useEffect(() => {
    const layDanhSachThongBao = async () => {
      try {
        const response = await axios.get('http://localhost:5163/api/ThongBaoHoatDong/ThongBao-Thay-Doi-va-nhac-nho', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const duLieu: ThongBaoDTOSV[] = response.data;
        console.log('Danh sách thông báo:', duLieu);

        const maThongBaoDuyNhat = new Set(duLieu.map((tb) => tb.MaThongBao));
        let thongBaoHopLe: ThongBaoDTOSV[] = [];
        if (maThongBaoDuyNhat.size !== duLieu.length) {
          console.warn('Phát hiện MaThongBao bị trùng:', duLieu);
          thongBaoHopLe = Array.from(new Map(duLieu.map((tb) => [tb.MaThongBao, tb])).values());
        } else {
          const coMaThongBaoKhongHopLe = duLieu.some((tb) => tb.MaThongBao == null);
          if (coMaThongBaoKhongHopLe) {
            console.warn('Phát hiện MaThongBao không hợp lệ (undefined/null):', duLieu);
            thongBaoHopLe = duLieu.filter((tb) => tb.MaThongBao != null);
          } else {
            thongBaoHopLe = duLieu;
          }
        }

        setDanhSachThongBao(thongBaoHopLe);
        setSoThongBaoChuaDoc(thongBaoHopLe.filter((tb) => !tb.DaDoc).length);

        const thongBaoChuaDoc = thongBaoHopLe.filter((tb) => !tb.DaDoc && !daHienThiToast.has(tb.MaThongBao));
        if (thongBaoChuaDoc.length > 0) {
          const toastsToShow = thongBaoChuaDoc.slice(0, 3);
          setDanhSachToast(toastsToShow);
          setDaHienThiToast((prevSet) => {
            const newSet = new Set(prevSet);
            toastsToShow.forEach((tb) => newSet.add(tb.MaThongBao));
            return newSet;
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thông báo:', error);
      }
    };

    layDanhSachThongBao();
    const interval = setInterval(layDanhSachThongBao, 30000);
    return () => clearInterval(interval);
  }, [token, daHienThiToast]);

  useEffect(() => {
    const xuLyNhapChuotNgoai = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHienThi(false);
      }
    };
    document.addEventListener('mousedown', xuLyNhapChuotNgoai);
    return () => document.removeEventListener('mousedown', xuLyNhapChuotNgoai);
  }, []);

  const danhDauDaDoc = async (maThongBao: number) => {
    if (!maThongBao) {
      console.error('MaThongBao không hợp lệ hoặc undefined');
      return;
    }
    try {
      await axios.put(
        `http://localhost:5163/api/ThongBaoHoatDong/doc/${maThongBao}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDanhSachThongBao((truocDo) =>
        truocDo.map((tb) =>
          tb.MaThongBao === maThongBao ? { ...tb, DaDoc: true, NgayDoc: new Date().toISOString() } : tb
        )
      );
      setSoThongBaoChuaDoc((truocDo) => truocDo - 1);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Lỗi khi đánh dấu đã đọc:', error.message, error.response?.data);
      } else {
        console.error('Lỗi không xác định:', error);
      }
    }
  };

  const dongToast = (maThongBao: number) => {
    setDanhSachToast((prevToasts) => prevToasts.filter((toast) => toast.MaThongBao !== maThongBao));
  };

  return (
    <>
      <div className="notification-icon-container" ref={dropdownRef}>
        <div className="notification-icon" onClick={() => setHienThi(!hienThi)}>
          <Bell size={20} />
          {soThongBaoChuaDoc > 0 && <span className="notification-badge2">{soThongBaoChuaDoc}</span>}
        </div>

        {hienThi && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <h3>Thông báo</h3>
            </div>
            {danhSachThongBao.length === 0 ? (
              <div className="notification-empty">Không có thông báo nào</div>
            ) : (
              <ul className="notification-list2">
                {danhSachThongBao.map((tb, index) => {
                  const processedContent = formatNoiDung(tb.NoiDung);
                  return (
                    <li
                      key={tb.MaThongBao ?? `thongbao-${index}`}
                      className={`notification-item ${tb.DaDoc ? 'read' : ''}`}
                      onClick={() => !tb.DaDoc && tb.MaThongBao && tb.LoaiThongBao !== 'Chỉ định sinh viên' && danhDauDaDoc(tb.MaThongBao)}
                    >
                      <div className="notification-content">
                        <div className="notification-icon-type">
                          {tb.LoaiThongBao === 'Thay đổi lịch trình' ? (
                            <span className="schedule">📅</span>
                          ) : tb.LoaiThongBao === 'Nhắc nhở' ? (
                            <span className="reminder">⏰</span>
                          ) : tb.LoaiThongBao === 'Chỉ định sinh viên' ? (
                            <span className="assignment">🎯</span>
                          ) : (
                            <span className="general">🔔</span>
                          )}
                        </div>
                        <div className="notification-details">
                          <h4 className={`title-prominent ${tb.DaDoc ? 'read' : ''}`}>{tb.TieuDe}</h4>
                          <div dangerouslySetInnerHTML={{ __html: processedContent }}></div>
                          <p className="date">{new Date(tb.NgayTao).toLocaleString('vi-VN')}</p>
                          {tb.LoaiThongBao === 'Chỉ định sinh viên' && !tb.DaDoc && (
                            <div className="notification-actions">
                              <button
                                className="action-button confirm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  tb.MaThongBao && handleRespond(tb.MaThongBao, 'XacNhan');
                                }}
                              >
                                Xác Nhận
                              </button>
                              <button
                                className="action-button reject"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  tb.MaThongBao && handleRespond(tb.MaThongBao, 'TuChoi');
                                }}
                              >
                                Từ Chối
                              </button>
                            </div>
                          )}
                        </div>
                        {!tb.DaDoc && <span className="notification-unread-dot"></span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {danhSachToast.length > 0 && (
        <div className="toast-container">
          {danhSachToast.map((tb) => (
            <Toast
              key={tb.MaThongBao}
              thongBao={tb}
              onClose={() => dongToast(tb.MaThongBao)}
              onRead={() => danhDauDaDoc(tb.MaThongBao)}
              onRespond={(response) => handleRespond(tb.MaThongBao, response)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ThongBaoDropdown;