import { Calendar } from "lucide-react";
import type { HocKy } from "../types";

interface SemesterSelectorProps {
  semesters: HocKy[];
  selectedSemester: number | null;
  onChange: (maHocKy: number) => void;
  loading: boolean;
}

const SemesterSelector: React.FC<SemesterSelectorProps> = ({
  semesters,
  selectedSemester,
  onChange,
  loading,
}) => {
  if (loading) {
    return (
      <div className="semester-selector loading">
        <div className="loading-spinner-small"></div>
        <span>Đang tải danh sách học kỳ...</span>
      </div>
    );
  }

  if (!semesters || semesters.length === 0) {
    return (
      <div className="semester-selector empty">
        <span>Không có học kỳ nào</span>
      </div>
    );
  }

  // Sort semesters by start date (newest first)
  const sortedSemesters = [...semesters].sort(
    (a, b) =>
      new Date(b.NgayBatDau).getTime() - new Date(a.NgayBatDau).getTime()
  );

  return (
    <div className="semester-selector">
      <div className="selector-icon">
        <Calendar size={20} />
      </div>
      <select
        value={selectedSemester || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="semester-select"
      >
        <option value="" disabled>
          Chọn học kỳ
        </option>
        {sortedSemesters.map((semester) => (
          <option key={semester.MaHocKy} value={semester.MaHocKy}>
            {semester.TenHocKy} - {semester.NamHoc}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SemesterSelector;
