using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.GiangVien;
using QuanLyDiemRenLuyen.DTO.SinhVien;
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

        // Thêm giảng viên
        [HttpPost("them_giang_vien")]
        public async Task<ActionResult<GiangVienDTO>> CreateGiangVien([FromForm] GiangVienDTO giangVienDto, IFormFile anhDaiDien = null)
        {
            try
            {
                if (string.IsNullOrEmpty(giangVienDto.MaGV))
                {
                    return BadRequest(new { message = "Mã giảng viên không được để trống" });
                }

                var existingGV = await _context.GiaoViens.FindAsync(giangVienDto.MaGV);
                if (existingGV != null)
                {
                    return Conflict(new { message = "Mã giảng viên đã tồn tại" });
                }

                if (!string.IsNullOrEmpty(giangVienDto.Email) && !Regex.IsMatch(giangVienDto.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                {
                    return BadRequest(new { message = "Email không hợp lệ" });
                }

                if (!string.IsNullOrEmpty(giangVienDto.SoDienThoai) && !Regex.IsMatch(giangVienDto.SoDienThoai, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });
                }

                string anhDaiDienPath = null;
                if (anhDaiDien != null && anhDaiDien.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(anhDaiDien.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png" });
                    }

                    var fileName = $"{giangVienDto.MaGV}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    anhDaiDienPath = $"/avatars/{fileName}";
                }

                var lastTaiKhoan = await _context.TaiKhoans
                    .Where(tk => tk.MaTaiKhoan.StartsWith("TKGV"))
                    .OrderByDescending(tk => tk.MaTaiKhoan)
                    .FirstOrDefaultAsync();

                string maTaiKhoan;
                if (lastTaiKhoan != null)
                {
                    // Lấy số cuối cùng và tăng lên 1
                    string lastNumber = lastTaiKhoan.MaTaiKhoan.Substring(4); // Bỏ "TKGV" lấy phần số
                    int number;
                    if (int.TryParse(lastNumber, out number))
                    {
                        maTaiKhoan = $"TKGV{number + 1}";
                    }
                    else
                    {
                        // Nếu không parse được, tạo mã mới từ số 1
                        maTaiKhoan = "TKGV1";
                    }
                }
                else
                {
                    // Nếu chưa có tài khoản nào, bắt đầu từ TKSV1
                    maTaiKhoan = "TKGV01";
                }

                // Tạo tài khoản cho sinh viên
                var taiKhoan = new TaiKhoan
                {
                    MaTaiKhoan = maTaiKhoan,
                    TenDangNhap = giangVienDto.MaGV,
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(giangVienDto.MaGV), // Mật khẩu mặc định là 123456
                    VaiTro = "GiangVien"
                };

                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.TaiKhoans.Add(taiKhoan);
                    await _context.SaveChangesAsync();

                    DateOnly? ngaySinh = null;
                    if (!string.IsNullOrEmpty(giangVienDto.NgaySinh))
                    {
                        if (DateOnly.TryParse(giangVienDto.NgaySinh, out var ns))
                            ngaySinh = ns;
                    }

                    var giaoVien = new GiaoVien
                    {
                        MaGv = giangVienDto.MaGV,
                        MaTaiKhoan = taiKhoan.MaTaiKhoan,
                        HoTen = giangVienDto.HoTen,
                        Email = giangVienDto.Email,
                        SoDienThoai = giangVienDto.SoDienThoai,
                        DiaChi = giangVienDto.DiaChi,
                        NgaySinh = ngaySinh,
                        GioiTinh = giangVienDto.GioiTinh,
                        AnhDaiDien = anhDaiDienPath,
                        TrangThai = "HoatDong"
                    };

                    _context.GiaoViens.Add(giaoVien);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    giangVienDto.AnhDaiDien = anhDaiDienPath;
                    return CreatedAtAction("GetGiangVien", new { id = giaoVien.MaGv }, giangVienDto);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    if (!string.IsNullOrEmpty(anhDaiDienPath))
                    {
                        var filePath = Path.Combine("wwwroot", anhDaiDienPath.TrimStart('/'));
                        if (System.IO.File.Exists(filePath))
                            System.IO.File.Delete(filePath);
                    }
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo giảng viên", error = ex.Message });
            }
        }

        // Cập nhật giảng viên
        [HttpPut("cap_nhat_giang_vien/{id}")]
        public async Task<IActionResult> UpdateGiangVien(string id, [FromForm] GiangVienDTO giangVienDto, IFormFile anhDaiDien = null)
        {
            try
            {
                if (id != giangVienDto.MaGV)
                    return BadRequest(new { message = "Mã giảng viên không khớp" });

                var existingGV = await _context.GiaoViens.FindAsync(id);
                if (existingGV == null)
                    return NotFound(new { message = "Giảng viên không tồn tại" });

                if (!string.IsNullOrEmpty(giangVienDto.Email) && !Regex.IsMatch(giangVienDto.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                    return BadRequest(new { message = "Email không hợp lệ" });

                if (!string.IsNullOrEmpty(giangVienDto.SoDienThoai) && !Regex.IsMatch(giangVienDto.SoDienThoai, @"^\d{10}$"))
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });

                if (anhDaiDien != null && anhDaiDien.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(anhDaiDien.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png" });

                    var fileName = $"{giangVienDto.MaGV}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    // Xóa ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(existingGV.AnhDaiDien))
                    {
                        var oldFilePath = Path.Combine("wwwroot", existingGV.AnhDaiDien.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                            System.IO.File.Delete(oldFilePath);
                    }

                    existingGV.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Chuyển đổi NgaySinh
                DateOnly? ngaySinh = existingGV.NgaySinh;
                if (!string.IsNullOrEmpty(giangVienDto.NgaySinh))
                {
                    if (DateOnly.TryParse(giangVienDto.NgaySinh, out var ns))
                        ngaySinh = ns;
                }

                existingGV.HoTen = giangVienDto.HoTen ?? existingGV.HoTen;
                existingGV.Email = giangVienDto.Email ?? existingGV.Email;
                existingGV.SoDienThoai = giangVienDto.SoDienThoai ?? existingGV.SoDienThoai;
                existingGV.DiaChi = giangVienDto.DiaChi ?? existingGV.DiaChi;
                existingGV.NgaySinh = ngaySinh;
                existingGV.GioiTinh = giangVienDto.GioiTinh ?? existingGV.GioiTinh;

                // Nếu email thay đổi thì cập nhật cả tài khoản
                if (existingGV.Email != giangVienDto.Email && !string.IsNullOrEmpty(giangVienDto.Email))
                {
                    var tk = await _context.TaiKhoans.FindAsync(existingGV.MaTaiKhoan);
                    if (tk != null)
                    {
                        tk.TenDangNhap = giangVienDto.Email;
                        _context.TaiKhoans.Update(tk);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật thông tin giảng viên thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật thông tin giảng viên", error = ex.Message });
            }
        }

        // Xóa giảng viên
        [HttpDelete("xoa_giang_vien/{id}")]
        public async Task<IActionResult> DeleteGiangVien(string id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var giangVien = await _context.GiaoViens.FindAsync(id);
                if (giangVien == null)
                    return NotFound(new { message = "Giảng viên không tồn tại" });

                var lopQuanLy = await _context.Lops.AnyAsync(l => l.MaGv == id);
                if (lopQuanLy)
                    return BadRequest(new { message = "Không thể xóa giảng viên đang quản lý lớp. Vui lòng gán lớp cho giảng viên khác trước khi xóa" });

                var maTaiKhoan = giangVien.MaTaiKhoan;
                var anhDaiDien = giangVien.AnhDaiDien;

                _context.GiaoViens.Remove(giangVien);
                await _context.SaveChangesAsync();

                var taiKhoan = await _context.TaiKhoans.FindAsync(maTaiKhoan);
                if (taiKhoan != null)
                {
                    _context.TaiKhoans.Remove(taiKhoan);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                if (!string.IsNullOrEmpty(anhDaiDien))
                {
                    var filePath = Path.Combine("wwwroot", anhDaiDien.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }

                return Ok(new { message = "Xóa giảng viên thành công" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa giảng viên", error = ex.Message });
            }
        }
    }
}