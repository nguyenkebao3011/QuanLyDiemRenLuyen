namespace QuanLyDiemRenLuyen.DTO.SinhVien
{
    public class TaoPhanHoiVeHoatDongDTO
    {
        public string MaSv { get; set; } = null!;
        public int? MaHocKy { get; set; }
        public int? MaDangKy { get; set; }
        public string NoiDungPhanHoi { get; set; } = null!;
        public string? MoTaMinhChung { get; set; }
        public IFormFile? FileMinhChung { get; set; }
    }
}
