using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoatDongsController : ControllerBase
    {
        private readonly QlDrlContext _context;
        private readonly HttpClient _httpClient;
        public HoatDongsController(QlDrlContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient(); // Khởi tạo HttpClient từ IHttpClientFactory
            _httpClient.BaseAddress = new Uri("http://localhost:5555"); // Địa chỉ FastAPI
        }
        [HttpGet("loc-hoat-dong")]
        public IActionResult GetHoatDong([FromQuery] HoatDongFilterDTO filter)
        {
            var query = _context.HoatDongs.AsQueryable();
            var currentDate = DateTime.Now;

            // Danh sách trạng thái hợp lệ
            var cacTrangThaiHopLe = new[] { "đang diễn ra", "đang mở đăng ký", "đã đóng đăng ký" };

            // Luôn lọc chỉ lấy các hoạt động có trạng thái hợp lệ
            query = query.Where(h => cacTrangThaiHopLe.Contains(h.TrangThai));

            // Lọc theo tên hoạt động
            if (!string.IsNullOrWhiteSpace(filter.Ten))
            {
                query = query.Where(h => h.TenHoatDong.Contains(filter.Ten));
            }

            // Lọc theo ngày bắt đầu
            if (filter.BatDauTu.HasValue)
            {
                query = query.Where(h => h.NgayBatDau >= filter.BatDauTu.Value);
            }

            // Lọc theo ngày và giờ kết thúc
            if (filter.KetThucTruoc.HasValue)
            {
                query = query.Where(h => h.NgayKetThuc <= filter.KetThucTruoc.Value);
            }

            // Lọc theo điểm tối thiểu
            if (filter.DiemMin.HasValue)
            {
                query = query.Where(h => h.DiemCong >= filter.DiemMin.Value);
            }

            // Lọc theo điểm tối đa
            if (filter.DiemMax.HasValue)
            {
                query = query.Where(h => h.DiemCong <= filter.DiemMax.Value);
            }

            // Lọc hoạt động kéo dài hơn 2 ngày
            if (filter.IsLongerThanTwoDays)
            {
                query = query.Where(h => h.NgayDienRa == true);
            }

            // Lọc theo trạng thái cụ thể (nếu được cung cấp)
            if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            {
                string trangThaiFilter = filter.TrangThai.Trim().ToLower();
                if (cacTrangThaiHopLe.Contains(trangThaiFilter))
                {
                    query = query.Where(h => h.TrangThai.ToLower() == trangThaiFilter);
                }
                else
                {
                    // Trả về danh sách rỗng nếu trạng thái không hợp lệ
                    return Ok(new List<HoatDong>());
                }
            }

            // Sắp xếp theo hoạt động mới nhất
            if (filter.IsLatest)
            {
                query = query.OrderByDescending(h => h.NgayTao);
            }

            var result = query.ToList();
            return Ok(result);
        }
        // GET: api/HoatDongs
        [HttpGet("lay-danh-sach-hoat-dong")]
        public async Task<ActionResult<IEnumerable<HoatDong>>> GetHoatDongs()
        {
                    var hoatDongs = await _context.HoatDongs
                .Where(h => h.TrangThai != "Đã kết thúc")
                .ToListAsync();

                    return Ok(hoatDongs);
        }

        [HttpGet("lay-danh-sach-hoat-dong-mo-dang-ky")]
        public async Task<ActionResult<IEnumerable<HoatDong>>> GetHoatDongsMoDangKy()
        {
            var hoatDongs = await _context.HoatDongs
                .Where(h => h.TrangThai == "Đang mở đăng ký")
                .ToListAsync();

            return Ok(hoatDongs);
        }

         [HttpPost("goi-y-hoat-dong")]
              public async Task<IActionResult> Recommend([FromBody] RecommendationRequest request)
                 {
                   try
                    {
                        // Chuẩn bị payload để gửi tới FastAPI
                        var payload = new
                        {
                            ma_sinh_vien = request.MaSinhVien,
                            top_n = request.TopN
                        };
                        var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

                        // Gọi API FastAPI
                        var response = await _httpClient.PostAsync("/recommend", content);
                        response.EnsureSuccessStatusCode();

                        // Đọc kết quả từ FastAPI
                        var responseString = await response.Content.ReadAsStringAsync();
                        var recommendations = JsonConvert.DeserializeObject<RecommendationResponse>(responseString);

                        // Trả về kết quả
                        return Ok(recommendations);
                    }
                    catch (HttpRequestException ex)
                    {
                        return StatusCode(500, new { error = $"Lỗi khi gọi API gợi ý: {ex.Message}" });
                    }
                }
            }

            public class RecommendationRequest
            {
                public string MaSinhVien { get; set; }
                public int TopN { get; set; } = 6;
            }

            public class RecommendationResponse
            {
                public List<RecommendationItem> Recommendations { get; set; }
                public string Type { get; set; }
                public string Error { get; set; }
            }

            public class RecommendationItem
            {
                public int MaHoatDong { get; set; }
                public string TenHoatDong { get; set; }
                public string LoaiHoatDong { get; set; }
                public int NgayDienRa { get; set; }
            }
}

