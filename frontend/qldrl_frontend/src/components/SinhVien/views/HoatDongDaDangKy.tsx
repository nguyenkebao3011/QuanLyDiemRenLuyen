import React, { useState, useEffect } from 'react';
import '../css/HoatDongDaDangKy.css';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const itemsPerPage = 3;

  const cancelReasons = [
    'Lịch trình cá nhân thay đổi',
    'Không còn quan tâm đến hoạt động',
    'Lý do sức khỏe',
    'Hoạt động không phù hợp',
    'Khác',
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = activities.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(activities.length / itemsPerPage) || 1;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setIsLoading(false);
          return;
        }

        const activitiesResponse = await fetch('http://localhost:5163/api/DangKyHoatDongs/danh-sach-dang-ky', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!activitiesResponse.ok) {
          if (activitiesResponse.status === 401) {
            throw new Error('Không được phép truy cập. Vui lòng đăng nhập lại.');
          }
          throw new Error(`Lỗi HTTP: ${activitiesResponse.status} - ${activitiesResponse.statusText}`);
        }

        const activitiesResult = await activitiesResponse.json();
        if (Array.isArray(activitiesResult.data)) {
          setActivities(activitiesResult.data);
        } else {
          setActivities([]);
        }

        const historyResponse = await fetch('http://localhost:5163/api/DangKyHoatDongs/lich-su-huy', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          if (Array.isArray(historyResult.data)) {
            setHistoryData(historyResult.data);
          }
        }

        const listResponse = await fetch('http://localhost:5163/api/HoatDongs/lay-danh-sach-hoat-dong', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (listResponse.ok) {
          const listResult = await listResponse.json();
          const activityList = listResult?.data;
          
          if (Array.isArray(activityList)) {
            const map: { [key: number]: string } = {};
            for (const activity of activityList) {
              if (activity?.MaHoatDong && activity?.TenHoatDong) {
                map[activity.MaHoatDong] = activity.TenHoatDong;
              }
            }
            setActivitiesMap(map);
          }
        }

        setError(null);
      } catch (error: any) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError(error.message || 'Có lỗi xảy ra khi lấy dữ liệu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

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
      
      const token2 = localStorage.getItem('token');
      const historyResponse = await fetch('http://localhost:5163/api/DangKyHoatDongs/lich-su-huy', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token2}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (historyResponse.ok) {
        const historyResult = await historyResponse.json();
        if (Array.isArray(historyResult.data)) {
          setHistoryData(historyResult.data);
        }
      }
      
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
    <div className="hddk-container">
      <div className="hddk-header">
        <h2 className="hddk-title">Hoạt động đã đăng ký</h2>
        <button className="hddk-history-btn" onClick={openHistoryModal}>
          <span className="hddk-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
            </svg>
          </span>
          Lịch sử hủy hoạt động
        </button>
      </div>
      
      {successMessage && (
        <div className="hddk-alert hddk-success">
          <svg className="hddk-alert-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && !showCancelModal && !showHistoryModal && (
        <div className="hddk-alert hddk-error">
          <svg className="hddk-alert-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="hddk-loader-container">
          <div className="hddk-loader"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : activities.length > 0 ? (
        <div className="hddk-activities-list">
          <div className="hddk-activities-row">
            {paginatedActivities.map((activity) => (
              <div key={activity.MaHoatDong} className="hddk-activity-card">
                <div className="hddk-activity-header">
                  <h3 className="hddk-activity-name">{activity.TenHoatDong}</h3>
                  <span className={`hddk-status ${activity.TrangThaiHoatDong === 'Đã kết thúc' ? 'hddk-status-ended' : 'hddk-status-active'}`}>
                    {activity.TrangThaiHoatDong}
                  </span>
                </div>
                <div className="hddk-activity-details">
                  <div className="hddk-detail-item">
                    <div className="hddk-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <span><strong>Ngày bắt đầu:</strong> {new Date(activity.NgayBatDau).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="hddk-detail-item">
                    <div className="hddk-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <span><strong>Địa điểm:</strong> {activity.diaDiem || 'Chưa xác định'}</span>
                  </div>
                  <div className="hddk-detail-item">
                    <div className="hddk-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <span><strong>Mô tả:</strong> {activity.MoTa || 'Không có mô tả'}</span>
                  </div>
                  <div className="hddk-detail-item">
                    <div className="hddk-detail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <span><strong>Điểm cộng:</strong> <span className="hddk-points">{activity.diemCong ?? 0} điểm</span></span>
                  </div>
                </div>
                <div className="hddk-activity-actions">
                  <button
                    className="hddk-cancel-btn"
                    onClick={() => openCancelModal(activity.MaHoatDong)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Hủy hoạt động
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="hddk-pagination">
            <button
              className="hddk-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span className="hddk-page-info">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="hddk-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="hddk-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hddk-empty-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Bạn chưa đăng ký hoạt động nào.</p>
        </div>
      )}

      {showCancelModal && (
        <div className="hddk-modal-overlay">
          <div className="hddk-modal">
            <div className="hddk-modal-header">
              <h3>Xác nhận hủy đăng ký</h3>
              <button className="hddk-close-btn" onClick={closeCancelModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="hddk-modal-body">
              <p className="hddk-modal-text">Chọn lý do hủy đăng ký hoạt động:</p>
              <div className="hddk-reason-list">
                {cancelReasons.map((reason) => (
                  <div key={reason} className="hddk-reason-item">
                    <input
                      type="checkbox"
                      id={reason}
                      checked={selectedReasons.includes(reason)}
                      onChange={() => handleReasonChange(reason)}
                      className="hddk-checkbox"
                    />
                    <label htmlFor={reason} className="hddk-checkbox-label">{reason}</label>
                  </div>
                ))}
              </div>
              {selectedReasons.includes('Khác') && (
                <div className="hddk-textarea-wrapper">
                  <textarea
                    value={lyDoHuy}
                    onChange={(e) => setLyDoHuy(e.target.value)}
                    placeholder="Nhập lý do tùy chỉnh (tối đa 500 ký tự)"
                    maxLength={500}
                    className="hddk-textarea"
                  />
                  <span className="hddk-char-count">{lyDoHuy.length}/500</span>
                </div>
              )}
              {error && (
                <div className="hddk-alert hddk-error hddk-modal-error">
                  <svg className="hddk-alert-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="hddk-modal-footer">
              <button className="hddk-confirm-btn" onClick={handleCancelActivity}>
                Xác nhận
              </button>
              <button className="hddk-cancel-action-btn" onClick={closeCancelModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="hddk-modal-overlay">
          <div className="hddk-modal hddk-history-modal">
            <div className="hddk-modal-header">
              <h3>Lịch sử hủy hoạt động</h3>
              <button className="hddk-close-btn" onClick={closeHistoryModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="hddk-modal-body">
              {historyData.length > 0 ? (
                <div className="hddk-table-container">
                  <table className="hddk-table">
                    <thead>
                      <tr>
                        <th>Mã HĐ</th>
                        <th>Tên hoạt động</th>
                        <th>Lý do</th>
                        <th>Thời gian hủy</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item) => (
                        <tr key={item.Id} className="hddk-table-row">
                          <td>{item.MaHoatDong}</td>
                          <td>{item.TenHoatDong || getActivityName(item.MaHoatDong)}</td>
                          <td>{item.LyDo || 'Không có lý do'}</td>
                          <td>{new Date(item.ThoiGianHuy).toLocaleString('vi-VN')}</td>
                          <td>
                            <span className={`hddk-status-pill ${item.TrangThai === 'Đã hủy' ? 'hddk-status-cancelled' : 'hddk-status-pending'}`}>
                              {item.TrangThai || 'Chưa xác định'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="hddk-empty-history">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hddk-empty-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p>Chưa có lịch sử hủy hoạt động nào.</p>
                </div>
              )}
            </div>
            <div className="hddk-modal-footer">
              <button className="hddk-close-btn-text" onClick={closeHistoryModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoatDongDaDangKy;