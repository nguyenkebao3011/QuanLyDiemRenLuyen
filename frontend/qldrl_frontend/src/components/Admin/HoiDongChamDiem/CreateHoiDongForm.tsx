import type React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ApiService } from "../../../untils/services/service-api";
import type { HocKy } from "../types";

interface CreateHoiDongFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
}

const CreateHoiDongForm: React.FC<CreateHoiDongFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [tenHoiDong, setTenHoiDong] = useState("");
  const [maHocKy, setMaHocKy] = useState<number | "">("");
  const [ngayThanhLap, setNgayThanhLap] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for semester list
  const [hocKys, setHocKys] = useState<HocKy[]>([]);
  const [loadingHocKys, setLoadingHocKys] = useState(false);

  // Load semesters when component mounts
  useEffect(() => {
    const fetchHocKys = async () => {
      setLoadingHocKys(true);
      try {
        const data = await ApiService.layDanhSachHocKy();
        setHocKys(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách học kỳ:", err);
        setError("Không thể tải danh sách học kỳ. Vui lòng thử lại sau.");
      } finally {
        setLoadingHocKys(false);
      }
    };

    if (isOpen) {
      fetchHocKys();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenHoiDong) {
      setError("Vui lòng nhập tên hội đồng");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = {
        TenHoiDong: tenHoiDong,
        MaHocKy: maHocKy === "" ? null : maHocKy,
        NgayThanhLap: ngayThanhLap || null,
        GhiChu: ghiChu || null,
      };

      const success = await onSubmit(formData);
      if (success) {
        // Reset form
        setTenHoiDong("");
        setMaHocKy("");
        setNgayThanhLap("");
        setGhiChu("");
        onClose();
      }
    } catch (err) {
      console.error("Lỗi khi tạo hội đồng:", err);
      setError("Không thể tạo hội đồng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Tạo hội đồng chấm điểm mới</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tenHoiDong">
                Tên hội đồng <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="tenHoiDong"
                value={tenHoiDong}
                onChange={(e) => setTenHoiDong(e.target.value)}
                required
                placeholder="Nhập tên hội đồng..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="maHocKy">Học kỳ</label>
              <select
                id="maHocKy"
                value={maHocKy}
                onChange={(e) =>
                  setMaHocKy(e.target.value ? Number(e.target.value) : "")
                }
                disabled={loadingHocKys}
              >
                <option value="">-- Chọn học kỳ --</option>
                {hocKys.map((hocKy) => (
                  <option key={hocKy.MaHocKy} value={hocKy.MaHocKy}>
                    {hocKy.TenHocKy} - {hocKy.NamHoc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ngayThanhLap">Ngày thành lập</label>
              <input
                type="date"
                id="ngayThanhLap"
                value={ngayThanhLap}
                onChange={(e) => setNgayThanhLap(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ghiChu">Ghi chú</label>
              <textarea
                id="ghiChu"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Nhập ghi chú (nếu có)..."
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Tạo hội đồng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHoiDongForm;
