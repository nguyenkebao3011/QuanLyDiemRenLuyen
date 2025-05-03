import React, { useState, useEffect } from 'react';

const HoatDongDaDangKy: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [selectedMaHoatDong, setSelectedMaHoatDong] = useState<number | null>(null);
  const [lyDoHuy, setLyDoHuy] = useState<string>('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [activitiesMap, setActivitiesMap] = useState<{ [key: number]: string }>({});
  const itemsPerPage = 3;

  // Danh sách lý do hủy
  const cancelReasons = [
    'Lịch trình cá nhân thay đổi',
    'Không còn quan tâm đến hoạt động',
    'Lý do sức khỏe',
    'Hoạt động không phù hợp',
    'Khác',
  ];

  // Tính toán phân trang dựa trên activities
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = activities.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(activities.length / itemsPerPage) || 1;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          return;
        }

        const response = await fetch('http://localhost:5163/api/DangKyHoatDongs/danh-sach-dang-ky', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Không được phép truy cập. Vui lòng đăng nhập lại.');
            return;
          }
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        if (Array.isArray(result.data)) {
          setActivities(result.data);
          setError(null);
        } else {
          setError('Không tìm thấy dữ liệu hoạt động.');
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy danh sách hoạt động đã đăng ký:', error);
        setError(error.message || 'Có lỗi xảy ra khi lấy dữ liệu.');
      }
    };

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          return;
        }

        const response = await fetch('http://localhost:5163/api/DangKyHoatDongs/lich-su-huy', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Không được phép truy cập. Vui lòng đăng nhập lại.');
            return;
          }
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        if (Array.isArray(result.data)) {
          setHistoryData(result.data);
        } else {
          setHistoryData([]);
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy lịch sử hủy:', error);
        setHistoryData([]);
      }
    };

    
      const fetchActivitiesList = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
            return;
          }
    
          const response = await fetch('http://localhost:5163/api/HoatDongs/lay-danh-sach-hoat-dong', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
          }
    
          const result = await response.json();
          
    
          // Kiểm tra kết quả trả về
          const activityList = result?.data;
          if (!Array.isArray(activityList)) {
          
            setActivitiesMap({});
            return;
          }
    
          const map: { [key: number]: string } = {};
          for (const activity of activityList) {
            if (activity?.MaHoatDong && activity?.TenHoatDong) {
              map[activity.MaHoatDong] = activity.TenHoatDong;
            } else {
              console.warn('Hoạt động thiếu thông tin:', activity);
            }
          }
    
          console.log('Activities Map đã tạo:', map);
          setActivitiesMap(map);
        } catch (error: any) {
          console.error('Lỗi khi lấy danh sách hoạt động:', error);
          setActivitiesMap({});
        }
      };
    
      // Gọi các hàm fetch
      fetchActivities();
      fetchHistory();
      fetchActivitiesList();
    }, []);

  // Tự động ẩn thông báo sau 5 giây
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Reset trang về 1 khi activities thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activities]);

  const openCancelModal = (maHoatDong: number) => {
    setSelectedMaHoatDong(maHoatDong);
    setLyDoHuy('');
    setSelectedReasons([]);
    setShowCancelModal(true);
    setError(null);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedMaHoatDong(null);
    setLyDoHuy('');
    setSelectedReasons([]);
    setError(null);
  };

  const handleReasonChange = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleCancelActivity = async () => {
    if (!selectedMaHoatDong) return;

    if (selectedReasons.length === 0 && !lyDoHuy.trim()) {
      setError('Vui lòng chọn ít nhất một lý do hủy hoặc nhập lý do tùy chỉnh.');
      return;
    }

    let finalReason = selectedReasons.filter((r) => r !== 'Khác').join(', ');
    if (selectedReasons.includes('Khác') && lyDoHuy.trim()) {
      finalReason = finalReason ? `${finalReason}, ${lyDoHuy.trim()}` : lyDoHuy.trim();
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        closeCancelModal();
        return;
      }

      const response = await fetch('http://localhost:5163/api/DangKyHoatDongs/huy-dangky', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MaHoatDong: selectedMaHoatDong,
          LyDoHuy: finalReason || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi khi hủy: ${response.statusText}`);
      }

      const result = await response.json();
      setActivities(activities.filter(activity => activity.MaHoatDong !== selectedMaHoatDong));
      setSuccessMessage(result.message || 'Hủy đăng ký hoạt động thành công!');
      closeCancelModal();
    } catch (error: any) {
      console.error('Lỗi khi hủy hoạt động:', error);
      setError(error.message || 'Có lỗi xảy ra khi hủy hoạt động.');
    }
  };

  const openHistoryModal = () => setShowHistoryModal(true);
  const closeHistoryModal = () => setShowHistoryModal(false);

  const getActivityName = (maHoatDong: number) => {
    return activitiesMap[maHoatDong] || 'Không tìm thấy tên';
  };

  return (
    <div className="activities-container">
      <div className="activities-header">
        <h2 className="activities-title">Hoạt động đã đăng ký</h2>
        <button className="activity-list-btn" onClick={openHistoryModal}>
          Danh sách các hoạt động đã hủy
        </button>
      </div>
      {successMessage && (
        <div className="success-message">
          <svg className="icon-success" fill="#22c55e" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          {successMessage}
        </div>
      )}

      {error && !showCancelModal && !showHistoryModal && (
        <div className="error-message">
          <svg className="icon-error" fill="#ef4444" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
          </svg>
          {error}
        </div>
      )}

      {activities.length > 0 ? (
        <div className="activities-list">
          {paginatedActivities.map((activity, index) => (
            <div key={activity.MaHoatDong} className="activity-card">
              <div className="activity-header">
                <h3 className="activity-name">{activity.TenHoatDong}</h3>
                <span className="activity-status">{activity.TrangThaiHoatDong}</span>
              </div>
              <div className="activity-details">
                <p><strong>Ngày bắt đầu:</strong> {new Date(activity.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                <p><strong>Địa điểm:</strong> {activity.diaDiem || 'Chưa xác định'}</p>
                <p><strong>Mô tả:</strong> {activity.MoTa || 'Không có mô tả'}</p>
                <p><strong>Điểm cộng:</strong> <span className="points">{activity.diemCong ?? 0} điểm</span></p>
              </div>
              <div className="activity-actions">
                <button
                  className="cancel-btn2"
                  onClick={() => openCancelModal(activity.MaHoatDong)}
                >
                  Hủy hoạt động
                </button>
              </div>
            </div>
          ))}
          <div className="pagination2">
            <button
              className="btn-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              «
            </button>
            <span className="page-info">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="btn-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              »
            </button>
          </div>
        </div>
      ) : (
        <p className="no-activities">Bạn chưa đăng ký hoạt động nào.</p>
      )}

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận hủy đăng ký</h3>
            <p>Chọn lý do hủy đăng ký hoạt động:</p>
            <div className="form-group">
              {cancelReasons.map((reason) => (
                <div key={reason} className="checkbox-group">
                  <input
                    type="checkbox"
                    id={reason}
                    checked={selectedReasons.includes(reason)}
                    onChange={() => handleReasonChange(reason)}
                  />
                  <label htmlFor={reason}>{reason}</label>
                </div>
              ))}
              {selectedReasons.includes('Khác') && (
                <textarea
                  value={lyDoHuy}
                  onChange={(e) => setLyDoHuy(e.target.value)}
                  placeholder="Nhập lý do tùy chỉnh (tối đa 500 ký tự)"
                  maxLength={500}
                  className="cancel-reason-input"
                />
              )}
            </div>
            {error && (
              <div className="error-message">
                <svg className="icon-error" fill="#ef4444" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                </svg>
                {error}
              </div>
            )}
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleCancelActivity}>
                Xác nhận
              </button>
              <button className="cancel-btn2" onClick={closeCancelModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="modal-overlay" onClick={closeHistoryModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Lịch sử hủy hoạt động</h3>
              <button className="close-btn" onClick={closeHistoryModal}>×</button>
            </div>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Mã hoạt động</th>
                  <th>Tên hoạt động</th>
                  <th>Lý do</th>
                  <th>Thời gian hủy</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item) => (
                  <tr key={item.Id}>
                    <td>{item.MaHoatDong}</td>
                    <td>{item.TenHoatDong}</td>
                    <td>{item.LyDo || 'Không có lý do'}</td>
                    <td>{new Date(item.ThoiGianHuy).toLocaleString('vi-VN')}</td>
                    <td>{item.TrangThai || 'Chưa xác định'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoatDongDaDangKy;