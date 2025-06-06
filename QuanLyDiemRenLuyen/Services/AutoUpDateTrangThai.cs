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
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<QlDrlContext>();
                var currentDate = DateTime.Now.Date;

                _logger.LogInformation("Checking for expired and obsolete HoatDong records at {Time}.", currentDate);

                var updatedCount = 0;

                // Lấy danh sách các hoạt động sẽ được cập nhật trạng thái "Đã kết thúc"
                var hoatDongCanKetThuc = await context.HoatDongs
                    .Where(h => h.TrangThai != "Đã kết thúc"
                             && h.NgayKetThuc.HasValue
                             && h.NgayKetThuc.Value.Date < currentDate)
                    .ToListAsync(stoppingToken);

                // Cập nhật trạng thái "Đã kết thúc"
                updatedCount += await context.HoatDongs
                    .Where(h => h.TrangThai != "Đã kết thúc"
                             && h.NgayKetThuc.HasValue
                             && h.NgayKetThuc.Value.Date < currentDate)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.TrangThai, "Đã kết thúc"), stoppingToken);

                const int DIEM_TRU_MAC_DINH = 5;

                // Chỉ xử lý các hoạt động vừa được cập nhật trạng thái trong lần chạy này
                foreach (var hoatDong in hoatDongCanKetThuc)
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

                        // Kiểm tra xem đã trừ điểm cho sinh viên này chưa
                        var daTruDiem = await context.LichSuDiems
                            .AnyAsync(lsd => lsd.MaSv == maSv &&
                                           lsd.LyDo.Contains(tenHoatDong) &&
                                           lsd.KieuThayDoi == "-");

                        if (daTruDiem) continue;

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

                updatedCount += await context.HoatDongs
                    .Where(h => h.TrangThai != "Đang diễn ra"
                             && h.TrangThai != "Đã kết thúc"
                             && h.NgayBatDau.HasValue
                             && h.NgayBatDau.Value.Date == currentDate)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.TrangThai, "Đang diễn ra"), stoppingToken);

                updatedCount += await context.HoatDongs
                    .Where(h => h.TrangThai != "Đã đóng đăng ký"
                             && h.TrangThai != "Đang diễn ra"
                             && h.TrangThai != "Đã kết thúc"
                             && h.NgayBatDau.HasValue
                             && h.NgayBatDau.Value.Date == currentDate.AddDays(1))
                    .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.TrangThai, "Đã đóng đăng ký"), stoppingToken);

                if (updatedCount > 0)
                {
                    _logger.LogInformation("Updated {Count} HoatDong records.", updatedCount);
                }

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
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }

        _logger.LogInformation("AutoUpdateHoatDongService stopped.");
    }
}