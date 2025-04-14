using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class MinhChungHoatDong
{
    public int MaMinhChung { get; set; }

    public int? MaDangKy { get; set; }

    public string? DuongDanFile { get; set; }

    public string? MoTa { get; set; }

    public DateTime? NgayTao { get; set; }

    public string? TrangThai { get; set; }

    public virtual DangKyHoatDong? MaDangKyNavigation { get; set; }

    public virtual ICollection<PhanHoiDiemRenLuyen> PhanHoiDiemRenLuyens { get; set; } = new List<PhanHoiDiemRenLuyen>();
}
