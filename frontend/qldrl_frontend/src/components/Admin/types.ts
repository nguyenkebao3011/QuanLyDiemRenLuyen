export interface HoatDong {
  MaHoatDong: number;
  TenHoatDong: string;
  MoTa: string;
  DiaDiem: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  SoLuongToiDa: number;
  SoLuongDaDangKy: number;
  DiemCong: number;
  TrangThai: string;
  MaHocKy: number;
  MaQl: string;
  NgayTao: string;
  MaHocKyNavigation?: {
    TenHocKy: string;
    NamHoc: string;
  };
  MaQlNavigation?: {
    HoTen: string;
    Khoa: string;
  };
}
export interface HocKy {
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
  NgayBatDau: string;
  NgayKetThuc: string;
}

export interface QuanLyKhoa {
  MaQl: string;
  MaTaiKhoan: string;
  HoTen: string;
  Khoa: string;
  Email: string;
  SoDienThoai: string;
}
export interface ThongBao {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  TrangThai: string;
  SoLuotXem?: number;
}

export interface TongQuanThongKeDTO {
  TongSinhVien: number;
  TongGiangVien: number;
  TongHoatDong: number;
  TongPhanHoi: number;
}
export interface SinhVien {
  MaSV: string;
  MaTaiKhoan: string;
  HoTen: string | null;
  MaLop: string | null;
  Email: string | null;
  SoDienThoai: string | null;
  DiaChi: string | null;
  NgaySinh: Date | string;
  GioiTinh: string | null;
  AnhDaiDien: string | null;
  MaVaiTro: number;
  TrangThai: string | null;
  MaLopNavigation?: any;
  MaTaiKhoanNavigation?: TaiKhoan;
}
export interface TaiKhoan {
  MaTaiKhoan: string;
  TenDangNhap: string;
  MatKhau: string;
  VaiTro: string;
}
export interface GiaoVien {
  MaGv: string;
  MaTaiKhoan: string;
  HoTen: string | null;
  Email: string | null;
  SoDienThoai: string | null;
  DiaChi: string | null;
  NgaySinh: Date | string | null;
  GioiTinh: string | null;
  AnhDaiDien: string | null;
  TrangThai: string | null;
  MaTaiKhoanNavigation?: TaiKhoan;
}
// Định nghĩa type cho lớp
export interface Lop {
  MaLop: string;
  TenLop: string;
}
