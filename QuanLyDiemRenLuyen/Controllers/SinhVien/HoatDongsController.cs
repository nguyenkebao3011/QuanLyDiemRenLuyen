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

            // Danh sách trạng thái hợp lệ
            var cacTrangThaiHopLe = new[] { "đang diễn ra", "đang mở đăng ký", "đã đóng đăng ký" };

            // Luôn lọc chỉ lấy các hoạt động có trạng thái hợp lệ
            query = query.Where(h => cacTrangThaiHopLe.Contains(h.TrangThai));

            // Lọc theo tên hoạt động
            if (!string.IsNullOrWhiteSpace(filter.Ten))
            {
                query = query.Where(h => h.TenHoatDong.Contains(filter.Ten));
            }

            // Lọc theo ngày bắt đầu
            if (filter.BatDauTu.HasValue)
            {
                query = query.Where(h => h.NgayBatDau >= filter.BatDauTu.Value);
            }

            // Lọc theo ngày và giờ kết thúc
            if (filter.KetThucTruoc.HasValue)
            {
                query = query.Where(h => h.NgayKetThuc <= filter.KetThucTruoc.Value);
            }

            // Lọc theo điểm tối thiểu
            if (filter.DiemMin.HasValue)
            {
                query = query.Where(h => h.DiemCong >= filter.DiemMin.Value);
            }

            // Lọc theo điểm tối đa
            if (filter.DiemMax.HasValue)
            {
                query = query.Where(h => h.DiemCong <= filter.DiemMax.Value);
            }

            // Lọc hoạt động kéo dài hơn 2 ngày
            if (filter.IsLongerThanTwoDays)
            {
                query = query.Where(h => h.NgayDienRa == true);
            }

            // Lọc theo trạng thái cụ thể (nếu được cung cấp)
            if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            {
                string trangThaiFilter = filter.TrangThai.Trim().ToLower();
                if (cacTrangThaiHopLe.Contains(trangThaiFilter))
                {
                    query = query.Where(h => h.TrangThai.ToLower() == trangThaiFilter);
                }
                else
                {
                    // Trả về danh sách rỗng nếu trạng thái không hợp lệ
                    return Ok(new List<HoatDong>());
                }
            }

            // Sắp xếp theo hoạt động mới nhất
            if (filter.IsLatest)
            {
                query = query.OrderByDescending(h => h.NgayTao);
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

        [HttpGet("lay-danh-sach-hoat-dong-mo-dang-ky")]
        public async Task<ActionResult<IEnumerable<HoatDong>>> GetHoatDongsMoDangKy()
        {
            var hoatDongs = await _context.HoatDongs
                .Where(h => h.TrangThai == "Đang mở đăng ký")
                .ToListAsync();

            return Ok(hoatDongs);
        }
    }
}
