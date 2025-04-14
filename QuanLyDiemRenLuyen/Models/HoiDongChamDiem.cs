using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class HoiDongChamDiem
{
    public int MaHoiDong { get; set; }

    public string TenHoiDong { get; set; } = null!;

    public int? MaHocKy { get; set; }

    public DateOnly? NgayThanhLap { get; set; }

    public string? GhiChu { get; set; }

    public virtual HocKy? MaHocKyNavigation { get; set; }

    public virtual ICollection<ThanhVienHoiDong> ThanhVienHoiDongs { get; set; } = new List<ThanhVienHoiDong>();
}
