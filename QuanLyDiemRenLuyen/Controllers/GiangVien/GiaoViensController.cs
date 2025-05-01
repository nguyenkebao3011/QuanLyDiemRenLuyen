using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiemRenLuyen.DTO.GiangVien;
using QuanLyDiemRenLuyen.Models;

namespace QuanLyDiemRenLuyen.Controllers.GiangVien
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GiaoViensController : ControllerBase
    {
        private readonly QlDrlContext _context;

        public GiaoViensController(QlDrlContext context)
        {
            _context = context;
        }

        // GET: api/GiaoViens
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GiaoVien>>> GetGiaoViens()
        {
            return await _context.GiaoViens.ToListAsync();
        }

        // GET: api/GiaoViens/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GiaoVien>> GetGiaoVien(string id)
        {
            var giaoVien = await _context.GiaoViens.FindAsync(id);

            if (giaoVien == null)
            {
                return NotFound();
            }

            return giaoVien;
        }

        // PUT: api/GiaoViens/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGiaoVien(string id, GiaoVien giaoVien)
        {
            if (id != giaoVien.MaGv)
            {
                return BadRequest();
            }

            _context.Entry(giaoVien).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GiaoVienExists(id))
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

        // POST: api/GiaoViens
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<GiaoVien>> PostGiaoVien(GiaoVien giaoVien)
        {
            _context.GiaoViens.Add(giaoVien);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (GiaoVienExists(giaoVien.MaGv))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetGiaoVien", new { id = giaoVien.MaGv }, giaoVien);
        }

        // DELETE: api/GiaoViens/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGiaoVien(string id)
        {
            var giaoVien = await _context.GiaoViens.FindAsync(id);
            if (giaoVien == null)
            {
                return NotFound();
            }

            _context.GiaoViens.Remove(giaoVien);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        // GET: api/GiangVien/lay-giangvien-theo-vai-tro
        [HttpGet("lay-giangvien-theo-vai-tro")]
        public async Task<ActionResult<GiangVienDTO>> GetGiangVienByRole()
        {
            // Lấy username từ claims trong JWT token
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new { Error = "Không tìm thấy thông tin người dùng trong token" });
            }

            // Tìm giảng viên dựa trên username trong CSDL
            var lecturer = await _context.GiaoViens
                .FirstOrDefaultAsync(l => l.Email == username);

            if (lecturer == null)
            {
                return NotFound(new { Error = "Không tìm thấy giảng viên với username này" });
            }

            // Ánh xạ thủ công từ GiangVien sang GiangVienDTO
            var lecturerDTO = new GiangVienDTO
            {
                MaGV = lecturer.MaGv,
                HoTen = lecturer.HoTen,
                Email = lecturer.Email,
                SoDienThoai = lecturer.SoDienThoai,
                DiaChi = lecturer.DiaChi,
                NgaySinh = lecturer.NgaySinh.HasValue ? lecturer.NgaySinh.Value.ToString("yyyy-MM-dd") : null, // Chuyển DateOnly? thành string
                GioiTinh = lecturer.GioiTinh,
                AnhDaiDien = lecturer.AnhDaiDien
            };

            return Ok(lecturerDTO);
        }

        private bool GiaoVienExists(string id)
        {
            return _context.GiaoViens.Any(e => e.MaGv == id);
        }
    }
}
