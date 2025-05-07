import { useState, useEffect, useCallback } from "react";
import { ApiService } from "../../../../untils/services/service-api";
import OverviewStats from "../../../../components/Admin/ThongKe/OverviewStats";
import PhanHoiStats from "../../../../components/Admin/ThongKe/PhanHoiStats";
import DiemRenLuyenStats from "../../../../components/Admin/ThongKe/DiemRenLuyenStats";
import XepLoaiStats from "../../../../components/Admin/ThongKe/XepLoaiStats";
import MinhChungStats from "../../../../components/Admin/ThongKe/MinhChungStats";
import DiemTheoLopStats from "../../../../components/Admin/ThongKe/DiemTheoLopStats";
import SemesterSelector from "../../../../components/Admin/ThongKe/SemesterSelector";
import { Download, RefreshCw } from "lucide-react";
import type {
  HocKy,
  TongQuanThongKeDTO,
} from "../../../../components/Admin/types";
import "../css/ThongKeBaoCao.css";

const ThongKeBaoCao = () => {
  // State for overview statistics
  const [overviewStats, setOverviewStats] = useState<TongQuanThongKeDTO | null>(
    null
  );

  // State for feedback statistics
  const [phanHoiStats, setPhanHoiStats] = useState<{
    TongPhanHoi: number;
    DaXuLy: number;
    ChuaXuLy: number;
  } | null>(null);

  // State for evidence statistics
  const [minhChungStats, setMinhChungStats] = useState<
    | {
        TrangThai: string;
        SoLuong: number;
      }[]
    | null
  >(null);

  // State for semester selection
  const [semesters, setSemesters] = useState<HocKy[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // State for score statistics
  const [diemStats, setDiemStats] = useState<{
    DiemTrungBinh: number;
    DiemCaoNhat: number;
    DiemThapNhat: number;
  } | null>(null);

  // State for classification report
  const [xepLoaiStats, setXepLoaiStats] = useState<{
    TongSinhVien: number;
    BaoCaoTheoLoai: { XepLoai: string; SoLuong: number }[];
  } | null>(null);

  // State for class statistics
  const [diemTheoLopStats, setDiemTheoLopStats] = useState<
    | {
        MaLop: string;
        SoLuong: number;
        DiemTrungBinh: number;
        SoSinhVienGioi: number;
        SoSinhVienKha: number;
        SoSinhVienTb: number;
        SoSinhVienYeu: number;
      }[]
    | null
  >(null);

  // Loading states
  const [loading, setLoading] = useState({
    overview: true,
    phanHoi: true,
    minhChung: true,
    diem: false,
    xepLoai: false,
    diemTheoLop: false,
    semesters: true,
  });

  // Error states
  const [error, setError] = useState({
    overview: null as string | null,
    phanHoi: null as string | null,
    minhChung: null as string | null,
    diem: null as string | null,
    xepLoai: null as string | null,
    diemTheoLop: null as string | null,
    semesters: null as string | null,
  });

  // Fetch overview statistics
  const fetchOverviewStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, overview: true }));
    setError((prev) => ({ ...prev, overview: null }));

    try {
      const data = await ApiService.layThongKeTongQuan();
      setOverviewStats(data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê tổng quan:", err);
      setError((prev) => ({
        ...prev,
        overview: "Không thể tải thống kê tổng quan",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  }, []);

  // Fetch feedback statistics
  const fetchPhanHoiStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, phanHoi: true }));
    setError((prev) => ({ ...prev, phanHoi: null }));

    try {
      const data = await ApiService.layThongKePhanHoi();
      setPhanHoiStats(data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê phản hồi:", err);
      setError((prev) => ({
        ...prev,
        phanHoi: "Không thể tải thống kê phản hồi",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, phanHoi: false }));
    }
  }, []);

  // Fetch evidence statistics
  const fetchMinhChungStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, minhChung: true }));
    setError((prev) => ({ ...prev, minhChung: null }));

    try {
      const data = await ApiService.layThongKeMinhChung();
      setMinhChungStats(data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê minh chứng:", err);
      setError((prev) => ({
        ...prev,
        minhChung: "Không thể tải thống kê minh chứng",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, minhChung: false }));
    }
  }, []);

  // Fetch semesters
  const fetchSemesters = useCallback(async () => {
    setLoading((prev) => ({ ...prev, semesters: true }));
    setError((prev) => ({ ...prev, semesters: null }));

    try {
      const data = await ApiService.layDanhSachHocKy();
      setSemesters(data);

      if (data.length > 0) {
        const sortedSemesters = [...data].sort(
          (a, b) =>
            new Date(b.NgayBatDau).getTime() - new Date(a.NgayBatDau).getTime()
        );
        setSelectedSemester(sortedSemesters[0].MaHocKy);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách học kỳ:", err);
      setError((prev) => ({
        ...prev,
        semesters: "Không thể tải danh sách học kỳ",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, semesters: false }));
    }
  }, []);

  // Fetch score statistics by semester
  const fetchDiemStats = useCallback(async (maHocKy: number) => {
    if (!maHocKy) return;

    setLoading((prev) => ({ ...prev, diem: true }));
    setError((prev) => ({ ...prev, diem: null }));

    try {
      const data = await ApiService.layThongKeDiemTheoHocKy(maHocKy);
      setDiemStats(data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê điểm:", err);
      setError((prev) => ({ ...prev, diem: "Không thể tải thống kê điểm" }));
    } finally {
      setLoading((prev) => ({ ...prev, diem: false }));
    }
  }, []);

  // Fetch classification report by semester
  const fetchXepLoaiStats = useCallback(async (maHocKy: number) => {
    if (!maHocKy) return;

    setLoading((prev) => ({ ...prev, xepLoai: true }));
    setError((prev) => ({ ...prev, xepLoai: null }));

    try {
      const data = await ApiService.layBaoCaoXepLoai(maHocKy);
      setXepLoaiStats(data);
    } catch (err) {
      console.error("Lỗi khi lấy báo cáo xếp loại:", err);
      setError((prev) => ({
        ...prev,
        xepLoai: "Không thể tải báo cáo xếp loại",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, xepLoai: false }));
    }
  }, []);

  // Fetch class statistics by semester
  const fetchDiemTheoLopStats = useCallback(async (maHocKy: number) => {
    if (!maHocKy) return;

    setLoading((prev) => ({ ...prev, diemTheoLop: true }));
    setError((prev) => ({ ...prev, diemTheoLop: null }));

    try {
      const data = await ApiService.layThongKeDiemTheoLop(maHocKy);
      setDiemTheoLopStats(data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê điểm theo lớp:", err);
      setError((prev) => ({
        ...prev,
        diemTheoLop: "Không thể tải thống kê điểm theo lớp",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, diemTheoLop: false }));
    }
  }, []);

  // Handle semester change
  const handleSemesterChange = (maHocKy: number) => {
    setSelectedSemester(maHocKy);
  };

  // Refresh all data
  const handleRefreshAll = () => {
    fetchOverviewStats();
    fetchPhanHoiStats();
    fetchMinhChungStats();

    if (selectedSemester) {
      fetchDiemStats(selectedSemester);
      fetchXepLoaiStats(selectedSemester);
      fetchDiemTheoLopStats(selectedSemester);
    }
  };

  // Export report as PDF or Excel
  const handleExportReport = () => {
    alert("Chức năng xuất báo cáo đang được phát triển");
  };

  // Load initial data
  useEffect(() => {
    fetchOverviewStats();
    fetchPhanHoiStats();
    fetchMinhChungStats();
    fetchSemesters();
  }, [
    fetchOverviewStats,
    fetchPhanHoiStats,
    fetchMinhChungStats,
    fetchSemesters,
  ]);

  // Load semester-dependent data when semester changes
  useEffect(() => {
    if (selectedSemester) {
      fetchDiemStats(selectedSemester);
      fetchXepLoaiStats(selectedSemester);
      fetchDiemTheoLopStats(selectedSemester);
    }
  }, [
    selectedSemester,
    fetchDiemStats,
    fetchXepLoaiStats,
    fetchDiemTheoLopStats,
  ]);

  // Get current semester name
  const getCurrentSemesterName = () => {
    if (!selectedSemester || !semesters.length) return "Chưa chọn học kỳ";
    const semester = semesters.find((s) => s.MaHocKy === selectedSemester);
    return semester
      ? `${semester.TenHocKy} - ${semester.NamHoc}`
      : "Chưa chọn học kỳ";
  };

  return (
    <div className="thong-ke-container">
      <div className="thong-ke-header">
        <div className="header-title">
          <h1>Thống kê và báo cáo</h1>
          <p className="header-description">
            Tổng quan về hoạt động và điểm rèn luyện sinh viên
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={handleRefreshAll}>
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </button>
          <button className="btn-export" onClick={handleExportReport}>
            <Download size={16} />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics */}
      <OverviewStats
        stats={overviewStats}
        loading={loading.overview}
        error={error.overview}
      />

      {/* Semester Selector */}
      <div className="semester-selection-container">
        <h2>Thống kê theo học kỳ</h2>
        <SemesterSelector
          semesters={semesters}
          selectedSemester={selectedSemester}
          onChange={handleSemesterChange}
          loading={loading.semesters}
        />
        {selectedSemester && (
          <div className="selected-semester">
            <span>Đang xem thống kê cho: </span>
            <strong>{getCurrentSemesterName()}</strong>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {/* Feedback Statistics */}
        <div className="stats-card">
          <PhanHoiStats
            stats={phanHoiStats}
            loading={loading.phanHoi}
            error={error.phanHoi}
          />
        </div>

        {/* Evidence Statistics */}
        <div className="stats-card">
          <MinhChungStats
            stats={minhChungStats}
            loading={loading.minhChung}
            error={error.minhChung}
          />
        </div>
      </div>

      {/* Score Statistics */}
      {selectedSemester && (
        <>
          <div className="stats-grid">
            <div className="stats-card">
              <DiemRenLuyenStats
                stats={diemStats}
                loading={loading.diem}
                error={error.diem}
                semesterName={getCurrentSemesterName()}
              />
            </div>

            <div className="stats-card">
              <XepLoaiStats
                stats={xepLoaiStats}
                loading={loading.xepLoai}
                error={error.xepLoai}
                semesterName={getCurrentSemesterName()}
              />
            </div>
          </div>

          {/* Class Statistics */}
          <div className="stats-card full-width">
            <DiemTheoLopStats
              stats={diemTheoLopStats}
              loading={loading.diemTheoLop}
              error={error.diemTheoLop}
              semesterName={getCurrentSemesterName()}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ThongKeBaoCao;
