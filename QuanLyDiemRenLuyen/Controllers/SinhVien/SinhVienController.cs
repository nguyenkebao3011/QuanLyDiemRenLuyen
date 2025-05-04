using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Authorize] // Bắt buộc phải có JWT       
    [Route("api/[controller]")]
    [ApiController]
    public class SinhVienController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly QlDrlContext _context;
        public SinhVienController(IHttpClientFactory httpClientFactory, QlDrlContext context)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;

        }


        // GET: api/SinhViens
        [HttpGet("lay-sinhvien-theo-vai-tro")]
        public async Task<IActionResult> GetSinhViens()
        {
            var username = User.Identity.Name;
            var user = await _context.TaiKhoans
                .FirstOrDefaultAsync(u => u.TenDangNhap == username);

            if (user == null)
                return Unauthorized("Tài khoản không hợp lệ.");

            if (user.VaiTro == "Admin")
            {
                // Admin có thể xem tất cả sinh viên
                var sinhViens = await _context.SinhViens
                    .Join(
                        _context.Lops, // Join với bảng Lops
                        sv => sv.MaLop, // Khóa bên SinhViens
                        lop => lop.MaLop, // Khóa bên Lops
                        (sv, lop) => new SinhVienDTO
                        {
                            MaSV = sv.MaSV,
                            HoTen = sv.HoTen,
                            MaLop = sv.MaLop,
                            TenLop = lop.TenLop, // Lấy TenLop từ bảng Lops
                            Email = sv.Email,
                            SoDienThoai = sv.SoDienThoai,
                            DiaChi = sv.DiaChi,
                            NgaySinh = sv.NgaySinh.ToString("yyyy-MM-dd"),
                            GioiTinh = sv.GioiTinh,
                            MaVaiTro = sv.MaVaiTro,
                            TrangThai = sv.TrangThai,
                            AnhDaiDien = sv.AnhDaiDien != null ? $"http://localhost:5163{sv.AnhDaiDien}" : null
                        }
                    )
                    .ToListAsync();
                return Ok(sinhViens);
            }
            else if (user.VaiTro.Equals("GiangVien", StringComparison.OrdinalIgnoreCase))
            {
                // Tìm MaGv của giảng viên từ bảng GiangViens dựa trên MaTaiKhoan
                var giangVien = await _context.GiaoViens
                    .FirstOrDefaultAsync(gv => gv.MaTaiKhoan == user.MaTaiKhoan);

                if (giangVien == null)
                    return BadRequest("Không tìm thấy thông tin giảng viên.");

                // Lấy danh sách tất cả các lớp của giảng viên
                var lopGiangViens = await _context.Lops
                    .Where(l => l.MaGv == giangVien.MaGv)
                    .Select(l => l.MaLop)
                    .ToListAsync();

                if (!lopGiangViens.Any())
                    return BadRequest("Giảng viên không có lớp giảng dạy.");

                // Lấy danh sách sinh viên trong các lớp của giảng viên
                var sinhViensCuaLop = await _context.SinhViens
                    .Where(sv => lopGiangViens.Contains(sv.MaLop)) // Lọc sinh viên thuộc các lớp
                    .Join(
                        _context.Lops, // Join với bảng Lops
                        sv => sv.MaLop,
                        lop => lop.MaLop,
                        (sv, lop) => new SinhVienDTO
                        {
                            MaSV = sv.MaSV,
                            HoTen = sv.HoTen,
                            MaLop = sv.MaLop,
                            TenLop = lop.TenLop, // Lấy TenLop từ bảng Lops
                            Email = sv.Email,
                            SoDienThoai = sv.SoDienThoai,
                            DiaChi = sv.DiaChi,
                            NgaySinh = sv.NgaySinh.ToString("yyyy-MM-dd"),
                            GioiTinh = sv.GioiTinh,
                            MaVaiTro = sv.MaVaiTro,
                            TrangThai = sv.TrangThai,
                            AnhDaiDien = sv.AnhDaiDien != null ? $"http://localhost:5163{sv.AnhDaiDien}" : null
                        }
                    )
                    .ToListAsync();

                return Ok(sinhViensCuaLop);
            }
            else if (user.VaiTro == "SinhVien")
            {
                // Sinh viên chỉ có thể xem chính mình
                var sinhVien = await _context.SinhViens
                    .Where(sv => sv.MaSV == user.TenDangNhap)
                    .Join(
                        _context.Lops, // Join với bảng Lops
                        sv => sv.MaLop,
                        lop => lop.MaLop,
                        (sv, lop) => new SinhVienDTO
                        {
                            MaSV = sv.MaSV,
                            HoTen = sv.HoTen,
                            MaLop = sv.MaLop,
                            TenLop = lop.TenLop, // Lấy TenLop từ bảng Lops
                            Email = sv.Email,
                            SoDienThoai = sv.SoDienThoai,
                            DiaChi = sv.DiaChi,
                            NgaySinh = sv.NgaySinh.ToString("yyyy-MM-dd"),
                            GioiTinh = sv.GioiTinh,
                            MaVaiTro = sv.MaVaiTro,
                            TrangThai = sv.TrangThai,
                            AnhDaiDien = sv.AnhDaiDien != null ? $"http://localhost:5163{sv.AnhDaiDien}" : null
                        }
                    )
                    .FirstOrDefaultAsync();

                if (sinhVien == null)
                    return NotFound("Sinh viên không tồn tại.");

                return Ok(sinhVien);
            }
            else
            {
                return Forbid("Bạn không có quyền truy cập.");
            }
        }
        // Phương thức chỉnh sửa thông tin sinh viên
        [HttpPut("doi-mat-khau")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // Kiểm tra nếu mật khẩu cũ trống hoặc không hợp lệ
            if (string.IsNullOrEmpty(request.MatKhauCu) || string.IsNullOrEmpty(request.MatKhauMoi))
            {
                return BadRequest(new { message = "Mật khẩu cũ và mật khẩu mới không được để trống." });
            }

            // Lấy tài khoản của sinh viên dựa trên thông tin đã đăng nhập
            var taiKhoan = await _context.TaiKhoans
                .FirstOrDefaultAsync(tk => tk.TenDangNhap == User.Identity.Name); // Hoặc lấy thông tin từ JWT nếu mày dùng

            if (taiKhoan == null)
            {
                return BadRequest(new { message = "Tài khoản không tồn tại." });
            }

            // Kiểm tra mật khẩu cũ
            var passwordHasher = new PasswordHasher<string>();
            var verificationResult = passwordHasher.VerifyHashedPassword(null, taiKhoan.MatKhau, request.MatKhauCu);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { message = "Mật khẩu cũ không đúng." });
            }

            // Mã hóa mật khẩu mới
            taiKhoan.MatKhau = passwordHasher.HashPassword(null, request.MatKhauMoi);

            // Lưu thay đổi vào cơ sở dữ liệu
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mật khẩu đã được thay đổi thành công." });
        }

        [HttpPut("cap-nhat-thong-tin")]
        public async Task<IActionResult> UpdateSinhVien([FromForm] SinhVienDTO sinhVienDTO, IFormFile? avatar)
        {
            try
            {
                // Lấy tên đăng nhập từ token
                var username = User.Identity?.Name;
                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized(new { message = "Tài khoản không hợp lệ." });
                }

                // Tìm sinh viên
                var sinhVien = await _context.SinhViens.FirstOrDefaultAsync(s => s.MaSV == username);
                if (sinhVien == null)
                {
                    return NotFound(new { message = "Sinh viên không tồn tại." });
                }


                // Ràng buộc số điện thoại
                if (!string.IsNullOrEmpty(sinhVienDTO.SoDienThoai))
                {
                    if (sinhVienDTO.SoDienThoai.Length == 10 && Regex.IsMatch(sinhVienDTO.SoDienThoai, @"^\d{10}$"))
                    {
                        sinhVien.SoDienThoai = sinhVienDTO.SoDienThoai;
                    }
                    else
                    {
                        return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số." });
                    }
                }

                // Ràng buộc email
                if (!string.IsNullOrEmpty(sinhVienDTO.Email))
                {
                    if (sinhVienDTO.Email.EndsWith("@huit.edu.vn") && Regex.IsMatch(sinhVienDTO.Email, @"^[\w-\.]+@huit\.edu\.vn$"))
                    {
                        sinhVien.Email = sinhVienDTO.Email;
                    }
                    else
                    {
                        return BadRequest(new { message = "Email phải có định dạng @huit.edu.vn." });
                    }
                }

                // Kiểm tra và cập nhật địa chỉ
                if (!string.IsNullOrEmpty(sinhVienDTO.DiaChi))
                {
                    // Nếu có địa chỉ mới được cung cấp, thì cập nhật
                    sinhVien.DiaChi = sinhVienDTO.DiaChi;
                }
                else
                {
                    // Nếu không có địa chỉ mới, thì không thay đổi gì
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

                    var fileName = $"{username}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath)); // Đảm bảo thư mục tồn tại
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await avatar.CopyToAsync(stream);
                    }

                    sinhVien.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Lưu thay đổi
                _context.SinhViens.Update(sinhVien);
                await _context.SaveChangesAsync();

                // Trả về thông tin đã cập nhật
                var updatedSinhVien = new SinhVienDTO
                {
                    MaSV = sinhVien.MaSV,
                    HoTen = sinhVien.HoTen,
                    MaLop = sinhVien.MaLop,
                    Email = sinhVien.Email,
                    SoDienThoai = sinhVien.SoDienThoai,
                    DiaChi = sinhVien.DiaChi,
                    NgaySinh = sinhVien.NgaySinh.ToString("yyyy-MM-dd"), // Chuyển DateTime thành string
                    GioiTinh = sinhVien.GioiTinh,
                    MaVaiTro = sinhVien.MaVaiTro,
                    AnhDaiDien = sinhVien.AnhDaiDien,
                    TrangThai = sinhVien.TrangThai
                };

                return Ok(new { message = "Cập nhật thông tin thành công.", data = updatedSinhVien });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi.", error = ex.Message });
            }
        }
    }
}

