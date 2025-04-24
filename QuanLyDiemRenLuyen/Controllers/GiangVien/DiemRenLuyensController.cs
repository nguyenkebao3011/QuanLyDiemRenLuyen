using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.GiangVien
{
    [Route("api/giangvien/[controller]")]
    [ApiController]
    public class DiemRenLuyensController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public DiemRenLuyensController(QlDrlContext context)
        {
            _context = context;
        }
        [HttpGet("{maSinhVien}giang-vien/xem-diem-ren-luyen")]
        public async Task<IActionResult> GetDiemRenLuyenTheoHocKy(string maSinhVien)
        {
            var username = User.Identity.Name;
            var user = await _context.TaiKhoans
                .FirstOrDefaultAsync(u => u.TenDangNhap == username);

            if (user == null)
                return Unauthorized("Tài khoản không hợp lệ.");

            var giangVien = await _context.GiaoViens
                .FirstOrDefaultAsync(gv => gv.MaTaiKhoan == user.MaTaiKhoan);

            if (giangVien == null)
                return BadRequest("Không tìm thấy giảng viên.");

            var lop = await _context.Lops
                .FirstOrDefaultAsync(l => l.MaGv == giangVien.MaGv);

            if (lop == null)
                return BadRequest("Giảng viên không có lớp giảng dạy.");

            var sinhVien = await _context.SinhViens
                .FirstOrDefaultAsync(sv => sv.MaSV == maSinhVien && sv.MaLop == lop.MaLop);

            if (sinhVien == null)
                return NotFound("Sinh viên không thuộc lớp của bạn.");

            // Lấy thông tin sinh viên
            var sinhViens = await _context.SinhViens
                .Where(sv => sv.MaSV == maSinhVien)
                .Select(sv => new
                {
                    sv.MaSV,
                    sv.HoTen
                })
                .FirstOrDefaultAsync();

            if (sinhVien == null)
                return NotFound("Không tìm thấy sinh viên.");

            // Lấy danh sách điểm rèn luyện theo học kỳ
            var danhSachDiem = await (from drl in _context.DiemRenLuyens
                                      join hk in _context.HocKies on drl.MaHocKy equals hk.MaHocKy
                                      where drl.MaSv == maSinhVien
                                      select new
                                      {
                                          drl.MaHocKy,
                                          hk.TenHocKy,
                                          drl.TongDiem // hoặc Diem nếu đúng tên
                                      }).ToListAsync();

            return Ok(new
            {
                sinhVien.MaSV,
                sinhVien.HoTen,
                DiemRenLuyenTheoHocKy = danhSachDiem
            });

        }

          
      
       
    }
}
