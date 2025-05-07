using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class TongQuanThongKeController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public TongQuanThongKeController(QlDrlContext context)
        {
            _context = context;
        }

        // 1. Thống kê tổng quan
        [HttpGet("thong_ke_tong_quan")]
        public async Task<TongQuanThongKeDTO> GetThongKeTongQuanAsync()
        {
            // Đếm tổng sinh viên
            var tongSinhVien = await _context.SinhViens.CountAsync();

            // Đếm tổng giảng viên
            var tongGiangVien = await _context.GiaoViens.CountAsync();

            // Đếm tổng hoạt động
            var tongHoatDong = await _context.HoatDongs.CountAsync();

            // Đếm tổng phản hồi
            var tongPhanHoi = await _context.PhanHoiDiemRenLuyens.CountAsync();

            return new TongQuanThongKeDTO
            {
                TongSinhVien = tongSinhVien,
                TongGiangVien = tongGiangVien,
                TongHoatDong = tongHoatDong,
                TongPhanHoi = tongPhanHoi
            };
        }

        // 2. Thống kê phản hồi điểm rèn luyện theo trạng thái
        [HttpGet("thong_ke_phan_hoi")]
        public async Task<object> ThongKePhanHoiAsync()
        {
            var result = await _context.PhanHoiDiemRenLuyens
                .GroupBy(p => p.TrangThai)
                .Select(g => new
                {
                    TrangThai = g.Key,
                    SoLuong = g.Count()
                }).ToListAsync();

            int daXuLy = result.Where(x => x.TrangThai == "Đã xử lý").Sum(x => x.SoLuong);
            int chuaXuLy = result.Where(x => x.TrangThai != "Đã xử lý").Sum(x => x.SoLuong);

            return new
            {
                TongPhanHoi = daXuLy + chuaXuLy,
                DaXuLy = daXuLy,
                ChuaXuLy = chuaXuLy
            };
        }

        // 3. Thống kê điểm rèn luyện trung bình, lớn nhất, nhỏ nhất theo học kỳ
        [HttpGet("thong_ke_diem_theo_hoc_ky/{maHocKy}")]
        public async Task<ActionResult<object>> ThongKeDiemTheoHocKy(int maHocKy)
        {
            var query = _context.DiemRenLuyens.Where(d => d.MaHocKy == maHocKy && d.TongDiem != null);

            if (!await query.AnyAsync())
                return NotFound("Không có dữ liệu điểm rèn luyện cho học kỳ này.");

            var tb = await query.AverageAsync(d => d.TongDiem.Value);
            var max = await query.MaxAsync(d => d.TongDiem.Value);
            var min = await query.MinAsync(d => d.TongDiem.Value);

            return Ok(new
            {
                DiemTrungBinh = tb,
                DiemCaoNhat = max,
                DiemThapNhat = min
            });
        }

        // 4. Báo cáo số lượng sinh viên đạt các loại theo học kỳ
        [HttpGet("bao_cao_xep_loai/{maHocKy}")]
        public async Task<ActionResult<object>> BaoCaoXepLoai(int maHocKy)
        {
            var result = await _context.DiemRenLuyens
                .Where(d => d.MaHocKy == maHocKy && d.XepLoai != null)
                .GroupBy(d => d.XepLoai)
                .Select(g => new
                {
                    XepLoai = g.Key,
                    SoLuong = g.Count()
                }).ToListAsync();

            int tong = result.Sum(x => x.SoLuong);

            return Ok(new
            {
                TongSinhVien = tong,
                BaoCaoTheoLoai = result
            });
        }

        // 5. Thống kê số lượng minh chứng hợp lệ, không hợp lệ
        [HttpGet("thong_ke_minh_chung")]
        public async Task<object> ThongKeMinhChungAsync()
        {
            var result = await _context.MinhChungHoatDongs
                .GroupBy(m => m.TrangThai)
                .Select(g => new
                {
                    TrangThai = g.Key,
                    SoLuong = g.Count()
                }).ToListAsync();

            return result;
        }

        // 6. Thống kê điểm rèn luyện theo từng lớp trong kỳ
        [HttpGet("thong_ke_diem_theo_lop/{maHocKy}")]
        public async Task<ActionResult<IEnumerable<object>>> ThongKeDiemTheoLop(int maHocKy)
        {
            var result = await _context.DiemRenLuyens
                .Where(d => d.MaHocKy == maHocKy)
                .Include(d => d.MaSvNavigation)
                .GroupBy(d => d.MaSvNavigation.MaLop)
                .Select(g => new
                {
                    MaLop = g.Key,
                    SoLuong = g.Count(),
                    DiemTrungBinh = g.Average(x => x.TongDiem ?? 0),
                    SoSinhVienGioi = g.Count(x => x.XepLoai == "Giỏi"),
                    SoSinhVienKha = g.Count(x => x.XepLoai == "Khá"),
                    SoSinhVienTb = g.Count(x => x.XepLoai == "Trung bình"),
                    SoSinhVienYeu = g.Count(x => x.XepLoai == "Yếu")
                }).ToListAsync();

            return Ok(result);
        }
    }

    // DTO tổng quan thống kê
    public class TongQuanThongKeDTO
    {
        public int TongSinhVien { get; set; }
        public int TongGiangVien { get; set; }
        public int TongHoatDong { get; set; }
        public int TongPhanHoi { get; set; }
    }
}