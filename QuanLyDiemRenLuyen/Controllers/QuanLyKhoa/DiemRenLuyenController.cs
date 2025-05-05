using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using QuanLyDiemRenLuyen.Models.DTOs;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiemRenLuyenController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public DiemRenLuyenController(QlDrlContext context)
        {
            _context = context;
        }

        // GET: api/DiemRenLuyen/lay_danh_sach
        [HttpGet("lay_danh_sach")]
        public async Task<ActionResult<IEnumerable<DiemRenLuyenDTO>>> LayDanhSachDiemRenLuyen()
        {
            try
            {
                var diemRenLuyens = await _context.DiemRenLuyens
                    .Include(d => d.MaHocKyNavigation)
                    .Include(d => d.MaSvNavigation)
                    .OrderByDescending(d => d.NgayChot)
                    .Select(d => new DiemRenLuyenDTO
                    {
                        MaDiemRenLuyen = d.MaDiemRenLuyen,
                        MaSv = d.MaSv,
                        TenSinhVien = d.MaSvNavigation != null ? d.MaSvNavigation.HoTen : null,
                        MaHocKy = d.MaHocKy,
                        HocKy = d.MaHocKyNavigation != null ? d.MaHocKyNavigation.TenHocKy : null,
                        TongDiem = d.TongDiem,
                        XepLoai = d.XepLoai,
                        NgayChot = d.NgayChot,
                        TrangThai = d.TrangThai
                    })
                    .ToListAsync();

                return Ok(diemRenLuyens);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/DiemRenLuyen/lay_chi_tiet/{id}
        [HttpGet("lay_chi_tiet/{id}")]
        public async Task<ActionResult<DiemRenLuyenDTO>> LayChiTietDiemRenLuyen(int id)
        {
            try
            {
                var diemRenLuyen = await _context.DiemRenLuyens
                    .Include(d => d.MaHocKyNavigation)
                    .Include(d => d.MaSvNavigation)
                    .FirstOrDefaultAsync(d => d.MaDiemRenLuyen == id);

                if (diemRenLuyen == null)
                {
                    return NotFound($"Không tìm thấy điểm rèn luyện có mã {id}");
                }

                var result = new DiemRenLuyenDTO
                {
                    MaDiemRenLuyen = diemRenLuyen.MaDiemRenLuyen,
                    MaSv = diemRenLuyen.MaSv,
                    TenSinhVien = diemRenLuyen.MaSvNavigation?.HoTen,
                    MaHocKy = diemRenLuyen.MaHocKy,
                    HocKy = diemRenLuyen.MaHocKyNavigation?.TenHocKy,
                    TongDiem = diemRenLuyen.TongDiem,
                    XepLoai = diemRenLuyen.XepLoai,
                    NgayChot = diemRenLuyen.NgayChot,
                    TrangThai = diemRenLuyen.TrangThai
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // POST: api/DiemRenLuyen/tao_diem_ren_luyen
        [HttpPost("tao_diem_ren_luyen")]
        public async Task<ActionResult> TaoDiemRenLuyen([FromBody] TaoDiemRenLuyenRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.MaSv))
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            try
            {
                var diemRenLuyen = new DiemRenLuyen
                {
                    MaSv = request.MaSv,
                    MaHocKy = request.MaHocKy,
                    TongDiem = request.TongDiem,
                    XepLoai = request.XepLoai,
                    NgayChot = DateTime.Now,
                    TrangThai = "Chưa duyệt"
                };

                _context.DiemRenLuyens.Add(diemRenLuyen);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(LayChiTietDiemRenLuyen), new { id = diemRenLuyen.MaDiemRenLuyen }, diemRenLuyen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // PUT: api/DiemRenLuyen/cap_nhat_diem_ren_luyen/{id}
        [HttpPut("cap_nhat_diem_ren_luyen/{id}")]
        public async Task<ActionResult> CapNhatDiemRenLuyen(int id, [FromBody] CapNhatDiemRenLuyenRequest request)
        {
            if (request == null)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            try
            {
                var diemRenLuyen = await _context.DiemRenLuyens.FindAsync(id);
                if (diemRenLuyen == null)
                {
                    return NotFound($"Không tìm thấy điểm rèn luyện có mã {id}");
                }

                diemRenLuyen.TongDiem = request.TongDiem ?? diemRenLuyen.TongDiem;
                diemRenLuyen.XepLoai = request.XepLoai ?? diemRenLuyen.XepLoai;
                diemRenLuyen.TrangThai = request.TrangThai ?? diemRenLuyen.TrangThai;

                _context.DiemRenLuyens.Update(diemRenLuyen);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // DELETE: api/DiemRenLuyen/xoa_diem_ren_luyen/{id}
        [HttpDelete("xoa_diem_ren_luyen/{id}")]
        public async Task<ActionResult> XoaDiemRenLuyen(int id)
        {
            try
            {
                var diemRenLuyen = await _context.DiemRenLuyens.FindAsync(id);
                if (diemRenLuyen == null)
                {
                    return NotFound($"Không tìm thấy điểm rèn luyện có mã {id}");
                }

                _context.DiemRenLuyens.Remove(diemRenLuyen);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
    }

    // các request và response
    
    public class TaoDiemRenLuyenRequest
    {
        public string MaSv { get; set; }
        public int? MaHocKy { get; set; }
        public double? TongDiem { get; set; }
        public string? XepLoai { get; set; }
    }

    public class CapNhatDiemRenLuyenRequest
    {
        public double? TongDiem { get; set; }
        public string? XepLoai { get; set; }
        public string? TrangThai { get; set; }
    }
}