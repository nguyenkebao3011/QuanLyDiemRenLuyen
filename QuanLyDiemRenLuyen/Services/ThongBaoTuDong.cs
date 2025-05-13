
﻿using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.Models;
using System.Linq;
using System.Collections.Generic;

public class ThongBaoScheduledService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ThongBaoScheduledService> _logger;

    public ThongBaoScheduledService(IServiceProvider serviceProvider, ILogger<ThongBaoScheduledService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.Now;
                var nextRunTime = now.Date.AddDays(1).AddHours(6); // 6g sáng ngày mai
                var delay = nextRunTime - now;

                using var scope = _serviceProvider.CreateScope();
                var _context = scope.ServiceProvider.GetRequiredService<QlDrlContext>();

                var daGuiHomNay = await _context.ThongBaos
                    .AnyAsync(tb => tb.NgayTao.HasValue && tb.NgayTao.Value.Date == now.Date && tb.LoaiThongBao == "TuDong", stoppingToken);

                // Nếu bật app sau 6g nhưng chưa gửi thì gửi ngay
                if (now >= nextRunTime.AddDays(-1) && !daGuiHomNay)
                {
                    await GuiThongBaoTruoc3NgayAsync(stoppingToken);
                }

                _logger.LogInformation($"[Service] Đợi đến {nextRunTime:HH:mm dd/MM/yyyy} để gửi thông báo tự động...");
                await Task.Delay(delay, stoppingToken);

                await GuiThongBaoTruoc3NgayAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi trong vòng lặp gửi thông báo.");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Retry nhẹ
            }
        }

    }


    private async Task GuiThongBaoTruoc3NgayAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var _context = scope.ServiceProvider.GetRequiredService<QlDrlContext>();

        try
        {
            var today = DateTime.Today;
            // Kiểm tra các hoạt động trong 3 ngày tới (bao gồm trước 3, 2, 1 ngày)
            var hoatDongs = await _context.HoatDongs
                .Where(h => h.NgayBatDau.HasValue &&
                            h.NgayBatDau.Value.Date >= today.AddDays(1) &&
                            h.NgayBatDau.Value.Date <= today.AddDays(3))
                .ToListAsync(stoppingToken);

            _logger.LogInformation($"Tìm thấy {hoatDongs.Count} hoạt động trong 3 ngày tới từ {today:dd/MM/yyyy}.");

            var validMaQls = new List<string> { "QL01", "QL02", "QL03" };

            foreach (var hd in hoatDongs)
            {
                // Lấy danh sách sinh viên đã đăng ký hoạt động
                var sinhVienIds = await _context.DangKyHoatDongs
                    .Where(dk => dk.MaHoatDong == hd.MaHoatDong)
                    .Select(dk => dk.MaSv)
                    .ToListAsync(stoppingToken);

                // Lấy danh sách sinh viên đã nhận thông báo cho hoạt động này
                var sinhVienDaNhanThongBao = await _context.ChiTietThongBaos
                        .Where(ct => _context.ThongBaos
                            .Any(tb => tb.MaThongBao == ct.MaThongBao &&
                                       tb.NoiDung.Contains($"[MaHoatDong:{hd.MaHoatDong}]")))
                        .Select(ct => ct.MaSv)
                    .ToListAsync(stoppingToken);
                // Lọc ra các sinh viên chưa nhận thông báo
                var sinhVienCanGui = sinhVienIds.Except(sinhVienDaNhanThongBao).ToList();

                if (!sinhVienCanGui.Any())
                {
                    _logger.LogInformation($"Không có sinh viên mới cần gửi thông báo cho hoạt động {hd.MaHoatDong}.");
                    continue;
                }

               
               
                var maQl = string.IsNullOrEmpty(hd.MaQl) || !validMaQls.Contains(hd.MaQl)
                    ? "HeThong"
                    : hd.MaQl;
                // Tạo thông báo mới
                var thongBao = new ThongBao
                {
                    TieuDe = $"Hoạt động \"{hd.TenHoatDong}\" sắp diễn ra",
                    NoiDung = $"Bạn đã đăng ký hoạt động này, hoạt động bắt đầu vào ngày {hd.NgayBatDau?.ToString("dd/MM/yyyy") ?? "chưa xác định"}. [MaHoatDong:{hd.MaHoatDong}]",
                    NgayTao = DateTime.Now,
                    MaQl = maQl,
                    LoaiThongBao = "TuDong",
                    TrangThai = "DaGui"
                };
                _context.ThongBaos.Add(thongBao);
                await _context.SaveChangesAsync(stoppingToken);

                // Tạo chi tiết thông báo cho các sinh viên chưa nhận
                var chiTietThongBaos = sinhVienCanGui.Select(svId => new ChiTietThongBao
                {
                    MaThongBao = thongBao.MaThongBao,
                    MaSv = svId,
                    DaDoc = false,
                    NgayDoc = null
                }).ToList();

                _context.ChiTietThongBaos.AddRange(chiTietThongBaos);
                await _context.SaveChangesAsync(stoppingToken);

                _logger.LogInformation($"Gửi thông báo cho hoạt động {hd.MaHoatDong} ({hd.TenHoatDong}) với {sinhVienCanGui.Count} sinh viên.");
            }

            _logger.LogInformation("Đã gửi xong thông báo tự động.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi gửi thông báo cho các hoạt động trong 3 ngày tới từ {DateTime.Today:dd/MM/yyyy}");
            throw;
        }
    }
}