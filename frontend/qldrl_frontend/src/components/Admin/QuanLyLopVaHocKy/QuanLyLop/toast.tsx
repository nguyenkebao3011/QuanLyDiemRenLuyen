import type React from "react";
import { useEffect } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react";

interface ToastProps {
  show: boolean;
  title: string;
  description: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  show,
  title,
  description,
  type,
  onClose,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="icon" style={{ color: "var(--success)" }} />
        );
      case "error":
        return (
          <AlertCircle className="icon" style={{ color: "var(--danger)" }} />
        );
      case "warning":
        return (
          <AlertTriangle className="icon" style={{ color: "var(--warning)" }} />
        );
      default:
        return <CheckCircle className="icon" />;
    }
  };

  return (
    <div className={`toast ${type}`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <div className="flex-1">
          <div className="toast-title">{title}</div>
          <div className="toast-description">{description}</div>
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px" }}
        >
          <X className="icon" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
