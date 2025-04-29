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
