using MimeKit;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
namespace QuanLyDiemRenLuyen.DTO
{
    public interface IEmailService
    {
        Task SendOtpAsync(string toEmail, string otp);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendOtpAsync(string toEmail, string otp)
        {
            var emailSettings = _config.GetSection("EmailSettings");
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(emailSettings["FromName"], emailSettings["FromEmail"]));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "OTP Reset mật khẩu";

            message.Body = new TextPart("html")
            {
                Text = $"<h3>Chào bạn, đây là OTP reset mật khẩu.</h3><p>OTP của bạn là: <strong>{otp}</strong></p><p>.OTP này có hiệu lực trong 5 phút.</p>"
            };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(emailSettings["SmtpServer"], int.Parse(emailSettings["Port"]), MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(emailSettings["FromEmail"], emailSettings["Password"]);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }
    }
    public class EmailServicesDTO
    {
        public string TenDangNhap { get; set; }
    }
}
