using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class HocKyController : ControllerBase
    {
        private readonly QlDrlContext _context;
        public HocKyController(QlDrlContext context)
        {
            _context = context;
        }
        [HttpGet("lay_hoc_ky")]
        public IActionResult GetHocKy()
        {
            var hocKyList = _context.HocKies.ToList();
            return Ok(hocKyList);
        }
        [HttpPost("tao_hoc_ky")]
        public IActionResult CreateHocKy([FromBody] HocKy hocKy)
        {
            if (hocKy == null)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }
            try
            {
                _context.HocKies.Add(hocKy);
                _context.SaveChanges();
                return CreatedAtAction(nameof(GetHocKy), new { id = hocKy.MaHocKy }, hocKy);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi thêm học kỳ: {ex.Message}");
            }
        }
    }
}
