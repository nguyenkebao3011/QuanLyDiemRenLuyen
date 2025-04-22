using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuanLyKhoaController : ControllerBase
    {
        private readonly QlDrlContext _context;
        public QuanLyKhoaController(QlDrlContext context)
        {
            _context = context;
        }

        [HttpGet("lay_ql_khoa")]
        public IActionResult GetKhoa()
        {
            var khoaList = _context.QuanLyKhoas.ToList();
            return Ok(khoaList);
        }

        [HttpGet("thong_tin")]
        [Authorize] // Chỉ cho phép truy cập khi đã đăng nhập
        public IActionResult GetLoggedInQuanLyKhoaInfo()
        {
            try
            {
                // Lấy mã tài khoản từ token JWT
                var maTaiKhoan = User.Claims.FirstOrDefault(c => c.Type == "maTaiKhoan")?.Value;

                if (string.IsNullOrEmpty(maTaiKhoan))
                {
                    return Unauthorized("Không thể lấy thông tin mã tài khoản từ token.");
                }

                // Tìm thông tin trong bảng QuanLyKhoa
                var quanLyKhoa = _context.QuanLyKhoas.FirstOrDefault(q => q.MaTaiKhoan == maTaiKhoan);

                if (quanLyKhoa == null)
                {
                    return NotFound("Không tìm thấy thông tin quản lý khoa liên quan đến mã tài khoản này.");
                }

                // Trả về thông tin tài khoản
                return Ok(quanLyKhoa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Đã xảy ra lỗi: {ex.Message}");
            }
        }
    }
}
