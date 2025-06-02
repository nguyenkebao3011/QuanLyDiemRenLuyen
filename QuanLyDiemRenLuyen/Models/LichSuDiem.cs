using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyDiemRenLuyen.Models
{
    [Table("LichSuDiem")]
    public class LichSuDiem
    {
        public int MaLichSu { get; set; }             // Mã lịch sử điểm (tự tăng, khóa chính)
        public string MaSv { get; set; }        // Mã sinh viên (liên kết với bảng SinhVien.MaSV)
        public string KieuThayDoi { get; set; }       // '+' hoặc '-'
        public int SoDiem { get; set; }               // Số điểm cộng/trừ
        public DateTime NgayThayDoi { get; set; }     // Ngày thay đổi điểm
        public string LyDo { get; set; }              // Lý do thay đổi

        public SinhVien MaSvNavigation { get; set; }
    }

}
