using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class DiemDanhQRCodeController : ControllerBase
{
    private readonly QlDrlContext _context;

    public DiemDanhQRCodeController(QlDrlContext context)
    {
        _context = context;
    }

    public class CheckInRequest
    {
        public int MaDangKy { get; set; }
        public string Token { get; set; } = string.Empty;
        public string MaSV { get; set; } = string.Empty;
    }

    public class CheckInResponse
    {
        public string Message { get; set; } = string.Empty;
        public int MaDangKy { get; set; }
        public string MaSV { get; set; } = string.Empty;
        public DateTime ThoiGianDiemDanh { get; set; }
    }

    [HttpPost("check-in")]
    [Authorize(Roles = "SinhVien")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        // Lấy mã sinh viên từ token
        var tenDangNhap = User.Identity?.Name;
        if (tenDangNhap != request.MaSV)
        {
            return Unauthorized("Tên đăng nhập không khớp.");
        }

        // Kiểm tra mã QR có tồn tại và hợp lệ không
        var qrSession = await _context.QRCodeSession
            .FirstOrDefaultAsync(q => q.MaHoatDong == request.MaDangKy && q.Token == request.Token);

        if (qrSession == null)
        {
            return BadRequest("Mã QR không hợp lệ.");
        }

        // Kiểm tra mã QR hết hạn (UTC +7)
        if (qrSession.ExpiresAt < DateTime.UtcNow.AddHours(7))
        {
            return BadRequest("Mã QR đã hết hạn.");
        }

        // Kiểm tra sinh viên có đăng ký hoạt động không
        var dangKy = await _context.DangKyHoatDongs
            .FirstOrDefaultAsync(d => d.MaDangKy == request.MaDangKy && d.MaSv == request.MaSV);

        if (dangKy == null)
        {
            return BadRequest("Sinh viên chưa đăng ký hoạt động này.");
        }

        // Kiểm tra sinh viên đã điểm danh chưa
        // Join với DangKyHoatDong để lấy MaSv
        var existingCheckIn = await _context.DiemDanhHoatDongs
            .Join(
                _context.DangKyHoatDongs,
                dd => dd.MaDangKy,
                dk => dk.MaDangKy,
                (dd, dk) => new { DiemDanh = dd, DangKy = dk }
            )
            .Where(joined => joined.DiemDanh.MaDangKy == request.MaDangKy && joined.DangKy.MaSv == request.MaSV)
            .Select(joined => joined.DiemDanh)
            .FirstOrDefaultAsync();

        if (existingCheckIn != null)
        {
            return BadRequest("Sinh viên đã điểm danh cho hoạt động này.");
        }

        // Lưu điểm danh
        var diemDanh = new DiemDanhHoatDong
        {
            MaDangKy = request.MaDangKy,
            ThoiGianDiemDanh = DateTime.UtcNow.AddHours(7), // UTC +7
            MaQl = qrSession.MaQL,
            GhiChu = "Điểm danh tự động qua QR"
        };

        _context.DiemDanhHoatDongs.Add(diemDanh);
        await _context.SaveChangesAsync();

        return Ok(new CheckInResponse
        {
            Message = "Điểm danh thành công",
            MaDangKy = request.MaDangKy,
            MaSV = request.MaSV,
            ThoiGianDiemDanh = diemDanh.ThoiGianDiemDanh ?? DateTime.MinValue
        });
    }
}