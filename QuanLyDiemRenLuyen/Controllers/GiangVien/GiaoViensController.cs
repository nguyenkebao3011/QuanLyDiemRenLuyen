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

namespace QuanLyDiemRenLuyen.Controllers.GiangVien
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GiaoViensController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public GiaoViensController(QlDrlContext context)
        {
            _context = context;
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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

        // PUT: api/GiaoViens/cap-nhat-thong-tin
        [HttpPut("cap-nhat-thong-tin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateGiangVien([FromForm] GiangVienDTO giangVienDTO, IFormFile? avatar)
        {
            try
            {
                // Lấy tên đăng nhập từ token
                var email = User.Identity?.Name;
                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized(new { message = "Tài khoản không hợp lệ." });
                }

                // Tìm giảng viên theo email
                var giangVien = await _context.GiaoViens.FirstOrDefaultAsync(g => g.Email == email);
                if (giangVien == null)
                {
                    return NotFound(new { message = "Giảng viên không tồn tại." });
                }

                // Cập nhật số điện thoại
                if (!string.IsNullOrEmpty(giangVienDTO.SoDienThoai))
                {
                    if (giangVienDTO.SoDienThoai.Length == 10 && Regex.IsMatch(giangVienDTO.SoDienThoai, @"^\d{10}$"))
                    {
                        giangVien.SoDienThoai = giangVienDTO.SoDienThoai;
                    }
                    else
                    {
                        return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số." });
                    }
                }

                // Cập nhật địa chỉ
                if (!string.IsNullOrEmpty(giangVienDTO.DiaChi))
                {
                    giangVien.DiaChi = giangVienDTO.DiaChi;
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

                    var fileName = $"{email}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath)); // Đảm bảo thư mục tồn tại
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await avatar.CopyToAsync(stream);
                    }

                    giangVien.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Cập nhật thông tin giảng viên trong cơ sở dữ liệu
                _context.GiaoViens.Update(giangVien);
                await _context.SaveChangesAsync();

                // Trả về thông tin đã cập nhật
                var updatedGiangVien = new GiangVienDTO
                {
                    MaGV = giangVien.MaGv,
                    HoTen = giangVien.HoTen,
                    Email = giangVien.Email,
                    SoDienThoai = giangVien.SoDienThoai,
                    DiaChi = giangVien.DiaChi,
                    NgaySinh = giangVien.NgaySinh?.ToString("yyyy-MM-dd"), // Chuyển DateTime thành string
                    GioiTinh = giangVien.GioiTinh,
                    AnhDaiDien = giangVien.AnhDaiDien
                };

                return Ok(new { message = "Cập nhật thông tin thành công.", data = updatedGiangVien });
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
