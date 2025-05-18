import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/CapNhatSinhVien.css";

interface Student {
  MaSV: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  DiaChi?: string;
  NgaySinh?: string;
  GioiTinh?: string;
  MaLop?: string;
  TenLop?: string;
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
  const [studentData, setStudentData] = useState<Student | null>(null);
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

  // Xử lý thông báo thành công và lỗi
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

  // Lấy danh sách tỉnh/thành phố
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

  // Lấy danh sách quận/huyện khi chọn tỉnh/thành phố
  useEffect(() => {
    if (formData.Province) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `${PROVINCE_API}p/${formData.Province}?depth=2`
          );
          setDistricts(response.data.districts || []);
          setFormData({ ...formData, District: "", Ward: "" }); // Reset quận/huyện và xã/phường
          setWards([]);
        } catch (err) {
          setError("Không thể tải danh sách quận/huyện");
        }
      };
      fetchDistricts();
    }
  }, [formData.Province]);

  // Lấy danh sách xã/phường khi chọn quận/huyện
  useEffect(() => {
    if (formData.District) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(
            `${PROVINCE_API}d/${formData.District}?depth=2`
          );
          setWards(response.data.wards || []);
          setFormData({ ...formData, Ward: "" }); // Reset xã/phường
        } catch (err) {
          setError("Không thể tải danh sách xã/phường");
        }
      };
      fetchWards();
    }
  }, [formData.District]);

  // Lấy thông tin sinh viên
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");

        if (!token || !username) {
          throw new Error("Không tìm thấy token hoặc username");
        }

        const response = await axios.get<Student>(
          `${BASE_URL}/api/SinhVien/lay-sinhvien-theo-vai-tro`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { username },
          }
        );

        setStudentData(response.data);
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
        setError("Không thể tải thông tin sinh viên");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Vui lòng chọn file ảnh định dạng JPEG hoặc PNG!");
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
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
      if (!token || !studentData) {
        throw new Error("Không tìm thấy token hoặc thông tin sinh viên");
      }

      // Tạo địa chỉ đầy đủ với địa chỉ chi tiết đứng trước
      const fullAddress = `${
        formData.DiaChi ? formData.DiaChi + ", " : ""
      }${
        formData.Ward ? wards.find((w) => w.code.toString() === formData.Ward)?.name + ", " : ""
      }${
        formData.District
          ? districts.find((d) => d.code.toString() === formData.District)?.name + ", "
          : ""
      }${
        formData.Province
          ? provinces.find((p) => p.code.toString() === formData.Province)?.name
          : ""
      }`;

      const formDataToSend = new FormData();
      formDataToSend.append("MaSV", studentData.MaSV);
      formDataToSend.append("HoTen", studentData.HoTen);
      formDataToSend.append("Email", formData.Email);
      formDataToSend.append("SoDienThoai", formData.SoDienThoai);
      formDataToSend.append("DiaChi", fullAddress);
      formDataToSend.append("NgaySinh", studentData.NgaySinh || "");
      formDataToSend.append("GioiTinh", studentData.GioiTinh || "");
      formDataToSend.append("MaLop", studentData.MaLop || "");
      formDataToSend.append("TenLop", studentData.TenLop || "");
      formDataToSend.append("MaVaiTro", "0");
      formDataToSend.append("TrangThai", "Active");
      if (formData.AnhDaiDien) {
        formDataToSend.append("avatar", formData.AnhDaiDien);
      }

      const response = await axios.put(
        `${BASE_URL}/api/SinhVien/cap-nhat-thong-tin`,
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

        setStudentData({
          ...studentData,
          Email: formData.Email,
          SoDienThoai: formData.SoDienThoai,
          DiaChi: fullAddress,
          AnhDaiDien: formData.AnhDaiDien
            ? previewAvatar || studentData.AnhDaiDien
            : studentData.AnhDaiDien,
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
        <h3>Thông tin sinh viên</h3>
        {studentData && (
          <div className="thongtin-content">
          <div className="avatar-container">
            {previewAvatar || studentData?.AnhDaiDien ? (
              <img
                src={previewAvatar || studentData!.AnhDaiDien!}
                alt="Ảnh đại diện"
                className="student-avatar"
              />
            ) : (
              <div className="default-avatar2">
                {(studentData?.HoTen?.charAt(0) || "T").toUpperCase()}
              </div>
            )}
        
            {editMode && (
              <label htmlFor="avatar-upload" className="chon-tep-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                  id="avatar-upload"
                />
                Chọn tệp
              </label>
            )}
        
             
          
          </div>

            <div className="info-section">
              <div className="info-row">
                <div className="info-item">
                  <label>Mã sinh viên:</label>
                  <span>{studentData.MaSV}</span>
                </div>
                <div className="info-item">
                  <label>Họ tên:</label>
                  <span>{studentData.HoTen}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <label>Email:</label>
                  {editMode ? (
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <span>{studentData.Email}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Số điện thoại:</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="SoDienThoai"
                      value={formData.SoDienThoai}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <span>{studentData.SoDienThoai}</span>
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <label>Giới tính:</label>
                  <span>{studentData.GioiTinh || "Nữ"}</span>
                </div>
                <div className="info-item">
                  <label>Ngày sinh:</label>
                  <span>{studentData.NgaySinh || "Chưa có"}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <label>Địa chỉ:</label>
                  {editMode ? (
                    <div className="address-inputs">
                      <select
                        name="Province"
                        value={formData.Province}
                        onChange={handleInputChange}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <select
                        name="District"
                        value={formData.District}
                        onChange={handleInputChange}
                        disabled={!formData.Province}
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      <select
                        name="Ward"
                        value={formData.Ward}
                        onChange={handleInputChange}
                        disabled={!formData.District}
                      >
                        <option value="">Chọn xã/phường</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="DiaChi"
                        value={formData.DiaChi}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>
                  ) : (
                    <span>{studentData.DiaChi || "Chưa có"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Lớp:</label>
                  <span>{studentData.TenLop || studentData.MaLop || "Chưa có"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {editMode ? (
          <div className="form-actions">
            <button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setFormData({
                  Email: studentData!.Email,
                  SoDienThoai: studentData!.SoDienThoai,
                  DiaChi: studentData!.DiaChi || "",
                  Province: "",
                  District: "",
                  Ward: "",
                  AnhDaiDien: null,
                });
                setPreviewAvatar(studentData!.AnhDaiDien || null);
              }}
            >
              Hủy
            </button>
          </div>
        ) : (
          <div className="edit-button-container">
            <button type="button" onClick={() => setEditMode(true)} className="edit-button">
              Chỉnh sửa
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)} // Quay lại trang trước
              className="cancel-btn"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      {successMessage && <div className="toast toast-success">{successMessage}</div>}
      {error && <div className="toast toast-error">{error}</div>}
    </div>
  );
};

export default CapNhatThongTin;