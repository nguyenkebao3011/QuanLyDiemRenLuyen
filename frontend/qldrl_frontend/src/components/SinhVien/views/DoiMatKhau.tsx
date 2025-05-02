import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/CapNhatSinhVien.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DoiMatKhau: React.FC = () => {
  const [formData, setFormData] = useState<ChangePasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5163";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleShowPassword = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Kiểm tra phía client
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
        return;
      }
      if (formData.newPassword.length < 6) {
        setError("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      // Sử dụng API chung cho cả sinh viên và giảng viên với PUT
      const endpoint = `${BASE_URL}/api/SinhVien/doi-mat-khau`;

      const response = await axios.put(
        endpoint,
        {
          MatKhauCu: formData.oldPassword,
          MatKhauMoi: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Đổi mật khẩu thành công!");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err: any) {
      if (err.response) {
        setError(
          `Đổi mật khẩu thất bại: ${
            err.response.data.message || err.response.data
          }`
        );
        if (err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } else {
        setError("Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h3>Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="info-section">
            <div className="info-row">
              <div className="info-item password-container">
                <label>Mật khẩu cũ:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.oldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập mật khẩu cũ"
                  />
                  <i
                    className={`fas ${
                      showPassword.oldPassword ? "fa-eye-slash" : "fa-eye"
                    } password-toggle-icon`}
                    onClick={() => toggleShowPassword("oldPassword")}
                  ></i>
                </div>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item password-container">
                <label>Mật khẩu mới:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập mật khẩu mới"
                  />
                  <i
                    className={`fas ${
                      showPassword.newPassword ? "fa-eye-slash" : "fa-eye"
                    } password-toggle-icon`}
                    onClick={() => toggleShowPassword("newPassword")}
                  ></i>
                </div>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item password-container">
                <label>Xác nhận mật khẩu mới:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Xác nhận mật khẩu mới"
                  />
                  <i
                    className={`fas ${
                      showPassword.confirmPassword ? "fa-eye-slash" : "fa-eye"
                    } password-toggle-icon`}
                    onClick={() => toggleShowPassword("confirmPassword")}
                  ></i>
                </div>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)} // Quay lại trang trước
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      {successMessage && (
        <div className="toast toast-success">{successMessage}</div>
      )}
      {error && <div className="toast toast-error">{error}</div>}
    </div>
  );
};

export default DoiMatKhau;
