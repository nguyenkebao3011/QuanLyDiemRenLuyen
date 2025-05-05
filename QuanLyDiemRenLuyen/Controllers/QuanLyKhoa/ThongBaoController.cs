using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using QuanLyDiemRenLuyen.Models.DTOs;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public ThongBaoController(QlDrlContext context)
        {
            _context = context;
        }

        // GET: api/ThongBao/lay_thong_bao
        [HttpGet("lay_thong_bao")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTO>>> LayDanhSachThongBao()
        {
            try
            {
                var thongBaos = await _context.ThongBaos
                    .Include(t => t.MaQlNavigation)
                    .Include(t => t.ChiTietThongBaos)
                    .Where(t => t.TrangThai == "Đã đăng")
                    .OrderByDescending(t => t.NgayTao)
                    .Select(t => new ThongBaoDTO
                    {
                        MaThongBao = t.MaThongBao,
                        TieuDe = t.TieuDe,
                        NoiDung = t.NoiDung,
                        NgayTao = t.NgayTao,
                        MaQl = t.MaQl,
                        LoaiThongBao = t.LoaiThongBao,
                        TrangThai = t.TrangThai,
                        TenNguoiTao = t.MaQlNavigation.HoTen,
                        Khoa = t.MaQlNavigation.Khoa,
                        SoLuotXem = t.ChiTietThongBaos.Count(c => c.DaDoc == true),
                        DaDoc = false
                    })
                    .ToListAsync();

                return Ok(thongBaos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/ThongBao/lay_chi_tiet_thong_bao/{maThongBao}
        [HttpGet("lay_chi_tiet_thong_bao/{maThongBao}")]
        public async Task<ActionResult<ThongBaoChiTietDTO>> LayChiTietThongBao(int maThongBao)
        {
            try
            {
                var thongBao = await _context.ThongBaos
                    .Include(t => t.MaQlNavigation)
                    .Include(t => t.ChiTietThongBaos)
                    .ThenInclude(c => c.MaSvNavigation)
                    .FirstOrDefaultAsync(t => t.MaThongBao == maThongBao);

                if (thongBao == null)
                {
                    return NotFound($"Không tìm thấy thông báo có mã {maThongBao}");
                }

                var result = new ThongBaoChiTietDTO
                {
                    MaThongBao = thongBao.MaThongBao,
                    TieuDe = thongBao.TieuDe,
                    NoiDung = thongBao.NoiDung,
                    NgayTao = thongBao.NgayTao,
                    MaQl = thongBao.MaQl,
                    LoaiThongBao = thongBao.LoaiThongBao,
                    TrangThai = thongBao.TrangThai,
                    TenNguoiTao = thongBao.MaQlNavigation?.HoTen,
                    Khoa = thongBao.MaQlNavigation?.Khoa,
                    SoLuotXem = thongBao.ChiTietThongBaos.Count(c => c.DaDoc == true),
                    DanhSachSinhVienDaDoc = thongBao.ChiTietThongBaos
                        .Where(c => c.DaDoc == true)
                        .Select(c => new SinhVienDocThongBaoDTO
                        {
                            MaSV = c.MaSv,
                            HoTen = c.MaSvNavigation.HoTen,
                            MaLop = c.MaSvNavigation.MaLop,
                            NgayDoc = c.NgayDoc
                        })
                        .ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/ThongBao/lay_thong_bao_sinh_vien/{maSv}
        [HttpGet("lay_thong_bao_sinh_vien/{maSv}")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTO>>> LayThongBaoSinhVien(string maSv)
        {
            try
            {
                // Lấy tất cả thông báo đã đăng
                var thongBaos = await _context.ThongBaos
                    .Include(t => t.MaQlNavigation)
                    .Include(t => t.ChiTietThongBaos)
                    .Where(t => t.TrangThai == "Đã đăng")
                    .OrderByDescending(t => t.NgayTao)
                    .ToListAsync();

                // Lấy chi tiết thông báo của sinh viên
                var chiTietThongBaos = await _context.ChiTietThongBaos
                    .Where(c => c.MaSv == maSv)
                    .ToListAsync();

                // Tạo dictionary để tra cứu nhanh
                var thongBaoDaDocDict = chiTietThongBaos.ToDictionary(c => c.MaThongBao, c => c.DaDoc == true);

                // Tạo kết quả
                var result = thongBaos.Select(t => new ThongBaoDTO
                {
                    MaThongBao = t.MaThongBao,
                    TieuDe = t.TieuDe,
                    NoiDung = t.NoiDung,
                    NgayTao = t.NgayTao,
                    MaQl = t.MaQl,
                    LoaiThongBao = t.LoaiThongBao,
                    TrangThai = t.TrangThai,
                    TenNguoiTao = t.MaQlNavigation?.HoTen,
                    Khoa = t.MaQlNavigation?.Khoa,
                    SoLuotXem = t.ChiTietThongBaos.Count(c => c.DaDoc == true),
                    DaDoc = thongBaoDaDocDict.ContainsKey(t.MaThongBao) && thongBaoDaDocDict[t.MaThongBao]
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/ThongBao/lay_thong_bao_chua_doc/{maSv}
        [HttpGet("lay_thong_bao_chua_doc/{maSv}")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTO>>> LayThongBaoChuaDoc(string maSv)
        {
            try
            {
                // Lấy tất cả thông báo đã đăng
                var thongBaos = await _context.ThongBaos
                    .Include(t => t.MaQlNavigation)
                    .Include(t => t.ChiTietThongBaos)
                    .Where(t => t.TrangThai == "Đã đăng")
                    .OrderByDescending(t => t.NgayTao)
                    .ToListAsync();

                // Lấy chi tiết thông báo của sinh viên
                var chiTietThongBaos = await _context.ChiTietThongBaos
                    .Where(c => c.MaSv == maSv)
                    .ToListAsync();

                // Tạo dictionary để tra cứu nhanh
                var thongBaoDaDocDict = chiTietThongBaos.ToDictionary(c => c.MaThongBao, c => c.DaDoc == true);

                // Lọc thông báo chưa đọc
                var result = thongBaos
                    .Where(t => !thongBaoDaDocDict.ContainsKey(t.MaThongBao) || !thongBaoDaDocDict[t.MaThongBao])
                    .Select(t => new ThongBaoDTO
                    {
                        MaThongBao = t.MaThongBao,
                        TieuDe = t.TieuDe,
                        NoiDung = t.NoiDung,
                        NgayTao = t.NgayTao,
                        MaQl = t.MaQl,
                        LoaiThongBao = t.LoaiThongBao,
                        TrangThai = t.TrangThai,
                        TenNguoiTao = t.MaQlNavigation?.HoTen,
                        Khoa = t.MaQlNavigation?.Khoa,
                        SoLuotXem = t.ChiTietThongBaos.Count(c => c.DaDoc == true),
                        DaDoc = false
                    })
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // POST: api/ThongBao/danh_dau_da_doc
        [HttpPost("danh_dau_da_doc")]
        public async Task<ActionResult> DanhDauDaDoc([FromBody] DanhDauDaDocRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.MaSV) || request.MaThongBao <= 0)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }

            try
            {
                // Kiểm tra thông báo tồn tại
                var thongBao = await _context.ThongBaos.FindAsync(request.MaThongBao);
                if (thongBao == null)
                {
                    return NotFound($"Không tìm thấy thông báo có mã {request.MaThongBao}");
                }

                // Kiểm tra sinh viên tồn tại
                var sinhVien = await _context.SinhViens.FindAsync(request.MaSV);
                if (sinhVien == null)
                {
                    return NotFound($"Không tìm thấy sinh viên có mã {request.MaSV}");
                }

                // Kiểm tra chi tiết thông báo đã tồn tại chưa
                var chiTietThongBao = await _context.ChiTietThongBaos
                    .FirstOrDefaultAsync(c => c.MaThongBao == request.MaThongBao && c.MaSv == request.MaSV);

                if (chiTietThongBao == null)
                {
                    // Tạo mới chi tiết thông báo
                    chiTietThongBao = new ChiTietThongBao
                    {
                        MaThongBao = request.MaThongBao,
                        MaSv = request.MaSV,
                        DaDoc = true,
                        NgayDoc = DateTime.Now
                    };
                    _context.ChiTietThongBaos.Add(chiTietThongBao);
                }
                else
                {
                    // Cập nhật chi tiết thông báo
                    chiTietThongBao.DaDoc = true;
                    chiTietThongBao.NgayDoc = DateTime.Now;
                    _context.ChiTietThongBaos.Update(chiTietThongBao);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã đánh dấu thông báo là đã đọc" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/ThongBao/tim_kiem_thong_bao?tuKhoa={tuKhoa}
        [HttpGet("tim_kiem_thong_bao")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTO>>> TimKiemThongBao(string tuKhoa)
        {
            if (string.IsNullOrEmpty(tuKhoa))
            {
                return BadRequest("Từ khóa tìm kiếm không được để trống");
            }

            try
            {
                var tuKhoaLower = tuKhoa.ToLower();
                var thongBaos = await _context.ThongBaos
                    .Include(t => t.MaQlNavigation)
                    .Include(t => t.ChiTietThongBaos)
                    .Where(t => t.TrangThai == "Đã đăng" &&
                               (t.TieuDe.ToLower().Contains(tuKhoaLower) ||
                                (t.NoiDung != null && t.NoiDung.ToLower().Contains(tuKhoaLower))))
                    .OrderByDescending(t => t.NgayTao)
                    .Select(t => new ThongBaoDTO
                    {
                        MaThongBao = t.MaThongBao,
                        TieuDe = t.TieuDe,
                        NoiDung = t.NoiDung,
                        NgayTao = t.NgayTao,
                        MaQl = t.MaQl,
                        LoaiThongBao = t.LoaiThongBao,
                        TrangThai = t.TrangThai,
                        TenNguoiTao = t.MaQlNavigation.HoTen,
                        Khoa = t.MaQlNavigation.Khoa,
                        SoLuotXem = t.ChiTietThongBaos.Count(c => c.DaDoc == true),
                        DaDoc = false
                    })
                    .ToListAsync();

                if (thongBaos.Count == 0)
                {
                    return NotFound($"Không tìm thấy thông báo nào phù hợp với từ khóa '{tuKhoa}'");
                }

                return Ok(thongBaos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/ThongBao/dem_thong_bao_chua_doc/{maSv}
        [HttpGet("dem_thong_bao_chua_doc/{maSv}")]
        public async Task<ActionResult<int>> DemThongBaoChuaDoc(string maSv)
        {
            try
            {
                // Lấy tất cả thông báo đã đăng
                var thongBaos = await _context.ThongBaos
                    .Where(t => t.TrangThai == "Đã đăng")
                    .Select(t => t.MaThongBao)
                    .ToListAsync();

                // Lấy chi tiết thông báo đã đọc của sinh viên
                var thongBaoDaDoc = await _context.ChiTietThongBaos
                    .Where(c => c.MaSv == maSv && c.DaDoc == true)
                    .Select(c => c.MaThongBao)
                    .ToListAsync();

                // Fix: Remove the incorrect '.Value' as 'id' is already an integer.
                var soThongBaoChuaDoc = thongBaos.Count(id => !thongBaoDaDoc.Contains(id));

                return Ok(new { SoThongBaoChuaDoc = soThongBaoChuaDoc });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // POST: api/ThongBao/tao_thong_bao_tu_hoat_dong
        [HttpPost("tao_thong_bao_tu_hoat_dong")]
        public async Task<ActionResult> TaoThongBaoTuHoatDong([FromBody] TaoThongBaoTuHoatDongRequest request)
        {
            if (request == null || request.MaHoatDong <= 0)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            try
            {
                // Tìm hoạt động trong cơ sở dữ liệu
                var hoatDong = await _context.HoatDongs.FirstOrDefaultAsync(hd => hd.MaHoatDong == request.MaHoatDong);
                if (hoatDong == null)
                {
                    return NotFound($"Không tìm thấy hoạt động có mã {request.MaHoatDong}");
                }

                // Sử dụng tiêu đề mặc định nếu không được cung cấp
                var tieuDeMacDinh = $"Thông báo liên quan đến hoạt động: {hoatDong.TenHoatDong}";
                var noiDungMacDinh = $"Vui lòng tham gia hoạt động: {hoatDong.TenHoatDong}.";

                var thongBao = new ThongBao
                {
                    TieuDe = string.IsNullOrWhiteSpace(request.TieuDe) ? tieuDeMacDinh : request.TieuDe,
                    NoiDung = string.IsNullOrWhiteSpace(request.NoiDung) ? noiDungMacDinh : request.NoiDung,
                    NgayTao = DateTime.Now,
                    TrangThai = "Đã đăng",
                    MaQl = request.MaQl,
                    LoaiThongBao = string.IsNullOrWhiteSpace(request.LoaiThongBao) ? "Hoạt động" : request.LoaiThongBao
                };

                // Lưu thông báo vào cơ sở dữ liệu
                _context.ThongBaos.Add(thongBao);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(LayChiTietThongBao), new { maThongBao = thongBao.MaThongBao }, thongBao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
    }
        // DTOs cho các request và response
        public class TaoThongBaoTuHoatDongRequest
    {
        public int MaHoatDong { get; set; }
        public string? TieuDe { get; set; }
        public string? NoiDung { get; set; }
        public string? MaQl { get; set; }
        public string? LoaiThongBao { get; set; }
    }
    public class DanhDauDaDocRequest
    {
        public int MaThongBao { get; set; }
        public string MaSV { get; set; }
    }
}
