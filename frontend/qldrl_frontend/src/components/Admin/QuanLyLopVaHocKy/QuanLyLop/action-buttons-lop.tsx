import type React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ActionButtonsLopProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtonsLop: React.FC<ActionButtonsLopProps> = ({
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="action-buttons">
    <button
      onClick={onView}
      title="Xem chi tiết"
      className="btn btn-ghost btn-sm btn-view"
    >
      <Eye className="icon" />
    </button>
    <button
      onClick={onEdit}
      title="Chỉnh sửa"
      className="btn btn-ghost btn-sm btn-edit"
    >
      <Edit className="icon" />
    </button>
    <button
      onClick={onDelete}
      title="Xóa"
      className="btn btn-ghost btn-sm btn-delete"
    >
      <Trash2 className="icon" />
    </button>
  </div>
);

export default ActionButtonsLop;
