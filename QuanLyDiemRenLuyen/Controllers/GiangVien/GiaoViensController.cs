using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using QuanLyDiemRenLuyen.DTO.GiangVien;
using QuanLyDiemRenLuyen.Models;
using Microsoft.Extensions.Logging;
using System.Text;

namespace QuanLyDiemRenLuyen.Controllers.GiangVien
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GiaoViensController : ControllerBase
    {
        private readonly QlDrlContext _context;
        private readonly ILogger<GiaoViensController> _logger;

        public GiaoViensController(QlDrlContext context, ILogger<GiaoViensController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/GiaoViens
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GiaoVien>>> GetGiaoViens()
        {
            return await _context.GiaoViens.ToListAsync();
        }

        // GET: api/GiaoViens/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GiaoVien>> GetGiaoVien(string id)
        {
            var giaoVien = await _context.GiaoViens.FindAsync(id);

            if (giaoVien == null)
            {
                return NotFound();
            }

            return giaoVien;
        }

        // PUT: api/GiaoViens/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGiaoVien(string id, GiaoVien giaoVien)
        {
            if (id != giaoVien.MaGv)
            {
                return BadRequest();
            }

            _context.Entry(giaoVien).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GiaoVienExists(id))
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

        // POST: api/GiaoViens
        [HttpPost]
        public async Task<ActionResult<GiaoVien>> PostGiaoVien(GiaoVien giaoVien)
        {
            _context.GiaoViens.Add(giaoVien);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (GiaoVienExists(giaoVien.MaGv))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetGiaoVien", new { id = giaoVien.MaGv }, giaoVien);
        }

        // DELETE: api/GiaoViens/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGiaoVien(string id)
        {
            var giaoVien = await _context.GiaoViens.FindAsync(id);
            if (giaoVien == null)
            {
                return NotFound();
            }

            _context.GiaoViens.Remove(giaoVien);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/GiaoViens/lay-giangvien-theo-vai-tro
        [HttpGet("lay-giangvien-theo-vai-tro")]
        public async Task<ActionResult<GiangVienDTO>> GetGiangVienByRole()
        {
            var email = User.Identity?.Name;

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { Error = "Không tìm thấy thông tin email trong token" });
            }

            var lecturer = await _context.GiaoViens
                .FirstOrDefaultAsync(l => l.Email == email);

            if (lecturer == null)
            {
                return NotFound(new { Error = "Không tìm thấy giảng viên với email này" });
            }

            var lecturerDTO = new GiangVienDTO
            {
                MaGV = lecturer.MaGv,
                HoTen = lecturer.HoTen,
                Email = lecturer.Email,
                SoDienThoai = lecturer.SoDienThoai,
                DiaChi = lecturer.DiaChi,
                NgaySinh = lecturer.NgaySinh?.ToString("yyyy-MM-dd"),
                GioiTinh = lecturer.GioiTinh,
                AnhDaiDien = lecturer.AnhDaiDien
            };

            return Ok(new { data = lecturerDTO });
        }

        [HttpPut("cap-nhat-thong-tin")]
        [Produces("application/json")]
        public async Task<IActionResult> UpdateGiaoVien([FromForm] GiangVienDTO giangVienDTO, IFormFile? avatar)
        {
            try
            {
                // Lấy tên đăng nhập từ token
                var username = User.Identity?.Name;
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(new { message = "Tài khoản không hợp lệ." });
                }

                // Tìm giáo viên theo email (username)
                var giaoVien = await _context.GiaoViens.FirstOrDefaultAsync(g => g.Email == username);
                if (giaoVien == null)
                {
                    return NotFound(new { message = "Giáo viên không tồn tại." });
                }

                // Ràng buộc số điện thoại
                if (!string.IsNullOrEmpty(giangVienDTO.SoDienThoai))
                {
                    if (giangVienDTO.SoDienThoai.Length == 10 && Regex.IsMatch(giangVienDTO.SoDienThoai, @"^\d{10}$"))
                    {
                        giaoVien.SoDienThoai = giangVienDTO.SoDienThoai;
                    }
                    else
                    {
                        return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số." });
                    }
                }

                // Chuẩn hóa và làm sạch địa chỉ
                if (!string.IsNullOrEmpty(giangVienDTO.DiaChi))
                {
                    try
                    {
                        // Chuẩn hóa chuỗi: giải mã HTML (nếu có) và chuẩn hóa Unicode (NFC)
                        string cleanedAddress = System.Net.WebUtility.HtmlDecode(giangVienDTO.DiaChi)
                            .Normalize(NormalizationForm.FormC)
                            .Trim();

                        // Loại bỏ các ký tự không mong muốn (nếu cần)
                        cleanedAddress = Regex.Replace(cleanedAddress, @"[\p{Cc}\p{Cf}]+", string.Empty);

                        // Đảm bảo chuỗi sử dụng UTF-8
                        byte[] utf8Bytes = Encoding.UTF8.GetBytes(cleanedAddress);
                        cleanedAddress = Encoding.UTF8.GetString(utf8Bytes);

                        giaoVien.DiaChi = cleanedAddress;
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(new { message = "Địa chỉ không hợp lệ. Lỗi: " + ex.Message });
                    }
                }
                else
                {
                    return BadRequest(new { message = "Địa chỉ không được để trống." });
                }

                // Cập nhật ảnh đại diện
                if (avatar != null && avatar.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(avatar.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png." });
                    }

                    var fileName = $"{giaoVien.MaGv}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath)); // Đảm bảo thư mục tồn tại
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await avatar.CopyToAsync(stream);
                    }

                    giaoVien.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Lưu thay đổi
                _context.GiaoViens.Update(giaoVien);
                await _context.SaveChangesAsync();

                // Chuẩn hóa dữ liệu trả về
                var updatedGiaoVien = new GiangVienDTO
                {
                    MaGV = giaoVien.MaGv,
                    HoTen = giaoVien.HoTen?.Normalize(NormalizationForm.FormC),
                    Email = giaoVien.Email,
                    SoDienThoai = giaoVien.SoDienThoai,
                    DiaChi = giaoVien.DiaChi?.Normalize(NormalizationForm.FormC),
                    NgaySinh = giaoVien.NgaySinh.HasValue ? giaoVien.NgaySinh.Value.ToString("yyyy-MM-dd") : null,
                    GioiTinh = giaoVien.GioiTinh,
                    AnhDaiDien = giaoVien.AnhDaiDien
                };

                // Trả về phản hồi với UTF-8
                Response.ContentType = "application/json; charset=utf-8";
                return Ok(new
                {
                    message = "Cập nhật thông tin thành công.",
                    data = updatedGiaoVien
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi.", error = ex.Message });
            }
        }

        private bool GiaoVienExists(string id)
        {
            return _context.GiaoViens.Any(e => e.MaGv == id);
        }
    }
}