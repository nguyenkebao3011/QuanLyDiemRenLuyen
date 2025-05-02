import React from "react";
import ConfirmModal from "../common/ConfirmModal";

interface XacNhanXoaSinhVienProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  sinhVienId: string | null;
  sinhVienName: string | null;
}

const XacNhanXoaSinhVien: React.FC<XacNhanXoaSinhVienProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sinhVienId,
  sinhVienName,
}) => {
  if (!isOpen || !sinhVienId) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Xác nhận xóa"
      message={`Bạn có chắc chắn muốn xóa sinh viên ${
        sinhVienName || sinhVienId
      }? Hành động này không thể hoàn tác.`}
      confirmText="Xóa"
      cancelText="Hủy"
      onConfirm={onConfirm}
      onCancel={onClose}
      type="danger"
    />
  );
};

export default XacNhanXoaSinhVien;
