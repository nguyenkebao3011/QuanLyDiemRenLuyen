using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using QuanLyDiemRenLuyen.Models;
using QuanLyDiemRenLuyen.DTO;
using QuanLyDiemRenLuyen.DTO.SinhVien;
namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class MinhChungHoatDongsController : ControllerBase
    {
        private readonly QlDrlContext _context;
        private readonly IWebHostEnvironment _environment;  

        public MinhChungHoatDongsController(QlDrlContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }
        [HttpPost("gui-minh-chung")]
        public async Task<IActionResult> SubmitMinhChung([FromForm] PhanHoiDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Lấy thông tin người dùng từ JWT
            var username = User.Claims.FirstOrDefault(c => c.Type == "tenDangNhap" || c.Type == ClaimTypes.Name || c.Type == "sub")?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Không tìm thấy thông tin người dùng trong token.");
            }

            // Tìm tài khoản trong cơ sở dữ liệu
            var user = await _context.TaiKhoans
                .FirstOrDefaultAsync(u => u.TenDangNhap == username);
            if (user == null)
            {
                return Unauthorized("Tài khoản không tồn tại.");
            }

            // Validate file
            if (dto.FileAnh == null || dto.FileAnh.Length == 0)
            {
                return BadRequest("Vui lòng upload file ảnh.");
            }

            // Check file extension
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var fileExtension = Path.GetExtension(dto.FileAnh.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Chỉ hỗ trợ file .jpg, .jpeg, .png.");
            }

            // Save file to wwwroot/uploads
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = Guid.NewGuid().ToString() + fileExtension;
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.FileAnh.CopyToAsync(stream);
            }

            // Create new MinhChungHoatDong entity
            var minhChung = new MinhChungHoatDong
            {
                // Updated line to convert dto.MaDangKy to an integer if it's not null
                MaDangKy = string.IsNullOrEmpty(dto.MaDangKy) ? null : int.Parse(dto.MaDangKy),
                DuongDanFile = $"/uploads/{fileName}",
                MoTa = dto.MoTa,
                NgayTao = DateTime.Now,
                TrangThai = "Đang xử lý"
            };

            // Save to database
            _context.MinhChungHoatDongs.Add(minhChung);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Phản hồi đã được gửi thành công!", MaMinhChung = minhChung.MaMinhChung });



        }
        }
}
