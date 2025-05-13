namespace QuanLyDiemRenLuyen.DTO.SinhVien
{
    public class ThongBaoDTOSV
    {
        public int MaThongBao { get; set; }
        public string TieuDe { get; set; }
        public string NoiDung { get; set; }
        public DateTime? NgayTao { get; set; }
        public bool DaDoc { get; set; }
        public DateTime? NgayDoc { get; set; }
    }
}