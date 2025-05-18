import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";

interface PasswordChangeForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChange: React.FC = () => {
  const [formData, setFormData] = useState<PasswordChangeForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:5163";

  // Handle notification and error timeout
  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => setNotificationMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setNotificationMessage(null);

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp");
      setIsSubmitting(false);
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
      setIsSubmitting(false);
      return;
    }

    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const endpoint = `${API_BASE_URL}/api/SinhVien/doi-mat-khau`;

      const response = await axios.put(
        endpoint,
        {
          MatKhauCu: formData.oldPassword,
          MatKhauMoi: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setNotificationMessage("Đổi mật khẩu thành công!");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err: any) {
      if (err.response) {
        const message = err.response.data.message || err.response.data || "Lỗi không xác định";
        setErrorMessage(`Đổi mật khẩu thất bại: ${message}`);

        if (err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } else {
        setErrorMessage("Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
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
      
      <main className="auth-content-container">
        <div className="secure-card">
          <div className="secure-card-header">
            <h2 className="secure-card-title">Đổi mật khẩu</h2>
          </div>
          
          <form onSubmit={handleFormSubmit} className="secure-form">
            <div className="secure-form-body">
              <div className="form-field-group">
                <label className="field-label">Mật khẩu cũ:</label>
                <div className="secure-input-wrapper">
                  <input
                    type={passwordVisibility.oldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập mật khẩu cũ"
                    className="secure-input"
                  />
                  <button 
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => togglePasswordVisibility("oldPassword")}
                  >
                    <i className={`fas ${passwordVisibility.oldPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="form-field-group">
                <label className="field-label">Mật khẩu mới:</label>
                <div className="secure-input-wrapper">
                  <input
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập mật khẩu mới"
                    className="secure-input"
                  />
                  <button 
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    <i className={`fas ${passwordVisibility.newPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="form-field-group">
                <label className="field-label">Xác nhận mật khẩu mới:</label>
                <div className="secure-input-wrapper">
                  <input
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Xác nhận mật khẩu mới"
                    className="secure-input"
                  />
                  <button 
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    <i className={`fas ${passwordVisibility.confirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="secure-form-actions">
              <button 
                type="button" 
                className="secondary-btn"
                onClick={() => navigate(-1)}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {notificationMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle alert-icon"></i>
          <span>{notificationMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle alert-icon"></i>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default PasswordChange;