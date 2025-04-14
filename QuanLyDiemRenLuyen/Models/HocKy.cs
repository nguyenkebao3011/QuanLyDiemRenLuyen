using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class HocKy
{
    public int MaHocKy { get; set; }

    public string TenHocKy { get; set; } = null!;

    public string NamHoc { get; set; } = null!;

    public DateOnly? NgayBatDau { get; set; }

    public DateOnly? NgayKetThuc { get; set; }

    public virtual ICollection<DiemRenLuyen> DiemRenLuyens { get; set; } = new List<DiemRenLuyen>();

    public virtual ICollection<HoatDong> HoatDongs { get; set; } = new List<HoatDong>();

    public virtual ICollection<HoiDongChamDiem> HoiDongChamDiems { get; set; } = new List<HoiDongChamDiem>();
}
