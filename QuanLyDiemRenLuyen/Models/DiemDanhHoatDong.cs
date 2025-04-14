using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class DiemDanhHoatDong
{
    public int MaDiemDanh { get; set; }

    public int? MaDangKy { get; set; }

    public DateTime? ThoiGianDiemDanh { get; set; }

    public string? MaQl { get; set; }

    public string? GhiChu { get; set; }

    public virtual DangKyHoatDong? MaDangKyNavigation { get; set; }

    public virtual QuanLyKhoa? MaQlNavigation { get; set; }
}
