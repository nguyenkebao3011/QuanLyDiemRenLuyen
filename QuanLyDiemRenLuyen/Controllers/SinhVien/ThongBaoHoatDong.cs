
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;
using System.Security.Claims;


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
        //  Hàm tiện ích lấy mã sinh viên từ token
        private string GetMaSinhVienFromToken()
        {
            return User.FindFirstValue("MaSv") ?? User.Identity?.Name;
        }

        //  API lấy danh sách thông báo của sinh viên từ JWT
        [HttpGet("sinhvien")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTOSV>>> GetThongBaoBySinhVien()
        {
            var maSv = GetMaSinhVienFromToken();
            if (string.IsNullOrEmpty(maSv))
                return Unauthorized("Không tìm thấy mã sinh viên trong token.");

            var thongBaos = await _context.ChiTietThongBaos
                .Where(ct => ct.MaSv == maSv)
                .Join(_context.ThongBaos,
                    ct => ct.MaThongBao,
                    tb => tb.MaThongBao,
                    (ct, tb) => new ThongBaoDTOSV
                    {
                        MaThongBao = tb.MaThongBao,
                        TieuDe = tb.TieuDe,
                        NoiDung = tb.NoiDung,
                        NgayTao = tb.NgayTao,
                        DaDoc = ct.DaDoc ?? false,
                        NgayDoc = ct.NgayDoc
                    })
                .OrderByDescending(tb => tb.NgayTao)
                .ToListAsync();

            return Ok(thongBaos);
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

}