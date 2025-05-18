namespace QuanLyDiemRenLuyen.DTO.SinhVien
{
    public class HoatDongFilterDTO
    {
        public string? Ten { get; set; }
        public DateTime? BatDauTu { get; set; }
        public DateTime? KetThucTruoc { get; set; }
        public int? DiemMin { get; set; }
        public int? DiemMax { get; set; }

        public string? TrangThai { get; set; }

        public bool IsLatest { get; set; } // Thêm thuộc tính này
    }
}
