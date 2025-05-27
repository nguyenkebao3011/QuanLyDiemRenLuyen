using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.SinhVien;
using QuanLyDiemRenLuyen.Models;
using System.Text.RegularExpressions;
using OfficeOpenXml;

namespace QuanLyDiemRenLuyen.Controllers.QuanLyKhoa
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuanLySinhVienController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public QuanLySinhVienController(QlDrlContext context)
        {
            _context = context;
        }

        [HttpPost("them_sinh_vien")]
        public async Task<ActionResult<SinhVienDTO>> CreateSinhVien(
         [FromForm] SinhVienDTO sinhVienDTO,
         [FromForm] bool CapTaiKhoan = false,
         IFormFile? anhDaiDien = null)
        {
            try
            {
                // Kiểm tra MaSV đã tồn tại chưa
                if (string.IsNullOrEmpty(sinhVienDTO.MaSV))
                {
                    return BadRequest(new { message = "Mã sinh viên không được để trống" });
                }

                var existingSinhVien = await _context.SinhViens.FindAsync(sinhVienDTO.MaSV);
                if (existingSinhVien != null)
                {
                    return Conflict(new { message = "Mã sinh viên đã tồn tại" });
                }

                // Kiểm tra định dạng email
                if (!string.IsNullOrEmpty(sinhVienDTO.Email)
                    && !Regex.IsMatch(sinhVienDTO.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                {
                    return BadRequest(new { message = "Email không hợp lệ" });
                }

                // Kiểm tra định dạng số điện thoại
                if (!string.IsNullOrEmpty(sinhVienDTO.SoDienThoai)
                    && !Regex.IsMatch(sinhVienDTO.SoDienThoai, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });
                }

                // Kiểm tra MaLop có tồn tại không
                if (!string.IsNullOrEmpty(sinhVienDTO.MaLop))
                {
                    var lop = await _context.Lops.FindAsync(sinhVienDTO.MaLop);
                    if (lop == null)
                    {
                        return BadRequest(new { message = "Mã lớp không tồn tại" });
                    }
                }

                // Xử lý ảnh đại diện
                string? anhDaiDienPath = null;
                if (anhDaiDien != null && anhDaiDien.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(anhDaiDien.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png" });
                    }

                    var fileName = $"{sinhVienDTO.MaSV}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    var directoryPath = Path.GetDirectoryName(filePath);
                    if (!string.IsNullOrEmpty(directoryPath))
                    {
                        Directory.CreateDirectory(directoryPath);
                    }

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    anhDaiDienPath = $"/avatars/{fileName}";
                }

                string? maTaiKhoan = null;

                if (CapTaiKhoan)
                {
                    // Tạo mã tài khoản mới
                    var lastTaiKhoan = await _context.TaiKhoans
                        .Where(tk => tk.MaTaiKhoan.StartsWith("TKSV"))
                        .OrderByDescending(tk => tk.MaTaiKhoan)
                        .FirstOrDefaultAsync();

                    if (lastTaiKhoan != null)
                    {
                        string lastNumber = lastTaiKhoan.MaTaiKhoan.Substring(4);
                        int number;
                        if (int.TryParse(lastNumber, out number))
                            maTaiKhoan = $"TKSV{number + 1}";
                        else
                            maTaiKhoan = "TKSV1";
                    }
                    else
                    {
                        maTaiKhoan = "TKSV1";
                    }

                    string defaultPassword = sinhVienDTO.MaSV;

                    // Sử dụng PasswordHasher của Microsoft Identity để tạo hash đúng chuẩn
                    var passwordHasher = new PasswordHasher<string>();
                    string hash = passwordHasher.HashPassword(null, defaultPassword);

                    var taiKhoan = new TaiKhoan
                    {
                        MaTaiKhoan = maTaiKhoan,
                        TenDangNhap = sinhVienDTO.MaSV,
                        MatKhau = hash,
                        VaiTro = "SinhVien"
                    };

                    _context.TaiKhoans.Add(taiKhoan);
                    await _context.SaveChangesAsync();
                }

                DateTime ngaySinh_sv = DateTime.TryParse(sinhVienDTO.NgaySinh, out DateTime ns) ? ns : DateTime.Now;

                var sinhVien = new Models.SinhVien
                {
                    MaSV = sinhVienDTO.MaSV,
                    MaTaiKhoan = maTaiKhoan, // null nếu không cấp tài khoản
                    HoTen = sinhVienDTO.HoTen,
                    MaLop = sinhVienDTO.MaLop,
                    Email = sinhVienDTO.Email,
                    SoDienThoai = sinhVienDTO.SoDienThoai,
                    DiaChi = sinhVienDTO.DiaChi,
                    NgaySinh = ngaySinh_sv,
                    GioiTinh = sinhVienDTO.GioiTinh,
                    AnhDaiDien = anhDaiDienPath,
                    MaVaiTro = sinhVienDTO.MaVaiTro,
                    TrangThai = sinhVienDTO.TrangThai ?? "HoatDong"
                };

                _context.SinhViens.Add(sinhVien);
                await _context.SaveChangesAsync();

                sinhVienDTO.AnhDaiDien = anhDaiDienPath;

                return Ok(new
                {
                    message = "Thêm sinh viên thành công",
                    capTaiKhoan = CapTaiKhoan,
                    maTaiKhoan = maTaiKhoan,
                    sinhVien = sinhVienDTO
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo sinh viên", error = ex.Message });
            }
        }

        [HttpPost("import_sinh_vien")]
        public async Task<IActionResult> ImportSinhVien(IFormFile? file, [FromQuery] bool capTaiKhoan = false)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file Excel." });

            string extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".xlsx" && extension != ".xls")
                return BadRequest(new { message = "File phải có định dạng .xlsx hoặc .xls" });

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "Kích thước file vượt quá giới hạn cho phép (10MB)" });

            var result = new List<string>();
            int successCount = 0;
            int failCount = 0;

            try
            {
                // Lấy danh sách mã lớp hợp lệ một lần duy nhất
                var validMaLopList = await _context.Lops.Select(l => l.MaLop).ToListAsync();

                // Lấy danh sách mã sinh viên đã tồn tại để kiểm tra duplicate
                var existingMaSVList = await _context.SinhViens.Select(sv => sv.MaSV).ToListAsync();

                // Khởi tạo số tài khoản ban đầu nếu cần tạo tài khoản
                int currentTaiKhoanNumber = 0;
                if (capTaiKhoan)
                {
                    var lastTaiKhoan = await _context.TaiKhoans
                        .Where(tk => tk.MaTaiKhoan.StartsWith("TKSV"))
                        .OrderByDescending(tk => tk.MaTaiKhoan)
                        .FirstOrDefaultAsync();

                    if (lastTaiKhoan != null)
                    {
                        string lastNumber = lastTaiKhoan.MaTaiKhoan.Substring(4);
                        if (int.TryParse(lastNumber, out int number))
                            currentTaiKhoanNumber = number;
                    }
                }

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;

                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                        if (worksheet == null)
                            return BadRequest(new { message = "File không hợp lệ hoặc không có sheet." });

                        int rowCount = worksheet.Dimension?.Rows ?? 0;
                        if (rowCount <= 1)
                            return BadRequest(new { message = "File Excel không chứa dữ liệu sinh viên." });

                        // Kiểm tra header
                        string header1 = worksheet.Cells[1, 1].Text?.Trim();
                        string header2 = worksheet.Cells[1, 2].Text?.Trim();

                        if (header1 != "MaSV" || header2 != "HoTen")
                            return BadRequest(new { message = "File Excel không đúng định dạng. Hãy sử dụng mẫu được cung cấp." });

                        // Danh sách để theo dõi mã sinh viên trong file hiện tại
                        var maSVInCurrentFile = new HashSet<string>();

                        // Xử lý từng dòng
                        for (int row = 2; row <= rowCount; row++)
                        {
                            try
                            {
                                // Đọc dữ liệu từ Excel
                                var maSV = worksheet.Cells[row, 1].Text?.Trim();
                                var hoTen = worksheet.Cells[row, 2].Text?.Trim();
                                var maLop = worksheet.Cells[row, 3].Text?.Trim();
                                var email = worksheet.Cells[row, 4].Text?.Trim();
                                var soDienThoai = worksheet.Cells[row, 5].Text?.Trim();
                                var diaChi = worksheet.Cells[row, 6].Text?.Trim();
                                var ngaySinh = worksheet.Cells[row, 7].Text?.Trim();
                                var gioiTinh = worksheet.Cells[row, 8].Text?.Trim();
                                var maVaiTro = worksheet.Cells[row, 9].Text?.Trim();
                                var trangThai = worksheet.Cells[row, 10].Text?.Trim();

                                // Log dữ liệu đọc được để debug
                               

                                // Validation cơ bản
                                if (string.IsNullOrEmpty(maSV))
                                {
                          
                                    failCount++;
                                    continue;
                                }

                                if (string.IsNullOrEmpty(hoTen))
                                {
                       
                                    failCount++;
                                    continue;
                                }

                                // Kiểm tra độ dài MaSV
                                if (maSV.Length > 50) // Giả sử max length là 50
                                {
                                   
                                    failCount++;
                                    continue;
                                }

                                // Kiểm tra độ dài HoTen
                                if (hoTen.Length > 255) // Giả sử max length là 255
                                {
                                
                                    failCount++;
                                    continue;
                                }

                                // Kiểm tra trùng lặp trong database
                                if (existingMaSVList.Contains(maSV))
                                {
                                
                                    failCount++;
                                    continue;
                                }

                                // Kiểm tra trùng lặp trong file hiện tại
                                if (maSVInCurrentFile.Contains(maSV))
                                {
                                  
                                    failCount++;
                                    continue;
                                }

                                // Kiểm tra mã lớp
                                if (!string.IsNullOrEmpty(maLop) && !validMaLopList.Contains(maLop))
                                {
                                  
                                    failCount++;
                                    continue;
                                }

                                // Kiểm tra email
                                if (!string.IsNullOrEmpty(email))
                                {
                                    if (email.Length > 100) // Kiểm tra độ dài email
                                    {
                          
                                        failCount++;
                                        continue;
                                    }

                                    if (!Regex.IsMatch(email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"))
                                    {
                                 
                                        failCount++;
                                        continue;
                                    }
                                }

                                // Kiểm tra số điện thoại
                                if (!string.IsNullOrEmpty(soDienThoai) && !Regex.IsMatch(soDienThoai, @"^\d{10}$"))
                                {
                              
                                    failCount++;
                                    continue;
                                }

                                // Xử lý ngày sinh
                                DateTime ngaySinhValue;
                                if (!DateTime.TryParse(ngaySinh, out ngaySinhValue))
                                {
                                    ngaySinhValue = DateTime.Now;
                                }

                                // Kiểm tra ngày sinh hợp lý
                                if (ngaySinhValue > DateTime.Now || ngaySinhValue < new DateTime(1900, 1, 1))
                                {
                                    ngaySinhValue = DateTime.Now;
                              
                                }

                                // Sử dụng transaction riêng cho từng dòng
                                using (var transaction = await _context.Database.BeginTransactionAsync())
                                {
                                    try
                                    {
                                        // Tạo tài khoản nếu cần
                                        string? maTaiKhoan = null;
                                        if (capTaiKhoan)
                                        {
                                            currentTaiKhoanNumber++;
                                            maTaiKhoan = $"TKSV{currentTaiKhoanNumber}";

                                            // Kiểm tra mã tài khoản đã tồn tại chưa
                                            var existingTaiKhoan = await _context.TaiKhoans.FindAsync(maTaiKhoan);
                                            if (existingTaiKhoan != null)
                                            {
                                               
                                                failCount++;
                                                continue;
                                            }

                                            var passwordHasher = new PasswordHasher<string>();
                                            string hash = passwordHasher.HashPassword(null, maSV);

                                            var taiKhoan = new TaiKhoan
                                            {
                                                MaTaiKhoan = maTaiKhoan,
                                                TenDangNhap = maSV,
                                                MatKhau = hash,
                                                VaiTro = "SinhVien"
                                            };

                                            _context.TaiKhoans.Add(taiKhoan);

                                            // Lưu tài khoản trước
                                            await _context.SaveChangesAsync();
                                        }

                                        // Tạo sinh viên
                                        var sinhVien = new Models.SinhVien
                                        {
                                            MaSV = maSV,
                                            MaTaiKhoan = maTaiKhoan,
                                            HoTen = hoTen,
                                            MaLop = string.IsNullOrEmpty(maLop) ? null : maLop,
                                            Email = string.IsNullOrEmpty(email) ? null : email,
                                            SoDienThoai = string.IsNullOrEmpty(soDienThoai) ? null : soDienThoai,
                                            DiaChi = string.IsNullOrEmpty(diaChi) ? null : diaChi,
                                            NgaySinh = ngaySinhValue,
                                            GioiTinh = string.IsNullOrEmpty(gioiTinh) ? null : gioiTinh,
                                            MaVaiTro = int.TryParse(maVaiTro, out var mvt) ? mvt : 1,
                                            TrangThai = string.IsNullOrEmpty(trangThai) ? "HoatDong" : trangThai,
                                            AnhDaiDien = null
                                        };

                                        _context.SinhViens.Add(sinhVien);

                                        // Lưu sinh viên
                                        await _context.SaveChangesAsync();
                                        await transaction.CommitAsync();

                                        // Thêm vào danh sách theo dõi
                                        maSVInCurrentFile.Add(maSV);
                                        existingMaSVList.Add(maSV);

                                     
                                        successCount++;
                                    }
                                    catch (DbUpdateException dbEx)
                                    {
                                        await transaction.RollbackAsync();

                                        // Rollback số tài khoản nếu có lỗi
                                        if (capTaiKhoan)
                                            currentTaiKhoanNumber--;

                                        string detailError = GetDbUpdateExceptionDetails(dbEx);
                                  
                                        failCount++;
                                    }
                                    catch (Exception ex)
                                    {
                                        await transaction.RollbackAsync();

                                        // Rollback số tài khoản nếu có lỗi
                                        if (capTaiKhoan)
                                            currentTaiKhoanNumber--;

                                        string errorDetail = ex.InnerException?.Message ?? ex.Message;
                               
                                        failCount++;
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                string errorDetail = ex.InnerException?.Message ?? ex.Message;
                    
                                failCount++;
                            }
                        }

                        result.Insert(0, $"Tổng cộng: {successCount} thành công");
                    }
                }

                return Ok(new
                {
                    message = "Import hoàn tất",
                    chiTiet = result,
                    thongKe = new
                    {
                        tongSo = successCount + failCount,
                        thanhCong = successCount,
                        thatBai = failCount
                    }
                });
            }
            catch (Exception ex)
            {
                string errorDetail = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi import sinh viên",
                    error = errorDetail,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // Thêm method helper để lấy chi tiết lỗi database
        private string GetDbUpdateExceptionDetails(DbUpdateException ex)
        {
            var details = new List<string>();

            if (ex.InnerException != null)
            {
                details.Add($"Inner Exception: {ex.InnerException.Message}");
            }

            foreach (var entry in ex.Entries)
            {
                details.Add($"Entity: {entry.Entity.GetType().Name}");
                details.Add($"State: {entry.State}");

                foreach (var property in entry.Properties)
                {
                    if (property.IsModified)
                    {
                        details.Add($"Property {property.Metadata.Name}: {property.CurrentValue}");
                    }
                }
            }

            return string.Join(" | ", details);
        }


        [HttpGet("download_template")]
        public IActionResult DownloadTemplate()
        {
            try
            {
                // Khởi tạo ExcelPackage
                using (var package = new ExcelPackage())
                {
                    var ws = package.Workbook.Worksheets.Add("Template");
                    ws.Cells[1, 1].Value = "MaSV";
                    ws.Cells[1, 2].Value = "HoTen";
                    ws.Cells[1, 3].Value = "MaLop";
                    ws.Cells[1, 4].Value = "Email";
                    ws.Cells[1, 5].Value = "SoDienThoai";
                    ws.Cells[1, 6].Value = "DiaChi";
                    ws.Cells[1, 7].Value = "NgaySinh";
                    ws.Cells[1, 8].Value = "GioiTinh";
                    ws.Cells[1, 9].Value = "MaVaiTro";
                    ws.Cells[1, 10].Value = "TrangThai";

                    ws.Cells[2, 1].Value = "DHTH100000";
                    ws.Cells[2, 2].Value = "Nguyễn Văn A";
                    ws.Cells[2, 3].Value = "L01";
                    ws.Cells[2, 4].Value = "nguyenvana@huit.edu.vn";
                    ws.Cells[2, 5].Value = "0912345678";
                    ws.Cells[2, 6].Value = "123 Đường ABC";
                    ws.Cells[2, 7].Value = "2000-01-01";
                    ws.Cells[2, 8].Value = "Nam";
                    ws.Cells[2, 9].Value = "1";
                    ws.Cells[2, 10].Value = "HoatDong";

                    var bytes = package.GetAsByteArray();
                    return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "template_import_sinh_vien.xlsx");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi tạo template",
                    error = ex.Message
                });
            }
        }

        // PUT: api/QuanLySinhVien/
        [HttpPut("cap_nhap_sinh_vien/{id}")]
        public async Task<IActionResult> UpdateSinhVien(string id, [FromForm] SinhVienDTO sinhVienDTO, IFormFile? anhDaiDien = null)
        {
            try
            {
                if (id != sinhVienDTO.MaSV)
                {
                    return BadRequest(new { message = "Mã sinh viên không khớp" });
                }

                // Kiểm tra sinh viên có tồn tại không
                var existingSinhVien = await _context.SinhViens.FindAsync(id);
                if (existingSinhVien == null)
                {
                    return NotFound(new { message = "Sinh viên không tồn tại" });
                }

                // Kiểm tra định dạng email
                if (!string.IsNullOrEmpty(sinhVienDTO.Email) && !Regex.IsMatch(sinhVienDTO.Email, @"^[\w-\.]+@[\w-\.]+\.[a-z]{2,4}$"))
                {
                    return BadRequest(new { message = "Email không hợp lệ" });
                }

                // Kiểm tra định dạng số điện thoại
                if (!string.IsNullOrEmpty(sinhVienDTO.SoDienThoai) && !Regex.IsMatch(sinhVienDTO.SoDienThoai, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải có đúng 10 chữ số" });
                }

                // Kiểm tra MaLop có tồn tại không
                if (!string.IsNullOrEmpty(sinhVienDTO.MaLop))
                {
                    var lop = await _context.Lops.FindAsync(sinhVienDTO.MaLop);
                    if (lop == null)
                    {
                        return BadRequest(new { message = "Mã lớp không tồn tại" });
                    }
                }

                // Xử lý ảnh đại diện
                if (anhDaiDien != null && anhDaiDien.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                    var extension = Path.GetExtension(anhDaiDien.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png" });
                    }

                    var fileName = $"{id}_{DateTime.Now.Ticks}{extension}";
                    var filePath = Path.Combine("wwwroot/avatars", fileName);

                    var directoryPath = Path.GetDirectoryName(filePath);
                    if (!string.IsNullOrEmpty(directoryPath))
                    {
                        Directory.CreateDirectory(directoryPath);
                    }

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await anhDaiDien.CopyToAsync(stream);
                    }

                    // Xóa ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(existingSinhVien.AnhDaiDien))
                    {
                        var oldFilePath = Path.Combine("wwwroot", existingSinhVien.AnhDaiDien.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    existingSinhVien.AnhDaiDien = $"/avatars/{fileName}";
                }

                // Chuyển đổi từ DTO sang model
                DateTime ngaySinh;
                if (!DateTime.TryParse(sinhVienDTO.NgaySinh, out ngaySinh))
                {
                    ngaySinh = existingSinhVien.NgaySinh;
                }

                // Cập nhật thông tin sinh viên
                existingSinhVien.HoTen = sinhVienDTO.HoTen ?? existingSinhVien.HoTen;
                existingSinhVien.MaLop = sinhVienDTO.MaLop ?? existingSinhVien.MaLop;
                existingSinhVien.Email = sinhVienDTO.Email ?? existingSinhVien.Email;
                existingSinhVien.SoDienThoai = sinhVienDTO.SoDienThoai ?? existingSinhVien.SoDienThoai;
                existingSinhVien.DiaChi = sinhVienDTO.DiaChi ?? existingSinhVien.DiaChi;
                existingSinhVien.NgaySinh = ngaySinh;
                existingSinhVien.GioiTinh = sinhVienDTO.GioiTinh ?? existingSinhVien.GioiTinh;
                existingSinhVien.MaVaiTro = sinhVienDTO.MaVaiTro;
                existingSinhVien.TrangThai = sinhVienDTO.TrangThai ?? existingSinhVien.TrangThai;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!SinhVienExists(id))
                    {
                        return NotFound(new { message = "Sinh viên không tồn tại" });
                    }
                    else
                    {
                        throw;
                    }
                }

                return Ok(new { message = "Cập nhật thông tin sinh viên thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật thông tin sinh viên", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpDelete("xoa_sinh_vien/{id}")]
        public async Task<IActionResult> DeleteSinhVien(string id)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var sinhVien = await _context.SinhViens
                        .Include(sv => sv.ChiTietThongBaos)
                        .Include(sv => sv.DangKyHoatDongs)
                        .Include(sv => sv.DiemRenLuyens)
                        .FirstOrDefaultAsync(sv => sv.MaSV == id);
                    if (sinhVien == null)
                    {
                        return NotFound(new { message = "Sinh viên không tồn tại" });
                    }

                    // Xóa các bản ghi liên quan trước
                    if (sinhVien.ChiTietThongBaos != null)
                        _context.ChiTietThongBaos.RemoveRange(sinhVien.ChiTietThongBaos);
                    if (sinhVien.DangKyHoatDongs != null)
                        _context.DangKyHoatDongs.RemoveRange(sinhVien.DangKyHoatDongs);
                    if (sinhVien.DiemRenLuyens != null)
                        _context.DiemRenLuyens.RemoveRange(sinhVien.DiemRenLuyens);

                    // Lưu thông tin tài khoản để xóa sau
                    string? maTaiKhoan = sinhVien.MaTaiKhoan;
                    string? anhDaiDien = sinhVien.AnhDaiDien;

                    // Xóa sinh viên
                    _context.SinhViens.Remove(sinhVien);
                    await _context.SaveChangesAsync();

                    // Xóa tài khoản nếu có
                    if (!string.IsNullOrEmpty(maTaiKhoan))
                    {
                        var taiKhoan = await _context.TaiKhoans.FindAsync(maTaiKhoan);
                        if (taiKhoan != null)
                        {
                            _context.TaiKhoans.Remove(taiKhoan);
                            await _context.SaveChangesAsync();
                        }
                    }

                    await transaction.CommitAsync();

                    // Xóa ảnh đại diện nếu có
                    if (!string.IsNullOrEmpty(anhDaiDien))
                    {
                        var filePath = Path.Combine("wwwroot", anhDaiDien.TrimStart('/'));
                        if (System.IO.File.Exists(filePath))
                        {
                            System.IO.File.Delete(filePath);
                        }
                    }

                    return Ok(new { message = "Xóa sinh viên thành công" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa sinh viên", error = ex.Message, inner = ex.InnerException?.Message, stackTrace = ex.StackTrace });
                }
            }
        }
        private bool SinhVienExists(string id)
        {
            return _context.SinhViens.Any(e => e.MaSV == id);
        }
    }
}