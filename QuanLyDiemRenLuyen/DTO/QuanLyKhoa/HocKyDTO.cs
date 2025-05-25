namespace QuanLyDiemRenLuyen.DTO.QuanLyKhoa
{
    public class HocKyDTO
    {
        public int MaHocKy { get; set; }
        public string TenHocKy { get; set; } = null!;
        public string NamHoc { get; set; } = null!;
        public DateOnly? NgayBatDau { get; set; }
        public DateOnly? NgayKetThuc { get; set; }
    }
}
