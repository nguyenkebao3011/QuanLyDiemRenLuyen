import React, { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";

type HoatDong = {
  MaHoatDong: number;
  TenHoatDong: string;
  MoTa: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  DiaDiem: string;
  SoLuongToiDa: number;
  DiemCong: number;
  TrangThai: string;
  ThoiGianDienRa: string;
};

const HoatDongList: React.FC = () => {
  const navigate = useNavigate();
  const [hoatDongList, setHoatDongList] = useState<HoatDong[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState("http://localhost:5163/api/HoatDongs/lay-danh-sach-hoat-dong");
  const itemsPerPage = 6;

  // State cho bộ lọc
  const [ten, setTen] = useState("");
  const [batDauTu, setBatDauTu] = useState("");
  const [ketThucTruoc, setKetThucTruoc] = useState("");
  const [diemMin, setDiemMin] = useState("");
  const [diemMax, setDiemMax] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);

  // Chuyển hướng đến trang đăng ký khi click nút đăng ký
  const handleRegister = (maHoatDong: number) => {
    navigate(`/dang-ky-hoat-dong/${maHoatDong}`);
  };

  // Chức năng lọc hoạt động
  const applyFilters = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5163/api/HoatDongs/loc-hoat-dong?";
      
      if (ten) url += `Ten=${encodeURIComponent(ten)}&`;
      if (batDauTu) url += `BatDauTu=${encodeURIComponent(batDauTu)}&`;
      if (ketThucTruoc) url += `KetThucTruoc=${encodeURIComponent(ketThucTruoc)}&`;
      if (diemMin) url += `DiemMin=${encodeURIComponent(diemMin)}&`;
      if (diemMax) url += `DiemMax=${encodeURIComponent(diemMax)}&`;
      if (trangThai) url += `TrangThai=${encodeURIComponent(trangThai)}&`;
      
      // Xóa ký tự '&' ở cuối URL nếu có
      url = url.endsWith('&') ? url.slice(0, -1) : url;
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      if (response.data) {
        setHoatDongList(response.data);
        setCurrentPage(1); // Reset về trang đầu tiên khi lọc
        setError(null);
      }
    } catch (err: any) {
      console.error("Lỗi khi lọc hoạt động:", err);
      setError(`Lỗi khi lọc hoạt động: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xóa bộ lọc
  const clearFilters = () => {
    setTen("");
    setBatDauTu("");
    setKetThucTruoc("");
    setDiemMin("");
    setDiemMax("");
    setTrangThai("");
    fetchHoatDong();
  };

  // Tách function fetchHoatDong để có thể gọi lại
  const fetchHoatDong = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      if (response.data) {
        const chuaKetThuc = response.data.filter(
          (hd: HoatDong) => hd.TrangThai !== "Đã kết thúc"
        );
        setHoatDongList(chuaKetThuc);
        setError(null);
      }
    } catch (err: any) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      setError(`API error (${err.response?.status || 'unknown'}): ${err.message}`);
      
      console.log("Chi tiết lỗi:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        url: apiUrl
      });
      
      const alternativeEndpoints = [
        "http://localhost:5163/api/HoatDongs",
        "http://localhost:5163/api/HoatDong/lay-danh-sach-hoat-dong",
        
      ];
      
      let dataFetched = false;
      
      for (const endpoint of alternativeEndpoints) {
        if (endpoint === apiUrl) continue;
        
        try {
          console.log(`Thử với endpoint: ${endpoint}`);
          const altResponse = await axios.get(endpoint, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
          });
          
          if (altResponse.data) {
            const chuaKetThuc = altResponse.data.filter(
              (hd: HoatDong) => hd.TrangThai !== "Đã kết thúc"
            );
            setHoatDongList(chuaKetThuc);
            setError(null);
            setApiUrl(endpoint);
            dataFetched = true;
            console.log(`Endpoint hoạt động: ${endpoint}`);
            break;
          }
        } catch (altErr) {
          console.log(`Endpoint không hoạt động: ${endpoint}`, altErr);
        }
      }
      
      if (!dataFetched) {
     
        setHoatDongList([
          {
            MaHoatDong: 1,
            TenHoatDong: "Hoạt động mẫu 1",
            MoTa: "Đây là dữ liệu mẫu khi không thể kết nối đến API",
            NgayBatDau: new Date().toISOString(),
            NgayKetThuc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            DiaDiem: "Trường Đại học",
            SoLuongToiDa: 100,
            DiemCong: 5,
            TrangThai: "Sắp diễn ra",
            ThoiGianDienRa: "10-12",
          },
          {
            MaHoatDong: 2,
            TenHoatDong: "Hoạt động mẫu 2",
            MoTa: "Hoạt động thử nghiệm khi API gặp lỗi",
            NgayBatDau: new Date().toISOString(),
            NgayKetThuc: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            DiaDiem: "Hội trường",
            SoLuongToiDa: 50,
            DiemCong: 3,
            TrangThai: "Đang diễn ra",
            ThoiGianDienRa: "10-12",
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoatDong();
  }, [apiUrl]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHoatDongs = hoatDongList.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(hoatDongList.length / itemsPerPage) || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="hoatdong-container">
      <h2 className="hoatdong-title">Danh sách hoạt động</h2>
      
      {/* Toggle button cho bộ lọc */}
      <div className="filter-toggle">
        <button 
          className="btn-toggle-filter" 
          onClick={() => setFilterVisible(!filterVisible)}
        >
          {filterVisible ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
        </button>
      </div>
      
      {/* Bộ lọc hoạt động */}
      {filterVisible && (
        <div className="filter-container">
          <h3 className="filter-title">Lọc hoạt động</h3>
          <div className="filter-form">
            <div className="filter-row">
              <div className="filter-group">
                <label>Tên hoạt động:</label>
                <input 
                  type="text" 
                  value={ten} 
                  onChange={(e) => setTen(e.target.value)} 
                  placeholder="Nhập tên hoạt động" 
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <label>Trạng thái:</label>
                <select 
                  value={trangThai} 
                  onChange={(e) => setTrangThai(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  <option value="Sắp diễn ra">CHƯA BẮT ĐẦU</option>
                  <option value="Đang diễn ra">Đang diễn ra</option>
                  <option value="Đã kết thúc">Đã kết thúc</option>
                  <option value="Hủy bỏ">Hủy bỏ</option>
                </select>
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>Bắt đầu từ:</label>
                <input 
                  type="datetime-local" 
                  value={batDauTu} 
                  onChange={(e) => setBatDauTu(e.target.value)} 
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <label>Kết thúc trước:</label>
                <input 
                  type="datetime-local" 
                  value={ketThucTruoc} 
                  onChange={(e) => setKetThucTruoc(e.target.value)} 
                  className="filter-input"
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>Điểm tối thiểu:</label>
                <input 
                  type="number" 
                  value={diemMin} 
                  onChange={(e) => setDiemMin(e.target.value)} 
                  placeholder="0" 
                  min="0" 
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <label>Điểm tối đa:</label>
                <input 
                  type="number" 
                  value={diemMax} 
                  onChange={(e) => setDiemMax(e.target.value)} 
                  placeholder="10" 
                  min="0" 
                  className="filter-input"
                />
              </div>
            </div>
            
            <div className="filter-actions">
              <button onClick={clearFilters} className="btn-clear-filter">
                Xóa bộ lọc
              </button>
              <button onClick={applyFilters} className="btn-apply-filter">
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p className="error-title">Không thể tải dữ liệu</p>
          <p className="error-details">{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn-reload">
              Làm mới trang
            </button>
            <div className="api-url-changer">
              <input 
                type="text" 
                value={apiUrl} 
                onChange={(e) => setApiUrl(e.target.value)}
                className="api-input"
                placeholder="Nhập URL API mới"
              />
              <button 
                onClick={() => {
                  // Không cần set loading vì useEffect đã phụ thuộc vào apiUrl
                  // và sẽ tự động chạy lại khi apiUrl thay đổi
                }} 
                className="btn-change-api"
              >
                Thay đổi API
              </button>
            </div>
            <div className="api-test-options">
              <p>Các API có thể thử:</p>
              <button 
                onClick={() => setApiUrl("http://localhost:5163/api/HoatDongs")} 
                className="btn-api-option"
              >
                /api/HoatDongs
              </button>
              <button 
                onClick={() => setApiUrl("http://localhost:5163/api/HoatDong")} 
                className="btn-api-option"
              >
                /api/HoatDong
              </button>
              <button 
                onClick={() => setApiUrl("http://localhost:5163/api/HoatDong/danh-sach")} 
                className="btn-api-option"
              >
                /api/HoatDong/danh-sach
              </button>
            </div>
          </div>
        </div>
      ) : currentHoatDongs.length === 0 ? (
        <div className="no-data-container">
          <p className="no-data">Không có hoạt động nào phù hợp với bộ lọc hiện tại.</p>
          {filterVisible && (
            <button onClick={clearFilters} className="btn-clear-filter-centered">
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hoatdong-list">
            {currentHoatDongs.map((hd) => (
              <div className="hoatdong-card" key={hd.MaHoatDong}>
                <div className="hoatdong-header">
                  <h3>{hd.TenHoatDong}</h3>
                  <span className={`status-badge ${hd.TrangThai.toLowerCase().replace(/\s+/g, '-')}`}>
                    {hd.TrangThai}
                  </span>
                </div>
                <div className="hoatdong-content">
                  <p className="hoatdong-desc">{hd.MoTa}</p>
                  <div className="hoatdong-details">
                    <p><i className="icon-calendar"></i> <strong>Thời gian : </strong> {formatDate(hd.NgayBatDau)} → {formatDate(hd.NgayKetThuc)}</p>
                    <p><i className="icon-location"></i> <strong>Địa điểm : </strong> {hd.DiaDiem}</p>
                    <p><i className="icon-user"></i> <strong>Số lượng tối đa : </strong> {hd.SoLuongToiDa}</p>
                    <p><i className="icon-star"></i> <strong>Điểm cộng : </strong> {hd.DiemCong}</p>
                    <p><i className="icon-watch"></i> <strong>Thời gian diễn ra : </strong> {hd.ThoiGianDienRa}</p>

                  </div>
                </div>
                <div className="hoatdong-footer">
                  
                  <button className="btn-chitiet">Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              className="btn-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              &laquo; Trang trước
            </button>
            <span className="page-info">Trang {currentPage} / {totalPages}</span>
            <button
              className="btn-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Trang sau &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HoatDongList;