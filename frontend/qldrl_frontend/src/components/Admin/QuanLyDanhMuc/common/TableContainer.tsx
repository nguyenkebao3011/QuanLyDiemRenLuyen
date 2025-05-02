import React from "react";
import "./TableContainer.css";

interface TableContainerProps {
  loading: boolean;
  isEmpty: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  error?: string | null;
  children: React.ReactNode;
}

const TableContainer: React.FC<TableContainerProps> = ({
  loading,
  isEmpty,
  loadingMessage = "Đang tải dữ liệu...",
  emptyMessage = "Không có dữ liệu",
  error,
  children,
}) => {
  return (
    <div className="table-container">
      {loading ? (
        <div className="loading-message">{loadingMessage}</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : isEmpty ? (
        <div className="empty-message">{emptyMessage}</div>
      ) : (
        children
      )}
    </div>
  );
};

export default TableContainer;
