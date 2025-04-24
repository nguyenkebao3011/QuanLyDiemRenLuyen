import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import "./css/ChiTietThongBao.css";

interface ThongBaoChiTiet {
  maThongBao: number;
  tieuDe: string;
  noiDung: string;
  ngayTao: string;
  maQl: string;
  loaiThongBao: string;
  trangThai: string;
  tenNguoiTao: string;
  khoa: string;
  soLuotXem: number;
}

const ChiTietThongBao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [thongBao, setThongBao] = useState<ThongBaoChiTiet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThongBaoChiTiet = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5163/api/ThongBao/lay_chi_tiet_thong_bao/${id}`
        );
        if (response.status === 200) {
          setThongBao(response.data);

          // Đánh dấu đã đọc nếu người dùng đã đăng nhập
          const maSv = localStorage.getItem("maSv");
          if (maSv) {
            try {
              await axios.post(
                "http://localhost:5163/api/ThongBao/danh_dau_da_doc",
                {
                  MaThongBao: Number(id),
                  MaSV: maSv,
                }
              );
            } catch (error) {
              console.error("Lỗi khi đánh dấu đã đọc:", error);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết thông báo:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchThongBaoChiTiet();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="chi-tiet-thong-bao-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chi-tiet-thong-bao-error">
        <p>{error}</p>
        <button onClick={goBack} className="back-button">
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="chi-tiet-thong-bao-container">
      <div className="chi-tiet-thong-bao-header">
        <button onClick={goBack} className="back-button">
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="thong-bao-meta">
          <span className="thong-bao-date">
            <Calendar size={16} />{" "}
            {thongBao ? formatDate(thongBao.ngayTao) : ""}
          </span>
          <span className="thong-bao-author">
            <User size={16} /> {thongBao?.tenNguoiTao} - {thongBao?.khoa}
          </span>
          <span className="thong-bao-views">
            Lượt xem: {thongBao?.soLuotXem}
          </span>
        </div>
      </div>

      <div className="chi-tiet-thong-bao-content">
        <h1 className="chi-tiet-thong-bao-title">{thongBao?.tieuDe}</h1>

        <div
          className="chi-tiet-thong-bao-body"
          dangerouslySetInnerHTML={{ __html: thongBao?.noiDung || "" }}
        />
      </div>
    </div>
  );
};

export default ChiTietThongBao;
