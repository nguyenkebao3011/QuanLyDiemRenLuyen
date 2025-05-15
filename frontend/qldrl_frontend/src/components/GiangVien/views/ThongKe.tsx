import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend
} from 'recharts';
import '../css/ThongKe.css';

interface StatsData {
  TongSoSinhVien: number;
  TrungBinhDiemDRL: number;
  LoaiGioi: { SoLuong: number; PhanTram: number };
  LoaiKha: { SoLuong: number; PhanTram: number };
  LoaiTrungBinh: { SoLuong: number; PhanTram: number };
  LoaiYeu: { SoLuong: number; PhanTram: number };
}

interface Lop {
  MaLop: string;
  TenLop: string;
}

interface HocKy {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
}

const ThongKeComponent: React.FC = () => {
  const [lopOptions, setLopOptions] = useState<Lop[]>([]);
  const [hocKyOptions, setHocKyOptions] = useState<HocKy[]>([]);
  const [selectedLop, setSelectedLop] = useState<string>('');
  const [selectedHocKy, setSelectedHocKy] = useState<string>('');
  const [thongKeData, setThongKeData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');

  // Cấu hình axios với token
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Thêm interceptor để xử lý lỗi 401
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  // Lấy danh sách lớp và học kỳ
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lopRes, hocKyRes] = await Promise.all([
          axiosInstance.get('http://localhost:5163/api/Lops/lay_danh_sach_lop_theo_giang_vien'),
          axiosInstance.get('http://localhost:5163/api/HocKy/lay_hoc_ky')
        ]);
        
        setLopOptions(lopRes.data);
        setHocKyOptions(hocKyRes.data);
      } catch (err) {
        console.error('Lỗi lấy dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý thay đổi lớp
  const handleLopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLop(e.target.value);
  };

  // Xử lý thay đổi học kỳ
  const handleHocKyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHocKy(e.target.value);
  };

  // Xử lý thay đổi loại biểu đồ
  const handleChartTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChartType(e.target.value as 'bar' | 'pie');
  };

  // Lấy dữ liệu thống kê khi nhấn nút
  const handleThongKe = async () => {
    if (!selectedLop || !selectedHocKy) {
      setError('Vui lòng chọn cả lớp và học kỳ');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(
        `http://localhost:5163/api/ThongKe/thongke-theo-giang-vien?hocKy=${selectedHocKy}&maLop=${selectedLop}`
      );
      setThongKeData(res.data);
    } catch (err: any) {
      console.error('Lỗi lấy thống kê:', err.response?.data || err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu thống kê');
      setThongKeData(null);
    } finally {
      setLoading(false);
    }
  };

  // Màu sắc cho biểu đồ
  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336'];

  // Dữ liệu cho biểu đồ
  const chartData = thongKeData
    ? [
        { name: 'Giỏi', SoLuong: thongKeData.LoaiGioi.SoLuong, PhanTram: thongKeData.LoaiGioi.PhanTram },
        { name: 'Khá', SoLuong: thongKeData.LoaiKha.SoLuong, PhanTram: thongKeData.LoaiKha.PhanTram },
        { name: 'Trung bình', SoLuong: thongKeData.LoaiTrungBinh.SoLuong, PhanTram: thongKeData.LoaiTrungBinh.PhanTram },
        { name: 'Yếu', SoLuong: thongKeData.LoaiYeu.SoLuong, PhanTram: thongKeData.LoaiYeu.PhanTram },
      ]
    : [];

  // Hiển thị phần trăm trong Tooltip của biểu đồ tròn
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Tính toán lớp đang được chọn
  const selectedLopName = lopOptions.find(lop => lop.MaLop === selectedLop)?.TenLop;
  const selectedHocKyName = hocKyOptions.find(hocKy => String(hocKy.MaHocKy) === selectedHocKy)?.TenHocKy;

  return (
    <div className="thongke-container">
      <div className="thongke-header">
        <h1>Thống kê điểm rèn luyện</h1>
        <p className="thongke-subtitle">Phân tích và theo dõi kết quả rèn luyện của sinh viên</p>
      </div>

      <div className="filters-container">
        <div className="filter-group2">
          <label htmlFor="hocky-select">Học kỳ:</label>
          <select 
            id="hocky-select"
            value={selectedHocKy} 
            onChange={handleHocKyChange}
            className="form-select"
          >
            <option value="">Chọn học kỳ</option>
            {hocKyOptions.map((hocKy) => (
              <option key={hocKy.MaHocKy} value={String(hocKy.MaHocKy)}>
                {hocKy.TenHocKy} - {hocKy.NamHoc}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group2">
          <label htmlFor="lop-select">Lớp:</label>
          <select 
            id="lop-select"
            value={selectedLop} 
            onChange={handleLopChange}
            className="form-select"
          >
            <option value="">Chọn lớp</option>
            {lopOptions.map((lop) => (
              <option key={lop.MaLop} value={lop.MaLop}>
                {lop.TenLop}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleThongKe} 
          disabled={loading}
          className="btn-thongke"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              <span>Đang tải...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5h-2v12h2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H6zm-5 4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H1z"/>
              </svg>
              <span>Thống kê</span>
            </>
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {lopOptions.length === 0 && !loading && !error && (
        <div className="no-data-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          <p>Không có lớp nào được phân công</p>
        </div>
      )}

      {thongKeData && (
        <div className="stats-container">
          <div className="stats-header">
            <h2>Kết quả thống kê</h2>
            <p>
              {selectedLopName} - {selectedHocKyName}
            </p>
          </div>

          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon student-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Tổng số sinh viên</h3>
                <p className="stat-value">{thongKeData.TongSoSinhVien}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon average-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                  <path d="M9.828 4.172a4 4 0 0 0-5.656 0 4 4 0 0 0 0 5.656A4 4 0 0 0 8 10.828a4 4 0 0 0 2.172-.686l3.536 3.536a.5.5 0 1 0 .707-.707l-3.536-3.536a4 4 0 0 0 .686-2.172 4 4 0 0 0-1.172-2.828z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Điểm rèn luyện trung bình</h3>
                <p className="stat-value">{thongKeData.TrungBinhDiemDRL.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-controls">
              <h3>Biểu đồ phân loại kết quả</h3>
              
              <div className="chart-type-selector">
                <label className="radio-container">
                  <input
                    type="radio"
                    name="chartType"
                    value="bar"
                    checked={chartType === 'bar'}
                    onChange={handleChartTypeChange}
                  />
                  <span className="radio-label">Biểu đồ cột</span>
                </label>
                
                <label className="radio-container">
                  <input
                    type="radio"
                    name="chartType"
                    value="pie"
                    checked={chartType === 'pie'}
                    onChange={handleChartTypeChange}
                  />
                  <span className="radio-label">Biểu đồ tròn</span>
                </label>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="SoLuong" name="Số lượng sinh viên" fill="#4CAF50" />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="SoLuong"
                      nameKey="name"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="classification-table">
            <h3>Bảng phân loại kết quả rèn luyện</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Xếp loại</th>
                    <th>Số lượng</th>
                    <th>Phần trăm</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-gioi">
                    <td>Giỏi</td>
                    <td>{thongKeData.LoaiGioi.SoLuong}</td>
                    <td>{thongKeData.LoaiGioi.PhanTram.toFixed(2)}%</td>
                    <td>
                      <span className="status-badge2 status-excellent">Xuất sắc</span>
                    </td>
                  </tr>
                  <tr className="row-kha">
                    <td>Khá</td>
                    <td>{thongKeData.LoaiKha.SoLuong}</td>
                    <td>{thongKeData.LoaiKha.PhanTram.toFixed(2)}%</td>
                    <td>
                      <span className="status-badge2 status-good">Tốt</span>
                    </td>
                  </tr>
                  <tr className="row-trungbinh">
                    <td>Trung bình</td>
                    <td>{thongKeData.LoaiTrungBinh.SoLuong}</td>
                    <td>{thongKeData.LoaiTrungBinh.PhanTram.toFixed(2)}%</td>
                    <td>
                      <span className="status-badge2 status-average">Đạt</span>
                    </td>
                  </tr>
                  <tr className="row-yeu">
                    <td>Yếu</td>
                    <td>{thongKeData.LoaiYeu.SoLuong}</td>
                    <td>{thongKeData.LoaiYeu.PhanTram.toFixed(2)}%</td>
                    <td>
                      <span className="status-badge status-weak">Cần cải thiện</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongKeComponent;