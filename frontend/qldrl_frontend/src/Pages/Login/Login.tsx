import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import { saveToken, getRole, isLoggedIn, logout } from "../../untils/auth"; // Import helper functions

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập
    if (isLoggedIn()) {
      const role = getRole();
      if (role) {
        redirectBasedOnRole(role);
      }
    }
  }, []);

  const redirectBasedOnRole = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        window.location.href = "/admin/dashboard";
        break;
      case "giangvien":
        window.location.href = "/giangvien/dashboard";
        break;
      case "sinhvien":
        window.location.href = "/sinhvien/dashboard";
        break;
      default:
        window.location.href = "/dashboard";
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5163/api/TaiKhoans/login",
        {
          MaDangNhap: username,
          MatKhau: password,
        }
      );

      // Lưu token và thông tin người dùng
      saveToken(response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);

      // Chuyển hướng dựa trên vai trò
      redirectBasedOnRole(response.data.role);
    } catch (error: any) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        setErrorMessage(error.response.data);
      } else {
        console.error("Unknown error:", error);
        setErrorMessage("Đã xảy ra lỗi khi đăng nhập.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>ĐĂNG NHẬP HỆ THỐNG</h2>
          <h3>QUẢN LÝ ĐIỂM RÈN LUYỆN SINH VIÊN</h3>
        </div>

        <div className="login-form">
          <div className="school-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z" />
            </svg>
          </div>

          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
id="username"
                className="form-control"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <button
                type="submit"
                className={`btn btn-primary btn-block ${
                  isLoading ? "btn-loading" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </div>
          </form>

          <div className="debug-info">
            Hệ thống Quản lý Điểm Rèn Luyện Sinh Viên
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;