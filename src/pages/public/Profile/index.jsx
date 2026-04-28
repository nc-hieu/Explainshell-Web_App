import React, { useEffect } from 'react';
import { Space, Tabs, Card, message } from 'antd'; // Xóa Empty vì không cần nữa
import { UserOutlined, KeyOutlined, ClockCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';

import './Profile.scss';

// Import các component con
import ProfileHeader from './components/ProfileHeader';
import InfoTab from './components/InfoTab';
import PasswordTab from './components/PasswordTab';
import HistoryTab from './components/HistoryTab';
import FavoriteTab from './components/FavoriteTab'; // <--- 1. IMPORT TẠI ĐÂY

const Profile = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      message.warning('Vui lòng đăng nhập để xem hồ sơ!');
      navigate('/auth');
    }
  }, [token, navigate]);

  if (!user) return null;

  const tabItems = [
    { key: '1', label: <span><UserOutlined /> Thông tin</span>, children: <InfoTab user={user} /> },
    { key: '2', label: <span><KeyOutlined /> Đổi mật khẩu</span>, children: <PasswordTab /> },
    { key: '3', label: <span><ClockCircleOutlined /> Lịch sử tìm kiếm</span>, children: <HistoryTab /> },
    { 
      key: '4', 
      label: <span><StarOutlined /> Lệnh yêu thích</span>, 
      children: <FavoriteTab /> // <--- 2. THAY THẾ CHỖ NÀY
    }
  ];

  return (
    <div className="profile-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <ProfileHeader user={user} />
        <Card className="profile-tabs-card" bordered={false}>
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>
      </Space>
    </div>
  );
};

export default Profile;