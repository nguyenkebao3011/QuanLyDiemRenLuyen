namespace QuanLyDiemRenLuyen.DTO.GiangVien
{
    public class ThongKeDiemRenLuyenDTO
    {
        public int TongSoSinhVien { get; set; }
        public double TrungBinhDiemDRL { get; set; }
        public LoaiDiemDTO LoaiGioi { get; set; }
        public LoaiDiemDTO LoaiKha { get; set; }
        public LoaiDiemDTO LoaiTrungBinh { get; set; }
        public LoaiDiemDTO LoaiYeu { get; set; }
    }

    public class LoaiDiemDTO
    {
        public int SoLuong { get; set; }
        public double PhanTram { get; set; }
    }
}
