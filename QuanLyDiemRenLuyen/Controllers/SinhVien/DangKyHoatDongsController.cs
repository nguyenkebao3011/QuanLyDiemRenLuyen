using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
        private readonly ILogger<DangKyHoatDongsController> _logger;

        public DangKyHoatDongsController(QlDrlContext context, ILogger<DangKyHoatDongsController> logger)
        {
            _context = context;
            _logger = logger;
        }



        [HttpPost("dang-ky")]
        public async Task<IActionResult> DangKyHoatDong([FromBody] DangKyHoatDongDTO request)
        {
            try
            {
                // Lấy MaSV từ token
                var maSV = User.Identity?.Name;
                if (string.IsNullOrEmpty(maSV))
                {
                    return Unauthorized(new { message = "Không tìm thấy mã sinh viên trong token" });
                }

                // Kiểm tra sinh viên tồn tại
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

                if (hoatDong.TrangThai != "Chưa bắt đầu" && hoatDong.TrangThai != "Đang mở đăng ký")
                {
                    return BadRequest(new { message = "Chỉ có thể đăng ký các hoạt động chưa bắt đầu hoặc đang mở đăng ký" });
                }

                // Kiểm tra số lượng tối đa
                if (hoatDong.SoLuongToiDa.HasValue && hoatDong.SoLuongDaDangKy >= hoatDong.SoLuongToiDa)
                {
                    return BadRequest(new { message = "Hoạt động đã đủ số lượng đăng ký" });
                }

                // Kiểm tra đã đăng ký chưa
                var daDangKy = await _context.DangKyHoatDongs
                    .AnyAsync(d => d.MaSv == maSV && d.MaHoatDong == request.MaHoatDong);
                if (daDangKy)
                {
                    return BadRequest(new { message = "Sinh viên đã đăng ký hoạt động này" });
                }

                // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    // Thêm bản ghi đăng ký
                    var dangKy = new DangKyHoatDong
                    {
                        MaSv = maSV,
                        MaHoatDong = request.MaHoatDong,
                        NgayDangKy = DateTime.Now,
                        TrangThai = "Đăng ký thành công"
                    };
                    _context.DangKyHoatDongs.Add(dangKy);

                    // Tăng SoLuongDaDangKy
                    hoatDong.SoLuongDaDangKy += 1;

                    // Lưu thay đổi
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }

                return Ok(new { message = "Đăng ký hoạt động thành công" });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Lỗi cơ sở dữ liệu khi đăng ký hoạt động cho MaSV: {MaSV}, MaHoatDong: {MaHoatDong}", User.Identity?.Name, request.MaHoatDong);
                return StatusCode(500, new { message = "Lỗi cơ sở dữ liệu, vui lòng thử lại sau", error = dbEx.InnerException?.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đăng ký hoạt động cho MaSV: {MaSV}, MaHoatDong: {MaHoatDong}", User.Identity?.Name, request.MaHoatDong);
                return StatusCode(500, new { message = "Có lỗi xảy ra, vui lòng thử lại sau", error = ex.Message });
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
        public async Task<IActionResult> HuyDangKyHoatDong([FromBody] HuyDangKyDTO request)
        {
            try
            {
                // Lấy MaSV từ token
                var maSV = User.Identity?.Name;
                if (string.IsNullOrEmpty(maSV))
                {
                    return Unauthorized(new { message = "Không tìm thấy mã sinh viên trong token" });
                }

                // Kiểm tra LyDoHuy
                if (!string.IsNullOrEmpty(request.LyDoHuy))
                {
                    var lyDoHuy = request.LyDoHuy.Trim();
                    if (lyDoHuy.Length == 0 || lyDoHuy.ToLower() == "string")
                    {
                        return BadRequest(new { message = "Lý do hủy không hợp lệ, vui lòng cung cấp lý do cụ thể" });
                    }
                }

                // Kiểm tra số lần hủy trong 10 ngày
                var ngayHienTai = DateTime.Now;
                var ngayBatDau = ngayHienTai.AddDays(-10);
                var soLanHuy = await _context.LichSuHuyDangKys
                    .CountAsync(h => h.MaSv == maSV && h.ThoiGianHuy >= ngayBatDau && h.ThoiGianHuy <= ngayHienTai);
                if (soLanHuy >= 3)
                {
                    return BadRequest(new { message = "Bạn đã hủy đăng ký quá 3 lần trong 10 ngày, không thể hủy thêm" });
                }

                // Kiểm tra hoạt động
                var hoatDong = await _context.HoatDongs
                    .FirstOrDefaultAsync(h => h.MaHoatDong == request.MaHoatDong);
                if (hoatDong == null)
                {
                    return BadRequest(new { message = "Hoạt động không tồn tại" });
                }

                if (hoatDong.TrangThai != "Chưa bắt đầu" && hoatDong.TrangThai != "Đang mở đăng ký")
                {
                    return BadRequest(new { message = "Chỉ có thể hủy đăng ký các hoạt động chưa bắt đầu hoặc đang mở đăng ký" });
                }

                // Kiểm tra thời gian hủy (cách NgayBatDau ít nhất 3 ngày)
                if (!hoatDong.NgayBatDau.HasValue)
                {
                    return BadRequest(new { message = "Hoạt động không có ngày bắt đầu hợp lệ" });
                }

                var thoiGianToiThieu = ngayHienTai.AddDays(3);
                if (hoatDong.NgayBatDau < thoiGianToiThieu)
                {
                    return BadRequest(new { message = "Bạn không thể hủy đăng ký vì thời gian bắt đầu hoạt động đã quá gần (ít hơn 3 ngày)" });
                }

                // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    // Tìm bản ghi đăng ký
                    var dangKy = await _context.DangKyHoatDongs
                        .FirstOrDefaultAsync(d => d.MaSv == maSV && d.MaHoatDong == request.MaHoatDong);
                    if (dangKy == null)
                    {
                        return BadRequest(new { message = "Sinh viên chưa đăng ký hoạt động này" });
                    }

                    // Giảm SoLuongDaDangKy
                    if (hoatDong.SoLuongDaDangKy > 0)
                    {
                        hoatDong.SoLuongDaDangKy -= 1;
                        _context.HoatDongs.Update(hoatDong); // Đánh dấu hoatDong cần cập nhật
                    }
                    else
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { message = "Số lượng đăng ký đã ở mức 0, không thể giảm thêm" });
                    }

                    // Ghi lịch sử hủy
                    var lichSu = new LichSuHuyDangKy
                    {
                        MaSv = maSV,
                        MaHoatDong = request.MaHoatDong,
                        
                        ThoiGianHuy = ngayHienTai,
                        LyDo = string.IsNullOrEmpty(request.LyDoHuy) ? "Hủy bởi sinh viên" : request.LyDoHuy.Trim(),
                        TrangThai = "Thành công"
                    };
                    _context.LichSuHuyDangKys.Add(lichSu);

                    // Xóa bản ghi đăng ký
                    _context.DangKyHoatDongs.Remove(dangKy);

                    // Lưu thay đổi
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }

                return Ok(new { message = "Hủy đăng ký hoạt động thành công" });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Lỗi cơ sở dữ liệu khi hủy đăng ký cho MaSV: {MaSV}, MaHoatDong: {MaHoatDong}", User.Identity?.Name, request.MaHoatDong);
                return StatusCode(500, new { message = "Lỗi cơ sở dữ liệu, vui lòng thử lại sau", error = dbEx.InnerException?.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi hủy đăng ký hoạt động cho MaSV: {MaSV}, MaHoatDong: {MaHoatDong}", User.Identity?.Name, request.MaHoatDong);
                return StatusCode(500, new { message = "Có lỗi xảy ra, vui lòng thử lại sau", error = ex.Message });
            }
        }
        [HttpGet("lich-su-huy")]
        public async Task<IActionResult> GetLichSuHuy()
        {
            var maSV = User.Identity?.Name;
            var lichSu = await _context.LichSuHuyDangKys
                .Where(h => h.MaSv == maSV)
                .OrderByDescending(h => h.ThoiGianHuy)
                .ToListAsync();

            return Ok(new { count = lichSu.Count, data = lichSu });
        }
    }
}
