import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import axios from 'axios';


interface ThongBaoDTOSV {
  MaThongBao: number;
  MaChiTietThongBao: number;
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
}

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

const Toast: React.FC<ToastProps> = ({ thongBao, onClose, onRead }) => {
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
    return '🚫'; // Emoji cho thông báo từ chối
  };

  const formattedContent = formatNoiDung(thongBao.NoiDung);
  const eventTime = extractEventTime(thongBao.NoiDung);

  return (
    <div className="thong-bao-toast" onClick={handleClick} data-type={thongBao.LoaiThongBao}>
      <div className="bieu-tuong-toast">{getEmoji()}</div>
      <div className="noi-dung-toast">
        <h4 className="tieu-de-toast tieu-de-noi-bat">{thongBao.TieuDe}</h4>
        <p className="tin-nhan-toast" dangerouslySetInnerHTML={{ __html: formattedContent }}></p>
        {eventTime && (
          <p className="thoi-gian-su-kien-toast">
            <span className="bieu-tuong-thoi-gian-su-kien">📆</span> {eventTime}
          </p>
        )}
        <p className="thoi-gian-toast">{new Date(thongBao.NgayTao).toLocaleString('vi-VN')}</p>
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

  useEffect(() => {
    const layDanhSachThongBao = async () => {
      try {
        const response = await axios.get('http://localhost:5163/api/ThongBaoHoatDong/ThongBao-GiangVien', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const duLieu: ThongBaoDTOSV[] = response.data;
        console.log('Danh sách thông báo:', duLieu);

        // Kiểm tra dữ liệu trùng lặp
        const maThongBaoDuyNhat = new Set(duLieu.map((tb) => tb.MaThongBao));
        let thongBaoHopLe: ThongBaoDTOSV[] = [];
        if (maThongBaoDuyNhat.size !== duLieu.length) {
          console.warn('Phát hiện MaThongBao bị trùng:', duLieu);
          thongBaoHopLe = Array.from(new Map(duLieu.map((tb) => [tb.MaThongBao, tb])).values());
        } else {
          thongBaoHopLe = duLieu.filter((tb) => tb.MaThongBao != null);
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
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const dongToast = (maThongBao: number) => {
    setDanhSachToast((prevToasts) => prevToasts.filter((toast) => toast.MaThongBao !== maThongBao));
  };

  return (
    <>
      <div className="container-bieu-tuong-thong-bao" ref={dropdownRef}>
        <div className="bieu-tuong-thong-bao" onClick={() => setHienThi(!hienThi)}>
          <Bell size={20} />
          {soThongBaoChuaDoc > 0 && <span className="huy-hieu-thong-bao">{soThongBaoChuaDoc}</span>}
        </div>

        {hienThi && (
          <div className="dropdown-thong-bao">
            <div className="header-dropdown-thong-bao">
              <h3>Thông báo</h3>
            </div>
            {danhSachThongBao.length === 0 ? (
              <div className="thong-bao-trong">Không có thông báo nào</div>
            ) : (
              <ul className="danh-sach-thong-bao">
                {danhSachThongBao.map((tb, index) => {
                  const processedContent = formatNoiDung(tb.NoiDung);
                  return (
                    <li
                      key={tb.MaThongBao ?? `thongbao-${index}`}
                      className={`muc-thong-bao ${tb.DaDoc ? "da-doc" : ''}`}
                      onClick={() => !tb.DaDoc && tb.MaThongBao && danhDauDaDoc(tb.MaThongBao)}
                    >
                      <div className="noi-dung-thong-bao">
                        <div className="bieu-tuong-loai-thong-bao">
                          <span className="rejection">🚫</span>
                        </div>
                        <div className="chi-tiet-thong-bao">
                          <h4 className={`tieu-de-noi-bat ${tb.DaDoc ? 'da-doc' : ''}`}>{tb.TieuDe}</h4>
                          <div dangerouslySetInnerHTML={{ __html: processedContent }}></div>
                          <p className="ngay-thang">{new Date(tb.NgayTao).toLocaleString('vi-VN')}</p>
                        </div>
                        {!tb.DaDoc && <span className="cham-chua-doc-thong-bao"></span>}
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
        <div className="container-toast">
          {danhSachToast.map((tb) => (
            <Toast
              key={tb.MaThongBao}
              thongBao={tb}
              onClose={() => dongToast(tb.MaThongBao)}
              onRead={() => danhDauDaDoc(tb.MaThongBao)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ThongBaoDropdown;