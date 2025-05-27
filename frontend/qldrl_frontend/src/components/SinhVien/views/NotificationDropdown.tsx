import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Bell, X } from "lucide-react"
import axios from "axios"
import { Modal, Select, Input } from "antd"
import "../css/NotificationDropdown.css"

interface ThongBaoDTOSV {
  MaThongBao: number
  MaChiTietThongBao: number
  TieuDe: string
  NoiDung: string
  NgayTao: string
  DaDoc: boolean
  NgayDoc?: string | null
  LoaiThongBao: string
}

interface ToastProps {
  thongBao: ThongBaoDTOSV
  onClose: () => void
  onRead: () => void
  onRespond?: (maChiTietThongBao: number, response: "XacNhan" | "TuChoi", lyDoTuChoi?: string) => void
}

const dinhDangNoiDung = (noiDung: string): string => {
  let noiDungDaDinhDang = noiDung.replace(/\[MaHoatDong:\d+\]$/, "").trim()
  noiDungDaDinhDang = noiDungDaDinhDang.replace(
    /(\d{1,2}[/.]\d{1,2}[/.]\d{2,4})/g,
    '<span class="lam-noi-bat-ngay">$1</span>',
  )
  noiDungDaDinhDang = noiDungDaDinhDang.replace(/(\d{1,2}:\d{2}(:\d{2})?)/g, '<span class="lam-noi-bat-gio">$1</span>')
  noiDungDaDinhDang = noiDungDaDinhDang.replace(
    /\b(Địa điểm|ở)\s+([A-ZÀ-Ỵ][^.,\n]+)/g,
    '$1 <span class="lam-noi-bat-dia-diem">$2</span>',
  )
  const tuQuanTrong = ["bắt đầu", "kết thúc", "quan trọng", "lưu ý", "hạn chót"]
  tuQuanTrong.forEach((tu) => {
    const regex = new RegExp(`\\b${tu}\\b`, "gi")
    noiDungDaDinhDang = noiDungDaDinhDang.replace(regex, `<span class="lam-noi-bat-quan-trong">${tu}</span>`)
  })
  return noiDungDaDinhDang
}

const trichXuatThoiGianSuKien = (noiDung: string): string | null => {
  const khopNgay = noiDung.match(/(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/)
  const khopGio = noiDung.match(/(\d{1,2}:\d{2}(:\d{2})?)/)
  if (khopNgay && khopGio) {
    return `${khopNgay[0]} ${khopGio[0]}`
  } else if (khopNgay) {
    return khopNgay[0]
  } else if (khopGio) {
    return khopGio[0]
  }
  return null
}

const Toast: React.FC<ToastProps> = ({ thongBao, onClose, onRead, onRespond }) => {
  const [hienThiModal, setHienThiModal] = useState(false)
  const [lyDoTuChoi, setLyDoTuChoi] = useState("")
  const [lyDoTuyChinh, setLyDoTuyChinh] = useState("")
  const [hienThiToastPhanHoi, setHienThiToastPhanHoi] = useState<string | null>(null)

  useEffect(() => {
    const boHenGio = setTimeout(() => {
      if (!hienThiModal && !hienThiToastPhanHoi) onClose()
    }, 8000)
    return () => clearTimeout(boHenGio)
  }, [onClose, hienThiModal, hienThiToastPhanHoi])

  const xuLyNhap = () => {
    onRead()
    onClose()
  }

  const layBieuTuong = () => {
    const tieuDe = thongBao.TieuDe.toLowerCase()
    if (thongBao.LoaiThongBao === "Thay đổi lịch trình") return "📅"
    if (thongBao.LoaiThongBao === "Nhắc nhở") return "⏰"
    if (thongBao.LoaiThongBao === "Chỉ định sinh viên") return "🎯"
    if (tieuDe.includes("giới thiệu") || tieuDe.includes("thể thao")) return "🏆"
    if (tieuDe.includes("hội thao") || tieuDe.includes("thi đấu")) return "🎯"
    if (tieuDe.includes("hỗ trợ") || tieuDe.includes("hướng dẫn")) return "🎓"
    if (tieuDe.includes("tổ chức") || tieuDe.includes("chào mừng")) return "🎉"
    return "🔔"
  }

  const xuLyTuChoi = () => {
    setHienThiModal(true)
  }

  const xuLyModalDongY = () => {
    let lyDoCuoiCung = lyDoTuChoi
    if (lyDoTuChoi === "Khác" && !lyDoTuyChinh) {
      setHienThiToastPhanHoi('Vui lòng nhập lý do khi chọn "Khác".')
      return
    }
    if (lyDoTuChoi === "Khác") lyDoCuoiCung = lyDoTuyChinh
    if (!lyDoCuoiCung && lyDoTuChoi !== "Khác") {
      setHienThiToastPhanHoi("Vui lòng chọn lý do từ chối.")
      return
    }
    onRespond?.(thongBao.MaChiTietThongBao, "TuChoi", lyDoCuoiCung)
    setHienThiModal(false)
    setLyDoTuChoi("")
    setLyDoTuyChinh("")
    onClose() // Đóng Toast ngay sau khi từ chối
  }

  const xuLyModalHuy = () => {
    setHienThiModal(false)
    setLyDoTuChoi("")
    setLyDoTuyChinh("")
  }

  const xuLyPhanHoiVoiToast = (phanHoi: "XacNhan" | "TuChoi", lyDoTuChoi?: string) => {
    onRespond?.(thongBao.MaChiTietThongBao, phanHoi, lyDoTuChoi)
    onClose() // Đóng Toast ngay sau khi xác nhận hoặc từ chối
  }

  const noiDungDaDinhDang = dinhDangNoiDung(thongBao.NoiDung)
  const thoiGianSuKien = trichXuatThoiGianSuKien(thongBao.NoiDung)

  return (
    <div
      className="thong-bao-toast"
      onClick={thongBao.LoaiThongBao !== "Chỉ định sinh viên" ? xuLyNhap : undefined}
      data-type={thongBao.LoaiThongBao}
    >
      <div className="bieu-tuong-toast">{layBieuTuong()}</div>
      <div className="noi-dung-toast">
        <h4 className="tieu-de-toast tieu-de-noi-bat">{thongBao.TieuDe}</h4>
        <p className="tin-nhan-toast" dangerouslySetInnerHTML={{ __html: noiDungDaDinhDang }}></p>
        {thoiGianSuKien && (
          <p className="thoi-gian-su-kien-toast">
            <span className="bieu-tuong-thoi-gian-su-kien">📆</span> {thoiGianSuKien}
          </p>
        )}
        <p className="thoi-gian-toast">{new Date(thongBao.NgayTao).toLocaleString("vi-VN")}</p>
        {thongBao.LoaiThongBao === "Chỉ định sinh viên" && !thongBao.DaDoc && (
          <div className="hanh-dong-toast">
            <button
              className="nut-hanh-dong-toast xac-nhan"
              onClick={(e) => {
                e.stopPropagation()
                xuLyPhanHoiVoiToast("XacNhan")
              }}
            >
              Xác Nhận
            </button>
            <button
              className="nut-hanh-dong-toast tu-choi"
              onClick={(e) => {
                e.stopPropagation()
                xuLyTuChoi()
              }}
            >
              Từ Chối
            </button>
          </div>
        )}
      </div>
      <button
        className="dong-toast"
        onClick={(e) => {
          e.stopPropagation()
          if (!hienThiModal && !hienThiToastPhanHoi) onClose()
        }}
        disabled={hienThiModal || !!hienThiToastPhanHoi}
      >
        <X size={16} />
      </button>

      <Modal
        title="Lý do từ chối"
        open={hienThiModal}
        onOk={xuLyModalDongY}
        onCancel={xuLyModalHuy}
        okText="Xác nhận"
        cancelText="Hủy"
        closable={false}
        maskClosable={false}
        {...({} as any)}
      >
        <Select
          style={{ width: "100%", marginBottom: "10px" }}
          placeholder="Chọn lý do từ chối"
          onChange={(value: string) => setLyDoTuChoi(value)}
          value={lyDoTuChoi}
          options={[
            { value: "Lịch cá nhân bận rộn", label: "Lịch cá nhân bận rộn" },
            { value: "Lý do sức khỏe", label: "Lý do sức khỏe" },
            { value: "Không quan tâm", label: "Không quan tâm" },
            { value: "Khác", label: "Khác" },
          ]}
          {...({} as any)}
        />
        {lyDoTuChoi === "Khác" && (
          <Input
            placeholder="Nhập lý do của bạn"
            value={lyDoTuyChinh}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLyDoTuyChinh(e.target.value)}
            style={{ width: "100%" }}
            {...({} as any)}
          />
        )}
      </Modal>

      {hienThiToastPhanHoi && <div className="toast-phan-hoi">{hienThiToastPhanHoi}</div>}
    </div>
  )
}

const ThongBaoDropdown: React.FC = () => {
  const [hienThi, setHienThi] = useState<boolean>(false)
  const [danhSachThongBao, setDanhSachThongBao] = useState<ThongBaoDTOSV[]>([])
  const [soThongBaoChuaDoc, setSoThongBaoChuaDoc] = useState<number>(0)
  const [danhSachToast, setDanhSachToast] = useState<ThongBaoDTOSV[]>([])
  const [daHienThiToast, setDaHienThiToast] = useState<Set<number>>(new Set())
  const [thongBaoPhanHoi, setThongBaoPhanHoi] = useState<string | null>(null)
  const thamChieuDropdown = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem("token") || ""

  const xuLyPhanHoi = async (maChiTietThongBao: number, phanHoi: "XacNhan" | "TuChoi", lyDoTuChoi?: string) => {
    try {
      const duLieuGui = {
        MaChiTietThongBao: maChiTietThongBao,
        Response: phanHoi,
        ...(phanHoi === "TuChoi" && { LyDoTuChoi: lyDoTuChoi }),
      }
      await axios.post(`http://localhost:5163/api/ThongBaoHoatDong/${maChiTietThongBao}/respond`, duLieuGui, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDanhSachThongBao((truocDo) =>
        truocDo.map((tb) =>
          tb.MaChiTietThongBao === maChiTietThongBao ? { ...tb, DaDoc: true, NgayDoc: new Date().toISOString() } : tb,
        ),
      )
      setSoThongBaoChuaDoc((truocDo) => truocDo - 1)
      // Hiển thị thông báo phản hồi trong dropdown
      setThongBaoPhanHoi(
        phanHoi === "XacNhan" ? "Bạn đã xác nhận tham gia hoạt động này" : "Bạn đã từ chối tham gia hoạt động này",
      )
      setTimeout(() => setThongBaoPhanHoi(null), 3000)
    } catch (loi) {
      console.error("Lỗi khi gửi phản hồi:", loi)
      alert("Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.")
    }
  }

  useEffect(() => {
    const layDanhSachThongBao = async () => {
      try {
        const phanHoi = await axios.get("http://localhost:5163/api/ThongBaoHoatDong/ThongBao-Thay-Doi-va-nhac-nho", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const duLieu: ThongBaoDTOSV[] = phanHoi.data

        const maThongBaoDuyNhat = new Set(duLieu.map((tb) => tb.MaThongBao))
        let thongBaoHopLe: ThongBaoDTOSV[] = []
        if (maThongBaoDuyNhat.size !== duLieu.length) {
          console.warn("Phát hiện MaThongBao bị trùng:", duLieu)
          thongBaoHopLe = Array.from(new Map(duLieu.map((tb) => [tb.MaThongBao, tb])).values())
        } else {
          const coMaThongBaoKhongHopLe = duLieu.some((tb) => tb.MaThongBao == null)
          if (coMaThongBaoKhongHopLe) {
            console.warn("Phát hiện MaThongBao không hợp lệ (undefined/null):", duLieu)
            thongBaoHopLe = duLieu.filter((tb) => tb.MaThongBao != null)
          } else {
            thongBaoHopLe = duLieu
          }
        }

        setDanhSachThongBao(thongBaoHopLe)
        setSoThongBaoChuaDoc(thongBaoHopLe.filter((tb) => !tb.DaDoc).length)

        const thongBaoChuaDoc = thongBaoHopLe.filter((tb) => !tb.DaDoc && !daHienThiToast.has(tb.MaThongBao))
        if (thongBaoChuaDoc.length > 0) {
          const toastCanHienThi = thongBaoChuaDoc.slice(0, 3)
          setDanhSachToast(toastCanHienThi)
          setDaHienThiToast((tapTruocDo) => {
            const tapMoi = new Set(tapTruocDo)
            toastCanHienThi.forEach((tb) => tapMoi.add(tb.MaThongBao))
            return tapMoi
          })
        }
      } catch (loi) {
        console.error("Lỗi khi lấy danh sách thông báo:", loi)
      }
    }

    layDanhSachThongBao()
    const khoangThoiGian = setInterval(layDanhSachThongBao, 4000)
    return () => clearInterval(khoangThoiGian)
  }, [token, daHienThiToast])

  useEffect(() => {
    const xuLyNhapChuotNgoai = (suKien: MouseEvent) => {
      if (thamChieuDropdown.current && !thamChieuDropdown.current.contains(suKien.target as Node)) {
        setHienThi(false)
      }
    }
    document.addEventListener("mousedown", xuLyNhapChuotNgoai)
    return () => document.removeEventListener("mousedown", xuLyNhapChuotNgoai)
  }, [])

  const danhDauDaDoc = async (maThongBao: number) => {
    if (!maThongBao) {
      console.error("MaThongBao không hợp lệ hoặc undefined")
      return
    }
    try {
      await axios.put(
        `http://localhost:5163/api/ThongBaoHoatDong/doc/${maThongBao}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setDanhSachThongBao((truocDo) =>
        truocDo.map((tb) =>
          tb.MaThongBao === maThongBao ? { ...tb, DaDoc: true, NgayDoc: new Date().toISOString() } : tb,
        ),
      )
      setSoThongBaoChuaDoc((truocDo) => truocDo - 1)
    } catch (loi) {
      console.error("Lỗi khi đánh dấu đã đọc:", loi)
    }
  }

  const dongToast = (maThongBao: number) => {
    setDanhSachToast((toastTruocDo) => toastTruocDo.filter((toast) => toast.MaThongBao !== maThongBao))
  }

  const layBieuTuongLoaiThongBao = (loaiThongBao: string) => {
    switch (loaiThongBao) {
      case "Thay đổi lịch trình":
        return <span className="lich-trinh">📅</span>
      case "Nhắc nhở":
        return <span className="nhac-nho">⏰</span>
      case "Chỉ định sinh viên":
        return <span className="chi-dinh">🎯</span>
      default:
        return <span className="tong-quat">🔔</span>
    }
  }

  return (
    <>
      <div className="container-bieu-tuong-thong-bao" ref={thamChieuDropdown}>
        <div className="bieu-tuong-thong-bao" onClick={() => setHienThi(!hienThi)}>
          <Bell size={20} />
          {soThongBaoChuaDoc > 0 && <span className="huy-hieu-thong-bao">{soThongBaoChuaDoc}</span>}
        </div>

        {hienThi && (
          <div className="dropdown-thong-bao">
            <div className="header-dropdown-thong-bao">
              <h3>Thông báo</h3>
            </div>
            {danhSachThongBao.length === 0 ? (
              <div className="thong-bao-trong">Không có thông báo nào</div>
            ) : (
              <ul className="danh-sach-thong-bao">
                {danhSachThongBao.map((tb, chiSo) => {
                  const noiDungDaXuLy = dinhDangNoiDung(tb.NoiDung)
                  return (
                    <li
                      key={tb.MaThongBao ?? `thongbao-${chiSo}`}
                      className={`muc-thong-bao ${tb.DaDoc ? "da-doc" : ""}`}
                      onClick={() =>
                        !tb.DaDoc &&
                        tb.MaThongBao &&
                        tb.LoaiThongBao !== "Chỉ định sinh viên" &&
                        danhDauDaDoc(tb.MaThongBao)
                      }
                    >
                      <div className="noi-dung-thong-bao">
                        <div className="bieu-tuong-loai-thong-bao">{layBieuTuongLoaiThongBao(tb.LoaiThongBao)}</div>
                        <div className="chi-tiet-thong-bao">
                          <h4 className={`tieu-de-noi-bat ${tb.DaDoc ? "da-doc" : ""}`}>{tb.TieuDe}</h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: noiDungDaXuLy,
                            }}
                          ></div>
                          <p className="ngay-thang">{new Date(tb.NgayTao).toLocaleString("vi-VN")}</p>
                          {tb.LoaiThongBao === "Chỉ định sinh viên" && !tb.DaDoc && (
                            <div className="hanh-dong-thong-bao">
                              <button
                                className="nut-hanh-dong xac-nhan"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  tb.MaChiTietThongBao && xuLyPhanHoi(tb.MaChiTietThongBao, "XacNhan")
                                }}
                              >
                                Xác Nhận
                              </button>
                              <button
                                className="nut-hanh-dong tu-choi"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  tb.MaChiTietThongBao && xuLyPhanHoi(tb.MaChiTietThongBao, "TuChoi")
                                }}
                              >
                                Từ Chối
                              </button>
                            </div>
                          )}
                        </div>
                        {!tb.DaDoc && <span className="cham-chua-doc-thong-bao"></span>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {thongBaoPhanHoi && <div className="toast-phan-hoi">{thongBaoPhanHoi}</div>}
          </div>
        )}
      </div>

      {danhSachToast.length > 0 && (
        <div className="container-toast">
          {danhSachToast.map((tb) => (
            <Toast
              key={tb.MaThongBao}
              thongBao={tb}
              onClose={() => dongToast(tb.MaThongBao)}
              onRead={() => danhDauDaDoc(tb.MaThongBao)}
              onRespond={xuLyPhanHoi}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default ThongBaoDropdown