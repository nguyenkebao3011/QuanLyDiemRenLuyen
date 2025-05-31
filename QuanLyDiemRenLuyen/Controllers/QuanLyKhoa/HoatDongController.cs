using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/HoatDong")]
    [ApiController]
    public class HoatDongController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public HoatDongController(QlDrlContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpPost("tao_hoat_dong")]
        public async Task<IActionResult> CreateHoatDong([FromBody] HoatDong hoatDong)
        {
            if (hoatDong == null)
            {
                return BadRequest("Dữ liệu không hợp lệ.");
            }

            try
            {
                hoatDong.NgayTao = DateTime.Now;
                hoatDong.SoLuongDaDangKy = 0;

                // Tính số ngày diễn ra
                // Fix for nullable DateTime properties
                var soNgay = ((hoatDong.NgayKetThuc?.Date ?? DateTime.MinValue) - (hoatDong.NgayBatDau?.Date ?? DateTime.MinValue)).Days + 1;

                if (soNgay >= 2)
                {
                    // Tạo bản ghi cho từng ngày
                    for (int i = 0; i < soNgay; i++)
                    {
                        var ngayDienRa = (hoatDong.NgayBatDau?.Date ?? DateTime.MinValue).AddDays(i);
                        var hoatDongMoi = new HoatDong
                        {
                            // Không cần gán MaHoatDong vì nó là IDENTITY
                            TenHoatDong = $"{hoatDong.TenHoatDong} (Ngày {i + 1})",
                            MoTa = hoatDong.MoTa,
                            NgayBatDau = ngayDienRa.Add(hoatDong.NgayBatDau?.TimeOfDay ?? TimeSpan.Zero),
                            NgayKetThuc = ngayDienRa.Add(hoatDong.NgayKetThuc?.TimeOfDay ?? TimeSpan.Zero),
                            DiaDiem = hoatDong.DiaDiem,
                            SoLuongToiDa = hoatDong.SoLuongToiDa,
                            DiemCong = hoatDong.DiemCong,
                            MaHocKy = hoatDong.MaHocKy,
                            MaQl = hoatDong.MaQl,
                            TrangThai = hoatDong.TrangThai,
                            NgayTao = hoatDong.NgayTao,
                            SoLuongDaDangKy = hoatDong.SoLuongDaDangKy,
                            NgayDienRa = true, // Gán 1 cho hoạt động nhiều ngày
                            LoaiHoatDong = DetermineLoaiHoatDong(hoatDong.TenHoatDong, hoatDong.MoTa)
                        };

                        _context.HoatDongs.Add(hoatDongMoi);
                    }
                }
                else
                {
                    // Hoạt động 1 ngày
                    hoatDong.NgayDienRa = false;
                    hoatDong.LoaiHoatDong = DetermineLoaiHoatDong(hoatDong.TenHoatDong, hoatDong.MoTa);
                    _context.HoatDongs.Add(hoatDong);
                }

                await _context.SaveChangesAsync();

                // Trả về bản ghi đầu tiên hoặc danh sách các bản ghi
                return CreatedAtAction(nameof(GetHoatDongById), new { id = hoatDong.MaHoatDong }, hoatDong);
            }
            catch (Exception ex)
            {
            
                return StatusCode(500, $"Lỗi khi thêm hoạt động: {ex.Message}");
            }
        }

        // Hàm helper để xác định LoaiHoatDong
        private string DetermineLoaiHoatDong(string tenHoatDong, string moTa)
        {
            if (string.IsNullOrEmpty(tenHoatDong) && string.IsNullOrEmpty(moTa))
                return "Khác";

            tenHoatDong = tenHoatDong?.ToLower() ?? "";
            moTa = moTa?.ToLower() ?? "";

            if (tenHoatDong.Contains("hội thảo") || tenHoatDong.Contains("tập huấn") || moTa.Contains("hội thảo") || moTa.Contains("tập huấn"))
                return "Hội thảo";
            if (tenHoatDong.Contains("tình nguyện") || tenHoatDong.Contains("dọn dẹp") || tenHoatDong.Contains("hỗ trợ trẻ em") ||
                tenHoatDong.Contains("người cao tuổi") || tenHoatDong.Contains("khuyết tật") || moTa.Contains("tình nguyện") || moTa.Contains("dọn dẹp"))
                return "Tình nguyện";
            if (tenHoatDong.Contains("hỗ trợ") || tenHoatDong.Contains("nhập liệu") || tenHoatDong.Contains("sắp xếp") ||
                moTa.Contains("hỗ trợ") || moTa.Contains("nhập liệu"))
                return "Hỗ trợ";
            if (tenHoatDong.Contains("giải") || tenHoatDong.Contains("thi") || tenHoatDong.Contains("hùng biện") || tenHoatDong.Contains(" thể thao") ||
                moTa.Contains("thi đấu") || moTa.Contains("hùng biện"))
                return "Thi đấu";
            if (tenHoatDong.Contains("ngày hội") || tenHoatDong.Contains("tổ chức") || moTa.Contains("ngày hội") || moTa.Contains("tổ chức"))
                return "Tổ chức";

            return "Khác";
        }

        // GET: api/HoatDong/lay_hoat_dong_all
        [HttpGet("lay_hoat_dong_all")]
        public async Task<ActionResult<IEnumerable<HoatDong>>> GetHoatDongs()
        {
            return await _context.HoatDongs.ToListAsync();
        }

        // GET: api/HoatDong/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<HoatDong>> GetHoatDong(int id)
        {
            var hoatDong = await _context.HoatDongs.FindAsync(id);

            if (hoatDong == null)
            {
                return NotFound();
            }

            return hoatDong;
        }

        // GET: api/HoatDong/lay_thong_tin_hd/{id}
        [HttpGet("lay_thong_tin_hd/{id}")]
        public async Task<IActionResult> GetHoatDongById(int id)
        {
            var hoatDong = await _context.HoatDongs.FindAsync(id);
            if (hoatDong == null)
            {
                return NotFound($"Không tìm thấy hoạt động với ID {id}.");
            }
            return Ok(hoatDong);
        }

        // PUT: api/HoatDong/sua_hoat_dong/{id}
        [HttpPut("sua_hoat_dong/{id}")]
        public async Task<IActionResult> UpdateHoatDong(int id, [FromBody] HoatDong hoatDongUpdate)
        {
            if (hoatDongUpdate == null || id != hoatDongUpdate.MaHoatDong)
            {
                return BadRequest("Dữ liệu không hợp lệ hoặc ID không khớp.");
            }

            var hoatDong = await _context.HoatDongs.FindAsync(id);
            if (hoatDong == null)
            {
                return NotFound($"Không tìm thấy hoạt động với ID {id}.");
            }

            // Lưu giá trị cũ để so sánh
            var oldNgayBatDau = hoatDong.NgayBatDau;
            var oldNgayKetThuc = hoatDong.NgayKetThuc;
            var oldDiaDiem = hoatDong.DiaDiem;

            // Cho phép cập nhật trường TrạngThái bất cứ lúc nào 
            hoatDong.TrangThai = hoatDongUpdate.TrangThai;

            // Nếu hoạt động đã kết thúc, chỉ cho phép sửa mô tả và trạng thái
            if (string.Equals(hoatDong.TrangThai, "Đã kết thúc", StringComparison.OrdinalIgnoreCase))
            {
                hoatDong.MoTa = hoatDongUpdate.MoTa;
            }
            else
            {
                // Nếu chưa kết thúc, cho phép sửa đầy đủ các trường
                hoatDong.TenHoatDong = hoatDongUpdate.TenHoatDong;
                hoatDong.MoTa = hoatDongUpdate.MoTa;
                hoatDong.NgayBatDau = hoatDongUpdate.NgayBatDau;
                hoatDong.NgayKetThuc = hoatDongUpdate.NgayKetThuc;
                hoatDong.DiaDiem = hoatDongUpdate.DiaDiem;
                hoatDong.SoLuongToiDa = hoatDongUpdate.SoLuongToiDa;
                hoatDong.DiemCong = hoatDongUpdate.DiemCong;
                hoatDong.MaHocKy = hoatDongUpdate.MaHocKy;
                hoatDong.MaQl = hoatDongUpdate.MaQl;
            }

            // Kiểm tra thay đổi thời gian hoặc địa điểm
            bool hasChanges = oldNgayBatDau != hoatDong.NgayBatDau ||
                              oldNgayKetThuc != hoatDong.NgayKetThuc ||
                              oldDiaDiem != hoatDong.DiaDiem;

            try
            {
                if (hasChanges)
                {
                    // Tạo thông báo
                    var thongBao = new ThongBao
                    {
                        TieuDe = $"Cập nhật lịch trình: {hoatDong.TenHoatDong}",
                        NoiDung = $"Hoạt động {hoatDong.TenHoatDong} đã được cập nhật." +
                                   $"Hoạt động sẽ bắt đầu vào lúc {hoatDong.NgayBatDau?.ToString("HH:mm  'ngày' dd'/'MM'/'yyyy") ?? "chưa xác định"} - Kết thúc vào ngày {hoatDong.NgayKetThuc?.ToString("dd'/'MM'/'yyyy") ?? "chưa xác định"}. " +
                                  $"Địa điểm: {hoatDong.DiaDiem}." +
                                  $"Vì một số lý do, lịch trình hoạt động đã thay đổi. Rất mong các bạn sinh viên tham gia theo đúng kế hoạch. Trân Trọng.",
                        NgayTao = DateTime.Now,
                        MaQl = hoatDong.MaQl, // Lấy từ HoatDong
                        LoaiThongBao = "Thay đổi lịch trình",
                        TrangThai = "Đã đăng"
                    };
                    _context.ThongBaos.Add(thongBao);
                    await _context.SaveChangesAsync(); // Lưu để lấy MaThongBao

                    // Lấy danh sách sinh viên đăng ký thành công
                    var sinhViens = await _context.DangKyHoatDongs
                        .Where(dk => dk.MaHoatDong == id && dk.TrangThai == "Đăng ký thành công")
                        .Select(dk => dk.MaSv)
                        .ToListAsync();

                    // Tạo chi tiết thông báo cho từng sinh viên
                    var chiTietThongBaos = sinhViens.Select(maSv => new ChiTietThongBao
                    {
                        MaThongBao = thongBao.MaThongBao,
                        MaSv = maSv,
                        DaDoc = false,
                        NgayDoc = null
                    }).ToList();

                    _context.ChiTietThongBaos.AddRange(chiTietThongBaos);
                }

                _context.HoatDongs.Update(hoatDong);
                await _context.SaveChangesAsync();
                return Ok(hoatDong);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi cập nhật hoạt động: {ex.Message}");
            }
        }

        // DELETE: api/HoatDong/xoa_hoat_dong/{id}
        [HttpDelete("xoa_hoat_dong/{id}")]
        public async Task<IActionResult> DeleteHoatDong(int id)
        {
            var hoatDong = await _context.HoatDongs.FindAsync(id);
            if (hoatDong == null)
            {
                return NotFound($"Không tìm thấy hoạt động với ID {id}.");
            }

            // Sửa điều kiện này
            if (
                !string.Equals(hoatDong.TrangThai, "Chưa bắt đầu", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(hoatDong.TrangThai, "Đã kết thúc", StringComparison.OrdinalIgnoreCase)
            )
            {
                return BadRequest("Chỉ có thể xóa hoạt động khi trạng thái là 'Chưa bắt đầu' hoặc 'Đã kết thúc'.");
            }

            try
            {
                _context.HoatDongs.Remove(hoatDong);
                await _context.SaveChangesAsync();
                return Ok($"Đã xóa hoạt động với ID {id}.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi xóa hoạt động: {ex.Message}");
            }
        }
    }
}