import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./css/ThongBao.css"; // Import CSS file for styling

interface ThongBao {
  maThongBao: number;
  tieuDe: string;
  noiDung: string;
  ngayDang: string;
  trangThai: string;
  loaiThongBao?: string;
}

const ThongBaoComponent: React.FC = () => {
  const [thongBaos, setThongBaos] = useState<ThongBao[]>([]);
  const [loadingThongBao, setLoadingThongBao] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("thongbao");

  useEffect(() => {
    fetchThongBaos();
  }, []);

  const fetchThongBaos = async () => {
    try {
      setLoadingThongBao(true);
      const response = await axios.get(
        "http://localhost:5163/api/ThongBao/lay-thong-bao"
      );
      if (response.status === 200) {
        setThongBaos(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thông báo:", error);
      // Tạo dữ liệu mẫu nếu không lấy được từ API
      setThongBaos([
        {
          maThongBao: 1,
          tieuDe:
            "Thông báo về việc tăng cường phòng, chống ma túy trong nhà trường",
          noiDung:
            "Thông báo về việc tăng cường phòng, chống ma túy trong nhà trường",
          ngayDang: "2024-04-22T10:00:00",
          trangThai: "Đã đăng",
          loaiThongBao: "Thông báo chung",
        },
        {
          maThongBao: 2,
          tieuDe:
            "Thông báo về việc tổ chức thi cuối kỳ hệ Đại học chính quy học kỳ 2 năm học 2024-2025 (đợt 1)",
          noiDung:
            "Thông báo về việc tổ chức thi cuối kỳ hệ Đại học chính quy học kỳ 2 năm học 2024-2025 (đợt 1)",
          ngayDang: "2024-04-21T14:30:00",
          trangThai: "Đã đăng",
          loaiThongBao: "Đại học - Cao đẳng",
        },
        {
          maThongBao: 3,
          tieuDe:
            "Nhận tiền khen thưởng sinh viên tốt nghiệp kỹ sư loại giỏi hệ Đại học chính quy khóa 11 trong lễ tốt nghiệp và trao bằng tốt nghiệp đợt 1 năm 2025",
          noiDung:
            "Nhận tiền khen thưởng sinh viên tốt nghiệp kỹ sư loại giỏi hệ Đại học chính quy khóa 11 trong lễ tốt nghiệp và trao bằng tốt nghiệp đợt 1 năm 2025",
          ngayDang: "2024-04-18T09:15:00",
          trangThai: "Đã đăng",
          loaiThongBao: "Thông báo chung",
        },
        {
          maThongBao: 4,
          tieuDe:
            "Thông báo về việc nộp giấy KSK và tổ chức KSK ban đầu đối với sinh viên khóa 15ĐH, năm học 2024-2025",
          noiDung:
            "Thông báo về việc nộp giấy KSK và tổ chức KSK ban đầu đối với sinh viên khóa 15ĐH, năm học 2024-2025",
          ngayDang: "2024-04-17T11:00:00",
          trangThai: "Đã đăng",
          loaiThongBao: "Đại học - Cao đẳng",
        },
      ]);
    } finally {
      setLoadingThongBao(false);
    }
  };

  // Lọc thông báo theo loại
  const filteredThongBaos = thongBaos.filter((thongBao) => {
    if (activeTab === "thongbao")
      return (
        thongBao.loaiThongBao === "Thông báo chung" || !thongBao.loaiThongBao
      );
    if (activeTab === "daihoc")
      return thongBao.loaiThongBao === "Đại học - Cao đẳng";
    if (activeTab === "saudaihoc")
      return thongBao.loaiThongBao === "Sau đại học";
    if (activeTab === "nganhan") return thongBao.loaiThongBao === "Ngắn hạn";
    return true;
  });

  return (
    <div className="thong-bao-container">
      <div className="thong-bao-tabs">
        <button
          className={`tab-button ${activeTab === "thongbao" ? "active" : ""}`}
          onClick={() => setActiveTab("thongbao")}
        >
          THÔNG BÁO CHUNG
        </button>
        <button
          className={`tab-button ${activeTab === "daihoc" ? "active" : ""}`}
          onClick={() => setActiveTab("daihoc")}
        >
          ĐẠI HỌC - CAO ĐẲNG
        </button>
        <button
          className={`tab-button ${activeTab === "saudaihoc" ? "active" : ""}`}
          onClick={() => setActiveTab("saudaihoc")}
        >
          SAU ĐẠI HỌC
        </button>
        <button
          className={`tab-button ${activeTab === "nganhan" ? "active" : ""}`}
          onClick={() => setActiveTab("nganhan")}
        >
          NGẮN HẠN
        </button>
      </div>

      <div className="thong-bao-list">
        {loadingThongBao ? (
          <div className="loading-thong-bao">Đang tải dữ liệu...</div>
        ) : filteredThongBaos.length > 0 ? (
          filteredThongBaos.map((thongBao) => (
            <div key={thongBao.maThongBao} className="thong-bao-item">
              <div className="thong-bao-date">
                <div className="month">
                  Tháng {new Date(thongBao.ngayDang).getMonth() + 1}
                </div>
                <div className="day">
                  {new Date(thongBao.ngayDang).getDate()}
                </div>
              </div>
              <div className="thong-bao-content">
                <h3 className="thong-bao-title">{thongBao.tieuDe}</h3>
                <a
                  href={`/thong-bao/${thongBao.maThongBao}`}
                  className="view-detail"
                >
                  Xem chi tiết
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">Không có thông báo nào trong mục này</div>
        )}
      </div>
    </div>
  );
};

export default ThongBaoComponent;
