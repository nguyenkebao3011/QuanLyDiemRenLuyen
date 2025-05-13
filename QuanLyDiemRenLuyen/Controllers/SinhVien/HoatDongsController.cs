using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoatDongsController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public HoatDongsController(QlDrlContext context)
        {
            _context = context;
        }
        [HttpGet("loc-hoat-dong")]
        public IActionResult GetHoatDong([FromQuery] HoatDongFilterDTO filter)
        {
            var query = _context.HoatDongs.AsQueryable();
            var currentDate = DateTime.Now; 

            if (!string.IsNullOrWhiteSpace(filter.Ten))
                query = query.Where(h => h.TenHoatDong.Contains(filter.Ten));

            if (filter.BatDauTu.HasValue)
                query = query.Where(h => h.NgayBatDau >= filter.BatDauTu.Value);

            if (filter.KetThucTruoc.HasValue)
                query = query.Where(h => h.NgayKetThuc <= filter.KetThucTruoc.Value);

            if (filter.DiemMin.HasValue)
                query = query.Where(h => h.DiemCong >= filter.DiemMin.Value);

            if (filter.DiemMax.HasValue)
                query = query.Where(h => h.DiemCong <= filter.DiemMax.Value);
            // Lọc theo trạng thái
            //if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            //{
            //    if (filter.TrangThai == "Đang diễn ra")
            //        query = query.Where(h => h.NgayBatDau <= currentDate && h.NgayKetThuc >= currentDate);
            //    else if (filter.TrangThai == "Chưa bắt đầu")
            //        query = query.Where(h => h.NgayKetThuc >= currentDate);
            //}

            // Lọc theo trạng thái từ CSDL (chỉ Đang diễn ra hoặc Chưa bắt đầu)
            if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            {
                if (filter.TrangThai == "Đang diễn ra" || filter.TrangThai == "Chưa bắt dầu")
                {
                    query = query.Where(h => h.TrangThai.Equals(filter.TrangThai, StringComparison.OrdinalIgnoreCase));
                }
                else
                {
                    // Nếu trạng thái không hợp lệ (ví dụ: DaKetThuc), trả về danh sách rỗng hoặc lỗi
                    return Ok(new List<HoatDong>());
                }
            }

            var result = query.ToList();
            return Ok(result);


        }
        // GET: api/HoatDongs
        [HttpGet("lay-danh-sach-hoat-dong")]
        public async Task<ActionResult<IEnumerable<HoatDong>>> GetHoatDongs()
        {
                    var hoatDongs = await _context.HoatDongs
                .Where(h => h.TrangThai != "Đã kết thúc")
                .ToListAsync();

                    return Ok(hoatDongs);
        }

       
    }
}
