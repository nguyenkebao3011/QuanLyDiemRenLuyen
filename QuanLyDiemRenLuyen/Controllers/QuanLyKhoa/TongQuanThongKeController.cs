using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class TongQuanThongKeController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public TongQuanThongKeController(QlDrlContext context)
        {
            _context = context;
        }
        [HttpGet("thong_ke_tong_quan")]
        public async Task<TongQuanThongKeDTO> GetThongKeTongQuanAsync()
        {
            // Đếm tổng sinh viên
            var tongSinhVien = await _context.SinhViens.CountAsync();

            // Đếm tổng giảng viên
            var tongGiangVien = await _context.GiaoViens.CountAsync();

            // Đếm tổng hoạt động
            var tongHoatDong = await _context.HoatDongs.CountAsync();

            // Đếm tổng phản hồi
            var tongPhanHoi = await _context.PhanHoiDiemRenLuyens.CountAsync();

            return new TongQuanThongKeDTO
            {
                TongSinhVien = tongSinhVien,
                TongGiangVien = tongGiangVien,
                TongHoatDong = tongHoatDong,
                TongPhanHoi = tongPhanHoi
            };
        }
    }
}
