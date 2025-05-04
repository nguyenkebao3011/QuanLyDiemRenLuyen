using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiemDanhController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public DiemDanhController(QlDrlContext context)
        {
            _context = context;
        }

        // GET: api/DiemDanh/DanhSachHoatDong
        [HttpGet("DanhSachHoatDong")]
        public async Task<ActionResult> GetDanhSachHoatDong()
        {
            var danhSachHoatDong = await _context.HoatDongs
                .Where(h => h.TrangThai == "Đang diễn ra" ||  h.TrangThai == "Đã đóng đăng ký")
                .OrderByDescending(h => h.NgayBatDau)
                .Select(h => new
                {
                    MaHoatDong = h.MaHoatDong,
                    TenHoatDong = h.TenHoatDong,
                    NgayBatDau = h.NgayBatDau,
                    NgayKetThuc = h.NgayKetThuc,
                    DiaDiem = h.DiaDiem,
                    MaHocKy = h.MaHocKy,
                    TenHocKy = h.MaHocKyNavigation.TenHocKy,
                    NamHoc = h.MaHocKyNavigation.NamHoc,
                    MaQl = h.MaQl,
                    TenQl = h.MaQlNavigation.HoTen,
                    SoLuongDaDangKy = h.SoLuongDaDangKy,
                    TrangThai = h.TrangThai
                })
                .ToListAsync();

            return Ok(danhSachHoatDong);
        }

        // GET: api/DiemDanh/DanhSachSinhVien/{maHoatDong}
        [HttpGet("DanhSachSinhVien/{maHoatDong}")]
        public async Task<ActionResult> GetDanhSachSinhVienDangKy(int maHoatDong)
        {
            var danhSachDangKy = await _context.DangKyHoatDongs
                .Where(dk => dk.MaHoatDong == maHoatDong && dk.TrangThai == "Đăng ký thành công")
                .Include(dk => dk.MaSvNavigation)
                    .ThenInclude(sv => sv.MaLopNavigation)
                .Include(dk => dk.DiemDanhHoatDongs)
                .Select(dk => new
                {
                    MaDangKy = dk.MaDangKy,
                    MaSv = dk.MaSv,
                    HoTen = dk.MaSvNavigation.HoTen,
                    Lop = dk.MaSvNavigation.MaLopNavigation.TenLop,
                    DaDiemDanh = dk.DiemDanhHoatDongs.Any(),
                    ThoiGianDiemDanh = dk.DiemDanhHoatDongs
                        .OrderByDescending(d => d.ThoiGianDiemDanh)
                        .FirstOrDefault().ThoiGianDiemDanh,
                    GhiChu = dk.DiemDanhHoatDongs
                        .OrderByDescending(d => d.ThoiGianDiemDanh)
                        .FirstOrDefault().GhiChu
                })
                .ToListAsync();

            return Ok(danhSachDangKy);
        }

        // GET: api/DiemDanh/ThongTinHoatDong/{maHoatDong}
        [HttpGet("ThongTinHoatDong/{maHoatDong}")]
        public async Task<ActionResult> GetThongTinHoatDong(int maHoatDong)
        {
            var hoatDong = await _context.HoatDongs
                .Include(h => h.MaHocKyNavigation)
                .Include(h => h.MaQlNavigation)
                .FirstOrDefaultAsync(h => h.MaHoatDong == maHoatDong);

            if (hoatDong == null)
            {
                return NotFound("Không tìm thấy hoạt động");
            }

            var totalRegistered = await _context.DangKyHoatDongs
                .CountAsync(dk => dk.MaHoatDong == maHoatDong && dk.TrangThai == "Đăng ký thành công");

            var totalAttended = await _context.DangKyHoatDongs
                .Where(dk => dk.MaHoatDong == maHoatDong &&
                      dk.TrangThai == "Đăng ký thành công" &&
                      dk.DiemDanhHoatDongs.Any())
                .CountAsync();

            var result = new
            {
                MaHoatDong = hoatDong.MaHoatDong,
                TenHoatDong = hoatDong.TenHoatDong,
                MoTa = hoatDong.MoTa,
                NgayBatDau = hoatDong.NgayBatDau,
                NgayKetThuc = hoatDong.NgayKetThuc,
                DiaDiem = hoatDong.DiaDiem,
                SoLuongToiDa = hoatDong.SoLuongToiDa,
                DiemCong = hoatDong.DiemCong,
                MaHocKy = hoatDong.MaHocKy,
                TenHocKy = hoatDong.MaHocKyNavigation?.TenHocKy,
                NamHoc = hoatDong.MaHocKyNavigation?.NamHoc,
                MaQl = hoatDong.MaQl,
                TenQl = hoatDong.MaQlNavigation?.HoTen,
                TrangThai = hoatDong.TrangThai,
                SoLuongDangKy = totalRegistered,
                SoLuongDiemDanh = totalAttended,
                TiLeDiemDanh = totalRegistered > 0 ? (double)totalAttended / totalRegistered * 100 : 0
            };

            return Ok(result);
        }

        // POST: api/DiemDanh/DiemDanhSinhVien
        [HttpPost("DiemDanhSinhVien")]
        public async Task<IActionResult> DiemDanhSinhVien([FromBody] JsonElement jsonElement)
        {
            try
            {
                // Ghi nhật ký để theo dõi quá trình thực hiện
                Console.WriteLine("Bắt đầu điểm danh sinh viên");

                // Kiểm tra jsonElement có các thuộc tính cần thiết không
                if (!jsonElement.TryGetProperty("MaDangKy", out var maDangKyElement) ||
                    !jsonElement.TryGetProperty("MaQl", out var maQlElement))
                {
                    return BadRequest("Thiếu thông tin mã đăng ký hoặc mã quản lý");
                }

                // Hiển thị log để xem dữ liệu nhận được
                Console.WriteLine($"Dữ liệu nhận được: MaDangKy={maDangKyElement}, MaQl={maQlElement}");

                // Chuyển đổi giá trị từ JsonElement sang kiểu dữ liệu cần thiết
                int maDangKy;
                string maQl;
                string ghiChu = null;

                // Chuyển đổi maDangKy (phải là số nguyên)
                if (!maDangKyElement.TryGetInt32(out maDangKy))
                {
                    return BadRequest("Mã đăng ký không hợp lệ, phải là số nguyên");
                }

                // Chuyển đổi maQl
                maQl = maQlElement.GetString();
                if (string.IsNullOrEmpty(maQl))
                {
                    return BadRequest("Mã quản lý không được để trống");
                }

                // Chuyển đổi ghiChu (nếu có)
                if (jsonElement.TryGetProperty("GhiChu", out var ghiChuElement) &&
                    ghiChuElement.ValueKind != JsonValueKind.Null)
                {
                    ghiChu = ghiChuElement.GetString();
                }

                Console.WriteLine($"Sau khi chuyển đổi: maDangKy={maDangKy}, maQl={maQl}, ghiChu={ghiChu}");

                // Kiểm tra đăng ký tồn tại
                var dangKy = await _context.DangKyHoatDongs.FindAsync(maDangKy);
                if (dangKy == null)
                {
                    Console.WriteLine($"Không tìm thấy đăng ký hoạt động với mã {maDangKy}");
                    return NotFound($"Không tìm thấy đăng ký hoạt động với mã {maDangKy}");
                }
                Console.WriteLine($"Đã tìm thấy đăng ký: MaDangKy={dangKy.MaDangKy}, MaSV={dangKy.MaSv}");

                // Kiểm tra quản lý khoa tồn tại
                var quanLyKhoa = await _context.QuanLyKhoas.FindAsync(maQl);
                if (quanLyKhoa == null)
                {
                    Console.WriteLine($"Không tìm thấy quản lý khoa với mã {maQl}");
                    return BadRequest($"Không tìm thấy quản lý khoa với mã {maQl}");
                }
                Console.WriteLine($"Đã tìm thấy quản lý khoa: MaQl={quanLyKhoa.MaQl}");

                // Kiểm tra xem đã điểm danh chưa
                var diemDanhCu = await _context.DiemDanhHoatDongs
                    .FirstOrDefaultAsync(dd => dd.MaDangKy == maDangKy);

                if (diemDanhCu != null)
                {
                    Console.WriteLine($"Đã tìm thấy điểm danh cũ: MaDiemDanh={diemDanhCu.MaDiemDanh}, MaDangKy={diemDanhCu.MaDangKy}");

                    // Cập nhật điểm danh cũ
                    diemDanhCu.ThoiGianDiemDanh = DateTime.Now; // Sử dụng DateTime.Now thay vì UTC
                    diemDanhCu.MaQl = maQl;
                    diemDanhCu.GhiChu = ghiChu;

                    _context.Entry(diemDanhCu).State = EntityState.Modified;
                    Console.WriteLine("Đã cập nhật điểm danh cũ");
                }
                else
                {
                    Console.WriteLine("Chưa có điểm danh, tạo mới");

                    // Tạo điểm danh mới
                    var diemDanh = new DiemDanhHoatDong
                    {
                        MaDangKy = maDangKy,
                        ThoiGianDiemDanh = DateTime.Now, // Sử dụng DateTime.Now thay vì UTC
                        MaQl = maQl,
                        GhiChu = ghiChu
                    };

                    _context.DiemDanhHoatDongs.Add(diemDanh);
                    Console.WriteLine($"Đã tạo điểm danh mới: MaDangKy={diemDanh.MaDangKy}, MaQl={diemDanh.MaQl}");
                }

                // Lưu thay đổi
                Console.WriteLine("Bắt đầu lưu thay đổi vào DB");
                await _context.SaveChangesAsync();
                Console.WriteLine("Đã lưu thay đổi vào DB");

                return Ok(new { success = true, message = "Điểm danh thành công" });
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Lỗi DbUpdateException: {dbEx.Message}");
                if (dbEx.InnerException != null)
                    Console.WriteLine($"Inner Exception: {dbEx.InnerException.Message}");

                return BadRequest(new { success = false, message = $"Lỗi cập nhật DB: {dbEx.Message}", details = dbEx.InnerException?.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi Exception: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");

                return BadRequest(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: api/DiemDanh/DiemDanhNhom
        [HttpPost("DiemDanhNhom")]
        public async Task<IActionResult> DiemDanhNhom([FromBody] JsonElement jsonElement)
        {
            try
            {
                // Ghi log để theo dõi
                Console.WriteLine("Bắt đầu xử lý điểm danh nhóm");

                // Kiểm tra jsonElement có các thuộc tính cần thiết không
                if (!jsonElement.TryGetProperty("DanhSachMaDangKy", out var danhSachElement) ||
                    !jsonElement.TryGetProperty("MaQl", out var maQlElement))
                {
                    return BadRequest("Thiếu thông tin danh sách mã đăng ký hoặc mã quản lý");
                }

                // Kiểm tra mã quản lý
                string maQl = maQlElement.GetString();
                if (string.IsNullOrEmpty(maQl))
                {
                    return BadRequest("Mã quản lý không được để trống");
                }

                Console.WriteLine($"MaQl: {maQl}");

                // Kiểm tra danh sách mã đăng ký
                if (danhSachElement.ValueKind != JsonValueKind.Array)
                {
                    return BadRequest("Danh sách mã đăng ký phải là một mảng");
                }

                List<int> danhSachMaDangKy = new List<int>();
                foreach (JsonElement item in danhSachElement.EnumerateArray())
                {
                    if (item.TryGetInt32(out int maDangKy))
                    {
                        danhSachMaDangKy.Add(maDangKy);
                    }
                    else
                    {
                        return BadRequest("Danh sách mã đăng ký chứa giá trị không hợp lệ");
                    }
                }

                if (danhSachMaDangKy.Count == 0)
                {
                    return BadRequest("Danh sách mã đăng ký không được để trống");
                }

                Console.WriteLine($"Số lượng mã đăng ký: {danhSachMaDangKy.Count}");

                // Lấy ghi chú (nếu có)
                string ghiChu = null;
                if (jsonElement.TryGetProperty("GhiChu", out var ghiChuElement) &&
                    ghiChuElement.ValueKind != JsonValueKind.Null)
                {
                    ghiChu = ghiChuElement.GetString();
                }

                // Kiểm tra quản lý khoa tồn tại
                var quanLyKhoa = await _context.QuanLyKhoas.FindAsync(maQl);
                if (quanLyKhoa == null)
                {
                    Console.WriteLine($"Không tìm thấy quản lý khoa với mã {maQl}");
                    return BadRequest($"Không tìm thấy quản lý khoa với mã {maQl}");
                }
                Console.WriteLine($"Đã tìm thấy quản lý khoa: {quanLyKhoa.MaQl}");

                // Sử dụng transaction để đảm bảo tính nhất quán
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    int successCount = 0;
                    foreach (var maDangKy in danhSachMaDangKy)
                    {
                        // Kiểm tra đăng ký tồn tại
                        var dangKy = await _context.DangKyHoatDongs.FindAsync(maDangKy);
                        if (dangKy == null)
                        {
                            Console.WriteLine($"Không tìm thấy đăng ký với mã {maDangKy}, bỏ qua");
                            continue;
                        }

                        // Kiểm tra đã điểm danh chưa
                        var diemDanhCu = await _context.DiemDanhHoatDongs
                            .FirstOrDefaultAsync(dd => dd.MaDangKy == maDangKy);

                        if (diemDanhCu != null)
                        {
                            // Cập nhật điểm danh cũ
                            diemDanhCu.ThoiGianDiemDanh = DateTime.Now;
                            diemDanhCu.MaQl = maQl;
                            diemDanhCu.GhiChu = ghiChu;

                            _context.Entry(diemDanhCu).State = EntityState.Modified;
                            Console.WriteLine($"Cập nhật điểm danh cho mã đăng ký {maDangKy}");
                        }
                        else
                        {
                            // Tạo điểm danh mới
                            var diemDanh = new DiemDanhHoatDong
                            {
                                MaDangKy = maDangKy,
                                ThoiGianDiemDanh = DateTime.Now,
                                MaQl = maQl,
                                GhiChu = ghiChu
                            };

                            _context.DiemDanhHoatDongs.Add(diemDanh);
                            Console.WriteLine($"Tạo mới điểm danh cho mã đăng ký {maDangKy}");
                        }
                        successCount++;
                    }

                    // Lưu thay đổi
                    Console.WriteLine("Đang lưu thay đổi vào cơ sở dữ liệu...");
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    Console.WriteLine($"Hoàn thành điểm danh nhóm: {successCount}/{danhSachMaDangKy.Count} thành công");

                    return Ok(new
                    {
                        success = true,
                        message = $"Điểm danh thành công {successCount}/{danhSachMaDangKy.Count} sinh viên"
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Lỗi khi điểm danh nhóm: {ex.Message}");
                    if (ex.InnerException != null)
                        Console.WriteLine($"InnerException: {ex.InnerException.Message}");

                    return BadRequest(new
                    {
                        success = false,
                        message = $"Lỗi khi điểm danh nhóm: {ex.Message}"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi ngoại lệ: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");

                return BadRequest(new
                {
                    success = false,
                    message = $"Lỗi: {ex.Message}"
                });
            }
        }


        // GET: api/DiemDanh/BaoCaoDiemDanh/{maHoatDong}
        [HttpGet("BaoCaoDiemDanh/{maHoatDong}")]
        public async Task<ActionResult> BaoCaoDiemDanh(int maHoatDong)
        {
            var hoatDong = await _context.HoatDongs
                .Include(h => h.MaHocKyNavigation)
                .Include(h => h.MaQlNavigation)
                .FirstOrDefaultAsync(h => h.MaHoatDong == maHoatDong);

            if (hoatDong == null)
            {
                return NotFound("Không tìm thấy hoạt động");
            }

            var danhSachDiemDanh = await _context.DangKyHoatDongs
                .Where(dk => dk.MaHoatDong == maHoatDong && dk.TrangThai == "Đăng ký thành công")
                .Include(dk => dk.MaSvNavigation)
                    .ThenInclude(sv => sv.MaLopNavigation)
                .Include(dk => dk.DiemDanhHoatDongs)
                    .ThenInclude(dd => dd.MaQlNavigation)
                .Select(dk => new
                {
                    MaSv = dk.MaSv,
                    HoTen = dk.MaSvNavigation.HoTen,
                    Lop = dk.MaSvNavigation.MaLopNavigation.TenLop,
                    DaDiemDanh = dk.DiemDanhHoatDongs.Any(),
                    ThoiGianDiemDanh = dk.DiemDanhHoatDongs
                        .OrderByDescending(d => d.ThoiGianDiemDanh)
                        .FirstOrDefault().ThoiGianDiemDanh,
                    NguoiDiemDanh = dk.DiemDanhHoatDongs
                        .OrderByDescending(d => d.ThoiGianDiemDanh)
                        .FirstOrDefault().MaQlNavigation.HoTen,
                    GhiChu = dk.DiemDanhHoatDongs
                        .OrderByDescending(d => d.ThoiGianDiemDanh)
                        .FirstOrDefault().GhiChu
                })
                .OrderBy(x => x.Lop)
                .ThenBy(x => x.HoTen)
                .ToListAsync();

            var tongSinhVien = danhSachDiemDanh.Count();
            var tongDiemDanh = danhSachDiemDanh.Count(x => x.DaDiemDanh);
            var tiLeDiemDanh = tongSinhVien > 0 ? (double)tongDiemDanh / tongSinhVien * 100 : 0;

            var baoCao = new
            {
                ThongTinHoatDong = new
                {
                    MaHoatDong = hoatDong.MaHoatDong,
                    TenHoatDong = hoatDong.TenHoatDong,
                    HocKy = hoatDong.MaHocKyNavigation?.TenHocKy,
                    NamHoc = hoatDong.MaHocKyNavigation?.NamHoc,
                    NgayBatDau = hoatDong.NgayBatDau,
                    NgayKetThuc = hoatDong.NgayKetThuc,
                    DiaDiem = hoatDong.DiaDiem,
                    DiemCong = hoatDong.DiemCong,
                    NguoiQuanLy = hoatDong.MaQlNavigation?.HoTen
                },
                ThongKe = new
                {
                    TongSoSinhVien = tongSinhVien,
                    SoLuongDiemDanh = tongDiemDanh,
                    TiLeDiemDanh = tiLeDiemDanh
                },
                DanhSachDiemDanh = danhSachDiemDanh
            };

            return Ok(baoCao);
        }
    }
}