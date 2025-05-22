import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


// Định nghĩa các kiểu TypeScript
interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ThongBao {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  NgayTao: string;
  TrangThai: string;
}

interface StudentInfo {
  MaSV: string;
  HoTen: string;
  TenLop: string;
  Email: string;
  SoDienThoai: string;
  DiaChi: string;
  NgaySinh: string;
  GioiTinh: string;
}

interface HoatDong {
  MaHoatDong: number;
  TenHoatDong: string;
  NgayBatDau: string;
  DiaDiem: string;
  TrangThai: string;
}

interface ChatbotProps {
  onOpenForgotPassword?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onOpenForgotPassword }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [hoatDongList, setHoatDongList] = useState<HoatDong[]>([]);
  const [waitingForActivitySelection, setWaitingForActivitySelection] = useState(false);
  const [waitingForActivityConfirmation, setWaitingForActivityConfirmation] = useState<number | null>(null);
  const [maSV, setMaSV] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Lấy maSV từ token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const mssv = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        setMaSV(mssv || null);
        console.log("Extracted maSV from token:", mssv);
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        setMaSV(null);
        setChatMessages((prev) => [
          ...prev,
          {
            text: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
            isUser: false,
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } else {
      console.warn("Không tìm thấy token trong localStorage.");
      setMaSV(null);
    }
  }, []);

  // Lấy thông tin sinh viên khi có maSV
  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (maSV) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.warn("Không tìm thấy token trong localStorage.");
            setChatMessages((prev) => [
              ...prev,
              {
                text: "Vui lòng đăng nhập để sử dụng các tính năng cá nhân.",
                isUser: false,
                timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
            setStudentInfo(null);
            return;
          }
          const response = await axios.get(`http://localhost:5163/api/SinhVien/lay-sinhvien-theo-vai-tro/`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          setStudentInfo(response.data);
        } catch (error: any) {
          console.error("Lỗi khi lấy thông tin sinh viên:", error);
          let errorMessage = "Có lỗi khi lấy thông tin cá nhân. Vui lòng thử lại sau.";
          if (error.response?.status === 401) {
            errorMessage = "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
          } else if (error.response?.status === 404) {
            errorMessage = "Không tìm thấy thông tin sinh viên. Vui lòng kiểm tra lại MSSV hoặc liên hệ quản trị viên.";
          }
          setChatMessages((prev) => [
            ...prev,
            {
              text: errorMessage,
              isUser: false,
              timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          setStudentInfo(null);
        }
      } else {
        setStudentInfo(null);
      }
    };

    fetchStudentInfo();
  }, [maSV]);

  // Khởi tạo lời chào ban đầu
  useEffect(() => {
    const initialMessage: ChatMessage = {
      text: studentInfo?.HoTen
        ? `Xin chào ${studentInfo.HoTen}! Tôi là trợ lý ảo HUIT. Tôi có thể giúp gì cho bạn? (Bạn có thể xem thông tin cá nhân, chỉnh sửa thông tin, phản hồi điểm rèn luyện, đăng ký hoạt động, xem điểm, xem thông báo, hoặc nếu quên mật khẩu, tôi cũng có thể giúp.)`
        : `Xin chào! Tôi là trợ lý ảo HUIT. Tôi có thể giúp gì cho bạn? (Bạn có thể xem thông báo, thời tiết, hoặc nếu quên mật khẩu, tôi cũng có thể giúp. Đăng nhập để sử dụng thêm các tính năng như xem thông tin cá nhân, chỉnh sửa thông tin, phản hồi điểm, đăng ký hoạt động, hoặc xem điểm.)`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages([initialMessage]);
  }, [studentInfo]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Focus vào input khi mở chatbot
  useEffect(() => {
    if (isChatOpen && inputRef.current && !isMinimized) {
      inputRef.current.focus();
    }
  }, [isChatOpen, isMinimized]);

  // Cập nhật class cho container
  useEffect(() => {
    const chatContainer = document.querySelector(".chat-container");
    if (isChatOpen && chatContainer) {
      chatContainer.classList.add("chat-container-active");
    } else if (chatContainer) {
      chatContainer.classList.remove("chat-container-active");
    }
  }, [isChatOpen]);

  // Lấy danh sách hoạt động
  const fetchHoatDong = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập để sử dụng tính năng này.");
      const response = await axios.get("http://localhost:5163/api/DiemDanh/DanhSachHoatDong", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setHoatDongList(response.data);
      let responseText = "Các hoạt động đang mở đăng ký:\n\n";
      const activeHoatDong = response.data.filter((hd: HoatDong) => hd.TrangThai === "Đang diễn ra");
      if (activeHoatDong.length === 0) {
        return "Hiện không có hoạt động nào đang mở đăng ký.";
      }
      activeHoatDong.forEach((hd: HoatDong, index: number) => {
        responseText += `${index + 1}. ${hd.TenHoatDong} - ${new Date(hd.NgayBatDau).toLocaleDateString("vi-VN")} - ${hd.DiaDiem}\n`;
      });
      responseText += "\nNhập số thứ tự để đăng ký.";
      setWaitingForActivitySelection(true);
      return responseText;
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách hoạt động:", error);
      return error.response?.status === 401
        ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
        : "Có lỗi khi lấy danh sách hoạt động.";
    }
  };

  // Đăng ký hoạt động
  const handleDangKyHoatDong = async (index: number) => {
    const activeHoatDong = hoatDongList.filter((hd) => hd.TrangThai === "Đang diễn ra"|| hd.TrangThai == "Đang mở đăng ký");
    if (index < 1 || index > activeHoatDong.length) {
      return "Số thứ tự không hợp lệ. Vui lòng chọn lại.";
    }
    const selectedHoatDong = activeHoatDong[index - 1];
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập để sử dụng tính năng này.");
      await axios.post(
        "http://localhost:5163/api/DangKyHoatDongs/dang-ky",
        { MaHoatDong: selectedHoatDong.MaHoatDong },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return `Đăng ký thành công: ${selectedHoatDong.TenHoatDong}.`;
    } catch (error: any) {
      console.error("Lỗi khi đăng ký hoạt động:", error);
      return error.response?.status === 401
        ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
        : "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.";
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const currentTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMessage: ChatMessage = { text: chatInput, isUser: true, timestamp: currentTime };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    let responseText = "Tôi chưa hiểu yêu cầu của bạn. Hãy thử: 'xem thông tin', 'chỉnh sửa thông tin', 'phản hồi điểm', 'đăng ký hoạt động', 'xem điểm', 'xem thông báo', 'thời tiết [địa điểm]', hoặc 'quên mật khẩu'.";

    if (waitingForActivityConfirmation !== null) {
      const confirmMatch = chatInput.match(/(có|đồng ý|ok|yes)/i);
      if (confirmMatch) {
        responseText = await handleDangKyHoatDong(waitingForActivityConfirmation);
        setWaitingForActivityConfirmation(null);
        setWaitingForActivitySelection(false);
      } else {
        responseText = "Hủy đăng ký. Bạn có muốn xem danh sách hoạt động khác không? Hãy nhập 'đăng ký hoạt động'.";
        setWaitingForActivityConfirmation(null);
        setWaitingForActivitySelection(false);
      }
    } else if (waitingForActivitySelection) {
      const index = parseInt(chatInput.trim(), 10);
      if (!isNaN(index)) {
        const activeHoatDong = hoatDongList.filter((hd) => hd.TrangThai === "Đang diễn ra");
        if (index < 1 || index > activeHoatDong.length) {
          responseText = "Số thứ tự không hợp lệ. Vui lòng chọn lại.";
        } else {
          const selectedHoatDong = activeHoatDong[index - 1];
          responseText = `Bạn có chắc muốn đăng ký "${selectedHoatDong.TenHoatDong}"? Nhập "có" để xác nhận hoặc bất kỳ để hủy.`;
          setWaitingForActivityConfirmation(index);
        }
      } else {
        responseText = "Vui lòng nhập số thứ tự hợp lệ.";
      }
    } else {
      const thongTinMatch = chatInput.match(/(xem thông tin|thông tin cá nhân|profile|thông tin của tôi)/i);
      const chinhSuaMatch = chatInput.match(/(chỉnh sửa thông tin|cập nhật thông tin|sửa thông tin)/i);
      const phanHoiMatch = chatInput.match(/(phản hồi |khiếu nại điểm rèn luyện|phản hồi điểm rèn luyện)/i);
      const dangKyMatch = chatInput.match(/(đăng ký hoạt động|tham gia sự kiện| tham gia)/i);
      const diemMatch = chatInput.match(/(xem điểm\s*(?:DRL\s*)?(?:của\s*)?(?:MSSV\s*)?|điểm\s*(?:rèn luyện|DRL)\s*(?:kỳ này\s*)?(?:của\s*)?(?:tôi|MSSV\s*)?|tôi được bao nhiêu điểm|MSSV\s*(\w+)\s*điểm\s*(?:luyện|rèn luyện)\s*bao nhiêu)(\w+)?/i);
      const hocKyMatch = chatInput.match(/học kỳ\s*(\d+)/i);
      const mssvMatch = chatInput.match(/DHTH\d+/i);
      const hoatDongMatch = chatInput.toLowerCase().includes("hoạt động") && !dangKyMatch;
      const thongBaoMatch = chatInput.toLowerCase().includes("thông báo");
      const quenMatKhauMatch = chatInput.toLowerCase().includes("quên mật khẩu");
      const ngayMatch = chatInput.toLowerCase().includes("ngày");

      if (thongTinMatch) {
        if (!maSV || !studentInfo) {
          responseText = "Vui lòng đăng nhập để xem thông tin cá nhân.";
        } else {
          responseText = `Thông tin của bạn:\n- MSSV: ${studentInfo.MaSV}\n- Họ tên: ${studentInfo.HoTen}\n- Lớp: ${studentInfo.TenLop}\n- Email: ${studentInfo.Email}\n- Số điện thoại: ${studentInfo.SoDienThoai}\n- Địa chỉ: ${studentInfo.DiaChi}\n- Ngày sinh: ${new Date(studentInfo.NgaySinh).toLocaleDateString("vi-VN")}\n- Giới tính: ${studentInfo.GioiTinh}`;
        }
      } else if (chinhSuaMatch) {
        if (!maSV) {
          responseText = "Vui lòng đăng nhập để chỉnh sửa thông tin.";
        } else {
                  setTimeout(() => {
    navigate("/chinh-sua-thong-tin");
  }, 4000); // chờ 2 giây 
            responseText = "Đang chuyển hướng đến trang cập nhật thông tin...";
          }
        } else if (phanHoiMatch) {
          if (!maSV) {
            responseText = "Vui lòng đăng nhập để phản hồi điểm rèn luyện.";
          } else {
           navigate("/sinhvien/dashboard?menu=evidence");
            responseText = "Đang chuyển hướng đến trang phản hồi điểm rèn luyện...";
          }
      } else if (dangKyMatch) {
        if (!maSV) {
          responseText = "Vui lòng đăng nhập để đăng ký hoạt động.";
        } else {
          responseText = await fetchHoatDong();
        }
      } else if (diemMatch || mssvMatch) {
        let mssv = mssvMatch ? mssvMatch[0] : maSV;
        if (!mssv) {
          responseText = "Vui lòng cung cấp MSSV hoặc đăng nhập để tôi kiểm tra điểm rèn luyện.";
        } else {
          mssv = mssv.replace(/\s+/g, "").toUpperCase();
          const hocKy = hocKyMatch ? hocKyMatch[1] : null;
          try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Vui lòng đăng nhập để sử dụng tính năng này.");
            const response = await axios.post(
              "http://localhost:5163/api/Webhook",
              {
                queryResult: {
                  action: "mssv",
                  parameters: {
                    mssv,
                    ...(hocKy && { hocKy }),
                  },
                },
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            responseText = response.data.fulfillmentText || "Không tìm thấy thông tin.";
          } catch (error: any) {
            console.error("Lỗi khi gọi webhook:", error);
            responseText =
              error.response?.status === 401
                ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
                : "Có lỗi xảy ra khi lấy điểm rèn luyện.";
          }
        }
      } else if (hoatDongMatch) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Vui lòng đăng nhập để sử dụng tính năng này.");
          const response = await axios.post(
            "http://localhost:5163/api/Webhook",
            {
              queryResult: {
                action: "hoatdong",
                parameters: {},
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          responseText = response.data.fulfillmentText || "Không có hoạt động nào.";
        } catch (error: any) {
          console.error("Lỗi khi lấy hoạt động:", error);
          responseText =
            error.response?.status === 401
              ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
              : "Có lỗi khi lấy danh sách hoạt động.";
        }
      } else if (thongBaoMatch) {
        try {
          const response = await axios.get("http://localhost:5163/api/ThongBao/lay_thong_bao", {
            headers: { "Content-Type": "application/json" },
          });
          if (response.data && response.data.length > 0) {
            responseText = "Các thông báo mới nhất:\n\n";
            response.data.forEach((tb: ThongBao, index: number) => {
              responseText += `${index + 1}. ${tb.TieuDe} - ${new Date(tb.NgayTao).toLocaleDateString("vi-VN")}\n`;
            });
            responseText += "\nTôi đã cho bạn những thông báo mới nhất. Nếu cần xem chi tiết hãy truy cập vào danh sách thông báo ở phía bên phải trang web.\n";
          } else {
            responseText = "Không có thông báo mới nào.";
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông báo:", error);
          responseText = "Có lỗi khi lấy thông báo.";
        }
      } else if (quenMatKhauMatch) {
        if (onOpenForgotPassword && !maSV) {
          onOpenForgotPassword();
          responseText = "Vui lòng nhập mã số sinh viên trong form quên mật khẩu.";
        } else {
          responseText = "Bạn đã đăng nhập rồi mà! Chức năng này chỉ hỗ trợ khi bạn không thể đăng nhập thôi!";
        }
      } else if (ngayMatch) {
        responseText = `Hôm nay là ${new Date().toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} (${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}).`;
      }
    }

    setTimeout(() => {
      const botMessage: ChatMessage = {
        text: responseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botMessage]);
      setChatInput("");
      setIsChatLoading(false);
    }, 2000);
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setIsMinimized(false);
      setWaitingForActivitySelection(false);
      setWaitingForActivityConfirmation(null);
    }
  };

  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setIsMinimized(false);
    setWaitingForActivitySelection(false);
    setWaitingForActivityConfirmation(null);
  };

  const formatMessage = (text: string) => {
    return text.split("\n").map((line: string, i: number) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="chatbot-wrapper">
      {isChatOpen && (
        <div className={`chat-container ${isMinimized ? "chat-minimized" : ""}`}>
          <div className="chat-header">
            <div className="chat-header-title">
              <i className="chat-icon chat-icon-robot"></i>
              <span>Trợ lý ảo HUIT</span>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-header-btn minimize-btn"
                onClick={handleMinimizeToggle}
                title={isMinimized ? "Phóng to" : "Thu nhỏ"}
              >
                <i className={`chat-icon ${isMinimized ? "chat-icon-maximize" : "chat-icon-minimize"}`}></i>
              </button>
              <button className="chat-header-btn close-btn" onClick={handleCloseChat} title="Đóng">
                <i className="chat-icon chat-icon-close"></i>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.isUser ? "user-message" : "bot-message"}`}>
                    <div className="message-avatar">
                      {msg.isUser ? (
                        <div className="user-avatar">
                          <i className="chat-icon chat-icon-user"></i>
                        </div>
                      ) : (
                        <div className="bot-avatar">
                          <i className="chat-icon chat-icon-robot"></i>
                        </div>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">{formatMessage(msg.text)}</div>
                      <div className="message-time">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="chat-message bot-message">
                    <div className="message-avatar">
                      <div className="bot-avatar">
                        <i className="chat-icon chat-icon-robot"></i>
                      </div>
                    </div>
                    <div className="message-content">
                      <div className="message-bubble typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  className="chat-input-field"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Nhập tin nhắn của bạn"
                  disabled={isChatLoading}
                  ref={inputRef}
                />
                <button
                  onClick={handleChatSend}
                  disabled={isChatLoading || !chatInput.trim()}
                  className={`chat-send-btn ${chatInput.trim() ? "active" : ""}`}
                  title="Gửi"
                >
                  <i className="chat-icon chat-icon-send"></i>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        className={`chat-toggle-btn ${isChatOpen ? "chat-open" : ""}`}
        onClick={handleToggleChat}
        title={isChatOpen ? "Đóng" : "Trợ lý ảo"}
      >
        <i className={`chat-icon ${isChatOpen ? "chat-icon-close" : "chat-icon-chat"}`}></i>
      </button>
    </div>
  );
};

export default Chatbot;