import React, { useEffect } from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Spin } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { CodeOutlined, UserOutlined, LogoutOutlined, ProfileOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

import './PublicLayout.scss'; // File SCSS chúng ta đã tạo trước đó

const { Header, Content, Footer } = Layout;

const PublicLayout = () => {
  const navigate = useNavigate();
  
  // Lấy state từ Zustand
  const { user, token, logout, fetchProfile, isAuthLoading } = useAuthStore();

  // Tự động lấy thông tin user nếu có token nhưng chưa có data user (VD: khi f5 trang)
  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Menu thả xuống khi bấm vào Avatar
  const userMenu = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    // Nếu là Admin, hiện thêm nút vào trang Quản trị
    ...(user?.roles === 'admin' ? [
      {
        type: 'divider',
      },
      {
        key: 'admin',
        icon: <CodeOutlined />,
        label: 'Vào trang Quản trị',
        onClick: () => navigate('/admin'),
      }
    ] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="public-layout">
      <Header className="public-header">
        <div className="public-brand" onClick={() => navigate('/')}>
          <CodeOutlined className="brand-icon" />
          <span>Explainshell</span>
        </div>
        
        {/* KHU VỰC USER TRÊN HEADER */}
        <div>
          {isAuthLoading ? (
            <Spin size="small" />
          ) : user ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>
                <Avatar style={{ backgroundColor: 'var(--color-primary)' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>{user.username}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button  type="default" icon={<LoginOutlined />} onClick={() => navigate('/auth')}>
              Đăng nhập
            </Button>
          )}
        </div>
        
      </Header>

      <Content className="public-content">
        <Outlet />
      </Content>

      <Footer className="public-footer">
        Explainshell ©{new Date().getFullYear()} Created with NCHieu
      </Footer>
    </Layout>
  );
};

export default PublicLayout;