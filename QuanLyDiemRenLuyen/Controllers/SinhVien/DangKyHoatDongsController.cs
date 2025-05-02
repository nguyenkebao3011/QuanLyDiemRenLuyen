using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DangKyHoatDongsController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public DangKyHoatDongsController(QlDrlContext context)
        {
            _context = context;
        }



        [HttpPost("dang-ky")]
        public async Task<IActionResult> DangKyHoatDong([FromBody] DangKyHoatDongDTO request)
        {
            try
            {
                // Lấy MaSV từ token
                var maSV = User.Identity.Name;
                if (string.IsNullOrEmpty(maSV))
                {
                    return Unauthorized(new { message = "Không tìm thấy mã sinh viên trong token" });
                }

                // Kiểm tra dữ liệu đầu vào
                if (request.MaHoatDong == null)
                {
                    return BadRequest(new { message = "Mã hoạt động không được để trống" });
                }

                // Kiểm tra xem sinh viên có tồn tại không
                var sinhVien = await _context.SinhViens.AnyAsync(s => s.MaSV == maSV);
                if (!sinhVien)
                {
                    return BadRequest(new { message = "Sinh viên không tồn tại" });
                }

                // Kiểm tra hoạt động
                var hoatDong = await _context.HoatDongs
                    .FirstOrDefaultAsync(h => h.MaHoatDong == request.MaHoatDong);
                if (hoatDong == null)
                {
                    return BadRequest(new { message = "Hoạt động không tồn tại" });
                }

                // Kiểm tra số lượng đăng ký
                if (hoatDong.SoLuongToiDa.HasValue)
                {
                    if (hoatDong.SoLuongDaDangKy >= hoatDong.SoLuongToiDa.Value)
                    {
                        return BadRequest(new { message = "Hoạt động đã đủ số lượng sinh viên đăng ký" });
                    }
                }

                // Kiểm tra xem sinh viên đã đăng ký hoạt động này chưa
                var daDangKy = await _context.DangKyHoatDongs
                    .AnyAsync(d => d.MaSv == maSV && d.MaHoatDong == request.MaHoatDong);
                if (daDangKy)
                {
                    return BadRequest(new { message = "Sinh viên đã đăng ký hoạt động này rồi" });
                }

                // Kiểm tra xung đột ngày và giờ với các hoạt động đã đăng ký
                if (!hoatDong.NgayBatDau.HasValue || !hoatDong.NgayKetThuc.HasValue)
                {
                    return BadRequest(new { message = "Hoạt động không có ngày bắt đầu hoặc kết thúc hợp lệ" });
                }

                // Kiểm tra xem hoạt động có cùng ngày không
                var ngayBatDauMoi = hoatDong.NgayBatDau.Value.Date;
                var ngayKetThucMoi = hoatDong.NgayKetThuc.Value.Date;
                if (ngayBatDauMoi != ngayKetThucMoi)
                {
                    return BadRequest(new { message = "Hoạt động không diễn ra trong cùng một ngày" });
                }

                // Lấy thời gian diễn ra từ NgayBatDau và NgayKetThuc
                var startTimeNew = hoatDong.NgayBatDau.Value.TimeOfDay;
                var endTimeNew = hoatDong.NgayKetThuc.Value.TimeOfDay;

                if (startTimeNew > endTimeNew)
                {
                    return BadRequest(new { message = "Thời gian bắt đầu phải trước thời gian kết thúc" });
                }

                // Lấy danh sách hoạt động đã đăng ký vào bộ nhớ
                var dangKyHoatDongs = await _context.DangKyHoatDongs
                    .Where(d => d.MaSv == maSV && d.TrangThai == "Đăng ký thành công")
                    .Join(_context.HoatDongs,
                        dk => dk.MaHoatDong,
                        hd => hd.MaHoatDong,
                        (dk, hd) => new { dk, hd })
                    .Where(x => x.hd.NgayBatDau.HasValue && x.hd.NgayKetThuc.HasValue)
                    .Select(x => new
                    {
                        x.hd.MaHoatDong,
                        NgayBatDau = x.hd.NgayBatDau.Value,
                        NgayKetThuc = x.hd.NgayKetThuc.Value
                    })
                    .ToListAsync();

                // Kiểm tra xung đột lịch trong bộ nhớ
                bool xungDotLich = dangKyHoatDongs.Any(x =>
                {
                    // Kiểm tra cùng ngày
                    if (x.NgayBatDau.Date != ngayBatDauMoi) return false;
                    if (x.NgayBatDau.Date != x.NgayKetThuc.Date) return false; // Bỏ qua nếu hoạt động đã đăng ký không cùng ngày

                    // Lấy thời gian diễn ra của hoạt động đã đăng ký
                    var startTimeExisting = x.NgayBatDau.TimeOfDay;
                    var endTimeExisting = x.NgayKetThuc.TimeOfDay;

                    // Kiểm tra chồng lấn
                    return startTimeNew <= endTimeExisting &&
                           endTimeNew >= startTimeExisting &&
                           x.MaHoatDong != request.MaHoatDong;
                });

                if (xungDotLich)
                {
                    return BadRequest(new { message = "Sinh viên đã đăng ký một hoạt động khác có khung giờ chồng lấn cùng ngày" });
                }

                // Tạo bản ghi đăng ký mới
                var dangKy = new DangKyHoatDong
                {
                    MaSv = maSV,
                    MaHoatDong = request.MaHoatDong,
                    NgayDangKy = DateTime.Now,
                    TrangThai = "Đăng ký thành công"
                };

                // Thêm vào database
                _context.DangKyHoatDongs.Add(dangKy);
                hoatDong.SoLuongDaDangKy = (hoatDong.SoLuongDaDangKy ?? 0) + 1;
                await _context.SaveChangesAsync();

                // Trả về dữ liệu không chứa navigation properties
                return Ok(new
                {
                    message = "Đăng ký hoạt động thành công",
                    data = new
                    {
                        dangKy.MaDangKy,
                        dangKy.MaSv,
                        dangKy.MaHoatDong,
                        NgayDangKy = dangKy.NgayDangKy.HasValue ? dangKy.NgayDangKy.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                        dangKy.TrangThai,
                    }
                });
            }
            catch (Exception ex)
            {
                // Ghi log chi tiết để dễ debug
                Console.WriteLine($"Lỗi khi đăng ký: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi đăng ký", error = ex.Message });
            }
        }
        
        [HttpGet("danh-sach-dang-ky")]
        public async Task<IActionResult> XemDanhSachDangKyHoatDong()
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

                // Lấy danh sách đăng ký hoạt động của sinh viên
                var danhSachDangKy = await _context.DangKyHoatDongs
                    .Where(d => d.MaSv == maSV)
                    .Join(_context.HoatDongs,
                        dangKy => dangKy.MaHoatDong,
                        hoatDong => hoatDong.MaHoatDong,
                        (dangKy, hoatDong) => new
                        {
                            dangKy.MaHoatDong,
                            hoatDong.TenHoatDong,
                            NgayBatDau = hoatDong.NgayBatDau.HasValue ? hoatDong.NgayBatDau.Value.ToString("yyyy-MM-dd") : null,
                            hoatDong.MoTa,
                            diaDiem = hoatDong.DiaDiem,
                            diemCong = hoatDong.DiemCong,
                            soLuong = hoatDong.SoLuongToiDa,
                            TrangThaiHoatDong = hoatDong.TrangThai,
                            NgayDangKy = dangKy.NgayDangKy.HasValue ? dangKy.NgayDangKy.Value.ToString("yyyy-MM-dd HH:mm:ss") : null
                        })
                    .ToListAsync();

                if (!danhSachDangKy.Any())
                {
                    return Ok(new { message = "Sinh viên chưa đăng ký hoạt động nào", data = new object[] { } });
                }

                return Ok(new { message = "Lấy danh sách đăng ký thành công", data = danhSachDangKy });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách đăng ký", error = ex.Message });
            }
        
        }
        [HttpDelete("huy-dangky")]
        public async Task<IActionResult> HuyDangKyHoatDong([FromBody] DangKyHoatDongDTO request)
        {
            try
            {
                // Lấy MaSV từ token
                var maSV = User.Identity.Name;
                if (string.IsNullOrEmpty(maSV))
                {
                    return Unauthorized(new { message = "Không tìm thấy mã sinh viên trong token" });
                }

                // Kiểm tra dữ liệu đầu vào
                if (request.MaHoatDong == null)
                {
                    return BadRequest(new { message = "Mã hoạt động không được để trống" });
                }

                // Kiểm tra hoạt động
                var hoatDong = await _context.HoatDongs
                    .FirstOrDefaultAsync(h => h.MaHoatDong == request.MaHoatDong);
                if (hoatDong == null)
                {
                    return BadRequest(new { message = "Hoạt động không tồn tại" });
                }

                // Kiểm tra trạng thái hoạt động
                if (hoatDong.TrangThai != "Chưa bắt đầu")
                {
                    return BadRequest(new { message = "Chỉ có thể hủy đăng ký các hoạt động chưa bắt đầu" });
                }

                // Kiểm tra thời gian hủy (cách NgayBatDau ít nhất 3 ngày)
                if (!hoatDong.NgayBatDau.HasValue)
                {
                    return BadRequest(new { message = "Hoạt động không có ngày bắt đầu hợp lệ" });
                }

                var ngayHienTai = DateTime.Now;
                var thoiGianToiThieu = ngayHienTai.AddDays(3);
                if (hoatDong.NgayBatDau < thoiGianToiThieu)
                {
                    return BadRequest(new { message = "Không thể hủy đăng ký vì thời gian bắt đầu hoạt động đã quá gần (ít hơn 3 ngày)" });
                }

                // Tìm bản ghi đăng ký
                var dangKy = await _context.DangKyHoatDongs
                    .FirstOrDefaultAsync(d => d.MaSv == maSV && d.MaHoatDong == request.MaHoatDong);
                if (dangKy == null)
                {
                    return BadRequest(new { message = "Sinh viên chưa đăng ký hoạt động này" });
                }

                // Xóa bản ghi đăng ký
                _context.DangKyHoatDongs.Remove(dangKy);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Hủy đăng ký hoạt động thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi hủy đăng ký", error = ex.Message });
            }
        }
        // GET: api/DangKyHoatDongs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DangKyHoatDong>>> GetDangKyHoatDongs()
        {
            return await _context.DangKyHoatDongs.ToListAsync();
        }

        // GET: api/DangKyHoatDongs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DangKyHoatDong>> GetDangKyHoatDong(int id)
        {
            var dangKyHoatDong = await _context.DangKyHoatDongs.FindAsync(id);

            if (dangKyHoatDong == null)
            {
                return NotFound();
            }

            return dangKyHoatDong;
        }

        // PUT: api/DangKyHoatDongs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDangKyHoatDong(int id, DangKyHoatDong dangKyHoatDong)
        {
            if (id != dangKyHoatDong.MaDangKy)
            {
                return BadRequest();
            }

            _context.Entry(dangKyHoatDong).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DangKyHoatDongExists(id))
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

        // POST: api/DangKyHoatDongs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DangKyHoatDong>> PostDangKyHoatDong(DangKyHoatDong dangKyHoatDong)
        {
            _context.DangKyHoatDongs.Add(dangKyHoatDong);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDangKyHoatDong", new { id = dangKyHoatDong.MaDangKy }, dangKyHoatDong);
        }

        // DELETE: api/DangKyHoatDongs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDangKyHoatDong(int id)
        {
            var dangKyHoatDong = await _context.DangKyHoatDongs.FindAsync(id);
            if (dangKyHoatDong == null)
            {
                return NotFound();
            }

            _context.DangKyHoatDongs.Remove(dangKyHoatDong);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DangKyHoatDongExists(int id)
        {
            return _context.DangKyHoatDongs.Any(e => e.MaDangKy == id);
        }
    }
}
