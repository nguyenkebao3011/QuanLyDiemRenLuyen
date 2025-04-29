import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBell, FiCheckCircle, FiFileText, FiUpload, FiMessageSquare } from 'react-icons/fi';
import { IconType } from 'react-icons'; // <- Import IconType

interface SidebarItem {
  label: string;
  path: string;
  icon: IconType; // <-- chính xác luôn
}

const sidebarItems: SidebarItem[] = [
  { label: 'Trang chủ', path: '/dashboard', icon: FiHome },
  { label: 'Thông báo', path: '/thong-bao', icon: FiBell },
  { label: 'Xem Điểm rèn luyện', path: '/diem-ren-luyen', icon: FiCheckCircle },
  { label: 'Đăng ký hoạt động', path: '/dang-ky-hoat-dong', icon: FiFileText },
  { label: 'Nộp minh chứng', path: '/nop-minh-chung', icon: FiUpload },
  { label: 'Phản hồi', path: '/phan-hoi', icon: FiMessageSquare },
];

const StudentSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-indigo-900 text-white flex flex-col p-6 shadow-lg">
  <h2 className="text-2xl font-bold mb-8">Sinh viên</h2>
  {<nav className="flex flex-col gap-2">
  {sidebarItems.map((item) => {
    const Icon = item.icon as React.ComponentType<any>; // ép kiểu nè
    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 
          ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-800'}
          hover:scale-[1.03]
        `}
      >
        <Icon size={22} className="text-white" />
        <span className="text-base font-medium">{item.label}</span>
      </Link>
    );
  })}
</nav>}
</div>
  );
};

export default StudentSidebar;