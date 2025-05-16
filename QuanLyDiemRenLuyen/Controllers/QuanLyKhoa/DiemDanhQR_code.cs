using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiemRenLuyen.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using Net.Codecrete.QrCodeGenerator;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiemDanhQR_code : ControllerBase
    {
        private readonly QlDrlContext _context;

        public DiemDanhQR_code(QlDrlContext context)
        {
            _context = context;
        }

        public class GenerateQRRequest
        {
            public int MaHoatDong { get; set; }
            public string MaQL { get; set; }
            public int ExpirationTime { get; set; } // Phút
        }

        [HttpPost("generate-qr")]
        [Authorize]
        public async Task<IActionResult> GenerateQRCode([FromBody] GenerateQRRequest request)
        {
            var hoatDong = await _context.HoatDongs
                .FirstOrDefaultAsync(h => h.MaHoatDong == request.MaHoatDong);

            if (hoatDong == null)
                return BadRequest("Hoạt động không tồn tại hoặc không hợp lệ.");

            if (hoatDong.MaQl != request.MaQL)
                return Unauthorized("Bạn không có quyền tạo mã QR cho hoạt động này.");

            var token = Guid.NewGuid().ToString();
            var expiresAt = DateTime.UtcNow.AddMinutes(request.ExpirationTime);

            var qrData = $"MaHoatDong={request.MaHoatDong}&Token={token}&Expires={expiresAt:o}";

            // Tạo mã QR bằng Net.Codecrete.QrCodeGenerator
            var qrCodeImage = GenerateQRCode(qrData);

            var qrSession = new QRCodeSession
            {
                Token = token,
                MaHoatDong = request.MaHoatDong,
                MaQL = request.MaQL,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = expiresAt
            };

            _context.QRCodeSession.Add(qrSession);
            await _context.SaveChangesAsync();

            // Chuyển expiresAt từ UTC sang giờ Việt Nam (UTC+7)
            var vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var expiresAtVN = TimeZoneInfo.ConvertTimeFromUtc(expiresAt, vnTimeZone);

            return Ok(new
            {
                QRCodeImageBase64 = qrCodeImage,
                Token = token,
                Expiration = expiresAtVN.ToString("yyyy-MM-dd HH:mm:ss")
            });
        }
        private string GenerateQRCode(string data)
        {
            // Tạo mã QR
            var qr = QrCode.EncodeText(data, QrCode.Ecc.Medium);
            string svg = qr.ToSvgString(4); // Tạo mã QR dạng SVG

            // Chuyển SVG thành base64
            var svgBytes = System.Text.Encoding.UTF8.GetBytes(svg);
            return Convert.ToBase64String(svgBytes);
        }
    }
}