import React, { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import axios from "axios";
import { Modal, Select, Input } from "antd";
import "../css/NotificationDropdown.css";

const { Option } = Select;

interface ThongBaoDTOSV {
  MaThongBao: number;
  MaChiTietThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  DaDoc: boolean;
  NgayDoc?: string | null;
  LoaiThongBao: string;
}

interface ToastProps {
  thongBao: ThongBaoDTOSV;
  onClose: () => void;
  onRead: () => void;
  onRespond?: (
    maChiTietThongBao: number,
    response: "XacNhan" | "TuChoi",
    lyDoTuChoi?: string
  ) => void;
}

const formatNoiDung = (noiDung: string): string => {
  let formattedContent = noiDung.replace(/\[MaHoatDong:\d+\]$/, "").trim();
  formattedContent = formattedContent.replace(
    /(\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4})/g,
    '<span class="highlight-date">$1</span>'
  );
  formattedContent = formattedContent.replace(
    /(\d{1,2}:\d{2}(:\d{2})?)/g,
    '<span class="highlight-time">$1</span>'
  );
  formattedContent = formattedContent.replace(
    /\b(Địa điểm|ở)\s+([A-ZÀ-Ỵ][^\.,\n]+)/g,
    '$1 <span class="highlight-location">$2</span>'
  );
  const importantWords = [
    "bắt đầu",
    "kết thúc",
    "quan trọng",
    "lưu ý",
    "hạn chót",
  ];
  importantWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    formattedContent = formattedContent.replace(
      regex,
      `<span class="highlight-important">${word}</span>`
    );
  });
  return formattedContent;
};

const extractEventTime = (noiDung: string): string | null => {
  const dateMatch = noiDung.match(/(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/);
  const timeMatch = noiDung.match(/(\d{1,2}:\d{2}(:\d{2})?)/);
  if (dateMatch && timeMatch) {
    return `${dateMatch[0]} ${timeMatch[0]}`;
  } else if (dateMatch) {
    return dateMatch[0];
  } else if (timeMatch) {
    return timeMatch[0];
  }
  return null;
};

const Toast: React.FC<ToastProps> = ({
  thongBao,
  onClose,
  onRead,
  onRespond,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lyDoTuChoi, setLyDoTuChoi] = useState<string>("");
  const [customLyDo, setCustomLyDo] = useState<string>(""); // Lý do tùy chỉnh khi chọn "Khác"
  const [showResponseToast, setShowResponseToast] = useState<string | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isModalVisible && !showResponseToast) onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose, isModalVisible, showResponseToast]);

  const handleClick = () => {
    onRead();
    onClose();
  };

  const getEmoji = () => {
    const title = thongBao.TieuDe.toLowerCase();
    if (thongBao.LoaiThongBao === "Thay đổi lịch trình") {
      return "📅";
    } else if (thongBao.LoaiThongBao === "Nhắc nhở") {
      return "⏰";
    } else if (thongBao.LoaiThongBao === "Chỉ định sinh viên") {
      return "🎯";
    } else if (title.includes("Giới thiệu") || title.includes("thể thao")) {
      return "🏆";
    } else if (title.includes("hội thao") || title.includes("thi đấu")) {
      return "🎯";
    } else if (title.includes("hỗ trợ") || title.includes("hướng dẫn")) {
      return "🎓";
    } else if (title.includes("tổ chức") || title.includes("chào mừng")) {
      return "🎉";
    }
    return "🔔";
  };

  const handleTuChoi = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    let finalLyDo = lyDoTuChoi;
    if (lyDoTuChoi === "Khác" && !customLyDo) {
      alert('Vui lòng nhập lý do khi chọn "Khác".');
      return;
    }
    if (lyDoTuChoi === "Khác") finalLyDo = customLyDo;
    if (!finalLyDo && lyDoTuChoi !== "Khác") {
      alert("Vui lòng chọn lý do từ chối.");
      return;
    }
    onRespond?.(thongBao.MaChiTietThongBao, "TuChoi", finalLyDo);
    setShowResponseToast("Bạn đã từ chối tham gia hoạt động này");
    setIsModalVisible(false);
    setLyDoTuChoi("");
    setCustomLyDo("");
    setTimeout(() => setShowResponseToast(null), 3000); // Ẩn toast sau 3 giây
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setLyDoTuChoi("");
    setCustomLyDo("");
  };

  const handleRespondWithToast = (
    response: "XacNhan" | "TuChoi",
    lyDoTuChoi?: string
  ) => {
    onRespond?.(thongBao.MaChiTietThongBao, response, lyDoTuChoi);
    setShowResponseToast(
      response === "XacNhan"
        ? "Bạn đã đăng ký tham gia hoạt động này"
        : "Bạn đã từ chối tham gia hoạt động này"
    );
    setTimeout(() => setShowResponseToast(null), 3000); // Ẩn toast sau 3 giây
  };

  const formattedContent = formatNoiDung(thongBao.NoiDung);
  const eventTime = extractEventTime(thongBao.NoiDung);

  return (
    <div
      className="toast-notification"
      onClick={
        thongBao.LoaiThongBao !== "Chỉ định sinh viên" ? handleClick : undefined
      }
      data-type={thongBao.LoaiThongBao}
    >
      <div className="toast-icon">{getEmoji()}</div>
      <div className="toast-content">
        <h4 className="toast-title title-prominent">{thongBao.TieuDe}</h4>
        <p
          className="toast-message"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        ></p>
        {eventTime && (
          <p className="toast-event-time">
            <span className="event-time-icon">📆</span> {eventTime}
          </p>
        )}
        <p className="toast-time">
          {new Date(thongBao.NgayTao).toLocaleString("vi-VN")}
        </p>
        {thongBao.LoaiThongBao === "Chỉ định sinh viên" && !thongBao.DaDoc && (
          <div className="toast-actions">
            <button
              className="toast-action-button confirm2"
              onClick={(e) => {
                e.stopPropagation();
                handleRespondWithToast("XacNhan");
              }}
            >
              Xác Nhận
            </button>
            <button
              className="toast-action-button reject2"
              onClick={(e) => {
                e.stopPropagation();
                handleTuChoi();
              }}
            >
              Từ Chối
            </button>
          </div>
        )}
      </div>
      <button
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          if (!isModalVisible && !showResponseToast) onClose();
        }}
        disabled={isModalVisible || !!showResponseToast} // Không cho đóng khi modal/toast hiển thị
      >
        <X size={16} />
      </button>

      <Modal
        title="Lý do từ chối"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        closable={false}
        maskClosable={false}
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
        />
        {lyDoTuChoi === "Khác" && (
          <Input
            placeholder="Nhập lý do của bạn"
            value={customLyDo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCustomLyDo(e.target.value)
            }
            style={{ width: "100%" }}
          />
        )}
      </Modal>

      {showResponseToast && (
        <div className="response-toast">{showResponseToast}</div>
      )}
    </div>
  );
};

const ThongBaoDropdown: React.FC = () => {
  const [hienThi, setHienThi] = useState<boolean>(false);
  const [danhSachThongBao, setDanhSachThongBao] = useState<ThongBaoDTOSV[]>([]);
  const [soThongBaoChuaDoc, setSoThongBaoChuaDoc] = useState<number>(0);
  const [danhSachToast, setDanhSachToast] = useState<ThongBaoDTOSV[]>([]);
  const [daHienThiToast, setDaHienThiToast] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token") || "";

  const handleRespond = async (
    maChiTietThongBao: number,
    response: "XacNhan" | "TuChoi",
    lyDoTuChoi?: string
  ) => {
    try {
      const payload = {
        MaChiTietThongBao: maChiTietThongBao,
        Response: response,
        ...(response === "TuChoi" && { LyDoTuChoi: lyDoTuChoi }),
      };
      await axios.post(
        `http://localhost:5163/api/ThongBaoHoatDong/${maChiTietThongBao}/respond`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDanhSachThongBao((prev) =>
        prev.map((tb) =>
          tb.MaChiTietThongBao === maChiTietThongBao
            ? { ...tb, DaDoc: true, NgayDoc: new Date().toISOString() }
            : tb
        )
      );
      setSoThongBaoChuaDoc((prev) => prev - 1);
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
      alert("Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    const layDanhSachThongBao = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5163/api/ThongBaoHoatDong/ThongBao-Thay-Doi-va-nhac-nho",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const duLieu: ThongBaoDTOSV[] = response.data;
        console.log("Danh sách thông báo:", duLieu);

        const maThongBaoDuyNhat = new Set(duLieu.map((tb) => tb.MaThongBao));
        let thongBaoHopLe: ThongBaoDTOSV[] = [];
        if (maThongBaoDuyNhat.size !== duLieu.length) {
          console.warn("Phát hiện MaThongBao bị trùng:", duLieu);
          thongBaoHopLe = Array.from(
            new Map(duLieu.map((tb) => [tb.MaThongBao, tb])).values()
          );
        } else {
          const coMaThongBaoKhongHopLe = duLieu.some(
            (tb) => tb.MaThongBao == null
          );
          if (coMaThongBaoKhongHopLe) {
            console.warn(
              "Phát hiện MaThongBao không hợp lệ (undefined/null):",
              duLieu
            );
            thongBaoHopLe = duLieu.filter((tb) => tb.MaThongBao != null);
          } else {
            thongBaoHopLe = duLieu;
          }
        }

        setDanhSachThongBao(thongBaoHopLe);
        setSoThongBaoChuaDoc(thongBaoHopLe.filter((tb) => !tb.DaDoc).length);

        const thongBaoChuaDoc = thongBaoHopLe.filter(
          (tb) => !tb.DaDoc && !daHienThiToast.has(tb.MaThongBao)
        );
        if (thongBaoChuaDoc.length > 0) {
          const toastsToShow = thongBaoChuaDoc.slice(0, 3);
          setDanhSachToast(toastsToShow);
          setDaHienThiToast((prevSet) => {
            const newSet = new Set(prevSet);
            toastsToShow.forEach((tb) => newSet.add(tb.MaThongBao));
            return newSet;
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thông báo:", error);
      }
    };

    layDanhSachThongBao();
    const interval = setInterval(layDanhSachThongBao, 30000);
    return () => clearInterval(interval);
  }, [token, daHienThiToast]);

  useEffect(() => {
    const xuLyNhapChuotNgoai = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setHienThi(false);
      }
    };
    document.addEventListener("mousedown", xuLyNhapChuotNgoai);
    return () => document.removeEventListener("mousedown", xuLyNhapChuotNgoai);
  }, []);

  const danhDauDaDoc = async (maThongBao: number) => {
    if (!maThongBao) {
      console.error("MaThongBao không hợp lệ hoặc undefined");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5163/api/ThongBaoHoatDong/doc/${maThongBao}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDanhSachThongBao((truocDo) =>
        truocDo.map((tb) =>
          tb.MaThongBao === maThongBao
            ? { ...tb, DaDoc: true, NgayDoc: new Date().toISOString() }
            : tb
        )
      );
      setSoThongBaoChuaDoc((truocDo) => truocDo - 1);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Lỗi khi đánh dấu đã đọc:",
          error.message,
          error.response?.data
        );
      } else {
        console.error("Lỗi không xác định:", error);
      }
    }
  };

  const dongToast = (maThongBao: number) => {
    setDanhSachToast((prevToasts) =>
      prevToasts.filter((toast) => toast.MaThongBao !== maThongBao)
    );
  };

  return (
    <>
      <div className="notification-icon-container" ref={dropdownRef}>
        <div className="notification-icon" onClick={() => setHienThi(!hienThi)}>
          <Bell size={20} />
          {soThongBaoChuaDoc > 0 && (
            <span className="notification-badge2">{soThongBaoChuaDoc}</span>
          )}
        </div>

        {hienThi && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <h3>Thông báo</h3>
            </div>
            {danhSachThongBao.length === 0 ? (
              <div className="notification-empty">Không có thông báo nào</div>
            ) : (
              <ul className="notification-list2">
                {danhSachThongBao.map((tb, index) => {
                  const processedContent = formatNoiDung(tb.NoiDung);
                  return (
                    <li
                      key={tb.MaThongBao ?? `thongbao-${index}`}
                      className={`notification-item ${tb.DaDoc ? "read" : ""}`}
                      onClick={() =>
                        !tb.DaDoc &&
                        tb.MaThongBao &&
                        tb.LoaiThongBao !== "Chỉ định sinh viên" &&
                        danhDauDaDoc(tb.MaThongBao)
                      }
                    >
                      <div className="notification-content">
                        <div className="notification-icon-type">
                          {tb.LoaiThongBao === "Thay đổi lịch trình" ? (
                            <span className="schedule">📅</span>
                          ) : tb.LoaiThongBao === "Nhắc nhở" ? (
                            <span className="reminder">⏰</span>
                          ) : tb.LoaiThongBao === "Chỉ định sinh viên" ? (
                            <span className="assignment">🎯</span>
                          ) : (
                            <span className="general">🔔</span>
                          )}
                        </div>
                        <div className="notification-details">
                          <h4
                            className={`title-prominent ${
                              tb.DaDoc ? "read" : ""
                            }`}
                          >
                            {tb.TieuDe}
                          </h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: processedContent,
                            }}
                          ></div>
                          <p className="date">
                            {new Date(tb.NgayTao).toLocaleString("vi-VN")}
                          </p>
                          {tb.LoaiThongBao === "Chỉ định sinh viên" &&
                            !tb.DaDoc && (
                              <div className="notification-actions">
                                <button
                                  className="action-button confirm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    tb.MaChiTietThongBao &&
                                      handleRespond(
                                        tb.MaChiTietThongBao,
                                        "XacNhan"
                                      );
                                  }}
                                >
                                  Xác Nhận
                                </button>
                                <button
                                  className="action-button reject"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    tb.MaChiTietThongBao &&
                                      handleRespond(
                                        tb.MaChiTietThongBao,
                                        "TuChoi"
                                      );
                                  }}
                                >
                                  Từ Chối
                                </button>
                              </div>
                            )}
                        </div>
                        {!tb.DaDoc && (
                          <span className="notification-unread-dot"></span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {danhSachToast.length > 0 && (
        <div className="toast-container">
          {danhSachToast.map((tb) => (
            <Toast
              key={tb.MaThongBao}
              thongBao={tb}
              onClose={() => dongToast(tb.MaThongBao)}
              onRead={() => danhDauDaDoc(tb.MaThongBao)}
              onRespond={handleRespond}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ThongBaoDropdown;
