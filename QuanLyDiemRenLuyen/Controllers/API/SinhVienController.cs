using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using QuanLyDiemRenLuyen.DTO;
using QuanLyDiemRenLuyen.Models;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace QuanLyDiemRenLuyen.Controllers.API
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
        [HttpGet("Lay_sinhvien_theo_vaitro")]
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
                    .Select(sv => new SinhVienDTO
                    {
                        MaSV = sv.MaSV,
                        HoTen = sv.HoTen,
                        MaLop = sv.MaLop,
                        Email = sv.Email,
                        SoDienThoai = sv.SoDienThoai,
                        DiaChi = sv.DiaChi,
                        NgaySinh = sv.NgaySinh.ToString("yyyy-MM-dd"),
                        GioiTinh = sv.GioiTinh,
                        MaVaiTro = sv.MaVaiTro,
                        TrangThai = sv.TrangThai
                    })

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

                // Tìm lớp của giảng viên dựa trên MaGv
                var lopGiangVien = await _context.Lops
                    .FirstOrDefaultAsync(l => l.MaGv == giangVien.MaGv);

                if (lopGiangVien == null)
                    return BadRequest("Giảng viên không có lớp giảng dạy.");

                // Lấy danh sách sinh viên trong lớp
                var sinhViensCuaLop = await _context.SinhViens
                    .Where(sv => sv.MaLop == lopGiangVien.MaLop)
                    .Select(sv => new SinhVienDTO
                    {
                        MaSV = sv.MaSV,
                        HoTen = sv.HoTen,
                        MaLop = sv.MaLop,
                        Email = sv.Email,
                        SoDienThoai = sv.SoDienThoai,
                        DiaChi = sv.DiaChi,
                        NgaySinh = sv.NgaySinh.ToString("yyyy-MM-dd"),
                        GioiTinh = sv.GioiTinh,
                        MaVaiTro = sv.MaVaiTro,
                        TrangThai = sv.TrangThai
                    })
                    .ToListAsync();

                return Ok(sinhViensCuaLop);
            }
            // Sinh viên chỉ có thể xem chính mình
            else if (user.VaiTro == "SinhVien")
            {
                // Sinh viên chỉ có thể xem chính mình
                var sinhVien = await _context.SinhViens
                    .FirstOrDefaultAsync(sv => sv.MaSV == user.TenDangNhap); // So sánh MaSV với TenDangNhap

                if (sinhVien == null)
                    return NotFound("Sinh viên không tồn tại.");

                // Ánh xạ sang SinhVienDto để tránh lỗi vòng lặp
                var sinhVienDto = new SinhVienDTO
                {
                    MaSV = sinhVien.MaSV,
                    HoTen = sinhVien.HoTen,
                    MaLop = sinhVien.MaLop,
                    Email = sinhVien.Email,
                    SoDienThoai = sinhVien.SoDienThoai,
                    DiaChi = sinhVien.DiaChi,
                    NgaySinh = sinhVien.NgaySinh.ToString("yyyy-MM-dd"),
                    GioiTinh = sinhVien.GioiTinh,
                    MaVaiTro = sinhVien.MaVaiTro,
                    TrangThai = sinhVien.TrangThai
                };

                return Ok(sinhVienDto);
            }
            else
            {
                return Forbid("Bạn không có quyền truy cập.");
            }
        }



        // Phương thức chỉnh sửa thông tin sinh viên

        [HttpPut("capnhat_thongtin")]
       
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

