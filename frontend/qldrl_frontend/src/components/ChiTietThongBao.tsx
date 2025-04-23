"use client";

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
          `http://localhost:5163/api/ThongBao/lay-chi-tiet-thong-bao/${id}`
        );
        if (response.status === 200) {
          setThongBao(response.data);

          // Đánh dấu đã đọc nếu người dùng đã đăng nhập
          const maSv = localStorage.getItem("maSv");
          if (maSv) {
            try {
              await axios.post(
                "http://localhost:5163/api/ThongBao/danh-dau-da-doc",
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

        // Tạo dữ liệu mẫu nếu không lấy được từ API
        setThongBao({
          maThongBao: Number(id),
          tieuDe:
            "Thông báo về việc tăng cường phòng, chống ma túy trong nhà trường",
          noiDung: `<p>Kính gửi các bạn sinh viên,</p>
          <p>Thư viện Trường Đại học Công Thương đang tổ chức hoạt động hỗ trợ nhập liệu tài liệu mới về kho. Đây là cơ hội tốt để các bạn sinh viên tích lũy điểm rèn luyện và có thêm kinh nghiệm làm việc.</p>
          <p><strong>Thông tin chi tiết:</strong></p>
          <ul>
              <li>Thời gian: Từ ngày 23/04/2025 đến ngày 23/04/2025</li>
              <li>Địa điểm: Thư viện Trường Đại học Công Thương</li>
              <li>Điểm cộng: 2 điểm rèn luyện</li>
              <li>Số lượng: 8 sinh viên</li>
          </ul>
          <p>Các bạn sinh viên quan tâm vui lòng đăng ký tham gia qua hệ thống đăng ký hoạt động trước ngày 22/04/2025.</p>
          <p>Trân trọng,</p>
          <p>Phòng Công tác Sinh viên</p>`,
          ngayTao: "2024-04-22T10:00:00",
          maQl: "QL001",
          loaiThongBao: "Thông báo chung",
          trangThai: "Đã đăng",
          tenNguoiTao: "Nguyễn Văn A",
          khoa: "Phòng Công tác Sinh viên",
          soLuotXem: 120,
        });
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
