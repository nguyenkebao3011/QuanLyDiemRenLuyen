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
                _context.HoatDongs.Add(hoatDong);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetHoatDongById), new { id = hoatDong.MaHoatDong }, hoatDong);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi thêm hoạt động: {ex.Message}");
            }
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
                                   $"Hoạt động sẽ bắt đầu vào lúc {hoatDong.NgayBatDau?.ToString("HH:mm 'giờ' 'ngày' dd'/'MM'/'yyyy") ?? "chưa xác định"} - Kết thúc vào ngày {hoatDong.NgayKetThuc?.ToString("dd'/'MM'/'yyyy") ?? "chưa xác định"}. " +
                                  $"Địa điểm: {hoatDong.DiaDiem} '.'" +
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