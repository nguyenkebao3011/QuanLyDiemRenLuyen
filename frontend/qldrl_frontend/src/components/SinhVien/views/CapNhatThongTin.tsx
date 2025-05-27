
import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import "../css/CapNhatSinhVien.css"
interface Student {
  MaSV: string
  HoTen: string
  Email: string
  SoDienThoai: string
  DiaChi?: string
  NgaySinh?: string
  GioiTinh?: string
  MaLop?: string
  TenLop?: string
  AnhDaiDien?: string | null
}

interface Province {
  code: number
  name: string
}

interface District {
  code: number
  name: string
}

interface Ward {
  code: number
  name: string
}

const StudentInfoUpdate: React.FC = () => {
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
    Province: "",
    District: "",
    Ward: "",
    AnhDaiDien: null as File | null,
  })
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const BASE_URL = "http://localhost:5163"
  const PROVINCE_API = "https://provinces.open-api.vn/api/"

  // Handle success and error messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get<Province[]>(`${PROVINCE_API}p/`)
        setProvinces(response.data)
      } catch (err) {
        setError("Không thể tải danh sách tỉnh/thành phố")
      }
    }
    fetchProvinces()
  }, [])

  // Fetch districts when province changes
  useEffect(() => {
    if (formData.Province) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(`${PROVINCE_API}p/${formData.Province}?depth=2`)
          setDistricts(response.data.districts || [])
          setFormData({ ...formData, District: "", Ward: "" })
          setWards([])
        } catch (err) {
          setError("Không thể tải danh sách quận/huyện")
        }
      }
      fetchDistricts()
    }
  }, [formData.Province])

  // Fetch wards when district changes
  useEffect(() => {
    if (formData.District) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(`${PROVINCE_API}d/${formData.District}?depth=2`)
          setWards(response.data.wards || [])
          setFormData({ ...formData, Ward: "" })
        } catch (err) {
          setError("Không thể tải danh sách xã/phường")
        }
      }
      fetchWards()
    }
  }, [formData.District])

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const username = localStorage.getItem("username")

        if (!token || !username) {
          throw new Error("Không tìm thấy token hoặc username")
        }

        const response = await axios.get<Student>(`${BASE_URL}/api/SinhVien/lay-sinhvien-theo-vai-tro`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { username },
        })

        setStudentData(response.data)
        setFormData({
          Email: response.data.Email || "",
          SoDienThoai: response.data.SoDienThoai || "",
          DiaChi: response.data.DiaChi || "",
          Province: "",
          District: "",
          Ward: "",
          AnhDaiDien: null,
        })

        if (response.data.AnhDaiDien) {
          const avatarPath = response.data.AnhDaiDien
          setPreviewAvatar(avatarPath.startsWith("http") ? avatarPath : `${BASE_URL}${avatarPath}`)
        }
      } catch (err) {
        setError("Không thể tải thông tin sinh viên")
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["image/jpeg", "image/png"]
      if (!validTypes.includes(file.type)) {
        setError("Vui lòng chọn file ảnh định dạng JPEG hoặc PNG!")
        return
      }
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError("File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.")
        return
      }
      setFormData({ ...formData, AnhDaiDien: file })
      setPreviewAvatar(URL.createObjectURL(file))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token || !studentData) {
        throw new Error("Không tìm thấy token hoặc thông tin sinh viên")
      }

      const fullAddress = `${formData.DiaChi ? formData.DiaChi + ", " : ""}${
        formData.Ward ? wards.find((w) => w.code.toString() === formData.Ward)?.name + ", " : ""
      }${formData.District ? districts.find((d) => d.code.toString() === formData.District)?.name + ", " : ""}${
        formData.Province ? provinces.find((p) => p.code.toString() === formData.Province)?.name : ""
      }`

      const formDataToSend = new FormData()
      formDataToSend.append("MaSV", studentData.MaSV)
      formDataToSend.append("HoTen", studentData.HoTen)
      formDataToSend.append("Email", formData.Email)
      formDataToSend.append("SoDienThoai", formData.SoDienThoai)
      formDataToSend.append("DiaChi", fullAddress)
      formDataToSend.append("NgaySinh", studentData.NgaySinh || "")
      formDataToSend.append("GioiTinh", studentData.GioiTinh || "")
      formDataToSend.append("MaLop", studentData.MaLop || "")
      formDataToSend.append("TenLop", studentData.TenLop || "")
      formDataToSend.append("MaVaiTro", "0")
      formDataToSend.append("TrangThai", "Active")
      if (formData.AnhDaiDien) {
        formDataToSend.append("avatar", formData.AnhDaiDien)
      }

      const response = await axios.put(`${BASE_URL}/api/SinhVien/cap-nhat-thong-tin`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.status === 200) {
        setSuccessMessage("Cập nhật thông tin thành công!")
        setEditMode(false)

        setStudentData({
          ...studentData,
          Email: formData.Email,
          SoDienThoai: formData.SoDienThoai,
          DiaChi: fullAddress,
          AnhDaiDien: formData.AnhDaiDien ? previewAvatar || studentData.AnhDaiDien : studentData.AnhDaiDien,
        })
      }
    } catch (err: any) {
      if (err.response) {
        setError(`Cập nhật thất bại: ${err.response.data.message || err.response.data}`)
      } else {
        setError("Cập nhật thông tin thất bại. Vui lòng thử lại.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="student-update-loading">
        <div className="student-update-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    )
  }

  return (
    <div className="student-update-wrapper">
      <div className="student-update-header">
        <img
          className="student-update-logo"
          src="https://sinhvien.huit.edu.vn/Content/AConfig/images/sv_header_login.png"
          alt="Logo trường"
        />
      </div>

      <div className="student-update-container">
        <div className="student-update-card">
          <div className="student-update-card-header">
            <h2 className="student-update-title">
              <User className="student-update-title-icon" />
              Thông tin sinh viên
            </h2>
          </div>

          {studentData && (
            <div className="student-update-content">
              {/* Avatar Section */}
              <div className="student-update-avatar-section">
                <div className="student-update-avatar-container">
                  {previewAvatar || studentData?.AnhDaiDien ? (
                    <img
                      src={previewAvatar || studentData!.AnhDaiDien!}
                      alt="Ảnh đại diện"
                      className="student-update-avatar-image"
                    />
                  ) : (
                    <div className="student-update-avatar-placeholder">
                      <User size={48} />
                    </div>
                  )}

                  {editMode && (
                    <label className="student-update-avatar-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="student-update-file-input"
                      />
                      <Upload size={16} />
                      Thay đổi ảnh
                    </label>
                  )}
                </div>

                <div className="student-update-basic-info">
                  <h3 className="student-update-name">{studentData.HoTen}</h3>
                  <p className="student-update-student-id">MSSV: {studentData.MaSV}</p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="student-update-info-grid">
                <div className="student-update-info-item">
                  <label className="student-update-label">
                    <Mail size={16} />
                    Email
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      className="student-update-input"
                      required
                    />
                  ) : (
                    <span className="student-update-value">{studentData.Email}</span>
                  )}
                </div>

                <div className="student-update-info-item">
                  <label className="student-update-label">
                    <Phone size={16} />
                    Số điện thoại
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="SoDienThoai"
                      value={formData.SoDienThoai}
                      onChange={handleInputChange}
                      className="student-update-input"
                      required
                    />
                  ) : (
                    <span className="student-update-value">{studentData.SoDienThoai}</span>
                  )}
                </div>

                <div className="student-update-info-item">
                  <label className="student-update-label">
                    <Calendar size={16} />
                    Ngày sinh
                  </label>
                  <span className="student-update-value">{studentData.NgaySinh || "Chưa có"}</span>
                </div>

                <div className="student-update-info-item">
                  <label className="student-update-label">
                    <User size={16} />
                    Giới tính
                  </label>
                  <span className="student-update-value">{studentData.GioiTinh || "Nữ"}</span>
                </div>

                <div className="student-update-info-item">
                  <label className="student-update-label">
                    <Users size={16} />
                    Lớp
                  </label>
                  <span className="student-update-value">{studentData.TenLop || studentData.MaLop || "Chưa có"}</span>
                </div>

                <div className="student-update-info-item student-update-address-item">
                  <label className="student-update-label">
                    <MapPin size={16} />
                    Địa chỉ
                  </label>
                  {editMode ? (
                    <div className="student-update-address-inputs">
                      <select
                        name="Province"
                        value={formData.Province}
                        onChange={handleInputChange}
                        className="student-update-select"
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>

                      <select
                        name="District"
                        value={formData.District}
                        onChange={handleInputChange}
                        disabled={!formData.Province}
                        className="student-update-select"
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>

                      <select
                        name="Ward"
                        value={formData.Ward}
                        onChange={handleInputChange}
                        disabled={!formData.District}
                        className="student-update-select"
                      >
                        <option value="">Chọn xã/phường</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name="DiaChi"
                        value={formData.DiaChi}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                        className="student-update-input"
                      />
                    </div>
                  ) : (
                    <span className="student-update-value">{studentData.DiaChi || "Chưa có"}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="student-update-actions">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="student-update-btn student-update-btn-primary"
                    >
                      <Save size={16} />
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        setFormData({
                          Email: studentData!.Email,
                          SoDienThoai: studentData!.SoDienThoai,
                          DiaChi: studentData!.DiaChi || "",
                          Province: "",
                          District: "",
                          Ward: "",
                          AnhDaiDien: null,
                        })
                        setPreviewAvatar(studentData!.AnhDaiDien || null)
                      }}
                      className="student-update-btn student-update-btn-secondary"
                    >
                      <X size={16} />
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="student-update-btn student-update-btn-primary"
                    >
                      <Edit3 size={16} />
                      Chỉnh sửa thông tin
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="student-update-btn student-update-btn-secondary"
                    >
                      <X size={16} />
                      Quay lại
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {successMessage && (
        <div className="student-update-toast student-update-toast-success">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="student-update-toast student-update-toast-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
    </div>
  )
}

export default StudentInfoUpdate
