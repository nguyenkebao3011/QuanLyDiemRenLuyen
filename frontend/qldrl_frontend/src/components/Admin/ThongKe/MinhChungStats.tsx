import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { FileCheck, FileX, File } from "lucide-react";

interface MinhChungStatsProps {
  stats:
    | {
        TrangThai: string;
        SoLuong: number;
      }[]
    | null;
  loading: boolean;
  error: string | null;
}

const MinhChungStats: React.FC<MinhChungStatsProps> = ({
  stats,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="stats-section loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thống kê minh chứng...</p>
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
        <p>Không có dữ liệu thống kê minh chứng</p>
      </div>
    );
  }

  // Prepare data for chart
  const data = stats.map((item) => ({
    name: item.TrangThai || "Không xác định",
    value: item.SoLuong,
  }));

  // Calculate totals
  const totalMinhChung = stats.reduce((sum, item) => sum + item.SoLuong, 0);
  const hopLe =
    stats.find((item) => item.TrangThai?.toLowerCase() === "hợp lệ")?.SoLuong ||
    0;
  const khongHopLe =
    stats.find((item) => item.TrangThai?.toLowerCase() === "không hợp lệ")
      ?.SoLuong || 0;
  const khac = totalMinhChung - hopLe - khongHopLe;

  // Colors for the pie chart
  const COLORS = ["#4caf50", "#f44336", "#9e9e9e"];

  return (
    <div className="stats-section">
      <h3 className="stats-title">
        <File size={20} />
        Thống kê minh chứng
      </h3>

      <div className="stats-summary">
        <div className="summary-item">
          <div className="summary-icon total">
            <File size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Tổng minh chứng</p>
            <h4 className="summary-value">{totalMinhChung}</h4>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon valid">
            <FileCheck size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Hợp lệ</p>
            <h4 className="summary-value">{hopLe}</h4>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon invalid">
            <FileX size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Không hợp lệ</p>
            <h4 className="summary-value">{khongHopLe}</h4>
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
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} minh chứng`, ""]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MinhChungStats;
