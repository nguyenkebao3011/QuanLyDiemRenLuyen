import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import "./Login.css";
import { saveToken, getRole, isLoggedIn, logout } from "../../untils/auth";

// Định nghĩa các kiểu TypeScript
interface ApiResponse {
  message: string;
}

interface ForgotPasswordRequest {
  TenDangNhap: string;
}

interface ResetPasswordRequest {
  Otp: string;
  NewPassword: string;
}

const Login: React.FC = () => {
  // State cho đăng nhập
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State cho quên mật khẩu
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<number>(1); // 1: Nhập mã số sinh viên, 2: Nhập OTP, 3: Đặt lại mật khẩu
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

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
      localStorage.setItem("maTaiKhoan", response.data.maTaiKhoan);

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

  // Xử lý quên mật khẩu: Gửi yêu cầu OTP
  const handleForgotPassword = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!tenDangNhap.trim()) {
      setForgotMessage("Vui lòng nhập mã số sinh viên!");
      return;
    }

    setIsForgotLoading(true);
    setForgotMessage("");

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:5163/api/TaiKhoans/forgot-password",
        { TenDangNhap: tenDangNhap } as ForgotPasswordRequest
      );

      setForgotMessage(response.data.message);
      setForgotStep(2); // Chuyển sang bước nhập OTP
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setForgotMessage(
        axiosError.response?.data.message ||
          "Không thể kết nối đến server, vui lòng thử lại sau."
      );
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Chuyển sang bước đặt lại mật khẩu
  const handleNextToReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!otp.trim()) {
      setForgotMessage("Vui lòng nhập OTP!");
      return;
    }
    setForgotMessage("");
    setForgotStep(3); // Chuyển sang bước đặt lại mật khẩu
  };

  // Xử lý đặt lại mật khẩu
  const handleResetPassword = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!otp.trim()) {
      setForgotMessage("Vui lòng nhập OTP!");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setForgotMessage("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsForgotLoading(true);
    setForgotMessage("");

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:5163/api/TaiKhoans/reset-password",
        { Otp: otp, NewPassword: newPassword } as ResetPasswordRequest
      );

      setForgotMessage(response.data.message);
      setForgotStep(1); // Quay lại bước đầu tiên
      setTenDangNhap("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setIsForgotPasswordOpen(false); // Đóng modal
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setForgotMessage(
        axiosError.response?.data.message ||
          "Không thể kết nối đến server, vui lòng thử lại sau."
      );
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Đóng modal quên mật khẩu
  const closeForgotPasswordModal = () => {
    setIsForgotPasswordOpen(false);
    setForgotStep(1);
    setTenDangNhap("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotMessage("");
  };

  return (
    <div className="logins-container">
      <img
        className="logo"
        src="./hinhanh/logo-huit-web-chinh-moi-mau-xanh-02.svg"
        alt=""
      />
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
            <a
              className="lost_password"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPasswordOpen(true);
              }}
            >
              Quên mật khẩu
            </a>

            <div className="debug-info">
              Hệ thống Quản lý Điểm Rèn Luyện Sinh Viên
            </div>
          </div>
        </div>
      </div>

      {/* Modal Quên Mật Khẩu */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeForgotPasswordModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Quên Mật Khẩu
            </h2>

            {forgotStep === 1 && (
              <div>
                <div className="form-group mb-4">
                  <label htmlFor="tenDangNhap">Mã số sinh viên</label>
                  <input
                    type="text"
                    id="tenDangNhap"
                    className="form-control"
                    placeholder="Nhập mã số sinh viên"
                    value={tenDangNhap}
                    onChange={(e) => setTenDangNhap(e.target.value)}
                    disabled={isForgotLoading}
                  />
                </div>
                {forgotMessage && (
                  <div
                    className={`mb-4 text-center ${
                      forgotMessage.includes("OTP đã được gửi")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {forgotMessage}
                  </div>
                )}
                <button
                  className={`btn btn-primary btn-block ${
                    isForgotLoading ? "btn-loading" : ""
                  }`}
                  onClick={handleForgotPassword}
                  disabled={isForgotLoading}
                >
                  {isForgotLoading ? "Đang xử lý..." : "Gửi OTP"}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div>
                <div className="form-group mb-4">
                  <label htmlFor="otp">OTP</label>
                  <input
                    type="text"
                    id="otp"
                    className="form-control"
                    placeholder="Nhập OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isForgotLoading}
                  />
                </div>
                {forgotMessage && (
                  <div
                    className={`mb-4 text-center ${
                      forgotMessage.includes("OTP đã được gửi")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {forgotMessage}
                  </div>
                )}
                <button
                  className={`btn btn-primary btn-block ${
                    isForgotLoading ? "btn-loading" : ""
                  }`}
                  onClick={handleNextToReset}
                  disabled={isForgotLoading}
                >
                  Tiếp tục
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div>
                <div className="form-group mb-4">
                  <label htmlFor="newPassword">Mật khẩu mới</label>
                  <input
                    type="password"
                    id="newPassword"
                    className="form-control"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isForgotLoading}
                  />
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isForgotLoading}
                  />
                </div>
                {forgotMessage && (
                  <div
                    className={`mb-4 text-center ${
                      forgotMessage.includes("thành công")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {forgotMessage}
                  </div>
                )}
                <button
                  className={`btn btn-primary btn-block ${
                    isForgotLoading ? "btn-loading" : ""
                  }`}
                  onClick={handleResetPassword}
                  disabled={isForgotLoading}
                >
                  {isForgotLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
