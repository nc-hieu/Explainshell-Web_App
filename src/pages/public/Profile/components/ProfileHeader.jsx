import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProfileHeader = ({ user }) => {
  if (!user) return null;

  return (
    <Card className="profile-header-card">
      <div className="header-content">
        <div className="avatar-circle">
          <UserOutlined />
        </div>
        <div>
          <Title level={2} className="username">{user.username}</Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{user.email}</Text>
          <div style={{ marginTop: '8px' }}>
            <Tag color={user.roles === 'admin' ? 'red' : 'blue'}>
              {user.roles === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG'}
            </Tag>
            <Tag color="green">Đang hoạt động</Tag>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;