import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./css/ThongBao.css";

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
