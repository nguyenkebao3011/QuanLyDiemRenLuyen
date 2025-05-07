using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.GiangVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class LopsController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public LopsController(QlDrlContext context)
        {
            _context = context;
        }

        [HttpGet("lay_danh_sach_lop_theo_giang_vien")]
        public async Task<IActionResult> LayDanhSachLopTheoGiangVien()
        {
            // Lấy email giảng viên từ claim "name"
            var giangVienEmail = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(giangVienEmail))
            {
                return Unauthorized("Không tìm thấy email giảng viên trong token");
            }

            // Chuẩn hóa email thành chữ thường
            var normalizedEmail = giangVienEmail.ToLower();
            Console.WriteLine($"Email giảng viên: {normalizedEmail}");

            // Tìm MaGiangVien dựa trên email
            var giangVien = await _context.GiaoViens
                .FirstOrDefaultAsync(gv => gv.Email.ToLower() == normalizedEmail);
            if (giangVien == null)
            {
                return NotFound("Không tìm thấy giảng viên với email này");
            }

            // Truy vấn danh sách lớp dựa trên MaGiangVien
            var lopList = await _context.Lops
                .Where(l => l.MaGv == giangVien.MaGv)
                .Select(l => new
                {
                    l.MaLop,
                    l.TenLop
                })
                .ToListAsync();

            return Ok(lopList);
        }
    }
}
    
