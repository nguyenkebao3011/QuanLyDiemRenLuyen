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
                // Lấy action từ request, kiểm tra an toàn
                string action = "";
                if (body.TryGetProperty("queryResult", out var queryResultElement) &&
                    queryResultElement.TryGetProperty("action", out var actionElement))
                {
                    action = actionElement.GetString() ?? "";
                }

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
                        var reply = $"Điểm rèn luyện  {diemHocKy.TenHocKy} của MSSV {mssv} là {diemHocKy.TongDiem} điểm, xếp loại {diemHocKy.XepLoai} (ngày chốt: {ngayChot}).";
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
                        .Where(hd => hd.TrangThai == "Đang mở đăng ký" || hd.TrangThai == "Đang diễn ra")
                        .ToListAsync();

                    var hoatDongDangMoDangKy = hoatDongDangMoDangKyList.Select(hd => new
                    {
                        hd.TenHoatDong,
                        hd.MoTa,
                        hd.DiemCong,
                        hd.DiaDiem,
                        hd.SoLuongToiDa
                    });

                    // Soạn nội dung phản hồi
                    var reply = "";

                    if (hoatDongDangDienRa.Any())
                    {
                        reply += "🔴 **Các Hoạt Động Đang Diễn Ra** 🔴\n\n";
                        reply += string.Join("\n\n", hoatDongDangDienRa.Select(hd =>
                            $"**{hd.TenHoatDong}**\n" +
                            $"📝 --Mô tả--: {hd.MoTa}\n" +
                            $"📍 --Địa điểm--: {hd.DiaDiem}\n" +
                            $"🕒 --Thời gian--: {hd.ThoiGianBatDau} → {hd.ThoiGianKetThuc}\n" +
                            $"⭐ --Điểm cộng--: {hd.DiemCong}\n" +
                            $"👥 --Số lượng tối đa--: {hd.SoLuongToiDa}"
                        ));
                        reply += "\n\n";
                    }

                    if (hoatDongDangMoDangKy.Any())
                    {
                        reply += "🟢 **Các Hoạt Động Đang Mở Đăng Ký** 🟢\n\n";
                        reply += string.Join("\n\n", hoatDongDangMoDangKy.Select(hd =>
                            $"{hd.TenHoatDong}\n" +
                            $"📝 --Mô tả--: {hd.MoTa}\n" +
                            $"📍 --Địa điểm--: {hd.DiaDiem}\n" +
                            $"⭐ --Điểm cộng--: {hd.DiemCong}\n" +
                            $"👥 --Số lượng tối đa--: {hd.SoLuongToiDa}"
                        ));
                        reply += "\n";
                    }

                    if (string.IsNullOrEmpty(reply))
                    {
                        reply = "🔔 Hiện tại không có hoạt động nào đang diễn ra hoặc mở đăng ký.";
                    }

                    return Ok(new { fulfillmentText = reply });
                }
                else if (action == "locHoatDong")
                {
                    var now = DateTime.UtcNow.AddHours(7); // Điều chỉnh múi giờ +07 (04:40 PM +07, 22/05/2025)

                    // Lấy parameters từ request với kiểm tra an toàn
                    var parameters = body.GetProperty("queryResult").GetProperty("parameters");
                    string tenHoatDong = parameters.TryGetProperty("tenHoatDong", out var tenHoatDongElement)
                        ? tenHoatDongElement.GetString()?.Trim() ?? ""
                        : "";
                    string trangThai = parameters.TryGetProperty("trangThai", out var trangThaiElement)
                        ? trangThaiElement.GetString()?.Trim() ?? ""
                        : "";
                    DateTime? ngayBatDau = parameters.TryGetProperty("ngayBatDau", out var ngayBatDauElement)
                        ? DateTime.TryParse(ngayBatDauElement.GetString(), out DateTime nb) ? nb : (DateTime?)null
                        : null;
                    DateTime? ngayKetThuc = parameters.TryGetProperty("ngayKetThuc", out var ngayKetThucElement)
                        ? DateTime.TryParse(ngayKetThucElement.GetString(), out DateTime nk) ? nk : (DateTime?)null
                        : null;
                    int? diemToiThieu = parameters.TryGetProperty("diemToiThieu", out var diemToiThieuElement)
                        ? int.TryParse(diemToiThieuElement.GetString(), out int dt) ? dt : (int?)null
                        : null;
                    int? diemToiDa = parameters.TryGetProperty("diemtoiDa", out var diemToiDaElement) // Sửa key "diemtoiDa"
                        ? int.TryParse(diemToiDaElement.GetString(), out int dd) ? dd : (int?)null
                        : null;
                    bool hoatDongMoiNhat = parameters.TryGetProperty("moiNhat", out var moiNhatElement)
                        ? moiNhatElement.GetString()?.Trim().ToLower() == "true"
                        : false;

                    // Xây dựng query cơ bản
                    var hoatDongQuery = _context.HoatDongs.AsQueryable();

                    // Lọc theo tên
                    if (!string.IsNullOrEmpty(tenHoatDong))
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.TenHoatDong.Contains(tenHoatDong));
                    }

                    // Lọc theo trạng thái
                    if (!string.IsNullOrEmpty(trangThai) && trangThai != "Tất cả")
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.TrangThai == trangThai);
                    }

                    // Lọc theo thời gian
                    if (ngayBatDau.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.NgayBatDau >= ngayBatDau);
                    }
                    if (ngayKetThuc.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.NgayKetThuc <= ngayKetThuc);
                    }

                    // Lọc theo điểm
                    if (diemToiThieu.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.DiemCong >= diemToiThieu);
                    }
                    if (diemToiDa.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.DiemCong <= diemToiDa);
                    }

                    // Lấy danh sách hoạt động
                    var hoatDongList = await hoatDongQuery.ToListAsync();

                    // Nếu chọn hoạt động mới nhất
                    if (hoatDongMoiNhat && hoatDongList.Any())
                    {
                        var hoatDongMoiNhatItem = hoatDongList.OrderByDescending(hd => hd.NgayBatDau).First();
                        hoatDongList = new List<HoatDong> { hoatDongMoiNhatItem };
                    }

                    var hoatDongResult = hoatDongList.Select(hd => new
                    {
                        hd.TenHoatDong,
                        hd.MoTa,
                        hd.DiemCong,
                        hd.DiaDiem,
                        hd.SoLuongToiDa,
                        ThoiGianBatDau = hd.NgayBatDau?.ToString("yyyy-MM-dd HH:mm"),
                        ThoiGianKetThuc = hd.NgayKetThuc?.ToString("yyyy-MM-dd HH:mm"),
                        hd.TrangThai
                    });

                    // Soạn nội dung phản hồi
                    var reply = "";
                    if (hoatDongResult.Any())
                    {
                        reply += "🔵 **Kết quả lọc hoạt động** 🔵\n\n";
                        reply += string.Join("\n\n", hoatDongResult.Select(hd =>
                            $"**{hd.TenHoatDong}**\n" +
                            $"📝 --Mô tả--: {hd.MoTa}\n" +
                            $"📍 --Địa điểm--: {hd.DiaDiem}\n" +
                            $"🕒 --Thời gian--: {hd.ThoiGianBatDau} → {hd.ThoiGianKetThuc}\n" +
                            $"⭐ --Điểm cộng--: {hd.DiemCong}\n" +
                            $"👥 --Số lượng tối đa--: {hd.SoLuongToiDa}\n" +
                            $"🔔 --Trạng thái--: {hd.TrangThai}"
                        ));
                    }
                    else
                    {
                        reply = "🔔 Không tìm thấy hoạt động nào khớp với điều kiện lọc.";
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
