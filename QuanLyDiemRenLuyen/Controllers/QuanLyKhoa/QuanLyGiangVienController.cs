using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuanLyGiangVienController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public QuanLyGiangVienController(QlDrlContext context)
        {
            _context = context;
        }

        // POST: api/
        [HttpPost("them_giang_vien")]
        public async Task<ActionResult<GiaoVien>> CreateGiangVien([FromForm] GiaoVien giangVien, IFormFile anhDaiDien = null)
        {
            try
            {
                // Kiểm tra MaGv đã tồn tại chưa
                if (string.IsNullOrEmpty(giangVien.MaGv))
                {
                    return BadRequest(new { message = "Mã giảng viên không được để trống" });
                }

                var existingGiangVien = await _context.GiaoViens.FindAsync(giangVien.MaGv);
                if (existingGiangVien != null)
                {
                    return Conflict(new { message = "Mã giảng viên đã tồn tại" });
                }

                // Kiểm tra định dạng email
                if (!string.IsNullOrEmpty(giangVien.Email) && !Regex.IsMatch(giangVien.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                {
                    return BadRequest(new { message = "Email không hợp lệ" });
                }

                // Kiểm tra định dạng số điện thoại
                if (!string.IsNullOrEmpty(giangVien.SoDienThoai) && !Regex.IsMatch(giangVien.SoDienThoai, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });
                }

                // Xử lý ảnh đại diện
                if (anhDaiDien != null && anhDaiDien.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(anhDaiDien.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png" });
                    }

                    var fileName = $"{giangVien.MaGv}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    giangVien.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Tạo tài khoản cho giảng viên
                var taiKhoan = new TaiKhoan
                {
                    TenDangNhap = giangVien.Email,
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(giangVien.MaGv), // Mật khẩu mặc định là MaGv
                    VaiTro = "GiangVien"
                };

                _context.TaiKhoans.Add(taiKhoan);
                await _context.SaveChangesAsync();

                // Cập nhật MaTaiKhoan cho giảng viên
                giangVien.MaTaiKhoan = taiKhoan.MaTaiKhoan;

                // Thêm giảng viên vào database
                _context.GiaoViens.Add(giangVien);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetGiangVien", new { id = giangVien.MaGv }, giangVien);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo giảng viên", error = ex.Message });
            }
        }

        // PUT: api/QuanLyGiangVien/
        [HttpPut("cap_nhat_giang_vien/{id}")]
        public async Task<IActionResult> UpdateGiangVien(string id, [FromForm] GiaoVien giangVien, IFormFile anhDaiDien = null)
        {
            try
            {
                if (id != giangVien.MaGv)
                {
                    return BadRequest(new { message = "Mã giảng viên không khớp" });
                }

                // Kiểm tra giảng viên có tồn tại không
                var existingGiangVien = await _context.GiaoViens.FindAsync(id);
                if (existingGiangVien == null)
                {
                    return NotFound(new { message = "Giảng viên không tồn tại" });
                }

                // Kiểm tra định dạng email
                if (!string.IsNullOrEmpty(giangVien.Email) && !Regex.IsMatch(giangVien.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                {
                    return BadRequest(new { message = "Email không hợp lệ" });
                }

                // Kiểm tra định dạng số điện thoại
                if (!string.IsNullOrEmpty(giangVien.SoDienThoai) && !Regex.IsMatch(giangVien.SoDienThoai, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });
                }

                // Xử lý ảnh đại diện
                if (anhDaiDien != null && anhDaiDien.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(anhDaiDien.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png" });
                    }

                    var fileName = $"{giangVien.MaGv}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    // Xóa ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(existingGiangVien.AnhDaiDien))
                    {
                        var oldFilePath = Path.Combine("wwwroot", existingGiangVien.AnhDaiDien.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    giangVien.AnhDaiDien = $"/avatars/{fileName}";
                }
                else
                {
                    // Giữ nguyên ảnh đại diện cũ
                    giangVien.AnhDaiDien = existingGiangVien.AnhDaiDien;
                }

                // Giữ nguyên MaTaiKhoan
                giangVien.MaTaiKhoan = existingGiangVien.MaTaiKhoan;

                // Cập nhật thông tin giảng viên
                _context.Entry(existingGiangVien).State = EntityState.Detached;
                _context.Entry(giangVien).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!GiangVienExists(id))
                    {
                        return NotFound(new { message = "Giảng viên không tồn tại" });
                    }
                    else
                    {
                        throw;
                    }
                }

                // Cập nhật email trong tài khoản nếu email thay đổi
                if (existingGiangVien.Email != giangVien.Email)
                {
                    var taiKhoan = await _context.TaiKhoans.FindAsync(giangVien.MaTaiKhoan);
                    if (taiKhoan != null)
                    {
                        taiKhoan.TenDangNhap = giangVien.Email;
                        _context.TaiKhoans.Update(taiKhoan);
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { message = "Cập nhật thông tin giảng viên thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật thông tin giảng viên", error = ex.Message });
            }
        }

        // DELETE: api/QuanLyGiangVien/5
        [HttpDelete("xoa_giang_vien{id}")]
        public async Task<IActionResult> DeleteGiangVien(string id)
        {
            try
            {
                var giangVien = await _context.GiaoViens.FindAsync(id);
                if (giangVien == null)
                {
                    return NotFound(new { message = "Giảng viên không tồn tại" });
                }

                // Kiểm tra xem giảng viên có đang quản lý lớp nào không
                var lopQuanLy = await _context.Lops.AnyAsync(l => l.MaGv == id);
                if (lopQuanLy)
                {
                    return BadRequest(new { message = "Không thể xóa giảng viên đang quản lý lớp. Vui lòng gán lớp cho giảng viên khác trước khi xóa" });
                }

                // Lấy thông tin tài khoản
                var taiKhoan = await _context.TaiKhoans.FindAsync(giangVien.MaTaiKhoan);

                // Xóa giảng viên
                _context.GiaoViens.Remove(giangVien);

                // Xóa tài khoản nếu có
                if (taiKhoan != null)
                {
                    _context.TaiKhoans.Remove(taiKhoan);
                }

                await _context.SaveChangesAsync();

                // Xóa ảnh đại diện nếu có
                if (!string.IsNullOrEmpty(giangVien.AnhDaiDien))
                {
                    var filePath = Path.Combine("wwwroot", giangVien.AnhDaiDien.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                return Ok(new { message = "Xóa giảng viên thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa giảng viên", error = ex.Message });
            }
        }

        private bool GiangVienExists(string id)
        {
            return _context.GiaoViens.Any(e => e.MaGv == id);
        }
    }
}