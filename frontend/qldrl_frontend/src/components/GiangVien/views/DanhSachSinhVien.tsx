import React, { useState, useEffect } from 'react';

// Định nghĩa interface cho sinh viên
interface SinhVienType {
  MaSV: string;
  HoTen: string;
  MaLop: string;
  Email: string;
  SoDienThoai: string;
  DiaChi: string;
  NgaySinh: string;
  GioiTinh: string;
  MaVaiTro: number;
  TrangThai: string;
  TenLop: string;
  AnhDaiDien: string | null;
}

// Định nghĩa interface cho điểm rèn luyện
interface DiemRenLuyenType {
  MaHocKy: number;
  TenHocKy: string;
  TongDiem: number;
}

interface DiemRenLuyenResponse {
  MaSV: string;
  HoTen: string;
  DiemRenLuyenTheoHocKy: DiemRenLuyenType[];
}

const DanhSachSinhVien: React.FC = () => {
  const [sinhVien, setSinhVien] = useState<SinhVienType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [diemRenLuyen, setDiemRenLuyen] = useState<DiemRenLuyenResponse | null>(null);
  const [diemLoading, setDiemLoading] = useState<boolean>(false);
  const [diemError, setDiemError] = useState<string | null>(null);

  // Fetch danh sách sinh viên
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:5163/api/SinhVien/lay-sinhvien-theo-vai-tro', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Không được phép truy cập. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
          }
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        if (Array.isArray(result)) {
          setSinhVien(result as SinhVienType[]);
        } else {
          setError('Không tìm thấy dữ liệu sinh viên.');
        }
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu sinh viên';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch điểm rèn luyện khi mở chi tiết sinh viên
  useEffect(() => {
    if (!expandedStudent) {
      setDiemRenLuyen(null);
      setDiemError(null);
      return;
    }

    const fetchDiemRenLuyen = async (): Promise<void> => {
      setDiemLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setDiemError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setDiemLoading(false);
          return;
        }
        
        const response = await fetch(
          `http://localhost:5163/api/giangvien/DiemRenLuyens/${expandedStudent}giang-vien/xem-diem-ren-luyen`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 401) {
            setDiemError('Không được phép truy cập. Vui lòng đăng nhập lại.');
            setDiemLoading(false);
            return;
          }
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        setDiemRenLuyen(result as DiemRenLuyenResponse);
        setDiemLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải điểm rèn luyện';
        setDiemError(errorMessage);
        setDiemLoading(false);
      }
    };

    fetchDiemRenLuyen();
  }, [expandedStudent]);

  const toggleChiTiet = (maSV: string): void => {
    if (expandedStudent === maSV) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(maSV);
    }
  };

  const formatNgaySinh = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const filteredStudents = sinhVien.filter(sv => 
    sv.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sv.MaSV.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-danh-sach">
      <div className="header-danh-sach">
        <h2 className="tieu-de">Danh Sách Sinh Viên</h2>
        <div className="tim-kiem-container">
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên..."
            className="input-tim-kiem"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="icon-tim-kiem">🔍</span>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-text">Đang tải dữ liệu sinh viên...</div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bang-sinh-vien">
          <div className="hang-tieu-de">
            <div className="cot-ma-sv">Mã SV</div>
            <div className="cot-ho-ten">Họ Tên</div>
            <div className="cot-lop">Lớp</div>
            <div className="cot-hanh-dong">Chi Tiết</div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="khong-co-du-lieu">Không tìm thấy sinh viên nào</div>
          ) : (
            filteredStudents.map((sv) => (
              <div key={sv.MaSV} className="hang-sinh-vien">
                <div className="body-sinh-vien">
                  <div className="cot-ma-sv">{sv.MaSV}</div>
                  <div className="cot-ho-ten">{sv.HoTen}</div>
                  <div className="cot-lop">{sv.TenLop}</div>
                  <div className="cot-hanh-dong">
                    <button 
                      className="nut-chi-tiet" 
                      onClick={() => toggleChiTiet(sv.MaSV)}
                    >
                      {expandedStudent === sv.MaSV ? 'Ẩn' : 'Xem'}
                    </button>
                  </div>
                </div>

                {expandedStudent === sv.MaSV && (
                  <div className="chi-tiet-sinh-vien">
                    <div className="hang-chi-tiet">
                      <span className="nhan">Email:</span>
                      <span className="gia-tri">{sv.Email}</span>
                    </div>
                    <div className="hang-chi-tiet">
                      <span className="nhan">Số Điện Thoại:</span>
                      <span className="gia-tri">{sv.SoDienThoai}</span>
                    </div>
                    <div className="hang-chi-tiet">
                      <span className="nhan">Địa Chỉ:</span>
                      <span className="gia-tri">{sv.DiaChi}</span>
                    </div>
                    <div className="hang-chi-tiet">
                      <span className="nhan">Ngày Sinh:</span>
                      <span className="gia-tri">{formatNgaySinh(sv.NgaySinh)}</span>
                    </div>
                    <div className="hang-chi-tiet">
                      <span className="nhan">Giới Tính:</span>
                      <span className="gia-tri">{sv.GioiTinh}</span>
                    </div>
                    <div className="hang-chi-tiet">
                      <span className="nhan">Trạng Thái:</span>
                      <span className="gia-tri">{sv.TrangThai}</span>
                    </div>
                    {/* Hiển thị điểm rèn luyện */}
                    <div className="hang-chi-tiet">
                      <span className="nhan">Điểm Rèn Luyện:</span>
                      <div className="gia-tri">
                        {diemLoading && <div>Đang tải điểm rèn luyện...</div>}
                        {diemError && <div className="error-text">{diemError}</div>}
                        {!diemLoading && !diemError && diemRenLuyen && (
                          diemRenLuyen.DiemRenLuyenTheoHocKy.length > 0 ? (
                            <ul>
                              {diemRenLuyen.DiemRenLuyenTheoHocKy.map((diem) => (
                                <li key={diem.MaHocKy}>
                                  {diem.TenHocKy}: {diem.TongDiem} điểm
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div>Không có dữ liệu điểm rèn luyện</div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DanhSachSinhVien;