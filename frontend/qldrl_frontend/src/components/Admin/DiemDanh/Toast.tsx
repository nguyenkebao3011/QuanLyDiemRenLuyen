import type React from "react";
import { X } from "lucide-react";

interface ToastProps {
  toasts: { id: number; title: string; description: string; variant: string }[];
  setToasts: React.Dispatch<
    React.SetStateAction<
      { id: number; title: string; description: string; variant: string }[]
    >
  >;
}

const Toast: React.FC<ToastProps> = ({ toasts, setToasts }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.variant}`}>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-description">{toast.description}</div>
          </div>
          <button
            className="toast-close"
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
