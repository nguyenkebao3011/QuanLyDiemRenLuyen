using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.QuanLyKhoa;
using QuanLyDiemRenLuyen.Models;
using QuanLyDiemRenLuyen.Models.DTOs;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhanHoiDiemRenLuyenController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public PhanHoiDiemRenLuyenController(QlDrlContext context)
        {
            _context = context;
        }

        // GET: api/PhanHoiDiemRenLuyen/lay_danh_sach
        [HttpGet("lay_danh_sach")]
        public async Task<ActionResult<IEnumerable<PhanHoiDiemRenLuyenDTO>>> LayDanhSachPhanHoi()
        {
            try
            {
                var phanHois = await _context.PhanHoiDiemRenLuyens
                    .Include(p => p.MaDiemRenLuyenNavigation)
                    .ThenInclude(drl => drl.MaSvNavigation) // Ensure proper inclusion
                    .Include(p => p.MaMinhChungNavigation)
                    .OrderByDescending(p => p.NgayPhanHoi)
                    .Select(p => new PhanHoiDiemRenLuyenDTO
                    {
                        MaPhanHoi = p.MaPhanHoi,
                        MaDiemRenLuyen = p.MaDiemRenLuyen,
                        MaMinhChung = p.MaMinhChung,
                        NoiDungPhanHoi = p.NoiDungPhanHoi,
                        NgayPhanHoi = p.NgayPhanHoi,
                        TrangThai = p.TrangThai,
                        MaQl = p.MaQl,
                        NoiDungXuLy = p.NoiDungXuLy,
                        NgayXuLy = p.NgayXuLy,
                        TenSinhVien = p.MaDiemRenLuyenNavigation != null && p.MaDiemRenLuyenNavigation.MaSvNavigation != null
                            ? p.MaDiemRenLuyenNavigation.MaSvNavigation.HoTen
                            : null,
                        Lop = p.MaDiemRenLuyenNavigation != null && p.MaDiemRenLuyenNavigation.MaSvNavigation != null
                            ? p.MaDiemRenLuyenNavigation.MaSvNavigation.MaLop
                            : null 
                    })
                    .ToListAsync();

                return Ok(phanHois);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/PhanHoiDiemRenLuyen/lay_chi_tiet/{id}
        [HttpGet("lay_chi_tiet/{id}")]
        public async Task<ActionResult<PhanHoiDiemRenLuyenDTO>> LayChiTietPhanHoi(int id)
        {
            try
            {
                var phanHoi = await _context.PhanHoiDiemRenLuyens
                    .Include(p => p.MaDiemRenLuyenNavigation)
                    .Include(p => p.MaMinhChungNavigation)
                    .Include(p => p.MaDiemRenLuyenNavigation.MaSvNavigation)
                    .FirstOrDefaultAsync(p => p.MaPhanHoi == id);

                if (phanHoi == null)
                {
                    return NotFound($"Không tìm thấy phản hồi có mã {id}");
                }

                var result = new PhanHoiDiemRenLuyenDTO
                {
                    MaPhanHoi = phanHoi.MaPhanHoi,
                    MaDiemRenLuyen = phanHoi.MaDiemRenLuyen,
                    MaMinhChung = phanHoi.MaMinhChung,
                    NoiDungPhanHoi = phanHoi.NoiDungPhanHoi,
                    NgayPhanHoi = phanHoi.NgayPhanHoi,
                    TrangThai = phanHoi.TrangThai,
                    MaQl = phanHoi.MaQl,
                    NoiDungXuLy = phanHoi.NoiDungXuLy,
                    NgayXuLy = phanHoi.NgayXuLy,
                    TenSinhVien = phanHoi.MaDiemRenLuyenNavigation.MaSvNavigation?.HoTen,
                    Lop = phanHoi.MaDiemRenLuyenNavigation.MaSvNavigation?.MaLop
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // PUT: api/PhanHoiDiemRenLuyen/cap_nhat_xu_ly/{id}
        [HttpPut("cap_nhat_xu_ly/{id}")]
        public async Task<ActionResult> CapNhatXuLyPhanHoi(int id, [FromBody] CapNhatXuLyRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.NoiDungXuLy))
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            try
            {
                var phanHoi = await _context.PhanHoiDiemRenLuyens.FindAsync(id);
                if (phanHoi == null)
                {
                    return NotFound($"Không tìm thấy phản hồi có mã {id}");
                }

                phanHoi.NoiDungXuLy = request.NoiDungXuLy;
                phanHoi.NgayXuLy = DateTime.Now;
                phanHoi.TrangThai = "Đã xử lý";
                phanHoi.MaQl = request.MaQl;

                _context.PhanHoiDiemRenLuyens.Update(phanHoi);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // DELETE: api/PhanHoiDiemRenLuyen/xoa_phan_hoi/{id}
        [HttpDelete("xoa_phan_hoi/{id}")]
        public async Task<ActionResult> XoaPhanHoi(int id)
        {
            try
            {
                var phanHoi = await _context.PhanHoiDiemRenLuyens.FindAsync(id);
                if (phanHoi == null)
                {
                    return NotFound($"Không tìm thấy phản hồi có mã {id}");
                }

                _context.PhanHoiDiemRenLuyens.Remove(phanHoi);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
    }

    //  các request và response
  

    public class TaoPhanHoiRequest
    {
        public int? MaDiemRenLuyen { get; set; }
        public int? MaMinhChung { get; set; }
        public string NoiDungPhanHoi { get; set; }
    }

    public class CapNhatXuLyRequest
    {
        public string NoiDungXuLy { get; set; }
        public string? MaQl { get; set; }
    }
}