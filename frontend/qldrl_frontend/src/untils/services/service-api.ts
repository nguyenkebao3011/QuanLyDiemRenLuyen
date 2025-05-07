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
  TaoPhanHoiRequest,
  HocKy,
  CapNhatDiemRenLuyenRequest,
  TaoDiemRenLuyenRequest,
  SinhVien,
  PhanHoiDiemRenLuyenListDTO,
  DiemRenLuyenDTO,
  XuLyPhanHoiRequest,
  MinhChungHoatDongDTO,
  PhanHoiDiemRenLuyenDTO,
  MinhChungDTO,
  PhanHoiDiemRenLuyenDetailDTO,
  TongQuanThongKeDTO,
  GiaoVien,
  ThemThanhVienRequest,
  TaoHoiDongChamDiemRequest,
  HoiDongChamDiemDetailDTO,
  HoiDongChamDiemDTO,
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

  layDanhSachHoatDongAll: async (): Promise<HoatDong[]> => {
    const response = await api.get("/HoatDong/lay_hoat_dong_all");
    return response.data;
  },
  // DiemRenLuyen services
  layDanhSachDiemRenLuyen: async (): Promise<DiemRenLuyenDTO[]> => {
    const response = await api.get("/DiemRenLuyen/lay_danh_sach");
    return response.data;
  },

  layChiTietDiemRenLuyen: async (id: number): Promise<DiemRenLuyenDTO> => {
    const response = await api.get(`/DiemRenLuyen/lay_chi_tiet/${id}`);
    return response.data;
  },

  taoDiemRenLuyen: async (
    request: TaoDiemRenLuyenRequest
  ): Promise<DiemRenLuyenDTO> => {
    const response = await api.post(
      "/DiemRenLuyen/tao_diem_ren_luyen",
      request
    );
    return response.data;
  },

  capNhatDiemRenLuyen: async (
    id: number,
    request: CapNhatDiemRenLuyenRequest
  ): Promise<void> => {
    await api.put(`/DiemRenLuyen/cap_nhat_diem_ren_luyen/${id}`, request);
  },

  xoaDiemRenLuyen: async (id: number): Promise<void> => {
    await api.delete(`/DiemRenLuyen/xoa_diem_ren_luyen/${id}`);
  },

  // PhanHoiDiemRenLuyen services
  layDanhSachPhanHoi: async (): Promise<PhanHoiDiemRenLuyenListDTO[]> => {
    const response = await api.get("/PhanHoiDiemRenLuyen/danh_sach");
    return response.data;
  },

  layChiTietPhanHoi: async (
    id: number
  ): Promise<PhanHoiDiemRenLuyenDetailDTO> => {
    const response = await api.get(`/PhanHoiDiemRenLuyen/chi_tiet/${id}`);
    return response.data;
  },

  xuLyPhanHoi: async (
    id: number,
    request: XuLyPhanHoiRequest
  ): Promise<void> => {
    await api.put(`/PhanHoiDiemRenLuyen/xu_ly/${id}`, request);
  },

  layMinhChungTheoDiemRenLuyen: async (
    maDiemRenLuyen: number
  ): Promise<MinhChungHoatDongDTO[]> => {
    const response = await api.get(
      `/PhanHoiDiemRenLuyen/minh_chung_diem_ren_luyen/${maDiemRenLuyen}`
    );
    return response.data;
  },

  xoaPhanHoi: async (id: number): Promise<void> => {
    await api.delete(`/PhanHoiDiemRenLuyen/xoa_minh_chung/${id}`);
  },

  taoPhanHoi: async (
    request: TaoPhanHoiRequest
  ): Promise<PhanHoiDiemRenLuyenDTO> => {
    const response = await api.post(
      "/PhanHoiDiemRenLuyen/tao_phan_hoi",
      request
    );
    return response.data;
  },

  // MinhChung services
  layChiTietMinhChung: async (id: number): Promise<MinhChungDTO> => {
    try {
      const response = await api.get(`/MinhChung/lay_chi_tiet/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết minh chứng:", error);
      // Trả về minh chứng mặc định nếu có lỗi
      return {
        MaMinhChung: id,
        TenMinhChung: "Minh chứng không tìm thấy",
        DuongDan: null,
        NgayTao: new Date().toISOString(),
        MaSv: null,
        TenSinhVien: null,
        LoaiMinhChung: null,
        MoTa: "Không thể tải thông tin minh chứng",
        KichThuoc: null,
        DinhDang: null,
      };
    }
  },

  layDanhSachMinhChung: async (maSv?: string): Promise<MinhChungDTO[]> => {
    try {
      const url = maSv
        ? `/MinhChung/lay_danh_sach_theo_sinh_vien/${maSv}`
        : "/MinhChung/lay_danh_sach";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách minh chứng:", error);
      return [];
    }
  },

  // HocKy services
  layDanhSachHocKy: async (): Promise<HocKy[]> => {
    try {
      const response = await api.get("/HocKy/lay_hoc_ky");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học kỳ:", error);
      return [];
    }
  },

  // SinhVien services
  layDanhSachSinhVien: async (): Promise<SinhVien[]> => {
    try {
      const response = await api.get("/SinhVien/lay_danh_sach");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      return [];
    }
  },
  layThongKeTongQuan: async (): Promise<TongQuanThongKeDTO> => {
    try {
      const response = await api.get("/TongQuanThongKe/thong_ke_tong_quan");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê tổng quan:", error);
      return {
        TongSinhVien: 0,
        TongGiangVien: 0,
        TongHoatDong: 0,
        TongPhanHoi: 0,
      };
    }
  },

  layThongKePhanHoi: async (): Promise<{
    TongPhanHoi: number;
    DaXuLy: number;
    ChuaXuLy: number;
  }> => {
    try {
      const response = await api.get("/TongQuanThongKe/thong_ke_phan_hoi");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê phản hồi:", error);
      return {
        TongPhanHoi: 0,
        DaXuLy: 0,
        ChuaXuLy: 0,
      };
    }
  },

  layThongKeDiemTheoHocKy: async (
    maHocKy: number
  ): Promise<{
    DiemTrungBinh: number;
    DiemCaoNhat: number;
    DiemThapNhat: number;
  }> => {
    try {
      const response = await api.get(
        `/TongQuanThongKe/thong_ke_diem_theo_hoc_ky/${maHocKy}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê điểm theo học kỳ:", error);
      return {
        DiemTrungBinh: 0,
        DiemCaoNhat: 0,
        DiemThapNhat: 0,
      };
    }
  },

  layBaoCaoXepLoai: async (
    maHocKy: number
  ): Promise<{
    TongSinhVien: number;
    BaoCaoTheoLoai: { XepLoai: string; SoLuong: number }[];
  }> => {
    try {
      const response = await api.get(
        `/TongQuanThongKe/bao_cao_xep_loai/${maHocKy}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy báo cáo xếp loại:", error);
      return {
        TongSinhVien: 0,
        BaoCaoTheoLoai: [],
      };
    }
  },

  layThongKeMinhChung: async (): Promise<
    { TrangThai: string; SoLuong: number }[]
  > => {
    try {
      const response = await api.get("/TongQuanThongKe/thong_ke_minh_chung");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê minh chứng:", error);
      return [];
    }
  },

  layThongKeDiemTheoLop: async (
    maHocKy: number
  ): Promise<
    {
      MaLop: string;
      SoLuong: number;
      DiemTrungBinh: number;
      SoSinhVienGioi: number;
      SoSinhVienKha: number;
      SoSinhVienTb: number;
      SoSinhVienYeu: number;
    }[]
  > => {
    try {
      const response = await api.get(
        `/TongQuanThongKe/thong_ke_diem_theo_lop/${maHocKy}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê điểm theo lớp:", error);
      return [];
    }
  },
  // HoiDongChamDiem services
  layDanhSachHoiDong: async (): Promise<HoiDongChamDiemDTO[]> => {
    try {
      const response = await api.get("/HoiDongChamDiem/danh_sach");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hội đồng:", error);
      return [];
    }
  },

  layChiTietHoiDong: async (
    maHoiDong: number
  ): Promise<HoiDongChamDiemDetailDTO | null> => {
    try {
      const response = await api.get(`/HoiDongChamDiem/chi_tiet/${maHoiDong}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết hội đồng ${maHoiDong}:`, error);
      return null;
    }
  },

  taoHoiDong: async (request: TaoHoiDongChamDiemRequest): Promise<any> => {
    try {
      const response = await api.post("/HoiDongChamDiem/tao_hoi_dong", request);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo hội đồng:", error);
      throw error;
    }
  },

  themThanhVien: async (
    maHoiDong: number,
    request: ThemThanhVienRequest
  ): Promise<any> => {
    try {
      const response = await api.post(
        `/HoiDongChamDiem/${maHoiDong}/them_thanh_vien`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi thêm thành viên vào hội đồng ${maHoiDong}:`,
        error
      );
      throw error;
    }
  },

  xoaThanhVien: async (maThanhVien: number): Promise<void> => {
    try {
      await api.delete(`/HoiDongChamDiem/xoa_thanh_vien/${maThanhVien}`);
    } catch (error) {
      console.error(`Lỗi khi xóa thành viên ${maThanhVien}:`, error);
      throw error;
    }
  },

  xoaHoiDong: async (maHoiDong: number): Promise<void> => {
    try {
      await api.delete(`/HoiDongChamDiem/xoa_hoi_dong/${maHoiDong}`);
    } catch (error) {
      console.error(`Lỗi khi xóa hội đồng ${maHoiDong}:`, error);
      throw error;
    }
  },

  // GiaoVien services (needed for adding members)
  layDanhSachGiaoVien: async (): Promise<GiaoVien[]> => {
    try {
      const response = await api.get("/GiaoViens");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giáo viên:", error);
      return [];
    }
  },
};
