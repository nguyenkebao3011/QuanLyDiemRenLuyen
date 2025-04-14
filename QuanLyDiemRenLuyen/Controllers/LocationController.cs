using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Text.Json;

namespace QuanLyDiemRenLuyen.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private string GetJson(string fileName)
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", fileName);
            return System.IO.File.ReadAllText(path);
        }

        [HttpGet("provinces")]
        public IActionResult GetProvinces()
        {
            var json = GetJson("tinh_tp.json");
            var dict = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, object>>>(json);

            var list = dict.Select(x => new
            {
                code = x.Key,
                name = x.Value["name"].ToString()
            });

            return Ok(list);
        }

        [HttpGet("districts/{provinceCode}")]
        public IActionResult GetDistricts(string provinceCode)
        {
            var json = GetJson("quan_huyen.json");
            var data = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, object>>>(json);

            var filtered = data
                .Where(item => item.Value["parent_code"].ToString() == provinceCode)
                .Select(item => new
                {
                    code = item.Key,
                    name = item.Value["name"].ToString()
                });

            return Ok(filtered);
        }

        [HttpGet("wards/{districtCode}")]
        public IActionResult GetWards(string districtCode)
        {
            var json = GetJson("xa_phuong.json");
            var data = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, object>>>(json);

            var filtered = data
                .Where(item => item.Value["parent_code"].ToString() == districtCode)
                .Select(item => new {
                    code = item.Key,
                    name = item.Value["name"].ToString()
                });

            return Ok(filtered);
        }
    }
    }
