import type React from "react";
import { useState, useEffect } from "react";
import axios, { type AxiosError } from "axios";
import "./css/Login.css";
import { saveToken, getRole, isLoggedIn } from "../../untils/auth";
import Chatbot from "../Login/Chatbot"; // Import component Chatbot
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

interface ThongBao {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  TrangThai: string;
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

  // State cho danh sách thông báo
  const [thongBaos, setThongBaos] = useState<ThongBao[]>([]);
  const [loadingThongBao, setLoadingThongBao] = useState(true);
  const [activeTab, setActiveTab] = useState<"thongbao">("thongbao");

  // Auto-hide alert sau 3s
  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập
    if (isLoggedIn()) {
      const role = getRole();
      if (role) {
        redirectBasedOnRole(role);
      }
    }

    // Lấy danh sách thông báo
    fetchThongBaos();
  }, []);

  const fetchThongBaos = async () => {
    setLoadingThongBao(true);
    try {
      const response = await axios.get(
        "http://localhost:5163/api/ThongBao/lay_thong_bao_hoat_dong"
      );
      if (response.status === 200) {
        setThongBaos(response.data);
      }
      console.log("Danh sách thông báo:", response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thông báo:", error);
    } finally {
      setLoadingThongBao(false);
    }
  };

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
        const data = error.response.data;
        if (typeof data === "object" && data !== null && "message" in data) {
          setErrorMessage(data.message);
        } else if (typeof data === "string") {
          setErrorMessage(data);
        } else {
          setErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
        }
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
        "http://localhost:5163/api/TaiKhoans/quen-mat-khau",
        {
          TenDangNhap: tenDangNhap,
        } as ForgotPasswordRequest
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
        "http://localhost:5163/api/TaiKhoans/doi-mat-khau",
        {
          Otp: otp,
          NewPassword: newPassword,
        } as ResetPasswordRequest
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

  // Hàm định dạng ngày tháng
  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();

      // Trả về object chứa các thành phần ngày tháng
      return {
        month: month,
        day: day,
        year: year,
        formattedMonth: `Tháng\n${month}/${year}`,
      };
    } catch (error) {
      return {
        month: "",
        day: "",
        year: "",
        formattedMonth: "",
      };
    }
  }

  // Hàm kiểm tra thông báo có phải là thông báo mới không (trong tuần hiện tại)
  function isNewNotification(dateString: string) {
    try {
      const today = new Date();
      const notificationDate = new Date(dateString);
      // Xác định ngày đầu tiên của tuần hiện tại (Chủ nhật = 0, Thứ 2 = 1, ...)
      const firstDayOfWeek = new Date(today);
      const currentDay = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
      firstDayOfWeek.setDate(today.getDate() - currentDay);
      // Xác định ngày cuối cùng của tuần (Thứ 7)
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      // Đặt giờ, phút, giây về 0 cho firstDayOfWeek để so sánh đúng ngày
      firstDayOfWeek.setHours(0, 0, 0, 0);
      // Đặt giờ, phút, giây về cuối ngày cho lastDayOfWeek
      lastDayOfWeek.setHours(23, 59, 59, 999);
      // Kiểm tra nếu thông báo nằm trong khoảng thời gian của tuần hiện tại
      return (
        notificationDate >= firstDayOfWeek && notificationDate <= lastDayOfWeek
      );
    } catch (error) {
      return false;
    }
  }

  return (
    <div className="login-page-container">
      {/* Alert nổi góc phải */}
      {errorMessage && (
        <div className="alert alert-danger login-alert-fixed">
          {errorMessage}
        </div>
      )}
      <div className="login-header">
        <img
          className="logo"
          src="https://sinhvien.huit.edu.vn/Content/AConfig/images/sv_header_login.png"
          alt="Logo trường"
        />
        <h1>QUẢN LÝ ĐIỂM RÈN LUYỆN KHOA CÔNG NGHỆ THÔNG TIN</h1>
      </div>

      <div className="login-content">
        <div className="thong-bao-container">
          <div className="activities-tabs">
            <button
              className={`tab-button ${
                activeTab === "thongbao" ? "active" : ""
              }`}
              onClick={() => setActiveTab("thongbao")}
            >
              THÔNG BÁO CHUNG
            </button>
            {/* <button
              className={`tab-button ${activeTab === "daihoc" ? "active" : ""}`}
              onClick={() => setActiveTab("daihoc")}
            >
              ĐẠI HỌC - CAO ĐẲNG
            </button>
            <button
              className={`tab-button ${
                activeTab === "saudaihoc" ? "active" : ""
              }`}
              onClick={() => setActiveTab("saudaihoc")}
            >
              SAU ĐẠI HỌC
            </button>
            <button
              className={`tab-button ${
                activeTab === "nganhan" ? "active" : ""
              }`}
              onClick={() => setActiveTab("nganhan")}
            >
              NGẮN HẠN
            </button> */}
          </div>

          <div className="thong-bao-list">
            {loadingThongBao ? (
              <div className="loading-thong-bao">Đang tải dữ liệu...</div>
            ) : (
              thongBaos.map((thongBao) => {
                const dateInfo = formatDate(thongBao.NgayTao);
                const isNew = isNewNotification(thongBao.NgayTao);

                return (
                  <div
                    key={thongBao.MaThongBao}
                    className={`thong-bao-item ${isNew ? "thong-bao-new" : ""}`}
                  >
                    <div className="thong-bao-date">
                      <div className="thong-bao-month">
                        {dateInfo.formattedMonth}
                      </div>
                    </div>
                    <div className="thong-bao-content">
                      <div className="thong-bao-header">
                        <h3 className="thong-bao-title">{thongBao.TieuDe}</h3>
                        {isNew && <span className="thong-bao-badge">MỚI</span>}
                      </div>
                      <a
                        href={`/thong-bao/${thongBao.MaThongBao}`}
                        className="xem-chi-tiet"
                      >
                        Xem chi tiết
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="login-box">
          <div className="login-box-header">
            <h2>CỔNG THÔNG TIN SINH VIÊN</h2>
            <h3>ĐĂNG NHẬP HỆ THỐNG</h3>
          </div>

          <div className="login-form">
            {/* Đã chuyển alert ra ngoài, chỗ này không cần nữa */}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  placeholder="Nhập mã đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
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
                  {isLoading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
                </button>
              </div>
            </form>

            <div className="login-links">
              <a
                className="lost-password"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsForgotPasswordOpen(true);
                }}
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>
        </div>
         <Chatbot onOpenForgotPassword={() => setIsForgotPasswordOpen(true)} />
      </div>

      {/* Modal Quên Mật Khẩu */}
      {isForgotPasswordOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={closeForgotPasswordModal}>
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
            <h2 className="modal-title">Quên Mật Khẩu</h2>

            {forgotStep === 1 && (
              <div>
                <div className="form-group">
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
                    className={`message ${
                      forgotMessage.includes("OTP đã được gửi")
                        ? "success"
                        : "error"
                    }`}
                  >
                    {forgotMessage}
                   
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={closeForgotPasswordModal}
                  >
                    Đóng
                  </button>
                  <button
                    className={`btn btn-primary ${
                      isForgotLoading ? "btn-loading" : ""
                    }`}
                    onClick={handleForgotPassword}
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? "Đang xử lý..." : "Gửi OTP"}
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 2 && (
              <div>
                <div className="form-group">
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
                    className={`message ${
                      forgotMessage.includes("OTP đã được gửi")
                        ? "success"
                        : "error"
                    }`}
                  >
                    {forgotMessage}
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={closeForgotPasswordModal}
                  >
                    Đóng
                  </button>
                  <button
                    className={`btn btn-primary ${
                      isForgotLoading ? "btn-loading" : ""
                    }`}
                    onClick={handleNextToReset}
                    disabled={isForgotLoading}
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 3 && (
              <div>
                <div className="form-group">
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
                <div className="form-group">
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
                    className={`message ${
                      forgotMessage.includes("thành công") ? "success" : "error"
                    }`}
                  >
                    {forgotMessage}
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={closeForgotPasswordModal}
                  >
                    Đóng
                  </button>
                  <button
                    className={`btn btn-primary ${
                      isForgotLoading ? "btn-loading" : ""
                    }`}
                    onClick={handleResetPassword}
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
