using System.ComponentModel.DataAnnotations;

namespace QuanLyDiemRenLuyen.Models
{
    public class OTPRecords
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Email { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Otp { get; set; }

        [Required]
        public DateTime Expiry { get; set; }
    }
}
