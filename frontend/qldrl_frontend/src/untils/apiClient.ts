import axios from "axios";
import { getToken } from "./auth";

// Cấu hình axios client
const apiClient = axios.create({
  baseURL: "http://localhost:5163/api", // URL cơ sở của API
});

// Thêm token vào header Authorization
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gửi token trong header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi từ API
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu token không hợp lệ hoặc hết hạn, đăng xuất
      alert("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.");
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
