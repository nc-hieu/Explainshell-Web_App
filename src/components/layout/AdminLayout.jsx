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
  LogoutOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// Import file SCSS
import './AdminLayout.scss';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {logout} = useAuthStore();

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/admin/programs', icon: <CodeOutlined />, label: 'Quản lý Lệnh' },
    { key: '/admin/categories', icon: <FolderOutlined />, label: 'Danh mục' },
    { key: '/admin/options', icon: <SettingOutlined />, label: 'Cấu hình' }, // Thêm tạm menu cấu hình
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
        <Header className="admin-header">
          <Button
            type="text"
            className="header-toggle-btn"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Header>
        
        <Content className="admin-content">
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;