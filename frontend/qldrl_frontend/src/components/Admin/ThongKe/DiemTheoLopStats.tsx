import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Award } from "lucide-react";

interface DiemTheoLopStatsProps {
  stats:
    | {
        MaLop: string;
        SoLuong: number;
        DiemTrungBinh: number;
        SoSinhVienGioi: number;
        SoSinhVienKha: number;
        SoSinhVienTb: number;
        SoSinhVienYeu: number;
      }[]
    | null;
  loading: boolean;
  error: string | null;
  semesterName: string;
}

const DiemTheoLopStats: React.FC<DiemTheoLopStatsProps> = ({
  stats,
  loading,
  error,
  semesterName,
}) => {
  if (loading) {
    return (
      <div className="stats-section loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thống kê điểm theo lớp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-section error">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="stats-section empty">
        <p>Không có dữ liệu thống kê điểm theo lớp cho {semesterName}</p>
      </div>
    );
  }

  // Format numbers
  const formatNumber = (num: number) => {
    return Math.round(num * 10) / 10;
  };

  // Prepare data for chart
  const chartData = stats.map((item) => ({
    name: item.MaLop,
    DiemTB: formatNumber(item.DiemTrungBinh),
    SoLuong: item.SoLuong,
    Gioi: item.SoSinhVienGioi,
    Kha: item.SoSinhVienKha,
    TrungBinh: item.SoSinhVienTb,
    Yeu: item.SoSinhVienYeu,
  }));

  return (
    <div className="stats-section">
      <h3 className="stats-title">
        <Users size={20} />
        Thống kê điểm rèn luyện theo lớp - {semesterName}
      </h3>

      <div className="chart-container" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="DiemTB"
              name="Điểm trung bình"
              fill="#8884d8"
            />
            <Bar
              yAxisId="right"
              dataKey="SoLuong"
              name="Số lượng sinh viên"
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="lop-table-container">
        <table className="lop-table">
          <thead>
            <tr>
              <th>Mã lớp</th>
              <th>Số lượng SV</th>
              <th>Điểm TB</th>
              <th>Giỏi</th>
              <th>Khá</th>
              <th>Trung bình</th>
              <th>Yếu</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((item, index) => (
              <tr key={index}>
                <td>{item.MaLop}</td>
                <td>{item.SoLuong}</td>
                <td>{formatNumber(item.DiemTrungBinh)}</td>
                <td>{item.SoSinhVienGioi}</td>
                <td>{item.SoSinhVienKha}</td>
                <td>{item.SoSinhVienTb}</td>
                <td>{item.SoSinhVienYeu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiemTheoLopStats;
