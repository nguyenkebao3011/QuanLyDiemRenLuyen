using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System.Text.Json;

namespace QuanLyDiemRenLuyen.Bots
{
    [Route("api/[controller]")]
    [ApiController]
    public class WebhookController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public WebhookController(QlDrlContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] JsonElement body)
        {
            try
            {
                // Lấy action từ request
                string action = body.GetProperty("queryResult").GetProperty("action").GetString();

                // Xử lý xem điểm rèn luyện
                if (action == "mssv")
                {
                    var parameters = body.GetProperty("queryResult").GetProperty("parameters");
                    var mssv = parameters.GetProperty("mssv").GetString();
                    string hocKy = null;

                    // Kiểm tra nếu có parameter hocKy
                    if (parameters.TryGetProperty("hocKy", out var hocKyElement))
                    {
                        hocKy = hocKyElement.GetString()?.Trim();
                    }

                    if (string.IsNullOrEmpty(mssv))
                    {
                        return Ok(new { fulfillmentText = "Bạn vui lòng cung cấp MSSV để tôi kiểm tra điểm giúp bạn." });
                    }

                    // Chuẩn hóa MSSV: loại bỏ khoảng trắng và chuyển thành chữ hoa
                    mssv = mssv.Replace(" ", "").ToUpper();

                    var svTonTai = await _context.SinhViens.AnyAsync(sv => sv.MaSV == mssv);
                    if (!svTonTai)
                    {
                        return Ok(new { fulfillmentText = $"Không tìm thấy sinh viên có MSSV {mssv}." });
                    }

                    // Truy vấn điểm rèn luyện
                    var query = _context.DiemRenLuyens
                        .Where(d => d.MaSv == mssv)
                        .Join(_context.HocKies,
                            diem => diem.MaHocKy,
                            hk => hk.MaHocKy,
                            (diem, hk) => new
                            {
                                hk.TenHocKy,
                                hk.MaHocKy,
                                diem.TongDiem,
                                diem.XepLoai,
                                diem.NgayChot
                            });

                    // Nếu người dùng chỉ định học kỳ
                    if (!string.IsNullOrEmpty(hocKy) && int.TryParse(hocKy, out int hocKyInt))
                    {
                        query = query.Where(d => d.MaHocKy == hocKyInt);
                        var diemHocKy = await query
                            .OrderByDescending(d => d.NgayChot)
                            .FirstOrDefaultAsync();

                        if (diemHocKy == null)
                        {
                            return Ok(new { fulfillmentText = $"Sinh viên {mssv} không có điểm rèn luyện trong học kỳ {hocKy}." });
                        }

                        var ngayChot = diemHocKy.NgayChot.HasValue ? diemHocKy.NgayChot.Value.ToString("yyyy-MM-dd") : "Chưa chốt";
                        var reply = $"Điểm rèn luyện học kỳ {diemHocKy.TenHocKy} của MSSV {mssv} là {diemHocKy.TongDiem} điểm, xếp loại {diemHocKy.XepLoai} (ngày chốt: {ngayChot}).";
                        return Ok(new { fulfillmentText = reply });
                    }
                    else
                    {
                        // Nếu không chỉ định học kỳ, lấy điểm mới nhất
                        var diemMoiNhat = await query
                            .OrderByDescending(d => d.NgayChot)
                            .FirstOrDefaultAsync();

                        if (diemMoiNhat == null)
                        {
                            return Ok(new { fulfillmentText = $"Sinh viên {mssv} chưa có điểm rèn luyện nào." });
                        }

                        var ngayChot = diemMoiNhat.NgayChot.HasValue ? diemMoiNhat.NgayChot.Value.ToString("yyyy-MM-dd") : "Chưa chốt";
                        var reply = $"Điểm rèn luyện học kỳ {diemMoiNhat.TenHocKy} của MSSV {mssv} là {diemMoiNhat.TongDiem} điểm, xếp loại {diemMoiNhat.XepLoai} (ngày chốt: {ngayChot}).";
                        return Ok(new { fulfillmentText = reply });
                    }
                }
                else if (action == "hoatdong")
                {
                    var now = DateTime.UtcNow;

                    // Lấy danh sách hoạt động đang diễn ra
                    var hoatDongDangDienRaList = await _context.HoatDongs
                        .Where(hd => hd.NgayBatDau <= now && hd.NgayKetThuc >= now)
                        .ToListAsync();

                    var hoatDongDangDienRa = hoatDongDangDienRaList.Select(hd => new
                    {
                        hd.TenHoatDong,
                        hd.MoTa,
                        hd.DiemCong,
                        hd.DiaDiem,
                        hd.SoLuongToiDa,
                        ThoiGianBatDau = hd.NgayBatDau?.ToString("yyyy-MM-dd HH:mm"),
                        ThoiGianKetThuc = hd.NgayKetThuc?.ToString("yyyy-MM-dd HH:mm")
                    });

                    // Lấy danh sách hoạt động đang mở đăng ký
                    var hoatDongDangMoDangKyList = await _context.HoatDongs
                // Corrected condition for filtering activities
                .Where(hd => hd.TrangThai == "Đang mở đăng ký" || hd.TrangThai == "Đang diễn ra")
                        .ToListAsync();

                    var hoatDongDangMoDangKy = hoatDongDangMoDangKyList.Select(hd => new
                    {
                        hd.TenHoatDong,
                        hd.MoTa,
                        hd.DiemCong,
                        hd.DiaDiem,
                        hd.SoLuongToiDa,
                        
                    });

                    // Soạn nội dung phản hồi
                    var reply = "";

                    if (hoatDongDangDienRa.Any())
                    {
                        reply += "🔴 **Các hoạt động đang diễn ra:**\n";
                        reply += string.Join("\n", hoatDongDangDienRa.Select(hd =>
                            $"- {hd.TenHoatDong}:\n  {hd.MoTa}\n  📍 Địa điểm: {hd.DiaDiem}\n  🕐 {hd.ThoiGianBatDau} → {hd.ThoiGianKetThuc}\n  ⭐ Điểm cộng: {hd.DiemCong}\n  👥 Số lượng tối đa: {hd.SoLuongToiDa}"
                        ));
                        reply += "\n\n";
                    }

                    if (hoatDongDangMoDangKy.Any())
                    {
                        reply += "🟢 **Các hoạt động đang mở đăng ký:**\n";
                        reply += string.Join("\n", hoatDongDangMoDangKy.Select(hd =>
                            $"- {hd.TenHoatDong}:\n  {hd.MoTa}\n  📍 Địa điểm: {hd.DiaDiem}\n    ⭐ Điểm cộng: {hd.DiemCong}\n  👥 Số lượng tối đa: {hd.SoLuongToiDa}"
                        ));
                    }

                    if (string.IsNullOrEmpty(reply))
                    {
                        reply = "Hiện tại không có hoạt động nào đang diễn ra hoặc mở đăng ký.";
                    }
                    return Ok(new { fulfillmentText = reply });
                }
                    else
                    {
                        // Trả về nếu action không hợp lệ hoặc không được hỗ trợ
                        return Ok(new { fulfillmentText = "Yêu cầu không hợp lệ hoặc hành động không được hỗ trợ." });
                    }
            }
            catch (Exception ex)
            {
                return Ok(new { fulfillmentText = "Có lỗi xảy ra: " + ex.Message });
            }
        }
    }
}
