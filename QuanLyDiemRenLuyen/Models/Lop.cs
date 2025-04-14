using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models;

public partial class Lop
{
    public string MaLop { get; set; } = null!;

    public string TenLop { get; set; } = null!;

    public string? NienKhoa { get; set; }

    public string? MaGv { get; set; }

    public virtual GiaoVien? MaGvNavigation { get; set; }

    public virtual ICollection<SinhVien> SinhViens { get; set; } = new List<SinhVien>();
}
