using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Controllers.SinhVien;
using QuanLyDiemRenLuyen.Models;
using QuanLyDiemRenLuyen.DTO.GiangVien;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace QuanLyDiemRenLuyen.Controllers.GiangVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThongKe : ControllerBase
    {
        // GET: api/<ThongKe>
        private readonly QlDrlContext _context;
        private readonly ILogger<DangKyHoatDongsController> _logger;

        public ThongKe(QlDrlContext context)
        {
            _context = context;
        }

        [HttpGet("thongke-theo-giang-vien")]
        public async Task<ActionResult<ThongKeDiemRenLuyenDTO>> GetThongKeTheoGiangVien(string hocKy, string maLop)
        {
            var username = User.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Không tìm thấy thông tin tài khoản trong token.");
            }

            var user = await _context.TaiKhoans
                .FirstOrDefaultAsync(u => u.TenDangNhap == username);

            if (user == null)
            {
                return Unauthorized("Tài khoản không hợp lệ.");
            }

            var giangVien = await _context.GiaoViens
                .FirstOrDefaultAsync(gv => gv.MaTaiKhoan == user.MaTaiKhoan);

            if (giangVien == null)
            {
                return BadRequest("Không tìm thấy giảng viên.");
            }

            var maGiaoVien = giangVien.MaGv;

            if (string.IsNullOrEmpty(hocKy) || string.IsNullOrEmpty(maLop))
            {
                return BadRequest("Cần cung cấp học kỳ và mã lớp.");
            }

            if (!int.TryParse(hocKy, out int maHocKy))
            {
                return BadRequest("Học kỳ phải là số nguyên.");
            }

            // Kiểm tra xem lớp có thuộc quyền giảng viên không
            var lopThuocGV = await _context.Lops
                .AnyAsync(l => l.MaLop == maLop && l.MaGv == maGiaoVien);

            if (!lopThuocGV)
            {
                return Forbid("Bạn không có quyền xem thống kê của lớp này.");
            }

            // Lấy danh sách sinh viên trong lớp đó
            var sinhVienIds = await _context.SinhViens
                .Where(sv => sv.MaLop == maLop)
                .Select(sv => sv.MaSV)
                .ToListAsync();

            if (!sinhVienIds.Any())
            {
                return NotFound("Không có sinh viên trong lớp này.");
            }

            // Lấy điểm rèn luyện theo học kỳ
            var diemRenLuyen = await _context.DiemRenLuyens
                .Where(dr => sinhVienIds.Contains(dr.MaSv) && dr.MaHocKy == maHocKy)
                .ToListAsync();

            if (!diemRenLuyen.Any())
            {
                return NotFound("Không có dữ liệu điểm rèn luyện cho lớp và học kỳ này.");
            }

            int tongSoSinhVien = sinhVienIds.Count;
            double tongDiem = diemRenLuyen.Sum(dr => dr.TongDiem ?? 0);
            double trungBinhDiemDRL = tongSoSinhVien > 0 ? tongDiem / tongSoSinhVien : 0;

            int gioi = diemRenLuyen.Count(dr => dr.TongDiem.HasValue && dr.TongDiem >= 80);
            int kha = diemRenLuyen.Count(dr => dr.TongDiem.HasValue && dr.TongDiem >= 65 && dr.TongDiem < 80);
            int trungBinh = diemRenLuyen.Count(dr => dr.TongDiem.HasValue && dr.TongDiem >= 50 && dr.TongDiem < 65);
            int yeu = diemRenLuyen.Count(dr => dr.TongDiem.HasValue && dr.TongDiem < 50);

            var thongKe = new ThongKeDiemRenLuyenDTO
            {
                TongSoSinhVien = tongSoSinhVien,
                TrungBinhDiemDRL = Math.Round(trungBinhDiemDRL, 2),
                LoaiGioi = new LoaiDiemDTO { SoLuong = gioi, PhanTram = tongSoSinhVien > 0 ? Math.Round((double)gioi / tongSoSinhVien * 100, 2) : 0 },
                LoaiKha = new LoaiDiemDTO { SoLuong = kha, PhanTram = tongSoSinhVien > 0 ? Math.Round((double)kha / tongSoSinhVien * 100, 2) : 0 },
                LoaiTrungBinh = new LoaiDiemDTO { SoLuong = trungBinh, PhanTram = tongSoSinhVien > 0 ? Math.Round((double)trungBinh / tongSoSinhVien * 100, 2) : 0 },
                LoaiYeu = new LoaiDiemDTO { SoLuong = yeu, PhanTram = tongSoSinhVien > 0 ? Math.Round((double)yeu / tongSoSinhVien * 100, 2) : 0 }
            };

            return Ok(thongKe);
        }
    }
}


