using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;

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
                return BadRequest("Thiếu thông tin sinh viên, học kỳ, hoạt động hoặc nội dung phản hồi!");

            // 2. Kiểm tra tồn tại điểm rèn luyện
            var diemRenLuyen = await _context.DiemRenLuyens
                .FirstOrDefaultAsync(drl => drl.MaSv == dto.MaSv && drl.MaHocKy == dto.MaHocKy);
            if (diemRenLuyen == null)
                return NotFound("Không tìm thấy bảng điểm rèn luyện của sinh viên cho học kỳ này!");

            // 3. Kiểm tra tồn tại đăng ký hoạt động
            var dangKy = await _context.DangKyHoatDongs
                .Include(dk => dk.MaHoatDongNavigation)
                .FirstOrDefaultAsync(dk => dk.MaDangKy == dto.MaDangKy && dk.MaSv == dto.MaSv);
            if (dangKy == null)
                return NotFound("Không tìm thấy hoạt động sinh viên đã đăng ký!");

            // 4. Xử lý lưu minh chứng nếu có file
            int? maMinhChung = null;
            if (dto.FileMinhChung != null && dto.FileMinhChung.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
                var fileExtension = Path.GetExtension(dto.FileMinhChung.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Chỉ hỗ trợ file .jpg, .jpeg, .png, .pdf, .docx.");

                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + fileExtension;
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.FileMinhChung.CopyToAsync(stream);
                }

                var minhChung = new MinhChungHoatDong
                {
                    MaDangKy = dto.MaDangKy,
                    DuongDanFile = $"/uploads/{fileName}",
                    MoTa = dto.MoTaMinhChung,
                    NgayTao = DateTime.Now,
                    TrangThai = "Đang xử lý"
                };
                _context.MinhChungHoatDongs.Add(minhChung);
                await _context.SaveChangesAsync();
                maMinhChung = minhChung.MaMinhChung;
            }

            // 5. Tạo phiếu phản hồi
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
                MaMinhChung = maMinhChung
            });
        }
    }

    
}
