import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/CapNhatSinhVien.css";

interface GiangVien {
  MaGV: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  DiaChi?: string;
  NgaySinh?: string;
  GioiTinh?: string;
  BoMon?: string;
  AnhDaiDien?: string | null;
}

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

const CapNhatThongTin: React.FC = () => {
  const [giangVienData, setGiangVienData] = useState<GiangVien | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    Province: "",
    District: "",
    Ward: "",
    AnhDaiDien: null as File | null,
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5163";
  const PROVINCE_API = "https://provinces.open-api.vn/api/";

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get<Province[]>(`${PROVINCE_API}p/`);
        setProvinces(response.data);
      } catch (err) {
        setError("Không thể tải danh sách tỉnh/thành phố");
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.Province) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `${PROVINCE_API}p/${formData.Province}?depth=2`
          );
          setDistricts(response.data.districts || []);
          setFormData({ ...formData, District: "", Ward: "" });
          setWards([]);
        } catch (err) {
          setError("Không thể tải danh sách quận/huyện");
        }
      };
      fetchDistricts();
    }
  }, [formData.Province]);

  useEffect(() => {
    if (formData.District) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(
            `${PROVINCE_API}d/${formData.District}?depth=2`
          );
          setWards(response.data.wards || []);
          setFormData({ ...formData, Ward: "" });
        } catch (err) {
          setError("Không thể tải danh sách xã/phường");
        }
      };
      fetchWards();
    }
  }, [formData.District]);

  useEffect(() => {
    const fetchGiangVienData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");

        if (!token || !username) {
          throw new Error("Không tìm thấy token hoặc username");
        }

        const response = await axios.get<GiangVien>(
          `${BASE_URL}/api/GiangVien/lay-giangvien-theo-vai-tro`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { username },
          }
        );

        setGiangVienData(response.data);
        setFormData({
          Email: response.data.Email || "",
          SoDienThoai: response.data.SoDienThoai || "",
          DiaChi: response.data.DiaChi || "",
          Province: "",
          District: "",
          Ward: "",
          AnhDaiDien: null,
        });

        if (response.data.AnhDaiDien) {
          const avatarPath = response.data.AnhDaiDien;
          setPreviewAvatar(
            avatarPath.startsWith("http") ? avatarPath : `${BASE_URL}${avatarPath}`
          );
        }
      } catch (err) {
        setError("Không thể tải thông tin giảng viên");
      } finally {
        setLoading(false);
      }
    };

    fetchGiangVienData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Vui lòng chọn file ảnh định dạng JPEG hoặc PNG!");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }
      setFormData({ ...formData, AnhDaiDien: file });
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token || !giangVienData) {
        throw new Error("Không tìm thấy token hoặc thông tin giảng viên");
      }

      const fullAddress = `${
        formData.DiaChi ? formData.DiaChi + ", " : ""
      }${
        formData.Ward ? wards.find((w) => w.code.toString() === formData.Ward)?.name + ", " : ""
      }${
        formData.District ? districts.find((d) => d.code.toString() === formData.District)?.name + ", " : ""
      }${
        formData.Province ? provinces.find((p) => p.code.toString() === formData.Province)?.name : ""
      }`;

      const formDataToSend = new FormData();
      formDataToSend.append("MaGV", giangVienData.MaGV);
      formDataToSend.append("HoTen", giangVienData.HoTen);
      formDataToSend.append("Email", formData.Email);
      formDataToSend.append("SoDienThoai", formData.SoDienThoai);
      formDataToSend.append("DiaChi", fullAddress);
      formDataToSend.append("NgaySinh", giangVienData.NgaySinh || "");
      formDataToSend.append("GioiTinh", giangVienData.GioiTinh || "");
      formDataToSend.append("BoMon", giangVienData.BoMon || "");
      formDataToSend.append("MaVaiTro", "1");
      formDataToSend.append("TrangThai", "Active");
      if (formData.AnhDaiDien) {
        formDataToSend.append("avatar", formData.AnhDaiDien);
      }

      const response = await axios.put(
        `${BASE_URL}/api/GiaoViens/cap-nhat-thong-tin`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Cập nhật thông tin thành công!");
        setEditMode(false);

        setGiangVienData({
          ...giangVienData,
          Email: formData.Email,
          SoDienThoai: formData.SoDienThoai,
          DiaChi: fullAddress,
          AnhDaiDien: formData.AnhDaiDien ? previewAvatar || giangVienData.AnhDaiDien : giangVienData.AnhDaiDien,
        });
      }
    } catch (err: any) {
      if (err.response) {
        setError(`Cập nhật thất bại: ${err.response.data.message || err.response.data}`);
      } else {
        setError("Cập nhật thông tin thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="cap-nhat-thong-tin-wrapper">
      <div className="login-header">
        <img
          className="logo"
          src="https://sinhvien.huit.edu.vn/Content/AConfig/images/sv_header_login.png"
          alt="Logo trường"
        />
      </div>
      <div className="thongtin-container">
        <h3>Thông tin giảng viên</h3>
        {/* ... phần UI giữ nguyên hoặc cập nhật nếu cần ... */}
      </div>
    </div>
  );
};

export default CapNhatThongTin;
