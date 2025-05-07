using QuanLyDiemRenLuyen.Controllers;

namespace QuanLyDiemRenLuyen.DTO.QuanLyKhoa
{
    public class PhanHoiDiemRenLuyenListDTO
    {
        public int MaPhanHoi { get; set; }
        public int? MaDiemRenLuyen { get; set; }
        public int? MaMinhChung { get; set; }
        public string NoiDungPhanHoi { get; set; }
        public DateTime? NgayPhanHoi { get; set; }
        public string? TrangThai { get; set; }
        public string? MaQl { get; set; }
        public string? NoiDungXuLy { get; set; }
        public DateTime? NgayXuLy { get; set; }
        // Thông tin sinh viên và điểm rèn luyện
        public string? MaSv { get; set; }
        public string? TenSinhVien { get; set; }
        public int? MaHocKy { get; set; }
        public double? TongDiem { get; set; }
        public string? XepLoai { get; set; }
    }

    public class PhanHoiDiemRenLuyenDetailDTO
    {
        public int MaPhanHoi { get; set; }
        public string NoiDungPhanHoi { get; set; }
        public DateTime? NgayPhanHoi { get; set; }
        public string? TrangThai { get; set; }
        public string? MaQl { get; set; }
        public string? NoiDungXuLy { get; set; }
        public DateTime? NgayXuLy { get; set; }
        public DiemRenLuyenDTO? DiemRenLuyen { get; set; }
        public MinhChungHoatDongDTO? MinhChung { get; set; }
    }


}
