using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.QuanLyKhoa;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhanHoiDiemRenLuyenController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public PhanHoiDiemRenLuyenController(QlDrlContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách phản hồi của sinh viên (dành cho quản lý khoa xem)
        // GET: api/PhanHoiDiemRenLuyen/danh_sach
        [HttpGet("danh_sach")]
        public async Task<ActionResult<IEnumerable<PhanHoiDiemRenLuyenListDTO>>> GetAllPhanHoi()
        {
            var list = await _context.PhanHoiDiemRenLuyens
                .Include(p => p.MaDiemRenLuyenNavigation)
                    .ThenInclude(drl => drl.MaSvNavigation)
                .Include(p => p.MaMinhChungNavigation)
                .OrderByDescending(p => p.NgayPhanHoi)
                .Select(p => new PhanHoiDiemRenLuyenListDTO
                {
                    MaPhanHoi = p.MaPhanHoi,
                    MaDiemRenLuyen = p.MaDiemRenLuyen,
                    MaMinhChung = p.MaMinhChung,
                    NoiDungPhanHoi = p.NoiDungPhanHoi,
                    NgayPhanHoi = p.NgayPhanHoi,
                    TrangThai = p.TrangThai,
                    MaQl = p.MaQl,
                    NoiDungXuLy = p.NoiDungXuLy,
                    NgayXuLy = p.NgayXuLy,
                    MaSv = p.MaDiemRenLuyenNavigation.MaSv,
                    TenSinhVien = p.MaDiemRenLuyenNavigation.MaSvNavigation.HoTen,
                    MaHocKy = p.MaDiemRenLuyenNavigation.MaHocKy,
                    TongDiem = p.MaDiemRenLuyenNavigation.TongDiem,
                    XepLoai = p.MaDiemRenLuyenNavigation.XepLoai
                })
                .ToListAsync();
            return Ok(list);
        }

        // 2. Lấy chi tiết phản hồi, kèm điểm rèn luyện và minh chứng liên quan
        // GET: api/PhanHoiDiemRenLuyen/chi_tiet/{maPhanHoi}
        [HttpGet("chi_tiet/{maPhanHoi}")]
        public async Task<ActionResult<PhanHoiDiemRenLuyenDetailDTO>> GetDetail(int maPhanHoi)
        {
            var ph = await _context.PhanHoiDiemRenLuyens
                .Include(p => p.MaDiemRenLuyenNavigation)
                    .ThenInclude(drl => drl.MaSvNavigation)
                .Include(p => p.MaDiemRenLuyenNavigation)
                    .ThenInclude(drl => drl.MaHocKyNavigation)
                .Include(p => p.MaMinhChungNavigation)
                    .ThenInclude(mc => mc.MaDangKyNavigation)
                .FirstOrDefaultAsync(p => p.MaPhanHoi == maPhanHoi);

            if (ph == null) return NotFound();

            var dto = new PhanHoiDiemRenLuyenDetailDTO
            {
                MaPhanHoi = ph.MaPhanHoi,
                NoiDungPhanHoi = ph.NoiDungPhanHoi,
                NgayPhanHoi = ph.NgayPhanHoi,
                TrangThai = ph.TrangThai,
                MaQl = ph.MaQl,
                NoiDungXuLy = ph.NoiDungXuLy,
                NgayXuLy = ph.NgayXuLy,
                // Điểm rèn luyện liên quan
                DiemRenLuyen = ph.MaDiemRenLuyenNavigation == null ? null : new DiemRenLuyenDTO
                {
                    MaDiemRenLuyen = ph.MaDiemRenLuyenNavigation.MaDiemRenLuyen,
                    MaSv = ph.MaDiemRenLuyenNavigation.MaSv,
                    TenSinhVien = ph.MaDiemRenLuyenNavigation.MaSvNavigation?.HoTen,
                    MaHocKy = ph.MaDiemRenLuyenNavigation.MaHocKy,
                    HocKy = ph.MaDiemRenLuyenNavigation.MaHocKyNavigation?.TenHocKy,
                    TongDiem = ph.MaDiemRenLuyenNavigation.TongDiem,
                    XepLoai = ph.MaDiemRenLuyenNavigation.XepLoai,
                    TrangThai = ph.MaDiemRenLuyenNavigation.TrangThai
                },
                // Minh chứng liên quan (nếu có)
                MinhChung = ph.MaMinhChungNavigation == null ? null : new MinhChungHoatDongDTO
                {
                    MaMinhChung = ph.MaMinhChungNavigation.MaMinhChung,
                    MaDangKy = ph.MaMinhChungNavigation.MaDangKy,
                    DuongDanFile = ph.MaMinhChungNavigation.DuongDanFile,
                    MoTa = ph.MaMinhChungNavigation.MoTa,
                    NgayTao = ph.MaMinhChungNavigation.NgayTao,
                    TrangThai = ph.MaMinhChungNavigation.TrangThai,
                }
            };
            return Ok(dto);
        }

        // 3. Quản lý khoa xử lý phản hồi, cập nhật trạng thái và nội dung xử lý (và có thể cập nhật điểm rèn luyện)
        // PUT: api/PhanHoiDiemRenLuyen/xu_ly/{maPhanHoi}
        [HttpPut("xu_ly/{maPhanHoi}")]
        public async Task<ActionResult> XuLyPhanHoi(int maPhanHoi, [FromBody] XuLyPhanHoiRequest request)
        {
            var phanHoi = await _context.PhanHoiDiemRenLuyens
                .Include(p => p.MaDiemRenLuyenNavigation)
                .FirstOrDefaultAsync(p => p.MaPhanHoi == maPhanHoi);

            if (phanHoi == null)
                return NotFound("Không tìm thấy phản hồi.");

            // Cập nhật nội dung xử lý và trạng thái
            phanHoi.TrangThai = "Đã xử lý";
            phanHoi.NoiDungXuLy = request.NoiDungXuLy;
            phanHoi.NgayXuLy = DateTime.Now;
            phanHoi.MaQl = request.MaQl;

            // Nếu có cập nhật điểm rèn luyện
            if (request.CapNhatTongDiem != null && phanHoi.MaDiemRenLuyenNavigation != null)
            {
                phanHoi.MaDiemRenLuyenNavigation.TongDiem = request.CapNhatTongDiem;
                phanHoi.MaDiemRenLuyenNavigation.XepLoai = request.XepLoai ?? phanHoi.MaDiemRenLuyenNavigation.XepLoai;
                phanHoi.MaDiemRenLuyenNavigation.TrangThai = request.TrangThaiDiemRenLuyen ?? phanHoi.MaDiemRenLuyenNavigation.TrangThai;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 4. Lấy minh chứng liên quan đến điểm rèn luyện (tìm theo MaDiemRenLuyen, trả về các minh chứng hoạt động liên quan nếu cần)
        // GET: api/PhanHoiDiemRenLuyen/minh_chung_diem_ren_luyen/{maDiemRenLuyen}
        [HttpGet("minh_chung_diem_ren_luyen/{maDiemRenLuyen}")]
        public async Task<ActionResult<IEnumerable<MinhChungHoatDongDTO>>> GetMinhChungByDiemRenLuyen(int maDiemRenLuyen)
        {
            var diemRenLuyen = await _context.DiemRenLuyens
                .Include(drl => drl.MaSvNavigation)
                .Include(drl => drl.MaHocKyNavigation)
                .FirstOrDefaultAsync(drl => drl.MaDiemRenLuyen == maDiemRenLuyen);

            if (diemRenLuyen == null)
                return NotFound();

            // Tìm các đăng ký hoạt động của sinh viên trong học kỳ này
            var dangKyIds = await _context.DangKyHoatDongs
                .Where(dk => dk.MaSv == diemRenLuyen.MaSv && dk.MaHoatDongNavigation.MaHocKy == diemRenLuyen.MaHocKy)
                .Select(dk => dk.MaDangKy)
                .ToListAsync();

            // Lấy minh chứng thuộc các đăng ký đó
            var minhChungs = await _context.MinhChungHoatDongs
                .Where(mc => mc.MaDangKy != null && dangKyIds.Contains(mc.MaDangKy.Value))
                .Select(mc => new MinhChungHoatDongDTO
                {
                    MaMinhChung = mc.MaMinhChung,
                    MaDangKy = mc.MaDangKy,
                    DuongDanFile = mc.DuongDanFile,
                    MoTa = mc.MoTa,
                    NgayTao = mc.NgayTao,
                    TrangThai = mc.TrangThai
                })
                .ToListAsync();

            return Ok(minhChungs);
        }

        [HttpDelete("xoa_minh_chung/{maMinhChung}")]
        public async Task<IActionResult> XoaMinhChung(int maMinhChung)
        {
            // Lấy minh chứng cần xóa (kèm phản hồi liên quan)
            var minhChung = await _context.MinhChungHoatDongs
                .Include(mc => mc.PhanHoiDiemRenLuyens)
                .FirstOrDefaultAsync(mc => mc.MaMinhChung == maMinhChung);

            if (minhChung != null)
            {
                // Xóa các phản hồi liên quan trước
                if (minhChung.PhanHoiDiemRenLuyens != null && minhChung.PhanHoiDiemRenLuyens.Any())
                {
                    _context.PhanHoiDiemRenLuyens.RemoveRange(minhChung.PhanHoiDiemRenLuyens);
                }

                // Sau đó xóa minh chứng
                _context.MinhChungHoatDongs.Remove(minhChung);

                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
            {
                // Nếu không có minh chứng, vẫn xóa các phản hồi liên quan tới mã minh chứng này
                var phieuPhanHoiLienQuan = await _context.PhanHoiDiemRenLuyens
                    .Where(p => p.MaMinhChung == maMinhChung)
                    .ToListAsync();

                if (phieuPhanHoiLienQuan.Any())
                {
                    _context.PhanHoiDiemRenLuyens.RemoveRange(phieuPhanHoiLienQuan);
                    await _context.SaveChangesAsync();
                }
                return NotFound("Không tìm thấy minh chứng hoặc phản hồi liên quan.");
            }
        }
        [HttpDelete("xoa_phan_hoi/{maPhanHoi}")]
            public async Task<IActionResult> XoaPhanHoi(int maPhanHoi)
            {
                var phanHoi = await _context.PhanHoiDiemRenLuyens.FindAsync(maPhanHoi);
                if (phanHoi == null)
                    return NotFound("Không tìm thấy phản hồi.");

                _context.PhanHoiDiemRenLuyens.Remove(phanHoi);
                await _context.SaveChangesAsync();
                return NoContent();
            }
    }
        public class XuLyPhanHoiRequest
    {
        public string MaQl { get; set; }
        public string NoiDungXuLy { get; set; }
        public double? CapNhatTongDiem { get; set; } // Nếu cần cập nhật điểm cho sinh viên
        public string? XepLoai { get; set; }
        public string? TrangThaiDiemRenLuyen { get; set; }
    }
}