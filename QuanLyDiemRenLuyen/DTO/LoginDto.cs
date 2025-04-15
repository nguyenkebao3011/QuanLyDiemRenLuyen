using System.ComponentModel.DataAnnotations;

namespace QuanLyDiemRenLuyen.DTO
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
        public string MaDangNhap { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        public string MatKhau { get; set; }
    }
}
