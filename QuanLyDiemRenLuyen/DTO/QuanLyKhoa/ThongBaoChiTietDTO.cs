using System;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models.DTOs
{
    public class ThongBaoChiTietDTO
    {
        public int MaThongBao { get; set; }
        public string TieuDe { get; set; }
        public string NoiDung { get; set; }
        public DateTime? NgayTao { get; set; }
        public string MaQl { get; set; }
        public string LoaiThongBao { get; set; }
        public string TrangThai { get; set; }

        // Thông tin bổ sung
        public string TenNguoiTao { get; set; }
        public string Khoa { get; set; }
        public int SoLuotXem { get; set; }
        public List<SinhVienDocThongBaoDTO> DanhSachSinhVienDaDoc { get; set; }
    }

    public class SinhVienDocThongBaoDTO
    {
        public string MaSV { get; set; }
        public string HoTen { get; set; }
        public string MaLop { get; set; }
        public DateTime? NgayDoc { get; set; }
    }
}
