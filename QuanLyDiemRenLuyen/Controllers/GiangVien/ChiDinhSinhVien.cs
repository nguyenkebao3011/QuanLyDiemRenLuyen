using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System.Security.Claims;
using System.Security.Cryptography;

namespace QuanLyDiemRenLuyen.Controllers.GiangVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignStudentsRequest
    {
        public string MaHoatDong { get; set; } // Có thể để nullable hoặc bỏ nếu không dùng
        public List<string> MaSVs { get; set; }
    }
    public class ChiDinhSinhVien : ControllerBase
    {
        private readonly QlDrlContext _context;

        public ChiDinhSinhVien(QlDrlContext context)
        {
            _context = context;
        }

        [HttpPost("chi-dinh/{maHoatDong}/cho-sinh-vien")]
        public async Task<IActionResult> AssignStudents(string maHoatDong, [FromBody] AssignStudentsRequest request)
        {
            if (request == null || request.MaSVs == null || !request.MaSVs.Any())
            {
                return BadRequest("Danh sách mã sinh viên không hợp lệ.");
            }

            // Lấy email giảng viên từ token
            var giangVienEmail = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(giangVienEmail))
                return Unauthorized("Không tìm thấy email giảng viên trong token");

            // Tìm MaGV
            var giangVien = await _context.GiaoViens
                .FirstOrDefaultAsync(gv => gv.Email.ToLower() == giangVienEmail.ToLower());
            if (giangVien == null)
                return NotFound("Không tìm thấy giảng viên");

            // Kiểm tra sinh viên thuộc lớp của giảng viên
            var invalidStudents = await _context.SinhViens
                .Where(sv => request.MaSVs.Contains(sv.MaSV))
                .Where(sv => !_context.Lops.Any(l => l.MaLop == sv.MaLop && l.MaGv == giangVien.MaGv))
                .Select(sv => sv.MaSV)
                .ToListAsync();
            if (invalidStudents.Any())
                return BadRequest($"Sinh viên {string.Join(", ", invalidStudents)} không thuộc lớp do giảng viên quản lý");

            // Lấy thông tin hoạt động
            if (!int.TryParse(maHoatDong, out int maHoatDongInt))
                return BadRequest("Mã hoạt động không hợp lệ.");

            var hoatDong = await _context.HoatDongs
                .FirstOrDefaultAsync(hd => hd.MaHoatDong == maHoatDongInt);
            if (hoatDong == null)
                return NotFound("Không tìm thấy hoạt động");

            // Kiểm tra trạng thái hoạt động
            if (hoatDong.TrangThai == "Đã kết thúc" || hoatDong.TrangThai == "Đã hủy")
                return BadRequest("Hoạt động đã kết thúc hoặc bị hủy, không thể chỉ định sinh viên");

            // Kiểm tra sinh viên đã đăng ký hoạt động này chưa
            var sinhVienDaDangKy = await _context.DangKyHoatDongs
                .Where(dk => dk.MaHoatDong == maHoatDongInt && request.MaSVs.Contains(dk.MaSv))
                .Select(dk => dk.MaSv)
                .ToListAsync();
            if (sinhVienDaDangKy.Any())
            {
                return BadRequest($"Các sinh viên sau đã được chỉ định cho hoạt động này rồi: {string.Join(", ", sinhVienDaDangKy)}");
            }
            // Kiểm tra giảng viên đã chỉ định sinh viên cho hoạt động này chưa
            var maSinhVienDaChiDinh = await _context.ChiTietThongBaos
                 .Where(ct => request.MaSVs.Contains(ct.MaSv) && ct.MaGV == giangVien.MaGv)
                 .Join(_context.ThongBaos,
                     ct => ct.MaThongBao,
                     tb => tb.MaThongBao,
                     (ct, tb) => new { ct.MaSv, tb.NoiDung })
                 .Where(x => x.NoiDung.Contains($"[MaHoatDong:{maHoatDongInt}]"))
                 .Select(x => x.MaSv)
                 .ToListAsync();

            if (maSinhVienDaChiDinh.Any())
            {
                return BadRequest($"Bạn đã chỉ định sinh viên vừa chọn cho hoạt động này rồi. Hãy thử lại");
            }
            // Tạo thông báo
            var thongBao = new ThongBao
            {
                TieuDe = $"Bạn được chỉ định tham gia hoạt động: {hoatDong.TenHoatDong}",
                NoiDung = $"Hoạt động '{hoatDong.TenHoatDong}' diễn ra vào {hoatDong.NgayBatDau:dd/MM/yyyy HH:mm} tại {hoatDong.DiaDiem}. "
                        + $"Số điểm cộng: {hoatDong.DiemCong}. Vui lòng xác nhận hoặc từ chối. [MaHoatDong:{hoatDong.MaHoatDong}]",
                NgayTao = DateTime.Now,
                LoaiThongBao = "Chỉ định sinh viên",
                TrangThai = "DaGui"
            };
            _context.ThongBaos.Add(thongBao);
            await _context.SaveChangesAsync();

            // Tạo chi tiết thông báo
            foreach (var maSV in request.MaSVs)
            {
                var chiTiet = new ChiTietThongBao
                {
                    MaThongBao = thongBao.MaThongBao,
                    MaSv = maSV,
                    DaDoc = false,
                    MaGV = giangVien.MaGv
                };
                _context.ChiTietThongBaos.Add(chiTiet);
            }
            await _context.SaveChangesAsync();

            return Ok("Chỉ định sinh viên thành công.");
        }
    }
}