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
                if (!jsonElement.TryGetProperty("MaDangKy", out var maDangKyElement) ||
                    !jsonElement.TryGetProperty("MaQl", out var maQlElement))
                {
                    return BadRequest("Thiếu thông tin mã đăng ký hoặc mã quản lý");
                }

                int maDangKy;
                string maQl;
                string ghiChu = null;

                if (!maDangKyElement.TryGetInt32(out maDangKy))
                {
                    return BadRequest("Mã đăng ký không hợp lệ, phải là số nguyên");
                }

                maQl = maQlElement.GetString();
                if (string.IsNullOrEmpty(maQl))
                {
                    return BadRequest("Mã quản lý không được để trống");
                }

                if (jsonElement.TryGetProperty("GhiChu", out var ghiChuElement) &&
                    ghiChuElement.ValueKind != JsonValueKind.Null)
                {
                    ghiChu = ghiChuElement.GetString();
                }

                // Lấy thông tin đăng ký, sinh viên, hoạt động
                var dangKy = await _context.DangKyHoatDongs
                    .Include(dk => dk.MaSvNavigation)
                    .Include(dk => dk.MaHoatDongNavigation)
                    .FirstOrDefaultAsync(dk => dk.MaDangKy == maDangKy);

                if (dangKy == null || dangKy.MaHoatDongNavigation == null || dangKy.MaSvNavigation == null)
                {
                    return NotFound("Không tìm thấy đăng ký hoặc thông tin sinh viên/hoạt động.");
                }

                var maSv = dangKy.MaSv;
                var maHocKy = dangKy.MaHoatDongNavigation.MaHocKy;
                var diemCong = dangKy.MaHoatDongNavigation.DiemCong ?? 0;

                // Xử lý điểm danh (update hoặc insert)
                var diemDanhCu = await _context.DiemDanhHoatDongs
                    .FirstOrDefaultAsync(dd => dd.MaDangKy == maDangKy);

                if (diemDanhCu != null)
                {
                    diemDanhCu.ThoiGianDiemDanh = DateTime.Now;
                    diemDanhCu.MaQl = maQl;
                    diemDanhCu.GhiChu = ghiChu;
                    _context.Entry(diemDanhCu).State = EntityState.Modified;
                }
                else
                {
                    var diemDanh = new DiemDanhHoatDong
                    {
                        MaDangKy = maDangKy,
                        ThoiGianDiemDanh = DateTime.Now,
                        MaQl = maQl,
                        GhiChu = ghiChu
                    };
                    _context.DiemDanhHoatDongs.Add(diemDanh);
                }

                // === KIỂM SOÁT CỘNG TRÙNG ĐIỂM RÈN LUYỆN VÀ RÀNG BUỘC ĐIỂM TỐI ĐA ===
                var diemRenLuyen = await _context.DiemRenLuyens
                    .FirstOrDefaultAsync(drl => drl.MaSv == maSv && drl.MaHocKy == maHocKy);

                // Nếu đã chốt, không cộng nữa
                if (diemRenLuyen != null &&
                    !string.IsNullOrEmpty(diemRenLuyen.TrangThai) &&
                    diemRenLuyen.TrangThai.Trim().ToLower() == "đã chốt")
                {
                    await _context.SaveChangesAsync(); // vẫn lưu điểm danh
                    return BadRequest(new { success = false, message = "Điểm rèn luyện đã chốt, không thể cộng thêm điểm!" });
                }

                // Kiểm tra đã điểm danh (và cộng điểm) cho hoạt động này trong học kỳ này chưa
                bool daCongDiem = diemDanhCu != null;
                if (diemRenLuyen == null)
                {
                    diemRenLuyen = new DiemRenLuyen
                    {
                        MaSv = maSv,
                        MaHocKy = maHocKy,
                        TongDiem = Math.Min(diemCong, 100)
                    };
                    _context.DiemRenLuyens.Add(diemRenLuyen);
                }
                else if (!daCongDiem)
                {
                    var diemMoi = (diemRenLuyen.TongDiem ?? 0) + diemCong;
                    diemRenLuyen.TongDiem = diemMoi > 100 ? 100 : diemMoi;
                    _context.Entry(diemRenLuyen).State = EntityState.Modified;
                }
                else
                {
                    // Đã điểm danh trước đó, không trả thông báo cộng điểm
                    await _context.SaveChangesAsync();
                    return NoContent();
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Điểm danh và cộng điểm rèn luyện thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: api/DiemDanh/DiemDanhNhom
        [HttpPost("DiemDanhNhom")]
        public async Task<IActionResult> DiemDanhNhom([FromBody] JsonElement jsonElement)
        {
            try
            {
                if (!jsonElement.TryGetProperty("DanhSachMaDangKy", out var danhSachElement) ||
                    !jsonElement.TryGetProperty("MaQl", out var maQlElement))
                {
                    return BadRequest("Thiếu thông tin danh sách mã đăng ký hoặc mã quản lý");
                }

                string maQl = maQlElement.GetString();
                if (string.IsNullOrEmpty(maQl))
                {
                    return BadRequest("Mã quản lý không được để trống");
                }

                // Lấy danh sách mã đăng ký
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
                    return BadRequest($"Không tìm thấy quản lý khoa với mã {maQl}");
                }

                int demDiemDanh = 0;
                int demCongDiem = 0;
                List<string> danhSachKhongDuocCongDiem = new List<string>();
                List<string> danhSachDaDiemDanhTruoc = new List<string>();

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    foreach (var maDangKy in danhSachMaDangKy)
                    {
                        var dangKy = await _context.DangKyHoatDongs
                            .Include(dk => dk.MaSvNavigation)
                            .Include(dk => dk.MaHoatDongNavigation)
                            .FirstOrDefaultAsync(dk => dk.MaDangKy == maDangKy);

                        if (dangKy == null || dangKy.MaHoatDongNavigation == null || dangKy.MaSvNavigation == null)
                        {
                            continue;
                        }

                        var maSv = dangKy.MaSv;
                        var maHocKy = dangKy.MaHoatDongNavigation.MaHocKy;
                        var diemCong = dangKy.MaHoatDongNavigation.DiemCong ?? 0;

                        // Xử lý điểm danh (update hoặc insert)
                        var diemDanhCu = await _context.DiemDanhHoatDongs
                            .FirstOrDefaultAsync(dd => dd.MaDangKy == maDangKy);

                        if (diemDanhCu != null)
                        {
                            diemDanhCu.ThoiGianDiemDanh = DateTime.Now;
                            diemDanhCu.MaQl = maQl;
                            diemDanhCu.GhiChu = ghiChu;
                            _context.Entry(diemDanhCu).State = EntityState.Modified;
                        }
                        else
                        {
                            var diemDanh = new DiemDanhHoatDong
                            {
                                MaDangKy = maDangKy,
                                ThoiGianDiemDanh = DateTime.Now,
                                MaQl = maQl,
                                GhiChu = ghiChu
                            };
                            _context.DiemDanhHoatDongs.Add(diemDanh);
                        }
                        demDiemDanh++;

                        var diemRenLuyen = await _context.DiemRenLuyens
                            .FirstOrDefaultAsync(drl => drl.MaSv == maSv && drl.MaHocKy == maHocKy);

                        // Nếu đã chốt thì không cộng, thêm vào danh sách thông báo
                        if (diemRenLuyen != null &&
                            !string.IsNullOrEmpty(diemRenLuyen.TrangThai) &&
                            diemRenLuyen.TrangThai.Trim().ToLower() == "đã chốt")
                        {
                            danhSachKhongDuocCongDiem.Add($"{maSv} ({dangKy.MaSvNavigation.HoTen})");
                            continue;
                        }

                        // Kiểm tra đã cộng điểm cho hoạt động này chưa (dựa vào điểm danh)
                        bool daCongDiem = false;
                        if (diemRenLuyen != null)
                        {
                            daCongDiem = diemDanhCu != null;
                        }

                        if (diemRenLuyen == null)
                        {
                            diemRenLuyen = new DiemRenLuyen
                            {
                                MaSv = maSv,
                                MaHocKy = maHocKy,
                                TongDiem = Math.Min(diemCong, 100)
                            };
                            _context.DiemRenLuyens.Add(diemRenLuyen);
                            demCongDiem++;
                        }
                        else if (!daCongDiem)
                        {
                            var diemMoi = (diemRenLuyen.TongDiem ?? 0) + diemCong;
                            diemRenLuyen.TongDiem = diemMoi > 100 ? 100 : diemMoi;
                            _context.Entry(diemRenLuyen).State = EntityState.Modified;
                            demCongDiem++;
                        }
                        else
                        {
                            // Đã điểm danh trước đó, không cộng điểm, không đưa vào thông báo
                            danhSachDaDiemDanhTruoc.Add($"{maSv} ({dangKy.MaSvNavigation.HoTen})");
                            continue;
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    string message = $"Đã điểm danh {demDiemDanh} lượt, cộng điểm rèn luyện cho {demCongDiem} sinh viên.";
                    if (danhSachKhongDuocCongDiem.Any())
                    {
                        message += $" Các sinh viên không được cộng điểm do đã chốt điểm rèn luyện: {string.Join(", ", danhSachKhongDuocCongDiem)}";
                    }

                    // Không thông báo ai đã điểm danh trước đó
                    return Ok(new { success = true, message });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { success = false, message = $"Lỗi khi điểm danh nhóm: {ex.Message}" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: api/DiemDanh/HoanThanhDiemDanh/{maHoatDong}
        [HttpPost("HoanThanhDiemDanh/{maHoatDong}")]
        public async Task<IActionResult> HoanThanhDiemDanh(int maHoatDong)
        {
            // 1. Tìm hoạt động
            var hoatDong = await _context.HoatDongs.FirstOrDefaultAsync(h => h.MaHoatDong == maHoatDong);
            if (hoatDong == null)
                return NotFound("Không tìm thấy hoạt động");

            // 2. Cập nhật trạng thái hoạt động
            hoatDong.TrangThai = "Đã kết thúc";
            _context.Entry(hoatDong).State = EntityState.Modified;

            // 3. Lấy điểm cộng của hoạt động
            double diemCong = hoatDong.DiemCong ?? 0;

            // 4. Lấy danh sách đăng ký chưa điểm danh
            var danhSachDangKyChuaDiemDanh = await _context.DangKyHoatDongs
                .Where(dk => dk.MaHoatDong == maHoatDong && dk.TrangThai == "Đăng ký thành công")
                .Include(dk => dk.MaSvNavigation)
                .Include(dk => dk.MaHoatDongNavigation)
                .Include(dk => dk.DiemDanhHoatDongs)
                .ToListAsync();

            int soSinhVienTruDiem = 0;
            foreach (var dangKy in danhSachDangKyChuaDiemDanh)
            {
                if (dangKy.DiemDanhHoatDongs.Any()) continue; // Đã điểm danh thì bỏ qua

                var maSv = dangKy.MaSv;
                var maHocKy = dangKy.MaHoatDongNavigation.MaHocKy;

                var diemRenLuyen = await _context.DiemRenLuyens
                    .FirstOrDefaultAsync(drl => drl.MaSv == maSv && drl.MaHocKy == maHocKy);

                // Nếu đã chốt thì không trừ điểm nữa
                if (diemRenLuyen == null ||
                    (diemRenLuyen.TrangThai != null && diemRenLuyen.TrangThai.Trim().ToLower() == "đã chốt"))
                    continue;

                // Trừ điểm, không cho điểm âm
                diemRenLuyen.TongDiem = Math.Max((diemRenLuyen.TongDiem ?? 0) - diemCong, 0);
                _context.Entry(diemRenLuyen).State = EntityState.Modified;

                soSinhVienTruDiem++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = $"Đã chuyển hoạt động sang trạng thái 'Đã kết thúc'. Đã tự động trừ điểm cho {soSinhVienTruDiem} sinh viên không điểm danh." });
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