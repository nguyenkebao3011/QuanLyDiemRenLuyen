using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.QuanLyKhoa;
using QuanLyDiemRenLuyen.Models;
using System.Linq;
using System.Threading.Tasks;
  
namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class LopController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public LopController(QlDrlContext context)
        {
            _context = context;
        }

        // Lấy danh sách lớp
        [HttpGet("lay_danh_sach_lop")]
        public async Task<ActionResult<IEnumerable<LopDTO>>> GetLopList()
        {
            var list = await _context.Lops
                .Select(lop => new LopDTO
                {
                    MaLop = lop.MaLop,
                    TenLop = lop.TenLop,
                    NienKhoa = lop.NienKhoa,
                    MaGv = lop.MaGv
                }).ToListAsync();

            return Ok(list);
        }

        // Lấy chi tiết lớp
        [HttpGet("lay_chi_tiet_lop/{id}")]
        public async Task<ActionResult<LopDTO>> GetLop(string id)
        {
            var lop = await _context.Lops.FindAsync(id);
            if (lop == null)
                return NotFound(new { message = "Không tìm thấy lớp" });

            return Ok(new LopDTO
            {
                MaLop = lop.MaLop,
                TenLop = lop.TenLop,
                NienKhoa = lop.NienKhoa,
                MaGv = lop.MaGv
            });
        }

        // Thêm lớp mới
        [HttpPost("them_lop")]
        public async Task<ActionResult<LopDTO>> CreateLop([FromBody] LopDTO dto)
        {
            // Kiểm tra mã lớp đã tồn tại chưa
            if (await _context.Lops.AnyAsync(l => l.MaLop == dto.MaLop))
                return Conflict(new { message = "Mã lớp đã tồn tại" });

            var lop = new Lop
            {
                MaLop = dto.MaLop,
                TenLop = dto.TenLop,
                NienKhoa = dto.NienKhoa,
                MaGv = dto.MaGv
            };

            _context.Lops.Add(lop);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLop), new { id = lop.MaLop }, dto);
        }

        // Sửa lớp
        [HttpPut("cap_nhat_lop/{id}")]
        public async Task<IActionResult> UpdateLop(string id, [FromBody] LopDTO dto)
        {
            if (id != dto.MaLop)
                return BadRequest(new { message = "Mã lớp không khớp" });

            var lop = await _context.Lops.FindAsync(id);
            if (lop == null)
                return NotFound(new { message = "Không tìm thấy lớp" });

            lop.TenLop = dto.TenLop;
            lop.NienKhoa = dto.NienKhoa;
            lop.MaGv = dto.MaGv;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật lớp thành công" });
        }

        // Xóa lớp
        [HttpDelete("xoa_lop/{id}")]
        public async Task<IActionResult> DeleteLop(string id)
        {
            var lop = await _context.Lops.Include(l => l.SinhViens).FirstOrDefaultAsync(l => l.MaLop == id);
            if (lop == null)
                return NotFound(new { message = "Không tìm thấy lớp" });

            if (lop.SinhViens.Any())
                return BadRequest(new { message = "Không thể xóa lớp có sinh viên" });

            _context.Lops.Remove(lop);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa lớp thành công" });
        }

     
    }
}