using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyDiemRenLuyen.Models
{
    public class LichSuHuyDangKy
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(10)]
        public string MaSv { get; set; }

        [Required]
        public int MaHoatDong { get; set; }
        [Required]
        public string? TenHoatDong { get; set; }

        [StringLength(500)]
        public string? LyDo { get; set; }

        [Required]
        public DateTime ThoiGianHuy { get; set; }

        [Required]
        [StringLength(50)]
        public string TrangThai { get; set; }

        // Navigation properties (khóa ngoại)
        [ForeignKey("MaSv")]
        public SinhVien SinhVien { get; set; }

        [ForeignKey("MaHoatDong")]
        public HoatDong HoatDong { get; set; }
    }
}
