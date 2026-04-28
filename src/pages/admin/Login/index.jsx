import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/authStore'; // IMPORT ZUSTAND
import './Login.scss';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Lấy các hàm từ Store ra để dùng
  const setToken = useAuthStore(state => state.setToken);
  const fetchProfile = useAuthStore(state => state.fetchProfile);
  const logout = useAuthStore(state => state.logout);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Gọi API để lấy Token
      const tokenData = await authService.login(values.username, values.password);
      
      if (tokenData.access_token) {
        // 2. Lưu token chuẩn vào Zustand (Nó tự động lưu vào localStorage('token'))
        setToken(tokenData.access_token);

        // 3. Lấy thông tin user (Zustand sẽ tự cập nhật vào biến state.user)
        await fetchProfile();

        // 4. Lấy dữ liệu ra check phân quyền (Vì fetchProfile cập nhật state bất đồng bộ, ta gọi API trực tiếp ở đây 1 lần để check nhánh)
        const userInfo = await authService.getMe();

        if (userInfo.roles === 'admin') {
          message.success(`Xin chào Admin ${userInfo.username}!`);
          navigate('/admin/dashboard'); 
        } else {
          // Xóa token bằng hàm chuẩn của Zustand
          logout();
          message.error('Truy cập bị từ chối! Bạn không có quyền quản trị viên.');
        }
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      logout(); // Đảm bảo dọn dẹp rác nếu lỗi
      if (error.response && error.response.status === 401) {
        message.error('Sai tên đăng nhập hoặc mật khẩu!');
      } else {
        message.error('Có lỗi xảy ra kết nối tới máy chủ!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={3}>Admin Explainshell</Title>
          <p>Đăng nhập để quản lý lệnh hệ thống</p>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: 'Nhập tên đăng nhập!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;