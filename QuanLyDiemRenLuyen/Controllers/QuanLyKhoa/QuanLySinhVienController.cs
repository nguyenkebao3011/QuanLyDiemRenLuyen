using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public class QuanLySinhVienController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public QuanLySinhVienController(QlDrlContext context)
        {
            _context = context;
        }

        [HttpPost("them_sinh_vien")]
        public async Task<ActionResult<SinhVienDTO>> CreateSinhVien([FromForm] SinhVienDTO sinhVienDTO, IFormFile anhDaiDien = null)
        {
            try
            {
                // Kiểm tra MaSV đã tồn tại chưa
                if (string.IsNullOrEmpty(sinhVienDTO.MaSV))
                {
                    return BadRequest(new { message = "Mã sinh viên không được để trống" });
                }

                var existingSinhVien = await _context.SinhViens.FindAsync(sinhVienDTO.MaSV);
                if (existingSinhVien != null)
                {
                    return Conflict(new { message = "Mã sinh viên đã tồn tại" });
                }

                // Kiểm tra định dạng email
                if (!string.IsNullOrEmpty(sinhVienDTO.Email) && !Regex.IsMatch(sinhVienDTO.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                {
                    return BadRequest(new { message = "Email không hợp lệ" });
                }

                // Kiểm tra định dạng số điện thoại
                if (!string.IsNullOrEmpty(sinhVienDTO.SoDienThoai) && !Regex.IsMatch(sinhVienDTO.SoDienThoai, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });
                }

                // Kiểm tra MaLop có tồn tại không
                if (!string.IsNullOrEmpty(sinhVienDTO.MaLop))
                {
                    var lop = await _context.Lops.FindAsync(sinhVienDTO.MaLop);
                    if (lop == null)
                    {
                        return BadRequest(new { message = "Mã lớp không tồn tại" });
                    }
                }

                // Xử lý ảnh đại diện
                string anhDaiDienPath = null;
                if (anhDaiDien != null && anhDaiDien.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(anhDaiDien.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png" });
                    }

                    var fileName = $"{sinhVienDTO.MaSV}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    anhDaiDienPath = $"/avatars/{fileName}";
                }

                // Tìm mã tài khoản lớn nhất để tạo mã mới
                var lastTaiKhoan = await _context.TaiKhoans
                    .Where(tk => tk.MaTaiKhoan.StartsWith("TKSV"))
                    .OrderByDescending(tk => tk.MaTaiKhoan)
                    .FirstOrDefaultAsync();

                string maTaiKhoan;
                if (lastTaiKhoan != null)
                {
                    // Lấy số cuối cùng và tăng lên 1
                    string lastNumber = lastTaiKhoan.MaTaiKhoan.Substring(4); // Bỏ "TKSV" lấy phần số
                    int number;
                    if (int.TryParse(lastNumber, out number))
                    {
                        maTaiKhoan = $"TKSV{number + 1}";
                    }
                    else
                    {
                        // Nếu không parse được, tạo mã mới từ số 1
                        maTaiKhoan = "TKSV1";
                    }
                }
                else
                {
                    // Nếu chưa có tài khoản nào, bắt đầu từ TKSV1
                    maTaiKhoan = "TKSV1";
                }

                // Tạo tài khoản cho sinh viên
                var taiKhoan = new TaiKhoan
                {
                    MaTaiKhoan = maTaiKhoan,
                    TenDangNhap = sinhVienDTO.MaSV,
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(sinhVienDTO.MaSV), // Mật khẩu mặc định là MaSV
                    VaiTro = "SinhVien"
                };

                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Thêm tài khoản vào database
                        _context.TaiKhoans.Add(taiKhoan);
                        await _context.SaveChangesAsync();

                        // Chuyển đổi từ DTO sang model
                        DateTime ngaySinh;
                        if (!DateTime.TryParse(sinhVienDTO.NgaySinh, out ngaySinh))
                        {
                            ngaySinh = DateTime.Now;
                        }

                        var sinhVien = new Models.SinhVien
                        {
                            MaSV = sinhVienDTO.MaSV,
                            MaTaiKhoan = maTaiKhoan,
                            HoTen = sinhVienDTO.HoTen,
                            MaLop = sinhVienDTO.MaLop,
                            Email = sinhVienDTO.Email,
                            SoDienThoai = sinhVienDTO.SoDienThoai,
                            DiaChi = sinhVienDTO.DiaChi,
                            NgaySinh = ngaySinh,
                            GioiTinh = sinhVienDTO.GioiTinh,
                            AnhDaiDien = anhDaiDienPath,
                            MaVaiTro = sinhVienDTO.MaVaiTro,
                            TrangThai = sinhVienDTO.TrangThai ?? "HoatDong"
                        };

                        // Thêm sinh viên vào database
                        _context.SinhViens.Add(sinhVien);
                        await _context.SaveChangesAsync();

                        await transaction.CommitAsync();

                        // Cập nhật lại DTO để trả về
                        sinhVienDTO.AnhDaiDien = anhDaiDienPath;

                        return CreatedAtAction("GetSinhVien", new { id = sinhVien.MaSV }, sinhVienDTO);
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();

                        // Xóa file ảnh đã tải lên nếu có lỗi
                        if (!string.IsNullOrEmpty(anhDaiDienPath))
                        {
                            var filePath = Path.Combine("wwwroot", anhDaiDienPath.TrimStart('/'));
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }

                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo sinh viên", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // PUT: api/QuanLySinhVien/
        [HttpPut("cap_nhap_sinh_vien/{id}")]
        public async Task<IActionResult> UpdateSinhVien(string id, [FromForm] SinhVienDTO sinhVienDTO, IFormFile anhDaiDien = null)
        {
            try
            {
                if (id != sinhVienDTO.MaSV)
                {
                    return BadRequest(new { message = "Mã sinh viên không khớp" });
                }

                // Kiểm tra sinh viên có tồn tại không
                var existingSinhVien = await _context.SinhViens.FindAsync(id);
                if (existingSinhVien == null)
                {
                    return NotFound(new { message = "Sinh viên không tồn tại" });
                }

                // Kiểm tra định dạng email
                if (!string.IsNullOrEmpty(sinhVienDTO.Email) && !Regex.IsMatch(sinhVienDTO.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                {
                    return BadRequest(new { message = "Email không hợp lệ" });
                }

                // Kiểm tra định dạng số điện thoại
                if (!string.IsNullOrEmpty(sinhVienDTO.SoDienThoai) && !Regex.IsMatch(sinhVienDTO.SoDienThoai, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });
                }

                // Kiểm tra MaLop có tồn tại không
                if (!string.IsNullOrEmpty(sinhVienDTO.MaLop))
                {
                    var lop = await _context.Lops.FindAsync(sinhVienDTO.MaLop);
                    if (lop == null)
                    {
                        return BadRequest(new { message = "Mã lớp không tồn tại" });
                    }
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

                    var fileName = $"{id}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    // Xóa ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(existingSinhVien.AnhDaiDien))
                    {
                        var oldFilePath = Path.Combine("wwwroot", existingSinhVien.AnhDaiDien.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    existingSinhVien.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Chuyển đổi từ DTO sang model
                DateTime ngaySinh;
                if (!DateTime.TryParse(sinhVienDTO.NgaySinh, out ngaySinh))
                {
                    ngaySinh = existingSinhVien.NgaySinh;
                }

                // Cập nhật thông tin sinh viên
                existingSinhVien.HoTen = sinhVienDTO.HoTen ?? existingSinhVien.HoTen;
                existingSinhVien.MaLop = sinhVienDTO.MaLop ?? existingSinhVien.MaLop;
                existingSinhVien.Email = sinhVienDTO.Email ?? existingSinhVien.Email;
                existingSinhVien.SoDienThoai = sinhVienDTO.SoDienThoai ?? existingSinhVien.SoDienThoai;
                existingSinhVien.DiaChi = sinhVienDTO.DiaChi ?? existingSinhVien.DiaChi;
                existingSinhVien.NgaySinh = ngaySinh;
                existingSinhVien.GioiTinh = sinhVienDTO.GioiTinh ?? existingSinhVien.GioiTinh;
                existingSinhVien.MaVaiTro = sinhVienDTO.MaVaiTro;
                existingSinhVien.TrangThai = sinhVienDTO.TrangThai ?? existingSinhVien.TrangThai;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!SinhVienExists(id))
                    {
                        return NotFound(new { message = "Sinh viên không tồn tại" });
                    }
                    else
                    {
                        throw;
                    }
                }

                return Ok(new { message = "Cập nhật thông tin sinh viên thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật thông tin sinh viên", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
        [HttpDelete("xoa_sinh_vien/{id}")]
        public async Task<IActionResult> DeleteSinhVien(string id)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var sinhVien = await _context.SinhViens
                        .Include(sv => sv.ChiTietThongBaos)
                        .Include(sv => sv.DangKyHoatDongs)
                        .Include(sv => sv.DiemRenLuyens)
                        .FirstOrDefaultAsync(sv => sv.MaSV == id);
                    if (sinhVien == null)
                    {
                        return NotFound(new { message = "Sinh viên không tồn tại" });
                    }

                    // Xóa các bản ghi liên quan trước
                    if (sinhVien.ChiTietThongBaos != null)
                        _context.ChiTietThongBaos.RemoveRange(sinhVien.ChiTietThongBaos);
                    if (sinhVien.DangKyHoatDongs != null)
                        _context.DangKyHoatDongs.RemoveRange(sinhVien.DangKyHoatDongs);
                    if (sinhVien.DiemRenLuyens != null)
                        _context.DiemRenLuyens.RemoveRange(sinhVien.DiemRenLuyens);

                    // Lưu thông tin tài khoản để xóa sau
                    string maTaiKhoan = sinhVien.MaTaiKhoan;
                    string ?anhDaiDien = sinhVien.AnhDaiDien;

                    // Xóa sinh viên
                    _context.SinhViens.Remove(sinhVien);
                    await _context.SaveChangesAsync();

                    // Xóa tài khoản nếu có
                    var taiKhoan = await _context.TaiKhoans.FindAsync(maTaiKhoan);
                    if (taiKhoan != null)
                    {
                        _context.TaiKhoans.Remove(taiKhoan);
                        await _context.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    // Xóa ảnh đại diện nếu có
                    if (!string.IsNullOrEmpty(anhDaiDien))
                    {
                        var filePath = Path.Combine("wwwroot", anhDaiDien.TrimStart('/'));
                        if (System.IO.File.Exists(filePath))
                        {
                            System.IO.File.Delete(filePath);
                        }
                    }

                    return Ok(new { message = "Xóa sinh viên thành công" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa sinh viên", error = ex.Message, inner = ex.InnerException?.Message, stackTrace = ex.StackTrace });
                }
            }
        }
        private bool SinhVienExists(string id)
        {
            return _context.SinhViens.Any(e => e.MaSV == id);
        }
    }
}