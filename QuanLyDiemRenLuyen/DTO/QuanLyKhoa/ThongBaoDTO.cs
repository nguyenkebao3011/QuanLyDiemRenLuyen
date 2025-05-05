using System;

namespace QuanLyDiemRenLuyen.Models.DTOs
{
    public class ThongBaoDTO
    {
        public int MaThongBao { get; set; }
        public required string TieuDe { get; set; } 
        public required string NoiDung { get; set; }
        public DateTime? NgayTao { get; set; }
        public required string MaQl { get; set; }
        public required string LoaiThongBao { get; set; }
        public required string TrangThai { get; set; }

        // Thông tin bổ sung
        public required string TenNguoiTao { get; set; }
        public required string Khoa { get; set; }
        public required int SoLuotXem { get; set; }
        public bool DaDoc { get; set; } 
    }
}
