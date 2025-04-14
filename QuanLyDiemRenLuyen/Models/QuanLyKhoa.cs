using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class QuanLyKhoa
{
    public string MaQl { get; set; } = null!;

    public string MaTaiKhoan { get; set; } = null!;

    public string? HoTen { get; set; }

    public string? Khoa { get; set; }

    public string? Email { get; set; }

    public string? SoDienThoai { get; set; }

    public virtual ICollection<DiemDanhHoatDong> DiemDanhHoatDongs { get; set; } = new List<DiemDanhHoatDong>();

    public virtual ICollection<HoatDong> HoatDongs { get; set; } = new List<HoatDong>();

    public virtual TaiKhoan MaTaiKhoanNavigation { get; set; } = null!;

    public virtual ICollection<PhanHoiDiemRenLuyen> PhanHoiDiemRenLuyens { get; set; } = new List<PhanHoiDiemRenLuyen>();

    public virtual ICollection<ThongBao> ThongBaos { get; set; } = new List<ThongBao>();
}
