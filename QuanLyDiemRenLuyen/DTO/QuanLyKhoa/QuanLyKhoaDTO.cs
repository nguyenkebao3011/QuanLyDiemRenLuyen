namespace QuanLyDiemRenLuyen.DTO.QuanLyKhoa
{
    public class QuanLyKhoaDTO
    {
        public string MaQl { get; set; } = null!;  // Có thể giữ hoặc bỏ tùy nhu cầu, thường không cần gửi về client khi tạo/sửa

        public string MaTaiKhoan { get; set; } = null!;  // Tương tự, thường lấy từ token nên không cần truyền

        public string? HoTen { get; set; }

        public string? Khoa { get; set; }

        public string? Email { get; set; }

        public string? SoDienThoai { get; set; }
    }
}
