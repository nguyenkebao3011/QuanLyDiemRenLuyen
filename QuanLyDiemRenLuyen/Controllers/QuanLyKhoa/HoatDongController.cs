using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/HoatDong")]
    [ApiController]
    public class HoatDongController : ControllerBase
    {
        private readonly QlDrlContext _context;

        // Constructor để inject DbContext
        public HoatDongController(QlDrlContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        [HttpPost("tao_hoat_dong")]
        public async Task<IActionResult> CreateHoatDong([FromBody] HoatDong hoatDong)
        {
            if (hoatDong == null)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }
            try
            {
                hoatDong.NgayTao = DateTime.Now; 
                hoatDong.SoLuongDaDangKy = 0;
                _context.HoatDongs.Add(hoatDong);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetHoatDongById), new { id = hoatDong.MaHoatDong }, hoatDong);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi thêm hoạt động: {ex.Message}");
            }
        }
        //GET : api/lay_hoat_dong_all
        [HttpGet("lay_hoat_dong_all")]
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
        // GET: api/HoatDong/{id}
        [HttpGet("lay_thong_tin_hd/{id}")]
        public async Task<IActionResult> GetHoatDongById(int id)
        {
            var hoatDong = await _context.HoatDongs.FindAsync(id);
            if (hoatDong == null)
            {
                return NotFound($"Không tìm thấy hoạt động với ID {id}.");
            }
            return Ok(hoatDong);
        }
    }
}
