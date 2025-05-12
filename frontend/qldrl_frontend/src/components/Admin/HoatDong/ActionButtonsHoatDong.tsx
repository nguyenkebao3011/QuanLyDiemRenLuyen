"use client";

import type React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ActionButtonsHoatDongProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtonsHoatDong: React.FC<ActionButtonsHoatDongProps> = ({
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="action-buttons">
    <button
      onClick={onView}
      title="Xem chi tiết"
      className="btn-action btn-view"
    >
      <Eye size={20} />
    </button>
    <button onClick={onEdit} title="Chỉnh sửa" className="btn-action btn-edit">
      <Edit size={20} />
    </button>
    <button onClick={onDelete} title="Xóa" className="btn-action btn-delete">
      <Trash2 size={20} />
    </button>
  </div>
);

export default ActionButtonsHoatDong;
