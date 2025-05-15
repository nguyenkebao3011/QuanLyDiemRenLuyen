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


            var cacTrangThaiHopLe = new[]
                 {
                    "chưa bắt đầu",
                    "đang diễn ra",
                    "đang mở đăng ký",
                    "đã kết thúc"
                };

            if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            {
                string trangThaiFilter = filter.TrangThai.Trim().ToLower();

                if (cacTrangThaiHopLe.Contains(trangThaiFilter))
                {
                    // Lọc client-side vì EF Core không hỗ trợ .ToLower() + .Trim()
                    query = query
                        .AsEnumerable()
                        .Where(h => h.TrangThai != null &&
                                    h.TrangThai.Trim().ToLower() == trangThaiFilter)
                        .AsQueryable();
                }
                else
                {
                    // Nếu trạng thái không hợp lệ → trả về danh sách rỗng
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
