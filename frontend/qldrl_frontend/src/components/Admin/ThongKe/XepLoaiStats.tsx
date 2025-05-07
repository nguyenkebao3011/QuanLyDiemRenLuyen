import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Award } from "lucide-react";

interface XepLoaiStatsProps {
  stats: {
    TongSinhVien: number;
    BaoCaoTheoLoai: { XepLoai: string; SoLuong: number }[];
  } | null;
  loading: boolean;
  error: string | null;
  semesterName: string;
}

const XepLoaiStats: React.FC<XepLoaiStatsProps> = ({
  stats,
  loading,
  error,
  semesterName,
}) => {
  if (loading) {
    return (
      <div className="stats-section loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thống kê xếp loại...</p>
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

  if (!stats || !stats.BaoCaoTheoLoai || stats.BaoCaoTheoLoai.length === 0) {
    return (
      <div className="stats-section empty">
        <p>Không có dữ liệu xếp loại cho {semesterName}</p>
      </div>
    );
  }

  // Prepare data for chart
  const data = stats.BaoCaoTheoLoai.map((item) => ({
    name: item.XepLoai || "Không xác định",
    value: item.SoLuong,
  }));

  // Colors for different classifications
  const COLORS = [
    "#4caf50",
    "#2196f3",
    "#ff9800",
    "#f44336",
    "#9c27b0",
    "#795548",
  ];

  // Get percentage for each classification
  const getPercentage = (value: number) => {
    return stats.TongSinhVien > 0
      ? ((value / stats.TongSinhVien) * 100).toFixed(1) + "%"
      : "0%";
  };

  return (
    <div className="stats-section">
      <h3 className="stats-title">
        <Award size={20} />
        Phân loại điểm rèn luyện - {semesterName}
      </h3>

      <div className="stats-summary">
        <div className="summary-item full-width">
          <div className="summary-icon total">
            <Award size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Tổng số sinh viên được xếp loại</p>
            <h4 className="summary-value">{stats.TongSinhVien}</h4>
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) =>
                `${name}: ${value} (${getPercentage(value)})`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} sinh viên`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="xep-loai-table">
        <table>
          <thead>
            <tr>
              <th>Xếp loại</th>
              <th>Số lượng</th>
              <th>Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            {stats.BaoCaoTheoLoai.map((item, index) => (
              <tr key={index}>
                <td>{item.XepLoai || "Không xác định"}</td>
                <td>{item.SoLuong}</td>
                <td>{getPercentage(item.SoLuong)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default XepLoaiStats;
