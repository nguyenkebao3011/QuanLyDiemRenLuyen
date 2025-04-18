using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class DangKyHoatDong
{
    public int MaDangKy { get; set; }

    public string? MaSv { get; set; }

    public int MaHoatDong { get; set; }

    public DateTime? NgayDangKy { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<DiemDanhHoatDong> DiemDanhHoatDongs { get; set; } = new List<DiemDanhHoatDong>();

    public virtual HoatDong? MaHoatDongNavigation { get; set; }

    public virtual SinhVien? MaSvNavigation { get; set; }

    public virtual ICollection<MinhChungHoatDong> MinhChungHoatDongs { get; set; } = new List<MinhChungHoatDong>();
}
