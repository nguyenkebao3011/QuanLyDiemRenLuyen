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

        // GET: api/ThongBao/lay_thong_bao_phan_trang?trang=1&soLuong=10
        [HttpGet("lay_thong_bao_phan_trang")]
        public async Task<ActionResult<PaginatedResult<ThongBaoDTO>>> LayThongBaoPhanTrang(int trang = 1, int soLuong = 10)
        {
            try
            {
                if (trang < 1) trang = 1;
                if (soLuong < 1) soLuong = 10;

                var query = _context.ThongBaos
                    .Include(t => t.MaQlNavigation)
                    .Include(t => t.ChiTietThongBaos)
                    .Where(t => t.TrangThai == "Đã đăng")
                    .OrderByDescending(t => t.NgayTao);

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)soLuong);

                var thongBaos = await query
                    .Skip((trang - 1) * soLuong)
                    .Take(soLuong)
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

                var result = new PaginatedResult<ThongBaoDTO>
                {
                    TongSoTrang = totalPages,
                    TrangHienTai = trang,
                    SoLuongMoiTrang = soLuong,
                    TongSoMuc = totalItems,
                    DanhSach = thongBaos
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // GET: api/ThongBao/lay_thong_bao_theo_loai/{loaiThongBao}
        [HttpGet("lay_thong_bao_theo_loai/{loaiThongBao}")]
        public async Task<ActionResult<IEnumerable<ThongBaoDTO>>> LayThongBaoTheoLoai(string loaiThongBao)
        {
            try
            {
                var thongBaos = await _context.ThongBaos
                    .Include(t => t.MaQlNavigation)
                    .Include(t => t.ChiTietThongBaos)
                    .Where(t => t.TrangThai == "Đã đăng" && t.LoaiThongBao == loaiThongBao)
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
                    return NotFound($"Không tìm thấy thông báo nào thuộc loại '{loaiThongBao}'");
                }

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
    }

    public class DanhDauDaDocRequest
    {
        public int MaThongBao { get; set; }
        public string MaSV { get; set; }
    }
}
