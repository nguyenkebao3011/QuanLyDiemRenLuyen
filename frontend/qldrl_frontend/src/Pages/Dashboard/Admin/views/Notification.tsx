import type React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import "../css/notification.css";

interface NotificationProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = "success",
  onClose,
}) => {
  return (
    <div className="notification-overlay">
      <div className={`notification-container notification-${type}`}>
        <div className="notification-icon">
          {type === "success" && (
            <CheckCircle2 className="text-green-500" size={24} />
          )}
          {type === "error" && (
            <AlertCircle className="text-red-500" size={24} />
          )}
          {type === "info" && <Info className="text-blue-500" size={24} />}
        </div>
        <div className="notification-content">
          <p>{message}</p>
        </div>
        <button className="notification-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
