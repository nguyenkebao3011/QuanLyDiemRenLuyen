using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class ChiTietThongBao
{
    public int MaChiTietThongBao { get; set; }

    public int? MaThongBao { get; set; }

    public string? MaSv { get; set; }

    public bool? DaDoc { get; set; }

    public DateTime? NgayDoc { get; set; }

    public string? MaGV { get; set; }
    public virtual SinhVien? MaSvNavigation { get; set; }

    public virtual ThongBao? MaThongBaoNavigation { get; set; }
}
