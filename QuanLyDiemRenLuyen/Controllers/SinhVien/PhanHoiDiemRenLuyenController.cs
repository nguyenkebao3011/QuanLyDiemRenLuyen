﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;
using System.Security.Claims;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhanHoiDiemRenLuyenController : ControllerBase
    {
        private readonly QlDrlContext _context;
        private readonly IWebHostEnvironment _environment;

        public PhanHoiDiemRenLuyenController(QlDrlContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost("TaoPhanHoiVeHoatDong")]
        public async Task<IActionResult> TaoPhanHoiVeHoatDong([FromForm] TaoPhanHoiVeHoatDongDTO dto)
        {
            // 1. Kiểm tra đầu vào
            if (string.IsNullOrEmpty(dto.MaSv) || dto.MaHocKy == null || string.IsNullOrEmpty(dto.NoiDungPhanHoi) || dto.MaDangKy == null)
                return BadRequest(new { success = false, message = "Thiếu thông tin sinh viên, học kỳ, hoạt động hoặc nội dung phản hồi!" });

            // 2. Kiểm tra tồn tại điểm rèn luyện
            var diemRenLuyen = await _context.DiemRenLuyens
                .FirstOrDefaultAsync(drl => drl.MaSv == dto.MaSv && drl.MaHocKy == dto.MaHocKy);
            if (diemRenLuyen == null)
                return NotFound(new { success = false, message = "Không tìm thấy bảng điểm rèn luyện của sinh viên cho học kỳ này!" });

            // 3. Kiểm tra tồn tại đăng ký hoạt động
            var dangKy = await _context.DangKyHoatDongs
                .Include(dk => dk.MaHoatDongNavigation)
                .FirstOrDefaultAsync(dk => dk.MaDangKy == dto.MaDangKy && dk.MaSv == dto.MaSv);
            if (dangKy == null)
                return NotFound(new { success = false, message = "Không tìm thấy hoạt động sinh viên đã đăng ký!" });

            // 3.5 Kiểm tra xem sinh viên đã phản hồi cho hoạt động này chưa
            var phanHoiTonTai = await _context.PhanHoiDiemRenLuyens
                .Include(ph => ph.MaMinhChungNavigation)
                .ThenInclude(mc => mc.MaDangKyNavigation)
                .AnyAsync(ph => ph.MaMinhChungNavigation.MaDangKy == dto.MaDangKy
                             && ph.MaMinhChungNavigation.MaDangKyNavigation.MaSv == dto.MaSv);
            if (phanHoiTonTai)
                return BadRequest(new { success = false, message = "Sinh viên đã gửi phản hồi cho hoạt động này, không thể gửi lại!" });

            // 4. Kiểm tra file minh chứng
            if (dto.FileMinhChung == null || dto.FileMinhChung.Length == 0)
                return BadRequest(new { success = false, message = "Bắt buộc phải upload file minh chứng!" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
            var fileExtension = Path.GetExtension(dto.FileMinhChung.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { success = false, message = "Chỉ hỗ trợ file .jpg, .jpeg, .png, .pdf, .docx." });

            // Lưu file
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "HinhAnhMinhChung");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + fileExtension;
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.FileMinhChung.CopyToAsync(stream);
            }

            var duongDanFile = $"/HinhAnhMinhChung/{fileName}";

            // Tạo minh chứng
            var minhChung = new MinhChungHoatDong
            {
                MaDangKy = dto.MaDangKy.Value,
                DuongDanFile = duongDanFile,
                MoTa = dto.MoTaMinhChung,
                NgayTao = DateTime.Now,
                TrangThai = "Đang xử lý"
            };
            _context.MinhChungHoatDongs.Add(minhChung);
            await _context.SaveChangesAsync();
            var maMinhChung = minhChung.MaMinhChung;

            // Tạo phiếu phản hồi
            var phieuPhanHoi = new PhanHoiDiemRenLuyen
            {
                MaDiemRenLuyen = diemRenLuyen.MaDiemRenLuyen,
                MaMinhChung = maMinhChung,
                NoiDungPhanHoi = dto.NoiDungPhanHoi,
                NgayPhanHoi = DateTime.Now,
                TrangThai = "Chờ xử lý"
            };
            _context.PhanHoiDiemRenLuyens.Add(phieuPhanHoi);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Gửi phiếu phản hồi về hoạt động thành công!",
                MaPhanHoi = phieuPhanHoi.MaPhanHoi,
                MaMinhChung = maMinhChung,
                DuongDanFile = duongDanFile
            });
        }
        
        [HttpGet("XemPhanHoiCuaSinhVien")]
        public async Task<IActionResult> XemPhanHoiCuaSinhVien()
        {
            // 1. Lấy MaSv từ token
            var maSv = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(maSv))
                return Unauthorized("Không tìm thấy thông tin sinh viên trong token!");

            // 2. Truy vấn phản hồi và minh chứng
            var phanHoiList = await _context.PhanHoiDiemRenLuyens
                .Where(ph => ph.MaDiemRenLuyenNavigation.MaSv == maSv)
                .Include(ph => ph.MaDiemRenLuyenNavigation)
                .Include(ph => ph.MaMinhChungNavigation)
                .Select(ph => new
                {
                    MaPhanHoi = ph.MaPhanHoi,
                    MaDiemRenLuyen = ph.MaDiemRenLuyen,
                    MaMinhChung = ph.MaMinhChung,
                    NoiDungPhanHoi = ph.NoiDungPhanHoi,
                    NgayPhanHoi = ph.NgayPhanHoi,
                    TrangThai = ph.TrangThai,
                
                    NoiDungXuLy = ph.NoiDungXuLy,
                    NgayXuLy = ph.NgayXuLy,
                    MinhChung = new
                    {
                        MaMinhChung = ph.MaMinhChungNavigation.MaMinhChung,
                        MaDangKy = ph.MaMinhChungNavigation.MaDangKy,
                        DuongDanFile = ph.MaMinhChungNavigation.DuongDanFile,
                        MoTa = ph.MaMinhChungNavigation.MoTa,
                        NgayTao = ph.MaMinhChungNavigation.NgayTao,
                        TrangThaiMinhChung = ph.MaMinhChungNavigation.TrangThai
                    }
                })
                .ToListAsync();

            // 3. Kiểm tra xem có phản hồi nào không
            if (!phanHoiList.Any())
                return NotFound("Không tìm thấy phản hồi nào cho sinh viên này!");

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách phản hồi thành công!",
                data = phanHoiList
            });
        }

    }
}

