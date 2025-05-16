using System.ComponentModel.DataAnnotations;

namespace QuanLyDiemRenLuyen.Models
{
    public class QRCodeSession
    {
        [Key] // <- cái này rất quan trọng
        public string Token { get; set; }
        public int MaHoatDong { get; set; }
        public string MaQL { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
