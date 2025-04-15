using Microsoft.AspNetCore.Mvc;

namespace QuanLyDiemRenLuyen.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // Kiểm tra xem người dùng đã đăng nhập chưa
            if (HttpContext.Session.GetString("JWTToken") == null)
            {
                return RedirectToAction("Login", "Account");
            }

            // Nếu đã đăng nhập, hiển thị trang chủ
            return View();
        }
    }
}
