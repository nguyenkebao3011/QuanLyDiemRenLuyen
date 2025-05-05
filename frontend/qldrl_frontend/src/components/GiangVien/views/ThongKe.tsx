import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Đăng ký các thành phần của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

type ThongKeDiem = {
  xuatSac: number;
  tot: number;
  kha: number;
  trungBinh: number;
  yeu: number;
};

const ThongKeDiemRenLuyen: React.FC = () => {
  const [thongKe, setThongKe] = useState<ThongKeDiem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy dữ liệu thống kê từ API
  const fetchThongKe = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5163/api/ThongKe/diem-ren-luyen",
        {
          params: {
            lop: "DHTH20A",
            hocKy: "HK1-2025",
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (response.data) {
        setThongKe(response.data);
        setError(null);
      }
    } catch (err: any) {
      setError(`Lỗi khi lấy dữ liệu thống kê: ${err.message}`);
      // Dữ liệu mẫu khi API lỗi
      setThongKe({
        xuatSac: 10,
        tot: 20,
        kha: 50,
        trungBinh: 15,
        yeu: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThongKe();
  }, []);

  // Dữ liệu cho biểu đồ tròn
  const chartData = {
    labels: [
      "Xuất sắc (≥90)",
      "Tốt (80-89)",
      "Khá (65-79)",
      "Trung bình (50-64)",
      "Yếu (<50)",
    ],
    datasets: [
      {
        label: "Phân bố điểm rèn luyện",
        data: thongKe
          ? [
              thongKe.xuatSac,
              thongKe.tot,
              thongKe.kha,
              thongKe.trungBinh,
              thongKe.yeu,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: [
          "#36A2EB",
          "#4BC0C0",
          "#FFCE56",
          "#FF9F40",
          "#FF6384",
        ],
        borderColor: ["#FFFFFF"],
        borderWidth: 1,
      },
    ],
  };

  // Tùy chọn biểu đồ
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw} sinh viên`,
        },
      },
    },
  };

  return (
    <div className="thongke-container">
      <h2 className="thongke-title">Thống kê điểm rèn luyện</h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchThongKe} className="btn-retry">
            Thử lại
          </button>
        </div>
      ) : (
        <div className="chart-container">
          <h3>Phân bố điểm rèn luyện (Lớp DHTH20A, HK1-2025)</h3>
          <Pie data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default ThongKeDiemRenLuyen;
