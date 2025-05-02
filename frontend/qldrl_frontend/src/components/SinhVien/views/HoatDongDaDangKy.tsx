import React, { useState, useEffect } from 'react';

const HoatDongDaDangKy: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        if (result.data) {
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

    fetchActivities();
  }, []);

  const handleCancelActivity = async (maHoatDong: number) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy hoạt động này?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          return;
        }

        // Placeholder cho API hủy hoạt động (cần thay bằng endpoint thực tế)
        const response = await fetch(`http://localhost:5163/api/DangKyHoatDongs/huy-dang-ky/${maHoatDong}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Lỗi khi hủy: ${response.statusText}`);
        }

        setActivities(activities.filter(activity => activity.MaHoatDong !== maHoatDong));
        alert('Hoạt động đã được hủy thành công!');
      } catch (error: any) {
        console.error('Lỗi khi hủy hoạt động:', error);
        setError(error.message || 'Có lỗi xảy ra khi hủy hoạt động.');
      }
    }
  };

  return (
    <div className="activities-container">
      <h2 className="activities-title">Hoạt động đã đăng ký</h2>
      {error ? (
        <p className="error-message">{error}</p>
      ) : activities.length > 0 ? (
        <div className="activities-list">
          {activities.map((activity, index) => (
            <div key={index} className="activity-card">
              <div className="activity-header">
                <h3 className="activity-name">{activity.TenHoatDong}</h3>
                <span className="activity-status">{activity.TrangThaiHoatDong}</span>
              </div>
              <div className="activity-details">
                <p><strong>Ngày bắt đầu:</strong> {new Date(activity.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                <p><strong>Địa điểm:</strong> {activity.diaDiem}</p>
               
                <p><strong>Mô tả:</strong> {activity.MoTa}</p>
                <div className="activity-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelActivity(activity.MaHoatDong)}
                  >
                    Hủy hoạt động
                  </button>
                  <p><strong>Điểm cộng:</strong> <span className="points">{activity.diemCong}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-activities">Bạn chưa đăng ký hoạt động nào.</p>
      )}
    </div>
  );
};

export default HoatDongDaDangKy;