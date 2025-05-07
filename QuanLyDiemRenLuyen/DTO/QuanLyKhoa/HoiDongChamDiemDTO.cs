namespace QuanLyDiemRenLuyen.DTO.QuanLyKhoa
{
    public class HoiDongChamDiemDTO
    {
        public int MaHoiDong { get; set; }
        public string TenHoiDong { get; set; }
        public int? MaHocKy { get; set; }
        public string? TenHocKy { get; set; }
        public DateOnly? NgayThanhLap { get; set; }
        public string? GhiChu { get; set; }
    }

    public class HoiDongChamDiemDetailDTO : HoiDongChamDiemDTO
    {
        public List<ThanhVienHoiDongDTO> ThanhViens { get; set; }
    }

    public class ThanhVienHoiDongDTO
    {
        public int MaThanhVien { get; set; }
        public string? MaGv { get; set; }
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? VaiTroTrongHoiDong { get; set; }
    }
    public class TaoHoiDongChamDiemRequest
    {
        public string TenHoiDong { get; set; }
        public int? MaHocKy { get; set; }
        public DateOnly? NgayThanhLap { get; set; }
        public string? GhiChu { get; set; }
    }
    public class ThemThanhVienRequest
    {
        public string MaGv { get; set; }
        public string? VaiTroTrongHoiDong { get; set; }
    }
}
