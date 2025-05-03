using System.ComponentModel.DataAnnotations;

namespace QuanLyDiemRenLuyen.DTO.SinhVien
{
    public class HuyDangKyDTO
    {
        public int MaHoatDong { get; set; }
        [StringLength(500, ErrorMessage = "Lý do hủy không được vượt quá 500 ký tự")]
        public string? LyDoHuy { get; set; }
    }
}
