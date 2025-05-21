import React, { useState, useEffect, useRef } from "react";
import axios from "axios";


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

interface ChatbotProps {
  onOpenForgotPassword?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onOpenForgotPassword }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      text: "Xin chào! Tôi là trợ lý ảo HUIT. Tôi có thể giúp gì cho bạn? (Ví dụ: 'xem điểm MSSV DHTH123478', 'xem điểm MSSV DHTH123478 học kỳ 2', 'hoạt động đang diễn ra', 'xem thông báo')",
      isUser: false,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      document.querySelector(".chat-container")?.classList.add("chat-container-active");
    }
  }, [isChatOpen]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const currentTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMessage: ChatMessage = { text: chatInput, isUser: true, timestamp: currentTime };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    let responseText = "Tôi chưa hiểu yêu cầu của bạn. Hãy thử: 'xem điểm MSSV [mssv]', 'xem điểm MSSV [mssv] học kỳ [học kỳ]', 'hoạt động đang diễn ra', 'xem thông báo', 'thời tiết [địa điểm]', hoặc 'quên mật khẩu'.";

    // Nhận diện các câu hỏi về điểm rèn luyện
    const diemMatch = chatInput.match(/(?:xem điểm\s*(?:DRL\s*)?(?:của\s*)?(?:MSSV\s*)?|điểm\s*(?:rèn luyện|DRL)\s*(?:kỳ này\s*)?(?:của\s*)?(?:tôi|MSSV\s*)?|tôi được bao nhiêu điểm|MSSV\s*(\w+)\s*điểm\s*(?:luyện|rèn luyện)\s*bao nhiêu)(\w+)/i);
    const hocKyMatch = chatInput.match(/học kỳ\s*(\d+)/i);
    const mssvMatch = chatInput.match(/DHTH\d+/i); // Nhận diện MSSV trong câu

    if (diemMatch || mssvMatch) {
      // Lấy MSSV từ diemMatch hoặc mssvMatch
      let mssv = diemMatch && diemMatch[1] ? diemMatch[1] : mssvMatch ? mssvMatch[0] : null;
      if (!mssv) {
        responseText = "Vui lòng cung cấp MSSV để tôi kiểm tra điểm rèn luyện.";
      } else {
        mssv = mssv.replace(/\s+/g, "").toUpperCase();
        const hocKy = hocKyMatch ? hocKyMatch[1] : null;

        try {
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
              headers: { "Content-Type": "application/json" },
            }
          );
          responseText = response.data.fulfillmentText || "Không tìm thấy thông tin.";
        } catch (error) {   
          console.error("Lỗi khi gọi webhook:", error);
          responseText = "Có lỗi xảy ra khi lấy điểm rèn luyện.";
        }
      }
    } else if (chatInput.toLowerCase().includes("hoạt động ")) {
      try {
        const response = await axios.post(
          "http://localhost:5163/api/Webhook",
          {
            queryResult: {
              action: "hoatdong",
              parameters: {},
            },
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        responseText = response.data.fulfillmentText || "Không có hoạt động nào.";
      } catch (error) {
        console.error("Lỗi khi lấy hoạt động:", error);
        responseText = "Có lỗi khi lấy danh sách hoạt động.";
      }
    } else if (chatInput.toLowerCase().includes("xem thông báo")) {
      try {
        const response = await axios.get("http://localhost:5163/api/ThongBao/lay_thong_bao");
        if (response.data && response.data.length > 0) {
          responseText = "Các thông báo mới nhất:\n\n";
          response.data.forEach((tb: ThongBao, index: number) => {
            responseText += `${index + 1}. ${tb.TieuDe} - ${new Date(tb.NgayTao).toLocaleDateString("vi-VN")}\n`;
          });
        } else {
          responseText = "Không có thông báo mới nào.";
        }
      } catch (error) {
        responseText = "Có lỗi khi lấy thông báo.";
      }
    } else if (chatInput.toLowerCase().includes("quên mật khẩu")) {
      if (onOpenForgotPassword) {
        onOpenForgotPassword();
        responseText = "Vui lòng nhập mã số sinh viên trong form quên mật khẩu.";
      } else {
        responseText = "Chức năng quên mật khẩu chưa được hỗ trợ.";
      }
    } else if (chatInput.toLowerCase().includes("thời tiết")) {
      const locationMatch = chatInput.match(/thời tiết\s*([\w\s]+)/i);
      if (locationMatch && locationMatch[1]) {
        const location = locationMatch[1].trim();
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=YOUR_OPENWEATHER_API_KEY&units=metric&lang=vi`
          );
          responseText = `Thời tiết tại ${location}: ${response.data.weather[0].description} (Nhiệt độ: ${response.data.main.temp}°C, vào ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}).`;
        } catch (error) {
          responseText = "Không thể lấy thông tin thời tiết. Vui lòng thử lại.";
        }
      } else {
        responseText = "Vui lòng nhập địa điểm, ví dụ: 'thời tiết Hà Nội'.";
      }
    } else if (chatInput.toLowerCase().includes("ngày")) {
      responseText = `Hôm nay là ${new Date().toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} (${new Date().toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}).`;
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
    }, 600);
  };

  const handleToggleChat = () => {
    if (!isChatOpen) {
      setIsChatOpen(true);
      setIsMinimized(false);
    } else {
      setIsMinimized(!isMinimized);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
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
                className="chat-header-btn close-btn"
                onClick={handleCloseChat}
                title="Đóng"
              >
                <i className="chat-icon chat-icon-close"></i>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.isUser ? "user-message" : "bot-message"}`}
                  >
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
        title={isChatOpen ? "Thu nhỏ" : "Trợ lý ảo"}
      >
        <i className={`chat-icon ${isChatOpen ? "chat-icon-close" : "chat-icon-chat"}`}></i>
      </button>
    </div>
  );
};

export default Chatbot;