using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class HoatDong
{
    public int MaHoatDong { get; set; }

    public string TenHoatDong { get; set; } = null!;

    public string? MoTa { get; set; }

    public DateTime? NgayBatDau { get; set; }

    public DateTime? NgayKetThuc { get; set; }

    public string? DiaDiem { get; set; }

    public int? SoLuongToiDa { get; set; }

    public double? DiemCong { get; set; }

    public int? MaHocKy { get; set; }

    public string? MaQl { get; set; }

    public string? TrangThai { get; set; }

    public DateTime? NgayTao { get; set; }

    public int? SoLuongDaDangKy { get; set; }

    

    public virtual ICollection<DangKyHoatDong> DangKyHoatDongs { get; set; } = new List<DangKyHoatDong>();

    public virtual HocKy? MaHocKyNavigation { get; set; }

    public virtual QuanLyKhoa? MaQlNavigation { get; set; }
}
