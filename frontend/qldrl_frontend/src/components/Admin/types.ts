//  các interface cho ThongBao
export interface ThongBaoDTO {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  MaQl: string;
  LoaiThongBao: string;
  TrangThai: string;
  TenNguoiTao: string;
  Khoa: string;
  SoLuotXem: number;
  DaDoc: boolean;
}

export interface ThongBaoChiTietDTO extends ThongBaoDTO {
  DanhSachSinhVienDaDoc: SinhVienDocThongBaoDTO[];
}

export interface SinhVienDocThongBaoDTO {
  MaSV: string;
  HoTen: string;
  MaLop: string;
  NgayDoc: string;
}

export interface DanhDauDaDocRequest {
  MaThongBao: number;
  MaSV: string;
}

export interface TaoThongBaoTuHoatDongRequest {
  MaHoatDong: number;
  TieuDe?: string;
  NoiDung?: string;
  MaQl?: string;
  LoaiThongBao?: string;
}

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

export interface Lop {
  MaLop: string;
  TenLop: string;
}

export interface DangKyHoatDong {
  MaDangKy: number;
  MaSv: string | null;
  MaHoatDong: number;
  NgayDangKy: string | null;
  TrangThai: string | null;
  // Thông tin bổ sung
  HoTen?: string; // Tên sinh viên
  Lop?: string; // Lớp của sinh viên
  DaDiemDanh?: boolean; // Trạng thái điểm danh
  ThoiGianDiemDanh?: string | null; // Thời gian điểm danh
  GhiChu?: string | null; // Ghi chú điểm danh
}

export interface ThongTinHoatDong {
  MaHoatDong: number;
  TenHoatDong: string;
  MoTa: string | null;
  NgayBatDau: string | null;
  NgayKetThuc: string | null;
  DiaDiem: string | null;
  SoLuongToiDa: number | null;
  DiemCong: number | null;
  MaHocKy: number;
  TenHocKy: string;
  NamHoc: string;
  MaQl: string | null;
  TenQl: string | null;
  TrangThai: string | null;
  SoLuongDangKy: number;
  SoLuongDiemDanh: number;
  TiLeDiemDanh: number;
}

export interface BaoCaoDiemDanh {
  ThongTinHoatDong: {
    MaHoatDong: number;
    TenHoatDong: string;
    HocKy: string;
    NamHoc: string;
    NgayBatDau: string | null;
    NgayKetThuc: string | null;
    DiaDiem: string | null;
    DiemCong: number | null;
    NguoiQuanLy: string | null;
  };
  ThongKe: {
    TongSoSinhVien: number;
    SoLuongDiemDanh: number;
    TiLeDiemDanh: number;
  };
  DanhSachDiemDanh: {
    MaSv: string;
    HoTen: string | null;
    Lop: string | null;
    DaDiemDanh: boolean;
    ThoiGianDiemDanh: string | null;
    NguoiDiemDanh: string | null;
    GhiChu: string | null;
  }[];
}
