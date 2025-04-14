using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class PhanHoiDiemRenLuyen
{
    public int MaPhanHoi { get; set; }

    public int? MaDiemRenLuyen { get; set; }

    public int? MaMinhChung { get; set; }

    public string NoiDungPhanHoi { get; set; } = null!;

    public DateTime? NgayPhanHoi { get; set; }

    public string? TrangThai { get; set; }

    public string? MaQl { get; set; }

    public string? NoiDungXuLy { get; set; }

    public DateTime? NgayXuLy { get; set; }

    public virtual DiemRenLuyen? MaDiemRenLuyenNavigation { get; set; }

    public virtual MinhChungHoatDong? MaMinhChungNavigation { get; set; }

    public virtual QuanLyKhoa? MaQlNavigation { get; set; }
}
