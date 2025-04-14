using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class DiemRenLuyen
{
    public int MaDiemRenLuyen { get; set; }

    public string? MaSv { get; set; }

    public int? MaHocKy { get; set; }

    public double? TongDiem { get; set; }

    public string? XepLoai { get; set; }

    public DateTime? NgayChot { get; set; }

    public string? TrangThai { get; set; }

    public virtual HocKy? MaHocKyNavigation { get; set; }

    public virtual SinhVien? MaSvNavigation { get; set; }

    public virtual ICollection<PhanHoiDiemRenLuyen> PhanHoiDiemRenLuyens { get; set; } = new List<PhanHoiDiemRenLuyen>();
}
