"use client";

import type React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ActionButtonsHocKyProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtonsHocKy: React.FC<ActionButtonsHocKyProps> = ({
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
      <Eye className="icon" />
    </button>
    <button onClick={onEdit} title="Chỉnh sửa" className="btn-action btn-edit">
      <Edit className="icon" />
    </button>
    <button onClick={onDelete} title="Xóa" className="btn-action btn-delete">
      <Trash2 className="icon" />
    </button>
  </div>
);

export default ActionButtonsHocKy;
