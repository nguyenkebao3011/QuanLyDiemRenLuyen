import React from "react";
import { LogOut } from "react-feather";

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "/login";
};


const Dashboard = () => {
  return (<div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>)

};
 
export default Dashboard;
