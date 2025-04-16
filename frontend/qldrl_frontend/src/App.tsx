import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login/Login";
import AdminDashboard from "./Pages/Dashboard/Admin/Dashboard"; // Trang chính cho Admin
import StudentDashboard from "./Pages/Dashboard/SinhVien/Dashboard"; // Trang chính cho Sinh viên
import TeacherDashboard from "./Pages/Dashboard/Teacher/Dashboard"; // Trang chính cho Giáo viên

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard cho các vai trò khác nhau */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/giangvien/dashboard" element={<TeacherDashboard />} />
        <Route path="/sinhvien/dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
