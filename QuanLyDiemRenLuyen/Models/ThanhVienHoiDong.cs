using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class ThanhVienHoiDong
{
    public int MaThanhVien { get; set; }

    public int? MaHoiDong { get; set; }

    public string? MaGv { get; set; }

    public string? VaiTroTrongHoiDong { get; set; }

    public virtual GiaoVien? MaGvNavigation { get; set; }

    public virtual HoiDongChamDiem? MaHoiDongNavigation { get; set; }
}
