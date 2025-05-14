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

        // Hàm tiện ích lấy mã sinh viên từ token
        private string GetMaSinhVienFromToken()
        {
            return User.FindFirstValue("MaSv") ?? User.Identity?.Name;
        }

        // API lấy danh sách thông báo của sinh viên từ JWT
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
            // Kiểm tra thông báo
            var chiTiet = await _context.ChiTietThongBaos
                .FirstOrDefaultAsync(ct => ct.MaChiTietThongBao == maChiTietThongBao && ct.MaSv == request.MaSV);
            if (chiTiet == null)
                return NotFound("Thông báo không tồn tại hoặc không thuộc về sinh viên này");

            // Lấy thông báo gốc
            var thongBao = await _context.ThongBaos
                .FirstOrDefaultAsync(tb => tb.MaThongBao == chiTiet.MaThongBao);
            if (thongBao == null)
                return NotFound("Thông báo gốc không tồn tại");

            // Lấy MaHoatDong từ NoiDung
            var maHoatDongMatch = Regex.Match(thongBao.NoiDung, @"\[MaHoatDong:(\w+)\]");
            if (!maHoatDongMatch.Success)
                return BadRequest("Không tìm thấy MaHoatDong trong thông báo");
            var maHoatDong = maHoatDongMatch.Groups[1].Value;

            // Kiểm tra xem đã phản hồi chưa (dựa trên DangKyHoatDong hoặc DaDoc)
            int maHoatDongInt = int.Parse(maHoatDong);

            var daDangKy = await _context.DangKyHoatDongs
                .AnyAsync(dk => dk.MaSv == request.MaSV && dk.MaHoatDong == maHoatDongInt);
            if (daDangKy || chiTiet.DaDoc == true)
                return BadRequest("Thông báo này đã được phản hồi hoặc đã đọc");

            // Cập nhật trạng thái đọc
            chiTiet.DaDoc = true;
            chiTiet.NgayDoc = DateTime.Now;
            await _context.SaveChangesAsync();

            // Xử lý phản hồi
            if (request.Response == "XacNhan")
            {
                // Lưu vào bảng DangKyHoatDong
                var dangKy = new DangKyHoatDong
                {
                    MaSv = request.MaSV,
                    MaHoatDong = maHoatDongInt,
                    NgayDangKy = DateTime.Now,
                    TrangThai = "Đăng ký thành công (GVHD)"
                };
                var hoatDong = await _context.HoatDongs
            .FirstOrDefaultAsync(hd => hd.MaHoatDong == maHoatDongInt);

                if (hoatDong != null)
                {
                    hoatDong.SoLuongDaDangKy += 1;
                }
                  if (hoatDong.SoLuongDaDangKy >= hoatDong.SoLuongToiDa)
                return BadRequest("Hoạt động đã đủ số lượng đăng ký");
                _context.DangKyHoatDongs.Add(dangKy);
                await _context.SaveChangesAsync();
            }
            else if (request.Response == "TuChoi")
            {
                // Tạo thông báo từ chối gửi đến giảng viên
                var thongBaoTuChoi = new ThongBao
                {
                    TieuDe = $"Sinh viên từ chối tham gia hoạt động [MaHoatDong: {maHoatDong}]",
                    NoiDung = $"Sinh viên {request.MaSV} đã từ chối tham gia hoạt động [MaHoatDong: {maHoatDong}].",
                    NgayTao = DateTime.Now,
                   
                    LoaiThongBao = "Từ chối hoạt động",
                    TrangThai = "DaGui"
                };
                _context.ThongBaos.Add(thongBaoTuChoi);
                await _context.SaveChangesAsync();

                // Thêm vào ChiTietThongBao cho giảng viên
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

        // API đánh dấu thông báo đã đọc – dùng token
        [HttpPut("doc/{maThongBao}")]
        public async Task<IActionResult> MarkAsRead(int maThongBao)
        {
            var maSv = GetMaSinhVienFromToken();
            if (string.IsNullOrEmpty(maSv))
                return Unauthorized("Không tìm thấy mã sinh viên trong token.");

            var chiTietThongBao = await _context.ChiTietThongBaos
                .FirstOrDefaultAsync(ct => ct.MaThongBao == maThongBao && ct.MaSv == maSv);

            if (chiTietThongBao == null)
                return NotFound("Không tìm thấy thông báo.");

            chiTietThongBao.DaDoc = true;
            chiTietThongBao.NgayDoc = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class RespondRequest
    {
        public int MaChiTietThongBao { get; set; }
        public string MaSV { get; set; }
        public string Response { get; set; } // "XacNhan" hoặc "TuChoi"
    }
}