import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Lecturer {
  MaGV: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  DiaChi: string;
  NgaySinh: string;
  GioiTinh: string;
  AnhDaiDien: string | null;
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

const CapNhatThongTinGiangVien: React.FC = () => {
  const [lecturerData, setLecturerData] = useState<Lecturer | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    Province: "",
    District: "",
    Ward: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5163";
  const PROVINCE_API = "https://provinces.open-api.vn/api/";

  // Xử lý thông báo
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

  // Lấy danh sách quận/huyện
  useEffect(() => {
    if (formData.Province) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `${PROVINCE_API}p/${formData.Province}?depth=2`
          );
          setDistricts(response.data.districts || []);
          setFormData((prev) => ({ ...prev, District: "", Ward: "" }));
          setWards([]);
        } catch (err) {
          setError("Không thể tải danh sách quận/huyện");
        }
      };
      fetchDistricts();
    }
  }, [formData.Province]);

  // Lấy danh sách xã/phường
  useEffect(() => {
    if (formData.District) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(
            `${PROVINCE_API}d/${formData.District}?depth=2`
          );
          setWards(response.data.wards || []);
          setFormData((prev) => ({ ...prev, Ward: "" }));
        } catch (err) {
          setError("Không thể tải danh sách xã/phường");
        }
      };
      fetchWards();
    }
  }, [formData.District]);

  // Hàm lấy thông tin giảng viên (dùng lại ở nhiều nơi)
  const fetchLecturerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      const response = await axios.get<{ data: Lecturer }>(
        `${BASE_URL}/api/GiaoViens/lay-giangvien-theo-vai-tro`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const lecturer = response.data.data;
      console.log("Dữ liệu giảng viên từ API:", lecturer);

      if (!lecturer || !lecturer.MaGV) {
        throw new Error("Dữ liệu giảng viên không hợp lệ hoặc trống");
      }

      setLecturerData(lecturer);
      setFormData({
        Email: lecturer.Email || "",
        SoDienThoai: lecturer.SoDienThoai || "",
        DiaChi: lecturer.DiaChi || "",
        Province: "",
        District: "",
        Ward: "",
      });
    } catch (err: any) {
      console.error("Lỗi khi lấy thông tin giảng viên:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải thông tin giảng viên. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin giảng viên khi component mount
  useEffect(() => {
    fetchLecturerData();
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerData) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      const fullAddress = `${
        formData.DiaChi ? formData.DiaChi + ", " : ""
      }${
        formData.Ward
          ? wards.find((w) => w.code.toString() === formData.Ward)?.name + ", "
          : ""
      }${
        formData.District
          ? districts.find((d) => d.code.toString() === formData.District)
              ?.name + ", "
          : ""
      }${
        formData.Province
          ? provinces.find((p) => p.code.toString() === formData.Province)?.name
          : ""
      }`.trim();

      const formDataToSend = new FormData();
      formDataToSend.append("MaGV", lecturerData.MaGV);
      formDataToSend.append("HoTen", lecturerData.HoTen);
      formDataToSend.append("Email", formData.Email);
      formDataToSend.append("SoDienThoai", formData.SoDienThoai);
      formDataToSend.append("DiaChi", fullAddress);
      formDataToSend.append("NgaySinh", lecturerData.NgaySinh || "");
      formDataToSend.append("GioiTinh", lecturerData.GioiTinh || "");
      if (avatarFile) {
        formDataToSend.append("AnhDaiDien", avatarFile);
        console.log("File ảnh được gửi:", avatarFile); // Log để kiểm tra
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
        setAvatarFile(null);

        // Gọi lại API để lấy dữ liệu mới (bao gồm đường dẫn ảnh mới)
        await fetchLecturerData();
      }
    } catch (err: any) {
      console.error("Lỗi khi cập nhật thông tin:", err);
      setError(
        err.response?.data?.message ||
          "Cập nhật thông tin thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error && !lecturerData) {
    return (
      <div className="error">
        {error}
        <button onClick={() => navigate("/login")}>Đăng nhập lại</button>
      </div>
    );
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
        {lecturerData ? (
          <div className="thongtin-content">
            <div className="avatar-container">
              {lecturerData.AnhDaiDien ? (
                <img
                  src={`${BASE_URL}${lecturerData.AnhDaiDien}`}
                  alt="Ảnh đại diện"
                  style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                  onError={(e) =>
                    (e.currentTarget.src = "/path/to/default-avatar.jpg")
                  }
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "#ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Không có ảnh
                </div>
              )}
              {editMode && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ marginTop: "10px" }}
                  />
                  {avatarFile && (
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="Ảnh mới"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        marginTop: "10px",
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="info-section">
              <div className="info-row">
                <div className="info-item">
                  <label>Mã giảng viên:</label>
                  <span>{lecturerData.MaGV || "Chưa có"}</span>
                </div>
                <div className="info-item">
                  <label>Họ tên:</label>
                  <span>{lecturerData.HoTen || "Chưa có"}</span>
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
                    <span>{lecturerData.Email || "Chưa có"}</span>
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
                    <span>{lecturerData.SoDienThoai || "Chưa có"}</span>
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <label>Giới tính:</label>
                  <span>{lecturerData.GioiTinh || "Chưa có"}</span>
                </div>
                <div className="info-item">
                  <label>Ngày sinh:</label>
                  <span>{lecturerData.NgaySinh || "Chưa có"}</span>
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
                    <span>{lecturerData.DiaChi || "Chưa có"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>Không có thông tin giảng viên để hiển thị.</div>
        )}

        {editMode && lecturerData ? (
          <div className="form-actions">
            <button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setAvatarFile(null);
                setFormData({
                  Email: lecturerData.Email || "",
                  SoDienThoai: lecturerData.SoDienThoai || "",
                  DiaChi: lecturerData.DiaChi || "",
                  Province: "",
                  District: "",
                  Ward: "",
                });
              }}
            >
              Hủy
            </button>
          </div>
        ) : (
          lecturerData && (
            <div className="edit-button-container">
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="edit-button"
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cancel-btn"
              >
                Hủy
              </button>
            </div>
          )
        )}
      </div>

      {successMessage && <div className="toast toast-success">{successMessage}</div>}
      {error && <div className="toast toast-error">{error}</div>}
    </div>
  );
};

export default CapNhatThongTinGiangVien;