using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class GiaoVien
{
    public string MaGv { get; set; } = null!;

    public string MaTaiKhoan { get; set; } = null!;

    public string? HoTen { get; set; }

    public string? Email { get; set; }

    public string? SoDienThoai { get; set; }

    public string? DiaChi { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? GioiTinh { get; set; }

    public string? AnhDaiDien { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<Lop> Lops { get; set; } = new List<Lop>();

    public virtual TaiKhoan MaTaiKhoanNavigation { get; set; } = null!;

    public virtual ICollection<ThanhVienHoiDong> ThanhVienHoiDongs { get; set; } = new List<ThanhVienHoiDong>();
}
