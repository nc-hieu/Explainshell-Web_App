import React, { useState, useEffect } from 'react';
import { List, Popconfirm, Button, Typography, message, Tooltip } from 'antd';
import { DeleteOutlined, StarFilled, ClockCircleOutlined } from '@ant-design/icons';
import { favoriteService } from '../../../../services/favorite.service';
import { useNavigate } from 'react-router-dom';

const FavoriteTab = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      // Gọi API lấy tối đa 50 lệnh yêu thích
      const data = await favoriteService.getMyFavorites(0, 50);
      
      // Đảm bảo dữ liệu luôn là mảng (Xử lý trường hợp API trả về { items: [...] } hoặc mảng trực tiếp)
      const items = Array.isArray(data) ? data : (data.items || []);
      setFavorites(items);
    } catch (error) {
      message.error('Không thể tải danh sách yêu thích!');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (programId) => {
    try {
      await favoriteService.removeFavorite(programId);
      message.success('Đã bỏ yêu thích!');
      fetchFavorites(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      message.error('Lỗi khi bỏ yêu thích!');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div style={{ marginTop: 16 }}>
      <List
        loading={loading}
        dataSource={favorites}
        locale={{ emptyText: 'Bạn chưa có lệnh yêu thích nào.' }}
        renderItem={(item) => {
          // XỬ LÝ DỮ LIỆU LINH HOẠT: 
          // Tùy cách Backend trả về, dữ liệu lệnh có thể nằm trong item.program hoặc ngay ngoài item
          const program = item.program || item; 
          const programId = program.id || item.program_id;

          return (
            // Tận dụng class từ Profile.scss để hiển thị 1 dòng ngang
            <div className="history-list-item">
              
              {/* Cột trái: Icon Ngôi sao + Tên lệnh + Mô tả */}
              <div className="history-content">
                <div className="history-icon-box" style={{ color: '#faad14' }}>
                  <StarFilled />
                </div>
                <a 
                  className="history-command" 
                  onClick={() => navigate(`/programs/${program.slug || program.name}`)}
                >
                  {program.name}
                </a>
                <span className="history-desc">
                  - {program.description || 'Không có mô tả'}
                </span>
              </div>

              {/* Cột phải: Thời gian thêm vào (nếu có) + Nút xóa */}
              {item.created_at && (
                <Tooltip title="Thời gian thêm vào yêu thích">
                  <div className="history-time">
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {formatDate(item.created_at)}
                  </div>
                </Tooltip>
              )}
              
              <Popconfirm title="Bỏ lệnh này khỏi danh sách yêu thích?" onConfirm={() => handleRemoveFavorite(programId)}>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          );
        }}
      />
    </div>
  );
};

export default FavoriteTab;