import React from "react";
import ConfirmModal from "../common/ConfirmModal";

interface XacNhanXoaGiangVienProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  giangVienId: string | null;
  giangVienName: string | null;
}

const XacNhanXoaGiangVien: React.FC<XacNhanXoaGiangVienProps> = ({
  isOpen,
  onClose,
  onConfirm,
  giangVienId,
  giangVienName,
}) => {
  if (!isOpen || !giangVienId) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Xác nhận xóa"
      message={`Bạn có chắc chắn muốn xóa giảng viên ${
        giangVienName || giangVienId
      }? Hành động này không thể hoàn tác.`}
      confirmText="Xóa"
      cancelText="Hủy"
      onConfirm={onConfirm}
      onCancel={onClose}
      type="danger"
    />
  );
};

export default XacNhanXoaGiangVien;
