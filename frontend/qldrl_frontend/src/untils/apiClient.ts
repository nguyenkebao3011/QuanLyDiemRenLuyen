import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5163/index.html", // Cấu hình URL cơ sở của backend
});

// Thêm token vào header Authorization
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
