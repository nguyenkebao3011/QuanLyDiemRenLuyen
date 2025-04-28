import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom";
import "./css/Login.css";
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

const ResetPassword: React.FC = () => {
  const [step, setStep] = useState<number>(1); // 1: Nhập tên đăng nhập, 2: Nhập OTP, 3: Đặt lại mật khẩu
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Gửi yêu cầu OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenDangNhap.trim()) {
      setMessage("Vui lòng nhập mã số sinh viên!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:5163/api/TaiKhoans/forgot-password",
        { TenDangNhap: tenDangNhap } as ForgotPasswordRequest
      );

      setMessage(response.data.message);
      setStep(2); // Chuyển sang bước nhập OTP
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setMessage(
        axiosError.response?.data.message ||
          "Không thể kết nối đến server, vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Chuyển sang bước đặt lại mật khẩu
  const handleNextToReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMessage("Vui lòng nhập OTP!");
      return;
    }
    setMessage("");
    setStep(3); // Chuyển sang bước đặt lại mật khẩu
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMessage("Vui lòng nhập OTP!");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setMessage("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:5163/api/TaiKhoans/reset-password",
        { Otp: otp, NewPassword: newPassword } as ResetPasswordRequest
      );

      setMessage(response.data.message);
      setStep(1); // Quay lại bước đầu tiên
      setTenDangNhap("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setMessage(
        axiosError.response?.data.message ||
          "Không thể kết nối đến server, vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      ></link>
      <div className="reset-password-box">
        <h2 className="text-xl font-bold mb-4 text-center">Đặt Lại Mật Khẩu</h2>

        {step === 1 && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group mb-4">
              <label htmlFor="tenDangNhap">Mã số sinh viên</label>
              <input
                type="text"
                id="tenDangNhap"
                className="form-control"
                placeholder="Nhập mã số sinh viên"
                value={tenDangNhap}
                onChange={(e) => setTenDangNhap(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {message && (
              <div
                className={`mb-4 text-center ${
                  message.includes("OTP đã được gửi")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </div>
            )}
            <button
              type="submit"
              className={`btn btn-primary btn-block ${
                isLoading ? "btn-loading" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Gửi OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNextToReset}>
            <div className="form-group mb-4">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                className="form-control"
                placeholder="Nhập OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {message && (
              <div
                className={`mb-4 text-center ${
                  message.includes("OTP đã được gửi")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </div>
            )}
            <button
              type="submit"
              className={`btn btn-primary btn-block ${
                isLoading ? "btn-loading" : ""
              }`}
              disabled={isLoading}
            >
              Tiếp tục
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group mb-4">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                className="form-control"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            {message && (
              <div
                className={`mb-4 text-center ${
                  message.includes("thành công")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </div>
            )}
            <button
              type="submit"
              className={`btn btn-primary btn-block ${
                isLoading ? "btn-loading" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}

        <Link to="/login" className="block text-center mt-4 text-blue-600">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
