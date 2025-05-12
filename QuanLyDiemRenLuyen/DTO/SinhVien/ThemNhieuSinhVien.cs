using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// Alias tránh conflict namespace
using EntitySinhVien = QuanLyDiemRenLuyen.Models.SinhVien;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ThemNhieuSinhVienController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public ThemNhieuSinhVienController(QlDrlContext context)
        {
            _context = context;
        }

        public class ImportData
        {
            public List<ImportSinhVien> DanhSachSinhVien { get; set; }
            public List<TaiKhoan> DanhSachTaiKhoan { get; set; }
            public List<ImportDiemRenLuyen> DanhSachDiemRenLuyen { get; set; }
        }

        public class ImportSinhVien
        {
            public string MaSV { get; set; }
            public string MaTaiKhoan { get; set; }
            public string HoTen { get; set; }
            public string MaLop { get; set; }
            public string Email { get; set; }
            public string SoDienThoai { get; set; }
            public string DiaChi { get; set; }
            public string NgaySinh { get; set; } // Chuỗi từ Excel
            public string GioiTinh { get; set; }
            public string AnhDaiDien { get; set; }
            public int MaVaiTro { get; set; }
            public string TrangThai { get; set; }
        }

        public class ImportDiemRenLuyen
        {
            public int MaDiemRenLuyen { get; set; }
            public string MaSv { get; set; }
            public int MaHocKy { get; set; }
            public int TongDiem { get; set; }
            public string XepLoai { get; set; }
            public string NgayChot { get; set; } // Chuỗi từ Excel
            public string TrangThai { get; set; }
        }

        [HttpPost("Them_nhieu_sinh_vien")]
        public async Task<IActionResult> Import([FromBody] ImportData data)
        {
            if (data == null || data.DanhSachSinhVien == null || data.DanhSachTaiKhoan == null || data.DanhSachDiemRenLuyen == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu đầu vào không hợp lệ." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Thêm SinhVien
                foreach (var sv in data.DanhSachSinhVien)
                {
                    // Kiểm tra MaSV và MaTaiKhoan
                    if (string.IsNullOrEmpty(sv.MaSV) || sv.MaSV.Length > 10)
                        return BadRequest(new { success = false, message = $"MaSV {sv.MaSV} không hợp lệ (tối đa 10 ký tự)." });
                    if (await _context.SinhViens.AnyAsync(s => s.MaSV == sv.MaSV))
                        continue;

                    // Kiểm tra MaLop
                    if (!string.IsNullOrEmpty(sv.MaLop) && !await _context.Lops.AnyAsync(l => l.MaLop == sv.MaLop))
                        return BadRequest(new { success = false, message = $"MaLop {sv.MaLop} không tồn tại." });

                    // Kiểm tra MaTaiKhoan
                    if (string.IsNullOrEmpty(sv.MaTaiKhoan) || sv.MaTaiKhoan.Length > 10)
                        return BadRequest(new { success = false, message = $"MaTaiKhoan {sv.MaTaiKhoan} không hợp lệ (tối đa 10 ký tự)." });

                    _context.SinhViens.Add(new EntitySinhVien
                    {
                        MaSV = sv.MaSV,
                        MaTaiKhoan = sv.MaTaiKhoan,
                        HoTen = sv.HoTen?.Length > 50 ? sv.HoTen.Substring(0, 50) : sv.HoTen,
                        MaLop = sv.MaLop,
                        Email = sv.Email?.Length > 100 ? sv.Email.Substring(0, 100) : sv.Email,
                        SoDienThoai = sv.SoDienThoai?.Length > 20 ? sv.SoDienThoai.Substring(0, 20) : sv.SoDienThoai,
                        DiaChi = sv.DiaChi?.Length > 255 ? sv.DiaChi.Substring(0, 255) : sv.DiaChi,
                        NgaySinh = DateTime.TryParse(sv.NgaySinh, out var ngaySinh) ? ngaySinh : DateTime.MinValue,
                        GioiTinh = sv.GioiTinh?.Length > 10 ? sv.GioiTinh.Substring(0, 10) : sv.GioiTinh,
                        AnhDaiDien = sv.AnhDaiDien?.Length > 255 ? sv.AnhDaiDien.Substring(0, 255) : sv.AnhDaiDien,
                        MaVaiTro = sv.MaVaiTro,
                        TrangThai = sv.TrangThai
                    });
                }
                await _context.SaveChangesAsync();

                // Thêm TaiKhoan
                foreach (var tk in data.DanhSachTaiKhoan)
                {
                    if (string.IsNullOrEmpty(tk.MaTaiKhoan) || tk.MaTaiKhoan.Length > 10)
                        return BadRequest(new { success = false, message = $"MaTaiKhoan {tk.MaTaiKhoan} không hợp lệ (tối đa 10 ký tự)." });
                    if (await _context.TaiKhoans.AnyAsync(t => t.MaTaiKhoan == tk.MaTaiKhoan))
                        continue;

                    if (tk.MatKhau?.Length > 50)
                        return BadRequest(new { success = false, message = $"MatKhau cho {tk.MaTaiKhoan} quá dài (tối đa 50 ký tự)." });

                    _context.TaiKhoans.Add(new TaiKhoan
                    {
                        MaTaiKhoan = tk.MaTaiKhoan,
                        TenDangNhap = tk.TenDangNhap?.Length > 50 ? tk.TenDangNhap.Substring(0, 50) : tk.TenDangNhap,
                        MatKhau = tk.MatKhau,
                        VaiTro = tk.VaiTro?.Length > 20 ? tk.VaiTro.Substring(0, 20) : tk.VaiTro
                    });
                }
                await _context.SaveChangesAsync();

                // Thêm DiemRenLuyen
                foreach (var drl in data.DanhSachDiemRenLuyen)
                {
                    if (await _context.DiemRenLuyens.AnyAsync(d => d.MaDiemRenLuyen == drl.MaDiemRenLuyen))
                        continue;

                    if (!await _context.SinhViens.AnyAsync(s => s.MaSV == drl.MaSv))
                        return BadRequest(new { success = false, message = $"MaSV {drl.MaSv} không tồn tại." });

                    if (!await _context.HocKies.AnyAsync(h => h.MaHocKy == drl.MaHocKy))
                        return BadRequest(new { success = false, message = $"MaHocKy {drl.MaHocKy} không tồn tại." });

                    _context.DiemRenLuyens.Add(new DiemRenLuyen
                    {
                        MaDiemRenLuyen = drl.MaDiemRenLuyen,
                        MaSv = drl.MaSv,
                        MaHocKy = drl.MaHocKy,
                        TongDiem = drl.TongDiem,
                        XepLoai = drl.XepLoai?.Length > 50 ? drl.XepLoai.Substring(0, 50) : drl.XepLoai,
                        NgayChot = DateTime.TryParse(drl.NgayChot, out var ngayChot) ? ngayChot : DateTime.Now,
                        TrangThai = drl.TrangThai?.Length > 50 ? drl.TrangThai.Substring(0, 50) : drl.TrangThai
                    });
                }
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { success = true, message = "Import thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}