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
        [HttpGet("loc_hoat_dong")]
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
        [HttpGet("lay_danh_sach_hoatdong")]
        public async Task<ActionResult<IEnumerable<HoatDong>>> GetHoatDongs()
        {
            return await _context.HoatDongs.ToListAsync();
        }

        // GET: api/HoatDongs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HoatDong>> GetHoatDong(int id)
        {
            var hoatDong = await _context.HoatDongs.FindAsync(id);

            if (hoatDong == null)
            {
                return NotFound();
            }

            return hoatDong;
        }

        // PUT: api/HoatDongs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHoatDong(int id, HoatDong hoatDong)
        {
            if (id != hoatDong.MaHoatDong)
            {
                return BadRequest();
            }

            _context.Entry(hoatDong).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HoatDongExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/HoatDongs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<HoatDong>> PostHoatDong(HoatDong hoatDong)
        {
            _context.HoatDongs.Add(hoatDong);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHoatDong", new { id = hoatDong.MaHoatDong }, hoatDong);
        }

        // DELETE: api/HoatDongs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHoatDong(int id)
        {
            var hoatDong = await _context.HoatDongs.FindAsync(id);
            if (hoatDong == null)
            {
                return NotFound();
            }

            _context.HoatDongs.Remove(hoatDong);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HoatDongExists(int id)
        {
            return _context.HoatDongs.Any(e => e.MaHoatDong == id);
        }
    }
}
