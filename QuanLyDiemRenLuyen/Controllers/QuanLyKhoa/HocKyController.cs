using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.QuanLyKhoa;
using QuanLyDiemRenLuyen.Models;
using System.Threading.Tasks;

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

        // Lấy danh sách học kỳ
        [HttpGet("lay_hoc_ky")]
        public async Task<IActionResult> GetHocKy()
        {
            var hocKyList = await _context.HocKies.ToListAsync();
            return Ok(hocKyList);
        }

        // Lấy chi tiết học kỳ theo mã học kỳ
        [HttpGet("lay_chi_tiet_hoc_ky/{id}")]
        public async Task<IActionResult> GetHocKyById(int id)
        {
            var hocKy = await _context.HocKies.FindAsync(id);
            if (hocKy == null)
                return NotFound(new { message = "Không tìm thấy học kỳ" });

            return Ok(hocKy);
        }

        // Tạo học kỳ mới
        [HttpPost("tao_hoc_ky")]
        public async Task<IActionResult> CreateHocKy([FromBody] HocKyDTO dto)
        {
            if (dto == null)
                return BadRequest("Dữ liệu không hợp lệ.");

            var hocKy = new HocKy
            {
                TenHocKy = dto.TenHocKy,
                NamHoc = dto.NamHoc,
                NgayBatDau = dto.NgayBatDau,
                NgayKetThuc = dto.NgayKetThuc
            };

            _context.HocKies.Add(hocKy);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHocKyById), new { id = hocKy.MaHocKy }, hocKy);
        }

        // Cập nhật học kỳ
        [HttpPut("cap_nhat_hoc_ky/{id}")]
        public async Task<IActionResult> UpdateHocKy(int id, [FromBody] HocKyDTO dto)
        {
            if (id != dto.MaHocKy)
                return BadRequest(new { message = "Mã học kỳ không khớp" });

            var existingHocKy = await _context.HocKies.FindAsync(id);
            if (existingHocKy == null)
                return NotFound(new { message = "Không tìm thấy học kỳ" });

            existingHocKy.TenHocKy = dto.TenHocKy;
            existingHocKy.NamHoc = dto.NamHoc;
            existingHocKy.NgayBatDau = dto.NgayBatDau;
            existingHocKy.NgayKetThuc = dto.NgayKetThuc;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật học kỳ thành công" });
        }

        // Xóa học kỳ
        [HttpDelete("xoa_hoc_ky/{id}")]
        public async Task<IActionResult> DeleteHocKy(int id)
        {
            var hocKy = await _context.HocKies.FindAsync(id);
            if (hocKy == null)
                return NotFound(new { message = "Không tìm thấy học kỳ" });

            _context.HocKies.Remove(hocKy);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa học kỳ thành công" });
        }
    }
}
