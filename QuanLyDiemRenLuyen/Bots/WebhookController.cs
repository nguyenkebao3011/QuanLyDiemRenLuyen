using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using QuanLyDiemRenLuyen.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace QuanLyDiemRenLuyen.Bots
{
    [Route("api/[controller]")]
    [ApiController]
    public class WebhookController : ControllerBase
    {
        private readonly QlDrlContext _context;
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private readonly string _geminiApiKey;

        public WebhookController(QlDrlContext context, HttpClient httpClient, IMemoryCache cache, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _cache = cache;
            _geminiApiKey = configuration["Gemini:ApiKey"] ?? "AIzaSyCLu6g8RJKJNEU58Zfb9P8apKu7JnyoIBA"; // Lấy từ cấu hình hoặc dùng key mặc định
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] JsonElement body)
        {
            try
            {
                string action = "";
                string sessionId = "";
                if (body.TryGetProperty("session", out var sessionElement))
                {
                    sessionId = sessionElement.GetString() ?? Guid.NewGuid().ToString(); // Lấy session ID hoặc tạo mới
                }
                if (body.TryGetProperty("queryResult", out var queryResultElement) &&
                    queryResultElement.TryGetProperty("action", out var actionElement))
                {
                    action = actionElement.GetString() ?? "";
                }

                // Xử lý action chatbot tự động
                if (action == "chatBot")
                {
                    // Lấy câu hỏi từ người dùng
                    string userQuery = body.TryGetProperty("queryResult", out var queryResult)
                        ? queryResult.TryGetProperty("queryText", out var queryText)
                            ? queryText.GetString() ?? ""
                            : ""
                        : "";

                    if (string.IsNullOrEmpty(userQuery))
                    {
                        return Ok(new { fulfillmentText = "Vui lòng gửi câu hỏi để tôi trả lời!" });
                    }

                    // Tạo key cho cache dựa trên sessionId
                    string cacheKey = $"chatbot_session_{sessionId}";
                    List<(string Question, string Answer)> conversationHistory;

                    // Kiểm tra lịch sử trong cache
                    if (_cache.TryGetValue(cacheKey, out List<(string, string)> cachedHistory))
                    {
                        conversationHistory = cachedHistory;
                    }
                    else
                    {
                        conversationHistory = new List<(string, string)>();
                    }

                    // Tạo danh sách parts cho Gemini API, bao gồm lịch sử và câu hỏi mới
                    var parts = new List<object>
            {
                new { text = "Bạn là trợ lý AI thân thiện, trả lời bằng tiếng Việt, ngắn gọn và chính xác. Dựa trên ngữ cảnh của cuộc trò chuyện trước đó để trả lời câu hỏi mới." }
            };

                    // Thêm lịch sử trò chuyện
                    foreach (var (question, answer) in conversationHistory)
                    {
                        parts.Add(new { text = $"Người dùng hỏi: {question}" });
                        parts.Add(new { text = $"Trợ lý trả lời: {answer}" });
                    }

                    // Thêm câu hỏi mới
                    parts.Add(new { text = userQuery });

                    // Gọi Gemini API

                    //string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={_geminiApiKey}";
                   
                    //// Hoặc với Gemini 2.5 Flash Preview 05-20
                    string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={_geminiApiKey}";
                    var requestBody = new
                    {
                        contents = new[]
                        {
                    new { parts }
                },
                        generationConfig = new
                        {
                            maxOutputTokens = 100,
                            temperature = 0.7
                        }
                    };
                    var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                    var response = await _httpClient.PostAsync(apiUrl, content);
                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Gemini API Error: StatusCode={response.StatusCode}, Content={errorContent}");
                        return Ok(new
                        {
                            fulfillmentText = $"Có lỗi khi gọi Gemini API: {response.StatusCode} - {errorContent}"
                        });
                    }

                    var responseData = await response.Content.ReadFromJsonAsync<JsonElement>();
                    string reply = responseData.TryGetProperty("candidates", out var candidates)
                        ? candidates[0].TryGetProperty("content", out var contentElement)
                            ? contentElement.TryGetProperty("parts", out var partsElement)
                                ? partsElement[0].TryGetProperty("text", out var text)
                                    ? text.GetString()?.Trim() ?? "Không có câu trả lời."
                                    : "Không có câu trả lời."
                                : "Không có câu trả lời."
                            : "Không có câu trả lời."
                        : "Không có câu trả lời.";

                    // Cập nhật lịch sử trò chuyện
                    conversationHistory.Add((userQuery, reply));
                    // Giới hạn số lượng lịch sử để tránh quá tải (ví dụ: giữ 10 tin nhắn gần nhất)
                    if (conversationHistory.Count > 10)
                    {
                        conversationHistory.RemoveAt(0);
                    }

                    // Lưu lịch sử vào cache (hết hạn sau 1 giờ)
                    _cache.Set(cacheKey, conversationHistory, TimeSpan.FromHours(1));

                    return Ok(new { fulfillmentText = reply });
                }

                // Giữ nguyên các action hiện có
                if (action == "mssv")
                {
                    var parameters = body.GetProperty("queryResult").GetProperty("parameters");
                    var mssv = parameters.GetProperty("mssv").GetString();
                    string hocKy = null;

                    if (parameters.TryGetProperty("hocKy", out var hocKyElement))
                    {
                        hocKy = hocKyElement.GetString()?.Trim();
                    }

                    if (string.IsNullOrEmpty(mssv))
                    {
                        return Ok(new { fulfillmentText = "Bạn vui lòng cung cấp MSSV để tôi kiểm tra điểm giúp bạn." });
                    }

                    mssv = mssv.Replace(" ", "").ToUpper();
                    var svTonTai = await _context.SinhViens.AnyAsync(sv => sv.MaSV == mssv);
                    if (!svTonTai)
                    {
                        return Ok(new { fulfillmentText = $"Không tìm thấy sinh viên có MSSV {mssv}." });
                    }

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
                        var reply = $"Điểm rèn luyện {diemHocKy.TenHocKy} của MSSV {mssv} là {diemHocKy.TongDiem} điểm, xếp loại {diemHocKy.XepLoai} (ngày chốt: {ngayChot}).";
                        return Ok(new { fulfillmentText = reply });
                    }
                    else
                    {
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
                    var now = DateTime.UtcNow.AddHours(7);
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
                    int? diemToiDa = parameters.TryGetProperty("diemtoiDa", out var diemToiDaElement)
                        ? int.TryParse(diemToiDaElement.GetString(), out int dd) ? dd : (int?)null
                        : null;
                    bool hoatDongMoiNhat = parameters.TryGetProperty("moiNhat", out var moiNhatElement)
                        ? moiNhatElement.GetString()?.Trim().ToLower() == "true"
                        : false;

                    var hoatDongQuery = _context.HoatDongs.AsQueryable();

                    if (!string.IsNullOrEmpty(tenHoatDong))
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.TenHoatDong.Contains(tenHoatDong));
                    }

                    if (!string.IsNullOrEmpty(trangThai) && trangThai != "Tất cả")
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.TrangThai == trangThai);
                    }

                    if (ngayBatDau.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.NgayBatDau >= ngayBatDau);
                    }
                    if (ngayKetThuc.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.NgayKetThuc <= ngayKetThuc);
                    }

                    if (diemToiThieu.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.DiemCong >= diemToiThieu);
                    }
                    if (diemToiDa.HasValue)
                    {
                        hoatDongQuery = hoatDongQuery.Where(hd => hd.DiemCong <= diemToiDa);
                    }

                    var hoatDongList = await hoatDongQuery.ToListAsync();

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