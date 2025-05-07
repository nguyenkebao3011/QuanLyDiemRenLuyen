import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface DiemRenLuyenStatsProps {
  stats: {
    DiemTrungBinh: number;
    DiemCaoNhat: number;
    DiemThapNhat: number;
  } | null;
  loading: boolean;
  error: string | null;
  semesterName: string;
}

const DiemRenLuyenStats: React.FC<DiemRenLuyenStatsProps> = ({
  stats,
  loading,
  error,
  semesterName,
}) => {
  if (loading) {
    return (
      <div className="stats-section loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thống kê điểm rèn luyện...</p>
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
        <p>Không có dữ liệu thống kê điểm rèn luyện cho {semesterName}</p>
      </div>
    );
  }

  // Format numbers
  const formatNumber = (num: number) => {
    return Math.round(num * 10) / 10;
  };

  // Prepare data for chart
  const data = [
    {
      name: "Điểm trung bình",
      value: formatNumber(stats.DiemTrungBinh),
      fill: "#2196f3",
    },
    {
      name: "Điểm cao nhất",
      value: formatNumber(stats.DiemCaoNhat),
      fill: "#4caf50",
    },
    {
      name: "Điểm thấp nhất",
      value: formatNumber(stats.DiemThapNhat),
      fill: "#f44336",
    },
  ];

  return (
    <div className="stats-section">
      <h3 className="stats-title">
        <Award size={20} />
        Thống kê điểm rèn luyện - {semesterName}
      </h3>

      <div className="stats-summary">
        <div className="summary-item">
          <div className="summary-icon average">
            <Award size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Điểm trung bình</p>
            <h4 className="summary-value">
              {formatNumber(stats.DiemTrungBinh)}
            </h4>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon highest">
            <TrendingUp size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Điểm cao nhất</p>
            <h4 className="summary-value">{formatNumber(stats.DiemCaoNhat)}</h4>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-icon lowest">
            <TrendingDown size={16} />
          </div>
          <div className="summary-content">
            <p className="summary-label">Điểm thấp nhất</p>
            <h4 className="summary-value">
              {formatNumber(stats.DiemThapNhat)}
            </h4>
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value} điểm`, ""]} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DiemRenLuyenStats;
