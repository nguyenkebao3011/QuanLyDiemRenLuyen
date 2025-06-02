using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

public class AutoUpdateHoatDongService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AutoUpdateHoatDongService> _logger;

    public AutoUpdateHoatDongService(
        IServiceProvider serviceProvider,
        ILogger<AutoUpdateHoatDongService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {

        _logger.LogInformation("AutoUpdateHoatDongService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Tạo scope để quản lý vòng đời của DbContext
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<QlDrlContext>();
                var currentDate = DateTime.Now.Date; // Chỉ lấy ngày để so sánh

                _logger.LogInformation("Checking for expired and obsolete HoatDong records at {Time}.", currentDate);

                // 1. Cập nhật trạng thái các hoạt động
                var updatedCount = 0;

                // Cập nhật trạng thái "Đã kết thúc" trước để tránh xung đột
                updatedCount += await context.HoatDongs
                    .Where(h => h.TrangThai != "Đã kết thúc"
                             && h.NgayKetThuc.HasValue
                             && h.NgayKetThuc.Value.Date < currentDate)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.TrangThai, "Đã kết thúc"),
                                        stoppingToken);
                // Sau khi cập nhật trạng thái "Đã kết thúc"
                // Lấy tất cả hoạt động vừa chuyển sang "Đã kết thúc" (NgayKetThuc < currentDate)
                var hoatDongKetThuc = await context.HoatDongs
                    .Where(h => h.TrangThai == "Đã kết thúc"
                             && h.NgayKetThuc.HasValue
                             && h.NgayKetThuc.Value.Date < currentDate)
                    .ToListAsync(stoppingToken);

                const int DIEM_TRU_MAC_DINH = 5;

                foreach (var hoatDong in hoatDongKetThuc)
                {
                    var danhSachDangKyChuaDiemDanh = await context.DangKyHoatDongs
                                           .Where(dk => dk.MaHoatDong == hoatDong.MaHoatDong && dk.TrangThai == "Đăng ký thành công")
                                           .Include(dk => dk.MaSvNavigation)
                                           .Include(dk => dk.DiemDanhHoatDongs)
                                           .ToListAsync(stoppingToken);
    
                foreach (var dangKy in danhSachDangKyChuaDiemDanh)
                    {
                        if (dangKy.DiemDanhHoatDongs.Any()) continue;

                        var maSv = dangKy.MaSv;
                        var maHocKy = hoatDong.MaHocKy;
                        var tenHoatDong = hoatDong.TenHoatDong;

                        var diemRenLuyen = await context.DiemRenLuyens
                            .FirstOrDefaultAsync(drl => drl.MaSv == maSv && drl.MaHocKy == maHocKy, stoppingToken);

                        if (diemRenLuyen == null ||
                            (diemRenLuyen.TrangThai != null && diemRenLuyen.TrangThai.Trim().ToLower() == "đã chốt"))
                            continue;

                        diemRenLuyen.TongDiem = Math.Max((diemRenLuyen.TongDiem ?? 0) - DIEM_TRU_MAC_DINH, 0);
                        context.Entry(diemRenLuyen).State = EntityState.Modified;

                        var lichSuDiem = new LichSuDiem
                        {
                            MaSv = maSv,
                            KieuThayDoi = "-",
                            SoDiem = DIEM_TRU_MAC_DINH,
                            LyDo = $"Trừ {DIEM_TRU_MAC_DINH} điểm do không tham gia hoạt động {tenHoatDong}",
                            NgayThayDoi = DateTime.Now
                        };
                        context.LichSuDiems.Add(lichSuDiem);
                    }
                }
                await context.SaveChangesAsync(stoppingToken);

                // Cập nhật trạng thái "Đang diễn ra" cho hoạt động có ngày bắt đầu trùng với ngày hiện tại
                updatedCount += await context.HoatDongs
                    .Where(h => h.TrangThai != "Đang diễn ra"
                             && h.TrangThai != "Đã kết thúc"
                             && h.NgayBatDau.HasValue
                             && h.NgayBatDau.Value.Date == currentDate)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.TrangThai, "Đang diễn ra"),
                                        stoppingToken);

                // Cập nhật trạng thái "Đã đóng đăng ký" cho hoạt động có ngày bắt đầu là ngày mai
                updatedCount += await context.HoatDongs
                    .Where(h => h.TrangThai != "Đã đóng đăng ký"
                             && h.TrangThai != "Đang diễn ra"
                             && h.TrangThai != "Đã kết thúc"
                             && h.NgayBatDau.HasValue
                             && h.NgayBatDau.Value.Date == currentDate.AddDays(1))
                    .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.TrangThai, "Đã đóng đăng ký"),
                                        stoppingToken);

                if (updatedCount > 0)
                {
                    _logger.LogInformation("Updated {Count} HoatDong records.", updatedCount);
                }

                // 2. Xóa các hoạt động đã kết thúc quá 30 ngày
                var thresholdDate = currentDate.AddDays(-30);
                var deletedCount = await context.HoatDongs
                    .Where(h => h.TrangThai == "Đã kết thúc"
                             && h.NgayKetThuc.HasValue
                             && h.NgayKetThuc.Value.Date < thresholdDate)
                    .ExecuteDeleteAsync(stoppingToken);

                if (deletedCount > 0)
                {
                    _logger.LogInformation("Deleted {Count} HoatDong records that ended more than 30 days ago.", deletedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating or deleting HoatDong records.");
            }
            // Chờ 1 tiếng trước khi kiểm tra lại
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }

        _logger.LogInformation("AutoUpdateHoatDongService stopped.");
    }
}