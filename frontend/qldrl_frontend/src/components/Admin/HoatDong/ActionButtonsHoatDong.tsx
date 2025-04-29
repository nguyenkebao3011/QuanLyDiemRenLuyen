import React from "react";
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
  <>
    <button
      className="btn-action btn-view"
      onClick={onView}
      title="Xem chi tiết"
    >
      <Eye size={16} />
    </button>
    <button className="btn-action btn-edit" onClick={onEdit} title="Chỉnh sửa">
      <Edit size={16} />
    </button>
    <button className="btn-action btn-delete" onClick={onDelete} title="Xóa">
      <Trash2 size={16} />
    </button>
  </>
);

export default ActionButtonsHoatDong;
