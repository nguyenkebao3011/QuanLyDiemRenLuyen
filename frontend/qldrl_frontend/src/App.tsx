import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Pages/Login/Login";
import ResetPassword from "./Pages/Login/ResetPassword";
import AdminDashboard from "./Pages/Dashboard/Admin/views/Dashboard"; // Chọn đường dẫn đúng
import StudentDashboard from "./Pages/Dashboard/SinhVien/Dashboard";
import TeacherDashboard from "./Pages/Dashboard/Teacher/Dashboard";
import { isLoggedIn, getRole } from "./untils/auth";

import ChiTietThongBao from "./Pages/Login/ChiTietThongBao";
import CapNhatThongTin from "./components/SinhVien/views/CapNhatThongTin";
import DoiMatKhau from "./components/SinhVien/views/DoiMatKhau";
import CapNhatThongTinGiangVien from "./components/GiangVien/views/CapNhatThongTinGiangVien";

const App: React.FC = () => {
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

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (!isLoggedIn()) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<RedirectByRole />} />
        <Route path="/thong-bao/:id" element={<ChiTietThongBao />} />
        <Route path="/doi-mat-khau" element={<DoiMatKhau />} />
        <Route path="/cap-nhat-thong-tin-giang-vien" element={<CapNhatThongTinGiangVien />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/giangvien/dashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sinhvien/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chinh-sua-thong-tin"
          element={
            <ProtectedRoute>
              <CapNhatThongTin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
