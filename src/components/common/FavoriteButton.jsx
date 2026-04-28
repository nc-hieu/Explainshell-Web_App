import React, { useState, useEffect } from 'react';
import { Button, message, Tooltip } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { favoriteService } from '../../services/favorite.service';
import { useAuthStore } from '../../store/authStore';

const FavoriteButton = ({ programId, size = '24px' }) => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vừa vào trang là check ngay xem lệnh này đã được lưu chưa (nếu đã đăng nhập)
  useEffect(() => {
    if (token && programId) {
      checkFavoriteStatus();
    }
  }, [token, programId]);

  const checkFavoriteStatus = async () => {
    try {
      const data = await favoriteService.check(programId);
      // Tùy thuộc vào cấu trúc Backend trả về, giả sử là { is_favorited: true } hoặc trả về boolean
      setIsFavorited(data.is_favorited === true || data === true);
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái yêu thích:", error);
    }
  };

  const handleToggleFavorite = async () => {
    // Nếu chưa đăng nhập thì bắt đăng nhập
    if (!token) {
      message.warning('Vui lòng đăng nhập để lưu lệnh yêu thích!');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      await favoriteService.toggle(programId);
      
      // Đảo ngược trạng thái hiện tại
      const newStatus = !isFavorited;
      setIsFavorited(newStatus);
      
      if (newStatus) {
        message.success('Đã thêm vào mục yêu thích!');
      } else {
        message.info('Đã bỏ yêu thích!');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu yêu thích!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={isFavorited ? "Bỏ yêu thích" : "Lưu vào yêu thích"}>
      <Button
        type="text"
        shape="circle"
        onClick={handleToggleFavorite}
        loading={loading}
        icon={
          isFavorited ? (
            <StarFilled style={{ color: '#faad14', fontSize: size }} />
          ) : (
            <StarOutlined style={{ color: 'var(--text-secondary)', fontSize: size }} />
          )
        }
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      />
    </Tooltip>
  );
};

export default FavoriteButton;