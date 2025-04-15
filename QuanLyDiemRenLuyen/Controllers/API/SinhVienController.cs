using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        [HttpPut("update-profile")]
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

                // Tìm tài khoản
                var user = await _context.TaiKhoans
                    .FirstOrDefaultAsync(u => u.TenDangNhap == username);
                if (user == null)
                {
                    return Unauthorized(new { message = "Tài khoản không tồn tại." });
                }



                // Tìm sinh viên
                var sinhVien = await _context.SinhViens.FindAsync(username);
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

                // Xử lý địa chỉ (tỉnh, quận, phường, chi tiết)
                if (!string.IsNullOrEmpty(sinhVienDTO.DiaChi))
                {
                    var diaChiParts = sinhVienDTO.DiaChi.Split(',').Select(p => p.Trim()).ToList();
                    if (diaChiParts.Count < 3)
                    {
                        return BadRequest(new { message = "Địa chỉ phải chứa ít nhất phường/xã, quận/huyện, tỉnh/thành phố." });
                    }

                    string tinh = diaChiParts.Last();
                    string quan = diaChiParts[diaChiParts.Count - 2];
                    string phuong = diaChiParts[diaChiParts.Count - 3];

                    var client = _httpClientFactory.CreateClient();
                    var tinhResponse = await client.GetAsync("https://provinces.open-api.vn/api/p/");
                    if (!tinhResponse.IsSuccessStatusCode)
                    {
                        return StatusCode(500, new { message = "Không thể kết nối đến API tỉnh thành." });
                    }

                    var tinhData = await tinhResponse.Content.ReadAsStringAsync();
                    if (!tinhData.Contains(tinh, StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(new { message = $"Tỉnh/thành phố '{tinh}' không hợp lệ." });
                    }

                    var quanResponse = await client.GetAsync("https://provinces.open-api.vn/api/d/");
                    if (!quanResponse.IsSuccessStatusCode)
                    {
                        return StatusCode(500, new { message = "Không thể kết nối đến API quận huyện." });
                    }

                    var quanData = await quanResponse.Content.ReadAsStringAsync();
                    if (!quanData.Contains(quan, StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(new { message = $"Quận/huyện '{quan}' không hợp lệ." });
                    }

                    var phuongResponse = await client.GetAsync("https://provinces.open-api.vn/api/w/");
                    if (!phuongResponse.IsSuccessStatusCode)
                    {
                        return StatusCode(500, new { message = "Không thể kết nối đến API phường xã." });
                    }

                    var phuongData = await phuongResponse.Content.ReadAsStringAsync();
                    if (!phuongData.Contains(phuong, StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(new { message = $"Phường/xã '{phuong}' không hợp lệ." });
                    }

                    sinhVien.DiaChi = sinhVienDTO.DiaChi;
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

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await avatar.CopyToAsync(stream);
                    }

                    sinhVien.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Lưu thay đổi
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật thông tin thành công.", data = sinhVien });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi.", error = ex.Message });
            }
        }
    }
}

