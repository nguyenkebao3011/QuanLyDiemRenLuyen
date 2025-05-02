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

  // Hàm tách địa chỉ thành các thành phần
  const parseAddress = (address: string) => {
    if (!address) return { street: "", ward: "", district: "", province: "" };

    const parts = address.split(",").map((part) => part.trim());
    const street = parts[0] || "";
    const ward = parts[1] || "";
    const district = parts[2] || "";
    const province = parts[3] || "";

    return { street, ward, district, province };
  };

  // Hàm lấy thông tin giảng viên
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

      // Tách địa chỉ từ lecturerData.DiaChi
      const { street, ward, district, province } = parseAddress(lecturer.DiaChi || "");

      // Tìm mã code tương ứng cho Province, District, Ward
      let provinceCode = "";
      let districtCode = "";
      let wardCode = "";

      const provinceMatch = provinces.find((p) => p.name === province);
      if (provinceMatch) {
        provinceCode = provinceMatch.code.toString();
        const districtResponse = await axios.get(
          `${PROVINCE_API}p/${provinceCode}?depth=2`
        );
        setDistricts(districtResponse.data.districts || []);

        const districtMatch = districtResponse.data.districts.find(
          (d: District) => d.name === district
        );
        if (districtMatch) {
          districtCode = districtMatch.code.toString();
          const wardResponse = await axios.get(
            `${PROVINCE_API}d/${districtCode}?depth=2`
          );
          setWards(wardResponse.data.wards || []);

          const wardMatch = wardResponse.data.wards.find(
            (w: Ward) => w.name === ward
          );
          if (wardMatch) {
            wardCode = wardMatch.code.toString();
          }
        }
      }

      setFormData({
        SoDienThoai: lecturer.SoDienThoai || "",
        DiaChi: street,
        Province: provinceCode,
        District: districtCode,
        Ward: wardCode,
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

  // Gọi fetchLecturerData sau khi provinces được tải
  useEffect(() => {
    if (provinces.length > 0) {
      fetchLecturerData();
    }
  }, [provinces, navigate]);

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

      // Xây dựng địa chỉ đầy đủ từ các thành phần được chọn
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

      // Chuẩn hóa chuỗi để đảm bảo UTF-8
      const cleanedAddress = encodeURIComponent(fullAddress)
        .replace(/%uD83C[\uDF00-\uDFFF]|%uD83D[\uDC00-\uDE4F]/g, "");

      // Kiểm tra điều kiện của các trường
      if (formData.SoDienThoai && formData.SoDienThoai.length !== 10) {
        setError("Số điện thoại phải có đúng 10 chữ số");
        setLoading(false);
        return;
      }

      if (!cleanedAddress) {
        setError("Địa chỉ không được để trống");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("SoDienThoai", formData.SoDienThoai);
      formDataToSend.append("DiaChi", decodeURIComponent(cleanedAddress));

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
        console.log("File ảnh được gửi:", avatarFile);
      }

      const response = await axios.put(
        `${BASE_URL}/api/GiaoViens/cap-nhat-thong-tin`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          },
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Cập nhật thông tin thành công!");
        setEditMode(false);
        setAvatarFile(null);
        console.log("Địa chỉ đầy đủ:", fullAddress);
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
              {editMode && avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Ảnh đại diện mới"
                  className="avatar-img"
                  onError={(e) =>
                    (e.currentTarget.src = "/path/to/default-avatar.jpg")
                  }
                />
              ) : lecturerData.AnhDaiDien ? (
                <img
                  src={`${BASE_URL}${lecturerData.AnhDaiDien}`}
                  alt="Ảnh đại diện"
                  className="avatar-img"
                  onError={(e) =>
                    (e.currentTarget.src = "/path/to/default-avatar.jpg")
                  }
                />
              ) : (
                <div className="default-avatar">
                  {lecturerData.HoTen ? lecturerData.HoTen.charAt(0) : "U"}
                </div>
              )}

              {editMode && (
                <div className="file-input">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="file-input-hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="chon-tep-btn">
                    Chọn tệp
                  </label>
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
                  <span>{lecturerData.Email || "Chưa có"}</span>
                </div>
                <div className="info-item">
                  <label>Số điện thoại:</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="SoDienThoai"
                      value={formData.SoDienThoai}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      title="Số điện thoại phải có đúng 10 chữ số"
                      maxLength={10}
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
                      <input
                        type="text"
                        name="DiaChi"
                        value={formData.DiaChi}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                        required
                      />
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