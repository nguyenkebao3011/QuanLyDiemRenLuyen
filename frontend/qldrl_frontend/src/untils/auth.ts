import { jwtDecode } from "jwt-decode";
// Lưu token vào localStorage
export const saveToken = (token: string): void => {
  localStorage.setItem("token", token);
};

// Lấy token từ localStorage
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Lấy vai trò (role) từ localStorage
export const getRole = (): string | null => {
  return localStorage.getItem("role");
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isLoggedIn = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây
    return decodedToken.exp > currentTime; // Kiểm tra token có hết hạn không
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};

// Đăng xuất
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "";
};
