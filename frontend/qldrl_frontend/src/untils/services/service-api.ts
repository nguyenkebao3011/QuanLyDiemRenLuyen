import axios from "axios";
import type {
  HoatDong,
  DangKyHoatDong,
  ThongTinHoatDong,
  BaoCaoDiemDanh,
  QuanLyKhoa,
  ThongBaoDTO,
  ThongBaoChiTietDTO,
  DanhDauDaDocRequest,
  TaoThongBaoTuHoatDongRequest,
} from "../../components/Admin/types";

const API_URL = "http://localhost:5163/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Service API for all modules
export const ApiService = {
  // Login services
  login: async (maDangNhap: string, matKhau: string) => {
    const response = await axios.post(`${API_URL}/TaiKhoans/login`, {
      MaDangNhap: maDangNhap,
      MatKhau: matKhau,
    });
    return response.data;
  },

  quenMatKhau: async (tenDangNhap: string) => {
    const response = await axios.post(`${API_URL}/TaiKhoans/quen-mat-khau`, {
      TenDangNhap: tenDangNhap,
    });
    return response.data;
  },

  doiMatKhau: async (otp: string, newPassword: string) => {
    const response = await axios.post(`${API_URL}/TaiKhoans/doi-mat-khau`, {
      Otp: otp,
      NewPassword: newPassword,
    });
    return response.data;
  },

  // DiemDanh services
  danhSachHoatDong: async (): Promise<HoatDong[]> => {
    const response = await api.get("/DiemDanh/DanhSachHoatDong");
    return response.data;
  },

  danhSachSinhVien: async (maHoatDong: number): Promise<DangKyHoatDong[]> => {
    const response = await api.get(`/DiemDanh/DanhSachSinhVien/${maHoatDong}`);
    return response.data;
  },

  thongTinHoatDong: async (maHoatDong: number): Promise<ThongTinHoatDong> => {
    const response = await api.get(`/DiemDanh/ThongTinHoatDong/${maHoatDong}`);
    return response.data;
  },

  baoCaoDiemDanh: async (maHoatDong: number): Promise<BaoCaoDiemDanh> => {
    const response = await api.get(`/DiemDanh/BaoCaoDiemDanh/${maHoatDong}`);
    return response.data;
  },

  diemDanhSinhVien: async (maDangKy: number, maQl: string, ghiChu?: string) => {
    const response = await api.post("/DiemDanh/DiemDanhSinhVien", {
      MaDangKy: maDangKy,
      MaQl: maQl,
      GhiChu: ghiChu,
    });
    return response.data;
  },

  diemDanhNhom: async (
    danhSachMaDangKy: number[],
    maQl: string,
    ghiChu?: string
  ) => {
    const response = await api.post("/DiemDanh/DiemDanhNhom", {
      DanhSachMaDangKy: danhSachMaDangKy,
      MaQl: maQl,
      GhiChu: ghiChu,
    });
    return response.data;
  },

  // QuanLyKhoa services
  thongTinQuanLyKhoa: async (): Promise<QuanLyKhoa> => {
    try {
      // Lấy thông tin từ sessionStorage nếu đã có
      const cachedData = sessionStorage.getItem("quanLyKhoa");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log("Đã lấy thông tin quản lý khoa từ cache:", parsedData);
        return parsedData;
      }

      const response = await api.get("/QuanLyKhoa/thong_tin");
      const qlKhoaData = response.data;
      console.log("Đã lấy thông tin quản lý khoa:", qlKhoaData);

      // Lưu vào sessionStorage để giảm số lần gọi API
      sessionStorage.setItem("quanLyKhoa", JSON.stringify(qlKhoaData));
      return qlKhoaData;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin quản lý khoa:", error);
      // Trả về mã quản lý mặc định nếu có lỗi
      return {
        MaQl: "QL02",
        MaTaiKhoan: "",
        HoTen: "Quản lý mặc định",
        Khoa: "",
        Email: "",
        SoDienThoai: "",
      };
    }
  },

  // ThongBao services
  layDanhSachThongBao: async (): Promise<ThongBaoDTO[]> => {
    const response = await api.get("/ThongBao/lay_thong_bao");
    return response.data;
  },

  layChiTietThongBao: async (
    maThongBao: number
  ): Promise<ThongBaoChiTietDTO> => {
    const response = await api.get(
      `/ThongBao/lay_chi_tiet_thong_bao/${maThongBao}`
    );
    return response.data;
  },

  layThongBaoSinhVien: async (maSv: string): Promise<ThongBaoDTO[]> => {
    const response = await api.get(`/ThongBao/lay_thong_bao_sinh_vien/${maSv}`);
    return response.data;
  },

  layThongBaoChuaDoc: async (maSv: string): Promise<ThongBaoDTO[]> => {
    const response = await api.get(`/ThongBao/lay_thong_bao_chua_doc/${maSv}`);
    return response.data;
  },

  danhDauDaDoc: async (
    request: DanhDauDaDocRequest
  ): Promise<{ message: string }> => {
    const response = await api.post("/ThongBao/danh_dau_da_doc", request);
    return response.data;
  },

  timKiemThongBao: async (tuKhoa: string): Promise<ThongBaoDTO[]> => {
    const response = await api.get(
      `/ThongBao/tim_kiem_thong_bao?tuKhoa=${tuKhoa}`
    );
    return response.data;
  },

  demThongBaoChuaDoc: async (
    maSv: string
  ): Promise<{ SoThongBaoChuaDoc: number }> => {
    const response = await api.get(`/ThongBao/dem_thong_bao_chua_doc/${maSv}`);
    return response.data;
  },

  taoThongBaoTuHoatDong: async (
    request: TaoThongBaoTuHoatDongRequest
  ): Promise<ThongBaoDTO> => {
    const response = await api.post(
      "/ThongBao/tao_thong_bao_tu_hoat_dong",
      request
    );
    return response.data;
  },

  // Fake API to get all activities (replace with real API when available)
  layDanhSachHoatDongAll: async (): Promise<HoatDong[]> => {
    const response = await api.get("/HoatDong/lay_hoat_dong_all");
    return response.data;
  },
};
