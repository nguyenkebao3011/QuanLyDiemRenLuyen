using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuanLyDiemRenLuyen.Models;
using QuanLyDiemRenLuyen.DTO;
using Microsoft.AspNetCore.Identity;
using MimeKit;

namespace QuanLyDiemRenLuyen.Controllers.SinhVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiKhoansController : ControllerBase
    {
        private readonly QlDrlContext _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public TaiKhoansController(QlDrlContext context, IConfiguration config, IEmailService emailService)
        {

            _context = context;
            _config = config;
            _emailService = emailService;
        }

        // GET: api/TaiKhoans
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaiKhoan>>> GetTaiKhoans()
        {
            return await _context.TaiKhoans.ToListAsync();
        }

        // GET: api/TaiKhoans/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TaiKhoan>> GetTaiKhoan(string id)
        {
            var taiKhoan = await _context.TaiKhoans.FindAsync(id);

            if (taiKhoan == null)
            {
                return NotFound();
            }

            return taiKhoan;
        }

        // PUT: api/TaiKhoans/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTaiKhoan(string id, TaiKhoan taiKhoan)
        {
            if (id != taiKhoan.MaTaiKhoan)
            {
                return BadRequest();
            }

            _context.Entry(taiKhoan).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaiKhoanExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/TaiKhoans
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TaiKhoan>> PostTaiKhoan(TaiKhoan taiKhoan)
        {
            _context.TaiKhoans.Add(taiKhoan);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TaiKhoanExists(taiKhoan.MaTaiKhoan))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTaiKhoan", new { id = taiKhoan.MaTaiKhoan }, taiKhoan);
        }

        // DELETE: api/TaiKhoans/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaiKhoan(string id)
        {
            var taiKhoan = await _context.TaiKhoans.FindAsync(id);
            if (taiKhoan == null)
            {
                return NotFound();
            }

            _context.TaiKhoans.Remove(taiKhoan);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TaiKhoanExists(string id)
        {
            return _context.TaiKhoans.Any(e => e.MaTaiKhoan == id);
        }
        //[HttpPost("hash-all-passwords")]
        //public IActionResult HashAllPasswords()
        //{
        //    var passwordHasher = new PasswordHasher<string>();

        //    var users = _context.TaiKhoans.ToList();

        //    foreach (var user in users)
        //    {
        //        // Nếu mật khẩu chưa được hash (kiểm tra bằng cách xem nếu mật khẩu không bắt đầu bằng 'A')
        //        if (!user.MatKhau.StartsWith("A"))
        //        {
        //            // Hash mật khẩu một lần duy nhất và lưu lại
        //            var hashed = passwordHasher.HashPassword(null, user.MatKhau);
        //            user.MatKhau = hashed;
        //        }
        //    }

        //    _context.SaveChanges();  // Lưu lại những thay đổi vào cơ sở dữ liệu

        //    return Ok("Đã hash xong toàn bộ mật khẩu.");
        //}
        [HttpPost("login")]
        public IActionResult Login(LoginDto request)
        {
            var user = _context.TaiKhoans
                .FirstOrDefault(x => x.TenDangNhap == request.MaDangNhap);

            if (user == null)
                return BadRequest("Sai tên đăng nhập");

            // Kiểm tra mật khẩu đã được hash và so sánh
            var passwordHasher = new PasswordHasher<string>();
            var result = passwordHasher.VerifyHashedPassword(null, user.MatKhau, request.MatKhau);

            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Sai tên đăng nhập hoặc mật khẩu");

            // Ghi log thông tin (chỉ để debug)
           

            // Nếu đúng mật khẩu => tạo token
            var claims = new[]
            {
        new Claim(ClaimTypes.Name, user.TenDangNhap),
        new Claim(ClaimTypes.Role, user.VaiTro),
        new Claim("maTaiKhoan", user.MaTaiKhoan),
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(_config["Jwt:ExpiresInMinutes"])),
                signingCredentials: creds
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                username = user.TenDangNhap,
                role = user.VaiTro,
                maTaiKhoan = user.MaTaiKhoan,
            });
        }
        [HttpPost("reset-all-passwords")]
        public IActionResult ResetAllPasswords()
        {
            var passwordHasher = new PasswordHasher<string>();

            var users = _context.TaiKhoans.ToList();

            foreach (var user in users)
            {
                // Hash mật khẩu "123456" cho tất cả người dùng
                var hashed = passwordHasher.HashPassword(null, "123456");
                user.MatKhau = hashed;
            }

            _context.SaveChanges();  // Lưu lại những thay đổi vào cơ sở dữ liệu

            return Ok("Đã reset tất cả mật khẩu thành '123456'.");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] EmailServicesDTO request)
        {
            // Tìm tài khoản dựa trên TenDangNhap (MaSoSinhVien)
            var taiKhoan = await _context.TaiKhoans
                .Include(tk => tk.SinhVien)
                .FirstOrDefaultAsync(tk => tk.TenDangNhap == request.TenDangNhap);
            if (taiKhoan == null || taiKhoan.SinhVien == null)
            {
                return BadRequest(new { message = "Mã số sinh viên không tồn tại." });
            }

            // Lấy email từ SinhVien
            var email = taiKhoan.SinhVien.Email;
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Sinh viên này chưa có email." });
            }

            // Tạo OTP (mã 6 chữ số)
            var otp = new Random().Next(100000, 999999).ToString();

            // Xóa OTP cũ nếu có
            var oldOtp = await _context.OTPRecords
                .FirstOrDefaultAsync(o => o.Email == email);
            if (oldOtp != null)
            {
                _context.OTPRecords.Remove(oldOtp);
            }
            var vietnamTime = DateTime.UtcNow.AddHours(7);
           
            var expiryTime = vietnamTime.AddMinutes(1);
            // Lưu OTP mới
            var otpRecord = new OTPRecords
            {
                Email = email,
                Otp = otp,
                Expiry = expiryTime
            };
            _context.OTPRecords.Add(otpRecord);
            await _context.SaveChangesAsync();

            // Gửi OTP qua email
            await _emailService.SendOtpAsync(email, otp);

            return Ok(new { message = "OTP đã được gửi đến email của bạn." });
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] DTO.ResetPasswordRequest request)
        {
            var vietnamTime = DateTime.UtcNow.AddHours(7);
            var expiryTime = vietnamTime.AddMinutes(1);
            // Tìm OTP trong bảng OTPRecords
            var otpRecord = await _context.OTPRecords
                .FirstOrDefaultAsync(o => o.Otp == request.Otp && o.Expiry > expiryTime);

            if (otpRecord == null)
            {
                return BadRequest(new { message = "OTP không hợp lệ hoặc đã hết hạn." });
            }

            // Tìm tài khoản dựa theo email từ bảng OTPRecords
            var taiKhoan = await _context.TaiKhoans
                .FirstOrDefaultAsync(tk => tk.SinhVien.Email == otpRecord.Email);

            if (taiKhoan == null)
            {
                return BadRequest(new { message = "Không tìm thấy tài khoản tương ứng với OTP." });
            }


            var passwordHasher = new PasswordHasher<string>();
            taiKhoan.MatKhau = passwordHasher.HashPassword(null, request.NewPassword);
            _context.OTPRecords.Remove(otpRecord); // Xóa OTP sau khi dùng xong
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }
    }
}
