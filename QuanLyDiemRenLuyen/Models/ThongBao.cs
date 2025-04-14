using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class ThongBao
{
    public int MaThongBao { get; set; }

    public string TieuDe { get; set; } = null!;

    public string? NoiDung { get; set; }

    public DateTime? NgayTao { get; set; }

    public string? MaQl { get; set; }

    public string? LoaiThongBao { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<ChiTietThongBao> ChiTietThongBaos { get; set; } = new List<ChiTietThongBao>();

    public virtual QuanLyKhoa? MaQlNavigation { get; set; }
}
