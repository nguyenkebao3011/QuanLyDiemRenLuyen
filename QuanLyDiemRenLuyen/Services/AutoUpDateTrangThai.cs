//using Microsoft.Extensions.Hosting;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Logging;
//using Microsoft.EntityFrameworkCore;
//using QuanLyDiemRenLuyen.Models;
//using System;
//using System.Threading;
//using System.Threading.Tasks;

//public class AutoUpdateHoatDongService : BackgroundService
//{
//    private readonly IServiceProvider _serviceProvider;
//    private readonly ILogger<AutoUpdateHoatDongService> _logger;

//    public AutoUpdateHoatDongService(
//        IServiceProvider serviceProvider,
//        ILogger<AutoUpdateHoatDongService> logger)
//    {
//        _serviceProvider = serviceProvider;
//        _logger = logger;
//    }

//    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//    {
//        _logger.LogInformation("AutoUpdateHoatDongService started.");

//        while (!stoppingToken.IsCancellationRequested)
//        {
//            try
//            {
//                // Tạo scope để quản lý vòng đời của DbContext
//                using var scope = _serviceProvider.CreateScope();
//                var context = scope.ServiceProvider.GetRequiredService<QlDrlContext>();
//                var currentDate = DateTime.Now;

//                _logger.LogInformation("Checking for expired and obsolete HoatDong records at {Time}.", currentDate);

//                // 1. Cập nhật trạng thái các hoạt động đã hết hạn
//                var updatedCount = await context.HoatDongs
//                    .Where(h => h.TrangThai != "Đã kết thúc"
//                             && h.NgayKetThuc.HasValue
//                             && h.NgayKetThuc < currentDate)
//                    .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.TrangThai, "Đã kết thúc"),
//                                        stoppingToken);

//                if (updatedCount > 0)
//                {
//                    _logger.LogInformation("Updated {Count} HoatDong records to 'Đã kết thúc'.", updatedCount);
//                }

//                // 2. Xóa các hoạt động đã kết thúc quá 30 ngày
//                var thresholdDate = currentDate.AddDays(-30);
//                var deletedCount = await context.HoatDongs
//                    .Where(h => h.TrangThai == "Đã kết thúc"
//                             && h.NgayKetThuc.HasValue
//                             && h.NgayKetThuc < thresholdDate)
//                    .ExecuteDeleteAsync(stoppingToken);

//                if (deletedCount > 0)
//                {
//                    _logger.LogInformation("Deleted {Count} HoatDong records that ended more than 30 days ago.", deletedCount);
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "An error occurred while updating or deleting HoatDong records.");
//            }

//            // Chờ 1 tiếng trước khi kiểm tra lại
//            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
//        }

//        _logger.LogInformation("AutoUpdateHoatDongService stopped.");
//    }
//}