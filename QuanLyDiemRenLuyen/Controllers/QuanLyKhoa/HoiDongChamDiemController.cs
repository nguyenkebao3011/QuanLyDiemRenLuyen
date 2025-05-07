using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.QuanLyKhoa;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoiDongChamDiemController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public HoiDongChamDiemController(QlDrlContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách hội đồng
        [HttpGet("danh_sach")]
        public async Task<ActionResult<IEnumerable<HoiDongChamDiemDTO>>> GetHoiDongList()
        {
            var data = await _context.HoiDongChamDiems
                .Include(h => h.MaHocKyNavigation)
                .Select(h => new HoiDongChamDiemDTO
                {
                    MaHoiDong = h.MaHoiDong,
                    TenHoiDong = h.TenHoiDong,
                    MaHocKy = h.MaHocKy,
                    TenHocKy = h.MaHocKyNavigation != null ? h.MaHocKyNavigation.TenHocKy : null,
                    NgayThanhLap = h.NgayThanhLap,
                    GhiChu = h.GhiChu
                }).ToListAsync();
            return Ok(data);
        }

        // 2. Lấy chi tiết hội đồng và các thành viên
        [HttpGet("chi_tiet/{maHoiDong}")]
        public async Task<ActionResult<HoiDongChamDiemDetailDTO>> GetDetail(int maHoiDong)
        {
            var hd = await _context.HoiDongChamDiems
                .Include(h => h.MaHocKyNavigation)
                .Include(h => h.ThanhVienHoiDongs)
                    .ThenInclude(tv => tv.MaGvNavigation)
                .FirstOrDefaultAsync(h => h.MaHoiDong == maHoiDong);

            if (hd == null) return NotFound();

            var dto = new HoiDongChamDiemDetailDTO
            {
                MaHoiDong = hd.MaHoiDong,
                TenHoiDong = hd.TenHoiDong,
                MaHocKy = hd.MaHocKy,
                TenHocKy = hd.MaHocKyNavigation?.TenHocKy,
                NgayThanhLap = hd.NgayThanhLap,
                GhiChu = hd.GhiChu,
                ThanhViens = hd.ThanhVienHoiDongs.Select(tv => new ThanhVienHoiDongDTO
                {
                    MaThanhVien = tv.MaThanhVien,
                    MaGv = tv.MaGv,
                    HoTen = tv.MaGvNavigation?.HoTen,
                    Email = tv.MaGvNavigation?.Email,
                    VaiTroTrongHoiDong = tv.VaiTroTrongHoiDong
                }).ToList()
            };
            return Ok(dto);
        }

        // 3. Tạo mới hội đồng
        [HttpPost("tao_hoi_dong")]
        public async Task<IActionResult> TaoHoiDong([FromBody] TaoHoiDongChamDiemRequest request)
        {
            var hd = new HoiDongChamDiem
            {
                TenHoiDong = request.TenHoiDong,
                MaHocKy = request.MaHocKy,
                NgayThanhLap = request.NgayThanhLap,
                GhiChu = request.GhiChu
            };
            _context.HoiDongChamDiems.Add(hd);
            await _context.SaveChangesAsync();

            var dto = new HoiDongChamDiemDTO
            {
                MaHoiDong = hd.MaHoiDong,
                TenHoiDong = hd.TenHoiDong,
                MaHocKy = hd.MaHocKy,
                NgayThanhLap = hd.NgayThanhLap,
                GhiChu = hd.GhiChu,
                TenHocKy = null // Nếu muốn, có thể load thêm tên học kỳ ở đây
            };
            return CreatedAtAction(nameof(GetDetail), new { maHoiDong = hd.MaHoiDong }, dto);
        }

        // 4. Thêm thành viên vào hội đồng
        [HttpPost("{maHoiDong}/them_thanh_vien")]
        public async Task<IActionResult> ThemThanhVien(int maHoiDong, [FromBody] ThemThanhVienRequest req)
        {
            // Kiểm tra hội đồng tồn tại
            var hd = await _context.HoiDongChamDiems.FindAsync(maHoiDong);
            if (hd == null) return NotFound("Không tìm thấy hội đồng.");

            // 1. Kiểm tra giảng viên đã có vai trò này trong hội đồng chưa
            bool isDuplicate = await _context.ThanhVienHoiDongs
                .AnyAsync(tv => tv.MaHoiDong == maHoiDong && tv.MaGv == req.MaGv && tv.VaiTroTrongHoiDong == req.VaiTroTrongHoiDong);
            if (isDuplicate)
                return BadRequest("Giảng viên này đã có vai trò này trong hội đồng.");

            // 2. Nếu vai trò là Chủ tịch hoặc Thư ký, kiểm tra đã có người đảm nhiệm chưa
            if (req.VaiTroTrongHoiDong == "Chủ tịch hội đồng" || req.VaiTroTrongHoiDong == "Thư ký hội đồng")
            {
                bool roleExists = await _context.ThanhVienHoiDongs
                    .AnyAsync(tv => tv.MaHoiDong == maHoiDong && tv.VaiTroTrongHoiDong == req.VaiTroTrongHoiDong);
                if (roleExists)
                    return BadRequest("Hội đồng đã có người đảm nhiệm vai trò " + req.VaiTroTrongHoiDong);
            }

            // Thêm thành viên nếu hợp lệ
            var tv = new ThanhVienHoiDong
            {
                MaHoiDong = maHoiDong,
                MaGv = req.MaGv,
                VaiTroTrongHoiDong = req.VaiTroTrongHoiDong
            };
            _context.ThanhVienHoiDongs.Add(tv);
            await _context.SaveChangesAsync();

            // Lấy lại thông tin giảng viên (nếu cần)
            var gv = await _context.GiaoViens.FindAsync(req.MaGv);

            // Trả về DTO đơn giản, KHÔNG trả về entity gốc
            var dto = new ThanhVienHoiDongDTO
            {
                MaThanhVien = tv.MaThanhVien,
                MaGv = tv.MaGv,
                HoTen = gv?.HoTen,
                Email = gv?.Email,
                VaiTroTrongHoiDong = tv.VaiTroTrongHoiDong
            };
            return Ok(dto);
        }

        // 5. Xóa thành viên khỏi hội đồng
        [HttpDelete("xoa_thanh_vien/{maThanhVien}")]
        public async Task<IActionResult> XoaThanhVien(int maThanhVien)
        {
            var tv = await _context.ThanhVienHoiDongs.FindAsync(maThanhVien);
            if (tv == null) return NotFound("Không tìm thấy thành viên.");
            _context.ThanhVienHoiDongs.Remove(tv);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 6. Xóa hội đồng
        [HttpDelete("xoa_hoi_dong/{maHoiDong}")]
        public async Task<IActionResult> XoaHoiDong(int maHoiDong)
        {
            var hd = await _context.HoiDongChamDiems
                .Include(h => h.ThanhVienHoiDongs)
                .FirstOrDefaultAsync(h => h.MaHoiDong == maHoiDong);
            if (hd == null) return NotFound();
            // Xóa các thành viên trước
            _context.ThanhVienHoiDongs.RemoveRange(hd.ThanhVienHoiDongs);
            _context.HoiDongChamDiems.Remove(hd);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}