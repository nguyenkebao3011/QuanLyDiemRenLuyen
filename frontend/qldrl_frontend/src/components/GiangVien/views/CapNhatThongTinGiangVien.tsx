
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
  GraduationCap,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  BadgeIcon as IdCard,
} from "lucide-react"
import "../css/CapNhatThongTinGiangVien.css"
interface Lecturer {
  MaGV: string
  HoTen: string
  Email: string
  SoDienThoai: string
  DiaChi: string
  NgaySinh: string
  GioiTinh: string
  AnhDaiDien: string | null
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

const LecturerInfoUpdate: React.FC = () => {
  const [lecturerData, setLecturerData] = useState<Lecturer | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    SoDienThoai: "",
    DiaChi: "",
    Province: "",
    District: "",
    Ward: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
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
          setFormData((prev) => ({ ...prev, District: "", Ward: "" }))
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
          setFormData((prev) => ({ ...prev, Ward: "" }))
        } catch (err) {
          setError("Không thể tải danh sách xã/phường")
        }
      }
      fetchWards()
    }
  }, [formData.District])

  // Parse address into components
  const parseAddress = (address: string) => {
    if (!address) return { street: "", ward: "", district: "", province: "" }

    const parts = address.split(",").map((part) => part.trim())
    const street = parts[0] || ""
    const ward = parts[1] || ""
    const district = parts[2] || ""
    const province = parts[3] || ""

    return { street, ward, district, province }
  }

  // Fetch lecturer data
  const fetchLecturerData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Vui lòng đăng nhập lại")
        navigate("/login")
        return
      }

      const response = await axios.get<{ data: Lecturer }>(`${BASE_URL}/api/GiaoViens/lay-giangvien-theo-vai-tro`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const lecturer = response.data.data

      if (!lecturer || !lecturer.MaGV) {
        throw new Error("Dữ liệu giảng viên không hợp lệ hoặc trống")
      }

      setLecturerData(lecturer)

      // Parse address from lecturer data
      const { street, ward, district, province } = parseAddress(lecturer.DiaChi || "")

      // Find corresponding codes for Province, District, Ward
      let provinceCode = ""
      let districtCode = ""
      let wardCode = ""

      const provinceMatch = provinces.find((p) => p.name === province)
      if (provinceMatch) {
        provinceCode = provinceMatch.code.toString()
        const districtResponse = await axios.get(`${PROVINCE_API}p/${provinceCode}?depth=2`)
        setDistricts(districtResponse.data.districts || [])

        const districtMatch = districtResponse.data.districts.find((d: District) => d.name === district)
        if (districtMatch) {
          districtCode = districtMatch.code.toString()
          const wardResponse = await axios.get(`${PROVINCE_API}d/${districtCode}?depth=2`)
          setWards(wardResponse.data.wards || [])

          const wardMatch = wardResponse.data.wards.find((w: Ward) => w.name === ward)
          if (wardMatch) {
            wardCode = wardMatch.code.toString()
          }
        }
      }

      setFormData({
        SoDienThoai: lecturer.SoDienThoai || "",
        DiaChi: street,
        Province: provinceCode,
        District: districtCode,
        Ward: wardCode,
      })

      if (lecturer.AnhDaiDien) {
        setPreviewAvatar(`${BASE_URL}${lecturer.AnhDaiDien}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải thông tin giảng viên. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  // Call fetchLecturerData after provinces are loaded
  useEffect(() => {
    if (provinces.length > 0) {
      fetchLecturerData()
    }
  }, [provinces, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAvatarFile(file)
      setPreviewAvatar(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lecturerData) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vui lòng đăng nhập lại")
        navigate("/login")
        return
      }

      // Build full address from selected components
      const fullAddress = `${formData.DiaChi ? formData.DiaChi + ", " : ""}${
        formData.Ward ? wards.find((w) => w.code.toString() === formData.Ward)?.name + ", " : ""
      }${formData.District ? districts.find((d) => d.code.toString() === formData.District)?.name + ", " : ""}${
        formData.Province ? provinces.find((p) => p.code.toString() === formData.Province)?.name : ""
      }`.trim()

      // Validate phone number
      if (formData.SoDienThoai && formData.SoDienThoai.length !== 10) {
        setError("Số điện thoại phải có đúng 10 chữ số")
        setLoading(false)
        return
      }

      if (!fullAddress) {
        setError("Địa chỉ không được để trống")
        setLoading(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append("SoDienThoai", formData.SoDienThoai)
      formDataToSend.append("DiaChi", fullAddress)

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile)
      }

      const response = await axios.put(`${BASE_URL}/api/GiaoViens/cap-nhat-thong-tin`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      })

      if (response.status === 200) {
        setSuccessMessage("Cập nhật thông tin thành công!")
        setEditMode(false)
        setAvatarFile(null)
        await fetchLecturerData()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Cập nhật thông tin thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="lecturer-update-loading">
        <div className="lecturer-update-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    )
  }

  if (error && !lecturerData) {
    return (
      <div className="lecturer-update-error">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={() => navigate("/login")} className="lecturer-update-btn lecturer-update-btn-primary">
          Đăng nhập lại
        </button>
      </div>
    )
  }

  return (
    <div className="lecturer-update-wrapper">
      <div className="lecturer-update-header">
        <img
          className="lecturer-update-logo"
          src="https://sinhvien.huit.edu.vn/Content/AConfig/images/sv_header_login.png"
          alt="Logo trường"
        />
      </div>

      <div className="lecturer-update-container">
        <div className="lecturer-update-card">
          <div className="lecturer-update-card-header">
            <h2 className="lecturer-update-title">
              <GraduationCap className="lecturer-update-title-icon" />
              Thông tin giảng viên
            </h2>
          </div>

          {lecturerData && (
            <div className="lecturer-update-content">
              {/* Avatar Section */}
              <div className="lecturer-update-avatar-section">
                <div className="lecturer-update-avatar-container">
                  {previewAvatar ? (
                    <img
                      src={previewAvatar || "/placeholder.svg"}
                      alt="Ảnh đại diện"
                      className="lecturer-update-avatar-image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                  ) : (
                    <div className="lecturer-update-avatar-placeholder">
                      <GraduationCap size={48} />
                    </div>
                  )}

                  {editMode && (
                    <label className="lecturer-update-avatar-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="lecturer-update-file-input"
                      />
                      <Upload size={16} />
                      Thay đổi ảnh
                    </label>
                  )}
                </div>

                <div className="lecturer-update-basic-info">
                  <h3 className="lecturer-update-name">{lecturerData.HoTen}</h3>
                  <p className="lecturer-update-lecturer-id">Mã GV: {lecturerData.MaGV}</p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="lecturer-update-info-grid">
                <div className="lecturer-update-info-item">
                  <label className="lecturer-update-label">
                    <IdCard size={16} />
                    Mã giảng viên
                  </label>
                  <span className="lecturer-update-value">{lecturerData.MaGV}</span>
                </div>

                <div className="lecturer-update-info-item">
                  <label className="lecturer-update-label">
                    <User size={16} />
                    Họ tên
                  </label>
                  <span className="lecturer-update-value">{lecturerData.HoTen}</span>
                </div>

                <div className="lecturer-update-info-item">
                  <label className="lecturer-update-label">
                    <Mail size={16} />
                    Email
                  </label>
                  <span className="lecturer-update-value">{lecturerData.Email}</span>
                </div>

                <div className="lecturer-update-info-item">
                  <label className="lecturer-update-label">
                    <Phone size={16} />
                    Số điện thoại
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="SoDienThoai"
                      value={formData.SoDienThoai}
                      onChange={handleInputChange}
                      className="lecturer-update-input"
                      pattern="[0-9]{10}"
                      title="Số điện thoại phải có đúng 10 chữ số"
                      maxLength={10}
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <span className="lecturer-update-value">{lecturerData.SoDienThoai || "Chưa có"}</span>
                  )}
                </div>

                <div className="lecturer-update-info-item">
                  <label className="lecturer-update-label">
                    <Calendar size={16} />
                    Ngày sinh
                  </label>
                  <span className="lecturer-update-value">{lecturerData.NgaySinh || "Chưa có"}</span>
                </div>

                <div className="lecturer-update-info-item">
                  <label className="lecturer-update-label">
                    <User size={16} />
                    Giới tính
                  </label>
                  <span className="lecturer-update-value">{lecturerData.GioiTinh || "Chưa có"}</span>
                </div>

                <div className="lecturer-update-info-item lecturer-update-address-item">
                  <label className="lecturer-update-label">
                    <MapPin size={16} />
                    Địa chỉ
                  </label>
                  {editMode ? (
                    <div className="lecturer-update-address-inputs">
                      <input
                        type="text"
                        name="DiaChi"
                        value={formData.DiaChi}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                        className="lecturer-update-input"
                        required
                      />

                      <select
                        name="Province"
                        value={formData.Province}
                        onChange={handleInputChange}
                        className="lecturer-update-select"
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
                        className="lecturer-update-select"
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
                        className="lecturer-update-select"
                      >
                        <option value="">Chọn xã/phường</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="lecturer-update-value">{lecturerData.DiaChi || "Chưa có"}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lecturer-update-actions">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="lecturer-update-btn lecturer-update-btn-primary"
                    >
                      <Save size={16} />
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        setAvatarFile(null)
                        setPreviewAvatar(lecturerData.AnhDaiDien ? `${BASE_URL}${lecturerData.AnhDaiDien}` : null)
                        setFormData({
                          SoDienThoai: lecturerData.SoDienThoai || "",
                          DiaChi: lecturerData.DiaChi || "",
                          Province: "",
                          District: "",
                          Ward: "",
                        })
                      }}
                      className="lecturer-update-btn lecturer-update-btn-secondary"
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
                      className="lecturer-update-btn lecturer-update-btn-primary"
                    >
                      <Edit3 size={16} />
                      Chỉnh sửa thông tin
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="lecturer-update-btn lecturer-update-btn-secondary"
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
        <div className="lecturer-update-toast lecturer-update-toast-success">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="lecturer-update-toast lecturer-update-toast-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
    </div>
  )
}

export default LecturerInfoUpdate
