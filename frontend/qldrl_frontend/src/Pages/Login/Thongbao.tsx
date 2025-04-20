import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ThongBao.css";

interface ThongBao {
  id: number;
  tieuDe: string;
  ngay: string; // hoặc Date tùy dữ liệu trả về
  noiDung: string;
}

const ThongBaoComponent: React.FC = () => {
  const [thongBaos, setThongBaos] = useState<ThongBao[]>([]);

  useEffect(() => {
    const fetchThongBao = async () => {
      try {
        const response = await axios.get("http://localhost:5163/api/ThongBao");
        setThongBaos(response.data);
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    fetchThongBao();
  }, []);

  return (
    <div className="thongbao-container">
      <h2>THÔNG BÁO CHUNG</h2>
      <ul className="thongbao-list">
        {thongBaos.map((item) => (
          <li key={item.id} className="thongbao-item">
            <div className="thongbao-date">
              {new Date(item.ngay).toLocaleDateString()}
            </div>
            <div className="thongbao-title">{item.tieuDe}</div>
            <div className="thongbao-noidung">{item.noiDung}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThongBaoComponent;