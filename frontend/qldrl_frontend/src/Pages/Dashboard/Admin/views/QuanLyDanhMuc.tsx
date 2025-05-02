import React, { useState } from "react";
import { Users, UserCheck } from "lucide-react";
import QuanLySinhVien from "../../../../components/Admin/QuanLyDanhMuc/SinhVien/QuanLySinhVien";
import QuanLyGiangVien from "../../../../components/Admin/QuanLyDanhMuc/GiangVien/QuanLyGiangVien";
import "../css/QuanLyDanhMuc.css";

const QuanLyDanhMuc: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("sinh-vien");

  return (
    <div className="category-management">
      <div className="category-tabs">
        <button
          className={`tab-button ${activeTab === "sinh-vien" ? "active" : ""}`}
          onClick={() => setActiveTab("sinh-vien")}
        >
          <Users size={18} />
          <span>Quản lý sinh viên</span>
        </button>
        <button
          className={`tab-button ${activeTab === "giang-vien" ? "active" : ""}`}
          onClick={() => setActiveTab("giang-vien")}
        >
          <UserCheck size={18} />
          <span>Quản lý giảng viên</span>
        </button>
      </div>

      <div className="category-content">
        {activeTab === "sinh-vien" ? <QuanLySinhVien /> : <QuanLyGiangVien />}
      </div>
    </div>
  );
};

export default QuanLyDanhMuc;
