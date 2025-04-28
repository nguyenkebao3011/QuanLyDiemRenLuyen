"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Clock,
  BookOpen,
  Share2,
} from "lucide-react";
import "./css/ChiTietThongBao.css";

interface ThongBaoChiTiet {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  MaQl: string;
  TrangThai: string;
  TenNguoiTao: string;
  Khoa: string;
  SoLuotXem: number;
}

interface ThongBaoNgan {
  MaThongBao: number;
  TieuDe: string;
  NgayTao: string;
}

const ChiTietThongBao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [thongBao, setThongBao] = useState<ThongBaoChiTiet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestThongBaos, setLatestThongBaos] = useState<ThongBaoNgan[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

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
        setError("Không thể tải thông tin thông báo. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestThongBaos = async () => {
      try {
        setLoadingLatest(true);
        // Gọi API để lấy thông báo mới nhất
        const response = await axios.get(
          "http://localhost:5163/api/ThongBao/lay_thong_bao"
        );
        if (response.status === 200) {
          // Lấy 3 thông báo mới nhất
          const latestThree = response.data
            .sort(
              (a: ThongBaoNgan, b: ThongBaoNgan) =>
                new Date(b.NgayTao).getTime() - new Date(a.NgayTao).getTime()
            )
            .slice(0, 3);
          setLatestThongBaos(latestThree);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông báo mới nhất:", error);
        setLatestThongBaos([]); // Đặt mảng rỗng khi có lỗi
      } finally {
        setLoadingLatest(false);
      }
    };

    if (id) {
      fetchThongBaoChiTiet();
      fetchLatestThongBaos();
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: thongBao?.TieuDe,
        text: "Xem thông báo này từ cổng thông tin sinh viên",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép đường dẫn vào clipboard!");
    }
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
        <div className="error-icon">⚠️</div>
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={goBack} className="back-button">
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="chi-tiet-thong-bao-container">
      <div className="chi-tiet-thong-bao-wrapper">
        <div className="chi-tiet-thong-bao-header">
          <button onClick={goBack} className="back-button">
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="chi-tiet-thong-bao-card">
          <h1 className="chi-tiet-thong-bao-title">{thongBao?.TieuDe}</h1>

          <div className="thong-bao-meta">
            <div className="thong-bao-meta-item">
              <Calendar size={16} />
              <span>{thongBao ? formatDate(thongBao.NgayTao) : ""}</span>
            </div>
            <div className="thong-bao-meta-item">
              <User size={16} />
              <span>
                {thongBao?.TenNguoiTao} - {thongBao?.Khoa}
              </span>
            </div>
            <div className="thong-bao-meta-item">
              <Eye size={16} />
              <span>{thongBao?.SoLuotXem} lượt xem</span>
            </div>
          </div>

          <div className="chi-tiet-thong-bao-actions">
            <button
              className="action-button share-button"
              onClick={handleShare}
            >
              <Share2 size={16} />
              <span>Chia sẻ</span>
            </button>
          </div>

          <div className="chi-tiet-thong-bao-divider"></div>

          <div
            className="chi-tiet-thong-bao-body"
            dangerouslySetInnerHTML={{ __html: thongBao?.NoiDung || "" }}
          />
        </div>

        <div className="related-thong-bao">
          <h3 className="related-title">Thông báo mới nhất</h3>
          {loadingLatest ? (
            <div className="loading-latest">Đang tải thông báo mới nhất...</div>
          ) : latestThongBaos.length > 0 ? (
            <ul className="related-list">
              {latestThongBaos.map((item) => (
                <li key={item.MaThongBao} className="related-item">
                  <a
                    href={`/thong-bao/${item.MaThongBao}`}
                    className="related-link"
                  >
                    <Clock size={14} />
                    <span>{item.TieuDe}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-latest-thongbao">Không có thông báo mới</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChiTietThongBao;
