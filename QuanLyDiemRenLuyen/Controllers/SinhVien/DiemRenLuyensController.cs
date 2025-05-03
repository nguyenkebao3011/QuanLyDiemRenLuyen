using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DiemRenLuyensController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public DiemRenLuyensController(QlDrlContext context)
        {
            _context = context;
        }

        
       

       
        [HttpGet("xem-diem-theo-tung-hoc-ky")]
        public async Task<IActionResult> XemDiemRenLuyenTheoMaHocKy([FromQuery] int maHocKy)
        {
            try
            {
                // Lấy MaSV từ token
                var maSV = User.Identity.Name;
                if (string.IsNullOrEmpty(maSV))
                {
                    return Unauthorized(new { message = "Không tìm thấy mã sinh viên trong token" });
                }

                // Kiểm tra xem sinh viên có tồn tại không
                var sinhVien = await _context.SinhViens.AnyAsync(s => s.MaSV == maSV);
                if (!sinhVien)
                {
                    return BadRequest(new { message = "Sinh viên không tồn tại" });
                }

                // Kiểm tra học kỳ tồn tại
                var hocKy = await _context.HocKies
                    .Where(hk => hk.MaHocKy == maHocKy)
                    .Select(hk => new { hk.MaHocKy, hk.TenHocKy })
                    .FirstOrDefaultAsync();
                if (hocKy == null)
                {
                    return BadRequest(new { message = "Học kỳ không tồn tại" });
                }

                // Lấy điểm rèn luyện của sinh viên trong học kỳ đã chọn
                var diemRenLuyen = await _context.DiemRenLuyens
                    .Where(d => d.MaSv == maSV && d.MaHocKy == maHocKy)
                    .Select(d => new
                    {
                        d.MaHocKy,
                        hocKy.TenHocKy,
                        d.TongDiem,
                        d.XepLoai,
                        NgayChot = d.NgayChot.HasValue ? d.NgayChot.Value.ToString("yyyy-MM-dd") : null,
                        d.TrangThai
                    })
                    .FirstOrDefaultAsync();

                if (diemRenLuyen == null)
                {
                    return Ok(new
                    {
                        message = $"Chưa có điểm rèn luyện cho học kỳ {hocKy.TenHocKy}",
                        data = new
                        {
                            hocKy.MaHocKy,
                            hocKy.TenHocKy,
                            XepLoai = "Chưa đánh giá",
                            NgayChot = (string)null,
                            TrangThai = "Chưa chốt"
                        }
                    });
                }

                return Ok(new
                {
                    message = "Lấy điểm rèn luyện thành công",
                    data = diemRenLuyen
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy điểm rèn luyện", error = ex.Message });
            }
        }
        [HttpGet("xem-diem-tat-ca-hoc-ky")]
        public async Task<IActionResult> XemDiemRenLuyenTatCaHocKy()
        {
            try
            {
                // Lấy MaSV từ token
                var maSV = User.Identity.Name;
                if (string.IsNullOrEmpty(maSV))
                {
                    return Unauthorized(new { message = "Không tìm thấy mã sinh viên trong token" });
                }

                // Kiểm tra xem sinh viên có tồn tại không
                var sinhVien = await _context.SinhViens.AnyAsync(s => s.MaSV == maSV);
                if (!sinhVien)
                {
                    return BadRequest(new { message = "Sinh viên không tồn tại" });
                }

                // Lấy danh sách điểm rèn luyện của sinh viên qua tất cả học kỳ
                var diemRenLuyenList = await _context.DiemRenLuyens
                    .Where(d => d.MaSv == maSV)
                    .Join(_context.HocKies,
                        diem => diem.MaHocKy,
                        hocKy => hocKy.MaHocKy,
                        (diem, hocKy) => new
                        {
                            diem.MaHocKy,
                            hocKy.TenHocKy,
                            diem.TongDiem,
                            diem.XepLoai,
                            NgayChot = diem.NgayChot.HasValue ? diem.NgayChot.Value.ToString("yyyy-MM-dd") : null,
                            diem.TrangThai
                        })
                    .ToListAsync();

                // Nếu không có điểm rèn luyện
                if (!diemRenLuyenList.Any())
                {
                    return Ok(new
                    {
                        message = "Chưa có điểm rèn luyện cho bất kỳ học kỳ nào",
                        data = new List<object>()
                    });
                }

                return Ok(new
                {
                    message = "Lấy danh sách điểm rèn luyện thành công",
                    data = diemRenLuyenList
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách điểm rèn luyện", error = ex.Message });
            }
        }
        // PUT: api/DiemRenLuyens/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDiemRenLuyen(int id, DiemRenLuyen diemRenLuyen)
        {
            if (id != diemRenLuyen.MaDiemRenLuyen)
            {
                return BadRequest();
            }

            _context.Entry(diemRenLuyen).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DiemRenLuyenExists(id))
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

        // POST: api/DiemRenLuyens
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DiemRenLuyen>> PostDiemRenLuyen(DiemRenLuyen diemRenLuyen)
        {
            _context.DiemRenLuyens.Add(diemRenLuyen);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDiemRenLuyen", new { id = diemRenLuyen.MaDiemRenLuyen }, diemRenLuyen);
        }

        // DELETE: api/DiemRenLuyens/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiemRenLuyen(int id)
        {
            var diemRenLuyen = await _context.DiemRenLuyens.FindAsync(id);
            if (diemRenLuyen == null)
            {
                return NotFound();
            }

            _context.DiemRenLuyens.Remove(diemRenLuyen);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DiemRenLuyenExists(int id)
        {
            return _context.DiemRenLuyens.Any(e => e.MaDiemRenLuyen == id);
        }
    }
}
