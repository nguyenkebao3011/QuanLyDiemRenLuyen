using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;
using System;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ThongBaoHoatDong : ControllerBase
    {
        private readonly QlDrlContext _context;

        public ThongBaoHoatDong(QlDrlContext context)
        {
            _context = context;
        }

        private string GetMaSinhVienFromToken()
        {
            return User.FindFirstValue("MaSv") ?? User.Identity?.Name;
        }

        [HttpGet("ThongBao-Thay-Doi-va-nhac-nho")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTOSV>>> GetThongBaoBySinhVien()
        {
            var maSv = GetMaSinhVienFromToken();
            if (string.IsNullOrEmpty(maSv))
                return Unauthorized("Không tìm thấy mã sinh viên trong token.");

            var thongBaos = await _context.ChiTietThongBaos
                .Where(ct => ct.MaSv == maSv)
                .Join(_context.ThongBaos
                    .Where(tb => tb.LoaiThongBao == "Thay đổi lịch trình"
                              || tb.LoaiThongBao == "Nhắc nhở hoạt động"
                              || tb.LoaiThongBao == "Chỉ định sinh viên"),
                    ct => ct.MaThongBao,
                    tb => tb.MaThongBao,
                    (ct, tb) => new ThongBaoDTOSV
                    {
                        MaThongBao = tb.MaThongBao,
                        MaChiTietThongBao = ct.MaChiTietThongBao,
                        TieuDe = tb.TieuDe,
                        NoiDung = tb.NoiDung,
                        NgayTao = tb.NgayTao,
                        DaDoc = ct.DaDoc ?? false,
                        NgayDoc = ct.NgayDoc,
                        LoaiThongBao = tb.LoaiThongBao
                    })
                .OrderByDescending(tb => tb.NgayTao)
                .ToListAsync();

            return Ok(thongBaos);
        }

        [HttpPost("{maChiTietThongBao}/respond")]
        public async Task<IActionResult> RespondToAssignment(int maChiTietThongBao, [FromBody] RespondRequest request)
        {
            // Lấy MaSv từ token
            var maSv = GetMaSinhVienFromToken();
            if (string.IsNullOrEmpty(maSv))
                return Unauthorized("Không tìm thấy mã sinh viên trong token.");
            // Lấy tên sinh viên
            var sinhVien = await _context.SinhViens
                .FirstOrDefaultAsync(sv => sv.MaSV == maSv);
            if (sinhVien == null)
                return NotFound("Không tìm thấy thông tin sinh viên");
            // Kiểm tra thông báo với MaSv từ token
            var chiTiet = await _context.ChiTietThongBaos
                .FirstOrDefaultAsync(ct => ct.MaChiTietThongBao == maChiTietThongBao && ct.MaSv == maSv);
            if (chiTiet == null)
                return NotFound("Thông báo không tồn tại hoặc không thuộc về sinh viên này");

            var thongBao = await _context.ThongBaos
                .FirstOrDefaultAsync(tb => tb.MaThongBao == chiTiet.MaThongBao);
            if (thongBao == null)
                return NotFound("Thông báo gốc không tồn tại");

            var maHoatDongMatch = Regex.Match(thongBao.NoiDung, @"\[MaHoatDong:(\w+)\]");
            if (!maHoatDongMatch.Success)
                return BadRequest("Không tìm thấy MaHoatDong trong thông báo");
            var maHoatDong = maHoatDongMatch.Groups[1].Value;

            int maHoatDongInt;
            if (!int.TryParse(maHoatDong, out maHoatDongInt))
                return BadRequest("MaHoatDong không hợp lệ");

            var daDangKy = await _context.DangKyHoatDongs
                .AnyAsync(dk => dk.MaSv == maSv && dk.MaHoatDong == maHoatDongInt);
            if (daDangKy || chiTiet.DaDoc == true)
                return BadRequest("Thông báo này đã được phản hồi hoặc đã đọc");

            chiTiet.DaDoc = true;
            chiTiet.NgayDoc = DateTime.Now;
            await _context.SaveChangesAsync();

            var hoatDong = await _context.HoatDongs
                .FirstOrDefaultAsync(hd => hd.MaHoatDong == maHoatDongInt);
            if (hoatDong == null)
                return NotFound("Không tìm thấy hoạt động tương ứng với MaHoatDong");

            if (request.Response == "XacNhan")
            {
                var dangKy = new DangKyHoatDong
                {
                    MaSv = maSv,
                    
                    MaHoatDong = maHoatDongInt,
                    NgayDangKy = DateTime.Now,
                    TrangThai = "Đăng ký thành công"
                };

                if (hoatDong.SoLuongDaDangKy >= hoatDong.SoLuongToiDa)
                    return BadRequest("Hoạt động đã đủ số lượng đăng ký");

                hoatDong.SoLuongDaDangKy += 1;
                _context.DangKyHoatDongs.Add(dangKy);
                await _context.SaveChangesAsync();
            }
            else if (request.Response == "TuChoi")
            {
                if (string.IsNullOrEmpty(request.LyDoTuChoi))
                    return BadRequest("Vui lòng cung cấp lý do từ chối.");

                var thongBaoTuChoi = new ThongBao
                {
                    TieuDe = $"Sinh viên từ chối tham gia hoạt động '{hoatDong.TenHoatDong}'",
                    NoiDung = $"Sinh viên {sinhVien.HoTen} đã từ chối tham gia hoạt động '{hoatDong.TenHoatDong}', vì lý do '{request.LyDoTuChoi}'. Hãy chỉ định sinh viên khác.",
                    NgayTao = DateTime.Now,
                    LoaiThongBao = "Từ chối hoạt động",
                    TrangThai = "DaGui"
                };
                _context.ThongBaos.Add(thongBaoTuChoi);
                await _context.SaveChangesAsync();

                var chiTietThongBaoGV = new ChiTietThongBao
                {
                    MaThongBao = thongBaoTuChoi.MaThongBao,
                    MaGV = chiTiet.MaGV,
                    DaDoc = false
                };
                _context.ChiTietThongBaos.Add(chiTietThongBaoGV);
                await _context.SaveChangesAsync();
            }
            else
            {
                return BadRequest("Phản hồi không hợp lệ. Chỉ chấp nhận 'XacNhan' hoặc 'TuChoi'.");
            }

            return Ok("Phản hồi thành công.");
        }
        private async Task<string> GetMaGiangVienFromToken()
        {
            var email = User.Identity?.Name;
            if (string.IsNullOrEmpty(email))
                return null;

            var maGV = await _context.GiaoViens
                .Where(gv => gv.Email == email)
                .Select(gv => gv.MaGv)
                .FirstOrDefaultAsync();

            return maGV;
        }
        [HttpPut("doc/{maThongBao}")]
        public async Task<IActionResult> MarkAsRead(int maThongBao)
        {
            var maSv = GetMaSinhVienFromToken();
            var maGV = await GetMaGiangVienFromToken();

            if (string.IsNullOrEmpty(maSv) && string.IsNullOrEmpty(maGV))
                return Unauthorized("Không tìm thấy mã sinh viên hoặc mã giảng viên trong token.");

            var chiTietThongBao = await _context.ChiTietThongBaos
                .FirstOrDefaultAsync(ct => ct.MaThongBao == maThongBao &&
                                         (ct.MaSv == maSv || ct.MaGV == maGV));

            if (chiTietThongBao == null)
                return NotFound("Không tìm thấy thông báo.");

            chiTietThongBao.DaDoc = true;
            chiTietThongBao.NgayDoc = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpGet("ThongBao-GiangVien")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTOSV>>> GetThongBaoByGiangVien()
        {
            var email = User.Identity?.Name;
            if (string.IsNullOrEmpty(email))
                return Unauthorized("Không tìm thấy email trong token.");

            // Ánh xạ email sang MaGV
            var giangVien = await _context.GiaoViens
                .Where(gv => gv.Email == email)
                .Select(gv => gv.MaGv)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(giangVien))
                return Unauthorized("Không tìm thấy mã giảng viên tương ứng với email.");

            var thongBaos = await _context.ChiTietThongBaos
                .Where(ct => ct.MaGV == giangVien)
                .Join(_context.ThongBaos
                    .Where(tb => tb.LoaiThongBao == "Từ chối hoạt động"),
                    ct => ct.MaThongBao,
                    tb => tb.MaThongBao,
                    (ct, tb) => new ThongBaoDTOSV
                    {
                        MaThongBao = tb.MaThongBao,
                        MaChiTietThongBao = ct.MaChiTietThongBao,
                        TieuDe = tb.TieuDe,
                        NoiDung = tb.NoiDung,
                        NgayTao = tb.NgayTao,
                        DaDoc = ct.DaDoc ?? false,
                        NgayDoc = ct.NgayDoc,
                        LoaiThongBao = tb.LoaiThongBao
                    })
                .OrderByDescending(tb => tb.NgayTao)
                .ToListAsync();

            return Ok(thongBaos);
        }
        }

        public class RespondRequest
    {
        public int MaChiTietThongBao { get; set; }
        public string Response { get; set; }
        public string? LyDoTuChoi { get; set; } // Có thể null nếu Response là "XacNhan"
    }
}