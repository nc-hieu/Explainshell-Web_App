import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd'; // Đã xóa theme vì không cần thiết nữa
import { useAuthStore } from '../../store/authStore';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  CodeOutlined,
  SettingOutlined,
  FolderOutlined,
  LogoutOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// Import file SCSS
import './AdminLayout.scss';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Lấy thêm thông tin user từ store (Giả sử bạn lưu thông tin người dùng trong biến `user`)
  const { logout, user } = useAuthStore();

  const menuItems = [
    { key: '/nchieu-adm-exsh/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/nchieu-adm-exsh/programs', icon: <CodeOutlined />, label: 'Quản lý Lệnh' },
    { key: '/nchieu-adm-exsh/categories', icon: <FolderOutlined />, label: 'Danh mục' },
    { key: '/nchieu-adm-exsh/topics', icon: <AppstoreOutlined />, label: 'Chủ đề (Topics)' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/nchieu-adm-exsh/login');
  };

  return (
    <Layout className="admin-layout">
      {/* Sider tự động ăn theo ConfigProvider trong App.jsx */}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="admin-logo">
          {collapsed ? 'EX' : 'EXPLAINSHELL'}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{ borderRight: 0 }} // Xóa viền thừa của menu
        />
      </Sider>
      
      <Layout style={{ background: 'transparent' }}>
        <Header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Bên trái: Nút thu phóng Sidebar */}
          <Button
            type="text"
            className="header-toggle-btn"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          
          {/* Bên phải: Lời chào + Nút Đăng xuất */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 2. Hiển thị lời chào. Dùng optional chaining (?.) để tránh lỗi nếu user chưa kịp load */}
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
              Xin chào, <strong style={{ color: 'var(--color-primary)' }}>{user?.username || 'Admin'}</strong>!
            </span>
            
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>

        </Header>
        
        <Content className="admin-content">
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;