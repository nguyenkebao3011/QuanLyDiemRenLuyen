using Microsoft.AspNetCore.Mvc;
using QuanLyDiemRenLuyen.DTO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Diagnostics;

namespace QuanLyDiemRenLuyen.Controllers
{
    public class AccountController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AccountController> _logger;

        public AccountController(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<AccountController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginDto model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;

            // Kiểm tra ModelState
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState không hợp lệ");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    _logger.LogWarning($"Lỗi: {error.ErrorMessage}");
                }
                return View(model);
            }

            try
            {
                // Đảm bảo URL API đầy đủ
                var baseUrl = _configuration["ApiBaseUrl"] ?? "http://localhost:5163";
                var apiUrl = $"{baseUrl}/api/TaiKhoans/login";

                _logger.LogInformation($"Đang gửi yêu cầu đăng nhập cho {model.MaDangNhap} đến {apiUrl}");

                var client = _httpClientFactory.CreateClient();

                // Đảm bảo tên trường khớp với API
                var loginData = new
                {
                    MaDangNhap = model.MaDangNhap,
                    MatKhau = model.MatKhau
                };

                // Ghi log dữ liệu gửi đi để debug
                var jsonContent = JsonSerializer.Serialize(loginData);
                _logger.LogInformation($"Dữ liệu gửi đi: {jsonContent}");

                var content = new StringContent(
                    jsonContent,
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var loginResult = JsonSerializer.Deserialize<LoginResult>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (loginResult != null)
                    {
                        // Store token in session or cookie
                        HttpContext.Session.SetString("JWTToken", loginResult.Token);
                        HttpContext.Session.SetString("UserRole", loginResult.Role);
                        HttpContext.Session.SetString("Username", loginResult.Username);

                        _logger.LogInformation($"Đăng nhập thành công cho {model.MaDangNhap}");

                        if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                        {
                            return Redirect(returnUrl);
                        }
                        // Redirect based on role
                        return RedirectToAction("Index", "Home");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi đăng nhập: {ex.Message}");
                ModelState.AddModelError(string.Empty, $"Lỗi khi đăng nhập: {ex.Message}");
            }

            // Nếu đến đây, có nghĩa là đăng nhập thất bại
            TempData["ErrorMessage"] = "Đăng nhập không thành công. Vui lòng kiểm tra tên đăng nhập và mật khẩu.";
            return View(model);
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }

    public class LoginResult
    {
        public string Token { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
    }
}
