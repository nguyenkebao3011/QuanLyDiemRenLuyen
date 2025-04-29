import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Pages/Login/Login";
import ResetPassword from "./Pages/Login/ResetPassword"; // Thêm import này
import AdminDashboard from "./Pages/Dashboard/Admin/views/Dashboard"; // Trang chính cho Admin
import StudentDashboard from "./Pages/Dashboard/SinhVien/Dashboard"; // Trang chính cho Sinh viên
import TeacherDashboard from "./Pages/Dashboard/Teacher/Dashboard"; // Trang chính cho Giáo viên
import { isLoggedIn, getRole } from "./untils/auth"; // Các hàm xử lý token và vai trò
import ChiTietThongBao from "./Pages/Login/ChiTietThongBao";

const App: React.FC = () => {
  // Hàm xử lý điều hướng dựa trên vai trò
  const RedirectByRole: React.FC = () => {
    const role = getRole();
    if (role) {
      switch (role.toLowerCase()) {
        case "admin":
        case "quanlykhoa":
          return <Navigate to="/admin/dashboard" />;
        case "giangvien":
        case "teacher":
          return <Navigate to="/giangvien/dashboard" />;
        case "sinhvien":
        case "student":
          return <Navigate to="/sinhvien/dashboard" />;
        default:
          return <Navigate to="/login" />;
      }
    }
    return <Navigate to="/login" />;
  };

  // Hàm bảo vệ các route yêu cầu đăng nhập
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (!isLoggedIn()) {
      // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Điều hướng mặc định */}
        <Route path="/" element={<RedirectByRole />} />
        {/* Các route khác */}
        <Route path="/thong-bao/:id" element={<ChiTietThongBao />} />
        {/* Dashboard cho Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard cho Giảng viên */}
        <Route
          path="/giangvien/dashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard cho Sinh viên */}
        <Route
          path="/sinhvien/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
