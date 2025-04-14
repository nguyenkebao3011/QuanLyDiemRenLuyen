using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class SinhVien
{
    public string MaSV { get; set; } = null!;

    public string MaTaiKhoan { get; set; } = null!;

    public string? HoTen { get; set; }

    public string? MaLop { get; set; }

    public string? Email { get; set; }

    public string? SoDienThoai { get; set; }

    public string? DiaChi { get; set; }

    public DateTime NgaySinh { get; set; }

    public string? GioiTinh { get; set; }

    public string? AnhDaiDien { get; set; }

    public int MaVaiTro { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<ChiTietThongBao> ChiTietThongBaos { get; set; } = new List<ChiTietThongBao>();

    public virtual ICollection<DangKyHoatDong> DangKyHoatDongs { get; set; } = new List<DangKyHoatDong>();

    public virtual ICollection<DiemRenLuyen> DiemRenLuyens { get; set; } = new List<DiemRenLuyen>();

    public virtual Lop? MaLopNavigation { get; set; }

    public virtual TaiKhoan MaTaiKhoanNavigation { get; set; } = null!;
}
