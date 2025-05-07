import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CheckCircle, AlertCircle } from "lucide-react";

interface PhanHoiStatsProps {
  stats: {
    TongPhanHoi: number;
    DaXuLy: number;
    ChuaXuLy: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const PhanHoiStats: React.FC<PhanHoiStatsProps> = ({
  stats,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="stats-section loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thống kê phản hồi...</p>
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

  if (!stats) {
    return (
      <div className="stats-section empty">
        <p>Không có dữ liệu thống kê phản hồi</p>
      </div>
    );
  }

  const data = [
    { name: "Đã xử lý", value: stats.DaXuLy },
    { name: "Chưa xử lý", value: stats.ChuaXuLy },
  ];

  const COLORS = ["#4caf50", "#ff9800"];

  return (
    <div className="stats-section">
      <h3 className="stats-title">
        <MessageSquareIcon size={20} />
        Thống kê phản hồi
      </h3>

      <div className="stats-summary">
        <div className="summary-item">
          <div className="summary-icon total">
            <MessageSquareIcon size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Tổng phản hồi</p>
            <h4 className="summary-value">{stats.TongPhanHoi}</h4>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon processed">
            <CheckCircle size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Đã xử lý</p>
            <h4 className="summary-value">{stats.DaXuLy}</h4>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon pending">
            <AlertCircle size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Chưa xử lý</p>
            <h4 className="summary-value">{stats.ChuaXuLy}</h4>
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
            <Tooltip formatter={(value) => [`${value} phản hồi`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Custom icon component to avoid naming conflicts with Recharts
const MessageSquareIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default PhanHoiStats;
