using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Models.DTOs
{
    public class PaginatedResult<T>
    {
        public int TongSoTrang { get; set; }
        public int TrangHienTai { get; set; }
        public int SoLuongMoiTrang { get; set; }
        public int TongSoMuc { get; set; }
        public List<T> DanhSach { get; set; }
    }
}
