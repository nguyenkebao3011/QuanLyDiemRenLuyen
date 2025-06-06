using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace QuanLyDiemRenLuyen.Services
{
    public class AutoUpdateXepLoai : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AutoUpdateXepLoai> _logger;

        public AutoUpdateXepLoai(
            IServiceProvider serviceProvider,
            ILogger<AutoUpdateXepLoai> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        // Hàm tính xếp loại dựa trên điểm tổng
        private string TinhXepLoai(int tongDiem)
        {
            if (tongDiem >= 90 && tongDiem <= 100) return "Xuất sắc";
            if (tongDiem >= 80 && tongDiem <= 89) return "Tốt";
            if (tongDiem >= 65 && tongDiem <= 79) return "Khá";
            if (tongDiem >= 50 && tongDiem <= 64) return "Trung bình";
            if (tongDiem >= 35 && tongDiem <= 49) return "Yếu";
            return "Kém"; // Dưới 35 điểm
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AutoUpdateDiemRenLuyenService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Tạo scope để quản lý vòng đời của DbContext
                    using var scope = _serviceProvider.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<QlDrlContext>();
                    var currentDateTime = DateTime.Now; // Lấy ngày và giờ hiện tại

                    _logger.LogInformation("Checking and updating DiemRenLuyen records at {Time}.", currentDateTime);

                    // Lấy tất cả các bản ghi DiemRenLuyen chưa chốt để kiểm tra
                    var diemRenLuyens = await context.DiemRenLuyens
                        .Where(drl => drl.TrangThai != "Đã chốt")
                        .ToListAsync(stoppingToken);

                    var updatedCount = 0;

                    foreach (var diemRenLuyen in diemRenLuyens)
                    {
                        // Tính xếp loại mới dựa trên TongDiem
                        var newXepLoai = TinhXepLoai((int)Math.Round(diemRenLuyen.TongDiem ?? 0));

                        // Nếu xếp loại khác với giá trị hiện tại, cập nhật
                        if (diemRenLuyen.XepLoai != newXepLoai)
                        {
                            diemRenLuyen.XepLoai = newXepLoai;
                            diemRenLuyen.NgayChot = currentDateTime; // Cập nhật NgayChot bằng thời gian hiện tại
                            context.Entry(diemRenLuyen).State = EntityState.Modified;
                            updatedCount++;
                        }
                    }

                    if (updatedCount > 0)
                    {
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("Updated {Count} DiemRenLuyen records with new XepLoai and NgayChot.", updatedCount);
                    }
                    else
                    {
                        _logger.LogInformation("No DiemRenLuyen records need updating.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating DiemRenLuyen records.");
                }

                // Chờ 1 giờ trước khi kiểm tra lại
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }

            _logger.LogInformation("AutoUpdateDiemRenLuyenService stopped.");
        }
    }
}

