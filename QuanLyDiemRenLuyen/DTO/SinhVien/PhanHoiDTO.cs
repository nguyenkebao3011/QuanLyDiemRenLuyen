namespace QuanLyDiemRenLuyen.DTO.SinhVien
{
    public class PhanHoiDTO
    {
        public string MaDangKy { get; set; } // Tùy chọn, nếu không gửi thì lấy từ user
        
        public string MoTa { get; set; }
        
        public IFormFile FileAnh { get; set; }
    }
}
