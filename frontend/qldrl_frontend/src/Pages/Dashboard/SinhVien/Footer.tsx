import React from 'react';

import { Facebook, Mail, Phone, MapPin, Globe } from 'react-feather';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <div className="footer-logo">
            <img 
              src="../hinhanh/HUIT(2).jpeg" 
              alt="Logo trường HUIT" 
              className="footer-logo-img" 
            />
          </div>
          <h3>TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM</h3>
          <p>HO CHI MINH CITY UNIVERSITY OF INDUSTRY AND TRADE</p>
        </div>
        
        <div className="footer-column">
          <h4>Liên hệ</h4>
          <ul className="footer-links">
            <li>
              <MapPin size={16} className="footer-icon" />
              <span>140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM</span>
            </li>
            <li>
              <Phone size={16} className="footer-icon" />
              <span>(028) 3816 1673 - (028) 3816 1674</span>
            </li>
            <li>
              <Mail size={16} className="footer-icon" />
              <span>contact@huit.edu.vn</span>
            </li>
            <li>
              <Globe size={16} className="footer-icon" />
              <span>www.huit.edu.vn</span>
            </li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Liên kết nhanh</h4>
          <ul className="footer-links">
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/thong-bao">Thông báo</a></li>
            <li><a href="/diem-ren-luyen">Điểm rèn luyện</a></li>
            <li><a href="/hoat-dong">Hoạt động</a></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h4>Kết nối với chúng tôi</h4>
          <div className="social-links">
            <a href="https://www.facebook.com/huit.edu.vn" className="social-link">
              <Facebook size={24} />
            </a>
            <a href="mailto:contact@huit.edu.vn" className="social-link">
              <Mail size={24} />
            </a>
          </div>
          <div className="qr-code">
            <img src="../hinhanh/qr-code-placeholder.png" alt="QR Code" />
            <p>Quét mã để truy cập</p>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Hệ thống Quản lý điểm rèn luyện - Trường Đại học Công Thương TP.HCM</p>
      </div>
    </footer>
  );
};

export default Footer;