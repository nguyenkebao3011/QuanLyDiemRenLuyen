import type React from "react";
import { useState, useEffect, useCallback } from "react";
import "../css/ChamDiemRenLuyen.css";

// Import components
import HoatDongList from "../../../../components/Admin/DiemDanh/HoatDongList";
import HoatDongDetail from "../../../../components/Admin/DiemDanh/HoatDongDetail";
import SinhVienList from "../../../../components/Admin/DiemDanh/SinhVienList";
import BaoCaoDiemDanhView from "../../../../components/Admin/DiemDanh/BaoCaoDiemDanhView";
import DiemDanhDialog from "../../../../components/Admin/DiemDanh/DiemDanhDialog";
import Toast from "../../../../components/Admin/DiemDanh/Toast";
import { Info } from "lucide-react";

// Import types
import type {
  HoatDong,
  DangKyHoatDong,
  ThongTinHoatDong,
  BaoCaoDiemDanh,
  QuanLyKhoa,
  HocKy,
} from "../../../../components/Admin/types";

// Import ApiService
import { ApiService } from "../../../../untils/services/service-api";

export default function DiemDanh() {
  // State cho danh sách hoạt động
  const [danhSachHoatDong, setDanhSachHoatDong] = useState<HoatDong[]>([]);
  const [filteredHoatDong, setFilteredHoatDong] = useState<HoatDong[]>([]);
  const [loadingHoatDong, setLoadingHoatDong] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHocKy, setSelectedHocKy] = useState<string>("all");
  const [selectedTrangThai, setSelectedTrangThai] = useState<string>("all");
  const [hocKys, setHocKys] = useState<HocKy[]>([]);
  const [uniqueHocKy, setUniqueHocKy] = useState<string[]>([]);
  const [uniqueTrangThai, setUniqueTrangThai] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingHocKy, setLoadingHocKy] = useState(false);
  const [hocKyApiCalled, setHocKyApiCalled] = useState(false);
  const [hocKyMapping, setHocKyMapping] = useState<Record<number, string>>({});

  // State cho danh sách sinh viên
  const [selectedHoatDong, setSelectedHoatDong] = useState<number | null>(null);
  const [danhSachSinhVien, setDanhSachSinhVien] = useState<DangKyHoatDong[]>(
    []
  );
  const [filteredSinhVien, setFilteredSinhVien] = useState<DangKyHoatDong[]>(
    []
  );
  const [loadingSinhVien, setLoadingSinhVien] = useState(false);
  const [searchSinhVien, setSearchSinhVien] = useState("");
  const [selectedLop, setSelectedLop] = useState<string>("all");
  const [selectedTrangThaiDiemDanh, setSelectedTrangThaiDiemDanh] =
    useState<string>("all");
  const [uniqueLop, setUniqueLop] = useState<string[]>([]);

  // State cho thông tin hoạt động
  const [thongTinHoatDong, setThongTinHoatDong] =
    useState<ThongTinHoatDong | null>(null);
  const [loadingThongTin, setLoadingThongTin] = useState(false);

  // State cho báo cáo điểm danh
  const [baoCaoDiemDanh, setBaoCaoDiemDanh] = useState<BaoCaoDiemDanh | null>(
    null
  );
  const [loadingBaoCao, setLoadingBaoCao] = useState(false);

  // State cho điểm danh
  const [selectedSinhVien, setSelectedSinhVien] = useState<number[]>([]);
  const [ghiChu, setGhiChu] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quanLyKhoa, setQuanLyKhoa] = useState<QuanLyKhoa | null>(null);
  const [maQL, setMaQL] = useState<string | null>(null);

  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState("danh-sach");

  // State cho toast
  const [toasts, setToasts] = useState<
    { id: number; title: string; description: string; variant: string }[]
  >([]);

  // Chuẩn hóa chuỗi để so sánh
  const normalizeString = (str: string | null | undefined): string => {
    if (!str) return "";
    return str.toLowerCase().trim();
  };

  // Hiển thị toast
  const showToast = (
    title: string,
    description: string,
    variant = "default"
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // Tự động ẩn toast sau 5 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Lấy danh sách học kỳ từ API
  const fetchHocKy = useCallback(async () => {
    // Nếu đã gọi API rồi thì không gọi lại
    if (hocKyApiCalled) return;

    setLoadingHocKy(true);
    setHocKyApiCalled(true); // Đánh dấu đã gọi API

    try {
      console.log("Đang lấy danh sách học kỳ...");
      const hocKyData = await ApiService.layDanhSachHocKy();

      console.log("Kết quả API học kỳ:", hocKyData);

      if (Array.isArray(hocKyData) && hocKyData.length > 0) {
        setHocKys(hocKyData);

        // Trích xuất tên học kỳ từ dữ liệu API
        const uniqueHocKyNames = Array.from(
          new Set(hocKyData.map((hk) => hk.TenHocKy))
        );
        setUniqueHocKy(uniqueHocKyNames);

        // Tạo mapping từ mã học kỳ sang tên học kỳ
        const mapping: Record<number, string> = {};
        hocKyData.forEach((hk) => {
          mapping[hk.MaHocKy] = hk.TenHocKy;
        });
        setHocKyMapping(mapping);
        console.log("Đã tạo mapping học kỳ:", mapping);
      } else if (hocKyData && !Array.isArray(hocKyData)) {
        // Trường hợp trả về một học kỳ duy nhất
        const singleHocKy = hocKyData as HocKy;
        setHocKys([singleHocKy]);
        setUniqueHocKy([singleHocKy.TenHocKy]);

        // Tạo mapping
        const mapping: Record<number, string> = {};
        mapping[singleHocKy.MaHocKy] = singleHocKy.TenHocKy;
        setHocKyMapping(mapping);
      } else {
        console.log("Không có dữ liệu học kỳ");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học kỳ:", error);
      setError("Lỗi khi lấy danh sách học kỳ");

      // Chỉ hiển thị toast một lần
      showToast(
        "Lỗi",
        "Không thể lấy danh sách học kỳ. Sẽ sử dụng dữ liệu từ hoạt động.",
        "warning"
      );
    } finally {
      setLoadingHocKy(false);
    }
  }, [hocKyApiCalled]);

  // Lấy thông tin quản lý
  const fetchQuanLyKhoa = useCallback(async () => {
    try {
      const qlKhoaData = await ApiService.thongTinQuanLyKhoa();
      setQuanLyKhoa(qlKhoaData);
      setMaQL(qlKhoaData.MaQl);
      console.log("Đã lấy thông tin quản lý khoa:", qlKhoaData);

      // Lưu vào sessionStorage để giảm số lần gọi API
      sessionStorage.setItem("quanLyKhoa", JSON.stringify(qlKhoaData));
    } catch (error) {
      console.error("Lỗi khi lấy thông tin quản lý khoa:", error);
    }
  }, []);

  // Lấy danh sách hoạt động
  const fetchDanhSachHoatDong = useCallback(async () => {
    setLoadingHoatDong(true);
    try {
      const response = await ApiService.layDanhSachHoatDongDiemDanh();

      console.log("API trả về số lượng hoạt động:", response.length);

      // Kiểm tra dữ liệu hoạt động trả về từ API
      if (response.length > 0) {
        const sampleActivity = response[0];
        // Kiểm tra xem tất cả hoạt động có MaHocKyNavigation không
        const withoutNavigation = response.filter(
          (hd: HoatDong) => !hd.MaHocKyNavigation
        );
        console.log(
          "Số hoạt động không có MaHocKyNavigation:",
          withoutNavigation.length
        );
        // Đếm số lượng hoạt động theo học kỳ
        const hkCount: Record<number, number> = {};
        response.forEach((hd: HoatDong) => {
          const hk = hd.MaHocKy;
          if (hk !== undefined && hk !== null) {
            hkCount[hk] = (hkCount[hk] || 0) + 1;
          }
        });
        console.log("Số lượng hoạt động theo mã học kỳ:", hkCount);
      }

      // Bổ sung thông tin học kỳ nếu cần
      const hoatDongWithHocKy = response.map((hd: HoatDong) => {
        if (!hd.MaHocKyNavigation && hd.MaHocKy && hocKyMapping[hd.MaHocKy]) {
          // Nếu không có MaHocKyNavigation nhưng có MaHocKy, tạo object tạm thời
          return {
            ...hd,
            MaHocKyNavigation: {
              TenHocKy: hocKyMapping[hd.MaHocKy] || `Học kỳ ${hd.MaHocKy}`,
              NamHoc: "",
            },
          };
        }
        return hd;
      });

      // Thu thập danh sách trạng thái duy nhất
      const trangThaiSet = new Set<string>();
      hoatDongWithHocKy.forEach((hd: HoatDong) => {
        if (hd.TrangThai) trangThaiSet.add(hd.TrangThai);
      });
      const trangThaiList = Array.from(trangThaiSet);
      setUniqueTrangThai(trangThaiList);
      console.log("Danh sách trạng thái từ hoạt động:", trangThaiList);

      // Đếm hoạt động theo trạng thái
      const trangThaiCount: Record<string, number> = {};
      hoatDongWithHocKy.forEach((hd: HoatDong) => {
        const trangThai = hd.TrangThai || "Không xác định";
        trangThaiCount[trangThai] = (trangThaiCount[trangThai] || 0) + 1;
      });
      console.log("Phân bố hoạt động theo trạng thái:", trangThaiCount);

      setDanhSachHoatDong(hoatDongWithHocKy);
      setFilteredHoatDong(hoatDongWithHocKy);

      // Thu thập danh sách học kỳ từ dữ liệu hoạt động
      if (uniqueHocKy.length === 0) {
        const hocKysSet = new Set<string>();

        hoatDongWithHocKy.forEach((item: HoatDong) => {
          // Ưu tiên sử dụng MaHocKyNavigation nếu có
          if (item.MaHocKyNavigation?.TenHocKy) {
            hocKysSet.add(item.MaHocKyNavigation?.TenHocKy);
          }
          // Nếu không có, tạo tên tạm thời từ MaHocKy
          else if (item.MaHocKy) {
            const tenHocKy =
              hocKyMapping[item.MaHocKy] || `Học kỳ ${item.MaHocKy}`;
            hocKysSet.add(tenHocKy);
          }
        });

        const hocKys = Array.from(hocKysSet);
        if (hocKys.length > 0) {
          console.log("Danh sách học kỳ từ hoạt động:", hocKys);
          setUniqueHocKy(hocKys);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hoạt động:", error);
      showToast(
        "Lỗi",
        "Không thể lấy danh sách hoạt động. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setLoadingHoatDong(false);
    }
  }, [hocKyMapping, uniqueHocKy.length]);

  // Hàm xử lý lọc theo học kỳ
  const handleHocKyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHocKyValue = e.target.value;
    console.log("Đã chọn học kỳ:", newHocKyValue);

    setSelectedHocKy(newHocKyValue);

    if (newHocKyValue === "all") {
      // Nếu chọn "Tất cả học kỳ", áp dụng chỉ lọc trạng thái
      let filtered = [...danhSachHoatDong];

      // Lọc theo trạng thái nếu đã chọn
      if (selectedTrangThai !== "all") {
        filtered = filtered.filter(
          (hd) =>
            normalizeString(hd.TrangThai) === normalizeString(selectedTrangThai)
        );
      }

      setFilteredHoatDong(filtered);
    } else {
      // Tìm mã học kỳ tương ứng với giá trị được chọn
      let maHocKySelected: number | null = null;

      // Thử lấy mã học kỳ từ danh sách học kỳ từ API
      if (hocKys && hocKys.length > 0) {
        const hk = hocKys.find((hk) => hk.TenHocKy === newHocKyValue);
        if (hk) maHocKySelected = hk.MaHocKy;
      }

      console.log("Mã học kỳ đã chọn:", maHocKySelected);

      // Lọc hoạt động theo học kỳ đã chọn
      let filtered: HoatDong[];

      if (maHocKySelected !== null) {
        // Nếu tìm được mã học kỳ, lọc theo mã
        filtered = danhSachHoatDong.filter(
          (hd) => hd.MaHocKy === maHocKySelected
        );
      } else {
        // Nếu không tìm được mã, thử lọc theo tên (fallback)
        filtered = danhSachHoatDong.filter(
          (hd) => hd.MaHocKyNavigation?.TenHocKy === newHocKyValue
        );
      }

      // Lọc thêm theo trạng thái nếu đã chọn
      if (selectedTrangThai !== "all") {
        filtered = filtered.filter(
          (hd) =>
            normalizeString(hd.TrangThai) === normalizeString(selectedTrangThai)
        );
      }

      console.log(
        `Đã lọc: ${filtered.length} hoạt động cho học kỳ ${newHocKyValue}`
      );
      setFilteredHoatDong(filtered);
    }
  };

  // Hàm xử lý lọc theo trạng thái
  const handleTrangThaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTrangThai = e.target.value;
    console.log("Đã chọn trạng thái:", newTrangThai);

    setSelectedTrangThai(newTrangThai);

    // Áp dụng cả hai bộ lọc: học kỳ và trạng thái
    let filtered = [...danhSachHoatDong];

    // Lọc theo học kỳ trước
    if (selectedHocKy !== "all") {
      // Tìm mã học kỳ tương ứng nếu cần
      let maHocKySelected: number | null = null;

      if (hocKys && hocKys.length > 0) {
        const hk = hocKys.find((hk) => hk.TenHocKy === selectedHocKy);
        if (hk) maHocKySelected = hk.MaHocKy;
      }

      if (maHocKySelected !== null) {
        // Nếu tìm được mã học kỳ, lọc theo mã
        filtered = filtered.filter((hd) => hd.MaHocKy === maHocKySelected);
      } else {
        // Nếu không tìm được mã, thử lọc theo tên
        filtered = filtered.filter(
          (hd) => hd.MaHocKyNavigation?.TenHocKy === selectedHocKy
        );
      }
    }

    // Sau đó lọc theo trạng thái
    if (newTrangThai !== "all") {
      filtered = filtered.filter((hd) => {
        console.log(
          `Hoạt động ${hd.MaHoatDong} - Trạng thái: "${hd.TrangThai}" vs "${newTrangThai}"`
        );
        return normalizeString(hd.TrangThai) === normalizeString(newTrangThai);
      });
    }

    console.log(
      `Đã lọc: ${filtered.length} hoạt động với trạng thái ${newTrangThai}`
    );
    setFilteredHoatDong(filtered);
  };

  // Lấy danh sách sinh viên đăng ký hoạt động
  const fetchDanhSachSinhVien = useCallback(async (maHoatDong: number) => {
    if (!maHoatDong) return;

    setLoadingSinhVien(true);
    try {
      const response = await ApiService.layDanhSachSinhVienDiemDanh(maHoatDong);
      setDanhSachSinhVien(response);
      setFilteredSinhVien(response);

      // Lấy danh sách lớp duy nhất
      const lopsSet = new Set(response.map((item: DangKyHoatDong) => item.Lop));
      const lops = Array.from(lopsSet).filter(Boolean) as string[];
      setUniqueLop(lops);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      showToast(
        "Lỗi",
        "Không thể lấy danh sách sinh viên. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setLoadingSinhVien(false);
    }
  }, []);

  // Lấy thông tin hoạt động
  const fetchThongTinHoatDong = useCallback(async (maHoatDong: number) => {
    if (!maHoatDong) return;

    setLoadingThongTin(true);
    try {
      const response = await ApiService.layThongTinHoatDong(maHoatDong);
      setThongTinHoatDong(response);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin hoạt động:", error);
      showToast(
        "Lỗi",
        "Không thể lấy thông tin hoạt động. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setLoadingThongTin(false);
    }
  }, []);

  // Lấy báo cáo điểm danh
  const fetchBaoCaoDiemDanh = useCallback(async (maHoatDong: number) => {
    if (!maHoatDong) return;

    setLoadingBaoCao(true);
    try {
      const response = await ApiService.layBaoCaoDiemDanh(maHoatDong);
      setBaoCaoDiemDanh(response);
    } catch (error) {
      console.error("Lỗi khi lấy báo cáo điểm danh:", error);
      showToast(
        "Lỗi",
        "Không thể lấy báo cáo điểm danh. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setLoadingBaoCao(false);
    }
  }, []);

  // Điểm danh sinh viên
  const diemDanhSinhVien = async (maDangKy: number) => {
    if (!maQL) {
      showToast(
        "Cảnh báo",
        "Không thể điểm danh khi chưa có thông tin quản lý.",
        "warning"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Gọi API điểm danh với:", {
        MaDangKy: maDangKy,
        MaQl: maQL,
        GhiChu: ghiChu,
      });

      const response = await ApiService.diemDanhSinhVien(
        maDangKy,
        maQL,
        ghiChu
      );

      if (response.success) {
        showToast("Thành công", "Điểm danh sinh viên thành công", "success");
        // Cập nhật lại danh sách sinh viên
        if (selectedHoatDong) {
          fetchDanhSachSinhVien(selectedHoatDong);
          fetchThongTinHoatDong(selectedHoatDong);
        }
      }
    } catch (error: any) {
      console.error("Lỗi khi điểm danh sinh viên:", error);

      // Hiển thị thông tin lỗi chi tiết hơn
      const errorMessage = error.response?.data || "Vui lòng thử lại sau.";
      showToast(
        "Lỗi",
        `Không thể điểm danh sinh viên. ${errorMessage}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setGhiChu("");
    }
  };

  // Điểm danh nhóm sinh viên
  const diemDanhNhom = async () => {
    if (!maQL) {
      showToast(
        "Cảnh báo",
        "Không thể điểm danh khi chưa có thông tin quản lý.",
        "warning"
      );
      return;
    }

    if (selectedSinhVien.length === 0) {
      showToast(
        "Cảnh báo",
        "Vui lòng chọn ít nhất một sinh viên để điểm danh",
        "warning"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Gọi API điểm danh nhóm với:", {
        DanhSachMaDangKy: selectedSinhVien,
        MaQl: maQL,
        GhiChu: ghiChu,
      });

      const response = await ApiService.diemDanhNhom(
        selectedSinhVien,
        maQL,
        ghiChu
      );

      if (response.success) {
        showToast(
          "Thành công",
          `Điểm danh ${selectedSinhVien.length} sinh viên thành công`,
          "success"
        );
        // Cập nhật lại danh sách sinh viên
        if (selectedHoatDong) {
          fetchDanhSachSinhVien(selectedHoatDong);
          fetchThongTinHoatDong(selectedHoatDong);
        }
        // Đóng dialog và reset state
        setIsDialogOpen(false);
        setSelectedSinhVien([]);
        setGhiChu("");
      }
    } catch (error) {
      console.error("Lỗi khi điểm danh nhóm:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xuất báo cáo điểm danh ra Excel
  const exportToExcel = () => {
    if (!baoCaoDiemDanh) return;

    // Trong thực tế, đây sẽ là API call để xuất Excel
    showToast("Thông báo", "Chức năng xuất Excel đang được phát triển", "info");
  };

  // Xử lý chọn hoạt động
  const handleSelectHoatDong = (maHoatDong: number) => {
    setSelectedHoatDong(maHoatDong);
    fetchDanhSachSinhVien(maHoatDong);
    fetchThongTinHoatDong(maHoatDong);
    fetchBaoCaoDiemDanh(maHoatDong);
    setActiveTab("danh-sach");
  };

  // Xử lý chọn/bỏ chọn tất cả sinh viên
  const handleSelectAllSinhVien = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      const allMaDangKy = filteredSinhVien
        .filter((sv) => !sv.DaDiemDanh)
        .map((sv) => sv.MaDangKy);
      setSelectedSinhVien(allMaDangKy);
    } else {
      setSelectedSinhVien([]);
    }
  };

  // Xử lý chọn/bỏ chọn một sinh viên
  const handleSelectSinhVien = (maDangKy: number, checked: boolean) => {
    if (checked) {
      setSelectedSinhVien((prev) => [...prev, maDangKy]);
    } else {
      setSelectedSinhVien((prev) => prev.filter((id) => id !== maDangKy));
    }
  };

  // Effect để lấy thông tin quản lý khi component mount
  useEffect(() => {
    fetchQuanLyKhoa();
  }, [fetchQuanLyKhoa]);

  // Effect riêng để lấy danh sách học kỳ
  useEffect(() => {
    // Thử lấy học kỳ từ API
    fetchHocKy().catch((err) => {
      console.error(
        "Lỗi khi lấy học kỳ, sẽ sử dụng dữ liệu từ hoạt động:",
        err
      );
    });
  }, [fetchHocKy]);

  // Effect riêng để lấy danh sách hoạt động
  useEffect(() => {
    fetchDanhSachHoatDong();
  }, [fetchDanhSachHoatDong]);

  // Lọc danh sách sinh viên
  useEffect(() => {
    let filtered = [...danhSachSinhVien];

    // Lọc theo từ khóa tìm kiếm
    if (searchSinhVien) {
      filtered = filtered.filter(
        (sv) =>
          (sv.HoTen &&
            sv.HoTen.toLowerCase().includes(searchSinhVien.toLowerCase())) ||
          (sv.MaSv &&
            sv.MaSv.toLowerCase().includes(searchSinhVien.toLowerCase()))
      );
    }

    // Lọc theo lớp
    if (selectedLop !== "all") {
      filtered = filtered.filter((sv) => sv.Lop === selectedLop);
    }

    // Lọc theo trạng thái điểm danh
    if (selectedTrangThaiDiemDanh !== "all") {
      if (selectedTrangThaiDiemDanh === "dadiemdanh") {
        filtered = filtered.filter((sv) => sv.DaDiemDanh);
      } else if (selectedTrangThaiDiemDanh === "chuadiemdanh") {
        filtered = filtered.filter((sv) => !sv.DaDiemDanh);
      }
    }

    setFilteredSinhVien(filtered);
  }, [
    danhSachSinhVien,
    searchSinhVien,
    selectedLop,
    selectedTrangThaiDiemDanh,
  ]);

  // Render trạng thái hoạt động
  const renderTrangThaiHoatDong = (trangThai: string | null) => {
    switch (trangThai) {
      case "Đang diễn ra":
        return <span className="badge badge-blue">Đang diễn ra</span>;
      case "Đã đóng đăng ký":
        return <span className="badge badge-green">Đã đóng đăng ký</span>;
      case "Chưa bắt đầu":
        return <span className="badge badge-yellow">Chưa bắt đầu</span>;
      case "Đang mở đăng ký":
        return <span className="badge badge-purple">Đang mở đăng ký</span>;
      default:
        return <span className="badge badge-gray">{trangThai}</span>;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Quản lý điểm danh hoạt động</h1>
        <p className="description">
          Quản lý điểm danh sinh viên tham gia các hoạt động, sự kiện của trường
        </p>
        {quanLyKhoa && (
          <div className="user-info">
            <span>
              Người quản lý: {quanLyKhoa.HoTen} ({quanLyKhoa.MaQl})
            </span>
          </div>
        )}
      </div>

      <div className="grid">
        {/* Danh sách hoạt động */}
        <HoatDongList
          danhSachHoatDong={danhSachHoatDong}
          filteredHoatDong={filteredHoatDong}
          loadingHoatDong={loadingHoatDong}
          searchTerm={searchTerm}
          selectedHocKy={selectedHocKy}
          selectedTrangThai={selectedTrangThai}
          uniqueHocKy={uniqueHocKy}
          selectedHoatDong={selectedHoatDong}
          setSearchTerm={setSearchTerm}
          setSelectedHocKy={setSelectedHocKy}
          setSelectedTrangThai={setSelectedTrangThai}
          handleSelectHoatDong={handleSelectHoatDong}
          fetchDanhSachHoatDong={fetchDanhSachHoatDong}
          hocKys={hocKys}
          handleHocKyChange={handleHocKyChange}
          handleTrangThaiChange={handleTrangThaiChange}
          uniqueTrangThai={uniqueTrangThai}
        />

        {/* Thông tin và quản lý điểm danh */}
        <div className="card card-large">
          {!selectedHoatDong ? (
            <div className="empty-state large">
              <Info className="empty-icon" />
              <h3>Chưa chọn hoạt động</h3>
              <p>
                Vui lòng chọn một hoạt động từ danh sách bên trái để quản lý
                điểm danh
              </p>
            </div>
          ) : (
            <>
              <HoatDongDetail
                thongTinHoatDong={thongTinHoatDong}
                loadingThongTin={loadingThongTin}
                renderTrangThaiHoatDong={renderTrangThaiHoatDong}
              />

              <div className="card-content">
                <div className="tabs">
                  <div className="tabs-list">
                    <button
                      className={`tab-button ${
                        activeTab === "danh-sach" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("danh-sach")}
                    >
                      Danh sách sinh viên
                    </button>
                    <button
                      className={`tab-button ${
                        activeTab === "bao-cao" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("bao-cao")}
                    >
                      Báo cáo điểm danh
                    </button>
                  </div>

                  <div
                    className={`tab-content ${
                      activeTab === "danh-sach" ? "active" : ""
                    }`}
                  >
                    <SinhVienList
                      filteredSinhVien={filteredSinhVien}
                      loadingSinhVien={loadingSinhVien}
                      searchSinhVien={searchSinhVien}
                      selectedLop={selectedLop}
                      selectedTrangThaiDiemDanh={selectedTrangThaiDiemDanh}
                      uniqueLop={uniqueLop}
                      selectedSinhVien={selectedSinhVien}
                      isSubmitting={isSubmitting}
                      setSearchSinhVien={setSearchSinhVien}
                      setSelectedLop={setSelectedLop}
                      setSelectedTrangThaiDiemDanh={
                        setSelectedTrangThaiDiemDanh
                      }
                      setIsDialogOpen={setIsDialogOpen}
                      handleSelectAllSinhVien={handleSelectAllSinhVien}
                      handleSelectSinhVien={handleSelectSinhVien}
                      diemDanhSinhVien={diemDanhSinhVien}
                      maQL={maQL}
                    />
                  </div>

                  <div
                    className={`tab-content ${
                      activeTab === "bao-cao" ? "active" : ""
                    }`}
                  >
                    <BaoCaoDiemDanhView
                      baoCaoDiemDanh={baoCaoDiemDanh}
                      loadingBaoCao={loadingBaoCao}
                      exportToExcel={exportToExcel}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dialog điểm danh nhóm */}
      <DiemDanhDialog
        isDialogOpen={isDialogOpen}
        selectedSinhVien={selectedSinhVien}
        ghiChu={ghiChu}
        isSubmitting={isSubmitting}
        setIsDialogOpen={setIsDialogOpen}
        setGhiChu={setGhiChu}
        diemDanhNhom={diemDanhNhom}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} setToasts={setToasts} />
    </div>
  );
}
